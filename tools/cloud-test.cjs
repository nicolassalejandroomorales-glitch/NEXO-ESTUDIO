const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const memory = new Map();
const ctx = {
  window: { NEXO_PUBLIC_CONFIG: {}, NEXO_TEST_MODE: true, addEventListener() {} },
  localStorage: {
    getItem: key => memory.get(key) ?? null,
    setItem: (key,value) => memory.set(key,String(value)),
    removeItem: key => memory.delete(key)
  },
  navigator: {onLine:false},
  setTimeout,clearTimeout,console,Date,JSON
};
vm.runInNewContext(fs.readFileSync('dist/cloud/foundation.js','utf8'),ctx);
const { rowsFromState,applyRows,mergeAcademic }=ctx.window.NexoCloudTest;
const base={
  sessions:[],mastery:{},practice:{},events:[],grades:{},errors:[],absences:[],
  guides:{},exams:{},labs:{},completedLessons:[],claimedChallenges:[],
  settings:{},mascot:{},routeMode:{},boosts:{},weeklyGoal:300,
  lessonSession:null,timer:{status:'idle'},meta:{},coins:120,inventory:['species-pig'],xp:0
};
const guest=JSON.parse(JSON.stringify(base));
guest.sessions=[{id:'stable-a',date:'2026-09-25',subject:'organica',seconds:300,mode:'Cronómetro'}];
guest.mastery={'org-01':{status:'dominado',attempts:3,bestScore:90}};
guest.events=[{id:'cal-a',date:'2026-10-21',subject:'fq2',title:'PEP'}];
guest.guides={'guide-a':{draft:'texto personal'}};
guest.organicProgress={'org-01':{answers:{b01:'un razonamiento privado'},status:'inestable'}};
guest.academicIntelligence={attempts:[{id:'att-1',exerciseId:'org-01:b01',familyId:'org.protonation.charge',outcome:'correct'}],
  evidence:[{id:'att-1:org.protonation',attemptId:'att-1',conceptId:'org.protonation',outcome:'correct'}],
  reviewSchedules:[],structuredErrors:[],userSources:[],activeTimeSegments:[{id:'active-a',conceptId:'org.protonation',seconds:100}]};
guest.grades={organica:{components:[{id:'grade-a',grade:'5.50'}]}};
guest.coins=3000000;
guest.inventory=['species-pig','hat-scholar'];
const rows=rowsFromState(guest);
assert(rows.some(r=>r.table==='study_sessions'&&r.id==='stable-a'));
assert(rows.some(r=>r.table==='lesson_progress'&&r.id==='org-01'));
assert(rows.some(r=>r.table==='user_documents'&&r.kind==='guide'));
assert(rows.some(r=>r.table==='user_documents'&&r.kind==='organic_progress'));
assert(rows.some(r=>r.table==='academic_attempts'&&r.id==='att-1'));
assert(rows.some(r=>r.table==='user_documents'&&r.kind==='active_time'&&r.id==='active-a'));
assert(!JSON.stringify(rows).includes('3000000'), 'economía sin autorización nunca entra en los registros académicos');
const reconstructed=applyRows(base,rows);
assert.equal(reconstructed.sessions[0].id,'stable-a');
assert.equal(reconstructed.mastery['org-01'].status,'dominado');
assert.equal(reconstructed.guides['guide-a'].draft,'texto personal');
assert.equal(reconstructed.organicProgress['org-01'].answers.b01,'un razonamiento privado');
assert.equal(reconstructed.academicIntelligence.attempts[0].id,'att-1');
assert.equal(reconstructed.academicIntelligence.activeTimeSegments[0].seconds,100);

const remote=JSON.parse(JSON.stringify(base));
remote.sessions=[{id:'stable-b',date:'2026-09-25',subject:'analitica',seconds:600}];
remote.mastery={'org-01':{status:'inestable',attempts:1,bestScore:50}};
remote.events=[{id:'cal-a',date:'2026-10-22',subject:'fq2',title:'PEP movida'}];
remote.coins=120; remote.inventory=['species-pig'];
const merged=mergeAcademic(guest,remote);
assert.equal(merged.merged.sessions.length,2,'sesiones independientes por ID');
assert.equal(merged.merged.mastery['org-01'].status,'dominado','el dominio no retrocede');
assert.equal(merged.merged.mastery['org-01'].bestScore,90);
assert.equal(merged.merged.coins,120,'saldo cloud canónico');
assert.deepEqual(Array.from(merged.merged.inventory),['species-pig'],'inventario protegido');
assert.equal(merged.merged.events[0].title,'PEP movida','un conflicto no pisa el remoto');
assert(merged.conflicts.some(c=>c.key==='events:cal-a'),'se conserva conflicto de calendario');
assert.equal(mergeAcademic(guest,merged.merged).merged.sessions.length,2,'migración repetida no duplica');
assert.equal(mergeAcademic(guest,merged.merged).merged.academicIntelligence.attempts.length,1);
assert.equal(mergeAcademic(guest,merged.merged).merged.academicIntelligence.activeTimeSegments.length,1);

