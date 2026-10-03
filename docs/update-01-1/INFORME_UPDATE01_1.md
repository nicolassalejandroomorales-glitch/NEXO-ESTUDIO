# NEXO — UPDATE 01.1: Inicio vivo y grimorio

Fecha: 2 de octubre de 2026. Implementación limitada a Inicio y Aprender, sobre la UPDATE 01 recuperada y publicada como versión 21. La copia antigua del 30-09 y la extracción de recuperación no se utilizaron como destino de edición.

## Procedencia y preservación

ZIP de origen: `nexo-update01-codigo-y-evidencia.zip`, SHA-256 `add24da356f8e1f0fa16e1a026ed40cae1085e71728f04cf06b7f6ea30f5c4df`. Checkout de trabajo: `work/publicacion_update01`; commit de partida `dabf55f1494858ed3844f465b28369fd723357d6`.

La comparación por hashes verifica seis archivos de producto modificados, cero archivos originales eliminados, 73 archivos de assets/fuentes artísticas/Rive conservados y 44 archivos protegidos sin modificación. Estos incluyen datos, configuración, almacenamiento, migraciones, cloud, motor académico, contratos, catálogo, controladores y renderer de mascota. El ZIP original y su extracción siguen coincidiendo con la línea de partida. Detalle reproducible en `PRESERVACION_SHA256.json`.

## Observación → evidencia → cambio

| Problema | Evidencia antes | Cambio aplicado |
|---|---|---|
| Imagen y zona inferior separadas | Fondo limitado a 800 px; captura `antes_inicio_desktop.png` muestra la zona marrón bajo los papeles. | El mismo arte cubre la escena completa; se retiró el marco grueso. El volumen comparte la columna con Tu día. |
| Fondo quieto | Luz estática del refugio y vegetación integrada en un WebP. | Respiración de luz y desplazamiento muy leve de una capa tomada del arte original; se reutilizan las partículas existentes. Se desactivan con movimiento reducido/calidad baja y se pausan al ocultar la pestaña. |
| Apertura sin continuidad suficiente | La tapa anterior aparecía encima de la vista ya reemplazada. | Se toma la posición del volumen visible antes de cambiar ruta. El libro se desplaza, abre la tapa desde su lomo y revela los folios. Primera entrada: 920 ms; retorno: 460 ms; giro de página: 320 ms; cierre: 280 ms. Si el volumen está fuera de pantalla, se usa una entrada breve desde el propio libro. |
| Lista de cuatro ramos equivalentes | `antes_grimorio.png`, cuatro filas grandes sobre el folio derecho. | El índice presenta una primera apertura; los marcadores y los controles de pasar página llevan a los spreads individuales existentes. No se añade estado persistente para seleccionar páginas. |
| Páginas genéricas y vacías | Frontispicio grande con pocos elementos. | Encuadernación, canto, lomo, marcadores, folios numerados, resumen del catálogo y temario del ramo. Orgánica reutiliza la lámina molecular de anilina/bencilamina; Analítica, Fisicoquímica y Fisio reutilizan sus diagramas existentes. Cada ramo conserva su acento y símbolo. |
| Mascota desconectada | La posición original podía quedar sobre el fondo sin apoyo. | La mascota actual queda delante del fondo y detrás del borde del papel/tablón vecino. Su colocación depende de la superficie del grid y de una escala responsive, no de coordenadas de pantalla fijas. No se cambió identidad, rig ni renderer. |

Antes de editar se guardó `OBSERVACION_Y_PLAN.md`. El checkpoint A+B se generó y se inspeccionó antes de modificar la estructura del grimorio. Sus capturas permanecen en `capturas/checkpoint_ab/`. Tras C+D se generaron y revisaron el índice y los spreads; permanecen en `capturas/checkpoint_cd/`.

## Correcciones surgidas de la prueba real

