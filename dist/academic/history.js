/* V14: paged cloud history; older records stay outside startup state. */
(() => {
  'use strict';
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const tabs={study_sessions:'Sesiones',error_records:'Errores',academic_attempts:'Intentos'};
  let table='study_sessions',page=0,rows=[],loading=false,error='',identity='',summary=null;
  const size=30;
  let cloud,guest;
  function render(host,service,state) {
    cloud=service;guest=state;
    const id=service.user?.id||'guest';
    if(identity!==id){identity=id;table='study_sessions';page=0;rows=[];summary=null;}
    host.innerHTML=`<section class="page academic-history"><button class="back-btn" data-route="stats">← Estadísticas</button>
      <h1>Historial académico</h1><p>Consulta páginas antiguas cuando las necesites. No se descargan al abrir Nexo.</p>
      <nav class="segmented" aria-label="Tipo de historial">${Object.entries(tabs).map(([key,label])=>
        `<button data-history-tab="${key}" aria-pressed="${table===key}">${label}</button>`).join('')}</nav>
      <p data-history-summary>${summary?`${summary.sessions} sesiones · ${Math.round(summary.seconds/60)} minutos acumulados en la cuenta`:
        service.authenticated?'Resumen de cuenta disponible al cargar':'Historial de este dispositivo'}</p>
      <div data-history-results role="status"></div><div class="button-row">
        <button data-history-page="previous" ${page===0?'disabled':''}>Anterior</button>
        <span>Página ${page+1}</span><button data-history-page="next" ${rows.length<size?'disabled':''}>Siguiente</button></div></section>`;
    display();
    if(service.authenticated && !summary)service.studySummary().then(value=>{
      if(identity===id){summary=value;const node=host.querySelector('[data-history-summary]');
        if(node&&value)node.textContent=`${value.sessions} sesiones · ${Math.round(value.seconds/60)} minutos acumulados en la cuenta`;}
    }).catch(()=>{});
    load();
  }
  function display() {
    const box=document.querySelector('[data-history-results]');if(!box)return;
    if(loading){box.innerHTML='<p>Cargando esta página…</p>';return;}
    if(error){box.innerHTML=`<p>${esc(error)}</p><button data-history-retry>Reintentar</button>`;return;}
    box.innerHTML=rows.length?`<ul class="academic-history-list">${rows.map(item=>{
      const date=item.date||item.created_at||item.attemptedAt||'';
      const detail=table==='study_sessions'?`${Math.round((Number(item.seconds)||0)/60)} min · ${item.subject||'Estudio'}`:
        table==='error_records'?`${item.observable||item.exerciseId||'Error'} · ${item.status||'pendiente'}`:
          `${item.exercise_id||'Ejercicio'} · ${item.outcome||'Intento'}`;
      return `<li><time>${esc(date)}</time><span>${esc(detail)}</span></li>`;
    }).join('')}</ul>`:'<p>No hay registros en esta página.</p>';
    const next=document.querySelector('[data-history-page="next"]');if(next)next.disabled=rows.length<size;
  }
  async function load() {
    const selected=table,selectedPage=page,selectedUser=identity;
    loading=true;error='';display();
    try {
      const batch=cloud.authenticated?await cloud.loadHistory(selected,selectedPage*size,size):
        (selected==='study_sessions'?guest.sessions:selected==='error_records'?guest.errors:
          guest.academicIntelligence?.attempts||[]).slice(selectedPage*size,(selectedPage+1)*size);
      if(identity!==selectedUser||table!==selected||page!==selectedPage)return;
      rows=batch.map(item=>item.data||item);
    } catch {if(identity===selectedUser)error='No pudimos consultar el historial. Inténtalo de nuevo.';}
    finally {if(identity===selectedUser&&table===selected&&page===selectedPage){loading=false;display();}}
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-history-tab],[data-history-page],[data-history-retry]');
    if(!button||!document.querySelector('.academic-history'))return;
    if(button.dataset.historyTab){table=button.dataset.historyTab;page=0;rows=[];load();}
    else if(button.dataset.historyPage){page=Math.max(0,page+(button.dataset.historyPage==='next'?1:-1));rows=[];load();}
    else load();
    const pageNode=document.querySelector('.academic-history .button-row span');
    if(pageNode)pageNode.textContent=`Página ${page+1}`;
    document.querySelectorAll('[data-history-tab]').forEach(tab=>tab.setAttribute('aria-pressed',String(tab.dataset.historyTab===table)));
    const previous=document.querySelector('[data-history-page="previous"]');if(previous)previous.disabled=page===0;
  });
  window.NexoHistory={render};
})();
