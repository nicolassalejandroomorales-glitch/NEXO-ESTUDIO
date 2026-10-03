# Batalla con esquiva (inspirada en el género de Undertale) — SPEC borrador, 3 oct 2026

Parte de `docs/juegos/SPEC.md`. Estado: **borrador, esperando decisiones de Niquito**.

## Qué

Un combate por turnos con dos fases, para el área de Juegos (candidato a **Boss Arena**):
1. **Turno del estudiante**: acciones de estudio variadas (no solo preguntas).
2. **Turno del enemigo**: una fase de **esquivar** ataques dentro de una caja, moviendo un pequeño símbolo (un "alma" propia de Nexo).

Con **música de combate épica** que cambia según la fase.

## Límite de propiedad intelectual (de la visión original, `docs/contexto/VISION_ARCANE_STUDY_ORIGINAL.txt`)

Solo se toma la inspiración conceptual (turno de decisión + esquiva). **Nada** de assets, interfaz, personajes, música ni nombres de Undertale
(ni copiar o imitar piezas concretas como Megalovania). Todo diseño y música propios.

## Decisiones propuestas

1. **El conocimiento cambia la esquiva; la esquiva nunca cambia el conocimiento.**
   - Respuesta correcta y sin ayuda → daño al jefe, caja de esquiva más grande o escudo.
   - Respuesta incorrecta → el jefe ataca más fuerte, y **el patrón de balas representa el error** (p. ej. caen protones H⁺ si fallaste en protonación).
   - Esquivar bien no suma evidencia ni "dominio". Solo da sensación de juego. Así nadie "aprueba" química por tener buenos reflejos.
2. **Turno del estudiante: acciones variadas** (reusando los validadores de `dist/academic/structured.js`):
   - *Predecir*: elegir quién gana/qué ocurre (decisiones discretas, verificadas).
   - *Ordenar*: ordenar los pasos de un mecanismo.
   - *Clasificar*: arrastrar moléculas a su categoría (ej. por basicidad).
   - *Analizar*: pedir una pista (cuenta como ayuda; el daño baja).
   - Un jefe no se derrota con un solo tipo de acción.
3. **Evidencia**: igual que en el SPEC de Juegos: solo respuestas verificadas, `activityType:'game'`, errores alimentan Error Hunter y revisiones FSRS.
4. **Tecnología**: **Phaser** (ya instalado, `dist/game/manager.js`) para la esquiva; el turno del estudiante en HTML/CSS normal sobre el mismo panel.
5. **Controles**: teclado (flechas/WASD) y **joystick táctil** en móvil (390 px). Objetivo de poca fricción: se juega con una mano.
6. **Accesibilidad y seguridad visual**: respeta `prefers-reduced-motion` (balas más lentas, sin destellos), modo "sin daño" opcional, y **nada de parpadeos
   rápidos** (máx. 3 destellos por segundo).
7. **Música (diseño propio)**:
   - Generada con script reproducible, como el audio del grimorio (`tools/games-audio/`, salida en `dist/assets/audio/`), composición original.
   - **Por capas**: base + percusión + melodía. La percusión sube en la fase de esquivar; la melodía crece cuando al jefe le queda poca vida.
   - Aviso honesto: la música sintetizada por código suena **chiptune/synth épico**, no orquesta de película. Si quieres sonido orquestal, hay que
     componerla tú o usar música con licencia libre (CC0/atribución) y registrar la fuente.

## Cómo (en pasos chicos)

1. Aprobar este SPEC y decidir estilo de música y arte.
2. **Prueba técnica de esquiva**: caja + símbolo + 3 patrones de balas, teclado y táctil. Sin química todavía. Ver si "se siente bien".
3. Conectar **un** jefe de Aminas (Basicidad) con 3 acciones de estudio y `recordAttempt`.
4. Música v1 en capas y volumen/mute conectados a `NexoAudio`.
5. Probar en 1440 y 390 px; ANTES/AHORA; aprobación visual de Niquito.

## Criterios de aceptación

- La esquiva corre fluida (60 fps en desktop, sin tirones en móvil) y se puede jugar con teclado y con el dedo.
- Una pelea completa deja intentos/evidencia verificada con `activityType:'game'`, sin duplicar al reintentar.
- Esquivar perfecto con respuestas incorrectas **no** sube el estado de conocimiento.
- La música hace loop sin clic, respeta el mute de Nexo y se pausa con la pestaña oculta.
- `prefers-reduced-motion` y modo sin daño funcionan.

## Pendiente (preguntas para Niquito)

- ¿Música: sintetizada por código (chiptune/synth épico, rápida de iterar) o la compones/consigues con licencia libre?
- ¿Quién es el jefe y cómo se ve? (idea inicial: la propia molécula/concepto, p. ej. un "Jefe Amina")
- ¿El alma del jugador es la mascota de Nexo o un símbolo nuevo?
- ¿Ruta de "perdón" (resolver el combate explicando bien, sin dañar) además de ganar por daño?
- Arte: ¿pixel art hecho por código como el refugio, o algo más simple primero?
