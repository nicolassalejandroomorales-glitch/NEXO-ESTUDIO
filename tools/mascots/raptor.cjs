// Velociraptor (concepto docs/mascota/conceptos/raptor-A-vector.jpg). Artboard 400×300, mira a la derecha.
// Las partes se listan de ATRÁS hacia ADELANTE. Coordenadas absolutas del artboard; cada parte gira en su pivote.
'use strict';
const C = {
  line: '#4a3f17', base: '#b39d3e', light: '#d2bf62', far: '#8f7b2c', farLight: '#a8913a',
  stripe: '#6e6024', cream: '#f3e5b5', creamDark: '#dcc98f', eye: '#2a1f12', blush: '#e88a6a',
  book: '#8e3b2e', bookDark: '#6a2a20', gold: '#e3b04b', page: '#fbf3dc'
};
const LINE = { color: C.line, width: 3 };
const grad = (x1, y1, x2, y2, a = C.light, b = C.base) => ({ line: [x1, y1, x2, y2], stops: [[0, a], [1, b]] });
const stripe = (name, x1, y1, x2, y2, w = 6, clip) => ({ name, d: `M${x1} ${y1 - 6} L${x2} ${y2}`, stroke: { color: C.stripe, width: w }, clip });

// Pierna de ave: muslo (adelante) → canilla (hacia atrás) → pie (hacia adelante, sobre los dedos) con garra en hoz.
// far = la pierna de atrás, más oscura. o = cadera.
function leg(name, o, far) {
  const [hx, hy] = o, T = (x, y) => `${hx + x} ${hy + y}`;
  const fill = far ? grad(hx, hy - 20, hx, hy + 90, C.farLight, C.far) : grad(hx - 10, hy - 20, hx + 10, hy + 50);
  return {
    name, pivot: o,
    shapes: [
      // El muslo se funde con el cuerpo: relleno sin contorno + contorno solo por delante y abajo.
      { name: 'MusloBorde', d: `M${T(22, -10)} C${T(30, 4)} ${T(26, 22)} ${T(16, 32)} C${T(10, 38)} ${T(0, 38)} ${T(-4, 30)}`, stroke: LINE },
      { name: 'Muslo', d: `M${T(-22, -8)} C${T(-18, -26)} ${T(12, -26)} ${T(22, -10)} C${T(30, 4)} ${T(26, 22)} ${T(16, 32)} C${T(10, 38)} ${T(0, 38)} ${T(-4, 30)} C${T(-12, 18)} ${T(-26, 8)} ${T(-22, -8)} Z`, fill }
    ],
    parts: [{
      name: name + 'Canilla', pivot: [hx + 8, hy + 30],
      shapes: [{ name: 'Canilla', d: `M${T(2, 26)} C${T(8, 24)} ${T(16, 28)} ${T(14, 36)} L${T(4, 60)} C${T(2, 66)} ${T(-6, 66)} ${T(-7, 60)} L${T(0, 34)} Z`, fill, stroke: LINE }],
      parts: [{
        name: name + 'Pie', pivot: [hx - 2, hy + 62],
        shapes: [
          { name: 'Pie', d: `M${T(-7, 58)} C${T(-3, 54)} ${T(4, 56)} ${T(6, 62)} L${T(16, 84)} C${T(26, 85)} ${T(38, 86)} ${T(46, 89)} C${T(51, 91)} ${T(50, 95)} ${T(44, 95)} L${T(12, 95)} C${T(4, 95)} ${T(0, 91)} ${T(0, 86)} L${T(-8, 64)} Z`, fill, stroke: LINE },
          { name: 'Hoz', d: `M${T(8, 88)} C${T(2, 82)} ${T(6, 72)} ${T(15, 72)} C${T(11, 76)} ${T(11, 81)} ${T(14, 88)} Z`, fill: C.line, stroke: { color: C.line, width: 1.5 } },
          { name: 'Uñas', d: `M${T(46, 89)} C${T(51, 90)} ${T(53, 93)} ${T(51, 97)} M${T(32, 92)} C${T(36, 93)} ${T(37, 96)} ${T(35, 98)}`, stroke: { color: C.line, width: 2.5 } }
        ]
      }]
    }]
  };
}
// Brazo corto con tres garritas cortas.
function arm(name, o, far) {
  const [sx, sy] = o, T = (x, y) => `${sx + x} ${sy + y}`;
  const fill = far ? C.far : grad(sx - 6, sy - 6, sx + 10, sy + 26);
  return {
    name, pivot: o,
    shapes: [
      { name: 'Garras', d: `M${T(17, 27)} C${T(22, 29)} ${T(24, 33)} ${T(21, 37)} M${T(13, 29)} C${T(16, 33)} ${T(15, 37)} ${T(11, 39)} M${T(9, 28)} C${T(9, 32)} ${T(7, 35)} ${T(3, 36)}`, stroke: { color: C.line, width: 2.6 } },
      { name: 'Brazo', d: `M${T(-8, -4)} C${T(0, -10)} ${T(12, -6)} ${T(14, 4)} L${T(18, 24)} C${T(19, 31)} ${T(10, 33)} ${T(8, 27)} L${T(-4, 8)} C${T(-8, 4)} ${T(-10, 0)} ${T(-8, -4)} Z`, fill, stroke: LINE }
    ]
  };
}

