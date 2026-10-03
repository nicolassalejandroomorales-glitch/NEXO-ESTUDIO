# Baseline verificada de V14 antes de Nexo StudyApp 1.0

Fecha: 2026-09-27. Fuente: ZIP V14 entregado por Nicolás (SHA-256 `637713f9962521cd6e71bbaaf5fea03145ba1ac376920ed7ebbfb913c3df`). Copia restaurable: `../../NEXO_BACKUPS/nexo-estudio-v14-original-20260927.zip`. La fuente publicada de Sites permanece en el commit `4684c1ea164faafa6c11d134828fd8933a957150` (V11); no es la base de producto para 1.0.

## Funcionalidad y rutas

V14 contiene cuatro ramos, 40 clases del catálogo base, 156 ejercicios de la base anterior, el piloto académico de Aminas (`org-01`), cronómetro, calendario, ponderaciones/notas, tienda, avatar, perfil, historial, Biblioteca, mapa de conocimiento, revisiones, errores y modos de práctica. Sus rutas principales son `home`, `subjects`, `subject/:id`, `lesson/:id`, `practice/:tab`, `planner/:tab`, `hub/:tab`, `timer`, `stats`, `history`, `library`, `knowledge`, `reviews`, `inspector`, `shop`, `mascot`, `profile/:tab` y `settings`.

Los módulos separados incluyen `dist/academic/` (modelo, grafo, diagnóstico, evidencias, revisiones, fuentes e inspector), `dist/cloud/foundation.js` (Auth, caché, outbox y sincronización), `dist/avatar/`, `dist/game/`, `dist/platform/` y `dist/study/`. `dist/app.js` todavía concentra gran parte de la UI. Se conservarán los contratos académicos, FSRS, ledger, historial y migración de invitado.

## Tamaño y rendimiento

`dist/`: 123 archivos, 49,45 MiB sin comprimir. La carga inicial contabilizada por `tools/perf-audit.cjs` comprende 20 scripts / 407.172 B de JavaScript y una hoja / 82.640 B de CSS. Los mayores assets son Ketcher (~28 MiB en dos partes), RDKit WASM (~7 MiB), Rive WASM (~1,9 MiB) y Phaser (~1,3 MiB); no todos pertenecen a la carga inicial. Estas son medidas de archivos, no Core Web Vitals ni FPS en móvil.

## Pruebas repetidas sobre el ZIP recibido

- `smoke-test.cjs` y nueve pruebas unitarias/SQL adicionales: pasan. Incluyen migración local, contenido, cloud simulado, avatar, juegos, motor académico, auditoría estática y RLS/ledger en PGlite.
- `tools/e2e-test.cjs`, `tools/profile-test.cjs`, `tools/cloud-e2e.cjs`: pasan. El último usa un servicio Supabase simulado; no demuestra sincronización real.
- `tools/perf-audit.cjs`: pasa, con las métricas indicadas.
- No se ha validado todavía el proveedor real con usuarios A/B ni dos dispositivos físicos.

## Servicios y deudas de entrada

- Supabase: se creó el proyecto real `Nexo StudyApp` el 2026-09-27; V14 aún no tiene URL ni clave pública incorporadas y sus ocho migraciones aún no se han aplicado al proyecto. Auth, correo, reset, RLS remoto, sincronización, conflictos, economía y borrado real siguen pendientes de prueba. La app publicada sigue en V11.
- PostHog: sin proyecto configurado. Debe quedar deshabilitado limpiamente si no se valida.
- Google Auth y Drive OAuth: no configurados; no deben presentarse como integraciones utilizables.
- Rive/avatar: los artboards actuales usan un nodo de imagen por especie, sin huesos/anclas animadas para cosméticos. Canvas conserva un fallback estable; movimientos amplios pueden desalinear capas.
- El piloto de Aminas usa autorrúbrica para texto libre; no equivale a corrección objetiva ni justifica moneda. El conocimiento agregado de historiales extensos, más contenido curado, pruebas en móviles reales y extracción de UI de `app.js` siguen pendientes.

Este documento registra la base antes de integrar la 1.0; no afirma que la versión esté publicada ni que el backend real ya funcione.
