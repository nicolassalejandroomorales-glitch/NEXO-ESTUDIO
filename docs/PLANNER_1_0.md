# Bitácora 1.0 — implementación actual

Estado: funcional en la build local; pendiente de publicación y pruebas multiusuario remotas.

## Datos

Los eventos viven en `state.events` y se sincronizan como `academic_events` mediante `dist/cloud/foundation.js`. La importación V14 conserva los identificadores originales; las fechas oficiales del semestre se incorporan a una cuenta nueva sin sustituir su calendario por uno vacío. La UI de calendario, formulario y Home está todavía en `dist/app.js`; es deuda de modularización, no una arquitectura final.

Cada evento puede tener `date`, `time`, `subject`, `type`, `priority` (1–3), `durationMinutes`, `prepMinutes`, `dependencies`, `status`, `notes` y `source`. El tipo `lab` tiene además `lab.manual`, `lab.prelab.dueDate/done`, `lab.during.checklist` y `lab.after.reportDueDate/reportDone`. `dist/planner/labs.js` normaliza esos datos al importar o editar; no incluye contenido académico ficticio. Las marcas de pre-lab e informe son independientes del estado global del evento.

## Prioridades

`dist/planner/priority.js` expone `NexoPriority.rank(events, context)`. Devuelve eventos ordenados junto a puntaje y razones visibles. Considera proximidad, importancia fijada, preparación pendiente, errores abiertos del ramo, clases previas sin completar y concentración de compromisos el mismo día. Para laboratorios usa el vencimiento del pre-lab mientras esté pendiente; después de la sesión usa el del informe pendiente. No infiere dominio académico a partir de minutos. Una evaluación pasada y completada no ocupa una tarjeta de prioridad. Home utiliza las tres primeras salidas del mismo motor, sin duplicar el calendario.

El objetivo diario inicial es 120 minutos, editable entre 15 y 600; cuenta sesiones registradas hoy, no maestría. Cambiarlo modifica ajustes locales y sincronizados. Las fechas y componentes de nota son editables porque pueden cambiar durante el semestre.

`dist/planner/grades.js` calcula sin mutar las notas. Cada evaluación se pondera **dentro de teoría o laboratorio**, y el aporte de cada componente al ramo se calcula por separado. La presentación oficial 2S2026 de Analítica fija 60% teoría y 40% laboratorio; sus PEP y controles suman 100% de teoría, no del ramo completo. El resultado global solo aparece cuando ambos componentes y sus pesos están completos. También calcula el promedio requerido para lo pendiente cuando la ponderación interna suma 100%; acepta coma decimal y detecta notas fuera de 1.00–7.00 y pesos fuera de 0–100%. La regla de PEP bajo 4.00 se comunica por separado de la media. `tools/grade-test.cjs` verifica estas cuentas y casos inválidos.

## Pruebas y límites

`tools/priority-test.cjs` comprueba el orden determinista, razones, vencimientos y exclusiones. `tools/lab-test.cjs` comprueba normalización y fechas. `tools/planner-e2e.cjs` verifica meta, edición, Home, completar, etapas de laboratorio, persistencia y ausencia de desborde horizontal en 390 px. Se inspeccionó visualmente `tmp/v11-visual/lab-mobile.png` y se corrigió la distribución de acciones y contenido.

Quedan fuera de este corte los avisos automáticos del sistema, un plan horario que distribuya las dos horas, adjuntar manuales como archivos y una validación multi-dispositivo de laboratorios contra Supabase real. Ninguna de esas funciones se simula en la interfaz.
