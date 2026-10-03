const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const dist = path.join(__dirname, '..', 'dist');
const handlers = {};
const state = {
  organicProgress: { 'org-01': { status: 'dominado', oldAnswer: 'Se conserva sin borrarlo' } },
  mastery: { 'org-01': { status: 'dominado', source: 'organic-studio' } },
  errors: []
};
const app = { innerHTML: '' };
let saved = 0;
let rendered = 0;
const context = {
  window: { addEventListener() {} },
  document: {
    addEventListener(type, handler) { handlers[type] = handler; },
    getElementById() { return null; }
  },
  requestAnimationFrame(callback) { callback(); },
  Date,
  URL,
  console
};
vm.runInNewContext(fs.readFileSync(path.join(dist, 'academic', 'amine-mastery.js'), 'utf8'), context, { filename: 'amine-mastery.js' });
vm.runInNewContext(fs.readFileSync(path.join(dist, 'amine-lesson.js'), 'utf8'), context, { filename: 'amine-lesson.js' });
const bridge = {
  app,
  getState: () => state,
  saveState: () => { saved += 1; },
  renderRoute: () => { rendered += 1; context.window.NexoAmineLesson.render(bridge); },
  showToast() {}
};
context.window.NexoAmineLesson.render(bridge);
const p = state.organicProgress['org-01'];
if (p.status !== 'pendiente' || p.previousLessonStatus !== 'dominado' || state.mastery['org-01'].status !== 'pendiente') throw new Error('El dominio de la clase antigua se conservó como si fuera de la nueva');
if (p.oldAnswer !== 'Se conserva sin borrarlo') throw new Error('Se borró progreso anterior');
if (!app.innerHTML.includes('pKa(BH⁺) − pKa(HA)') || !app.innerHTML.includes('inducción, orbital y medio')) throw new Error('Faltan criterios académicos');
const ids = [...app.innerHTML.matchAll(/id="amine-(b\d{2})"/g)].map(match => match[1]);
if (ids.length !== 11 || new Set(ids).size !== 11) throw new Error('Ejercicios repetidos o ausentes');
for (const asset of ['par_piridina_pirrol.png', 'anilina_bencilamina.svg']) if (!fs.existsSync(path.join(dist, 'assets', 'lessons', asset))) throw new Error(`Falta figura ${asset}`);
const root = { querySelector: () => ({ disabled: false, textContent: '' }) };
const answerTarget = { dataset: { amineAnswer: 'b01' }, value: 'N forma un enlace nuevo con H y queda positivo; Cl queda separado.', closest: () => root };
handlers.input({ target: answerTarget });
if (!p.answers.b01 || saved < 2) throw new Error('No se guardó el intento');
const revealButton = { dataset: { amineReveal: 'b01' }, closest: () => root };
handlers.click({ target: { closest: () => revealButton } });
if (!p.revealed.b01 || p.status !== 'inestable' || rendered !== 1 || !app.innerHTML.includes('Pauta razonada')) throw new Error('No se reveló la pauta o se marcó dominio indebidamente');
const mastery = context.window.NexoAmineMastery;
const nextDay = new Date(`${p.firstAttemptAt}T12:00:00`); nextDay.setDate(nextDay.getDate() + 1);
const day = `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`;
if (mastery.eligible(p, p.firstAttemptAt) || !mastery.eligible(p, day)) throw new Error('La recuperación debe hacerse en un día posterior');
if (mastery.canComplete(p, day)) throw new Error('Una lectura de pauta se convirtió en dominio');
p.review.answers.variant = 'Comparé las tres bases y dibujé sus ácidos conjugados con el papel de cada par de nitrógeno.';
p.review.answers.transfer = 'Primero corregí el efecto del nitro y luego dibujé la conectividad de ambos nitrógenos y su protonación.';
p.review.revealed.variant = p.review.revealed.transfer = true;
p.review.verified.variant = [true, true, true];
p.review.verified.transfer = [true, true, false];
if (mastery.canComplete(p, day)) throw new Error('Un criterio omitido permitió falso dominio');
p.review.verified.transfer[2] = true;
if (!mastery.canComplete(p, day)) throw new Error('La revisión válida no permite alcanzar dominio');
p.review.hinted.variant = true;
if (mastery.canComplete(p, day)) throw new Error('Una pista permitió falso dominio');
if (app.innerHTML.includes('data-org-editor') || app.innerHTML.includes('Pegar SMILES')) throw new Error('La clase sigue dependiendo del editor químico');
console.log('OK: clase 1, migración sin falso dominio, revisión diferida, variante, transferencia y bloqueo por pista.');
