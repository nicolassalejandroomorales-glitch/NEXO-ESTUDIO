# Pruebas V14

El ejecutor `tests/run-all.cjs` llama a las pruebas conservadas en `tools/` y a los recorridos de navegador.

| Comando | Cobertura |
| --- | --- |
| `npm test` | Migración local V11–V14, motor académico (modelo, grafo, clasificación, diagnóstico, estados, FSRS, fuentes), outbox/claim/analytics, avatar/Phaser y ocho migraciones SQL con RLS/RPC A/B en PostgreSQL embebido. |
| `npm run test:e2e` | Navegación V11–V14 en Chromium; invitado→cuenta→otro contexto, intento/error/evidencia entre dispositivos simulados, compra, offline→sync, evento borrado A→B, delta con 520 sesiones, historial paginado y avatar multirranura. |
| `npm run test:perf` | Inventario/peso de scripts y ausencia de bibliotecas pesadas en carga inicial. |
| `npm run test:all` | Tres baterías anteriores en orden. |

El E2E cloud simulado y PostgreSQL embebido **no sustituyen** pruebas de un proyecto Supabase real, correos, OAuth ni dispositivos físicos. Define `PLAYWRIGHT_EXECUTABLE_PATH` para un Chromium ya instalado o instala el navegador con `npx playwright install chromium`. En sandbox con `/tmp` restringido, define `TMPDIR` dentro del proyecto. El E2E previo a la UI ampliada pasó el 25-09; el 26-09 este entorno carece de `/proc` y Chromium termina con `SIGTRAP` antes de cargar la app, de modo que la ampliación mapa/revisiones necesita rerun en un entorno con navegador operativo.
