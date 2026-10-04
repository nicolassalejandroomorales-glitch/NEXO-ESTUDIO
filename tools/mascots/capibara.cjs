// Capibara (concepto docs/mascota/conceptos/capibara-A-vector.jpg). Artboard 400×300, mira a la derecha, en 4 patas.
// Sin manos: lleva el libro en la boca (su RanuraMano está bajo el hocico, mismo nombre que en las otras especies).
'use strict';
const { grad, bookProp } = require('./common.cjs');
const C = {
  line: '#4b2c1a', base: '#b97a4a', light: '#d6a06c', far: '#8c5833', farLight: '#a26a40',
  muzzle: '#7a4e34', paw: '#6f452c', belly: '#c48a58', fur: '#9a6239', blush: '#e48a7a',
  leaf: '#86b55e', leafDark: '#4f7d3a', eye: '#2a1a10'
};
const LINE = { color: C.line, width: 3 };

// Pata corta y gruesa, con la parte baja más oscura (como en el concepto). Gira desde arriba (dentro del cuerpo).
function leg(name, x0, x1, top, bottom, far) {
  const m = (x0 + x1) / 2;
  const fill = far ? grad(m, top, m, bottom, C.farLight, C.paw) : grad(m, top, m, bottom, C.base, C.paw);
  return {
    name, pivot: [m, top + 10], behind: true,
    shapes: [
      { name: 'Pata', d: `M${x0} ${top} L${x0 - 1} ${bottom - 8} C${x0 - 1} ${bottom + 1} ${x0 + 4} ${bottom + 3} ${m + 2} ${bottom + 3} C${x1 + 2} ${bottom + 3} ${x1 + 5} ${bottom} ${x1 + 4} ${bottom - 6} L${x1} ${top} Z`,
        fill, stroke: LINE },
      { name: 'Dedos', d: `M${m + 2} ${bottom - 2} L${m + 2} ${bottom + 3} M${m + 10} ${bottom - 3} L${m + 10} ${bottom + 2}`, stroke: { color: C.line, width: 2 } }
    ]
  };
}

