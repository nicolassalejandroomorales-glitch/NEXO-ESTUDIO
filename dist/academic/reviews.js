/* FSRS controls when to return, not whether a concept is mastered. */
(() => {
  'use strict';
  let loading=null,scheduler=null;
  async function library() {
    if(!loading)loading=window.NexoLoader.script('./vendor/fsrs/index.umd.js').then(()=>{
      if(!window.FSRS?.fsrs)throw new Error('fsrs_unavailable');
      scheduler=window.FSRS.fsrs();return window.FSRS;
    }).catch(error=>{loading=null;throw error;});
    return loading;
  }
  function hydrate(card) {
    if(!card)return null;
    const out={...card};
    for(const key of ['due','last_review'])if(out[key])out[key]=new Date(out[key]);
    return out;
  }
  async function schedule(prior,targetId,targetType,attempt,{now=new Date()}={}) {
    if(prior?.lastAttemptId===attempt.id)return prior;
    if(!['concept','family'].includes(targetType))throw new Error('invalid_review_target');
    const engine=await library();
    const rating=attempt.outcome==='incorrect'?engine.Rating.Again:
      attempt.assistanceUsed?engine.Rating.Hard:engine.Rating.Good;
    const card=hydrate(prior?.card)||engine.createEmptyCard(now);
    const result=scheduler.next(card,now,rating);
    return {id:`${targetType}:${targetId}`,targetId,targetType,dueAt:result.card.due.toISOString(),
      card:result.card,lastAttemptId:attempt.id,updatedAt:now.toISOString(),scheduler:'ts-fsrs@5.4.2'};
  }
  function due(records,now=new Date(),legacy={}) {
    const current=records.filter(item=>item?.dueAt&&new Date(item.dueAt)<=now)
      .sort((a,b)=>new Date(a.dueAt)-new Date(b.dueAt));
    // Existing lesson-level dates are displayed without generating concept cards.
    const legacyDue=value=>/^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(value+'T00:00:00')<=now:new Date(value)<=now;
    const old=Object.entries(legacy).filter(([,item])=>item?.dueAt&&
      legacyDue(item.dueAt)&&item.status!=='dominado')
      .map(([id,item])=>({id:`legacy:${id}`,targetId:id,targetType:'lesson',dueAt:item.dueAt,legacy:true}));
    return [...current,...old].sort((a,b)=>new Date(a.dueAt)-new Date(b.dueAt));
  }
  window.NexoAcademicReviews={schedule,due,load:library};
})();
