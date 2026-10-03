# Sistema visual Arcane Study — base local

Estado: fundación aplicada al shell, Inicio, tarjetas de ramos y Juegos. No es aún la revisión completa de cada pantalla.

La hoja `dist/design-system/arcane.css` se carga después de los estilos V14 para permitir un rollback sin destruirlos. Los tokens principales están en `:root`: tinta (`--ink-*`), papel (`--paper-*`), madera (`--wood-*`), bosque, luz arcana y ámbar. Cambiar un color aquí afecta superficies compartidas; `--room-accent` se establece desde `NexoRooms.apply()` según habitación o ramo. La tipografía usa una serif de sistema para títulos y una sans de sistema para UI y lectura; los números pixel del cronómetro conservan su tratamiento propio hasta revisarlo de forma específica.

Los materiales tienen significado: papel en tarjetas de Aprender, tinta en UI densa, bosque/madera en Inicio y habitación, acento arcano para cambios de contexto. Los Juegos conservan una identidad más lúdica sin cargar Phaser. La hoja separada reemplaza los bordes gruesos y sombras pixeladas del shell, y unifica radios, foco, botones y navegación. No se usa una imagen de fondo fija como sustituto del ambiente.

Comprobación actual: capturas a 1366 px y 390 px, navegación por teclado en la regresión, sin desborde horizontal en los recorridos E2E. Se corrigió un contraste insuficiente en las tarjetas de Aprender. Siguen pendientes una auditoría sistemática de contraste/zoom y el pulido pantalla por pantalla de Perfil, Tienda y aulas.
