# NEXO — UPDATE 01.2

Entrega del 2 de octubre de 2026. Alcance cerrado: integración de Inicio y pulido de la apertura del grimorio. No se continuó con clases funcionales.

## Base y trazabilidad

Se trabajó sobre UPDATE 01.1, publicada como versión 22 de Nexo, commit `2d9bac263e110055e7d6c3b4c1d0ed7e94894a49`, en la copia independiente `work/publicacion_update01`. El proyecto original, BACKUP_V14 y los paquetes recuperados se conservaron. La publicación de esta entrega se registra separadamente en `PUBLICACION.json`; los hashes del paquete final, en `PAQUETE_SHA256.json`.

El arte de habitación y la mascota son los existentes. Se mantuvieron intactos datos, configuración, Supabase, OAuth, cloud, migraciones y motor académico. La prueba de navegador bloqueó solicitudes externas y utilizó un perfil temporal local.

## Problema → evidencia → cambio

| Problema observado | Evidencia anterior | Cambio realizado |
|---|---|---|
| La habitación estaba encapsulada y cubierta por los papeles. | `antes_home_desktop.png`: margen exterior, esquinas del contenedor y papeles ocupando la escena. | Habitación superior a la proporción del arte original, sin marco exterior; transición amplia del suelo a las superficies de estudio. |
| La mascota quedaba detrás de la información. | `antes_home_desktop.png` y `antes_home_mobile.png`. | Se trasladó el mismo renderer al plano de arte, con apoyo sobre el escritorio izquierdo, sombra y ajuste de escala móvil. |
| La ventana perdía presencia, especialmente en móvil. | Recorte del fondo anterior y sombreado horario global. | Ventana visible en el plano de habitación y tono exterior localizado; iluminación interior coordinada con los estados horarios existentes. |
| Zonas futuras sin relación suficiente con el mobiliario. | Los selectores anteriores apuntaban a papeles/volumen o placeholders compartidos. | Cuatro zonas geométricas normalizadas asociadas al arte: ventana, biblioteca, escritorio y descanso. Sólo el escritorio aloja la mascota actual. |
| El giro de tapa se percibía rápido pese a la duración total. | Antes: 920 ms, tapa quieta hasta offset 0,30 y giro principal hasta 0,87. | Total 1100 ms; giro repartido entre offsets 0,16–0,96 y curva menos concentrada. Reapertura 500 ms. Cierre y paso de página conservados. |
| Ceremonia de apertura limitada. | `antes_grimoire_open.png`, sin luz ni destellos localizados de entrada. | Un pulso de resplandor y tres destellos con entrada/salida suave. Sólo existen durante la apertura y se eliminan al terminar/cancelar. |

La observación y propuesta se guardaron antes de editar en `OBSERVACION_Y_PLAN.md`.

## Checkpoints y correcciones

El bloque A se capturó y mostró antes de modificar el bloque B. Se conservaron las primeras capturas en `capturas/checkpoint_a/`. Al observarlas se detectaron un contorno excesivo del tono nocturno de ventana y una franja de fondo al pie: se suavizó la máscara y se trasladó el espacio inferior al mismo fondo continuo. Se repitieron las capturas (`checkpoint_a_final_CAPTURAS.json`).

Después del pulido, una prueba geométrica detectó que a 768 px el papel del día y el volumen todavía compartían fila. Se amplió el umbral del contenedor a 900 px para apilarlos en tablet y en el reflujo ampliado. La prueba de escena y la revisión completa se repitieron con resultado satisfactorio. No hubo cambios posteriores de producto.

## Archivos de producto modificados

| Archivo | Cambio |
|---|---|
| `dist/app.js` | Separación de habitación e información; anfitrión de mascota y zonas. Contenido/acciones existentes conservados. |
| `dist/design-system/update01.css` | Integración de escena, ventana por horario, superficies continuas, responsive y efectos temporales de apertura. |
| `dist/design-system/rooms.js` | Geometría y anclaje de la escena sobre el arte de 1672 × 941. |
| `dist/platform/animation.js` | Duraciones, distribución del giro, resplandor y tres destellos cancelables. |
| `dist/startup-bundle.js` | Regenerado con los módulos de habitaciones y animación actualizados. |
| `dist/index.html` | Referencias de caché de CSS/app/arranque a `update-01-2`. |

Se añadió documentación en `docs/update-01-2/`. No se regeneró configuración ni se ejecutó el build general que puede escribirla.

## Capturas y evidencia

- [Inicio desktop](capturas/home_scene_desktop.png) y [móvil](capturas/home_scene_mobile.png).
- [Ventana de día](capturas/home_day_window.png), [noche](capturas/home_night_window.png), mañana y atardecer.
- [Grimorio durante la apertura](capturas/grimoire_open_polished.png), [resplandor](capturas/grimoire_glow.png) e [índice abierto](capturas/grimoire_courses_polished.png).
- [Secuencia de apertura](capturas/grimoire_open_sequence.gif): 12 fotogramas del navegador a posiciones de tiempo de 0–1100 ms, con pausa final para lectura. Es una secuencia muestreada de la animación real; no mide FPS ni constituye grabación de rendimiento en tiempo real.
- Antes/después de Inicio y grimorio, tablet 768, desktop 1280, cuatro ramos, evaluación/mapa, móvil 375/390 y ampliación CSS 200% en la galería `GALERIA_UPDATE01_2.html`.

Las capturas día/noche/mañana/atardecer se produjeron llamando a la función visual horaria existente con una hora de prueba. No se cambiaron el reloj del sistema ni registros guardados.

