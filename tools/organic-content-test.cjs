const fs = require('fs');
const path = require('path');
const vm = require('vm');
const initRDKit = require('../dist/vendor/rdkit/RDKit_minimal.js');
const crypto = require('node:crypto');

const editorDir = path.join(__dirname, '../dist/vendor/ketcher/static/js');
const editorParts = ['main.e47c48ad.part1.txt', 'main.e47c48ad.part2.txt'].map(name => fs.readFileSync(path.join(editorDir, name)));
if (editorParts.some(part => part.length > 25000000)) throw new Error('Una parte de Ketcher supera el límite del hosting');
const editorDigest = crypto.createHash('sha256').update(Buffer.concat(editorParts)).digest('hex');
if (editorDigest !== 'b8716a39486e7259e7c2cfcd29278044768d22cb60018589b1d5c1175c27f583') throw new Error('El código de Ketcher quedó incompleto');
if (fs.statSync(path.join(editorDir, 'main.e47c48ad.js')).size > 25000000) throw new Error('El cargador de Ketcher supera el límite del hosting');

const context = { window: {} };
for (const name of ['organic-pep1.js', 'organic-pep2.js', 'organic-pep3.js', 'organic-biomolecules.js']) {
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../dist', name), 'utf8'), context, { filename: name });
}
const course = context.window.NEXO_ORGANIC_COURSE;
const ids = Object.keys(course).sort();
if (ids.length !== 18) throw new Error(`Se esperaban 18 clases de Orgánica; hay ${ids.length}`);
for (let number = 1; number <= 18; number++) {
  const id = `org-${String(number).padStart(2, '0')}`;
  const lesson = course[id];
  if (!lesson) throw new Error(`Falta ${id}`);
  for (const key of ['title', 'central', 'source', 'worked', 'task', 'transfer', 'notebook']) if (!lesson[key]) throw new Error(`${id}: falta ${key}`);
  if (lesson.reading.length < 4 || lesson.reading.some(section => section.paragraphs.length < 2)) throw new Error(`${id}: lectura demasiado breve`);
  if (lesson.goals.length < 3 || lesson.terms.length < 5 || lesson.molecules.length < 3 || lesson.worked.steps.length < 3 || lesson.task.rubric.length < 3 || lesson.transfer.check.length < 3) throw new Error(`${id}: recursos de aprendizaje incompletos`);
}
(async () => {
  const rdkit = await initRDKit();
  for (const [id, lesson] of Object.entries(course)) {
    for (const smiles of [...lesson.molecules.map(item => item.smiles), lesson.task.seed, ...lesson.task.accepted]) {
      let molecule;
      try {
        molecule = rdkit.get_mol(smiles);
        if (!molecule.get_smiles() || !molecule.get_svg()) throw new Error('Molécula no interpretable');
      } catch (error) { throw new Error(`${id}: estructura inválida ${smiles}: ${error.message}`); }
      finally { molecule?.delete(); }
    }
  }
  console.log('18 clases de Orgánica y sus estructuras verificadas.');
})().catch(error => { console.error(error); process.exit(1); });
