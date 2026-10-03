# UPDATE 01.6 — Páginas decoradas, cambio de página real y sonidos

Estado: **implementado; pendiente de tu aprobación (3 oct 2026)**.

## Qué
1. **Decoración por ramo** (`tools/grimoire-pages/build_decor.py` → `dist/assets/grimoire/decor/*.svg`), dibujada como tinta a mano:
   - Orgánica: benceno, piridina, naftaleno, silla de ciclohexano, cadenas, estereoquímica, flechas de mecanismo; ilustración de la anilina con su par libre.
   - Analítica: bureta, Erlenmeyer, matraz aforado, pipeta, curva de titulación, cromatograma, Ka, pH, Beer-Lambert; montaje de titulación.
   - Fisicoquímica: ΔG = ΔH − TΔS, ΔG° = −RT ln K, Arrhenius, diagrama de energía, isotermas, Jablonski, Michaelis–Menten, Maxwell–Boltzmann.
   - Fisiopatología: corazón con aorta, ECG, neurona con mielina, glóbulos rojos, arteria con placa, pulmones, célula, ADN.
   Cada página tiene un fondo tenue (más fuerte en los márgenes), una ilustración grande arriba a la derecha y una viñeta al pie de la izquierda.
2. **Cambio de página real** (`pageCurl` en `platform/animation.js`, 0,82 s): la hoja se arma con 7 tiras anidadas que se curvan,
   muestra su reverso (papel del ramo nuevo), proyecta sombra y aterriza sobre la otra página. Va hacia adelante o hacia atrás
   según el ramo o la profundidad. En móvil, una versión simple de 0,56 s.
3. **Sonidos sintetizados** (`tools/grimoire-audio/build_sounds.py` → `dist/assets/audio/`): apertura del grimorio (4,4 s, sigue el guion
   de la intro: colchón, 24 destellos de runas, campana de la gema, broche, soplo de la tapa, páginas, golpe y arpegio con reverberación)
   y papel para el cambio de página. Suenan solo con "Efectos de sonido" activado.

## Decisiones
- SVG en vez de imágenes: pesan 3–50 KB, se ven nítidos en cualquier pantalla y se regeneran con un script.
- `isolation:isolate` + `z-index:-1`: la decoración queda sobre el papel y bajo el texto.
- La hoja vieja usa la decoración y el color del ramo anterior; el reverso, la del ramo nuevo.
- Los sonidos se precargan con el primer gesto (si el sonido está activado) para que la apertura suene a tiempo.

## Criterios de aceptación
1. Cada ramo se reconoce por su decoración sin perder legibilidad.
2. Cambiar de ramo muestra una hoja que se curva y no deja capas pegadas (1440 y 390).
3. `smoke-test`, `room-test`, `update01-test` y `audio-test` pasan.

## Pendiente
- Tu opinión sobre el sonido (no lo puedo escuchar: lo verifiqué con espectrograma).
