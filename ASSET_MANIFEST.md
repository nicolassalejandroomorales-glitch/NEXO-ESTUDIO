# Inventario de recursos — Nexo V14

## Avatar

- `dist/assets/avatar/base/`: cuerpos WebP activos de cerdito, gato y perro. El dragón histórico y sus skins sin ruta activa se retiraron; la versión V12 y el historial Git conservan copias recuperables.
- `dist/assets/avatar/skins/`: capas heredadas todavía referenciadas para las tres especies activas. El runtime diferencia la imagen de skin respecto al cuerpo y compone una capa por ranura; no genera combinaciones raster.
- `dist/avatar/vector-art.js`: arte vectorial original para nuevos cosméticos y reemplazos de nombres/arte asociados a franquicias. Sus IDs históricos siguen siendo estables para preservar inventarios.
- `dist/assets/avatar/mascots.riv` y `rive/mascots/scene.rml`: animaciones heredadas de gato y perro, solo en reposo. `dist/mascot-rive.js` elige Rive sin equipamiento y Canvas con equipamiento o movimiento reducido, para no desprender accesorios de un personaje móvil.
- `rive/companion-v2/` y `dist/assets/avatar/nexo-companion-v2.riv`: primer personaje rediseñado en Rive (cerdito), con poses integradas Idle/Read/Ready. El archivo fuente RML y los tres PNG están versionados; el binario Rive se compiló y probó localmente. No tiene huesos faciales ni anclas cosméticas: para equipamiento se conserva el Canvas anterior.
- `art-source/rooms/`: cinco ilustraciones fuente PNG de Inicio, Aprender, Entrenar, Juegos y Perfil. Se derivan del bosquejo entregado por Nicolás, sin reutilizarlo como pantalla ni copiar su texto.
- `dist/assets/home-mascot-refuge.webp` y `dist/assets/rooms/*.webp`: versiones comprimidas para las cinco habitaciones. La mascota permanece en una capa independiente. `tools/optimize-room-art.cjs` reproduce la conversión desde las fuentes.
- `dist/design-system/rooms.js`: registro de identidad y arte por habitación; la imagen base de Aprender es neutra para no fijar Orgánica sobre los otros ramos.
- `dist/avatar/contracts.js`: estados y anclas para futuras mascotas; `dist/avatar/catalog.js`: catálogo, compatibilidad y siete ranuras.

Se retiraron 62 imágenes obsoletas, aproximadamente 1,85 MB de fuentes. Las imágenes vigentes se cargan según mascota y piezas visibles; no se descargan todas al abrir Inicio.

## Estudio

- `dist/assets/exams/`: pruebas y documentos históricos preservados.
- `dist/assets/lessons/`: diagramas de Aminas.
- `dist/assets/ui/calendar-art.webp`: ilustración del calendario.
- PDF de cátedra privados: no incluidos en el proyecto exportado.

## Bibliotecas

`dist/vendor/ketcher/`, `rdkit/`, `pdfjs/`, `rive/` continúan para las funciones existentes. `npm run build` prepara GSAP, Howler, Phaser, Supabase, PostHog y FSRS locales desde las versiones fijas del lockfile. `dist/vendor/fsrs/index.umd.js` (72.009 B) se descarga solo al programar una revisión; `dist/vendor/fsrs/LICENSE` conserva la licencia MIT. Phaser, GSAP, Howler, Rive y los SDK cloud se solicitan según su función; Phaser no forma parte de la carga inicial. Biblioteca almacena metadatos/referencias y no empaqueta libros ni transcripciones privadas.
