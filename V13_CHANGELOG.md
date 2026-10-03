# V13 — Avatar & Game Foundation · cambios

## Base V12 corregida

- `migrations/202609250004_v13_hardening.sql`: borrado sincronizable de calendario mediante `deleted_at` conservando `event_date`, índices delta, watermark UTC del servidor, resolución de conflictos mediante RPC restringida a su propietario y esquema cloud 13.
- `dist/cloud/foundation.js`: bootstrap limitado de historial reciente, cursor por cuenta y consultas delta paginadas; evita volver a recorrer el historial completo en sync normales. Añade lectura de historial paginada para futuras vistas. Conserva shadow/caché V12, reintenta con outbox, resuelve conflictos también en cloud, restaura conflicto local si falla el servidor y evalúa consentimiento tras logout.
- `dist/app.js`: claim de invitado ligado a identidad destino, sin claim automático al entrar con otra cuenta; recompensa de desafío de cuenta deshabilitada y guardada ante invocación de UI; copias antes de migración local y normalización del modelo nuevo.
- `dist/core/storage.js`, `dist/core/migrations.js`: `nexo-study-beta-pre-v13` inmutable; esquema local 18, ajustes de audio y versión de migración 13. Los IDs y datos previos permanecen.

## Avatar, tienda y personalización

- `dist/avatar/catalog.js`: catálogo único por ID estable, siete ranuras (cabeza, cara, ropa, espalda, cola, aura, fondo), especie y compatibilidad; preview puro, equipamiento por ranura y modelo normalizado.
- `migrations/202609250005_v13_avatar_catalog.sql`: atributos de cosméticos, rarezas, ventanas de disponibilidad para extensibilidad; trigger valida posesión, ranura y especie al guardar documento de avatar, incluido acceso directo a la tabla. Se mantienen IDs históricos.
- `dist/avatar/experience.js`: tienda con categorías, ownership, rareza, preview sin guardar, compra, equipar/desequipar; editor en Perfil con estado vacío útil. El pago cloud espera confirmación del RPC atómico anterior; invitado usa economía local.
- `dist/avatar/vector-art.js`, `dist/mascot-rive.js`, `dist/avatar/contracts.js`: cosméticos superpuestos dinámicamente en mascota Rive o Canvas; contratos de estados/anclas; caché de imágenes y liberación de overlays al desmontar. Los rigs aún no disponen de attachments animados.
- Nombres y arte de 13 cosméticos inspirados en franquicias sustituidos por motivos propios de Nexo con los mismos IDs. Se eliminaron 62 skins y un dragón base sin ruta activa (~1,85 MB); se retiró `dist/item-art.js` y CSS de tienda anterior. `ASSET_MANIFEST.md` inventaría lo vigente.
- `dist/styles.css`: tienda y editor móvil con escena, profundidad, filtros, rarity, estados y controles accesibles; sin tercera hoja de estilo.

## Plataforma de juego y privacidad

- `dist/platform/animation.js`: presets GSAP `fadeIn`, `slideIn`, `scalePop`, `rewardPop`, `equipPulse`, `modalEnter`, `modalExit`, respetando reducción de movimiento.
- `dist/platform/audio.js`: Howler bajo interacción, sprite WAV pequeño para click/confirm/purchase/equip/error; on/off, volumen SFX separado de música futura; sin reproducción automática.
- `dist/game/manager.js`: registro, carga diferida, pausa, reanudación y destrucción de escena Phaser. Escena técnica oculta bajo `?nexoDev`; Phaser ausente de Inicio, Perfil, Tienda y clase normal.
- Analytics PostHog conservado tras consentimiento, reinicia identidad y opt-out al cerrar sesión según preferencias de invitado. Sin secretos ni texto académico en eventos.

## Pruebas y entregables

- `tools/avatar-test.cjs`, `tools/game-test.cjs`, pruebas de delta, claim, tombstones A→B, avatar multirranura/multidispositivo y seguridad en `tools/cloud-test.cjs`, `tools/cloud-e2e.cjs`, `tools/database-test.cjs`.
- README, manifiesto, auditoría, migraciones reproducibles y exportación ZIP completa. Dependencias conservadas en versiones fijas del lockfile; `package.json` pasa a 13.0.0.
