# Pendientes de temas sin SPEC propio

Ideas o decisiones que aparecieron en un chat pero pertenecen a otro tema. Cada una debe pasar a su propio `docs/<tema>/SPEC.md` cuando se trabaje.

## Estilo visual "pixel art" para toda la app (propuesto por Niquito, 5 oct 2026)

Niquito dijo: "creo que el enfoque mejor que le daré será PIXEL ART". **Aún no es una decisión cerrada.** Merece su propio chat y SPEC
(`docs/estilo-pixel-art/SPEC.md`) porque toca todo: Inicio, grimorio, clases, juegos, tienda y mascotas.

Lo que hay que decidir antes de tocar nada:
- **Alcance**: ¿toda la app (fuentes, botones, paneles) o solo las escenas y los personajes?
- **El refugio**: `refugio-012.png` es una pintura y la regla dice que "nunca se modifica". Pixel art implica un refugio nuevo
  (o una versión pixelada) → **choca con esa regla; hay que preguntarle a Niquito**. Pixelar la pintura a la fuerza suele verse sucio:
  el pixel art de verdad usa pocos colores y "racimos" de píxeles puestos a propósito.
- **Mascotas**: hoy son SVG muy detallados (`dist/dev/alquimicos.js`). En pixel art serían *sprites* (por ejemplo 48×48) con animación
  cuadro a cuadro. El diseño (átomo, matraz, slime), las expresiones, los emotes, los cosméticos y las ranuras sirven igual: solo cambia el dibujo.
- **Resolución y paleta**: tamaño base de los sprites, paleta limitada y escalado sin suavizado (`image-rendering: pixelated`).
- Recomendación: hacer primero una **prueba de estilo** (una mascota en sprite + un rincón del refugio en pixel art) y decidir con imágenes.
