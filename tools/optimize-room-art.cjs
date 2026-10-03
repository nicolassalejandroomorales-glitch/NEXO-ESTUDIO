const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const dist = path.resolve(__dirname, '..', 'dist', 'assets');
const sourceDir = path.resolve(__dirname, '..', 'art-source', 'rooms');
const sources = [
  ['home-mascot-refuge.png', 'home-mascot-refuge.webp'],
  ...['learn', 'train', 'games', 'profile'].map(room =>
    [`rooms/${room}.png`, `rooms/${room}.webp`])
];

(async () => {
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge', headless: true });
  const page = await browser.newPage();
  try {
    for (const [input, output] of sources) {
      const bytes = fs.readFileSync(path.join(sourceDir, path.basename(input)));
      const encoded = await page.evaluate(async data => {
        const image = new Image();
        image.src = data;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        canvas.getContext('2d').drawImage(image, 0, 0);
        return canvas.toDataURL('image/webp', 0.88).split(',')[1];
      }, `data:image/png;base64,${bytes.toString('base64')}`);
      const optimized = Buffer.from(encoded, 'base64');
      fs.writeFileSync(path.join(dist, output), optimized);
      process.stdout.write(`${input}: ${bytes.length} -> ${optimized.length} bytes\n`);
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
