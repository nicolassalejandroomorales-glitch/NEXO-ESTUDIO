# UPDATE 01.3 — especificación del checkpoint 1

Estado inicial: fuente aprobada de UPDATE 01.2, Sites versión 23, commit `3447e3d8cb5d735e3cfbe8afa3b246afd0d7d782`, recuperada en un checkout limpio e independiente (`work/update01_3_ventana`). El intento rechazado se conserva en `work/publicacion_update01` y no aporta código ni arte a este checkpoint.

## Alcance inmediato

Crear un manifiesto central de Inicio y demostrar sólo la ventana: slot, hotspot invisible, coordenadas relativas al plano de arte, capas, luz horaria existente, teclado y vista debug. Conservar aspecto y funcionalidades de 01.2. Detenerse para aprobación al entregar desktop, móvil, día, noche y debug.

Biblioteca/silla/alfombra, ambientación inferior, navegación diegética adicional, iconos, audio y storyboard del grimorio se aplazan hasta aprobar este patrón. Los cuatro anchors futuros pueden declararse ahora; no constituyen objetos modularizados ni comportamientos de mascota.

## Diseño mínimo

- `dist/design-system/home-scene.js`: perfiles, capas, geometría, slot de ventana, hotspot, anchors y configuración de iluminación. Única fuente para posiciones de la escena. Renderer mínimo; no editor, inventario o almacenamiento.
- `NexoRooms` mantiene identidad y temas. Su contrato `homeScene` se deriva del perfil para conservar compatibilidad con la app actual.
- `renderHomeRpg` conserva contenido y mascota; solicita capas/hotspot al módulo de escena y usa sus coordenadas. El clic de ventana produce únicamente un pulso breve de la luz existente; no cambia la hora, datos, rutas ni contenido.
- CSS conserva los materiales de 01.2 y recibe geometría mediante variables calculadas del manifiesto. Bounds/ids sólo se dibujan con `?debugScene=true`. En uso normal no hay textos ni límites de slot. Foco de teclado y hover pueden dar una señal sutil.
- El fondo es el PNG exacto de 1672 × 941 exportado del WebP aprobado: mismos píxeles, sin edición del arte. Se conserva también el WebP original.

## Coordenadas

Bounds `[x,y,ancho,alto]` normalizados al plano del arte. Slot ventana: `[.045,.08,.235,.40]`. El tono luminoso conserva su región de 01.2 (`[.051,.095,.192,.355]` en el arte), expresada como inset relativo al slot. El hotspot sigue el slot con independencia del ancho/recorte móvil.

El escritorio conserva el asiento actual `[.205,.55]`, ancho `.12`, pie `.89`; los demás anchors sólo indican regiones futuras. No son una malla transitable ni garantizan oclusión física.

## Límite artístico explícito

La ventana está horneada en el fondo. En este checkpoint, mover el slot desplaza hotspot/tono/debug; **no desplaza los píxeles de la ventana**. La sustitución gráfica real queda bloqueada hasta disponer de arte limpio y modular. No se tapará la ventana con un rectángulo o una reconstrucción inventada.

Para sustituirla hacen falta: PNG de base limpia sin ventana (con pared y luz residual coherentes), PNG transparente de ventana alineado al slot y, donde se crucen, PNG de vegetación/mobiliario de primer plano. Una alternativa es un patch limpio con máscara aprobada, pero no se implementa aquí. El módulo no activa un asset modular sobre el fondo horneado.

## Criterios del checkpoint

1. La ilustración normal conserva sus píxeles y no muestra etiquetas/límites añadidos.
2. Un slot y un hotspot de ventana son la única interacción nueva de escena.
3. Bounds y tono siguen el mismo plano en 1440/1280/768/390/375 y durante resize.
4. Tab alcanza el hotspot; Enter/Space ofrecen feedback sin persistencia ni cambio de ruta.
5. Día/noche provienen de `NexoAmbientTime`; no se crea otro reloj.
6. Movimiento reducido detiene el pulso y respeta el ambiente existente.
7. Debug muestra slot/hotspot/anchors y se desactiva sin dejar residuos.
8. Datos, arte anterior, sistemas protegidos y versión publicada permanecen intactos.

## Gate de aprobación

Tras estas capturas y pruebas, detener trabajo. El usuario debe aprobar visualmente el patrón de ventana antes de replicarlo. No se publica este checkpoint ni se modifica el grimorio.
