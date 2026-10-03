# Nexo — instrucciones para Claude

Este archivo es la "memoria del proyecto". Cualquier sesión de Claude (Claude Code o Cowork) debe leerlo antes de trabajar.

## Quién y para qué

- Autor: **Niquito**, estudiante de 2º año de Fisicoquímica en la USACH. Está **aprendiendo a programar sobre la marcha**.
  Hay que explicarle cada cambio en simple: qué es, por qué y qué comando ejecuta él.
- Idioma: **español** (chileno, cercano). Respuestas directas, no muy largas.
- Le gustan mucho las **imágenes ANTES/AHORA** de cada cambio visual: entrégalas siempre que algo cambie en pantalla.
- Le gustan las afirmaciones respaldadas por estudios o evidencia concreta.

**Nexo** es una app de estudio con 3 objetivos (en este orden):
1. **Aprender de verdad**: nada de falsa sensación de dominio. Hay que pedir evidencia: acertar sin ayuda, transferir y recordar después.
2. **Prepararse de verdad para las evaluaciones**: la ruta sigue el material del semestre actual y se adapta al tiempo, al conocimiento previo y a los errores.
3. **Que sea entretenido y con poca fricción**: el "refugio" (Inicio), la mascota y el grimorio.

## Cómo correr la app

```powershell
cd $HOME\Desktop\NEXO_APP_ACTUAL
node tools/static-server.cjs        # luego abrir http://127.0.0.1:8765/#/home  (Ctrl+C para apagar)
node tools/build-startup.cjs        # OBLIGATORIO después de editar módulos de dist/ que van en el bundle
node smoke-test.cjs; node tools/room-test.cjs; node tools/update01-test.cjs   # pruebas rápidas
```

- No hay framework ni paso de compilación: **el código fuente vive directo en `dist/`**.
- `dist/startup-bundle.js` es **generado**: nunca editarlo a mano. Edita los módulos (por ejemplo `design-system/home-scene.js`, `ambient/time.js`) y regenera.
- Al cambiar CSS o JS, sube la versión `?v=` en `dist/index.html` para que el navegador no use la copia vieja.
- Debug de escena: `http://127.0.0.1:8765/?debugScene=true#/home`.
- Luz en la consola (F12): `NexoAmbientTime.timelapse()`, `NexoAmbientTime.preview(21)` y `NexoAmbientTime.stopPreview()`.

## Mapa del código (lo importante)

| Archivo | Qué es |
|---|---|
| `dist/app.js` | Router (`routeTo`, `renderRoute`) y la mayoría de las pantallas. Es grande (236 KB); hay que extraerlo por partes con cuidado. |
| `dist/design-system/home-scene.js` | **Única fuente de verdad del Inicio**: capas, objetos tocables (hotspots) y anclas de la mascota, en coordenadas del arte 1672×941. |
| `dist/design-system/update01.css` | Estilos del Inicio y del grimorio. Al final están las capas de luz, los objetos y la "vida". |
| `dist/platform/animation.js` | Transiciones: intro/reapertura/cierre del grimorio, cambio de página y capítulo. |
| `dist/ambient/time.js` | Reloj de luz: escribe `--w-dawn/--w-day/--w-dusk/--w-night` (suman 1) y `data-nexo-time`. |
| `dist/academic/*` | Motor académico: conceptos, evidencia, estados de conocimiento y FSRS. Hoy el piloto es solo **org-01 / Aminas**. |
| `dist/data.js`, `semester-2026.js`, `organic-*.js` | Catálogo de ramos, fechas y contenido. |
| `tools/` | Pruebas `*.cjs` y scripts de arte en Python (`window-views/`, `home-night/`, `home-staff/` [báculo + estrella], `home-map/`, `home-leaves/` [hojas que se mecen], `grimoire-cover/` [portada del grimorio], `grimoire-pages/` [decoración por ramo], `grimoire-audio/` [sonidos]). |
| `docs/` | Una carpeta por cambio, cada una con su `SPEC.md`. `docs/contexto/` guarda la visión original y el historial de ChatGPT. |

## Reglas del Inicio (escena)

