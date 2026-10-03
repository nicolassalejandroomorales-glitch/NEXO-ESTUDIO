-- Nexo V12. Ejecutar mediante Supabase CLI. Todo dato privado tiene RLS.
create extension if not exists pgcrypto;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  timezone text not null default 'America/Santiago',
  legacy_economy jsonb, -- Archivo no canjeable de átomos/inventario V11.
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.study_sessions (
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id text not null,
  lesson_id text,
  subject_id text,
  study_date date,
  seconds integer not null default 0 check (seconds between 0 and 14400),
  source text not null default 'manual',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, session_id)
);
create table public.lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  content_version integer not null default 1,
  status text not null default 'inestable',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
create table public.exercise_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, exercise_id)
);
create table public.academic_events (
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id text not null,
  event_date date not null,
  subject_id text,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, event_id)
);
create table public.grade_plans (
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, subject_id)
);
create table public.error_records (
  user_id uuid not null references auth.users(id) on delete cascade,
  error_id text not null,
  subject_id text,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, error_id)
);
create table public.user_documents (
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('guide','exam','lab','absence','lesson_session','route_mode','boosts','weekly_goal','timer','completed_lessons','claimed_challenges','settings','mascot','meta')),
  document_id text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, kind, document_id)
);
create table public.sync_metadata (
  user_id uuid primary key references auth.users(id) on delete cascade,
  schema_version integer not null default 12,
  migration_version integer not null default 0,
  cloud_migration_completed boolean not null default false,
  client_version text,
  last_sync_at timestamptz,
  updated_at timestamptz not null default now()
);
create table public.sync_conflicts (
  user_id uuid not null references auth.users(id) on delete cascade,
  conflict_id uuid not null default gen_random_uuid(),
  entity_type text not null,
  entity_id text not null,
  local_data jsonb not null,
  remote_data jsonb not null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (user_id, conflict_id)
);
create table public.cosmetics (
  cosmetic_id text primary key,
  name text not null,
  kind text not null,
  price integer not null check (price >= 0),
  active boolean not null default true
);
create table public.user_inventory (
  user_id uuid not null references auth.users(id) on delete cascade,
  cosmetic_id text not null references public.cosmetics(cosmetic_id),
  acquired_at timestamptz not null default now(),
  primary key (user_id, cosmetic_id)
);
create table public.currency_transactions (
  transaction_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null check (amount <> 0),
  reason text not null,
  reference_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, reason, reference_id)
);
create table public.active_study_timers (
  user_id uuid not null references auth.users(id) on delete cascade,
  timer_id uuid not null default gen_random_uuid(),
  subject_id text not null,
  started_at timestamptz not null default now(),
  accumulated_seconds integer not null default 0,
  paused_at timestamptz,
  finished_at timestamptz,
  primary key (user_id, timer_id)
);
create index study_sessions_recent on public.study_sessions(user_id, updated_at desc);
create index events_by_date on public.academic_events(user_id, event_date);
create index errors_recent on public.error_records(user_id, updated_at desc);
create index transactions_recent on public.currency_transactions(user_id, created_at desc);
create unique index one_active_timer_per_user on public.active_study_timers(user_id) where finished_at is null;
create index conflicts_unresolved on public.sync_conflicts(user_id, created_at desc) where resolved_at is null;

do $$
declare t text;
begin
  foreach t in array array['profiles','study_sessions','lesson_progress','exercise_progress','academic_events','grade_plans','error_records','user_documents','sync_metadata','sync_conflicts','user_inventory','currency_transactions','active_study_timers']
  loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;
