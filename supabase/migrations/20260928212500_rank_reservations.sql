-- 1.0: server-verified pilot cases and historical, non-spendable rank reservations.
-- Client academic history remains useful for study, but never authorizes rewards.
create table public.academic_case_keys (
  case_id text primary key,
  concept_ids text[] not null,
  family_id text not null,
  answer jsonb not null,
  transfer boolean not null default false,
  exam_style boolean not null default false
);
alter table public.academic_case_keys enable row level security;
revoke all on public.academic_case_keys from public,anon,authenticated;
insert into public.academic_case_keys(case_id,concept_ids,family_id,answer,transfer,exam_style) values
('sv-protonation',array['org.protonation','org.lone-pair'],'org.protonation.charge','{"bonds":"4","charge":"+1","chloride":"counterion"}',false,false),
('sv-heterocycle',array['org.aromatic-pair','org.basicity'],'org.heterocycle.pair','{"site":"no-h","pi":"6","after":"retained"}',false,false),
('sv-resonance',array['org.resonance','org.basicity'],'org.basicity.resonance','{"stronger":"benzyl","conjugates":"aniline","benzene":"retained"}',false,false),
('sv-induction',array['org.induction','org.basicity'],'org.basicity.induction','{"stronger":"ethyl","path":"sigma","distance":"weaker"}',false,false),
('sv-pka',array['org.pka','org.basicity'],'org.pka.equilibrium','{"logA":"2.3","logB":"-1.4","favored":"A"}',true,true),
('sv-pep-order',array['org.basicity','org.resonance','org.induction'],'org.basicity.integrated','{"order":"n-a-m-b","shared":"direct","benzyl":"sp3"}',true,true),
('sv-pep-hetero',array['org.aromatic-pair','org.basicity'],'org.heterocycle.transfer','{"most":"piperidine","least":"pyrrole","pyridinium":"retained"}',true,true);

create table public.verified_case_attempts (
  user_id uuid not null references auth.users(id) on delete cascade,
  attempt_id text not null,
  case_id text not null references public.academic_case_keys(case_id),
  concept_ids text[] not null,
  family_id text not null,
  correct boolean not null,
  independent boolean not null,
  reviewed boolean not null default false,
  transfer boolean not null default false,
  exam_style boolean not null default false,
  attempted_at timestamptz not null default now(),
  primary key(user_id,attempt_id)
);
create index verified_cases_by_concept on public.verified_case_attempts using gin(concept_ids);
create index verified_cases_by_user_time on public.verified_case_attempts(user_id,attempted_at);
alter table public.verified_case_attempts enable row level security;
create policy verified_cases_read on public.verified_case_attempts for select to authenticated
  using(user_id=(select auth.uid()));
revoke insert,update,delete on public.verified_case_attempts from public,anon,authenticated;
grant select on public.verified_case_attempts to authenticated;

create table public.academic_focus_sessions (
  user_id uuid not null references auth.users(id) on delete cascade,
  focus_id uuid not null default gen_random_uuid(),
  concept_id text not null,
  started_at timestamptz not null default now(),
  last_ping_at timestamptz not null default now(),
  finished_at timestamptz,
  seconds integer not null default 0 check(seconds between 0 and 14400),
  primary key(user_id,focus_id)
);
create unique index one_academic_focus_per_user on public.academic_focus_sessions(user_id)
  where finished_at is null;
alter table public.academic_focus_sessions enable row level security;
create policy academic_focus_read on public.academic_focus_sessions for select to authenticated
  using(user_id=(select auth.uid()));
revoke insert,update,delete on public.academic_focus_sessions from public,anon,authenticated;
grant select on public.academic_focus_sessions to authenticated;

create table public.reward_reservations (
  user_id uuid not null references auth.users(id) on delete cascade,
  concept_id text not null,
  rank integer not null check(rank between 1 and 5),
  reward_tier text not null check(reward_tier in ('basic','uncommon','rare','epic','arcane')),
  achieved_at timestamptz not null default now(),
  status text not null default 'reserved' check(status='reserved'),
  primary key(user_id,concept_id,rank)
);
alter table public.reward_reservations enable row level security;
create policy reward_reservations_read on public.reward_reservations for select to authenticated
  using(user_id=(select auth.uid()));
revoke insert,update,delete on public.reward_reservations from public,anon,authenticated;
grant select on public.reward_reservations to authenticated;

create or replace function public.server_concept_rank(p_user uuid,p_concept text) returns integer
language plpgsql stable security definer set search_path = '' as $$
declare v_minutes numeric; v_correct integer; v_independent integer; v_exercises integer;
  v_families integer; v_days integer; v_sessions integer; v_justified boolean;
  v_transfer boolean; v_exam boolean; v_delayed boolean; v_critical boolean;
  v_prereq boolean:=true; v_level integer:=0;
