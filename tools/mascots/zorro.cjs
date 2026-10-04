// Zorro (concepto docs/mascota/conceptos/zorro-A-vector.jpg). Artboard 400×300, mira a la derecha, en 4 patas.
// Sin manos: lleva el libro en la boca (RanuraMano bajo el hocico, mismo nombre que en las otras especies).
'use strict';
const { grad, bookProp } = require('./common.cjs');
const C = {
  line: '#3d1f12', base: '#e2622b', light: '#f58f52', far: '#b84a1f', farLight: '#cc5a28',
  white: '#fbf4ea', whiteShade: '#e8d8c6', sock: '#3b2620', iris: '#c7832f', eye: '#1f130c', blush: '#f08a7e'
};
const LINE = { color: C.line, width: 3 };
// Degradado con corte duro: naranjo arriba, "calcetín" oscuro abajo.
const sockFill = (x, top, bottom, a, cut = 0.5) => ({ line: [x, top, x, bottom], stops: [[0, a], [cut, a], [cut + 0.04, C.sock], [1, C.sock]] });

function leg(name, x0, x1, top, bottom, far) {
  const m = (x0 + x1) / 2;
  return {
    name, pivot: [m, top + 8], behind: true,
    shapes: [{ name: 'Pata', d: `M${x0} ${top} L${x0} ${bottom - 6} C${x0} ${bottom + 2} ${x0 + 4} ${bottom + 4} ${x0 + 12} ${bottom + 4} L${x1 + 8} ${bottom + 4} C${x1 + 14} ${bottom + 4} ${x1 + 14} ${bottom - 6} ${x1 + 6} ${bottom - 8} L${x1} ${top} Z`,
      fill: sockFill(m, top, bottom + 4, far ? C.far : C.base, 0.52), stroke: LINE }]
  };
}

const TAIL = 'M160 150 C120 138 70 150 45 185 C30 205 16 220 8 226 C30 236 70 258 100 256 C130 254 152 236 162 210 C168 190 166 168 160 150 Z';
const HEAD = 'M255 92 C252 70 270 52 296 52 C318 52 334 66 340 84 C346 94 352 102 358 108 C362 112 358 116 352 116 C342 118 334 122 326 128 C312 138 290 140 274 134 C260 128 256 112 255 92 Z';
// El cuerpo sube por delante en un cuello que se mete bajo la cabeza (antes la cabeza flotaba).
const BODY = 'M262 108 C256 126 240 138 212 141 C186 144 166 144 154 150 C142 158 140 176 146 192 C152 206 175 211 200 207 C232 203 264 205 286 197 C302 186 304 160 298 140 C294 126 290 116 286 108 Z';
const ear = (name, outer, inner, far) => [
  { name, d: outer, fill: { line: [0, 14, 0, 62], stops: [[0, C.sock], [0.38, C.sock], [0.42, far ? C.far : C.base], [1, far ? C.far : C.base]] }, stroke: LINE },
  ...(inner ? [{ name: name + 'Dentro', d: inner, fill: C.white, fillAlpha: .95 }] : [])
];

