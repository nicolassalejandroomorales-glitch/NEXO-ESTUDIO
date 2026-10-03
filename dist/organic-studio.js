/* Nexo · aula de Orgánica II. Recursos locales, cargados solamente cuando se usan. */
(() => {
  'use strict';
  const COURSE = window.NEXO_ORGANIC_COURSE || {};
  const DATA = NEXO_DATA;
  Object.entries(COURSE).forEach(([id, lesson]) => { lesson.id = id; });
  let bridge = null;
  let rdkitPromise = null;
  let pdfModulePromise = null;
  let pdfDocument = null;
  let pdfFilename = '';
  let pdfPage = 1;
  let pdfRenderTask = null;
  let activeEditorFrame = null;
  let activeEditorId = null;
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const dayKey = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const today = () => dayKey(new Date());
  const plusDays = (key, days) => { const d = new Date(`${key}T12:00:00`); d.setDate(d.getDate() + days); return dayKey(d); };
  const modeLabel = { understand: 'Entender todo', urgent: 'Prueba encima', mastery: 'Dominio' };
  const tabs = [['map', 'Mapa'], ['read', 'Lectura'], ['visual', 'Visual'], ['worked', 'Ejemplo'], ['challenge', 'Resolver'], ['transfer', 'Transferir'], ['source', 'Material']];
  const initialTab = { understand: 'map', urgent: 'challenge', mastery: 'transfer' };

  function progress(id) {
    const state = bridge.getState();
    if (!state.organicProgress || typeof state.organicProgress !== 'object') state.organicProgress = {};
    if (!state.organicProgress[id] || typeof state.organicProgress[id] !== 'object') state.organicProgress[id] = {};
    return state.organicProgress[id];
  }
  function persist() { bridge.saveState({ backup: false }); }
  function renderCurrent() { bridge.renderRoute(false); }
  function note(title, text) { return `<div class="org-note"><b>${escapeHtml(title)}</b><p>${escapeHtml(text)}</p></div>`; }

  function render(id, api) {
    bridge = api;
    if (id === 'org-01' && window.NexoAmineLesson) return window.NexoAmineLesson.render(api);
    const lesson = COURSE[id];
    if (!lesson) return false;
    lesson.id = id;
    const p = progress(id), mode = p.mode || 'understand';
    if (!p.mode) p.mode = mode;
    if (!tabs.some(([tab]) => tab === p.tab)) p.tab = initialTab[mode];
    const position = DATA.subjects.find(subject => subject.id === 'organica')?.peps.findIndex(pep => pep.lessons.includes(id));
    const pep = position >= 0 && position < 3 ? `PEP ${position + 1}` : 'CÁTEDRA';
    const status = p.status === 'dominado' ? 'Dominio autoverificado' : p.status === 'inestable' ? 'En práctica' : 'Por explorar';
    api.app.innerHTML = `<section class="page org-studio" data-org-studio="${escapeHtml(id)}">
      <button class="back-btn" data-open-subject="organica">← Orgánica II</button>
      <header class="org-hero"><div><p class="eyebrow">ORGÁNICA II · ${pep} · CLASE ${Number(id.slice(4))} · ${escapeHtml(status)}</p><h1>${escapeHtml(lesson.title)}</h1><p class="org-central">${escapeHtml(lesson.central)}</p><p class="org-source-line">${escapeHtml(lesson.source.status)}</p></div><div class="org-hero-number">${String(Number(id.slice(4))).padStart(2, '0')}</div></header>
      <div class="org-mode-row" role="group" aria-label="Modo de clase">${Object.entries(modeLabel).map(([value,label]) => `<button class="org-mode ${mode === value ? 'active' : ''}" data-org-mode="${value}" aria-pressed="${mode === value}">${label}</button>`).join('')}</div>
      <nav class="org-tabs" role="tablist" aria-label="Partes de la clase">${tabs.map(([value,label]) => `<button role="tab" aria-selected="${p.tab === value}" class="${p.tab === value ? 'active' : ''}" data-org-tab="${value}">${label}</button>`).join('')}</nav>
      <article class="org-content" role="tabpanel">${renderTab(lesson, p)}</article>
      <footer class="org-footer"><span>Tu trabajo queda en este navegador. Dibujar y justificar son evidencias distintas.</span><button class="secondary-btn" data-open-subject="organica">Volver a clases</button></footer>
    </section>`;
    if (['map', 'read', 'visual', 'challenge'].includes(p.tab)) requestAnimationFrame(() => hydrateMolecules(api.app));
    if (p.tab === 'source' && pdfDocument) requestAnimationFrame(() => drawPdfPage());
    return true;
  }

  function renderTab(lesson, p) {
    if (p.tab === 'map') return renderMap(lesson, p);
    if (p.tab === 'read') return renderRead(lesson);
    if (p.tab === 'visual') return renderVisual(lesson);
    if (p.tab === 'worked') return renderWorked(lesson);
    if (p.tab === 'challenge') return renderChallenge(lesson, p);
    if (p.tab === 'transfer') return renderTransfer(lesson, p);
    return renderSource(lesson);
  }
  function renderMap(lesson, p) {
    const sequence = p.mode === 'urgent'
      ? 'Empieza por Resolver. Si te trabas, identifica el primer paso ausente y vuelve solo a Lectura o Visual; regresa al ejercicio y repítelo sin pista.'
      : p.mode === 'mastery'
        ? 'Cierra la lectura. Resuelve un producto, explica el mecanismo y responde la transferencia sin mirar; contrasta después con la pauta.'
        : 'Lee el bloque completo, observa las estructuras, reconstruye el ejemplo y resuelve. Puedes moverte libremente: la ruta es una recomendación, no una puerta cerrada.';
    return `<div class="org-layout"><section class="org-panel org-lead"><p class="eyebrow">BASES DEL BLOQUE</p><h2>Tres piezas para empezar</h2><div class="org-dependencies">${lesson.terms.slice(0,3).map(([term,meaning]) => `<div><b>${escapeHtml(term)}</b><p>${escapeHtml(meaning)}</p></div>`).join('')}</div><p>${escapeHtml(sequence)}</p><div class="org-path"><span>Bases</span><i>→</i><span>Modelo</span><i>→</i><span>Producto</span><i>→</i><span>Transferencia</span></div>${p.firstAttemptAt && p.firstAttemptAt < today() && p.reviewStartedAt !== today() ? '<button class="secondary-btn org-review-start" data-org-start-review>Iniciar repaso sin mirar</button>' : ''}</section>
      <section class="org-panel"><p class="eyebrow">AL SALIR DE ESTA CLASE</p><ol class="org-goals">${lesson.goals.map(goal => `<li>${escapeHtml(goal)}</li>`).join('')}</ol><button class="primary-btn" data-org-tab="${p.mode === 'urgent' ? 'challenge' : 'read'}">${p.mode === 'urgent' ? 'Ir al problema' : 'Empezar lectura'} →</button></section></div>
      <section class="org-panel org-mini-visual"><div><p class="eyebrow">PRIMERA ESTRUCTURA</p><h2>${escapeHtml(lesson.molecules[0].name)}</h2><p>${escapeHtml(lesson.molecules[0].observation)}</p></div>${moleculeCard(lesson.molecules[0])}</section>`;
  }
  function renderRead(lesson) {
    return `<header class="org-section-head"><p class="eyebrow">LECTURA COMPLETA</p><h2>Construye una explicación que sobreviva a un problema nuevo</h2><p>Las definiciones aparecen cuando hacen falta; al terminar, reconstruye el mecanismo sin volver a mirar.</p></header>
      <div class="org-reading">${lesson.reading.map((section, index) => `<section class="org-panel org-reading-section"><div class="org-section-number">${String(index + 1).padStart(2, '0')}</div><div><h3>${escapeHtml(section.title)}</h3>${section.paragraphs.map(text => `<p>${escapeHtml(text)}</p>`).join('')}</div></section>`).join('')}</div>
      <section class="org-panel"><p class="eyebrow">CONCEPTOS A LOS QUE PUEDES VOLVER</p><div class="org-glossary">${lesson.terms.map(([term,definition]) => `<details><summary>${escapeHtml(term)}</summary><p>${escapeHtml(definition)}</p></details>`).join('')}</div></section>
      <div class="org-notebook"><section><h3>ANOTA</h3><ul>${lesson.notebook.write.map(text => `<li>${escapeHtml(text)}</li>`).join('')}</ul></section><section><h3>NO ANOTES</h3><ul>${lesson.notebook.avoid.map(text => `<li>${escapeHtml(text)}</li>`).join('')}</ul></section></div>
      <div class="org-end-action"><button class="primary-btn" data-org-tab="visual">Ver las estructuras →</button></div>`;
  }
  function moleculeCard(item) {
    return `<figure class="org-molecule"><div class="org-molecule-art" data-org-smiles="${escapeHtml(item.smiles)}"><span class="org-molecule-loading">Preparando estructura…</span></div><figcaption><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.observation)}</span></figcaption></figure>`;
  }
  function renderVisual(lesson) {
    return `<header class="org-section-head"><p class="eyebrow">LABORATORIO VISUAL</p><h2>Compara estructuras, no etiquetas</h2><p>En cada figura localiza el átomo o enlace señalado en el texto. Luego tapa el nombre e intenta explicar qué cambiaría en una reacción.</p></header><div class="org-molecule-grid">${lesson.molecules.map(moleculeCard).join('')}</div>
      <section class="org-panel org-flow"><p class="eyebrow">LA SECUENCIA MECANÍSTICA</p><h3>${escapeHtml(lesson.worked.prompt)}</h3><div class="org-flow-steps">${lesson.worked.steps.map((step,i) => `<div><span>${i+1}</span><p>${escapeHtml(step)}</p></div>`).join('')}</div><p class="org-flow-conclusion">${escapeHtml(lesson.worked.result)}</p></section>
      ${note('Qué observar', 'No confundas una estructura correcta con una explicación. Señala de dónde sale el par electrónico, qué enlace cambia y qué permanece.')}`;
  }
  function renderWorked(lesson) {
    return `<header class="org-section-head"><p class="eyebrow">EJEMPLO DESARROLLADO</p><h2>${escapeHtml(lesson.worked.prompt)}</h2><p>Antes de abrir cada paso, escribe una predicción breve. La pauta está para contrastar decisiones, no para copiar el producto.</p></header>
      <div class="org-worked">${lesson.worked.steps.map((step,i) => `<details class="org-panel"><summary><span>${String(i+1).padStart(2,'0')}</span> Decisión ${i+1}</summary><p>${escapeHtml(step)}</p></details>`).join('')}</div>
      <section class="org-panel org-result"><p class="eyebrow">RESULTADO Y CONTRASTE</p><h3>${escapeHtml(lesson.worked.result)}</h3><p>${escapeHtml(lesson.worked.contrast)}</p></section><div class="org-end-action"><button class="primary-btn" data-org-tab="challenge">Ahora resuélvelo tú →</button></div>`;
  }
  function renderChallenge(lesson, p) {
    const task = lesson.task, checked = p.check && typeof p.check === 'object';
    const help = Number(p.help) || 0;
    const helpItems = [
      ['Pregunta orientadora', task.reasoning],
      ['Pista específica', task.hint],
      ['Primer paso', lesson.worked.steps[0]],
      ['Pauta completa', task.solution]
    ];
    return `<header class="org-section-head"><p class="eyebrow">DESAFÍO ESTRUCTURAL · SIN ALTERNATIVAS</p><h2>${escapeHtml(task.prompt)}</h2><p>Primero deja tu intento. La estructura se comprueba químicamente; el razonamiento se revisa con una pauta explícita, sin fingir que un detector de palabras lo entiende.</p></header>
      <div class="org-challenge-grid"><section class="org-panel"><p class="eyebrow">TU MOLÉCULA</p><div class="org-challenge-seed">${moleculeCard(lesson.molecules[0])}</div><div class="org-editor-actions"><button class="primary-btn" data-org-editor="${escapeHtml(lesson.id)}">Abrir editor de moléculas</button><span>Editor Ketcher, solo cuando lo abres.</span></div>
      <label class="field"><span>Estructura capturada del editor (SMILES)</span><input type="text" data-org-field="smiles" value="${escapeHtml(p.smiles || '')}" placeholder="Puedes dibujar arriba o pegar SMILES" spellcheck="false"></label>
      <label class="field"><span>Tu razonamiento, o exactamente dónde te trabaste</span><textarea data-org-field="reasoning" rows="7" placeholder="Primero identifiqué…; la flecha sale de…; se rompe…; comprobé carga y átomos…">${escapeHtml(p.reasoning || '')}</textarea></label>
      <button class="primary-btn" data-org-check="${escapeHtml(lesson.id)}" ${(p.smiles || '').trim() && (p.reasoning || '').trim() ? '' : 'disabled'}>Comprobar estructura</button>
      ${checked ? `<div class="org-feedback ${p.check.correct ? 'ok' : 'needs-work'}"><strong>${p.check.correct ? 'La conectividad coincide con el producto esperado' : 'La estructura todavía no coincide'}</strong><p>${escapeHtml(p.check.message)}</p>${p.check.correct ? '<p>Eso verifica la molécula, no tus flechas ni tu justificación. Compáralas con la pauta de abajo.</p>' : `<p>Primer error a investigar: ${escapeHtml(task.error)}</p>`}</div>` : ''}
      </section><aside class="org-panel org-help"><p class="eyebrow">AYUDA EN ESCALONES</p><h3>Abre solo lo que necesitas</h3><p>Si no sabes resolverlo, escribir el bloqueo también sirve: localiza el primer eslabón que falta y vuelve a intentarlo.</p>${helpItems.map(([label,text],index) => `<div class="org-help-step"><button class="secondary-btn" data-org-help="${index+1}">${index < help ? '✓' : '＋'} ${escapeHtml(label)}</button>${index < help ? `<p>${escapeHtml(text)}</p>` : ''}</div>`).join('')}
      <div class="org-rubric"><h3>Pauta para revisar tu razonamiento</h3>${checked ? `<ul>${task.rubric.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul><label class="field"><span>¿Cuál fue el primer error real?</span><textarea data-org-field="reflection" rows="4" placeholder="Yo pensé…; falla porque…; la corrección es…">${escapeHtml(p.reflection || '')}</textarea></label><button class="secondary-btn" data-org-error="${escapeHtml(lesson.id)}" ${(p.reflection || '').trim() ? '' : 'disabled'}>Guardar en mis errores</button>` : '<p>La pauta se abre después de tu intento y la comprobación.</p>'}</div></aside></div>`;
  }
  function renderTransfer(lesson, p) {
    const reviewed = Boolean(p.transferRevealed);
    const delayed = p.firstAttemptAt && today() > p.firstAttemptAt && p.reviewStartedAt === today() && p.check?.correct && p.check.checkedAt === today() && (p.help || 0) < 2;
    return `<header class="org-section-head"><p class="eyebrow">TRANSFERENCIA · CASO NUEVO</p><h2>${escapeHtml(lesson.transfer.prompt)}</h2><p>Esta pregunta modifica la situación. Si solo reconoces una frase de la lectura, aún no has transferido el modelo.</p>${p.firstAttemptAt && p.firstAttemptAt < today() && p.reviewStartedAt !== today() ? '<button class="secondary-btn org-review-start" data-org-start-review>Iniciar repaso sin mirar</button>' : ''}</header>
      <section class="org-panel"><label class="field"><span>Responde y justifica desde el mecanismo</span><textarea data-org-field="transferDraft" rows="9" placeholder="Parto de…; si cambio… predigo… porque…; lo comprobaría con…">${escapeHtml(p.transferDraft || '')}</textarea></label><button class="primary-btn" data-org-reveal="${escapeHtml(lesson.id)}" ${(p.transferDraft || '').trim() ? '' : 'disabled'}>Cerrar intento y ver pauta</button>
      ${reviewed ? `<div class="org-transfer-answer"><p class="eyebrow">PAUTA EXPLICADA</p><p>${escapeHtml(lesson.transfer.answer)}</p><h3>Comprueba tres evidencias</h3><ol>${lesson.transfer.check.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ol></div><label class="field"><span>Qué sostendrías o corregirías en tu respuesta</span><textarea data-org-field="transferReflection" rows="5">${escapeHtml(p.transferReflection || '')}</textarea></label><p class="org-honesty">La aplicación no interpreta automáticamente tu explicación libre. Usa la pauta con honestidad; si hay una duda, llévala al registro de errores o a tu tutor.</p>${delayed && p.check?.correct ? `<button class="primary-btn" data-org-mastered="${escapeHtml(lesson.id)}" ${(p.transferReflection || '').trim() ? '' : 'disabled'}>Marcar dominio autoverificado</button>` : '<p class="org-review-note">Para dominio: vuelve otro día, resuelve la estructura sin pista fuerte y contrasta este caso de transferencia. Hoy queda «en práctica».</p>'}` : ''}</section>`;
  }
  function renderSource(lesson) {
    return `<header class="org-section-head"><p class="eyebrow">MATERIAL DE CÁTEDRA</p><h2>${escapeHtml(lesson.source.lecture)}</h2><p>Referencia de esta clase: ${escapeHtml(lesson.source.pages)} · ${escapeHtml(lesson.source.guide)}. El PDF de Classroom no se publica ni se sube: lo eliges desde tu dispositivo y queda solo en memoria mientras esta página está abierta.</p></header>
      <section class="org-panel org-source-panel"><label class="org-file-button">Elegir PDF de tu computador<input type="file" accept="application/pdf" data-org-pdf hidden></label><span id="orgPdfFilename">${escapeHtml(pdfFilename || 'Ningún PDF abierto')}</span><div class="org-pdf-toolbar"><button class="secondary-btn" data-org-pdf-prev ${pdfDocument && pdfPage > 1 ? '' : 'disabled'}>← Anterior</button><span id="orgPdfPageLabel">${pdfDocument ? `${pdfPage} / ${pdfDocument.numPages}` : '— / —'}</span><button class="secondary-btn" data-org-pdf-next ${pdfDocument && pdfPage < pdfDocument.numPages ? '' : 'disabled'}>Siguiente →</button><label>Página <input type="number" min="1" max="${pdfDocument?.numPages || 1}" value="${pdfPage}" data-org-pdf-page ${pdfDocument ? '' : 'disabled'}></label></div><div class="org-pdf-viewport"><canvas id="orgPdfCanvas" aria-label="Página del PDF seleccionado"></canvas><p id="orgPdfStatus">${pdfDocument ? 'Cargando página…' : 'Selecciona el archivo oficial para verlo junto a la clase.'}</p></div></section>`;
  }

  function loadRdkit() {
    if (rdkitPromise) return rdkitPromise;
    rdkitPromise = new Promise((resolve, reject) => {
      if (window.initRDKitModule) return resolve(window.initRDKitModule({ locateFile: () => './vendor/rdkit/RDKit_minimal.wasm' }));
      const script = document.createElement('script');
      script.src = './vendor/rdkit/RDKit_minimal.js';
      script.onload = () => window.initRDKitModule({ locateFile: () => './vendor/rdkit/RDKit_minimal.wasm' }).then(resolve, reject);
      script.onerror = () => reject(new Error('No se pudo cargar RDKit.js. Revisa la conexión o recarga.'));
      document.head.appendChild(script);
    }).catch(error => { rdkitPromise = null; throw error; });
    return rdkitPromise;
  }
  async function hydrateMolecules(root) {
    const nodes = [...root.querySelectorAll('[data-org-smiles]')];
    if (!nodes.length) return;
    let rdkit;
    try { rdkit = await loadRdkit(); }
    catch (error) { nodes.forEach(node => { node.textContent = `Estructura no disponible · ${node.dataset.orgSmiles}`; }); return; }
    for (const node of nodes) {
      if (!node.isConnected || node.dataset.hydrated) continue;
      let mol;
      try {
        mol = rdkit.get_mol(node.dataset.orgSmiles);
        const svg = mol.get_svg(300, 180);
        const img = document.createElement('img');
        img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
        img.alt = `Estructura de ${node.closest('figure')?.querySelector('strong')?.textContent || 'molécula'}`;
        node.replaceChildren(img); node.dataset.hydrated = '1';
      } catch (_) { node.textContent = `No se pudo dibujar: ${node.dataset.orgSmiles}`; }
      finally { mol?.delete(); }
    }
  }
  async function canonical(smiles) {
    const rdkit = await loadRdkit();
    const mol = rdkit.get_mol(String(smiles || '').trim());
    try { return mol.get_smiles(); } finally { mol?.delete(); }
  }
  async function checkStructure(id) {
    const lesson = COURSE[id], p = progress(id), raw = String(p.smiles || '').trim();
    if (!raw || !String(p.reasoning || '').trim()) return;
    try {
      const actual = await canonical(raw);
      const expected = await Promise.all(lesson.task.accepted.map(canonical));
      const correct = expected.includes(actual);
      p.check = { correct, actual, checkedAt: today(), message: correct ? 'Los átomos, enlaces y cargas que reconoce RDKit coinciden con el producto esperado.' : 'Revisa primero átomos, posición del enlace nuevo, carga y grupo saliente. Si crees que hay un equivalente válido, consúltalo: la comparación automática no entiende todos los contextos.' };
      p.firstAttemptAt = p.firstAttemptAt || today();
      if (p.status !== 'dominado') p.status = 'inestable';
      p.dueAt = plusDays(today(), 2);
      const state = bridge.getState();
      state.mastery[id] = { ...(state.mastery[id] || {}), status: 'inestable', understoodAt: p.firstAttemptAt, dueAt: p.dueAt, source: 'organic-studio' };
      if (!correct) recordError(id, lesson.task.error, `Estructura enviada: ${raw}`, false);
      persist(); renderCurrent();
    } catch (_) {
      p.check = { correct: false, message: 'No se pudo interpretar esta estructura. Revisa que el dibujo tenga valencias válidas o usa el editor para capturarla de nuevo.' };
      persist(); renderCurrent();
    }
  }
  function recordError(id, diagnosis, observable, notify = true) {
    const state = bridge.getState();
    state.errors.unshift({ id: `organic-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, date: today(), subject: 'organica', lessonId: id, blocker: 'structure', observable, reasoning: progress(id).reasoning || '', diagnosis, status: 'open', dueAt: plusDays(today(), 1), source: 'organic-studio' });
    persist();
    if (notify) bridge.showToast('Error guardado para revisarlo y volver a intentar.');
  }
  function openEditor(id) {
    const lesson = COURSE[id], p = progress(id);
    bridge.openModal({ title: 'Dibuja tu molécula', body: `<div class="org-editor-status" id="orgEditorStatus">Cargando editor químico…</div><iframe class="org-editor-frame" id="orgEditorFrame" title="Editor molecular Ketcher" src="./vendor/ketcher/index.html"></iframe><p class="microcopy">Dibuja el producto. Al aceptarlo, guardaremos su estructura para compararla; tu justificación se escribe en la clase.</p>`, confirmLabel: 'Usar este dibujo', cancelLabel: 'Cancelar', tone: 'organic-editor-modal', onConfirm: async () => {
      const frame = document.getElementById('orgEditorFrame');
      const status = document.getElementById('orgEditorStatus');
      const ketcher = frame?.contentWindow?.ketcher;
      if (!ketcher) { if (status) status.textContent = 'El editor aún está cargando. Espera unos segundos.'; return; }
      try {
        const smiles = await ketcher.getSmiles();
        if (!smiles) { if (status) status.textContent = 'El lienzo está vacío. Dibuja una estructura antes de aceptar.'; return; }
        p.smiles = smiles; p.check = null; persist();
        activeEditorFrame = null; activeEditorId = null;
        bridge.closeModal(); renderCurrent();
      } catch (_) { if (status) status.textContent = 'No pude leer el dibujo. Prueba a simplificarlo o vuelve a abrir el editor.'; }
    } });
    activeEditorFrame = document.getElementById('orgEditorFrame'); activeEditorId = id;
    const seed = p.smiles || lesson.task.seed;
    let tries = 0;
    const waitForEditor = window.setInterval(async () => {
      if (!activeEditorFrame?.isConnected || activeEditorId !== id) return window.clearInterval(waitForEditor);
      const ketcher = activeEditorFrame.contentWindow?.ketcher;
      if (!ketcher && ++tries < 300) return;
      window.clearInterval(waitForEditor);
      const status = document.getElementById('orgEditorStatus');
      if (!ketcher) { if (status) status.textContent = 'No se pudo iniciar el editor. Recarga la página e inténtalo de nuevo.'; return; }
      try { await ketcher.setMolecule(seed); if (status) status.textContent = 'Editor listo: modifica el reactivo hasta obtener el producto.'; }
      catch (_) { if (status) status.textContent = 'Editor listo. Dibuja el producto desde cero.'; }
    }, 100);
  }

  async function openPdf(file) {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) return bridge.showToast('Elige un archivo PDF.');
    const status = document.getElementById('orgPdfStatus');
    if (status) status.textContent = 'Abriendo PDF…';
    try {
      pdfModulePromise = pdfModulePromise || import('./vendor/pdfjs/pdf.min.mjs');
      const pdfjs = await pdfModulePromise;
      pdfjs.GlobalWorkerOptions.workerSrc = new URL('./vendor/pdfjs/pdf.worker.min.mjs', location.href).href;
      const bytes = new Uint8Array(await file.arrayBuffer());
      const next = await pdfjs.getDocument({ data: bytes, useSystemFonts: true }).promise;
      if (pdfDocument) await pdfDocument.destroy();
      pdfDocument = next; pdfFilename = file.name; pdfPage = 1;
      renderCurrent();
    } catch (error) {
      console.error('No se pudo abrir PDF local', error);
      if (status) status.textContent = 'No pude abrir este PDF. Comprueba que no esté dañado o protegido.';
    }
  }
  async function drawPdfPage() {
    const canvas = document.getElementById('orgPdfCanvas'), status = document.getElementById('orgPdfStatus');
    if (!canvas || !pdfDocument) return;
    try {
      if (pdfRenderTask) { pdfRenderTask.cancel(); pdfRenderTask = null; }
      const page = await pdfDocument.getPage(pdfPage);
      const viewport = page.getViewport({ scale: 1 });
      const width = Math.min(900, Math.max(280, canvas.parentElement.clientWidth - 24));
      const scale = width / viewport.width;
      const scaled = page.getViewport({ scale });
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(scaled.width * ratio); canvas.height = Math.floor(scaled.height * ratio);
      canvas.style.width = `${scaled.width}px`; canvas.style.height = `${scaled.height}px`;
      const context = canvas.getContext('2d');
      pdfRenderTask = page.render({ canvasContext: context, viewport: scaled, transform: ratio === 1 ? null : [ratio,0,0,ratio,0,0] });
      await pdfRenderTask.promise;
      if (status) status.textContent = '';
    } catch (error) {
      if (error?.name !== 'RenderingCancelledException' && status) status.textContent = 'No pude dibujar esta página.';
    } finally { pdfRenderTask = null; }
  }
  function pdfMove(amount) { if (!pdfDocument) return; pdfPage = Math.max(1, Math.min(pdfDocument.numPages, pdfPage + amount)); renderCurrent(); }

  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    const root = button?.closest('[data-org-studio]');
    if (!button || !root || !bridge) return;
    const id = root.dataset.orgStudio, p = progress(id);
    if (button.dataset.orgMode) { p.mode = button.dataset.orgMode; p.tab = initialTab[p.mode]; persist(); renderCurrent(); return; }
    if (button.dataset.orgStartReview !== undefined) {
      if (!p.firstAttemptAt || p.firstAttemptAt >= today()) return;
      p.reviewStartedAt = today(); p.smiles = ''; p.reasoning = ''; p.check = null; p.help = 0; p.transferDraft = ''; p.transferRevealed = false; p.transferReflection = ''; p.tab = 'challenge'; p.mode = 'mastery'; persist(); renderCurrent(); return;
    }
    if (button.dataset.orgTab) { p.tab = button.dataset.orgTab; persist(); renderCurrent(); return; }
    if (button.dataset.orgEditor) { openEditor(id); return; }
    if (button.dataset.orgHelp) { p.help = Math.max(Number(p.help) || 0, Number(button.dataset.orgHelp)); persist(); renderCurrent(); return; }
    if (button.dataset.orgCheck) { checkStructure(id); return; }
    if (button.dataset.orgError) { recordError(id, p.reflection || COURSE[id].task.error, `Reflexión: ${p.reflection || ''}`); return; }
    if (button.dataset.orgReveal) { p.transferRevealed = true; persist(); renderCurrent(); return; }
    if (button.dataset.orgMastered) {
      if (!p.check?.correct || !p.firstAttemptAt || today() <= p.firstAttemptAt || p.reviewStartedAt !== today() || p.check.checkedAt !== today() || (p.help || 0) >= 2 || !String(p.transferReflection || '').trim()) return;
      p.status = 'dominado'; p.masteredAt = today(); p.dueAt = null;
      const state = bridge.getState();
      state.mastery[id] = { ...(state.mastery[id] || {}), status: 'dominado', dueAt: null, source: 'organic-studio', selfVerified: true };
      persist(); bridge.showToast('Dominio autoverificado: conserva una variante futura sin ayuda.'); renderCurrent(); return;
    }
    if (button.dataset.orgPdfPrev !== undefined) return pdfMove(-1);
    if (button.dataset.orgPdfNext !== undefined) return pdfMove(1);
  });
  document.addEventListener('input', event => {
    const field = event.target.dataset.orgField;
    const root = event.target.closest('[data-org-studio]');
    if (!root || !field || !bridge) return;
    const p = progress(root.dataset.orgStudio);
    p[field] = event.target.value;
    if (field === 'smiles' || field === 'reasoning') { p.check = null; const check = root.querySelector('[data-org-check]'); if (check) check.disabled = !String(p.smiles || '').trim() || !String(p.reasoning || '').trim(); }
    if (field === 'reflection') { const button = root.querySelector('[data-org-error]'); if (button) button.disabled = !String(p.reflection || '').trim(); }
    if (field === 'transferDraft') { const button = root.querySelector('[data-org-reveal]'); if (button) button.disabled = !String(p.transferDraft || '').trim(); }
    if (field === 'transferReflection') { const button = root.querySelector('[data-org-mastered]'); if (button) button.disabled = !String(p.transferReflection || '').trim(); }
    persist();
  });
  document.addEventListener('change', event => {
    const root = event.target.closest('[data-org-studio]');
    if (!root || !bridge) return;
    if (event.target.dataset.orgPdf !== undefined) return openPdf(event.target.files?.[0]);
    if (event.target.dataset.orgPdfPage !== undefined && pdfDocument) { pdfPage = Math.max(1, Math.min(pdfDocument.numPages, Number(event.target.value) || 1)); renderCurrent(); }
  });

  window.NexoOrganicStudio = { render, course: COURSE, canonical };
})();