begin
  if p_user is null or p_concept not like 'org.%' then return 0; end if;
  select coalesce(sum(seconds),0)/60.0,count(*) into v_minutes,v_sessions
    from public.academic_focus_sessions where user_id=p_user and concept_id=p_concept and finished_at is not null and seconds>0;
  select count(*) filter(where correct),count(*) filter(where correct and independent),
    count(distinct case_id) filter(where correct and independent),
    count(distinct family_id) filter(where correct and independent),
    count(distinct attempted_at::date) filter(where correct and independent),
    coalesce(bool_or(correct and independent and case_id in ('sv-pep-order','sv-pep-hetero','sv-pka')),false),
    coalesce(bool_or(correct and independent and transfer),false),
    coalesce(bool_or(correct and independent and exam_style),false)
    into v_correct,v_independent,v_exercises,v_families,v_days,v_justified,v_transfer,v_exam
    from public.verified_case_attempts where user_id=p_user and p_concept=any(concept_ids);
  select exists(select 1 from public.verified_case_attempts later
    where later.user_id=p_user and p_concept=any(later.concept_ids)
      and later.correct and later.independent and later.reviewed
      and later.attempted_at >= (select min(first_attempt.attempted_at)+interval '24 hours'
        from public.verified_case_attempts first_attempt
        where first_attempt.user_id=p_user and p_concept=any(first_attempt.concept_ids)
          and first_attempt.correct and first_attempt.independent)) into v_delayed;
  select exists(select 1 from public.verified_case_attempts failed
    where failed.user_id=p_user and p_concept=any(failed.concept_ids) and not failed.correct
      and not exists(select 1 from public.verified_case_attempts repaired
        where repaired.user_id=p_user and repaired.case_id=failed.case_id
          and repaired.correct and repaired.attempted_at>failed.attempted_at)) into v_critical;
  if p_concept='org.basicity' then
    select exists(select 1 from public.verified_case_attempts a where a.user_id=p_user
      and 'org.protonation'=any(a.concept_ids) and a.correct) into v_prereq;
  end if;
  if p_concept='org.substituent' then
    select exists(select 1 from public.verified_case_attempts a where a.user_id=p_user
      and 'org.induction'=any(a.concept_ids) and a.correct) into v_prereq;
  end if;
  if v_minutes>=5 and v_correct>=1 then v_level:=1; end if;
  if v_level>=1 and v_minutes>=12 and v_exercises>=2 and v_independent>=2 then v_level:=2; end if;
  if v_level>=2 and v_minutes>=25 and v_families>=2 and v_justified and v_prereq then v_level:=3; end if;
  if v_level>=3 and v_minutes>=40 and v_families>=3 and v_transfer and v_exam and not v_critical then v_level:=4; end if;
  if v_level>=4 and v_minutes>=60 and v_days>=2 and v_sessions>=2 and v_delayed
    and not v_critical then v_level:=5; end if;
  return v_level;
end $$;
revoke all on function public.server_concept_rank(uuid,text) from public,anon,authenticated;

create or replace function public.refresh_rank_reservations(p_concept text) returns integer
language plpgsql security definer set search_path = '' as $$
declare v_user uuid:=auth.uid(); v_rank integer; v_level integer;
  v_tiers text[]:=array['basic','uncommon','rare','epic','arcane'];
begin
  if v_user is null then raise exception 'auth_required'; end if;
  if p_concept not like 'org.%' or length(p_concept)>160 then raise exception 'invalid_concept'; end if;
  v_level:=public.server_concept_rank(v_user,p_concept);
  for v_rank in 1..v_level loop
    insert into public.reward_reservations(user_id,concept_id,rank,reward_tier)
      values(v_user,p_concept,v_rank,v_tiers[v_rank]) on conflict do nothing;
  end loop;
  return v_level;
end $$;
revoke all on function public.refresh_rank_reservations(text) from public,anon,authenticated;
grant execute on function public.refresh_rank_reservations(text) to authenticated;

