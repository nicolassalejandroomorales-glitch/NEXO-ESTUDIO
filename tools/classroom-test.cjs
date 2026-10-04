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
      const type = item.type || 'choice';
      if (type === 'choice') assert.equal(item.options.filter(o => o.correct).length, 1, `${item.id}: debe tener exactamente una correcta`);
      if (type === 'order') { assert.equal(item.answer.length, item.cards.length, `${item.id}: el orden debe usar todas las tarjetas`); for (const cid of item.answer) assert.ok(item.cards.some(c => c.id === cid), `${item.id}: tarjeta ${cid} no existe`); }
      if (type === 'classify') for (const c of item.cards) assert.ok(item.buckets.some(bk => bk.id === c.bucket), `${item.id}: ${c.id} sin caldero válido`);
      if (type === 'match') assert.ok(item.pairs.length >= 2 && item.pairs.every(p => p.left && p.right), `${item.id}: pares incompletos`);
      if (type === 'write') assert.ok(item.model && item.model.length >= 40 && item.rubric?.length >= 2 && item.rubric.every(Boolean), `${item.id}: la escrita necesita respuesta modelo y al menos 2 ideas en la pauta`);
      if (cls.concepts) assert.ok(cls.concepts.some(c => c.id === item.concept), `${item.id}: sin concepto (hoja del árbol) válido`);
      if (type === 'pick') { assert.ok(item.targets[item.answer], `${item.id}: respuesta sin objetivo`); assert.ok(item.molecules.flat().some(p => p.target === item.answer), `${item.id}: la respuesta no se puede tocar`); }
      const NX = context.window.NexoClassroom;
      const solution = type === 'order' ? item.answer : type === 'classify' ? Object.fromEntries(item.cards.map(c => [c.id, c.bucket])) : type === 'match' ? Object.fromEntries(item.pairs.map((_, i) => [i, i])) : type === 'pick' ? item.answer : type === 'write' ? { text: item.model, checks: item.rubric.map(() => true) } : item.options.findIndex(o => o.correct);
      assert.ok(NX.isCorrect(item, solution), `${item.id}: la solución propia no se corrige como correcta`);
      if (type === 'write') assert.ok(!NX.isCorrect(item, { text: item.model, checks: item.rubric.map((_, i) => i > 0) }) && !NX.isCorrect(item, { text: 'no sé', checks: item.rubric.map(() => true) }), `${item.id}: la escrita no debe contar sin todas las ideas o sin texto`);
      assert.ok(item.explain && item.slide, `${item.id}: falta explicación o diapositiva`);
      assert.ok(cls.sources[item.source], `${item.id}: fuente inexistente`);
      if (stage === 'practice' || stage === 'challenge') assert.ok(item.hint, `${item.id}: la práctica necesita pista`);
      for (const o of [...(item.options || []), ...Object.values(item.targets || {}), item]) if (o.misconception) {
        const mc = cls.misconceptions[o.misconception];
        assert.ok(mc && mc.label && mc.why, `${item.id}: error "${o.misconception}" sin explicación`);
        if (mc.prereq) { const pm = cls.missions.find(x => x.id === mc.prereq.mission); assert.ok(pm && [...(pm.stages.fundamentals || []), ...pm.stages.explain].some(b => b.id === mc.prereq.block), `${o.misconception}: repaso apunta a un bloque inexistente`); }
      }
    }
    assert.ok(blocks.size, `${m.id}: sin explicación`);
    if (cls.concepts) assert.ok(cls.concepts.some(c => c.mission === m.id), `${m.id}: la misión no tiene conceptos (rama del árbol)`);
  }
  const kinds = st => context.window.NexoClassroom.beats(cls, { answers: {}, hints: {}, retries: {}, revealed: {}, skipExplain: {}, ...st }).map(b => b.kind);
  const m1 = cls.missions[0];
  const mis = kinds({ path: 'misiones', mission: m1.id });
  assert.deepEqual(kinds({ path: 'misiones' }), ['path', 'pick'], 'Misiones sin elegir muestra el mapa de misiones');
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
  // Siempre hay una forma más simple: cada término y cada bloque de explicación traen su versión simple.
  for (const g of cls.glossary || []) assert.ok(g.term && g.def && g.simple && g.simpler, `glosario: "${g.term || g[0]}" necesita term, def, simple y simpler`);
  for (const m of cls.missions) for (const blk of [...(m.stages.fundamentals || []), ...m.stages.explain]) assert.ok(blk.deeper, `${blk.id}: falta "deeper" (Explícame más simple)`);
  // Meta de la clase: cada pregunta de la prueba apunta a misiones que tienen caso estilo prueba.
  if (cls.goal) {
    const sum = cls.goal.questions.reduce((a, q) => a + q.points, 0) + (cls.goal.rest || []).reduce((a, r) => a + r.points, 0);
    assert.strictEqual(sum, cls.goal.total, `meta: los puntos (${sum}) deben sumar el total de la prueba (${cls.goal.total})`);
    for (const q of cls.goal.questions) for (const mId of q.missions) {
      const m = cls.missions.find(x => x.id === mId);
      assert.ok(m && (m.stages.transfer || []).length, `meta ${q.id}: la misión ${mId} no existe o no tiene transferencia`);
    }
  }
  for (const b of m1.stages.explain) if (b.slide) assert.ok(cls.slides?.[b.slide] || cls.slideImages?.[b.slide], `${b.id}: la diapositiva ${b.slide} no tiene texto ni imagen`);
}
console.log(`Aula: ${Object.keys(catalog).length} clase(s), ${items} actividades con solución verificada, errores con explicación y repaso; momentos y caminos OK.`);
// Conceptos: ids únicos y prerrequisitos que existen.
for (const id of Object.keys(catalog)) {
  const cls = context.window.NexoClasses[id];
  if (!cls.concepts) continue;
  const cids = new Set(cls.concepts.map(c => c.id));
  assert.equal(cids.size, cls.concepts.length, `${id}: conceptos repetidos`);
  for (const c of cls.concepts) for (const need of c.needs || []) assert.ok(cids.has(need), `${c.id}: prerrequisito ${need} no existe`);
}
