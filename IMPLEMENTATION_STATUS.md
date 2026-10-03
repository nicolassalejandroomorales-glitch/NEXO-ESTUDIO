# Nexo StudyApp 1.0 — estado de implementación

Fecha: 2026-09-28. Base de trabajo: ZIP V14 original conservado en
`../NEXO_BACKUPS/nexo-estudio-v14-original-20260927.zip`.

## Completado y verificado

- Copia aislada V14 en este directorio; el Site público aún no se actualizó.
- Proyecto Supabase real `dcafrpmzpaosgmqyukjs` (`sa-east-1`, plan de creación confirmado a 0/mes).
- Proyecto Google Cloud `nexo-studyapp` creado sin organización para el OAuth de Nexo; no se activó facturación.
- Google Auth Platform configurado para prueba: app Nexo StudyApp, cuenta del propietario autorizada y permisos limitados a `openid`, correo y perfil. Cliente web creado para el origen del Site y callback exacto de Supabase.
- Supabase Auth: proveedor Google habilitado con el cliente y secreto almacenado en el panel privado; Site URL y redirect URL apuntan al dominio público de Nexo. El secreto no se escribió en el checkout ni en el frontend.
- Catorce migraciones comprobadas en el proyecto real el 29-09-2026; la última indexa la referencia de intentos a casos verificados. Las anteriores cubren tiempo activo, reservas de rango y validación numérica.
- 19 tablas privadas con RLS; permisos directos de `anon` y `authenticated` reducidos.
- Sincronización de sesiones corregida: el cliente no puede fabricar `source=server_timer` por RPC.
- Pruebas locales de base de datos, aislamiento A/B, cronómetro, recompensas y antifalsificación pasan.
- Regresión V14 completa tras el cambio a Google: pruebas de contenido, estado, seguridad, rendimiento y recorridos de navegador pasan. La prueba OAuth usa un proveedor simulado, no sustituye validación con Google real.
- Comprobación remota de permisos: sin lectura anónima de perfiles ni inserción directa de sesiones/economía.
- Google OAuth real completado en Brave con la cuenta de prueba del propietario. El retorno a Nexo local funcionó y el perfil mostró sincronización. El navegador integrado bloqueó el callback de Supabase, por lo que no se usa como prueba de compatibilidad OAuth.
- Corregida la inicialización de una cuenta nueva: se conservan y sincronizan las 12 fechas oficiales y los 11 documentos iniciales en vez de reemplazarlos por un conjunto vacío. Corregido el enrutamiento RPC de eventos; consulta remota confirmó 12 eventos, 11 documentos y 0 conflictos.
- Bitácora: prioridad explicable que considera fecha, peso, preparación, errores, prerrequisitos y carga del día; Home toma las tres prioridades del mismo estado. Meta diaria editable y persistente. Laboratorios con manual/referencia, pre-lab, checklist durante la sesión e informe, más fechas y estados separados; los vencimientos de pre-lab e informe influyen en la prioridad.
- `Material Nexo (2026)` cotejado en Drive: calendarización FQII 2S2026 sitúa Control 1 el **26/10**, frente al 20/10 comunicado anteriormente; la fecha semilla se corrigió y el calendario conserva una advertencia visible. La presentación de Analítica 2S2026 confirma teoría 60% + laboratorio 40%; el cálculo ahora separa ponderaciones internas y aporte al ramo, con pruebas unitarias/E2E. El archivo de Fisiopatología rotulado 2026-2 contiene encabezado interno 2024-II, por lo que sus fechas no se importan como confirmadas.
- Prueba real de cambio de meta diaria y restauración a 120 min; la fila remota de ajustes volvió a 120. `node tests/run-all.cjs` pasa íntegro, incluyendo pruebas E2E de Bitácora en móvil. Revisión visual detectó y corrigió el apilamiento de botones en el evento de laboratorio móvil.
- Fundamento del rework visual iniciado sobre V14: registro de habitaciones y cuatro temas de ramo, navegación de cinco áreas, Bitácora y Tienda globales, Juego como habitación sin Phaser, Home con prioridad inmediata y meta diaria, capas de ambiente y luz local interpolada sin RAF continuo. Capturas revisadas a 1366 y 390 px; contraste de tarjetas de Aprender corregido. Nuevas pruebas de temas, luz y rutas pasan.
- Piloto org-01: ocho conceptos relacionados, siete casos estructurados, diagnóstico del primer eslabón, Rescate y práctica por error/revisión/PEP; textos y dibujos libres no se califican automáticamente. Fuentes mapeadas a diapositivas específicas de Aminas y guía 1a (fecha interna 2021). Se revisó `Material Nexo (2026)` en Drive sin publicar sus archivos privados.
- Rangos con evidencia y tiempo académico servido; reservas únicas de recompensa y clave de corrección protegida por RPC. Pruebas locales/SQL y UI Lab/Review Center pasan.
- Audio opt-in con canales SFX, ambiente y música; eventos ambientales deterministas, habitaciones y perfiles gráficos. Carga diferida de bibliotecas pesadas y transición solo al cambiar de habitación.
- QA automatizada en 375/390/768/1440 px y landscape; chequeo básico de teclado, nombres, `alt`, landmarks y texto 200%. En simulación móvil lenta el LCP fluctúa cerca de 2,5 s y CLS es 0; no equivale a medición de producción.
- Los 25 módulos pequeños de arranque conservan archivos fuente separados, pero el build los sirve en un único bundle: de 29 solicitudes iniciales de JavaScript se pasó a cinco. La suite completa regenera el bundle y pasó; dos muestras móviles con movimiento reducido midieron LCP 2,14–2,30 s y CLS 0, una con movimiento normal 2,27 s. Aún falta medición real en el Site publicado.

