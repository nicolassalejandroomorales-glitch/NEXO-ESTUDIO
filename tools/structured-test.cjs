const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const window={};
vm.runInNewContext(fs.readFileSync('dist/academic/structured.js','utf8'),{window});
const checker=window.NexoAcademicStructured;
assert.equal(checker.cases.length,7);
for(const item of checker.cases){
  const answers=Object.fromEntries(item.fields.map(field=>[field.key,String(field.answer)]));
  const complete=checker.evaluate(item.id,answers);
  assert.equal(complete.outcome,'correct',item.id);
  assert.equal(complete.correct,item.fields.length,item.id);
  assert.equal(checker.evaluate(item.id,{}).outcome,'incorrect',item.id);
  const wrong={...answers,[item.fields[0].key]:''};
  assert.equal(checker.evaluate(item.id,wrong).firstWrong,item.fields[0].key);
}
assert.equal(checker.evaluate('sv-pka',{logA:'2,3',logB:'-1,4',favored:'A'}).outcome,'correct');
assert.equal(checker.evaluate('sv-pka',{logA:'-2,3',logB:'1,4',favored:'B'}).outcome,'incorrect');
assert.equal(checker.evaluate('sv-induction',{stronger:'ethyl',path:'pi',distance:'weaker'}).misconceptionId,'org.induction-is-resonance');
assert.equal(checker.evaluate('sv-protonation',{bonds:'4',charge:'0',chloride:'counterion'}).kind,'conceptual');
assert.equal(checker.evaluate('sv-protonation',{bonds:'4',charge:'',chloride:'counterion'}).kind,'incomplete');
assert.throws(()=>checker.evaluate('no-such-case',{}),/unknown_structured_case/);
const rendered=checker.render({organicProgress:{'org-01':{structured:{}}}});
assert(rendered.includes('data-structured-case="sv-protonation"'));
assert(rendered.includes('type="submit"'));
console.log('OK: 7 casos estructurados, errores por primer eslabón, decimales y formulario.');