// Libro que saca de la estantería: vive en la ranura de la mano (Solo: Nada | Libro).
const BOOK = [
  { name: 'Hojas', d: 'M296 176 L300 178 L302 201 L298 204 Z', fill: C.page, stroke: { color: C.line, width: 1.5 } },
  { name: 'Tapa', d: 'M272 179 L296 175 C298 175 299 176 299 178 L301 201 C301 203 300 204 298 204 L276 207 C274 207 273 206 273 204 Z', fill: C.book, stroke: { color: C.line, width: 2.2 } },
  { name: 'Lomo', d: 'M273 179 L278 178 L279 206 L276 207 C274 207 273 206 273 204 Z', fill: C.bookDark },
  { name: 'Banda', d: 'M285 177 L288 177 L291 205 L288 205 Z', fill: C.gold }
];
const front = arm('BrazoFrente', [272, 160], false);
front.slots = [{ name: 'RanuraMano', at: [284, 190], prop: { name: 'ObjetoMano', options: [{ name: 'Nada' }, { name: 'Libro', shapes: BOOK }] } }];

module.exports = {
  name: 'Velociraptor', width: 400, height: 300, background: '#f6ecd8',
  // Ranuras para accesorios (mismos nombres en todas las especies):
  // RanuraCabeza, RanuraCara, RanuraCuello, RanuraEspalda, RanuraMano, RanuraCola. Cada una se mueve con su parte.
  root: {
    name: 'Raptor', pivot: [200, 180],
    parts: [
      leg('PiernaAtras', [164, 172], true),
      {
        name: 'Cuerpo', pivot: [190, 165],
        shapes: [
          { name: 'Cuerpo', d: 'M270 82 C260 100 252 112 238 121 C218 119 196 117 176 123 C160 131 156 160 168 176 C184 190 222 192 246 182 C264 174 278 166 284 150 C290 130 292 112 290 100 Z', fill: grad(220, 112, 225, 190), stroke: LINE },
          { name: 'Pecho', d: 'M289 104 C291 122 288 141 280 158 C268 174 246 184 222 187 C238 178 256 166 266 150 C274 136 278 120 280 106 Z', fill: grad(270, 110, 250, 186, C.cream, C.creamDark) },
          stripe('RayaC1', 240, 124, 233, 146, 6, 'Cuerpo'), stripe('RayaC2', 223, 121, 218, 145, 6, 'Cuerpo'),
          stripe('RayaC3', 207, 120, 203, 143, 6, 'Cuerpo'), stripe('RayaC4', 191, 121, 188, 141, 6, 'Cuerpo'),
          stripe('RayaCuello', 256, 106, 247, 118, 5, 'Cuerpo'),
          // Contorno encima de la crema: sin esto el cuello y la papada se veían vacíos.
          { name: 'CuerpoBorde', d: 'M270 82 C260 100 252 112 238 121 C218 119 196 117 176 123 C160 131 156 160 168 176 C184 190 222 192 246 182 C264 174 278 166 284 150 C290 130 292 112 290 100 Z', stroke: LINE }
        ],
        slots: [{ name: 'RanuraCuello', at: [272, 104] }, { name: 'RanuraEspalda', at: [218, 120] }],
        parts: [
          { ...arm('BrazoAtras', [258, 160], true), behind: true },
          {
            name: 'Cola', pivot: [184, 140], behind: true,
            shapes: [
              { name: 'Cola', d: 'M186 122 C150 119 100 120 60 124 C40 126 20 127 12 130 C8 133 12 137 18 137 C50 141 100 149 140 163 C156 169 168 173 180 178 Z', fill: grad(100, 118, 100, 165), stroke: LINE },
              { name: 'ColaPanza', d: 'M24 137 C60 142 110 153 160 172 C120 162 70 150 24 137 Z', fill: C.cream, fillAlpha: .7 },
              stripe('Raya1', 166, 123, 160, 150, 6, 'Cola'), stripe('Raya2', 146, 122, 141, 146, 6, 'Cola'), stripe('Raya3', 126, 122, 122, 143, 5.5, 'Cola'),
              stripe('Raya4', 106, 122, 103, 139, 5, 'Cola'), stripe('Raya5', 86, 123, 84, 136, 4.5, 'Cola'),
              stripe('Raya6', 66, 124, 65, 133, 4, 'Cola'), stripe('Raya7', 46, 126, 46, 131, 3.5, 'Cola')
            ],
            slots: [{ name: 'RanuraCola', at: [100, 126] }]
          },
          {
            name: 'Cabeza', pivot: [276, 100],
            shapes: [
              { name: 'Cabeza', d: 'M262 78 C262 55 280 42 302 42 C322 42 336 52 344 60 C358 64 376 70 384 78 C390 86 386 98 372 100 C352 104 320 108 298 108 C280 108 264 98 262 78 Z', fill: grad(300, 42, 310, 110), stroke: LINE },
              { name: 'Mandibula', d: 'M291 100 C312 102 346 100 379 95 C373 104 356 108 331 110 C311 112 295 110 291 100 Z', fill: grad(330, 96, 330, 112, C.cream, C.creamDark) },
              // Sonrisa corta en la punta del hocico (la línea larga se veía como mueca).
              { name: 'Sonrisa', d: 'M352 95 C359 99 368 98 375 93', stroke: { color: C.line, width: 2.6 } },
              { name: 'Hoyuelo', d: 'M349 91 C349 94 351 96 354 96', stroke: { color: C.line, width: 2.2 } },
              { name: 'Mejilla', ellipse: [338, 89, 7, 4], fill: C.blush, fillAlpha: .35 },
              { name: 'Nariz', ellipse: [369, 79, 3, 2.4], fill: C.line },
              { name: 'Ceja', d: 'M304 57 C314 53 327 55 335 62', stroke: { color: C.stripe, width: 3.5 } },
              stripe('RayaH1', 277, 62, 272, 78, 5, 'Cabeza'), stripe('RayaH2', 287, 51, 284, 65, 4.5, 'Cabeza'),
              { name: 'CabezaBorde', d: 'M262 78 C262 55 280 42 302 42 C322 42 336 52 344 60 C358 64 376 70 384 78 C390 86 386 98 372 100 C352 104 320 108 298 108 C280 108 264 98 262 78 Z', stroke: LINE },
              { name: 'MandibulaBorde', d: 'M298 108 C312 112 334 111 350 107 C362 104 372 102 379 95', stroke: LINE }
            ],
            slots: [{ name: 'RanuraCabeza', at: [302, 44] }, { name: 'RanuraCara', at: [318, 72] }],
            parts: [{
              name: 'Ojo', pivot: [318, 72],
              shapes: [
                { name: 'Esclerotica', ellipse: [318, 72, 13, 14], fill: '#fffdf4', stroke: { color: C.line, width: 2.5 } },
                { name: 'Pupila', ellipse: [321, 73, 10, 11.5], fill: C.eye },
                { name: 'Brillo', ellipse: [325, 67, 4, 4], fill: '#ffffff' },
                { name: 'Brillo2', ellipse: [316, 78, 2, 2], fill: '#ffffff', fillAlpha: .85 }
              ]
            }]
          },
          front
        ]
      },
      leg('PiernaFrente', [192, 172], false)
    ]
  },
  animations: [
    { name: 'Idle', frames: 180, tracks: {
      Cuerpo: { scaleY: [[0, 1], [90, 1.02], [180, 1]] },
      Cabeza: { rotation: [[0, 0], [90, -0.04], [180, 0]] },
      Cola: { rotation: [[0, 0], [60, 0.035], [120, -0.02], [180, 0]] },
      BrazoFrente: { rotation: [[0, 0], [90, 0.08], [180, 0]] },
      BrazoAtras: { rotation: [[0, 0], [90, 0.08], [180, 0]] }
    } },
    // Capa aparte: parpadea haga lo que haga.
    { name: 'Parpadeo', frames: 240, tracks: {
      Ojo: { scaleY: [[0, 1], [200, 1], [206, 0.08, 'out'], [212, 1], [240, 1]] }
    } },
    // Caminar en el lugar (la app desplaza a la mascota por la sala). Ciclo de 0,8 s; las piernas van en contrafase.
    { name: 'Caminar', frames: 48, tracks: {
      Raptor: { y: [[0, 0], [12, -3], [24, 0], [36, -3], [48, 0]] },
      PiernaFrente: { rotation: [[0, -0.38], [24, 0.38], [48, -0.38]] },
      PiernaFrenteCanilla: { rotation: [[0, 0], [24, 0], [33, 0.95], [44, 0.2], [48, 0]] },
      PiernaFrentePie: { rotation: [[0, 0.32], [24, -0.32], [33, -0.75], [48, 0.32]] },
      PiernaAtras: { rotation: [[0, 0.38], [24, -0.38], [48, 0.38]] },
      PiernaAtrasCanilla: { rotation: [[0, 0], [9, 0.95], [20, 0.2], [24, 0], [48, 0]] },
      PiernaAtrasPie: { rotation: [[0, -0.32], [9, -0.75], [24, 0.32], [48, -0.32]] },
      Cuerpo: { rotation: [[0, 0.015], [12, -0.015], [24, 0.015], [36, -0.015], [48, 0.015]] },
      Cola: { rotation: [[0, 0.05], [24, -0.05], [48, 0.05]] },
      Cabeza: { rotation: [[0, -0.03], [12, 0.02], [24, -0.03], [36, 0.02], [48, -0.03]] },
      BrazoFrente: { rotation: [[0, 0.12], [24, -0.06], [48, 0.12]] },
      BrazoAtras: { rotation: [[0, -0.06], [24, 0.12], [48, -0.06]] }
    } },
    // Alcanzar la estantería: se agacha, se estira hacia arriba, toma el libro y lo baja para mirarlo.
    { name: 'Alcanzar', frames: 100, loop: false, tracks: {
      Raptor: { y: [[0, 0], [18, 3, 'inOut'], [45, -8], [70, -8], [100, 0]] },
      Cuerpo: { rotation: [[0, 0], [18, 0.05], [45, -0.28], [70, -0.28], [100, 0]] },
      Cabeza: { rotation: [[0, 0], [18, 0.05], [45, -0.15], [62, -0.15], [80, 0.12], [100, 0.08]] },
      BrazoFrente: { rotation: [[0, 0], [18, 0.15], [45, -1.25], [58, -1.25], [80, -0.5], [100, -0.45]] },
      BrazoAtras: { rotation: [[0, 0], [18, 0.15], [45, -0.9], [70, -0.6], [100, -0.3]] },
      Cola: { rotation: [[0, 0], [45, 0.12], [70, 0.12], [100, 0.02]] },
      PiernaFrente: { rotation: [[0, 0], [45, -0.1], [70, -0.1], [100, 0]] },
      PiernaFrentePie: { rotation: [[0, 0], [45, 0.15], [70, 0.15], [100, 0]] },
      PiernaAtras: { rotation: [[0, 0], [45, -0.1], [70, -0.1], [100, 0]] },
      PiernaAtrasPie: { rotation: [[0, 0], [45, 0.15], [70, 0.15], [100, 0]] },
      ObjetoMano: { active: [[0, 'Nada'], [56, 'Libro']] }
    } }
  ]
};
