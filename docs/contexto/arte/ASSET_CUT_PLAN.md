# ASSET CUT PLAN — A1.1

Fuente única: `FONDO_INICIO_EXACTO.png`, 1672 × 941, SHA-256 `2239bf1540e692c081f94e885cbda27a3dea058e5e1d924bcdb5ea30d4502c8d`. Original intacto. Esta entrega contiene anotaciones, no masks ni nuevos candidatos de ventana.

**¿Sabemos exactamente cómo dividir la ilustración? Parcialmente. La división definitiva depende de D1–D6 y del refinamiento artístico D7.**

## 1. Bounding box

Envolvente conservadora de inspección: **x=40, y=35, width=310, height=390**, esquina final exclusiva `(350,425)`. Origen superior izquierdo; unidades en píxeles de la fuente.

No es un bbox final de extracción: la moldura externa y la geometría oculta impiden fijarlo con certeza. No se heredan los límites de los masks anteriores. Los marcadores indican puntos observados, no delimitan cada hoja ni constituyen un alpha matte.

## 2. WINDOW — B

Montante vertical **B1**, travesaños **B2** y madera visible del marco interior **B3**. Mantener RGB, textura, forma y escala originales. El perímetro externo queda pendiente en D2; el contenido de los paños en D1.

## 3. FOREGROUND — C

Oclusión visible de hojas/tallos izquierdos **C1**, vegetación superior **C2**, hiedra derecha **C3**, macetas/hojas inferiores **C4** y accesorios que pasan delante **C5**. Libros, macetas y farol del cuarto no pertenecen al marco reemplazable. Separar sólo las oclusiones necesarias, sin modularizar esos otros objetos.

C identifica profundidad visible. No decide que toda hiedra deba viajar con la ventana: esa pertenencia se resuelve en D3. Los árboles del exterior no son plantas interiores del foreground.

## 4. BASE — A

Pared visible **A1**, superficie fija de mesa/repisa y su frente **A2**, arquitectura del cuarto y todo lo ajeno a la ventana. Deben seguir existiendo si se retira el objeto. No confundir el travesaño inferior con el alféizar o la superficie de apoyo.

## 5. Reconstrucción del clean plate

Sólo la superficie expuesta al retirar WINDOW, hasta el límite aprobado en D2/D4. Continuación discreta de pared/arquitectura: no regenerar la habitación. Mantener vegetación y accesorios que se asignen al cuarto. Bajo hojas opacas, el PNG no contiene el marco completo ni la pared oculta: distinguir reconstrucción inferida de píxeles recuperados.

## 6. Decisiones pendientes

| ID | Decisión humana/artística necesaria |
|---|---|
| D1 | ¿Cielo/paisaje se incluyen en cada ventana o quedan como vista independiente detrás del marco? |
| D2 | ¿La moldura exterior del arco se reemplaza con la ventana o permanece como arquitectura fija? Marcar su frontera. |
| D3 | Por grupo de vegetación: ¿permanece en el cuarto o forma parte del diseño de ventana? Ser frontal no resuelve su pertenencia. |
| D4 | ¿Qué parte del alféizar/unión inferior pertenece al marco y cuál al apoyo arquitectónico? |
| D5 | ¿Al retirar/mover la ventana se conserva la luz solar pintada o debe desaparecer/desacoplarse? No se crea una máscara de luz ahora. |
| D6 | ¿Se completa el marco oculto por plantas para permitir movimiento/cambio de oclusión? No existe arte extraíble de esas zonas. |
| D7 | Borde mixto hoja/fondo: requiere matte y descontaminación artística. No es una asignación binaria segura por color. |

## 7. Método recomendado por zona

| Zona | Método, después de resolver decisiones |
|---|---|
| Marco/montantes/travesaños visibles | Selección por contorno y máscara refinada; preservar textura y RGB originales. |
| Vidrio/paisaje | Selección por paños conforme a D1; distinguir árboles exteriores de hojas frontales. |
| Vegetación/oclusiones | Foreground separado, selección de hojas/tallos, alpha refinado y matting. Revisar contra fondos claro/oscuro/checkerboard. |
| Pared expuesta al retirar ventana | Pintura/clonado local; reconstrucción sólo donde no exista información real y según D2/D4. |
| Accesorios/repisa | Máscaras de oclusión; dejar la superficie fija en BASE. No incluir objetos del cuarto en WINDOW. |
| Sombra propia / proyección solar | Distinguirlas por revisión artística; D5 antes de pintar, separar o crear una máscara. |
| Marco oculto | Reconstrucción localizada, sólo si D6 la autoriza; no inventar detalles como si estuvieran recuperados. |

`OWNERSHIP_OVERLAY.png` conserva el canvas de la fuente; `EDGE_MAP.png` reúne ocho acercamientos. En `detalles/` están las ampliaciones individuales al 300%, sin suavizado adicional. Son diagnósticos de propiedad, no límites aprobados de recorte.

**Detenido. No se extrajeron nuevos assets, no se modificó el scene manifest/runtime y no se publicó.**
