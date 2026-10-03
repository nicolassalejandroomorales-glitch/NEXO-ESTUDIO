/* PostgreSQL WASM execution: same schema/RLS/RPC, with minimal Supabase auth.uid shim. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {PGlite}=require('@electric-sql/pglite');
const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const db=new PGlite();
async function sql(text,params=[]) {return db.query(text,params)}
async function as(user,query,params=[]) {
  await db.exec('set role authenticated');
  await sql('select set_config($1,$2,false)',['request.jwt.claim.sub',user]);
  try {return await sql(query,params);}
  finally {await db.exec('reset role');}
}
(async()=>{
  await db.exec(`create role authenticated; create role anon; create schema auth;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable
      as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;`);
  for(const name of fs.readdirSync('migrations').filter(x=>x.endsWith('.sql')).sort()) {
    // PostgreSQL 17 includes gen_random_uuid(); PGlite no distribuye pgcrypto.
    const source=fs.readFileSync(path.join('migrations',name),'utf8').replace('create extension if not exists pgcrypto;','');
    await db.exec(source);
  }
  for(const table of ['study_sessions','currency_transactions','user_inventory']) {
    assert.equal((await sql('select has_table_privilege($1,$2,$3) as allowed',
      ['authenticated','public.'+table,'INSERT'])).rows[0].allowed,false,
    'authenticated no puede insertar directamente en '+table);
  }
  assert.equal((await sql('select has_table_privilege($1,$2,$3) as allowed',
    ['anon','public.profiles','SELECT'])).rows[0].allowed,false,
  'anon no puede leer perfiles');
  await db.exec(`grant usage on schema public,auth to authenticated;
    grant execute on function auth.uid() to authenticated;
    grant select,insert,update,delete on all tables in schema public to authenticated;
    revoke insert,update,delete on public.currency_transactions,public.user_inventory,
      public.active_study_timers,public.cosmetics,public.academic_attempts,
      public.academic_evidence,public.academic_reviews,public.academic_errors,
      public.academic_sources,public.verified_case_attempts,
      public.academic_focus_sessions,public.reward_reservations from authenticated;
    revoke all on public.academic_case_keys from authenticated;
    revoke update on public.sync_conflicts from authenticated;
    revoke update on public.profiles,public.sync_metadata from authenticated;
    grant update(display_name,timezone) on public.profiles to authenticated;
    grant update(client_version,last_sync_at) on public.sync_metadata to authenticated;`);
  await sql('insert into auth.users(id) values($1),($2)',[A,B]);
  assert.equal((await as(A,'select count(*)::integer as n from public.profiles')).rows[0].n,1);
  assert.equal((await as(B,'select count(*)::integer as n from public.profiles')).rows[0].n,1);
  await as(A,`insert into public.error_records(user_id,error_id,data) values($1,'a-error','{"observable":"personal"}')`,[A]);
  assert.equal((await as(B,'select count(*)::integer as n from public.error_records')).rows[0].n,0);
  await assert.rejects(as(B,`insert into public.error_records(user_id,error_id) values($1,'intrusion')`,[A]));
  assert.equal((await as(B,`update public.error_records set data='{"changed":true}' where user_id=$1`,[A])).affectedRows,0);
  assert.equal((await as(A,`select data->>'observable' as value from public.error_records where error_id='a-error'`)).rows[0].value,'personal');
  await assert.rejects(as(A,`insert into public.user_inventory(user_id,cosmetic_id) values($1,'hat-scholar')`,[A]));
  await assert.rejects(as(A,`update public.currency_transactions set amount=1000000 where user_id=$1`,[A]));
  await assert.rejects(as(A,`insert into public.currency_transactions(user_id,amount,reason,reference_id)
    values($1,1000000,'gift','forged')`,[A]));
  await assert.rejects(as(A,`update public.profiles set legacy_economy='{"coins":1000000}' where user_id=$1`,[A]));
  assert.equal((await as(A,'select public.currency_balance() as n')).rows[0].n,120);
  const purchase=await as(A,`select public.purchase_cosmetic('hat-beanie') as n`);
  assert.equal(purchase.rows[0].n,20);
  assert.equal((await as(A,`select public.purchase_cosmetic('hat-beanie') as n`)).rows[0].n,20);
  assert.equal((await as(A,`select count(*)::integer as n from public.currency_transactions where reason='cosmetic_purchase'`)).rows[0].n,1);
  await assert.rejects(as(A,`select public.purchase_cosmetic('hat-scholar')`));
  assert.equal((await as(A,'select public.currency_balance() as n')).rows[0].n,20);
  assert.equal((await as(A,`select count(*)::integer as n from public.user_inventory where cosmetic_id='hat-scholar'`)).rows[0].n,0);
  assert.equal((await as(A,`select slot,rarity from public.cosmetics where cosmetic_id='species-pig'`)).rows[0].slot,'species');
  await assert.rejects(as(A,`select public.apply_document_change('mascot','current',
    '{"value":{"species":"pig","slots":{"head":"hat-scholar"}}}'::jsonb,null)`));
  const equippedAt=(await as(A,`select public.apply_document_change('mascot','current',
    '{"value":{"species":"pig","slots":{"head":"hat-beanie","background":"scene-ruins"}}}'::jsonb,null) as t`)).rows[0].t;
  assert(equippedAt);
  assert.equal((await as(B,`update public.user_documents set data='{}'::jsonb where user_id=$1`,[A])).affectedRows,0);
  const timer=(await as(B,`select public.start_study_timer('organica') as id`)).rows[0].id;
  assert.equal((await as(B,`select public.start_study_timer('organica') as id`)).rows[0].id,timer,'un timer activo');
  await sql('update public.active_study_timers set started_at=now()-interval \'16 minutes\' where timer_id=$1',[timer]);
  const earned=(await as(B,'select public.finish_study_timer($1) as result',[timer])).rows[0].result;
  assert.equal(earned.reward,15);
  assert.equal((await as(B,'select public.finish_study_timer($1) as result',[timer])).rows[0].result.balance,135);
  assert.equal((await as(B,`select count(*)::integer as n from public.currency_transactions where reason='study_session'`)).rows[0].n,1);
  const forgedData={id:'forged-timer',date:'2026-09-25',subject:'organica',
    seconds:14400,source:'server_timer'};
  await as(A,`select public.apply_sync_change('study_sessions','forged-timer',$1::jsonb,null)`,
    [JSON.stringify(forgedData)]);
  const forged=(await as(A,`select source,data->>'source' as data_source from public.study_sessions
    where session_id='forged-timer'`)).rows[0];
  assert.equal(forged.source,'manual');assert.equal(forged.data_source,'manual');
  const verified=(await as(B,`select session_id,updated_at from public.study_sessions
    where source='server_timer'`)).rows[0];
  await assert.rejects(as(B,`select public.apply_sync_change('study_sessions',$1,$2::jsonb,$3::timestamptz)`,
    [verified.session_id,JSON.stringify(forgedData),verified.updated_at]));
  assert.equal((await as(B,`select source from public.study_sessions
    where session_id=$1`,[verified.session_id])).rows[0].source,'server_timer');
  await sql(`delete from public.study_sessions where user_id=$1 and session_id='forged-timer'`,[A]);
  await as(A,`select public.apply_sync_change('lesson_progress','org-01',$1::jsonb,null)`,[
    JSON.stringify({id:'org-01',status:'inestable',attempts:1})
  ]);
  assert.equal((await as(B,'select count(*)::integer as n from public.lesson_progress')).rows[0].n,0);
  await assert.rejects(as(A,`select public.apply_sync_change('lesson_progress','org-01','{}'::jsonb,null)`));
  const eventTimestamp=(await as(A,`select public.apply_sync_change('academic_events','event-a',
    '{"id":"event-a","date":"2026-09-25","title":"Prueba"}'::jsonb,null) as t`)).rows[0].t;
  await as(A,`select public.apply_sync_change('academic_events','event-a',
    '{"_deleted":true}'::jsonb,$1::timestamptz)`,[eventTimestamp]);
  const event=(await as(A,`select event_date,deleted_at,data from public.academic_events
    where event_id='event-a'`)).rows[0];
  assert(event.deleted_at && event.data._deleted && event.event_date,'tombstone conserva fecha y propaga borrado');
  assert.equal((await as(B,`select count(*)::integer as n from public.academic_events`)).rows[0].n,0);
  const conflict=(await as(A,`insert into public.sync_conflicts(user_id,entity_type,entity_id,local_data,remote_data)
    values($1,'academic_events','event-a','{}','{}') returning conflict_id`,[A])).rows[0].conflict_id;
  await assert.rejects(as(B,'select public.resolve_sync_conflict($1,$2)',[conflict,'cloud']));
  await as(A,'select public.resolve_sync_conflict($1,$2)',[conflict,'cloud']);
  const resolved=(await as(A,`select resolution,resolved_by,resolved_at from public.sync_conflicts
    where conflict_id=$1`,[conflict])).rows[0];
  assert.equal(resolved.resolution,'cloud');assert.equal(resolved.resolved_by,A);assert(resolved.resolved_at);
  await assert.rejects(as(A,`update public.sync_conflicts set resolution='local' where conflict_id=$1`,[conflict]));
  assert.equal((await as(A,`select schema_version from public.sync_metadata`)).rows[0].schema_version,19);
  await as(A,`select public.apply_document_change('organic_progress','current',
    '{"value":{"org-01":{"answers":{"b01":"mi respuesta"}}}}'::jsonb,null)`);
  assert.equal((await as(A,`select data#>>'{value,org-01,answers,b01}' as answer from public.user_documents
    where kind='organic_progress'`)).rows[0].answer,'mi respuesta');
  assert.equal((await as(B,`select count(*)::integer as n from public.user_documents
    where kind='organic_progress'`)).rows[0].n,0);
  await as(A,`select public.apply_document_change('active_time','segment-a',
    '{"value":{"id":"segment-a","conceptId":"org.protonation","seconds":65}}'::jsonb,null)`);
  assert.equal((await as(A,`select data#>>'{value,seconds}' as seconds from public.user_documents
    where kind='active_time' and document_id='segment-a'`)).rows[0].seconds,'65');
  assert.equal((await as(B,`select count(*)::integer as n from public.user_documents
    where kind='active_time'`)).rows[0].n,0);
  await assert.rejects(as(A,`select public.apply_document_change('active_time','inflated',
    '{"value":{"id":"inflated","conceptId":"org.protonation","seconds":999999}}'::jsonb,null)`));
  await as(A,`insert into public.study_sessions(user_id,session_id,seconds,source,data,updated_at)
    select $1,'cursor-'||lpad(n::text,3,'0'),60,'manual',
      jsonb_build_object('id','cursor-'||lpad(n::text,3,'0')),
      '2026-09-24 12:00:00+00'::timestamptz from generate_series(1,251) n`,[A]);
  const watermark=(await as(A,`select public.sync_watermark() as t`)).rows[0].t;
  const first=(await as(A,`select public.read_sync_page('study_sessions',$1,null,null,250) as page`,[watermark])).rows[0].page;
  const last=first.at(-1);
  await sql(`update public.study_sessions set updated_at=$1::timestamptz+interval '1 second'
    where user_id=$2 and session_id='cursor-001'`,[watermark,A]);
  const second=(await as(A,`select public.read_sync_page('study_sessions',$1,$2,$3,250) as page`,
    [watermark,last.updated_at,last.id])).rows[0].page;
  assert.equal(first.length,250);assert(second.length>=1);
  assert.equal(new Set([...first,...second].map(item=>item.id)).size,first.length+second.length);
  const later=(await as(A,`select public.read_sync_page('study_sessions',$1,$2,$3,250) as page`,
    [new Date(new Date(watermark).getTime()+2000).toISOString(),watermark,''])).rows[0].page;
  assert(later.some(item=>item.id==='cursor-001'),'una actualización posterior al watermark reaparece en el siguiente delta');
  assert.equal((await as(B,`select public.read_sync_page('study_sessions',now(),null,null,250) as page`)).rows[0].page.length,1);
  assert.equal((await as(A,`select public.study_summary() as summary`)).rows[0].summary.sessions,251);
  const attemptAt=(await as(A,`select public.apply_academic_change('academic_attempts','att-1',
    '{"exerciseId":"org-01:b01","familyId":"org.protonation.charge","outcome":"incorrect"}'::jsonb,null) as t`)).rows[0].t;
  assert(attemptAt);
  await assert.rejects(as(A,`select public.apply_academic_change('academic_attempts','att-1','{"outcome":"correct"}'::jsonb,null)`));
  assert.equal((await as(B,'select count(*)::integer as n from public.academic_attempts')).rows[0].n,0);
  await as(B,`select public.apply_academic_change('academic_attempts','att-1','{"outcome":"correct"}'::jsonb,null)`);
  assert.equal((await as(B,`select data->>'outcome' as outcome from public.academic_attempts where attempt_id='att-1'`)).rows[0].outcome,'correct');
  await assert.rejects(as(A,`update public.academic_attempts set data='{}'::jsonb`));
  for(const [table,id] of [['academic_evidence','ev-1'],['academic_reviews','review-1'],
    ['academic_errors','error-1'],['academic_sources','source-1']]) {
    await as(A,`select public.apply_academic_change($1,$2,$3::jsonb,null)`,
      [table,id,JSON.stringify({id,conceptId:'org.basicity'})]);
    assert.equal((await as(B,`select count(*)::integer as n from public.${table}`)).rows[0].n,0,
      'B no lee '+table+' de A');
    await assert.rejects(as(B,`update public.${table} set data='{}'::jsonb where user_id=$1`,[A]),
      'B no modifica '+table+' de A');
  }
  await assert.rejects(as(A,'select * from public.academic_case_keys'));
  await assert.rejects(as(A,`insert into public.reward_reservations(user_id,concept_id,rank,reward_tier)
    values($1,'org.basicity',5,'arcane')`,[A]));
  const wrong=(await as(A,`select public.submit_verified_case('verified-wrong','sv-resonance',
    '{"stronger":"aniline","conjugates":"aniline","benzene":"retained"}'::jsonb,true,false) as result`)).rows[0].result;
  assert.equal(wrong.correct,false);assert.equal(wrong.ranks['org.basicity'],0);
  const nonNumeric=(await as(B,`select public.submit_verified_case('verified-nan','sv-pka',
    '{"logA":"not-a-number","logB":"-1,4","favored":"A"}'::jsonb,true,false) as result`)).rows[0].result;
  assert.equal(nonNumeric.correct,false,'un número inválido se registra como error, no rompe sync');
  const resonant={stronger:'benzyl',conjugates:'aniline',benzene:'retained'};
  const heterocycle={site:'no-h',pi:'6',after:'retained'};
  for(const [id,caseId,answers] of [['verified-r','sv-resonance',resonant],
    ['verified-h','sv-heterocycle',heterocycle]]) {
    const result=(await as(A,`select public.submit_verified_case($1,$2,$3::jsonb,true,false) as result`,
      [id,caseId,JSON.stringify(answers)])).rows[0].result;
    assert.equal(result.correct,true);
  }
  const focus1=(await as(A,`select public.start_academic_focus('org.basicity') as id`)).rows[0].id;
  await sql(`update public.academic_focus_sessions set started_at=now()-interval '13 minutes',
    last_ping_at=now() where user_id=$1 and focus_id=$2`,[A,focus1]);
  const focusResult=(await as(A,`select public.finish_academic_focus($1) as result`,[focus1])).rows[0].result;
  assert.equal(focusResult.rank,2);
  assert.equal((await as(A,`select count(*)::integer as n from public.reward_reservations
    where concept_id='org.basicity'`)).rows[0].n,2);
  assert.equal((await as(B,`select count(*)::integer as n from public.reward_reservations`)).rows[0].n,0);
  await as(A,`select public.refresh_rank_reservations('org.basicity')`);
  assert.equal((await as(A,`select count(*)::integer as n from public.reward_reservations
    where concept_id='org.basicity'`)).rows[0].n,2,'no duplicated reservation');
  await as(A,`select public.submit_verified_case('verified-p','sv-protonation',
    '{"bonds":"4","charge":"+1","chloride":"counterion"}'::jsonb,true,false)`);
  await sql(`update public.verified_case_attempts set attempted_at=now()-interval '2 days'
    where user_id=$1 and attempt_id in ('verified-r','verified-p')`,[A]);
  await sql(`update public.verified_case_attempts set attempted_at=now()-interval '3 days'
    where user_id=$1 and attempt_id='verified-wrong'`,[A]);
  await as(A,`select public.submit_verified_case('verified-pep','sv-pep-order',
    '{"order":"n-a-m-b","shared":"direct","benzyl":"sp3"}'::jsonb,true,true)`);
  const focus2=(await as(A,`select public.start_academic_focus('org.basicity') as id`)).rows[0].id;
  await sql(`update public.academic_focus_sessions set started_at=now()-interval '53 minutes',
    last_ping_at=now() where user_id=$1 and focus_id=$2`,[A,focus2]);
  assert.equal((await as(A,`select public.finish_academic_focus($1) as result`,[focus2])).rows[0].result.rank,5);
  assert.equal((await as(A,`select count(*)::integer as n from public.reward_reservations
    where concept_id='org.basicity'`)).rows[0].n,5);
  assert.equal((await as(A,`select public.finish_academic_focus($1) as result`,[focus2])).rows[0].result.rank,5);
  await assert.rejects(as(B,`select public.finish_academic_focus($1)`,[focus2]));
  const privateTables=['profiles','study_sessions','lesson_progress','exercise_progress',
    'academic_events','grade_plans','error_records','user_documents','sync_metadata',
    'sync_conflicts','user_inventory','currency_transactions','active_study_timers',
    'academic_attempts','academic_evidence','academic_reviews','academic_errors','academic_sources',
    'academic_case_keys','verified_case_attempts','academic_focus_sessions','reward_reservations'];
  for(const table of privateTables)
    assert.equal((await sql('select relrowsecurity from pg_class where oid=$1::regclass',['public.'+table])).rows[0].relrowsecurity,true,
      'RLS '+table);
  await as(A,'select public.delete_my_account()');
  assert.equal((await sql('select count(*)::integer as n from auth.users where id=$1',[A])).rows[0].n,0);
  assert.equal((await sql('select count(*)::integer as n from public.currency_transactions where user_id=$1',[A])).rows[0].n,0);
  assert.equal((await sql('select count(*)::integer as n from auth.users where id=$1',[B])).rows[0].n,1);
  console.log('OK: SQL real, RLS A/B, economía protegida, compra atómica, recompensa idempotente y versión de sync.');
  await db.close();
})().catch(async error=>{console.error(error);await db.close();process.exitCode=1});
