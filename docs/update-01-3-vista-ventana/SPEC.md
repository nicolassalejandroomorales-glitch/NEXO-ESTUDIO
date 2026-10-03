# UPDATE 01.3 — Vista exterior de la ventana según la hora

Estado: **implementado y aprobado visualmente por Niquito (3 oct 2026)**. Sin publicar.

## 1. Qué (requisito)

Lo que se ve a través del vidrio de la ventana del Inicio cambia con la hora local:
amanecer, día, atardecer y noche (cielo con estrellas y luna).
El marco, las plantas, el cuarto y el arte original no cambian.

## 2. Decisiones (resuelven D1–D7 del A1.1)

| ID | Decisión |
|---|---|
| D1 | La vista exterior es una capa propia, detrás del marco. |
| D2, D4, D6 | Marco, moldura y alféizar quedan fijos en el fondo: no se reconstruye pared ni marco oculto. |
| D3 | Todas las plantas pertenecen al cuarto. |
| D5 | La luz de la ventana sigue la hora con el sistema existente (`NexoAmbientTime`). Las manchas de sol del piso quedan pendientes. |
| D7 | Máscara del vidrio por color, saturación y conexión con el cuarto, con bordes por guided filter. |

## 3. Cómo (diseño)

- `tools/window-views/build_window_views.py` genera `dist/assets/home-scenes/window-view-{morning,dusk,night}.png`
  a partir de `refugio-012.png`. Cada imagen es un recorte RGBA (x120–280, y85–405) con transparencia fuera del vidrio.
- `home-scene.js`: nueva capa ambiental `window-view` con bounds `[120/1672, 85/941, 160/1672, 320/941]`, depth 1.
- `update01.css`: `.home-window-view` muestra la imagen según `body[data-nexo-time]`, con transición de opacidad de 1,2 s
  (desactivada con movimiento reducido). De día no se muestra nada: se ve el original.
  De noche el tono azul previo de la ventana baja a 35 % para no oscurecer dos veces.
- `startup-bundle.js` regenerado con `node tools/build-startup.cjs`. Versión de caché en `index.html`: `update-01-3-window-view`.

## 4. Criterios de aceptación

1. De día el Inicio se ve idéntico al original.
2. A las 8:00, 18:30 y 22:00 cambia sólo el vidrio; no hay halos visibles ni hojas recortadas.
3. Queda alineado en 1440 px y 390 px (móvil).
4. Sin errores en consola; `smoke-test`, `room-test` y `update01-test` pasan.

## 5. Pendiente (no incluido)

- Atenuar de noche las manchas de sol pintadas en el piso (D5 completo).
- Afinar los árboles del atardecer, que quedaron algo planos.
- Lluvia, estaciones o vistas por ramo: el mismo mecanismo permite agregarlas con más imágenes.