create or replace function public.submit_verified_case(
  p_attempt_id text,p_case_id text,p_answers jsonb,p_independent boolean default false,
  p_reviewed boolean default false
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_user uuid:=auth.uid(); v_key public.academic_case_keys%rowtype;
  v_entry record; v_correct boolean:=true; v_existing public.verified_case_attempts%rowtype;
  v_concept text; v_ranks jsonb:='{}'::jsonb;
begin
  if v_user is null then raise exception 'auth_required'; end if;
  if p_attempt_id is null or length(p_attempt_id) not between 1 and 160
    or jsonb_typeof(p_answers)<>'object' or length(p_answers::text)>2000
    then raise exception 'invalid_case_attempt'; end if;
  select * into v_key from public.academic_case_keys where case_id=p_case_id;
  if not found then raise exception 'unknown_case'; end if;
  select * into v_existing from public.verified_case_attempts
    where user_id=v_user and attempt_id=p_attempt_id;
  if found then
    if v_existing.case_id<>p_case_id then raise exception 'attempt_id_reused'; end if;
    return jsonb_build_object('correct',v_existing.correct,'ranks','{}'::jsonb,'duplicate',true);
  end if;
  for v_entry in select key,value from jsonb_each_text(v_key.answer) loop
    if v_entry.key in ('logA','logB') then
      if coalesce(p_answers->>v_entry.key,'') !~ '^-?[0-9]+([.,][0-9]+)?$'
        or abs(replace(p_answers->>v_entry.key,',','.')::numeric-v_entry.value::numeric)>.05
        then v_correct:=false; end if;
    elsif p_answers->>v_entry.key is distinct from v_entry.value then v_correct:=false; end if;
  end loop;
  insert into public.verified_case_attempts(user_id,attempt_id,case_id,concept_ids,family_id,
    correct,independent,reviewed,transfer,exam_style)
    values(v_user,p_attempt_id,p_case_id,v_key.concept_ids,v_key.family_id,v_correct,
      coalesce(p_independent,false),coalesce(p_reviewed,false),v_key.transfer,v_key.exam_style)
    on conflict do nothing;
  for v_concept in select unnest(v_key.concept_ids) loop
    v_ranks:=v_ranks||jsonb_build_object(v_concept,public.refresh_rank_reservations(v_concept));
  end loop;
  return jsonb_build_object('correct',v_correct,'ranks',v_ranks,'duplicate',false);
end $$;
revoke all on function public.submit_verified_case(text,text,jsonb,boolean,boolean) from public,anon;
grant execute on function public.submit_verified_case(text,text,jsonb,boolean,boolean) to authenticated;

create or replace function public.start_academic_focus(p_concept text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_user uuid:=auth.uid(); v_id uuid;
begin
  if v_user is null then raise exception 'auth_required'; end if;
  if p_concept not like 'org.%' or length(p_concept)>160 then raise exception 'invalid_concept'; end if;
  update public.academic_focus_sessions set finished_at=now(),
    seconds=least(14400,greatest(0,extract(epoch from least(now(),last_ping_at+interval '20 seconds')-started_at)::integer))
    where user_id=v_user and finished_at is null and concept_id<>p_concept;
  select focus_id into v_id from public.academic_focus_sessions
    where user_id=v_user and finished_at is null and concept_id=p_concept;
  if v_id is not null then return v_id; end if;
  insert into public.academic_focus_sessions(user_id,concept_id) values(v_user,p_concept)
    returning focus_id into v_id;
  return v_id;
end $$;
revoke all on function public.start_academic_focus(text) from public,anon;
grant execute on function public.start_academic_focus(text) to authenticated;

create or replace function public.ping_academic_focus(p_focus_id uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  update public.academic_focus_sessions set last_ping_at=now()
    where user_id=auth.uid() and focus_id=p_focus_id and finished_at is null;
  return found;
end $$;
revoke all on function public.ping_academic_focus(uuid) from public,anon;
grant execute on function public.ping_academic_focus(uuid) to authenticated;

create or replace function public.finish_academic_focus(p_focus_id uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_user uuid:=auth.uid(); v_focus public.academic_focus_sessions%rowtype;
  v_seconds integer; v_rank integer;
begin
  if v_user is null then raise exception 'auth_required'; end if;
  select * into v_focus from public.academic_focus_sessions
    where user_id=v_user and focus_id=p_focus_id for update;
  if not found then raise exception 'focus_not_found'; end if;
  if v_focus.finished_at is null then
    v_seconds:=least(14400,greatest(0,extract(epoch from least(now(),v_focus.last_ping_at+interval '20 seconds')-v_focus.started_at)::integer));
    update public.academic_focus_sessions set finished_at=now(),seconds=v_seconds
      where user_id=v_user and focus_id=p_focus_id;
  else v_seconds:=v_focus.seconds; end if;
  v_rank:=public.refresh_rank_reservations(v_focus.concept_id);
  return jsonb_build_object('seconds',v_seconds,'rank',v_rank);
end $$;
revoke all on function public.finish_academic_focus(uuid) from public,anon;
grant execute on function public.finish_academic_focus(uuid) to authenticated;

update public.sync_metadata set schema_version=18,updated_at=now();
alter table public.sync_metadata alter column schema_version set default 18;
