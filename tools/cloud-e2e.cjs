/* Critical browser journey against a deterministic Supabase protocol fixture.
   PostgreSQL/RLS are exercised separately by database-test.cjs. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require('playwright');
const dist=path.resolve(__dirname,'../dist');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp',
  '.svg':'image/svg+xml','.wasm':'application/wasm','.riv':'application/octet-stream'};
const server=http.createServer((req,res)=>{
  const name=decodeURIComponent(new URL(req.url,'http://local').pathname);
  const file=path.resolve(dist,'.'+(name==='/'?'/index.html':name));
  if(!file.startsWith(dist+path.sep)) return res.writeHead(403).end();
  fs.readFile(file,(e,data)=>e?res.writeHead(404).end():
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'}).end(data));
});
const TEST_USER='33333333-3333-4333-8333-333333333333';
const token=Buffer.from('{"alg":"none"}').toString('base64url')+'.'+
  Buffer.from(JSON.stringify({sub:TEST_USER,role:'authenticated',exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.sig';
const session={access_token:token,refresh_token:'mock-refresh',token_type:'bearer',expires_in:3600,
  expires_at:Math.floor(Date.now()/1000)+3600,user:{id:TEST_USER,email:'v12@example.test',aud:'authenticated',
  role:'authenticated',app_metadata:{provider:'google'},user_metadata:{},created_at:new Date().toISOString()}};
const tables=new Map(),purchases=new Set(),sessionReads=[]; let balance=120,online=true,seq=0;
let appOrigin='';
function dbTable(name){if(!tables.has(name))tables.set(name,new Map());return tables.get(name);}
function json(route,value,status=200){
  return route.fulfill({status,headers:{'content-type':'application/json','access-control-allow-origin':'*',
    'access-control-allow-headers':'apikey,authorization,content-type,x-client-info,prefer',
    'access-control-expose-headers':'content-range'},body:JSON.stringify(value)});
}
async function mock(route){
  if(!online) return route.abort('internetdisconnected');
  const req=route.request(),url=new URL(req.url()),parts=url.pathname.split('/').filter(Boolean);
  if(req.method()==='OPTIONS') return json(route,{});
  if(parts[0]==='auth'){
    if(parts[2]==='authorize')return route.fulfill({status:302,
      headers:{location:appOrigin+'?code=google-test-code'},body:''});
    if(parts[2]==='token') return json(route,session);
    if(parts[2]==='user') return json(route,session.user);
    if(parts[2]==='logout') return json(route,{});
    if(parts[2]==='recover') return json(route,{});
    return json(route,{msg:'unknown auth path'},404);
  }
  if(parts[0]!=='rest') return json(route,{},404);
  if(parts[2]==='rpc'){
    const name=parts[3],payload=req.postDataJSON()||{};
    if(name==='currency_balance')return json(route,balance);
    if(name==='study_summary')return json(route,{sessions:dbTable('study_sessions').size,seconds:0});
    if(name==='sync_watermark')return json(route,new Date(Date.now()+seq+1).toISOString());
    if(name==='read_sync_page') {
      const {p_table,p_after_updated,p_after_id,p_watermark,p_limit}=payload;
      if(p_table==='study_sessions')sessionReads.push(JSON.stringify(payload));
      const rows=[...dbTable(p_table).values()].map(row=>({id:p_table==='user_documents'
        ? row.kind+':'+row.document_id : row[{study_sessions:'session_id',lesson_progress:'lesson_id',
          exercise_progress:'exercise_id',academic_events:'event_id',grade_plans:'subject_id',
          error_records:'error_id',academic_attempts:'attempt_id',academic_evidence:'evidence_id',
          academic_reviews:'review_id',academic_errors:'academic_error_id',
          academic_sources:'source_id'}[p_table]],kind:row.kind||'',data:row.data,updated_at:row.updated_at}));
      return json(route,rows.filter(row=>row.updated_at<=p_watermark &&
        (!p_after_updated||row.updated_at>p_after_updated||
          row.updated_at===p_after_updated&&row.id>p_after_id))
        .sort((a,b)=>a.updated_at.localeCompare(b.updated_at)||a.id.localeCompare(b.id))
        .slice(0,p_limit));
    }
    if(name==='resolve_sync_conflict')return json(route,null);
    if(name==='archive_legacy_economy'||name==='complete_cloud_migration')return json(route,null);
    if(name==='apply_sync_change'||name==='apply_document_change'||name==='apply_academic_change'){
      const academicRecords=['academic_attempts','academic_evidence','academic_reviews',
        'academic_errors','academic_sources'];
      if(name==='apply_academic_change'&&!academicRecords.includes(payload.p_table))
        return json(route,{code:'P0001',message:'invalid_academic_record'},400);
      if(name==='apply_sync_change'&&academicRecords.includes(payload.p_table))
        return json(route,{code:'P0001',message:'invalid_sync_table'},400);
      const table=name==='apply_document_change'?'user_documents':payload.p_table;
      const key=(payload.p_kind?payload.p_kind+':':'')+payload.p_key,collection=dbTable(table);
      const old=collection.get(key);
      if((old?.updated_at||null)!==(payload.p_expected||null))
        return json(route,{code:'P0001',message:'sync_conflict'},400);
      const updated_at=new Date(Date.now()+ ++seq).toISOString();
      collection.set(key,{...old,data:payload.p_data,updated_at,
        ...(table==='user_documents'?{kind:payload.p_kind,document_id:payload.p_key}
          :{[{study_sessions:'session_id',lesson_progress:'lesson_id',exercise_progress:'exercise_id',
            academic_events:'event_id',grade_plans:'subject_id',error_records:'error_id',
            academic_attempts:'attempt_id',academic_evidence:'evidence_id',academic_reviews:'review_id',
            academic_errors:'academic_error_id',academic_sources:'source_id'}[table]]:payload.p_key})});
      return json(route,updated_at);
    }
    if(name==='purchase_cosmetic'){
      if(!purchases.has(payload.p_cosmetic_id)){
        if(balance<100)return json(route,{code:'P0001',message:'insufficient_balance'},400);
        balance-=100;purchases.add(payload.p_cosmetic_id);
      }
      return json(route,balance);
    }
    if(name==='start_study_timer')return json(route,'44444444-4444-4444-8444-444444444444');
    if(name==='pause_study_timer'||name==='resume_study_timer'||name==='cancel_study_timer')return json(route,null);
    if(name==='finish_study_timer'){
      const id=payload.p_timer_id,collection=dbTable('study_sessions');
      if(!collection.has(id)){
        balance+=15;
        collection.set(id,{session_id:id,data:{id,date:'2026-09-25',subject:'organica',
          mode:'Cronómetro',seconds:900,source:'server_timer'},updated_at:new Date().toISOString()});
      }
      return json(route,{session_id:id,seconds:900,reward:15,balance});
    }
    return json(route,{code:'P0001',message:'unknown rpc'},400);
  }
  const table=parts[2],collection=dbTable(table);
  if(req.method()==='GET'){
    if(table==='sync_metadata')return json(route,{schema_version:19,migration_version:0,
      cloud_migration_completed:false});
    if(table==='user_inventory')return json(route,[{cosmetic_id:'species-pig'},
      {cosmetic_id:'scene-ruins'},...[...purchases].map(cosmetic_id=>({cosmetic_id}))]);
    let rows=[...collection.values()];
    if(table==='study_sessions')sessionReads.push(url.search);
    for(const [key,value] of url.searchParams) {
      if(value.startsWith('eq.'))rows=rows.filter(row=>String(row[key])===value.slice(3));
      if(value.startsWith('gte.'))rows=rows.filter(row=>String(row[key])>=value.slice(4));
      if(value.startsWith('lte.'))rows=rows.filter(row=>String(row[key])<=value.slice(4));
    }
    const order=url.searchParams.get('order')||'';
    if(order.startsWith('updated_at.')) rows.sort((a,b)=>
      order.startsWith('updated_at.desc') ? String(b.updated_at).localeCompare(String(a.updated_at))
        : String(a.updated_at).localeCompare(String(b.updated_at)));
    const range=req.headers().range;
    if(range){const [a,b]=range.split('-').map(Number);rows=rows.slice(a,b+1);}
    else if(url.searchParams.has('limit')) {
      const offset=Number(url.searchParams.get('offset')||0);
      rows=rows.slice(offset,offset+Number(url.searchParams.get('limit')));
    }
    return json(route,rows);
  }
  if(table==='sync_metadata'&&req.method()==='PATCH')return json(route,[]);
  if(table==='sync_conflicts'&&req.method()==='POST')return json(route,{conflict_id:'55555555-5555-4555-8555-555555555555'});
  return json(route,{code:'P0001',message:'unexpected write'},400);
}
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url=`http://127.0.0.1:${server.address().port}/`;
  appOrigin=url;
  const browser=await chromium.launch(process.env.PLAYWRIGHT_EXECUTABLE_PATH
    ? {executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:['--no-sandbox','--disable-dev-shm-usage'],headless:true}
    : {channel:process.env.PLAYWRIGHT_CHANNEL||'msedge',headless:true});
  try {
    const first=await browser.newContext();
    await first.route('https://test.supabase.co/**',mock);
    await first.route('**/config.js*',route=>route.fulfill({contentType:'text/javascript',
      body:`window.NEXO_PUBLIC_CONFIG={supabaseUrl:'https://test.supabase.co',supabaseAnonKey:'sb_publishable_test',googleOAuthEnabled:true};`}));
    const page=await first.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(url+'#/hub/timer');
    await page.locator('[data-action="timer-start"]').click();
    await page.waitForTimeout(1200);
    await page.locator('[data-action="timer-finish"]').click();
    await page.waitForFunction(()=>JSON.parse(localStorage.getItem('nexo-study-beta'))?.sessions?.length>0);
    await page.goto(url+'#/lesson/org-01');
    await page.locator('[data-amine-answer="b01"]').fill('El nitrógeno forma un enlace N-H nuevo y adquiere carga positiva.');
    await page.locator('[data-amine-reveal="b01"]').click();
    await page.locator('[data-amine-assess="b01"][data-value="bien"]').click();
    await page.waitForFunction(()=>JSON.parse(localStorage.getItem('nexo-study-beta'))?.academicIntelligence?.attempts?.length>0);
    await page.goto(url+'#/profile/settings');
    assert.equal(await page.locator('[data-account-form]').count(),0,'solo acceso Google');
    await page.locator('[data-action="google-login"]').click();
    await page.waitForFunction(()=>window.NexoCloud?.authenticated,null,{timeout:15000});
    await page.waitForURL(/#\/profile\/settings$/,{timeout:15000});
    await page.locator('[data-action="claim-guest"]').click();
    await page.waitForFunction(id=>JSON.parse(localStorage.getItem('nexo-cloud-outbox-v12:'+id)||'[]').length===0 &&
      JSON.parse(localStorage.getItem('nexo-guest-migration-v12:'+id)||'false'),TEST_USER,{timeout:15000})
      .catch(async error=>{console.error('Migration debug',await page.evaluate(id=>({
        status:window.NexoCloud.statusInfo(),user:window.NexoCloud.user?.id,
        migration:localStorage.getItem('nexo-guest-migration-v12:'+id),
        queue:JSON.parse(localStorage.getItem('nexo-cloud-outbox-v12:'+id)||'[]').slice(0,3),
        toast:document.querySelector('#toast')?.textContent
      }),TEST_USER),errors);throw error;});
    assert([...dbTable('study_sessions').values()].some(row=>row.data.seconds>=1),'guest to cloud');
    await page.locator('[data-action="logout"]').click();
    const second=await browser.newContext();
    await second.route('https://test.supabase.co/**',mock);
    await second.route('**/config.js*',route=>route.fulfill({contentType:'text/javascript',
      body:`window.NEXO_PUBLIC_CONFIG={supabaseUrl:'https://test.supabase.co',supabaseAnonKey:'sb_publishable_test',googleOAuthEnabled:true};`}));
    const phone=await second.newPage({viewport:{width:390,height:844}});
    phone.on('pageerror',error=>errors.push(error.message));
    await phone.goto(url+'#/profile/settings');
    await phone.locator('[data-action="google-login"]').click();
    await phone.waitForFunction(id=>JSON.parse(localStorage.getItem('nexo-cloud-cache-v12:'+id)||'{}').sessions?.length>0,
      TEST_USER,{timeout:15000});
    await phone.waitForFunction(id=>{
      const data=JSON.parse(localStorage.getItem('nexo-cloud-cache-v12:'+id)||'{}');
      return data.organicProgress?.['org-01']?.answers?.b01&&data.academicIntelligence?.attempts?.length;
    },TEST_USER,{timeout:15000});
    await phone.goto(url+'#/lesson/org-01');
    await phone.locator('[data-amine-answer="b02"]').fill('No puedo justificarlo todavía.');
    await phone.locator('[data-amine-reveal="b02"]').click();
    await phone.locator('[data-amine-assess="b02"][data-value="error"]').click();
    await phone.waitForFunction(id=>JSON.parse(localStorage.getItem('nexo-cloud-outbox-v12:'+id)||'[]').length===0,
      TEST_USER,{timeout:15000});
    const beforeDelta=sessionReads.length;
    await phone.evaluate(()=>window.NexoCloud.pull());
    assert.equal(sessionReads.length,beforeDelta+1,'pull delta consulta una página, no 520 sesiones');
    assert(JSON.parse(sessionReads.at(-1)).p_after_updated,'delta usa cursor del watermark');
    await phone.goto(url+'#/hub/timer');
    await phone.locator('[data-action="timer-start"]').click();
    await phone.waitForTimeout(1250);
    await phone.locator('[data-action="timer-finish"]').click();
    await phone.waitForFunction(()=>document.querySelector('#headerCoins')?.textContent==='135',null,{timeout:12000});
    await phone.reload();
    await phone.waitForFunction(()=>document.querySelector('#headerCoins')?.textContent==='135',null,{timeout:12000});
    await phone.goto(url+'#/shop');
    await phone.locator('[data-v13-preview="hat-beanie"]').click();
    await phone.locator('[data-v13-buy="hat-beanie"]').first().click();
    await phone.waitForFunction(()=>document.querySelector('#headerCoins')?.textContent==='35',null,{timeout:12000});
    await phone.reload();
    await phone.waitForFunction(()=>document.querySelector('#headerCoins')?.textContent==='35',null,{timeout:12000});
    assert(purchases.has('hat-beanie'));
    online=false;
    await phone.goto(url+'#/hub/calendar');
    await phone.locator('[data-calendar-new]').click();
    await phone.locator('[data-event-form] [name="title"]').fill('Evento sin red');
    await phone.locator('[data-event-form] button[type="submit"]').click();
    assert(await phone.evaluate(id=>JSON.parse(localStorage.getItem('nexo-cloud-outbox-v12:'+id)).length>0,TEST_USER));
    online=true;
    await phone.evaluate(()=>window.NexoCloud.sync());
    await phone.waitForFunction(id=>!JSON.parse(localStorage.getItem('nexo-cloud-outbox-v12:'+id)||'[]')
      .some(row=>row.table==='academic_events'),
      TEST_USER,{timeout:15000}).catch(async error=>{console.error('Pending after offline',await phone.evaluate(id=>({
        status:window.NexoCloud.statusInfo(),queue:JSON.parse(localStorage.getItem('nexo-cloud-outbox-v12:'+id)||'[]').slice(0,3)
      }),TEST_USER));throw error;});
    assert([...dbTable('academic_events').values()].some(row=>row.data.title==='Evento sin red'));
    // An independent timer edit on the other device may conflict; resolve it explicitly.
    await phone.evaluate(async()=>{
      for(const item of [...window.NexoCloud.conflicts])
        if(item.key==='user_documents:timer:current') await window.NexoCloud.resolveConflict(item.key,'cloud');
    });
    const eventId=[...dbTable('academic_events').values()].find(row=>row.data.title==='Evento sin red').event_id;
    await phone.goto(url+'#/hub/calendar');
    await phone.locator(`[data-calendar-delete="${eventId}"]`).first().click();
    await phone.waitForFunction(id=>JSON.parse(localStorage.getItem('nexo-cloud-outbox-v12:'+id)||'[]').length===0,
      TEST_USER,{timeout:15000});
    assert(dbTable('academic_events').get(eventId).data._deleted,'evento eliminado propaga tombstone');
    await page.goto(url+'#/profile/settings');
    await page.locator('[data-action="google-login"]').click();
    await page.waitForFunction(id=>window.NexoCloud?.authenticated &&
      localStorage.getItem('nexo-cloud-cache-v12:'+id),TEST_USER);
    await page.evaluate(()=>window.NexoCloud.pull());
    assert(await page.evaluate(id=>{
      const academic=JSON.parse(localStorage.getItem('nexo-cloud-cache-v12:'+id)).academicIntelligence;
      return academic.attempts.some(x=>x.exerciseId==='org-01:b02') &&
        academic.structuredErrors.some(x=>x.exerciseId==='org-01:b02') &&
        academic.evidence.some(x=>x.attemptId===academic.attempts.find(y=>y.exerciseId==='org-01:b02')?.id);
    },TEST_USER),'intento, error y evidencia del móvil llegan al PC');
    assert(await page.evaluate(([userId,id])=>!JSON.parse(localStorage.getItem('nexo-cloud-cache-v12:'+userId)).events.some(e=>e.id===id),[TEST_USER,eventId]),
      'segundo dispositivo no conserva evento zombi');
    balance=1500; // Test fixture grants balance server-side; client cannot mint it.
    await phone.evaluate(async()=>{
      for(const id of ['hat-scholar','shirt-barca','bag-lab','aura-resonance','scene-archive'])
        await window.NexoCloud.purchase(id);
    });
    await phone.goto(url+'#/profile/mascot');
    for(const [slot,id] of [['head','hat-scholar'],['shirt','shirt-barca'],['back','bag-lab'],
      ['aura','aura-resonance'],['background','scene-archive']]) {
      await phone.locator(`[data-v13-filter="${slot}"]`).click();
      await phone.locator(`[data-v13-equip="${id}"]`).first().click();
    }
    await phone.waitForFunction(id=>JSON.parse(localStorage.getItem('nexo-cloud-outbox-v12:'+id)||'[]').length===0,
      TEST_USER,{timeout:15000});
    const equipped=await phone.evaluate(id=>JSON.parse(localStorage.getItem('nexo-cloud-cache-v12:'+id)).mascot.slots,TEST_USER);
    assert.equal(equipped.head,'hat-scholar');assert.equal(equipped.shirt,'shirt-barca');
    assert.equal(equipped.back,'bag-lab');assert.equal(equipped.aura,'aura-resonance');
    assert.equal(equipped.background,'scene-archive');
    await page.evaluate(()=>window.NexoCloud.pull());
    assert(await page.evaluate(([id,expected])=>Object.entries(expected).every(([slot,item])=>
      JSON.parse(localStorage.getItem('nexo-cloud-cache-v12:'+id)).mascot.slots[slot]===item),
      [TEST_USER,equipped]),'avatar de cinco ranuras llega al otro dispositivo');
    for(let i=0;i<520;i++) dbTable('study_sessions').set('history-'+i,{
      session_id:'history-'+i,updated_at:new Date(Date.now()-(i+1)*60000).toISOString(),
      data:{id:'history-'+i,date:'2026-09-25',subject:'organica',mode:'Manual',seconds:60,source:'manual'}
    });
    const beforeHistory=sessionReads.length;
    await phone.evaluate(()=>window.NexoCloud.pull());
    assert.equal(sessionReads.length,beforeHistory+1,'delta sin cambios no recorre historial antiguo');
    await phone.goto(url+'#/history');
    await phone.locator('.academic-history-list li').first().waitFor();
    assert.equal(await phone.locator('.academic-history-list li').count(),30);
    await phone.locator('[data-history-page="next"]').click();
    await phone.waitForFunction(()=>document.querySelector('.academic-history .button-row span')?.textContent==='Página 2');
    await phone.locator('.academic-history-list li').first().waitFor();
    assert.deepEqual(errors,[]);
    console.log('OK E2E: Google OAuth simulado, invitado → cuenta → móvil, economía, offline, delta, tombstone y avatar multirranura.');
    await first.close(); await second.close();
  } finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1});
