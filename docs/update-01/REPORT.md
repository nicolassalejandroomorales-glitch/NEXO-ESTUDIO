# NEXO — UPDATE 01: código implementado, aceptación visual pendiente

2026-10-01. Se trabajó exclusivamente en ESTUDIO_APP_1_0. **UPDATE 01 no está cerrado**: la implementación y las pruebas locales están entregadas; la revisión visual y E2E en navegador está bloqueada por el entorno. No se presenta esta entrega como la identidad visual definitiva aprobada ni como Nexo 1.0 terminado.

## Qué cambió y por qué

Inicio pasó de ilustración + bloques separados a un contenedor de refugio continuo. El tablón de evaluaciones tiene la jerarquía principal y usa eventos reales filtrados como pruebas/controles, ordenados con el ranking existente. Cada papel conserva ramo, fecha, razones y advertencias de calendario. Tu día usa compromisos actuales, minutos, meta y repasos existentes. El volumen de continuación abre el mapa del capítulo pendiente o de la clase guardada; retomar la clase anterior sigue disponible explícitamente. La mascota existente se conserva en una superficie pequeña del refugio; no se añadió un sistema de mascotas.

Aprender tiene lomo, cuero, papel, páginas, marcadores e índice de ramos. Su recorrido principal es ramo → evaluación → mapa. Los capítulos proceden de peps del catálogo; también aparecen evaluaciones del calendario. Una PEP se vincula con un evento solo por ramo y título PEP explícito. **Control 1 no se convierte en PEP 1**: cuando falta temario, el mapa explica el límite y enlaza Bitácora. Los bloques de Fisiopatología conservan su nombre; no se inventan PEP ni fechas.

El mapa usa un camino Bézier y etapas con estados escritos, selección y detalle. Lee registros existentes y los describe como comprensión/autoverificación histórica, sin convertirlos en dominio nuevo. Las nuevas clases figuran próximamente; el material anterior tiene una acción explícita. Se conservaron las rutas antiguas, incluido el aula piloto.

La primera apertura del grimorio usa una hoja de cubierta de 620 ms; reapertura 220 ms, cierre 180 ms y cambio de página 240 ms. La marca vive en sessionStorage con fallback en memoria. Las animaciones se cancelan al navegar, no bloquean los controles y se omiten con movimiento reducido. Se extendió platform/animation.js usando Web Animations API, sin biblioteca nueva. El sombreado del refugio consume las fases horarias existentes; los papeles permanecen fuera de la capa de luz.

Desktop tiene libro de dos páginas. El CSS móvil cambia a un folio y coloca el detalle después del recorrido; el refugio conserva una zona de ventana antes del tablón. Se añadió foco al detalle al seleccionar un nodo. **Estos layouts todavía requieren medición y capturas de navegador**.

## Archivos modificados

| Archivo original | Cambio |
|---|---|
| dist/app.js | Inicio, grimorio, selección de evaluación/mapa, enrutamiento, acciones y foco del detalle |
| dist/index.html | Carga de CSS acotado, versiones de caché y retiro de cortina inicial del sitio, sustituida por apertura del libro |
| dist/design-system/rooms.js | Tema de Fisiopatología corregido a su id real fisio |
| dist/platform/animation.js | Apertura por sesión, retorno, cierre, páginas y cancelación |
| dist/startup-bundle.js | Generado desde fuentes; agrega proyección de evaluaciones |
| tools/build.cjs | Usa generador de arranque separado para incluir el módulo nuevo |
| smoke-test.cjs | Invariante de Inicio actualizada; reemplaza el texto antiguo MESA DE NEXOS |
| IMPLEMENTATION_STATUS.md | Añade estado honesto de UPDATE 01, conservando historial |

Nuevos: dist/design-system/update01.css, dist/design-system/preparation.js, tools/build-startup.cjs, tools/update01-test.cjs, tools/update01-dom-test.cjs, tools/update01-e2e.cjs, tools/update01-integrity-test.cjs y docs/update-01/ (spec, ejecución, este informe y evidencia).

## Qué se reutilizó y qué se preservó

