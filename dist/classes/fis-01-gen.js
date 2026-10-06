/* Casos infinitos de "Motricidad y sistema nervioso vegetativo" (Fisiopatología, PEP 1). Niveles 1 Fácil … 5 Nivel PEP.
   Cada caso se arma combinando signos de un banco (Silbernagl y Lang): a más nivel, más signos mezclados y opciones más parecidas. */
(() => {
  'use strict';
  const SRC = 'silbernagl';
  const LEVELS = ['Fácil', 'Media', 'Intermedia', 'Avanzada', 'Nivel PEP'];
  const pick = (rng, list) => list[Math.floor(rng() * list.length)];
  const shuffle = (rng, list) => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const take = (rng, list, n) => shuffle(rng, list).slice(0, n);
  function choice(rng, prompt, correct, distractors, extra) {
    const seen = new Set([correct]);
    const ds = distractors.filter(d => d && d.text && !seen.has(d.text) && seen.add(d.text)).slice(0, extra.max || 3);
    const { max, ...rest } = extra;
    return { type: 'choice', prompt, options: shuffle(rng, [{ text: correct, correct: true }, ...ds]), ...rest };
  }
  const AGE = rng => pick(rng, ['Mujer de 34 años', 'Hombre de 61 años', 'Mujer de 72 años', 'Hombre de 45 años', 'Mujer de 55 años']);

  /* ════════ Localizar la lesión motora ════════ */
  const SITES = {
    mns: { label: 'Motoneurona superior', signs: ['espasticidad', 'hiperreflexia', 'Babinski positivo', 'clonus', 'debilidad sin atrofia importante'], mis: 'umn-lmn', slide: 2 },
    mni: { label: 'Motoneurona inferior', signs: ['flacidez', 'arreflexia', 'atrofia marcada', 'fasciculaciones', 'debilidad en el territorio de un nervio'], mis: 'umn-lmn', slide: 2 },
    placa: { label: 'Placa motora (miastenia gravis)', signs: ['ptosis que empeora en la tarde', 'visión doble al leer mucho rato', 'debilidad que mejora con el reposo', 'reflejos normales', 'sin atrofia'], mis: 'mg-mechanism', slide: 5 },
    ganglios: { label: 'Ganglios basales (Parkinson)', signs: ['temblor de reposo', 'rigidez en rueda dentada', 'bradicinesia', 'marcha a pasos cortos', 'cara inexpresiva'], mis: 'parkinson-dopa', slide: 3 },
    cerebelo: { label: 'Cerebelo', signs: ['temblor al acercar el dedo a la nariz', 'marcha con base amplia', 'dismetría', 'adiadococinesia', 'fuerza conservada'], mis: 'cerebellum-paralysis', slide: 4 }
  };
  const localizar = {
    id: 'localizar', title: 'Localizar la lesión', mission: 'm1', concepts: ['fis.motoneurona', 'fis.ganglios', 'fis.placa'],
    make(rng, level, want) {
      const BY = { 'fis.motoneurona': ['mns', 'mni'], 'fis.ganglios': ['ganglios', 'cerebelo'], 'fis.placa': ['placa'] };
      const keys = want ? BY[want] : level <= 2 ? ['mns', 'mni', 'cerebelo'] : Object.keys(SITES), k = pick(rng, keys), s = SITES[k];
      const n = level <= 1 ? 1 : level <= 3 ? 2 : 3, signs = take(rng, s.signs, n);
      const concept = ['ganglios', 'cerebelo'].includes(k) ? 'fis.ganglios' : k === 'placa' ? 'fis.placa' : 'fis.motoneurona';
      const p = level === 1 ? `¿Qué lesión sugiere este signo: ${signs[0]}?` : `${level === 5 ? 'Estilo PEP: ' : ''}${AGE(rng)} consulta por ${signs.slice(0, -1).join(', ')} y ${signs[signs.length - 1]}. ¿Dónde está la lesión?`;
      return choice(rng, p, s.label, Object.entries(SITES).filter(([kk]) => kk !== k).map(([kk, o]) => ({ text: o.label, note: `Esa daría ${take(rng, o.signs, 2).join(' y ')}.`, misconception: s.mis })),
        { concept, slide: s.slide, hint: '¿Hay debilidad? ¿Tono y reflejos? ¿Temblor en reposo o al moverse?', explain: `${signs.join(', ')} → ${s.label}.` });
    }
  };

  /* ════════ Mecanismos ════════ */
  const MECH = [
    ['Parkinson', 'Muerte de neuronas dopaminérgicas de la sustancia negra → ↓ dopamina en el estriado', 'parkinson-dopa', 'fis.ganglios', 3],
    ['Miastenia gravis', 'Autoanticuerpos contra el receptor nicotínico de la placa motora', 'mg-mechanism', 'fis.placa', 5],
    ['Esclerosis lateral amiotrófica', 'Degeneración de motoneuronas superiores e inferiores', 'umn-lmn', 'fis.motoneurona', 2],
    ['Enfermedad de Huntington', 'Pérdida de neuronas del estriado → movimientos involuntarios (corea)', 'parkinson-dopa', 'fis.ganglios', 3],
    ['Intoxicación por organofosforados', 'Inhibición de la acetilcolinesterasa → exceso de acetilcolina', 'cholinergic', 'fis.toxicos', 7],
    ['Síndrome de Horner', 'Interrupción de la vía simpática hacia la cara', 'symp-para', 'fis.toxicos', 7]
  ];
  const mecanismo = {
    id: 'mecanismo', title: 'Enfermedad y mecanismo', mission: 'm1', concepts: ['fis.ganglios', 'fis.placa', 'fis.motoneurona', 'fis.toxicos'],
    make(rng, level, want) {
      const pool = want ? MECH.filter(m => m[3] === want) : level <= 2 ? MECH.slice(0, 3) : MECH, [name, mech, mis, concept, slide] = pick(rng, pool);
      if (level >= 4) return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}¿Qué enfermedad se explica por este mecanismo? "${mech}"`, name, MECH.filter(m => m[0] !== name).map(m => ({ text: m[0], note: `Su mecanismo: ${m[1].toLowerCase()}.`, misconception: mis })),
        { concept, slide, hint: 'Piensa en dónde falla la cadena.', explain: `${name}.` });
      return choice(rng, `¿Cuál es el mecanismo de: ${name}?`, mech, MECH.filter(m => m[0] !== name).map(m => ({ text: m[1], note: `Ese es de: ${m[0]}.`, misconception: mis })),
        { concept, slide, hint: 'Pregúntate qué célula o molécula falla.', explain: mech + '.' });
    }
  };

  /* ════════ Tratamiento según el mecanismo ════════ */
  const TX = [
    ['Parkinson', 'L-DOPA (precursor de dopamina que cruza la barrera hematoencefálica)', 'fis.ganglios', 3],
    ['Miastenia gravis', 'Piridostigmina (inhibidor de la acetilcolinesterasa)', 'fis.placa', 5],
    ['Intoxicación por organofosforados', 'Atropina (antagonista muscarínico) más una oxima', 'fis.toxicos', 7],
    ['Crisis de asma (broncoconstricción)', 'Salbutamol (agonista β2)', 'fis.sna', 6]
  ];
  const tratamiento = {
    id: 'tratamiento', title: 'Del mecanismo al fármaco', mission: 'm1', concepts: ['fis.ganglios', 'fis.placa', 'fis.toxicos', 'fis.sna'],
    make(rng, level, want) {
      const [name, tx, concept, slide] = pick(rng, want ? TX.filter(t => t[2] === want) : level <= 2 ? TX.slice(0, 2) : TX);
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}¿Qué tratamiento tiene sentido por el mecanismo de: ${name}?`, tx, [...TX.filter(t => t[0] !== name).map(t => ({ text: t[1], note: `Ese sirve para: ${t[0].toLowerCase()}.` })), { text: 'Propranolol (betabloqueador no selectivo)', note: 'No corrige ese mecanismo.' }],
        { concept, slide, hint: 'El fármaco debe corregir el eslabón que falla.', explain: tx + '.' });
    }
  };

  /* ════════ Simpático o parasimpático ════════ */
  const EFF = [['midriasis', 's'], ['miosis', 'p'], ['taquicardia', 's'], ['bradicardia', 'p'], ['broncodilatación', 's'], ['broncoconstricción', 'p'], ['más motilidad intestinal', 'p'], ['menos motilidad intestinal', 's'], ['salivación abundante', 'p'], ['glucogenólisis', 's']];
  const sna = {
    id: 'sna', title: 'Simpático o parasimpático', mission: 'm2', concepts: ['fis.sna'],
    make(rng, level) {
      const n = level <= 2 ? 1 : 3, side = pick(rng, ['s', 'p']), effs = take(rng, EFF.filter(e => e[1] === side), n).map(e => e[0]);
      const right = side === 's' ? 'Simpático (noradrenalina)' : 'Parasimpático (acetilcolina muscarínica)';
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}¿Qué rama del sistema vegetativo produce ${effs.join(', ')}?`, right, [{ text: side === 's' ? 'Parasimpático (acetilcolina muscarínica)' : 'Simpático (noradrenalina)', note: 'Lucha o huida frente a descanso y digestión.', misconception: 'symp-para' }, { text: 'Placa motora (acetilcolina nicotínica)', note: 'La placa es del músculo esquelético.' }],
        { concept: 'fis.sna', slide: 6, hint: '¿Sirve para huir o para digerir?', explain: `${right}.` });
    }
  };

  /* ════════ Toxíndromes ════════ */
  const TOX = {
    col: { label: 'Síndrome colinérgico', signs: ['miosis puntiforme', 'salivación', 'broncorrea', 'diarrea', 'bradicardia', 'sudoración profusa', 'fasciculaciones'], cause: ['fumigó con un organofosforado', 'tomó de más su piridostigmina'], tx: 'atropina' },
    anti: { label: 'Síndrome anticolinérgico', signs: ['piel seca y caliente', 'midriasis', 'taquicardia', 'retención urinaria', 'confusión', 'mucosas secas'], cause: ['tomó muchos antihistamínicos antiguos', 'comió bayas de belladona'], tx: 'medidas de soporte (y fisostigmina en casos graves)' },
    simp: { label: 'Síndrome simpaticomimético', signs: ['midriasis', 'taquicardia', 'hipertensión', 'sudoración', 'agitación'], cause: ['consumió cocaína', 'consumió anfetaminas'], tx: 'benzodiacepinas y soporte' },
    horner: { label: 'Síndrome de Horner', signs: ['ptosis de un lado', 'miosis de un lado', 'anhidrosis de media cara'], cause: ['tiene un tumor del vértice pulmonar', 'sufrió una disección carotídea'], tx: 'tratar la causa' }
  };
  const toxindrome = {
    id: 'toxindrome', title: 'Reconocer el síndrome', mission: 'm2', concepts: ['fis.toxicos'],
    make(rng, level) {
      const keys = level <= 2 ? ['col', 'anti'] : Object.keys(TOX), k = pick(rng, keys), t = TOX[k], signs = take(rng, t.signs, Math.min(t.signs.length, level <= 2 ? 2 : 3));
      const cause = level >= 4 ? '' : ` después de que ${pick(rng, t.cause)}`;
      const p = `${level === 5 ? 'Estilo PEP: ' : ''}${AGE(rng)} llega${cause} con ${signs.join(', ')}. ¿Qué síndrome es?`;
      return choice(rng, p, t.label, Object.entries(TOX).filter(([kk]) => kk !== k).map(([, o]) => ({ text: o.label, note: `Ese da ${take(rng, o.signs, 2).join(' y ')}.`, misconception: (k === 'col' || k === 'anti') ? 'cholinergic' : 'symp-para' })),
        { concept: 'fis.toxicos', slide: 7, hint: '¿Moja o seca? ¿Pupila grande o chica? ¿Un lado o todo?', explain: `${t.label}: tratamiento ${t.tx}.` });
    }
  };

  /* ════════ Bases ════════ */
  const via = {
    id: 'via', title: 'La vía motora', mission: null, concepts: ['base.via'],
    make(rng, level) {
      const side = pick(rng, ['izquierdo', 'derecho']), other = side === 'izquierdo' ? 'derecho' : 'izquierdo';
      if (level <= 3) return choice(rng, `Un ACV en el hemisferio ${side} produce debilidad en el lado…`, other, [{ text: side, note: 'La vía piramidal cruza en el bulbo.' }, { text: 'ambos lados por igual', note: 'Es un solo hemisferio.' }], { concept: 'base.via', slide: 1, hint: 'Decusación piramidal.', explain: `Lado ${other}.` });
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}Tras un ACV del hemisferio ${side}, ¿cómo estarán los reflejos del lado ${other} después de unas semanas?`, 'Aumentados (hiperreflexia, Babinski)', [{ text: 'Abolidos con atrofia', note: 'Eso es de motoneurona inferior.', misconception: 'umn-lmn' }, { text: 'Normales', note: 'Se pierde el freno cortical.' }],
        { concept: 'base.via', slide: 2, hint: 'Es motoneurona superior.', explain: 'Lesión de MNS contralateral.' });
    }
  };
  const receptores = {
    id: 'receptores', title: 'Receptores del SNA', mission: null, concepts: ['base.sna'],
    make(rng, level) {
      const R = [['β1', 'aumenta la frecuencia cardíaca'], ['β2', 'dilata los bronquios'], ['α1', 'contrae los vasos'], ['muscarínico', 'aumenta las secreciones y la motilidad intestinal'], ['nicotínico', 'contrae el músculo esquelético en la placa']];
      const [r, e] = pick(rng, level <= 2 ? R.slice(0, 3) : R);
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}¿Qué receptor ${e}?`, r, R.filter(x => x[0] !== r).map(x => ({ text: x[0], note: `Ese ${x[1]}.` })), { concept: 'base.sna', slide: 6, hint: 'β1 corazón, β2 bronquios, α1 vasos.', explain: `${r}.` });
    }
  };

  const generators = [localizar, mecanismo, tratamiento, sna, toxindrome, via, receptores];

  /* Laboratorio "¿qué pasa si…?": una persona sana y lo que le das. */
  const S = (id, name, formula) => ({ id, name, formula });
  const substances = [
    S('sano', 'Persona sana en reposo', 'pupilas normales · FC 70'), S('colinergico', 'Síndrome colinérgico', 'miosis · secreciones · FC 50'), S('anticolinergico', 'Síndrome anticolinérgico', 'midriasis · seco · FC 120'),
    S('miastenia', 'Persona con miastenia gravis', 'ptosis que empeora en la tarde'), S('mg-mejor', 'Miastenia mejorada', 'más ACh en la placa'), S('asma', 'Crisis de asma', 'broncoconstricción'), S('asma-mejor', 'Bronquios abiertos', 'broncodilatación')
  ];
  const reagents = [['op', 'Organofosforado (inhibe la AChE)'], ['atropina', 'Atropina (bloquea muscarínico)'], ['piridostigmina', 'Piridostigmina (inhibe la AChE, uso médico)'], ['salbutamol', 'Salbutamol (agonista β2)'], ['propranolol', 'Propranolol (bloquea β1 y β2)']].map(([id, label]) => ({ id, label }));
  const RX = {
    'sano>op': ['colinergico', 'Sin acetilcolinesterasa la ACh se acumula: todo moja, miosis y bradicardia.'],
    'sano>atropina': ['anticolinergico', 'Bloqueas el parasimpático: seco, rojo, caliente, midriasis y taquicardia.'],
    'colinergico>atropina': ['sano', 'La atropina bloquea el receptor muscarínico: se secan las secreciones y sube la frecuencia.'],
    'miastenia>piridostigmina': ['mg-mejor', 'Más ACh dura más en la placa y compensa los receptores bloqueados por anticuerpos.'],
    'asma>salbutamol': ['asma-mejor', 'β2 relaja el músculo liso bronquial.'],
    'asma>atropina': ['asma-mejor', 'Bloquear el muscarínico también broncodilata (por eso existe el ipratropio inhalado).']
  };
  const WHY_NOT = { propranolol: 'Cuidado: bloquear β2 cierra los bronquios y bloquear β1 baja la frecuencia. No ayuda aquí.', op: 'Agregar un organofosforado solo empeora: más ACh.', piridostigmina: 'Más ACh aquí no corrige nada (o empeora).', salbutamol: 'β2 no corrige este cuadro.' };
  function react(fromId, rid) {
    const r = RX[`${fromId}>${rid}`];
    if (r) return { to: r[0], ok: true, why: r[1] };
    if (fromId === 'asma' && rid === 'propranolol') return { to: null, ok: false, why: '¡Peligro! Bloquear β2 en una crisis de asma la empeora.' };
    return { to: null, ok: false, why: WHY_NOT[rid] || 'Este fármaco no cambia este cuadro de forma útil.' };
  }
  const lab = { substances, reagents, react, total: Object.keys(RX).length, starts: ['sano', 'miastenia', 'asma'] };

  const creatures = {
    'base.via': ['Escriba', '#a07a4a'], 'base.sna': ['Búho', '#5d6f9e'],
    'fis.motoneurona': ['Trasgo', '#7f9a3c'], 'fis.placa': ['Duende', '#6d8bd6'], 'fis.ganglios': ['Gólem', '#8a6fd1'], 'fis.sna': ['Grifo', '#c98a1b'], 'fis.toxicos': ['Hidra', '#c0574a']
  };

  window.NexoClassGen = window.NexoClassGen || {};
  window.NexoClassGen['fis-01'] = { LEVELS, source: SRC, generators, lab, creatures };
})();
