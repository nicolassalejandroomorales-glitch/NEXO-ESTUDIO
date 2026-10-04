/* Mascotas de Nexo — arte por código (docs/mascota/SPEC.md).
   Las tres especies comparten UN esqueleto: mismas partes, mismos pivotes y misma caja (240×260, mirando a la derecha,
   pies en y=248). Así una animación (caminar, leer, emotes) sirve para todas. Cada parte es un <g data-part> con su pivote. */
(() => {
  'use strict';
  const VIEW = { width: 240, height: 260, ground: 248 };
  // Pivotes compartidos (donde gira cada parte al animar).
  const PIVOTS = {
    tail: [96, 190], legBack: [102, 200], armBack: [104, 158], body: [118, 222],
    legFront: [132, 200], head: [126, 132], armFront: [142, 158]
  };

  const SPECIES = {
    raptor: {
      name: 'Velociraptor', personality: 'Curioso e impaciente: lee rápido y pregunta todo.',
      colors: { base: '#5fb28c', light: '#8fd4ad', shadow: '#2f7a62', line: '#1f4f43', belly: '#f3e2b8',
        bellyShadow: '#d6bd86', accent: '#f29a4a', accentDark: '#c2622a', blush: '#f08a7e' },
      eye: [151, 84, 1.05], mouth: [184, 113], blush: [163, 106],
      tail: { d: 'M95 172 C64 176 38 190 20 214 C12 225 20 236 31 229 C52 214 74 206 102 206 Z',
        shade: [40, 222, 50, 18],
        extra: c => feathers([[18, 222, -150], [24, 232, -120], [14, 212, 170]], c.accent, c.accentDark) +
          stripes([[60, 186, 70, 182], [72, 182, 80, 178]], c.shadow) },
      body: { d: 'M118 126 C150 126 160 158 156 188 C152 214 132 222 112 220 C88 218 80 198 84 174 C88 148 96 126 118 126 Z',
        shade: [100, 206, 46, 30],
        belly: 'M129 146 C147 152 152 182 145 203 C137 214 120 212 118 199 C115 180 117 158 129 146 Z',
        extra: c => stripes([[90, 150, 98, 146], [86, 164, 95, 160], [86, 178, 94, 175]], c.shadow) },
      leg: { thigh: [0, 2, 19, 22], foot: 'M-8 14 L-8 40 Q-8 48 2 48 L24 48 Q31 47 26 41 L12 37 L12 16 Z', claw: true },
      arm: 'M-4 -6 C8 -8 18 0 20 10 C22 17 15 19 11 14 C8 9 4 8 -2 8 Z',
      armExtra: c => `<path d="M2 -4 L6 -12 L10 -4 Z" fill="${c.accent}" stroke="${c.line}" stroke-width="1.6" stroke-linejoin="round"/>`,
      head: { d: 'M90 100 C84 66 108 45 133 45 C158 45 172 60 177 76 C193 78 205 91 203 106 C201 122 185 130 161 130 C140 132 112 132 100 124 C92 118 91 110 90 100 Z',
        shade: [118, 122, 52, 20],
        jaw: 'M150 116 C166 118 186 117 200 110 C198 122 184 129 161 129 C146 130 134 128 128 124 C136 120 142 117 150 116 Z',
        extra: c => feathers([[112, 52, -125], [102, 60, -150], [122, 47, -100]], c.accent, c.accentDark) +
          `<circle cx="195" cy="92" r="2.2" fill="${c.line}"/>` +
          stripes([[104, 74, 110, 70], [100, 86, 106, 83]], c.shadow) }
    },
    capybara: {
      name: 'Capibara', personality: 'Calmado: nada lo estresa, ni la semana de pruebas.',
      colors: { base: '#b07a52', light: '#d0a07a', shadow: '#7c5236', line: '#4a2f1e', belly: '#d9b58e',
        bellyShadow: '#b9906a', accent: '#7fb069', accentDark: '#4f7d43', blush: '#e48a7a', muzzle: '#8e5f3f' },
      eye: [147, 82, 0.85], mouth: [180, 119], blush: [160, 104],
      tail: null,
      body: { d: 'M118 128 C162 128 172 166 167 198 C161 225 137 230 116 228 C86 226 72 206 76 178 C80 150 92 128 118 128 Z',
        shade: [98, 214, 56, 32],
        belly: 'M134 158 C152 164 158 190 151 211 C142 222 124 220 120 206 C116 188 120 166 134 158 Z',
        extra: c => fur([[90, 160], [96, 182], [104, 146], [150, 140]], c.shadow) },
      leg: { thigh: [0, 6, 17, 18], foot: 'M-10 22 L-10 40 Q-10 48 0 48 L18 48 Q25 47 22 40 L14 36 L14 22 Z', claw: false },
      arm: 'M-4 -6 C6 -8 14 0 15 9 C16 16 10 18 6 14 C3 10 1 9 -3 9 Z',
      armExtra: () => '',
      head: { d: 'M84 98 C82 64 104 45 136 45 C164 45 184 57 190 77 C197 92 197 111 189 122 C179 134 150 136 124 134 C100 132 86 120 84 98 Z',
        shade: [116, 124, 54, 22],
        jaw: 'M160 76 C181 74 195 89 193 107 C191 124 175 131 159 127 C149 121 147 90 160 76 Z',
        jawFill: 'muzzle',
        extra: c => `<ellipse cx="111" cy="54" rx="9" ry="8" fill="${c.shadow}" stroke="${c.line}" stroke-width="2.6"/>` +
          `<ellipse cx="111" cy="55" rx="4.5" ry="4" fill="${c.line}" opacity=".45"/>` +
          `<path d="M181 88 q4 -3 7 0 M186 97 q4 -3 7 0" stroke="${c.line}" stroke-width="2.6" fill="none" stroke-linecap="round"/>` +
          sprout(130, 46, c) + fur([[100, 80], [108, 112]], c.shadow) }
    },
    fox: {
      name: 'Zorro', personality: 'Astuto y ordenado: tiene un plan para cada ramo.',
      colors: { base: '#e2803f', light: '#f4a866', shadow: '#ad5426', line: '#5a2a14', belly: '#fbf1e2',
        bellyShadow: '#e2cdb2', accent: '#3b2a24', accentDark: '#24170f', blush: '#f08a7e' },
      eye: [152, 84, 1], mouth: [186, 117], blush: [165, 106],
      tail: { d: 'M98 196 C62 214 26 204 18 172 C12 146 30 120 50 126 C44 152 60 174 98 176 Z',
        shade: [64, 200, 40, 20],
        extra: c => `<path d="M18 172 C12 146 30 120 50 126 C46 136 46 146 50 154 C40 150 30 156 26 168 Z" fill="${c.belly}" stroke="${c.line}" stroke-width="2.6" stroke-linejoin="round"/>` },
      body: { d: 'M118 132 C146 132 156 162 152 192 C148 216 132 224 116 222 C96 220 86 204 88 182 C90 156 98 132 118 132 Z',
        shade: [100, 208, 42, 28],
        belly: 'M124 140 C144 146 150 170 142 190 L136 184 L132 192 L126 184 L120 190 C118 172 116 152 124 140 Z',
        extra: () => '' },
      leg: { thigh: [0, 4, 16, 20], foot: 'M-8 18 L-8 40 Q-8 48 2 48 L20 48 Q27 47 23 41 L12 37 L12 18 Z', claw: false, sock: true },
      arm: 'M-4 -6 C7 -8 16 0 17 10 C18 17 12 19 8 15 C5 10 2 9 -3 9 Z',
      armExtra: c => `<path d="M10 13 C13 18 18 17 17 10" fill="${c.accent}" stroke="none"/>`,
      head: { d: 'M86 102 C84 70 106 50 132 50 C158 50 172 63 177 79 L199 98 C205 104 201 111 194 111 C181 112 173 118 163 126 C141 136 116 136 102 128 C90 120 87 112 86 102 Z',
        shade: [116, 124, 50, 20],
        jaw: 'M150 97 C170 100 186 104 198 107 C199 111 194 112 186 112 C173 116 165 124 155 130 L147 124 L139 132 L133 124 L123 130 C129 116 139 101 150 97 Z',
        jawFill: 'belly',
        extra: c => `<ellipse cx="200" cy="103" rx="5" ry="4" fill="${c.accentDark}"/>` },
      ears: c => ear('M100 66 L92 16 L128 52 Z', 'M100 62 L96 30 L118 52 Z', c) + ear('M130 52 L148 10 L164 60 Z', 'M136 52 L147 24 L157 58 Z', c)
    }
  };

  // ——— Ayudantes de dibujo ———
  const feathers = (list, fill, dark) => list.map(([x, y, a]) =>
    `<path d="M0 0 C6 -5 16 -5 22 0 C16 5 6 5 0 0 Z" transform="translate(${x} ${y}) rotate(${a})" fill="${fill}" stroke="${dark}" stroke-width="1.8" stroke-linejoin="round"/>`).join('');
  const stripes = (list, color) => list.map(([x1, y1, x2, y2]) =>
    `<path d="M${x1} ${y1} Q${(x1 + x2) / 2 + 3} ${(y1 + y2) / 2 + 3} ${x2} ${y2}" stroke="${color}" stroke-width="3.2" stroke-linecap="round" fill="none" opacity=".75"/>`).join('');
  const fur = (list, color) => list.map(([x, y]) =>
    `<path d="M${x} ${y} l3 -4 M${x + 5} ${y + 1} l3 -4" stroke="${color}" stroke-width="1.8" stroke-linecap="round" opacity=".7"/>`).join('');
  const sprout = (x, y, c) => `<g transform="translate(${x} ${y})"><path d="M0 0 C0 -6 1 -10 2 -13" stroke="${c.accentDark}" stroke-width="2.4" fill="none" stroke-linecap="round"/>` +
    `<path d="M2 -12 C-6 -20 -14 -16 -14 -10 C-8 -8 -2 -9 2 -12 Z" fill="${c.accent}" stroke="${c.accentDark}" stroke-width="1.6" stroke-linejoin="round"/>` +
    `<path d="M2 -13 C8 -24 18 -22 19 -15 C13 -11 7 -11 2 -13 Z" fill="${c.accent}" stroke="${c.accentDark}" stroke-width="1.6" stroke-linejoin="round"/></g>`;
  const ear = (outer, inner, c) => `<path d="${outer}" fill="${c.base}" stroke="${c.line}" stroke-width="3" stroke-linejoin="round"/>` +
    `<path d="${inner}" fill="${c.belly}" opacity=".9"/>` +
    `<path d="${outer}" fill="${c.accent}" clip-path="none" opacity="0"/>`;

  // Parte con volumen: degradado de luz (arriba-izquierda), sombra recortada abajo-derecha y contorno de color.
  function shaded(id, d, c, shade, fill = 'base') {
    const light = fill === 'base' ? c.light : fill === 'belly' ? '#fffaf0' : c.light;
    const base = c[fill] || fill;
    const shadow = fill === 'belly' ? c.bellyShadow : c.shadow;
    const [sx, sy, rx, ry] = shade || [0, 0, 0, 0];
    return `<defs><linearGradient id="${id}-g" x1="0" y1="0" x2=".7" y2="1"><stop offset="0" stop-color="${light}"/><stop offset=".55" stop-color="${base}"/></linearGradient>` +
      `<clipPath id="${id}-c"><path d="${d}"/></clipPath><filter id="${id}-b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter></defs>` +
      `<path d="${d}" fill="url(#${id}-g)"/>` +
      (shade ? `<g clip-path="url(#${id}-c)"><ellipse cx="${sx}" cy="${sy}" rx="${rx}" ry="${ry}" fill="${shadow}" opacity=".55" filter="url(#${id}-b)"/></g>` : '') +
      `<path d="${d}" fill="none" stroke="${c.line}" stroke-width="3" stroke-linejoin="round"/>`;
  }

  // ——— Expresiones (comunes a las tres) ———
  function eyes(s, c, expression) {
    const [x, y, k] = s.eye;
    const line = `stroke="${c.line}" stroke-width="3" fill="none" stroke-linecap="round"`;
    if (expression === 'happy') return `<path d="M${x - 8 * k} ${y + 3} Q${x} ${y - 9 * k} ${x + 8 * k} ${y + 3}" ${line}/>`;
    if (expression === 'sleep') return `<path d="M${x - 8 * k} ${y} Q${x} ${y + 7 * k} ${x + 8 * k} ${y}" ${line}/>`;
    const scared = expression === 'scared';
    const rx = (scared ? 9.5 : 8) * k, ry = (scared ? 11 : 10.5) * k;
    const pupil = scared ? `<circle cx="${x + 1}" cy="${y + 1}" r="${3.2 * k}" fill="${c.line}"/>` :
      `<ellipse cx="${x + 1.5 * k}" cy="${y + 1}" rx="${6.2 * k}" ry="${8.4 * k}" fill="#1d1712"/>` +
      `<circle cx="${x + 3.5 * k}" cy="${y - 3.5 * k}" r="${2.8 * k}" fill="#fff"/><circle cx="${x - 1.5 * k}" cy="${y + 4 * k}" r="${1.3 * k}" fill="#fff" opacity=".85"/>`;
    const lid = expression === 'calm' ? `<path d="M${x - rx - 1} ${y - 2} Q${x} ${y - ry - 2} ${x + rx + 1} ${y - 2} Z" fill="${c.base}" stroke="${c.line}" stroke-width="2.4"/>` : '';
    return `<g data-part="eye"><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fffdf6" stroke="${c.line}" stroke-width="2.4"/>${pupil}${lid}</g>`;
  }
  function mouth(s, c, expression) {
    const [x, y] = s.mouth;
    const stroke = `stroke="${c.line}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
    if (expression === 'happy') return `<path d="M${x - 9} ${y - 2} Q${x - 3} ${y + 9} ${x + 4} ${y - 1}" fill="#a8423c" stroke="${c.line}" stroke-width="2.4" stroke-linejoin="round"/>`;
    if (expression === 'scared') return `<path d="M${x - 10} ${y + 2} l4 -3 l4 3 l4 -3 l4 3" ${stroke}/>`;
    if (expression === 'sleep') return `<ellipse cx="${x - 3}" cy="${y}" rx="3" ry="2.4" fill="${c.line}" opacity=".8"/>`;
    return `<path d="M${x - 9} ${y - 1} Q${x - 4} ${y + 5} ${x + 2} ${y - 1}" ${stroke}/>`;
  }

  // ——— Piezas del esqueleto ———
  const pivotStyle = part => `style="transform-origin:${PIVOTS[part][0]}px ${PIVOTS[part][1]}px;transform-box:view-box"`;
  function leg(uid, s, c, x, back) {
    const L = s.leg, tone = back ? { ...c, base: c.shadow, light: c.base } : c;
    const sock = L.sock ? `<path d="${L.foot}" fill="${c.accent}" stroke="${c.line}" stroke-width="3" stroke-linejoin="round"/>` :
      `<path d="${L.foot}" fill="${tone.base}" stroke="${c.line}" stroke-width="3" stroke-linejoin="round"/>`;
    const claw = L.claw ? `<path d="M-2 34 C-8 28 -8 22 -3 20" fill="none" stroke="${c.line}" stroke-width="2.6" stroke-linecap="round"/>` +
      `<path d="M22 47 l3 -5 M15 48 l2 -5" stroke="${c.line}" stroke-width="2" stroke-linecap="round"/>` : '';
    const [tx, ty, rx, ry] = L.thigh;
    const thigh = `M${tx - rx} ${ty} a${rx} ${ry} 0 1 0 ${rx * 2} 0 a${rx} ${ry} 0 1 0 ${-rx * 2} 0 Z`;
    return `<g data-part="${back ? 'legBack' : 'legFront'}" ${pivotStyle(back ? 'legBack' : 'legFront')}><g transform="translate(${x} 200)">` +
      sock + claw + shaded(`${uid}-${back ? 'lb' : 'lf'}`, thigh, tone, [rx * .4, ty + ry * .6, rx, ry * .6]) + '</g></g>';
  }
  function arm(uid, s, c, x, y, back) {
    const tone = back ? { ...c, base: c.shadow, light: c.base } : c;
    return `<g data-part="${back ? 'armBack' : 'armFront'}" ${pivotStyle(back ? 'armBack' : 'armFront')}><g transform="translate(${x} ${y})">` +
      shaded(`${uid}-${back ? 'ab' : 'af'}`, s.arm, tone, [10, 12, 12, 6]) + (back ? '' : s.armExtra(c)) +
      (back ? '' : `<g data-anchor="hand" transform="translate(14 10)"></g>`) + '</g></g>';
  }

  let counter = 0;
  function svg(speciesId = 'raptor', { expression = 'neutral', className = '', title = '' } = {}) {
    const s = SPECIES[speciesId];
    if (!s) throw new Error('Especie desconocida: ' + speciesId);
    const c = s.colors, uid = `nx${speciesId[0]}${++counter}`;
    const h = s.head;
    const jawFill = h.jawFill === 'muzzle' ? { ...c, base: c.muzzle, light: c.base } : h.jawFill === 'belly' ? c : { ...c, base: c.belly, light: '#fffaf0' };
    const parts = [
      s.tail ? `<g data-part="tail" ${pivotStyle('tail')}>${shaded(uid + '-t', s.tail.d, c, s.tail.shade)}${s.tail.extra(c)}</g>` : '',
      leg(uid, s, c, 102, true),
      arm(uid, s, c, 104, 158, true),
      `<g data-part="body" ${pivotStyle('body')}>${shaded(uid + '-b', s.body.d, c, s.body.shade)}` +
        shaded(uid + '-y', s.body.belly, c, [140, 210, 20, 14], 'belly') + s.body.extra(c) + '</g>',
      leg(uid, s, c, 134, false),
      `<g data-part="head" ${pivotStyle('head')}>` + (s.ears ? s.ears(c) : '') +
        shaded(uid + '-h', h.d, c, h.shade) +
        (h.jawFill === 'belly' ? shaded(uid + '-j', h.jaw, c, [168, 124, 20, 8], 'belly') : shaded(uid + '-j', h.jaw, jawFill, [176, 126, 22, 8])) +
        h.extra(c) +
        `<ellipse cx="${s.blush[0]}" cy="${s.blush[1]}" rx="8" ry="5" fill="${c.blush}" opacity=".45"/>` +
        `<g data-part="face">${eyes(s, c, expression)}${mouth(s, c, expression)}</g></g>`,
      arm(uid, s, c, 142, 158, false)
    ].join('');
    return `<svg class="nexo-mascot ${className}" data-species="${speciesId}" data-expression="${expression}" viewBox="0 0 ${VIEW.width} ${VIEW.height}" role="img" aria-label="${title || s.name}">` +
      `<ellipse data-part="shadow" cx="122" cy="${VIEW.ground}" rx="58" ry="7" fill="#1a120b" opacity=".22"/>${parts}</svg>`;
  }

  window.NexoMascotArt = Object.freeze({ VIEW, PIVOTS, species: Object.keys(SPECIES),
    info: id => ({ name: SPECIES[id].name, personality: SPECIES[id].personality, colors: { ...SPECIES[id].colors } }), svg });
})();
