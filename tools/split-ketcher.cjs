const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const jsDir = path.join(root, 'dist', 'vendor', 'ketcher', 'static', 'js');
const main = path.join(jsDir, 'main.e47c48ad.js');
const first = path.join(jsDir, 'main.e47c48ad.part1.txt');
const second = path.join(jsDir, 'main.e47c48ad.part2.txt');
const loader = fs.readFileSync(path.join(__dirname, 'ketcher-loader.js'));
const original = fs.readFileSync(main);
if (original.length < 25000000) {
  if (!fs.existsSync(first) || !fs.existsSync(second)) throw new Error('Faltan partes de Ketcher');
  console.log('Ketcher ya está dividido para el hosting.');
  process.exit(0);
}
const splitAt = Math.ceil(original.length / 2);
fs.writeFileSync(first, original.subarray(0, splitAt));
fs.writeFileSync(second, original.subarray(splitAt));
const restored = Buffer.concat([fs.readFileSync(first), fs.readFileSync(second)]);
if (restored.length !== original.length || !crypto.timingSafeEqual(crypto.createHash('sha256').update(restored).digest(), crypto.createHash('sha256').update(original).digest())) {
  throw new Error('La división de Ketcher no conservó el código original');
}
fs.writeFileSync(main, loader);
console.log('Ketcher dividido y comprobado:', fs.statSync(first).size, fs.statSync(second).size);
