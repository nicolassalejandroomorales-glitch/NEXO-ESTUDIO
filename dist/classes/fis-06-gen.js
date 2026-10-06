/* Casos infinitos de "Respiratorio: ventilación e intercambio gaseoso" (Fisiopatología, PEP 1). Niveles 1 Fácil … 5 Nivel PEP.
   Los números (VEF₁/CVF, PAO₂, gradiente A-a) se CALCULAN; los casos clínicos salen de bancos (Silbernagl y Lang). */
(() => {
  'use strict';
  const SRC = 'silbernagl';
  const LEVELS = ['Fácil', 'Media', 'Intermedia', 'Avanzada', 'Nivel PEP'];
  const pick = (rng, list) => list[Math.floor(rng() * list.length)];
  const shuffle = (rng, list) => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const between = (rng, a, b, step) => Math.round((a + rng() * (b - a)) / step) * step;
  const dec = (x, d = 1) => Number(x).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: d }).replace('-', '−');
  const fix = (x, d) => Number(x).toLocaleString('es-CL', { minimumFractionDigits: d, maximumFractionDigits: d });
  function choice(rng, prompt, correct, distractors, extra) {
    const seen = new Set([correct]);
    const ds = distractors.filter(d => d && d.text && !seen.has(d.text) && seen.add(d.text)).slice(0, extra.max || 3);
    const { max, ...rest } = extra;
    return { type: 'choice', prompt, options: shuffle(rng, [{ text: correct, correct: true }, ...ds]), ...rest };
  }
  function number(prompt, answer, unit, extra) {
    const tol = extra.tol ?? 0.02, traps = (extra.traps || []).filter(t => Number.isFinite(t.value) && Math.abs(t.value - answer) > Math.max(Math.abs(answer) * tol * 1.5, 0.5));
    return { type: 'number', prompt, answer, unit, tol, ...extra, traps };
  }
  const PIO2 = fi => fi * 713;

  /* ════════ Espirometría ════════ */
  const espiro = {
    id: 'espiro', title: 'Leer una espirometría', mission: 'm1', concepts: ['fis.patron'],
    make(rng, level) {
      const kind = pick(rng, ['obs', 'res', 'normal']), cvf = kind === 'res' ? between(rng, 1.6, 2.6, 0.05) : between(rng, 3, 5, 0.05);
      const ratio = kind === 'obs' ? between(rng, 0.38, 0.66, 0.01) : between(rng, 0.74, 0.9, 0.01), vef = Number((cvf * ratio).toFixed(2)), r = vef / cvf;
      const cpt = kind === 'res' ? between(rng, 50, 75, 1) : kind === 'obs' ? between(rng, 100, 135, 1) : between(rng, 85, 115, 1);
      if (level <= 2) return number(`VEF₁ ${fix(vef, 2)} L y CVF ${fix(cvf, 2)} L. Calcula VEF₁/CVF.`, r, '', { concept: 'fis.patron', slide: 2, label: 'VEF₁/CVF', tol: 0.01, hint: 'Divide VEF₁ por CVF.',
        traps: [{ value: cvf / vef, note: 'Al revés.' }], solution: [`${fix(vef, 2)} / ${fix(cvf, 2)} = ${fix(r, 2)}${r < 0.7 ? ' → < 0,70: obstructivo' : ''}`], explain: `${fix(r, 2)}.` });
      const right = kind === 'obs' ? 'Obstructivo' : kind === 'res' ? 'Restrictivo' : 'Normal';
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}VEF₁ ${fix(vef, 2)} L, CVF ${fix(cvf, 2)} L${level >= 3 ? ` y CPT ${cpt} % de lo esperado` : ''}. ¿Qué patrón es?`, right,
        ['Obstructivo', 'Restrictivo', 'Normal'].filter(x => x !== right).map(text => ({ text, note: `VEF₁/CVF = ${fix(r, 2)}${level >= 3 ? `; CPT ${cpt} %` : ''}.`, misconception: 'obs-res' })),
        { concept: 'fis.patron', slide: 2, hint: 'Primero el cociente; después la CPT.', explain: `VEF₁/CVF = ${fix(r, 2)}${level >= 3 ? `, CPT ${cpt} %` : ''} → ${right.toLowerCase()}.` });
    }
  };

  /* ════════ Causas de cada patrón ════════ */
  const CAUSES = [['Asma', 'o'], ['EPOC', 'o'], ['Bronquiectasias', 'o'], ['Fibrosis pulmonar idiopática', 'r'], ['Cifoescoliosis grave', 'r'], ['Obesidad mórbida', 'r'], ['Esclerosis lateral amiotrófica', 'r'], ['Neumoconiosis (asbestosis)', 'r']];
  const causas = {
    id: 'causas', title: 'Causas de cada patrón', mission: 'm1', concepts: ['fis.patron'],
    make(rng, level) {
      const [c, k] = pick(rng, level <= 2 ? [CAUSES[0], CAUSES[1], CAUSES[3]] : CAUSES), right = k === 'o' ? 'Obstructivo' : 'Restrictivo';
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}¿Qué patrón espirométrico produce: ${c}?`, right, [{ text: k === 'o' ? 'Restrictivo' : 'Obstructivo', note: '¿Cuesta sacar el aire o llenar el pulmón?', misconception: 'obs-res' }, { text: 'Ninguno: la espirometría es normal', note: 'Esta causa sí altera la espirometría.' }],
        { concept: 'fis.patron', slide: k === 'o' ? 2 : 4, hint: 'Resistencia (vía aérea) frente a distensibilidad (pulmón o pared).', explain: `${c}: ${right.toLowerCase()}.` });
    }
  };

  /* ════════ Asma o EPOC ════════ */
  const AE = {
    asma: ['mejora > 12 % del VEF₁ con salbutamol', 'crisis con el polen', 'rinitis alérgica', 'eosinófilos elevados', 'síntomas desde la infancia', 'espirometría normal entre crisis'],
    epoc: ['fumador de 40 paquetes-año', 'tos con expectoración todas las mañanas', 'obstrucción que casi no mejora con salbutamol', 'disnea progresiva en años', 'difusión disminuida', 'tórax en tonel']
  };
  const asmaEpoc = {
    id: 'asma-epoc', title: 'Asma o EPOC', mission: 'm1', concepts: ['fis.asma'],
    make(rng, level) {
      const k = pick(rng, ['asma', 'epoc']), n = level <= 2 ? 1 : level <= 4 ? 2 : 3, s = shuffle(rng, AE[k]).slice(0, n), right = k === 'asma' ? 'Asma' : 'EPOC';
      const age = k === 'asma' ? between(rng, 16, 35, 1) : between(rng, 55, 78, 1);
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}Paciente de ${age} años con obstrucción bronquial: ${s.join(', ')}. ¿Diagnóstico más probable?`, right,
        [{ text: k === 'asma' ? 'EPOC' : 'Asma', note: 'Reversible y alérgico frente a tabaco y progresivo.', misconception: 'asthma-copd' }, { text: 'Fibrosis pulmonar', note: 'Es restrictiva.', misconception: 'obs-res' }],
        { concept: 'fis.asma', slide: 3, hint: '¿Es reversible? ¿Hay tabaco?', explain: `${right}.` });
    }
  };

  /* ════════ Gradiente A-a ════════ */
  const aa = {
    id: 'aa', title: 'Gas alveolar y gradiente A-a', mission: 'm2', concepts: ['fis.hipoxemia'],
    make(rng, level) {
      const hypo = rng() < 0.4, co2 = hypo ? between(rng, 55, 80, 1) : between(rng, 28, 42, 1), pao2A = PIO2(0.21) - co2 / 0.8;
      const grad = hypo ? between(rng, 3, 12, 1) : between(rng, 22, 55, 1), po2 = Math.round(pao2A - grad), G = pao2A - po2;
      if (level <= 2) return number(`Aire ambiental a nivel del mar (PiO₂ = 0,21 × 713 = 149,7 mmHg). PaCO₂ ${co2} mmHg. Calcula la PAO₂.`, pao2A, 'mmHg', { concept: 'fis.hipoxemia', slide: 6, label: 'PAO₂', tol: 0.01, hint: 'PAO₂ = 149,7 − PaCO₂/0,8.',
        traps: [{ value: PIO2(0.21) - co2 * 0.8, note: 'Multiplicaste por 0,8: es PaCO₂/0,8.' }, { value: PIO2(0.21) - co2, note: 'Falta dividir por 0,8.' }], solution: [`PAO₂ = 149,7 − ${co2}/0,8 = ${dec(pao2A)} mmHg`], explain: `${dec(pao2A)} mmHg.` });
      if (level === 3) return number(`Aire ambiental, nivel del mar: PaO₂ ${po2} y PaCO₂ ${co2} mmHg. Calcula el gradiente A-a.`, G, 'mmHg', { concept: 'fis.hipoxemia', slide: 6, label: 'A-a', tol: 0.05, hint: 'PAO₂ = 149,7 − PaCO₂/0,8; A-a = PAO₂ − PaO₂.',
        traps: [{ value: pao2A, note: 'Esa es la PAO₂: falta restar la PaO₂.' }, { value: PIO2(0.21) - po2, note: 'Falta restar PaCO₂/0,8.' }], solution: [`PAO₂ = 149,7 − ${co2}/0,8 = ${dec(pao2A)}`, `A-a = ${dec(pao2A)} − ${po2} = ${dec(G)} mmHg → ${G < 15 ? 'normal' : 'aumentado'}`], explain: `${dec(G)} mmHg.` });
      const right = G < 15 ? 'Hipoventilación (A-a normal): el pulmón está sano' : 'Problema del pulmón (A-a aumentado): V/Q, shunt o difusión';
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${hypo ? pick(rng, ['Tras una sobredosis de morfina', 'En una crisis miasténica', 'Con una cifoescoliosis grave descompensada']) : pick(rng, ['Con una neumonía', 'Con una embolia pulmonar', 'Con un edema pulmonar'])}: PaO₂ ${po2} y PaCO₂ ${co2} mmHg (aire, nivel del mar). ¿Mecanismo de la hipoxemia?`, right,
        ['Hipoventilación (A-a normal): el pulmón está sano', 'Problema del pulmón (A-a aumentado): V/Q, shunt o difusión', 'Altura (↓ PO₂ inspirada)'].filter(t => t !== right).map(text => ({ text, note: `A-a = ${dec(G)} mmHg.`, misconception: 'aa-gradient' })),
        { concept: 'fis.hipoxemia', slide: 5, hint: 'Calcula el gradiente A-a.', explain: `PAO₂ = ${dec(pao2A)}; A-a = ${dec(G)} → ${right}.` });
    }
  };

  /* ════════ Mecanismo de la hipoxemia ════════ */
  const MECH = [['Neumonía lobar que no corrige con O₂ al 100 %', 'Shunt'], ['Atelectasia postoperatoria', 'Shunt'], ['Edema pulmonar cardiogénico', 'Shunt'], ['Crisis de asma', 'Desequilibrio V/Q'], ['EPOC exacerbada que mejora con O₂ a bajo flujo', 'Desequilibrio V/Q'],
    ['Fibrosis pulmonar que desatura al caminar', 'Alteración de la difusión'], ['Sobredosis de benzodiacepinas con opioides', 'Hipoventilación'], ['Excursionista sano a 4500 m', '↓ PO₂ inspirada']];
  const KINDS = ['Shunt', 'Desequilibrio V/Q', 'Alteración de la difusión', 'Hipoventilación', '↓ PO₂ inspirada'];
  const mecanismo = {
    id: 'hipox-mec', title: 'Mecanismo de la hipoxemia', mission: 'm2', concepts: ['fis.hipoxemia'],
    make(rng, level) {
      const [c, r] = pick(rng, level <= 2 ? [MECH[0], MECH[3], MECH[6], MECH[7]] : MECH);
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${c}. ¿Mecanismo principal de la hipoxemia?`, r, KINDS.filter(k => k !== r).map(text => ({ text, note: '¿Pulmón sano? ¿Mejora con O₂? ¿Empeora con el ejercicio?', misconception: r === 'Shunt' || text === 'Shunt' ? 'shunt-o2' : 'aa-gradient' })),
        { concept: 'fis.hipoxemia', slide: 5, hint: '¿Mejora con O₂? ¿El pulmón está sano?', explain: `${r}.` });
    }
  };

  /* ════════ Insuficiencia respiratoria ════════ */
  const insuf = {
    id: 'insuf', title: 'Tipo de insuficiencia', mission: 'm2', concepts: ['fis.insuficiencia'],
    make(rng, level) {
      const t2 = rng() < 0.5, o2 = between(rng, 40, 58, 1), co2 = t2 ? between(rng, 52, 85, 1) : between(rng, 26, 40, 1);
      const right = t2 ? 'Tipo 2 (hipercápnica): falla de la bomba' : 'Tipo 1 (hipoxémica): falla del intercambio';
      const ctx = level >= 4 ? (t2 ? pick(rng, ['Paciente con ELA avanzada', 'EPOC grave agotado', 'Intoxicación por opioides']) : pick(rng, ['Paciente con neumonía bilateral', 'Edema pulmonar agudo', 'Embolia pulmonar'])) + ': ' : '';
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${ctx}PaO₂ ${o2} mmHg y PaCO₂ ${co2} mmHg. ¿Qué tipo de insuficiencia respiratoria?`, right,
        ['Tipo 2 (hipercápnica): falla de la bomba', 'Tipo 1 (hipoxémica): falla del intercambio', 'No hay insuficiencia respiratoria'].filter(x => x !== right).map(text => ({ text, note: 'PaO₂ < 60 = insuficiencia; PaCO₂ > 45–50 = tipo 2.', misconception: 'resp-failure' })),
        { concept: 'fis.insuficiencia', slide: 7, hint: 'Mira primero la PaCO₂.', explain: right + '.' });
    }
  };

  /* ════════ Bases ════════ */
  const volumenes = {
    id: 'volumenes', title: 'Volúmenes pulmonares', mission: null, concepts: ['base.volumenes'],
    make(rng, level) {
      const cv = between(rng, 3, 5.5, 0.05), vr = between(rng, 1, 2.2, 0.05);
      if (level <= 3) return number(`Capacidad vital ${fix(cv, 2)} L y volumen residual ${fix(vr, 2)} L. ¿Capacidad pulmonar total?`, cv + vr, 'L', { concept: 'base.volumenes', slide: 1, label: 'CPT', tol: 0.01, hint: 'CPT = CV + VR.',
        traps: [{ value: cv - vr, note: 'Se suman.' }], solution: [`CPT = ${fix(cv, 2)} + ${fix(vr, 2)} = ${fix(cv + vr, 2)} L`], explain: `${fix(cv + vr, 2)} L.` });
      const cpt = cv + vr, vr2 = vr + between(rng, 1, 2, 0.05);
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}En un paciente, el VR sube de ${fix(vr, 2)} a ${fix(vr2, 2)} L con CPT casi igual. ¿Qué significa?`, 'Atrapamiento aéreo (típico de obstrucción, como el enfisema)', [{ text: 'Restricción pulmonar', note: 'En la restricción todo baja.', misconception: 'obs-res' }, { text: 'Mejoría de la función', note: 'Más aire atrapado es peor.' }],
        { concept: 'base.volumenes', slide: 2, hint: 'El VR es lo que no logras botar.', explain: `CPT ≈ ${fix(cpt, 2)} L; más VR = aire atrapado.` });
    }
  };
  const gases = {
    id: 'gases', title: 'PO₂ inspirada y FiO₂', mission: null, concepts: ['base.gases'],
    make(rng, level) {
      const fi = pick(rng, [0.21, 0.28, 0.35, 0.4, 0.5]), co2 = between(rng, 32, 46, 1), pa = PIO2(fi) - co2 / 0.8;
      if (level <= 2) return number(`¿Cuál es la PO₂ inspirada (húmeda) con FiO₂ ${fix(fi, 2)} a nivel del mar? (Patm 760, PH₂O 47)`, PIO2(fi), 'mmHg', { concept: 'base.gases', slide: 6, label: 'PiO₂', tol: 0.01, hint: 'FiO₂ × (760 − 47).',
        traps: [{ value: fi * 760, note: 'Resta el vapor de agua (47).' }], solution: [`${fix(fi, 2)} × 713 = ${dec(PIO2(fi))} mmHg`], explain: `${dec(PIO2(fi))} mmHg.` });
      return number(`${level === 5 ? 'Estilo PEP: ' : ''}FiO₂ ${fix(fi, 2)}, nivel del mar, PaCO₂ ${co2} mmHg. Calcula la PAO₂.`, pa, 'mmHg', { concept: 'base.gases', slide: 6, label: 'PAO₂', tol: 0.01, hint: 'FiO₂ × 713 − PaCO₂/0,8.',
        traps: [{ value: PIO2(fi), note: 'Falta restar PaCO₂/0,8.' }, { value: fi * 760 - co2 / 0.8, note: 'Resta el vapor de agua.' }], solution: [`${fix(fi, 2)} × 713 = ${dec(PIO2(fi))}`, `${dec(PIO2(fi))} − ${co2}/0,8 = ${dec(pa)} mmHg`], explain: `${dec(pa)} mmHg.` });
    }
  };

  const generators = [espiro, causas, asmaEpoc, aa, mecanismo, insuf, volumenes, gases];

  /* Laboratorio "¿qué pasa si…?": pacientes y lo que les das. */
  const S = (id, name, formula) => ({ id, name, formula });
  const substances = [
    S('crisis', 'Crisis de asma', 'VEF₁ 45 %'), S('crisis-ok', 'Asma tras salbutamol', 'VEF₁ 85 %'), S('vq', 'EPOC exacerbada (V/Q bajo)', 'PaO₂ 52'), S('vq-ok', 'EPOC con O₂ controlado', 'SatO₂ 90 %'), S('vq-co2', 'EPOC con O₂ excesivo', 'PaCO₂ sube'),
    S('shunt', 'Neumonía lobar (shunt)', 'PaO₂ 55'), S('shunt-o2', 'Neumonía con O₂ al 100 %', 'PaO₂ sube poco'), S('opioide', 'Sobredosis de opioides', 'PaCO₂ 75'), S('opioide-ok', 'Tras naloxona', 'respira bien')
  ];
  const reagents = [['salbutamol', 'Salbutamol (β2)'], ['o2bajo', 'O₂ controlado (meta 88–92 %)'], ['o2alto', 'O₂ al 100 %'], ['naloxona', 'Naloxona'], ['propranolol', 'Propranolol']].map(([id, label]) => ({ id, label }));
  const RX = {
    'crisis>salbutamol': ['crisis-ok', 'El β2 relaja el músculo liso bronquial: la obstrucción del asma es reversible.'],
    'vq>o2bajo': ['vq-ok', 'En el V/Q bajo un poco de O₂ basta: sube la PO₂ de los alvéolos mal ventilados.'],
    'vq>o2alto': ['vq-co2', 'Cuidado: en el EPOC retenedor el O₂ excesivo empeora la hipercapnia (pierde la vasoconstricción hipóxica y efecto Haldane).'],
    'shunt>o2alto': ['shunt-o2', 'Sube poco: la sangre del shunt pasa por alvéolos llenos de pus que el O₂ no alcanza.'],
    'opioide>naloxona': ['opioide-ok', 'La naloxona revierte el opioide: vuelve la ventilación y baja la PaCO₂.']
  };
  const WHY_NOT = { propranolol: '¡Peligro! Bloquear β2 cierra los bronquios.', naloxona: 'La naloxona solo sirve si hay opioides.', salbutamol: 'El broncodilatador no corrige este mecanismo.', o2bajo: 'Ayuda poco con este mecanismo.', o2alto: 'Aquí no es lo indicado.' };
  function react(fromId, rid) {
    const r = RX[`${fromId}>${rid}`];
    if (r) return { to: r[0], ok: true, why: r[1] };
    if (fromId === 'opioide' && rid.startsWith('o2')) return { to: null, ok: false, why: 'El O₂ sube la PaO₂, pero no arregla la hipoventilación: el CO₂ sigue alto. Hay que tratar la causa.' };
    return { to: null, ok: false, why: WHY_NOT[rid] || 'No cambia este cuadro.' };
  }
  const lab = { substances, reagents, react, total: Object.keys(RX).length, starts: ['crisis', 'vq', 'shunt', 'opioide'] };

  const creatures = {
    'base.volumenes': ['Escriba', '#a07a4a'], 'base.gases': ['Niebla', '#7fa3a0'],
    'fis.patron': ['Trasgo', '#7f9a3c'], 'fis.asma': ['Serpiente', '#5f9e5a'], 'fis.hipoxemia': ['Espectro', '#7aa4b5'], 'fis.insuficiencia': ['Hidra', '#c0574a']
  };

  window.NexoClassGen = window.NexoClassGen || {};
  window.NexoClassGen['fis-06'] = { LEVELS, source: SRC, generators, lab, creatures };
})();
