// Crea una clase nueva para el aula (torre del alquimista) con la misma estructura que Aminas.
// Uso:   node tools/new-class.cjs <id-del-tema> "<Título>" "<Evaluación>" [--catalogo]
// Ej.:   node tools/new-class.cjs org-04 "Aromáticos" "PEP 1" --catalogo
// El <id-del-tema> debe existir en el catálogo de temas (dist/data.js u organic-manifest.js), por ejemplo org-04.
// --catalogo la agrega a dist/classes/catalog.js, es decir, el tema deja de decir "Próximamente".
// Guía completa: docs/clases-estructura/COMO_CREAR_UNA_CLASE.md
const fs = require('node:fs');
const path = require('node:path');

const [id, title, evaluation] = process.argv.slice(2).filter(a => !a.startsWith('--'));
const addToCatalog = process.argv.includes('--catalogo');
if (!id || !title || !evaluation) {
  console.error('Uso: node tools/new-class.cjs <id-del-tema> "<Título>" "<Evaluación>" [--catalogo]');
  process.exit(1);
}
const root = path.join(__dirname, '..', 'dist', 'classes');
const file = path.join(root, `${id}.js`);
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
    curiosities: [{ text: 'REEMPLAZAR: dato curioso sacado de las diapositivas.', slide: 1 }],
    slideImages: {},   // se llena solo con tools/classroom-art/slides.py
    slides: { 1: { title: 'REEMPLAZAR: título de la diapositiva 1', bullets: ['REEMPLAZAR: texto de la diapositiva'] } },
    missions: [
      {
        id: 'm1', title: 'REEMPLAZAR: título de la misión', subtitle: 'REEMPLAZAR: de qué trata, en una línea', minutes: 15, slides: '1', pep: 'REEMPLAZAR: qué pregunta de la prueba prepara',
        stages: {
          diagnostic: [   // 2–3 preguntas sin pistas: deciden si se puede saltar la lección
            q('m1-d1', 'REEMPLAZAR: pregunta', [{ text: 'Correcta', correct: true }, { text: 'Distractor con error típico', misconception: 'error-ejemplo' }, { text: 'Distractor', note: 'REEMPLAZAR: por qué no' }], { explain: 'REEMPLAZAR: explicación', slide: 1 })
          ],
          fundamentals: [ // bases "desde cero" (prerrequisitos), con dibujo opcional (svg)
            { id: 'f1', title: 'Desde cero: REEMPLAZAR', body: 'REEMPLAZAR: lo mínimo, en simple.', deeper: 'REEMPLAZAR: versión paso a paso para "Explícame más simple".' }
          ],
          explain: [      // la materia, bloque por bloque, cada uno con su diapositiva
            { id: 'b1', title: 'REEMPLAZAR', slide: 1, body: 'REEMPLAZAR', rows: [['REEMPLAZAR', 'REEMPLAZAR']], deeper: 'REEMPLAZAR' }
          ],
          worked: {       // ejemplo resuelto; los pasos con "ask" se piensan antes de verlos
            prompt: 'REEMPLAZAR: problema',
            steps: [{ text: 'REEMPLAZAR: paso 1' }, { text: 'REEMPLAZAR: paso 2', ask: 'REEMPLAZAR: ¿qué pasa aquí?' }]
          },
          practice: [     // actividades variadas; todas necesitan pista (hint) y diapositiva
            q('m1-p1', 'REEMPLAZAR', [{ text: 'Correcta', correct: true }, { text: 'Otra', note: 'REEMPLAZAR' }], { explain: 'REEMPLAZAR', slide: 1, hint: 'REEMPLAZAR' }),
            order('m1-p2', 'REEMPLAZAR: ordena…', [['a', 'Primero'], ['b', 'Segundo'], ['c', 'Tercero']], ['a', 'b', 'c'], { direction: 'De menor a mayor.', explain: 'REEMPLAZAR', slide: 1, hint: 'REEMPLAZAR' }),
            classify('m1-p3', 'REEMPLAZAR: clasifica…', [['x', 'Caldero 1'], ['y', 'Caldero 2']], [['c1', 'Tarjeta 1', 'x'], ['c2', 'Tarjeta 2', 'y']], { explain: 'REEMPLAZAR', slide: 1, hint: 'REEMPLAZAR' }),
            match('m1-p4', 'REEMPLAZAR: une…', [['Izquierda 1', 'Derecha 1'], ['Izquierda 2', 'Derecha 2']], { explain: 'REEMPLAZAR', slide: 1, hint: 'REEMPLAZAR' }),
            pick('m1-p5', 'REEMPLAZAR: toca…', [[{ t: 'Parte A', target: 'a' }, { t: '–' }, { t: 'Parte B', target: 'b' }]], { a: { label: 'Parte A' }, b: { label: 'Parte B', note: 'REEMPLAZAR' } }, 'a', { explain: 'REEMPLAZAR', slide: 1, hint: 'REEMPLAZAR' })
          ],
          challenge: [],  // opcional: aparece en Expedición si la práctica salió sin ayuda
          transfer: [     // problema nuevo, estilo prueba, sin ayuda
            q('m1-t1', 'REEMPLAZAR: estilo prueba', [{ text: 'Correcta', correct: true }, { text: 'Otra', note: 'REEMPLAZAR' }], { explain: 'REEMPLAZAR', slide: 1 })
          ]
        }
      }
    ]
  };
})();
`;
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
