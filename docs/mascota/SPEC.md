# Mascota: vida en el refugio (UPDATE 02.1)

Tema de este chat: **la mascota**. Meta: que deje de estar clavada en el escritorio y *viva* en la sala:
se mueve, saca libros de la biblioteca, mira por la ventana, duerme, y reacciona al clima real (se asusta con la tormenta).
Estado: **borrador, esperando OK de Niquito** (3 oct 2026).

## Qué

**1. Estaciones**: 4 lugares de la sala (anclas de `home-scene.js`, hoy solo el escritorio está calibrado).

| Estación | Ancla | Para qué |
|---|---|---|
| Escritorio | `desk` | Leer, escribir |
| Ventana | `window` | Mirar afuera, mirar la lluvia |
| Estantería | `bookshelf` | Sacar y devolver libros |
| Sillón | `rest` | Descansar, dormir, esconderse |

**2. Escenas**: pequeños guiones que encadenan pasos. Ejemplos:

| Escena | Pasos | Cuándo |
|---|---|---|
| Buscar un libro | va a la estantería → se estira → aparece el libro en sus manos → salta al escritorio → lee | Bloques de "leer" |
| Mirar por la ventana | va a la ventana → mira → "…" de vez en cuando | Bloques de "mirar", amanecer y atardecer |
| Dormir | va al sillón → se acurruca → "z z" | Noche (22:00–06:00) |
| Lluvia curiosa | va a la ventana → mira las gotas → "?" | Llovizna o lluvia suave |
| **Susto de tormenta** | trueno → "!" y salta → corre al sillón → tiembla con gotitas de sudor hasta que se calma | Tormenta (interrumpe cualquier escena) |
| Cariño | al tocarla: corazón + saltito | Siempre |

**3. Clima real**: la ventana muestra lluvia cuando de verdad llueve en Santiago y hay relámpagos cuando hay tormenta.

Es puro ambiente: no da recompensas ni toca el motor académico.

## Decisiones

1. **Se mueve a saltitos, no caminando.** No hay arte de caminata y deslizar una imagen se ve falso. Un salto en arco con
   *squash & stretch* y anticipación funciona con las poses actuales. Base: principios de animación de Disney
   (Thomas & Johnston, *The Illusion of Life*, 1981).
2. **Las emociones se muestran con movimiento + "emotes"** (iconitos sobre la cabeza: `!`, `?`, `…`, `z`, gotitas, corazón), no con poses nuevas.
   Por qué: sirven para las 3 especies y **conservan los cosméticos** (regla de `MASCOT_SYSTEM_1_0.md`), y un rig con expresiones no existe todavía.
   Es la misma técnica que usan juegos como *Animal Crossing* o *Stardew Valley*. Movimientos: temblar, agacharse, estirarse y saltar.
   Las poses nuevas (dormido y asustado) quedan como mejora, solo para el cerdito.
3. **Motor de escenas propio** en `dist/mascot/life.js`: estaciones + guiones con pasos (`go`, `pose`, `prop`, `emote`, `motion`, `wait`).
   Un elegidor decide la siguiente escena con este orden de prioridad: **clima fuerte > noche > intención del bloque > variedad**.
   Solo una escena urgente (el trueno) puede interrumpir a otra. Un único temporizador para toda la sala.
4. **La hora sale de una sola fuente**: se reutiliza `NexoAmbientEvents.select()` (`ambient/events.js`), que ya es determinista por día y bloque de 3 h.
5. **Clima real con Open-Meteo** (autorizado por Niquito el 3 oct 2026): API gratis, sin clave y sin cuenta.
   - **Ubicación fija: Santiago** (−33.45, −70.66). No se pide la ubicación del dispositivo. Más adelante podría haber un ajuste opcional, redondeado a ~10 km.
   - Se consulta como máximo cada 30 min, y solo con la pestaña visible. Se guarda en `localStorage`, con try/catch.
   - Sin internet → "despejado" (Nexo no inventa lluvia).
   - Módulo propio `dist/ambient/weather.js`: traduce el código WMO a `clear | cloudy | fog | drizzle | rain | storm`
     y escribe pesos `--w-rain` y `--w-storm` (0 a 1) para transiciones graduales, igual que `--w-*` de la luz.
     También escribe `body[data-nexo-weather]` solo para la mascota (la escena usa los pesos).
   - Consola (F12): `NexoWeather.preview('storm')` / `NexoWeather.stopPreview()`. Es clave, porque en Santiago llueve poco.
