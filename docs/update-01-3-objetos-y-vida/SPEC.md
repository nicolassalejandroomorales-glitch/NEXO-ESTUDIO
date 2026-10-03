# UPDATE 01.3 — Báculo, mapa pirata, nuevos destinos y vida del Inicio

Estado: **implementado; pendiente de tu aprobación visual (3 oct 2026)**.

## Qué
- Un **báculo estelar** propio (madera oscura, anillos de bronce, luna creciente de bronce en la punta y una estrella dorada que cuelga de una cadena y se balancea) apoyado entre el mueble y la estantería → **Tienda**.
- Un **mapa pirata medio enrollado** en el piso, junto a los libros del escritorio → **Bitácora** (Ponderaciones).
- **Sillón → Perfil**, **estantería → Biblioteca**, **globo → Mapa de conocimiento**. El pergamino de la pared sigue llevando al **Calendario**.
- Vida (paso 3): las llamas de faroles y velas titilan, la estrella del báculo se balancea y brilla (más de noche) y hay polvo flotando en la luz del sol (solo de día).

## Decisiones
- Diseño **100 % original de Nexo**. Las referencias que mandó Niquito eran el báculo de una serie conocida, que no se reproduce; en su lugar se eligió el concepto "báculo estelar", que combina con la luna de la ventana.
- La estrella es una capa aparte (`staff-star.png`, generada por `tools/home-staff/build_star.py`) que se balancea por CSS desde la punta de la luna.
- Ambos objetos se pintan con código (`tools/home-staff/build_staff.py`, `tools/home-map/build_map.py`) sobre el original, sin modificarlo.
- Báculo y mapa están debajo del tinte del cuarto, así que reciben la luz de cada hora. El brillo de la estrella va encima, igual que los faroles.
- Las animaciones solo cambian `opacity`, `transform` o `background-position` (barato para la GPU), y se pausan con la pestaña oculta,
  con movimiento reducido o en calidad baja.

## Criterios de aceptación
1. Los 7 objetos llevan a su destino (verificado: shop, profile, planner/grades, planner/calendar, learn/library, knowledge y continuar).
2. De día se ve el polvo; de noche no. Las llamas nunca "parpadean feo" (variación de 84 % a 100 %).
3. Sin errores de consola; las pruebas rápidas pasan.

## Pendiente
- Refinar el báculo y el mapa según la opinión de Niquito (forma del anillo, tamaño del mapa, más detalle pintado).
