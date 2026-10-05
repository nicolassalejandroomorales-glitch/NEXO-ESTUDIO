// Crea una clase nueva para el aula (torre del alquimista) con la misma estructura que Aminas.
// Uso:   node tools/new-class.cjs <id-del-tema> "<Título>" "<Evaluación>" [--catalogo]
// Ej.:   node tools/new-class.cjs org-04 "Aromáticos" "PEP 1" --catalogo
// El <id-del-tema> debe existir en el catálogo de temas (dist/data.js u organic-manifest.js), por ejemplo org-04.
// --catalogo la agrega a dist/classes/catalog.js, es decir, el tema deja de decir "Próximamente".
// Guía completa: docs/clases-estructura/COMO_CREAR_UNA_CLASE.md
const fs = require('node:fs');
const path = require('node:path');

const argv = process.argv.slice(2);
const outIdx = argv.indexOf('--salida');               // --salida <carpeta>: escribe ahí (lo usan las pruebas) en vez de dist/classes
const outDir = outIdx >= 0 ? argv[outIdx + 1] : null;
const [id, title, evaluation] = argv.filter((a, i) => !a.startsWith('--') && !(outIdx >= 0 && i === outIdx + 1));
const addToCatalog = argv.includes('--catalogo') && !outDir;
if (!id || !title || !evaluation) {
  console.error('Uso: node tools/new-class.cjs <id-del-tema> "<Título>" "<Evaluación>" [--catalogo]');
  process.exit(1);
}
const root = path.join(__dirname, '..', 'dist', 'classes');
const file = path.join(outDir || root, `${id}.js`);
if (fs.existsSync(file)) { console.error(`Ya existe ${path.relative(process.cwd(), file)}: no se sobrescribe.`); process.exit(1); }

