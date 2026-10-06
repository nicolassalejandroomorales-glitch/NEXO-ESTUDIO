/* Ejercicios infinitos de "El análisis químico y sus errores" (Química Analítica, PEP 1). Cada generador arma una pregunta nueva desde una semilla y un nivel:
   1 Fácil · 2 Media · 3 Intermedia · 4 Avanzada · 5 Nivel PEP. Los resultados se CALCULAN (nunca se escriben a mano).
   Datos: ejemplos de la clase de Etapas (Pizarro) y errores de Skoog (cap. 5–6). */
(() => {
  'use strict';
  const SRC = 'catedra-ana';
  const LEVELS = ['Fácil', 'Media', 'Intermedia', 'Avanzada', 'Nivel PEP'];
  const pick = (rng, list) => list[Math.floor(rng() * list.length)];
  const shuffle = (rng, list) => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const between = (rng, a, b, step) => Math.round((a + rng() * (b - a)) / step) * step;
  const dec = (x, d = 2) => Number(x).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: d }).replace('-', '−');
  const fix = (x, d) => Number(x).toLocaleString('es-CL', { minimumFractionDigits: d, maximumFractionDigits: d }).replace('-', '−'); // cifras fijas: 0,752 ppm
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
  const mean = xs => xs.reduce((a, b) => a + b, 0) / xs.length;
  const sdev = (xs, n1 = true) => { const m = mean(xs); return Math.sqrt(xs.reduce((a, x) => a + (x - m) ** 2, 0) / (xs.length - (n1 ? 1 : 0))); };
  const replicas = (rng, center, spread, n, d) => Array.from({ length: n }, () => Number((center + (rng() - 0.5) * 2 * spread).toFixed(d)));

  /* ════════ Conceptos y tipos de análisis ════════ */
  const CASES = [
    { text: 'Medir cuántos mg de cafeína tiene una bebida titulando con un reactivo', kind: 'Cuantitativo, volumétrico (clásico)' },
    { text: 'Pesar el BaSO₄ precipitado para saber cuánto sulfato hay', kind: 'Cuantitativo, gravimétrico (clásico)' },
    { text: 'Medir la absorbancia de una solución para saber cuánto Fe tiene', kind: 'Cuantitativo, óptico (instrumental)' },
    { text: 'Medir con un electrodo cuánto fluoruro tiene el agua', kind: 'Cuantitativo, electroanalítico (instrumental)' },
    { text: 'Saber si un polvo contiene o no paracetamol con un espectro IR', kind: 'Cualitativo' }
  ];
  const KINDS = CASES.map(c => c.kind);
  const MATRIX = [
    { analyte: 'plomo', sample: 'sangre', matrix: 'proteínas, células y sales de la sangre' },
    { analyte: 'paracetamol', sample: 'un comprimido', matrix: 'almidón, lactosa y demás excipientes' },
    { analyte: 'nitrato', sample: 'agua de pozo', matrix: 'agua, cloruros, sulfatos y materia orgánica' },
    { analyte: 'cobre', sample: 'un mineral', matrix: 'silicatos, óxidos de hierro y otros minerales' }
  ];
  const conceptos = {
    id: 'conceptos', title: 'Tipos de análisis', mission: 'm1', concepts: ['ana.conceptos'],
    make(rng, level) {
      if (level <= 2 || level === 4) { const c = pick(rng, CASES);
        return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${c.text}. ¿Qué tipo de análisis es?`, c.kind, KINDS.filter(k => k !== c.kind).map(text => ({ text, note: '¿Qué es o cuánto hay? Y si es cuánto: ¿volumen, masa, luz o electricidad?', misconception: text === 'Cualitativo' || c.kind === 'Cualitativo' ? 'quali-quanti' : undefined })),
          { concept: 'ana.conceptos', slide: 3, hint: 'Mira qué magnitud se mide.', explain: `${c.kind}.` }); }
      const m = pick(rng, MATRIX), ask = pick(rng, level === 5 ? ['matriz', 'analito'] : ['matriz', 'analito', 'muestra']);
      const right = ask === 'matriz' ? m.matrix : ask === 'analito' ? `El ${m.analyte}` : `La porción de ${m.sample} que se analiza`;
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}Se determina ${m.analyte} en ${m.sample}. ¿Cuál es ${ask === 'matriz' ? 'la matriz' : ask === 'analito' ? 'el analito' : 'la muestra'}?`, right,
        [m.matrix, `El ${m.analyte}`, `La porción de ${m.sample} que se analiza`].filter(t => t !== right).map(text => ({ text, note: 'Analito = lo buscado; muestra = lo que analizas; matriz = lo que acompaña al analito.', misconception: 'analyte-matrix' })),
        { concept: 'ana.conceptos', slide: 2, hint: 'La matriz es "todo lo demás".', explain: `${right}.` });
    }
  };

  /* ════════ Etapas ════════ */
  const STAGES = ['Selección del método', 'Obtención de la muestra', 'Preparación y eliminación de interferentes', 'Medición del analito', 'Cálculo de resultados', 'Análisis de la confiabilidad', 'Interpretación y entrega del informe'];
  const ACTIONS = [
    ['Decidir entre volumetría y espectroscopía según costo, tiempo y exactitud', 0], ['Tomar sangre con el protocolo para gases', 1], ['Secar la muestra a 105 °C y disolverla en HNO₃', 2],
    ['Agregar un agente enmascarante', 2], ['Leer la absorbancia de la muestra', 3], ['Despejar la concentración desde la recta', 4], ['Calcular la desviación estándar de las réplicas', 5], ['Redactar la discusión y las conclusiones', 6]
  ];
  const etapas = {
    id: 'etapas', title: 'Etapas del análisis', mission: 'm1', concepts: ['ana.etapas'],
    make(rng, level) {
      const [text, k] = pick(rng, ACTIONS);
      if (level >= 3) { const after = k < 6;
        if (level >= 4 && after) return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}"${text}" corresponde a la etapa ${k + 1}. ¿Qué etapa viene justo después?`, STAGES[k + 1], shuffle(rng, STAGES.filter((s, i) => i !== k + 1)).map(t => ({ text: t, note: 'Repasa el orden de las 7 etapas.' })),
          { concept: 'ana.etapas', slide: 7, hint: 'Método → muestra → preparación → medición → cálculo → confiabilidad → informe.', explain: `${STAGES[k + 1]}.` }); }
      return choice(rng, `¿En qué etapa del análisis se hace esto? "${text}"`, STAGES[k], shuffle(rng, STAGES.filter((s, i) => i !== k)).map(t => ({ text: t, note: 'Piensa en qué momento del análisis se hace.' })),
        { concept: 'ana.etapas', slide: 7, hint: 'Son 7 etapas, del método al informe.', explain: `${STAGES[k]} (etapa ${k + 1}).` });
    }
  };

  /* ════════ Humedad ════════ */
  const humedad = {
    id: 'humedad', title: 'Factor de humedad', mission: 'm1', concepts: ['ana.humedad'],
    make(rng, level) {
      if (level <= 2) { const fh = between(rng, 1.03, 1.25, 0.01), ms = between(rng, 0.5, 10, 0.25), m = ms * fh;
        return number(`Fh = ${fix(fh, 2)}. ¿Cuántos gramos de muestra húmeda pesas para tener ${dec(ms)} g de masa seca?`, m, 'g', { concept: 'ana.humedad', slide: 9, label: 'masa', tol: 0.01, hint: 'masa a pesar = masa seca × Fh.',
          traps: [{ value: ms / fh, note: 'Dividiste: la muestra húmeda pesa más.', misconception: 'humidity-direction' }], solution: [`m = ${dec(ms)} × ${fix(fh, 2)} = ${dec(m, 3)} g`], explain: `${dec(m, 3)} g.` }); }
      const mh = between(rng, 1.5, 5, 0.001), ms = Number((mh * between(rng, 0.8, 0.97, 0.001)).toFixed(3)), h = (mh - ms) / ms * 100, fh = (100 + h) / 100;
      if (level === 3) return number(`Una muestra de ${fix(mh, 3)} g pesa ${fix(ms, 3)} g después de secarla a 105 °C. Calcula el porcentaje de humedad (base seca).`, h, '%', { concept: 'ana.humedad', slide: 9, label: '%h', tol: 0.01, hint: '%h = (m_M − m_seca)/m_seca × 100.',
        traps: [{ value: (mh - ms) / mh * 100, note: 'La fórmula de la clase divide por la masa seca.' }], solution: [`%h = (${fix(mh, 3)} − ${fix(ms, 3)})/${fix(ms, 3)} × 100 = ${dec(h, 2)} %`], explain: `%h = ${dec(h, 2)} %.` });
      if (level === 4) return number(`Una muestra de ${fix(mh, 3)} g pesa ${fix(ms, 3)} g seca. Calcula el factor de humedad Fh.`, fh, '', { concept: 'ana.humedad', slide: 9, label: 'Fh', tol: 0.003, hint: 'Primero %h; luego Fh = (100 + %h)/100.',
        traps: [{ value: h, note: 'Ese es el %h.' }, { value: (100 + (mh - ms) / mh * 100) / 100, note: 'Dividiste por la masa húmeda.' }], solution: [`%h = ${dec(h, 2)} %`, `Fh = (100 + ${dec(h, 2)})/100 = ${fix(fh, 4)}`], explain: `Fh = ${fix(fh, 4)}.` });
      const want = between(rng, 1, 5, 0.25), m = want * fh;
      return number(`Estilo PEP: una muestra de ${fix(mh, 3)} g pesa ${fix(ms, 3)} g seca a 105 °C. ¿Cuánta muestra húmeda pesas para tener ${dec(want)} g de masa seca?`, m, 'g', { concept: 'ana.humedad', slide: 9, label: 'masa', tol: 0.01, hint: '%h → Fh → masa seca × Fh.',
        traps: [{ value: want / fh, note: 'Dividiste por Fh.', misconception: 'humidity-direction' }, { value: want * (1 + (mh - ms) / mh), note: 'El %h va sobre la masa seca.' }],
        solution: [`%h = (${fix(mh, 3)} − ${fix(ms, 3)})/${fix(ms, 3)} × 100 = ${dec(h, 2)} %`, `Fh = ${fix(fh, 4)}`, `m = ${dec(want)} × ${fix(fh, 4)} = ${dec(m, 3)} g`], explain: `${dec(m, 3)} g.` });
    }
  };

  /* ════════ Disolución, disgregación e interferentes ════════ */
  const TREAT = [
    ['NaCl en agua a temperatura ambiente', 'Disolución'], ['Un óxido con HCl diluido a 80 °C', 'Disolución'], ['Una aleación con agua regia caliente', 'Disgregación'],
    ['Un silicato fundido con carbonato de sodio', 'Disgregación'], ['Un mineral con H₂SO₄ concentrado a 200 °C', 'Disgregación'],
    ['Agregar F⁻ para que el Fe³⁺ no reaccione', 'Enmascaramiento'], ['Agregar CN⁻ para que el Cu²⁺ no interfiera', 'Enmascaramiento'],
    ['Pasar la solución por una resina de intercambio iónico', 'Separación'], ['Extraer el analito con éter', 'Separación'], ['Destilar el amoníaco y recogerlo', 'Separación']
  ];
  const interferentes = {
    id: 'interferentes', title: 'Preparar la muestra', mission: 'm1', concepts: ['ana.interferentes'],
    make(rng, level) {
      const pool = level <= 2 ? TREAT.slice(0, 5) : TREAT, [text, kind] = pick(rng, pool);
      const opts = level <= 2 ? ['Disolución', 'Disgregación'] : ['Disolución', 'Disgregación', 'Enmascaramiento', 'Separación'];
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}"${text}". ¿Qué operación es?`, kind, opts.filter(o => o !== kind).map(t => ({ text: t, note: 'Disolver = suave; disgregar = enérgico; enmascarar = el interferente queda pero no reacciona; separar = se saca.' })),
        { concept: 'ana.interferentes', slide: kind === 'Enmascaramiento' || kind === 'Separación' ? 11 : 10, hint: '¿Suave, enérgico, se esconde o se saca?', explain: `${kind}.` });
    }
  };

  /* ════════ Calibración ════════ */
  const calibracion = {
    id: 'calibracion', title: 'Recta de calibración', mission: 'm2', concepts: ['ana.calibracion'],
    make(rng, level) {
      const m = between(rng, 0.004, 0.03, 0.0001), b = level >= 3 ? between(rng, 0.002, 0.03, 0.001) : 0, xmax = 70, x = between(rng, 5, 65, 0.1), y = m * x + b;
      const eq = b ? `A = ${fix(m, 4)}·C + ${fix(b, 3)}` : `A = ${fix(m, 4)}·C`;
      if (level <= 3) return number(`Con la recta ${eq} (C en mg/L), una muestra da A = ${fix(y, 3)}. Calcula C.`, (Number(y.toFixed(3)) - b) / m, 'mg/L', { concept: 'ana.calibracion', slide: 12, label: 'C', tol: 0.01, hint: 'C = (A − b)/m.',
        traps: [{ value: Number(y.toFixed(3)) * m, note: 'Divide por la pendiente.', misconception: 'calib-invert' }, { value: Number(y.toFixed(3)) / m, note: 'Falta restar el intercepto.' }],
        solution: [`C = (${fix(y, 3)}${b ? ` − ${fix(b, 3)}` : ''}) / ${fix(m, 4)}`, `C = ${dec((Number(y.toFixed(3)) - b) / m, 1)} mg/L`], explain: `C = ${dec((Number(y.toFixed(3)) - b) / m, 1)} mg/L.` });
      const f = pick(rng, [5, 10, 20, 25]), yr = Number(y.toFixed(3)), c = (yr - b) / m, orig = c * f, vol = pick(rng, [50, 100, 250]), ali = vol / f;
      return number(`${level === 5 ? 'Estilo PEP: ' : ''}Se tomaron ${dec(ali)} mL de una muestra y se aforaron a ${vol} mL. La solución diluida da A = ${fix(yr, 3)} con la recta ${eq} (mg/L, rango 0–${xmax}). ¿Concentración de la muestra original?`, orig, 'mg/L',
        { concept: 'ana.calibracion', slide: 12, label: 'C', tol: 0.01, hint: 'Primero C de la diluida; luego × factor de dilución.',
          traps: [{ value: c, note: 'Esa es la diluida: falta multiplicar por el factor de dilución.' }, { value: c / f, note: 'Al deshacer la dilución, la concentración sube.' }, { value: yr * m * f, note: 'Divide por la pendiente.', misconception: 'calib-invert' }],
          solution: [`C(diluida) = (${fix(yr, 3)}${b ? ` − ${fix(b, 3)}` : ''}) / ${fix(m, 4)} = ${dec(c, 2)} mg/L`, `Factor = ${vol}/${dec(ali)} = ${f}`, `C(original) = ${dec(c, 2)} × ${f} = ${dec(orig, 1)} mg/L`], explain: `${dec(orig, 1)} mg/L.` });
    }
  };

  /* ════════ Exactitud ════════ */
  const exactitud = {
    id: 'exactitud', title: 'Error absoluto y relativo', mission: 'm2', concepts: ['ana.exactitud'],
    make(rng, level) {
      const xv = pick(rng, [10, 20, 25, 50, 100]), n = level <= 2 ? 1 : level <= 3 ? 3 : 5;
      const xs = replicas(rng, xv * (1 + pick(rng, [-1, 1]) * between(rng, 0.005, 0.04, 0.001)), xv * 0.006, n, 2), xm = mean(xs), E = xm - xv, Er = E / xv * 100;
      if (level === 1) return number(`Un estándar de ${dec(xv)} ppm se midió como ${fix(xs[0], 2)} ppm. Calcula el error absoluto.`, xs[0] - xv, 'ppm', { concept: 'ana.exactitud', slide: 13, label: 'E', tol: 0.001, hint: 'E = medido − verdadero (con signo).',
        traps: [{ value: xv - xs[0], note: 'Es medido menos verdadero.' }, { value: (xs[0] - xv) / xv * 100, note: 'Ese es el error relativo.' }], solution: [`E = ${fix(xs[0], 2)} − ${dec(xv)} = ${dec(xs[0] - xv, 2)} ppm`], explain: `E = ${dec(xs[0] - xv, 2)} ppm.` });
      const list = xs.map(x => fix(x, 2)).join('; ');
      return number(`${level === 5 ? 'Estilo PEP: ' : ''}Un material de referencia de ${dec(xv)} ppm se analizó ${n === 1 ? 'una vez' : `${n} veces`}: ${list} ppm. Calcula el error relativo${n > 1 ? ' del promedio' : ''} (%).`, Er, '%',
        { concept: 'ana.exactitud', slide: 13, label: 'Er', tol: 0.03, hint: 'Er = (x̄ − x_v)/x_v × 100.', traps: [{ value: E, note: 'Ese es el error absoluto.' }, { value: -Er, note: 'Medido menos verdadero: cuida el signo.' }],
          solution: [...(n > 1 ? [`x̄ = ${dec(xm, 3)} ppm`] : []), `Er = (${dec(xm, 3)} − ${dec(xv)})/${dec(xv)} × 100 = ${dec(Er, 2)} %`], explain: `Er = ${dec(Er, 2)} %.` });
    }
  };

  /* ════════ Precisión ════════ */
  const precision = {
    id: 'precision', title: 'Desviación estándar y CV', mission: 'm2', concepts: ['ana.precision'],
    make(rng, level) {
      const center = pick(rng, [0.75, 10.1, 25.3, 4.52]), d = center < 1 ? 3 : 2, n = level <= 2 ? 3 : level <= 4 ? 4 : 5;
      let xs = replicas(rng, center, center * 0.01, n, d); if (new Set(xs).size === 1) xs[0] = Number((xs[0] + 10 ** -d).toFixed(d));
      const s = sdev(xs), cv = s / mean(xs) * 100, list = xs.map(x => fix(x, d)).join('; ');
      if (level <= 3) return number(`Réplicas: ${list}. Calcula la desviación estándar (muestral).`, s, '', { concept: 'ana.precision', slide: 13, label: 's', tol: 0.03, hint: 's = √[Σ(xᵢ − x̄)²/(n − 1)].',
        traps: [{ value: sdev(xs, false), note: 'Dividiste por n: con réplicas se usa n − 1.', misconception: 'n-vs-n1' }, { value: s * s, note: 'Esa es la varianza: falta la raíz.' }],
        solution: [`x̄ = ${dec(mean(xs), d + 2)}`, `s = ${dec(s, d + 2)}`], explain: `s = ${dec(s, d + 2)}.` });
      return number(`${level === 5 ? 'Estilo PEP: ' : ''}Réplicas: ${list}. Calcula el coeficiente de variación (%).`, cv, '%', { concept: 'ana.precision', slide: 13, label: 'CV', tol: 0.03, hint: 'CV = s/x̄ × 100, con s usando n − 1.',
        traps: [{ value: sdev(xs, false) / mean(xs) * 100, note: 'Usaste n en vez de n − 1.', misconception: 'n-vs-n1' }, { value: s, note: 'Esa es s: falta dividir por el promedio y × 100.' }],
        solution: [`x̄ = ${dec(mean(xs), d + 2)}`, `s = ${dec(s, d + 2)}`, `CV = ${dec(s, d + 2)}/${dec(mean(xs), d + 2)} × 100 = ${dec(cv, 2)} %`], explain: `CV = ${dec(cv, 2)} %.` });
    }
  };

  /* ════════ Tipos de error ════════ */
  const ERR = [
    ['Una pipeta mal calibrada entrega siempre 0,05 mL de menos', 'Sistemático (instrumental)'], ['Un reactivo contaminado aumenta siempre el resultado', 'Sistemático (de método o reactivo)'],
    ['El indicador vira antes del punto de equivalencia', 'Sistemático (de método)'], ['El analista siempre lee el menisco por arriba', 'Sistemático (personal)'],
    ['Pequeñas fluctuaciones en la lectura de la balanza', 'Aleatorio'], ['Variaciones de temperatura del laboratorio de un día a otro', 'Aleatorio'],
    ['Se derramó parte de la muestra', 'Grueso'], ['Se anotó 25,3 en vez de 52,3', 'Grueso']
  ];
  const errores = {
    id: 'errores', title: 'Tipos de error', mission: 'm2', concepts: ['ana.errores'],
    make(rng, level) {
      const [text, kind] = pick(rng, ERR), simple = kind.split(' (')[0];
      if (level <= 3) return choice(rng, `"${text}". ¿Qué tipo de error es?`, simple, ['Sistemático', 'Aleatorio', 'Grueso'].filter(k => k !== simple).map(t => ({ text: t, note: 'Sistemático: con causa, un solo lado. Aleatorio: al azar. Grueso: equivocación grande.', misconception: 'error-type' })),
        { concept: 'ana.errores', slide: 20, source: 'skoog', hint: '¿Siempre hacia el mismo lado?', explain: `${kind}.` });
      const right = simple === 'Sistemático' ? 'La exactitud (corre todos los resultados)' : simple === 'Aleatorio' ? 'La precisión (dispersa las réplicas)' : 'Produce un dato anómalo: se descarta y se repite';
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}"${text}". ¿Qué afecta principalmente este error?`, right,
        ['La exactitud (corre todos los resultados)', 'La precisión (dispersa las réplicas)', 'Produce un dato anómalo: se descarta y se repite'].filter(t => t !== right).map(t => ({ text: t, note: `Es un error ${simple.toLowerCase()}.`, misconception: 'acc-prec' })),
        { concept: 'ana.errores', slide: 20, source: 'skoog', hint: 'Primero clasifica el error.', explain: `${kind}: ${right.toLowerCase()}.` });
    }
  };

  /* ════════ Bases ════════ */
  const unidades = {
    id: 'unidades', title: '%, ppm y mg/L', mission: null, concepts: ['base.unidades'],
    make(rng, level) {
      if (level <= 2) { const p = between(rng, 0.01, 2, 0.01);
        return number(`¿A cuántos ppm equivale ${dec(p)} %?`, p * 1e4, 'ppm', { concept: 'base.unidades', slide: 9, label: 'ppm', tol: 0.001, hint: '1 % = 10 000 ppm.', traps: [{ value: p * 100, note: 'Multiplica por 10 000.' }, { value: p / 1e4, note: 'Al revés.' }], solution: [`${dec(p)} × 10 000 = ${dec(p * 1e4, 0)} ppm`], explain: `${dec(p * 1e4, 0)} ppm.` }); }
      const mg = between(rng, 0.5, 50, 0.1), mL = pick(rng, [50, 100, 250, 500]), ppm = mg / (mL / 1000);
      return number(`${level === 5 ? 'Estilo PEP: ' : ''}Se disuelven ${dec(mg, 1)} mg de analito en agua hasta ${mL} mL. ¿Concentración en ppm (mg/L)?`, ppm, 'ppm', { concept: 'base.unidades', slide: 9, label: 'C', tol: 0.01, hint: 'ppm ≈ mg/L: pasa los mL a L.',
        traps: [{ value: mg / mL, note: 'Pasa los mL a L.' }, { value: mg * mL / 1000, note: 'Divide por el volumen.' }], solution: [`C = ${dec(mg, 1)} mg / ${dec(mL / 1000, 3)} L = ${dec(ppm, 1)} mg/L`], explain: `${dec(ppm, 1)} ppm.` });
    }
  };
  const media = {
    id: 'media', title: 'Promedio', mission: null, concepts: ['base.media'],
    make(rng, level) {
      const n = level <= 2 ? 3 : 5, xs = replicas(rng, between(rng, 2, 50, 0.1), 0.3, n, 2), m = mean(xs);
      return number(`${level === 5 ? 'Estilo PEP: ' : ''}Calcula el promedio de: ${xs.map(x => fix(x, 2)).join('; ')}.`, m, '', { concept: 'base.media', slide: 13, label: 'x̄', tol: 0.001, hint: `Suma y divide por ${n}.`,
        traps: [{ value: m * n, note: `Falta dividir por ${n}.` }, { value: m * n / (n - 1), note: `El promedio se divide por n (${n}), no por n − 1.` }], solution: [`x̄ = ${dec(m * n, 2)} / ${n} = ${dec(m, 3)}`], explain: `x̄ = ${dec(m, 3)}.` });
    }
  };

  const generators = [conceptos, etapas, humedad, interferentes, calibracion, exactitud, precision, errores, unidades, media];

  /* Laboratorio "¿qué hago con esta muestra?": una muestra cruda y operaciones de preparación (etapa 3). */
  const S = (id, name, formula) => ({ id, name, formula });
  const substances = [
    S('humeda', 'Polvo de suelo húmedo', 'masa con agua'), S('seca', 'Polvo seco a 105 °C', 'masa seca constante'),
    S('mineral', 'Mineral de cobre (con silicatos)', 'insoluble en agua'), S('solucion-fe', 'Solución de Cu²⁺ con Fe³⁺ que interfiere', 'lista para tratar'),
    S('lista', 'Solución de Cu²⁺ sin interferencia', 'lista para medir'), S('sal', 'Sal de mesa', 'NaCl soluble'), S('salmuera', 'Solución de NaCl', 'lista para medir')
  ];
  const reagents = [['secar', 'Secar a 105 °C'], ['agua', 'Disolver en agua'], ['regia', 'Disgregar con agua regia caliente'], ['enmascarar', 'Agregar F⁻ (enmascarante del Fe³⁺)'], ['extraer', 'Extraer el Fe³⁺ con solvente'], ['medir', 'Medir de inmediato']].map(([id, label]) => ({ id, label }));
  const RX = {
    'humeda>secar': ['seca', 'Ahora la masa es seca: con %h y Fh puedes informar en base seca.'],
    'mineral>regia': ['solucion-fe', 'Disgregación: ácidos concentrados y calientes atacan lo que el agua no disuelve. Pero el Fe³⁺ del mineral también pasó a la solución.'],
    'solucion-fe>enmascarar': ['lista', 'El F⁻ forma un complejo con el Fe³⁺: sigue ahí, pero ya no reacciona (enmascaramiento).'],
    'solucion-fe>extraer': ['lista', 'El Fe³⁺ se fue al solvente: separación por extracción.'],
    'sal>agua': ['salmuera', 'Disolución simple: agua a temperatura ambiente basta.']
  };
  const WHY_NOT = { agua: 'El agua no disuelve esto: necesitas un tratamiento más enérgico (disgregación).', medir: 'Todavía no: falta preparar la muestra (etapa 3) antes de medir (etapa 4).', regia: 'No hace falta algo tan enérgico (y es peligroso): usa el tratamiento más suave que funcione.',
    secar: 'Secar no cambia nada aquí.', enmascarar: 'No hay Fe³⁺ que enmascarar.', extraer: 'No hay interferente que extraer.' };
  function react(fromId, rid) {
    const r = RX[`${fromId}>${rid}`];
    if (r) return { to: r[0], ok: true, why: r[1] };
    if (['lista', 'salmuera', 'seca'].includes(fromId)) return { to: null, ok: false, why: rid === 'medir' && fromId !== 'seca' ? '¡Lista! Esta muestra ya se puede medir.' : 'Esta muestra ya está preparada: vuelve a "Otra sustancia" para probar otra.' };
    return { to: null, ok: false, why: WHY_NOT[rid] || 'Esta operación no sirve aquí.' };
  }
  const lab = { substances, reagents, react, total: Object.keys(RX).length, starts: ['humeda', 'mineral', 'sal'] };

  const creatures = {
    'base.unidades': ['Escriba', '#a07a4a'], 'base.media': ['Búho', '#5d6f9e'],
    'ana.conceptos': ['Trasgo', '#7f9a3c'], 'ana.etapas': ['Duende', '#6d8bd6'], 'ana.humedad': ['Niebla', '#7fa3a0'], 'ana.interferentes': ['Serpiente', '#5f9e5a'],
    'ana.calibracion': ['Espectro', '#7aa4b5'], 'ana.exactitud': ['Grifo', '#c98a1b'], 'ana.precision': ['Gólem', '#8a6fd1'], 'ana.errores': ['Hidra', '#c0574a']
  };

  window.NexoClassGen = window.NexoClassGen || {};
  window.NexoClassGen['ana-01'] = { LEVELS, source: SRC, generators, lab, creatures };
})();
