# V14_AUDIT — Academic Intelligence Foundation

**Fecha:** 26-09-2026. Base V13 restaurable: `../nexo-estudio-v13-pre-v14.zip`; SHA-256 `bf359b5da294a67027726aa82374ac01e6faea8f6d26c6d3b83b81ec745e11ca`. Se leyeron README y auditorías/changelogs V11–V13 y pasó la batería V13 antes de modificar (ver `V14_BASELINE.md`).

## Estado externo comprobado

**Supabase real: no validado.** No se suministraron URL/clave pública ni acceso a un proyecto; no se aplicaron migraciones a un proveedor, no se probaron correo, redirect, reset, eliminación real, OAuth o dos dispositivos físicos. SQL/RLS/RPC se ejecutaron sobre PGlite con `auth.uid()` simulado; el E2E navegador simula HTTP Supabase. Tampoco se suministró proyecto PostHog; opt-in/out y payload se prueban con stub. Drive OAuth no existe y no se solicitaron permisos ni se creó carpeta. Son bloqueos de configuración externa, no hechos consumados. Antes de publicar deben validarse las ocho migraciones y flujos reales enumerados en README.

## Deudas V13 y cloud

La RPC `read_sync_page` usa lista de tablas permitidas y pares `(updated_at,id)` con watermark. En cada tabla la paginación delta es keyset, sin offset; se conserva el cursor anterior si el pull falla o excede 200 páginas. Una escritura concurrente posterior al watermark queda para el siguiente pull. La base no ofrece snapshot transaccional entre todas las llamadas HTTP: escrituras retrodatadas o cambios simultáneos muy raros todavía requieren prueba de carga real. El cliente mantiene caché/outbox y estados `synced/pending/syncing/conflict/failed`; errores y versiones quedan en metadata.

Una prueba inyecta 250 filas en la primera página y un fallo de red en la segunda; comprueba que el cursor sigue en el valor previo. El historial paginado de usuario emplea offset únicamente para navegación bajo demanda, no para el delta crítico.

El bootstrap limita sesiones, errores e intentos a 250 recientes. `#/history` permite 30 registros por página de sesiones/errores/intentos bajo demanda. `study_summary()` devuelve cuenta de sesiones y segundos desde servidor. Evidencia y revisiones actuales se recuperan para recomponer conocimiento: el primer acceso con decenas de miles de evidencias puede ser pesado; falta una proyección compacta server-side con reconciliación verificable. El historial local preexistente del dispositivo no se borra.

La migración 008 repara la omisión cloud de `organicProgress`: respuestas y evaluación de org-01 son documento por cuenta; el claim de invitado conserva ese mapa. E2E verifica PC invitado→cuenta→móvil y móvil→PC con error/evidencia, además del tombstone de evento heredado. Si dos dispositivos editan un documento de temporizador simultáneamente se registra conflicto; el test lo resuelve expresamente, sin descartar versiones en silencio.

Se inspeccionó `rive/mascots/scene.rml`: cada artboard actual contiene un nodo de imagen, sin bones ni anchors animados. `NexoAvatarRenderer` encapsula Rive/Canvas; las capas Canvas conservan el fallback y pueden desalinearse con animaciones amplias. Un rig futuro debe exponer transformaciones de `head/face/torso/back/tail/aura` consultables por frame y attachments con orden de capas. No se estimaron huesos con CSS.

## Modelo y piloto

`ACADEMIC_MODEL.md` define entidades y diagrama. El grafo usa mapas de adyacencia, consulta directos/ancestros/descendientes y detecta ciclos. Siete familias agrupan ejercicios **existentes** de org-01; ocho conceptos y siete patrones de error provienen del material de Aminas, sin rellenar el resto de las clases. Las fuentes OpenStax §24.3/24.4/24.9 son links externos; las referencias privadas de cátedra/guía son metadata sin archivo empaquetado. IDs y versiones sobreviven a cambios de títulos.

Un intento tiene resultado, asistencia, familia, conceptos y habilidad. `academic_attempts` y `academic_evidence` son inmutables por RPC, con reintento idempotente; error/revisión/fuente admiten CAS. En org-01 la corrección de texto es **autoevaluación con rúbrica**; no se afirma que un modelo haya entendido la respuesta. MCQ etiquetada, numérica y dimensiones estructurales son contratos/validadores deterministas para contenido futuro. RDKit existente sigue disponible para Organic Studio, pero el piloto no implementa un evaluador molecular completo ni confunde SMILES distinto con diagnóstico pedagógico.

El estado derivado distingue `unseen/guided/independent/transferable/retained`: una respuesta con ayuda no es independencia; transferencia requiere ejercicio marcado y éxito sin ayuda; retención exige recordar ≥24 h tras evidencia independiente y transferencia. Un fallo aislado aporta señal sin reiniciar estado. El mastery `pending/unstable/mastered` legado queda separado a nivel de lección. Son reglas iniciales, no una estimación psicométrica calibrada; la evidencia de autorrúbrica no se debe usar como validación económica.

Diagnóstico requiere fallos independientes en ≥2 familias con ancestro required común; después dos intentos diagnósticos de familias distintas confirman si ambos fallan, o rechazan sospecha si no. La explicación enumera el prerequisito y familias; no se diagnostica a partir de un error. La UI de Rescate completa permanece fuera de V14.

