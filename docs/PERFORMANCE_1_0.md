# Rendimiento 1.0

## Presupuesto y medición

`node tools/perf-audit.cjs` enumera scripts y bytes iniciales; `node tools/web-vitals-test.cjs` mide una primera visita local a Home en viewport móvil 390×844, CPU 4× más lenta, 2 Mbps y 100 ms de latencia. El servidor de prueba entrega texto comprimido con gzip. Antes de agrupar módulos, una corrida con movimiento reducido dio LCP 2832 ms y otra 2360 ms: el arranque no tenía margen consistente. Tras agrupar, dos corridas reducidas dieron LCP 2304 y 2140 ms, CLS 0, ~212 KB transferidos; una corrida con movimiento normal dio LCP 2268 ms, CLS 0, ~312 KB. Es una muestra sintética pequeña, no una garantía de percentil 75 ni una medición de producción. Debe contrastarse tras desplegar y medir INP real.

El núcleo inicial todavía pesa ~460 KB de JavaScript sin comprimir y ~118 KB de CSS sin comprimir. Se mantienen los 25 módulos fuente pero `tools/build.cjs` los empaqueta en `startup-bundle.js`: el navegador pide cinco scripts iniciales en vez de 29, conservando el orden de ejecución. La prueba total regenera el bundle antes de ejecutarse. Se retiró el preload fijo de la imagen del cerdito, que podía competir con el recurso crítico aun cuando la especie elegida fuera otra.

## Qué se carga solo al necesitarlo

- Phaser se importa únicamente al entrar a un juego real; el hub de Juegos no lo carga.
- Howler y los WAV generados localmente esperan un gesto y ajustes de audio activos.
- Rive se carga cuando la mascota usa una escena compatible; si el rig no tiene anclas cosméticas, se usa Canvas.
- Ketcher, RDKit y PDF.js se abren desde sus superficies académicas; no forman parte del coste inicial de Home.
- Los archivos de contenido completo de Orgánica se cargan al abrir su lección; el catálogo inicial usa un manifiesto ligero.

`platform/performance.js` aplica perfiles gráficos y reduce partículas/animaciones con preferencia de movimiento reducido. La luz horaria no usa un bucle RAF; se actualiza periódicamente y al volver a la pestaña. Audio, ambiente y juego paran o liberan recursos al ocultar o abandonar su habitación.

## Pruebas y trabajo pendiente

`tools/game-test.cjs`, `audio-test.cjs`, `ambient-event-test.cjs`, `room-test.cjs`, `e2e-test.cjs` y `web-vitals-test.cjs` cubren carga diferida y navegación. Falta una medición de campo en la URL publicada, una muestra real de INP y una auditoría sostenida de memoria en una sesión larga. No se debe convertir una sola corrida sintética en una afirmación de rendimiento universal.
