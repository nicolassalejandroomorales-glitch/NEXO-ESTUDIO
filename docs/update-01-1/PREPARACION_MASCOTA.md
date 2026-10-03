# Preparación de escenario para la futura mascota

## Infraestructura existente conservada

- `dist/mascot/controller.js`: plan de intención por habitación, contexto y equipo; no concede recompensas.
- `dist/avatar/contracts.js`: ranuras, anclas corporales, compatibilidad y capacidades del rig. Las anclas corporales no se confunden con posiciones del escenario.
- `dist/avatar/catalog.js`, `vector-art.js`, `experience.js` y `dist/mascot-rive.js`: catálogo, composición, renderer, fallback y lifecycle actuales.
- `dist/assets/avatar/`: bases de cerdito/gato/perro, skins, poses del cerdito y archivos `mascots.riv`/`nexo-companion-v2.riv`.
- `rive/mascots/`, `rive/companion-v2/`, documentación de contrato, sistema y pipeline. Todo permanece por hash.

## Contrato mínimo añadido

`NexoRooms.homeScene.layers` declara orden de fondo (-2), escena (-1), posible mascota detrás (0), mascota (1), posible primer plano (2) y superficies interactivas (3).

| Superficie | Referencia | Estado |
|---|---|---|
| Ventana | `.refuge-perch`, `data-scene-anchor="window"` | La mascota actual permanece aquí, colocada por grid y escala responsive. |
| Escritorio | `.day-paper` | Reservada e inactiva; el papel limita el primer plano de la mascota actual. |
| Estantería | `.continue-volume` | Referencia reservada e inactiva. No equivale todavía a una estantería transitable. |
| Descanso | `.refuge-perch` | Referencia reservada e inactiva; necesita una superficie distinta en la siguiente fase si se activa. |

La escala usa `--refuge-companion-size`; el apoyo se deriva del tamaño del personaje y del espaciado entre superficies. No hay coordenadas absolutas de pantalla para ubicar la mascota. La iluminación queda detrás de los textos. Las capas decorativas no reciben clics.

## Lo que no existe todavía

No se añadieron selector, nuevas mascotas visibles, accesorios activos, evolución, caminata, rutas de movimiento, estados complejos ni una máquina de estados nueva. No se inventó un renderer futuro. Los rigs y sus limitaciones actuales siguen siendo los mismos.

Las referencias reservadas no tienen orientación ni límites transitables certificados. No se añadió un resolver de coordenadas o navegación porque todavía no hay una conducta autorizada que lo necesite. El próximo trabajo deberá definir zonas reales del arte, medir sus rectángulos tras responsive, comprobar oclusiones y resolver las anclas del rig antes de activar comportamiento.

No hubo nuevos assets ni nuevas dependencias. La nueva lámina molecular de Aprender ya existía en el proyecto y sólo se solicita al entrar al grimorio; no es un recurso de mascota futura.