`#/knowledge` expone mapa de ocho conceptos seleccionables con teclado/tacto, estados por símbolo, borde y texto, ficha con relaciones, evidencia, fuentes y bitácora. `#/reviews` separa vencidas y próximas; la acción lleva a recuperar en org-01 y no marca revisión al releer. El inspector se abre con `?nexoDev=1#/inspector` y detecta ciclos, referencias colgantes, IDs/versiones, familias sin ejercicio, ejercicio sin familia, fuente inexistente, concepto sin fuente y misconception sin feedback. En el piloto muestra huecos de fuentes reales; se conservaron como avisos en vez de inventar material.

FSRS `ts-fsrs@5.4.2`, licencia MIT copiada al bundle, se carga al programar revisiones. Agenda por concepto y conserva fechas de revisiones legadas sin crear tarjetas en masa. Calcula **cuándo**, mientras evidencia decide **qué sabemos**. Tarjetas y fechas UTC se guardan local/cloud; la cola presenta pendientes. Si falla la carga del scheduler, el intento ya está guardado y reintentar su ID puede completar la tarjeta sin duplicar evidencia.

Biblioteca usa referencias/links, autoridad de fuente y ubicaciones estructuradas (libro páginas, PPT diapositivas, guía ejercicio, grabación timestamps). Parser TXT/VTT/SRT local conserva tiempos y limita tamaño; no descarga PDFs ni audio para mostrar una referencia. Drive devuelve `drive_oauth_not_configured`; faltan OAuth de usuario, scopes mínimos, callback y almacenamiento seguro de tokens antes de integrar archivos privados. No se redistribuyen libros.

## Datos, seguridad y privacidad

Esquema local 19, migración versión 14 y backup `nexo-study-beta-pre-v14` único. Esquema cloud 16 después de ocho migraciones; la migración 007 añade cinco tablas privadas con RLS `user_id=auth.uid()`, índices y columnas generadas para filtros. RPC allowlist deriva identidad de Auth; roles normales no insertan/editan filas por tabla directamente. PGlite comprueba A no lee/escribe B ni forja evidencia ajena. **Un usuario sí puede autodeclarar intentos correctos propios**: por eso V14 no paga recompensas ni trata esa señal como certificación. El hook de evento exige validación futura del servidor y concede cero moneda.

Analytics sigue opt-in. Eventos nuevos: `concept_viewed`, `concept_state_changed`, `problem_family_attempted`, `misconception_detected`, `misconception_resolved`, `prerequisite_suspected`, `prerequisite_confirmed`, `review_scheduled`, `review_completed`, `source_opened`. Allowlist admite IDs/booleanos de bajo riesgo; no respuestas abiertas, notas, transcripciones, nombres de archivo, rutas Drive, email ni tokens. Sin PostHog la aplicación sigue funcionando. La exportación JSON y la importación académica de V12/V13 permanecen; importación no acuña moneda ni inventario. Los eventos de dominio in-process llevan `requiresServerValidation` y `currencyGranted:0`; no activan recompensas desde cliente.

## Rendimiento y pruebas

| Archivos iniciales sin comprimir | V13 | V14 | Cambio |
| --- | ---: | ---: | ---: |
| Scripts | 19 | 20 | +1 |
| JavaScript | 394.849 B | 407.172 B | +12.323 B |
| CSS | 78.347 B | 82.640 B | +4.293 B |

FSRS 72.009 B se descarga solo cuando se agenda revisión; catálogo y motor académico se cargan en org-01/Biblioteca, Phaser sigue lazy. Son tamaños estáticos; no se midieron Core Web Vitals, latencia real ni móvil físico. `app.js` sigue siendo grande: V14 no añadió el motor ahí, pero extracción de toda la UI académica anterior sigue pendiente.

Antes de la ampliación de mapa/inspector, `npm run test:all` **pasó** el 25-09: regresiones V11–V13, motor académico, SQL/PGlite, E2E de dos contextos y offline, historial y rendimiento. Tras la ampliación, `npm test` y `npm run test:perf` pasan, incluidos inspector, render del mapa y fallo a mitad de cursor. El E2E ampliado está escrito, pero el 26-09 Chromium termina con `SIGTRAP` al arrancar antes de cargar Nexo porque el entorno actual carece de `/proc`; no se presenta como pasado. SQL en PGlite y HTTP cloud simulado no reemplazan pruebas del proveedor. La auditoría estática busca secretos, SDK directo en UI, analytics sensible y tablas sin RLS.

## Deuda antes de V15/producción

1. Validar Supabase y PostHog reales con Auth, A/B RLS, RPC, resets, eliminación, redirects, correo y dos dispositivos físicos. Configurar Drive solo si el usuario autoriza su cuenta.
2. Materializar conocimiento compacto/verificable para bootstrap extremo; paginar evidencia histórica bajo demanda y medir latencia con cuentas grandes. Mejorar contención de carreras con pruebas de carga en PostgreSQL real.
3. Curar más ejercicios con validación objetiva y distractores etiquetados antes de inferencia fuerte/recompensas. Revisar la semántica de estados con docentes y datos reales; no convertir autorrúbrica en certificación.
4. Crear un rig Rive con anclas animadas si se desea seguimiento durante movimientos amplios; modularizar más la UI heredada de `app.js`.

V15 puede usar los contratos de grafo, familia, evidencia, diagnóstico y cola FSRS para escoger práctica y Rescate; no requiere rehacer ledger/avatar, pero sí mejorar validación pedagógica y operación cloud real.