module.exports = {
  name: 'Capibara', width: 400, height: 300, background: '#f6ecd8',
  root: {
    name: 'Capibara', pivot: [200, 200],
    parts: [{
      // El cuerpo gira desde la cadera trasera: así puede pararse en dos patas para alcanzar la estantería.
      name: 'Cuerpo', pivot: [88, 196],
      shapes: [
        { name: 'Cuerpo', d: 'M210 78 C170 66 110 64 75 90 C50 108 42 140 48 170 C54 198 80 214 120 218 C160 222 220 222 262 212 C286 204 296 186 294 166 C292 140 270 110 240 92 C232 86 222 80 210 78 Z',
          fill: grad(160, 66, 170, 222, C.light, C.base), stroke: LINE },
        { name: 'Panza', d: 'M90 200 C120 214 200 218 262 206 C240 214 190 220 140 218 C116 216 100 210 90 200 Z', fill: C.belly, fillAlpha: .8 },
        { name: 'Pelaje', d: 'M120 110 L124 105 M128 112 L132 107 M170 140 L174 135 M178 142 L182 137 M90 150 L94 145 M98 152 L102 147 M200 100 L204 95', stroke: { color: C.fur, width: 2, alpha: .7 } },
        { name: 'CuerpoBorde', d: 'M210 78 C170 66 110 64 75 90 C50 108 42 140 48 170 C54 198 80 214 120 218 C160 222 220 222 262 212 C286 204 296 186 294 166 C292 140 270 110 240 92 C232 86 222 80 210 78 Z', stroke: LINE }
      ],
      slots: [{ name: 'RanuraEspalda', at: [160, 70] }, { name: 'RanuraCuello', at: [248, 140] }, { name: 'RanuraCola', at: [48, 140] }],
      parts: [
        leg('PataTraseraLejos', 104, 132, 190, 246, true),
        leg('PataDelanteraLejos', 234, 262, 186, 248, true),
        leg('PataTraseraCerca', 62, 96, 182, 254, false),
        leg('PataDelanteraCerca', 192, 228, 186, 258, false),
        {
          name: 'Cabeza', pivot: [246, 128],
          shapes: [
            { name: 'Oreja', ellipse: [232, 63, 11, 10], fill: C.base, stroke: LINE },
            { name: 'OrejaDentro', ellipse: [233, 65, 5, 5], fill: C.muzzle },
            { name: 'Cabeza', d: 'M215 80 C222 64 244 54 270 54 C300 54 326 62 340 76 C352 90 354 120 348 136 C342 150 326 154 306 154 C286 154 266 152 252 146 C236 138 222 120 216 104 C213 96 213 88 215 80 Z',
              fill: grad(270, 54, 280, 154, C.light, C.base) },
            { name: 'Hocico', d: 'M318 84 C334 80 350 88 352 108 C354 128 348 148 330 150 C318 150 312 140 312 120 C312 104 312 90 318 84 Z', fill: grad(330, 84, 340, 150, '#8a5a3c', C.muzzle) },
            { name: 'CabezaBorde', d: 'M215 80 C222 64 244 54 270 54 C300 54 326 62 340 76 C352 90 354 120 348 136 C342 150 326 154 306 154 C290 154 276 153 264 150', stroke: LINE },
            { name: 'Nariz', d: 'M337 96 C340 94 344 95 346 98', stroke: { color: C.line, width: 2.6 } },
            { name: 'Boca', d: 'M334 140 C338 144 344 143 347 139', stroke: { color: C.line, width: 2.4 } },
            { name: 'Ceja', d: 'M259 76 C267 71 278 72 285 77', stroke: { color: C.line, width: 2.6 } },
            { name: 'Mejilla', ellipse: [292, 112, 9, 5], fill: C.blush, fillAlpha: .3 }
          ],
          slots: [
            { name: 'RanuraCabeza', at: [262, 54] }, { name: 'RanuraCara', at: [273, 92] },
            { name: 'RanuraMano', at: [334, 152], prop: bookProp(334, 160, C.line, 6) }
          ],
          parts: [
            {
              name: 'Ojo', pivot: [273, 92],
              shapes: [
                { name: 'Pupila', ellipse: [273, 94, 7.5, 6], fill: C.eye },
                { name: 'Brillo', ellipse: [276, 92, 2.2, 2.2], fill: '#ffffff' },
                // Párpado tranquilo: la capibara siempre se ve relajada.
                { name: 'Parpado', d: 'M263 91 C267 86 280 86 284 92', stroke: { color: C.line, width: 2.6 } }
              ]
            },
            {
              name: 'Brote', pivot: [258, 55],
              shapes: [
                { name: 'Hoja1', d: 'M258 38 C250 28 238 28 236 34 C242 40 252 41 258 38 Z', fill: C.leaf, stroke: { color: C.leafDark, width: 2 } },
                { name: 'Hoja2', d: 'M259 37 C266 26 279 27 280 33 C273 39 264 40 259 37 Z', fill: C.leaf, stroke: { color: C.leafDark, width: 2 } },
                { name: 'Tallo', d: 'M258 56 C258 50 258 44 259 37', stroke: { color: C.leafDark, width: 2.6 } }
              ]
            }
          ]
        }
      ]
    }]
  },
  animations: [
    { name: 'Idle', frames: 200, tracks: {
      Cuerpo: { scaleY: [[0, 1], [100, 1.015], [200, 1]] },
      Cabeza: { rotation: [[0, 0], [100, 0.025], [200, 0]] },
      Brote: { rotation: [[0, -0.08], [100, 0.1], [200, -0.08]] }
    } },
    { name: 'Parpadeo', frames: 260, tracks: {
      Ojo: { scaleY: [[0, 1], [220, 1], [227, 0.1, 'out'], [234, 1], [260, 1]] }
    } },
    // Paso de cuadrúpedo: las patas en diagonal se mueven juntas. 1 s por ciclo (la capibara no tiene apuro).
    { name: 'Caminar', frames: 60, tracks: {
      Capibara: { y: [[0, 0], [15, -2], [30, 0], [45, -2], [60, 0]] },
      PataTraseraCerca: { rotation: [[0, -0.25], [30, 0.25], [60, -0.25]] },
      PataDelanteraLejos: { rotation: [[0, -0.25], [30, 0.25], [60, -0.25]] },
      PataDelanteraCerca: { rotation: [[0, 0.25], [30, -0.25], [60, 0.25]] },
      PataTraseraLejos: { rotation: [[0, 0.25], [30, -0.25], [60, 0.25]] },
      Cabeza: { rotation: [[0, 0.02], [15, -0.015], [30, 0.02], [45, -0.015], [60, 0.02]] },
      Brote: { rotation: [[0, -0.12], [30, 0.12], [60, -0.12]] }
    } },
    // Alcanzar: se para en las patas traseras, estira el cuello y toma el libro con la boca.
    { name: 'Alcanzar', frames: 110, loop: false, tracks: {
      Cuerpo: { rotation: [[0, 0], [20, 0.04], [50, -0.3], [75, -0.3], [110, 0]] },
      PataTraseraCerca: { rotation: [[0, 0], [50, 0.3], [75, 0.3], [110, 0]] },
      PataTraseraLejos: { rotation: [[0, 0], [50, 0.3], [75, 0.3], [110, 0]] },
      PataDelanteraCerca: { rotation: [[0, 0], [50, -0.5], [62, -0.2], [75, -0.5], [110, 0]] },
      PataDelanteraLejos: { rotation: [[0, 0], [50, -0.3], [62, -0.55], [75, -0.3], [110, 0]] },
      Cabeza: { rotation: [[0, 0], [50, -0.12], [64, 0.05], [75, -0.05], [110, 0.03]] },
      Brote: { rotation: [[0, 0], [50, 0.2], [80, -0.15], [110, 0]] },
      ObjetoMano: { active: [[0, 'Nada'], [64, 'Libro']] }
    } }
  ]
};
