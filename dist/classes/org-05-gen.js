/* Ejercicios infinitos de SEA (Orgánica II, PEP 1). 5 niveles: 1 Fácil · 2 Media · 3 Intermedia · 4 Avanzada · 5 Nivel PEP.
   La orientación y el orden de síntesis se DEDUCEN de una tabla de sustituyentes (clase y efecto), no se escriben a mano. */
(() => {
  'use strict';
  const SRC = 'catedra-sea';
  const LEVELS = ['Fácil', 'Media', 'Intermedia', 'Avanzada', 'Nivel PEP'];
  const pick = (rng, list) => list[Math.floor(rng() * list.length)];
  const shuffle = (rng, list) => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sample = (rng, list, n) => shuffle(rng, list).slice(0, n);
  function choice(rng, prompt, correct, distractors, extra) {
    const seen = new Set([correct]);
    const ds = distractors.filter(d => d && d.text && !seen.has(d.text) && seen.add(d.text)).slice(0, extra.max || 3);
    const { max, ...rest } = extra;
    return { type: 'choice', prompt, options: shuffle(rng, [{ text: correct, correct: true }, ...ds]), ...rest };
  }
  const order = (prompt, cards, answer, extra) => ({ type: 'order', prompt, cards, answer, ...extra });

  /* Sustituyentes: cls 1 = activador fuerte o/p, 2 = moderado o/p, 3 = halógeno (desactiva, o/p), 4 = desactivador meta.
     rate = reactividad relativa aproximada para ordenar (solo el orden importa). */
  const SUB = [
    { g: '–NH₂', name: 'anilina', cls: 1, rate: 6 }, { g: '–OH', name: 'fenol', cls: 1, rate: 5.5 }, { g: '–OCH₃', name: 'anisol', cls: 1, rate: 5 }, { g: '–N(CH₃)₂', name: 'N,N-dimetilanilina', cls: 1, rate: 6 },
    { g: '–NHCOCH₃', name: 'acetanilida', cls: 2, rate: 3 }, { g: '–CH₃', name: 'tolueno', cls: 2, rate: 2 }, { g: '–CH₂CH₃', name: 'etilbenceno', cls: 2, rate: 2 },
    { g: '–Cl', name: 'clorobenceno', cls: 3, rate: -1 }, { g: '–Br', name: 'bromobenceno', cls: 3, rate: -1.2 }, { g: '–F', name: 'fluorobenceno', cls: 3, rate: -0.5 },
    { g: '–NO₂', name: 'nitrobenceno', cls: 4, rate: -5 }, { g: '–CN', name: 'benzonitrilo', cls: 4, rate: -4 }, { g: '–COCH₃', name: 'acetofenona', cls: 4, rate: -3 },
    { g: '–CHO', name: 'benzaldehído', cls: 4, rate: -3 }, { g: '–COOH', name: 'ácido benzoico', cls: 4, rate: -3 }, { g: '–SO₃H', name: 'ácido bencenosulfónico', cls: 4, rate: -4 }
  ];
  const where = s => (s.cls === 4 ? 'meta' : 'orto y para');
  const speed = s => (s.cls <= 2 ? 'más rápido' : 'más lento');
  const WHY = { 1: 'dona un par por resonancia al complejo σ', 2: 'dona densidad (alquilo o amida) y estabiliza la carga en orto/para', 3: 'saca electrones por σ (más lento) pero dona un par por resonancia (orto/para)', 4: 'tiene carga + o δ+ junto al anillo: en orto/para pondría dos cargas + juntas' };
  const E = ['Br₂/FeBr₃', 'HNO₃/H₂SO₄', 'Cl₂/AlCl₃', 'SO₃/H₂SO₄'];

  const orientar = {
    id: 'orientar', title: 'Dónde entra y qué tan rápido', mission: 'm2', concepts: ['sea.activadores', 'sea.halogenos'],
    make(rng, level, want) {
      const c = want || pick(rng, this.concepts);
      const s = pick(rng, SUB.filter(x => (c === 'sea.halogenos' ? x.cls === 3 : x.cls !== 3)));
      if (level === 5) { // ordenar reactividad
        const set = c === 'sea.halogenos' ? [SUB.find(x => x.g === '–NO₂'), s, { g: '–H', name: 'benceno', rate: 0 }, SUB.find(x => x.g === '–CH₃')] : sample(rng, SUB.filter(x => x.cls !== 3 && x.rate !== 6), 3).concat({ g: '–H', name: 'benceno', rate: 0 });
        const uniq = set.filter((x, i, a) => a.findIndex(y => y.rate === x.rate) === i);
        const sorted = [...uniq].sort((a, b) => a.rate - b.rate);
        return order('Estilo PEP: ordena de MÁS LENTO a MÁS RÁPIDO frente a la SEA:', uniq.map((x, i) => ({ id: 'x' + i, text: `${x.name} (${x.g === '–H' ? 'sin sustituyente' : x.g})` })), sorted.map(x => 'x' + uniq.indexOf(x)),
          { concept: c, slide: 34, direction: 'De más lento a más rápido.', hint: 'Atractores < halógenos < benceno < alquilos < pares libres.', explain: sorted.map(x => x.name).join(' < ') + '.' });
      }
      if (level <= 2) {
        const askWhere = level === 1 || rng() < 0.5;
        if (askWhere) return choice(rng, `¿A qué posiciones orienta el grupo ${s.g} en una SEA?`, `A ${where(s)}`, [{ text: `A ${where(s) === 'meta' ? 'orto y para' : 'meta'}`, note: `${s.g} ${WHY[s.cls]}.`, misconception: s.cls === 3 ? 'halogen-meta' : 'nitro-op' }, { text: 'Solo a orto', note: 'Si orienta a orto, también a para.' }],
          { concept: c, slide: 34, hint: '¿Tiene par libre/alquilo, es halógeno, o tiene δ+?', explain: `${s.g} ${WHY[s.cls]}: ${where(s)}.` });
        return choice(rng, `Frente a la SEA, el ${s.name} reacciona…`, `${speed(s).charAt(0).toUpperCase() + speed(s).slice(1)} que el benceno`, [{ text: `${speed(s) === 'más rápido' ? 'Más lento' : 'Más rápido'} que el benceno`, note: `${s.g} ${WHY[s.cls]}.`, misconception: s.cls === 3 ? 'halogen-meta' : 'nitro-op' }, { text: 'Igual que el benceno', note: 'Todo sustituyente cambia la velocidad.' }],
          { concept: c, slide: 34, hint: '¿Dona o saca electrones?', explain: `${speed(s)}: ${WHY[s.cls]}.` });
      }
      const e = pick(rng, E), combo = `${speed(s)}, en ${where(s)}`;
      const all = ['más rápido, en orto y para', 'más lento, en orto y para', 'más rápido, en meta', 'más lento, en meta'];
      return choice(rng, `${level === 4 ? 'Con dos datos: ' : ''}El ${s.name} (${s.g}) con ${e}: ¿cómo reacciona respecto al benceno y dónde entra?`, combo.charAt(0).toUpperCase() + combo.slice(1),
        all.filter(x => x !== combo).map(text => ({ text: text.charAt(0).toUpperCase() + text.slice(1), note: `${s.g} ${WHY[s.cls]}.`, misconception: s.cls === 3 ? 'halogen-meta' : 'nitro-op' })),
        { concept: c, slide: s.cls === 3 ? 31 : 34, hint: 'Velocidad: ¿dona o saca? Posición: ¿dónde cae la carga del complejo σ?', explain: `${combo}: ${WHY[s.cls]}.` });
    }
  };

  /* Dos sustituyentes: ¿quién manda? */
  const multiples = {
    id: 'multiples', title: 'Varios sustituyentes', mission: 'm2', concepts: ['sea.multiples'],
    make(rng, level) {
      const rank = s => (s.cls === 1 ? 3 : s.cls === 2 || s.cls === 3 ? 2 : 1);
      let a, b; do { [a, b] = sample(rng, SUB, 2); } while (rank(a) === rank(b) && level <= 3);
      if (rank(a) === rank(b)) return choice(rng, `Estilo PEP: un benceno lleva ${a.g} y ${b.g} y sus orientaciones se oponen. ¿Qué esperas?`, 'Mezcla de productos (fuerzas parecidas)', [{ text: `Manda ${a.g}`, note: 'Son de la misma clase: ninguno domina claramente.' }, { text: `Manda ${b.g}`, note: 'Son de la misma clase: ninguno domina claramente.' }],
        { concept: 'sea.multiples', slide: 35, hint: 'Clase 1 > clase 2 > meta.', explain: 'Misma clase: mezclas probables.' });
      const win = rank(a) > rank(b) ? a : b, lose = win === a ? b : a;
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}Un benceno lleva ${a.g} y ${b.g}${level >= 3 ? ' en posiciones que no se ponen de acuerdo' : ''}. ¿Qué grupo decide dónde entra el electrófilo?`, `${win.g}`, [{ text: `${lose.g}`, note: 'Manda el activador más fuerte: –OH/–OR/–NR₂ > –R/–X > meta.', misconception: 'activator-loses' }, { text: 'Ninguno: entra al azar', note: 'Siempre domina el más fuerte cuando son de distinta clase.' }],
        { concept: 'sea.multiples', slide: 35, hint: 'Clase 1 (pares libres) > clase 2 (alquilos, halógenos) > clase 3 (meta).', explain: `${win.g} es de una clase más fuerte.` });
    }
  };

  /* Reactivos y mecanismo */
  const TARGET = [
    { t: 'bromobenceno', r: 'Br₂ / FeBr₃', c: 'sea.halogenacion', mc: 'no-lewis' }, { t: 'clorobenceno', r: 'Cl₂ / AlCl₃', c: 'sea.halogenacion', mc: 'no-lewis' }, { t: 'yodobenceno', r: 'I₂ / HNO₃', c: 'sea.halogenacion', mc: 'no-lewis' },
    { t: 'nitrobenceno', r: 'HNO₃ / H₂SO₄', c: 'sea.nitracion', mc: 'nitronium' }, { t: 'ácido bencenosulfónico', r: 'SO₃ / H₂SO₄', c: 'sea.nitracion' }, { t: 'anilina (desde nitrobenceno)', r: 'Fe / HCl (y luego NaOH)', c: 'sea.nitracion' }
  ];
  const reactivos = {
    id: 'reactivos', title: 'Reactivos y mecanismo', mission: 'm1', concepts: ['sea.mecanismo', 'sea.halogenacion', 'sea.nitracion'],
    make(rng, level, want) {
      const c = want || pick(rng, this.concepts);
      if (c === 'sea.mecanismo') {
        const bank = [['El paso lento de la SEA es…', 'Formar el complejo σ', [['Perder el H⁺', 'Ese es rápido: devuelve la aromaticidad.'], ['Formar el producto', 'El producto sale del paso rápido.']]],
          ['En el complejo σ, la carga + queda en…', 'Los C orto y para al C atacado', [['El C atacado', 'Ese C es sp³ y no lleva la carga.'], ['Los C meta', 'La resonancia la reparte en orto y para.']]],
          ['¿Por qué la SEA termina en sustitución?', 'El complejo σ pierde H⁺ para recuperar la aromaticidad', [['Porque el Br⁻ no alcanza a llegar', 'No es por eso: recuperar la aromaticidad manda.', 'adds-not-subs'], ['Porque el benceno no tiene π', 'Sí los tiene; son los que atacan.']]],
          ['El complejo σ es…', 'Un carbocatión no aromático', [['Un anillo aromático con carga', 'Un C es sp³: se corta el anillo de p.', 'sigma-aromatic'], ['Un radical', 'Es un catión.']]]];
        const [p, a, ds] = pick(rng, level <= 2 ? bank.slice(0, 2) : bank);
        return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${p}`, a, ds.map(([text, note, mc]) => ({ text, note, misconception: mc })), { concept: c, slide: 4, hint: 'Piensa en el complejo σ.', explain: a + '.' });
      }
      const pool = TARGET.filter(x => x.c === c), x = pick(rng, pool), others = TARGET.filter(y => y.r !== x.r);
      return choice(rng, `${level === 5 ? 'Estilo PEP (P5): ' : ''}¿Qué reactivo convierte benceno en ${x.t}?`.replace('benceno en anilina (desde nitrobenceno)', 'nitrobenceno en anilina'), x.r,
        [...sample(rng, others, 2).map(y => ({ text: y.r, note: `${y.r} da ${y.t}.` })), { text: x.r.split(' / ')[0] + ' solo', note: 'Falta el catalizador (ácido de Lewis o H₂SO₄) o el oxidante.', misconception: x.mc }],
        { concept: c, slide: c === 'sea.halogenacion' ? 6 : 11, hint: '¿Cuál es el electrófilo que hace falta?', explain: `${x.t}: ${x.r}.` });
    }
  };

  /* Friedel-Crafts */
  const CHAINS = [
    { p: 'tolueno', rx: 'CH₃Cl', ok: true }, { p: 'etilbenceno', rx: 'CH₃CH₂Cl', ok: true }, { p: 'isopropilbenceno', rx: '(CH₃)₂CHCl', ok: true }, { p: 't-butilbenceno', rx: '(CH₃)₃CCl', ok: true },
    { p: 'propilbenceno', rx: 'CH₃CH₂CH₂Cl', ok: false, gets: 'isopropilbenceno', acyl: 'CH₃CH₂COCl' }, { p: 'butilbenceno', rx: 'CH₃CH₂CH₂CH₂Cl', ok: false, gets: 'sec-butilbenceno', acyl: 'CH₃CH₂CH₂COCl' }, { p: 'isobutilbenceno', rx: '(CH₃)₂CHCH₂Cl', ok: false, gets: 't-butilbenceno', acyl: '(CH₃)₂CHCOCl' }
  ];
  const friedel = {
    id: 'friedel', title: 'Friedel-Crafts', mission: 'm3', concepts: ['sea.friedel'],
    make(rng, level) {
      if (level === 1) { const s = pick(rng, SUB.filter(x => x.cls === 4)); return choice(rng, `¿Funciona una acilación de Friedel-Crafts sobre ${s.name}?`, 'No: el anillo está fuertemente desactivado', [{ text: 'Sí, entra en meta', note: 'Friedel-Crafts falla con anillos fuertemente desactivados.', misconception: 'fc-deactivated' }, { text: 'Sí, entra en orto y para', note: 'Ni siquiera reacciona.' }],
        { concept: 'sea.friedel', slide: 41, hint: 'Limitación 1.', explain: 'No funciona: anillo desactivado.' }); }
      const ch = pick(rng, level === 2 ? CHAINS.slice(0, 5) : CHAINS);
      const cap = t => t.charAt(0).toUpperCase() + t.slice(1);
      if (level <= 3) return choice(rng, `Benceno + ${ch.rx} / AlCl₃: ¿producto principal?`, cap(ch.ok ? ch.p : ch.gets),
        [ch.ok ? { text: 'No reacciona', note: 'Sí reacciona: es una alquilación normal (este carbocatión no se reordena).' } : { text: cap(ch.p), note: 'El carbocatión primario se reordena a uno más estable.', misconception: 'fc-rearrange' }, { text: 'Un producto de adición al anillo', note: 'Es una SEA: sustitución.' }],
        { concept: 'sea.friedel', slide: 41, hint: '¿El carbocatión puede reordenarse a uno más estable?', explain: ch.ok ? 'Sin reordenamiento posible.' : `El carbocatión se reordena: ${ch.gets}.` });
      const lin = pick(rng, CHAINS.filter(x => !x.ok));
      return choice(rng, `${level === 5 ? 'Estilo PEP (P5): ' : ''}¿Cómo preparas ${lin.p} (cadena sin ramificar) desde benceno?`, `${lin.acyl} / AlCl₃ y después Zn(Hg) / HCl`, [{ text: `${lin.rx} / AlCl₃`, note: `Se reordena y da ${lin.gets}.`, misconception: 'fc-rearrange' }, { text: `${lin.acyl} / AlCl₃ solo`, note: 'Eso deja la cetona: falta reducir con Clemmensen.' }, { text: `${lin.rx} con luz`, note: 'Eso es halogenación radicalaria, no una alquilación.' }],
        { concept: 'sea.friedel', slide: 43, hint: 'El ion acilio no se reordena.', explain: 'Acilación + Clemmensen.' });
    }
  };

  /* Síntesis de disustituidos: el orden lo decide quién orienta a dónde */
  const STEP = { Br: { r: 'Br₂ / FeBr₃', s: SUB.find(x => x.g === '–Br') }, Cl: { r: 'Cl₂ / AlCl₃', s: SUB.find(x => x.g === '–Cl') }, NO2: { r: 'HNO₃ / H₂SO₄', s: SUB.find(x => x.g === '–NO₂') },
    CH3: { r: 'CH₃Cl / AlCl₃', s: SUB.find(x => x.g === '–CH₃'), fc: true }, COCH3: { r: 'CH₃COCl / AlCl₃', s: SUB.find(x => x.g === '–COCH₃'), fc: true }, SO3H: { r: 'SO₃ / H₂SO₄', s: SUB.find(x => x.g === '–SO₃H') } };
  const sintesis = {
    id: 'sintesis', title: 'Planificar la síntesis', mission: 'm3', concepts: ['sea.sintesis'],
    make(rng, level) {
      // busca un par (A, B, relación) que tenga un orden válido
      for (let tries = 0; tries < 40; tries++) {
        const [A, B] = sample(rng, Object.keys(STEP), 2), rel = pick(rng, ['meta', 'para']);
        const valid = first => { const f = STEP[first], sec = first === A ? B : A; if (STEP[sec].fc && f.s.cls === 4) return false; return rel === 'meta' ? f.s.cls === 4 : f.s.cls !== 4; };
        const okA = valid(A), okB = valid(B);
        if (okA === okB) continue; // queremos un único orden correcto
        const first = okA ? A : B, second = first === A ? B : A, target = `un benceno con ${STEP[A].s.g.slice(1)} y ${STEP[B].s.g.slice(1)} en ${rel === 'meta' ? 'meta (1,3)' : 'para (1,4)'}`;
        const why = STEP[second].fc && STEP[first === A ? B : A].s.cls === 4 ? 'Friedel-Crafts falla sobre un anillo desactivado.' : `${STEP[first].s.g} orienta a ${where(STEP[first].s)}.`;
        if (level <= 3) return choice(rng, `Para ${target} desde benceno, ¿qué haces primero?`, STEP[first].r, [{ text: STEP[second].r, note: `Si empiezas con ${STEP[second].s.g}, ${STEP[second].fc || STEP[first].fc ? 'falla o ' : ''}orienta a ${where(STEP[second].s)}.`, misconception: 'synthesis-order' }, { text: 'Da lo mismo el orden', note: 'El primer grupo decide dónde entra el segundo.' }],
          { concept: 'sea.sintesis', slide: 45, hint: '¿Quién orienta a la posición pedida?', explain: `Primero ${STEP[first].r}: ${why}` });
        return order(`${level === 5 ? 'Estilo PEP (P5): ' : ''}Ordena los pasos para obtener ${target} desde benceno:`, [{ id: 'a', text: STEP[first].r }, { id: 'b', text: STEP[second].r }, { id: 'c', text: 'Separar el isómero deseado (si sale mezcla o/p)' }], ['a', 'b', 'c'],
          { concept: 'sea.sintesis', slide: 45, direction: 'Del primer paso al último.', hint: '¿Quién orienta a la posición pedida? ¿Hay un Friedel-Crafts que deba ir antes?', explain: `${STEP[first].r} → ${STEP[second].r}. ${why}` });
      }
      return choice(rng, 'Para m-bromonitrobenceno desde benceno, ¿qué haces primero?', 'HNO₃ / H₂SO₄', [{ text: 'Br₂ / FeBr₃', note: 'El Br orienta a orto/para.', misconception: 'synthesis-order' }], { concept: 'sea.sintesis', slide: 45, hint: '¿Quién orienta a meta?', explain: 'El NO₂ orienta a meta.' });
    }
  };

  /* SNA */
  const SNA = [{ n: 'clorobenceno', r: 0 }, { n: 'm-nitroclorobenceno', r: 1 }, { n: 'p-nitroclorobenceno', r: 2 }, { n: 'o-nitroclorobenceno', r: 2.1 }, { n: '2,4-dinitroclorobenceno', r: 3 }, { n: '2,4,6-trinitroclorobenceno', r: 4 }];
  const sna = {
    id: 'sna', title: 'SNA', mission: 'm3', concepts: ['sea.sna'],
    make(rng, level) {
      if (level >= 4) { const set = sample(rng, SNA.filter(x => x.r !== 2.1), level === 5 ? 4 : 3), sorted = [...set].sort((a, b) => a.r - b.r);
        return order(`${level === 5 ? 'Estilo PEP: ' : ''}Ordena de MENOS a MÁS reactivo frente a NaOH (SNA):`, set.map((x, i) => ({ id: 'x' + i, text: x.n })), sorted.map(x => 'x' + set.indexOf(x)),
          { concept: 'sea.sna', slide: 49, direction: 'De menos a más reactivo.', hint: 'Cuenta NO₂ en orto/para.', explain: sorted.map(x => x.n).join(' < ') + '.' }); }
      const [a, b] = sample(rng, SNA, 2), hi = a.r > b.r ? a : b, lo = hi === a ? b : a;
      return choice(rng, `¿Cuál reacciona más rápido con NaOH (SNA): ${a.n} o ${b.n}?`, hi.n.charAt(0).toUpperCase() + hi.n.slice(1), [{ text: lo.n.charAt(0).toUpperCase() + lo.n.slice(1), note: 'Más NO₂ en orto/para estabiliza mejor la carga negativa.', misconception: 'sna-no-ewg' }, { text: 'Ninguno reacciona', note: hi.r > 0 ? 'Con NO₂ en orto/para sí hay SNA.' : 'Revisa los NO₂.' }],
        { concept: 'sea.sna', slide: 49, hint: '¿Cuántos NO₂ hay en orto o para al Cl?', explain: `${hi.n}: más atractores en orto/para.` });
    }
  };

  /* Bases */
  const bases = {
    id: 'bases', title: 'Electrófilos y carbocationes', mission: null, concepts: ['base.electrofilo', 'base.carbocation'],
    make(rng, level, want) {
      const c = want || pick(rng, this.concepts);
      if (c === 'base.electrofilo') { const x = pick(rng, [['NO₂⁺', 'e'], ['OH⁻', 'n'], ['NH₃', 'n'], ['SO₃', 'e'], ['(CH₃)₃C⁺', 'e'], ['CH₃O⁻', 'n'], ['CH₃C≡O⁺ (acilio)', 'e'], ['H₂O', 'n'], ['Br⁺ (del Br₂/FeBr₃)', 'e']]);
        return choice(rng, `${x[0]} es…`, x[1] === 'e' ? 'Un electrófilo' : 'Un nucleófilo', [{ text: x[1] === 'e' ? 'Un nucleófilo' : 'Un electrófilo', note: 'Electrófilo: pobre en electrones (+ o δ+). Nucleófilo: tiene pares o π para dar.' }, { text: 'Ninguno', note: 'Es uno de los dos.' }], { concept: c, slide: 6, hint: '¿Busca o da electrones?', explain: x[1] === 'e' ? 'Busca electrones.' : 'Da electrones.' }); }
      const set = [['CH₃⁺', 0], ['CH₃CH₂⁺ (1°)', 1], ['(CH₃)₂CH⁺ (2°)', 2], ['(CH₃)₃C⁺ (3°)', 3], ['CH₃O–CH₂⁺ (O vecino comparte su par)', 4]];
      const pickS = sample(rng, level <= 2 ? set.slice(0, 4) : set, level <= 2 ? 3 : 4), sorted = [...pickS].sort((a, b) => a[1] - b[1]);
      return order('Ordena de MENOS a MÁS estable:', pickS.map(([t], i) => ({ id: 'x' + i, text: t })), sorted.map(x => 'x' + pickS.indexOf(x)), { concept: c, slide: 17, direction: 'De menos a más estable.', hint: 'Alquilos, resonancia y pares vecinos estabilizan.', explain: sorted.map(x => x[0]).join(' < ') + '.' });
    }
  };

  const generators = [orientar, multiples, reactivos, friedel, sintesis, sna, bases];

  /* Laboratorio: rutas de síntesis desde benceno */
  const S = (id, name, formula) => ({ id, name, formula });
  const substances = [S('bz', 'Benceno', 'C₆H₆'), S('brbz', 'Bromobenceno', 'C₆H₅Br'), S('nbz', 'Nitrobenceno', 'C₆H₅NO₂'), S('an', 'Anilina', 'C₆H₅NH₂'), S('tol', 'Tolueno', 'C₆H₅CH₃'), S('acf', 'Acetofenona', 'C₆H₅COCH₃'),
    S('etbz', 'Etilbenceno', 'C₆H₅CH₂CH₃'), S('mbn', 'm-Bromonitrobenceno', 'meta'), S('opbn', 'o- y p-Bromonitrobenceno', 'orto + para'), S('mna', 'm-Nitroacetofenona', 'meta'), S('opnt', 'o- y p-Nitrotolueno', 'orto + para'), S('sulf', 'Ácido bencenosulfónico', 'C₆H₅SO₃H'), S('tba', '2,4,6-Tribromoanilina', 'sin catalizador')];
  const reagents = [['br', 'Br₂ / FeBr₃'], ['br2aq', 'Br₂ en agua (sin catalizador)'], ['nit', 'HNO₃ / H₂SO₄'], ['red', 'Fe / HCl, luego NaOH'], ['sul', 'SO₃ / H₂SO₄'], ['desul', 'H₂SO₄ diluido, calor'], ['me', 'CH₃Cl / AlCl₃'], ['acil', 'CH₃COCl / AlCl₃'], ['clem', 'Zn(Hg) / HCl']].map(([id, label]) => ({ id, label }));
  const RX = {
    'bz>br': ['brbz', 'Halogenación: el FeBr₃ activa el Br₂.'], 'bz>nit': ['nbz', 'Nitración: el electrófilo es NO₂⁺.'], 'bz>sul': ['sulf', 'Sulfonación con SO₃.'], 'sulf>desul': ['bz', 'La sulfonación es reversible.'],
    'bz>me': ['tol', 'Alquilación de Friedel-Crafts (CH₃⁺ no se reordena).'], 'bz>acil': ['acf', 'Acilación de Friedel-Crafts: sale una fenona.'], 'acf>clem': ['etbz', 'Clemmensen: el C=O pasa a CH₂.'],
    'nbz>red': ['an', 'El NO₂ se reduce a NH₂.'], 'nbz>br': ['mbn', 'El NO₂ es meta-orientador: el Br entra en meta (lento, está desactivado).'], 'brbz>nit': ['opbn', 'El Br desactiva pero orienta a orto/para.'],
    'acf>nit': ['mna', 'El acetilo es meta-orientador.'], 'tol>nit': ['opnt', 'El CH₃ activa y orienta a orto/para (25 veces más rápido que el benceno).'], 'an>br2aq': ['tba', 'El NH₂ activa tanto que no hace falta catalizador: entran 3 Br.']
  };
  function react(from, rid) {
    const r = RX[`${from}>${rid}`]; if (r) return { to: r[0], ok: true, why: r[1] };
    if (['me', 'acil'].includes(rid) && ['nbz', 'acf', 'sulf', 'mbn', 'mna'].includes(from)) return { to: null, ok: false, why: 'Friedel-Crafts falla con anillos fuertemente desactivados. Hazlo antes de poner el grupo desactivador.' };
    if (rid === 'br2aq') return { to: null, ok: false, why: 'Sin catalizador solo se brominan anillos muy activados (anilina, fenol, anisol).' };
    if (rid === 'red') return { to: null, ok: false, why: 'Fe/HCl reduce grupos nitro; aquí no hay uno para reducir.' };
    if (rid === 'clem') return { to: null, ok: false, why: 'Clemmensen reduce un C=O de cetona; aquí no hay.' };
    if (rid === 'desul') return { to: null, ok: false, why: 'Solo sirve para quitar un SO₃H.' };
    return { to: null, ok: false, why: 'En este laboratorio esa combinación no lleva a un producto de la clase. Prueba otra ruta.' };
  }
  const lab = { substances, reagents, react, total: Object.keys(RX).length, starts: ['bz', 'nbz', 'brbz', 'tol', 'an', 'acf'] };

  const creatures = {
    'base.electrofilo': ['Chispa', '#d6a23f'], 'base.carbocation': ['Gólem', '#8a6fd1'], 'sea.mecanismo': ['Espectro', '#7aa4b5'], 'sea.halogenacion': ['Trasgo', '#7f9a3c'], 'sea.nitracion': ['Hidra', '#c0574a'],
    'sea.activadores': ['Serpiente', '#5f9e5a'], 'sea.halogenos': ['Niebla', '#7fa3a0'], 'sea.multiples': ['Duende', '#6d8bd6'], 'sea.friedel': ['Grifo', '#c98a1b'], 'sea.sintesis': ['Escriba', '#a07a4a'], 'sea.sna': ['Búho', '#5d6f9e']
  };

  window.NexoClassGen = window.NexoClassGen || {};
  window.NexoClassGen['org-05'] = { LEVELS, source: SRC, generators, lab, creatures };
})();