- Desbordamiento de 4 px en el índice de 390 px: la pseudo-capa de fondo se extendía fuera de la escena. Se corrigió su encaje y se repitieron las pruebas.
- La primera disposición del diagrama de Fisio alteraba su lectura secuencial: se restituyó el orden vertical, sin cambiar el contenido académico.
- Se retiró un ensayo de apoyo visual de la mascota que parecía una franja flotante; se integró la mascota detrás de la superficie existente.
- La vista previa original enviaba SVG como binario. Se utilizó un servidor de revisión con el tipo correcto, sin modificar `tools/static-server.cjs` ni el asset. La prueba final comprueba que la lámina se decodifica.
- El ensayo de ampliación al 200% mostró folios demasiado estrechos pese a no producir scroll horizontal. Se añadieron consultas por ancho del contenedor para que las páginas y las superficies de Inicio pasen a una columna cuando el espacio real lo exige.

## Archivos tocados

| Archivo | Finalidad |
|---|---|
| `dist/app.js` | Capas de Inicio, preparación de transición, índice con primera apertura, láminas existentes, temario y navegación entre spreads. |
| `dist/design-system/update01.css` | Continuidad, iluminación, profundidad, encuadernación, legibilidad y adaptación por viewport/contenedor. |
| `dist/platform/animation.js` | Desplazamiento/apertura, hoja de página inerte, cancelación y movimiento reducido. |
| `dist/design-system/rooms.js` | Contrato mínimo de superficies/capas del refugio, conservando el registro de habitaciones. |
| `dist/startup-bundle.js` | Regenerado desde los 26 módulos originales mediante `build-startup.cjs`; no se modificó configuración. |
| `dist/index.html` | Versionado de referencias a los tres archivos cambiados para evitar caché antigua. |

Documentación nueva: este informe y `PREPARACION_MASCOTA.md` en `docs/update-01-1/`. Los informes históricos permanecen intactos. Los scripts de revisión y el servidor están en `work/update01_1/`, fuera del producto publicado.

## Capturas finales

Se generaron las siete requeridas y nueve adicionales. Galería: `GALERIA_UPDATE01_1.html`.

| Captura | Estado |
|---|---|
| `inicio_desktop_nuevo.png` | Inicio a 1440 px. |
| `inicio_mobile_nuevo.png` | Inicio a 390 px. |
| `transicion_grimorio.png` | Fotograma real de apertura, pausado temporalmente para capturarlo sin mezclar tiempos. |
| `grimorio_indice_nuevo.png` | Índice y primera apertura. |
| `ramo_quimica_pagina.png` | Spread de Orgánica. |
| `ramo_fisio_pagina.png` | Spread de Fisiopatología. |
| `aprender_mobile_nuevo.png` | Índice a 390 px. |
| `ramo_analitica_pagina.png`, `ramo_fisico_pagina.png` | Otros dos ramos. |
| `mapa_preparacion.png`, `mapa_mobile_375.png` | Mapa de cinco etapas, desktop y móvil. |
| `inicio_1280.png`, `aprender_tablet_768.png`, `fisio_mobile.png` | Variantes responsive. |
| `inicio_zoom_css_200.png`, `aprender_zoom_css_200.png` | Ensayo de ampliación y reflujo mediante CSS zoom. |

Las capturas de recuperación y las anteriores a esta fase se conservaron. Las capturas de página completa sitúan la barra móvil fija a la altura del viewport inicial; el contenido que queda detrás puede desplazarse normalmente al usar la app.

## Pruebas y alcance de la evidencia

Navegador real Brave/Chromium, perfil temporal separado, datos de prueba locales, red externa bloqueada antes de transmitir. No se inició sesión, no se aplicó SQL, no se hizo ningún cambio en Supabase, OAuth o cloud.

Resultado final: `final_PRUEBAS.json`, ejecución exitosa, sin errores JavaScript ni respuestas HTTP fallidas.

