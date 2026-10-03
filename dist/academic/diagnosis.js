/* Pattern-based suspicion, never a diagnosis from one wrong answer. */
(() => {
  'use strict';
  function diagnose(attempts,model,graph,{minFamilies=2}={}) {
    const failures=attempts.filter(x=>x.outcome==='incorrect'&&!x.assistanceUsed&&x.familyId);
    const byPrerequisite=new Map();
    for(const attempt of failures) {
      const family=model.byId(model.families,attempt.familyId);if(!family)continue;
      for(const conceptId of family.conceptIds)for(const id of graph.ancestors(conceptId,'required')) {
        if(!byPrerequisite.has(id))byPrerequisite.set(id,new Set());
        byPrerequisite.get(id).add(family.id);
      }
    }
    return [...byPrerequisite].filter(([,families])=>families.size>=minFamilies).map(([conceptId,families])=>({
      conceptId,status:'possible',familyIds:[...families],reason:`Has fallado ${families.size} familias distintas que dependen de ${model.byId(model.concepts,conceptId)?.title||conceptId}. Comprueba este prerequisito.`
    }));
  }
  function resolve(suspicion,diagnosticAttempts) {
    const latest=new Map();
    for(const attempt of diagnosticAttempts.filter(x=>x.conceptIds?.includes(suspicion.conceptId)&&
      x.diagnostic===true&&x.validationStatus==='verified'&&!x.assistanceUsed))
      if(!latest.has(attempt.familyId)||new Date(latest.get(attempt.familyId).attemptedAt)<new Date(attempt.attemptedAt))
        latest.set(attempt.familyId,attempt);
    const relevant=[...latest.values()];
    if(!relevant.length)return {...suspicion,status:'possible'};
    if(relevant.length<2)return {...suspicion,status:'possible'};
    const incorrect=relevant.filter(x=>x.outcome==='incorrect');
    return {...suspicion,status:incorrect.length>=2?'confirmed':incorrect.length?'possible':'not_confirmed',
      diagnosticAttemptIds:relevant.map(x=>x.id)};
  }
  window.NexoAcademicDiagnosis={diagnose,resolve};
})();
