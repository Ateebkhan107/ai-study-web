-- DESTRUCTIVE to generated-test data. Apply only with explicit approval/backups.
-- Permanently destroys generated questions, validation evidence, saved answers and results.
-- Retains ALL base test_sessions rows, normal attempts and shared questions.
-- Disable BOTH ZI_GENERATED_TEST_ENGINE_ENABLED and ZI_BANK_ATOMIC_SUBMISSIONS_ENABLED
-- before rollback, and drain all generated/normal atomic submission requests.
-- Keep ZI_AI_TEST_GENERATION_ENABLED disabled. Never execute without separate approval.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';
drop function if exists public.zi_commit_bank_submission(text,uuid,jsonb,jsonb);
drop function if exists public.zi_submit_generated_test(text,uuid,integer,jsonb);
drop function if exists public.zi_save_generated_answers(text,uuid,integer,jsonb);
drop function if exists public.zi_validate_generated_answers(uuid,jsonb);
drop function if exists public.zi_start_generated_test(text,uuid);
drop function if exists public.zi_store_generated_test(text,text,jsonb,text,integer,text,jsonb);
-- No DELETE from shared tables. Retained base-session metadata may need a separately
-- reviewed cleanup/usage reconciliation; this rollback does not perform it.
drop table public.zi_generated_sessions;
drop table public.zi_generated_questions;
drop table public.zi_generated_tests;
commit;
