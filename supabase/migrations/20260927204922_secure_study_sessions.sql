-- Only the trusted timer RPC may create server-verified study time.
-- Legacy/offline sessions remain syncable, but never become rank-eligible.
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
      'manual',(p_data - 'source') || '{"source":"manual"}'::jsonb,now())
    on conflict(user_id,session_id) do update set data=excluded.data,updated_at=now(),
      lesson_id=excluded.lesson_id,subject_id=excluded.subject_id,study_date=excluded.study_date,
      seconds=excluded.seconds,source='manual'
    where public.study_sessions.source <> 'server_timer'
      and public.study_sessions.updated_at is not distinct from p_expected
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

-- Trigger-only functions do not need to be callable through the Data API.
revoke execute on function public.create_nexo_profile() from public,anon,authenticated;
revoke execute on function public.validate_avatar_document() from public,anon,authenticated;

create index if not exists sync_conflicts_resolved_by_fkey_idx
  on public.sync_conflicts(resolved_by) where resolved_by is not null;
create index if not exists user_inventory_cosmetic_id_fkey_idx
  on public.user_inventory(cosmetic_id);

