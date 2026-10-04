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
  const kinds = st => context.window.NexoClassroom.beats(cls, { answers: {}, hints: {}, retries: {}, revealed: {}, skipExplain: {}, ...st }).map(b => b.kind);
  const m1 = cls.missions[0];
  const mis = kinds({ path: 'misiones', mission: m1.id });
  assert.equal(mis[0], 'path'); assert.equal(mis.at(-1), 'close');
  assert.ok(mis.includes('lesson') && mis.includes('step') && mis.includes('question'), 'Misiones debe tener lección, experimento y preguntas');
  assert.ok(!mis.includes('rescue'), 'Sin errores no hay rescate');
  const wrongId = m1.stages.diagnostic[0].id, wrongChoice = m1.stages.diagnostic[0].options.findIndex(o => !o.correct);
  assert.ok(kinds({ path: 'misiones', mission: m1.id, answers: { [wrongId]: { choice: wrongChoice, correct: false } } }).includes('rescue'), 'Un error debe abrir el rescate');
  const allRight = Object.fromEntries(m1.stages.diagnostic.map(i => [i.id, { choice: i.options.findIndex(o => o.correct), correct: true }]));
  assert.ok(kinds({ path: 'misiones', mission: m1.id, answers: allRight }).includes('offer'), 'Diagnóstico perfecto ofrece saltar la lección');
  assert.ok(!kinds({ path: 'misiones', mission: m1.id, answers: allRight, skipExplain: { [m1.id]: true } }).includes('lesson'), 'Saltar la lección la quita');
  assert.ok(!kinds({ path: 'prueba' }).includes('lesson'), 'Prueba encima no pasa por la lección');
  const lessons = context.window.NexoClassroom.beats(cls, { path: 'misiones', mission: m1.id, answers: {}, hints: {}, retries: {}, revealed: {}, skipExplain: {} }).filter(b => b.kind === 'lesson');
  assert.ok(lessons.some(b => b.zero) && lessons.findIndex(b => b.zero) < lessons.findIndex(b => !b.zero), 'Las bases desde cero van antes de la materia');
  for (const blk of [...(m1.stages.fundamentals || []), ...m1.stages.explain]) assert.ok(blk.body && blk.title, `${blk.id}: bloque sin texto`);
  for (const [term, def] of cls.glossary || []) assert.ok(term && def, 'glosario incompleto');
  for (const b of m1.stages.explain) if (b.slide) assert.ok(cls.slides?.[b.slide] || cls.slideImages?.[b.slide], `${b.id}: la diapositiva ${b.slide} no tiene texto ni imagen`);
}
console.log(`Aula: ${Object.keys(catalog).length} clase(s), ${items} preguntas con una correcta, errores con explicación y repaso; momentos y caminos OK.`);
