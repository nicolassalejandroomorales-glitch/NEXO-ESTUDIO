-- V14: keyset pages. Every page uses a stable (updated_at, entity key) cursor.
create index lesson_progress_delta on public.lesson_progress(user_id,updated_at,lesson_id);
create index exercise_progress_delta on public.exercise_progress(user_id,updated_at,exercise_id);
create index grade_plans_delta on public.grade_plans(user_id,updated_at,subject_id);
create index documents_keyset on public.user_documents(user_id,updated_at,(kind || ':' || document_id));

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
    when 'error_records' then 'error_id' when 'user_documents' then 'document_id' else null end;
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

-- Aggregate only what Inicio needs now; raw history remains pageable.
create or replace function public.study_summary() returns jsonb
language sql stable security definer set search_path = '' as $$
  select case when auth.uid() is null then null else jsonb_build_object(
    'sessions', count(*), 'seconds', coalesce(sum(seconds),0),
    'latest',max(study_date)) end
  from public.study_sessions where user_id=auth.uid()
$$;
revoke all on function public.study_summary() from public,anon;
grant execute on function public.study_summary() to authenticated;

update public.sync_metadata set schema_version=14,updated_at=now();
alter table public.sync_metadata alter column schema_version set default 14;
