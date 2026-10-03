# NEXO — UPDATE 01.3, checkpoint 1

Fecha: 3 de octubre de 2026, America/Santiago. **Sólo arquitectura y vertical slice de ventana. Sin publicación. Detenido para aprobación visual.**

## Procedencia

Se abrió de nuevo la fuente de Nexo Sites versión 23, UPDATE 01.2, commit `3447e3d8cb5d735e3cfbe8afa3b246afd0d7d782`, en `work/update01_3_ventana`. La copia estaba limpia antes de editar. No se usó la base antigua ni el intento rechazado: éste queda intacto en `work/publicacion_update01`, sin ser la vista previa actual.

La especificación y arquitectura se documentaron antes de implementar en [SPEC_Y_ARQUITECTURA.md](SPEC_Y_ARQUITECTURA.md). Este informe cubre un checkpoint, no la finalización de toda UPDATE 01.3.

## Qué se creó

Un único perfil `refugio-012` en `dist/design-system/home-scene.js`, con `sceneId`, tamaño de referencia, PNG base, capas, slot de ventana, hotspot, anchors, capas ambientales y perfil de luz. Las coordenadas se expresan como fracciones del plano del arte. La app y el CSS reciben la geometría desde ese perfil; el contrato anterior `NexoRooms.homeScene` se deriva de él.

Se conservó el fondo exacto en PNG, **1672 × 941, 2.520.225 bytes**, con todos los píxeles idénticos al WebP original aprobado. Se mantiene también el WebP anterior. No se añadió arte generado ni se incorporaron las hiedras/portada del intento rechazado.

El perfil declara capas de base, ambiente trasero, objetos, mascota/oclusiones, ambiente frontal, interfaz y hotspots. Las capas de oclusión son reservas de composición; todavía no hay oclusión física o locomoción de mascota. Sólo existe un slot de objeto: ventana. Escritorio, biblioteca y descanso figuran únicamente como anchors futuros de la mascota, sin objetos/hotspots adicionales.

## Qué hace la ventana

El slot coincide con la región de ventana del arte. Su hotspot invisible ocupa la zona superior de vidrio, derivada del mismo slot, para evitar capturar clics sobre la mascota. No muestra nombres, placas, bordes o botones visibles durante uso normal. Hover/foco pueden dar una señal discreta; el borde de foco permite encontrar el control con teclado.

Click, Enter o Space producen un pulso suave de luz de 600 ms. No abren un panel, no cambian la hora, no cambian de ruta y no escriben datos. El feedback se cancela al navegar, repetir la acción o activar movimiento reducido. La luz de mañana/día/tarde/noche reutiliza `NexoAmbientTime`.

El pulso es feedback de interacción; no se presenta como apertura física de ventana o gameplay final.

## Cómo moverla o cambiar de escena

Para mover la **zona lógica**, se edita `slots[0].bounds = [x,y,ancho,alto]` en el manifiesto. Hotspot y tono luminoso se calculan como insets relativos y siguen automáticamente esa zona, incluso al redimensionar. Si se cambia el lugar donde la mascota mirará la ventana, se ajusta también su anchor semántico en el mismo perfil.

Para otro fondo se añade otro perfil con `referenceWidth`, `referenceHeight`, `backgroundAsset`, slots, hotspots, anchors e iluminación, y se elige como perfil predeterminado. El manejador `focus-light` se reutiliza. No se creó selector ni editor de fondos para el usuario.

**La ventana actual sigue horneada en el PNG. Mover la zona lógica no mueve sus píxeles.** Para sustituirla visualmente hacen falta base limpia, ventana transparente y capa frontal donde corresponda. [ASSETS_REQUERIDOS.md](ASSETS_REQUERIDOS.md) detalla ese contrato. El renderer bloquea pintar un objeto modular sobre el fondo horneado sin base limpia.

## Archivos

| Archivo | Trabajo del checkpoint |
|---|---|
| `dist/design-system/home-scene.js` | Nuevo perfil central, capas, geometría, render mínimo, debug y feedback de ventana. |
| `dist/assets/home-scenes/refugio-012.png` | Nuevo PNG de píxeles idénticos al fondo aprobado. |
| `dist/app.js` | Composición de Inicio desde el perfil y activación/limpieza del hotspot. Contenido de 01.2 conservado. |
| `dist/design-system/rooms.js` | Background y contrato compatibles derivados del perfil. |
| `dist/design-system/update01.css` | Estilos de capas/hotspot invisible y debug, sin etiquetas normales. |
| `tools/build-startup.cjs` | Incluye el nuevo módulo antes de habitaciones. |
| `dist/startup-bundle.js` | Regenerado, ahora 27 módulos; no se ejecutó el build general. |
| `dist/index.html` | Referencias de caché de la vista local a `update-01-3-window-cp1`. |
| `tools/room-test.cjs` | Carga el manifiesto y acepta PNG lossless hasta 3 MB; otros escenarios conservan su límite. |

