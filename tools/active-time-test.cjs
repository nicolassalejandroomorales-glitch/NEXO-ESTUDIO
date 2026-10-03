const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const state={academicIntelligence:{activeTimeSegments:[]}};
let saves=0,hidden=false,clears=0;
const document={get hidden(){return hidden;},addEventListener(){}};
const window={addEventListener(){},removeEventListener(){}};
vm.runInNewContext(fs.readFileSync('dist/academic/active-time.js','utf8'),{
  window,document,setInterval:()=>1,clearInterval:()=>{clears+=1;},Date,Math
});
const timer=window.NexoActiveStudy;
timer.configure({getState:()=>state,saveState:()=>{saves+=1;}});
timer.begin('org.basicity','lesson');
const start=Date.now();
assert.ok(timer.tick(start+5000)>=4);
hidden=true;
assert.equal(timer.tick(start+10000),0);
hidden=false;
assert.equal(timer.tick(start+timer.IDLE_AFTER_MS+20000),0);
timer.stop();
assert.equal(state.academicIntelligence.activeTimeSegments.length,1);
assert.ok(state.academicIntelligence.activeTimeSegments[0].seconds>=4);
assert.ok(saves>=1&&clears>=1);
timer.begin('org.basicity','home');
assert.equal(timer.snapshot('org.basicity'),state.academicIntelligence.activeTimeSegments[0].seconds);
console.log('Tiempo académico: visible, inactividad, ruta no académica y persistencia OK');
