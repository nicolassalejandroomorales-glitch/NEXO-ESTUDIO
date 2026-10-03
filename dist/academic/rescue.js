/* One evidence-gated rescue path for the org-01 prerequisite pilot. */
(() => {
  'use strict';
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  let context=null,target='org.lone-pair';
  function progress() {
    const state=context.getState();
    state.organicProgress['org-01'] ||= {};
    const all=state.organicProgress['org-01'].rescue ||= {};
    return all[target] ||= {stage:0,attempts:{},results:{}};
  }
  function form(id,p) {
    const item=window.NexoAcademicStructured.byId(id),result=p.results[id];
    if(!item)return '<p>Este caso no está disponible.</p>';
    return `<div class="rescue-case"><h3>${esc(item.title)}</h3><p>${esc(item.prompt)}</p>
      ${result?`<div class="structured-feedback ${result.outcome}" role="status"><strong>${esc(result.what)}</strong>
        <p><b>Por qué:</b> ${esc(result.why)}</p><p><b>Ahora:</b> ${esc(result.next)}</p></div>
        ${result.outcome==='correct'?'<button class="primary-btn" data-rescue-next>Continuar</button>':
          '<button class="secondary-btn" data-rescue-retry>Intentar con la corrección en mente</button>'}`:
        `<form data-rescue-case="${esc(id)}"><div class="structured-fields">${item.fields.map(field=>
          `<label class="field"><span>${esc(field.label)}</span>${field.type==='number'?
            `<input name="${esc(field.key)}" type="text" inputmode="decimal" autocomplete="off" required>`:
            `<select name="${esc(field.key)}" required>${field.options.map(([value,label])=>
              `<option value="${esc(value)}">${esc(label)}</option>`).join('')}</select>`}</label>`).join('')}</div>
          <label class="field rescue-reason"><span>Explica la primera decisión con tus palabras</span><textarea name="reason" rows="3" required minlength="20"></textarea></label>
          <button type="submit" class="primary-btn">Comprobar</button></form>`}</div>`;
  }
  function render(host,api,conceptId='org.lone-pair') {
    context=api;target=conceptId;
    const diagnosis=window.NexoAcademicEngine.diagnoses(api.getState()).find(item=>item.conceptId===target);
    if(target!=='org.lone-pair'||diagnosis?.status!=='confirmed'){
      host.innerHTML='<section class="page arcane-rescue"><h1>Rescate no activado</h1><p>Aún no hay dos comprobaciones independientes que confirmen esta dificultad. Tu clase y tus ejercicios siguen disponibles.</p><button class="secondary-btn" data-route="knowledge">Volver al mapa</button></section>';
      return;
    }
    const p=progress();window.NexoActiveStudy?.begin(target,'rescue');
    const intro=`<section class="page arcane-rescue"><button class="back-btn" data-route="knowledge">← Mapa de conocimiento</button>
      <p class="eyebrow">ORGÁNICA II · RESCATE DE PREREQUISITO</p><h1>¿Dónde está el par de N?</h1>
      <p class="rescue-position">Paso ${Math.min(p.stage+1,5)} de 5 · Esto practica un obstáculo; no otorga dominio inmediato.</p>`;
    const stages=[
      `<article class="rescue-page"><h2>La misma flecha, tres costos distintos</h2>
        <p>Para captar H⁺, N ofrece un par. Antes de comparar bases, localiza ese par y pregunta qué estabilizaba en la especie neutra. No basta contar nitrógenos ni decir «aromático».</p>
        <div class="rescue-visual" role="img" aria-label="Tres destinos del par de nitrógeno: disponible, conjugado con un anillo o parte del sexteto aromático"><div><b>Amina alifática</b><strong>R–NH₂:</strong><span>Par local disponible</span></div><i aria-hidden="true">→</i><div><b>Anilina</b><strong>Ph–NH₂:</strong><span>Par conjugado con el anillo</span></div><i aria-hidden="true">→</i><div><b>Pirrol</b><strong>N–H</strong><span>Par dentro del sexteto π</span></div></div>
        <p>La flecha horizontal compara <em>el papel del par</em>; no representa una reacción ni un orden universal de pKa. En el cuaderno dibuja un ejemplo de cada tipo y marca el par.</p>
        <button class="primary-btn" data-rescue-next>Ver el caso resuelto</button></article>`,
      `<article class="rescue-page"><h2>Ejemplo resuelto: metilamina + HCl</h2>
        <ol><li>CH₃NH₂ tiene tres enlaces en N y un par libre.</li><li>El par de N forma el enlace N–H; el enlace H–Cl se rompe hacia Cl.</li><li>El producto es CH₃NH₃⁺ + Cl⁻: N tiene cuatro enlaces y carga +1.</li></ol>
        <p><b>Contraste:</b> en anilina protonar N también forma N–H⁺, pero se pierde la donación del par al anillo. El benceno conserva su propio sexteto aromático. En pirrol, el par de N sí completaba el sexteto del anillo neutro.</p>
        <div class="rescue-note"><b>ANOTA</b><span>Par → H; enlace H–Cl → Cl; cuenta enlaces y carga antes/después.</span><b>NO ANOTES</b><span>«Aromático = base débil» como regla sin localizar el par.</span></div>
        <button class="primary-btn" data-rescue-next>Completar un caso</button></article>`,
      `<article class="rescue-page"><h2>Completa el contraste</h2><p>Ahora cambia el esqueleto. Primero predice en tu cuaderno los extremos; después responde.</p>${form('sv-pep-hetero',p)}</article>`,
      `<article class="rescue-page"><h2>Nuevo contexto, sin pista</h2><p>Si el par puede o no conjugarse, ¿cómo cambia un orden de basicidad? Resuelve este caso sin volver a mirar la explicación.</p>${form('sv-pep-order',p)}</article>`,
      `<article class="rescue-page"><h2>Rescate practicado</h2><p>Has contrastado pares, visto una solución y respondido dos contextos. La revisión futura quedó programada por tus intentos; hoy no se marca el concepto como dominado.</p>
        <button class="primary-btn" data-route="reviews">Ver revisiones</button><button class="secondary-btn" data-route="knowledge">Volver al mapa</button></article>`
    ];
    host.innerHTML=intro+stages[Math.min(p.stage,4)]+'</section>';
  }
  function next() {if(!context)return;const p=progress();
    if(p.stage===2&&p.results['sv-pep-hetero']?.outcome!=='correct')return;
    if(p.stage===3&&p.results['sv-pep-order']?.outcome!=='correct')return;
    p.stage=Math.min(4,p.stage+1);context.saveState();render(document.querySelector('#app'),context,target);
  }
  function retry() {if(!context)return;const p=progress(),id=p.stage===2?'sv-pep-hetero':'sv-pep-order';
    if(p.results[id]?.outcome!=='incorrect')return;
    delete p.results[id];context.saveState();render(document.querySelector('#app'),context,target);}
  async function answer(form) {
    if(!context)return;const p=progress(),id=form.dataset.rescueCase;
    if(id!==(p.stage===2?'sv-pep-hetero':p.stage===3?'sv-pep-order':null))return;
    const values=Object.fromEntries(new FormData(form).entries());
    const result=window.NexoAcademicStructured.evaluate(id,values);
    if(result.kind==='incomplete')return;
    const count=(p.attempts[id]||0)+1;
    await window.NexoAcademicEngine.recordAttempt({getState:context.getState,saveState:context.saveState,
      track:context.track},{id:`rescue-${id}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      exerciseId:`org-01:${id}`,structuredAnswers:values,reasoningText:values.reason,
      assistanceUsed:true,attemptNumber:count,activityType:'rescue',activityId:'org-01'});
    p.attempts[id]=count;p.results[id]=result;context.saveState();render(document.querySelector('#app'),context,target);
  }
  window.NexoAcademicRescue=Object.freeze({render,next,retry,answer});
})();
