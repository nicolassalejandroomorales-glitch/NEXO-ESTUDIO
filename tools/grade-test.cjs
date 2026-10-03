const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..','dist','planner','grades.js'),'utf8'),context);
const source={target:'4,00',groups:{theory:{name:'Teoría',minimum:'4',courseWeight:60},lab:{name:'Laboratorio',minimum:'4',courseWeight:40}},
  components:[
    {id:'p1',name:'PEP 1',group:'theory',weight:'30',grade:'5,50'},
    {id:'p2',name:'PEP 2',group:'theory',weight:'30',grade:''},
    {id:'p3',name:'PEP 3',group:'theory',weight:'25',grade:''},
    {id:'c',name:'Controles',group:'theory',weight:'15',grade:''},
    {id:'l',name:'Laboratorio',group:'lab',weight:'100',grade:''}
  ]};
const before=JSON.stringify(source),result=context.window.NexoGrades.calculate(source);
assert.equal(JSON.stringify(source),before,'El cálculo no debe cambiar las notas guardadas.');
assert.equal(result.totalWeight,100);
assert.equal(result.current,5.5);
assert.equal(result.pendingWeight,70);
assert.equal(Number(result.required.toFixed(4)),3.3571);
assert.equal(result.groupResults[0].current,5.5);
assert.equal(result.groupResults[0].grade,null);
assert.equal(result.groupResults[1].grade,null);
assert.equal(result.courseGrade,null);
const lab=context.window.NexoGrades.calculate(source,'lab');
assert.equal(lab.totalWeight,100);
assert.equal(lab.pendingWeight,100);
assert.equal(lab.required,4);
assert.equal(lab.current,null);
const complete=context.window.NexoGrades.calculate({...source,components:source.components.map(item=>({...item,grade:item.id==='l'?'4.00':'5.00'}))});
assert.equal(complete.groupResults[0].grade,5);
assert.equal(complete.groupResults[1].grade,4);
assert.equal(complete.courseGrade,4.6);
const invalid=context.window.NexoGrades.calculate({...source,components:[
  {...source.components[0],grade:'8.00'},...source.components.slice(1)]});
assert.equal(invalid.invalidGrades[0],'PEP 1');
assert.equal(invalid.pendingWeight,100);
assert.equal(invalid.current,null);
assert(Number.isFinite(invalid.required));
const badWeight=context.window.NexoGrades.calculate({...source,components:[
  {...source.components[0],weight:'120'},...source.components.slice(1)]});
assert.equal(badWeight.invalidWeights[0],'PEP 1');
assert.equal(badWeight.totalWeight,70);
const incomplete=context.window.NexoGrades.calculate({...source,components:source.components.filter(item=>item.id!=='c')});
assert.equal(incomplete.required,null,'No estimar nota necesaria si la ponderación no llega a 100%.');
console.log('Notas: ponderaciones, mínimo, pendientes, decimales e importaciones inválidas OK.');
