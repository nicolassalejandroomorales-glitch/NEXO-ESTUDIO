# Compañero Rive — fuente, compilación y criterio de aceptación

`rive/companion-v2/scene.rml` es la fuente editable del primer personaje. `pig-idle.png`, `pig-read.png` y `pig-ready.png` son ilustraciones originales de poses completas; el libro y el báculo forman parte de sus poses, no son objetos pegados sobre la figura. El binario utilizado por la app está en `dist/assets/avatar/nexo-companion-v2.riv`.

La fuente se verificó con Rive CLI 1.2.0 y se capturó un fotograma. Para reconstruirla con una CLI oficial disponible:

```powershell
rive rive/companion-v2 --verify
rive rive/companion-v2 --screenshot --advance=30
Copy-Item -LiteralPath rive/companion-v2/build/nexo-companion-v2.riv -Destination dist/assets/avatar/nexo-companion-v2.riv
```

El runtime asigna `Idle` a Inicio/Perfil/Tienda, `Read` a Aprender y `Ready` a Entrenar. Las animaciones se detienen fuera de pantalla o con la pestaña oculta. La clase `data-pose` facilita comprobar qué pose se eligió. En el teléfono la mascota vive en la barra superior, sin tapar tarjetas ni formularios. Cuando hay accesorios equipados o movimiento reducido se conserva el renderizador Canvas.

Pendiente antes de declarar el sistema final: sustituir sprites completos por un rig con partes móviles (ojos, orejas, brazos, cuerpo y cola), implementar animaciones de pensamiento, error, celebración, sueño y transición entre estados; construir gato y perro con el mismo nivel; integrar objetos en anclas de mano/cara/cuerpo y probar cada especie×ranura×habitación en móvil y escritorio. La Rive v2 es un primer avance verificable, no el conjunto terminado.
