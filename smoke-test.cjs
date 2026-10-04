const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = __dirname;
const dist = path.join(root, 'dist');
const index = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(dist, 'app.js'), 'utf8');
const css = fs.readFileSync(path.join(dist, 'styles.css'), 'utf8');
const mascotRuntime = fs.readFileSync(path.join(dist, 'mascot-rive.js'), 'utf8');
const avatarCatalog = fs.readFileSync(path.join(dist, 'avatar/catalog.js'), 'utf8');
const avatarExperience = fs.readFileSync(path.join(dist, 'avatar/experience.js'), 'utf8');
const startupBundle = fs.readFileSync(path.join(dist, 'startup-bundle.js'), 'utf8');
vm.runInThisContext(fs.readFileSync(path.join(dist, 'data.js'), 'utf8'));
vm.runInThisContext(fs.readFileSync(path.join(dist, 'semester-2026.js'), 'utf8'));

const { subjects, lessons, companions, rewards, exercises, guides, exams, backgrounds } = NEXO_DATA;
const ids = subjects.flatMap(subject => subject.peps.flatMap(pep => pep.lessons));
if (subjects.length !== 4) throw new Error(`Se esperaban 4 ramos y hay ${subjects.length}`);
if (ids.length !== 40 || new Set(ids).size !== 40) throw new Error(`El catálogo debe tener 40 clases únicas; tiene ${ids.length}`);
for (const id of ids) {
  const lesson = lessons[id];
  if (!lesson || lesson.subject !== subjects.find(s => s.peps.some(p => p.lessons.includes(id))).id) throw new Error(`Clase desconectada: ${id}`);
  if (!lesson.title || !lesson.central || !Array.isArray(lesson.map) || lesson.map.length < 4 || !lesson.note || !lesson.explanation) throw new Error(`Contenido base incompleto: ${id}`);
}

