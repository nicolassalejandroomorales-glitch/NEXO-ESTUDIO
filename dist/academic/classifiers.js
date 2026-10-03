/* Only structured, explicit evidence can name a misconception. */
(() => {
  'use strict';
  function classifyMultipleChoice(exercise,optionId) {
    const option=exercise.options?.find(item=>item.id===optionId);
    if(!option)return {outcome:'ungraded',misconceptionId:null};
    return {outcome:option.correct?'correct':'incorrect',
      misconceptionId:option.correct?null:option.misconceptionId||null};
  }
  function classifyNumeric(exercise,value) {
    if(!Number.isFinite(Number(value)))return {outcome:'ungraded',misconceptionId:null};
    const result=Number(value),tolerance=exercise.tolerance??1e-6;
    if(Math.abs(result-exercise.expected)<=tolerance)return {outcome:'correct',misconceptionId:null};
    const pattern=exercise.errorPatterns?.find(item=>Math.abs(result-item.value)<=tolerance);
    return {outcome:'incorrect',misconceptionId:pattern?.misconceptionId||null};
  }
  function classifyText() {return {outcome:'self_assessment_required',misconceptionId:null};}
  function classifyStructure(rubric,observed) {
    // RDKit adapter may supply validated fields; missing/unknown fields remain ungraded.
    if(!observed||!rubric)return {outcome:'ungraded',differences:[]};
    const fields=['connectivity','charge','bondOrder','functionalGroup','regiochemistry',
      'stereochemistry','protonationSite'];
    const differences=fields.filter(key=>rubric[key]!==undefined&&observed[key]!==undefined&&
      rubric[key]!==observed[key]);
    return {outcome:differences.length?'incorrect':'ungraded',differences};
  }
  window.NexoAcademicClassifiers={classifyMultipleChoice,classifyNumeric,classifyText,classifyStructure};
})();
