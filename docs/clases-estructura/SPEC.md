# Estructura de las clases de Nexo (SPEC)

Estado: **borrador para aprobar**. Aún no se programa nada. Fecha: 4 oct 2026.

## Qué

Una forma única de construir clases: **cada clase es un archivo de datos** y **un solo reproductor** la muestra.
No hay una pantalla distinta por clase. Así, rehacer Aminas y después Carbonilos es escribir contenido, no programar de nuevo.

Esto cumple los 3 objetivos del proyecto: aprender de verdad (se pide evidencia), prepararse para las evaluaciones (la clase sigue el material del semestre) y que sea entretenido (actividades variadas, mascota, poca fricción).

## Decisiones ya tomadas por Niquito (no se discuten)

- Inicio adaptativo según lo que ya sabes (3C).
- Ruta recomendada, pero con libertad para desviarse (1B).
- Actividades variadas; escribir solo cuando aporte evidencia: conectar, ordenar, clasificar, dibujar, resolver.
- Respuesta distinta según el tipo de error (6D).
- Fuente a un botón de distancia, con vista dividida opcional.
- Material del semestre actual manda; lo histórico va después.
- Primera clase de prueba: Orgánica II → PEP 1 → Aminas → Basicidad.

## Las 7 etapas de una clase

| # | Etapa | Para qué sirve | Evidencia que deja |
|---|---|---|---|
| 1 | **Diagnóstico** | 3–4 preguntas rápidas. Decide qué bloques se saltan y cuáles se refuerzan. | Qué sabías antes (punto de partida). |
| 2 | **Explicar** | Bloques cortos con una imagen o actividad interactiva. Nada de muros de texto. | Ninguna (solo exposición). |
| 3 | **Ejemplo resuelto** | Un caso paso a paso. Después se te van quitando pasos y los completas tú. | Parcial, con ayuda. |
| 4 | **Práctica variada** | Actividades de distintos tipos, mezcladas. Sin pistas visibles por defecto. | Acertar sin ayuda (`independent`). |
| 5 | **Error y rescate** | Si fallas, la respuesta depende del tipo de error (ver abajo). | El error queda registrado y se reintenta. |
| 6 | **Transferencia** | Un problema en contexto nuevo, estilo prueba, sin ayuda. | `transferable`. |
| 7 | **Cierre** | Resumen de lo que demostraste y de lo que falta. Se agenda el repaso. | Repaso FSRS; `retained` solo si recuerdas ≥ 24 h después. |

La **fuente** (diapositiva, guía, minuto de clase) está disponible en todas las etapas con un botón, y se puede abrir al lado.

Regla central: **terminar la clase no equivale a dominarla**. El estado sale solo de la evidencia (`unseen → guided → independent → transferable → retained`), como ya define `ACADEMIC_MODEL.md`.

### Respuesta según el error (6D)

| Tipo de error | Qué hace Nexo |
|---|---|
| Error de concepto (un distractor etiquetado como misconception) | Rescate dirigido: explica ese error en concreto y da un caso corto para corregirlo. |
| Falta un prerrequisito (fallos en 2 familias con el mismo prerrequisito) | Sugiere volver al concepto anterior; no lo declara débil por un solo fallo. |
| Descuido (acertó antes y falló ahora, o respondió muy rápido) | Pista corta y reintento. |
| Respuesta abierta ambigua | Autorúbrica; no se inventa una corrección que no se puede verificar. |

## Tipos de actividad (componentes reutilizables)

Reutilizan los `responseTypes` que ya existen en `dist/academic/model.js`, así no se duplica el motor.

| Actividad | Cómo se corrige | Estado hoy |
|---|---|---|
| Elegir (con distractores etiquetados) | Automática; cada distractor apunta a un error. | Existe el validador. |
| Ordenar | Automática por orden esperado. | Tipo declarado; falta componente. |
| Conectar (pares) | Automática. | Tipo declarado; falta componente. |
| Clasificar en cajas | Automática. | Falta tipo y componente. |
| Numérica | Automática con tolerancia. | Existe el validador. |
| Dibujar estructura | Por dimensiones (conectividad, carga, enlace, regio). | Existe `classifiers.js`; falta integrar el editor. |
| Justificar con texto | Autorúbrica; nunca "corrección" falsa. | Existe en `structured.js`. |

## Cómo se ve una clase por dentro (datos)

