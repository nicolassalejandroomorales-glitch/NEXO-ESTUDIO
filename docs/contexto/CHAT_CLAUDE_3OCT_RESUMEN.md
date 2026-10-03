# Chat con Claude (Cowork) — 3 de octubre de 2026

Resumen de la primera sesión trabajando Nexo con Claude, después de migrar desde ChatGPT/Codex.

## Configuración que quedó lista
- La app está en `C:\Users\Hp\Desktop\NEXO_APP_ACTUAL`, conectada a Claude y bajo **Git** (primer commit `f728d1e`).
- Instalados: Git 2.55, Node v24.19 y VS Code 1.140. También se conectaron Google Drive y Google Calendar.
- Para levantar la app: `node tools/static-server.cjs` y abrir `http://127.0.0.1:8765/#/home`. Se apaga con Ctrl+C.
- Recomendación: para programar, usar la pestaña **Code** (Claude Code) en esa carpeta. Lee `CLAUDE.md` solo y tiene terminal.
- SDD: usar una versión liviana, con un `SPEC.md` por cambio en `docs/`. Evitar escribir más documentos que producto.

## Evaluación honesta de la app (resumen)
- **Fortalezas:** el modelo pedagógico (estados por evidencia, FSRS, diagnóstico por dos familias de problemas) calza con la investigación
  sobre práctica de recuperación y repaso espaciado (Roediger & Karpicke 2006; Cepeda et al. 2006; Dunlosky et al. 2013).
  Además usa el material real de los ramos y tiene una identidad visual propia.
- **Debilidades:** es ancha y poco profunda (el motor bueno solo existe en Aminas, mientras hay tienda, skins, rangos y nube);
  el texto libre no se corrige; la experiencia se rompe al entrar a estudiar; `app.js` es un archivo enorme.
- **Recomendación:** una clase completa que se sienta increíble de principio a fin (Aminas → Basicidad para la PEP 1),
  antes de agregar más funciones.

## Lo que se hizo en el Inicio (en orden)
1. **Ventana:** de las 7 decisiones del A1.1, Niquito eligió "cambiar la vista", y con eso se resolvieron 6.
   La vista exterior pasa por amanecer, día, atardecer y noche (estrellas y luna). El marco y las plantas no se tocan.
2. **Noche coherente:** se quitaron las manchas de sol pintadas en el piso (por división de la ganancia de luz) y se encendieron 12 faroles y velas.
3. **Luz continua:** pesos `--w-dawn/day/dusk/night` y fundidos de 5 min, sin saltos. En la consola: `NexoAmbientTime.timelapse()`.
4. **Objetos tocables** (mismo router que los botones): báculo → Tienda, sillón → Perfil, mapa enrollado → Bitácora (Ponderaciones),
   pergamino → Calendario, estantería → Biblioteca, globo → Mapa de conocimiento, escritorio → Continuar.
5. **Objetos nuevos pintados por código:** mapa pirata (le gustó) y báculo estelar.
   El primer báculo no le gustó. Las referencias que mandó después eran el báculo de Rudeus (Mushoku Tensei), que no se puede recrear;
   eligió como alternativa original el "báculo estelar" (luna creciente de bronce y una estrella colgante que se balancea).
6. **Vida:** llamas que titilan, polvo en la luz (de día) y estrella que brilla. Todo respeta el movimiento reducido.

## Preferencias de Niquito que se descubrieron
- Le encantan las imágenes **ANTES/AHORA** y los GIF del cambio.
- Quiere que la luz cambie **de a poco**, nunca de golpe.
- Está aprendiendo: hay que explicarle cada comando y cada decisión técnica en simple.

## Pendiente
- Opinión de Niquito sobre el báculo estelar.
- En móvil, el lado derecho (estantería y sillón) queda casi fuera de cuadro.
- Iconos propios de Calendario y Tienda. Hojas con más vida.
- Bug: `tools/static-server.cjs` no declara el MIME de `.svg`.
- Lo importante del producto: la clase completa de Aminas.
