-- V14: detailed org-01 work had not been included in V12/V13 cloud documents.
alter table public.user_documents drop constraint user_documents_kind_check;
alter table public.user_documents add constraint user_documents_kind_check
  check (kind in ('guide','exam','lab','absence','lesson_session','route_mode','boosts',
    'weekly_goal','timer','completed_lessons','claimed_challenges','settings','mascot',
    'meta','organic_progress'));
create or replace function public.apply_document_change(
  p_kind text, p_key text, p_data jsonb, p_expected timestamptz default null
) returns timestamptz language plpgsql security definer set search_path = ''
as $$
declare v_result timestamptz; v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'auth_required'; end if;
  if p_kind not in ('guide','exam','lab','absence','lesson_session','route_mode','boosts',
    'weekly_goal','timer','completed_lessons','claimed_challenges','settings','mascot','meta',
    'organic_progress')
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


update public.sync_metadata set schema_version=16,updated_at=now();
alter table public.sync_metadata alter column schema_version set default 16;
