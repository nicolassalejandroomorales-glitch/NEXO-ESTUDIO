const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const modules = path.join(root, 'node_modules');
const vendor = path.join(root, 'dist', 'vendor');
const files = [
  ['gsap', 'gsap/dist/gsap.min.js', 'gsap/gsap.min.js'],
  ['howler', 'howler/dist/howler.min.js', 'howler/howler.min.js'],
  ['phaser', 'phaser/dist/phaser.min.js', 'phaser/phaser.min.js'],
  ['@supabase/supabase-js', '@supabase/supabase-js/dist/umd/supabase.js', 'supabase/supabase.js'],
  ['posthog-js', 'posthog-js/dist/array.js', 'posthog/array.js'],
  ['ts-fsrs', 'ts-fsrs/dist/index.umd.js', 'fsrs/index.umd.js'],
  ['ts-fsrs', 'ts-fsrs/LICENSE', 'fsrs/LICENSE']
];
for (const [name, source, destination] of files) {
  const from = path.join(modules, source);
  if (!fs.existsSync(from)) throw new Error(`Falta ${name}; ejecuta npm install o pnpm install antes de build.`);
  const to = path.join(vendor, destination);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  console.log(`${name}: ${path.relative(root, to)} (${fs.statSync(to).size} bytes)`);
}

// El bundle solo admite las claves públicas del navegador. Nunca serializar todo process.env.
const envFile = path.join(root, '.env');
const env = fs.existsSync(envFile) ? Object.fromEntries(fs.readFileSync(envFile,'utf8')
  .split(/\r?\n/).filter(line => /^[A-Z][A-Z0-9_]*=/.test(line))
  .map(line => { const index=line.indexOf('='); return [line.slice(0,index),line.slice(index+1).replace(/^["']|["']$/g,'')]; })) : {};
const value = key => process.env[key] || env[key] || '';
const supabaseUrl = value('VITE_SUPABASE_URL');
const supabaseAnonKey = value('VITE_SUPABASE_ANON_KEY');
if (supabaseUrl && !/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(supabaseUrl)) throw new Error('URL pública de Supabase inválida.');
if (supabaseAnonKey && !/^(sb_publishable_|eyJ)/.test(supabaseAnonKey)) throw new Error('Usa solamente la clave pública de Supabase.');
if (supabaseAnonKey.startsWith('eyJ')) {
  let role;
  try { role=JSON.parse(Buffer.from(supabaseAnonKey.split('.')[1],'base64url').toString()).role; }
  catch { throw new Error('Clave JWT de Supabase inválida.'); }
  if (role!=='anon') throw new Error('Nunca compiles una clave service_role en el navegador.');
}
if (value('VITE_GOOGLE_OAUTH_ENABLED')==='true' && (!supabaseUrl || !supabaseAnonKey))
  throw new Error('Google OAuth requiere URL y clave pública reales de Supabase.');
const config = {
  ...(supabaseUrl && supabaseAnonKey ? { supabaseUrl, supabaseAnonKey } : {}),
  ...(value('VITE_POSTHOG_KEY') ? {posthogKey:value('VITE_POSTHOG_KEY'),posthogHost:value('VITE_POSTHOG_HOST')||'https://us.i.posthog.com'} : {}),
  googleOAuthEnabled: value('VITE_GOOGLE_OAUTH_ENABLED')==='true'
};
fs.writeFileSync(path.join(root,'dist','config.js'),
  '/* Configuración pública generada. */\nwindow.NEXO_PUBLIC_CONFIG = Object.freeze(' +
  JSON.stringify(config).replace(/</g,'\\u003c') + ');\n');

const context = { window: {} };
for (const name of ['organic-pep1', 'organic-pep2', 'organic-pep3', 'organic-biomolecules']) {
  vm.runInNewContext(fs.readFileSync(path.join(root, 'dist', `${name}.js`), 'utf8'), context, { filename: name });
}
const manifest = Object.fromEntries(Object.entries(context.window.NEXO_ORGANIC_COURSE).map(([id, lesson]) => [id, {
  title: lesson.title, central: lesson.central, duration: lesson.duration
}]));
fs.writeFileSync(path.join(root, 'dist', 'organic-manifest.js'), `/* Catálogo ligero generado desde las clases canónicas. */\nwindow.NEXO_ORGANIC_COURSE = Object.assign(window.NEXO_ORGANIC_COURSE || {}, ${JSON.stringify(manifest, null, 2)});\n`);
console.log(`Catálogo: ${Object.keys(manifest).length} clases de Orgánica.`);

// También disponible por separado sin reemplazar config pública ni vendors.
require('./build-startup.cjs');