- 35 combinaciones: siete rutas a 1440, 1280, 768, 390 y 375 px, sin desbordamiento horizontal.
- Índice con una apertura; marcadores y navegación anterior/siguiente de los cuatro ramos.
- Evaluación de Orgánica → mapa con cinco nodos → detalle de material anterior.
- Primera entrada, retorno, cierre y cancelación de apertura, sin tapa residual.
- Teclado: Enter abre destinos, foco vuelve al contenido y Tab alcanza los botones.
- `prefers-reduced-motion`: iluminación/vegetación sin animación y apertura inmediata.
- Ampliación al 200% **simulada con CSS zoom**, además de pruebas de viewport reducido. No equivale a certificar el zoom nativo de todos los navegadores.
- Comparación del estado local antes/después: mascota, inventario, evaluaciones, notas, documentos y registros académicos iguales.
- Rutas históricas de Entrenar, Juegos, Perfil, Bitácora, Biblioteca y clases anteriores abren sin error.
- Tests locales existentes: `update01-test`, `room-test`, `mascot-controller-test`, `avatar-test`, `ambient-event-test` y `smoke-test`; sintaxis y diff sin errores. No se ejecutaron las antiguas aserciones DOM que exigían cuatro bloques en el índice: ese contrato visual es precisamente el que AC07 pide cambiar.

La evidencia de movimiento incluye animaciones activas registradas por el navegador y navegación real. Una captura estática por sí sola no demuestra movimiento. No se hizo una medición de FPS/batería en teléfono físico ni una certificación completa de accesibilidad.

## Criterios

| Criterio | Resultado y límite |
|---|---|
| AC01–AC02 | Implementados y revisados visualmente: escena continua, sin zona plana inferior. Aprobación perceptiva final pendiente del usuario. |
| AC03 | Implementado y observado: luz/vegetación suaves, partículas del sistema existente, controles de reducción. |
| AC04 | Información y botones conservados, tipografía funcional ampliada y navegación comprobada. El texto interno de la lámina SVG es pequeño en móvil; se usa como motivo del ramo, y el material anterior conserva su acceso. |
| AC05 | Apertura por etapas y retorno comprobados; el cierre es más breve y mantiene una transición sencilla. |
| AC06 | Más estructura física y contenido en los folios. Evaluación estética final pendiente del usuario. |
| AC07 | Cumple funcionalmente: desaparecen los cuatro bloques equivalentes y cada ramo tiene apertura propia. |
| AC08 | Tematización mediante motivos/diagramas del catálogo, símbolo y acento. No se creó una nueva colección de ilustraciones anatómicas. |
| AC09 | Pruebas desktop/tablet/móvil y capturas sin desbordamiento. Validación en dispositivos físicos pendiente. |
| AC10 | Rutas y registros comprobados; hashes de datos, assets y sistemas protegidos intactos. |

## Mascota y siguiente actualización

Se conserva la infraestructura de `mascot/controller`, `avatar/contracts`, catálogo, composición Canvas y runtime Rive. Permanecen los Rive actuales, fuentes RML, poses, skins y documentación. Ningún recurso futuro se activó ni se añadió al arranque.

`NexoRooms.homeScene` describe capas y superficies: ventana activa para la mascota actual; escritorio, estantería y descanso reservados/inactivos. Son referencias a superficies del layout; no son destinos transitables. La separación actual distingue fondo, vegetación/luz, mascota y superficies interactivas. No se creó locomoción, límites de movimiento, orientación dinámica, máquina de estados ni nueva configuración de usuario. Más detalle en `PREPARACION_MASCOTA.md`.

La siguiente fase debería recoger primero la revisión visual del usuario. Para una actualización posterior de mascota: validar superficies físicas y oclusiones por tamaño, construir anclas/rig comprobados y acordar conductas concretas antes de activarlas. Las clases completas y la vinculación profunda de temarios a evaluaciones continúan pendientes y fuera de esta entrega.

## Publicación

Se publica esta fase en el mismo Nexo Sites, conservando su audiencia y sus versiones anteriores. Los datos de publicación y el commit exacto quedan en `PUBLICACION.json` junto a este informe. La fase termina aquí; no se continúa con clases ni mascota futura.
