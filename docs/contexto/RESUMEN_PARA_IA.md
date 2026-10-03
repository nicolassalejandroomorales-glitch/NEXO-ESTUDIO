# Continuidad de Nexo

Resumen elaborado exclusivamente a partir del transcript recuperado. No verifica el estado actual del código ni convierte propuestas en implementaciones.

## Objetivo y decisiones expresadas

Nexo busca aprendizaje exigente, preparación real para evaluaciones y una experiencia entretenida con poca fricción. El usuario rechaza la falsa sensación de dominio que producen respuestas demasiado fáciles o guiadas.

- Ruta recomendada con libertad para desviarse: opción 1B.
- Sesión adaptada al tiempo disponible, por ejemplo dos horas de Orgánica, al avance, dificultades, diagnóstico y prerrequisitos.
- Inicio adaptativo según conocimiento previo: 3C.
- Fuente accesible mediante botón y vista dividida opcional: la respuesta del asistente interpreta el acuerdo del usuario así.
- Actividades variadas; escribir cuando aporte evidencia y evitar monotonía: conexiones, mapas, dibujo, clasificación, ordenamiento y resolución.
- Respuesta distinta según tipo de error: 6D.
- Material del semestre actual como guía de la ruta.
- Laboratorios con metodología específica; recuperar lo indicado por profesores cuando existan transcripciones. El usuario dice que le falta un paso para Whisper local; su funcionamiento no está confirmado.
- Calendario personalizado, útil y conectado con el aprendizaje.

## Arquitectura propuesta en el chat

Nexo Academic Engine reúne Study Engine, Lab Engine y Planner Engine alrededor de un Student Model. Se propone reutilizar componentes guiados por datos, con lógica de evaluación específica por actividad; no crear una página independiente por clase. El Student Model debería reunir objetivos, errores, desempeño, revisión y evaluaciones.

Separar exposición, desempeño actual y retención posterior. Vincular Aprender → errores → Entrenar → revisión. Los bloques del calendario deberían tener razones explicables y poder recalcularse según preferencias. Para laboratorios se propone antes/durante/después; es una propuesta, no la metodología del profesor ya recuperada.

Conservar procedencia: material/diapositiva, minuto de clase, interpretación de Nexo y ejercicio generado. La jerarquía de fuentes discutida prioriza semestre actual y clases actuales, después material histórico, bibliografía oficial y contenido generado.

Primera prueba académica propuesta: Química Orgánica II → PEP 1 → Aminas → Basicidad. Diseñar antes de programar: diagnóstico, explicación, ejemplo, práctica, error/rescate, transferencia, fuente y cierre. Probar una segunda clase diferente sería una prueba de reutilización arquitectónica. No hay evidencia aquí de implementación de esa secuencia.

## Arte: estado reportado y siguiente paso

UPDATE 01.3 busca una ventana modular del fondo de Inicio, referencia 1672 × 941. Capas objetivo: home-room-clean.png, window-default.png y foreground si corresponde. Preservar el original FONDO_INICIO_EXACTO.png.

El usuario reportó A1: NEEDS ART REVISION. Tres PNG candidatos y fuente con capas; recomposición exacta, pero máscaras que mezclan hojas, marco y accesorios. Al ocultar la ventana quedan restos. No integrar esos candidatos. El informe afirma que original, runtime y manifiesto permanecen intactos y no hubo publicación; estas son afirmaciones del chat, no una auditoría actual.

Siguiente checkpoint propuesto: ART A1.1 — Layer Ownership Map. Definir BASE, WINDOW, FOREGROUND y AMBIGUOUS; producir overlay, detalles de bordes y ASSET_CUT_PLAN con bounding box, elementos, reconstrucciones y decisiones humanas pendientes. No generar nuevos candidatos, integrar ni publicar en ese checkpoint. Las zonas ambiguas requieren decisión artística. La edición A1.2 vendría después.

No confundir el A1 académico con el A1 artístico: son dos secuencias diferentes.

## Límites y continuidad recomendada

Leer los mensajes originales antes de actuar; distinguir decisiones del usuario de propuestas del asistente. No inferir versiones, dependencias, despliegues o estado del repositorio a partir de este paquete. Revisar los archivos de diagnóstico A1 como candidatos rechazados. El historial anterior, referencias incompletas a opciones y una captura mencionada no fueron recuperados por el servicio.
