# Registro de fuentes de Nexo 1.0

## Alcance comprobado

El archivo privado **Material Nexo (2026)** de Google Drive contiene `2S QYF 2026` y carpetas de Orgánica II, Fisicoquímica II, Fisiopatología y Analítica. Se inspeccionaron las ramas actuales de programación, diapositivas, guías y grabaciones. La consulta de una carpeta confirma existencia, no calidad ni vigencia interna de cada documento.

| Documento del Drive leído | Hallazgo y decisión |
|---|---|
| `FQ 2/TEORIA/PROGRAMACION/Calendarización Ejercicios FQII QyF 2s2026 (2).pdf` | La tabla de clases pone **Control 1: lunes 26 de octubre de 2026**, Control 2: 23 de noviembre, Control 3: 28 de diciembre. Nicolás había comunicado Control 1: 20 de octubre. La semilla de calendario de Nexo pasa al **26 de octubre** porque el documento de ejercicios 2S2026 es la fuente más directa; se conserva esta discrepancia para confirmar con docentes. Este PDF no fija fechas de PEP ni ponderaciones. |
| `ANALITICA/TEORIA/PPT CLASES/1.2_QF_CURSO QUÍMICA ANALÍTICA_2°_2026.pdf` | Presentación 2S2026: **teoría 60% y laboratorio 40%**, laboratorio de aprobación independiente. Dentro de teoría, PEP 1 = 30%, PEP 2 = 30%, PEP 3 = 25%, controles = 15%. Para eximición, cada PEP debe ser ≥4.00. La app separa ahora los pesos internos de cada componente del aporte de teoría/laboratorio al ramo. |
| `FISIOPATOLOGIA/TEORIA/PROGRAMACION/PROGRAMA DE ASIGNATURA-FISIOPATOLOGIA-2026-2.docx` | El nombre del archivo dice 2026-2 y sus días coinciden con 2026, pero **el encabezado interno dice 2024-II**. Es una plantilla reutilizada o una inconsistencia; por ahora no se cargan como fechas oficiales ni se infieren ponderaciones 2026 de ese documento. |

La calendarización FQII recomienda a Lissi, Chang, Levine y Atkins. La presentación de Analítica lista Skoog, Christian, Harris y otros. Son bibliografía para verificar o ampliar un punto concreto, **no** licencia para copiar capítulos al sitio ni prueba de que cada tema entre en una PEP. El horario personal del Drive confirma ramos inscritos pero no se incorpora ni se reproduce en la app por privacidad.

En `ORGANICA 2/TEORIA/PPTS CLASES` se observaron las diapositivas 2025 usadas como referencia; en `ORGANICA 2/TEORIA/GRABACIONES` se observaron `Organica.m4a` y `ORGÁNICA CLASE 1.m4a`. No se ha verificado una transcripción íntegra de esas grabaciones. No se publican archivos del Drive ni identificadores de carpeta en el sitio público.

## Piloto org-01

| Fuente | Alcance inspeccionado | Uso correcto |
|---|---|---|
| `2025 - 2S - 1 - Clase de catedra - QOII-QyF - Aminas.pdf` | 50 diapositivas. Diap. 5: par libre; 17–20: protonación y pKa; 22–25: efectos electrónicos; 26–27: heterociclos/hibridación. Diap. 24 inspeccionada también como imagen. | Referencia de cátedra para los conceptos del piloto. No se afirma que toda la PEP 2026 coincida. |
| `Guia de Ejercicios 1a QOII - QyF - Aminas.pdf` | 3 páginas; fecha interna 2021. Pág. 1, ejercicio 4: comparación de basicidad. | Práctica suplementaria, no programa vigente. |
| OpenStax Organic Chemistry §24.3, §24.4, §24.9 | Páginas y secciones verificadas en el sitio oficial. | Ampliación externa enlazada, no copiada al bundle. El contenido publicado de la lección es redacción original de Nexo. |

`dist/academic/model.js` conserva relaciones concepto→fuente y ejercicio→fuente. `dist/academic/inspector.js` comprueba que no existan identificadores huérfanos. `dist/amine-lesson.js` ofrece abrir **un PDF que el estudiante elige en su dispositivo**: el archivo permanece en memoria del navegador durante la sesión, sin cargarse al servidor.

## Resto del catálogo

Las otras 17 clases de Orgánica conservan sus referencias de diapositiva y guía en `dist/organic-pep1.js`, `organic-pep2.js`, `organic-pep3.js` y `organic-biomolecules.js`. Sus explicaciones fueron escritas por Nexo y no se han auditado línea por línea contra cada página. Las clases históricas de otros ramos se muestran como explicaciones generadas por Nexo pendientes de cotejo, no como clases oficiales. No se debe etiquetarlas como verificadas hasta añadir una localización específica y revisar la afirmación correspondiente.

Los audios y libros privados pueden incorporarse en una versión futura tras verificar permisos, transcripción y uso concreto. La biblioteca actual almacena **metadatos personales**, no los binarios; no hay conexión Drive operativa dentro de la app ni se simula una.
