# Arquitectura de Nexo StudyApp 1.0

## Recorrido de los datos

`dist/index.html` carga el núcleo en orden. `dist/app.js` conserva el router hash, el shell y varias pantallas heredadas de V14. `dist/data.js` y `dist/semester-2026.js` son datos iniciales, no una base remota. `dist/core/storage.js` y `core/migrations.js` conservan y migran el estado local; `dist/cloud/foundation.js` sincroniza documentos privados cuando existe una sesión Google/Supabase. La app sigue permitiendo uso invitado, pero **no lo considera una cuenta sincronizada**.

La ruta académica piloto carga módulos bajo demanda: `academic/model`, `structured`, `engine`, `diagnosis`, `rescue`, `reviews`, `ranks`, `library`, `sources`, `explorer` e `inspector`. `org-01` usa `amine-lesson.js`; las otras lecciones de Orgánica permanecen en `organic-studio.js` y sus archivos `organic-pep*.js`/`organic-biomolecules.js`. No se mezclan sus estados de “comprendido” con el rango comprobado por evidencia del piloto.

Las habitaciones se resuelven en `design-system/rooms.js` y el aspecto compartido en `design-system/arcane.css`. `ambient/time.js` y `ambient/events.js` reciben habitación y hora local; `mascot/controller.js` deriva actividad desde ese contexto. `avatar/catalog`, `contracts`, `vector-art`, `experience` y `mascot-rive.js` manejan equipamiento y dibujo. `platform/loader`, `performance`, `animation`, `audio` y `game/manager` separan la carga de bibliotecas pesadas de la primera vista.

Bitácora toma las prioridades de `planner/priority.js`; laboratorio se normaliza en `planner/labs.js`. Home consume el mismo ranking y solo enseña las tres siguientes clases del ramo elegido. Tienda usa `study/economy.js` para el flujo local invitado y RPC transaccional en cuenta autenticada. `dev/workbench.js` reúne UI Lab, Review Center e inspector de rendimiento, visibles únicamente con `?nexoDev=1`.

## Contratos y límites

- Los identificadores de curso/concepto/ejercicio son estables y versionados; el modelo piloto valida referencias cruzadas.
- La evidencia académica distingue autoverificación de corrección determinista; un texto libre o un dibujo no son calificados automáticamente.
- Rangos altos requieren casos verificados y varias familias; el tiempo activo es umbral, nunca puntaje suficiente.
- El navegador no tiene autoridad para conceder compras, saldo o reservas de recompensa a una cuenta sincronizada. Las RPC de Supabase verifican propietario, idempotencia y origen del tiempo académico.
- Los PDF privados se eligen en el navegador y no se incluyen en `dist/`; Drive no está conectado a la app. `docs/SOURCE_REGISTER_1_0.md` distingue procedencia comprobada de inventario pendiente.

## Deuda estructural concreta

`dist/app.js` sigue siendo un archivo grande (router, Home, calendario, notas, tienda y flujo de clases heredadas). Los módulos nuevos no vuelven a duplicar esos motores, pero faltaría extraer pantallas heredadas por dominio para cumplir plenamente “no monolito”. Esa refactorización debe acompañarse de pruebas de migración y regresión, no hacerse solo para reducir líneas.
