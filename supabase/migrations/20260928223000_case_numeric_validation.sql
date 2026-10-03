-- Invalid decimal text is an incorrect academic response, not a sync error.
create or replace function public.case_decimal_correct(p_value text,p_expected numeric)
returns boolean language plpgsql immutable security definer set search_path = '' as $$
begin
  if p_value is null or p_value !~ '^-?[0-9]+([.,][0-9]+)?$' then return false; end if;
  return abs(replace(p_value,',','.')::numeric-p_expected)<=.05;
exception when invalid_text_representation or numeric_value_out_of_range then return false;
end $$;
revoke all on function public.case_decimal_correct(text,numeric) from public,anon,authenticated;

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
      if not public.case_decimal_correct(p_answers->>v_entry.key,v_entry.value::numeric)
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

update public.sync_metadata set schema_version=19,updated_at=now();
alter table public.sync_metadata alter column schema_version set default 19;
