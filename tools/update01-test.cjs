const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const window={};
const ctx=vm.createContext({window});
vm.runInContext(fs.readFileSync('dist/data.js','utf8')+';window.data=NEXO_DATA;',ctx);
vm.runInContext(fs.readFileSync('dist/design-system/preparation.js','utf8'),ctx);
vm.runInContext(fs.readFileSync('dist/platform/animation.js','utf8'),ctx);
const {evaluations,layout}=window.NexoPreparation;
const course=window.data.subjects[0];
const events=[{id:'p1',subject:course.id,type:'exam',title:'PEP 1',date:'2026-10-27'},
 {id:'c1',subject:course.id,type:'exam',title:'Control 1',date:'2026-10-19'},
 {id:'other',subject:'fisico',type:'exam',title:'PEP 1',date:'2026-10-21'},
 {id:'ambiguous',subject:course.id,type:'exam',title:'Repaso PEP 1',date:'2026-10-20'},
 {id:'lab',subject:course.id,type:'lab',title:'PEP 1',date:'2026-10-20'}];
const before=JSON.stringify({course,events});
const result=evaluations(course,events);
assert.equal(result.length,5);
assert.deepEqual(Array.from(result[0].events,event=>event.id),['p1']);
assert.equal(result.find(item=>item.id==='event-c1').lessons.length,0);
assert.equal(result.find(item=>item.id==='event-ambiguous').lessons.length,0);
assert.equal(result.some(item=>item.id==='event-lab'||item.id==='event-other'),false);
assert.equal(JSON.stringify({course,events}),before,'proyección no escribe datos');
for(const subject of window.data.subjects){
 const chapters=evaluations(subject,[]);
 assert.equal(chapters.length,subject.peps.length);
 for(const chapter of chapters) assert.ok(chapter.lessons.every(id=>window.data.lessons[id]));
}
assert.equal(evaluations(window.data.subjects.find(item=>item.id==='fisio'),[])[1].kind,'Bloque del catálogo');
assert.equal(layout(0).length,0);
assert.equal(new Set(layout(9).map(point=>point.x)).size>2,true,'sendero no es lista recta');
const transition=window.NexoAnimation.transitionFor;
assert.equal(transition('home','learn',false).kind,'book-first');
assert.equal(transition('home','learn',true).kind,'book-return');
assert.ok(transition('home','learn',true).duration<transition('home','learn',false).duration);
assert.equal(transition('learn/course/organica','home',true).kind,'book-close');
assert.equal(transition('learn/course/organica','learn/course/fisio',true).kind,'page-turn');
assert.equal(transition('learn/course/organica','learn/course/organica',true).duration,0);
assert.equal(transition('home','train',true).duration,0);
console.log('UPDATE01: catálogo y eventos sin mutación; controles sin temario inventado; cuatro ramos; sendero; primera/reapertura/cierre/página OK');
