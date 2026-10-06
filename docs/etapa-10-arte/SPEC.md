# Etapa 10 · Arte: la Torre del Sauce

Parte del plan de `docs/clase-viva/DISENO.md` (§11, etapa 10). Diseño aprobado por Niquito el 6 oct 2026 después de 4 versiones del boceto
(`boceto-torre-del-sauce.html`, que se abre directo en el navegador; también publicado en https://claude.ai/artifact/8bijz7Jz53af1SH9DvnFzA).

## Qué (la idea)

- **La torre es el ramo:** lo que hay que aprender. Ya está construida entera; sus pisos son grupos de misiones.
  Los pisos que aún no abres están a oscuras y con niebla.
- **El sauce eres tú:** lo que ya sabes de verdad. Parte como semilla en una maceta y sube piso por piso.
- **Una torre por ramo (4):** Orgánica II, Química Analítica, Fisicoquímica II y Fisiopatología. Cada una con su piedra y el color de magia
  de su ramo (`color` en `dist/data.js`). Las otras tres se ven a lo lejos.

| Momento | Qué se ve |
|---|---|
| Antes de empezar | Torre dormida y maceta vacía |
| Diagnóstico | Se planta la semilla; lo que ya sabías aparece como **raíces** que brillan bajo la torre |
| Cada grupo de misiones | El tronco sube un piso y ese piso se ilumina y se amuebla (caldero, estantería, astrolabio, escritorio, cristales) |
| Cada concepto | Un **hilo del sauce**: brote, verde, amarillo o seco si no repasas, y **farolito** cuando lo recordaste días después |
| Camino al 7 | El sauce **rompe el techo**, el cristal de la torre flota sobre la copa y los hilos caen por fuera |

## Decisiones

- **Pixel art detallado con luz rica y estilo mágico.** Lienzo de 256 × 192 escalado sin suavizar, tramado ordenado (Bayer 4 × 4) y pocos tonos.
- **Un solo sauce que crece** (no una copa por piso): copa joven en la punta del tronco; en los pisos que ya pasó quedan ramas laterales con pocos hilos.
  Las "repisas" de hojas por piso (versión 3) se descartaron porque parecían setos.
- **Hilos finos de 1 pixel** con hojitas alternadas y punta clara; mechones de follaje en 4 tonos (luz arriba, sombra abajo);
  hilos de atrás más oscuros que los de adelante. Nada de contorno negro grueso (versión 2: parecían orugas).
- **La luz hace efecto de verdad:** haces de sol por las ventanas (mañana por la izquierda, tarde por la derecha) que el sauce bloquea;
  cada superficie se ilumina del lado de la luz; resplandor (bloom) en faroles, farolitos y cristales; sombra de la torre en el pasto.
- **Magia:** aurora y nebulosa de noche, islas flotantes con cristal, runas que orbitan, círculo rúnico, savia que late por el tronco,
  destellos en las hojas y aura del color del ramo.
- **Por qué crecer desde raíces y no desde cero:** ver avance motiva más que partir de nada (progreso regalado, Nunes y Drèze, 2006), y aquí es
  honesto: son cosas demostradas en el diagnóstico. Las hojas secas muestran el olvido real que ya calcula FSRS.
- Todo dibujado **por código**, sin imágenes externas ni arte de otros.

## Cómo (para conectarlo a la app)

1. `dist/classes/willow-tower.js`: el boceto convertido en módulo, `NexoWillowTower.mount(canvas, datos)`, con los datos reales:
   - hilos = conceptos (`cls.concepts`) con su hoja de `NexoEvidence.leaves` (semilla, brote, clara, verde, intensa, flor; amarilla y seca encima);
   - raíces = conceptos raíz (`root: true`); pisos = misiones agrupadas; techo roto = Camino al 7 completo (`goalOf`);
   - hora = el mismo reloj de luz del Inicio (`dist/ambient/time.js`).
2. Dónde se ve: reemplaza la vista previa de hojas (`leafChips`) en el cierre de misión y en "Camino al 7"; después, una vista "Mi torre" por ramo.
3. Rendimiento: dibujar a 12–20 cuadros por segundo, pausar fuera de pantalla, y respetar `prefers-reduced-motion`, `data-nexo-quality="low"`
   y `body.ambient-paused`.
4. Pruebas: que la etapa y los hilos salgan de los datos (sin navegador) y capturas en 1440 y 390.

## Criterios de aceptación

- Con los datos reales de Aminas, el sauce muestra un hilo por concepto con su estado y crece al completar misiones.
- Mañana, día, tarde y noche se ven distintos y la luz cambia de forma gradual.
- Fluido en el celular (390 px) y sin errores; ANTES/AHORA y aprobación de Niquito.

## Pendiente

- Formas propias de cada torre (hoy solo cambian piedra y color).
- El sabio dentro de la torre.
- Sonido ambiente (opcional).