Arte WebP y fuentes originales; NexoRooms y sus temas; NexoPriority; NexoAmbientTime/Events; NexoPerformance; NexoAnimation; datos, PEP y progreso existentes; router hash; destinos de clases, material y Bitácora; renderer/lifecycle de mascota. El arranque sigue con cinco scripts y 26 módulos fuente.

No se modificaron motores académicos, preguntas, cloud, OAuth, SQL, migraciones, configuración pública, almacenamiento, datos canónicos, documentos, assets, Entrenar, Perfil, economía, audio ni la infraestructura de mascota. No se publicaron cambios. La prueba de integridad verifica el manifiesto recibido y el SHA del backup: cero archivos originales eliminados y cero modificaciones fuera de la lista autorizada. Las pruebas de base de datos que ejecuta npm test son locales y no aplican SQL remoto.

## Pruebas y evidencia

| Verificación | Resultado | Evidencia |
|---|---|---|
| npm test (22 ejecutores existentes) | Pasa | evidence/npm-test.log: estado, contenido, cloud simulado, avatar, juegos, ambiente, académico, entrenamiento, rescate, rangos, planner, seguridad y SQL local |
| UPDATE 01: proyección y decisiones de transición | Pasa | evidence/unit.log: catálogos, eventos, controles sin asociación falsa, bloques, sendero, duraciones y no mutación |
| Aplicación real en JSDOM | Pasa | evidence/dom.log: scripts servidos, Inicio/ramos/evaluaciones/mapa/detalle, continuar, cuatro temas, rutas inválidas, legado, hora local, sessionStorage y registros intactos |
| Integridad contra entrega original | Pasa | evidence/integrity.json: lista exacta de cambios y SHA del backup intacto |
| Inventario de rendimiento | Pasa estático | evidence/perf-comparison.json: cinco scripts, bytes iniciales y CSS |
| E2E nuevo y E2E existente | Bloqueado antes de abrir página | evidence/e2e.log y existing-e2e.log: Chromium instalado termina con SIGTRAP |
| Accesibilidad responsive/200% | Bloqueado | evidence/a11y.log: mismo fallo de lanzamiento |
| Web Vitals local | Bloqueado | evidence/vitals.log: mismo fallo de lanzamiento |
| Capturas nuevas desktop/móvil | No disponibles | Ningún archivo de captura nuevo se presenta como prueba |

JSDOM ejecuta el código real y verifica handlers/DOM. Sus stubs de Canvas, observadores, scroll y red aíslan APIs sin layout. **No demuestra píxeles, contraste, tamaño táctil, solapes, rendimiento de animación ni comportamiento de Rive.** Cero errores JS en ese recorrido no equivale a cero errores de consola de Chromium. Las capturas antiguas incluidas en tmp/v11-visual pertenecen a la entrega anterior, no a este rediseño.

Se instaló QA temporal: jsdom 26.1.0, ts-fsrs 5.4.2, PGlite 0.3.14 y Chromium empaquetado. La descarga habitual de Playwright produjo un ZIP inválido; la alternativa instalada sí informa su versión, pero termina con SIGTRAP al iniciar. El navegador remoto bloqueó 127.0.0.1. No se eludió el bloqueo ni se publicó una preview para resolverlo.

## Criterios de aceptación

Cumple significa evidencia suficiente para el comportamiento indicado. Parcial significa implementación y/o comprobación funcional, con verificación visual pendiente. Pendiente significa que el criterio exige evidencia que este entorno no pudo producir.

