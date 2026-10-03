const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const migrations=fs.readdirSync('migrations').filter(x=>x.endsWith('.sql'))
  .map(x=>fs.readFileSync(path.join('migrations',x),'utf8')).join('\n');
const client=fs.readFileSync('dist/cloud/foundation.js','utf8');
const app=fs.readFileSync('dist/app.js','utf8');
for(const table of ['profiles','study_sessions','lesson_progress','exercise_progress',
  'academic_events','grade_plans','error_records','user_documents','sync_metadata',
  'sync_conflicts','user_inventory','currency_transactions','active_study_timers','cosmetics',
  'academic_attempts','academic_evidence','academic_reviews','academic_errors','academic_sources'])
  assert(migrations.includes(`public.${table}`),`falta ${table}`);
assert(migrations.includes('enable row level security'));
assert(migrations.includes('using (user_id = (select auth.uid()))'));
assert(migrations.includes('revoke all on function public.purchase_cosmetic'));
assert(migrations.includes('revoke update on public.profiles'));
assert(migrations.includes('immutable_academic_record'));
assert(migrations.includes('read_sync_page'));
assert(!/service_role|sb_secret_/i.test(client+app+fs.readFileSync('dist/config.js','utf8')));
assert(!/supabase\.from\(/.test(app),'la vista no consulta Supabase directamente');
assert(!/posthog\.capture\(/.test(app),'analytics debe estar centralizado');
assert(!/localStorage\.clear\(/.test(client+app));
console.log('OK: auditoría estática de límites cliente/servidor; no sustituye pruebas RLS sobre PostgreSQL.');
