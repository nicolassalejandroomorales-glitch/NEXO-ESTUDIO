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
  /* Torre del alquimista por momento del día (assets/classroom/README.md). Pinturas HD de Canva entregadas por Niquito. */
  const TOWER = { dawn: 'assets/classroom/torre-amanecer.webp', day: 'assets/classroom/torre-atardecer.webp',
    dusk: 'assets/classroom/torre-atardecer.webp', night: 'assets/classroom/torre-noche.webp' }; // mediodía: pendiente la versión HD
  /* Objetos tocables de cada pintura, en % del arte 16:9: [x, y, ancho, alto]. Igual que en el refugio:
     invisibles, solo brillan al pasar el mouse. Se usan los de la pintura que domina a esa hora. */
  const HOTSPOTS = {
    dawn: { sage: [10, 24, 15, 70], book: [20, 49, 12, 15], board: [36, 20, 28, 35], window: [22.5, 12, 9.5, 43], flasks: [73, 50, 26, 30] },
    dusk: { sage: [12, 20, 12, 68], book: [19, 40, 13, 14], board: [45.5, 17, 31.5, 33], window: [5, 7, 15.5, 58], flasks: [80, 56, 16, 24] },
    night: { sage: [9.5, 24, 22, 71], book: [24.5, 46, 15, 14], board: [36, 9, 30, 57], window: [8, 4, 16, 31], flasks: [77, 54, 21, 20] }
  };
  // El arte generado (tools/classroom-art/build_tower.py) es la fuente de verdad cuando está cargado.
  const ART = window.NexoTowerArt;
  if (ART) { Object.assign(TOWER, ART.scenes); Object.assign(HOTSPOTS, ART.hotspots); } else HOTSPOTS.day = HOTSPOTS.dusk;
  const SPOT_LABEL = { sage: 'Pedirle al sabio que explique desde cero', book: 'Abrir el glosario del sabio', board: 'Ver las diapositivas de la clase',
    window: 'Cambiar la hora de la torre', flasks: 'Mezclar los frascos: dato curioso' };
  const HOURS = [7, 12.5, 18.6, 22];
  function dominantScene() {
    const style = getComputedStyle(document.body);
    return SCENES.reduce((best, key) => (parseFloat(style.getPropertyValue(`--w-${key}`)) || (key === 'day' ? 0.01 : 0)) >
      (parseFloat(style.getPropertyValue(`--w-${best}`)) || (best === 'day' ? 0.01 : 0)) ? key : best, 'day');
  }
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  const md = value => esc(value).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

  function sessionFor(api, id) {
    const state = api.getState();
    if (!state.classSessions || typeof state.classSessions !== 'object') state.classSessions = {};
    const s = state.classSessions[id] ||= {};
    for (const key of ['answers', 'hints', 'revealed', 'skipExplain', 'retries', 'work', 'conf', 'confWhy']) if (!s[key] || typeof s[key] !== 'object') s[key] = {};
    if (!Number.isInteger(s.beat)) s.beat = 0;
    return s;
  }

  const missionById = (cls, id) => cls.missions.find(m => m.id === id);
  const pts = n => (Math.round(n * 10) / 10).toLocaleString('es-CL');

  /* Meta de la clase (cls.goal): cuántos puntos de la prueba ya demostraste. Un punto cuenta cuando aciertas
     sin ayuda el caso estilo prueba (transferencia) de las misiones que preparan esa pregunta. */
  function goalOf(cls, s) {
    const g = cls.goal;
    if (!g) return null;
    const qs = g.questions.map(q => {
      const items = cls.missions.filter(m => q.missions.includes(m.id)).flatMap(m => m.stages.transfer || []);
      const ok = items.filter(item => s.answers[item.id]?.correct && !s.answers[item.id].hint).length;
      return { ...q, items, ok, earned: items.length ? q.points * ok / items.length : 0 };
    });
    const earned = qs.reduce((sum, q) => sum + q.earned, 0), max = qs.reduce((sum, q) => sum + q.points, 0);
    const worth = mId => qs.reduce((sum, q) => {
      const mine = (missionById(cls, mId)?.stages.transfer || []).filter(item => q.items.includes(item)).length;
      return sum + (q.items.length ? q.points * mine / q.items.length : 0);
    }, 0);
    const won = mId => (missionById(cls, mId)?.stages.transfer || []).length
      ? worth(mId) * (missionById(cls, mId).stages.transfer.filter(item => s.answers[item.id]?.correct && !s.answers[item.id].hint).length / missionById(cls, mId).stages.transfer.length) : 0;
    return { ...g, qs, earned, max, worth, won };
  }

  function goalMeter(goal) {
    const seg = (n, cls, label) => `<span class="cr-goal-seg ${cls}" style="flex:${n}" title="${esc(label)}"></span>`;
    return `<div class="cr-goal-meter" role="img" aria-label="Llevas ${pts(goal.earned)} de ${goal.total} puntos demostrados">
      ${goal.earned ? seg(goal.earned, 'is-won', 'Demostrado') : ''}${goal.max - goal.earned > 0 ? seg(goal.max - goal.earned, 'is-open', 'Por demostrar en esta clase') : ''}
      ${(goal.rest || []).map(r => seg(r.points, 'is-later', r.label)).join('')}</div>`;
  }
  /* Una misión puede dividirse en partes (recetas): cada una con su "adivina antes", su lección y su práctica. */
  const partsOf = m => m.parts || [];
  const blocksOf = m => [...(m.stages.fundamentals || []), ...(m.stages.explain || []), ...partsOf(m).flatMap(p => p.explain || [])];
  const itemsOf = m => [
    ...(m.stages.diagnostic || []).map(item => ({ item, stage: 'diagnostic' })),
    ...partsOf(m).flatMap(p => [...(p.pretest ? [{ item: p.pretest, stage: 'pretest' }] : []), ...(p.practice || []).map(item => ({ item, stage: 'practice' }))]),
    ...['practice', 'challenge', 'transfer'].flatMap(stage => (m.stages[stage] || []).map(item => ({ item, stage })))];
  const allItems = (cls, mId) => cls.missions.filter(m => !mId || m.id === mId).flatMap(m => itemsOf(m).map(x => ({ ...x, mission: m })));

  /* La clase como secuencia de momentos. Se recalcula en cada vista: lo ya respondido no cambia,
     y lo que viene se adapta (saltar la lección, desafíos extra, rescate solo si hubo errores). */
  function beats(cls, s) {
    const out = [{ kind: 'path' }];
    if (!s.path) return out;
    const say = (text, m, extra = {}) => out.push({ kind: 'say', text, m, ...extra });
    const questions = (m, stage) => (m.stages[stage] || []).forEach((item, i, list) => out.push({ kind: 'question', item, m, stage, n: i + 1, of: list.length }));
    const rescue = mId => {
      const wrong = allItems(cls, mId).filter(({ item, stage }) => stage !== 'pretest' && s.answers[item.id] && !s.answers[item.id].correct);
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
    if (s.path === 'misiones' && !missionById(cls, s.mission)) { out.push({ kind: 'pick' }); return out; }
    const missions = s.path === 'misiones' ? [missionById(cls, s.mission)] : cls.missions;
    missions.forEach(m => {
      say(`Hoy estudiaremos **${m.title}**: ${m.subtitle.charAt(0).toLowerCase()}${m.subtitle.slice(1)}.`, m);
      if (m.stages.hook) out.push({ kind: 'hook', m });
      say('Antes de enseñarte, muéstrame qué sabes. En este reto no hay pistas.', m);
      questions(m, 'diagnostic');
      const diag = m.stages.diagnostic || [];
      if (diag.length && diag.every(item => s.answers[item.id]?.correct)) out.push({ kind: 'offer', m });
      if (!s.skipExplain[m.id]) {
        if ((m.stages.fundamentals || []).length) {
          say('Empecemos desde cero, para que nada quede en el aire. Si algo ya lo sabes, pasa rápido.', m);
          m.stages.fundamentals.forEach(block => out.push({ kind: 'lesson', block, m, zero: true }));
          say('Con esas bases, ahora sí: la materia de la clase.', m);
        }
        (m.stages.explain || []).forEach(block => out.push({ kind: 'lesson', block, m }));
        if (m.stages.worked) {
          say(`Veamos un experimento. ${m.stages.worked.prompt}`, m);
          m.stages.worked.steps.forEach((step, i) => out.push({ kind: 'step', step, i, m }));
        }
      }
      partsOf(m).forEach(p => {
        say(p.intro, m, { mood: 'proud' });
        if (!s.skipExplain[m.id]) {
          if (p.pretest) { say('Antes de explicarte, adivina. Aquí equivocarse no cuenta: solo prepara tu cabeza.', m); out.push({ kind: 'question', item: p.pretest, m, stage: 'pretest', n: 1, of: 1 }); }
          (p.explain || []).forEach(block => out.push({ kind: 'lesson', block, m }));
          say('Ahora tú. Si te trabas, toca a tu compañero en la mesa: te dará una pista.', m);
        }
        (p.practice || []).forEach((item, i, list) => out.push({ kind: 'question', item, m, stage: 'practice', n: i + 1, of: list.length }));
        if (p.recipe) out.push({ kind: 'lesson', block: { ...p.recipe, kind: 'recipe', id: `${p.id}-recipe` }, m });
      });
      if ((m.stages.practice || []).length) { say('Ahora tú. Si te trabas, toca a tu compañero en la mesa: te dará una pista.', m); questions(m, 'practice'); }
      const practice = itemsOf(m).filter(x => x.stage === 'practice').map(x => x.item);
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
    if (b.kind === 'pick') return Boolean(s.mission);
    if (b.kind === 'question') return Boolean(s.answers[b.item.id]);
    if (b.kind === 'rescue') return Boolean(s.retries[b.item.id]);
    if (b.kind === 'step') return !b.step.ask || Boolean(s.revealed[`${b.m.id}-w${b.i}`]);
    if (b.kind === 'offer') return s.skipExplain[b.m.id] !== undefined;
    return true;
  }

  /* ───────── Piezas de la escena ───────── */

  function scene(cls, s, b) {
    const art = cls.scene || TOWER;
    const sceneKey = dominantScene(), spots = HOTSPOTS[sceneKey], glows = ART?.glows?.[sceneKey] || {};
    const [fx, fy, fw, fh] = spots.flasks, [bx, by, bw, bh] = spots.board;
    const mode = b?.kind === 'lesson' || b?.kind === 'rescue' ? 'teaching' : b?.kind === 'question' ? 'testing' : '';
    return `<div class="cr-scene ${art.mini ? 'is-mini' : ''} ${mode ? `is-${mode}` : ''} ${s.burst ? `burst-${s.burst}` : ''}"><div class="cr-art">
      ${SCENES.map(key => `<div class="cr-scene-layer is-${key}" aria-hidden="true" ${art[key] ? `style="background-image:url('${esc(art[key])}')"` : ''}></div>`).join('')}
      <div class="cr-scene-shade" aria-hidden="true"></div>
      <div class="cr-life cr-board-glow" aria-hidden="true" style="left:${bx}%;top:${by}%;width:${bw}%;height:${bh}%"></div>
      <div class="cr-life cr-bubbles" aria-hidden="true" style="left:${fx}%;top:${fy}%;width:${fw}%;height:${fh}%">${'<i></i>'.repeat(7)}</div>
      ${s.burst ? `<div class="cr-life cr-burst" aria-hidden="true" style="left:${fx}%;top:${fy - 8}%;width:${fw}%;height:${fh + 8}%">${'<i></i>'.repeat(12)}</div>` : ''}
      ${Object.entries(spots).map(([id, [x, y, w, h]], i) => `<button class="cr-spot is-${id}" data-cr="spot" data-spot="${id}" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%;--i:${i}" aria-label="${esc(SPOT_LABEL[id])}" title="${esc(SPOT_LABEL[id])}">${glows[id] ? `<img class="cr-spot-glow" src="${esc(glows[id])}" alt="">` : ''}</button>`).join('')}
      </div><div class="cr-motes" aria-hidden="true"></div></div>`;
  }

  function slideMarkup(cls, n, { large = false } = {}) {
    const img = cls.slideImages?.[n];
    const slide = cls.slides?.[n];
    if (img) return `<img class="cr-slide-img" src="${esc(img)}" alt="Diapositiva ${esc(n)}${slide ? `: ${esc(slide.title)}` : ''}" loading="lazy">${large && slide ? `<details class="cr-slide-notes"><summary>Lo que dice, en texto</summary><ul>${slide.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul></details>` : ''}`;
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

  /* ───────── Actividades ─────────
     choice (alternativas) · order (ordenar tarjetas) · classify (clasificar en calderos)
     match (unir pares) · pick (tocar la parte correcta de una molécula). */
  const MIN_WRITE = 25;
  const norm = t => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // Ideas clave de una respuesta escrita (solo busca palabras: orienta, no reemplaza la autocorrección).
  const keyIdeas = (item, text) => (item.keywords || []).map(k => ({ label: k.label, hit: k.any.some(word => norm(text).includes(norm(word))) }));
  function recipeWhy(item, seq) {
    const bad = seq.find((id, i) => !item.answer.includes(id)) ;
    if (bad) return item.notes?.[bad] || 'Ese ingrediente no va en esta receta.';
    return item.orderNote || 'Los ingredientes son correctos, pero el orden no.';
  }
  const seeded = (list, seed) => list.map((x, i) => [x, [...`${seed}${i}`].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 9973, 7)]).sort((a, b) => a[1] - b[1]).map(([x]) => x);
  const recordOf = (s, item, retry) => retry ? s.retries[item.id] : s.answers[item.id];
  const workOf = (s, item, retry) => (s.work[retry ? `${item.id}::r` : item.id] ||= {});
  const actBtn = (item, retry, action, attrs, inner, cls = '', disabled = false) =>
    `<button class="${cls}" data-cr="${action}" data-item="${esc(item.id)}" data-retry="${retry ? 1 : 0}" ${attrs} ${disabled ? 'disabled' : ''}>${inner}</button>`;

  function isCorrect(item, value) {
    if (item.type === 'order') return JSON.stringify(value) === JSON.stringify(item.answer);
    if (item.type === 'classify') return item.cards.every(c => value?.[c.id] === c.bucket);
    if (item.type === 'match') return item.pairs.every((_, i) => Number(value?.[i]) === i);
    if (item.type === 'pick') return value === item.answer;
    // Escrita: autocorrección honesta; cuenta solo si escribiste algo y marcaste todas las ideas de la pauta.
    if (item.type === 'build' || item.type === 'arrows') return Boolean(window.NexoMolEditor?.isCorrect(item, value));
    if (item.type === 'poe') return Boolean(item.options[value?.pred]?.correct);
    if (item.type === 'recipe') return JSON.stringify(value) === JSON.stringify(item.answer);
    if (item.type === 'spot') return value?.step === item.wrong && Boolean(item.fix.options[value?.fix]?.correct);
    if (item.type === 'write') return String(value?.text || '').trim().length >= MIN_WRITE && item.rubric.every((_, i) => value?.checks?.[i] === true);
    return Boolean(item.options[value]?.correct);
  }
  function mcOf(cls, item, rec) {
    if (!rec || rec.correct) return null;
    if (!item.type || item.type === 'choice') return cls.misconceptions[item.options[rec.choice]?.misconception];
    if (item.type === 'pick') return cls.misconceptions[item.targets[rec.value]?.misconception] || cls.misconceptions[item.misconception];
    return cls.misconceptions[item.misconception];
  }
  function answerText(item, rec) {
    if (!item.type || item.type === 'choice') return item.options[rec.choice]?.text;
    if (item.type === 'pick') return item.targets[rec.value]?.label;
    if (item.type === 'order') return rec.value.map(id => item.cards.find(c => c.id === id)?.text).join(' < ');
    if (item.type === 'write') return 'tu respuesta escrita';
    if (item.type === 'build') return 'tu dibujo';
    if (item.type === 'arrows') return 'tus flechas';
    if (item.type === 'poe') return item.options[rec.value.pred]?.text;
    if (item.type === 'recipe') return rec.value.map(id => item.ingredients.find(x => x.id === id)?.label).join(' → ');
    if (item.type === 'spot') return rec.value.step === item.wrong ? item.fix.options[rec.value.fix]?.text : `el paso ${rec.value.step + 1}`;
    return 'tu propuesta';
  }

  function activityMarkup(cls, s, item, { retry = false } = {}) {
    const rec = recordOf(s, item, retry), w = workOf(s, item, retry);
    const figures = item.figures ? `<div class="cr-figures">${item.figures.map(f => `<figure class="cr-fig"><div>${window.NexoMolEditor?.sceneMarkup(f, { label: f.caption }) || ''}</div><figcaption>${md(f.caption)}</figcaption></figure>`).join('')}</div>` : '';
    if (!item.type || item.type === 'choice') return figures + optionsMarkup(cls, s, item, { retry });
    const done = Boolean(rec);
    const check = ready => done ? '' : `<div class="cr-check">${actBtn(item, retry, 'act-check', '', 'Comprobar ▸', 'cr-btn cr-primary', !ready)}</div>`;

    if (item.type === 'order') {
      const seq = done ? rec.value : (w.seq ||= []);
      const pool = seeded(item.cards, item.id).filter(c => !seq.includes(c.id));
      return `<div class="cr-order"><p class="cr-act-help">${esc(item.direction || 'Toca las tarjetas en orden.')}</p>
        <ol class="cr-slots">${item.cards.map((_, i) => {
          const id = seq[i], card = item.cards.find(c => c.id === id);
          const tone = done ? (item.answer[i] === id ? 'is-right' : 'is-wrong') : '';
          return `<li class="cr-slot ${card ? 'is-filled' : ''} ${tone}"><span class="cr-slot-n">${i + 1}</span>${card ? actBtn(item, retry, 'act-unpick', `data-i="${i}"`, md(card.text), 'cr-chip', done) : '<span class="cr-slot-empty">…</span>'}</li>`;
        }).join('<li class="cr-slot-sep" aria-hidden="true">‹</li>')}</ol>
        ${pool.length ? `<div class="cr-pool">${pool.map(c => actBtn(item, retry, 'act-pick', `data-card="${esc(c.id)}"`, md(c.text), 'cr-chip is-loose')).join('')}</div>` : ''}
        ${done && !rec.correct && retry ? `<p class="cr-solution">Orden correcto: ${item.answer.map(id => md(item.cards.find(c => c.id === id).text)).join(' &lt; ')}</p>` : ''}
        ${check(seq.length === item.cards.length)}</div>`;
    }
    if (item.type === 'classify') {
      const assign = done ? rec.value : (w.assign ||= {});
      const loose = seeded(item.cards, item.id).filter(c => !assign[c.id]);
      return `<div class="cr-classify"><p class="cr-act-help">${done ? 'Así quedó tu clasificación.' : 'Toca una tarjeta y luego el caldero donde va.'}</p>
        ${loose.length ? `<div class="cr-pool">${loose.map(c => actBtn(item, retry, 'act-sel', `data-card="${esc(c.id)}"`, md(c.text), `cr-chip is-loose ${w.sel === c.id ? 'is-selected' : ''}`, done)).join('')}</div>` : ''}
        <div class="cr-buckets">${item.buckets.map(bk => `<div class="cr-bucket">
          ${actBtn(item, retry, 'act-drop', `data-bucket="${esc(bk.id)}"`, `<b>${esc(bk.label)}</b>`, `cr-bucket-head ${w.sel && !done ? 'is-armed' : ''}`, done || !w.sel)}
          <div class="cr-bucket-body">${item.cards.filter(c => assign[c.id] === bk.id).map(c => actBtn(item, retry, 'act-unassign', `data-card="${esc(c.id)}"`, md(c.text), `cr-chip ${done ? (c.bucket === bk.id ? 'is-right' : 'is-wrong') : ''}`, done)).join('')}</div></div>`).join('')}</div>
        ${done && !rec.correct && retry ? `<p class="cr-solution">${item.buckets.map(bk => `<b>${esc(bk.label)}:</b> ${item.cards.filter(c => c.bucket === bk.id).map(c => md(c.text)).join(', ')}`).join(' · ')}</p>` : ''}
        ${check(loose.length === 0)}</div>`;
    }
    if (item.type === 'match') {
      const pairs = done ? rec.value : (w.pairs ||= {});
      const rights = seeded(item.pairs.map((p, i) => ({ ...p, i })), item.id);
      const usedRight = new Set(Object.values(pairs).map(Number));
      return `<div class="cr-match"><p class="cr-act-help">${done ? 'Así uniste los pares.' : 'Toca uno de la izquierda y luego su pareja de la derecha.'}</p>
        <div class="cr-match-cols"><div class="cr-match-col">${item.pairs.map((p, i) => {
          const r = pairs[i];
          const tone = done ? (Number(r) === i ? 'is-right' : 'is-wrong') : '';
          return actBtn(item, retry, 'act-left', `data-i="${i}"`, `${r !== undefined ? `<span class="cr-pair-n">${rights.findIndex(x => x.i === Number(r)) + 1}</span>` : ''}${md(p.left)}`, `cr-chip ${w.left === i && !done ? 'is-selected' : ''} ${tone}`, done);
        }).join('')}</div>
        <div class="cr-match-col">${rights.map((p, k) => actBtn(item, retry, 'act-right', `data-i="${p.i}"`, `<span class="cr-pair-n">${k + 1}</span>${md(p.right)}`, `cr-chip ${usedRight.has(p.i) ? 'is-used' : ''}`, done || w.left === undefined)).join('')}</div></div>
        ${done && !rec.correct && retry ? `<p class="cr-solution">${item.pairs.map(p => `${md(p.left)} → ${md(p.right)}`).join(' · ')}</p>` : ''}
        ${check(Object.keys(pairs).length === item.pairs.length)}</div>`;
    }
    if (item.type === 'poe') {
      // Predice, observa, explica: primero predices; después mueves la simulación y ves qué pasa.
      const sim = item.sim, val = done ? sim.max : (w.sim ?? sim.start), above = val > sim.threshold;
      const pred = done ? rec.value.pred : w.pred;
      const predict = `<p class="cr-act-help"><b>1. Predice.</b> ${md(item.predict)}</p><ol class="cr-options">${item.options.map((o, i) => `<li>${actBtn(item, retry, 'act-poe-pred', `data-choice="${i}" aria-pressed="${pred === i}"`,
        `<span class="cr-letter">${String.fromCharCode(65 + i)}</span><span>${esc(o.text)}</span>`, `cr-option ${pred === i ? (done ? (o.correct ? 'is-right' : 'is-wrong') : 'is-picked') : done && o.correct ? 'is-right' : ''}`, done || pred !== undefined)}</li>`).join('')}</ol>`;
      if (pred === undefined && !done) return `<div class="cr-poe">${predict}</div>`;
      const flask = `<svg class="cr-flask" viewBox="0 0 120 150" aria-hidden="true"><path d="M45 10 h30 v40 l30 70 a10 10 0 0 1 -9 14 h-72 a10 10 0 0 1 -9 -14 l30 -70 z" class="cr-flask-glass"/>
        <path d="M27 90 h66 l12 28 a10 10 0 0 1 -9 14 h-72 a10 10 0 0 1 -9 -14 z" class="cr-flask-liquid"/>
        ${[...Array(9)].map((_, i) => `<circle class="cr-flask-bubble" cx="${30 + (i * 37) % 60}" cy="125" r="${2 + (i % 3)}" style="animation-delay:${(i * .27).toFixed(2)}s"/>`).join('')}</svg>`;
      return `<div class="cr-poe">${predict}
        <div class="cr-sim ${above ? 'is-above' : ''}" data-sim="${esc(item.id)}" data-threshold="${sim.threshold}">
          <p class="cr-act-help"><b>2. Observa.</b> ${md(sim.label)}</p>
          <div class="cr-sim-body">${flask}<div class="cr-sim-ctrl">
            <label for="sim-${esc(item.id)}">${esc(sim.name)}: <b data-sim-val>${val} ${esc(sim.unit)}</b></label>
            <input id="sim-${esc(item.id)}" type="range" min="${sim.min}" max="${sim.max}" step="${sim.step || 1}" value="${val}" data-cr-sim="${esc(item.id)}" data-retry="${retry ? 1 : 0}" ${done ? 'disabled' : ''}>
            <p class="cr-sim-text" data-sim-text aria-live="polite">${md(above ? sim.above : sim.below)}</p></div></div></div>
        ${done ? '' : `<div class="cr-check">${actBtn(item, retry, 'act-poe-done', '', '3. Ya observé: ¿acerté? ▸', 'cr-btn cr-primary', !w.moved)}</div>`}</div>`;
    }
    if (item.type === 'recipe') {
      // El caldero: eliges los ingredientes en orden; una poción mal hecha explica su error.
      const seq = done ? rec.value : (w.seq ||= []);
      const failed = done && !rec.correct;
      return `<div class="cr-recipe-act ${done ? (rec.correct ? 'is-right' : 'is-wrong') : ''}">
        <p class="cr-act-help">Partes de: <b>${md(item.base)}</b>. Toca los ingredientes en el orden en que se agregan (${item.answer.length} pasos).</p>
        <div class="cr-cauldron"><svg viewBox="0 0 160 120" aria-hidden="true"><ellipse cx="80" cy="42" rx="62" ry="12" class="cr-caul-rim"/><path d="M20 42 C 16 96 48 112 80 112 C 112 112 144 96 140 42 Z" class="cr-caul-body"/>
          <ellipse cx="80" cy="44" rx="54" ry="8" class="cr-caul-brew"/>${[...Array(5)].map((_, i) => `<circle class="cr-caul-bub" cx="${44 + i * 18}" cy="44" r="${3 + (i % 2) * 2}" style="animation-delay:${(i * .35).toFixed(2)}s"/>`).join('')}
          ${failed ? '<g class="cr-smoke"><circle cx="64" cy="22" r="14"/><circle cx="88" cy="14" r="18"/><circle cx="104" cy="26" r="12"/></g>' : ''}</svg>
          <ol class="cr-slots cr-caul-seq">${item.answer.map((_, i) => { const id = seq[i], ing = item.ingredients.find(x => x.id === id);
            return `<li class="cr-slot ${ing ? 'is-filled' : ''} ${done ? (item.answer[i] === id ? 'is-right' : 'is-wrong') : ''}"><span class="cr-slot-n">${i + 1}</span>${ing ? actBtn(item, retry, 'act-rc-del', `data-i="${i}"`, md(ing.label), 'cr-chip', done) : '<span class="cr-slot-empty">…</span>'}</li>`; }).join('')}</ol></div>
        ${done ? '' : `<div class="cr-pool cr-shelf">${item.ingredients.filter(x => !seq.includes(x.id)).map(x => actBtn(item, retry, 'act-rc-add', `data-card="${esc(x.id)}"`, md(x.label), 'cr-chip is-loose', seq.length >= item.answer.length)).join('')}</div>
          <div class="cr-check">${actBtn(item, retry, 'act-check', '', 'Preparar la poción ▸', 'cr-btn cr-primary', seq.length !== item.answer.length)}</div>`}
        ${done ? `<p class="mol-status ${rec.correct ? 'is-ok' : 'is-bad'}">${rec.correct ? `¡La poción brilla! Obtuviste ${md(item.target)}.` : `La poción salió mal. ${md(recipeWhy(item, seq))}`}</p>` : ''}</div>`;
    }
    if (item.type === 'spot') {
      // El aprendiz se equivocó: encuentra el paso malo y corrígelo.
      const step = done ? rec.value.step : w.step, fixing = step === item.wrong;
      return `<div class="cr-spot-act"><p class="cr-act-help">${fixing && !done ? '<b>¡Ahí está!</b> Ahora elige cómo se corrige ese paso.' : 'Toca el paso donde se equivocó el aprendiz.'}</p>
        <ol class="cr-apprentice">${item.steps.map((t, i) => `<li>${actBtn(item, retry, 'act-spot', `data-i="${i}"`, `<span class="cr-slot-n">${i + 1}</span><span>${md(t)}</span>`,
          `cr-step ${step === i ? (i === item.wrong ? 'is-right' : 'is-wrong') : done && i === item.wrong ? 'is-right' : ''}`, done || fixing)}</li>`).join('')}</ol>
        ${done && step !== item.wrong ? `<p class="mol-status is-bad">${md(item.stepNotes?.[step] || 'Ese paso está bien. Busca otro.')}</p>` : ''}
        ${fixing ? `<p class="cr-act-help"><b>Corrección:</b> ${md(item.fix.question)}</p><ol class="cr-options">${item.fix.options.map((o, i) => { const picked = done && rec.value.fix === i;
          return `<li>${actBtn(item, retry, 'act-spot-fix', `data-choice="${i}"`, `<span class="cr-letter">${String.fromCharCode(65 + i)}</span><span>${esc(o.text)}</span>`, `cr-option ${picked ? (o.correct ? 'is-right' : 'is-wrong') : done && o.correct && retry ? 'is-right' : ''}`, done)}</li>`; }).join('')}</ol>` : ''}</div>`;
    }
    if (item.type === 'build' || item.type === 'arrows') {
      const E = window.NexoMolEditor;
      return E ? E[item.type === 'build' ? 'buildMarkup' : 'arrowsMarkup'](item, w, { rec, retry, done, actBtn }) : '<p class="cr-act-help">Cargando el editor…</p>';
    }
    if (item.type === 'write') {
      const text = done ? rec.value.text : (w.text || '');
      if (!done && !w.revealed) return `<div class="cr-write"><p class="cr-act-help">Escríbelo con tus palabras. Después verás la respuesta modelo y marcarás qué ideas tenías.</p>
        <textarea class="cr-textarea" data-cr-text="${esc(item.id)}" data-retry="${retry ? 1 : 0}" rows="5" aria-label="Tu respuesta" placeholder="Explícalo como si se lo contaras a un compañero…">${esc(text)}</textarea>
        ${w.warn ? '<p class="cr-warn">Escribe un poco más antes de comparar: una o dos frases bastan.</p>' : ''}
        <div class="cr-check">${actBtn(item, retry, 'act-reveal', '', 'Comparar con la respuesta modelo ▸', 'cr-btn cr-primary')}</div></div>`;
      const checks = done ? rec.value.checks : (w.checks ||= item.rubric.map(() => false));
      const ideas = keyIdeas(item, text);
      const ideasMarkup = ideas.length ? `<div class="cr-ideas"><p class="cr-eyebrow">${item.teach ? 'Lo que tu compañero entendió' : 'Ideas clave que encontré'}</p>
        ${ideas.map(k => `<span class="cr-idea ${k.hit ? 'is-hit' : ''}">${k.hit ? '✓' : '○'} ${esc(k.label)}</span>`).join('')}
        <p class="cr-idea-note">${ideas.every(k => k.hit) ? '¡Mencionaste todas las ideas clave!' : 'Las ideas en gris no aparecieron con esas palabras. Revísalas en la respuesta modelo.'} (Solo busco palabras: tu autocorrección manda.)</p></div>` : '';
      return `<div class="cr-write is-compare">${ideasMarkup}<div class="cr-write-cols">
        <div class="cr-write-box"><p class="cr-eyebrow">Tu respuesta</p><p class="cr-write-mine">${esc(text)}</p></div>
        <div class="cr-write-box is-model"><p class="cr-eyebrow">Respuesta modelo</p><p>${md(item.model)}</p></div></div>
        <p class="cr-act-help">${done ? 'Así te autocorregiste.' : 'Marca cada idea que <b>sí</b> estaba en tu respuesta. Sé honesto: esto mide lo que de verdad sabes.'}</p>
        <ul class="cr-rubric">${item.rubric.map((r, i) => `<li>${actBtn(item, retry, 'act-rub', `data-i="${i}" aria-pressed="${Boolean(checks[i])}"`,
          `<span class="cr-rub-box" aria-hidden="true">${checks[i] ? '✓' : ''}</span><span>${md(r)}</span>`, `cr-rub ${checks[i] ? 'is-on' : ''}`, done)}</li>`).join('')}</ul>
        ${done ? '' : `<div class="cr-check">${actBtn(item, retry, 'act-check', '', 'Listo, así me fue ▸', 'cr-btn cr-primary')}</div>`}</div>`;
    }
    if (item.type === 'pick') {
      const val = done ? rec.value : null;
      const part = p => p.target
        ? actBtn(item, retry, 'act-target', `data-target="${esc(p.target)}" aria-label="${esc(item.targets[p.target].label)}"`, md(p.t),
          `cr-target ${done ? (p.target === item.answer && (rec.correct || retry) ? 'is-right' : p.target === val ? 'is-wrong' : 'is-muted') : ''}`, done)
        : `<span class="cr-formula-part">${md(p.t)}</span>`;
      return `<div class="cr-pick"><p class="cr-act-help">${done ? '' : 'Toca la parte de la molécula que responde la pregunta.'}</p>
        ${(item.molecules || [item.parts]).map((parts, i) => `<div class="cr-formula">${item.captions?.[i] ? `<span class="cr-formula-cap">${esc(item.captions[i])}</span>` : ''}<div class="cr-formula-line">${parts.map(part).join('')}</div></div>`).join('')}</div>`;
    }
    return '';
  }

  function whyOthers(cls, item) {
    if (item.type && item.type !== 'choice') {
      let extra = '';
      if (item.type === 'pick') extra = `<ul>${Object.entries(item.targets).map(([id, t]) => {
        const mc = cls.misconceptions[t.misconception]; const reason = id === item.answer ? item.explain : (mc ? mc.why : t.note);
        return reason ? `<li class="${id === item.answer ? 'is-ok' : ''}"><b>${esc(t.label)}</b>${id === item.answer ? ' (correcta)' : ''}: ${md(reason)}</li>` : ''; }).join('')}</ul>`;
      else if (item.type === 'write') extra = '';
      else if (item.type === 'build') extra = window.NexoMolEditor?.solution(item) || '';
      else if (item.type === 'arrows') extra = '';
      else if (item.type === 'recipe') extra = `<p>Receta correcta: ${item.answer.map(id => md(item.ingredients.find(x => x.id === id).label)).join(' → ')}.</p>`;
      else if (item.type === 'poe') extra = `<p>${md(item.sim.above)}</p>`;
      else if (item.type === 'spot') extra = `<p>El error estaba en el paso ${item.wrong + 1}. ${md(item.fix.options.find(o => o.correct).text)}.</p>`;
      else if (item.type === 'order') extra = `<p>Orden correcto: ${item.answer.map(id => md(item.cards.find(c => c.id === id).text)).join(' &lt; ')}</p>`;
      return `<details class="cr-why" open><summary>La explicación completa</summary><p>${md(item.explain)}</p>${extra}</details>`;
    }
    const rows = item.options.map((o, i) => {
      const mc = cls.misconceptions[o.misconception];
      const reason = o.correct ? item.explain : mc ? mc.why : o.note;
      return reason ? `<li class="${o.correct ? 'is-ok' : ''}"><b>${String.fromCharCode(65 + i)}. ${esc(o.text)}</b>${o.correct ? ' (correcta)' : ''}: ${md(reason)}</li>` : '';
    }).join('');
    return `<details class="cr-why" open><summary>¿Por qué cada alternativa?</summary><ul>${rows}</ul></details>`;
  }

  /* ───────── Barra de confianza (docs/clase-viva/DISENO.md §5) ─────────
     Antes de responder: qué tan seguro estás. Con 60 % o menos, por qué. Después: qué significa tu resultado. */
  const EV = () => window.NexoClassEvidence;
  function confidenceMarkup(item, s) {
    const conf = s.conf[item.id], why = s.confWhy[item.id], set = conf !== undefined;
    const words = !set ? 'Mueve la barra' : conf <= 20 ? 'Estoy adivinando' : conf <= 60 ? 'Tengo dudas' : conf < 80 ? 'Bastante seguro' : 'Muy seguro';
    return `<div class="cr-conf ${set ? '' : 'is-unset'}">
      <label class="cr-conf-label" for="conf-${esc(item.id)}">Antes de responder: ¿qué tan seguro estás? <b>${set ? `${conf} %` : ''}</b> <span>${words}</span></label>
      <input id="conf-${esc(item.id)}" class="cr-conf-range" type="range" min="0" max="100" step="10" value="${set ? conf : 50}" data-cr-conf="${esc(item.id)}"
        style="--v:${set ? conf : 50}%" aria-valuetext="${set ? `${conf} por ciento` : 'sin marcar'}">
      <div class="cr-conf-scale" aria-hidden="true"><span>Adivino</span><span>Dudo</span><span>Seguro</span></div>
      ${set && conf <= 60 ? `<div class="cr-conf-why" role="group" aria-label="¿Por qué no estás tan seguro? (opcional)"><span>¿Por qué? <small>(opcional)</small></span>
        ${Object.entries(EV()?.WHY || {}).map(([k, label]) => `<button class="cr-chip cr-why-chip ${why === k ? 'is-selected' : ''}" data-cr="conf-why" data-why="${k}" data-item="${esc(item.id)}" aria-pressed="${why === k}">${label}</button>`).join('')}</div>` : ''}
    </div>`;
  }
  function confidenceResult(cls, item, rec) {
    if (!rec || rec.confidence === null || rec.confidence === undefined) return '';
    const c = rec.confidence, kind = rec.kind;
    const text = {
      solido: `Dijiste ${c} % y acertaste: <b>sólido</b>.`,
      alerta: `Dijiste ${c} % y no era así. <b>Este es el error más valioso</b>: creías saberlo. Lee la explicación con calma.`,
      fragil: `Acertaste, pero con ${c} %: <b>acierto frágil</b>. Cuenta menos y esta idea volverá antes.`,
      consciente: `Ya dudabas (${c} %): <b>bien detectado</b>. Ahora sabes qué reforzar.`,
      medio: `Dijiste ${c} %.`
    }[kind] || '';
    let route = '';
    if (!rec.correct || kind === 'fragil') {
      if (rec.why === 'regla') route = `<button class="cr-btn cr-small" data-cr="spot" data-spot="sage">Repasar la regla desde cero</button>`;
      if (rec.why === 'pregunta') route = `<p class="cr-conf-route"><b>Dicho de otra forma:</b> ${md(item.plain || item.hint || item.explain)}</p>`;
      if (rec.why === 'adivino') route = `<p class="cr-conf-route">Adivinar está bien aquí: lo contamos como algo por aprender, no como sabido.</p>`;
    }
    return `<div class="cr-conf-result is-${esc(kind)}"><p>${text}</p>${route}</div>`;
  }
  /* Vista previa del árbol (etapa 1): cada concepto con su hoja. En la etapa 2 se dibuja como árbol vivo. */
  function leafChips(cls, api, id, filter = () => true) {
    const E = EV();
    if (!E || !cls.concepts) return '';
    const store = E.storeFor(api.getState(), id), all = E.leaves(cls, store);
    return `<ul class="cr-leaves">${cls.concepts.filter(filter).map(c => { const l = all[c.id];
      return `<li class="cr-leaf is-${l.shown}"><span class="cr-leaf-dot" aria-hidden="true"></span><b>${esc(c.title)}</b><small>${esc(l.label)}</small></li>`; }).join('')}</ul>`;
  }
  function calibrationLine(cls, api, id) {
    const E = EV();
    if (!E) return '';
    const bands = E.calibration(E.storeFor(api.getState(), id).records).filter(x => x.n);
    if (!bands.length) return '';
    return `<p class="cr-calib"><b>Tu calibración:</b> ${bands.map(x => `cuando dices ${x.label} %, aciertas ${x.right} de ${x.n}`).join(' · ')}.</p>`;
  }
  const showWhy = rec => rec && (rec.correct || rec.kind === 'alerta' || rec.why === 'dos');

  /* Qué dice el sabio y qué aparece al centro en cada momento. */
  function moment(cls, api, s, b) {
    const sage = { text: '', actions: '', mood: 'calm' };
    let center = '';
    const cont = (label = 'Continuar') => `<button class="cr-btn cr-primary cr-next" data-cr="next">${label} ▸</button>`;

    if (b.kind === 'path') {
      sage.text = `Bienvenido a la torre, aprendiz. Hoy abriremos el capítulo de **${cls.title}** (${cls.evaluation}). ¿Cómo quieres aprender?`;
      center = `<div class="cr-paths" role="group" aria-label="Camino de estudio">${Object.entries(PATHS).map(([id, p]) =>
        `<button class="cr-path" data-cr="path" data-path="${id}"><span class="cr-path-tag">${esc(p.tag)}</span><b>${esc(p.name)}</b><span>${esc(p.text)}</span></button>`).join('')}</div>
        <p class="cr-soon">${cls.missions.length} misiones · todo lo de ${esc(cls.title)} para la ${esc(cls.evaluation)}</p>
        ${cls.goal ? `<p class="cr-soon cr-goal-line">Meta: ${esc(cls.goal.text)} (de ${cls.goal.total} para el 7) · <button class="cr-link" data-cr="goal">ver mi camino al 7</button></p>` : ''}`;
      return { sage, center };
    }
    if (b.kind === 'pick') {
      sage.text = 'Elige una misión. Te recomiendo ir en orden: cada una usa lo que aprendiste en la anterior.';
      const goal = goalOf(cls, s);
      center = `${goal ? `<button class="cr-goal-card" data-cr="goal"><span><b>Tu camino al 7</b><small>${esc(goal.text)}</small></span>
        <span class="cr-goal-num"><b>${pts(goal.earned)}</b>/${goal.total} pts</span>${goalMeter(goal)}</button>` : ''}
        <ol class="cr-mission-map">${cls.missions.map((m, i) => {
        const items = allItems(cls, m.id), done = items.filter(({ item }) => s.answers[item.id]).length;
        const worth = goal ? goal.worth(m.id) : 0;
        return `<li><button class="cr-mission-card ${done === items.length && items.length ? 'is-done' : ''}" data-cr="mission" data-mission="${m.id}">
          <span class="cr-mission-n">${i + 1}</span><span class="cr-mission-txt"><b>${esc(m.title)}</b><small>${esc(m.subtitle)}</small></span>
          <span class="cr-mission-meta"><span>≈ ${m.minutes} min${m.pep ? ` · ${esc(m.pep)}` : ''}</span><span>${done}/${items.length} respondidas${done === items.length && items.length ? ' ✓' : ''}</span>
          ${worth ? `<em class="cr-mission-pts">${pts(goal.won(m.id))}/${pts(worth)} pts PEP</em>` : '<em class="cr-mission-pts is-base">base</em>'}</span></button></li>`;
      }).join('')}</ol>`;
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
    if (b.kind === 'hook') {
      const h = b.m.stages.hook;
      sage.text = h.sage || 'Antes de empezar, un caso real de tu carrera.'; sage.mood = 'proud'; sage.actions = cont('¡Vamos!');
      center = `<div class="cr-parchment cr-hook"><p class="cr-eyebrow">Caso de farmacia</p><h3>${esc(h.title)}</h3>
        ${h.scene ? `<div class="cr-figure">${window.NexoMolEditor?.sceneMarkup(h, { label: h.title }) || ''}</div>` : ''}<p>${md(h.text)}</p></div>`;
      return { sage, center };
    }
    if (b.kind === 'lesson' && b.block.kind === 'recipe') {
      const r = b.block;
      sage.text = `**${r.title}** quedó guardada en tu grimorio. Volverá a probarte mañana: si la recuerdas, será tuya.`; sage.mood = 'proud'; sage.actions = cont();
      center = `<div class="cr-parchment cr-recipe-card"><p class="cr-eyebrow">Receta guardada en tu grimorio</p><h3>${esc(r.title)}</h3>
        <dl class="cr-recipe">${[['Ingrediente base', r.base], ['Ingredientes mágicos', r.reagents], ['Condición', r.condition], ['Resultado', r.result]].filter(([, v]) => v)
          .map(([k, v]) => `<div><dt>${k}</dt><dd>${md(v)}</dd></div>`).join('')}</dl>${r.note ? `<p class="cr-note">${md(r.note)}</p>` : ''}</div>`;
      return { sage, center };
    }
    if (b.kind === 'lesson' && b.block.frames) {
      const blk = b.block, mw = (s.work[`mech:${blk.id}`] ||= { i: 0 }), f = blk.frames[Math.min(mw.i, blk.frames.length - 1)];
      const deepKey = `deep-${blk.id}`, deep = s.revealed[deepKey];
      sage.text = `**${blk.title}.** ${blk.body}`;
      sage.actions = `${blk.deeper ? `<button class="cr-btn" data-cr="deeper" data-key="${deepKey}" aria-expanded="${Boolean(deep)}">${deep ? 'Ocultar la explicación simple' : 'Explícame más simple'}</button>` : ''}${cont('Entendido')}`;
      center = `<div class="cr-parchment cr-mech"><p class="cr-eyebrow">Mecanismo · paso ${mw.i + 1} de ${blk.frames.length}</p>
        <div class="cr-mech-stage">${window.NexoMolEditor?.sceneMarkup(f, { arrows: f.arrows || [], label: f.caption }) || ''}</div>
        <p class="cr-mech-caption" aria-live="polite">${md(f.caption)}</p>
        <div class="cr-mech-controls" role="group" aria-label="Controles del mecanismo">
          <button class="cr-btn cr-small" data-cr="mech" data-dir="-1" ${mw.i > 0 ? '' : 'disabled'}>◂ Atrás</button>
          <button class="cr-btn cr-small" data-cr="mech" data-dir="play" aria-pressed="${Boolean(mw.playing)}">${mw.playing ? '❚❚ Pausa' : '▶ Reproducir'}</button>
          <button class="cr-btn cr-small cr-primary" data-cr="mech" data-dir="1" ${mw.i < blk.frames.length - 1 ? '' : 'disabled'}>Siguiente paso ▸</button></div>
        <div class="cr-mech-dots" aria-hidden="true">${blk.frames.map((_, i) => `<i class="${i === mw.i ? 'is-on' : ''}"></i>`).join('')}</div>
        ${deep ? `<div class="cr-deeper"><p class="cr-eyebrow">Más simple, paso a paso</p><p>${md(blk.deeper)}</p></div>` : ''}</div>`;
      if (blk.slide) center = `<div class="cr-lesson cr-lesson-mech">${center}${projection(cls, blk.slide)}</div>`;
      return { sage, center };
    }
    if (b.kind === 'lesson') {
      const blk = b.block, deepKey = `deep-${blk.id}`, deep = s.revealed[deepKey];
      sage.text = `**${blk.title}.** ${blk.body}`;
      sage.actions = `${blk.deeper ? `<button class="cr-btn" data-cr="deeper" data-key="${deepKey}" aria-expanded="${Boolean(deep)}">${deep ? 'Ocultar la explicación simple' : 'Explícame más simple'}</button>` : ''}${cont('Entendido')}`;
      const parchment = blk.svg || blk.rows || blk.note || deep ? `<div class="cr-parchment">
        <p class="cr-eyebrow">${b.zero ? 'Desde cero' : 'Lección'} · ${esc(blk.title.replace(/^Desde cero: /, ''))}</p>
        ${blk.svg ? `<div class="cr-figure">${blk.svg}</div>` : ''}
        ${blk.rows ? `<dl class="cr-rows">${blk.rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
        ${blk.note ? `<p class="cr-note">${md(blk.note)}</p>` : ''}
        ${deep ? `<div class="cr-deeper"><p class="cr-eyebrow">Más simple, paso a paso</p><p>${md(blk.deeper)}</p></div>` : ''}</div>` : '';
      center = `<div class="cr-lesson">${blk.slide ? projection(cls, blk.slide) : ''}${parchment}</div>`;
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
      const pre = b.stage === 'pretest';
      const label = item.teach ? 'Enséñale a tu compañero' : { diagnostic: 'Reto del sabio', pretest: 'Antes de enseñarte · adivina', practice: 'Prueba del aprendiz', challenge: 'Desafío', transfer: 'Encargo final' }[b.stage];
      if (!record) {
        sage.text = item.teach ? 'Tu compañero se enredó con algo. ¿Se lo explicas tú? Explicar es la mejor forma de aprender.'
          : { diagnostic: 'Responde con lo que sabes.', pretest: 'Adivina sin miedo: esto no cuenta. Solo despierta la curiosidad.', practice: 'Tu turno.', challenge: 'Este es más difícil. Confío en ti.', transfer: 'Un caso nuevo. Piensa como en la prueba.' }[b.stage];
      } else if (pre) {
        sage.text = record.correct ? `¡Buena intuición! ${item.explain} Ahora verás por qué.` : 'No era esa, y está perfecto: ahora lo vas a descubrir. Fíjate bien en la explicación.';
        sage.mood = record.correct ? 'proud' : 'calm'; sage.actions = cont('A la lección ▸');
      } else if (record.correct) {
        sage.text = `${hint ? 'Bien, con una pista.' : record.kind === 'fragil' ? 'Bien, aunque dudabas.' : '¡Exacto, sin ayuda!'} ${item.explain}`; sage.mood = 'proud'; sage.actions = cont();
      } else {
        const mc = mcOf(cls, item, record);
        sage.text = mc ? `**${mc.label}.** ${mc.why}` : `No del todo. ${window.NexoMolEditor?.feedback(item, record) || item.wrong || 'Lo revisaremos juntos en el rescate.'}`;
        sage.mood = 'concerned'; sage.actions = cont();
      }
      center = `<article class="cr-card ${record ? (record.correct ? 'is-right' : 'is-wrong') : ''}">
        <p class="cr-eyebrow">${esc(label)} · ${b.n} de ${b.of}</p><p class="cr-q">${md(item.prompt)}</p>
        ${hint && !record ? `<p class="cr-hinttext"><b>Pista de tu compañero:</b> ${md(item.hint)}</p>` : ''}
        ${item.paper && !record ? '<p class="cr-paper">✎ Si prefieres, resuélvelo en papel como en la prueba y después escribe aquí lo esencial para autocorregirte con la pauta.</p>' : ''}
        ${record || pre ? '' : confidenceMarkup(item, s)}
        <fieldset class="cr-gate" ${!pre && !record && s.conf[item.id] === undefined ? 'disabled aria-describedby="gate-note"' : ''}>
          ${!pre && !record && s.conf[item.id] === undefined ? '<p class="cr-gate-note" id="gate-note">Primero marca tu confianza en la barra.</p>' : ''}
          ${activityMarkup(cls, s, item)}</fieldset>
        ${pre ? '' : confidenceResult(cls, item, record)}
        ${!pre && showWhy(record) ? whyOthers(cls, item) : ''}
        ${item.slide ? `<button class="cr-cite" data-cr="slides" data-slide="${esc(item.slide)}">Ver diapositiva ${esc(item.slide)}</button>` : ''}</article>`;
      return { sage, center };
    }
    if (b.kind === 'rescue') {
      const item = b.item, record = s.answers[item.id], retry = s.retries[item.id];
      const mc = mcOf(cls, item, record);
      const prereqMission = mc?.prereq && missionById(cls, mc.prereq.mission);
      const block = prereqMission && blocksOf(prereqMission).find(x => x.id === mc.prereq.block);
      const slideN = block?.slide || item.slide;
      if (!retry) {
        sage.text = `Respondiste «${answerText(item, record)}». ${mc ? mc.why : (item.wrong || 'Miremos de nuevo, con calma.')} Mira la diapositiva y vuelve a intentarlo.`;
        sage.mood = 'calm';
      } else {
        sage.text = retry.correct ? '¡Corregido! Así se aprende de un error.' : 'Todavía no. Vuelve a esta idea otro día: la repasaremos.';
        sage.mood = retry.correct ? 'proud' : 'concerned'; sage.actions = cont();
      }
      center = `<div class="cr-lesson">${slideN ? projection(cls, slideN) : ''}
        <article class="cr-card"><p class="cr-eyebrow">Rescate${mc?.prereq ? ` · repasa: ${esc(mc.prereq.title)}` : ''}</p><p class="cr-q">${md(item.prompt)}</p>${activityMarkup(cls, s, item, { retry: true })}${retry ? whyOthers(cls, item) : ''}</article></div>`;
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
      ${(() => { const goal = goalOf(cls, s); if (!goal) return '';
        const here = s.path === 'misiones' ? goal.worth(s.mission) : goal.max, got = s.path === 'misiones' ? goal.won(s.mission) : goal.earned;
        return `<div class="cr-goal-close"><p class="cr-eyebrow">Camino al 7</p>${goalMeter(goal)}
          <p>${here ? `${s.path === 'misiones' ? 'Esta misión' : 'Esta clase'} vale <b>${pts(here)} pts</b> de la PEP y demostraste <b>${pts(got)}</b>.` : 'Esta misión es <b>base</b>: no da puntos directos, pero sin ella no se puede responder lo que sí los da.'}
          En total llevas <b>${pts(goal.earned)} de ${goal.total}</b>.</p><button class="cr-link" data-cr="goal">Ver qué me falta para el 7</button></div>`; })()}
      <div class="cr-goal-close"><p class="cr-eyebrow">Tus hojas${s.path === 'misiones' ? ' en esta misión' : ''}</p>
        ${leafChips(cls, api, cls.id, c => s.path !== 'misiones' ? !c.root : c.mission === s.mission)}${calibrationLine(cls, api, cls.id)}
        <p class="cr-note">Las hojas se ponen <b>verdes</b> solo cuando produces la respuesta tú solo (escalón 5), por ejemplo al escribirla. Elegir entre alternativas deja un <b>brote</b>.</p></div>
      <p class="cr-note">Todavía no es dominio: cuenta como <b>retenido</b> cuando lo recuerdas sin ayuda 24 horas o más después.</p></div>`;
    return { sage, center };
  }

  function panel(cls, s, b, api) {
    if (s.slideOpen) {
      const numbers = Object.keys({ ...cls.slides, ...cls.slideImages }).map(Number).sort((x, y) => x - y);
      const n = Number(s.slideOpen), i = numbers.indexOf(n);
      return `<div class="cr-lightbox" role="dialog" aria-modal="true" aria-label="Diapositivas de la clase">
        <div class="cr-lightbox-inner"><header><b>Clase de cátedra · ${esc(Object.values(cls.sources)[0]?.author || '')}</b><button class="cr-btn cr-small" data-cr="panel-close">Cerrar ✕</button></header>
        <div class="cr-lightbox-slide"><p class="cr-eyebrow">Diapositiva ${esc(n)}</p>${slideMarkup(cls, n, { large: true })}</div>
        <footer><button class="cr-btn" data-cr="slides" data-slide="${numbers[i - 1] ?? ''}" ${i > 0 ? '' : 'disabled'}>◂ Anterior</button>
          <span>${i + 1} de ${numbers.length}</span>
          <button class="cr-btn" data-cr="slides" data-slide="${numbers[i + 1] ?? ''}" ${i < numbers.length - 1 ? '' : 'disabled'}>Siguiente ▸</button></footer>
        ${cls.slideImages && Object.keys(cls.slideImages).length ? '' : '<p class="cr-muted">Mostrando el texto de la diapositiva. Las imágenes originales llegan cuando se pueda descargar el PDF.</p>'}</div></div>`;
    }
    if (!s.panel) return '';
    const m = b?.m || cls.missions[0];
    let title = '', body = '';
    if (s.panel === 'zero') {
      title = 'El sabio explica desde cero';
      body = (m.stages.fundamentals || []).map(f => `<section class="cr-zero"><h3>${esc(f.title.replace(/^Desde cero: /, ''))}</h3>${f.svg ? `<div class="cr-figure">${f.svg}</div>` : ''}<p>${md(f.body)}</p>${f.deeper ? `<p>${md(f.deeper)}</p>` : ''}${f.rows ? `<dl class="cr-rows">${f.rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}</section>`).join('');
    } else if (s.panel === 'glossary') {
      title = 'Glosario del sabio';
      const entries = (cls.glossary || []).map((g, i) => Array.isArray(g) ? { term: g[0], def: g[1], i } : { ...g, i });
      const entry = g => {
        const key = `gl-${g.i}`, open = s.revealed[key];
        return `<div class="cr-term"><dt>${esc(g.term)}</dt>
          <dd class="cr-term-simple">${md(g.simple || g.def)}</dd>
          ${g.simple ? `<dd class="cr-term-def"><span>Definición de prueba</span> ${md(g.def)}</dd>` : ''}
          ${g.simpler ? `<dd>${open ? `<p class="cr-term-simpler"><span>Más simple todavía</span> ${md(g.simpler)}</p>` : ''}
            <button class="cr-btn cr-small" data-cr="deeper" data-key="${key}" aria-expanded="${Boolean(open)}">${open ? 'Ocultar' : 'Explícamelo más simple'}</button></dd>` : ''}</div>`;
      };
      const mine = entries.filter(g => g.mission && g.mission === b?.m?.id), rest = entries.filter(g => !mine.includes(g));
      body = `${mine.length ? `<p class="cr-eyebrow">De esta misión</p><dl class="cr-glossary">${mine.map(entry).join('')}</dl><p class="cr-eyebrow">Todo el glosario</p>` : ''}
        <dl class="cr-glossary">${rest.map(entry).join('')}</dl>`;
    } else if (s.panel === 'goal') {
      const goal = goalOf(cls, s);
      title = 'Tu camino al 7';
      body = goal ? `<p class="cr-goal-intro">Un <b>7</b> es tener los <b>${goal.total} puntos</b> de la ${esc(cls.evaluation)}. Esta clase te prepara para <b>${goal.max}</b>. Cada punto cuenta cuando lo <b>demuestras</b>: aciertas sin ayuda el caso estilo prueba de las misiones que lo preparan.</p>
        <div class="cr-goal-big"><b>${pts(goal.earned)}</b><span>de ${goal.total} pts demostrados</span></div>${goalMeter(goal)}
        <p class="cr-goal-legend"><i class="is-won"></i> demostrado <i class="is-open"></i> por demostrar en ${esc(cls.title)} <i class="is-later"></i> otras clases</p>
        <ul class="cr-goal-list">${goal.qs.map(q => `<li><div><b>${esc(q.id)} · ${esc(q.label)}</b><span>${pts(q.earned)} / ${pts(q.points)} pts</span></div>
          <div class="cr-goal-bar"><span style="width:${q.points ? Math.round(q.earned / q.points * 100) : 0}%"></span></div>
          <div class="cr-row">${q.missions.map(mId => { const m = missionById(cls, mId); return m ? `<button class="cr-btn cr-small" data-cr="mission" data-mission="${m.id}">${esc(m.title)} ▸</button>` : ''; }).join('')}</div></li>`).join('')}
          ${(goal.rest || []).map(r => `<li class="is-later"><div><b>${esc(r.label)}</b><span>${pts(r.points)} pts · ${esc(r.note || '')}</span></div></li>`).join('')}</ul>
        <p class="cr-eyebrow">Lo que sabes, concepto por concepto</p>
        ${cls.missions.map(m => `<div class="cr-leaf-group"><b>${esc(m.title)}</b>${leafChips(cls, api, cls.id, c => c.mission === m.id)}</div>`).join('')}
        <div class="cr-leaf-group"><b>Raíces (clase base)</b>${leafChips(cls, api, cls.id, c => c.root)}</div>
        ${calibrationLine(cls, api, cls.id)}
        <p class="cr-note">Las misiones marcadas como <b>base</b> no dan puntos directos, pero sin ellas no se puede responder lo que sí los da. Y ojo: demostrarlo hoy no es dominarlo. Cuenta como <b>retenido</b> cuando lo repites sin ayuda 24 horas o más después.</p>` : '';
    } else if (s.panel === 'curio') {
      const list = cls.curiosities || [], c = list[(s.curio || 0) % Math.max(1, list.length)];
      title = 'Lo que dicen los frascos';
      body = c ? `<p class="cr-curio">${esc(c.text)}</p><div class="cr-row"><button class="cr-btn cr-primary" data-cr="curio-next">Otro dato ▸</button>${c.slide ? `<button class="cr-btn" data-cr="slides" data-slide="${c.slide}">Ver diapositiva ${c.slide}</button>` : ''}</div>` : '';
    }
    return `<div class="cr-lightbox" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="cr-lightbox-inner cr-panel">
      <header><b>${esc(title)}</b><button class="cr-btn cr-small" data-cr="panel-close">Cerrar ✕</button></header><div class="cr-panel-body">${body}</div></div></div>`;
  }

  function render(id, api) {
    const cls = window.NexoClasses?.[id];
    if (window.NexoClassSlides?.[id]) cls.slideImages = window.NexoClassSlides[id]; // imágenes reales del PPT (tools/classroom-art/slides.py)
    const s = sessionFor(api, id);
    if (s.path && !PATHS[s.path]) s.path = null;
    const list = beats(cls, s);
    s.beat = Math.max(0, Math.min(s.beat, list.length - 1));
    const b = list[s.beat];
    const { sage, center } = moment(cls, api, s, b);
    const hintable = b.kind === 'question' && (b.stage === 'practice' || b.stage === 'challenge') && !s.answers[b.item.id] && !s.hints[b.item.id];
    let progress = Math.round((s.beat / Math.max(1, list.length - 1)) * 100);
    const goal = goalOf(cls, s);
    // En el mapa y la bienvenida, el % es de toda la clase (actividades respondidas); dentro de una misión, de esa misión.
    if (b.kind === 'pick' || b.kind === 'path') { const all = allItems(cls); progress = Math.round(all.filter(({ item }) => s.answers[item.id]).length / Math.max(1, all.length) * 100); }
    const where = !s.path || b.kind === 'pick' ? 'la clase' : s.path === 'misiones' && missionById(cls, s.mission)
      ? `Misión ${cls.missions.findIndex(m => m.id === s.mission) + 1}` : s.path === 'misiones' ? 'la clase' : PATHS[s.path].name;
    const mascotMood = s.mascotMood || 'idle';
    const entering = !api.app.querySelector('.classroom');
    api.app.innerHTML = `<section class="classroom ${entering ? 'is-entering' : ''}" aria-label="Torre del alquimista: ${esc(cls.title)}">
      ${scene(cls, s, b)}
      <header class="cr-top">
        <button class="cr-btn cr-small cr-ghost" data-cr="exit">← Salir</button>
        <div class="cr-progress"><div class="cr-thread" role="progressbar" aria-label="Avance de ${esc(where)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><span style="width:${progress}%"></span></div>
          <span class="cr-progress-label">${esc(where)} · <b>${progress} %</b></span></div>
        ${goal ? `<button class="cr-btn cr-small cr-ghost cr-goal-chip" data-cr="goal" aria-label="Tu camino al 7: ${pts(goal.earned)} de ${goal.total} puntos"><span aria-hidden="true">★</span> <span class="cr-goal-chip-txt">Camino al 7 · </span><b>${pts(goal.earned)}</b>/${goal.total}</button>` : ''}
        <button class="cr-btn cr-small cr-ghost cr-slides-btn" data-cr="slides" data-slide="${esc((b.block?.slide) || (b.item?.slide) || Object.keys(cls.slides || {})[0] || 1)}">Diapositivas</button>
      </header>
      <nav class="cr-objects" aria-label="Objetos de la torre">${[['sage', 'Sabio', 'Desde cero'], ['book', 'Libro', 'Glosario'], ['board', 'Pizarra', 'Diapositivas'], ['window', 'Ventana', 'Hora'], ['flasks', 'Frascos', 'Dato curioso']]
        .map(([id, name, what]) => `<button class="cr-object" data-cr="spot" data-spot="${id}" aria-label="${esc(SPOT_LABEL[id])}"><b>${name}</b><span>${what}</span></button>`).join('')}</nav>
      <main class="cr-center" aria-live="polite">${center}</main>
      <section class="cr-dialog" data-mood="${esc(sage.mood)}" aria-label="El sabio">
        <button class="cr-mascot" data-cr="mascot" data-mood="${esc(mascotMood)}" aria-label="${hintable ? 'Pedir una pista a tu compañero' : 'Tu compañero'}">
          ${hintable ? '<span class="cr-mascot-tip">¿Pista?</span>' : ''}${api.avatarMarkup({ label: 'Tu compañero' })}</button>
        <p class="cr-speaker">El sabio</p>
        <p class="cr-say" ${entering ? '' : 'data-fresh="1"'}>${md(sage.text)}</p>
        ${s.mascotSay ? `<p class="cr-mascot-say"><b>Tu compañero:</b> ${md(s.mascotSay)}</p>` : ''}
        <div class="cr-actions">${sage.actions}</div>
      </section>
      ${panel(cls, s, b, api)}
    </section>`;
    document.body.classList.add('in-classroom');
    s.burst = null; // la reacción de la escena dura una sola vista
    api.hydrate();
    const root = api.app.querySelector('.classroom');
    root.addEventListener('click', event => onClick(event, id, api));
    // La barra de confianza se marca al soltarla (también si la dejas en 50 %) o con las flechas del teclado.
    const commit = event => {
      const range = event.target.closest?.('[data-cr-conf]');
      if (!range) return;
      const value = Number(range.value);
      if (s.conf[range.dataset.crConf] === value) return;
      s.conf[range.dataset.crConf] = value;
      rerender(id, api);
      api.app.querySelector(`[data-cr-conf="${range.dataset.crConf}"]`)?.focus({ preventScroll: true });
    };
    root.addEventListener('change', commit);
    // Mecanismo en reproducción: avanza solo cada pocos segundos (se detiene en el último paso)
    clearTimeout(mechTimer);
    const mw = b.kind === 'lesson' && b.block.frames ? s.work[`mech:${b.block.id}`] : null;
    if (mw?.playing) mechTimer = setTimeout(() => {
      if (!document.body.classList.contains('in-classroom') || !api.app.querySelector('.cr-mech')) return;
      mw.i += 1; if (mw.i >= b.block.frames.length - 1) { mw.i = b.block.frames.length - 1; mw.playing = false; }
      rerender(id, api);
    }, 3800);
    // Editor de moléculas y flechas: maneja sus propios toques y guarda en el trabajo de la actividad.
    window.NexoMolEditor?.mount(root, { work: (itemId, retry) => workOf(s, allItems(cls).find(x => x.item.id === itemId).item, retry),
      item: itemId => allItems(cls).find(x => x.item.id === itemId)?.item, commit: () => rerender(id, api) });
    root.addEventListener('pointerup', commit);
    root.addEventListener('input', event => {
      const range = event.target.closest('[data-cr-conf]');
      if (range) { range.style.setProperty('--v', `${range.value}%`); const b = range.previousElementSibling?.querySelector('b'); if (b) b.textContent = `${range.value} %`; return; }
      const sim = event.target.closest('[data-cr-sim]');
      if (sim) {
        const it = allItems(cls).find(x => x.item.id === sim.dataset.crSim)?.item; if (!it) return;
        const w = workOf(s, it, sim.dataset.retry === '1'), v = Number(sim.value), above = v > it.sim.threshold, box2 = sim.closest('[data-sim]');
        w.sim = v; w.moved = true;
        box2.classList.toggle('is-above', above);
        box2.querySelector('[data-sim-val]').textContent = `${v} ${it.sim.unit}`;
        box2.querySelector('[data-sim-text]').innerHTML = md(above ? it.sim.above : it.sim.below);
        const doneBtn = box2.parentElement.querySelector('[data-cr="act-poe-done"]'); if (doneBtn) doneBtn.disabled = false;
        return;
      }
      const box = event.target.closest('[data-cr-text]');
      if (box) { const it = allItems(cls).find(x => x.item.id === box.dataset.crText)?.item; if (it) workOf(s, it, box.dataset.retry === '1').text = box.value; }
    });
    root.addEventListener('keydown', event => { if (event.key === 'Escape' && (s.slideOpen || s.panel)) { s.slideOpen = null; s.panel = null; rerender(id, api); } });
    (root.querySelector('.cr-lightbox [data-cr="panel-close"]') || root.querySelector('.cr-option:not(:disabled)') || root.querySelector('.cr-next, .cr-actions .cr-primary') || root.querySelector('.cr-path'))?.focus({ preventScroll: true });
  }

  let mechTimer = null;
  function rerender(id, api) { api.saveState(); render(id, api); }

  /* Cada respuesta deja evidencia (evidence.js) y programa cuándo vuelve el concepto (FSRS). */
  function logEvidence(cls, s, api, id, b, item, rec, retry) {
    const E = EV();
    if (!E || b.stage === 'pretest') return; // adivinar antes de la lección no es evidencia
    const missionId = b.m?.id || cls.missions.find(m => allItems(cls, m.id).some(x => x.item === item))?.id;
    const state = api.getState();
    const ev = E.record(state, id, { itemId: item.id, conceptId: E.conceptOf(item, missionId), missionId, stage: b.stage || 'rescue',
      step: E.stepOf(item), correct: rec.correct, hint: Boolean(rec.hint), retry, transfer: b.stage === 'transfer',
      confidence: retry ? null : rec.confidence ?? null, why: retry ? null : rec.why || null, at: rec.at });
    E.schedule(state, id, ev).then(() => api.saveState()).catch(() => { /* sin repaso programado: la evidencia queda igual */ });
  }
  const withConfidence = (s, item, rec) => {
    const confidence = s.conf[item.id] ?? null;
    return { ...rec, confidence, why: confidence !== null && confidence <= 60 ? s.confWhy[item.id] || null : null,
      kind: EV()?.confidenceKind(confidence, rec.correct) || null };
  };

  function onClick(event, id, api) {
    const button = event.target.closest('[data-cr]');
    if (!button || button.disabled) return;
    const cls = window.NexoClasses[id];
    const s = sessionFor(api, id);
    const list = beats(cls, s), b = list[s.beat];
    const action = button.dataset.cr;
    if (action !== 'mascot') { s.mascotSay = ''; }

    if (action === 'exit') { document.body.classList.remove('in-classroom'); window.NexoAmbientTime?.stopPreview?.(); s.slideOpen = null; s.panel = null; return api.exit(); }
    if (action === 'panel-close') { s.slideOpen = null; s.panel = null; return rerender(id, api); }
    if (action === 'curio-next') { s.curio = (s.curio || 0) + 1; return rerender(id, api); }
    if (action === 'deeper') { s.revealed[button.dataset.key] = !s.revealed[button.dataset.key]; return rerender(id, api); }
    if (action === 'spot') {
      const spot = button.dataset.spot;
      if (spot === 'board') { s.slideOpen = String((b.block?.slide) || (b.item?.slide) || Object.keys(cls.slides || {})[0] || 1); }
      else if (spot === 'sage') { s.panel = 'zero'; }
      else if (spot === 'book') { s.panel = 'glossary'; }
      else if (spot === 'flasks') { s.panel = 'curio'; s.curio = (s.curio ?? -1) + 1; s.mascotMood = 'happy'; }
      else if (spot === 'window') {
        s.hourIdx = ((s.hourIdx ?? -1) + 1) % HOURS.length;
        window.NexoAmbientTime?.preview?.(HOURS[s.hourIdx]);
        s.mascotMood = 'happy'; s.mascotSay = ['¡Amaneció en la torre!', 'Mediodía: todo se ve clarito.', 'Qué lindo el atardecer…', 'De noche la torre brilla distinto.'][s.hourIdx];
        setTimeout(() => { if (document.body.classList.contains('in-classroom')) render(id, api); }, 2300); // los objetos tocables siguen a la pintura que quedó
      }
      return rerender(id, api);
    }
    if (action === 'slides') { if (button.dataset.slide) s.slideOpen = button.dataset.slide; return rerender(id, api); }
    if (action === 'path') {
      s.path = button.dataset.path; s.mission = null; s.beat = 1; s.mascotMood = 'happy';
      api.track?.('class_started', { class_id: id, path: s.path });
      return rerender(id, api);
    }
    if (action === 'mech') {
      const blk = b.block, mw = (s.work[`mech:${blk.id}`] ||= { i: 0 });
      if (button.dataset.dir === 'play') { mw.playing = !mw.playing; if (mw.playing && mw.i >= blk.frames.length - 1) mw.i = 0; }
      else { mw.playing = false; mw.i = Math.max(0, Math.min(blk.frames.length - 1, mw.i + Number(button.dataset.dir))); }
      return rerender(id, api);
    }
    if (action === 'conf-why') { const k = button.dataset.item; s.confWhy[k] = s.confWhy[k] === button.dataset.why ? null : button.dataset.why; return rerender(id, api); }
    if (action === 'goal') { s.slideOpen = null; s.panel = 'goal'; return rerender(id, api); }
    if (action === 'mission') { s.panel = null; s.path = 'misiones'; s.mission = button.dataset.mission; s.beat = 1; return rerender(id, api); }
    if (action === 'restart') { s.path = null; s.mission = null; s.beat = 0; s.mascotMood = 'idle'; return rerender(id, api); }
    if (action.startsWith('act-')) return onActivity(action, button, cls, s, b, id, api);
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
        s.answers[itemId] = withConfidence(s, item, { choice, correct, hint: Boolean(s.hints[itemId]), stage: b.stage, at: new Date().toISOString() });
      }
      logEvidence(cls, s, api, id, b, item, retry ? s.retries[itemId] : s.answers[itemId], retry);
      s.mascotMood = correct ? 'happy' : 'worry'; s.burst = correct ? 'right' : 'wrong';
      api.track?.('class_answer', { class_id: id, correct, retry });
      return rerender(id, api);
    }
  }

  function onActivity(action, button, cls, s, b, id, api) {
    const retry = button.dataset.retry === '1';
    const item = allItems(cls).find(entry => entry.item.id === button.dataset.item)?.item;
    if (!item || recordOf(s, item, retry)) return;
    const w = workOf(s, item, retry);
    if (action === 'act-reveal') {
      const box = button.closest('.cr-write')?.querySelector('textarea');
      if (box) w.text = box.value;
      if (String(w.text || '').trim().length < MIN_WRITE) w.warn = true; else { w.warn = false; w.revealed = true; }
    }
    else if (action === 'act-rub') { const i = Number(button.dataset.i); (w.checks ||= item.rubric.map(() => false))[i] = !w.checks[i]; }
    else if (action === 'act-poe-pred') { w.pred = Number(button.dataset.choice); }
    else if (action === 'act-rc-add') { if ((w.seq ||= []).length < item.answer.length) w.seq.push(button.dataset.card); }
    else if (action === 'act-rc-del') { w.seq.splice(Number(button.dataset.i), 1); }
    else if (action === 'act-pick') { (w.seq ||= []).push(button.dataset.card); }
    else if (action === 'act-unpick') { w.seq.splice(Number(button.dataset.i), 1); }
    else if (action === 'act-sel') { w.sel = w.sel === button.dataset.card ? null : button.dataset.card; }
    else if (action === 'act-drop' && w.sel) { (w.assign ||= {})[w.sel] = button.dataset.bucket; w.sel = null; }
    else if (action === 'act-unassign') { delete w.assign[button.dataset.card]; }
    else if (action === 'act-left') { w.left = Number(button.dataset.i); }
    else if (action === 'act-right' && w.left !== undefined) {
      const pairs = (w.pairs ||= {}); const r = Number(button.dataset.i);
      for (const k of Object.keys(pairs)) if (Number(pairs[k]) === r) delete pairs[k];
      pairs[w.left] = r; w.left = undefined;
    }
    else if (action === 'act-spot' && Number(button.dataset.i) === item.wrong) { w.step = item.wrong; }
    else if (['act-target', 'act-check', 'act-poe-done', 'act-spot', 'act-spot-fix'].includes(action)) {
      const value = action === 'act-target' ? button.dataset.target
        : action === 'act-poe-done' ? { pred: w.pred }
        : action === 'act-spot' ? { step: Number(button.dataset.i) }
        : action === 'act-spot-fix' ? { step: item.wrong, fix: Number(button.dataset.choice) }
        : item.type === 'recipe' ? [...(w.seq || [])]
        : item.type === 'order' ? [...w.seq] : item.type === 'classify' ? { ...w.assign }
        : item.type === 'write' ? { text: String(w.text || '').slice(0, 2000), checks: [...(w.checks || [])] }
        : item.type === 'build' ? { graph: JSON.parse(JSON.stringify(w.graph || item.start || { atoms: [], bonds: [] })) }
        : item.type === 'arrows' ? [...(w.arrows || [])] : { ...w.pairs };
      const correct = isCorrect(item, value);
      const record = { value, correct, at: new Date().toISOString() };
      if (retry) s.retries[item.id] = record;
      else {
        if (b.stage === 'diagnostic' || b.stage === 'transfer') delete s.hints[item.id];
        s.answers[item.id] = withConfidence(s, item, { ...record, hint: Boolean(s.hints[item.id]), stage: b.stage });
      }
      logEvidence(cls, s, api, id, b, item, retry ? s.retries[item.id] : s.answers[item.id], retry);
      s.mascotMood = correct ? 'happy' : 'worry'; s.burst = correct ? 'right' : 'wrong';
      api.track?.('class_answer', { class_id: id, correct, retry });
    }
    return rerender(id, api);
  }

  window.NexoClassroom = { render, beats, isCorrect, itemsOf, blocksOf, PATHS };
})();
