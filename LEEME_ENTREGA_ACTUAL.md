# Nexo — última copia local disponible, 3 de octubre de 2026

Esta entrega contiene el producto actual de `work/update01_3_ventana`, copiado byte por byte: código, dist ejecutable, assets, contenido académico, documentación y pruebas existentes. No se reconstruyó ni publicó al empaquetar.

## Estado exacto

Base: UPDATE 01.2 aprobada, Sites versión 23, commit 3447e3d8cb5d735e3cfbe8afa3b246afd0d7d782. Sobre ella está el Checkpoint 1 local de UPDATE 01.3: interacción invisible de ventana, foco/teclado, pulso y configuración central de escena. Aprobación PARCIAL del patrón de interacción. UPDATE 01.3 no está terminada ni esta copia fue publicada.

La ventana sigue formando parte del fondo. Los candidatos de separación 1B/A1 fueron rechazados y no están incorporados a esta app. A1.1 sólo produjo mapas de propiedad y decisiones pendientes; esos materiales están en el ZIP de contexto completo. No convertirlos en máscaras aprobadas.

## Abrir esta copia

Extraer todo el ZIP. Con Node.js disponible, abrir una terminal en esta carpeta y ejecutar `node tools/static-server.cjs`. Visitar http://127.0.0.1:8765/#/home . El servidor existente usa ese puerto fijo; debe estar libre. No se necesita regenerar dist para esta vista previa. Algunas pruebas requieren dependencias adicionales y adaptación de rutas del entorno original.

No ejecutar automáticamente build, scripts de cloud, Supabase ni migraciones. El sitio histórico registrado es https://nexo-estudio-nicolas.litnico.chatgpt.site ; su publicación no se volvió a verificar durante esta entrega.

## Alcance y exclusiones

Se conservan todos los archivos de producto presentes en la fotografía preparada para exportar. Se excluyen .git, .env (también .env.example), node_modules, cachés y herramientas instaladas. Se conservan package.json y lockfile. Assets y vendors web en dist sí están incluidos. Las migraciones existentes se copian únicamente como contexto: no se aplicaron.

El contenido académico está incluido; los datos personales de progreso y sesión del navegador/localStorage no se exportaron. No se añaden credenciales privadas. Este ZIP no contiene la transcripción del chat ni todas las capturas históricas; están en NEXO_PARA_CLAUDE_2026-10-03.zip.

## Para Claude

Lee esta nota y los documentos del checkpoint antes de proponer trabajo. Ésta es la última copia local del producto, no una aprobación de toda UPDATE 01.3. Espera instrucciones del usuario antes de modificar código, integrar assets, publicar o tocar servicios.
