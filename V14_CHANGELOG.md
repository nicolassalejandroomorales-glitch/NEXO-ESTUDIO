# V14_CHANGELOG — Academic Intelligence Foundation

## Base y correcciones V13

- Se leyó la documentación V11–V13, se ejecutó `npm run test:all` antes de editar y se creó `nexo-estudio-v13-pre-v14.zip` restaurable. Baseline en `V14_BASELINE.md`.
- Delta sync ahora recorre páginas mediante cursor estable `(updated_at,id)` dentro de watermark de servidor, sin offset incremental. La primera carga limita sesiones, errores e intentos recientes; `#/history` recupera páginas bajo demanda y `study_summary()` resume sesiones sin descargarlas.
- Se detectó que el detalle `organicProgress` de org-01 no figuraba en la lista de documentos cloud V13. La migración 008 lo admite; invitado→cuenta y segundo dispositivo conservan respuestas/evaluaciones de la clase piloto.
- Se auditó el rig Rive: un nodo de imagen por especie, sin huesos/anchors. `NexoAvatarRenderer` es API de alto nivel y conserva la composición Canvas de accesorios; no se añadió seguimiento ficticio.

## Motor académico

- `dist/academic/model.js`: curso/lección, ocho conceptos curados de Aminas, habilidades, prerequisitos required/recommended, siete familias, b01–b11 más variante y transferencia, misconceptions candidatos y fuentes verificables. IDs/versión independientes de títulos.
- `graph.js`: índice de adyacencia, directos, ancestros, descendientes y detección de ciclos. `diagnosis.js`: sospecha con fallos en familias distintas y confirmación/rechazo mediante intentos diagnósticos. `classifiers.js`: MCQ, numérico, dimensiones estructurales y autoevaluación de texto sin inferencia semántica fingida.
- `engine.js` y `knowledge.js`: intentos/evidencia idempotentes, errores estructurados, estados `unseen/guided/independent/transferable/retained`, labels separados y adaptación de mastery legado. Un fallo aislado no borra retención.
- `reviews.js`: `ts-fsrs@5.4.2` MIT fijado en lockfile, cargado solo al usarlo; programación por concepto y fechas legadas de clase en cola. Sin recompensa monetaria por autodeclaración.
- `sources.js` y `library.js`: Biblioteca de referencias y URLs, vínculos a conceptos y parser local TXT/VTT/SRT con timestamps. Drive es adaptador pendiente de OAuth, sin permisos solicitados.

## UI y datos

- En org-01: panel discreto de conceptos, prerequisitos, fuentes y próximas revisiones; registro de errores y diagnóstico explicable. En Estadísticas: acceso a historial paginado. La UI anterior y los contenidos académicos restantes se conservan.
- `#/knowledge` ofrece mapa seleccionable y ficha de concepto con estados accesibles por forma/texto, relaciones, evidencia y fuentes; `#/reviews` lista revisiones vencidas/próximas y dirige a practicar. `?nexoDev=1#/inspector` comprueba huecos e IDs de autoría fuera de la navegación normal.
- Intentos/evidencia incluyen `activityType/activityId`; las fuentes incluyen autoridad y ubicación estructurada. Eventos de dominio publican cambios de estado, confirmación de prerequisito y revisión sin conceder moneda.
- Esquema local 18→19, migración versión 14 y respaldo literal `nexo-study-beta-pre-v14`. Se mantienen exportación/importación segura, caché y outbox.
- Migración 006: RPC keyset y agregado de sesiones. Migración 007: `academic_attempts`, `academic_evidence`, `academic_reviews`, `academic_errors`, `academic_sources`, RLS, índices, RPC CAS/inmutabilidad. Migración 008: tipo `organic_progress`. `supabase:prepare` genera ocho migraciones CLI.
- Analytics allowlist añade eventos de concepto, familia, misconception, prerequisito, revisión y fuente; únicamente IDs/booleanos, sin respuestas, transcripciones, títulos privados ni rutas.

## Dependencia y pruebas

- Nueva dependencia `ts-fsrs@5.4.2`, MIT; licencia copiada en `dist/vendor/fsrs/LICENSE`. No hay servicio runtime de pago obligatorio.
- `tools/academic-test.cjs` cubre modelo, grafo, clasificación, diagnóstico, estados, FSRS, fuentes, inspector y render del mapa/cola. PostgreSQL embebido prueba tablas/RLS A/B/RPC; cloud unitario inyecta fallo tras una página para verificar watermark. El E2E anterior comprobó migración, segundo dispositivo, intento/evidencia/error y offline; el E2E ampliado agrega mapa móvil/revisiones/inspector, pendiente de rerun por fallo `SIGTRAP` de Chromium al iniciar en el entorno actual. Ver `V14_AUDIT.md`.
