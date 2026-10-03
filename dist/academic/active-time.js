/* Counts visible, non-idle academic activity by concept; never counts Home or the timer UI. */
(() => {
  'use strict';
  const IDLE_AFTER_MS=5*60*1000;
  const TICK_MS=10000;
  let context=null,session=null,interval=null,lastInput=Date.now(),lastTick=Date.now(),tickCount=0,configured=false,scrollHandler=null,focusPromise=null;
  const day=at=>{const d=new Date(at);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
  function openFocus() {
    if(!session||document.hidden||focusPromise||!context?.startCloudFocus)return;
    focusPromise=Promise.resolve(context.startCloudFocus(session.conceptId)).catch(()=>null);
  }
  function closeFocus() {
    const prior=focusPromise;focusPromise=null;
    if(prior&&context?.finishCloudFocus)prior.then(id=>id&&context.finishCloudFocus(id)).catch(()=>{});
  }
  const interact=()=>{lastInput=Date.now();if(session&&!document.hidden)openFocus();};
  function configure(api) {
    context=api;
    if(configured)return;
    configured=true;
    for(const event of ['pointerdown','keydown','scroll'])document.addEventListener(event,interact,{passive:true});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){persist();closeFocus();}
      else {lastTick=Date.now();lastInput=Date.now();openFocus();}});
  }
  function tick(at=Date.now()) {
    if(!session)return 0;
    const elapsed=Math.max(0,Math.min(TICK_MS,at-lastTick));
    lastTick=at;
    if(document.hidden||at-lastInput>IDLE_AFTER_MS||!session.conceptId){closeFocus();return 0;}
    session.seconds+=elapsed/1000;
    session.updatedAt=new Date(at).toISOString();
    return elapsed/1000;
  }
  function persist() {
    if(!session||!context||session.seconds<1)return;
    const state=context.getState();
    const academic=state.academicIntelligence;
    academic.activeTimeSegments ||= [];
    const existing=academic.activeTimeSegments.findIndex(item=>item.id===session.id);
    const record={...session,seconds:Math.round(session.seconds)};
    if(existing<0)academic.activeTimeSegments.push(record);
    else academic.activeTimeSegments[existing]=record;
    context.saveState({backup:false});
  }
  function stop() {
    if(interval)clearInterval(interval);
    interval=null;
    if(scrollHandler)window.removeEventListener('scroll',scrollHandler);
    scrollHandler=null;
    tick();persist();closeFocus();session=null;
  }
  function changeConcept(conceptId) {
    if(!session||session.conceptId===conceptId)return;
    tick();persist();closeFocus();
    const now=Date.now();
    session={id:`active-${now}-${Math.random().toString(36).slice(2,9)}`,conceptId,activity:session.activity,
      day:day(now),startedAt:new Date(now).toISOString(),updatedAt:new Date(now).toISOString(),seconds:0};
    lastTick=now;tickCount=0;openFocus();
  }
  function begin(conceptId,activity) {
    if(session?.conceptId===conceptId&&session.activity===activity)return;
    stop();
    if(!conceptId||!['lesson','practice','review','rescue','assessment','material'].includes(activity))return;
    const now=Date.now();
    session={id:`active-${now}-${Math.random().toString(36).slice(2,9)}`,conceptId,activity,
      day:day(now),startedAt:new Date(now).toISOString(),updatedAt:new Date(now).toISOString(),seconds:0};
    lastInput=lastTick=now;
    tickCount=0;
    openFocus();
    interval=setInterval(()=>{const seconds=tick();if(++tickCount%3===0){persist();
      if(seconds>0&&focusPromise&&context?.pingCloudFocus)focusPromise.then(id=>id&&context.pingCloudFocus(id)).catch(()=>{});
    }},TICK_MS);
  }
  function snapshot(conceptId) {
    const segments=context?.getState()?.academicIntelligence?.activeTimeSegments||[];
    const seconds=segments.filter(item=>item.conceptId===conceptId).reduce((sum,item)=>sum+Number(item.seconds||0),0);
    return seconds+(session?.conceptId===conceptId?Math.max(0,session.seconds-(segments.find(item=>item.id===session.id)?.seconds||0)):0);
  }
  function watchHeadings(root) {
    if(scrollHandler)window.removeEventListener('scroll',scrollHandler);
    const headings=[...root.querySelectorAll('h2[data-study-concept]')];
    if(!headings.length)return;
    scrollHandler=()=>{
      const threshold=Math.min(innerHeight*.45,330);
      let selected=headings[0];
      for(const heading of headings)if(heading.getBoundingClientRect().top<=threshold)selected=heading;
      changeConcept(selected.dataset.studyConcept);
    };
    window.addEventListener('scroll',scrollHandler,{passive:true});
    scrollHandler();
  }
  window.NexoActiveStudy=Object.freeze({configure,begin,stop,changeConcept,watchHeadings,tick,snapshot,IDLE_AFTER_MS});
})();