alter table public.cosmetics enable row level security;
create policy cosmetics_read on public.cosmetics for select to authenticated using (active);
do $$
declare t text;
begin
  foreach t in array array['profiles','study_sessions','lesson_progress','exercise_progress','academic_events','grade_plans','error_records','user_documents','sync_metadata','sync_conflicts','user_inventory','currency_transactions','active_study_timers']
  loop
    execute format('create policy %I on public.%I for select to authenticated using (user_id = (select auth.uid()))', t || '_read', t);
  end loop;
  foreach t in array array['study_sessions','lesson_progress','exercise_progress','academic_events','grade_plans','error_records','user_documents','sync_conflicts']
  loop
    execute format('create policy %I on public.%I for insert to authenticated with check (user_id = (select auth.uid()))', t || '_insert', t);
    execute format('create policy %I on public.%I for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t || '_update', t);
  end loop;
end $$;
-- La app puede modificar datos académicos. Economía, inventario y perfil se mutan solo en funciones confiables.
create policy profiles_update on public.profiles for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
revoke update (legacy_economy, user_id) on public.profiles from authenticated;
create policy metadata_update on public.sync_metadata for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
revoke update (cloud_migration_completed, migration_version, user_id) on public.sync_metadata from authenticated;

create or replace function public.create_nexo_profile() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles(user_id) values (new.id);
  insert into public.sync_metadata(user_id) values (new.id);
  insert into public.currency_transactions(user_id, amount, reason, reference_id)
    values (new.id, 120, 'starter', 'v12');
  insert into public.user_inventory(user_id, cosmetic_id)
    values (new.id, 'species-pig'), (new.id, 'scene-ruins');
  return new;
end $$;
create trigger nexo_new_user after insert on auth.users
for each row execute function public.create_nexo_profile();

create or replace function public.currency_balance() returns integer
language sql stable security definer set search_path = ''
as $$ select coalesce(sum(amount),0)::integer from public.currency_transactions where user_id = (select auth.uid()) $$;
revoke all on function public.currency_balance() from public, anon;
grant execute on function public.currency_balance() to authenticated;

create or replace function public.purchase_cosmetic(p_cosmetic_id text) returns integer
language plpgsql security definer set search_path = ''
as $$
declare v_user uuid := auth.uid(); v_price integer; v_balance integer;
begin
  if v_user is null then raise exception 'auth_required'; end if;
  perform 1 from public.profiles where user_id = v_user for update;
  select price into v_price from public.cosmetics where cosmetic_id = p_cosmetic_id and active;
  if v_price is null then raise exception 'unknown_cosmetic'; end if;
  select coalesce(sum(amount),0)::integer into v_balance from public.currency_transactions where user_id = v_user;
  if exists(select 1 from public.user_inventory where user_id=v_user and cosmetic_id=p_cosmetic_id) then return v_balance; end if;
  if v_balance < v_price then raise exception 'insufficient_balance'; end if;
  if v_price > 0 then
    insert into public.currency_transactions(user_id, amount, reason, reference_id)
      values(v_user, -v_price, 'cosmetic_purchase', p_cosmetic_id);
  end if;
  insert into public.user_inventory(user_id,cosmetic_id) values(v_user,p_cosmetic_id);
  return v_balance-v_price;
end $$;
revoke all on function public.purchase_cosmetic(text) from public, anon;
grant execute on function public.purchase_cosmetic(text) to authenticated;

create or replace function public.start_study_timer(p_subject_id text) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare v_id uuid; v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'auth_required'; end if;
  perform 1 from public.profiles where user_id=v_user for update;
  select timer_id into v_id from public.active_study_timers
    where user_id=v_user and finished_at is null limit 1;
  if v_id is not null then return v_id; end if;
  insert into public.active_study_timers(user_id,subject_id) values(v_user,left(p_subject_id,80))
    returning timer_id into v_id;
  return v_id;
end $$;
create or replace function public.pause_study_timer(p_timer_id uuid) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'auth_required'; end if;
  update public.active_study_timers set
    accumulated_seconds=accumulated_seconds+greatest(0,floor(extract(epoch from now()-started_at))::integer),
    paused_at=now()
  where user_id=auth.uid() and timer_id=p_timer_id and paused_at is null and finished_at is null;
end $$;
create or replace function public.resume_study_timer(p_timer_id uuid) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'auth_required'; end if;
  update public.active_study_timers set started_at=now(),paused_at=null
  where user_id=auth.uid() and timer_id=p_timer_id and paused_at is not null and finished_at is null;
end $$;
create or replace function public.cancel_study_timer(p_timer_id uuid) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'auth_required'; end if;
  update public.active_study_timers set finished_at=now()
  where user_id=auth.uid() and timer_id=p_timer_id and finished_at is null;
end $$;
create or replace function public.finish_study_timer(p_timer_id uuid) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare v_user uuid := auth.uid(); v_started timestamptz; v_subject text; v_seconds integer; v_reward integer; v_balance integer;
  v_accumulated integer; v_paused timestamptz;
begin
  if v_user is null then raise exception 'auth_required'; end if;
  perform 1 from public.profiles where user_id=v_user for update;
  select started_at,subject_id,accumulated_seconds,paused_at into v_started,v_subject,v_accumulated,v_paused from public.active_study_timers
    where user_id=v_user and timer_id=p_timer_id for update;
  if v_started is null then raise exception 'unknown_timer'; end if;
  if exists(select 1 from public.study_sessions where user_id=v_user and session_id=p_timer_id::text) then
    return jsonb_build_object('balance',public.currency_balance(),'seconds',
      (select seconds from public.study_sessions where user_id=v_user and session_id=p_timer_id::text));
  end if;
  v_seconds := least(14400,greatest(0,v_accumulated+
    case when v_paused is null then floor(extract(epoch from now()-v_started))::integer else 0 end));
  v_reward := case when v_seconds >= 7200 then 250 when v_seconds >= 3600 then 100
    when v_seconds >= 1800 then 25 when v_seconds >= 900 then 15 when v_seconds >= 300 then 3 else 0 end;
  insert into public.study_sessions(user_id,session_id,subject_id,study_date,seconds,source,data)
    values(v_user,p_timer_id::text,v_subject,
      (now() at time zone (select timezone from public.profiles where user_id=v_user))::date,
      v_seconds,'server_timer',
      jsonb_build_object('id',p_timer_id::text,'date',
        (now() at time zone (select timezone from public.profiles where user_id=v_user))::date,
        'subject',v_subject,'mode','Cronómetro','seconds',v_seconds,'source','server_timer'));
  update public.active_study_timers set finished_at=now() where user_id=v_user and timer_id=p_timer_id;
  if v_reward>0 then
    insert into public.currency_transactions(user_id,amount,reason,reference_id)
      values(v_user,v_reward,'study_session',p_timer_id::text) on conflict do nothing;
  end if;
  select coalesce(sum(amount),0)::integer into v_balance from public.currency_transactions where user_id=v_user;
  return jsonb_build_object('balance',v_balance,'seconds',v_seconds,'reward',v_reward,'session_id',p_timer_id);
end $$;
revoke all on function public.start_study_timer(text), public.pause_study_timer(uuid),
  public.cancel_study_timer(uuid),
  public.resume_study_timer(uuid), public.finish_study_timer(uuid) from public, anon;
grant execute on function public.start_study_timer(text), public.pause_study_timer(uuid),
  public.cancel_study_timer(uuid),
  public.resume_study_timer(uuid), public.finish_study_timer(uuid) to authenticated;

create or replace function public.archive_legacy_economy(p_legacy jsonb) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'auth_required'; end if;
  update public.profiles set legacy_economy=coalesce(legacy_economy,p_legacy),updated_at=now()
    where user_id=auth.uid() and legacy_economy is null;
end $$;
revoke all on function public.archive_legacy_economy(jsonb) from public, anon;
grant execute on function public.archive_legacy_economy(jsonb) to authenticated;

create or replace function public.complete_cloud_migration() returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'auth_required'; end if;
  update public.sync_metadata set migration_version=12,cloud_migration_completed=true,updated_at=now()
    where user_id=auth.uid();
end $$;
revoke all on function public.complete_cloud_migration() from public, anon;
grant execute on function public.complete_cloud_migration() to authenticated;

create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'auth_required'; end if;
  delete from auth.users where id=auth.uid();
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
