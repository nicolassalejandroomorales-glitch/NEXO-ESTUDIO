/* Authoring checks; the UI is gated to an explicit development query parameter. */
(() => {
  'use strict';
  function inspect(model) {
    const issues=[];
    const unique=(items,type)=>{
      const seen=new Set();
      for(const item of items||[]) {
        if(!item.id||seen.has(item.id))issues.push({code:'duplicate_id',type,id:item.id||''});
        seen.add(item.id);
        if(!Number.isInteger(item.version)||item.version<1)
          issues.push({code:'missing_version',type,id:item.id||''});
      }
      return seen;
    };
    const concepts=unique(model.concepts,'concept'),families=unique(model.families,'family');
    const skills=unique(model.skills,'skill'),sources=unique(model.sources,'source');
    unique(model.exercises,'exercise');unique(model.misconceptions,'misconception');
    for(const edge of model.prerequisites||[])
      if(!concepts.has(edge.from)||!concepts.has(edge.to)||!['required','recommended'].includes(edge.strength))
        issues.push({code:'dangling_prerequisite',type:'edge',id:`${edge.from}->${edge.to}`});
    try {window.NexoPrerequisites.create(model.concepts,model.prerequisites);}
    catch(error) {if(/cycle/.test(error.message))issues.push({code:'prerequisite_cycle',type:'graph',id:''});}
    for(const family of model.families||[]) {
      if(!model.exercises.some(item=>item.familyId===family.id))
        issues.push({code:'family_without_exercise',type:'family',id:family.id});
      for(const id of family.conceptIds||[])if(!concepts.has(id))
        issues.push({code:'dangling_concept',type:'family',id:family.id+':'+id});
      for(const id of family.skillIds||[])if(!skills.has(id))
        issues.push({code:'dangling_skill',type:'family',id:family.id+':'+id});
    }
    for(const exercise of model.exercises||[]) {
      if(!families.has(exercise.familyId))
        issues.push({code:'exercise_without_family',type:'exercise',id:exercise.id});
      for(const id of exercise.conceptIds||[])if(!concepts.has(id))
        issues.push({code:'dangling_concept',type:'exercise',id:exercise.id+':'+id});
    }
    for(const item of model.misconceptions||[])if(!item.feedback?.trim())
      issues.push({code:'misconception_without_feedback',type:'misconception',id:item.id});
    for(const link of model.conceptSources||[])
      if(!concepts.has(link.conceptId)||!sources.has(link.sourceId))
        issues.push({code:'missing_source',type:'link',id:link.conceptId+':'+link.sourceId});
    for(const item of model.concepts||[])
      if(!model.conceptSources.some(link=>link.conceptId===item.id&&sources.has(link.sourceId)))
        issues.push({code:'concept_without_source',type:'concept',id:item.id});
    return issues;
  }
  function render(host) {
    if(!new URLSearchParams(location.search).has('nexoDev')) {
      host.innerHTML='<section class="page"><h1>Vista de desarrollo desactivada</h1><a href="#/subjects">Ramos</a></section>';return;
    }
    const model=window.NexoAcademicModel,issues=inspect(model);
    const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    host.innerHTML=`<section class="page academic-inspector"><button data-route="knowledge" class="back-btn">← Mapa</button>
      <h1>Inspector académico · desarrollo</h1><p>${model.concepts.length} conceptos ·
      ${model.families.length} familias · ${model.exercises.length} ejercicios · ${issues.length} avisos</p>
      <ul>${issues.map(item=>`<li><code>${esc(item.code)}</code> · ${esc(item.type)} · ${esc(item.id)}</li>`).join('')||'<li>Sin avisos.</li>'}</ul></section>`;
  }
  window.NexoAcademicInspector={inspect,render};
})();