if (guides.length !== 12 || exams.length !== 17 || backgrounds.length !== 8) throw new Error('Bibliotecas base incompletas');
if (exercises.length !== 36) throw new Error('Los ejercicios reales base cambiaron inesperadamente');
if (app.includes('generatedExercises') || !app.includes('const EXERCISES = [];')) throw new Error('La biblioteca de ejercicios debe estar vacía (se rehace junto con las clases)');
if (!app.includes('Disponible próximamente') || app.includes('completeComprehension') || app.includes('gradeMastery')) throw new Error('Las clases deben mostrar "Disponible próximamente" y no conservar el reproductor antiguo');
const economy = fs.readFileSync(path.join(dist, 'study/economy.js'), 'utf8');
if (!index.includes('./startup-bundle.js?v=') || !startupBundle.includes('/* study/economy.js */') || !app.includes('window.NexoEconomy') || !economy.includes('minutes >= 120 ? 250') || !economy.includes('minutes >= 60 ? 100') || !economy.includes('minutes >= 30 ? 25') || !economy.includes('minutes >= 15 ? 15') || !economy.includes('minutes >= 5 ? 3')) throw new Error('Faltan tramos oficiales de átomos del reloj');
if (!app.includes('progress.rewarded = true') || !app.includes('const hadCorrect = Boolean(')) throw new Error('Protección contra cobro repetido de ejercicios ausente');
if (!app.includes('BACKUP_KEY') || !app.includes('exportJson') || !app.includes('restoreBackup')) throw new Error('Respaldo/migración incompletos');
if (!app.includes("window.addEventListener('hashchange'") || !app.includes("routeTo('lesson'")) throw new Error('Rutas persistentes incompletas');
if ((app.match(/document\.addEventListener\('click'/g) || []).length !== 1) throw new Error('Debe existir un solo listener delegado de clic');
if ((app.match(/document\.addEventListener\('submit'/g) || []).length !== 1) throw new Error('Debe existir un solo listener delegado de formularios');
if (!app.includes('aria-modal="true"') || !index.includes('class="skip-link"') || !app.includes('aria-current')) throw new Error('Controles de accesibilidad incompletos');
if (!css.includes('@media (max-width: 620px)') || !css.includes('@media (prefers-reduced-motion: reduce)')) throw new Error('Responsive/movimiento reducido incompletos');
if (/app-v[0-9]|styles-v[0-9]|styles-full|app-full/.test(index)) throw new Error('index.html todavía carga parches antiguos');
if (!index.includes('./app.js?v=') || !index.includes('./data.js?v=') || !index.includes('./styles.css?v=')) throw new Error('Entradas canónicas incompletas');
if (!startupBundle.includes('/* mascot-rive.js */') || index.includes('<script src="./vendor/rive/rive.js') || !mascotRuntime.includes("NexoLoader.script('./vendor/rive/rive.js')") || !mascotRuntime.includes('new Rive({') || !mascotRuntime.includes('drawLayered') || !fs.existsSync(path.join(dist, 'assets/avatar/mascots.riv')) || !fs.existsSync(path.join(dist, 'vendor/rive/rive.wasm'))) throw new Error('Integración Rive/Canvas diferida incompleta');
if (!startupBundle.includes('/* avatar/catalog.js */') || !startupBundle.includes('/* avatar/experience.js */') ||
  !avatarCatalog.includes('window.NexoAvatar=') || !avatarExperience.includes('window.NexoAvatarExperience='))
  throw new Error('Tienda y avatar V13 incompletos');
if (!app.includes('function renderTimer()') || !app.includes('Próximas pruebas') || !app.includes('Continuar estudiando') || !app.includes('function renderCalendarInteractive()')) throw new Error('Interfaces principales incompletas');
if (!app.includes('NEXO_SEMESTER.events') || !app.includes('NEXO_SEMESTER.grades')) throw new Error('Programación oficial no integrada');
if (!avatarCatalog.includes("'face'") || !avatarCatalog.includes("'aura'") ||
  !mascotRuntime.includes('drawLayered') || mascotRuntime.includes('drawRiveLayers')) throw new Error('Composición de accesorios incompatible con la mascota');
if (!app.includes('function renderHub(') || !app.includes('function renderProfile(')) throw new Error('Navegación incompleta');
if (/answerHeartChallenge|restoreHeartsFromSession|rpg-duel|heart-hud|pixel-heart/.test(app + css + index)) throw new Error('Corazones o duelo siguen en el runtime');
for (const route of ['home','learn','train','games','profile'])
  if ((index.match(new RegExp(`data-route="${route}"`,'g')) || []).length < 2)
    throw new Error(`Falta ${route} en la navegación de escritorio o móvil`);
if (!index.includes('data-route="planner"') || !index.includes('data-route="shop"'))
  throw new Error('Bitácora y Tienda deben ser globales');
if (!app.includes("scene-ruins") || !avatarCatalog.includes("'scene-archive'")) throw new Error('Fondos cosméticos incompletos');

const cosmetic = rewards.filter(item => ['hat', 'bag', 'tail', 'shirt'].includes(item.kind));
if (companions.length !== 3 || companions[0].species !== 'pig' || companions[0].price !== 0 || companions.some(item => item.species === 'dragon')) throw new Error('El cerdito no quedó como compañero principal');
for (const companion of companions) {
  if (!fs.existsSync(path.join(dist, companion.image.replace('./', '')))) throw new Error(`Falta compañero ${companion.species}`);
  for (const item of cosmetic.filter(i=>!/(barca|real|udechile|colocolo|asta-band|golden-circlet|bulls-hood|grimoire|bulls-mission|golden-wind|antimagic|wind-spirit|salamander)/.test(i.id))) {
    const skin = path.join(dist, 'assets', 'avatar', 'skins', `${companion.species}-${item.kind}-${item.key}.webp`);
    if (!fs.existsSync(skin)) throw new Error(`Falta skin ${path.basename(skin)}`);
  }
}
for (const exam of exams) {
  if (!fs.existsSync(path.join(dist, 'assets', 'exams', exam.file))) throw new Error(`Falta prueba ${exam.file}`);
}

console.log(`OK: cuatro destinos, perfil, Rive+Canvas, ${ids.length} clases del catálogo base, ${exercises.length + ids.length * 3} ejercicios de la base anterior y ${cosmetic.length * companions.length} skins integradas. El aula nueva de Orgánica se valida por separado.`);
