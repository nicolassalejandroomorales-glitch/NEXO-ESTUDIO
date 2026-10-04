/* Editor de moléculas y flechas del aula (docs/clase-viva/DISENO.md §9). Propio y sin plugins.
   - "build": dibujas una molécula tocando. Tocar vacío pone un átomo (unido al que tienes seleccionado),
     tocar un átomo lo selecciona, tocar otro átomo los une, tocar un enlace cambia simple → doble → triple.
   - "arrows": trazas flechas de mecanismo: tocas de dónde salen los electrones (par libre o enlace) y adónde llegan.
   La química (valencia, comparar, explicar el error) vive en molecule.js. */
(() => {
  'use strict';
  const M = () => window.NexoMolecule;
  const esc = v => String(v ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  const VB = { w: 420, h: 260 };
  const SUB = '₀₁₂₃₄₅₆₇₈₉';
  const ELEMENTS = ['C', 'N', 'O', 'Cl', 'Br', 'H'];
  const clone = g => ({ atoms: g.atoms.map(a => ({ ...a })), bonds: g.bonds.map(b => ({ ...b })) });

  /* ── Dibujo común ── */
  function atomLabel(g, a) {
    const h = M().implicitH(g, a), q = a.q || 0;
    const hs = h ? `H${h > 1 ? SUB[h] : ''}` : '';
    const charge = q ? (Math.abs(q) > 1 ? Math.abs(q) : '') + (q > 0 ? '⁺' : '⁻') : '';
    return { text: a.el + hs, charge };
  }
  function bondLines(g, b, cls = '') {
    const a1 = M().atomById(g, b.a), a2 = M().atomById(g, b.b);
    if (!a1 || !a2) return '';
    const dx = a2.x - a1.x, dy = a2.y - a1.y, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
    const trim = 13, x1 = a1.x + ux * trim, y1 = a1.y + uy * trim, x2 = a2.x - ux * trim, y2 = a2.y - uy * trim, nx = -uy * 4.5, ny = ux * 4.5;
    const line = (ox, oy) => `<line x1="${(x1 + ox).toFixed(1)}" y1="${(y1 + oy).toFixed(1)}" x2="${(x2 + ox).toFixed(1)}" y2="${(y2 + oy).toFixed(1)}"/>`;
    const lines = b.o === 2 ? line(nx, ny) + line(-nx, -ny) : b.o === 3 ? line(0, 0) + line(nx * 1.6, ny * 1.6) + line(-nx * 1.6, -ny * 1.6) : line(0, 0);
    return `<g class="mol-bond ${cls}">${lines}</g>`;
  }
  function atomMarkup(g, a, { cls = '', attrs = '' } = {}) {
    const { text, charge } = atomLabel(g, a);
    return `<g class="mol-atom el-${esc(a.el)} ${cls}" transform="translate(${a.x.toFixed(1)} ${a.y.toFixed(1)})" ${attrs}>
      <circle class="mol-hit" r="17"/><text class="mol-label" text-anchor="middle" dy="5">${esc(text)}</text>${charge ? `<text class="mol-charge" x="${(text.length * 4.6 + 4).toFixed(1)}" y="-8">${charge}</text>` : ''}</g>`;
  }
  // Dónde dibujar el par libre: del lado opuesto a los vecinos
  function lonePairSpot(g, a, k = 0, n = 1, fixed = null) {
    const nb = M().bondsOf(g, a.id).map(b => M().atomById(g, b.a === a.id ? b.b : b.a));
    let ang = -Math.PI / 2;
    if (fixed !== null && fixed !== undefined) ang = fixed * Math.PI / 180;
    else if (nb.length) { const vx = nb.reduce((s, o) => s + (o.x - a.x), 0), vy = nb.reduce((s, o) => s + (o.y - a.y), 0); ang = Math.atan2(-vy, -vx); }
    if (n > 1) ang += (k - (n - 1) / 2) * 1.1;
    return { x: a.x + Math.cos(ang) * 22, y: a.y + Math.sin(ang) * 22, ang };
  }

  // Encuadre ajustado a la molécula (para escenas que no se editan), con aire para pares libres y flechas
  function fitBox(g, pad = 58) {
    const xs = g.atoms.map(a => a.x), ys = g.atoms.map(a => a.y);
    let x = Math.min(...xs) - pad, y = Math.min(...ys) - pad - 20, w = Math.max(...xs) - Math.min(...xs) + pad * 2, h = Math.max(...ys) - Math.min(...ys) + pad * 2 + 20;
    const ratio = VB.w / VB.h; if (w / h < ratio) { const nw = h * ratio; x -= (nw - w) / 2; w = nw; } else { const nh = w / ratio; y -= (nh - h) / 2; h = nh; }
    return `${x.toFixed(0)} ${y.toFixed(0)} ${w.toFixed(0)} ${h.toFixed(0)}`;
  }

  /* ── Construir (build) ── */
  function startGraph(item) { return clone(item.start || { atoms: [], bonds: [] }); }
  function buildMarkup(item, w, { rec, retry, done, actBtn }) {
    const g = done ? rec.value.graph : (w.graph ||= startGraph(item));
    const tool = w.tool || 'C', probs = M().problems(g), bad = new Set(probs.map(p => p.atom));
    const diff = done && !rec.correct ? M().diff(g, item.target) : null;
    const suspects = new Set(diff?.suspects || []);
    const svg = `<svg class="mol-canvas ${done ? 'is-done' : ''}" viewBox="0 0 ${VB.w} ${VB.h}" data-mol-build="${esc(item.id)}" data-retry="${retry ? 1 : 0}" role="application" aria-label="Lienzo para dibujar la molécula">
      <rect class="mol-bg" width="${VB.w}" height="${VB.h}"/>
      ${g.bonds.map((b, i) => `<g data-mol-bond="${i}">${bondLines(g, b)}<line class="mol-bond-hit" x1="${M().atomById(g, b.a)?.x}" y1="${M().atomById(g, b.a)?.y}" x2="${M().atomById(g, b.b)?.x}" y2="${M().atomById(g, b.b)?.y}"/></g>`).join('')}
      ${g.atoms.map(a => atomMarkup(g, a, { cls: `${w.sel === a.id && !done ? 'is-sel' : ''} ${bad.has(a.id) ? 'is-bad' : ''} ${suspects.has(a.id) ? 'is-suspect' : ''}`, attrs: `data-mol-atom="${esc(a.id)}"` })).join('')}
    </svg>`;
    if (done) return `<div class="mol-editor is-done">${svg}
      ${!rec.correct && diff?.message ? `<p class="mol-status is-bad">${esc(diff.message)}</p>` : ''}
      ${rec.correct ? `<p class="mol-status is-ok">Es la molécula correcta: ${esc(M().formulaText(M().formula(g)))}.</p>` : ''}</div>`;
    const tools = [...ELEMENTS.map(el => [el, el, `Átomo de ${M().NAME[el]}`]), ['charge', '±', 'Cambiar la carga'], ['erase', 'Borrar', 'Borrar átomo o enlace']];
    const help = w.sel ? 'Toca un espacio vacío para agregar un átomo unido al seleccionado, u otro átomo para unirlos. Toca el seleccionado otra vez para soltarlo.'
      : tool === 'erase' ? 'Toca un átomo o un enlace para borrarlo.' : tool === 'charge' ? 'Toca un átomo para cambiar su carga: + , − o neutra.'
      : 'Toca un espacio vacío para poner un átomo, o toca un átomo para seleccionarlo. Toca un enlace para hacerlo doble o triple.';
    return `<div class="mol-editor">
      <div class="mol-tools" role="toolbar" aria-label="Herramientas">${tools.map(([id, label, title]) => `<button type="button" class="mol-tool ${tool === id ? 'is-on' : ''}" data-mol-tool="${id}" data-item="${esc(item.id)}" data-retry="${retry ? 1 : 0}" aria-pressed="${tool === id}" title="${esc(title)}">${esc(label)}</button>`).join('')}
        <span class="mol-sep"></span><button type="button" class="mol-tool" data-mol-do="undo" data-item="${esc(item.id)}" data-retry="${retry ? 1 : 0}" ${w.history?.length ? '' : 'disabled'}>Deshacer</button><button type="button" class="mol-tool" data-mol-do="reset" data-item="${esc(item.id)}" data-retry="${retry ? 1 : 0}">Empezar de nuevo</button></div>
      ${svg}
      <p class="mol-status ${probs.length ? 'is-bad' : ''}" aria-live="polite">${esc(probs.length ? probs[0].message : help)}</p>
      <p class="mol-formula">Tu dibujo: <b>${esc(g.atoms.length ? M().formulaText(M().formula(g)) : '—')}</b></p>
      <div class="cr-check">${actBtn(item, retry, 'act-check', '', 'Comprobar ▸', 'cr-btn cr-primary', !g.atoms.length)}</div></div>`;
  }

  /* ── Flechas (arrows) ── */
  function spot(item, id) {
    const g = item.scene, [kind, ref] = id.split(':');
    if (kind === 'lp') { const a = M().atomById(g, ref); return lonePairSpot(g, a, 0, item.lonePairs[ref], item.lpAngle?.[ref]); }
    if (kind === 'a') { const a = M().atomById(g, ref); return { x: a.x, y: a.y }; }
    const b = g.bonds[Number(ref)], a1 = M().atomById(g, b.a), a2 = M().atomById(g, b.b);
    return { x: (a1.x + a2.x) / 2, y: (a1.y + a2.y) / 2 };
  }
  function arrowPath(item, from, to) {
    const p = spot(item, from), q0 = spot(item, to), dx = q0.x - p.x, dy = q0.y - p.y, len = Math.hypot(dx, dy) || 1;
    const q = to.startsWith('a:') ? { x: q0.x - dx / len * 16, y: q0.y - dy / len * 16 } : q0;
    const bend = Math.min(60, len * .45), cx = (p.x + q.x) / 2 - dy / len * bend, cy = (p.y + q.y) / 2 + dx / len * bend - 10;
    return `M${p.x.toFixed(1)} ${p.y.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
  }
  const key = ([a, b]) => `${a}>${b}`;
  function arrowsMarkup(item, w, { rec, retry, done, actBtn }) {
    const g = item.scene, arrows = done ? rec.value : (w.arrows ||= []);
    const answer = new Set(item.answer.map(key));
    const showAnswer = done && (rec.correct || retry);
    const lps = Object.entries(item.lonePairs || {});
    const box = fitBox(g), [bx, by, bw, bh] = box.split(' ');
    const svg = `<svg class="mol-canvas arrows" viewBox="${box}" data-mol-arrows="${esc(item.id)}" data-retry="${retry ? 1 : 0}" role="application" aria-label="Escena para trazar flechas">
      <defs>${[['', '#b3261e'], ['-ok', '#2f6b4a']].map(([suf, col]) => `<marker id="ah-${esc(item.id)}${suf}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="${col}"/></marker>`).join('')}</defs>
      <rect class="mol-bg" x="${bx}" y="${by}" width="${bw}" height="${bh}"/>
      ${g.bonds.map((b, i) => `<g class="mol-pick ${w.from === `b:${i}` ? 'is-sel' : ''}" data-mol-pick="b:${i}">${bondLines(g, b)}<line class="mol-bond-hit" x1="${M().atomById(g, b.a).x}" y1="${M().atomById(g, b.a).y}" x2="${M().atomById(g, b.b).x}" y2="${M().atomById(g, b.b).y}"/></g>`).join('')}
      ${g.atoms.map(a => atomMarkup(g, a, { cls: 'mol-pick', attrs: `data-mol-pick="a:${esc(a.id)}"` })).join('')}
      ${lps.map(([id, n]) => { const a = M().atomById(g, id);
        return [...Array(n)].map((_, k) => { const s = lonePairSpot(g, a, k, n, item.lpAngle?.[id]), px = -Math.sin(s.ang) * 4, py = Math.cos(s.ang) * 4;
          const main = k === 0; return `<g class="mol-lp ${main ? 'mol-pick' : ''} ${main && w.from === `lp:${id}` ? 'is-sel' : ''}" ${main ? `data-mol-pick="lp:${esc(id)}"` : ''}><circle class="mol-lp-hit" cx="${s.x.toFixed(1)}" cy="${s.y.toFixed(1)}" r="11"/>
          <circle class="mol-lp-dot" cx="${(s.x + px).toFixed(1)}" cy="${(s.y + py).toFixed(1)}" r="2.6"/><circle class="mol-lp-dot" cx="${(s.x - px).toFixed(1)}" cy="${(s.y - py).toFixed(1)}" r="2.6"/></g>`; }).join(''); }).join('')}
      ${arrows.map(([a, b], i) => { const ok = answer.has(key([a, b]));
        return `<path class="mol-arrow ${done ? (ok ? 'is-right' : 'is-wrong') : ''}" d="${arrowPath(item, a, b)}" marker-end="url(#ah-${esc(item.id)}${done && ok ? '-ok' : ''})" ${done ? '' : `data-mol-arrow="${i}"`}/>`; }).join('')}
      ${showAnswer ? item.answer.map(([a, b]) => { const d = arrowPath(item, a, b);
        return `${rec.correct ? '' : `<path class="mol-arrow is-answer" d="${d}" marker-end="url(#ah-${esc(item.id)}-ok)"/>`}<circle class="mol-electron" r="3.5"><animateMotion dur="1.8s" repeatCount="indefinite" path="${d}"/></circle><circle class="mol-electron" r="3.5"><animateMotion dur="1.8s" begin=".25s" repeatCount="indefinite" path="${d}"/></circle>`; }).join('') : ''}
    </svg>`;
    if (done) {
      const notes = arrows.filter(x => !answer.has(key(x))).map(x => item.notes?.[key(x)] || 'Esa flecha no corresponde. Pregúntate: ¿quién tiene electrones para dar y quién los necesita?');
      const missing = item.answer.filter(x => !arrows.some(y => key(y) === key(x))).length;
      return `<div class="mol-editor is-done">${svg}
        ${rec.correct ? '<p class="mol-status is-ok">¡Así se mueven los electrones! Mira cómo viajan por tus flechas.</p>'
          : `${notes.map(n => `<p class="mol-status is-bad">${esc(n)}</p>`).join('')}${missing ? `<p class="mol-status is-bad">Te ${missing === 1 ? 'falta una flecha' : `faltan ${missing} flechas`}.</p>` : ''}`}</div>`;
    }
    const help = w.from ? 'Ahora toca adónde llegan esos electrones: un átomo o un enlace.' : 'Toca de dónde salen los electrones: un par libre (los dos puntitos) o un enlace. Toca una flecha para borrarla.';
    return `<div class="mol-editor">${svg}<p class="mol-status" aria-live="polite">${esc(help)}</p>
      <div class="cr-check">${actBtn(item, retry, 'act-check', '', 'Comprobar ▸', 'cr-btn cr-primary', !arrows.length)}</div></div>`;
  }

  /* ── Interacción ── */
  function mount(root, ctx) {
    const pt = (svg, e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const r = p.matrixTransform(svg.getScreenCTM().inverse());
      return { x: Math.max(18, Math.min(VB.w - 18, r.x)), y: Math.max(18, Math.min(VB.h - 18, r.y)) }; };
    const gated = el => Boolean(el.closest('fieldset:disabled'));
    const commit = (w, g) => { (w.history ||= []).push(clone(w.graph)); if (w.history.length > 30) w.history.shift(); w.graph = g; };
    let drag = null;

    root.addEventListener('click', e => {
      const btn = e.target.closest('[data-mol-tool], [data-mol-do]');
      if (!btn || gated(btn)) return;
      const w = ctx.work(btn.dataset.item, btn.dataset.retry === '1'), item = ctx.item(btn.dataset.item);
      if (btn.dataset.molTool) { w.tool = btn.dataset.molTool; if (!ELEMENTS.includes(w.tool)) w.sel = null; }
      if (btn.dataset.molDo === 'undo' && w.history?.length) { w.graph = w.history.pop(); w.sel = null; }
      if (btn.dataset.molDo === 'reset') { commit(w, startGraph(item)); w.sel = null; }
      ctx.commit();
    });

    root.addEventListener('pointerdown', e => {
      const svg = e.target.closest('[data-mol-build]');
      if (!svg || gated(svg)) return;
      const atomEl = e.target.closest('[data-mol-atom]');
      if (atomEl) { const p = pt(svg, e); drag = { svg, id: atomEl.dataset.molAtom, sx: p.x, sy: p.y, moved: false, el: atomEl }; svg.setPointerCapture?.(e.pointerId); }
    });
    root.addEventListener('pointermove', e => {
      if (!drag) return;
      const p = pt(drag.svg, e);
      if (!drag.moved && Math.hypot(p.x - drag.sx, p.y - drag.sy) < 5) return;
      drag.moved = true; drag.x = p.x; drag.y = p.y;
      drag.el.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
    });
    root.addEventListener('pointerup', e => {
      const svg = e.target.closest('[data-mol-build]') || drag?.svg;
      if (svg && !gated(svg)) {
        const itemId = svg.dataset.molBuild, retry = svg.dataset.retry === '1', w = ctx.work(itemId, retry), item = ctx.item(itemId);
        w.graph ||= startGraph(item);
        const tool = w.tool || 'C', g = clone(w.graph);
        if (drag?.moved) { const a = g.atoms.find(x => x.id === drag.id); a.x = drag.x; a.y = drag.y; commit(w, g); drag = null; return ctx.commit(); }
        const atomId = drag?.id || e.target.closest('[data-mol-atom]')?.dataset.molAtom;
        const bondEl = e.target.closest('[data-mol-bond]');
        drag = null;
        const newId = () => `u${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}`;
        if (atomId) {
          const a = g.atoms.find(x => x.id === atomId);
          if (tool === 'erase') { g.atoms = g.atoms.filter(x => x.id !== atomId); g.bonds = g.bonds.filter(b => b.a !== atomId && b.b !== atomId); if (w.sel === atomId) w.sel = null; commit(w, g); }
          else if (tool === 'charge') { a.q = a.q === 1 ? -1 : a.q === -1 ? 0 : 1; commit(w, g); }
          else if (w.sel && w.sel !== atomId) {
            const b = g.bonds.find(x => (x.a === w.sel && x.b === atomId) || (x.b === w.sel && x.a === atomId));
            if (b) b.o = b.o >= 3 ? 1 : b.o + 1; else g.bonds.push({ a: w.sel, b: atomId, o: 1 });
            w.sel = atomId; commit(w, g);
          } else if (w.sel === atomId) { if (a.el !== tool) { a.el = tool; commit(w, g); } else w.sel = null; }
          else w.sel = atomId;
        } else if (bondEl) {
          const i = Number(bondEl.dataset.molBond);
          if (tool === 'erase') g.bonds.splice(i, 1); else g.bonds[i].o = g.bonds[i].o >= 3 ? 1 : g.bonds[i].o + 1;
          commit(w, g);
        } else if (tool !== 'erase' && tool !== 'charge') {
          const p = pt(svg, e), id = newId();
          g.atoms.push({ id, el: tool, x: p.x, y: p.y, q: 0 });
          if (w.sel && g.atoms.some(x => x.id === w.sel)) g.bonds.push({ a: w.sel, b: id, o: 1 });
          w.sel = id; commit(w, g);
        } else w.sel = null;
        return ctx.commit();
      }
      drag = null;
      const arrowsSvg = e.target.closest('[data-mol-arrows]');
      if (!arrowsSvg || gated(arrowsSvg)) return;
      const itemId = arrowsSvg.dataset.molArrows, w = ctx.work(itemId, arrowsSvg.dataset.retry === '1'), item = ctx.item(itemId);
      w.arrows ||= [];
      const arrowEl = e.target.closest('[data-mol-arrow]');
      if (arrowEl) { w.arrows.splice(Number(arrowEl.dataset.molArrow), 1); return ctx.commit(); }
      const pick = e.target.closest('[data-mol-pick]')?.dataset.molPick;
      if (!pick) { w.from = null; return ctx.commit(); }
      if (!w.from) { if (pick.startsWith('a:')) return; w.from = pick; return ctx.commit(); }
      if (pick === w.from) { w.from = null; return ctx.commit(); }
      if (!w.arrows.some(x => x[0] === w.from && x[1] === pick) && w.arrows.length < item.answer.length + 2) w.arrows.push([w.from, pick]);
      w.from = null; ctx.commit();
    });
  }

  /* Corrección y textos para el reproductor */
  function isCorrect(item, value) {
    if (item.type === 'build') return Boolean(value?.graph) && M().problems(value.graph).length === 0 && M().same(value.graph, item.target);
    const want = new Set(item.answer.map(key)), got = new Set((value || []).map(key));
    return want.size === got.size && [...want].every(k => got.has(k));
  }
  function feedback(item, rec) {
    if (!rec || rec.correct) return '';
    if (item.type === 'build') return M().diff(rec.value.graph, item.target).message;
    const wrong = (rec.value || []).find(x => !item.answer.some(y => key(y) === key(x)));
    return wrong ? (item.notes?.[key(wrong)] || 'Revisa de dónde salen los electrones y quién los necesita.') : 'Te faltan flechas.';
  }
  function solution(item) {
    if (item.type === 'build') return `<div class="mol-editor is-done"><p class="cr-eyebrow">La respuesta</p><svg class="mol-canvas is-done" viewBox="0 0 ${VB.w} ${VB.h}" aria-label="Molécula correcta">
      <rect class="mol-bg" width="${VB.w}" height="${VB.h}"/>${item.target.bonds.map(b => bondLines(item.target, b)).join('')}${item.target.atoms.map(a => atomMarkup(item.target, a)).join('')}</svg></div>`;
    return '';
  }

  window.NexoMolEditor = { buildMarkup, arrowsMarkup, mount, isCorrect, feedback, solution };
})();
