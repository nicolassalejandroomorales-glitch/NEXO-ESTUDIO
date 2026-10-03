# Dirección visual — bosquejo de Nicolás

Referencia: imagen enviada el 29-09-2026 de «Nexo Arcane Study / cinco habitaciones». Es un bosquejo de intención, no un diseño para copiar literalmente. Los nombres de cursos, porcentajes y números dibujados en esa imagen no son datos de la aplicación.

## Invariantes

- Un mismo mundo cálido de madera, naturaleza, papel y luz ámbar. Las cinco habitaciones se distinguen por propósito; no son cinco fondos intercambiables.
- La fantasía acompaña al estudio. Las fuentes, ejercicios, fechas y acciones conservan legibilidad y prioridad.
- Inicio: refugio personal vivo, plantas, ventana, escritorio, mascota y luz de hogar. Evitar bibliotecas majestuosas y vacías.
- Aprender: grimorio y papel; el entorno general es neutral. Símbolos y diagramas propios del ramo solo al entrar en ese ramo.
- Entrenar: taller oscuro con diana y herramientas; los objetos deben adquirir función en las actividades, no solo decorar.
- Juegos: única habitación con lenguaje pixel y acentos neón; los cuatro juegos siguen marcados «Próximamente» en 1.0.
- Perfil: habitación privada y habitada, no una tabla de estadísticas flotando sobre un dormitorio.
- Mascota: personaje integrado con el mundo, siempre contextual; la pose de lectura o entrenamiento no basta por sí sola para considerarlo un rig expresivo terminado.

## Estado de la implementación

Las cinco escenas actuales son una primera base ambiental local, todavía no el sistema completo del bosquejo. El arte se registra en `dist/design-system/rooms.js`, su fuente está en `art-source/rooms/` y su entrega optimizada en `dist/assets/`. Las cabeceras de Aprender, Entrenar, Juegos y Perfil muestran escenas separadas sin cubrir la lectura; Inicio tiene la mascota como capa independiente. Falta incorporar variaciones de luz y tiempo, objetos con significado y transiciones de habitación, junto con un personaje de calidad visual consistente con los escenarios. No describir los fondos estáticos como si esas funciones ya existieran.

## Revisión visual mínima

Comparar cada habitación a 390 px y 1440 px con el bosquejo: paleta, sensación, focalización y relación entre mascota, objetos y UI. Comprobar contrastes, cortes de imagen, controles visibles, movimiento reducido y peso descargado por ruta. No aprobar por la calidad de la imagen aislada; aprobar la pantalla montada y utilizable.