Un archivo por clase en `dist/classes/<id>.js` que se registra en `window.NexoClasses`. Forma propuesta:

```js
{
  id: 'org-01',                 // el mismo de hoy, para no perder el catálogo
  title: '…', evaluation: 'pep-1', sourceIds: ['…'],
  concepts: ['org.lone-pair', 'org.protonation', …],   // IDs del motor
  stages: [
    { type: 'diagnostic', items: [ /* ejercicios */ ] },
    { type: 'explain',    blocks: [ /* texto + visual */ ] },
    { type: 'worked',     steps: [ /* paso a paso con pasos que se esconden */ ] },
    { type: 'practice',   items: [ /* actividades variadas */ ] },
    { type: 'transfer',   items: [ /* contexto nuevo */ ] }
  ]
}
```

Cada actividad lleva: tipo, enunciado, respuesta esperada, distractores con su `misconceptionId`, concepto, habilidad, dificultad y fuente exacta (diapositiva o página). Los IDs de concepto y familia son los del motor; si cambia el significado de un concepto se crea un ID nuevo.

## Cómo se conecta con lo que ya existe

- Cada intento llama a `NexoAcademicEngine.recordAttempt(...)` con `activityType: 'lesson'`. Eso actualiza evidencia, estado y repaso. Cero lógica de dominio nueva.
- La ruta del grimorio ya abre `#/lesson/<id>`; el reproductor reemplaza la página "Disponible próximamente" **solo para las clases que ya tengan archivo**. Las demás siguen en "Próximamente".
- No se toca Supabase ni nada de nube (regla del proyecto).

## Por qué esta estructura (evidencia)

- **Recuperar, no releer**: practicar recordando mejora la retención más que releer (Roediger y Karpicke, 2006, *Psychological Science*). Por eso las etapas 4–6 mandan sobre la 2.
- **Repaso espaciado**: repartir los repasos en el tiempo supera a repetir todo junto (Cepeda y cols., 2006, *Psychological Bulletin*). Por eso el cierre agenda el repaso.
- **Ejemplos resueltos con retirada gradual**: ayudan a principiantes y se van quitando a medida que se domina (Renkl y Atkinson, 2003). Por eso la etapa 3.
- **Mezclar tipos de problema** (intercalado) mejora la discriminación entre ellos (Rohrer y Taylor, 2007). Por eso la práctica es variada.
- Resumen de efectividad de técnicas: Dunlosky y cols., 2013, *Psychological Science in the Public Interest*.

## Pasos de construcción (cada uno se prueba y se muestra ANTES/AHORA)

1. **Esqueleto**: registro de clases y reproductor con las 7 etapas y la navegación. Con una clase de prueba **sin química** (marcada claramente como demo).
2. **Actividades**, una por una: elegir → ordenar → conectar → clasificar → numérica → dibujar.
3. **Motor**: guardar evidencia, estados y repaso.
4. **Error y rescate** por tipo de error.
5. **Fuente** en botón y vista dividida.
6. **Contenido real de Aminas** (necesita tu material del semestre).
7. **Segunda clase** distinta (prueba de que la estructura sirve para más de una).

## Criterios de aceptación

- Una clase se agrega escribiendo **solo un archivo de datos**, sin tocar `app.js`.
- Una clase sin archivo sigue mostrando "Disponible próximamente".
- Terminar una clase no cambia el estado a `retained`; lo prueba una prueba automática.
- Reintentar el mismo ejercicio no duplica evidencia.
- Funciona en 1440 y 390 px y pasa `tools/contrast-audit.cjs` (0 problemas).
- Respeta `prefers-reduced-motion`.
- Pruebas rápidas en verde.

## Pendiente por decidir (con mi recomendación)

1. **Duración**: ¿una clase larga (~85 min como antes) o varias *misiones* de 10–15 min que suman una clase? Recomiendo **misiones**: bajan la fricción y se adaptan al tiempo que tengas.
2. **Aspecto**: ¿pantalla de aula inmersiva (sin menú, con la mascota) o dentro del layout normal? Recomiendo **aula inmersiva**, para que se sienta distinto a una lista de ejercicios.
3. **Material de Aminas**: sin tus diapositivas o la pauta de la PEP 1 no se puede hacer el paso 6 con el contenido del semestre.
4. **Resto del contenido viejo**: la lámina "Anilina y bencilamina" del índice y código sin uso (`richLesson`, `questionsFor`). Recomiendo borrarlos al llegar al paso 1.
