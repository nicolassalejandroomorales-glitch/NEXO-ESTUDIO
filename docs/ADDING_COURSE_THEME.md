# Agregar un tema de ramo

1. Incorporar el ramo al catálogo académico existente; el tema visual no crea clases ni programas.
2. Añadir una entrada a `courses` en `dist/design-system/rooms.js` con `name`, `accent`, `symbol` y `material`. El identificador debe coincidir con el del catálogo académico.
3. Verificar que las rutas del ramo usan `subject/:id` o `learn/course/:id`. `NexoRooms.apply()` establecerá el acento global sin condicionales repartidos por pantallas.
4. Añadir recursos diagramáticos propios solo cuando tengan procedencia y contenido revisado. No reutilizar esquemas de Orgánica como decoración de otro ramo.
5. Ejecutar `node tools/room-test.cjs`, la regresión `node tests/run-all.cjs` y revisar capturas móvil/escritorio. Comprobar contraste del acento elegido sobre papel y tinta.

La configuración actual no publica contenido académico automáticamente; esa revisión sigue separada.
