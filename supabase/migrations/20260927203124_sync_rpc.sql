-- Comparación y escritura atómicas de registros académicos con control de versión.
create or replace function public.apply_sync_change(
  p_table text, p_key text, p_data jsonb, p_expected timestamptz default null
) returns timestamptz
language plpgsql security definer set search_path = ''
as $$
declare v_user uuid := auth.uid(); v_column text; v_result timestamptz;
begin
  if v_user is null then raise exception 'auth_required'; end if;
  v_column := case p_table
    when 'study_sessions' then 'session_id'
    when 'lesson_progress' then 'lesson_id'
    when 'exercise_progress' then 'exercise_id'
    when 'academic_events' then 'event_id'
    when 'grade_plans' then 'subject_id'
    when 'error_records' then 'error_id'
    else null end;
  if v_column is null or length(p_key)>160 or p_key='' or jsonb_typeof(p_data)<>'object' then
    raise exception 'invalid_sync_record';
  end if;
  if p_table='academic_events' then
    -- event_date es obligatoria también en insert.
    execute 'insert into public.academic_events(user_id,event_id,event_date,data,updated_at)
      values($1,$2,($3->>''date'')::date,$3,now())
      on conflict(user_id,event_id) do update set data=excluded.data,
        event_date=excluded.event_date,updated_at=now()
      where public.academic_events.updated_at is not distinct from $4
      returning updated_at'
      into v_result using v_user,p_key,p_data,p_expected;
  elsif p_table='lesson_progress' then
    execute 'insert into public.lesson_progress(user_id,lesson_id,content_version,status,data,updated_at)
      values($1,$2,coalesce(($3->>''contentVersion'')::integer,1),
        coalesce($3->>''status'',''inestable''),$3,now())
      on conflict(user_id,lesson_id) do update set data=excluded.data,updated_at=now(),
      content_version=excluded.content_version,status=excluded.status
      where public.lesson_progress.updated_at is not distinct from $4 returning updated_at'
      into v_result using v_user,p_key,p_data,p_expected;
  elsif p_table='study_sessions' then
    execute 'insert into public.study_sessions(user_id,session_id,lesson_id,subject_id,study_date,seconds,source,data,updated_at)
      values($1,$2,$3->>''lessonId'',$3->>''subject'',($3->>''date'')::date,
      least(14400,greatest(0,coalesce(($3->>''seconds'')::integer,0))),coalesce($3->>''source'',''manual''),$3,now())
      on conflict(user_id,session_id) do update set data=excluded.data,updated_at=now(),
      lesson_id=excluded.lesson_id,subject_id=excluded.subject_id,study_date=excluded.study_date,
      seconds=excluded.seconds,source=excluded.source
      where public.study_sessions.updated_at is not distinct from $4 returning updated_at'
      into v_result using v_user,p_key,p_data,p_expected;
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
revoke all on function public.apply_sync_change(text,text,jsonb,timestamptz) from public, anon;
grant execute on function public.apply_sync_change(text,text,jsonb,timestamptz) to authenticated;

create or replace function public.apply_document_change(
  p_kind text, p_key text, p_data jsonb, p_expected timestamptz default null
) returns timestamptz language plpgsql security definer set search_path = ''
as $$
declare v_result timestamptz; v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'auth_required'; end if;
  if p_kind not in ('guide','exam','lab','absence','lesson_session','route_mode','boosts',
    'weekly_goal','timer','completed_lessons','claimed_challenges','settings','mascot','meta')
    or length(p_key)>160 or p_key='' or jsonb_typeof(p_data)<>'object' then
    raise exception 'invalid_sync_record';
  end if;
  insert into public.user_documents(user_id,kind,document_id,data,updated_at)
  values(v_user,p_kind,p_key,p_data,now())
  on conflict(user_id,kind,document_id) do update set data=excluded.data,updated_at=now()
  where public.user_documents.updated_at is not distinct from p_expected
  returning updated_at into v_result;
  if v_result is null then raise exception 'sync_conflict'; end if;
  return v_result;
end $$;
revoke all on function public.apply_document_change(text,text,jsonb,timestamptz) from public, anon;
grant execute on function public.apply_document_change(text,text,jsonb,timestamptz) to authenticated;

-- La actualización de metadatos protegidos y economía no es una operación de cliente.
revoke update on public.profiles from authenticated;
grant update(display_name,timezone) on public.profiles to authenticated;
revoke update on public.sync_metadata from authenticated;
grant update(client_version,last_sync_at) on public.sync_metadata to authenticated;
