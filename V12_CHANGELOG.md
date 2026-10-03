# V12 — Cloud Foundation · Registro de cambios

Base: V11 estable, commit `4684c1ea164faafa6c11d134828fd8933a957150`. Copia restaurable íntegra: `nexo-estudio-v11-restorable.zip` (entregada por separado). El Site publicado permanece en V11 mientras falten credenciales públicas y pruebas contra un Supabase real.

## Añadido

- Cuenta por correo y contraseña, sesión persistente, salida, recuperación y cambio de contraseña. Google OAuth queda conmutado y requiere configuración externa.
- Modo invitado intacto; migración local V11 → esquema 17/V12 con copia literal `nexo-study-beta-pre-v12` y migración de datos académicos a la cuenta por entidades e IDs estables.
- Capa `dist/cloud/foundation.js`: caché por cuenta, cola persistente de escrituras, lectura paginada, comparación de revisiones, conflicto conservado y resolución manual; ninguna vista llama directamente a tablas Supabase.
- Migraciones PostgreSQL versionadas en `migrations/` y copias para CLI en `supabase/migrations/`: perfiles, sesiones, progreso, ejercicios, eventos, notas por ramo, errores, documentos del usuario, metadatos, conflictos, catálogo de cosméticos, inventario, ledger de moneda y cronómetros del servidor.
- RLS de datos privados por `auth.uid()`; funciones protegidas para compra atómica, recompensa única de sesión, archivo de economía heredada, migración y eliminación de cuenta.
- Ajustes de cuenta, estado discreto de sync, privacidad, exportación de conflictos y consentimiento analytics. Importación de JSON en cuenta restringida a datos académicos.
- PostHog opcional, sin autocaptura ni grabación de sesión, con eventos permitidos y propiedades filtradas, más preparación de feature flags.
- Pruebas de PostgreSQL/RLS reales en PGlite y E2E de navegador con protocolo Supabase simulado. Se mantienen todas las pruebas V11.

## Modificado

- `dist/app.js` conecta UI con servicios de cuenta y limita moneda/inventario de usuarios con cuenta a la autoridad del servidor. Los premios académicos que no pueden verificarse en servidor quedan pausados para cuentas; siguen en el modo invitado.
- `dist/core/storage.js`, `dist/core/migrations.js`: respaldo adicional y marcador V12 sin borrar los respaldos anteriores.
- `dist/index.html`, `dist/styles.css`: carga del servicio cloud y ajustes compactos de cuenta; se conserva el diseño V11.
- `tools/build.cjs`, `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`: Supabase JS y PostHog locales, configuración pública generada, `npm run dev`, tests, CLI prepare.
- `.env.example`, `.gitignore`, `supabase/config.toml`, `tools/prepare-supabase.cjs`: configuración reproducible sin secretos reales.

## No incluido

Learning Engine, contenidos nuevos, juegos, gacha, pagos, Google Drive/Calendar, rediseño de avatar ni cambios de Rive/GSAP/Howler/Phaser. La conexión a un Supabase/PostHog real y la publicación V12 siguen pendientes de configuración externa.
