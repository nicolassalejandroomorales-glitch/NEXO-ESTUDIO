/* Casos infinitos de "Digestivo: barrera, secreción, motilidad e hígado" (Fisiopatología, PEP 1). Niveles 1 Fácil … 5 Nivel PEP.
   La brecha osmolar se CALCULA; los casos salen de bancos de signos (Silbernagl y Lang). */
(() => {
  'use strict';
  const SRC = 'silbernagl';
  const LEVELS = ['Fácil', 'Media', 'Intermedia', 'Avanzada', 'Nivel PEP'];
  const pick = (rng, list) => list[Math.floor(rng() * list.length)];
  const shuffle = (rng, list) => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const between = (rng, a, b, step) => Math.round((a + rng() * (b - a)) / step) * step;
  const take = (rng, list, n) => shuffle(rng, list).slice(0, n);
  function choice(rng, prompt, correct, distractors, extra) {
    const seen = new Set([correct]);
    const ds = distractors.filter(d => d && d.text && !seen.has(d.text) && seen.add(d.text)).slice(0, extra.max || 3);
    const { max, ...rest } = extra;
    return { type: 'choice', prompt, options: shuffle(rng, [{ text: correct, correct: true }, ...ds]), ...rest };
  }
  function number(prompt, answer, unit, extra) {
    const tol = extra.tol ?? 0.02, traps = (extra.traps || []).filter(t => Number.isFinite(t.value) && Math.abs(t.value - answer) > Math.max(Math.abs(answer) * tol * 1.5, 3));
    return { type: 'number', prompt, answer, unit, tol, ...extra, traps };
  }
  const AGE = rng => pick(rng, ['Mujer de 28 años', 'Hombre de 52 años', 'Mujer de 67 años', 'Hombre de 40 años', 'Mujer de 45 años']);

  /* ════════ Esófago ════════ */
  const ESO = {
    erge: { label: 'ERGE', signs: ['pirosis después de comer', 'regurgitación ácida al acostarse', 'tos nocturna', 'hernia hiatal en la endoscopia', 'mejora con omeprazol'] },
    acal: { label: 'Acalasia', signs: ['disfagia a sólidos y líquidos desde el inicio', 'regurgitación de comida sin digerir', 'esófago dilatado con "pico de pájaro"', 'EEI que no se relaja en la manometría'] },
    cancer: { label: 'Obstrucción mecánica (cáncer de esófago)', signs: ['disfagia primero a sólidos y luego a líquidos', 'baja de peso', 'antecedente de esófago de Barrett', 'fumador y bebedor'] }
  };
  const esofago = {
    id: 'esofago', title: 'Esófago', mission: 'm1', concepts: ['fis.esofago'],
    make(rng, level) {
      const k = pick(rng, level <= 2 ? ['erge', 'acal'] : Object.keys(ESO)), e = ESO[k], s = take(rng, e.signs, level <= 2 ? 1 : level <= 4 ? 2 : 3);
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${AGE(rng)} con ${s.join(', ')}. ¿Diagnóstico más probable?`, e.label, Object.entries(ESO).filter(([kk]) => kk !== k).map(([, o]) => ({ text: o.label, note: `Esa daría ${take(rng, o.signs, 1)[0]}.`, misconception: 'achalasia-erge' })),
        { concept: 'fis.esofago', slide: 2, hint: '¿Sube el ácido o no baja la comida? ¿Cómo progresa la disfagia?', explain: `${e.label}.` });
    }
  };

  /* ════════ Úlcera ════════ */
  const ULC = [
    ['Mujer de 70 años con artrosis que toma naproxeno diario', 'AINE: ↓ prostaglandinas → ↓ moco y HCO₃⁻', 'Suspender el AINE e iniciar IBP'],
    ['Hombre de 35 años con úlcera duodenal y test de aire espirado (urea ¹³C) positivo', 'Helicobacter pylori: inflamación y alteración de la gastrina', 'IBP + dos antibióticos (erradicación)'],
    ['Paciente con úlceras múltiples en yeyuno que no responden a IBP y gastrina muy alta', 'Gastrinoma (Zollinger-Ellison): exceso de ácido', 'Buscar y resecar el tumor; IBP a dosis altas'],
    ['Paciente en UCI con quemaduras extensas y sangrado gástrico', 'Úlcera de estrés: ↓ flujo sanguíneo a la mucosa', 'Profilaxis con IBP y mejorar la perfusión']
  ];
  const ulcera = {
    id: 'ulcera', title: 'Úlcera: mecanismo y tratamiento', mission: 'm1', concepts: ['fis.ulcera'],
    make(rng, level) {
      const [c, mech, tx] = pick(rng, level <= 2 ? ULC.slice(0, 2) : ULC);
      if (level >= 4) return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${c}. ¿Tratamiento según el mecanismo?`, tx, ULC.filter(u => u[2] !== tx).map(u => ({ text: u[2], note: `Eso corresponde a: ${u[1].toLowerCase()}.`, misconception: 'ulcer-acid' })),
        { concept: 'fis.ulcera', slide: 3, hint: 'Primero el mecanismo, después el fármaco.', explain: `${mech} → ${tx}.` });
      return choice(rng, `${c}. ¿Mecanismo principal de la úlcera?`, mech, ULC.filter(u => u[1] !== mech).map(u => ({ text: u[1], note: 'Mira la pista clave del caso.', misconception: mech.startsWith('AINE') ? 'nsaid-mech' : 'ulcer-acid' })),
        { concept: 'fis.ulcera', slide: 3, hint: '¿Fármaco, bacteria, tumor o mala perfusión?', explain: mech + '.' });
    }
  };

  /* ════════ Fármacos ácido-péptico ════════ */
  const DRUGS = [['Omeprazol', 'Inhibe la H⁺/K⁺-ATPasa (bomba de protones)'], ['Famotidina', 'Bloquea el receptor H₂ de histamina'], ['Misoprostol', 'Análogo de prostaglandina E₁: repone la defensa'], ['Hidróxido de aluminio y magnesio', 'Neutraliza el ácido ya secretado'], ['Sucralfato', 'Forma una capa protectora sobre la úlcera']];
  const farmacos = {
    id: 'farmacos', title: 'Fármacos y su eslabón', mission: 'm1', concepts: ['base.secrecion'],
    make(rng, level) {
      const [d, m] = pick(rng, level <= 2 ? DRUGS.slice(0, 3) : DRUGS);
      if (level >= 4) return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}¿Qué fármaco actúa así? "${m}"`, d, DRUGS.filter(x => x[0] !== d).map(x => ({ text: x[0], note: x[1] + '.' })), { concept: 'base.secrecion', slide: 1, hint: 'Bomba, receptor, prostaglandina, neutralizar o cubrir.', explain: `${d}.` });
      return choice(rng, `¿Cómo actúa: ${d}?`, m, DRUGS.filter(x => x[0] !== d).map(x => ({ text: x[1], note: `Ese es: ${x[0]}.`, misconception: d === 'Misoprostol' ? 'nsaid-mech' : undefined })), { concept: 'base.secrecion', slide: 1, hint: '¿Qué eslabón de la secreción o defensa toca?', explain: m + '.' });
    }
  };

  /* ════════ Diarrea ════════ */
  const brecha = {
    id: 'brecha', title: 'Brecha osmolar fecal', mission: 'm2', concepts: ['fis.diarrea'],
    make(rng, level) {
      const osm = rng() < 0.5, na = osm ? between(rng, 15, 45, 1) : between(rng, 90, 100, 1), k = osm ? between(rng, 10, 30, 1) : between(rng, 32, 40, 1), b = 290 - 2 * (na + k);
      if (level <= 3) return number(`${level === 3 ? 'Diarrea crónica: ' : ''}Na⁺ fecal ${na} y K⁺ fecal ${k} mmol/L. Calcula la brecha osmolar fecal.`, b, 'mOsm/kg', { concept: 'fis.diarrea', slide: 5, label: 'brecha', tol: 0.03, hint: '290 − 2([Na⁺] + [K⁺]).',
        traps: [{ value: 290 - (na + k), note: 'Falta multiplicar por 2.' }, { value: 2 * (na + k), note: 'Falta restarlo a 290.' }], solution: [`2 × (${na} + ${k}) = ${2 * (na + k)}`, `290 − ${2 * (na + k)} = ${b} → ${b > 100 ? 'osmótica' : b < 50 ? 'secretora' : 'indeterminada'}`], explain: `${b}.` });
      const right = b > 100 ? 'Osmótica' : b < 50 ? 'Secretora' : 'Indeterminada';
      const ayuno = right === 'Osmótica' ? 'cede con el ayuno' : 'persiste aunque esté en ayuno';
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${AGE(rng)} con diarrea acuosa que ${ayuno}. Na⁺ fecal ${na} y K⁺ ${k} mmol/L. ¿Tipo de diarrea?`, right,
        ['Osmótica', 'Secretora', 'Inflamatoria'].filter(t => t !== right).map(text => ({ text, note: `Brecha = 290 − 2(${na} + ${k}) = ${b}.`, misconception: 'diarrhea-type' })),
        { concept: 'fis.diarrea', slide: 5, hint: 'Calcula la brecha y mira el ayuno.', explain: `Brecha ${b} → ${right.toLowerCase()}.` });
    }
  };
  const DIA = [['Déficit de lactasa', 'Osmótica'], ['Laxante de sulfato de magnesio', 'Osmótica'], ['Chicles con sorbitol en exceso', 'Osmótica'], ['Cólera', 'Secretora'], ['Tumor secretor de VIP', 'Secretora'], ['E. coli enterotoxigénica', 'Secretora'], ['Shigella con sangre y fiebre', 'Inflamatoria'], ['Colitis ulcerosa', 'Inflamatoria'], ['Insuficiencia pancreática exocrina', 'Malabsorción (esteatorrea)'], ['Enfermedad celíaca', 'Malabsorción (esteatorrea)']];
  const diarrea = {
    id: 'diarrea', title: 'Tipo de diarrea', mission: 'm2', concepts: ['fis.diarrea'],
    make(rng, level) {
      const [c, r] = pick(rng, level <= 2 ? DIA.filter(d => ['Osmótica', 'Secretora'].includes(d[1])) : DIA);
      const opts = level <= 2 ? ['Osmótica', 'Secretora'] : ['Osmótica', 'Secretora', 'Inflamatoria', 'Malabsorción (esteatorrea)'];
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}¿Qué tipo de diarrea produce: ${c}?`, r, opts.filter(o => o !== r).map(text => ({ text, note: 'Soluto que retiene agua, epitelio que secreta, inflamación o grasa sin digerir.', misconception: 'diarrhea-type' })),
        { concept: 'fis.diarrea', slide: r.startsWith('Mal') ? 6 : 5, hint: '¿Cuál es el mecanismo?', explain: `${r}.` });
    }
  };

  /* ════════ Ictericia ════════ */
  const ICT = {
    pre: { label: 'Prehepática (hemólisis)', signs: ['anemia', 'bilirrubina no conjugada alta', 'orina de color normal', 'LDH alta', 'reticulocitos altos'] },
    hep: { label: 'Hepática (hepatocelular)', signs: ['transaminasas muy elevadas', 'antecedente de hepatitis viral', 'bilirrubina mixta', 'malestar y náuseas'] },
    post: { label: 'Posthepática (colestásica)', signs: ['coluria', 'acolia', 'prurito', 'fosfatasa alcalina alta', 'vía biliar dilatada en la ecografía'] }
  };
  const ictericia = {
    id: 'ictericia', title: 'Tipo de ictericia', mission: 'm2', concepts: ['fis.higado'],
    make(rng, level) {
      const k = pick(rng, level <= 2 ? ['pre', 'post'] : Object.keys(ICT)), t = ICT[k], s = take(rng, t.signs, level <= 2 ? 1 : level <= 4 ? 2 : 3);
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${AGE(rng)} con ictericia y ${s.join(', ')}. ¿Qué tipo de ictericia?`, t.label, Object.entries(ICT).filter(([kk]) => kk !== k).map(([, o]) => ({ text: o.label, note: `Esa daría ${take(rng, o.signs, 1)[0]}.`, misconception: 'jaundice-type' })),
        { concept: 'fis.higado', slide: 7, hint: '¿Hay coluria? ¿Bilirrubina conjugada o no conjugada?', explain: `${t.label}.` });
    }
  };

  /* ════════ Cirrosis y pancreatitis ════════ */
  const CIR = [['Ascitis', 'Hipertensión portal + ↓ albúmina (+ retención de Na⁺)'], ['Várices esofágicas', 'Colaterales por hipertensión portal'], ['INR prolongado', '↓ síntesis de factores de coagulación'], ['Encefalopatía hepática', 'NH₃ que el hígado no elimina'], ['Edema de piernas', '↓ albúmina (↓ presión oncótica)'], ['Esplenomegalia', 'Congestión por hipertensión portal']];
  const cirrosis = {
    id: 'cirrosis', title: 'Cirrosis y pancreatitis', mission: 'm2', concepts: ['fis.higado'],
    make(rng, level) {
      if (level >= 4 && rng() < 0.5) { const s = take(rng, ['dolor epigástrico en cinturón', 'lipasa 5 veces sobre lo normal', 'antecedente de cálculos en la vesícula', 'vómitos', 'consumo de alcohol el fin de semana'], 3);
        return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${AGE(rng)} con ${s.join(', ')}. ¿Mecanismo central?`, 'Activación de tripsina dentro del páncreas → autodigestión', [{ text: 'Úlcera duodenal perforada', note: 'No explica la lipasa alta.', misconception: 'ulcer-acid' }, { text: 'Obstrucción del colédoco con ictericia hemolítica', note: 'Mezcla mecanismos.', misconception: 'jaundice-type' }, { text: 'Infarto intestinal', note: 'No explica la lipasa.' }],
          { concept: 'fis.higado', slide: 8, hint: 'Lipasa alta + dolor en cinturón.', explain: 'Pancreatitis aguda.' }); }
      const [c, m] = pick(rng, level <= 2 ? CIR.slice(0, 4) : CIR);
      const ctx = level >= 3 ? `${pick(rng, ['Hombre de 58 años con cirrosis alcohólica', 'Mujer de 61 años con cirrosis por hepatitis C'])}: ` : 'En la cirrosis, ';
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${ctx}¿por qué aparece: ${c.toLowerCase()}?`, m, CIR.filter(x => x[1] !== m).map(x => ({ text: x[1], note: `Eso explica: ${x[0].toLowerCase()}.` })),
        { concept: 'fis.higado', slide: 7, hint: '¿Es por la presión portal o por lo que el hígado deja de fabricar o eliminar?', explain: m + '.' });
    }
  };

  /* ════════ Bases ════════ */
  const bili = {
    id: 'bili', title: 'Bilirrubina', mission: null, concepts: ['base.agua'],
    make(rng, level) {
      const Q = [['¿Cuál bilirrubina va unida a albúmina en la sangre?', 'No conjugada', 'Conjugada'], ['¿Cuál bilirrubina aparece en la orina?', 'Conjugada', 'No conjugada'], ['¿Dónde se conjuga la bilirrubina?', 'En el hígado', 'En el bazo'], ['¿Qué da el color café a las heces?', 'Estercobilina (derivada de la bilirrubina)', 'Bilirrubina no conjugada']];
      const [p, r, wrong] = pick(rng, Q);
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${p}`, r, [{ text: wrong, note: 'Repasa el ciclo de la bilirrubina.', misconception: 'jaundice-type' }, { text: 'Ninguna de las anteriores', note: 'Hay una correcta.' }], { concept: 'base.agua', slide: 7, hint: 'La conjugada es hidrosoluble.', explain: r + '.' });
    }
  };

  const generators = [esofago, ulcera, farmacos, brecha, diarrea, ictericia, cirrosis, bili];

  /* Laboratorio "¿qué pasa si…?": casos digestivos y lo que les das. */
  const S = (id, name, formula) => ({ id, name, formula });
  const substances = [
    S('aine', 'Úlcera por AINE', 'PG bajas'), S('aine-ok', 'Úlcera cicatrizando', 'sin AINE + IBP'), S('hp', 'Úlcera por H. pylori', 'test de aire +'), S('hp-ok', 'H. pylori erradicado', 'baja la recurrencia'),
    S('lactosa', 'Déficit de lactasa con diarrea', 'brecha 190'), S('lactosa-ok', 'Sin lactosa', 'diarrea cesa'), S('colera', 'Cólera', 'diarrea secretora'), S('colera-ok', 'Hidratado', 'SGLT1 funcionando'),
    S('encef', 'Cirrótico con encefalopatía', 'NH₃ alto'), S('encef-ok', 'Encefalopatía mejorada', 'NH₄⁺ en el colon')
  ];
  const reagents = [['ibp', 'Suspender AINE + IBP'], ['erradicar', 'IBP + 2 antibióticos'], ['ayuno', 'Ayuno / sacar la lactosa'], ['sro', 'Sales de rehidratación oral'], ['lactulosa', 'Lactulosa'], ['aine', 'Dar más AINE']].map(([id, label]) => ({ id, label }));
  const RX = {
    'aine>ibp': ['aine-ok', 'Sin AINE vuelven las prostaglandinas; el IBP baja el ácido mientras cicatriza.'],
    'hp>erradicar': ['hp-ok', 'Al erradicar la bacteria, la úlcera casi no recurre.'],
    'lactosa>ayuno': ['lactosa-ok', 'Sin el soluto que retiene agua, la diarrea osmótica se detiene.'],
    'colera>sro': ['colera-ok', 'La glucosa arrastra Na⁺ por SGLT1 (que la toxina no bloquea) y el agua lo sigue.'],
    'encef>lactulosa': ['encef-ok', 'La lactulosa acidifica el colon: NH₃ → NH₄⁺, que no se absorbe y se elimina.']
  };
  const WHY_NOT = { aine: '¡No! Más AINE baja aún más las prostaglandinas y la defensa.', ayuno: 'El ayuno no corrige este mecanismo (en la secretora la diarrea sigue).', erradicar: 'Solo sirve si hay H. pylori.', sro: 'La rehidratación siempre ayuda, pero no corrige este mecanismo.', lactulosa: 'La lactulosa es un laxante osmótico: aquí no corresponde.', ibp: 'El IBP no corrige este mecanismo.' };
  function react(fromId, rid) {
    const r = RX[`${fromId}>${rid}`];
    if (r) return { to: r[0], ok: true, why: r[1] };
    if (fromId === 'lactosa' && rid === 'lactulosa') return { to: null, ok: false, why: '¡Empeora! La lactulosa es otro azúcar no absorbible: más diarrea osmótica.' };
    return { to: null, ok: false, why: WHY_NOT[rid] || 'No cambia este cuadro.' };
  }
  const lab = { substances, reagents, react, total: Object.keys(RX).length, starts: ['aine', 'hp', 'lactosa', 'colera', 'encef'] };

  const creatures = {
    'base.secrecion': ['Escriba', '#a07a4a'], 'base.agua': ['Niebla', '#7fa3a0'],
    'fis.esofago': ['Serpiente', '#5f9e5a'], 'fis.ulcera': ['Gólem', '#8a6fd1'], 'fis.diarrea': ['Trasgo', '#7f9a3c'], 'fis.higado': ['Hidra', '#c0574a']
  };

  window.NexoClassGen = window.NexoClassGen || {};
  window.NexoClassGen['fis-09'] = { LEVELS, source: SRC, generators, lab, creatures };
})();
