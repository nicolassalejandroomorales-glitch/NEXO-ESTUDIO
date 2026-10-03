-- Covers the case_id foreign key for parent-key maintenance and case lookups.
create index if not exists verified_cases_case_id_fkey_idx
  on public.verified_case_attempts(case_id);
