# Nexo StudyApp 1.0 — informe de implementación en curso

**Estado 29-09-2026: prepublicación. No llamar «terminada» a esta versión hasta superar `ACCEPTANCE_1_0.md`.** El Site público sigue en V14 y el respaldo recuperable está en `../NEXO_BACKUPS/nexo-estudio-v14-original-20260927.zip`.

## Qué cambió y por qué

Se preservó la V14 como base. El shell se reorganizó en Inicio, Aprender, Entrenar, Juegos y Perfil; Bitácora y Tienda quedaron como acciones globales. Inicio muestra el compromiso priorizado, meta de estudio, mascota y tres clases siguientes, no un listado interminable. El calendario y la meta emplean datos editables; las notas comparten registro entre Perfil y Ponderaciones y ahora se calculan en un módulo puro que señala valores inválidos. Teoría y laboratorio se ponderan por separado: Analítica usa los valores oficiales 2S2026 de 60%/40%, y sus PEP/controles suman 100% solo dentro de teoría. El cálculo no infiere que una PEP roja se compense con el promedio. La fecha del Control 1 de Fisicoquímica se corrigió según su calendario docente 2S2026, sin pisar una fecha que el usuario hubiera editado.

La clase piloto `org-01` es un recorrido de aminas y basicidad con lectura conectada, comparaciones, visuales, casos estructurados, respuesta propia, feedback del primer fallo, reparación y transferencia. La evidencia se distingue entre autoevaluación y respuestas verificadas; no se declara correcta una molécula dibujada o un razonamiento libre sin un verificador real. Entrenar reutiliza los mismos casos y permite concentrarse en tema, errores, repaso o estilo PEP. El resto del catálogo conserva el contenido V14 y **no** ha recibido la misma auditoría académica.

Los rangos académicos muestran avance por concepto basado en intentos independientes, familias, justificación, transferencia y recuerdo diferido; los minutos son un requisito mínimo, no la recompensa. Supabase guarda datos privados, compras y reservas por RPC/RLS cuando hay cuenta. La mascota reacciona al contexto de habitación y conserva cosméticos mediante fallback Canvas cuando el Rive disponible no tiene anclas reales. El ambiente cambia según hora local y habitación sin animación continua obligatoria; audio y efectos permanecen apagados hasta la elección del usuario.

## Dónde se ajusta cada parte

| Necesidad | Lugar y regla |
|---|---|
| Colores, papel, tinta, materiales, radios y foco | `dist/design-system/arcane.css`, tokens `:root`. Contrastar fondo/texto en UI Lab y móvil después de editar. |
| Tema de un ramo | `dist/design-system/rooms.js`, registro `courses`; seguir `docs/ADDING_COURSE_THEME.md`. El tema no inventa contenido. |
| Nueva habitación | Registro `rooms` y resolución de rutas en `dist/design-system/rooms.js`, CSS de la habitación y prueba en `tools/room-test.cjs`. Añadirla a Review Center. |
| Luz y momentos del día | Puntos de interpolación en `dist/ambient/time.js`. Usar horas locales; no cambiar a UTC sin revisar el calendario. |
| Utilería, microeventos y actividad | `dist/ambient/events.js` define combinaciones por habitación/tramo; `dist/mascot/controller.js` interpreta la intención. No añadir un timer por personaje. |
| Partículas y perfil gráfico | `dist/platform/performance.js` y reglas de `arcane.css`; respetar `prefers-reduced-motion` y pestaña oculta. |
| Especies y cosméticos | `dist/data.js` contiene catálogo base; `dist/avatar/catalog.js` normaliza inventario, `contracts.js` valida ranuras/anclas y `vector-art.js` dibuja piezas. Probar especie×ranura×habitación antes de añadir un objeto. |
| Animaciones Rive | `rive/mascots/scene.rml` y `dist/mascot-rive.js`. El rig final aún necesita anclas cosméticas y estados distintos de Idle. Conservar Canvas hasta que existan. |
| Conceptos, ejercicios y errores de org-01 | `dist/academic/model.js`, `structured.js`, `diagnosis.js`, `rescue.js` y `dist/amine-lesson.js`. Asignar fuente concreta, ID estable y prueba antes de activar un caso. |
| Rangos y reservas | `dist/academic/ranks.js` y funciones SQL en `migrations/20260928212500_rank_reservations.sql`. Cambiar ambos lados y comprobar que el cliente no pueda otorgarse saldo. |
| Bitácora y prioridades | `dist/planner/priority.js`, `labs.js`, `grades.js`; la UI heredada sigue en `dist/app.js`. El orden debe seguir explicable en la tarjeta y Home. |
| Recordatorios | Actualmente se solicitan avisos del navegador desde Bitácora; no hay un servicio push remoto ni tarea programada al cerrar el sitio. No prometer avisos en segundo plano sin implementarlos. |
| Futuro cofre | Las reservas viven en `reward_reservations`. Añadir un catálogo y RPC de canje con idempotencia, ownership, saldo/ledger y pruebas A/B; no convertir una tarjeta visual en premio canjeable antes. |

## Carga y desmontaje

El HTML inicial carga scripts propios con `defer`. Phaser espera al juego; Howler al gesto con audio; Rive al uso de la mascota; Ketcher/RDKit/PDF.js a las herramientas académicas; los bloques completos de Orgánica al entrar a la lección. El juego se libera al salir, los canales de audio se detienen al ocultar/cambiar de habitación, la iluminación usa intervalos espaciados y no un RAF permanente. Se quitó el preload de un cerdito fijo que no coincidía necesariamente con la especie visible. `docs/PERFORMANCE_1_0.md` detalla medición y límites.

## Pruebas y problemas reales

`node tests/run-all.cjs` cubre migración/estado, contenido, casos, rangos, RLS local, compra, avatar, calendario, notas, E2E en varios anchos y chequeo básico de accesibilidad. La última corrida completa debe repetirse después de todos los cambios finales; una corrida parcial no valida el paquete definitivo. La prueba sintética de carga está en el borde de 2,5 s con movimiento normal; falta medir la URL real e INP de usuarios. `app.js` aún tiene responsabilidades heredadas demasiado concentradas. Hay un solo usuario real en Supabase, por lo que A/B remoto y concurrencia real no están demostrados. Rive no tiene el rig final. El contenido no piloto requiere auditoría académica específica y no se debe presentar como fuente oficial verificada.

La secuencia de liberación es: resolver esos puntos, build, regresión completa, sincronizar el código exacto al Site original, guardar y desplegar sobre el mismo proyecto, comprobar URL/Google OAuth/datos/rutas/refresh/móvil/escritorio, conservar V14 como rollback y recién entonces generar el ZIP final. No se debe saltar una etapa solo porque la página local se ve bien.
