# V11 — Clean + Visual Foundation

Base: Site publicado v19, commit `d696a775d6cdd9924ee2b680b42a80a227896013`. Producto resultante: V11; la numeración de producto no reemplaza la numeración de despliegues de Sites.

## Eliminado

- HUD, reglas, mensajes, recompensas y CSS de corazones; ya no condicionan acceso a clases.
- Duelo de conceptos y su UI, estado, listeners, recompensas y CSS. No se creó sustituto.
- CSS de una generación botánica inactiva confirmado sin referencias activas, más reglas claras antiguas de navegación/sidebar reemplazadas por la barra oscura actual.
- PNG del calendario sustituido por WebP. El archivo anterior permanece en el respaldo y Git.

## Modificado

- Entrada más liviana: catálogo orgánico ligero y carga diferida de clases, Studio, Rive y herramientas químicas. GSAP, Howler y Phaser quedan fuera del inicio.
- `app.js` conserva la UI y rutas, pero delega persistencia, migración, tramos de recompensa, carga, animación, audio, juegos y contrato de cosméticos a módulos pequeños.
- Guardado con agrupación de cambios de texto, vaciado al ocultar/cerrar y copia previa de datos al migrar.
- Tokens visuales oscuros, contraste de ponderaciones, calendario optimizado, foco de modales y control de movimiento.
- Orgánica `org-01`: primer intento inestable, recuperación otro día, variante y transferencia con tres criterios por caso; sincroniza `organicProgress` y `mastery` al alcanzar dominio autoverificado.
- Registro externo/manual de sesiones sin átomos para evitar declarar minutos arbitrarios como tiempo medido.
- Build reproducible con dependencias de versión fija y pruebas automatizadas de estado, contenido, UI, persistencia y carga diferida.

## Conservado

Clases y preguntas previas, recursos químicos, notas, inasistencias, calendario, ponderaciones, sesiones, átomos, inventario, previews de tienda, mascotas y Rive. Los archivos del dragón heredado se mantienen por compatibilidad con posibles datos de usuario.

## No añadido

Supabase, PostHog, OAuth, Google Drive/Calendar, cloud sync, juegos, gacha, clases masivas nuevas ni reconstrucción completa de la tienda. El contrato de slots/anclas es preparación para V13, no una función visible terminada.
