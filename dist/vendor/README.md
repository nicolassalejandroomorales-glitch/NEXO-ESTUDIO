# Bibliotecas locales del aula de Orgánica

- **Ketcher 3.18.0**, aplicación standalone oficial, [código fuente](https://github.com/epam/ketcher), Apache-2.0. Se carga en un iframe del mismo origen solo cuando el estudiante abre el editor. Su archivo principal se distribuye en dos partes byte por byte para respetar el límite de 25 MB por archivo del hosting; un cargador local recompone el código original en memoria. Las partes y su SHA-256 se comprueban en `tools/organic-content-test.cjs`. Licencia en `ketcher/LICENSE.txt`.
- **RDKit.js 2026.3.6**, [código fuente](https://github.com/rdkit/rdkit-js), BSD-3-Clause. El paquete JavaScript y WASM se cargan al dibujar o comprobar una estructura. Licencia en `rdkit/LICENSE.txt`.
- **PDF.js 6.3.289**, [código fuente](https://github.com/mozilla/pdf.js), Apache-2.0. El módulo y su worker se cargan al elegir un PDF local. Licencia en `pdfjs/LICENSE`.

Los PDF de cátedra no forman parte de `dist`. Ketcher y RDKit pueden comprobar **conectividad, valencia y carga representadas**, no el razonamiento escrito, mecanismo, condiciones de reacción o equivalencia de todas las representaciones. Una respuesta aparentemente rechazada puede requerir revisión humana.
