# Cómo crear una clase nueva en Nexo

Guía corta para replicar la clase de Aminas en cualquier tema, prueba o ramo. Ejemplo completo: `dist/classes/org-01.js`.

## La idea en una frase

**Una clase es un archivo de datos.** El aula (la torre del alquimista) es una sola y sabe mostrar cualquier clase. Rehacer un tema es escribir contenido, no programar.

```
Grimorio (mapa de la PEP) ──toca el tema──▶ catalog.js ¿tiene aula? ──sí──▶ Torre del alquimista
                                                      └──no──▶ "Disponible próximamente"

Torre = player.js (reproductor) + classroom.css (estilos) + tower-art.js (pinturas y objetos)
Clase = dist/classes/<tema>.js (contenido) + slides/<tema>.js (imágenes del PPT, opcional)
```

## Cómo está hecha una clase

```
Clase (por ejemplo Aminas, PEP 1)
├─ fuentes, glosario, datos curiosos, texto de diapositivas, errores típicos
└─ misiones (8 en Aminas). Cada misión:
   ├─ diagnostic   2–3 preguntas sin pistas → si aciertas todo, puedes saltar la lección
   ├─ fundamentals bases "desde cero" (prerrequisitos), con "Explícame más simple"
   ├─ explain      la materia, bloque por bloque, cada uno con su diapositiva
   ├─ worked       ejemplo resuelto; algunos pasos hay que pensarlos antes de verlos
   ├─ practice     actividades variadas, con pista de la mascota
   ├─ challenge    (opcional) desafío extra en Expedición si vas sin ayuda
   └─ transfer     problema nuevo, estilo prueba, sin ayuda
```

El **rescate** y el **cierre** no se escriben: el aula los arma solos con tus errores.

## Tipos de actividad

| Tipo | Qué hace el estudiante | Cuándo usarlo |
|---|---|---|
| `choice` | Elige una alternativa | Conceptos; cada distractor apunta a un error típico |
| `order` | Ordena tarjetas | "Ordene de menor a mayor basicidad", pasos de una síntesis |
| `classify` | Pone tarjetas en calderos | "Aromático, antiaromático o no aromático" |
| `match` | Une pares | Reactivo → producto, estructura → nombre |
| `pick` | Toca una parte de la molécula | "¿Cuál N es más básico?", "¿qué grupo manda?" |

## Paso a paso

1. **Crear el esqueleto** (ya trae un ejemplo de cada actividad):
   ```
   node tools/new-class.cjs org-04 "Aromáticos" "PEP 1"
   ```
2. **Juntar el material:** diapositivas de cátedra (Drive › 2S QYF 2026), la pauta de la prueba anterior y tus apuntes.
3. **Escribir el contenido:** reemplaza cada `REEMPLAZAR`. Una misión por grupo de diapositivas. Los ejercicios de transferencia deben copiar el formato de la prueba real.
4. **Diapositivas reales** (si tienes el PDF):
   ```
   python3 tools/classroom-art/slides.py RUTA/AL/ARCHIVO.pdf org-04
   ```
5. **Revisar:** `node tools/classroom-test.cjs` comprueba que cada actividad tenga una sola respuesta correcta, que cada error tenga su explicación y su repaso, y que los caminos funcionen.
6. **Publicar en el grimorio:**
   ```
   node tools/new-class.cjs org-04 "Aromáticos" "PEP 1" --catalogo   (o agrega la línea a mano en catalog.js)
   node tools/build-startup.cjs
   ```
   Y sube la versión `?v=` en `dist/index.html`.

## Reglas de calidad (lo que hace buena una clase)

- **Desde cero:** cada misión parte con los prerrequisitos que necesita, en lenguaje simple.
- **Cada error con nombre:** los distractores apuntan a errores típicos reales, con su porqué y qué repasar.
- **Variedad:** al menos 3 tipos de actividad por misión. Nada de solo alternativas.
- **Fuente siempre:** cada bloque y cada actividad dice de qué diapositiva sale.
- **Estilo prueba:** la transferencia copia el formato de la pauta (las preguntas y su puntaje).
- **Honestidad:** terminar no es dominar. El cierre lo dice.
- **Química revisada:** valores (pKa, puntos de ebullición) de tablas estándar; si algo no está en las diapositivas, se dice de dónde sale.

## Qué modelo usar

| Tarea | Modelo |
|---|---|
| Escribir el contenido químico de una clase | Opus 5.5 (o Fable 5.1) |
| Crear el esqueleto, convertir diapositivas, ajustes de estilo | Sonnet 5.5 |
| Buscar referencias o revisar que nada se rompió | Haiku 4.5 |
