# UPDATE 01.3 — Noche coherente en el Inicio

Estado: **implementado; pendiente de tu aprobación visual (3 oct 2026)**. Sin publicar.

## 1. Qué

De noche el cuarto no puede tener sol. Las manchas de sol pintadas en la alfombra y el piso desaparecen,
y los faroles y velas se ven encendidos. Al atardecer ambos efectos aparecen a medias.

## 2. Decisiones

- Completa la decisión D5: la luz del sol se apaga junto con la vista de la ventana.
- No se edita el arte original: se superponen dos capas encima.
- Los reflejos de los faroles en el piso del lado derecho se quedan, porque esos sí existen de noche.

## 3. Cómo

| Capa | Archivo | Qué hace |
|---|---|---|
| `floor-night` (depth 1) | `assets/home-scenes/floor-night.webp` (37 KB) | Piso y alfombra sin manchas de sol. La genera `tools/home-night/build_floor_night.py`. |
| `lamp-glow` (depth 2) | sólo CSS | 12 halos cálidos (`radial-gradient`, `mix-blend-mode:screen`) sobre faroles y velas, encima del tinte nocturno. |

- Opacidad: noche 1, atardecer 0,55, mañana y día 0. Transición de 1,6 s, desactivada con movimiento reducido.
- Las posiciones de los halos están en `update01.css`, en % del plano del arte (fuente 1672×941).
- `startup-bundle.js` regenerado. Versión de caché en `index.html`: `update-01-3-night`.

## 4. Criterios de aceptación

1. De día el Inicio se ve idéntico al original.
2. De noche no quedan manchas de sol visibles; la alfombra y la madera conservan su textura.
3. Los faroles se ven encendidos sin quemar el color.
4. Queda alineado en 1440 px y 390 px; sin errores de consola; `smoke-test`, `room-test` y `update01-test` pasan.

## 5. Pendiente

- Transición gradual entre horas (hoy son 4 estados con fundido de 1,6 s; la spec original pide 7 fases).
- Parpadeo de llamas: es parte del paso 3 (vida).
- La pared iluminada junto a la ventana sigue algo clara de noche.
