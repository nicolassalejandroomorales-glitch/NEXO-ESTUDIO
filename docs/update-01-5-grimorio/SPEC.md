# UPDATE 01.5 — Portada del grimorio y transiciones

Estado: **implementado; pendiente de tu aprobación visual (3 oct 2026)**.

## Qué
1. **Portada nueva del grimorio**, pintada con código (`tools/grimoire-cover/build_cover.py`): cuero verde con grano y desgaste,
   filetes de pan de oro, hiedra grabada, esquinas de bronce con remaches, rayos dorados, medallón de bronce con 24 runas propias,
   hexágono dorado (guiño al anillo aromático), luna creciente de oro, gema turquesa y broche de cuero y bronce.
   Capas: `grimoire-cover.webp`, `grimoire-cover-glow.webp` (runas encendidas), `grimoire-cover-clasp.png`, `grimoire-endpaper.webp` (guarda jaspeada).
2. **Intro ceremonial** (primera vez por sesión, 2,3 s) en `platform/animation.js`, siguiendo el storyboard del UPDATE 01.3:
   portada → runas que se encienden en círculo + reflejo → gema brilla y se suelta el broche → la tapa se abre con peso →
   páginas que se levantan → aparece el grimorio. Se salta con clic, toque, Esc, Enter o Espacio.
3. **Reapertura** (0,95 s, sin ceremonia) y **cierre** al volver al refugio (0,62 s): la tapa se cierra.
4. **Cambio de página** entre ramos (0,34 s): perspectiva corregida (antes la hoja "saltaba" fuera del libro) y sombreado.
5. **Secciones principales**: entrada de "nuevo capítulo" de 0,34 s (fundido desde 0 y 12 px de subida).
6. **Sonido de apertura** sintetizado (soplo + 4 campanitas La–Mi–La–Mi) en `platform/audio.js`. Solo suena si activaste el sonido.

## Decisiones
- La capa de la intro es `position:fixed`: ya no depende del scroll (antes, si abrías desde abajo, la tapa salía cortada).
- Las imágenes se precargan y **decodifican** al cargar la app; la intro espera hasta 260 ms a que la portada esté lista.
- Opacidad nunca va sobre el elemento con `preserve-3d` (eso aplana el 3D); se anima en la capa o el escenario.
- Movimiento reducido: sin capa, solo un fundido de 200 ms.
- Fuentes Cinzel y Cinzel Decorative (licencia OFL) solo se usan para pintar la portada; la app no las descarga.
- Diseño original: ninguna portada o símbolo de una obra conocida.

## Criterios de aceptación
1. Inicio → Aprender muestra la intro completa la primera vez y la corta después (verificado en 1440 y 390).
2. Clic o Esc la saltan y el grimorio queda visible; cambiar de ramo y volver al refugio no deja capas pegadas.
3. Con movimiento reducido no aparece la capa.
4. `smoke-test`, `room-test`, `update01-test` y `audio-test` pasan.

## Pendiente
- Tu opinión sobre la portada y el ritmo de la intro.
- `update01-e2e` falla igual que antes de este cambio (dato `events` nulo); no es de este update.
