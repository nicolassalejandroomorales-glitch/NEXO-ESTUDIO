/* Primera clase piloto de Orgánica II: contenido y corrección honesta, sin editor obligatorio. */
(() => {
  'use strict';
  const ID = 'org-01';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const dayKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const today = () => dayKey(new Date());
  let bridge = null;
  let pdfUrl = null;
  let pdfFilename = '';

  const problems = [
    {
      id: 'b01', level: 'Base', title: 'El H⁺ no reemplaza un átomo',
      prompt: 'CH₃NH₂ reacciona con HCl. Dibuja en tu cuaderno el producto nitrogenado y escribe aquí cuántos enlaces, pares libres y qué carga tiene el N antes y después. ¿Dónde queda Cl?',
      hint: 'Cuenta los enlaces del N justo después de que su par forme N–H.',
      answer: 'CH₃NH₂ + HCl → CH₃NH₃⁺ + Cl⁻. Antes: N tiene tres enlaces y un par libre. Después: cuatro enlaces, ningún par disponible y carga +1. El enlace H–Cl entrega su par a Cl; Cl⁻ es contraión, no se une al carbono.',
      check: ['Dibujé el enlace N–H nuevo y el N con +.', 'Separé el contraión Cl⁻ de la especie orgánica.', 'La flecha hacia H sale del par de N.'],
      error: 'L-CARGA', repair: 'Redibuja etilamina → etilamonio y cuenta enlaces/carga antes de mirar una pauta.'
    },
    {
      id: 'b02', level: 'Base', title: 'Dos N en anillos, dos pares distintos',
      prompt: 'Sin usar solo los nombres: en piridina y pirrol, indica qué par de N forma parte de los 6 electrones π. Si protonas cada N, ¿qué anillo conserva su estabilización aromática?',
      hint: 'Piridina ya tiene tres enlaces π; pirrol solo tiene dos.',
      answer: 'Piridina: tres enlaces π aportan 6 e⁻; el par de N está fuera del circuito π. Protonar N usa ese par y conserva la aromaticidad. Pirrol: dos enlaces π aportan 4 e⁻ y el par de N los otros 2. Protonar ese N retira su par del circuito y sacrifica la aromaticidad del sistema neutro.',
      check: ['Conté 6 e⁻ π en ambos anillos neutros.', 'No sumé el par piridínico dos veces.', 'Expliqué qué cambia al protonar, no solo cuál es más básico.'],
      error: 'AR-PAR', repair: 'Marca uno a uno los electrones π de imidazol y señala cuál N usa un par externo.'
    },
    {
      id: 'b03', level: 'Intermedio', title: 'El CH₂ que cambia la comparación',
      prompt: 'Compara Ph–NH₂ y Ph–CH₂–NH₂. ¿Cuál es más básica en agua? Dibuja el camino de orbitales que tendría que recorrer el par de N para comunicarse con el anillo y justifica qué cambia al protonar.',
      hint: 'Busca si N toca directamente un carbono sp² del anillo o si hay un carbono sp³ entremedio.',
      answer: 'Bencilamina (Ph–CH₂–NH₂) > anilina (Ph–NH₂). En anilina el par de N se conjuga directamente con el anillo y estabiliza la base neutra; al formar anilinio esa donación desaparece. En bencilamina el CH₂ sp³ corta la conjugación directa. Importante: el benceno del anilinio sigue siendo aromático.',
      check: ['Dibujé correctamente N–anillo versus N–CH₂–anillo.', 'Comparé base neutra y ácido conjugado.', 'No afirmé que el benceno pierde aromaticidad.'],
      error: 'RES-CAMINO', repair: 'Prueba anilina frente a Ph–CH₂–CH₂–NH₂ sin mirar la respuesta.'
    },
    {
      id: 'b04', level: 'Intermedio', title: 'Un efecto compartido no decide el orden',
      prompt: 'Ordena de menor a mayor basicidad en condiciones acuosas comparables: anilina, p-nitroanilina y p-metoxianilina. Separa explícitamente el efecto común a las tres del que permite distinguirlas.',
      hint: 'Todas son anilinas: la conjugación N–anillo no decide por sí sola el orden entre ellas.',
      answer: 'p-nitroanilina < anilina < p-metoxianilina. Las tres tienen el par de N conjugado con el anillo: es un factor compartido. NO₂ en para retira densidad y debilita la basicidad; OCH₃ en para puede donar por resonancia y aumenta la basicidad frente a anilina. No basta decir que O es electronegativo: también hay un efecto mesomérico.',
      check: ['Di un orden y el medio de comparación.', 'Reconocí el factor común que no discrimina.', 'Consideré donación por resonancia de OCH₃ además de inducción.'],
      error: 'SUB-EFECTO', repair: 'Compara anilina y p-metoxianilina dibujando solo el camino de donación π.'
    },
    {
      id: 'b05', level: 'Transferencia', title: 'Un anillo con dos nitrógenos',
      prompt: 'Imidazol tiene un N–H de tipo pirrol y otro N sin H de tipo piridina. Señala cuál protonarías preferentemente y demuestra con un conteo de electrones π por qué no son equivalentes.',
      hint: 'Uno de los pares completa el sexteto; el otro puede formar N–H sin retirarlo.',
      answer: 'Se protona preferentemente el N sin H, de tipo piridina. Su par está fuera del sexteto aromático. El par del N–H de tipo pirrol contribuye 2 e⁻ al circuito π. En la forma protonada por el N piridínico se conserva el sistema aromático; no trates los dos N como equivalentes por estar en el mismo anillo.',
      check: ['Elegí el N sin H de tipo piridina.', 'Identifiqué el par que aporta 2 e⁻ π.', 'Usé la estabilidad del ácido conjugado en la justificación.'],
      error: 'AR-PAR', repair: 'Compara los dos N de otro dibujo de imidazol rotado: la posición en la página no debe cambiar la decisión.'
    },
    {
      id: 'b06', level: 'Transferencia', title: 'La palabra «aromático» no es una escala',
      prompt: 'Entre piperidina, piridina, anilina y pirrol, indica la más y la menos básica en agua. Luego explica por qué la frase «tiene un anillo aromático» no basta para ordenar piridina y anilina.',
      hint: 'Distingue N dentro del anillo y N unido por fuera; solo uno de esos pares puede sostener el sexteto.',
      answer: 'La piperidina saturada es la más básica y el N pirrólico, la menos básica del conjunto. Piridina y anilina tienen anillos aromáticos, pero en piridina el par de N es externo al sexteto y en anilina el par del N exocíclico se conjuga con el anillo. Para comparaciones finas se contrastan B y BH⁺ en el mismo medio; «aromática» no describe el papel del par.',
      check: ['Identifiqué los extremos sin convertirlos en regla universal.', 'Diferencié N endocíclico de exocíclico.', 'Describí el par, no solo el nombre del compuesto.'],
      error: 'AR-ABSOLUTO', repair: 'Explica en una frase distinta piridina/pirrol y anilina/bencilamina.'
    },
    {
      id: 'b07', level: 'Tipo PEP', title: 'Cuatro estructuras, tres decisiones',
      prompt: 'Ordena en basicidad acuosa creciente: Ph–CH₂–NH₂, Ph–NH₂, p-O₂N–C₆H₄–NH₂ y p-CH₃O–C₆H₄–NH₂. Dibuja cada especie tras protonar N, con carga y H nuevo. Justifica cada paso entre vecinos del orden y explica por qué «todos tienen benceno» no es una justificación.',
      hint: 'Primero ordena las tres anilinas por lo que cambia en para. Después compara su N unido directamente al anillo con el N separado por CH₂ sp³.',
      answer: 'Orden creciente esperado: p-nitroanilina < anilina < p-metoxianilina < bencilamina, en condiciones acuosas comparables. En las tres anilinas, el par del N externo se conjuga con el anillo: al protonar cesa esa donación, pero el benceno sigue aromático. NO₂ en para retira densidad; OCH₃ en para puede donar por resonancia y eleva modestamente la basicidad frente a anilina. El CH₂ sp³ de bencilamina corta la conjugación directa y da una amina mucho más básica que las arilaminas del conjunto. Cada ácido conjugado debe mostrar el H nuevo y N con carga +; no cambies el esqueleto.',
      check: ['El orden integra el efecto de NO₂, la donación de OCH₃ y el CH₂ que corta conjugación.', 'Dibujé cuatro ácidos conjugados con el H y la carga correctos.', 'No afirmé que el benceno de una anilina deja de ser aromático.'],
      error: 'CRITERIOS-MEZCLADOS', repair: 'Ordena primero las tres anilinas entre sí. Luego compara p-metoxianilina con bencilamina: ¿qué cambia al intercalar CH₂?'
    },
    {
      id: 'b08', level: 'Tipo PEP', title: 'Equilibrio sin invertir el pKa',
      prompt: 'En el mismo disolvente, los ácidos conjugados de dos bases A y B tienen pKa 10,8 y 5,2, respectivamente. Ambas se enfrentan al ácido HX de pKa 7,0. Estima K para A + HX ⇌ AH⁺ + X⁻ y para B + HX ⇌ BH⁺ + X⁻. Identifica qué protonación se favorece y explica por qué no comparas el pKa de las bases neutras.',
      hint: 'Para cada reacción compara el pKa del ácido del producto con el pKa del ácido reactivo: log₁₀K ≈ diferencia.',
      answer: 'K_A ≈ 10^(10,8−7,0) = 10^3,8 ≈ 6,3×10³. K_B ≈ 10^(5,2−7,0) = 10^−1,8 ≈ 1,6×10⁻². La protonación de A se favorece; la de B no, en esas condiciones. Los pKa proporcionados corresponden a AH⁺ y BH⁺, no a A y B neutras. Es una estimación idealizada que requiere datos del mismo medio.',
      check: ['Identifiqué los ácidos de ambos lados.', 'Calculé el exponente con signo correcto.', 'No confundí pKa del ácido conjugado con pKa de la base neutra.'],
      error: 'PKA-SIGNO', repair: 'Repite con pKa(AH⁺)=9, pKa(HA)=6: predice K antes de usar calculadora.'
    },
    {
      id: 'b09', level: 'Dominio', title: 'Repara el primer eslabón falso',
      prompt: 'Un compañero afirma: «La anilina es menos básica que bencilamina porque, al protonar su N, el anillo bencénico deja de ser aromático». Identifica exactamente la primera premisa falsa, repárala y predice qué efecto tendría intercalar otro CH₂ entre anillo y N.',
      hint: 'No corrijas el orden si ese orden es razonable; corrige la causa.',
      answer: 'La primera premisa falsa es que el benceno pierde aromaticidad: mantiene sus 6 e⁻ π. Lo que se pierde al protonar anilina es la donación del par exocíclico de N al anillo. Bencilamina, y también fenetilamina con más carbonos sp³ de separación, no tienen ese camino de conjugación directa; se espera un N más parecido al de una amina alifática que al de anilina. No prometas una diferencia numérica exacta sin datos de medio.',
      check: ['Localicé el primer error causal, no solo el resultado.', 'Diferencié aromaticidad del anillo de conjugación exocíclica.', 'Transferí la idea a una estructura nueva.'],
      error: 'RES-ANILINIO', repair: 'Compara anilina y fenetilamina en un papel en blanco mañana.'
    },
    {
      id: 'b10', level: 'Intermedio', title: 'Retirar densidad sin tocar el anillo',
      prompt: 'Compara CH₃CH₂NH₂ y CF₃CH₂NH₂ en agua. Ambas son aminas primarias y ninguno de sus N se conjuga con un anillo. ¿Cuál esperarías más básica? ¿Por qué NO sería correcto decir que el par de N «resuena hacia F»?',
      hint: 'Entre CF₃ y N hay un carbono saturado. Piensa en polarización por enlaces σ y en cómo disminuye con la distancia.',
      answer: 'Se espera CH₃CH₂NH₂ más básica que CF₃CH₂NH₂. Los F del grupo CF₃ retiran densidad por efecto inductivo transmitido por enlaces σ; no existe un camino π continuo desde el par de N hacia F, por lo que no es resonancia. El efecto inductivo se atenúa al alejar el grupo atractor del N. Como siempre, el orden cualitativo se plantea para condiciones comparables.',
      check: ['Comparé moléculas de la misma familia antes de buscar el factor que cambia.', 'Llamé inductivo al efecto transmitido por σ, no resonancia.', 'Expliqué la importancia de la distancia al N.'],
      error: 'IND-RESONANCIA', repair: 'Dibuja CH₃CH₂NH₂ y CF₃CH₂NH₂, marca solo los enlaces σ entre CF₃ y N.'
    },
    {
      id: 'b11', level: 'Intermedio', title: 'Piridina no es pirrol, pero tampoco piperidina',
      prompt: 'Piperidina y piridina tienen N dentro de un anillo de seis miembros. ¿Cuál esperarías más básica en agua? Explica dónde está el par en cada una, qué significa que uno esté en un orbital sp² y qué error cometerías si dijeras «piridina es débil porque pierde aromaticidad».',
      hint: 'El par de piridina no integra el sexteto. La piperidina es saturada y su par está en un entorno sp³.',
      answer: 'Piperidina suele ser más básica que piridina en agua. En piperidina el N es una amina saturada con par localizado en un orbital de carácter sp³. En piridina el par está en un orbital sp² del plano: mayor carácter s tiende a retenerlo más cerca del núcleo; además importan el entorno electrónico y la estabilización de cada ácido conjugado. El par piridínico está fuera del sexteto, así que protonar N de piridina NO destruye su aromaticidad. La hibridación ayuda a explicar, pero no debe usarse como única prueba cuantitativa.',
      check: ['No sumé el par de piridina al sexteto.', 'Conecté mayor carácter s con un par más retenido.', 'Comparé las formas protonadas y no inventé pérdida de aromaticidad.'],
      error: 'HIB-ABSOLUTO', repair: 'Vuelve a comparar piridina y pirrol: ambos N pueden describirse como sp², pero sus pares no cumplen el mismo papel.'
    }
  ];

  const reviewProblems = [
    { id: 'variant', title: 'Variante sin apuntes', prompt: 'Compara piridina, N-metilpirrol y piperidina como bases frente a H⁺ en agua. Dibuja los tres N protonados. Ordena cualitativamente, identifica el par que integra un sexteto aromático y explica por qué la piridina no pierde su aromaticidad al protonarse.', hint: 'Cuenta el sexteto π de cada heterociclo antes de mirar el par libre.', answer: 'Orden cualitativo habitual: N-metilpirrol < piridina < piperidina. En N-metilpirrol, el par de N completa los 6 e⁻ π; usarlo para protonar N cuesta esa estabilización. En piridina, tres enlaces π ya suman 6 e⁻ y el par de N está fuera del circuito; protonar ese N conserva el sexteto. Piperidina es una amina saturada, sin costo aromático y suele ser la más básica. Los ácidos conjugados llevan un enlace N–H nuevo y carga positiva; la comparación fina depende del medio.', checks: ['Ordené y dibujé los tres ácidos conjugados con carga.', 'Conté el sexteto π en ambos heterociclos.', 'Expliqué por qué la piridina conserva la aromaticidad.'] },
    { id: 'transfer', title: 'Transferencia tipo PEP', prompt: 'Un compañero afirma que p-nitroanilina es más básica que bencilamina porque “ambas son aromáticas, pero NO₂ le da más electrones al N”. Refuta el primer eslabón falso, predice qué N se protona preferentemente en una mezcla equimolar con ácido limitado y explica qué conectividad y efectos electrónicos usaste. No basta escribir el orden.', hint: 'Distingue N unido al anillo de N unido a un CH₂; después analiza NO₂.', answer: 'El primer error es atribuir donación a NO₂: nitro retira densidad por efectos inductivo y mesomérico. Además, llamar aromáticas a ambas no ubica el par de N: en p-nitroanilina el par se conjuga directamente con el anillo, mientras en bencilamina el CH₂ sp³ corta esa conjugación. Bencilamina es la base más fuerte del par en agua comparable y se protona preferentemente si el ácido es limitante. En ambas especies protonadas el benceno conserva su sexteto. La predicción cualitativa no sustituye pKa medidos si se exige cuantificación.', checks: ['Localicé y corregí la primera premisa falsa sobre NO₂.', 'Dibujé el CH₂ que interrumpe conjugación y ambos ácidos conjugados.', 'Justifiqué la protonación preferente sin decir que el benceno pierde aromaticidad.'] }
  ];

  function stateFor() {
    const state = bridge.getState();
    state.organicProgress ||= {};
    const p = state.organicProgress[ID] ||= {};
    if (p.amineLessonVersion !== 1) {
      p.previousLessonStatus = p.status || 'pendiente';
      p.previousMastery = state.mastery?.[ID] || null;
      p.status = 'pendiente';
      p.amineLessonVersion = 1;
      state.mastery ||= {};
      state.mastery[ID] = { status: 'pendiente', source: 'amine-lesson' };
      save();
    }
    // Un estado antiguo no es evidencia de recuperación diferida.
    if (p.status === 'dominado' && !p.review?.completedAt) {
      p.status = p.firstAttemptAt ? 'inestable' : 'pendiente';
      state.mastery ||= {};
      state.mastery[ID] = { status: p.status, source: 'amine-lesson', dueAt: p.firstAttemptAt || null };
      save();
    }
    p.answers ||= {};
    p.revealed ||= {};
    p.assessments ||= {};
    p.hints ||= {};p.recordedAttemptIds ||= {};p.attemptVersions ||= {};
    p.logged ||= {};
    p.review ||= { answers: {}, revealed: {}, hinted: {}, verified: {} };
    p.review.answers ||= {}; p.review.revealed ||= {}; p.review.hinted ||= {}; p.review.verified ||= {};
    return p;
  }
  function save() { bridge.saveState({ backup: false }); }
  function conceptsPanel() {
    const engine=window.NexoAcademicEngine;if(!engine)return '';
    const state=bridge.getState(),model=engine.model;
    const review=state.academicIntelligence?.reviewSchedules||[];
    const due=window.NexoAcademicReviews?.due(review,new Date(),state.mastery||[])||[];
    const diagnoses=engine.diagnoses(state);
    const activeDiagnostic=state.organicProgress?.[ID]?.activeDiagnostic;
    const errors=(state.academicIntelligence?.structuredErrors||[]).slice(0,8);
    return `<details class="academic-concepts"><summary data-amine-concepts-open>Conceptos y próximos repasos</summary>
      <div class="academic-concept-list">${model.concepts.map(item=>{
        const status=engine.knowledgeFor(state,item.id),required=engine.graph.direct(item.id).filter(x=>x.strength==='required');
        const scheduled=review.find(x=>x.id===`concept:${item.id}`);
        const sources=window.NexoSources.sourcesFor(model,state.academicIntelligence.userSources,item.id);
        return `<article><h3>${esc(item.title)}</h3><p>${esc(status.label)} · ${esc(item.description)}</p>
          ${required.length?`<small>Depende de: ${required.map(x=>esc(model.byId(model.concepts,x.from)?.title||x.from)).join(', ')}</small>`:''}
          ${scheduled?`<small>Próximo repaso: ${esc(new Intl.DateTimeFormat('es-CL',{dateStyle:'medium'}).format(new Date(scheduled.dueAt)))}</small>`:''}
          ${sources.length?`<small>Fuentes: ${sources.map(x=>x.url?`<a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer" data-source-open="${esc(x.id)}">${esc(x.title)}</a>`:esc(x.title)).join(' · ')}</small>`:''}</article>`;
      }).join('')}</div>
      <p>Revisiones para hoy: ${due.length}. ${due.length?'Vuelve a los ejercicios vinculados sin usar pistas.':'No hay una tarjeta V14 vencida.'}</p>
      ${diagnoses.map(item=>{
        const checks=[],seen=new Set();
        for(const exercise of model.exercises)if(/^org-01:sv-/.test(exercise.id)&&
          engine.graph.ancestors(exercise.conceptIds[0],'required').includes(item.conceptId)&&
          !state.organicProgress?.[ID]?.structured?.[exercise.id.split(':')[1]]?.attempts&&
          !seen.has(exercise.familyId)) {seen.add(exercise.familyId);checks.push(exercise.id.split(':')[1]);}
        return `<div class="academic-suspicion"><p>${esc(item.status==='confirmed'?'Prerequisito confirmado por comprobación':item.status==='not_confirmed'?'Comprobación no confirmó debilidad':'Posible prerequisito débil')}: ${esc(item.reason)}</p>
          ${item.status==='possible'&&checks.length>=2?`<button type="button" data-amine-diagnostic="${esc(item.conceptId)}" data-diagnostic-exercises="${esc(checks.slice(0,2).join(','))}">Comprobar con dos casos nuevos</button>`:''}
          ${item.status==='confirmed'?`<button type="button" data-route="rescue" data-route-sub="${esc(item.conceptId)}">Abrir Rescate</button>`:''}
          ${item.status==='possible'&&checks.length<2?'<small>Faltan variantes no vistas para confirmar esta hipótesis; no la tratamos como diagnóstico.</small>':''}</div>`;
      }).join('')}
      ${activeDiagnostic?`<p>Comprobación de ${esc(model.byId(model.concepts,activeDiagnostic)?.title||activeDiagnostic)}: responde sin pista en dos familias distintas. Un resultado aislado no confirma nada.</p>`:''}
      ${errors.length?`<section><h3>Errores estructurados</h3><div class="academic-error-list">${errors.map(item=>`<div>
        <span>${esc(item.exerciseId)} · ${esc(model.byId(model.concepts,item.conceptId)?.title||item.conceptId)} · ${esc(model.byId(model.families,item.familyId)?.id||item.familyId)}</span>
        <small>${esc(item.at?.slice(0,10)||'')} · ${esc(item.status)}</small>
        ${item.candidateMisconceptionId?'<small>Patrón por comprobar; no clasificado automáticamente.</small>':''}
        <button type="button" data-amine-error-state="${esc(item.id)}">${item.status==='pending'?'Marcar revisado':item.status==='reviewed'?'Marcar resuelto':'Reabrir'}</button></div>`).join('')}</div></section>`:''}
      <button type="button" data-route="library">Abrir Biblioteca</button></details>`;
  }
  function exercise(item, p) {
    const answer = p.answers[item.id] || '';
    const revealed = Boolean(p.revealed[item.id]);
    const assessed = p.assessments[item.id] || '';
    return `<section class="amine-exercise" id="amine-${item.id}" aria-labelledby="title-${item.id}">
      <div class="amine-exercise-top"><span>${esc(item.level)}</span><h3 id="title-${item.id}">${esc(item.title)}</h3></div>
      <p class="amine-question">${esc(item.prompt)}</p>
      <label for="draft-${item.id}">Tu intento o el punto exacto donde te trabaste</label>
      <textarea id="draft-${item.id}" data-amine-answer="${item.id}" rows="5" placeholder="Escribe el razonamiento; dibuja la estructura en tu cuaderno si hace falta.">${esc(answer)}</textarea>
      <div class="amine-exercise-actions"><button type="button" data-amine-hint="${item.id}" aria-expanded="false">Una pista</button><button type="button" class="amine-reveal" data-amine-reveal="${item.id}" ${answer.trim().length < 12 ? 'disabled' : ''}>Comparar con pauta</button></div>
      <p class="amine-hint" id="hint-${item.id}" hidden>${esc(item.hint)}</p>
      ${revealed ? `<div class="amine-answer"><h4>Pauta razonada</h4><p>${esc(item.answer)}</p><ul>${item.check.map(check => `<li>${esc(check)}</li>`).join('')}</ul></div>
      <div class="amine-assess" role="group" aria-label="Evalúa tu respuesta"><span>Después de comparar:</span>
      <button type="button" data-amine-assess="${item.id}" data-value="bien" aria-pressed="${assessed === 'bien'}">Pude explicarlo</button>
      <button type="button" data-amine-assess="${item.id}" data-value="parcial" aria-pressed="${assessed === 'parcial'}">Me faltó algo</button>
      <button type="button" data-amine-assess="${item.id}" data-value="error" aria-pressed="${assessed === 'error'}">Me equivoqué</button></div>
      ${assessed && assessed !== 'bien' ? `<div class="amine-repair"><strong>Primer eslabón para revisar: ${esc(item.error)}</strong><p>${esc(item.repair)}</p><label for="reflection-${item.id}">¿Qué pensaste tú y qué corregirías?</label><textarea id="reflection-${item.id}" data-amine-reflection="${item.id}" rows="3">${esc(p.reflections?.[item.id] || '')}</textarea><button type="button" data-amine-log="${item.id}" ${(p.reflections?.[item.id] || '').trim().length < 8 || p.logged[item.id] ? 'disabled' : ''}>${p.logged[item.id] ? 'Error guardado' : 'Guardar error y repasar mañana'}</button></div>` : ''}` : ''}
    </section>`;
  }

  function reviewMarkup(p) {
    if (!p.firstAttemptAt) return '';
    if (p.status === 'dominado') return `<section class="amine-review" id="amine-review"><h2>Dominio revalidado</h2><p>Completaste la revisión diferida el ${esc(p.review.completedAt)}. Fue una autoevaluación con pauta, no una corrección automática de tus dibujos.</p></section>`;
    if (!window.NexoAmineMastery.eligible(p, today())) return `<section class="amine-review" id="amine-review"><h2>Revisión diferida</h2><p>Vuelve otro día para resolver una variante y un caso de transferencia sin mirar la clase. La comprensión de hoy permanece inestable hasta esa recuperación.</p></section>`;
    return `<section class="amine-review" id="amine-review"><p class="eyebrow">SIN MIRAR LA CLASE</p><h2>Revisión diferida</h2><p>Resuelve ambos casos en un día posterior. Dibuja en tu cuaderno y escribe la causa aquí. Una pauta no corrige automáticamente texto ni dibujos: marca cumplimiento solo si puedes defender cada criterio sin ayuda.</p>
      ${reviewProblems.map(item => { const r = p.review, revealed = Boolean(r.revealed[item.id]); return `<article class="amine-exercise" id="review-${item.id}"><div class="amine-exercise-top"><span>REVISIÓN</span><h3>${esc(item.title)}</h3></div><p class="amine-question">${esc(item.prompt)}</p><label for="review-answer-${item.id}">Tu razonamiento y estructuras dibujadas</label><textarea id="review-answer-${item.id}" data-amine-review-answer="${item.id}" rows="6">${esc(r.answers[item.id] || '')}</textarea><div class="amine-exercise-actions"><button type="button" data-amine-review-hint="${item.id}" aria-expanded="${Boolean(r.hinted[item.id])}">Pista (no cuenta para dominio)</button><button type="button" data-amine-review-reveal="${item.id}" ${(r.answers[item.id] || '').trim().length < 40 ? 'disabled' : ''}>Comparar con pauta</button></div>${r.hinted[item.id] ? `<p class="amine-hint">${esc(item.hint)}</p>` : ''}${revealed ? `<div class="amine-answer"><h4>Pauta razonada</h4><p>${esc(item.answer)}</p><ul>${item.checks.map(check => `<li>${esc(check)}</li>`).join('')}</ul></div>${item.checks.map((check, index) => `<label class="amine-review-check"><input type="checkbox" data-amine-review-verify="${item.id}" data-criterion="${index}" ${Array.isArray(r.verified[item.id]) && r.verified[item.id][index] ? 'checked' : ''} ${r.hinted[item.id] ? 'disabled' : ''}> ${esc(check)}</label>`).join('')}` : ''}</article>`; }).join('')}
      <button type="button" class="primary-btn" data-amine-review-complete ${window.NexoAmineMastery.canComplete(p, today()) ? '' : 'disabled'}>Registrar dominio autoverificado</button><p>Si usaste una pista o te faltó un criterio, conserva el estado inestable y reintenta sin ayuda otro día.</p></section>`;
  }

  function render(api) {
    bridge = api;
    const p = stateFor();
    const attempted = problems.filter(item => (p.answers[item.id] || '').trim().length >= 12).length;
    api.app.innerHTML = `<section class="page amine-lesson" data-amine-lesson>
      <button class="back-btn" data-open-subject="organica">← Orgánica II</button>
      <header class="amine-header"><div><p class="eyebrow">ORGÁNICA II · CLASE 1 · PEP 1</p><h1>¿Qué nitrógeno capta H⁺ y por qué?</h1><p class="amine-intro">Piperidina, piridina y pirrol tienen nitrógeno. Eso no significa que usen su par libre de la misma manera.</p><div class="amine-jumps"><button type="button" data-amine-jump="amine-start">Leer la clase</button><button type="button" data-amine-jump="amine-practice">Ir a ejercicios</button><button type="button" data-amine-jump="amine-slides">Abrir diapositivas</button></div></div><div class="amine-hero-mark" aria-hidden="true">N<span>:</span> → H⁺</div></header>
      <div class="amine-status" aria-live="polite"><span>Intentos escritos: <strong>${attempted} / ${problems.length}</strong></span><span>${p.status === 'dominado' ? 'Dominio autoverificado' : p.status === 'inestable' ? 'En práctica' : 'Sin evaluar'}</span></div>
      ${conceptsPanel()}
      <article class="amine-reading" id="amine-start">
        <p class="amine-lead">La pregunta de toda esta clase es <strong>qué estabilidad gana o pierde una molécula cuando el N utiliza su par para formar un enlace N–H</strong>. Con esa idea podrás abordar moléculas que no aparezcan dibujadas en la diapositiva.</p>
        <h2 data-study-concept="org.protonation">Primero, ¿qué hace una amina al captar H⁺?</h2>
        <p>Una amina neutra común tiene tres enlaces en N y un par de electrones no compartido. Puede donar ese par al protón de un ácido. Si el ácido es H–A, otra flecha mueve el par del enlace H–A hacia A. El esqueleto carbonado no cambia.</p>
        <div class="amine-equation" role="img" aria-label="La base B dona un par a H de H–A y se transforma en B–H positivo más A negativo"><span>B<strong>:</strong> + H–A</span><span aria-hidden="true">⇌</span><span>B–H<sup>+</sup> + A<sup>−</sup></span></div>
        <p>Un N que tenía tres enlaces y un par pasa a cuatro enlaces y carga positiva. Esto es <strong>protonación</strong>, no sustitución en el carbono. El producto B–H⁺ se llama <strong>ácido conjugado</strong> de B. Para comparar basicidad se suele usar el <em>pKa del ácido conjugado</em>: en un mismo medio, un B–H⁺ de pKa mayor corresponde generalmente a una base B más fuerte. Siempre nombra de qué especie es el pKa.</p>
        <p>Si B + HA ⇌ BH⁺ + A⁻ y dispones de pKa compatibles en el mismo medio, puedes estimar <strong>log₁₀K ≈ pKa(BH⁺) − pKa(HA)</strong>. Un resultado positivo favorece productos; uno negativo, reactivos. Esta cuenta no reemplaza el análisis estructural: lo comprueba y cuantifica.</p>
        <details class="amine-rescue"><summary>Si se te enredan los pares, las cargas o las flechas</summary><p>Un par libre son dos electrones que no forman un enlace. La flecha curva parte de ese par y llega al H. N tenía tres enlaces y un par; al usarlo para formar el cuarto enlace adquiere carga +. La flecha desde H–A termina en A porque ese enlace se rompe y A conserva sus electrones.</p></details>
        ${exercise(problems[0], p)}
        <h2 data-study-concept="org.aromatic-pair">La primera decisión: ¿ese par sostiene la aromaticidad?</h2>
        <p>Para que un anillo sea aromático importa un circuito continuo de orbitales p con 4n + 2 electrones π. No basta que sea un anillo o que tenga dobles enlaces. En <strong>piridina</strong>, los tres dobles enlaces ya aportan los seis electrones π; el par libre del N está orientado fuera de ese circuito. En <strong>pirrol</strong>, dos dobles enlaces aportan cuatro y el par del N aporta los otros dos. Ambos anillos neutros son aromáticos, pero sus pares cumplen funciones diferentes.</p>
        <figure class="amine-figure"><img src="./assets/lessons/par_piridina_pirrol.png" width="2489" height="1244" loading="lazy" alt="Comparación del par de nitrógeno en piridina y pirrol: fuera del sexteto frente a parte del sexteto aromático"><figcaption>Cuenta los electrones π antes de decidir. En piridina, marca el par externo; en pirrol, rodea el par que completa seis. <a href="./assets/lessons/par_piridina_pirrol.png" target="_blank" rel="noopener noreferrer">Ampliar figura</a></figcaption></figure>
        <p>Al protonar <em>el N</em> de piridina se usa el par externo y se conserva el sexteto del anillo. Al protonar el N de pirrol se compromete el par que completaba el sexteto aromático. Por eso, como base nitrogenada, <strong>piridina es mucho más básica que pirrol</strong>. Esta no es una regla de que «todo lo aromático es poco básico»; hay que mirar el <em>papel del par</em>.</p>
        ${exercise(problems[1], p)}
        <h2 data-study-concept="org.resonance">El mismo anillo, pero el N está afuera</h2>
        <p>Compara ahora <strong>anilina</strong> (Ph–NH₂) con <strong>bencilamina</strong> (Ph–CH₂–NH₂). En anilina, el N está unido directamente a un carbono del anillo: su par puede conjugarse con el sistema π, lo que estabiliza la base neutra. Cuando ese par forma N–H, ya no puede donar del mismo modo. <strong>El benceno sigue siendo aromático</strong>; se pierde la donación del par <em>externo</em>, no el sexteto del anillo.</p>
        <figure class="amine-figure"><img src="./assets/lessons/anilina_bencilamina.svg" width="1100" height="485" loading="lazy" alt="Anilina con el nitrógeno unido directamente al anillo; bencilamina con un grupo CH₂ que interrumpe la conjugación directa"><figcaption>Redibuja solo los dos caminos N–anillo. El CH₂ saturado de bencilamina interrumpe la conjugación directa. <a href="./assets/lessons/anilina_bencilamina.svg" target="_blank" rel="noopener noreferrer">Ampliar figura</a></figcaption></figure>
        <p>En bencilamina hay un carbono CH₂ saturado entre N y anillo. Ese carbono corta el camino de orbitales p; el par del N se parece más al de una amina alifática. Así se explica <strong>bencilamina &gt; anilina</strong> en basicidad acuosa habitual. No decidas por la presencia de un fenilo: decide por la <em>conectividad</em> y por la diferencia entre base y ácido conjugado.</p>
        <div class="amine-worked"><span>EJEMPLO RESUELTO</span><h3>Un solo CH₂ cambia la justificación</h3><ol><li>Dibujo Ph–NH₂ y Ph–CH₂–NH₂, con el par en cada N.</li><li>Busco un camino continuo de orbitales p desde el par al anillo. Solo lo hay directamente en anilina.</li><li>Protono ambos N. La anilina neutra pierde su donación exocíclica al transformarse en anilinio; el anillo bencénico mantiene seis electrones π.</li><li>Predigo bencilamina más básica, sin confundir la estabilización perdida con una pérdida de aromaticidad del benceno.</li></ol></div>
        ${exercise(problems[2], p)}
        <h2 data-study-concept="org.substituent">Cuando los dos N están conectados igual, mira qué cambia alrededor</h2>
        <p>Anilina, p-nitroanilina y p-metoxianilina comparten la conexión N–anillo y la conjugación del par. Ese factor explica su familia, pero <strong>no ordena por sí solo</strong> las tres. En posición para, NO₂ retira densidad electrónica; OCH₃ puede donar por resonancia a través del anillo aunque el oxígeno también tenga un efecto inductivo atractor. En condiciones comparables, la tendencia es <strong>p-nitroanilina &lt; anilina &lt; p-metoxianilina</strong>.</p>
        <div class="amine-worked"><span>SEGUNDO EJEMPLO</span><h3>No uses un factor común como si discriminara</h3><p>Las tres bases pierden la donación del par exocíclico al protonar N: ese costo es compartido. Ahora examino la diferencia: nitro retira y metoxi puede donar por resonancia desde para. Si digo «metoxi solo retira porque tiene O», he omitido un efecto decisivo.</p></div>
        ${exercise(problems[3], p)}
        <h2 data-study-concept="org.induction">Cuando no hay una resonancia decisiva: inducción, orbital y medio</h2>
        <p>Un grupo electronegativo puede retirar densidad a través de <strong>enlaces σ</strong>: eso es efecto <strong>inductivo</strong>, no resonancia. Disminuye al alejar el grupo del N. Por ejemplo, en CF₃–CH₂–NH₂, los F influyen en el N sin que exista un camino continuo de orbitales p entre ambos. En comparaciones de la misma familia, distinguir inducción de resonancia evita dibujar flechas imposibles.</p>
        ${exercise(problems[9], p)}
        <p>El <strong>orbital</strong> que aloja el par también importa. En la piperidina saturada, el N tiene un entorno aproximadamente sp³ y un par relativamente localizado. En piridina, el par está en un orbital sp² del plano del anillo; su mayor carácter s tiende a retener más la densidad cerca del núcleo. La piridina conserva su aromaticidad al protonar N, de modo que sería erróneo atribuir toda la diferencia piperidina–piridina a una pérdida de aromaticidad.</p>
        ${exercise(problems[10], p)}
        <p>En solución, la comparación nunca depende solo del par de la base neutra. También cuenta cómo el disolvente estabiliza B–H⁺. Sustituyentes voluminosos pueden dificultar el acercamiento del ácido o la hidratación del ion. Por eso contar grupos alquilo y concluir «tres siempre supera a dos» es inseguro en agua: <strong>donación electrónica, estorbo y solvatación pueden competir</strong>. No hay una tabla universal de «aromaticidad primero, luego inducción, luego estorbo»: decide qué efecto existe en las estructuras dadas y compruébalo con datos compatibles si el orden es fino.</p>
        <h2 data-study-concept="org.basicity">El puente con la clase de reacciones</h2>
        <p>El par de N que acepta H⁺ también puede atacar un carbono electrofílico en una alquilación. No confundas <strong>basicidad</strong> (equilibrio frente a H⁺) con <strong>nucleofilicidad</strong> (rapidez de ataque a otro centro). Una sal de amonio suele ser más soluble en agua, pero el N protonado ya no ofrece el mismo par para atacar. En la clase siguiente veremos por qué una alquilación puede continuar más allá del producto deseado.</p>
        <aside class="amine-notes"><div><h3>ANOTA</h3><p>B: + H–A ⇌ B–H⁺ + A⁻ con flechas y cargas; el circuito π de piridina/pirrol; anilina vs. bencilamina con el CH₂ que corta conjugación; tu primer error real.</p></div><div><h3>NO ANOTES</h3><p>Una lista de órdenes sin dibujar pares y ácidos conjugados; «aromaticidad siempre gana»; párrafos copiados de diapositivas; respuestas antes del intento.</p></div></aside>
      </article>
      <section class="amine-practice" id="amine-practice"><div class="amine-practice-heading"><p class="eyebrow">AHORA, SIN MIRAR ARRIBA</p><h2>Problemas nuevos</h2><p>Dibuja en cuaderno cuando corresponda y escribe la causa. La pauta se abre después de dejar un intento; el texto libre no se corrige automáticamente.</p></div>${problems.slice(4,9).map(item => exercise(item,p)).join('')}</section>
      <section class="amine-practice amine-structured" aria-label="Decisiones comprobables"><div class="amine-practice-heading"><h2>Comprueba tus decisiones</h2><p>Resuelve cada caso antes de comprobar. Se corrigen las opciones y cálculos; tu dibujo y tu explicación necesitan revisión propia o del profesor.</p></div>${window.NexoAcademicStructured?.render(api.getState())||''}</section>
      ${reviewMarkup(p)}
      <section class="amine-sources" id="amine-slides"><h2>Diapositivas de cátedra</h2><p>Si tienes el PDF en tu dispositivo, ábrelo aquí para contrastar la clase. Este archivo no se sube al sitio. Referencia: “Aminas” (2025), diapositiva 5 y diapositivas 17–27; Guía 1a de aminas (2021), ejercicio 4. La explicación de Nexo es original y estas fuentes no garantizan el temario exacto de la PEP 2026.</p><button type="button" class="amine-file" data-amine-pick-pdf>Elegir PDF</button><input type="file" accept="application/pdf" data-amine-pdf hidden><div class="amine-pdf" id="aminePdf" aria-live="polite"></div><p class="amine-source-link">Ampliación abierta: <a href="https://openstax.org/books/organic-chemistry/pages/24-3-basicity-of-amines" target="_blank" rel="noopener noreferrer">OpenStax §24.3</a>, <a href="https://openstax.org/books/organic-chemistry/pages/24-4-basicity-of-arylamines" target="_blank" rel="noopener noreferrer">§24.4</a> y <a href="https://openstax.org/books/organic-chemistry/pages/24-9-heterocyclic-amines" target="_blank" rel="noopener noreferrer">§24.9</a>.</p></section>
    </section>`;
    mountPdf();
    window.NexoActiveStudy?.begin('org.protonation','lesson');
    window.NexoActiveStudy?.watchHeadings(api.app);
    return true;
  }

  function mountPdf() {
    const host = document.getElementById('aminePdf');
    if (!host || !pdfUrl) return;
    const frame = document.createElement('iframe');
    frame.title = `Diapositivas: ${pdfFilename}`;
    frame.src = pdfUrl;
    host.replaceChildren(frame);
  }

  function focusExercise(id) {
    requestAnimationFrame(() => document.getElementById(`amine-${id}`)?.scrollIntoView({ block: 'start' }));
  }
  document.addEventListener('input', event => {
    const root = event.target.closest('[data-amine-lesson]');
    if (!root || !bridge) return;
    const reviewId = event.target.dataset.amineReviewAnswer;
    if (reviewId && reviewProblems.some(item => item.id === reviewId)) {
      const p = stateFor();
      if (!window.NexoAmineMastery.eligible(p, today())) return;
      p.review.answers[reviewId] = event.target.value;
      p.review.verified[reviewId] = false;
      save();
      const reveal = root.querySelector(`[data-amine-review-reveal="${reviewId}"]`);
      if (reveal) reveal.disabled = event.target.value.trim().length < 40;
      const complete = root.querySelector('[data-amine-review-complete]');
      if (complete) complete.disabled = true;
      return;
    }
    const id = event.target.dataset.amineAnswer;
    if (id) {
      const p = stateFor();
      if(p.recordedAttemptIds[id]&&p.answers[id]!==event.target.value){
        delete p.recordedAttemptIds[id];p.attemptVersions[id]=(p.attemptVersions[id]||1)+1;
        p.revealed[id]=false;delete p.assessments[id];
      }
      p.answers[id] = event.target.value;
      save();
      const button = root.querySelector(`[data-amine-reveal="${id}"]`);
      if (button) button.disabled = p.answers[id].trim().length < 12;
      const count = root.querySelector('.amine-status strong');
      if (count) count.textContent = `${problems.filter(item => (p.answers[item.id] || '').trim().length >= 12).length} / ${problems.length}`;
    }
    const reflection = event.target.dataset.amineReflection;
    if (reflection) {
      const p = stateFor(); p.reflections ||= {}; p.reflections[reflection] = event.target.value; save();
      const button = root.querySelector(`[data-amine-log="${reflection}"]`);
      if (button) button.disabled = event.target.value.trim().length < 8 || Boolean(p.logged[reflection]);
    }
  });
  document.addEventListener('click', event => {
    if(event.target.closest('[data-amine-lesson]')&&bridge) {
      const source=event.target.closest('[data-source-open]');
      if(source)bridge.track?.('source_opened',{source_id:source.dataset.sourceOpen});
      const summary=event.target.closest('[data-amine-concepts-open]');
      if(summary&&summary.parentElement?.tagName==='DETAILS'&&!summary.parentElement.open)
        bridge.track?.('concept_viewed',{concept_id:'org.basicity'});
    }
    const button = event.target.closest('button');
    if (!button?.closest('[data-amine-lesson]') || !bridge) return;
    if(button.dataset.amineDiagnostic) {
      const p=stateFor();p.activeDiagnostic=button.dataset.amineDiagnostic;
      p.diagnosticExerciseIds=(button.dataset.diagnosticExercises||'').split(',');
      save();bridge.renderRoute(false);return;
    }
    if(button.dataset.amineErrorState) {
      const item=bridge.getState().academicIntelligence.structuredErrors.find(x=>x.id===button.dataset.amineErrorState);
      if(item){item.status=item.status==='pending'?'reviewed':item.status==='reviewed'?'resolved':'pending';
        item.retestedAt=item.status==='resolved'?new Date().toISOString():null;
        item.resolvedAt=item.status==='resolved'?item.retestedAt:null;
        if(item.status==='resolved'&&item.misconceptionId) {
          bridge.track?.('misconception_resolved',{misconception_id:item.misconceptionId});
          window.NexoAcademicEngine?.emit('misconception_resolved',{
            attemptId:item.attemptId,misconceptionId:item.misconceptionId});
        }
        save();bridge.renderRoute(false);}
      return;
    }
    if (button.dataset.amineReviewHint) {
      const id = button.dataset.amineReviewHint, p = stateFor();
      if (!window.NexoAmineMastery.eligible(p, today())) return;
      p.review.hinted[id] = true; p.review.verified[id] = false;
      save(); bridge.renderRoute(false); document.getElementById(`review-${id}`)?.scrollIntoView({ block: 'start' }); return;
    }
    if (button.dataset.amineReviewReveal) {
      const id = button.dataset.amineReviewReveal, p = stateFor();
      if (!window.NexoAmineMastery.eligible(p, today()) || (p.review.answers[id] || '').trim().length < 40) return;
      p.review.revealed[id] = true;
      save(); bridge.renderRoute(false); document.getElementById(`review-${id}`)?.scrollIntoView({ block: 'start' }); return;
    }
    if (button.dataset.amineReviewComplete !== undefined) {
      const p = stateFor();
      if (!window.NexoAmineMastery.canComplete(p, today())) return;
      p.status = 'dominado'; p.review.completedAt = today();
      const state = bridge.getState();
      state.mastery ||= {};
      state.mastery[ID] = { status: 'dominado', source: 'amine-lesson', understoodAt: p.firstAttemptAt, reviewedAt: today(), evidence: 'variant-and-transfer-self-verified' };
      for(const id of ['variant','transfer'])window.NexoAcademicEngine?.recordAttempt({
        getState:bridge.getState,saveState:bridge.saveState,track:bridge.track},
        {id:`org-01:${id}:review:${today()}`,exerciseId:`org-01:${id}`,outcome:'correct',review:true,
          assistanceUsed:false,reasoningSupported:true})?.catch(()=>{});
      bridge.track?.('review_completed',{lesson_id:ID,concept_id:'org.basicity'});
      window.NexoAcademicEngine?.emit('review_completed',{attemptId:`org-01:review:${today()}`,conceptId:'org.basicity'});
      save(); bridge.renderRoute(false); bridge.showToast('Dominio autoverificado tras revisión diferida.'); return;
    }
    if (button.dataset.aminePickPdf !== undefined) {
      button.closest('[data-amine-lesson]')?.querySelector('[data-amine-pdf]')?.click();
      return;
    }
    if (button.dataset.amineJump) {
      document.getElementById(button.dataset.amineJump)?.scrollIntoView({ block: 'start', behavior: 'smooth' });
      return;
    }
    if (button.dataset.amineHint) {
      const hint = document.getElementById(`hint-${button.dataset.amineHint}`);
      if (hint) { hint.hidden = !hint.hidden; button.setAttribute('aria-expanded', String(!hint.hidden));
        const p=stateFor();p.hints[button.dataset.amineHint]=true;save();
        if(!hint.hidden)bridge.track?.('hint_requested',{exercise_id:`org-01:${button.dataset.amineHint}`}); }
      return;
    }
    if (button.dataset.amineReveal) {
      const id = button.dataset.amineReveal, p = stateFor();
      if ((p.answers[id] || '').trim().length < 12) return;
      p.revealed[id] = true;
      p.firstAttemptAt ||= today();
      if (p.status !== 'dominado') p.status = 'inestable';
      const state = bridge.getState();
      state.mastery ||= {};
      state.mastery[ID] = { status: 'inestable', source: 'amine-lesson', dueAt: p.firstAttemptAt };
      save(); bridge.renderRoute(false); focusExercise(id); return;
    }
    if (button.dataset.amineAssess) {
      const id = button.dataset.amineAssess, p = stateFor();
      if (!p.revealed[id]) return;
      if(p.recordedAttemptIds[id]&&p.assessments[id]!==button.dataset.value)
        return bridge.showToast('Modifica tu respuesta antes de registrar un nuevo intento.');
      p.assessments[id] = button.dataset.value;
      if(!p.recordedAttemptIds[id]&&window.NexoAcademicEngine){
        const attemptId=`org-01:${id}:self:${p.attemptVersions[id]||1}`;
        p.recordedAttemptIds[id]=attemptId;
        const item=problems.find(x=>x.id===id);
        const candidate=window.NexoAcademicEngine.model.misconceptions.find(x=>x.legacyCode===item?.error)?.id;
        window.NexoAcademicEngine.recordAttempt({getState:bridge.getState,
          saveState:bridge.saveState,track:bridge.track},{id:attemptId,exerciseId:`org-01:${id}`,
          outcome:button.dataset.value==='bien'?'correct':'incorrect',assistanceUsed:Boolean(p.hints[id]),
          attemptNumber:p.attemptVersions[id]||1,
          candidateMisconceptionId:button.dataset.value==='bien'?null:candidate,
          diagnostic:Boolean(p.activeDiagnostic&&p.diagnosticExerciseIds?.includes(id)&&!p.hints[id]),
          diagnosticConceptId:p.activeDiagnostic||null}).catch(()=>{});
      }
      save(); bridge.renderRoute(false); focusExercise(id); return;
    }
    if (button.dataset.amineLog) {
      const id = button.dataset.amineLog, p = stateFor();
      const reflection = (p.reflections?.[id] || '').trim();
      const item = problems.find(problem => problem.id === id);
      if (!item || reflection.length < 8 || p.logged[id]) return;
      const state = bridge.getState();
      state.errors ||= [];
      const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
      state.errors.unshift({ id: `amine-${Date.now()}-${id}`, date: today(), subject: 'organica', lessonId: ID, blocker: 'concept', observable: `${id.toUpperCase()}: ${item.title}`, reasoning: reflection, diagnosis: `${item.error}: ${item.repair}`, status: 'open', dueAt: dayKey(tomorrow), source: 'amine-lesson' });
      p.logged[id] = true; save(); bridge.showToast('Error guardado para revisar mañana.'); bridge.renderRoute(false); focusExercise(id);
    }
  });
  document.addEventListener('change', event => {
    if (event.target.matches('[data-amine-review-verify]')) {
      const id = event.target.dataset.amineReviewVerify, p = stateFor();
      if (!window.NexoAmineMastery.eligible(p, today()) || !p.review.revealed[id] || p.review.hinted[id]) { event.target.checked = false; return; }
      const criterion = Number(event.target.dataset.criterion);
      if (!Number.isInteger(criterion) || criterion < 0 || criterion > 2) return;
      if (!Array.isArray(p.review.verified[id])) p.review.verified[id] = [false, false, false];
      p.review.verified[id][criterion] = event.target.checked;
      save();
      const complete = document.querySelector('[data-amine-review-complete]');
      if (complete) complete.disabled = !window.NexoAmineMastery.canComplete(p, today());
      return;
    }
    if (!event.target.matches('[data-amine-pdf]')) return;
    const file = event.target.files?.[0], host = document.getElementById('aminePdf');
    if (!host) return;
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    host.replaceChildren();
    if (!file) return;
    if (file.type !== 'application/pdf') { host.textContent = 'Elige un archivo PDF.'; return; }
    pdfUrl = URL.createObjectURL(file);
    pdfFilename = file.name;
    mountPdf();
  });
  window.addEventListener('pagehide', () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); });
  window.NexoAmineLesson = { render };
})();
