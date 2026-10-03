/* Org-01 training pilot. Reuses the academic engine and curated validators. */
(() => {
  'use strict';
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const cases=()=>window.NexoAcademicStructured.cases;
  const modes=[['recommended','Recomendado'],['errors','Mis errores'],['reviews','Revisiones'],
    ['topic','Tema'],['course','Curso completo'],['pep','Nivel evaluación/PEP']];
  const helps=[['normal','Normal'],['minimal','Mínima'],['none','Sin pistas']];
  const durations=[['10','10 min'],['20','20 min'],['40','40 min'],['until','Hasta que pare']];
  let session=null,context=null,finished=null,ticker=null,lastTick=0,lastInput=Date.now();
  const clock=ms=>{const seconds=Math.floor(Math.max(0,ms)/1000);
    return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;};
  const activity=()=>{lastInput=Date.now();};
  for(const name of ['pointerdown','keydown','scroll'])document.addEventListener(name,activity,{passive:true});
  document.addEventListener('visibilitychange',()=>{lastTick=Date.now();});
  function durationMs() {return session?.options.duration==='until'?Infinity:Number(session?.options.duration||0)*60000;}
  function tick() {
    if(!session)return;
    const now=Date.now(),dt=Math.max(0,Math.min(1500,now-lastTick));lastTick=now;
    if(!document.hidden&&now-lastInput<5*60000)session.elapsedMs+=dt;
    const limit=durationMs(),display=limit===Infinity?session.elapsedMs:Math.max(0,limit-session.elapsedMs);
    const output=document.querySelector('[data-training-clock]');if(output)output.textContent=clock(display);
  }
  function ensureTicker() {if(ticker||!session)return;lastTick=Date.now();
    ticker=setInterval(tick,1000);}
  function cleanup() {if(ticker)clearInterval(ticker);ticker=null;lastTick=0;}
  function order(state,options) {
    const all=cases();
    const evidence=state.academicIntelligence?.evidence||[];
    const errors=state.academicIntelligence?.structuredErrors||[];
    const reviews=window.NexoAcademicReviews.due(state.academicIntelligence?.reviewSchedules||[],new Date())
      .filter(item=>item.targetType==='concept');
    const matching=item=>window.NexoAcademicEngine.model.byId(window.NexoAcademicEngine.model.exercises,`org-01:${item.id}`);
    if(options.mode==='errors') {
      const ids=new Set(errors.filter(item=>item.status!=='resolved').map(item=>item.exerciseId));
      return all.filter(item=>ids.has(`org-01:${item.id}`));
    }
    if(options.mode==='reviews') {
      const ids=new Set(reviews.map(item=>item.targetId));
      return all.filter(item=>matching(item)?.conceptIds.some(id=>ids.has(id)));
    }
    if(options.mode==='topic')return all.filter(item=>matching(item)?.conceptIds.includes(options.topic));
    if(options.mode==='pep')return all.filter(item=>matching(item)?.examStyle);
    if(options.mode==='course')return [...all];
    return [...all].sort((a,b)=>{
      const score=item=>{
        const id=`org-01:${item.id}`;
        const entries=evidence.filter(row=>row.exerciseId===id);
        const open=errors.some(row=>row.exerciseId===id&&row.status!=='resolved');
        return (open?0:entries.some(row=>row.outcome==='correct'&&!row.assistanceUsed)?2:1);
      };
      return score(a)-score(b);
    });
  }
  function select(name,label,current,choices) {
    return `<label class="field"><span>${label}</span><select name="${name}" data-training-option>${choices.map(([value,label])=>
      `<option value="${esc(value)}" ${value===current?'selected':''}>${esc(label)}</option>`).join('')}</select></label>`;
  }
  function configure(state,mode) {
    const settings=state.settings.trainingPreferences||{},model=window.NexoAcademicEngine.model;
    const defaults={mode:'recommended',help:'normal',duration:'20',topic:'org.protonation'};
    const options={...defaults,...settings,...(['errors','pep'].includes(mode)?{mode}:{})};
    return `<section class="page arcane-training"><h1>Entrenar</h1><form class="training-setup" data-training-setup>
      ${select('mode','Modo',options.mode,modes)}${select('help','Ayuda',options.help,helps)}${select('duration','Duración',options.duration,durations)}
      <label class="field"><span>Tema</span><select name="topic">${model.concepts.map(item=>
        `<option value="${esc(item.id)}" ${options.topic===item.id?'selected':''}>${esc(item.title)}</option>`).join('')}</select></label>
      <p>Banco disponible en 1.0: Aminas, clase 1 de Orgánica II. Las demás clases conservan sus ejercicios actuales.</p>
      <button class="primary-btn" type="submit">Empezar</button></form></section>`;
  }
  function prompt(item,record={}) {
    const feedback=record.result;
    const options=session.options;
    const limit=durationMs(),remaining=limit===Infinity?session.elapsedMs:Math.max(0,limit-session.elapsedMs);
    return `<section class="page arcane-training"><div class="training-head"><div><p class="eyebrow">ORGÁNICA II · AMINAS</p><h1>Entrenar</h1><p>${esc(modes.find(([id])=>id===options.mode)?.[1])} · ${session.completed} intentados · <span data-training-clock>${clock(remaining)}</span></p></div><button class="secondary-btn" data-training-stop>Detener</button></div>
      <article class="training-problem"><h2>${esc(item.title)}</h2><p>${esc(item.prompt)}</p>
      ${feedback?'':`<form data-training-case="${esc(item.id)}"><div class="structured-fields">${item.fields.map(field=>
        `<label class="field"><span>${esc(field.label)}</span>${field.type==='number'?
          `<input name="${esc(field.key)}" type="text" inputmode="decimal" autocomplete="off" required>`:
          `<select name="${esc(field.key)}" required>${field.options.map(([value,label])=>
            `<option value="${esc(value)}">${esc(label)}</option>`).join('')}</select>`}</label>`).join('')}</div>
        <label class="field training-reason"><span>¿Por qué elegiste eso? (lo revisarás con la pauta)</span><textarea name="reason" rows="3" required minlength="20"></textarea></label>
        ${options.help==='none'?'':`<button type="button" class="secondary-btn" data-training-hint>Necesito una pista</button>`}
        ${session.hint?`<p class="training-hint">${esc(options.help==='minimal'?'Identifica primero el par, enlace o ácido que cambia.':item.fields[0].why)}</p>`:''}
        <button class="primary-btn" type="submit">Comprobar</button></form>`}
      ${feedback?`<div class="training-own-answer"><b>Tu razonamiento</b><p>${esc(record.reason)}</p></div>
        <div class="structured-feedback ${feedback.outcome}" role="status"><strong>${esc(feedback.what)}</strong>
        <p><b>Por qué:</b> ${esc(feedback.why)}</p><p><b>Ahora:</b> ${esc(feedback.next)}</p>
        <p>Compara esta pauta con tu explicación. La explicación escrita no fue calificada automáticamente.</p></div>
        <div class="button-row"><button class="primary-btn" data-training-next>Otro problema</button><button class="secondary-btn" data-training-stop>Terminar</button></div>`:''}
      </article></section>`;
  }
  function render(host,api,mode) {
    context=api;
    if(!session){host.innerHTML=finished?`<section class="page arcane-training"><h1>Sesión terminada</h1>
      <p>${finished.completed} problema${finished.completed===1?'':'s'} intentado${finished.completed===1?'':'s'}. Las respuestas quedaron en tu mapa de conocimiento.</p>
      <button class="primary-btn" data-training-reset>Entrenar otra vez</button></section>`:configure(api.getState(),mode);return;}
    if(session.elapsedMs>=durationMs()&&session.completed>0){stop();return render(host,api);}
    const item=session.queue[session.index%session.queue.length];
    window.NexoActiveStudy?.begin(window.NexoAcademicEngine.model.byId(window.NexoAcademicEngine.model.exercises,
      `org-01:${item.id}`)?.conceptIds[0]||'org.basicity','practice');
    host.innerHTML=prompt(item,session.record);
    ensureTicker();
  }
  function start(form) {
    const values=Object.fromEntries(new FormData(form).entries());
    const valid=(value,items,fallback)=>items.some(([id])=>id===value)?value:fallback;
    const options={mode:valid(values.mode,modes,'recommended'),help:valid(values.help,helps,'normal'),
      duration:valid(values.duration,durations,'20'),topic:window.NexoAcademicEngine.model.byId(
        window.NexoAcademicEngine.model.concepts,values.topic)?.id||'org.protonation'};
    const queue=order(context.getState(),options);
    if(!queue.length)return context.showToast('No hay casos pendientes para este filtro. Elige otro modo.');
    context.getState().settings.trainingPreferences=options;context.saveState();
    session={options,queue,index:0,completed:0,elapsedMs:0,hint:false,record:{},attempts:{}};
    finished=null;render(document.querySelector('#app'),context);
  }
  async function answer(form) {
    if(!session||session.record.result)return;
    const id=form.dataset.trainingCase,item=cases().find(row=>row.id===id);
    if(!item||item!==session.queue[session.index%session.queue.length])return;
    const values=Object.fromEntries(new FormData(form).entries());
    const result=window.NexoAcademicStructured.evaluate(id,values);
    if(result.kind==='incomplete')return;
    const count=(session.attempts[id]||0)+1;
    const attemptId=`training-${id}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    await window.NexoAcademicEngine.recordAttempt({getState:context.getState,saveState:context.saveState,
      track:context.track},{id:attemptId,exerciseId:`org-01:${id}`,structuredAnswers:values,
      reasoningText:values.reason,assistanceUsed:session.hint||count>1,attemptNumber:count,
      activityType:'practice',activityId:'org-01'});
    session.attempts[id]=count;session.record={result,reason:values.reason};session.completed+=1;
    render(document.querySelector('#app'),context);
  }
  function next() {if(!session||!session.record.result)return;
    session.index+=1;session.hint=false;session.record={};render(document.querySelector('#app'),context);}
  function hint() {if(!session||session.options.help==='none'||session.record.result)return;
    if(session.hint)return;
    session.hint=true;
    const button=document.querySelector('.training-problem [data-training-hint]');
    const item=session.queue[session.index%session.queue.length];
    button?.insertAdjacentHTML('afterend',`<p class="training-hint">${esc(session.options.help==='minimal'?
      'Identifica primero el par, enlace o ácido que cambia.':item.fields[0].why)}</p>`);
    if(button)button.disabled=true;
  }
  function stop() {if(!session)return;cleanup();window.NexoActiveStudy?.stop();
    finished={completed:session.completed};session=null;}
  function reset() {finished=null;render(document.querySelector('#app'),context);}
  window.NexoAcademicTraining=Object.freeze({render,start,answer,next,hint,stop,reset,cleanup,order});
})();
