# Preparación geométrica de Inicio — UPDATE 01.2

Fuente: `NexoRooms.homeScene`, arte existente `assets/home-mascot-refuge.webp`, 1672 × 941. Los bounds se expresan como `[x, y, ancho, alto]` normalizados al plano del arte, no al viewport. El plano conserva su proporción y puede recortarse en móvil; las zonas se mueven con él. Los elementos de referencia son invisibles, sin foco ni eventos.

| Zona | Bounds | Uso actual |
|---|---|---|
| `window-area` | `[.045,.08,.235,.40]` | Referencia reservada de ventana. |
| `bookshelf-area` | `[.34,.075,.40,.49]` | Referencia reservada de biblioteca. |
| `desk-area` | `[.025,.46,.345,.18]` | Escritorio; aloja la mascota actual. |
| `rest-area` | `[.76,.42,.225,.33]` | Referencia reservada de descanso. |

Asiento actual: x `.205`, y `.55`, ancho `.12`, apoyo vertical `.89` de la caja del renderer. En móvil se amplía el ancho 15%, manteniendo el punto de apoyo. El arte, identidad, accesorios y renderer permanecen intactos.

Las capas semánticas preexistentes siguen en el contrato. La composición CSS usa su propio contexto aislado: arte, tono, luz, mascota y texto. Las capas semánticas no deben interpretarse como z-index absolutos entre habitaciones.

No hay navegación, selector de mascota, máquina de estados, recorridos, colisiones ni comportamientos nuevos. Estos bounds son regiones visuales aproximadas: una futura mascota necesitará definir superficies, oclusiones y límites por viewport antes de recorrerlas.

Horario: se reutiliza `NexoAmbientTime`; ventana e interior reciben tonos de mañana, día, atardecer y noche. No existe clima real ni lámina nocturna alternativa. Movimiento reducido desactiva ambiente/apertura con la lógica existente.
