**Una cosa sí necesito para A1.2:** el archivo exacto `FONDO_INICIO_EXACTO.png` subido directamente a este chat. Los enlaces `C:\Users\...` que te entrega el agente existen en tu PC, pero yo no puedo abrirlos desde aquí. La imagen que tengo disponible en esta conversación es una captura de la app, no ese PNG limpio.
Cuando tengas el `OWNERSHIP_OVERLAY` también puedes subirlo. Con esos dos, podemos decidir juntos qué capa posee cada hoja/marco antes de tocar el código otra vez.
Y después volvemos a las clases sin que esta ventana nos secuestre la noche entera jajaja.

\# NEXO — UPDATE 01.3\
\## ART CHECKPOINT A1.1 — LAYER OWNERSHIP MAP\
\
Acepto la conclusión NEEDS ART REVISION de A1.\
\
NO generes nuevos candidatos de ventana todavía.\
NO intentes otra extracción automática.\
NO integres nada al runtime.\
NO publiques.\
\
El problema ya no es técnico:\
las máscaras actuales mezclan ventana, vegetación,\
marco y accesorios.\
\
Ahora necesitamos definir primero la propiedad visual\
de cada elemento.\
\
\==================================================\
OBJETIVO\
\==================================================\
\
Crear un mapa visual preciso que determine qué partes\
del PNG original pertenecen a:\
\
A. BASE / CLEAN PLATE\
B. WINDOW OBJECT\
C. FOREGROUND / OCCLUSION\
D. AMBIGUOUS / REQUIRES ART DECISION\
\
La meta es eliminar ambigüedad ANTES de producir\
los assets definitivos.\
\
\==================================================\
ENTREGABLE 1 — OWNERSHIP OVERLAY\
\==================================================\
\
Sobre una COPIA del PNG original, producir una imagen\
anotada donde se distingan claramente las cuatro categorías:\
\
BASE\
\- pared\
\- estructura arquitectónica fija\
\- superficies que deben seguir existiendo si la ventana desaparece\
\
WINDOW\
\- marco perteneciente a la ventana\
\- vidrio/vista si forma parte del objeto reemplazable\
\- ornamentación propia de esa ventana\
\
FOREGROUND\
\- hojas\
\- ramas\
\- elementos que visualmente pasan DELANTE de la ventana\
\- cualquier oclusión necesaria para conservar profundidad\
\
AMBIGUOUS\
\- elementos cuya propiedad no pueda determinarse\
&#x20; con seguridad a partir del PNG compuesto.\
\
No inventar una decisión artística para AMBIGUOUS.\
Marcarla.\
\
\==================================================\
ENTREGABLE 2 — EDGE MAP\
\==================================================\
\
Crear acercamientos de las zonas difíciles:\
\
\- borde superior\
\- laterales\
\- borde inferior\
\- intersecciones ventana/vegetación\
\- sombras\
\- accesorios pegados al marco\
\- cualquier región responsable de halos o restos\
\
Anotar qué capa debería poseer cada borde.\
\
\==================================================\
ENTREGABLE 3 — ASSET CUT PLAN\
\==================================================\
\
Crear un documento corto con:\
\
1\. bounding box de la ventana en coordenadas\
&#x20;  del original 1672 × 941;\
\
2\. lista de elementos asignados a WINDOW;\
\
3\. lista asignada a FOREGROUND;\
\
4\. lista que debe permanecer en BASE;\
\
5\. zonas que requieren reconstrucción para CLEAN PLATE;\
\
6\. zonas ambiguas que requieren decisión humana;\
\
7\. recomendación del método para cada zona:\
&#x20;  \- selección/máscara;\
&#x20;  \- pintura/clonado;\
&#x20;  \- reconstrucción;\
&#x20;  \- foreground separado.\
\
\==================================================\
IMPORTANTE\
\==================================================\
\
Los masks/candidatos anteriores pueden usarse únicamente\
como material de diagnóstico.\
\
NO asumir que sus límites son correctos.\
\
No buscar todavía paridad visual.\
Este checkpoint sólo debe responder:\
\
“¿Sabemos exactamente cómo debería dividirse\
la ilustración antes de editarla?”\
\
\==================================================\
FINAL\
\==================================================\
\
Entregar:\
\
\- OWNERSHIP_OVERLAY.png\
\- EDGE_MAP / detalles ampliados\
\- ASSET_CUT_PLAN.md\
\- listado de decisiones humanas pendientes\
\
Después DETENTE.
