# UPDATE 01 — Renacimiento visual

Fecha: 2026-10-01. Alcance autorizado: Inicio, Aprender y navegación entre ambos. Este documento gobierna esta actualización por encima de especificaciones históricas que pedían publicación o backend.

## Fase 0: inspección

Leídos LEEME_PRIMERO, ACCEPTANCE, IMPLEMENTATION_STATUS, arquitectura, sistemas de diseño/habitaciones/ambiente/rendimiento y especificación original. Contrastados con app.js, index.html, startup bundle, catálogo data.js/semester-2026, habitaciones, ambiente, animación, prioridades y pruebas. Revisados bosquejo y dos escenas WebP. Inventariada la evidencia responsive anterior; las capturas previas se revisaron en detalle durante la convergencia.

A. Estado: dist es el código real servido. app.js: renderRoute gobierna rutas; renderHomeRpg compone Inicio; renderSubjects/renderSubject gobiernan ramos y clases. No hay selección independiente de evaluación. Las fuentes modulares de arranque también tienen copia generada en startup-bundle.
B. Reutilización: escenas locales optimizadas, NexoRooms, prioridad de Bitácora, peps del catálogo, estado histórico, ambiente horario, perfiles gráficos, lifecycle y rutas académicas.
C. Problemas: ilustración + bloques separados; móvil apilado; clases heredadas como entrada principal; transición genérica y apertura inicial del sitio que no es apertura del grimorio. Fisiopatología tiene id real fisio pero tema fisiopato.
D. Archivos: app.js, index.html (carga/versiones), design-system/update01.css nuevo, rooms.js, platform/animation.js, startup-bundle.js generado, tools/update01-*.cjs, documentación UPDATE 01.
E. Riesgos: no atribuir dominio real al legado; no inferir contenido de controles por número; deep links/rutas existentes; textos largos/zoom; imagen diurna fija durante noche; config pública no debe perderse al regenerar bundle.
F. No modificar: backup, datos, migraciones, cloud, motor académico, mascota, Entrenar, Perfil, economía, audio ni publicar.

## Contrato funcional

Inicio: una escena continua de refugio, con tablón de evaluaciones de mayor prioridad, papel de Tu día y libro para continuar. Evaluaciones proceden de eventos reales; actividad/meta/repasos del estado actual. Mascota existente conservada sin ampliar sistema; escritorio/ventana/estantería permanecen como superficies visibles.
Aprender: libro con índice de ramos → capítulos de PEP + otras evaluaciones del calendario → mapa trazado sobre papel. PEP del catálogo define temas. Un evento de control sin asociación explícita NO hereda lecciones de una PEP; mapa vacío explica límite y permite Bitácora. Fechas PEP solo se unen por título PEP exacto y ramo, manteniendo advertencias originales. No escribir estado al recorrer mapas.
Mapa: nodos de catálogo histórico, trazado serpenteante, estados textuales y resumen de registros. Selección muestra detalle con destino legado explícito, sin presentar nuevas clases como terminadas. Todo progreso indica registro/autoverificación y no dominio nuevo.
Transición: primera apertura por pestaña/sesión ≤620 ms, siguientes ≤220 ms, cierre ≤180 ms, cambio de ramo/página ≤240 ms; controles funcionan durante animación. Respeta sistema gráfico/movimiento reducido. Ninguna librería nueva ni timer.
Responsive: desktop libro de dos páginas; móvil folio único con pestañas/marcadores, camino serpenteante con texto refluible; arte de ventana conservado; sin overflow a 375/390/768/1440 y landscape, y texto al 200%.
Ambiente: consumir data-nexo-time y --ambient-rgb del sistema actual, atenuar escena diurna de noche con luz interior localizada; no oscurecer papeles/textos. Sin consultas/red/RAF nuevo.

## Plan SDD

| Tarea | Objetivo | Archivos | Dependencia | Terminación |
|---|---|---|---|---|
| T01 | Componer refugio continuo | app.js, update01.css, index.html | Inspección | Escena y tres superficies académicas en mismo contenedor |
| T02 | Integrar evaluaciones, Tu día y continuar | app.js | T01 | Datos existentes, estados vacíos y acciones verificadas sin escrituras al navegar |
| T03 | Luz local y responsive Inicio | update01.css | T02 | Mañana/tarde/noche legibles; 375/390/768/1440 + zoom |
| T04 | Shell grimorio e índice de ramos | app.js, update01.css, rooms.js | T01 | Papel/cuero/lomo/marcadores; cuatro ramos, tema correcto fisio |
| T05 | Selección de evaluaciones | app.js | T04 | PEP catálogo y eventos reales sin fabricar asociaciones; deep links válidos/invalidación segura |
| T06 | Mapa de preparación y detalle | app.js, update01.css | T05 | Camino ilustrado, registro histórico, acceso explícito al legado, vacíos honestos |
| T07 | Apertura/cierre/páginas | animation.js, app.js, startup-bundle.js | T04–T06 | Primera/siguiente apertura distintas, cancelación al navegar, reduced motion sin animación |
| T08 | Responsive Aprender | update01.css | T06 | Folio móvil, mapa sin solapes ni controles pequeños |
| T09 | Regresión y evidencia | tools/update01-*.cjs, docs/update-01 | T03,T07,T08 | Pruebas relevantes, E2E, consola, capturas, performance y tabla AC01–AC20 |

## Evidencia y límites

No aprobar criterio solo por existencia de archivos. Evidencia final en REPORT.md y tmp/update01. QA de navegador y métricas requieren Chromium operativo; este entorno incluye Playwright pero no su binario inicial, se intenta provisionarlo dentro de tmp. No se publica ni se contacta backend remoto para esta actualización.