const cloud=ctx.window.NexoCloud;
cloud.user={id:'test-user'};
cloud.user.email='a@example.test';
assert(cloud.claimMatches({userId:'test-user',email:'A@EXAMPLE.TEST'}));
assert(!cloud.claimMatches({userId:'different-user',email:'a@example.test'}));
assert(!cloud.claimMatches({userId:'test-user',email:'b@example.test'}));
cloud.balance=120; cloud.inventory=['species-pig'];
cloud.client={};
cloud.save(guest);
const outbox=JSON.parse(memory.get('nexo-cloud-outbox-v12:test-user'));
assert(outbox.some(r=>r.id==='stable-a'));
assert(!memory.get('nexo-cloud-cache-v12:test-user').includes('3000000'));
cloud.save(guest);
assert.equal(JSON.parse(memory.get('nexo-cloud-outbox-v12:test-user')).length,outbox.length,'outbox idempotente');
const events=[];
cloud.analytics={capture:(name,props)=>events.push({name,props})};
cloud.analyticsAllowed=true;
cloud.track('exercise_attempted',{exercise_id:'q-1',correct:false,attempt:2,
  answer:'texto privado',email:'persona@example.com',note:'nota personal'});
cloud.track('evento_no_documentado',{answer:'secreto'});
cloud.track('problem_family_attempted',{family_id:'org.protonation.charge',concept_id:'org.protonation',answer:'texto privado'});
assert.equal(events.length,2);
assert.equal(events[0].props.exercise_id,'q-1');
assert(!JSON.stringify(events).includes('texto privado'));
assert(!JSON.stringify(events).includes('persona@example.com'));
assert.equal(events[1].props.family_id,'org.protonation.charge');
assert.equal(cloud.enabled,false,'sin configuración pública funciona como invitado');
(async()=>{
  const rpcCalls=[];
  cloud.callbacks={getCurrent:()=>({academicIntelligence:{attempts:[{id:'verified-1',
    exerciseId:'org-01:sv-resonance',structuredAnswers:{stronger:'benzyl',conjugates:'aniline',benzene:'retained'},
    assistanceUsed:false,reviewed:true}]}})};
  cloud.client={rpc:async(name,args)=>{rpcCalls.push({name,args});return {data:name==='start_academic_focus'?'focus-id':
    name==='finish_academic_focus'?{seconds:310,rank:1}:true,error:null};},
    from:()=>({select:async()=>({data:[{concept_id:'org.basicity',rank:1,status:'reserved'}],error:null})})};
  await cloud.syncVerifiedCases();await cloud.syncVerifiedCases();
  assert.equal(rpcCalls.filter(item=>item.name==='submit_verified_case').length,1,'envío verificado idempotente');
  assert.equal(rpcCalls.find(item=>item.name==='submit_verified_case').args.p_case_id,'sv-resonance');
  ctx.navigator.onLine=true;
  const focusId=await cloud.startAcademicFocus('org.basicity');
  await cloud.pingAcademicFocus(focusId);
  await cloud.finishAcademicFocus(focusId);
  assert.equal(cloud.reservations.length,1);
  assert.equal(rpcCalls.find(item=>item.name==='finish_academic_focus').args.p_focus_id,'focus-id');
  cloud.client.auth={signOut:async()=>({data:{},error:null})};
  cloud.callbacks={getCurrent:()=>({settings:{analytics:false}}),onGuest(){}};
  await cloud.signOut();
  assert.equal(cloud.reservations.length,0,'al cerrar sesión no se exponen reservas de otra cuenta');
  cloud.user={id:'test-user',email:'a@example.test'};
  cloud.reservations=[{concept_id:'org.basicity',rank:1}];
  await cloud.sessionChanged(null);
  assert.equal(cloud.reservations.length,0,'el evento de Auth también limpia datos privados');
  cloud.user={id:'test-user',email:'a@example.test'};
  ctx.navigator.onLine=false;
  // A full first page followed by a failed second page must not commit the watermark.
  const prior='2026-09-20T00:00:00.000Z';
  memory.set(cloud.cursorKey,JSON.stringify(prior));
  let pages=0;
  cloud.callbacks={getDefault:()=>base,getCurrent:()=>base,onState(){throw new Error('unexpected_partial_commit');}};
  cloud.client={
    from:()=>({select:()=>({single:async()=>({data:{schema_version:19},error:null})})}),
    rpc:async(name)=>{
      if(name==='sync_watermark')return {data:'2026-09-25T23:59:59.000Z',error:null};
      if(name==='read_sync_page') {
        pages++;
        if(pages===1)return {data:Array.from({length:250},(_,i)=>({
          id:'page-'+String(i).padStart(4,'0'),kind:'',updated_at:'2026-09-21T00:00:00.000Z',data:{id:'page-'+i}
        })),error:null};
        return {data:null,error:{message:'network_broken_mid_page'}};
      }
      throw new Error('unexpected_rpc:'+name);
    }
  };
  await cloud.pull();
  assert.equal(pages,2);
  assert.equal(JSON.parse(memory.get(cloud.cursorKey)),prior,'fallo a mitad del delta conserva cursor anterior');
  assert.equal(cloud.status,'failed');
  console.log('OK: mapeo por entidad, progreso, merge, privacidad y watermark atómico.');
})().catch(error=>{console.error(error);process.exitCode=1});
