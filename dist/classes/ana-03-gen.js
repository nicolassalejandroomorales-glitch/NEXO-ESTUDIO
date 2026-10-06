/* Ejercicios infinitos de "Curvas de titulación ácido-base" (Química Analítica, PEP 1). Niveles 1 Fácil … 5 Nivel PEP.
   Los resultados se CALCULAN (nunca se escriben a mano). Datos: Skoog cap. 14–15 (Ka de tablas). */
(() => {
  'use strict';
  const SRC = 'skoog';
  const LEVELS = ['Fácil', 'Media', 'Intermedia', 'Avanzada', 'Nivel PEP'];
  const pick = (rng, list) => list[Math.floor(rng() * list.length)];
  const shuffle = (rng, list) => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const between = (rng, a, b, step) => Math.round((a + rng() * (b - a)) / step) * step;
  const dec = (x, d = 2) => Number(x).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: d }).replace('-', '−');
  const fix = (x, d) => Number(x).toLocaleString('es-CL', { minimumFractionDigits: d, maximumFractionDigits: d });
  const sci = x => { const e = Math.floor(Math.log10(x)); return `${fix(x / 10 ** e, 2)} × 10^${e}`.replace('^-', '^−'); };
  function choice(rng, prompt, correct, distractors, extra) {
    const seen = new Set([correct]);
    const ds = distractors.filter(d => d && d.text && !seen.has(d.text) && seen.add(d.text)).slice(0, extra.max || 3);
    const { max, ...rest } = extra;
    return { type: 'choice', prompt, options: shuffle(rng, [{ text: correct, correct: true }, ...ds]), ...rest };
  }
  function number(prompt, answer, unit, extra) {
    const tol = extra.tol ?? 0.02, traps = (extra.traps || []).filter(t => Number.isFinite(t.value) && Math.abs(t.value - answer) > Math.max(Math.abs(answer) * tol * 1.5, 0.03));
    return { type: 'number', prompt, answer, unit, tol, ...extra, traps };
  }
  const WEAK = [{ name: 'ácido acético', f: 'CH₃COOH', Ka: 1.75e-5 }, { name: 'ácido fórmico', f: 'HCOOH', Ka: 1.8e-4 }, { name: 'ácido benzoico', f: 'C₆H₅COOH', Ka: 6.3e-5 }, { name: 'ácido láctico', f: 'CH₃CH(OH)COOH', Ka: 1.4e-4 }];
  const pH = h => -Math.log10(h);

  /* ════════ Fuerte-fuerte ════════ */
  const fuerte = {
    id: 'fuerte', title: 'pH en la curva fuerte-fuerte', mission: 'm1', concepts: ['ana.fuerte'],
    make(rng, level) {
      const Va = pick(rng, [20, 25, 40]), Ca = pick(rng, [0.1, 0.1, 0.05]), Cb = pick(rng, [0.1, 0.1, 0.2]), Veq = Va * Ca / Cb; // V_eq ≤ 40 mL: cabe en una bureta de 50
      if (level === 1) return number(`¿Cuál es el pH de HCl ${dec(Ca, 2)} M (antes de titular)?`, pH(Ca), '', { concept: 'ana.fuerte', slide: 2, label: 'pH', tol: 0.005, hint: 'Ácido fuerte: [H⁺] = C.',
        traps: [{ value: 14 - pH(Ca), note: 'Ese sería el de una base.' }], solution: [`pH = −log ${dec(Ca, 2)} = ${dec(pH(Ca), 2)}`], explain: `pH = ${dec(pH(Ca), 2)}.` });
      const frac = level === 2 ? pick(rng, [0.25, 0.5]) : level === 3 ? pick(rng, [0.5, 0.9, 0.98]) : pick(rng, [0.98, 1.02, 1.2, 1]);
      const Vb = Number((Veq * frac).toFixed(2)), na = Va * Ca, nb = Vb * Cb, V = Va + Vb, d = na - nb;
      const ans = Math.abs(d) < 1e-9 ? 7 : d > 0 ? pH(d / V) : 14 + Math.log10(-d / V);
      const noDil = Math.abs(d) < 1e-9 ? 7 : d > 0 ? pH(d / Va) : 14 + Math.log10(-d / Va);
      const sol = [`n(H⁺) inicial = ${Va},00 × ${dec(Ca, 2)} = ${dec(na, 3)} mmol`, `n(OH⁻) agregado = ${fix(Vb, 2)} × ${dec(Cb, 2)} = ${dec(nb, 3)} mmol`,
        Math.abs(d) < 1e-9 ? 'No sobra nada: equivalencia → pH = 7' : d > 0 ? `Sobra ${dec(d, 3)} mmol H⁺ en ${dec(V, 2)} mL → pH = ${dec(ans, 2)}` : `Sobra ${dec(-d, 3)} mmol OH⁻ en ${dec(V, 2)} mL → pOH = ${dec(14 - ans, 2)} → pH = ${dec(ans, 2)}`];
      return number(`${level === 5 ? 'Estilo PEP: ' : ''}${Va},00 mL de HCl ${dec(Ca, 2)} M se titulan con NaOH ${dec(Cb, 2)} M. Calcula el pH después de agregar ${fix(Vb, 2)} mL.`, ans, '',
        { concept: 'ana.fuerte', slide: 2, label: 'pH', tol: 0.01, hint: '¿Qué sobra? Divide por el volumen total.', traps: [{ value: noDil, note: 'Divide por el volumen total.', misconception: 'dilution-ignored' }, { value: 14 - ans, note: 'Confundiste pH con pOH.' }], solution: sol, explain: `pH = ${dec(ans, 2)}.` });
    }
  };

  /* ════════ Volumen de equivalencia y zonas ════════ */
  const zonas = {
    id: 'zonas', title: 'Zonas de la curva', mission: 'm1', concepts: ['ana.fuerte'],
    make(rng, level) {
      const Va = pick(rng, [10, 20, 25]), Ca = between(rng, 0.05, 0.15, 0.01), Cb = pick(rng, [0.1, 0.2]), Veq = Va * Ca / Cb;
      if (level <= 3) return number(`${Va},00 mL de HCl ${fix(Ca, 2)} M se titulan con NaOH ${dec(Cb, 2)} M. ¿Volumen de equivalencia?`, Veq, 'mL', { concept: 'ana.fuerte', slide: 2, label: 'V', tol: 0.005, hint: 'mmol ácido = mmol base.',
        traps: [{ value: Va * Cb / Ca, note: 'Invertiste las concentraciones.' }], solution: [`V = ${Va},00 × ${fix(Ca, 2)} / ${dec(Cb, 2)} = ${dec(Veq, 2)} mL`], explain: `${dec(Veq, 2)} mL.` });
      const V = Number((Veq * pick(rng, [0.3, 1, 1.3])).toFixed(2)), right = V < Veq - 1e-6 ? 'H⁺ sobrante: pH < 7' : V > Veq + 1e-6 ? 'OH⁻ sobrante: pH > 7' : 'Nada sobra: pH = 7';
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${Va},00 mL de HCl ${fix(Ca, 2)} M con NaOH ${dec(Cb, 2)} M: después de ${fix(V, 2)} mL, ¿qué manda el pH?`, right,
        ['H⁺ sobrante: pH < 7', 'OH⁻ sobrante: pH > 7', 'Nada sobra: pH = 7'].filter(t => t !== right).map(text => ({ text, note: `La equivalencia está en ${dec(Veq, 2)} mL.` })),
        { concept: 'ana.fuerte', slide: 2, hint: 'Calcula primero el volumen de equivalencia.', explain: `Equivalencia en ${dec(Veq, 2)} mL → ${right}.` });
    }
  };

  /* ════════ Indicador ════════ */
  const IND = [['Naranja de metilo (3,1–4,4)', 3.1, 4.4], ['Rojo de metilo (4,4–6,2)', 4.4, 6.2], ['Azul de bromotimol (6,0–7,6)', 6.0, 7.6], ['Fenolftaleína (8,2–10,0)', 8.2, 10.0]];
  const CASES = [['Ácido acético con NaOH', 8.73], ['Ácido fórmico con NaOH', 8.2 + 0.03], ['NH₃ con HCl', 5.28], ['HCl con NaOH', 7.0], ['Piridina con HCl', 3.2], ['Ácido benzoico con NaOH', 8.45]];
  const indicador = {
    id: 'indicador', title: 'Elegir el indicador', mission: 'm1', concepts: ['ana.indicador'],
    make(rng, level) {
      const pool = level <= 2 ? [CASES[0], CASES[2], CASES[3]] : CASES, [name, peq] = pick(rng, pool);
      const best = IND.find(i => peq >= i[1] && peq <= i[2]) || IND.reduce((a, b) => Math.abs((a[1] + a[2]) / 2 - peq) < Math.abs((b[1] + b[2]) / 2 - peq) ? a : b);
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${name}: el pH de equivalencia es ≈ ${dec(peq, 1)}. ¿Qué indicador eliges?`, best[0], IND.filter(i => i !== best).map(i => ({ text: i[0], note: 'Su intervalo no contiene el pH de equivalencia.', misconception: 'indicator-range' })),
        { concept: 'ana.indicador', slide: 3, hint: 'Busca el intervalo que contiene el pH de equivalencia.', explain: `${best[0]}.` });
    }
  };

  /* ════════ Ácido débil ════════ */
  const debil = {
    id: 'debil', title: 'pH en la curva de ácido débil', mission: 'm2', concepts: ['ana.debil'],
    make(rng, level) {
      const a = pick(rng, level <= 2 ? WEAK.slice(0, 1) : WEAK), pKa = -Math.log10(a.Ka), Va = pick(rng, [25, 50]), C = pick(rng, [0.1, 0.05]), Cb = C, Veq = Va;
      const zone = level === 1 ? 'half' : level === 2 ? 'buffer' : level === 3 ? pick(rng, ['start', 'buffer']) : pick(rng, ['eq', 'buffer', 'eq']);
      const head = `${level === 5 ? 'Estilo PEP: ' : ''}${Va},00 mL de ${a.name} ${dec(C, 2)} M (Ka = ${sci(a.Ka)}) se titulan con NaOH ${dec(Cb, 2)} M.`;
      if (zone === 'half') return number(`${head} ¿Cuál es el pH después de agregar ${dec(Veq / 2, 2)} mL?`, pKa, '', { concept: 'ana.debil', slide: 5, label: 'pH', tol: 0.005, hint: 'Es la mitad del volumen de equivalencia.',
        traps: [{ value: pKa / 2, note: 'A media titulación pH = pKa, no pKa/2.', misconception: 'half-eq' }, { value: 7, note: 'No es la equivalencia.' }], solution: [`V_eq = ${Va},00 mL; ${dec(Veq / 2, 2)} mL es la mitad`, `pH = pKa = ${dec(pKa, 2)}`], explain: `pH = ${dec(pKa, 2)}.` });
      if (zone === 'start') { const h = Math.sqrt(a.Ka * C);
        return number(`${head} ¿Cuál es el pH inicial (antes de agregar NaOH)?`, pH(h), '', { concept: 'ana.debil', slide: 4, label: 'pH', tol: 0.01, hint: '[H⁺] ≈ √(Ka·C).',
          traps: [{ value: pH(C), note: 'Lo trataste como ácido fuerte.' }, { value: pH(a.Ka * C), note: 'Falta la raíz.' }], solution: [`[H⁺] = √(${sci(a.Ka)} × ${dec(C, 2)}) = ${sci(h)}`, `pH = ${dec(pH(h), 2)}`], explain: `pH = ${dec(pH(h), 2)}.` }); }
      if (zone === 'buffer') { const Vb = Number((Veq * between(rng, 0.1, 0.9, 0.05)).toFixed(2)), nA = Vb * Cb, nHA = Va * C - nA, ans = pKa + Math.log10(nA / nHA);
        return number(`${head} ¿Cuál es el pH después de agregar ${fix(Vb, 2)} mL?`, ans, '', { concept: 'ana.debil', slide: 5, label: 'pH', tol: 0.01, hint: 'Zona tampón: pH = pKa + log(A⁻/HA).',
          traps: [{ value: pKa - Math.log10(nA / nHA), note: 'Invertiste la razón.', misconception: 'hh-ratio' }, { value: pKa, note: 'Solo a la mitad exacta.', misconception: 'half-eq' }],
          solution: [`A⁻ = ${fix(Vb, 2)} × ${dec(Cb, 2)} = ${dec(nA, 3)} mmol; HA = ${dec(Va * C, 3)} − ${dec(nA, 3)} = ${dec(nHA, 3)} mmol`, `pH = ${dec(pKa, 3)} + log(${dec(nA, 3)}/${dec(nHA, 3)}) = ${dec(ans, 2)}`], explain: `pH = ${dec(ans, 2)}.` }); }
      const cA = Va * C / (Va + Veq), Kb = 1e-14 / a.Ka, oh = Math.sqrt(Kb * cA), ans = 14 + Math.log10(oh), noDil = 14 + Math.log10(Math.sqrt(Kb * C));
      return number(`${head} ¿Cuál es el pH en el punto de equivalencia?`, ans, '', { concept: 'ana.debil', slide: 4, label: 'pH', tol: 0.005, hint: 'Queda solo A⁻: Kb = Kw/Ka y C = mmol/V total.',
        traps: [{ value: 7, note: 'Con ácido débil la equivalencia es básica.', misconception: 'eq-ph7' }, { value: 14 - ans, note: 'Ese es el pOH.' }, { value: noDil, note: 'El volumen se duplicó: C(A⁻) es la mitad.', misconception: 'dilution-ignored' }],
        solution: [`C(A⁻) = ${dec(Va * C, 3)} mmol / ${Va + Veq} mL = ${dec(cA, 4)} M`, `Kb = 10⁻¹⁴ / ${sci(a.Ka)} = ${sci(Kb)}`, `[OH⁻] = √(Kb·C) = ${sci(oh)} → pH = ${dec(ans, 2)}`], explain: `pH = ${dec(ans, 2)}.` });
    }
  };

  /* ════════ pKa desde la curva ════════ */
  const pkaCurva = {
    id: 'pka-curva', title: 'Leer el pKa en la curva', mission: 'm2', concepts: ['ana.debil'],
    make(rng, level) {
      const Veq = between(rng, 12, 40, 0.1), pKa = between(rng, 3, 6, 0.01);
      if (level <= 3) return number(`${level === 5 ? 'Estilo PEP: ' : ''}En la curva de un ácido débil, la equivalencia está en ${dec(Veq, 1)} mL y a ${dec(Veq / 2, 2)} mL el pH es ${fix(pKa, 2)}. ¿Cuál es su Ka?`, 10 ** -pKa, '', { concept: 'ana.debil', slide: 5, label: 'Ka', tol: 0.02, hint: 'A media titulación pH = pKa; Ka = 10^(−pKa).',
        traps: [{ value: 10 ** (-pKa * 2), note: 'pH = pKa, no pKa/2.', misconception: 'half-eq' }, { value: pKa, note: 'Ese es el pKa: falta Ka = 10^(−pKa).' }], solution: [`pKa = ${fix(pKa, 2)} (media titulación)`, `Ka = 10^(−${fix(pKa, 2)}) = ${sci(10 ** -pKa)}`], explain: `Ka = ${sci(10 ** -pKa)}.` });
      const V = Number((Veq * between(rng, 0.2, 0.8, 0.05)).toFixed(2)), p = Number((pKa + Math.log10(V / (Veq - V))).toFixed(2)), ans = p - Math.log10(V / (Veq - V));
      return number(`${level === 5 ? 'Estilo PEP: ' : ''}Un ácido débil se titula; la equivalencia está en ${dec(Veq, 1)} mL. Tras ${fix(V, 2)} mL de base el pH es ${fix(p, 2)}. Calcula el pKa.`, ans, '', { concept: 'ana.debil', slide: 5, label: 'pKa', tol: 0.005, hint: 'A⁻/HA = V/(V_eq − V).',
        traps: [{ value: p + Math.log10(V / (Veq - V)), note: 'Signo: pKa = pH − log(A⁻/HA).', misconception: 'hh-ratio' }, { value: p, note: 'pH = pKa solo a la mitad.', misconception: 'half-eq' }],
        solution: [`A⁻/HA = ${fix(V, 2)} / ${dec(Veq - V, 2)}`, `pKa = ${fix(p, 2)} − log(${dec(V / (Veq - V), 3)}) = ${dec(ans, 2)}`], explain: `pKa = ${dec(ans, 2)}.` });
    }
  };

  /* ════════ Polipróticos ════════ */
  const POLY = [{ name: 'H₃PO₄', pk: [2.15, 7.2, 12.35] }, { name: 'H₂CO₃', pk: [6.35, 10.33] }, { name: 'ácido oxálico (H₂C₂O₄)', pk: [1.25, 4.27] }, { name: 'ácido maleico', pk: [1.92, 6.27] }];
  const poli = {
    id: 'poli', title: 'Ácidos polipróticos', mission: 'm2', concepts: ['ana.poli'],
    make(rng, level) {
      const a = pick(rng, level <= 2 ? POLY.slice(0, 1) : POLY);
      if (level <= 2 || level === 4) { const V1 = between(rng, 8, 25, 0.1), k = level === 4 ? Math.min(a.pk.length, 2) : 2;
        return number(`${a.name} se titula con NaOH; la primera equivalencia está en ${dec(V1, 1)} mL. ¿En qué volumen está la equivalencia número ${k}?`, V1 * k, 'mL', { concept: 'ana.poli', slide: 6, label: 'V', tol: 0.005, hint: 'Cada protón gasta el mismo volumen.',
          traps: [{ value: V1 * 1.5, note: 'Cada tramo gasta lo mismo: el doble.' }], solution: [`V = ${k} × ${dec(V1, 1)} = ${dec(V1 * k, 1)} mL`], explain: `${dec(V1 * k, 1)} mL.` }); }
      const n = a.pk.length === 3 && rng() < 0.5 ? 2 : 1, ans = (a.pk[n - 1] + a.pk[n]) / 2;
      return number(`${level === 5 ? 'Estilo PEP: ' : ''}${a.name} (pKa: ${a.pk.map(p => fix(p, 2)).join('; ')}) se titula con NaOH. ¿pH aproximado en la ${n === 1 ? 'primera' : 'segunda'} equivalencia?`, ans, '', { concept: 'ana.poli', slide: 6, label: 'pH', tol: 0.005, hint: 'Anfolito: promedio de los pKa vecinos.',
        traps: [{ value: a.pk[n - 1], note: 'Ese pKa es a la mitad del tramo.', misconception: 'half-eq' }, { value: a.pk[n], note: 'Promedia los dos pKa vecinos.' }], solution: [`pH ≈ (${fix(a.pk[n - 1], 2)} + ${fix(a.pk[n], 2)})/2 = ${dec(ans, 2)}`], explain: `pH ≈ ${dec(ans, 2)}.` });
    }
  };

  /* ════════ Bases ════════ */
  const phBase = {
    id: 'ph', title: 'pH y pOH', mission: null, concepts: ['base.ph'],
    make(rng, level) {
      const m = between(rng, 1, 9.9, 0.1), e = -Math.round(between(rng, 2, 6, 1)), c = m * 10 ** e;
      if (level <= 2) return number(`[H⁺] = ${sci(c)} M. pH =`, pH(c), '', { concept: 'base.ph', slide: 2, label: 'pH', tol: 0.005, hint: 'pH = −log[H⁺].', traps: [{ value: 14 - pH(c), note: 'Ese sería el pOH.' }], solution: [`pH = −log(${sci(c)}) = ${dec(pH(c), 2)}`], explain: `${dec(pH(c), 2)}.` });
      return number(`${level === 5 ? 'Estilo PEP: ' : ''}[OH⁻] = ${sci(c)} M. pH =`, 14 - pH(c), '', { concept: 'base.ph', slide: 2, label: 'pH', tol: 0.005, hint: 'pOH = −log[OH⁻]; pH = 14 − pOH.', traps: [{ value: pH(c), note: 'Ese es el pOH.' }], solution: [`pOH = ${dec(pH(c), 2)}`, `pH = 14 − ${dec(pH(c), 2)} = ${dec(14 - pH(c), 2)}`], explain: `${dec(14 - pH(c), 2)}.` });
    }
  };
  const kaBase = {
    id: 'ka', title: 'Ka y pKa', mission: null, concepts: ['base.ka'],
    make(rng, level) {
      const a = pick(rng, WEAK);
      if (level <= 2) return number(`Ka del ${a.name} = ${sci(a.Ka)}. pKa =`, -Math.log10(a.Ka), '', { concept: 'base.ka', slide: 4, label: 'pKa', tol: 0.003, hint: 'pKa = −log Ka.', traps: [{ value: Math.log10(a.Ka), note: 'Es menos el log.' }], solution: [`pKa = ${dec(-Math.log10(a.Ka), 3)}`], explain: `${dec(-Math.log10(a.Ka), 3)}.` });
      return number(`${level === 5 ? 'Estilo PEP: ' : ''}Ka del ${a.name} = ${sci(a.Ka)}. ¿Kb de su base conjugada?`, 1e-14 / a.Ka, '', { concept: 'base.ka', slide: 4, label: 'Kb', tol: 0.02, hint: 'Kb = Kw/Ka.', traps: [{ value: a.Ka / 1e-14, note: 'Al revés.' }], solution: [`Kb = 10⁻¹⁴ / ${sci(a.Ka)} = ${sci(1e-14 / a.Ka)}`], explain: `${sci(1e-14 / a.Ka)}.` });
    }
  };

  const generators = [fuerte, zonas, indicador, debil, pkaCurva, poli, phBase, kaBase];

  /* Laboratorio "¿qué pasa con el pH?": un matraz y lo que le agregas. */
  const S = (id, name, formula) => ({ id, name, formula });
  const substances = [
    S('acido', '50 mL CH₃COOH 0,1 M', 'pH 2,88'), S('tampon', 'Tampón acético/acetato (1:4)', 'pH 4,15'), S('mitad', 'Media titulación', 'pH = pKa = 4,76'), S('eq', 'Equivalencia: solo acetato', 'pH 8,73'), S('exceso', 'Exceso de NaOH', 'pH > 11'),
    S('hcl', '50 mL HCl 0,1 M', 'pH 1,00'), S('neutro', 'Equivalencia HCl/NaOH', 'pH 7,00')
  ];
  const reagents = [['b10', 'Agregar 10 mL NaOH 0,1 M'], ['b15', 'Agregar 15 mL NaOH 0,1 M'], ['b25', 'Agregar 25 mL NaOH 0,1 M'], ['b50', 'Agregar 50 mL NaOH 0,1 M'], ['fenol', 'Agregar fenolftaleína']].map(([id, label]) => ({ id, label }));
  const RX = {
    'acido>b10': ['tampon', 'Se formó acetato: pH = 4,757 + log(1/4) = 4,15. Ya es un tampón.'],
    'acido>b25': ['mitad', 'Mitad exacta: [HA] = [A⁻] y pH = pKa = 4,76.'],
    'acido>b50': ['eq', 'Todo es acetato: hidroliza y el pH queda en 8,73, no en 7.'],
    'tampon>b15': ['mitad', '10 + 15 = 25 mL: la mitad. pH = pKa.'],
    'mitad>b25': ['eq', '50 mL en total: equivalencia, pH 8,73.'],
    'eq>b10': ['exceso', 'Ahora manda el OH⁻ sobrante: 1 mmol en 110 mL → pH 11,96.'],
    'hcl>b50': ['neutro', 'Fuerte con fuerte: queda NaCl y agua, pH 7.'],
    'eq>fenol': ['eq', 'Rosado pálido: la fenolftaleína vira en 8,2–10, justo en la equivalencia.'],
    'exceso>fenol': ['exceso', 'Rosado intenso: hay exceso de base.']
  };
  const WHY_NOT = { fenol: 'Incolora: la fenolftaleína no vira bajo pH 8,2.' };
  function react(fromId, rid) {
    const r = RX[`${fromId}>${rid}`];
    if (r) return { to: r[0], ok: true, why: r[1] };
    if (WHY_NOT[rid]) return { to: null, ok: false, why: WHY_NOT[rid] };
    return { to: null, ok: false, why: 'Prueba otro volumen: piensa cuántos mL faltan para la mitad (25 mL) o la equivalencia (50 mL).' };
  }
  const lab = { substances, reagents, react, total: Object.keys(RX).length, starts: ['acido', 'hcl'] };

  const creatures = {
    'base.ph': ['Escriba', '#a07a4a'], 'base.ka': ['Búho', '#5d6f9e'],
    'ana.fuerte': ['Trasgo', '#7f9a3c'], 'ana.indicador': ['Grifo', '#c98a1b'], 'ana.debil': ['Serpiente', '#5f9e5a'], 'ana.poli': ['Hidra', '#c0574a']
  };

  window.NexoClassGen = window.NexoClassGen || {};
  window.NexoClassGen['ana-03'] = { LEVELS, source: SRC, generators, lab, creatures };
})();