const template = `/* ${title} · ${evaluation}. Creada con tools/new-class.cjs: reemplaza cada "REEMPLAZAR".
   Guía: docs/clases-estructura/COMO_CREAR_UNA_CLASE.md · Ejemplo completo: dist/classes/org-01.js (Aminas). */
(() => {
  'use strict';
  const SRC = 'catedra';
  // Ayudantes: cada uno arma un tipo de actividad.
  const q = (id, prompt, options, extra = {}) => ({ id, type: 'choice', prompt, options, source: SRC, ...extra });
  const order = (id, prompt, cards, answer, extra = {}) => ({ id, type: 'order', prompt, cards: cards.map(([cid, text]) => ({ id: cid, text })), answer, source: SRC, ...extra });
  const classify = (id, prompt, buckets, cards, extra = {}) => ({ id, type: 'classify', prompt, buckets: buckets.map(([bid, label]) => ({ id: bid, label })), cards: cards.map(([cid, text, bucket]) => ({ id: cid, text, bucket })), source: SRC, ...extra });
  const match = (id, prompt, pairs, extra = {}) => ({ id, type: 'match', prompt, pairs: pairs.map(([left, right]) => ({ left, right })), source: SRC, ...extra });
  const pick = (id, prompt, molecules, targets, answer, extra = {}) => ({ id, type: 'pick', prompt, molecules, targets, answer, source: SRC, ...extra });
  const write = (id, prompt, model, rubric, extra = {}) => ({ id, type: 'write', prompt, model, rubric, source: SRC, ...extra });
  // Química: dibujos con el editor propio (dist/classes/editor.js). A = átomo (x, y en un lienzo de 420 × 260), B = enlace (1, 2 o 3).
  // Si tu ramo no usa moléculas, borra estos ayudantes y las actividades build/arrows: todo lo demás funciona igual.
  const A = (id, el, x, y, q = 0, extra = {}) => ({ id, el, x, y, q, ...extra });
  const B = (a, b, o = 1) => ({ a, b, o });

  window.NexoClasses = window.NexoClasses || {};
  window.NexoClasses[${JSON.stringify(id)}] = {
    id: ${JSON.stringify(id)},
    title: ${JSON.stringify(title)},
    evaluation: ${JSON.stringify(evaluation)},
    status: 'borrador',
    sources: { [SRC]: { title: 'REEMPLAZAR: Clase de cátedra · ${title}', author: 'REEMPLAZAR: profesor', detail: 'REEMPLAZAR: ramo, universidad, semestre', authority: 'Material oficial del curso' } },
    // Errores típicos: cada distractor puede apuntar a uno. "prereq" dice qué bloque repasar en el rescate.
    misconceptions: {
      'error-ejemplo': { label: 'REEMPLAZAR: nombre corto del error', why: 'REEMPLAZAR: por qué está mal, en simple.', prereq: { title: 'REEMPLAZAR: qué repasar', mission: 'm1', block: 'b1' } }
    },
    // Meta: los puntos de la prueba que esta clase prepara (de la pauta). Deben sumar "total" junto con "rest".
    goal: {
      total: 15, text: 'REEMPLAZAR: Asegurar los X puntos de ${title} de la ${evaluation}',
      questions: [{ id: 'P1', label: 'REEMPLAZAR: qué pide la pregunta', points: 15, missions: ['m1'] }],
      rest: []   // por ejemplo: [{ label: 'Otro tema (P2)', points: 5, note: 'clase en preparación' }]
    },
    // Glosario en tres capas: en simple, definición de prueba y "más simple todavía" (una analogía).
    glossary: [{ term: 'REEMPLAZAR: término', mission: 'm1', def: 'REEMPLAZAR: definición exacta, como en la prueba',
      simple: 'REEMPLAZAR: lo mismo en palabras simples', simpler: 'REEMPLAZAR: una analogía de la vida diaria' }],
    // Conceptos: las hojas del árbol. Cada actividad dice a cuál pertenece con "concept".
    concepts: [{ id: 'c1', mission: 'm1', title: 'REEMPLAZAR: idea que se aprende', needs: [] }],
    curiosities: [{ text: 'REEMPLAZAR: dato curioso sacado de las diapositivas.', slide: 1 }],
    slideImages: {},   // se llena solo con tools/classroom-art/slides.py
    slides: { 1: { title: 'REEMPLAZAR: título de la diapositiva 1', bullets: ['REEMPLAZAR: texto de la diapositiva'] } },
    missions: [
      {
        id: 'm1', title: 'REEMPLAZAR: título de la misión', subtitle: 'REEMPLAZAR: de qué trata, en una línea', minutes: 25, slides: '1', pep: 'REEMPLAZAR: qué pregunta de la prueba prepara',
        stages: {
          // Caso real del inicio (farmacia, laboratorio, vida diaria). "scene" es opcional: un dibujo de molécula.
          hook: { title: 'REEMPLAZAR: el caso', sage: 'REEMPLAZAR: lo que dice el sabio al empezar.', text: 'REEMPLAZAR: por qué esta misión importa, con un ejemplo real.' },
          diagnostic: [   // 2–3 preguntas sin pistas: si aciertas todo, puedes saltar la lección
            q('m1-d1', 'REEMPLAZAR: pregunta', [{ text: 'Correcta', correct: true }, { text: 'Distractor con error típico', misconception: 'error-ejemplo' }, { text: 'Distractor', note: 'REEMPLAZAR: por qué no' }], { concept: 'c1', explain: 'REEMPLAZAR: explicación', slide: 1 })
          ],
          fundamentals: [ // bases "desde cero" (prerrequisitos)
            { id: 'f1', title: 'Desde cero: REEMPLAZAR', body: 'REEMPLAZAR: lo mínimo, en simple.', deeper: 'REEMPLAZAR: versión paso a paso para "Explícame más simple".', slide: 1 }
          ],
          explain: [],    // con partes, la materia va dentro de cada parte
          transfer: [     // cierre: caso nuevo estilo prueba, sin ayuda. Estas dan los puntos del "Camino al 7".
            q('m1-t1', 'REEMPLAZAR: estilo prueba', [{ text: 'Correcta', correct: true }, { text: 'Otra', note: 'REEMPLAZAR' }], { concept: 'c1', explain: 'REEMPLAZAR', slide: 1 }),
            // Escrita (escalón 5): la única forma de que una hoja se ponga verde. "teach: true" = "enséñale a tu compañero".
            write('m1-w1', 'REEMPLAZAR: explícalo con tus palabras…', 'REEMPLAZAR: respuesta modelo completa, de al menos dos frases.', ['REEMPLAZAR: idea 1 de la pauta', 'REEMPLAZAR: idea 2'],
              { concept: 'c1', explain: 'REEMPLAZAR', slide: 1, teach: true, keywords: [{ label: 'REEMPLAZAR: idea clave', any: ['palabra', 'sinonimo'] }] })
          ]
        },
        // Partes (recetas): cada una con "adivina antes", lección, práctica que se va soltando (3+ tipos) y receta o regla guardada.
        parts: [
          { id: 'r1', intro: 'Parte 1: **REEMPLAZAR**.',
            pretest: q('m1-pre1', 'REEMPLAZAR: adivina antes de la lección (no cuenta)', [{ text: 'Correcta', correct: true }, { text: 'Otra', note: 'REEMPLAZAR' }], { concept: 'c1', explain: 'REEMPLAZAR', slide: 1 }),
            explain: [
              { id: 'b1', title: 'REEMPLAZAR', slide: 1, body: 'REEMPLAZAR: la idea, con el dato de la diapositiva.', deeper: 'REEMPLAZAR: más simple, paso a paso.' }
              // Mecanismo con controles (solo química): { id: 'b1m', title, slide, body, deeper, frames: [{ scene, lonePairs, arrows: [['lp:n', 'a:c']], caption }] }
            ],
            practice: [   // todas con pista (hint). Tipos: choice, order, classify, match, pick, write, poe, recipe, spot, build, arrows
              q('m1-p1', 'REEMPLAZAR', [{ text: 'Correcta', correct: true }, { text: 'Otra', note: 'REEMPLAZAR' }], { concept: 'c1', explain: 'REEMPLAZAR', slide: 1, hint: 'REEMPLAZAR' }),
              order('m1-p2', 'REEMPLAZAR: ordena…', [['a', 'Primero'], ['b', 'Segundo'], ['c', 'Tercero']], ['a', 'b', 'c'], { concept: 'c1', direction: 'De menor a mayor.', explain: 'REEMPLAZAR', slide: 1, hint: 'REEMPLAZAR' }),
              { id: 'm1-fx1', type: 'spot', source: SRC, concept: 'c1', slide: 1, prompt: 'Un aprendiz se equivocó. ¿En qué paso?',
                steps: ['REEMPLAZAR: paso bien', 'REEMPLAZAR: paso con el error', 'REEMPLAZAR: conclusión'], wrong: 1,
                stepNotes: { 0: 'REEMPLAZAR: por qué este paso está bien', 2: 'REEMPLAZAR: viene del error anterior' },
                fix: { question: '¿Cómo se corrige?', options: [{ text: 'REEMPLAZAR: corrección', correct: true }, { text: 'Otra', note: 'REEMPLAZAR' }] },
                explain: 'REEMPLAZAR', hint: 'REEMPLAZAR' }
            ],
            // Si la parte es una reacción: recipe: { title, base, reagents, condition, result, note }. Si no, una regla (lista de chequeo):
            rule: { title: 'REEMPLAZAR: Regla de…', concept: 'c1', steps: ['REEMPLAZAR: paso 1', 'REEMPLAZAR: paso 2'] } }
        ]
      }
    ],
    // ── El grimorio ──
    formulas: [ // tarjetas del formulario (opcional "calc": calculadora)
      { id: 'f-ej', title: 'REEMPLAZAR', formula: 'REEMPLAZAR: y = a·x', concepts: ['c1'], vars: [['a', 'REEMPLAZAR: qué es', 'REEMPLAZAR: unidad']],
        what: 'REEMPLAZAR: para qué sirve', when: 'REEMPLAZAR: cuándo se usa', example: 'REEMPLAZAR: ejemplo resuelto', deeper: 'REEMPLAZAR: por qué funciona',
        sources: [{ label: 'Cátedra · diap. 1', slide: 1 }],
        calc: { inputs: [{ id: 'x', label: 'x', value: 2, step: 1 }], run: v => 'y = **' + (2 * v.x) + '**' } }
    ],
    recipes: [],  // reacciones del recetario: { id, mission, concept, slide, title, base, reagents, condition, result, note }
    // Más ayuda: una mini clase por concepto (idea, 3 pasos, pregunta) y, si quieres, una clase "a profundidad".
    mini: {
      c1: { idea: 'REEMPLAZAR: la idea con una imagen', steps: ['REEMPLAZAR: paso 1', 'REEMPLAZAR: paso 2', 'REEMPLAZAR: paso 3'],
        check: { prompt: 'REEMPLAZAR: pregunta de control', options: [{ text: 'Correcta', correct: true }, { text: 'Otra', note: 'REEMPLAZAR' }], explain: 'REEMPLAZAR' } }
    },
    deep: {
      c1: { title: 'REEMPLAZAR: el tema a fondo', sections: [['REEMPLAZAR', 'REEMPLAZAR'], ['REEMPLAZAR', 'REEMPLAZAR'], ['REEMPLAZAR', 'REEMPLAZAR']],
        challenge: { prompt: 'REEMPLAZAR: desafío', options: [{ text: 'Correcta', correct: true }, { text: 'Otra', note: 'REEMPLAZAR' }], explain: 'REEMPLAZAR' },
        sources: [{ label: 'Cátedra · diap. 1', slide: 1 }, { label: 'REEMPLAZAR: libro o LibreTexts', url: 'https://chem.libretexts.org/' }] }
    },
    // Diagnóstico "¿Por dónde empiezo?": preguntas propias en 3 niveles (1 bases, 2 lo básico, 3 lo difícil).
    diagnosis: { start: 2, max: 3, items: [
      { level: 1, item: q('dx-1', 'REEMPLAZAR: base', [{ text: 'Correcta', correct: true }, { text: 'Otra' }], { concept: 'c1', explain: 'REEMPLAZAR', slide: 1 }) },
      { level: 2, item: q('dx-2', 'REEMPLAZAR: básico', [{ text: 'Correcta', correct: true }, { text: 'Otra' }], { concept: 'c1', explain: 'REEMPLAZAR', slide: 1 }) },
      { level: 3, item: q('dx-3', 'REEMPLAZAR: difícil', [{ text: 'Correcta', correct: true }, { text: 'Otra' }], { concept: 'c1', explain: 'REEMPLAZAR', slide: 1 }) }
    ] }
  };
})();
`;
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, template);
console.log(`Creada ${path.relative(process.cwd(), file)}`);

if (addToCatalog) {
  const catalogPath = path.join(root, 'catalog.js');
  const catalog = fs.readFileSync(catalogPath, 'utf8');
  if (!catalog.includes(`'${id}'`)) {
    fs.writeFileSync(catalogPath, catalog.replace(/\n\}\);\s*$/, `,\n  '${id}': '${id}.js'\n});\n`));
    console.log(`Agregada al catálogo: el tema ${id} ahora abre el aula.`);
  }
}
console.log(`Siguiente:
  1. Reemplaza cada "REEMPLAZAR" en dist/classes/${id}.js (busca con Ctrl+F).
  2. Si tienes el PDF de cátedra: python3 tools/classroom-art/slides.py RUTA.pdf ${id}
  3. Revisa: node tools/classroom-test.cjs
  4. ${addToCatalog ? 'Regenera el arranque: node tools/build-startup.cjs' : 'Cuando esté lista: vuelve a correr con --catalogo y regenera el arranque (node tools/build-startup.cjs)'}`);
