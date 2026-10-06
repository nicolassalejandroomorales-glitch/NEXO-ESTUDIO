/* La torre de cada ramo como lugar propio (etapa 10, docs/etapa-10-arte/SPEC.md): pantalla completa, el sauce crece con tus datos
   y se pueden tocar las cosas: un hilo (concepto), un piso (misiones), las raíces (bases), la maceta, el cristal (Camino al 7)
   y las otras torres a lo lejos. Ruta: #/torre/<ramo>. Usa NexoWillowTower (el dibujo) y NexoClassroom (los datos). */
(() => {
  'use strict';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  const ORDER = ['organica', 'analitica', 'fisico', 'fisio'];
  const ADVICE = {
    semilla: 'Todavía no lo ves. Parte por su misión: el hilo aparece en cuanto respondes algo.',
    brote: 'Lo reconoces con ayuda. Se pone <b>verde</b> cuando lo produces tú solo, por ejemplo al escribirlo.',
    clara: 'Casi: lo resolviste con ayuda. Se pone <b>verde</b> cuando lo produces tú solo.',
    verde: 'Lo produces por tu cuenta. Le sale <b>farolito</b> si lo recuerdas sin ayuda 24 horas o más después.',
    intensa: 'Lo usas en casos nuevos. Le sale <b>farolito</b> si lo recuerdas sin ayuda 24 horas o más después.',
    flor: '¡Retenido! Brilla como farolito. Seguirá apareciendo de vez en cuando en la ronda para no olvidarlo.',
    amarilla: 'Acertaste, pero dudando. Repásalo pronto para afirmarlo.',
    seca: 'Se está olvidando: hoy le toca repaso. Una ronda corta lo vuelve a poner verde.'
  };
  let current = null;
  function cleanup() { current?.tower?.destroy(); current?.off?.(); current = null; document.body.classList.remove('in-willow'); }

  function data(ctx) {
    const cls = ctx.cls, NX = window.NexoClassroom, E = window.NexoClassEvidence;
    if (!cls || !NX) return null;
    const state = ctx.getState(), s = state.classSessions?.[cls.id] || { answers: {} };
    s.answers ||= {};
    const w = NX.willowOf(cls, { getState: () => state }, s);
    const concepts = (cls.concepts || []).filter(c => !c.root), roots = (cls.concepts || []).filter(c => c.root);
    const leaves = E ? E.leaves(cls, E.storeFor(state, cls.id)) : {};
    const per = Math.max(1, Math.ceil(cls.missions.length / 4));
    const floors = [0, 1, 2, 3].map(k => cls.missions.slice(k * per, (k + 1) * per).map(m => {
      const items = NX.itemsOf(m), done = items.filter(({ item }) => s.answers[item.id]).length;
      return { m, pct: items.length ? Math.round(done / items.length * 100) : 0 };
    }));
    return { cls, s, w, concepts, roots, leaves, floors, goal: NX.goalOf(cls, s) };
  }

  function render(app, ctx) {
    cleanup();
    const subj = ctx.subject, look = window.NexoWillowTower.forSubject(subj.id), d = data(ctx);
    document.body.classList.add('in-willow');
    const i = ORDER.indexOf(subj.id), prev = ORDER[(i + 3) % 4], next = ORDER[(i + 1) % 4], name = id => ctx.subjectName(id);
    app.innerHTML = `<section class="wv" style="--acc:${esc(look.color)}" aria-label="Torre de ${esc(subj.name)}">
      <div class="wv-stage"><canvas class="wv-canvas" width="256" height="192" role="img" aria-label="${esc(d ? `Tu sauce en la torre de ${subj.name}: ${d.w.floor}` : `Torre de ${subj.name}, dormida`)}"></canvas></div>
      <header class="wv-top">
        <button class="wv-btn" data-wv="back">← Salir</button>
        <div class="wv-title"><b>Torre de ${esc(subj.name)}</b><span>${esc(d ? `${d.w.floor} · ${d.w.green} de ${d.w.total} hilos verdes${d.w.lit ? ` · ${d.w.lit} farolitos` : ''}` : 'dormida: su clase está en preparación')}</span></div>
        <div class="wv-switch"><button class="wv-btn" data-wv="go" data-id="${prev}" aria-label="Torre de ${esc(name(prev))}">◀</button><button class="wv-btn" data-wv="go" data-id="${next}" aria-label="Torre de ${esc(name(next))}">▶</button></div>
      </header>
      <p class="wv-hint" data-wv-hint>${d ? 'Toca un hilo, un piso, las raíces o el cristal.' : 'Toca las otras torres para visitarlas.'}</p>
      <aside class="wv-card" data-wv-card hidden></aside>
    </section>`;
    const canvas = app.querySelector('.wv-canvas'), card = app.querySelector('[data-wv-card]'), hint = app.querySelector('[data-wv-hint]');
    // Ancho del dibujo según la pantalla: más ancha que 4:3 → el paisaje sigue a los lados (sin recortar la torre).
    // Celular vertical: un lienzo angosto con la torre entera arriba y la tarjeta abajo.
    const fit = () => { const vw = innerWidth, vh = innerHeight, ar = vw / vh, tall = ar < 0.8;
      const W = ar > 4 / 3 ? Math.min(440, Math.round(192 * ar)) : tall ? 148 : 256;
      app.querySelector('.wv')?.classList.toggle('is-tall', tall);
      canvas.style.width = `${ar > 4 / 3 ? Math.max(vw, vh * W / 192) : tall ? vw : Math.min(vh * 4 / 3, vw * 2.32)}px`; return W; };
    const width = fit();
    const tower = window.NexoWillowTower.mount(canvas, { ...look, width, stage: d ? (d.s.willowSeen ?? d.w.stage) : 0, states: d ? d.w.states : [], roots: d ? d.w.roots : 0 });
    if (d) { tower.update({ stage: d.w.stage }); d.s.willowSeen = d.w.stage; }
    const toCanvas = ev => { const r = canvas.getBoundingClientRect(); return [(ev.clientX - r.left) / r.width * canvas.width, (ev.clientY - r.top) / r.height * 192]; };
    canvas.addEventListener('pointermove', ev => { if (ev.pointerType !== 'mouse') return; const sel = tower.pick(...toCanvas(ev)); tower.hover(sel); canvas.style.cursor = sel ? 'pointer' : 'default'; });
    canvas.addEventListener('pointerleave', () => tower.hover(null));
    canvas.addEventListener('click', ev => {
      const sel = tower.pick(...toCanvas(ev));
      if (sel?.kind === 'tower') return ctx.go(sel.id);
      tower.select(sel); show(sel);
    });
    function show(sel) {
      if (!sel) { card.hidden = true; hint.hidden = false; return; }
      hint.hidden = true; card.hidden = false; card.innerHTML = cardFor(sel, d, subj);
      card.querySelector('[data-wv="close"]')?.focus();
    }
    app.querySelector('.wv').addEventListener('click', ev => {
      const b = ev.target.closest('[data-wv]'); if (!b) return;
      const a = b.dataset.wv;
      if (a === 'back') return ctx.back();
      if (a === 'go') return ctx.go(b.dataset.id);
      if (a === 'close') { tower.select(null); show(null); return; }
      if (a === 'open' && d) return ctx.openClass(d.cls.id, { path: b.dataset.path || null, mission: b.dataset.mission || null, panel: b.dataset.panel || null });
    });
    let resizeT = 0;
    const onResize = () => { clearTimeout(resizeT); resizeT = setTimeout(() => { if (Math.abs(fit() - width) > 8) ctx.rerender?.(); }, 200); };
    addEventListener('resize', onResize);
    const onKey = ev => { if (ev.key === 'Escape') { if (!card.hidden) { tower.select(null); show(null); } else ctx.back(); } };
    document.addEventListener('keydown', onKey);
    current = { tower, off: () => { document.removeEventListener('keydown', onKey); removeEventListener('resize', onResize); } };
    ctx.saveState?.();
  }

  function cardFor(sel, d, subj) {
    const close = '<button class="wv-btn wv-close" data-wv="close" aria-label="Cerrar">✕</button>';
    if (!d) return `${close}<h3>Torre dormida</h3><p>La clase de ${esc(subj.name)} todavía está en preparación. Cuando esté lista, aquí crecerá su sauce.</p>`;
    const btn = (label, attrs, primary) => `<button class="wv-btn ${primary ? 'is-primary' : ''}" data-wv="open" ${attrs}>${label}</button>`;
    if (sel.kind === 'strand') {
      const c = d.concepts[sel.idx]; if (!c) return close;
      const l = d.leaves[c.id] || { shown: 'semilla', label: 'Sin ver' }, m = d.cls.missions.find(x => x.id === c.mission);
      const review = ['amarilla', 'seca', 'verde', 'intensa'].includes(l.shown);
      return `${close}<p class="wv-eyebrow">Hilo del sauce · concepto</p><h3>${esc(c.title)}</h3>
        <p class="wv-leaf is-${esc(l.shown)}"><i aria-hidden="true"></i>${esc(l.label)}</p><p>${ADVICE[l.shown] || ''}</p>
        <div class="wv-row">${m ? btn(`Ir a ${esc(m.title)} ▸`, `data-path="misiones" data-mission="${esc(m.id)}"`, !review) : ''}${review ? btn('Ronda del alba ▸', 'data-path="alba"', true) : ''}</div>`;
    }
    if (sel.kind === 'floor') {
      const f = d.floors[sel.k] || [], open = d.w.stage >= 1.6 + sel.k - 0.3;
      return `${close}<p class="wv-eyebrow">Piso ${sel.k + 1} de 4 · ${open ? 'abierto' : 'en penumbra'}</p><h3>${f.length ? f.map(x => esc(x.m.title)).join(' y ') : 'Piso vacío'}</h3>
        <ul class="wv-list">${f.map(x => `<li><span>${esc(x.m.title)}</span><span class="wv-bar"><i style="width:${x.pct}%"></i></span><b>${x.pct} %</b>${btn('Abrir ▸', `data-path="misiones" data-mission="${esc(x.m.id)}"`)}</li>`).join('')}</ul>
        <p class="wv-note">${open ? 'El tronco ya pasó por aquí: estas misiones sostienen sus ramas.' : 'Responde actividades de estas misiones y el sauce subirá hasta este piso.'}</p>`;
    }
    if (sel.kind === 'roots' || sel.kind === 'pot') {
      const started = d.w.stage >= 1;
      if (sel.kind === 'pot' && !started) return `${close}<p class="wv-eyebrow">La maceta</p><h3>Planta la semilla</h3><p>El diagnóstico "¿Por dónde empiezo?" planta tu sauce: lo que ya sabes aparece como raíces.</p><div class="wv-row">${btn('Hacer el diagnóstico ▸', 'data-path="diagnostico"', true)}</div>`;
      return `${close}<p class="wv-eyebrow">Raíces · lo que necesitas de antes</p><h3>Tus bases</h3>
        <ul class="wv-list">${d.roots.map(c => { const l = d.leaves[c.id] || { shown: 'semilla', label: 'Sin ver' }; return `<li><span>${esc(c.title)}</span><span class="wv-leaf is-${esc(l.shown)}"><i aria-hidden="true"></i>${esc(l.label)}</span></li>`; }).join('')}</ul>
        <div class="wv-row">${btn('Repaso desde cero ▸', 'data-path="base"', true)}</div>`;
    }
    if (sel.kind === 'crystal') {
      const g = d.goal; if (!g) return close;
      const pts = n => (Math.round(n * 10) / 10).toLocaleString('es-CL');
      return `${close}<p class="wv-eyebrow">El cristal de la torre · Camino al 7</p><h3>${pts(g.earned)} de ${g.total} puntos demostrados</h3>
        <p>Cuando demuestres los ${pts(g.max)} puntos que prepara ${esc(d.cls.title)}, el sauce <b>rompe el techo</b> y el cristal flota sobre su copa.</p>
        <div class="wv-row">${btn('Ver qué me falta ▸', 'data-panel="goal"', true)}${btn('Simulacro ▸', 'data-path="simulacro"')}</div>`;
    }
    return close;
  }

  window.NexoWillowView = Object.freeze({ render, cleanup });
})();
