/* Ejercicios infinitos de Aromaticidad (Orgánica II, PEP 1). 5 niveles: 1 Fácil · 2 Media · 3 Intermedia · 4 Avanzada · 5 Nivel PEP.
   Las clasificaciones salen de una tabla de especies (electrones π, si es plana y continua); la respuesta se deduce, no se escribe. */
(() => {
  'use strict';
  const SRC = 'catedra-aromaticos';
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
  const number = (prompt, answer, unit, extra) => ({ type: 'number', prompt, answer, unit, tol: 0, ...extra, traps: (extra.traps || []).filter(t => t.value !== answer && Number.isFinite(t.value)) });

  /* ════════ Tabla de especies: π, si cumple criterios, y por qué ════════ */
  // ok = cíclico, plano y con un p en cada átomo; lvl = dificultad mínima
  const SP = [
    { n: 'benceno', pi: 6, ok: true, lvl: 1, why: '6 C sp² y 3 dobles enlaces' },
    { n: 'ciclobutadieno (plano)', pi: 4, ok: true, lvl: 1, why: '2 dobles enlaces en un anillo plano' },
    { n: 'ciclooctatetraeno', pi: 8, ok: false, lvl: 2, why: 'se dobla en forma de tina: los p no forman un anillo continuo' },
    { n: 'ciclohexa-1,3-dieno', pi: 4, ok: false, lvl: 1, why: 'tiene dos CH₂ sp³ que cortan el anillo' },
    { n: 'ciclopentadieno (C₅H₆)', pi: 4, ok: false, lvl: 2, why: 'el CH₂ sp³ corta el anillo' },
    { n: 'anión ciclopentadienilo', pi: 6, ok: true, lvl: 2, ion: true, why: '2 dobles enlaces (4 e⁻) + el par del carbanión (2 e⁻)' },
    { n: 'catión ciclopentadienilo', pi: 4, ok: true, lvl: 3, ion: true, why: '2 dobles enlaces (4 e⁻) + un p vacío' },
    { n: 'catión tropilio (C₇H₇⁺)', pi: 6, ok: true, lvl: 3, ion: true, why: '3 dobles enlaces (6 e⁻) + un p vacío' },
    { n: 'catión ciclopropenilo', pi: 2, ok: true, lvl: 3, ion: true, why: '1 doble enlace (2 e⁻) + un p vacío' },
    { n: 'anión cicloheptatrienilo', pi: 8, ok: true, lvl: 4, ion: true, why: '3 dobles enlaces (6 e⁻) + el par del carbanión (2 e⁻)' },
    { n: 'naftaleno', pi: 10, ok: true, lvl: 2, why: '5 dobles enlaces en dos anillos fusionados planos' },
    { n: '[18]anuleno', pi: 18, ok: true, lvl: 4, why: '9 dobles enlaces en un anillo grande que sí puede ser plano' },
    { n: '[10]anuleno (todo-cis)', pi: 10, ok: false, lvl: 4, why: 'no puede ser plano: demasiada tensión de ángulo' },
    { n: 'dianión del ciclooctatetraeno', pi: 10, ok: true, lvl: 5, ion: true, why: '4 dobles enlaces (8 e⁻) + 2 cargas negativas (2 e⁻): se aplana' },
    { n: 'piridina', pi: 6, ok: true, lvl: 2, het: true, why: '3 dobles enlaces; el par del N está en el plano y no cuenta' },
    { n: 'pirrol', pi: 6, ok: true, lvl: 2, het: true, why: '2 dobles enlaces + el par del N–H en el orbital p' },
    { n: 'furano', pi: 6, ok: true, lvl: 3, het: true, why: '2 dobles enlaces + uno de los pares del O' },
    { n: 'tiofeno', pi: 6, ok: true, lvl: 3, het: true, why: '2 dobles enlaces + uno de los pares del S' },
    { n: 'imidazol', pi: 6, ok: true, lvl: 4, het: true, why: '2 dobles enlaces + el par del N–H; el N tipo piridina no aporta su par' },
    { n: 'pirimidina', pi: 6, ok: true, lvl: 4, het: true, why: '3 dobles enlaces; los pares de los dos N quedan en el plano' }
  ];
  const kind = s => (!s.ok ? 'No aromático' : s.pi % 4 === 2 ? 'Aromático' : 'Antiaromático');
  const KINDS = ['Aromático', 'Antiaromático', 'No aromático'];
  const NOTE = { 'Aromático': 'Aromático necesita anillo plano y continuo con 4n + 2 electrones π.', 'Antiaromático': 'Antiaromático necesita anillo plano y continuo con 4n electrones π.', 'No aromático': 'No aromático es cuando falla un criterio (sp³ o no plano).' };
  const pool = (rng, level, f = () => true) => pick(rng, SP.filter(s => s.lvl <= level && f(s)));

  const huckel = {
    id: 'huckel', title: 'Aromático, antiaromático o no', mission: 'm2', concepts: ['ar.huckel', 'ar.criterios', 'ar.iones'],
    make(rng, level, want) {
      const c = want || pick(rng, this.concepts);
      const f = c === 'ar.iones' ? s => s.ion : c === 'ar.criterios' ? s => !s.ion && !s.het : s => !s.ion;
      const s = pool(rng, Math.max(level, c === 'ar.iones' ? 2 : 1), f), k = kind(s);
      if (c === 'ar.iones' && level >= 3 && level !== 5) {
        return number(`¿Cuántos electrones π tiene el ${s.n}?`, s.pi, 'e⁻', { concept: c, slide: 23, label: 'electrones π', hint: 'Catión: p vacío (0 e⁻); anión: p con 2 e⁻.',
          traps: [{ value: s.pi + 2, note: 'Contaste electrones de más: un catión no aporta electrones.', misconception: 'ion-count' }, { value: s.pi - 2, note: 'Falta el par del carbanión.', misconception: 'ion-count' }],
          solution: [`${s.why}`, `Total: ${s.pi} electrones π → ${k.toLowerCase()}`], explain: `${s.pi} π: ${s.why}.` });
      }
      const mc = !s.ok ? 'skip-planarity' : s.ion ? 'ion-count' : 'huckel-4n';
      return choice(rng, `${level === 5 ? 'Estilo PEP (P1): ' : ''}El ${s.n} es…`, k, KINDS.filter(x => x !== k).map(text => ({ text, note: NOTE[text], misconception: mc })),
        { concept: c, slide: s.ion ? 23 : s.ok ? 20 : 19, hint: 'Primero: ¿cíclico, plano y con un p en cada átomo? Después cuenta π.', explain: `${k}: ${s.why}${s.ok ? ` (${s.pi} electrones π)` : ''}.` });
    }
  };

  const hetero = {
    id: 'hetero', title: 'Heterociclos', mission: 'm3', concepts: ['ar.heterociclos'],
    make(rng, level) {
      const s = pool(rng, Math.max(2, level), x => x.het);
      const art = ['piridina', 'pirimidina'].includes(s.n) ? 'la' : 'el';
      if (level <= 2) return number(`¿Cuántos electrones π tiene ${art} ${s.n}?`, s.pi, 'e⁻', { concept: 'ar.heterociclos', slide: 24, label: 'electrones π', hint: '¿El par del heteroátomo está en p o en el plano?',
        traps: [{ value: s.pi + 2, note: 'Contaste un par que está en el plano.', misconception: 'count-all-pairs' }, { value: s.pi - 2, note: 'Falta el par que sí entra al orbital p.' }], solution: [s.why, `Total: ${s.pi} → aromático`], explain: `${s.pi} π.` });
      const pairs = [
        ['N de la piridina', false], ['N del pirrol', true], ['O del furano (un par)', true], ['S del tiofeno (un par)', true], ['N–H del imidazol', true], ['N tipo piridina del imidazol', false], ['N de la pirimidina', false]];
      const [n, inside] = pick(rng, pairs), right = inside ? 'Sí: está en el orbital p y completa los 6 π' : 'No: está en un sp², en el plano del anillo';
      if (level === 5) {
        const pair = sample(rng, [['piridina', 5.2], ['pirrol', -3.8], ['imidazol', 7.0], ['anilina', 4.6]], 2), best = pair[0][1] > pair[1][1] ? pair[0] : pair[1], other = best === pair[0] ? pair[1] : pair[0];
        return choice(rng, `Estilo PEP: ¿cuál es la base más fuerte: ${pair[0][0]} o ${pair[1][0]}?`, `La ${best[0] === 'pirrol' ? 'molécula de pirrol' : best[0]}`, [{ text: `La ${other[0] === 'pirrol' ? 'molécula de pirrol' : other[0]}`, note: `pKaH: ${best[0]} ≈ ${String(best[1]).replace('.', ',')}; ${other[0]} ≈ ${String(other[1]).replace('.', ',').replace('-', '−')}.`, misconception: 'count-all-pairs' }, { text: 'Son igual de básicas', note: 'Depende de si el par está libre o comprometido en el anillo.' }],
          { concept: 'ar.heterociclos', slide: 49, hint: '¿El par que capta el H⁺ está libre o es parte del anillo aromático?', explain: `${best[0]} (pKaH ≈ ${String(best[1]).replace('.', ',')}): su par está más disponible.` });
      }
      return choice(rng, `¿El par libre del ${n} forma parte del sistema π aromático?`, right, [{ text: inside ? 'No: está en un sp², en el plano del anillo' : 'Sí: está en el orbital p y completa los 6 π', note: 'Si el átomo ya tiene un doble enlace en el anillo, su par queda en el plano.', misconception: 'count-all-pairs' }, { text: 'Depende del solvente', note: 'Depende de la estructura, no del solvente.' }],
        { concept: 'ar.heterociclos', slide: 49, hint: '¿Ese átomo tiene un doble enlace en el anillo?', explain: right + '.' });
    }
  };

  /* ════════ Benceno y estabilidad ════════ */
  const benceno = {
    id: 'benceno', title: 'El benceno', mission: 'm1', concepts: ['ar.benceno', 'ar.estabilidad'],
    make(rng, level, want) {
      const c = want || pick(rng, this.concepts);
      if (c === 'ar.estabilidad' && level >= 3) {
        const cases = [{ n: 'benceno', k: 3, real: 208 }, { n: 'ciclohexa-1,3-dieno', k: 2, real: 232 }, { n: 'naftaleno (hasta decalina, 5 C=C)', k: 5, real: 333 }];
        const x = level === 3 ? cases[0] : pick(rng, cases), base = level >= 4 ? pick(rng, [118, 120, 122]) : 120, e = x.k * base - x.real;
        return number(`${level === 5 ? 'Estilo PEP: ' : ''}Si un C=C aislado libera ${base} kJ/mol al hidrogenarse y el ${x.n} libera ${x.real} kJ/mol, ¿cuál es su energía de resonancia?`, e, 'kJ/mol',
          { concept: 'ar.estabilidad', slide: 8, label: 'E. resonancia', tol: 0.02, hint: `Esperado: ${x.k} × ${base}.`, traps: [{ value: x.k * base + x.real, note: 'Se resta, no se suma.' }, { value: (x.k - 1) * base - x.real, note: `Cuenta bien los dobles enlaces: son ${x.k}.` }],
            solution: [`Esperado: ${x.k} × ${base} = ${x.k * base} kJ/mol`, `Energía de resonancia = ${x.k * base} − ${x.real} = ${e} kJ/mol`], explain: `${e} kJ/mol.` });
      }
      const bank = c === 'ar.benceno' ? [
        ['¿Qué ángulo C–C–C tiene el benceno?', '120°', [['109,5°', 'Ese es sp³.'], ['180°', 'Ese es sp.']]],
        ['Los C–C del benceno son…', 'Todos iguales (orden 1½)', [['Alternados simples y dobles', 'Kekulé son formas de resonancia, no la molécula real.'], ['Todos dobles', 'No hay electrones para eso.']], 'kekule-alternating'],
        ['¿Qué hibridación tienen los C del benceno?', 'sp²', [['sp³', 'No tendrían p libre.'], ['sp', 'Serían lineales.']]],
        ['El círculo dentro del hexágono representa…', 'Los 6 electrones π deslocalizados', [['Un anillo de H', 'Los H están afuera.'], ['Un ion', 'El benceno es neutro.']]],
        ['¿Cuál es la fórmula molecular del benceno?', 'C₆H₆', [['C₆H₁₂', 'Ese es el ciclohexano.'], ['C₆H₁₀', 'Ese es el ciclohexeno.']]]
      ] : [
        ['¿Qué hace el benceno con Br₂ en CCl₄, sin catalizador?', 'Nada: el color se mantiene', [['Decolora el Br₂ por adición', 'Eso hacen los alquenos.'], ['Forma bromobenceno', 'Sin FeBr₃ no hay electrófilo suficiente.']], 'benzene-adds'],
        ['¿Qué hace el benceno con KMnO₄?', 'No reacciona', [['Forma un glicol', 'Eso hacen los alquenos.'], ['Se rompe el anillo', 'El anillo aromático es muy estable.']], 'benzene-adds'],
        ['¿Qué pasa con benceno + Br₂ + FeBr₃?', 'Sustitución: bromobenceno + HBr', [['Adición: dibromociclohexadieno', 'La adición rompería la aromaticidad.'], ['Nada', 'Con FeBr₃ sí reacciona.']], 'benzene-adds'],
        ['¿Por qué el benceno libera menos calor al hidrogenarse que 3 C=C aislados?', 'Porque ya es más estable (energía de resonancia)', [['Porque reacciona más lento', 'La velocidad no cambia el calor liberado.'], ['Porque tiene menos H', 'Termina igual en ciclohexano.']]]
      ];
      const [p, a, ds, mc] = pick(rng, bank);
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${p}`, a, ds.map(([text, note]) => ({ text, note, misconception: mc })), { concept: c, slide: c === 'ar.benceno' ? 4 : 7, hint: 'Piensa en el anillo aromático y su estabilidad.', explain: a + '.' });
    }
  };

  /* ════════ Nombres ════════ */
  const SUBS = [['–CH₃', 'tolueno', 'metil'], ['–OH', 'fenol', 'hidroxi'], ['–NH₂', 'anilina', 'amino'], ['–OCH₃', 'anisol', 'metoxi'], ['–COOH', 'ácido benzoico', 'carboxi'], ['–CHO', 'benzaldehído', 'formil'], ['–COCH₃', 'acetofenona', 'acetil'], ['–CH=CH₂', 'estireno', 'vinil'], ['–CN', 'benzonitrilo', 'ciano']];
  const HAL = [['Br', 'bromo'], ['Cl', 'cloro'], ['NO₂', 'nitro'], ['F', 'fluoro']];
  const nombres = {
    id: 'nombres', title: 'Nombrar derivados', mission: 'm3', concepts: ['ar.nombres'],
    make(rng, level) {
      if (level <= 2) { const [g, n] = pick(rng, SUBS), others = sample(rng, SUBS.filter(x => x[1] !== n), 3);
        return choice(rng, `¿Cómo se llama C₆H₅${g}?`, n.charAt(0).toUpperCase() + n.slice(1), others.map(([og, on]) => ({ text: on.charAt(0).toUpperCase() + on.slice(1), note: `${on} es C₆H₅${og}.` })),
          { concept: 'ar.nombres', slide: 33, hint: 'Nombres comunes aceptados por IUPAC.', explain: `C₆H₅${g} = ${n}.` }); }
      if (level === 3) { const pos = pick(rng, [[2, 'orto', 'o'], [3, 'meta', 'm'], [4, 'para', 'p']]), [, base] = pick(rng, SUBS.slice(0, 3)), [, hal] = pick(rng, HAL);
        return choice(rng, `El ${pos[2]}-${hal}${base} (${pos[1]}) tiene los grupos en…`, `1,${pos[0]}`, [2, 3, 4].filter(x => x !== pos[0]).map(x => ({ text: `1,${x}`, note: 'orto 1,2; meta 1,3; para 1,4.', misconception: 'omp-numbers' })),
          { concept: 'ar.nombres', slide: 35, hint: 'o = 1,2; m = 1,3; p = 1,4.', explain: `${pos[1]} = 1,${pos[0]}.` }); }
      const [, base, ] = pick(rng, [SUBS[1], SUBS[2], SUBS[0]]), [, h] = pick(rng, HAL), locs = pick(rng, [[2, 4], [2, 6], [3, 5], [2, 4, 6]]);
      const pre = { 2: 'di', 3: 'tri' }[locs.length], right = `${locs.join(',')}-${pre}${h}${base}`;
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}Un ${base} lleva ${locs.length} ${h === 'nitro' ? 'grupos nitro' : 'átomos de ' + h} en las posiciones ${locs.join(', ')} (el grupo del nombre base es el C1). ¿Nombre correcto?`, right,
        [{ text: `${pre}${h}${base}`, note: 'Faltan los localizadores: con varios sustituyentes hay que numerar.' }, { text: `${locs.length === 2 ? 'o,p' : 'o,o,p'}-${pre}${h}${base}`, note: 'Con 3 o más sustituyentes (contando el del nombre base) se usan números.', misconception: 'omp-numbers' }, { text: `1-${base === 'fenol' ? 'hidroxi' : base === 'anilina' ? 'amino' : 'metil'}-${locs.map(l => l).join(',')}-${pre}${h}benceno`, note: `El nombre base común es ${base}: no hace falta decir benceno.` }],
        { concept: 'ar.nombres', slide: 36, hint: 'Nombre base común (C1), números bajos, orden alfabético.', explain: `${right}.` });
    }
  };

  /* ════════ Espectroscopía ════════ */
  const espectro = {
    id: 'espectro', title: 'Huellas espectroscópicas', mission: 'm3', concepts: ['ar.espectro'],
    make(rng, level) {
      if (level >= 4) { const n = pick(rng, [1, 2, 3, 4, 5]), M = 78 + 14 * n, name = ['tolueno', 'etilbenceno', 'propilbenceno', 'butilbenceno', 'pentilbenceno'][n - 1];
        const askBase = level === 5 || rng() < 0.5;
        return number(askBase ? `${level === 5 ? 'Estilo PEP: ' : ''}En el espectro de masas del ${name}, ¿a qué m/z aparece el pico del ion tropilio?` : `¿A qué m/z aparece el ion molecular del ${name} (C₆H₅–C${n > 1 ? 'ₙ' : ''}H…)? (C = 12, H = 1)`, askBase ? 91 : M, '',
          { concept: 'ar.espectro', slide: 48, label: 'm/z', hint: askBase ? 'C₇H₇⁺.' : `C${6 + n}H${6 + 2 * n}.`, traps: askBase ? [{ value: 77, note: '77 es el fenilo C₆H₅⁺.' }, { value: M, note: 'Ese es el ion molecular.' }] : [{ value: 91, note: 'Ese es el tropilio, no el ion molecular.' }],
            solution: askBase ? ['Escisión bencílica → catión bencilo → tropilio C₇H₇⁺', '7(12) + 7(1) = 91'] : [`C${6 + n}H${6 + 2 * n}: ${6 + n}(12) + ${6 + 2 * n}(1) = ${M}`], explain: `m/z ${askBase ? 91 : M}.` }); }
      const bank = [
        ['¿Dónde aparece el estiramiento C=C aromático en IR?', '≈ 1600 cm⁻¹', [['1640–1680 cm⁻¹', 'Ese es un alqueno aislado.'], ['≈ 1715 cm⁻¹', 'Ese es un C=O.']], 'ir-alkene', 43],
        ['¿Dónde salen los H aromáticos en RMN ¹H?', '7–9 ppm', [['5–6 ppm', 'Esos son H vinílicos.'], ['1–2 ppm', 'Esos son H alquílicos.']], 'ir-alkene', 44],
        ['¿Dónde salen los C aromáticos en RMN ¹³C?', '120–150 ppm', [['10–40 ppm', 'C alquílicos.'], ['190–210 ppm', 'C=O de cetonas y aldehídos.']], null, 45],
        ['¿Qué J tienen dos H aromáticos en orto?', '≈ 8 Hz', [['≈ 2 Hz', 'Ese es meta.'], ['≈ 0 Hz', 'Los orto sí se acoplan.']], null, 44],
        ['El estiramiento =C–H aromático aparece…', 'Sobre 3000 cm⁻¹ (≈ 3030)', [['Bajo 3000 cm⁻¹', 'Bajo 3000 son C–H sp³.'], ['≈ 3300 cm⁻¹ ancho', 'Eso es O–H o N–H.']], null, 43],
        ['Un grupo nitro en el anillo mueve los H aromáticos en RMN ¹H hacia…', 'Campo bajo (más ppm)', [['Campo alto (menos ppm)', 'Eso hacen los donadores (OH, OCH₃, NH₂).'], ['No los mueve', 'Los sustituyentes sí los mueven.']], null, 44]
      ];
      const [p, a, ds, mc, sl] = pick(rng, level === 1 ? bank.slice(0, 2) : bank);
      return choice(rng, p, a, ds.map(([text, note]) => ({ text, note, misconception: mc || undefined })), { concept: 'ar.espectro', slide: sl, hint: 'IR en cm⁻¹, RMN en ppm.', explain: a + '.' });
    }
  };

  /* ════════ Bases ════════ */
  const bases = {
    id: 'bases', title: 'Hibridación y resonancia', mission: null, concepts: ['base.hibridacion', 'base.resonancia'],
    make(rng, level, want) {
      const c = want || pick(rng, this.concepts);
      if (c === 'base.hibridacion') {
        const at = pick(rng, [['C de un CH₃', 'sp³'], ['C de un C=C', 'sp²'], ['C de un carbocatión plano', 'sp²'], ['C de un C≡C', 'sp'], ['N de la piridina', 'sp²'], ['N del pirrol', 'sp²'], ['C de un CH₂ del ciclopentadieno', 'sp³'], ['N del amoníaco', 'sp³'], ['O del furano', 'sp²']]);
        if (level >= 4 && at[1] !== 'sp³') return number(`¿Cuántos orbitales p sin hibridar tiene un átomo ${at[1]}?`, { 'sp²': 1, 'sp': 2 }[at[1]], '', { concept: c, slide: 18, label: 'orbitales p', tol: 0, hint: 'sp³ usa los 3 p; sp² usa 2; sp usa 1.', traps: [], solution: [`${at[1]}: ${{ 'sp³': 'ninguno', 'sp²': 'uno', 'sp': 'dos' }[at[1]]}`], explain: `${at[1]}.` });
        return choice(rng, `¿Qué hibridación tiene el ${at[0]}?`, at[1], ['sp³', 'sp²', 'sp'].filter(x => x !== at[1]).map(text => ({ text, note: 'Cuenta grupos: 4 → sp³; 3 → sp²; 2 → sp (los pares que entran al anillo π no cuentan como grupo).' })),
          { concept: c, slide: 18, hint: 'Cuenta grupos alrededor del átomo.', explain: `${at[1]}.` });
      }
      const bank = [['En resonancia, ¿qué se mueve?', 'Solo electrones (π y pares)', [['Átomos', 'Mover átomos da isómeros.'], ['Átomos de H', 'Eso es tautomería.']]],
        ['La estructura real de una molécula con resonancia es…', 'El híbrido de todas las formas', [['La forma más bonita', 'Ninguna forma dibujada es la real.'], ['Un equilibrio entre las formas', 'No hay equilibrio: es una sola molécula.']]],
        ['Más formas de resonancia equivalentes significa…', 'Más estabilidad', [['Menos estabilidad', 'Repartir carga o electrones estabiliza.'], ['Más reactividad siempre', 'Generalmente es al revés.']]]];
      const [p, a, ds] = pick(rng, bank);
      return choice(rng, p, a, ds.map(([text, note]) => ({ text, note })), { concept: c, slide: 4, hint: 'Resonancia ≠ equilibrio.', explain: a + '.' });
    }
  };

  const generators = [huckel, hetero, benceno, nombres, espectro, bases];

  /* Laboratorio: tomar un anillo y "quitarle" o "darle" algo; el sabio dice si queda aromático. */
  const S = (id, name, formula) => ({ id, name, formula });
  const substances = [S('cpd', 'Ciclopentadieno', 'C₅H₆ · no aromático (CH₂ sp³)'), S('cpa', 'Anión ciclopentadienilo', 'C₅H₅⁻ · 6 π · aromático'), S('cpc', 'Catión ciclopentadienilo', 'C₅H₅⁺ · 4 π · antiaromático'),
    S('cht', 'Cicloheptatrieno', 'C₇H₈ · no aromático (CH₂ sp³)'), S('trop', 'Catión tropilio', 'C₇H₇⁺ · 6 π · aromático'), S('cot', 'Ciclooctatetraeno', 'C₈H₈ · tina · no aromático'), S('cot2', 'Dianión del ciclooctatetraeno', 'C₈H₈²⁻ · 10 π · aromático'),
    S('pyr', 'Pirrol', '6 π · aromático'), S('pyrH', 'Pirrol protonado en el N', 'pierde la aromaticidad'), S('py', 'Piridina', '6 π · aromático'), S('pyH', 'Ion piridinio', '6 π · sigue aromático')];
  const reagents = [['base', 'Base fuerte (quita H⁺)'], ['hidruro', 'Quitar un hidruro (H⁻)'], ['k2', '2 K (agrega 2 electrones)'], ['acido', 'Ácido (agrega H⁺)']].map(([id, label]) => ({ id, label }));
  const RX = {
    'cpd>base': ['cpa', 'Se quita el H⁺ del CH₂: el C queda sp² con un par → 6 π aromático. Por eso el ciclopentadieno es tan ácido (pKa ≈ 16).'],
    'cpd>hidruro': ['cpc', 'Se quita H⁻: queda un p vacío → 4 π. Antiaromático: muy difícil de formar.'],
    'cht>hidruro': ['trop', 'Se quita H⁻ del CH₂: catión tropilio, 6 π aromático (aparece a m/z 91 en masas).'],
    'cot>k2': ['cot2', 'Con 2 electrones más tiene 10 π y se aplana: aromático.'],
    'pyr>acido': ['pyrH', 'Para captar el H⁺ el N usa su par, que era parte de los 6 π: se pierde la aromaticidad. Por eso el pirrol casi no es básico.'],
    'py>acido': ['pyH', 'El par del N estaba en el plano: captar el H⁺ no toca los 6 π. La piridina es una base normal (pKaH ≈ 5,2).']
  };
  const WHY = { base: 'No hay un H ácido que al salir deje un anillo aromático.', hidruro: 'Quitar un H⁻ aquí no deja un sistema aromático útil.', k2: 'Agregar electrones solo sirve en anillos planos que quedan con 4n + 2.', acido: 'No hay un par libre disponible para el H⁺ en este anillo.' };
  function react(fromId, rid) { const r = RX[`${fromId}>${rid}`]; return r ? { to: r[0], ok: true, why: r[1] } : { to: null, ok: false, why: WHY[rid] }; }
  const lab = { substances, reagents, react, total: Object.keys(RX).length, starts: ['cpd', 'cht', 'cot', 'pyr', 'py'] };

  const creatures = {
    'base.hibridacion': ['Duende', '#6d8bd6'], 'base.resonancia': ['Serpiente', '#5f9e5a'], 'ar.benceno': ['Espectro', '#7aa4b5'], 'ar.estabilidad': ['Gólem', '#8a6fd1'],
    'ar.criterios': ['Niebla', '#7fa3a0'], 'ar.huckel': ['Hidra', '#c0574a'], 'ar.iones': ['Chispa', '#d6a23f'], 'ar.heterociclos': ['Grifo', '#c98a1b'], 'ar.nombres': ['Escriba', '#a07a4a'], 'ar.espectro': ['Búho', '#5d6f9e']
  };

  window.NexoClassGen = window.NexoClassGen || {};
  window.NexoClassGen['org-04'] = { LEVELS, source: SRC, generators, lab, creatures };
})();
