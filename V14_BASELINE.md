# Baseline V13 previo a V14

Fecha: 2026-09-25. Respaldo completo: `../nexo-estudio-v13-pre-v14.zip`, copia byte a byte de V13. Se leyeron README y auditorías/changelogs V11–V13. `PLAYWRIGHT_EXECUTABLE_PATH=../.bin/chromium npm run test:all` pasó sin fallos: dominio/contenido, migraciones/RLS PostgreSQL embebido, E2E navegador/móvil y auditoría de rendimiento. V13: 19 scripts iniciales, 394.849 B JS, 78.347 B CSS. No hay `.env` ni proyecto Supabase/PostHog conectado; pruebas cloud simuladas. El rig Rive contiene un `Node` con una imagen por especie, sin huesos ni anclas animadas.
