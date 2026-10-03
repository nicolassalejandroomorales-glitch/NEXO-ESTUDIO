/* Grade arithmetic. Percentages belong to each academic component, not to the whole course. */
(() => {
  'use strict';
  const decimal=value=>Number(String(value??'').trim().replace(',','.'));
  function calculate(config={},activeGroup='theory') {
    const invalidWeights=[],invalidGrades=[],components=[];
    for(const item of config.components||[]) {
      const rawWeight=String(item.weight??'').trim();
      const weightN=decimal(rawWeight);
      if(rawWeight&&(!Number.isFinite(weightN)||weightN<0||weightN>100)){
        invalidWeights.push(item.name||item.id);continue;
      }
      if(!rawWeight||weightN<=0)continue;
      const raw=String(item.grade??'').trim();
      const number=decimal(raw);
      const gradeN=raw&&Number.isFinite(number)&&number>=1&&number<=7?number:null;
      if(raw&&gradeN===null)invalidGrades.push(item.name||item.id);
      components.push({...item,weightN,gradeN});
    }
    const target=Math.max(4,Math.min(7,decimal(config.target)||4));
    const groupResults=Object.entries(config.groups||{}).map(([id,group])=>{
      const rows=components.filter(item=>item.group===id);
      const totalWeight=rows.reduce((sum,item)=>sum+item.weightN,0);
      const known=rows.filter(item=>item.gradeN!==null);
      const knownWeight=known.reduce((sum,item)=>sum+item.weightN,0);
      const knownPoints=known.reduce((sum,item)=>sum+item.weightN*item.gradeN,0);
      const pendingWeight=totalWeight-knownWeight;
      const minimum=decimal(group.minimum);
      const rawCourseWeight=String(group.courseWeight??'').trim();
      const courseWeight=rawCourseWeight?decimal(rawCourseWeight):null;
      return {id,name:group.name||id,totalWeight,knownWeight,pendingWeight,
        current:knownWeight?knownPoints/knownWeight:null,
        grade:Math.abs(totalWeight-100)<.01&&pendingWeight===0?knownPoints/100:null,
        required:Math.abs(totalWeight-100)<.01&&pendingWeight>0?(target*100-knownPoints)/pendingWeight:null,
        minimum:Number.isFinite(minimum)&&minimum>0?minimum:null,
        courseWeight:courseWeight!==null&&Number.isFinite(courseWeight)&&courseWeight>=0&&courseWeight<=100?courseWeight:null,
        invalidCourseWeight:!!rawCourseWeight&&(!Number.isFinite(courseWeight)||courseWeight<0||courseWeight>100)};
    });
    const active=groupResults.find(group=>group.id===activeGroup)||groupResults[0]||{
      totalWeight:0,knownWeight:0,pendingWeight:0,current:null,grade:null,required:null};
    const configured=groupResults.filter(group=>group.courseWeight!==null);
    const courseWeightTotal=configured.reduce((sum,group)=>sum+group.courseWeight,0);
    const courseGrade=configured.length===groupResults.length&&Math.abs(courseWeightTotal-100)<.01&&
      groupResults.every(group=>group.grade!==null)?
      groupResults.reduce((sum,group)=>sum+group.grade*group.courseWeight,0)/100:null;
    return {components,totalWeight:active.totalWeight,current:active.current,
      projected:active.grade,pendingWeight:active.pendingWeight,required:active.required,
      groupResults,courseWeightTotal,courseGrade,invalidWeights,invalidGrades};
  }
  window.NexoGrades=Object.freeze({calculate});
})();
