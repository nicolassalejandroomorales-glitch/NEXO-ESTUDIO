# UPDATE 01.4 — Cierre del Inicio

Estado: **implementado; pendiente de tu aprobación visual (3 oct 2026)**.

## Qué
1. **Báculo estelar refinado** (`tools/home-staff/build_staff.py`, v2): madera con la paleta del mueble de atrás, vetas, nudos,
   ancho irregular, empuñadura de cuero, bronce envejecido con pátina, luna con bisel y surco grabado, regatón de bronce.
   Su brillo sigue la luz real del cuarto a cada altura. El brillo de la estrella es más chico y ya no "enciende" toda la luna de noche.
2. **Mapa pirata refinado** (`tools/home-map/build_map.py`): manchas, pliegues, bordes tostados, más oscuro;
   la tapa del rollo va en el extremo cercano para que se lea acostado en el piso.
3. **Encuadre móvil**: en ≤700 px la sala es más alta (proporción 1.2) y se **desliza de lado** dentro de `.home-pan`.
   Parte en el escritorio con la mascota; un aviso "Desliza para explorar ⟷" desaparece al primer deslizamiento.
4. **Hojas con vida** (`tools/home-leaves/build_leaves.py`): 4 enredaderas recortadas del arte se mecen desde arriba.
   Debajo de cada una hay un "fondo reconstruido" (inpainting) para que no se vea doble al moverse.
5. **Iconos propios** en la barra: Bitácora = almanaque con luna; Tienda = cabeza del báculo estelar (SVG en línea, `currentColor`).
6. Bug: `tools/static-server.cjs` ahora declara `image/svg+xml`.

## Decisiones
- El original `refugio-012.png` no se toca: todo son capas generadas por scripts reproducibles.
- Las hojas y su fondo van **debajo del tinte**, así que cambian con la hora como el resto.
- Animaciones solo con `transform` (barato). Se detienen con movimiento reducido, calidad baja o pestaña oculta.
- En escritorio `.home-pan` solo envuelve la escena: no cambia nada.
- Iconos 100 % originales; se evitó una cruz en el báculo para que no parezca un símbolo religioso/astrológico.

## Criterios de aceptación
1. Los 7 objetos siguen llevando a su destino en 1440 y en 390 (verificado con Playwright).
2. En 390 px se puede llegar al sillón y a la estantería deslizando; el aviso se oculta al deslizar.
3. Sin errores de consola; `smoke-test`, `room-test` y `update01-test` pasan.

## Pendiente
- Tu opinión sobre el báculo v2, el mapa y los iconos.
- `update01-dom-test` necesita `jsdom` y `accessibility-test` necesita Edge: no corren en este entorno (ya fallaban antes).
