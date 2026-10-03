const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const dist = path.resolve(__dirname, '..', 'dist');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.riv': 'application/octet-stream' };
const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  const file = path.resolve(dist, `.${decodeURIComponent(pathname === '/' ? '/index.html' : pathname)}`);
  if (!file.startsWith(`${dist}${path.sep}`)) { response.writeHead(403).end(); return; }
  fs.readFile(file, (error, data) => {
    if (error) { response.writeHead(404).end(); return; }
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }).end(data);
  });
});

(async () => {
  if (!process.env.NEXO_TEST_URL) await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch(process.env.PLAYWRIGHT_EXECUTABLE_PATH
    ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH, args: ['--no-sandbox','--disable-dev-shm-usage'], headless: true }
    : { headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const url = process.env.NEXO_TEST_URL || `http://127.0.0.1:${server.address().port}/`;
  try {
    await page.goto(`${url}#/profile/grades`);
    await page.locator('[data-profile-grade-subject="organica"]').click();
    const grade = page.locator('[data-profile-grade-field="grade"]').first();
    await grade.fill('5,50');
    await grade.press('Tab');
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('nexo-study-beta')).grades.organica.components[0].grade), '5.50');
    await grade.fill('8');
    await grade.press('Tab');
    assert.equal(await grade.inputValue(), '5.50');

    await page.goto(`${url}#/hub/grades`);
    await page.locator('[data-grade-subject="organica"]').click();
    assert.equal(await page.locator('[data-grade-field="grade"]').first().inputValue(), '5.50');

    await page.goto(`${url}#/profile/grades`);
    await page.locator('[data-profile-grade-group="lab"]').click();
    await page.locator('[data-profile-add-grade]').click();
    const added = page.locator('.profile-grade-row').last();
    await added.locator('[data-profile-grade-field="name"]').fill('Informe 1');
    await added.locator('[data-profile-grade-field="name"]').press('Tab');
    await added.locator('[data-profile-grade-field="grade"]').fill('6.25');
    await added.locator('[data-profile-grade-field="grade"]').press('Tab');
    await page.reload();
    await page.locator('[data-profile-grade-group="lab"]').click();
    assert.equal(await page.locator('.profile-grade-row').last().locator('[data-profile-grade-field="grade"]').inputValue(), '6.25');

    await page.goto(`${url}#/profile/absences`);
    await page.locator('[data-absence-form] input[name="date"]').fill('2026-09-22');
    await page.locator('[data-absence-form] select[name="group"]').selectOption('lab');
    await page.locator('[data-absence-form] button[type="submit"]').click();
    assert.equal(await page.locator('.profile-absence-row').count(), 1);
    await page.reload();
    assert.equal(await page.locator('.profile-absence-row').count(), 1);
    assert.match(await page.locator('.profile-absence-row').innerText(), /Laboratorio/);
    await page.locator('[data-absence-subject="analitica"]').click();
    assert.equal(await page.locator('.profile-absence-row').count(), 0);
    await page.locator('[data-absence-subject="organica"]').click();
    await page.locator('[data-delete-absence]').click();
    assert.equal(await page.locator('.profile-absence-row').count(), 0);

    await page.goto(`${url}#/profile/grades`);
    fs.mkdirSync(path.join(__dirname, '..', 'tmp'), { recursive: true });
    await page.screenshot({ path: path.join(__dirname, '../tmp/profile-grades-desktop.png'), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${url}#/profile/grades`);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
    await page.screenshot({ path: path.join(__dirname, '../tmp/profile-grades-mobile.png'), fullPage: true });
    await page.goto(`${url}#/profile/absences`);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
    await page.screenshot({ path: path.join(__dirname, '../tmp/profile-absences-mobile.png'), fullPage: true });

    await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem('nexo-study-beta'));
      data.version = 14;
      data.grades.analitica.components = Array.from({ length: 4 }, (_, index) => ({ id: `custom-${index}`, name: `Evaluación propia ${index}`, group: 'theory', weight: '', grade: '' }));
      localStorage.setItem('nexo-study-beta', JSON.stringify(data));
    });
    await page.reload();
    await page.goto(`${url}#/profile/grades`);
    await page.locator('[data-profile-grade-subject="analitica"]').click();
    assert.equal(await page.locator('[data-profile-grade-field="name"]').first().inputValue(), 'Evaluación propia 0');
    console.log('OK: notas compartidas con Ponderaciones, laboratorio, inasistencias, persistencia y móvil.');
  } finally {
    await browser.close();
    if (server.listening) await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
