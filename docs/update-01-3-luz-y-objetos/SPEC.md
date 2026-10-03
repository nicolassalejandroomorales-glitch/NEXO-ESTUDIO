# UPDATE 01.3 — Luz continua + objetos tocables del Inicio

Estado: **implementado; pendiente de tu aprobación visual (3 oct 2026)**. Sin publicar.

## A. Luz continua

### Qué
La iluminación de la sala cambia de a poco durante el día, sin saltos a las 17:00 ni a las 20:00.
Esto incluye la vista de la ventana, el tinte del cuarto, las manchas de sol, los faroles, la luz que entra y la mascota.

### Cómo
- `ambient/time.js` calcula 4 pesos que suman 1 y los escribe como variables CSS en `<body>`:
  `--w-dawn`, `--w-day`, `--w-dusk`, `--w-night`.
  Las horas clave son: noche hasta 5:00 → amanecer pleno 6:30 → día pleno 9:00 → día hasta 16:30 → atardecer pleno 18:30 → noche plena 20:30.
  Entre dos horas clave el cambio es lineal.
- Cada capa usa esos pesos en su `opacity` o en sus colores (`calc()`). La hora se recalcula cada 5 min y la opacidad se funde
  durante 5 min (`transition: opacity 300s linear`), así que el cambio nunca se nota como un salto.
- La primera pintura al abrir la app no tiene fundido: se ve directo la luz correcta.
- Las reglas antiguas por estado (`body[data-nexo-time=...]`) quedan neutralizadas en el Inicio. `data-nexo-time` se sigue escribiendo para el resto de la app.
- La vista de la ventana pasó a ser tres capas (amanecer, atardecer y noche) que se funden entre sí.
- Herramientas de prueba en la consola (F12):
  `NexoAmbientTime.preview(19)` salta a las 19:00 con un fundido corto,
  `NexoAmbientTime.timelapse()` recorre 24 h en 40 s,
  `NexoAmbientTime.stopPreview()` vuelve a la hora real.

## B. Objetos tocables (navegación diegética)

| Objeto | Destino | Cómo |
|---|---|---|
| Pergamino de la pared | Bitácora / calendario | `data-route="planner"` + `data-route-sub="calendar"` |
| Estantería derecha | Perfil | `data-route="profile"` |
| Globo dorado | Tienda | `data-route="shop"` |
| Escritorio | Continuar estudiando | hace clic en el botón "Abrir mapa de preparación" |
| Ventana | pulso de luz | sin cambios |

- Usan **el mismo router** que los botones normales: no se duplica lógica.
- Son invisibles. Al pasar el mouse o enfocarlos con Tab aparece un brillo suave y redondo; además tienen nombre accesible y tooltip nativo.
- Las zonas están en `home-scene.js` → `hotspots`, en coordenadas del arte (fuente 1672×941). Se ven con `?debugScene=true`.

## Criterios de aceptación

1. Entre 16:30 y 20:30 la sala cambia de a poco, sin saltos visibles.
2. De día el Inicio se ve como el original.
3. Los 4 objetos llevan a su destino con clic y con Enter.
4. No aparecen etiquetas ni bordes en uso normal.
5. `smoke-test`, `room-test` y `update01-test` pasan, sin errores de consola.

## Pendiente
- En móvil la estantería queda casi fuera de cuadro; habría que revisar el encuadre.
- Paso 3 (vida): llamas que parpadean, polvo en la luz y hojas.
