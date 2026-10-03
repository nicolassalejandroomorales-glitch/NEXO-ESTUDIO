# NEXO — UPDATE 01.3
## ART CHECKPOINT A1 — WINDOW ASSET DECOMPOSITION

El spike técnico confirmó que el hotspot funciona,
pero la separación automática de la ventana no alcanzó
la calidad visual requerida.

Ahora NO continúes programando.

Esta fase es exclusivamente de preparación y validación
de assets para la ventana.

==================================================
OBJETIVO
==================================================

Descomponer únicamente la zona de la ventana del fondo actual
en capas reutilizables sin degradar perceptiblemente
la ilustración original.

El PNG original es la referencia visual absoluta.

No rediseñar la ventana.
No reinterpretar la habitación.
No cambiar colores generales.
No corregir artísticamente otras zonas.

==================================================
FUENTE
==================================================

Usar como fuente exclusivamente el fondo exacto actualmente
aprobado para Inicio.

Resolución de referencia:
1672 × 941.

El original debe permanecer intacto.

Crear una copia de trabajo separada.

==================================================
ASSETS OBJETIVO
==================================================

Preparar, si visualmente corresponde:

1. home-room-clean.png

La misma habitación actual,
pero con la ventana intercambiable eliminada
y el espacio que queda detrás reconstruido de forma coherente.

2. window-default.png

La ventana actual aislada,
con transparencia real.

Debe conservar:
- forma;
- marco;
- textura;
- iluminación intrínseca;
- detalles del diseño aprobado.

3. window-foreground.png

Sólo si vegetación u otros elementos actualmente cruzan
por delante de la ventana y deben conservarse como
capa de oclusión independiente.

NO crear esta capa si no es necesaria.

4. window-light-mask.png

Opcional.
Crear sólo si tiene utilidad clara para el sistema día/noche.

==================================================
REGLAS DE CALIDAD
==================================================

No aceptar:

- bordes rojos/verdes;
- halos visibles;
- pérdida de detalle;
- marco deformado;
- blur innecesario;
- cambios de color notorios;
- diferencias evidentes frente al fondo aprobado;
- reconstrucción genérica de la ventana.

La composición:

home-room-clean
+
window-default
+
window-foreground (si aplica)

debe aproximarse visualmente al original con alta fidelidad.

==================================================
MÉTODO
==================================================

Preferir métodos no destructivos:

- máscaras;
- capas;
- selecciones refinadas;
- corrección de fringe/matting.

No sobrescribir el PNG original.

Si existe un formato de trabajo con capas
(PSD/XCF u otro), puede conservarse sólo como fuente artística.
La app seguirá utilizando assets web exportados.

==================================================
CLEAN PLATE
==================================================

La reconstrucción del área detrás de la ventana
sólo debe afectar la región estrictamente necesaria.

NO regenerar ni reinterpretar el resto de la habitación.

Si no existe información real de lo que habría detrás,
reconstruir una continuación visual plausible y discreta
de pared/arquitectura existente.

Si la herramienta disponible no puede conseguir
calidad suficiente:
DETENERSE antes de integrar assets deficientes.

==================================================
VALIDACIÓN
==================================================

Generar como mínimo:

A. ORIGINAL
fondo intacto.

B. MODULAR COMPOSITE
clean + window + foreground.

C. WINDOW HIDDEN
clean sin ventana.

D. WINDOW ISOLATED
window-default sobre fondo transparente/checkerboard.

E. EDGE DETAIL
zoom de bordes críticos de la ventana.

F. BEFORE / AFTER
comparación lado a lado o superposición.

Revisar al menos:
- escala 100%;
- desktop;
- bordes;
- vegetación;
- marco;
- sombras.

==================================================
IMPORTANTE
==================================================

NO integrar todavía estos assets al runtime.

NO modificar scene manifest.

NO continuar con biblioteca, silla o alfombra.

NO publicar.

Este checkpoint sólo responde:

“¿Tenemos assets de calidad suficiente
para hacer modular la ventana?”

==================================================
ENTREGA
==================================================

Al terminar, detenerse y entregar:

- assets producidos;
- galería comparativa;
- explicación del método;
- problemas encontrados;
- cualquier diferencia visual restante;
- recomendación APPROVE / NEEDS ART REVISION.

Esperar aprobación antes de código.
