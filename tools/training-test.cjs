const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const window={NexoAcademicStructured:{cases:[{id:'sv-protonation'},{id:'sv-heterocycle'},
  {id:'sv-pka'}]},NexoAcademicReviews:{due:()=>[{targetType:'concept',targetId:'org.pka'}]},
  NexoAcademicEngine:{model:{exercises:[
    {id:'org-01:sv-protonation',conceptIds:['org.protonation'],examStyle:false},
    {id:'org-01:sv-heterocycle',conceptIds:['org.aromatic-pair'],examStyle:false},
    {id:'org-01:sv-pka',conceptIds:['org.pka'],examStyle:true}],
    byId:(list,id)=>list.find(item=>item.id===id)}}};
vm.runInNewContext(fs.readFileSync('dist/academic/training.js','utf8'),
  {window,Date,document:{addEventListener(){}}});
const training=window.NexoAcademicTraining;
const state={academicIntelligence:{evidence:[],structuredErrors:[
  {exerciseId:'org-01:sv-heterocycle',status:'pending'}],reviewSchedules:[]}};
const ids=options=>training.order(state,options).map(item=>item.id);
assert.deepEqual(ids({mode:'errors'}),['sv-heterocycle']);
assert.deepEqual(ids({mode:'reviews'}),['sv-pka']);
assert.deepEqual(ids({mode:'topic',topic:'org.protonation'}),['sv-protonation']);
assert.deepEqual(ids({mode:'pep'}),['sv-pka']);
assert.equal(ids({mode:'recommended'})[0],'sv-heterocycle');
console.log('OK: modos de entrenamiento usan errores, revisiones, tema y evaluación sin inventar banco.');
