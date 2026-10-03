// Revisa los datos de las clases nuevas (dist/classes) y los caminos del reproductor, sin navegador.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert');
const dir = path.join(__dirname, '..', 'dist', 'classes');
const context = { window: {} }; vm.createContext(context);
for (const file of ['catalog.js', 'player.js']) vm.runInContext(fs.readFileSync(path.join(dir, file), 'utf8'), context, { filename: file });
const catalog = context.window.NexoClassCatalog;
let items = 0;
for (const [id, file] of Object.entries(catalog)) {
  vm.runInContext(fs.readFileSync(path.join(dir, file), 'utf8'), context, { filename: file });
  const cls = context.window.NexoClasses[id];
  assert.ok(cls && cls.id === id, `${id}: la clase no se registró`);
  const ids = new Set();
  for (const m of cls.missions) {
    const blocks = new Set((m.stages.explain || []).map(b => b.id));
    for (const stage of ['diagnostic', 'practice', 'challenge', 'transfer']) for (const item of m.stages[stage] || []) {
      items += 1;
      assert.ok(!ids.has(item.id), `${item.id}: id repetido`); ids.add(item.id);
      assert.equal(item.options.filter(o => o.correct).length, 1, `${item.id}: debe tener exactamente una correcta`);
      assert.ok(item.explain && item.slide, `${item.id}: falta explicación o diapositiva`);
      assert.ok(cls.sources[item.source], `${item.id}: fuente inexistente`);
      if (stage === 'practice' || stage === 'challenge') assert.ok(item.hint, `${item.id}: la práctica necesita pista`);
      for (const o of item.options) if (o.misconception) {
        const mc = cls.misconceptions[o.misconception];
        assert.ok(mc && mc.label && mc.why, `${item.id}: error "${o.misconception}" sin explicación`);
        if (mc.prereq) assert.ok(cls.missions.find(x => x.id === mc.prereq.mission)?.stages.explain.some(b => b.id === mc.prereq.block), `${o.misconception}: repaso apunta a un bloque inexistente`);
      }
    }
    assert.ok(blocks.size, `${m.id}: sin explicación`);
  }
  const plan = s => context.window.NexoClassroom.plan(cls, { skipExplain: {}, ...s }).map(st => st.stage).join(',');
  assert.equal(plan({ path: 'misiones', mission: cls.missions[0].id }), 'diagnostic,explain,worked,practice,rescue,transfer,close');
  assert.ok(plan({ path: 'expedicion' }).endsWith('close') && plan({ path: 'expedicion' }).includes('challenge') === cls.missions.some(m => (m.stages.challenge || []).length));
  assert.ok(plan({ path: 'prueba' }).startsWith('diagnostic') && !plan({ path: 'prueba' }).includes('explain'), 'Prueba encima no debe pasar por Explicar');
  assert.equal(plan({ path: 'misiones', mission: cls.missions[0].id, skipExplain: { [cls.missions[0].id]: true } }), 'diagnostic,practice,rescue,transfer,close');
}
console.log(`Aula: ${Object.keys(catalog).length} clase(s), ${items} preguntas con una correcta, errores con explicación y repaso; caminos OK.`);
