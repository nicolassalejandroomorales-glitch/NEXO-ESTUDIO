# Avisos: bandeja + alerta de cambio de fecha

Estado: **diseño en curso**. No hay código. Cada decisión la aprueba Niquito.

## Qué

Nexo detecta avisos académicos (fechas nuevas, cambios de fecha, tareas) y los propone como tarjetas. Niquito confirma; Nexo nunca cambia el calendario solo.

## Decisiones tomadas

1. **Lectura con reglas simples** en la app (palabras clave + fechas). Sin IA.
2. **Aviso ambiguo** (ej. "se aplaza una semana"): Nexo **pregunta con una sugerencia** ("el control era 27 oct, ¿pasa al 3 nov?").
3. **Resumen en Inicio**: bloque "Avisos" **dentro del panel existente**, junto a "Próximas evaluaciones". Sin arte nuevo ni objeto nuevo en la escena.
   - Máximo 3 filas: primero cambios de fecha, luego lo que vence pronto, luego lo informativo.
   - Sin avisos: "Sin avisos pendientes", sin ocupar espacio.
   - **"Revisar" y "Ver más" llevan directo al área de Organización, pestaña Avisos** (sin ventanita).
4. **Detección de cambio**: mismo ramo + mismo tipo + fecha distinta = CAMBIO; nada parecido = NUEVO; misma fecha = se ignora; duda = pregunta.
5. Al aplicar un cambio queda un **historial** de la fecha anterior (se puede deshacer) y un aviso corto en Inicio.

## Entrada de datos (por decidir)

- **Plan A (automático):** "Conectar con Google" una vez, Nexo lee la API de Classroom (cursos, tareas con fecha límite, anuncios, materiales), solo lectura. **Requiere OAuth + proyecto en Google Cloud: pendiente de autorización explícita de Niquito** (el CLAUDE.md lo prohíbe sin permiso). Riesgos: la USACH puede bloquear apps externas; el permiso de prueba vence cada 7 días; los adjuntos de Drive no se leen en la v1 (solo aviso + enlace).
- **Plan B (manual):** pegar el texto del aviso en Organización → Avisos.
- Primer paso propuesto si se autoriza: prueba mínima de factibilidad (conectar y ver si la USACH deja pasar), sin guardar nada.

## Pendiente de diseñar

- Reglas de reconocimiento con ejemplos reales de avisos de Niquito.
- Pantalla Organización → Avisos (tarjetas nuevo/cambio, confirmación).
- Cómo se guarda el historial de cambios.
- Criterios de aceptación y pruebas.
