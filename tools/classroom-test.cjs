// Revisa los datos de las clases nuevas (dist/classes) y los caminos del reproductor, sin navegador.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert');
const dir = path.join(__dirname, '..', 'dist', 'classes');
const context = { window: {} }; vm.createContext(context);
for (const file of ['catalog.js', 'molecule.js', 'editor.js', 'player.js']) vm.runInContext(fs.readFileSync(path.join(dir, file), 'utf8'), context, { filename: file });
const catalog = context.window.NexoClassCatalog;
let items = 0;
for (const [id, file] of Object.entries(catalog)) {
  vm.runInContext(fs.readFileSync(path.join(dir, file), 'utf8'), context, { filename: file });
  const cls = context.window.NexoClasses[id];
  assert.ok(cls && cls.id === id, `${id}: la clase no se registró`);
  const ids = new Set();
  for (const m of [...cls.missions, ...(cls.base || [])]) {
    const isBase = (cls.base || []).includes(m);
    const NXM = context.window.NexoClassroom;
    const blocks = new Set(NXM.blocksOf(m).filter(b => !(m.stages.fundamentals || []).includes(b)).map(b => b.id));
    for (const { item, stage } of NXM.itemsOf(m)) {
      items += 1;
      assert.ok(!ids.has(item.id), `${item.id}: id repetido`); ids.add(item.id);
      const type = item.type || 'choice';
      if (type === 'choice') assert.equal(item.options.filter(o => o.correct).length, 1, `${item.id}: debe tener exactamente una correcta`);
      if (type === 'order') { assert.equal(item.answer.length, item.cards.length, `${item.id}: el orden debe usar todas las tarjetas`); for (const cid of item.answer) assert.ok(item.cards.some(c => c.id === cid), `${item.id}: tarjeta ${cid} no existe`); }
      if (type === 'classify') for (const c of item.cards) assert.ok(item.buckets.some(bk => bk.id === c.bucket), `${item.id}: ${c.id} sin caldero válido`);
      if (type === 'match') assert.ok(item.pairs.length >= 2 && item.pairs.every(p => p.left && p.right), `${item.id}: pares incompletos`);
      if (type === 'build') { const M = context.window.NexoMolecule; assert.ok(item.target?.atoms?.length && item.start && M.problems(item.target).length === 0, `${item.id}: el dibujo necesita base (start) y una respuesta válida`); assert.ok(!M.same(item.start, item.target), `${item.id}: la base ya es la respuesta`); }
      if (type === 'arrows') { assert.ok(item.scene?.atoms?.length && item.answer?.length, `${item.id}: flechas sin escena o sin respuesta`);
        for (const [from, to] of item.answer) { assert.ok(/^(lp|b):/.test(from), `${item.id}: una flecha debe salir de un par libre o un enlace`);
          if (from.startsWith('lp:')) assert.ok(item.lonePairs?.[from.slice(3)], `${item.id}: ${from} no tiene par libre dibujado`);
          if (from.startsWith('b:')) assert.ok(item.scene.bonds[Number(from.slice(2))], `${item.id}: el enlace ${from} no existe`);
          assert.ok(to.startsWith('a:') ? item.scene.atoms.some(a => a.id === to.slice(2)) : item.scene.bonds[Number(to.slice(2))], `${item.id}: el destino ${to} no existe`); } }
      if (item.figures) for (const f of item.figures) assert.ok(f.scene?.atoms?.length && f.caption, `${item.id}: cada dibujo de los gemelos necesita escena y rótulo`);
      // Todo par libre dibujado tiene que estar en un átomo que exista (si no, la pantalla se rompe al dibujar).
      for (const def of [item, ...(item.figures || [])]) if (def.lonePairs) for (const k of Object.keys(def.lonePairs)) assert.ok((def.scene || {}).atoms?.some(a => a.id === k), `${item.id}: par libre en "${k}", átomo que no existe en el dibujo`);
      if (type === 'arrows') for (const [from, to] of item.given || []) assert.ok(/^(lp|b):/.test(from) && !item.answer.some(([a, b]) => a === from && b === to), `${item.id}: flecha dada inválida o repetida en la respuesta`);
      if (type === 'poe') { assert.equal(item.options.filter(o => o.correct).length, 1, `${item.id}: la predicción necesita una sola correcta`); assert.ok(item.sim && item.sim.min < item.sim.threshold && item.sim.threshold < item.sim.max && item.sim.below && item.sim.above, `${item.id}: simulación incompleta`); }
      if (type === 'recipe') { for (const r of item.answer) assert.ok(item.ingredients.some(x => x.id === r), `${item.id}: ingrediente ${r} no existe`); assert.ok(item.ingredients.length > item.answer.length, `${item.id}: el caldero necesita ingredientes de más (distractores)`);
        for (const x of item.ingredients) if (!item.answer.includes(x.id)) assert.ok(item.notes?.[x.id], `${item.id}: el ingrediente equivocado "${x.id}" necesita su explicación`); }
      if (type === 'spot') { assert.ok(item.steps[item.wrong] && item.fix?.options?.filter(o => o.correct).length === 1, `${item.id}: paso equivocado o corrección inválidos`);
        item.steps.forEach((_, i) => { if (i !== item.wrong) assert.ok(item.stepNotes?.[i], `${item.id}: el paso ${i + 1} necesita su nota`); }); }
      if (type === 'write') assert.ok(item.model && item.model.length >= 40 && item.rubric?.length >= 2 && item.rubric.every(Boolean), `${item.id}: la escrita necesita respuesta modelo y al menos 2 ideas en la pauta`);
      if (cls.concepts) assert.ok(cls.concepts.some(c => c.id === item.concept), `${item.id}: sin concepto (hoja del árbol) válido`);
      if (type === 'pick') { assert.ok(item.targets[item.answer], `${item.id}: respuesta sin objetivo`); assert.ok(item.molecules.flat().some(p => p.target === item.answer), `${item.id}: la respuesta no se puede tocar`); }
      const NX = context.window.NexoClassroom;
      const solution = type === 'order' ? item.answer : type === 'classify' ? Object.fromEntries(item.cards.map(c => [c.id, c.bucket])) : type === 'match' ? Object.fromEntries(item.pairs.map((_, i) => [i, i])) : type === 'pick' ? item.answer : type === 'write' ? { text: item.model, checks: item.rubric.map(() => true) } : type === 'build' ? { graph: item.target } : type === 'arrows' ? item.answer : type === 'poe' ? { pred: item.options.findIndex(o => o.correct) } : type === 'recipe' ? item.answer : type === 'spot' ? { step: item.wrong, fix: item.fix.options.findIndex(o => o.correct) } : item.options.findIndex(o => o.correct);
      assert.ok(NX.isCorrect(item, solution), `${item.id}: la solución propia no se corrige como correcta`);
      if (!['build', 'arrows'].includes(type)) assert.equal(context.window.NexoMolEditor.feedback(item, { correct: false, value: type === 'write' ? { text: 'x', checks: [] } : solution }), '', `${item.id}: el aviso de dibujo no aplica a esta actividad`);
      if (type === 'build') assert.ok(!NX.isCorrect(item, { graph: item.start }), `${item.id}: la base sin completar no debe contar como correcta`);
      if (type === 'arrows') assert.ok(!NX.isCorrect(item, item.answer.slice(1)), `${item.id}: faltando una flecha no debe contar como correcta`);
      if (type === 'recipe') assert.ok(!NX.isCorrect(item, [...item.answer].reverse()), `${item.id}: el orden al revés no debe contar`);
      if (type === 'spot') assert.ok(!NX.isCorrect(item, { step: (item.wrong + 1) % item.steps.length }), `${item.id}: tocar un paso bueno no debe contar`);
      if (type === 'write') assert.ok(!NX.isCorrect(item, { text: item.model, checks: item.rubric.map((_, i) => i > 0) }) && !NX.isCorrect(item, { text: 'no sé', checks: item.rubric.map(() => true) }), `${item.id}: la escrita no debe contar sin todas las ideas o sin texto`);
      assert.ok(item.explain && (item.slide || isBase), `${item.id}: falta explicación o diapositiva`);
      assert.ok(cls.sources[item.source], `${item.id}: fuente inexistente`);
      if (stage === 'practice' || stage === 'challenge') assert.ok(item.hint, `${item.id}: la práctica necesita pista`);
      for (const o of [...(item.options || []), ...Object.values(item.targets || {}), item]) if (o.misconception) {
        const mc = cls.misconceptions[o.misconception];
        assert.ok(mc && mc.label && mc.why, `${item.id}: error "${o.misconception}" sin explicación`);
        if (mc.prereq) { const pm = cls.missions.find(x => x.id === mc.prereq.mission); assert.ok(pm && NXM.blocksOf(pm).some(b => b.id === mc.prereq.block), `${o.misconception}: repaso apunta a un bloque inexistente`); }
      }
    }
    assert.ok(blocks.size, `${m.id}: sin explicación`);
    if (cls.concepts && !isBase) assert.ok(cls.concepts.some(c => c.mission === m.id), `${m.id}: la misión no tiene conceptos (rama del árbol)`);
    if (isBase) assert.ok(cls.concepts.some(c => c.id === m.concept && c.root) && NXM.blocksOf(m).every(b => b.deeper) && NXM.itemsOf(m).some(x => x.item.type === 'write'), `${m.id}: la misión base necesita su raíz, explicaciones simples y una pregunta escrita`);
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
  assert.ok(!context.window.NexoClassroom.beats(cls, { path: 'misiones', mission: m1.id, answers: allRight, hints: {}, retries: {}, revealed: {}, skipExplain: { [m1.id]: true } }).some(b => b.kind === 'step' || b.kind === 'question' && b.stage === 'pretest' || (b.kind === 'lesson' && !['recipe', 'rule'].includes(b.block.kind))), 'Saltar la lección la quita (las recetas y reglas guardadas quedan como resumen)');
  assert.ok(!kinds({ path: 'prueba' }).includes('lesson'), 'Prueba encima no pasa por la lección');
  const lessons = context.window.NexoClassroom.beats(cls, { path: 'misiones', mission: m1.id, answers: {}, hints: {}, retries: {}, revealed: {}, skipExplain: {} }).filter(b => b.kind === 'lesson');
  assert.ok(lessons.some(b => b.zero) && lessons.findIndex(b => b.zero) < lessons.findIndex(b => !b.zero), 'Las bases desde cero van antes de la materia');
  for (const blk of [...(m1.stages.fundamentals || []), ...m1.stages.explain]) assert.ok(blk.body && blk.title, `${blk.id}: bloque sin texto`);
  // Siempre hay una forma más simple: cada término y cada bloque de explicación traen su versión simple.
  for (const g of cls.glossary || []) assert.ok(g.term && g.def && g.simple && g.simpler, `glosario: "${g.term || g[0]}" necesita term, def, simple y simpler`);
  for (const m of cls.missions) for (const blk of context.window.NexoClassroom.blocksOf(m)) assert.ok(blk.deeper && blk.title && blk.body, `${blk.id}: falta título, texto o "deeper" (Explícame más simple)`);
  // Misiones por recetas: cada parte tiene lección, práctica variada y su receta; los mecanismos tienen cuadros.
  for (const m of cls.missions) for (const p of m.parts || []) {
    assert.ok(p.intro && (p.explain || []).length && (p.practice || []).length >= 3 && (p.recipe?.title || (p.rule?.title && p.rule.steps?.length >= 2 && cls.concepts.some(c => c.id === p.rule.concept))), `${m.id}/${p.id}: la parte necesita intro, lección, 3+ actividades y receta o regla guardada (con su concepto)`);
    assert.ok(new Set(p.practice.map(i => i.type || 'choice')).size >= 3, `${m.id}/${p.id}: al menos 3 tipos de actividad distintos`);
    for (const blk of p.explain) if (blk.frames) for (const f of blk.frames) assert.ok(f.scene?.atoms?.length && f.caption, `${blk.id}: cada cuadro del mecanismo necesita escena y texto`);
    for (const blk of p.explain) for (const f of blk.frames || []) for (const k of Object.keys(f.lonePairs || {})) assert.ok(f.scene.atoms.some(a => a.id === k), `${blk.id}: par libre en "${k}", átomo que no existe`);
    for (const blk of p.explain) if (blk.frames) assert.ok(blk.frames.some(f => (f.arrows || []).length), `${blk.id}: un mecanismo sin ninguna flecha no muestra cómo se mueven los electrones`);
    for (const blk of p.explain) for (const f of blk.frames || []) for (const [from, to] of f.arrows || []) { const ok = k => k.startsWith('b:') ? f.scene.bonds[Number(k.slice(2))] : f.scene.atoms.some(x => x.id === k.slice(k.indexOf(':') + 1)); assert.ok(ok(from) && ok(to), `${blk.id}: flecha ${from} → ${to} apunta a algo que no existe`); if (from.startsWith('lp:')) assert.ok(f.lonePairs?.[from.slice(3)], `${blk.id}: ${from} sin par libre dibujado`); }
  }
  // Etapa 4: diagnóstico adaptativo, errores que guían y clase base.
  if (cls.diagnosis) {
    const NX = context.window.NexoClassroom;
    for (const { level, item } of cls.diagnosis.items) {
      assert.ok(!ids.has(item.id), `${item.id}: id repetido`); ids.add(item.id);
      assert.ok([1, 2, 3].includes(level) && cls.concepts.some(c => c.id === item.concept) && item.explain && item.options.filter(o => o.correct).length === 1, `${item.id}: pregunta de diagnóstico inválida`);
    }
    for (const [key, mc] of Object.entries(cls.misconceptions)) {
      if (mc.base) assert.ok(cls.concepts.some(c => c.id === mc.base && c.root), `${key}: "base" debe ser una raíz del árbol`);
      if (mc.check) { assert.ok(!ids.has(mc.check.id) && mc.check.options.filter(o => o.correct).length === 1 && mc.check.explain && cls.concepts.some(c => c.id === mc.check.concept), `${key}: caso corto inválido`); ids.add(mc.check.id); }
    }
    const answerAll = (st, pick) => { for (let k = 0; k < 20; k++) { const plan = NX.diagnosisPlan(cls, st); if (plan.done) return plan; const it = plan.next.item; st.answers[it.id] = { choice: it.options.findIndex(o => pick(it) === Boolean(o.correct)), correct: pick(it) }; } };
    const good = answerAll({ answers: {} }, () => true), bad = answerAll({ answers: {} }, () => false);
    assert.ok(good.asked.length >= 6 && good.asked.length <= cls.diagnosis.max, 'El diagnóstico hace entre 6 y 7 preguntas');
    assert.ok(good.asked[1].level === 3 && bad.asked[1].level === 1, 'Si aciertas sube de nivel; si fallas baja a las bases');
    assert.ok(bad.bases.length >= 2 && bad.start === cls.missions[0], 'Fallando todo sugiere la clase base y empezar por la Misión 1');
    assert.ok(good.bases.length === 0 && (!good.start || cls.missions.indexOf(good.start) > 0), 'Acertando todo no sugiere la base ni la Misión 1');
    assert.equal(bad.asked[1].item.concept, 'base.lewis', 'Al fallar baja a una base relacionada con lo que falló');
    const kb = st => NX.beats(cls, { path: 'diagnostico', answers: {}, hints: {}, retries: {}, revealed: {}, skipExplain: {}, detour: {}, ...st }).map(b => b.kind);
    assert.ok(kb({}).filter(k => k === 'question').length === 1 && !kb({}).includes('diagresult'), 'El diagnóstico muestra una pregunta a la vez');
    // Errores que guían, en la misión de reacciones: E2 mal + Hofmann mal (misma base SN2/E2) → caso corto y desvío.
    const m7x = cls.missions.find(m => m.id === 'm7'), it = id => NX.itemsOf(m7x).find(x => x.item.id === id).item;
    const wrongOn = id => { const item = it(id); return { choice: item.options.findIndex(o => !o.correct), correct: false }; };
    const st = { path: 'misiones', mission: 'm7', answers: { 'm7-e2': wrongOn('m7-e2'), 'm7-tw2': wrongOn('m7-tw2') }, hints: {}, retries: {}, revealed: {}, skipExplain: {}, detour: {} };
    st.answers['m7-tw2'].choice = it('m7-tw2').options.findIndex(o => o.misconception === 'zaitsev-hofmann');
    const bs = NX.beats(cls, st);
    assert.ok(bs.some(b => b.stage === 'fix' && b.item.id === 'fix-hofmann'), 'Un error típico con caso corto lo muestra al tiro');
    const d = bs.findIndex(b => b.kind === 'detour');
    assert.ok(d > bs.findIndex(b => b.item?.id === 'm7-tw2') && bs[d].bm.concept === 'base.sn-e', 'Dos errores con la misma base ofrecen el desvío a esa base');
    const go = NX.beats(cls, { ...st, detour: { 'm7:base.sn-e': true } });
    const dd = go.findIndex(b => b.kind === 'detour');
    assert.deepEqual(go.slice(dd + 1, dd + 6).map(b => b.kind), ['lesson', 'question', 'question', 'say', 'rescue'], 'El desvío: base, 2 ejercicios y vuelta al problema');
    assert.equal(go.filter(b => b.kind === 'rescue' && b.item.id === 'm7-tw2').length, 1, 'El problema ya rescatado no se repite al final');
    assert.ok(!NX.beats(cls, { ...st, detour: { 'm7:base.sn-e': false } }).some(b => b.stage === 'detour'), '"Ahora no" respeta tu decisión');
    // Invariante: responder (aunque sea mal) nunca cambia los momentos que ya pasaste; si cambiaran, te moverías de lugar.
    for (const [path, mission] of [['misiones', 'm1'], ['misiones', 'm7'], ['base', 'z2'], ['prueba', null], ['diagnostico', null]]) {
      const st = { path, mission, answers: {}, hints: {}, retries: {}, revealed: {}, skipExplain: {}, detour: {}, conf: {}, confWhy: {} };
      const sig = b => `${b.kind}:${b.item?.id || b.block?.id || b.root || b.text || ''}`;
      for (let guard = 0; guard < 200; guard++) {
        const list = NX.beats(cls, st);
        const i = list.findIndex(b => (b.kind === 'question' && !st.answers[b.item.id]) || (b.kind === 'rescue' && !st.retries[b.item.id]) || (b.kind === 'detour' && st.detour[`${b.m.id}:${b.root}`] === undefined) || (b.kind === 'offer' && st.skipExplain[b.m.id] === undefined));
        if (i < 0) break;
        const b = list[i], before = list.slice(0, i + 1).map(sig);
        if (b.kind === 'question') { const it = b.item; st.answers[it.id] = { correct: false, choice: (it.options || []).findIndex(o => !o.correct), value: null }; }
        else if (b.kind === 'rescue') st.retries[b.item.id] = { correct: true };
        else if (b.kind === 'detour') st.detour[`${b.m.id}:${b.root}`] = true;
        else st.skipExplain[b.m.id] = false;
        assert.deepEqual(NX.beats(cls, st).slice(0, i + 1).map(sig), before, `${path}/${mission}: responder ${sig(b)} cambió momentos anteriores`);
      }
    }
    // Clase base como camino propio
    const kbase = mission => NX.beats(cls, { path: 'base', mission, answers: {}, hints: {}, retries: {}, revealed: {}, skipExplain: {}, detour: {} }).map(b => b.kind);
    assert.deepEqual(kbase(null), ['path', 'basepick'], 'Repaso desde cero parte eligiendo la base');
    assert.ok(kbase(cls.base[0].id).includes('lesson') && kbase(cls.base[0].id).includes('close'), 'Cada base se recorre sola');
  }
  // Etapa 5: formulario y recetario.
  if (cls.formulas) {
    for (const f of cls.formulas) {
      assert.ok(f.title && f.formula && f.vars?.length && f.what && f.when && f.example && f.deeper, `${f.id}: la tarjeta necesita fórmula, letras, para qué, cuándo, ejemplo y "a fondo"`);
      assert.ok(f.sources?.length && f.sources.every(x => x.label && (x.url || (x.slide && cls.slides[x.slide]))), `${f.id}: cada fuente necesita un enlace o una diapositiva existente`);
      assert.ok(f.concepts.every(c => cls.concepts.some(k => k.id === c)), `${f.id}: concepto inexistente`);
      if (f.calc) { const v = Object.fromEntries(f.calc.inputs.map(i => [i.id, i.value])); const out = f.calc.run(v); assert.ok(out && !/NaN|undefined|Infinity/.test(out), `${f.id}: la calculadora no da un resultado`); }
    }
    const run = (id, v) => cls.formulas.find(f => f.id === id).calc.run(v);
    assert.match(run('f-keq', { r: 4.76, p: 10.76 }), /10⁶.*derecha/, 'Keq: ácido acético + trietilamina da 10⁶ hacia la derecha (diap. 17)');
    assert.match(run('f-keq', { r: 10, p: 5 }), /izquierda/, 'Keq: si el ácido producto es más fuerte gana la izquierda');
    assert.match(run('f-hh', { ph: 10.6, pka: 10.6 }), /50 %/, 'Henderson-Hasselbalch: pH = pKa deja la mitad protonada');
    assert.match(run('f-cf', { v: 6, n: 6, e: 1 }), /−1|-1/, 'Carga formal del O del hidróxido: −1');
    assert.match(run('f-pkb', { pkb: 3.4 }), /10,6/, 'pKa + pKb = 14');
    assert.match(run('f-nrule', { m: 58 }), /par/, 'Regla del nitrógeno: 58 es par');
    assert.match(run('f-huckel', { pi: 6 }), /cumple/, 'Hückel: 6 electrones π cumple');
    assert.match(run('f-huckel', { pi: 4 }), /no es 4n \+ 2/, 'Hückel: 4 electrones π no cumple');
    // "No recuerdo la regla" encuentra una tarjeta para los conceptos de cálculo
    for (const c of ['am.pka', 'am.equilibrio', 'base.carga', 'am.espectro']) assert.ok(cls.formulas.some(f => f.concepts.includes(c)), `${c}: sin tarjeta del formulario`);
  }
  if (cls.recipes) {
    const rids = new Set();
    for (const r of cls.recipes) {
      assert.ok(!rids.has(r.id) && r.title && r.base && r.reagents && r.condition && r.result, `${r.id}: receta incompleta o repetida`); rids.add(r.id);
      assert.ok(cls.concepts.some(c => c.id === r.concept && c.mission === r.mission) && cls.slides[r.slide], `${r.id}: concepto, misión o diapositiva inválidos`);
    }
  }
  // Más ayuda: cada bloque sabe su concepto; todo concepto tiene mini clase; las clases a fondo traen desafío y fuentes.
  if (cls.mini) {
    for (const m of [...cls.missions, ...(cls.base || [])]) for (const blk of context.window.NexoClassroom.blocksOf(m)) assert.ok(cls.concepts.some(c => c.id === blk.concept), `${blk.id}: el bloque no sabe de qué concepto es`);
    for (const c of cls.concepts) { const m = cls.mini[c.id]; assert.ok(m && m.idea && m.steps.length === 3 && m.check.options.filter(o => o.correct).length === 1 && m.check.explain, `${c.id}: falta su mini clase (idea, 3 pasos y pregunta)`); }
    for (const [c, d] of Object.entries(cls.deep || {})) {
      assert.ok(cls.concepts.some(k => k.id === c) && d.title && d.sections.length >= 3 && d.challenge.options.filter(o => o.correct).length === 1, `${c}: clase a fondo incompleta`);
      assert.ok(d.sources.length >= 2 && d.sources.every(x => x.url || cls.slides[x.slide]), `${c}: la clase a fondo necesita al menos 2 fuentes válidas`);
    }
  }
  for (const m7 of cls.missions.filter(m => m.parts)) {
    const ks = context.window.NexoClassroom.beats(cls, { path: 'misiones', mission: m7.id, answers: {}, hints: {}, retries: {}, revealed: {}, skipExplain: {}, conf: {}, confWhy: {} });
    assert.equal(ks.filter(b => b.kind === 'hook').length, 1, `${m7.id}: la misión parte con el caso de farmacia`);
    assert.equal(ks.filter(b => b.stage === 'pretest').length, m7.parts.filter(p => p.pretest).length, 'Cada receta con "adivina antes" lo muestra');
    assert.equal(ks.filter(b => b.kind === 'lesson' && (b.block.kind === 'recipe' || b.block.kind === 'rule')).length, m7.parts.length, `${m7.id}: cada parte termina guardando su receta o regla en el grimorio`);
    const wrongPre = { [m7.parts[0].pretest.id]: { choice: 1, correct: false } };
    assert.ok(!context.window.NexoClassroom.beats(cls, { path: 'misiones', mission: m7.id, answers: wrongPre, hints: {}, retries: {}, revealed: {}, skipExplain: {} }).some(b => b.kind === 'rescue'), 'Equivocarse en "adivina antes" no abre el rescate');
  }
  // Etapa 7: ronda del alba, simulacro PEP y su puntaje.
  {
    const NX = context.window.NexoClassroom;
    const base = { answers: {}, hints: {}, retries: {}, revealed: {}, skipExplain: {}, detour: {}, conf: {}, confWhy: {}, rounds: {}, far: {} };
    assert.deepEqual(NX.roundPick(cls, base, null, 4), [], 'Sin nada visto, la ronda queda vacía');
    const seenSt = { ...base, answers: {} };
    for (const m of cls.missions.slice(0, 5)) { const it = NX.itemsOf(m).find(x => x.stage === 'practice').item; seenSt.answers[it.id] = { correct: true }; }
    const ids = NX.roundPick(cls, seenSt, null, 4);
    assert.ok(ids.length === 4 && new Set(ids.map(i => NX.findItem(cls, i).concept)).size === 4, 'La ronda trae una pregunta por concepto ya visto');
    const mis = ids.map(i => cls.missions.find(m => NX.itemsOf(m).some(x => x.item.id === i)).id);
    assert.ok(mis.every((m, i) => i === 0 || m !== mis[i - 1] || new Set(mis).size === 1), 'La ronda intercala misiones');
    const key = '2026-10-06:4', st = { ...seenSt, path: 'alba', albaKey: key, rounds: { [key]: ids } };
    const qs = NX.beats(cls, st).filter(b => b.kind === 'question');
    assert.ok(qs.length === 4 && qs.every(b => b.stage === 'review' && b.item.id.endsWith(`@a${key}`) && b.m), 'La ronda muestra copias de las preguntas, con su misión');
    const copy = qs[0].item, baseItem = NX.findItem(cls, ids[0]);
    assert.ok(copy.prompt === baseItem.prompt && copy.id !== baseItem.id, 'La copia es la misma pregunta con otra respuesta');
    // Simulacro
    const mini = NX.simBuild(cls, base, 'mini'), full = NX.simBuild(cls, base, 'full');
    const goalMissions = [...new Set(cls.goal.questions.flatMap(q => q.missions))];
    assert.equal(mini.ids.length, goalMissions.length, 'El mini simulacro trae un caso por misión que da puntos');
    assert.equal(full.ids.length, goalMissions.reduce((a, id) => a + cls.missions.find(m => m.id === id).stages.transfer.length, 0), 'El simulacro completo trae todos los casos estilo prueba');
    const simSt = { ...base, path: 'simulacro', sim: full };
    const kinds2 = NX.beats(cls, simSt).map(b => b.kind);
    assert.ok(kinds2[1] === 'simstart' && kinds2.filter(k => k === 'question').length === full.ids.length && kinds2[kinds2.length - 1] === 'simresult', 'Simulacro: inicio, preguntas y corrección');
    const perfect = {};
    for (const id of full.ids) { const it = NX.findItem(cls, id); perfect[id] = it.type === 'write' ? { correct: true, value: { text: it.model, checks: it.rubric.map(() => true) } } : { correct: true }; }
    const top = NX.simScore(cls, { ...simSt, answers: perfect });
    assert.ok(Math.abs(top.got - top.max) < 1e-9 && top.max > 0 && top.nota === 7, 'Todo correcto da el puntaje máximo y nota 7');
    const perItem = full.ids.reduce((a, id) => a + top.rows.filter(r => r.ids.includes(id)).reduce((x, r) => x + r.points / r.ids.length, 0), 0);
    assert.ok(Math.abs(perItem - top.max) < 1e-9, 'Lo que vale cada caso suma el total del simulacro');
    const zero = NX.simScore(cls, simSt);
    assert.ok(zero.got === 0 && zero.nota === 1, 'Sin responder: 0 puntos y nota 1');
    const w = full.ids.find(id => NX.findItem(cls, id).type === 'write');
    if (w) { const it = NX.findItem(cls, w); const half = NX.simScore(cls, { ...simSt, answers: { [w]: { correct: false, value: { checks: it.rubric.map((_, i) => i === 0) } } } }); assert.ok(half.got > 0, 'Una escrita a medias da puntaje parcial, como en la pauta'); }
    const ended = { ...simSt, sim: { ...full, ended: true }, answers: { [full.ids[0]]: { correct: true } } };
    assert.equal(NX.beats(cls, ended).filter(b => b.kind === 'question').length, 1, 'Si se acaba el tiempo, solo quedan las respondidas');
    const g0 = NX.goalOf(cls, base).earned, g1 = NX.goalOf(cls, { ...base, answers: { [full.ids[0]]: { correct: true } } }).earned;
    assert.ok(g1 > g0, 'Un acierto en el simulacro cuenta en el Camino al 7');
    // Escrita en papel: cuenta si te autocorriges con la pauta
    const wi = cls.missions.flatMap(m => NX.itemsOf(m)).find(x => x.item.type === 'write').item;
    assert.ok(NX.isCorrect(wi, { paper: true, text: '(Resuelto en papel)', checks: wi.rubric.map(() => true) }), 'Resuelta en papel y autocorregida, cuenta');
  }
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