- `dist/assets/home-scenes/refugio-012.png` es el arte original aprobado: **nunca se modifica**. Todo se agrega como capas encima.
- Cada asset nuevo se genera con un **script reproducible** en `tools/` (no a mano), que lee el original y escribe en `dist/assets/home-scenes/`.
- Los objetos tocables **usan el mismo router** que los botones normales (`data-route` / `data-route-sub`). Son invisibles: sin etiquetas ni bordes, solo un brillo suave al pasar el mouse.
- Toda capa de luz usa los pesos `--w-*` o `--sun` / `--lamps` para que el cambio sea gradual. No crear reglas nuevas por estado (`body[data-nexo-time=...]`) en el Inicio.
- Respetar `prefers-reduced-motion`, `data-nexo-ambient-motion="reduced"`, `data-nexo-quality="low"` y `body.ambient-paused`.
- En móvil (≤700 px) la sala se desliza de lado dentro de `.home-pan` (no se recorta).
- Objetos actuales: ventana (pulso de luz), báculo → Tienda, sillón → Perfil, mapa enrollado → Bitácora (ponderaciones), pergamino → Calendario, estantería → Biblioteca, globo → Mapa de conocimiento, escritorio → Continuar estudiando.

## Forma de trabajo (SDD liviano)

1. Antes de programar, una página en `docs/<cambio>/SPEC.md`: **qué**, **decisiones**, **cómo**, **criterios de aceptación** y **pendiente**.
2. Implementar en pasos chicos. Probar en desktop (1440) y en móvil (390), y correr las pruebas rápidas.
3. Mostrar ANTES/AHORA y **esperar la aprobación visual** de Niquito.

## Git y sincronización (lo hace Claude, no Niquito)

- Al empezar cada sesión local: git fetch y, si hay cambios nuevos en
  GitHub, git pull. Cuéntame en una línea qué llegó.
- Cuando yo apruebe un cambio, haz el commit con un mensaje claro en
  español y súbelo (git push) sin que yo lo pida.
- Nunca uses force push, nunca subas .env ni claves.
- Si hay un conflicto o algo raro, detente y explícamelo en simple
  antes de hacer nada.

## Límites (no hacer sin permiso explícito)

- No tocar Supabase, SQL, migraciones, OAuth ni nada de cloud. No publicar en el Site.
- No borrar archivos del usuario. No reescribir la app desde cero.
- No copiar arte de otros artistas ni objetos o personajes de series conocidas (por ejemplo, el báculo de Rudeus de Mushoku Tensei): solo diseños propios.

## Estado al 3 oct 2026

- Base: UPDATE 01.2 (Sites v23) + Checkpoint 1. En Git desde el commit `f728d1e`.
- Hecho en Claude: vista de la ventana según la hora, noche coherente (sin manchas de sol, faroles encendidos),
  luz continua, 7 objetos tocables, báculo estelar y mapa pintados por código, llamas que titilan, estrella que se balancea y polvo en la luz.
- UPDATE 01.4 (cierre del Inicio): báculo v2, mapa envejecido, sala deslizable en móvil, 4 enredaderas que se mecen
  (`tools/home-leaves/`), iconos propios de Bitácora y Tienda. Ver `docs/update-01-4-cierre-inicio/SPEC.md`. Pendiente su aprobación visual.
- UPDATE 01.5 (grimorio): portada pintada por código (`tools/grimoire-cover/`), intro ceremonial de 2,3 s, reapertura corta,
  cierre al volver al refugio, cambio de página corregido y sonido de apertura. Ver `docs/update-01-5-grimorio/SPEC.md`.
- UPDATE 01.6: páginas decoradas por ramo (`tools/grimoire-pages/`), cambio de página con hoja curvada y sonidos sintetizados
  (`tools/grimoire-audio/`). Ver `docs/update-01-6-paginas/SPEC.md`.
- UPDATE 01.7: páginas llenas de dibujos, sonido suave e intro épica una vez por sesión. Ver `docs/update-01-7-grimorio-epico/SPEC.md`.
- Pendiente del producto (lo más importante): **una clase completa que se sienta increíble** (Orgánica II → PEP 1 → Aminas → Basicidad),
  con corrección real y actividades variadas. Ver `docs/contexto/RESUMEN_OBJETIVOS_NEXO.md`.
- Arreglado: `tools/static-server.cjs` ya declara el MIME de `.svg`.
