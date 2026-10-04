/* Reproductor de clases: la torre del alquimista. El sabio guía la clase con diálogos y se muestra
   una sola cosa a la vez (sin barra de pasos). La clase se arma como una secuencia de "momentos"
   a partir de los datos de window.NexoClasses. Ver docs/clases-estructura/SPEC.md. */
(() => {
  'use strict';
  const PATHS = {
    misiones: { name: 'Misiones', tag: '10–15 min', text: 'Una idea por visita. Se retoma donde la dejaste.' },
    expedicion: { name: 'Expedición', tag: 'Clase larga', text: 'Todas las misiones seguidas, con desafíos extra si vas bien.' },
    prueba: { name: 'Prueba encima', tag: 'Evaluación pronto', text: 'Directo a lo que se pregunta. El rescate te lleva a lo que falta.' }
  };
  const SCENES = ['dawn', 'day', 'dusk', 'night'];
  /* Torre del alquimista por momento del día (assets/classroom/README.md). Mientras falte la versión HD
     se usan las miniaturas, ampliadas y desenfocadas (is-mini). */
  const TOWER = { mini: true, dawn: 'assets/classroom/torre-amanecer-mini.jpg', day: 'assets/classroom/torre-mediodia-mini.jpg',
    dusk: 'assets/classroom/torre-atardecer-mini.jpg', night: 'assets/classroom/torre-noche-mini.jpg' };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  const md = value => esc(value).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

  function sessionFor(api, id) {
    const state = api.getState();
    if (!state.classSessions || typeof state.classSessions !== 'object') state.classSessions = {};
    const s = state.classSessions[id] ||= {};
    for (const key of ['answers', 'hints', 'revealed', 'skipExplain', 'retries']) if (!s[key] || typeof s[key] !== 'object') s[key] = {};
    if (!Number.isInteger(s.beat)) s.beat = 0;
    return s;
  }

  const missionById = (cls, id) => cls.missions.find(m => m.id === id);
  const allItems = (cls, mId) => cls.missions.filter(m => !mId || m.id === mId)
    .flatMap(m => ['diagnostic', 'practice', 'challenge', 'transfer'].flatMap(stage => (m.stages[stage] || []).map(item => ({ item, stage, mission: m }))));

  /* La clase como secuencia de momentos. Se recalcula en cada vista: lo ya respondido no cambia,
     y lo que viene se adapta (saltar la lección, desafíos extra, rescate solo si hubo errores). */
  function beats(cls, s) {
    const out = [{ kind: 'path' }];
    if (!s.path) return out;
    const say = (text, m, extra = {}) => out.push({ kind: 'say', text, m, ...extra });
    const questions = (m, stage) => (m.stages[stage] || []).forEach((item, i, list) => out.push({ kind: 'question', item, m, stage, n: i + 1, of: list.length }));
    const rescue = mId => {
      const wrong = allItems(cls, mId).filter(({ item }) => s.answers[item.id] && !s.answers[item.id].correct);
      if (!wrong.length) return;
      say('Revisemos tus errores. Equivocarse también es parte del oficio del alquimista.', null, { mood: 'calm' });
      wrong.forEach(({ item, mission }) => out.push({ kind: 'rescue', item, m: mission }));
    };
    if (s.path === 'prueba') {
      say('Así que la evaluación está cerca. Iremos directo a lo que se pregunta. Sin pistas.', null);
      cls.missions.forEach(m => questions(m, 'diagnostic'));
      cls.missions.forEach(m => questions(m, 'transfer'));
      rescue(null);
      out.push({ kind: 'close' });
      return out;
    }
    const missions = s.path === 'misiones' ? [missionById(cls, s.mission) || cls.missions[0]] : cls.missions;
    missions.forEach(m => {
      say(`Hoy estudiaremos **${m.title}**: ${m.subtitle.charAt(0).toLowerCase()}${m.subtitle.slice(1)}.`, m);
      say('Antes de enseñarte, muéstrame qué sabes. En este reto no hay pistas.', m);
      questions(m, 'diagnostic');
      const diag = m.stages.diagnostic || [];
      if (diag.length && diag.every(item => s.answers[item.id]?.correct)) out.push({ kind: 'offer', m });
      if (!s.skipExplain[m.id]) {
        (m.stages.explain || []).forEach(block => out.push({ kind: 'lesson', block, m }));
        if (m.stages.worked) {
          say(`Veamos un experimento. ${m.stages.worked.prompt}`, m);
          m.stages.worked.steps.forEach((step, i) => out.push({ kind: 'step', step, i, m }));
        }
      }
      say('Ahora tú. Si te trabas, toca a tu compañero en la mesa: te dará una pista.', m);
      questions(m, 'practice');
      const practice = m.stages.practice || [];
      if (s.path === 'expedicion' && practice.length && practice.every(item => s.answers[item.id]?.correct && !s.hints[item.id])) {
        say('Vas tan bien que te traje un desafío.', m, { mood: 'proud' });
        questions(m, 'challenge');
      }
      rescue(m.id);
      say('Último encargo: un caso nuevo, como en la prueba. Esta vez, sin ayuda.', m);
      questions(m, 'transfer');
    });
    out.push({ kind: 'close' });
    return out;
  }

  function beatDone(s, b) {
    if (b.kind === 'path') return Boolean(s.path);
    if (b.kind === 'question') return Boolean(s.answers[b.item.id]);
    if (b.kind === 'rescue') return Boolean(s.retries[b.item.id]);
    if (b.kind === 'step') return !b.step.ask || Boolean(s.revealed[`${b.m.id}-w${b.i}`]);
    if (b.kind === 'offer') return s.skipExplain[b.m.id] !== undefined;
    return true;
  }

  /* ───────── Piezas de la escena ───────── */

  function scene(cls) {
    const art = cls.scene || TOWER;
    return `<div class="cr-scene ${art.mini ? 'is-mini' : ''}" aria-hidden="true">${SCENES.map(key => `<div class="cr-scene-layer is-${key}" ${art[key] ? `style="background-image:url('${esc(art[key])}')"` : ''}></div>`).join('')}
      <div class="cr-scene-shade"></div><div class="cr-motes"></div></div>`;
  }

  function slideMarkup(cls, n, { large = false } = {}) {
    const img = cls.slideImages?.[n];
    const slide = cls.slides?.[n];
    if (img) return `<img class="cr-slide-img" src="${esc(img)}" alt="Diapositiva ${esc(n)} de la clase de cátedra">`;
    if (!slide) return `<div class="cr-slide-text"><p>Diapositiva ${esc(n)}</p></div>`;
    return `<div class="cr-slide-text ${large ? 'is-large' : ''}"><h3>${esc(slide.title)}</h3><ul>${slide.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul></div>`;
  }

  function projection(cls, n) {
    return `<button class="cr-projection" data-cr="slides" data-slide="${esc(n)}" aria-label="Ver la diapositiva ${esc(n)} en grande">
      <span class="cr-projection-label">Diapositiva ${esc(n)} · toca para ampliar</span>${slideMarkup(cls, n)}</button>`;
  }

  function optionsMarkup(cls, s, item, { retry = false } = {}) {
    const record = retry ? s.retries[item.id] : s.answers[item.id];
    return `<ol class="cr-options">${item.options.map((opt, i) => {
      const picked = record?.choice === i;
      const tone = !record ? '' : picked ? (opt.correct ? 'is-right' : 'is-wrong') : (opt.correct && retry ? 'is-right' : 'is-muted');
      return `<li><button class="cr-option ${tone}" data-cr="answer" data-item="${esc(item.id)}" data-choice="${i}" data-retry="${retry ? 1 : 0}" ${record ? 'disabled' : ''}>
        <span class="cr-letter">${String.fromCharCode(65 + i)}</span><span>${esc(opt.text)}</span></button></li>`;
    }).join('')}</ol>`;
  }

  /* Qué dice el sabio y qué aparece al centro en cada momento. */
  function moment(cls, api, s, b) {
    const sage = { text: '', actions: '', mood: 'calm' };
    let center = '';
    const cont = (label = 'Continuar') => `<button class="cr-btn cr-primary cr-next" data-cr="next">${label} ▸</button>`;

    if (b.kind === 'path') {
      sage.text = `Bienvenido a la torre, aprendiz. Hoy abriremos el capítulo de **${cls.title}** (${cls.evaluation}). ¿Cómo quieres aprender?`;
      center = `<div class="cr-paths" role="group" aria-label="Camino de estudio">${Object.entries(PATHS).map(([id, p]) =>
        `<button class="cr-path" data-cr="path" data-path="${id}"><span class="cr-path-tag">${esc(p.tag)}</span><b>${esc(p.name)}</b><span>${esc(p.text)}</span></button>`).join('')}</div>
        ${cls.missions.length > 1 ? '' : '<p class="cr-soon">Por ahora está lista la Misión 1. Las demás llegan pronto.</p>'}`;
      return { sage, center };
    }
    if (b.kind === 'say') {
      sage.text = b.text; sage.mood = b.mood || 'calm'; sage.actions = cont();
      return { sage, center };
    }
    if (b.kind === 'offer') {
      sage.text = '¡Acertaste todo el reto! Puedes saltarte la lección e ir directo a practicar, o escucharla igual.';
      sage.mood = 'proud';
      sage.actions = `<button class="cr-btn cr-primary" data-cr="offer" data-skip="1">Saltar a la práctica ▸</button><button class="cr-btn" data-cr="offer" data-skip="0">Quiero la lección</button>`;
      return { sage, center };
    }
    if (b.kind === 'lesson') {
      const blk = b.block;
      sage.text = `**${blk.title}.** ${blk.body}`;
      sage.actions = cont('Entendido');
      center = `<div class="cr-lesson">${blk.slide ? projection(cls, blk.slide) : ''}
        ${blk.rows || blk.note ? `<div class="cr-parchment">${blk.rows ? `<dl class="cr-rows">${blk.rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}${blk.note ? `<p class="cr-note">${md(blk.note)}</p>` : ''}</div>` : ''}</div>`;
      return { sage, center };
    }
    if (b.kind === 'step') {
      const w = b.m.stages.worked, key = `${b.m.id}-w${b.i}`, hidden = b.step.ask && !s.revealed[key];
      sage.text = hidden ? `Antes de mirar, piensa: ${b.step.ask}` : `Paso ${b.i + 1}. ${b.step.text}`;
      sage.actions = hidden ? `<button class="cr-btn cr-primary" data-cr="reveal" data-key="${key}">Ya lo pensé, muéstrame ▸</button>` : cont();
      center = `<div class="cr-parchment cr-experiment"><p class="cr-eyebrow">Experimento</p><p class="cr-exp-prompt">${md(w.prompt)}</p>
        <ol class="cr-worked">${w.steps.map((st, i) => {
          if (i > b.i) return '';
          if (i === b.i && hidden) return `<li class="is-ask"><span>${i + 1}</span><p>¿…?</p></li>`;
          return `<li class="${i === b.i ? 'is-now' : ''}"><span>${i + 1}</span><p>${md(st.text)}</p></li>`;
        }).join('')}</ol></div>`;
      return { sage, center };
    }
    if (b.kind === 'question') {
      const item = b.item, record = s.answers[item.id], hint = s.hints[item.id];
      const label = { diagnostic: 'Reto del sabio', practice: 'Prueba del aprendiz', challenge: 'Desafío', transfer: 'Encargo final' }[b.stage];
      if (!record) {
        sage.text = { diagnostic: 'Responde con lo que sabes.', practice: 'Tu turno.', challenge: 'Este es más difícil. Confío en ti.', transfer: 'Un caso nuevo. Piensa como en la prueba.' }[b.stage];
      } else if (record.correct) {
        sage.text = `${hint ? 'Bien, con una pista.' : '¡Exacto, sin ayuda!'} ${item.explain}`; sage.mood = 'proud'; sage.actions = cont();
      } else {
        const mc = cls.misconceptions[item.options[record.choice].misconception];
        sage.text = mc ? `**${mc.label}.** ${mc.why}` : 'No es esa. Lo revisaremos juntos más adelante.';
        sage.mood = 'concerned'; sage.actions = cont();
      }
      center = `<article class="cr-card ${record ? (record.correct ? 'is-right' : 'is-wrong') : ''}">
        <p class="cr-eyebrow">${esc(label)} · ${b.n} de ${b.of}</p><p class="cr-q">${md(item.prompt)}</p>
        ${hint && !record ? `<p class="cr-hinttext"><b>Pista de tu compañero:</b> ${md(item.hint)}</p>` : ''}
        ${optionsMarkup(cls, s, item)}
        ${item.slide ? `<button class="cr-cite" data-cr="slides" data-slide="${esc(item.slide)}">Ver diapositiva ${esc(item.slide)}</button>` : ''}</article>`;
      return { sage, center };
    }
    if (b.kind === 'rescue') {
      const item = b.item, record = s.answers[item.id], retry = s.retries[item.id];
      const mc = cls.misconceptions[item.options[record.choice].misconception];
      const block = mc?.prereq && missionById(cls, mc.prereq.mission)?.stages.explain.find(x => x.id === mc.prereq.block);
      if (!retry) {
        sage.text = mc ? `Respondiste «${item.options[record.choice].text}». ${mc.why} Mira la diapositiva y vuelve a intentarlo.` : 'Miremos de nuevo esta pregunta.';
        sage.mood = 'calm';
      } else {
        sage.text = retry.correct ? '¡Corregido! Así se aprende de un error.' : 'Todavía no. Vuelve a esta idea otro día: la repasaremos.';
        sage.mood = retry.correct ? 'proud' : 'concerned'; sage.actions = cont();
      }
      center = `<div class="cr-lesson">${block?.slide ? projection(cls, block.slide) : ''}
        <article class="cr-card"><p class="cr-eyebrow">Rescate${mc?.prereq ? ` · repasa: ${esc(mc.prereq.title)}` : ''}</p><p class="cr-q">${md(item.prompt)}</p>${optionsMarkup(cls, s, item, { retry: true })}</article></div>`;
      return { sage, center };
    }
    // Cierre
    const scope = allItems(cls, s.path === 'misiones' ? s.mission : null).filter(({ item }) => s.answers[item.id]);
    const solo = scope.filter(({ item }) => s.answers[item.id].correct && !s.hints[item.id]).length;
    const withHint = scope.filter(({ item }) => s.answers[item.id].correct && s.hints[item.id]).length;
    const wrong = scope.filter(({ item }) => !s.answers[item.id].correct);
    const fixed = wrong.filter(({ item }) => s.retries[item.id]?.correct).length;
    const next = s.path === 'misiones' ? cls.missions[cls.missions.findIndex(m => m.id === s.mission) + 1] : null;
    sage.text = 'Buen trabajo, aprendiz. Lo que acertaste hoy muestra que lo entendiste. Para que sea tuyo de verdad, vuelve en uno o dos días y demuéstralo de nuevo sin ayuda.';
    sage.mood = 'proud';
    sage.actions = `${next ? `<button class="cr-btn cr-primary" data-cr="mission" data-mission="${next.id}">Siguiente misión ▸</button>` : ''}<button class="cr-btn" data-cr="restart">Volver a empezar</button><button class="cr-btn" data-cr="exit">Salir de la torre</button>`;
    center = `<div class="cr-parchment cr-summary-card"><p class="cr-eyebrow">Lo que demostraste</p>
      <dl class="cr-summary"><div><dt>Sin ayuda</dt><dd>${solo}</dd></div><div><dt>Con pista</dt><dd>${withHint}</dd></div><div><dt>Errores corregidos</dt><dd>${fixed}/${wrong.length}</dd></div></dl>
      <p class="cr-note">Todavía no es dominio: cuenta como <b>retenido</b> cuando lo recuerdas sin ayuda 24 horas o más después.</p></div>`;
    return { sage, center };
  }

  function lightbox(cls, s) {
    if (!s.slideOpen) return '';
    const numbers = Object.keys({ ...cls.slides, ...cls.slideImages }).map(Number).sort((a, b) => a - b);
    const n = Number(s.slideOpen), i = numbers.indexOf(n);
    return `<div class="cr-lightbox" role="dialog" aria-modal="true" aria-label="Diapositivas de la clase">
      <div class="cr-lightbox-inner"><header><b>Clase de cátedra · ${esc(Object.values(cls.sources)[0]?.author || '')}</b><button class="cr-btn cr-small" data-cr="slides-close">Cerrar ✕</button></header>
      <div class="cr-lightbox-slide"><p class="cr-eyebrow">Diapositiva ${esc(n)}</p>${slideMarkup(cls, n, { large: true })}</div>
      <footer><button class="cr-btn" data-cr="slides" data-slide="${numbers[i - 1] ?? ''}" ${i > 0 ? '' : 'disabled'}>◂ Anterior</button>
        <span>${i + 1} de ${numbers.length}</span>
        <button class="cr-btn" data-cr="slides" data-slide="${numbers[i + 1] ?? ''}" ${i < numbers.length - 1 ? '' : 'disabled'}>Siguiente ▸</button></footer>
      ${cls.slideImages && Object.keys(cls.slideImages).length ? '' : '<p class="cr-muted">Mostrando el texto de la diapositiva. Las imágenes originales llegan cuando se pueda descargar el PDF.</p>'}</div></div>`;
  }

  function render(id, api) {
    const cls = window.NexoClasses?.[id];
    const s = sessionFor(api, id);
    if (s.path && !PATHS[s.path]) s.path = null;
    const list = beats(cls, s);
    s.beat = Math.max(0, Math.min(s.beat, list.length - 1));
    const b = list[s.beat];
    const { sage, center } = moment(cls, api, s, b);
    const hintable = b.kind === 'question' && (b.stage === 'practice' || b.stage === 'challenge') && !s.answers[b.item.id] && !s.hints[b.item.id];
    const progress = Math.round((s.beat / Math.max(1, list.length - 1)) * 100);
    const mascotMood = s.mascotMood || 'idle';
    const entering = !api.app.querySelector('.classroom');
    api.app.innerHTML = `<section class="classroom ${entering ? 'is-entering' : ''}" aria-label="Torre del alquimista: ${esc(cls.title)}">
      ${scene(cls)}
      <header class="cr-top">
        <button class="cr-btn cr-small cr-ghost" data-cr="exit">← Salir</button>
        <div class="cr-thread" role="progressbar" aria-label="Avance de la clase" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><span style="width:${progress}%"></span></div>
        <button class="cr-btn cr-small cr-ghost" data-cr="slides" data-slide="${esc((b.block?.slide) || (b.item?.slide) || Object.keys(cls.slides || {})[0] || 1)}">Diapositivas</button>
      </header>
      <main class="cr-center" aria-live="polite">${center}</main>
      <section class="cr-dialog" data-mood="${esc(sage.mood)}" aria-label="El sabio">
        <button class="cr-mascot" data-cr="mascot" data-mood="${esc(mascotMood)}" aria-label="${hintable ? 'Pedir una pista a tu compañero' : 'Tu compañero'}">
          ${hintable ? '<span class="cr-mascot-tip">¿Pista?</span>' : ''}${api.avatarMarkup({ label: 'Tu compañero' })}</button>
        <p class="cr-speaker">El sabio</p>
        <p class="cr-say" ${entering ? '' : 'data-fresh="1"'}>${md(sage.text)}</p>
        ${s.mascotSay ? `<p class="cr-mascot-say"><b>Tu compañero:</b> ${md(s.mascotSay)}</p>` : ''}
        <div class="cr-actions">${sage.actions}</div>
      </section>
      ${lightbox(cls, s)}
    </section>`;
    document.body.classList.add('in-classroom');
    api.hydrate();
    const root = api.app.querySelector('.classroom');
    root.addEventListener('click', event => onClick(event, id, api));
    root.addEventListener('keydown', event => { if (event.key === 'Escape' && s.slideOpen) { s.slideOpen = null; rerender(id, api); } });
    (root.querySelector('.cr-lightbox [data-cr="slides-close"]') || root.querySelector('.cr-option:not(:disabled)') || root.querySelector('.cr-next, .cr-actions .cr-primary') || root.querySelector('.cr-path'))?.focus({ preventScroll: true });
  }

  function rerender(id, api) { api.saveState(); render(id, api); }

  function onClick(event, id, api) {
    const button = event.target.closest('[data-cr]');
    if (!button || button.disabled) return;
    const cls = window.NexoClasses[id];
    const s = sessionFor(api, id);
    const list = beats(cls, s), b = list[s.beat];
    const action = button.dataset.cr;
    if (action !== 'mascot') { s.mascotSay = ''; }

    if (action === 'exit') { document.body.classList.remove('in-classroom'); return api.exit(); }
    if (action === 'slides') { if (button.dataset.slide) s.slideOpen = button.dataset.slide; return rerender(id, api); }
    if (action === 'slides-close') { s.slideOpen = null; return rerender(id, api); }
    if (action === 'path') {
      s.path = button.dataset.path; s.mission = s.mission || cls.missions[0].id; s.beat = 1; s.mascotMood = 'happy';
      api.track?.('class_started', { class_id: id, path: s.path });
      return rerender(id, api);
    }
    if (action === 'mission') { s.path = 'misiones'; s.mission = button.dataset.mission; s.beat = 1; return rerender(id, api); }
    if (action === 'restart') { s.path = null; s.beat = 0; s.mascotMood = 'idle'; return rerender(id, api); }
    if (action === 'next') { if (beatDone(s, b)) { s.beat += 1; s.mascotMood = 'idle'; } return rerender(id, api); }
    if (action === 'offer') { s.skipExplain[b.m.id] = button.dataset.skip === '1'; s.beat += 1; s.mascotMood = 'happy'; return rerender(id, api); }
    if (action === 'reveal') { s.revealed[button.dataset.key] = true; return rerender(id, api); }
    if (action === 'mascot') {
      const canHint = b.kind === 'question' && (b.stage === 'practice' || b.stage === 'challenge') && !s.answers[b.item.id];
      if (canHint && b.item.hint && !s.hints[b.item.id]) {
        s.hints[b.item.id] = true; s.mascotMood = 'think';
        s.mascotSay = 'Te dejé una pista en el pergamino. Esta respuesta contará como "con pista".';
      } else if (b.kind === 'question' && (b.stage === 'diagnostic' || b.stage === 'transfer') && !s.answers[b.item.id]) {
        s.mascotMood = 'think'; s.mascotSay = 'Aquí no puedo ayudarte, ¡pero sé que puedes!';
      } else {
        s.mascotMood = 'happy'; s.mascotSay = ['¡Vamos bien!', 'Me encanta esta torre.', '¿Viste ese frasco burbujear?'][s.beat % 3];
      }
      return rerender(id, api);
    }
    if (action === 'answer') {
      const itemId = button.dataset.item, choice = Number(button.dataset.choice), retry = button.dataset.retry === '1';
      const item = allItems(cls).find(entry => entry.item.id === itemId)?.item;
      if (!item) return;
      const correct = Boolean(item.options[choice]?.correct);
      if (retry) {
        if (s.retries[itemId]) return;
        s.retries[itemId] = { choice, correct, at: new Date().toISOString() };
      } else {
        if (s.answers[itemId]) return;
        if (b.stage === 'diagnostic' || b.stage === 'transfer') delete s.hints[itemId];
        s.answers[itemId] = { choice, correct, hint: Boolean(s.hints[itemId]), stage: b.stage, at: new Date().toISOString() };
      }
      s.mascotMood = correct ? 'happy' : 'worry';
      api.track?.('class_answer', { class_id: id, correct, retry });
      return rerender(id, api);
    }
  }

  window.NexoClassroom = { render, beats, PATHS };
})();
