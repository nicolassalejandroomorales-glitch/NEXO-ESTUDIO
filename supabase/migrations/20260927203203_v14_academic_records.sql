-- V14: append-only attempt/evidence and current review/error/source records.
create table public.academic_attempts (
 user_id uuid not null references auth.users(id) on delete cascade,
 attempt_id text not null, data jsonb not null,
 exercise_id text generated always as (data->>'exerciseId') stored,
 family_id text generated always as (data->>'familyId') stored,
 outcome text generated always as (data->>'outcome') stored,
 updated_at timestamptz not null default now(),
 primary key(user_id,attempt_id)
);
create table public.academic_evidence (
 user_id uuid not null references auth.users(id) on delete cascade,
 evidence_id text not null, data jsonb not null,
 attempt_id text generated always as (data->>'attemptId') stored,
 concept_id text generated always as (data->>'conceptId') stored,
 updated_at timestamptz not null default now(),
 primary key(user_id,evidence_id)
);
create table public.academic_reviews (
 user_id uuid not null references auth.users(id) on delete cascade,
 review_id text not null, data jsonb not null,
 target_id text generated always as (data->>'targetId') stored,
 due_at text generated always as (data->>'dueAt') stored,
 updated_at timestamptz not null default now(),
 primary key(user_id,review_id)
);
create table public.academic_errors (
 user_id uuid not null references auth.users(id) on delete cascade,
 academic_error_id text not null, data jsonb not null,
 concept_id text generated always as (data->>'conceptId') stored,
 family_id text generated always as (data->>'familyId') stored,
 updated_at timestamptz not null default now(),
 primary key(user_id,academic_error_id)
);
create table public.academic_sources (
 user_id uuid not null references auth.users(id) on delete cascade,
 source_id text not null, data jsonb not null,
 source_type text generated always as (data->>'type') stored,
 updated_at timestamptz not null default now(),
 primary key(user_id,source_id)
);
do $$ declare t text; begin
 foreach t in array array['academic_attempts','academic_evidence','academic_reviews',
   'academic_errors','academic_sources'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('create policy %I on public.%I for select to authenticated using(user_id=(select auth.uid()))',t||'_read',t);
  execute format('revoke insert,update,delete on public.%I from authenticated',t);
  execute format('grant select on public.%I to authenticated',t);
 end loop;
end $$;
create index academic_attempts_recent on public.academic_attempts(user_id,updated_at,attempt_id);
create index academic_evidence_recent on public.academic_evidence(user_id,updated_at,evidence_id);
create index academic_reviews_due on public.academic_reviews(user_id,due_at);
create index academic_reviews_delta on public.academic_reviews(user_id,updated_at,review_id);
create index academic_errors_delta on public.academic_errors(user_id,updated_at,academic_error_id);
create index academic_sources_delta on public.academic_sources(user_id,updated_at,source_id);

create or replace function public.apply_academic_change(
 p_table text,p_key text,p_data jsonb,p_expected timestamptz default null
) returns timestamptz language plpgsql security definer set search_path = '' as $$
declare v_user uuid:=auth.uid(); v_column text; v_result timestamptz; v_old jsonb;
begin
 if v_user is null then raise exception 'auth_required'; end if;
 v_column:=case p_table when 'academic_attempts' then 'attempt_id'
  when 'academic_evidence' then 'evidence_id' when 'academic_reviews' then 'review_id'
  when 'academic_errors' then 'academic_error_id' when 'academic_sources' then 'source_id' else null end;
 if v_column is null or length(p_key)>160 or p_key='' or jsonb_typeof(p_data)<>'object'
   then raise exception 'invalid_academic_record'; end if;
 if p_table in ('academic_attempts','academic_evidence') then
   execute format('select data,updated_at from public.%I where user_id=$1 and %I=$2',p_table,v_column)
     into v_old,v_result using v_user,p_key;
   if found then
     if v_old<>p_data then raise exception 'immutable_academic_record'; end if;
     return v_result;
   end if;
   execute format('insert into public.%I(user_id,%I,data) values($1,$2,$3)
     on conflict(user_id,%I) do nothing returning updated_at',p_table,v_column,v_column)
     into v_result using v_user,p_key,p_data;
   if v_result is null then raise exception 'sync_conflict'; end if;
 else
   execute format('insert into public.%I(user_id,%I,data,updated_at) values($1,$2,$3,now())
     on conflict(user_id,%I) do update set data=excluded.data,updated_at=now()
     where public.%I.updated_at is not distinct from $4 returning updated_at',
     p_table,v_column,v_column,p_table)
     into v_result using v_user,p_key,p_data,p_expected;
   if v_result is null then raise exception 'sync_conflict'; end if;
 end if;
 return v_result;
end $$;
revoke all on function public.apply_academic_change(text,text,jsonb,timestamptz) from public,anon;
grant execute on function public.apply_academic_change(text,text,jsonb,timestamptz) to authenticated;

create or replace function public.read_sync_page(
  p_table text, p_watermark timestamptz, p_after_updated timestamptz default null,
  p_after_id text default null, p_limit integer default 250
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_column text; v_id text; v_result jsonb;
begin
  if auth.uid() is null then raise exception 'auth_required'; end if;
  if p_watermark is null or p_limit not between 1 and 250 then raise exception 'invalid_page'; end if;
  v_column := case p_table when 'study_sessions' then 'session_id'
    when 'lesson_progress' then 'lesson_id' when 'exercise_progress' then 'exercise_id'
    when 'academic_events' then 'event_id' when 'grade_plans' then 'subject_id'
    when 'error_records' then 'error_id' when 'user_documents' then 'document_id'
    when 'academic_attempts' then 'attempt_id' when 'academic_evidence' then 'evidence_id'
    when 'academic_reviews' then 'review_id' when 'academic_errors' then 'academic_error_id'
    when 'academic_sources' then 'source_id' else null end;
  if v_column is null or (p_after_updated is null) <> (p_after_id is null)
    then raise exception 'invalid_cursor'; end if;
  v_id := case when p_table='user_documents' then '(kind || '':'' || document_id)'
    else format('%I',v_column) end;
  execute format('select coalesce(jsonb_agg(to_jsonb(page) order by updated_at,id),''[]''::jsonb)
    from (select %s as id,%s as kind,data,updated_at from public.%I
    where user_id=$1 and updated_at <= $2
    and ($3::timestamptz is null or (updated_at,%s)>($3,$4))
    order by updated_at,%s limit $5) page',
    v_id,case when p_table='user_documents' then 'kind' else '''''' end,p_table,v_id,v_id)
    into v_result using auth.uid(),p_watermark,p_after_updated,p_after_id,p_limit;
  return v_result;
end $$;
revoke all on function public.read_sync_page(text,timestamptz,timestamptz,text,integer) from public,anon;
grant execute on function public.read_sync_page(text,timestamptz,timestamptz,text,integer) to authenticated;


update public.sync_metadata set schema_version=15,updated_at=now();
alter table public.sync_metadata alter column schema_version set default 15;
