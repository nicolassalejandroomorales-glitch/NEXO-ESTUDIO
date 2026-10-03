# Reproducir UPDATE 01

La entrega contiene dist listo para servir. No necesita un build completo para la vista previa.

```sh
node tools/static-server.cjs
```

Abrir http://127.0.0.1:8765/#/home. Recorrer Aprender → ramo → evaluación → mapa. Las rutas subject/:id y lesson/:id siguen disponibles.

Para regenerar solo el bundle modificado, sin reemplazar configuración pública ni vendors:

```sh
node tools/build-startup.cjs
```

Con las dependencias declaradas en package.json instaladas:

```sh
npm test
node tools/update01-test.cjs
node tools/perf-audit.cjs
```

El test DOM requiere jsdom como dependencia de QA temporal, no de la aplicación:

```sh
npm install --prefix tmp/qa-deps --ignore-scripts jsdom@26.1.0
NODE_PATH="$PWD/tmp/qa-deps/node_modules:$NODE_PATH" TZ=America/Santiago node tools/update01-dom-test.cjs
```

La integridad requiere el MANIFIESTO_SHA256.tsv recibido en el directorio superior y el backup original en ../BACKUP_V14. También acepta NEXO_ORIGINAL_MANIFEST para indicar otra ruta; no modifica esos archivos.

```sh
node tools/update01-integrity-test.cjs
```

En un entorno con Chromium operativo, instalar el navegador de Playwright o indicar PLAYWRIGHT_EXECUTABLE_PATH. Si /tmp no está disponible, crear tmp y definir TMPDIR dentro del proyecto.

```sh
npx playwright install chromium
node tools/update01-e2e.cjs
npm run test:e2e
npm run test:a11y
node tools/web-vitals-test.cjs
```

El E2E nuevo captura 375/390/768/1440 y landscape, verifica recorrido, mapa sin solapes, datos, fases horarias, reducción de movimiento y 200% de texto. Sus capturas se guardan en tmp/update01. Este test se preparó y se intentó ejecutar, pero no se validó hasta el final en este entorno.

No ejecutar npm run build sin recrear .env desde la configuración pública existente: el build histórico puede sustituir config.js por valores vacíos. No requiere claves privadas. No aplicar SQL ni publicar para probar esta actualización.
