/* Casos infinitos de "Lesión cerebral aguda" (Fisiopatología, PEP 1). Niveles 1 Fácil … 5 Nivel PEP.
   Los números (PAM, PPC) se CALCULAN; los casos se arman desde bancos de signos (Silbernagl y Lang). */
(() => {
  'use strict';
  const SRC = 'silbernagl';
  const LEVELS = ['Fácil', 'Media', 'Intermedia', 'Avanzada', 'Nivel PEP'];
  const pick = (rng, list) => list[Math.floor(rng() * list.length)];
  const shuffle = (rng, list) => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const between = (rng, a, b, step) => Math.round((a + rng() * (b - a)) / step) * step;
  const dec = (x, d = 1) => Number(x).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: d }).replace('-', '−');
  function choice(rng, prompt, correct, distractors, extra) {
    const seen = new Set([correct]);
    const ds = distractors.filter(d => d && d.text && !seen.has(d.text) && seen.add(d.text)).slice(0, extra.max || 3);
    const { max, ...rest } = extra;
    return { type: 'choice', prompt, options: shuffle(rng, [{ text: correct, correct: true }, ...ds]), ...rest };
  }
  function number(prompt, answer, unit, extra) {
    const tol = extra.tol ?? 0.02, traps = (extra.traps || []).filter(t => Number.isFinite(t.value) && Math.abs(t.value - answer) > Math.abs(answer) * tol * 1.5);
    return { type: 'number', prompt, answer, unit, tol, ...extra, traps };
  }

  /* ════════ Cascada isquémica ════════ */
  const CHAIN = ['↓ flujo sanguíneo', '↓ ATP', 'falla de la Na⁺/K⁺-ATPasa', 'despolarización', 'liberación de glutamato', 'activación de receptores NMDA', 'entrada de Ca²⁺', 'activación de proteasas y lipasas', 'muerte neuronal'];
  const cascada = {
    id: 'cascada', title: 'Cascada isquémica', mission: 'm1', concepts: ['fis.isquemia'],
    make(rng, level) {
      const i = Math.floor(rng() * (CHAIN.length - 1)), next = CHAIN[i + 1];
      if (level <= 3) return choice(rng, `En la isquemia cerebral, ¿qué viene justo después de "${CHAIN[i]}"?`, next, shuffle(rng, CHAIN.filter((c, k) => k !== i + 1 && k !== i)).map(t => ({ text: t, note: 'Repasa el orden de la cascada.', misconception: t.includes('glutamato') ? 'excito-gaba' : undefined })).concat([{ text: 'liberación masiva de GABA', note: 'El protagonista es el glutamato.', misconception: 'excito-gaba' }]),
        { concept: 'fis.isquemia', slide: 2, hint: 'Sin energía → sin bombas → glutamato → Ca²⁺.', explain: `${CHAIN[i]} → ${next}.` });
      const block = pick(rng, [['un bloqueador de receptores NMDA', 'entrada de Ca²⁺', 'Frena la entrada de Ca²⁺ aunque haya glutamato'], ['un fármaco que impide la liberación de glutamato', 'activación de receptores NMDA', 'Sin glutamato no se activan los NMDA'], ['restablecer el flujo (trombolisis)', '↓ ATP', 'Vuelve el O₂ y la glucosa: se recupera el ATP']]);
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}En un modelo de isquemia se da ${block[0]}. ¿Qué eslabón se evita primero?`, block[1], shuffle(rng, CHAIN.filter(c => c !== block[1])).slice(0, 3).map(t => ({ text: t, note: 'Mira dónde actúa la intervención.' })),
        { concept: 'fis.isquemia', slide: 2, hint: 'Ubica el punto de la cadena donde actúa.', explain: `${block[2]}.` });
    }
  };

  /* ════════ Núcleo y penumbra ════════ */
  const PEN = [['Necrosis irreversible', 'Núcleo'], ['Flujo casi nulo', 'Núcleo'], ['Neuronas que no funcionan pero siguen vivas', 'Penumbra'], ['Se recupera si se reperfunde a tiempo', 'Penumbra'], ['Blanco de la trombolisis', 'Penumbra']];
  const penumbra = {
    id: 'penumbra', title: 'Núcleo, penumbra y tiempo', mission: 'm1', concepts: ['fis.penumbra'],
    make(rng, level) {
      if (level <= 2) { const [t, r] = pick(rng, PEN);
        return choice(rng, `"${t}". ¿Núcleo o penumbra?`, r, [{ text: r === 'Núcleo' ? 'Penumbra' : 'Núcleo', note: 'Núcleo: muerto. Penumbra: aturdida pero viva.', misconception: 'core-penumbra' }, { text: 'Edema vasogénico', note: 'Es otra cosa.' }], { concept: 'fis.penumbra', slide: 3, hint: '¿Se puede salvar?', explain: r + '.' }); }
      const h0 = between(rng, 0.5, 8, 0.5), h = h0 === 4.5 ? 4 : h0, hem = level >= 4 && rng() < 0.4;
      const right = hem ? 'No trombolizar: es una hemorragia' : h <= 4.5 ? 'Trombolisis (si el TAC descarta hemorragia)' : 'Fuera de la ventana de trombolisis endovenosa: evaluar otras terapias';
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}Paciente con déficit neurológico de inicio hace ${dec(h)} h. ${hem ? 'El TAC muestra sangre en el parénquima.' : 'El TAC no muestra sangre.'} ¿Qué corresponde?`, right,
        ['Trombolisis (si el TAC descarta hemorragia)', 'Fuera de la ventana de trombolisis endovenosa: evaluar otras terapias', 'No trombolizar: es una hemorragia', 'Esperar 24 h para ver si mejora'].filter(t => t !== right).map(text => ({ text, note: 'La ventana de rtPA es de 4,5 h y nunca en hemorragias.', misconception: 'core-penumbra' })),
        { concept: 'fis.penumbra', slide: 3, hint: 'Ventana de 4,5 h y descartar sangrado.', explain: `${right}.` });
    }
  };

  /* ════════ Edema ════════ */
  const ED = [['Primeras horas de un infarto cerebral', 'Citotóxico'], ['Hiponatremia aguda', 'Citotóxico'], ['Paro cardíaco con hipoxia global', 'Citotóxico'], ['Alrededor de un tumor cerebral', 'Vasogénico'], ['Absceso cerebral', 'Vasogénico'], ['Contusión por un trauma', 'Vasogénico'], ['Hidrocefalia obstructiva', 'Intersticial']];
  const edema = {
    id: 'edema', title: 'Tipo de edema', mission: 'm2', concepts: ['fis.edema'],
    make(rng, level) {
      const [t, r] = pick(rng, level <= 2 ? ED.slice(0, 5) : ED);
      const opts = ['Citotóxico', 'Vasogénico', 'Intersticial'];
      if (level >= 4) { const why = r === 'Citotóxico' ? 'Fallan las bombas: la célula se hincha con BHE intacta' : r === 'Vasogénico' ? 'Se rompe la BHE: sale líquido al espacio extracelular' : 'El LCR a presión pasa al tejido periventricular';
        return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${t}: ¿qué mecanismo explica el edema?`, why, ['Fallan las bombas: la célula se hincha con BHE intacta', 'Se rompe la BHE: sale líquido al espacio extracelular', 'El LCR a presión pasa al tejido periventricular'].filter(x => x !== why).map(text => ({ text, note: 'Piensa si el agua está dentro de la célula o fuera.', misconception: 'edema-type' })),
          { concept: 'fis.edema', slide: 4, hint: '¿Dentro o fuera de la célula? ¿Se rompió la barrera?', explain: `${r}: ${why.toLowerCase()}.` }); }
      return choice(rng, `${t}: ¿qué tipo de edema predomina?`, r, opts.filter(o => o !== r).map(text => ({ text, note: 'Citotóxico: bombas; vasogénico: BHE rota; intersticial: LCR.', misconception: 'edema-type' })),
        { concept: 'fis.edema', slide: 4, hint: '¿Fallan las bombas o se rompe la barrera?', explain: `${r}.` });
    }
  };

  /* ════════ PAM y PPC ════════ */
  const ppc = {
    id: 'ppc', title: 'PAM y perfusión cerebral', mission: 'm2', concepts: ['fis.pic'],
    make(rng, level) {
      const pas = between(rng, 95, 200, 5), pad = Math.min(pas - 25, between(rng, 55, 110, 5)), pam = pad + (pas - pad) / 3, pic = between(rng, 8, 45, 1);
      if (level <= 2) { const PAM = between(rng, 60, 110, 1);
        return number(`PAM ${PAM} mmHg y PIC ${pic} mmHg. ¿Presión de perfusión cerebral?`, PAM - pic, 'mmHg', { concept: 'fis.pic', slide: 6, label: 'PPC', tol: 0.01, hint: 'PPC = PAM − PIC.',
          traps: [{ value: PAM + pic, note: 'Se resta la PIC.', misconception: 'ppc-sign' }], solution: [`PPC = ${PAM} − ${pic} = ${PAM - pic} mmHg`], explain: `${PAM - pic} mmHg${PAM - pic < 60 ? ' (bajo la meta de 60)' : ''}.` }); }
      if (level === 3) return number(`PA ${pas}/${pad} mmHg. Calcula la PAM.`, pam, 'mmHg', { concept: 'fis.pic', slide: 6, label: 'PAM', tol: 0.01, hint: 'PAM = PAD + (PAS − PAD)/3.',
        traps: [{ value: (pas + pad) / 2, note: 'Ese es el promedio simple.' }, { value: pas - pad, note: 'Esa es la presión de pulso.' }], solution: [`PAM = ${pad} + (${pas} − ${pad})/3 = ${dec(pam)} mmHg`], explain: `${dec(pam)} mmHg.` });
      return number(`${level === 5 ? 'Estilo PEP: ' : ''}Paciente con TEC: PA ${pas}/${pad} mmHg y PIC ${pic} mmHg. Calcula la presión de perfusión cerebral.`, pam - pic, 'mmHg',
        { concept: 'fis.pic', slide: 6, label: 'PPC', tol: 0.02, hint: 'Primero la PAM; luego resta la PIC.', traps: [{ value: pas - pic, note: 'Usaste la sistólica.', misconception: 'ppc-sign' }, { value: (pas + pad) / 2 - pic, note: 'La PAM no es el promedio simple.' }, { value: pam + pic, note: 'Se resta la PIC.', misconception: 'ppc-sign' }],
          solution: [`PAM = ${pad} + (${pas} − ${pad})/3 = ${dec(pam)} mmHg`, `PPC = ${dec(pam)} − ${pic} = ${dec(pam - pic)} mmHg${pam - pic < 60 ? ' → bajo la meta de 60' : ''}`], explain: `PPC = ${dec(pam - pic)} mmHg.` });
    }
  };

  /* ════════ Signos de hipertensión intracraneal ════════ */
  const signos = {
    id: 'signos', title: 'Signos de ↑ PIC', mission: 'm2', concepts: ['fis.pic'],
    make(rng, level) {
      const early = ['cefalea matinal', 'vómitos', 'papiledema'], late = ['hipertensión arterial', 'bradicardia', 'respiración irregular'];
      if (level <= 2) { const s = pick(rng, [...early, ...late]), isLate = late.includes(s);
        return choice(rng, `¿"${s}" es un signo temprano o tardío de hipertensión intracraneal?`, isLate ? 'Tardío (tríada de Cushing)' : 'Temprano', [{ text: isLate ? 'Temprano' : 'Tardío (tríada de Cushing)', note: 'La tríada de Cushing anuncia herniación.', misconception: 'cushing' }], { concept: 'fis.pic', slide: 7, hint: 'Cushing = HTA, bradicardia, respiración irregular.', explain: isLate ? 'Tardío.' : 'Temprano.' }); }
      const fc = between(rng, 38, 52, 1), pa = `${between(rng, 180, 220, 5)}/${between(rng, 95, 120, 5)}`;
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}Paciente con un hematoma cerebral: PA ${pa} mmHg, FC ${fc} lpm y respiración irregular. ¿Interpretación y conducta?`, 'Tríada de Cushing: herniación inminente; bajar la PIC (no bajar bruscamente la PA)',
        [{ text: 'Crisis hipertensiva: bajar la PA rápido a 120/80', note: 'Bajar la PAM reduce la PPC y empeora la isquemia.', misconception: 'cushing' }, { text: 'Bloqueo AV por fármacos: dar atropina y observar', note: 'La causa es intracraneal.', misconception: 'cushing' }, { text: 'Respuesta normal al dolor', note: 'El dolor da taquicardia, no bradicardia.' }],
        { concept: 'fis.pic', slide: 7, hint: 'Tres signos juntos en un paciente con lesión cerebral.', explain: 'Tríada de Cushing.' });
    }
  };

  /* ════════ Bases ════════ */
  const energia = {
    id: 'energia', title: 'ATP y bombas', mission: null, concepts: ['base.energia'],
    make(rng, level) {
      const C = [['Se detiene la Na⁺/K⁺-ATPasa', 'Falta ATP'], ['Entra Na⁺ a la neurona', 'Se detiene la Na⁺/K⁺-ATPasa'], ['La célula se hincha', 'Entra Na⁺ y lo sigue el agua'], ['Se acumula lactato', 'Glucólisis anaeróbica sin O₂']];
      const [eff, cause] = pick(rng, C);
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}¿Cuál es la causa inmediata de: "${eff}"?`, cause, C.filter(c => c[1] !== cause).map(c => ({ text: c[1], note: 'Esa es la causa de otro eslabón.' })), { concept: 'base.energia', slide: 1, hint: 'Busca el eslabón anterior.', explain: cause + '.' });
    }
  };
  const pamBase = {
    id: 'pam', title: 'Presión arterial media', mission: null, concepts: ['base.presion'],
    make(rng, level) {
      const pas = between(rng, 90, 180, 5), pad = Math.min(pas - 20, between(rng, 50, 100, 5)), pam = pad + (pas - pad) / 3;
      return number(`${level === 5 ? 'Estilo PEP: ' : ''}PA ${pas}/${pad} mmHg. ¿PAM?`, pam, 'mmHg', { concept: 'base.presion', slide: 6, label: 'PAM', tol: 0.01, hint: 'PAD + (PAS − PAD)/3.',
        traps: [{ value: (pas + pad) / 2, note: 'Ese es el promedio simple.' }], solution: [`${pad} + ${pas - pad}/3 = ${dec(pam)} mmHg`], explain: `${dec(pam)} mmHg.` });
    }
  };

  const generators = [cascada, penumbra, edema, ppc, signos, energia, pamBase];

  /* Laboratorio "¿qué pasa si…?": un paciente y las intervenciones. */
  const S = (id, name, formula) => ({ id, name, formula });
  const substances = [
    S('acv', 'ACV isquémico de 2 h (TAC sin sangre)', 'núcleo + penumbra'), S('reperf', 'Penumbra reperfundida', 'déficit mejora'), S('infarto', 'Penumbra perdida', 'infarto completo'),
    S('pic', 'TEC con PIC 30 mmHg y PAM 85 mmHg', 'PPC 55: baja'), S('pic-ok', 'PIC 15 mmHg', 'PPC 70: adecuada'), S('pic-peor', 'PAM 65 mmHg con PIC 30', 'PPC 35: isquemia'),
    S('tumor', 'Tumor con edema vasogénico', 'BHE rota'), S('tumor-ok', 'Edema peritumoral reducido', 'menos efecto de masa')
  ];
  const reagents = [['rtpa', 'Trombolisis (rtPA)'], ['esperar', 'Esperar 12 h'], ['manitol', 'Manitol (osmótico)'], ['bajar-pa', 'Bajar bruscamente la PA'], ['dexa', 'Dexametasona']].map(([id, label]) => ({ id, label }));
  const RX = {
    'acv>rtpa': ['reperf', 'Dentro de la ventana y sin sangre: se disuelve el coágulo y se salva la penumbra.'],
    'acv>esperar': ['infarto', 'Sin flujo, la cascada sigue y la penumbra pasa a núcleo. Tiempo es cerebro.'],
    'pic>manitol': ['pic-ok', 'El manitol saca agua del cerebro por osmosis: baja la PIC y sube la PPC = 85 − 15 = 70.'],
    'pic>bajar-pa': ['pic-peor', 'Bajaste la PAM: PPC = 65 − 30 = 35 mmHg. ¡Isquemia!'],
    'tumor>dexa': ['tumor-ok', 'Los corticoides estabilizan la barrera hematoencefálica: baja el edema vasogénico.']
  };
  const WHY_NOT = { dexa: 'Los corticoides sirven en el edema vasogénico de tumores; en el ACV o el TEC no han demostrado beneficio.', rtpa: 'La trombolisis disuelve coágulos arteriales: aquí no corresponde (y aumenta el riesgo de sangrado).', manitol: 'Aquí no hay hipertensión intracraneal que bajar.', 'bajar-pa': 'Bajar la presión aquí no ayuda.', esperar: 'Esperar no cambia este cuadro para mejor.' };
  function react(fromId, rid) {
    const r = RX[`${fromId}>${rid}`];
    if (r) return { to: r[0], ok: true, why: r[1] };
    return { to: null, ok: false, why: WHY_NOT[rid] || 'Esta intervención no cambia este cuadro.' };
  }
  const lab = { substances, reagents, react, total: Object.keys(RX).length, starts: ['acv', 'pic', 'tumor'] };

  const creatures = {
    'base.energia': ['Escriba', '#a07a4a'], 'base.presion': ['Búho', '#5d6f9e'],
    'fis.isquemia': ['Espectro', '#7aa4b5'], 'fis.penumbra': ['Trasgo', '#7f9a3c'], 'fis.edema': ['Niebla', '#7fa3a0'], 'fis.pic': ['Hidra', '#c0574a']
  };

  window.NexoClassGen = window.NexoClassGen || {};
  window.NexoClassGen['fis-02'] = { LEVELS, source: SRC, generators, lab, creatures };
})();