module.exports = {
  name: 'Zorro', width: 400, height: 300, background: '#f6ecd8',
  root: {
    name: 'Zorro', pivot: [200, 200],
    parts: [{
      name: 'Cuerpo', pivot: [158, 190],
      shapes: [
        { name: 'Cuerpo', d: BODY, fill: grad(220, 136, 220, 208, C.light, C.base), stroke: LINE },
        { name: 'Pecho', d: 'M280 120 C294 124 306 146 304 168 C302 186 296 196 286 201 L280 192 L274 200 L270 190 C266 172 268 140 280 120 Z', fill: grad(285, 128, 285, 200, C.white, C.whiteShade) },
        { name: 'CuerpoBorde', d: 'M262 108 C256 126 240 138 212 141 C186 144 166 144 154 150 C142 158 140 176 146 192 C152 206 175 211 200 207 C232 203 264 205 286 197 C302 186 304 160 298 140 C294 126 290 116 286 108', stroke: LINE },
        // Línea del muslo trasero (da volumen sin otra pieza).
        { name: 'Muslo', d: 'M152 162 C168 158 182 172 181 200', stroke: { color: C.line, width: 2.4 } }
      ],
      slots: [{ name: 'RanuraEspalda', at: [205, 140] }, { name: 'RanuraCuello', at: [268, 132] }],
      parts: [
        {
          name: 'Cola', pivot: [158, 160], behind: true,
          shapes: [
            { name: 'Cola', d: TAIL, fill: grad(120, 140, 90, 256, C.light, C.base), stroke: LINE },
            { name: 'PuntaBlanca', d: 'M8 226 C30 236 70 258 100 256 C92 248 86 238 80 226 L70 232 L64 216 L54 222 L50 206 C36 212 20 222 8 226 Z', fill: grad(40, 210, 70, 256, C.white, C.whiteShade), clip: 'Cola' },
            { name: 'ColaBorde', d: TAIL, stroke: LINE }
          ],
          slots: [{ name: 'RanuraCola', at: [70, 200] }]
        },
        leg('PataTraseraLejos', 180, 202, 196, 256, true),
        leg('PataDelanteraLejos', 274, 296, 196, 258, true),
        leg('PataTraseraCerca', 144, 168, 188, 262, false),
        leg('PataDelanteraCerca', 250, 274, 196, 266, false),
        {
          name: 'Cabeza', pivot: [272, 128],
          shapes: [
            { name: 'Cabeza', d: HEAD, fill: grad(296, 52, 300, 138, C.light, C.base) },
            { name: 'Mejillas', d: 'M282 117 C298 120 322 116 352 115 C344 122 332 128 318 134 C304 139 288 139 276 135 L266 136 L270 128 L258 126 L266 120 C270 118 276 117 282 117 Z', fill: grad(300, 115, 300, 139, C.white, C.whiteShade) },
            // Contorno solo por fuera: sin línea donde la cabeza se une al cuello y al pecho blanco.
            { name: 'CabezaBorde', d: 'M262 128 C256 118 255 104 255 92 C252 70 270 52 296 52 C318 52 334 66 340 84 C346 94 352 102 358 108 C362 112 358 116 352 116 C342 118 334 122 326 128', stroke: LINE },
            { name: 'Nariz', ellipse: [356, 110, 4.5, 3.8], fill: C.eye },
            { name: 'Sonrisa', d: 'M331 122 C337 126 344 125 349 120', stroke: { color: C.line, width: 2.4 } },
            { name: 'Ceja', d: 'M309 81 C317 76 326 77 333 82', stroke: { color: C.line, width: 2.8 } },
            { name: 'Mejilla', ellipse: [336, 110, 7, 4], fill: C.blush, fillAlpha: .35 }
          ],
          slots: [
            { name: 'RanuraCabeza', at: [292, 54] }, { name: 'RanuraCara', at: [320, 100] },
            { name: 'RanuraMano', at: [338, 132], prop: bookProp(338, 140, C.line, 6) }
          ],
          parts: [
            // Orejas detrás de la cabeza; giran juntas para el "tic" de oreja.
            { name: 'Orejas', pivot: [290, 62], behind: true,
              shapes: [
                ...ear('OrejaLejos', 'M258 66 C257 44 261 25 268 14 C281 23 291 41 293 58 Z', 'M266 58 C266 44 268 32 272 25 C279 34 284 45 285 55 Z', false),
                ...ear('OrejaCerca', 'M296 56 C298 38 304 24 314 13 C323 28 327 45 325 64 Z', null, true)
              ] },
            {
              name: 'Ojo', pivot: [320, 100],
              shapes: [
                { name: 'Iris', ellipse: [320, 99, 9, 11], fill: C.iris, stroke: { color: C.line, width: 2 } },
                { name: 'Pupila', ellipse: [322, 100, 5.5, 7.5], fill: C.eye },
                { name: 'Brillo', ellipse: [325, 95, 2.8, 2.8], fill: '#ffffff' },
                { name: 'Brillo2', ellipse: [318, 104, 1.3, 1.3], fill: '#ffffff', fillAlpha: .85 }
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
      Cabeza: { rotation: [[0, 0], [100, -0.03], [200, 0]] },
      Cola: { rotation: [[0, 0], [70, 0.06], [140, -0.04], [200, 0]] },
      // Tic de oreja de vez en cuando.
      Orejas: { rotation: [[0, 0], [150, 0], [156, -0.12, 'out'], [164, 0.03], [172, 0], [200, 0]] }
    } },
    { name: 'Parpadeo', frames: 230, tracks: {
      Ojo: { scaleY: [[0, 1], [190, 1], [196, 0.08, 'out'], [202, 1], [230, 1]] }
    } },
    // Trote liviano: patas en diagonal juntas. 0,8 s por ciclo.
    { name: 'Caminar', frames: 48, tracks: {
      Zorro: { y: [[0, 0], [12, -3], [24, 0], [36, -3], [48, 0]] },
      PataTraseraCerca: { rotation: [[0, -0.3], [24, 0.3], [48, -0.3]] },
      PataDelanteraLejos: { rotation: [[0, -0.3], [24, 0.3], [48, -0.3]] },
      PataDelanteraCerca: { rotation: [[0, 0.3], [24, -0.3], [48, 0.3]] },
      PataTraseraLejos: { rotation: [[0, 0.3], [24, -0.3], [48, 0.3]] },
      Cabeza: { rotation: [[0, 0.02], [12, -0.02], [24, 0.02], [36, -0.02], [48, 0.02]] },
      Cola: { rotation: [[0, 0.08], [24, -0.06], [48, 0.08]] }
    } },
    // Alcanzar: se para en las patas traseras, estira el hocico y toma el libro con la boca.
    { name: 'Alcanzar', frames: 100, loop: false, tracks: {
      Cuerpo: { rotation: [[0, 0], [18, 0.04], [45, -0.32], [70, -0.32], [100, 0]] },
      PataTraseraCerca: { rotation: [[0, 0], [45, 0.32], [70, 0.32], [100, 0]] },
      PataTraseraLejos: { rotation: [[0, 0], [45, 0.32], [70, 0.32], [100, 0]] },
      PataDelanteraCerca: { rotation: [[0, 0], [45, -0.6], [58, -0.25], [70, -0.6], [100, 0]] },
      PataDelanteraLejos: { rotation: [[0, 0], [45, -0.35], [58, -0.6], [70, -0.35], [100, 0]] },
      Cabeza: { rotation: [[0, 0], [45, -0.14], [58, 0.05], [70, -0.05], [100, 0.03]] },
      Cola: { rotation: [[0, 0], [45, 0.14], [70, 0.1], [100, 0]] },
      ObjetoMano: { active: [[0, 'Nada'], [58, 'Libro']] }
    } }
  ]
};
