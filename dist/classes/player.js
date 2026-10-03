/* Reproductor único de clases (aula inmersiva). Lee una clase de window.NexoClasses y la muestra
   con 7 etapas y 3 caminos. Ver docs/clases-estructura/SPEC.md. */
(() => {
  'use strict';
  const STAGES = [
    ['diagnostic', 'Diagnóstico'], ['explain', 'Explicar'], ['worked', 'Ejemplo'], ['practice', 'Práctica'],
    ['rescue', 'Rescate'], ['transfer', 'Transferencia'], ['close', 'Cierre']
  ];
  const PATHS = {
    misiones: { name: 'Misiones', tag: '10–15 min', text: 'Una idea por vez, con sus 7 etapas en miniatura. Se retoma donde la dejaste.' },
    expedicion: { name: 'Expedición', tag: 'Clase larga', text: 'Todas las misiones seguidas. Si aciertas sin ayuda aparecen desafíos extra.' },
    prueba: { name: 'Prueba encima', tag: 'Evaluación pronto', text: 'Diagnóstico y directo a problemas tipo prueba. El rescate te manda a lo que te falta.' }
  };
  const ITEM_STAGES = new Set(['diagnostic', 'practice', 'challenge', 'transfer']);
  const NO_HINT = new Set(['diagnostic', 'transfer']);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  const md = value => esc(value).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

  function sessionFor(api, id) {
    const state = api.getState();
    if (!state.classSessions || typeof state.classSessions !== 'object') state.classSessions = {};
    const s = state.classSessions[id] ||= {};
    s.answers ||= {}; s.hints ||= {}; s.revealed ||= {}; s.skipExplain ||= {}; s.retries ||= {};
    if (!Number.isInteger(s.step)) s.step = 0;
    return s;
  }

  function stageItems(mission, stage) { return mission?.stages?.[stage] || []; }

  function plan(cls, s) {
    const steps = [];
    const missionSteps = (m, withChallenge) => {
      steps.push({ m: m.id, stage: 'diagnostic' });
      if (!s.skipExplain[m.id]) { steps.push({ m: m.id, stage: 'explain' }); steps.push({ m: m.id, stage: 'worked' }); }
      steps.push({ m: m.id, stage: 'practice' });
      if (withChallenge && stageItems(m, 'challenge').length) steps.push({ m: m.id, stage: 'challenge' });
      steps.push({ m: m.id, stage: 'rescue' });
      steps.push({ m: m.id, stage: 'transfer' });
    };
    if (s.path === 'misiones') {
      const m = cls.missions.find(item => item.id === s.mission);
      if (m) missionSteps(m, false);
    } else if (s.path === 'expedicion') {
      cls.missions.forEach(m => missionSteps(m, true));
    } else if (s.path === 'prueba') {
      cls.missions.forEach(m => steps.push({ m: m.id, stage: 'diagnostic' }));
      cls.missions.forEach(m => steps.push({ m: m.id, stage: 'transfer' }));
      steps.push({ m: null, stage: 'rescue' });
    }
    steps.push({ m: null, stage: 'close' });
    return steps;
  }

  const stageKey = stage => stage === 'challenge' ? 'practice' : stage;
  const missionById = (cls, id) => cls.missions.find(m => m.id === id);
  const allItems = (cls, mId) => cls.missions.filter(m => !mId || m.id === mId)
    .flatMap(m => ['diagnostic', 'practice', 'challenge', 'transfer'].flatMap(stage => stageItems(m, stage).map(item => ({ item, stage, mission: m }))));

  function itemDone(s, item) { return Boolean(s.answers[item.id]); }

  function canContinue(cls, s, step) {
    const m = missionById(cls, step.m);
    if (ITEM_STAGES.has(step.stage)) return stageItems(m, step.stage).every(item => itemDone(s, item));
    if (step.stage === 'worked') return (m.stages.worked?.steps || []).every((st, i) => !st.ask || s.revealed[`${m.id}-w${i}`]);
    return true;
  }

  /* ───────── Vistas ───────── */

  function mascot(api, s, step) {
    const hintable = step && (step.stage === 'practice' || step.stage === 'challenge');
    const say = s.say || (step ? ({
      diagnostic: 'Primero veamos qué sabes. Aquí no doy pistas.',
      explain: 'Lee con calma. Lo que importa son las relaciones, no las palabras.',
      worked: 'Antes de ver cada paso, intenta adivinarlo.',
      practice: 'Si te trabas, pídeme una pista. Queda anotado, pero está bien usarla.',
      challenge: '¡Vas tan bien que te traje un desafío!',
      rescue: 'Los errores son información. Veamos qué pasó.',
      transfer: 'Problema nuevo y sin ayuda. Tú puedes.',
      close: 'Buen trabajo. Esto se consolida volviendo otro día.'
    })[step.stage] : '¡Bienvenido al aula! Elige cómo quieres estudiar hoy.');
    return `<aside class="cr-mascot" data-mood="${esc(s.mood || 'idle')}" aria-label="Tu compañero">
      <div class="cr-bubble" role="status" aria-live="polite">${md(say)}</div>
      <div class="cr-mascot-figure">${api.avatarMarkup({ label: 'Tu compañero de clase' })}</div>
      ${hintable ? '<button class="cr-btn cr-hint" data-cr="hint">Pedir pista</button>' : ''}
    </aside>`;
  }

  function lobby(cls, api, s) {
    const subject = api.subject;
    return `<div class="cr-lobby">
      <header class="cr-lobby-head">
        <p class="cr-eyebrow">${esc(subject.name)} · ${esc(cls.evaluation)}${cls.status === 'borrador' ? ' · <span class="cr-badge">Borrador</span>' : ''}</p>
        <h1 id="crTitle">${esc(cls.title)}</h1>
        <p class="cr-lead">Elige cómo quieres estudiar. Todos los caminos guardan la misma evidencia: terminar no es dominar, acertar sin ayuda y recordar después sí.</p>
      </header>
      <div class="cr-paths" role="radiogroup" aria-label="Camino de estudio">
        ${Object.entries(PATHS).map(([id, p]) => `<button class="cr-path ${s.pickPath === id ? 'is-picked' : ''}" role="radio" aria-checked="${s.pickPath === id}" data-cr="pick-path" data-path="${id}">
          <span class="cr-path-tag">${esc(p.tag)}</span><b>${esc(p.name)}</b><span>${esc(p.text)}</span></button>`).join('')}
      </div>
      ${s.pickPath === 'misiones' ? `<section class="cr-missions" aria-labelledby="crMissions"><h2 id="crMissions">Misiones</h2>
        <ol>${cls.missions.map((m, i) => `<li><button class="cr-mission" data-cr="start" data-mission="${m.id}"><span class="cr-mission-n">${i + 1}</span><span><b>${esc(m.title)}</b><small>${esc(m.subtitle)}</small></span><span class="cr-mission-meta">≈ ${m.minutes} min · diap. ${esc(m.slides)}</span></button></li>`).join('')}
        <li class="cr-mission-soon">Las siguientes misiones están en preparación.</li></ol></section>`
        : s.pickPath ? `<div class="cr-start"><button class="cr-btn cr-primary" data-cr="start">Entrar al aula →</button></div>` : ''}
    </div>`;
  }

  function stepper(steps, s) {
    const current = stageKey(steps[s.step].stage);
    const reached = new Set(steps.slice(0, s.step).map(st => stageKey(st.stage)));
    return `<ol class="cr-stepper" aria-label="Etapas de la clase">${STAGES.map(([id, name], i) =>
      `<li class="${id === current ? 'is-now' : reached.has(id) ? 'is-done' : ''}" ${id === current ? 'aria-current="step"' : ''}><span>${reached.has(id) && id !== current ? '✓' : i + 1}</span><b>${name}</b></li>`).join('')}</ol>`;
  }

  function choiceItem(cls, s, item, stage, { retry = false } = {}) {
    const key = retry ? `${item.id}::retry` : item.id;
    const record = retry ? s.retries[item.id] : s.answers[item.id];
    const hint = s.hints[item.id] && !retry;
    const options = item.options.map((opt, i) => {
      const picked = record?.choice === i;
      // Tras un error fuera del rescate no se revela la correcta: se descubre en el segundo intento.
      const tone = !record ? '' : picked ? (opt.correct ? 'is-right' : 'is-wrong') : (opt.correct && retry ? 'is-right' : 'is-muted');
      return `<li><button class="cr-option ${tone}" data-cr="answer" data-item="${esc(item.id)}" data-choice="${i}" data-retry="${retry ? 1 : 0}" ${record ? 'disabled' : ''} aria-pressed="${picked}">
        <span class="cr-letter">${String.fromCharCode(65 + i)}</span><span>${esc(opt.text)}</span></button></li>`;
    }).join('');
    let feedback = '';
    if (record) {
      const opt = item.options[record.choice];
      if (record.correct) {
        feedback = `<div class="cr-feedback is-right"><b>${hint ? 'Correcto, con pista.' : 'Correcto, sin ayuda.'}</b><p>${md(item.explain)}</p></div>`;
      } else {
        const mc = cls.misconceptions[opt.misconception];
        feedback = `<div class="cr-feedback is-wrong"><b>${mc ? esc(mc.label) : 'No es esa.'}</b>
          <p>${md(mc ? mc.why : 'Esa alternativa no se sostiene. En el rescate la revisamos con calma.')}</p>
          ${mc?.prereq ? `<p class="cr-prereq">Si esto te pasa seguido, repasa: <b>${esc(mc.prereq.title)}</b>. Lo veremos en el rescate.</p>` : ''}</div>`;
      }
    }
    return `<article class="cr-item" aria-labelledby="q-${esc(key)}">
      <p class="cr-q" id="q-${esc(key)}">${md(item.prompt)}</p>
      ${hint && !record ? `<p class="cr-hinttext"><b>Pista:</b> ${md(item.hint)}</p>` : ''}
      <ol class="cr-options">${options}</ol>
      ${feedback}
      ${item.slide ? `<p class="cr-cite">Diapositiva ${esc(item.slide)}</p>` : ''}
    </article>`;
  }

  function stageView(cls, api, s, steps) {
    const step = steps[s.step];
    const m = missionById(cls, step.m);
    const head = (kicker, title, text) => `<header class="cr-stage-head"><p class="cr-eyebrow">${kicker}</p><h1 id="crTitle" tabindex="-1">${title}</h1>${text ? `<p class="cr-lead">${text}</p>` : ''}</header>`;

    if (ITEM_STAGES.has(step.stage)) {
      const items = stageItems(m, step.stage);
      const labels = {
        diagnostic: ['Diagnóstico', '¿Qué sabes ya?', 'Responde sin ayuda. Esto decide qué podemos saltar.'],
        practice: ['Práctica', 'Ahora tú', 'Sin pistas visibles. Si te trabas, pídele una a tu compañero.'],
        challenge: ['Desafío', 'Un paso más allá', 'Apareció porque vas acertando sin ayuda.'],
        transfer: ['Transferencia', 'Un caso nuevo', 'Contexto distinto, sin pistas. Así se ve en la prueba.']
      }[step.stage];
      let extra = '';
      if (step.stage === 'diagnostic' && s.path !== 'prueba' && items.every(item => itemDone(s, item)) && !s.skipExplain[m.id]
        && items.every(item => s.answers[item.id].correct)) {
        extra = `<div class="cr-offer"><b>Acertaste todo el diagnóstico.</b><p>Puedes saltarte la explicación e ir directo a la práctica.</p>
          <div class="cr-row"><button class="cr-btn cr-primary" data-cr="skip-explain">Saltar a la práctica</button></div></div>`;
      }
      return `${head(`${esc(labels[0])} · ${esc(m.title)}`, esc(labels[1]), esc(labels[2]))}
        <div class="cr-items">${items.map(item => choiceItem(cls, s, item, step.stage)).join('')}</div>${extra}`;
    }

    if (step.stage === 'explain') {
      return `${head(`Explicar · ${esc(m.title)}`, esc(m.subtitle), '')}
        <div class="cr-blocks">${m.stages.explain.map(b => `<section class="cr-block" id="blk-${esc(b.id)}">
          <h2>${esc(b.title)}</h2><p>${md(b.body)}</p>
          ${b.rows ? `<dl class="cr-rows">${b.rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
          ${b.note ? `<p class="cr-note">${md(b.note)}</p>` : ''}
          ${b.slide ? `<p class="cr-cite">Diapositiva ${esc(b.slide)}</p>` : ''}</section>`).join('')}</div>`;
    }

    if (step.stage === 'worked') {
      const w = m.stages.worked;
      let open = true;
      const list = w.steps.map((st, i) => {
        const key = `${m.id}-w${i}`;
        if (!open) return '';
        if (st.ask && !s.revealed[key]) {
          open = false;
          return `<li class="cr-wstep is-ask"><span>${i + 1}</span><div><p><b>Piensa antes de mirar:</b> ${md(st.ask)}</p><button class="cr-btn" data-cr="reveal" data-key="${key}">Ya lo pensé, ver el paso</button></div></li>`;
        }
        return `<li class="cr-wstep"><span>${i + 1}</span><p>${md(st.text)}</p></li>`;
      }).join('');
      return `${head(`Ejemplo resuelto · ${esc(m.title)}`, md(w.prompt), 'Algunos pasos están escondidos: predícelos antes de verlos.')}<ol class="cr-worked">${list}</ol>`;
    }

    if (step.stage === 'rescue') {
      const pool = allItems(cls, step.m).filter(({ item }) => s.answers[item.id] && !s.answers[item.id].correct);
      if (!pool.length) return `${head('Rescate', 'Nada que rescatar', 'Todo lo que respondiste estuvo correcto. Sigamos.')}`;
      return `${head('Rescate', 'Veamos tus errores', 'Por qué pasó, qué conviene repasar y un segundo intento.')}
        <div class="cr-items">${pool.map(({ item, mission }) => {
          const opt = item.options[s.answers[item.id].choice];
          const mc = cls.misconceptions[opt.misconception];
          const block = mc?.prereq && missionById(cls, mc.prereq.mission)?.stages.explain.find(b => b.id === mc.prereq.block);
          const open = s.revealed[`rescue-${item.id}`];
          return `<section class="cr-rescue">
            <p class="cr-eyebrow">Tu respuesta: «${esc(opt.text)}»</p>
            <h2>${esc(mc ? mc.label : 'Respuesta incorrecta')}</h2>
            <p>${md(mc ? mc.why : item.explain)}</p>
            ${block ? `<div class="cr-row"><button class="cr-btn" data-cr="reveal" data-key="rescue-${esc(item.id)}" aria-expanded="${Boolean(open)}">Repasar: ${esc(mc.prereq.title)}</button></div>
              ${open ? `<div class="cr-block is-inline"><h3>${esc(block.title)}</h3><p>${md(block.body)}</p>${block.rows ? `<dl class="cr-rows">${block.rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}${block.note ? `<p class="cr-note">${md(block.note)}</p>` : ''}</div>` : ''}` : ''}
            <h3 class="cr-retry-title">Segundo intento</h3>
            ${choiceItem(cls, s, item, 'rescue', { retry: true })}
          </section>`;
        }).join('')}</div>`;
    }

    // Cierre
    const scope = allItems(cls, s.path === 'misiones' ? s.mission : null).filter(({ item }) => s.answers[item.id]);
    const solo = scope.filter(({ item }) => s.answers[item.id].correct && !s.hints[item.id]).length;
    const withHint = scope.filter(({ item }) => s.answers[item.id].correct && s.hints[item.id]).length;
    const wrong = scope.filter(({ item }) => !s.answers[item.id].correct);
    const fixed = wrong.filter(({ item }) => s.retries[item.id]?.correct).length;
    const transferOk = scope.filter(({ item, stage }) => stage === 'transfer' && s.answers[item.id].correct && !s.hints[item.id]).length;
    const nextMission = s.path === 'misiones' ? cls.missions[cls.missions.findIndex(m => m.id === s.mission) + 1] : null;
    return `${head('Cierre', 'Lo que demostraste hoy', '')}
      <dl class="cr-summary">
        <div><dt>Sin ayuda</dt><dd>${solo}</dd></div>
        <div><dt>Con pista</dt><dd>${withHint}</dd></div>
        <div><dt>Errores corregidos</dt><dd>${fixed}/${wrong.length}</dd></div>
        <div><dt>Transferencia sin ayuda</dt><dd>${transferOk}</dd></div>
      </dl>
      <div class="cr-honest"><b>Esto todavía no es dominio.</b><p>Acertar hoy muestra que lo entendiste. Para contar como <b>retenido</b> tienes que recordarlo sin ayuda al menos 24 horas después. El repaso se agenda solo cuando conectemos el motor de evidencia (próximo paso).</p></div>
      <div class="cr-row">${nextMission ? `<button class="cr-btn cr-primary" data-cr="start" data-mission="${nextMission.id}">Siguiente misión →</button>` : ''}
        <button class="cr-btn" data-cr="lobby">Volver a la entrada del aula</button><button class="cr-btn" data-cr="exit">Salir del aula</button></div>`;
  }

  function sourcePanel(cls, s, steps) {
    const step = steps?.[s.step];
    const m = step ? missionById(cls, step.m) : null;
    return `<aside class="cr-source" id="crSource" aria-label="Fuente">
      <header><b>Fuente</b><button class="cr-btn cr-small" data-cr="source" aria-label="Cerrar fuente">Cerrar</button></header>
      ${Object.values(cls.sources).map(src => `<div class="cr-src"><p class="cr-eyebrow">${esc(src.authority)}</p><h2>${esc(src.title)}</h2><p>${esc(src.author)} · ${esc(src.detail)}</p></div>`).join('')}
      ${m ? `<p>Esta misión usa las <b>diapositivas ${esc(m.slides)}</b>. Cada pregunta indica su diapositiva.</p>` : ''}
      <p class="cr-muted">Pronto: ver la diapositiva aquí mismo y el minuto exacto de la grabación de clase.</p>
    </aside>`;
  }

  function render(id, api) {
    const cls = window.NexoClasses?.[id];
    const s = sessionFor(api, id);
    if (s.path && !PATHS[s.path]) s.path = null;
    if (s.path === 'misiones' && !missionById(cls, s.mission)) s.path = null;
    const steps = s.path ? plan(cls, s) : null;
    if (steps) s.step = Math.max(0, Math.min(s.step, steps.length - 1));
    const step = steps?.[s.step];
    const m = step ? missionById(cls, step.m) : null;
    const body = steps ? `
      <header class="cr-top">
        <button class="cr-btn cr-small" data-cr="exit">← Salir</button>
        <div class="cr-top-title"><small>${esc(cls.title)} · ${esc(PATHS[s.path].name)}</small><b>${m ? esc(m.title) : 'Cierre'}</b></div>
        <div class="cr-row"><button class="cr-btn cr-small" data-cr="lobby">Cambiar camino</button><button class="cr-btn cr-small" data-cr="source" aria-expanded="${Boolean(s.sourceOpen)}" aria-controls="crSource">Fuente</button></div>
      </header>
      ${stepper(steps, s)}
      <div class="cr-body ${s.sourceOpen ? 'has-source' : ''}">
        <main class="cr-stage" aria-labelledby="crTitle">${stageView(cls, api, s, steps)}</main>
        ${s.sourceOpen ? sourcePanel(cls, s, steps) : ''}
      </div>
      <footer class="cr-controls">
        <button class="cr-btn" data-cr="prev" ${s.step === 0 ? 'disabled' : ''}>← Anterior</button>
        <span class="cr-progress">${s.step + 1} / ${steps.length}</span>
        ${step.stage !== 'close' ? `<button class="cr-btn cr-primary" data-cr="next" ${canContinue(cls, s, step) ? '' : 'disabled'}>Continuar →</button>` : '<span></span>'}
      </footer>`
      : `<header class="cr-top"><button class="cr-btn cr-small" data-cr="exit">← Salir</button><div class="cr-top-title"><small>Aula</small><b>${esc(cls.title)}</b></div><span></span></header>
         <div class="cr-body"><main class="cr-stage cr-stage-lobby" aria-labelledby="crTitle">${lobby(cls, api, s)}</main></div>`;

    api.app.innerHTML = `<section class="classroom" style="--course:${esc(api.subject.color)}" aria-label="Aula de ${esc(cls.title)}">
      <div class="cr-bg" aria-hidden="true"></div>${body}${mascot(api, s, step)}</section>`;
    document.body.classList.add('in-classroom');
    api.hydrate();
    const root = api.app.querySelector('.classroom');
    root.addEventListener('click', event => onClick(event, id, api));
  }

  function rerender(id, api, focusTitle = false) {
    api.saveState();
    render(id, api);
    if (focusTitle) {
      api.app.querySelector('#crTitle')?.focus({ preventScroll: true });
      api.app.querySelector('.cr-stage')?.scrollTo?.({ top: 0 });
      window.scrollTo({ top: 0 });
    }
  }

  function onClick(event, id, api) {
    const button = event.target.closest('[data-cr]');
    if (!button || button.disabled) return;
    const cls = window.NexoClasses[id];
    const s = sessionFor(api, id);
    const action = button.dataset.cr;
    const steps = s.path ? plan(cls, s) : null;
    const step = steps?.[s.step];
    s.say = '';

    if (action === 'exit') { document.body.classList.remove('in-classroom'); return api.exit(); }
    if (action === 'lobby') { s.pickPath = s.path || s.pickPath; s.path = null; s.mood = 'idle'; return rerender(id, api, true); }
    if (action === 'pick-path') { s.pickPath = button.dataset.path; return rerender(id, api); }
    if (action === 'start') {
      s.path = s.pickPath || s.path || 'misiones';
      if (button.dataset.mission) { s.path = 'misiones'; s.mission = button.dataset.mission; }
      s.step = 0; s.mood = 'happy'; s.say = '¡Vamos! Empezamos por un diagnóstico corto.';
      api.track?.('class_started', { class_id: id, path: s.path });
      return rerender(id, api, true);
    }
    if (action === 'source') { s.sourceOpen = !s.sourceOpen; return rerender(id, api); }
    if (action === 'prev') { s.step = Math.max(0, s.step - 1); s.mood = 'idle'; return rerender(id, api, true); }
    if (action === 'next') { if (canContinue(cls, s, step)) { s.step += 1; s.mood = 'idle'; } return rerender(id, api, true); }
    if (action === 'reveal') {
      const key = button.dataset.key;
      s.revealed[key] = key.startsWith('rescue-') ? !s.revealed[key] : true; // el repaso se abre y cierra; un paso revelado queda visible
      return rerender(id, api);
    }
    if (action === 'skip-explain') {
      s.skipExplain[step.m] = true; s.mood = 'happy'; s.say = '¡Eso! Directo a la práctica.';
      s.step += 1;
      return rerender(id, api, true);
    }
    if (action === 'hint') {
      const m = missionById(cls, step.m);
      const target = stageItems(m, step.stage).find(item => !s.answers[item.id] && !s.hints[item.id] && item.hint);
      if (!target) { s.say = 'No me quedan pistas para esta parte. ¡Confío en ti!'; return rerender(id, api); }
      s.hints[target.id] = true; s.mood = 'think';
      s.say = 'Te dejé una pista en la pregunta. Ese intento contará como "con pista".';
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
        s.mood = correct ? 'happy' : 'worry';
        s.say = correct ? '¡Corregido! Así se aprende de un error.' : 'Todavía no. Lee de nuevo la explicación y vuelve a esta idea otro día.';
      } else {
        if (s.answers[itemId]) return;
        if (NO_HINT.has(step.stage)) delete s.hints[itemId];
        s.answers[itemId] = { choice, correct, hint: Boolean(s.hints[itemId]), stage: step.stage, at: new Date().toISOString() };
        s.mood = correct ? (s.hints[itemId] ? 'think' : 'happy') : 'worry';
        s.say = correct ? (s.hints[itemId] ? 'Bien, con pista. La próxima sin ella.' : '¡Eso! Sin ayuda.') : 'Ups. Mira por qué pasó; lo retomamos en el rescate.';
      }
      api.track?.('class_answer', { class_id: id, correct, retry });
      return rerender(id, api);
    }
  }

  window.NexoClassroom = { render, plan, STAGES, PATHS };
})();
