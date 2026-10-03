/* First Nexo Library screen: references, not book binaries. */
(() => {
  'use strict';
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let api=null;
  function render(host,context) {
    api=context;
    const model=window.NexoAcademicModel,sources=window.NexoSources;
    const personal=context.getState().academicIntelligence.userSources||[];
    const list=[...model.sources,...personal];
    host.innerHTML=`<section class="page academic-library"><button class="back-btn" data-route="subjects">← Ramos</button>
      <h1>Biblioteca Nexo</h1><p>Referencias y ubicaciones para volver a la fuente original. Tus libros y archivos privados no están incluidos en Nexo.</p>
      <div class="academic-library-grid">${Object.entries(sources.categories).map(([id,title])=>{
        const items=list.filter(item=>(item.category||({ppt:'class',guide:'class',web:'open',book:'books',
          recording:'recordings',transcript:'transcripts',exam:'exams',answer_key:'exams',
          manual:'manuals',lab_manual:'manuals'}[item.type]||'nexo'))===id);
        return `<section class="panel"><h2>${esc(title)}</h2>${items.length?items.map(item=>
          `<div class="source-row"><strong>${esc(item.title)}</strong><small>${esc(Object.entries(item.location||{}).map(([key,value])=>`${key}: ${value}`).join(' · '))}</small>
          ${item.url?`<a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer" data-source-open="${esc(item.id)}">Abrir fuente</a>`:'<span>Referencia sin enlace</span>'}</div>`).join(''):'<p>Sin fuentes registradas.</p>'}</section>`;
      }).join('')}</div>
      <section class="panel"><h2>Añadir referencia personal</h2><form data-source-form>
        <label>Tipo<select name="type"><option value="book">Libro</option><option value="ppt">PPT</option><option value="guide">Guía</option><option value="recording">Grabación</option><option value="transcript">Transcripción</option><option value="exam">Evaluación</option><option value="answer_key">Pauta</option><option value="lab_manual">Manual de laboratorio</option><option value="web">Web</option></select></label>
        <label>Título<input name="title" required maxlength="120"></label><label>Enlace HTTPS (opcional)<input name="url" type="url"></label>
        <details class="source-location"><summary>Ubicación exacta (opcional)</summary>
          <label>Capítulo<input name="chapter" maxlength="80"></label>
          <label>Página inicial<input name="pageStart" type="number" min="1"></label>
          <label>Página final<input name="pageEnd" type="number" min="1"></label>
          <label>Diapositiva inicial<input name="slideStart" type="number" min="1"></label>
          <label>Diapositiva final<input name="slideEnd" type="number" min="1"></label>
          <label>Minuto/tiempo inicial<input name="startTime" placeholder="00:43:20"></label>
          <label>Tiempo final<input name="endTime" placeholder="00:55:10"></label>
          <label>Ejercicio o pregunta<input name="exercise" maxlength="80"></label>
        </details>
        <label>Grabación asociada (ID opcional)<input name="recordingId" maxlength="120"></label>
        <label>Concepto asociado<select name="conceptId"><option value="">Sin vincular</option>${model.concepts.map(c=>`<option value="${c.id}">${esc(c.title)}</option>`).join('')}</select></label>
        <button class="primary-btn">Guardar referencia</button></form>
        <label>Importar transcripción .txt, .vtt o .srt<input type="file" data-transcript-file accept=".txt,.vtt,.srt,text/plain"></label>
        <p>Drive podrá conectarse después de configurar OAuth; no se solicitan permisos ahora.</p></section>
      </section>`;
  }
  document.addEventListener('submit',event=>{
    if(!event.target.matches('[data-source-form]')||!api)return;
    event.preventDefault();const fields=Object.fromEntries(new FormData(event.target));
    try {
      const location=Object.fromEntries(['chapter','pageStart','pageEnd','slideStart','slideEnd',
        'startTime','endTime','exercise'].filter(key=>fields[key]).map(key=>[key,
          /^(page|slide)/.test(key)?Number(fields[key]):fields[key]]));
      const source=window.NexoSources.validate({id:`personal:${crypto.randomUUID()}`,type:fields.type,
        title:fields.title,url:fields.url||null,location,
        conceptIds:fields.conceptId?[fields.conceptId]:[],recordingId:fields.recordingId||null,
        private:true,authority:'personal',createdAt:new Date().toISOString()});
      api.getState().academicIntelligence.userSources.push(source);api.saveState();
      render(document.querySelector('#app'),api);
    } catch {api.showToast('Revisa el título y el enlace de la fuente.');}
  });
  document.addEventListener('change',async event=>{
    if(!event.target.matches('[data-transcript-file]')||!api)return;
    const file=event.target.files?.[0];if(!file)return;
    try {
      const type=file.name.split('.').at(-1).toLowerCase();
      const cues=window.NexoSources.parseTranscript(await file.text(),type);
      const source=window.NexoSources.validate({id:`personal:${crypto.randomUUID()}`,type:'transcript',
        title:file.name,location:{cueCount:cues.length},transcriptCues:cues,private:true,authority:'personal',
        conceptIds:[],createdAt:new Date().toISOString()});
      api.getState().academicIntelligence.userSources.push(source);api.saveState();
      render(document.querySelector('#app'),api);
    } catch {api.showToast('No pudimos importar esa transcripción. Usa .txt, .vtt o .srt de hasta 256 KB.');}
  });
  document.addEventListener('click',event=>{
    const link=event.target.closest('[data-source-open]');if(link&&api)api.track('source_opened',{source_id:link.dataset.sourceOpen});
  });
  window.NexoAcademicLibrary={render};
})();
