# Auditoría V11 — Nexo Estudio

## Alcance y respaldo

Se verificó que el checkout era el mismo proyecto publicado en Sites (`appgprj_6aa32fa413708191a684737411d7d59e`), versión de despliegue 19, commit `d696a775d6cdd9924ee2b680b42a80a227896013`, antes de editar. Se generó `../nexo-estudio-v11-backup-v19.zip`, copia íntegra de los 164 archivos fuente versionados. La migración del navegador conserva además el JSON previo una vez en `nexo-study-beta-pre-v11`.

## Estado inicial y resultados medidos

| Indicador de entrada HTML | Antes | V11 local | Interpretación |
| --- | ---: | ---: | --- |
| Scripts iniciales | 12 | 15 | Aumentan las fronteras modulares pequeñas. |
| JS inicial sin comprimir | 979.917 B | ~346 kB | Reducción aproximada del 65%; los módulos químicos pesados se difieren. |
| Hojas iniciales | 3 | 1 | Estilos de aulas especializadas se solicitan al abrirlas. |
| CSS inicial sin comprimir | 121.180 B | ~79 kB | Reducción aproximada del 34%. |
| Calendario raster | 1.610.898 B PNG | 873.402 B WebP | Misma composición; carga más pequeña. |

Las cifras son tamaños de archivos referidos por `dist/index.html`, no una medición de red, compresión HTTP, pintura ni Core Web Vitals. `node tools/perf-audit.cjs` reproduce la medición y rechaza dependencias pesadas en la entrada. El Rive de Inicio se solicita después de renderizar, por lo que puede afectar la carga posterior de esa pantalla. No se presenta como mejora de FPS sin una medición comparativa.

## Integridad funcional

- Catálogo base: 40 clases, 156 ejercicios y 66 skins activas comprobadas. Aula ampliada: 18 clases de Orgánica y estructuras validadas por su prueba de contenido. Estos conteos no se suman sin verificar solapamientos de catálogo.
- La migración deja los datos académicos, monetarios y de inventario intactos; elimina únicamente estado de vidas/duelo de la copia activa. El guardado crudo previo queda recuperable.
- `org-01`: progreso antiguo no produce falso dominio. Primer intento → `inestable`; revisión en día posterior + variante + transferencia + seis criterios autoverificados sin pistas → `dominado`. La app no puede verificar por sí sola si el dibujo en el cuaderno es químicamente correcto; no lo presenta como corrección automática.
- La economía del cronómetro conserva hitos existentes y bloquea recompensa repetida de una misma respuesta correcta. El registro externo de minutos no entrega puntos sin cronometraje.
- El test E2E abrió Inicio, Ramos, Orgánica 01/02 (con estructura renderizada por RDKit), cronómetro, calendario, ponderaciones, tienda y perfil; guardó evento y nota; refrescó y verificó persistencia; probó escritorio, tablet y 390 px sin desbordamiento horizontal. La prueba específica de perfil cubrió teoría, laboratorio e inasistencias.
- Modal probado con teclado; Escape cierra y Tab queda dentro. Las preferencias de sonido, volumen y reducción de movimiento se guardan.
- GSAP y Howler se inicializaron bajo demanda; Phaser se cargó únicamente con un registro de prueba en el navegador de test, que no forma parte de la app entregada. No hubo errores de página en el recorrido automatizado.

## Arquitectura y migraciones

La única frontera directa de `localStorage` está en `dist/core/storage.js`; `app.js` orquesta el estado aún monolítico. `dist/core/migrations.js` transforma explícitamente el esquema antiguo y deja correr las migraciones académicas previas del normalizador antes de fijar versión 16. `dist/study/economy.js`, `dist/platform/`, `dist/game/` y `dist/avatar/contracts.js` desacoplan responsabilidades sin cambiar el catálogo fuente.

Las claves `nexo-study-beta`, `nexo-study-beta-backup` y `nexo-study-beta-pre-v11` siguen en el navegador. V11 no borra todo `localStorage`. El respaldo pre-V11 conserva incluso las propiedades de corazones retiradas del estado activo para una restauración manual si fuese necesaria.

## Pruebas ejecutadas

- `node tools/build.cjs` — dependencias y manifiesto orgánico generados.
- `node smoke-test.cjs` — integridad de catálogo/rutas/recursos.
- `node tools/state-test.cjs` — migración, datos, backup, debounce y fallo de escritura.
- `node tools/amine-lesson-test.cjs` — flujo completo de dominio, fecha, pista y falso dominio heredado.
- `node tools/organic-content-test.cjs` — 18 clases y estructuras.
- `node tools/e2e-test.cjs` — navegación, persistencia, responsive, modal, bibliotecas diferidas.
- `node tools/profile-test.cjs` — notas e inasistencias, escritorio/móvil.
- `node tools/perf-audit.cjs` — tamaño de entrada y ausencia de paquetes pesados al inicio.

Se utiliza Playwright 1.63.0 en Edge headless disponible en el equipo. Cada E2E inicia su propio servidor temporal. El código y lockfile están incluidos para repetirlas en otro entorno.

## Límites y deuda restante

1. `dist/app.js` conserva unas 1.900 líneas y parte de las migraciones académicas históricas; la extracción fue intencionalmente gradual para evitar una regresión masiva. La separación completa de router, calendario, notas y tienda queda pendiente.
2. `dist/styles.css` bajó de tamaño y se eliminaron capas muertas evidentes, pero aún combina reglas estructurales antiguas con overrides del tema actual. No se declara una limpieza CSS total; una consolidación adicional debe verificarse visualmente pantalla por pantalla.
3. El dominio de Aminas es autoverificado con pauta y criterios; no hay evaluación automática de dibujos ni IA docente dentro del Site.
4. No se han auditado visualmente **todas** las variantes de mascot/skin ni todas las 40 clases base en cada breakpoint. La batería cubre rutas críticas y contenido Orgánica; faltan regresiones visuales sistemáticas de todas las pantallas.
5. `localStorage` puede agotarse o borrarse por políticas del navegador. No hay cloud ni recuperación entre dispositivos; exportar JSON sigue siendo necesario.
6. Phaser queda aislado y probado bajo demanda, pero no existe juego alguno. Los estados/anclas Rive futuros son contrato, no artboards implementados. Algunas skins legadas se mantienen por compatibilidad, aunque no figuren en el catálogo visible.
7. La fuente/calendario visual y la estética game deben seguir revisándose para evitar similitud excesiva con marcas o assets de terceros; V11 no certifica derechos de ningún asset previo.

## Preparación posterior

**V12:** frontera de almacenamiento intercambiable, esquema 16 y migración explícita facilitan un adaptador remoto, autenticación y eventos analíticos con consentimiento. Supabase, PostHog y sincronización no están conectados.

**V13:** contrato de slots/anclas/estados, cargador de Phaser, gestor de animación GSAP y audio Howler están separados. Faltan la composición simultánea de cosméticos, assets compatibles, nuevos riggings Rive, juegos y rediseño de tienda.