6. **La lluvia de la ventana se pinta por código**: una capa nueva en `ambientLayers` dentro de la ventana, con gotas animadas y cielo más gris.
   El relámpago es un destello suave y raro (nunca más de 3 por segundo, WCAG 2.3.1), y no aparece con reduced-motion.
   *Nota*: esto toca la escena del Inicio, pero solo como capa nueva; el arte original no se modifica.
7. **El libro es un objeto (prop) dibujado por código** (SVG en el JS) **con el color del ramo que estás estudiando**. Así la escena conecta con tu semestre real.
8. **Las anclas se calibran sobre el arte** (`point`, `foot`, `width`; más lejos = más chica), y se comprueban con `?debugScene=true`.
   Todas parten en la capa `mascot` (delante). Pasan a `mascotBack` solo con prueba visual.
9. **Gato y perro** hacen las mismas escenas; solo el cerdito tiene poses `read`/`ready`, y el resto usa `Idle` (`MASCOT_RIG_CONTRACT.md`).

## Cómo: 4 fases, cada una con ANTES/AHORA y tu aprobación

**Fase A — Estaciones y saltos**
1. Calibrar las 4 anclas (1440 y 390).
2. `life.js` núcleo: estaciones, salto en arco, giro, elegidor por hora, `cleanup`. Conectarlo con un cambio chico en `app.js`,
   y agregarlo a `tools/build-startup.cjs`; subir `?v=`.

**Fase B — Emociones**
3. Emotes por código y movimientos (temblar, agacharse, estirarse). Escenas de dormir y de cariño al tocarla.

**Fase C — Libros**
4. Escena "buscar un libro" con el libro del color del ramo.

**Fase D — Clima**
5. `weather.js` + Open-Meteo + caché + `preview()`.
6. Lluvia y relámpagos en la ventana.
7. Escenas "lluvia curiosa" y "susto de tormenta".

**Pruebas**: `tools/mascot-life-test.cjs` (elección determinista, prioridades, interrupción por trueno, traducción de códigos WMO, sin red → despejado)
+ `smoke-test.cjs`, `room-test.cjs` y `update01-test.cjs`.

## Reglas que debe cumplir (de `CLAUDE.md`)

- `prefers-reduced-motion`, `data-nexo-ambient-motion="reduced"`, `data-nexo-quality="low"` y `body.ambient-paused`:
  **no viaja ni tiembla** (cambia de estación con un fundido; los emotes siguen, quietos), y no hay relámpagos.
- Se pausa con la pestaña oculta.
- En móvil la sala se desliza (`.home-pan`): la mascota **no mueve el scroll** del usuario.
- La mascota no tapa los 8 objetos tocables.

## Criterios de aceptación

- [ ] Con la misma hora, día y clima, elige la misma escena (determinista).
- [ ] Viaja entre estaciones con el pie apoyado en cada ancla (1440 y 390).
- [ ] Saca un libro del color del ramo y lo lleva al escritorio.
- [ ] De noche duerme en el sillón.
- [ ] Con `NexoWeather.preview('rain')` llueve en la ventana; con `'storm'` hay relámpagos y la mascota se asusta y se esconde.
- [ ] Sin internet no se rompe nada y no llueve.
- [ ] Mantiene sus cosméticos durante todo.
- [ ] Reduced-motion: sin viajes animados, sin temblores ni relámpagos.
- [ ] Las pruebas rápidas y la prueba nueva pasan.

## Pendiente / ideas fuera de este cambio

- Poses dibujadas por código: cerdito dormido y asustado (mejora sobre los emotes).
- Hueco en la estantería cuando saca el libro (técnica de "plate" como las enredaderas).
- Sonido de lluvia suave y trueno lejano (`platform/audio.js`).
- Ajuste opcional "usar mi ubicación" para el clima.
- Caminata real / rig articulado (`MASCOT_RIG_CONTRACT.md`). Es trabajo de Opus.
- Reacciones al estudio (celebrar al consolidar un concepto, pensar al fallar; `controller.react` existe), cuando haya clase.
- Mascota con conducta propia en Aprender y Entrenar.