Se añadió documentación de checkpoint en `docs/update-01-3-checkpoint1/`. Los scripts de QA y la galería se guardan fuera del producto.

## Capturas y cómo revisar

La galería [GALERIA_CHECKPOINT1.html](GALERIA_CHECKPOINT1.html) muestra desktop, móvil, día, noche, debug, tablet y ampliación.

- `window_desktop.png`: Inicio normal, 1440 px.
- `window_mobile.png`: Inicio normal, 390 px.
- `window_day.png` / `window_night.png`: estados horarios de prueba.
- `window_debug_desktop.png` / `window_debug_mobile.png`: slot, hotspot y cuatro anchors.
- `window_tablet_768.png`: tablet.
- `window_zoom_css_200.png`: reflujo con CSS zoom 200%.

Vista normal local: `http://127.0.0.1:8766/#/home`. Debug: `http://127.0.0.1:8766/?debugScene=true#/home`. Para desactivarlo, retirar ese parámetro. Debug no guarda preferencias.

## Pruebas

| Comprobación | Resultado |
|---|---|
| Resize continuo 1440 → 1280 → 768 → 390 → 375 → 1440 | Slot/hotspot alineados al plano, zona clickeable, sin scroll horizontal. Hotspot separado de la zona de mascota. |
| Apariencia normal | Hotspot transparente, sin borde ni texto; cero etiquetas debug y cero accesos visibles del intento fallido. |
| Teclado | Tab desde main encuentra ventana; Enter/Space generan feedback; foco y ruta conservados. |
| Día/noche | Tono diferente mediante la función horaria existente, sin modificar reloj ni registros. |
| Reduced-motion | Sin pulso ni animaciones de hojas/luz; cancelar una animación activa funciona. |
| Debug | Activa slot/hotspot/anchors; volver a normal elimina etiquetas. |
| Estado guardado | JSON local de estudio igual antes/después de la interacción. |
| Rutas existentes | Aprender → Orgánica → evaluación → mapa de cinco etapas abre. Intro de 01.2 conserva 1100 ms. |
| Ampliación | CSS zoom 200% sin overflow; no es certificación de zoom nativo en todos los navegadores. |
| Consola y recursos locales | Prueba final sin errores JavaScript, console.error o HTTP fallidos. Se corrigió una ruta relativa de PNG que se resolvía desde la carpeta CSS y se repitió la prueba completa. |
| Contrato | Sin base limpia no se renderiza el reemplazo; cambiar bounds mueve geometría derivada; perfil original inmutable. |
| Fuente | Pasan seis scripts existentes: habitaciones, update01, controlador de mascota, avatar, ambiente y smoke; sintaxis app/manifiesto y diff revisados. |
| SHA-256 y píxeles | Cero originales eliminados; 71 archivos de arte originales y 46 protegidos del checkout conservados. Audio y animación del grimorio intactos. PNG idéntico por comparación de píxeles. |

Evidencia: `PRUEBAS_VENTANA.json`, `PRUEBAS_CONTRATO.json` y `PRESERVACION_SHA256.json`. Entorno: Brave real en Windows, localhost, perfil temporal, solicitudes externas bloqueadas. No se invocó Supabase ni se probó sincronización.

## Criterios y límites

AC02 y AC05 sustentados por manifiesto y prueba de invisibilidad. AC03 preparado para otro perfil, pendiente de arte y validación de una segunda escena. AC04 demuestra slot/hotspot/responsive/luz; **intercambio gráfico real pendiente de assets**. AC10 conserva mascota y prepara anchors. AC01 queda a tu revisión visual; los píxeles del fondo permanecen idénticos. La parte pertinente de AC16 pasó las pruebas descritas; no constituye una auditoría exhaustiva de toda la app.

AC06–09, AC11–15 se conservan o aplazan según la secuencia solicitada: no se replicaron objetos ni se hizo nueva ambientación, navegación diegética, iconografía, audio o intro del grimorio. No se afirma que UPDATE 01.3 esté terminada.

También faltan revisión en móvil físico/Safari, lector de pantalla y perfil de rendimiento. El PNG exacto ocupa más que el WebP; cualquier futura optimización deberá conservar PNG/píxeles o aprobarse explícitamente. La base limpia y recortes requieren aprobación artística antes de integración.

## Punto de parada

Checkpoint 1 listo para revisión. **No continuar con biblioteca/silla/alfombra, ambientación o grimorio hasta tu aprobación del patrón de ventana. No publicar hasta el checkpoint 2 aprobado.**