## Pruebas y resultados

| Comprobación | Resultado / evidencia |
|---|---|
| Inicio, Aprender, cuatro ramos y mapa de Orgánica en 1440/1280/768/390/375 | 35 combinaciones sin desbordamiento horizontal, excepción de JavaScript ni respuestas locales HTTP fallidas. `posterior_tablet_PRUEBAS.json`. |
| Ramo → evaluación → mapa → detalle | Cinco etapas y acceso al material anterior; marcadores y botones anterior/siguiente recorren los cuatro ramos. |
| Primera apertura / retorno / cierre / cambio de página | Duraciones 1100/500 verificadas; cancelación rápida elimina tapa y opacidad residual. |
| Zonas y mascota | Cuatro zonas presentes; mascota dentro del área de habitación en los cinco anchos. Papeles apilados en tablet/móvil. `ESCENA_Y_APERTURA_PRUEBAS.json`. |
| Teclado y foco | Enter abre destinos, foco pasa a `main`, Tab alcanza botones. No es una auditoría exhaustiva de lector de pantalla. |
| Movimiento reducido | Sin tapa, resplandor ni destellos; ambiente de hojas/luz detenido y navegación inmediata. |
| Ampliación 200% | Inicio y Fisio sin scroll horizontal usando CSS `zoom:2`. Esta prueba de reflujo no certifica zoom nativo en todos los navegadores. |
| Estado guardado | Navegar no altera mascota, inventario, dominio, progreso orgánico, clases completadas, eventos, notas ni documentos del perfil de prueba. |
| Rutas existentes | Entrenar, Juegos, Perfil, Bitácora, Biblioteca y Orgánica anterior abren sin error de interfaz. |
| Pruebas de fuente | Seis scripts existentes pasan: update01, habitaciones, controlador de mascota, avatar, ambiente y smoke. `PRUEBAS_FUENTE.json`. No se afirma que toda la suite histórica haya sido ejecutada. |
| Sintaxis y diferencias | `node --check` en app/animación y `git diff --check` satisfactorios. Se corrigieron finales de línea involuntarios para conservar diferencias acotadas. |
| Preservación por SHA-256 | Sólo seis archivos de producto modificados, cero originales eliminados, 73 archivos de arte y 44 protegidos iguales. ZIP recuperado y ZIP 01.1 intactos. `PRESERVACION_SHA256.json`. |

Entorno: Brave Chromium real, Windows, localhost, zona America/Santiago, perfil limpio, sin service worker ni conexión a servicios externos. Se probó la implementación local que se empaqueta para Sites; no se presenta como prueba de sincronización remota.

## Criterios de aceptación

| Criterio | Estado sustentado por esta revisión |
|---|---|
| AC01 — composición continua | Aplicado; se retiró el perímetro exterior y el suelo enlaza con los papeles. Capturas desktop/móvil. |
| AC02 — habitación habitable | Aplicado; mobiliario, biblioteca, descanso y suelo visibles, mascota sobre escritorio. Percepción final por revisar con el usuario. |
| AC03 — ventana importante | Aplicado; ventana izquierda visible y luz horaria localizada. |
| AC04 — profundidad/vida sutil | Aplicado con arte existente, capas de luz y follaje lento. Movimiento reducido comprobado. |
| AC05 — reducir imagen enmarcada | Aplicado; sin borde/radio/sombra exteriores de la escena. Persiste una ilustración estática como base, no un escenario 3D. |
| AC06 — continuidad material/color | Aplicado; madera, pergamino y verde cálido continúan en la zona funcional. |
| AC07 — preparación de mascota futura | Preparación geométrica documentada. No equivale a navegación implementada ni a mapa de colisiones. |
| AC08 — integración de mascota actual | Mejor apoyo visible y sin quedar detrás de los papeles. Sin cambiar identidad o renderer. |
| AC09 — apertura más lenta/mágica | Tiempos y giro modificados; secuencia conservada. Valoración subjetiva pendiente del usuario. |
| AC10 — destellos sutiles | Tres pulsos suaves, sin repetición permanente. Intensidad visual revisable por el usuario. |
| AC11 — desktop/móvil | Pruebas de cinco anchos y reflujo aprobadas en Brave. |
| AC12 — preservar rutas/datos/base | Pruebas y hashes satisfactorios dentro del alcance descrito. |

## Gaps y recomendación antes de clases

La noche usa iluminación y tonos sobre el mismo arte; algunos rayos pintados en el suelo permanecen. No existe una lámina nocturna alternativa, clima real ni apertura física interactiva de ventana. El follaje usa la capa del arte existente; no se produjo un rig de plantas.

Las zonas son regiones de referencia en coordenadas del arte, con selectores y capas semánticas. Faltan superficies transitables, oclusión física y recorridos de una mascota futura; se dejaron fuera deliberadamente. El renderer actual conserva sus rasgos y animaciones existentes.

Falta revisión del usuario de la composición, escala y ceremonia; pruebas en hardware móvil real/Safari, zoom nativo, lector de pantalla y rendimiento de dispositivos modestos. Las pruebas de preservación no certifican sincronización, OAuth o Supabase: esos sistemas no se tocaron ni se invocaron.

Antes de clases funcionales recomiendo aprobar estas capturas y tiempos, comprobar legibilidad en un teléfono real y definir una única evaluación como piloto con criterios observables de aprendizaje. Esta recomendación no inicia otra implementación.

Estado: Inicio y pulido del grimorio estabilizados para revisión. No se añadieron clases, features académicas ni comportamientos nuevos de mascota.
