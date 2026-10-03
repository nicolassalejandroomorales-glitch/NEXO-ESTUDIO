const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const host={innerHTML:''};
const state={organicProgress:{'org-01':{}},academicIntelligence:{}};
const window={NexoAcademicEngine:{diagnoses:()=>[{conceptId:'org.lone-pair',status:'confirmed'}]},
  NexoAcademicStructured:{byId:id=>({id,title:'Caso',prompt:'Pregunta',fields:[
    {key:'site',label:'Sitio',options:[['','Seleccionar'],['N','Nitrógeno']],answer:'N'}]})},
  NexoActiveStudy:{begin(){}}};
const document={querySelector:()=>host};
vm.runInNewContext(fs.readFileSync('dist/academic/rescue.js','utf8'),{window,document,Date});
const api={getState:()=>state,saveState(){}};
window.NexoAcademicRescue.render(host,api,'org.lone-pair');
assert(host.innerHTML.includes('La misma flecha'));
assert(host.innerHTML.includes('no otorga dominio inmediato'));
window.NexoAcademicRescue.next();
assert(host.innerHTML.includes('Ejemplo resuelto'));
window.NexoAcademicRescue.next();
assert(host.innerHTML.includes('data-rescue-case="sv-pep-hetero"'));
window.NexoAcademicRescue.next();
assert.equal(state.organicProgress['org-01'].rescue['org.lone-pair'].stage,2);
window.NexoAcademicEngine.diagnoses=()=>[{conceptId:'org.lone-pair',status:'possible'}];
window.NexoAcademicRescue.render(host,api,'org.lone-pair');
assert(host.innerHTML.includes('Rescate no activado'));
console.log('OK: Rescate requiere confirmación, enseña contraste y bloquea avance sin intento correcto.');