| Criterio | Estado | Evidencia | Gap restante |
|---|---|---|---|
| AC01 Escena continua | Parcial | Un contenedor refuge con todas las superficies; DOM y CSS acotado | Percepción y continuidad montada en pantalla |
| AC02 Información usable/legible | Parcial | Fechas/advertencias, estado y acciones reales; suite y DOM | Contraste, lectura, zoom y controles físicos |
| AC03 Pruebas prioritarias | Parcial | Tablón, filtro de evaluaciones, ranking y primer papel destacado | Confirmar jerarquía visual desktop/móvil |
| AC04 Tu día integrado | Parcial | day-paper usa agenda/minutos/meta reales; DOM | Revisar integración visual y texto largo |
| AC05 Continuar accionable | Parcial | Clic real en handler abre mapa en test DOM; clase guardada conserva acceso | Confirmar identificación/tamaño visual |
| AC06 Ambiente local | Parcial | Fases 8/14/18/23 comprobadas; CSS consume data-nexo-time | Capturas y legibilidad en cada fase |
| AC07 Efectos sutiles/rendimiento | Parcial | Sin timers/listeners/RAF nuevos; perfiles existentes; inventario | Animaciones, LCP/INP y sesión prolongada |
| AC08 Grimorio | Parcial | Shell de libro, páginas, marcadores e índice en DOM/CSS | Validación artística de pantalla real |
| AC09 Ramo → evaluación → mapa | Cumple funcional | Recorrido ejecutado en DOM real; clases anteriores fuera del camino principal | E2E de navegador pendiente como regresión adicional |
| AC10 Mapa de aventura | Parcial | Sendero Bézier, posiciones distintas, etapas/destino y registros | Revisar composición, solapes y conexión a zoom |
| AC11 Inicio → Aprender | Parcial | Decisión/transición instalada y lógica probada | Ver coherencia de animación real |
| AC12 Primera apertura especial | Parcial | Marca por sesión, book-first y 620 ms comprobados | Ver movimiento/hoja en navegador |
| AC13 Siguientes breves | Parcial | book-return y 220 ms comprobados tras regresar | Ver interrupción y repetición rápida reales |
| AC14 Regreso al refugio | Parcial | book-close 180 ms; vuelta probada en DOM | Evaluar sensación de retirar/cerrar libro |
| AC15 Desktop/móvil | Pendiente | CSS específico y E2E preparado a 375/390/768/1440/landscape | Ejecutar layout, capturas, zoom y táctil |
| AC16 Datos preservados | Cumple | SHA de datos y sistemas originales; suite estado/SQL; snapshot DOM sin cambios | Sin gap detectado en alcance local |
| AC17 Sin cambios DB | Cumple | Migraciones/cloud/config sin cambios; ninguna operación remota | Ninguno en esta actualización |
| AC18 Navegación sin regresiones | Parcial | 22 tests locales y rutas antiguas comprobadas en DOM | E2E general y consola del navegador |
| AC19 Coherencia con bosquejo | Pendiente | Bosquejo y assets comparados; mismos materiales y arte | Comparar capturas del resultado, no solo sus assets |
| AC20 Evolución del mismo Nexo | Pendiente | Sistemas/datos/arte conservados y estilos limitados a dos habitaciones | Juicio sobre pantallas nuevas montadas |

## Qué falta y deuda real

Cerrar T03/T08/T09 con Chromium operativo: revisar desktop y móvil, medir desbordamiento/solapes, comprobar teclado/200%/contraste, ver primera/reapertura/cierre, capturar mañana/tarde/noche, comparar con bosquejo y correr E2E general/Web Vitals. T01/T02/T04/T05/T06/T07 tienen implementación y evidencia local; no deben interpretarse como aprobación visual.

La escena original contiene sol diurno pintado. El sombreado nocturno aporta ambiente, pero no sustituye una variante artística nocturna y necesita revisión visual. Los controles de calendario no tienen un temario ligado explícitamente: se muestra el vacío en vez de inferir contenido. La mayoría del mapa reutiliza lecciones históricas y no es un mapa profundo de conocimientos verificados. app.js sigue concentrando UI; solo se añadieron estas vistas, sin resolver esa deuda mediante refactor general. La mascota antigua conserva su estilo y rig incompleto; no se tomó como objetivo corregirla.

El inventario aumenta modestamente JavaScript y añade una hoja CSS. No existen mediciones nuevas de LCP/INP ni consumo prolongado, y las mediciones antiguas no se reciclan como resultado de esta entrega.

## Siguiente actualización recomendada

Primero cerrar el QA visual de UPDATE 01 y ajustar la composición según evidencia. Después, una actualización académica acotada que vincule temarios reales a evaluaciones y convierta los nodos priorizados en experiencias de preparación comprobables, sin reemplazar registros anteriores. El rig/estilo final de mascota debería ser una tarea visual propia una vez aprobadas sus superficies de habitación.
