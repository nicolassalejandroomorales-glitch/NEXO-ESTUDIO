# Arte requerido para una ventana realmente sustituible

En este checkpoint no se generó ni separó destructivamente arte. El PNG exacto del fondo conserva 1672 × 941 y los mismos píxeles del WebP aprobado de 01.2.

| Asset futuro propuesto | Contenido necesario | Estado |
|---|---|---|
| `refugio-012-clean.png` | Base de 1672 × 941, sin ventana horneada, con pared/marco arquitectónico y luz residual resueltos coherentemente. Mantener el resto del arte. Si se quiere mover también la fuente de luz, retirar o desacoplar reflejos/sombras pintados dependientes de ella. | Falta; no sustituye el fondo en este checkpoint. |
| `window-012.png` | Ventana actual aislada con transparencia real, incluyendo marco, vidrio y sombras propias. Recorte alineado al slot; aproximadamente 393 × 376 para bounds actuales, ajustando el manifiesto al recorte exacto aprobado. Sin vegetación o mobiliario que deban quedar delante. | Falta. |
| `window-012-foreground.png` | Vegetación/mobiliario que se cruza delante de la ventana, transparencia real y mismo origen/recorte que el objeto. Se compone en la capa frontal, separada de la imagen de ventana. | Falta; determinar con arte aprobado si es necesaria una o varias capas. |

Los nombres son propuestas de entrega; no son archivos existentes ni URLs cargadas por la app. Las referencias de assets modulares permanecen `null`.

Una alternativa sería un patch limpio y una máscara cuidadosamente aprobados. No se creó ese patch: una región rectangular oscura o un recorte del mismo fondo no servirían como sustitución real.

## Cómo se integraría después

1. Revisar/aprobar base limpia y PNG transparente en conjunto antes de utilizarlos.
2. En el perfil central, establecer `cleanPlateAsset`, `slots[0].asset` y, si corresponde, `foregroundAsset`.
3. Cambiar `renderMode` a `modular` y `replacementReady` a `true`. El renderer requiere base limpia y objeto; si falta la base, no dibuja una ventana alternativa encima de la horneada.
4. Ajustar bounds al recorte aprobado; comprobar desktop/móvil, sombras, vegetación y continuidad del fondo.
5. Una segunda ventana reutiliza la geometría/acción del slot con otro PNG compatible. Otro fondo requiere otro perfil, sus medidas, slots y anchors, sin modificar el manejador de interacción.

No se declara que mover el hotspot o variar el tono mueva o reemplace los píxeles del objeto actual.
