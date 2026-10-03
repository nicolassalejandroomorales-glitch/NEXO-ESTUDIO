-- V13: versioned deletion, server watermark and conflict resolution.
alter table public.academic_events add column deleted_at timestamptz;
create index academic_events_delta on public.academic_events(user_id,updated_at,event_id);
create index study_sessions_delta on public.study_sessions(user_id,updated_at,session_id);
create index error_records_delta on public.error_records(user_id,updated_at,error_id);
create index documents_delta on public.user_documents(user_id,updated_at,kind,document_id);

alter table public.sync_conflicts add column resolution text check (resolution in ('cloud','local'));
alter table public.sync_conflicts add column resolved_by uuid references auth.users(id) on delete set null;
-- Clients may insert conflict evidence, but may not update the resolution columns.
revoke update on public.sync_conflicts from authenticated;

create or replace function public.resolve_sync_conflict(p_conflict_id uuid,p_resolution text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'auth_required'; end if;
  if p_resolution not in ('cloud','local') then raise exception 'invalid_resolution'; end if;
  update public.sync_conflicts set resolution=p_resolution,resolved_by=auth.uid(),resolved_at=now()
  where user_id=auth.uid() and conflict_id=p_conflict_id and resolved_at is null;
  if not found and not exists(select 1 from public.sync_conflicts
    where user_id=auth.uid() and conflict_id=p_conflict_id and resolution=p_resolution)
  then raise exception 'conflict_not_found'; end if;
end $$;
revoke all on function public.resolve_sync_conflict(uuid,text) from public,anon;
grant execute on function public.resolve_sync_conflict(uuid,text) to authenticated;

create or replace function public.sync_watermark() returns timestamptz
language sql stable security definer set search_path = ''
as $$ select case when auth.uid() is null then null else now() end $$;
revoke all on function public.sync_watermark() from public,anon;
grant execute on function public.sync_watermark() to authenticated;

create or replace function public.apply_sync_change(
  p_table text,p_key text,p_data jsonb,p_expected timestamptz default null
) returns timestamptz language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_column text; v_result timestamptz;
begin
  if v_user is null then raise exception 'auth_required'; end if;
  v_column := case p_table when 'study_sessions' then 'session_id'
    when 'lesson_progress' then 'lesson_id' when 'exercise_progress' then 'exercise_id'
    when 'academic_events' then 'event_id' when 'grade_plans' then 'subject_id'
    when 'error_records' then 'error_id' else null end;
  if v_column is null or length(p_key)>160 or p_key='' or jsonb_typeof(p_data)<>'object' then
    raise exception 'invalid_sync_record'; end if;
  if p_table='academic_events' then
    -- Preserve event_date on tombstones. A missing remote event is a conflict.
    if p_data @> '{"_deleted":true}'::jsonb then
      update public.academic_events set data=p_data,deleted_at=now(),updated_at=now()
      where user_id=v_user and event_id=p_key and updated_at is not distinct from p_expected
      returning updated_at into v_result;
    else
      if nullif(p_data->>'date','') is null then raise exception 'event_date_required'; end if;
      insert into public.academic_events(user_id,event_id,event_date,data,updated_at,deleted_at)
      values(v_user,p_key,(p_data->>'date')::date,p_data,now(),null)
      on conflict(user_id,event_id) do update set data=excluded.data,event_date=excluded.event_date,
        deleted_at=null,updated_at=now()
      where public.academic_events.updated_at is not distinct from p_expected
      returning updated_at into v_result;
    end if;
  elsif p_table='lesson_progress' then
    insert into public.lesson_progress(user_id,lesson_id,content_version,status,data,updated_at)
    values(v_user,p_key,coalesce((p_data->>'contentVersion')::integer,1),
      coalesce(p_data->>'status','inestable'),p_data,now())
    on conflict(user_id,lesson_id) do update set data=excluded.data,updated_at=now(),
      content_version=excluded.content_version,status=excluded.status
    where public.lesson_progress.updated_at is not distinct from p_expected
    returning updated_at into v_result;
  elsif p_table='study_sessions' then
    insert into public.study_sessions(user_id,session_id,lesson_id,subject_id,study_date,seconds,source,data,updated_at)
    values(v_user,p_key,p_data->>'lessonId',p_data->>'subject',(p_data->>'date')::date,
      least(14400,greatest(0,coalesce((p_data->>'seconds')::integer,0))),
      coalesce(p_data->>'source','manual'),p_data,now())
    on conflict(user_id,session_id) do update set data=excluded.data,updated_at=now(),
      lesson_id=excluded.lesson_id,subject_id=excluded.subject_id,study_date=excluded.study_date,
      seconds=excluded.seconds,source=excluded.source
    where public.study_sessions.updated_at is not distinct from p_expected
    returning updated_at into v_result;
  else
    execute format('insert into public.%I(user_id,%I,data,updated_at) values($1,$2,$3,now())
      on conflict(user_id,%I) do update set data=excluded.data,updated_at=now()
      where public.%I.updated_at is not distinct from $4 returning updated_at',
      p_table,v_column,v_column,p_table)
      into v_result using v_user,p_key,p_data,p_expected;
  end if;
  if v_result is null then raise exception 'sync_conflict'; end if;
  return v_result;
end $$;
revoke all on function public.apply_sync_change(text,text,jsonb,timestamptz) from public,anon;
grant execute on function public.apply_sync_change(text,text,jsonb,timestamptz) to authenticated;

update public.sync_metadata set schema_version=13,updated_at=now();
alter table public.sync_metadata alter column schema_version set default 13;