## Pendiente; no declarar 1.0 terminada

- El usuario eligió Google como único acceso. El código V14 ya muestra solo Google y pasó un flujo OAuth simulado con migración de invitado y dos dispositivos.
- `http://127.0.0.1:8765` continúa autorizado temporalmente para pruebas locales; debe revisarse antes del lanzamiento público.
- El proveedor Email de Supabase sigue habilitado aunque Nexo solo ofrece Google. El intento de desactivarlo fue rechazado por revisión automática al tratarse de un cambio de acceso; se pidió autorización explícita al usuario y no se modificó la configuración.
- El asesor remoto de seguridad todavía informa 22 funciones `SECURITY DEFINER` ejecutables por cuentas autenticadas: son las RPC que utiliza el diseño de sincronización y economía, pero deben recibir una auditoría por función antes de declarar segura la publicación. También señala la tabla de claves académicas con RLS sin política (intencionalmente inaccesible a clientes) y protección de contraseñas filtradas no activada mientras Email siga habilitado.
- Falta comprobar migración invitado→cuenta, conflictos y dos usuarios/dispositivos reales en el proyecto remoto. Las pruebas A/B, RLS, offline y conflictos existen localmente, pero no sustituyen esa verificación.
- Completar auditoría de procedencia afirmación→fuente para las clases heredadas, QA visual/accesibilidad en dispositivos reales y rendimiento de campo; el LCP normal aún no tiene margen robusto bajo 2,5 s.
- `app.js` sigue concentrando pantallas heredadas; extracción por dominio y pruebas de regresión adicionales pendientes.
- El rig Rive solo incluye Idle y carece de anclas cosméticas definitivas; Canvas conserva el fallback. Falta ensayo visual de combinaciones y estados en dispositivo.
- Falta publicar en el Site original, comprobar su URL, OAuth, sync, assets, rutas, refresh y rollback. No hay actualización pública aún.

El archivo solo documenta el trabajo; no forma parte de la interfaz.

## UPDATE 01 — 2026-10-01: implementación local, aceptación visual pendiente

Se implementaron refugio continuo, superficies de evaluaciones/Tu día/continuación, shell de grimorio, ramo → evaluación → mapa, estados históricos y transiciones por sesión. Se reutilizaron arte, ambiente, prioridades, catálogo y destinos anteriores. No se publicó ni se modificaron datos, migraciones o servicios.

La suite npm test y las pruebas nuevas de proyección y DOM pasan. Chromium instalado termina con SIGTRAP antes de crear la página; por ello E2E, capturas nuevas, layout responsive/zoom, contraste y métricas de navegador no están aprobados. UPDATE 01 **no está cerrado**. Evidencia y criterios: docs/update-01/REPORT.md. Los documentos históricos anteriores describen otro momento y no sustituyen ese informe.
