-- Nexo 1.0: explicit Data API grants for the newly provisioned project.
-- RLS policies remain the row-level boundary; grants are the role boundary.
revoke all on all tables in schema public from public, anon, authenticated;
revoke all on all sequences in schema public from public, anon, authenticated;
revoke all on all functions in schema public from public, anon;

-- Every user-facing table is private under its existing RLS policy.
grant select on
  public.profiles,
  public.study_sessions,
  public.lesson_progress,
  public.exercise_progress,
  public.academic_events,
  public.grade_plans,
  public.error_records,
  public.user_documents,
  public.sync_metadata,
  public.sync_conflicts,
  public.cosmetics,
  public.user_inventory,
  public.currency_transactions,
  public.active_study_timers,
  public.academic_attempts,
  public.academic_evidence,
  public.academic_reviews,
  public.academic_errors,
  public.academic_sources
to authenticated;

-- The client updates only these harmless profile and sync fields directly.
grant update (display_name, timezone) on public.profiles to authenticated;
grant update (client_version, last_sync_at) on public.sync_metadata to authenticated;
grant insert on public.sync_conflicts to authenticated;

-- Writes to progress, documents, attempts, inventory, timers and ledger use
-- individually granted RPCs; no broad table write privileges are retained.
-- The default table grants are removed for future migrations too.
alter default privileges for role postgres in schema public
  revoke all on tables from public, anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from public, anon, authenticated;
