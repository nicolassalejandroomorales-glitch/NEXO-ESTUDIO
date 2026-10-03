# Nexo — continuidad al 3 de octubre de 2026

Idioma de trabajo: español. El usuario está exportando su conversación y quiere continuar con contexto fiel, sin repetir implementaciones rechazadas.

## Estado vigente

La referencia aprobada es UPDATE 01.2, Nexo Sites versión 23, commit `3447e3d8cb5d735e3cfbe8afa3b246afd0d7d782`. URL de publicación registrada: https://nexo-estudio-nicolas.litnico.chatgpt.site . Se conserva el registro histórico; no se volvió a verificar ni publicar al exportar.

UPDATE 01.3 NO está terminada. El primer intento local fue rechazado por mala integración y zonas/etiquetas visibles. No recuperarlo como versión aprobada.

Checkpoint 1: arquitectura central `dist/design-system/home-scene.js`; sólo ventana, hotspot invisible, teclado, pulso de luz, responsive, día/noche y reduced-motion. Aprobación PARCIAL: patrón de interacción sí; modularidad de assets no. Ventana todavía horneada en el fondo. No replicar a biblioteca/silla/alfombra.

Checkpoint 1B: clean plate y extracciones automáticas no suficientemente fieles; detenidos, sin runtime. ART A1: candidatos por máscaras complementarias conservan exactamente el original al recomponer y no alteran píxeles fuera de selección, pero el foreground/matte falla. Resultado NEEDS ART REVISION. Cero diferencias de recomposición es una propiedad de la partición, no prueba de buena separación. No equipar esos candidatos.

Último checkpoint: ART A1.1, mapa de propiedad. Se entregaron OWNERSHIP_OVERLAY, EDGE_MAP, ocho detalles y ASSET_CUT_PLAN. No se produjeron nuevos candidatos, no se modificó el scene manifest y no se publicó. Las anotaciones no constituyen máscaras de corte aprobadas.

## Decisiones abiertas

- D1: vista exterior incorporada a ventana o capa independiente.
- D2: moldura exterior reemplazable o arquitectura fija.
- D3: pertenencia de cada grupo de plantas; estar delante no implica viajar con ventana.
- D4: límite marco inferior/alféizar/superficie fija.
- D5: política de luz y sombras pintadas al ocultar o mover ventana.
- D6: completar tramos de marco ocultos; el PNG no contiene esos detalles recuperables.
- D7: alpha/matting de bordes mixtos; no clasificar sólo por verde.

El bbox x40/y35/310×390 es una envolvente de inspección, NO un recorte definitivo.

## Límites que siguen vigentes

No integrar arte, no generar otra extracción automática ni candidatos nuevos antes de resolver propiedad y recibir autorización. No programar otros objetos ni publicar. No rediseñar ventana/habitación, cambiar colores generales o alterar el original. No tocar Supabase/SQL/OAuth/cloud/migraciones. Las migraciones existentes se empaquetan sólo como contexto; no se ejecutan.

El usuario quiere retomar clases y evitar que la ventana consuma toda la sesión. Esperar su próxima instrucción: no inferir que exportar autoriza desarrollar clases, arte o código.

## Trazabilidad histórica

El ZIP base recibido inicialmente no contenía la implementación de UPDATE 01. Los informes iniciales describían esa copia. Luego se localizó y recuperó de Biblioteca el artefacto real `nexo-update01-codigo-y-evidencia.zip`, verificándose integridad y comparación aislada. Las conclusiones iniciales de recuperación fueron superadas por la verificación posterior; leer ambas con sus fechas.

Después se publicaron actualizaciones 01.1 y 01.2. La segunda es la referencia que el usuario indicó explícitamente para el reinicio. No confundir estado histórico de un informe con permiso actual para continuar.

## Fuente limpia

05_ASSETS_CLAVE/FONDO_INICIO_EXACTO.png: 1672×941, 2.520.225 bytes, SHA-256 `2239bf1540e692c081f94e885cbda27a3dea058e5e1d924bcdb5ea30d4502c8d`. Conversión previa con píxeles idénticos al WebP aprobado, no edición generativa. Los enlaces absolutos a Windows de mensajes antiguos son referencias históricas; usar los archivos relativos del ZIP.

## Lectura sugerida

Primero este contexto y LEEME_CLAUDE; después ASSET_CUT_PLAN + dos mapas; luego instrucciones originales y transcripción si hace falta. Para producto/estudio, ACADEMIC_MODEL y los módulos academic/organic del código. No afirmar unidad del motor académico o pruebas exhaustivas sin revisarlas: coexisten sistemas y hay QA pendiente.
