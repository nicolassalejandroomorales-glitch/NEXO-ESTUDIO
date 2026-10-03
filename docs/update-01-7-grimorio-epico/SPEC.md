# UPDATE 01.7 — Páginas llenas, sonido suave e intro épica

Estado: **implementado; pendiente de tu aprobación (3 oct 2026)**.

## Qué
1. **Páginas llenas de dibujos** (`tools/grimoire-pages/build_decor.py`):
   - Fondo más denso (30 motivos por bloque + "polvo" de estrellitas) con motivos nuevos:
     Orgánica (pirrol, Newman, ácido carboxílico, resonancia, carbono tetraédrico, enolato),
     Analítica (embudo de decantación, tubos de ensayo, balanza, cubeta con haz, campana de Gauss),
     Fisicoquímica (pistón con gas, termómetro, ciclo de Carnot, diagrama de fases, Langmuir, fotón hν, partícula en una caja, S = k ln W, Fick),
     Fisiopatología (estetoscopio, cápsula, jeringa, bacteria, virus, alvéolos, riñón, leucocito).
   - Volutas de hiedra en las 4 esquinas de cada página con el símbolo del ramo.
   - Escena grande al pie de la página derecha (balón con moléculas que suben, mesa de laboratorio, pistón con llama, corazón con estetoscopio y ECG).
   - El índice tiene sus propios dibujos (libro abierto con símbolos de los 4 ramos).
2. **Sonido suave** (`tools/grimoire-audio/build_sounds.py` v2): sin clics ni ruidos ásperos, ataques lentos, filtro de agudos,
   reverberación más larga y oscura, volumen más bajo. Nuevo guion sincronizado con la intro de 3,4 s. Página: un "fsss" suave.
3. **Intro épica, una sola vez por sesión** (`platform/animation.js`, 3,4 s): oscuridad → círculo mágico de runas que gira →
   motas de luz que suben → el libro flota → runas que se encienden → la gema destella → se suelta el broche → la tapa se abre →
   luz desde las páginas, rayos dorados, estallido de chispas y un sello mágico que se "escribe" en la página → la cámara entra al libro.
   Después, entrar o salir del grimorio es solo un fundido suave (ya no se repite la tapa).

## Decisiones
- La opacidad de cada dibujo viene dentro del SVG: así una sola capa CSS apila esquinas, fondo e ilustraciones.
- "Una vez por sesión" = por pestaña (`sessionStorage`): si cierras la pestaña y abres otra, vuelve a aparecer.
- Movimiento reducido: sin intro (fundido de 200 ms). Calidad baja: menos motas y chispas.

## Criterios de aceptación
1. Páginas llenas sin perder legibilidad (1440 y 390).
2. La intro aparece la primera vez; volver al refugio y entrar de nuevo no la repite.
3. Pruebas rápidas pasan.
