# Nexo StudyApp 1.0 — aceptación verificable

Esta lista deriva de la especificación 1.0 del usuario. `Hecho` exige comportamiento, prueba y revisión; un archivo o una pantalla aislada no bastan. La versión pública permanece intacta hasta la publicación final.

| Fase | Estado | Evidencia o falta concreta |
|---|---|---|
| 0 V14/backup | Hecho | ZIP V14 conservado y proyecto 1.0 aislado. |
| 1 Supabase real | Parcial | OAuth Google real y 14 migraciones remotas comprobadas; solo hay un perfil. Faltan segundo usuario real, pruebas remotas multidispositivo/concurrentes, retorno en URL publicada y decisión autorizada sobre Email. |
| 2 Arquitectura modular | Parcial | Dominios académicos, avatar, planner, ambient, design system; `app.js` aún concentra demasiado. |
| 3 Design System 2.0 | Parcial | Tokens, superficies y variantes con UI Lab; faltan auditoría visual de todas las pantallas heredadas y contraste exhaustivo. |
| 4 Habitaciones | Parcial | Registro de siete habitaciones y cuatro CourseThemes; cinco escenas originales locales siguiendo el bosquejo del usuario, con fuente preservada y WebP por ruta. Aprender usa una base neutra. El arte aún no equivale a objetos interactivos ni se ha aprobado contra la referencia en dispositivo real. |
| 5 Ambient World | Parcial | Luz horaria, eventos deterministas y pausa al ocultar; no hay clima real (no solicitado). Falta comprobar transiciones prolongadas en dispositivo. |
| 6 Performance | Parcial | Carga diferida y lifecycle; se redujeron 29 solicitudes iniciales de scripts a cinco sin fusionar los módulos fuente. Tras ello, dos corridas móviles con movimiento reducido dieron LCP 2,14–2,30 s y una con movimiento normal 2,27 s, CLS 0. Una corrida anterior a ese cambio llegó a 2,83 s. Falta muestra amplia, campo real/INP y auditoría larga de memoria. |
| 7–8 Shell/header | Parcial | Cinco destinos, acciones globales y transición solo entre habitaciones; pruebas de overflow a 375/390/768/1440 y landscape. Falta QA manual de zoom, lectores de pantalla y navegadores reales. |
| 9–10 Bitácora/labs | Parcial | Prioridades, meta, calendario y etapas de lab. Analítica separa el 100% interno de teoría de su aporte 60%/40% con laboratorio, conforme a presentación docente 2S2026; la corrección del Control 1 FQII conserva ediciones manuales. Faltan recordatorios y flujo de revisión de contenido generado. |
| 11–12 Home/copy | Parcial | Próxima acción y meta con datos reales; falta revisión completa del texto heredado. |
| 13–16 Learning/feedback/rescate/entrenamiento | Parcial | org-01 tiene siete casos estructurados con corrección determinista, feedback del primer fallo, evidencia y reparación. Entrenar ofrece seis filtros, tres niveles de ayuda y cuatro duraciones. Rescate de par libre se activa tras dos comprobaciones verificadas y recorre contraste, ejemplo, parcial, nuevo caso y repaso; probado E2E. Faltan adaptatividad amplia y rutas de Rescate para los demás prerequisitos; texto y dibujo no se califican automáticamente. |
| 17–18 Rangos/reservas | Parcial | Cinco rangos por concepto, foco académico servido, casos validados y reservas únicas implementados en SQL remoto. PGlite verifica A/B, idempotencia y antifalsificación; falta ejercicio con dos cuentas reales. |
| 19–21 Mascota/rig/microhistorias | Parcial | Controller contextual, compatibilidad especie×ranura×habitación, eventos deterministas y fallback Canvas con cosméticos. El cerdito nuevo tiene Idle, Read y Ready en Rive; son poses completas, no un rig articulado. Gato/perro y cosméticos aún usan rutas heredadas. Falta coherencia visual con los escenarios, rig final y prueba visual exhaustiva de combinaciones. |
| 22 Audio | Parcial | SFX, música y ambiente opt-in con pausa/descarga por habitación; falta escucha/QA en dispositivos físicos. |
| 23 Fuentes | Parcial | org-01 tiene localizaciones comprobadas; otras clases de Orgánica exponen diapositiva/guía y el legado se marca Nexo generado pendiente de cotejo. Falta revisión afirmación→fuente de todo el catálogo. |
| 24–25 UI Lab/Review | Parcial | Rutas `?nexoDev=1#/ui-lab` y `#/review`, con rangos, rescate, feedback, mascota y métricas, probadas E2E. Falta revisar cobertura visual de cada estado y dispositivo. |
| 26–28 Accesibilidad/tests/responsive | Parcial | E2E a 375/390/768/1440 y landscape; prueba básica de nombres, alt, landmarks, Tab y texto a 200%. Falta auditoría asistiva/contraste completa y QA en móvil real. |
| 29–30 Deploy/docs/informe | Pendiente | No se publicó 1.0; faltan build final, URL, smoke real, ZIP e informe. |

No etiquetar `Hecho` sin test específico. No usar esta lista para justificar dejar fases abiertas al final.
