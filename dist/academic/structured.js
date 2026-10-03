/* Curated, deterministic checks for org-01. Only discrete fields are graded. */
(() => {
  'use strict';
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const cases=[
    {id:'sv-protonation',title:'Cuenta antes de dibujar',prompt:'Metilamina reacciona con un equivalente de HCl. Decide el estado del nitrógeno en el producto y el destino del cloro. No cambies ningún enlace C–N.',
      fields:[
        {key:'bonds',label:'Enlaces del N en el producto',options:[['','Seleccionar'],['3','Tres'],['4','Cuatro'],['5','Cinco']],answer:'4',why:'El par libre forma el nuevo enlace N–H: el N termina con cuatro enlaces.'},
        {key:'charge',label:'Carga formal del N',options:[['','Seleccionar'],['0','Cero'],['+1','+1'],['-1','−1']],answer:'+1',why:'Al usar el par para enlazarse, el N de amonio tiene carga formal positiva.'},
        {key:'chloride',label:'Destino del Cl',options:[['','Seleccionar'],['carbon','Se une al carbono'],['counterion','Queda como Cl⁻ separado'],['lost','Desaparece']],answer:'counterion',why:'El par del enlace H–Cl queda en Cl; es contraión, no sustituyente del carbono.'}
      ],next:'Redibuja el producto completo: CH₃NH₃⁺ y Cl⁻, con la flecha desde el par de N.'},
    {id:'sv-heterocycle',title:'El par que sostiene el sexteto',prompt:'En imidazol hay un N–H de tipo pirrol y otro N sin H de tipo piridina. Considera protonación en N y el circuito aromático.',
      fields:[
        {key:'site',label:'N preferente para captar H⁺',options:[['','Seleccionar'],['nh','N–H pirrólico'],['no-h','N sin H piridínico'],['same','Ambos equivalentes']],answer:'no-h',why:'El N sin H ofrece un par fuera del sexteto; el par del N–H contribuye al circuito aromático.'},
        {key:'pi',label:'Electrones π del anillo neutro',options:[['','Seleccionar'],['4','Cuatro'],['6','Seis'],['8','Ocho']],answer:'6',why:'Dos enlaces π aportan cuatro electrones y el par pirrólico aporta otros dos.'},
        {key:'after',label:'Al protonar el N preferente',options:[['','Seleccionar'],['retained','Se conserva el sexteto'],['lost','Se pierde el sexteto'],['broken','Se abre el anillo']],answer:'retained',why:'El par piridínico está fuera del circuito; usarlo no retira los seis electrones π.'}
      ],next:'Explica en voz alta por qué el N–H del mismo anillo no es equivalente.'},
    {id:'sv-resonance',title:'¿Por dónde viaja el par?',prompt:'Compara anilina (Ph–NH₂) y bencilamina (Ph–CH₂–NH₂) en agua. Mira la conectividad antes de usar la palabra «resonancia».',
      fields:[
        {key:'stronger',label:'Base más fuerte de este par',options:[['','Seleccionar'],['aniline','Anilina'],['benzyl','Bencilamina'],['equal','No cambia']],answer:'benzyl',why:'El CH₂ sp³ de bencilamina corta la conjugación directa del par con el anillo.'},
        {key:'conjugates',label:'Par de N conjugado directamente con el anillo',options:[['','Seleccionar'],['both','Ambas'],['aniline','Solo anilina'],['benzyl','Solo bencilamina']],answer:'aniline',why:'En anilina N toca un carbono sp²; en bencilamina se interpone CH₂ sp³.'},
        {key:'benzene',label:'Al protonar anilina, el benceno',options:[['','Seleccionar'],['lost','Pierde aromaticidad'],['retained','Sigue aromático'],['reduced','Se reduce']],answer:'retained',why:'Se pierde la donación del par exocíclico, no el sexteto propio del benceno.'}
      ],next:'Dibuja Ph–NH₃⁺ y Ph–CH₂–NH₃⁺ sin modificar el anillo.'},
    {id:'sv-induction',title:'Retirar densidad sin resonancia',prompt:'Compara CH₃CH₂NH₂ y CF₃CH₂NH₂. Entre CF₃ y N hay un carbono saturado.',
      fields:[
        {key:'stronger',label:'Base más fuerte esperada',options:[['','Seleccionar'],['ethyl','CH₃CH₂NH₂'],['trifluoro','CF₃CH₂NH₂'],['same','Iguales']],answer:'ethyl',why:'CF₃ retira densidad y desfavorece la disponibilidad del par de N.'},
        {key:'path',label:'Vía principal del efecto de CF₃',options:[['','Seleccionar'],['sigma','Enlaces σ: inducción'],['pi','Sistema π: resonancia'],['aromatic','Aromaticidad']],answer:'sigma',why:'No hay camino continuo de orbitales p; el efecto se transmite por enlaces σ.'},
        {key:'distance',label:'Si alejas CF₃ un CH₂ más del N',options:[['','Seleccionar'],['weaker','Su efecto inductivo se atenúa'],['stronger','Su efecto inductivo aumenta'],['same','No cambia']],answer:'weaker',why:'La polarización inductiva se debilita con la distancia.'}
      ],next:'Dibuja el camino de enlaces σ desde CF₃ hasta N y no una flecha de resonancia.'},
    {id:'sv-pka',title:'Caso cuantitativo tipo PEP',prompt:'En un mismo medio: pKa(AH⁺)=9,1; pKa(BH⁺)=5,4; pKa(HX)=6,8. Para cada base + HX ⇌ ácido conjugado + X⁻, estima log₁₀K y decide cuál protonación se favorece.',
      fields:[
        {key:'logA',label:'log₁₀K para A',type:'number',answer:2.3,why:'Resta pKa(AH⁺) − pKa(HX): 9,1 − 6,8 = +2,3.'},
        {key:'logB',label:'log₁₀K para B',type:'number',answer:-1.4,why:'Resta pKa(BH⁺) − pKa(HX): 5,4 − 6,8 = −1,4.'},
        {key:'favored',label:'Protonación favorecida',options:[['','Seleccionar'],['A','A'],['B','B'],['both','Ambas por igual']],answer:'A',why:'K_A≈10²·³>1; K_B≈10⁻¹·⁴<1. La protonación de A es favorable.'}
      ],next:'Convierte ambos log₁₀K a K aproximados y nombra cuál especie es el ácido en cada lado.'},
    {id:'sv-pep-order',title:'Orden integrado de cuatro bases',prompt:'En agua y en condiciones comparables, ordena p-nitroanilina, anilina, p-metoxianilina y bencilamina. Justifica cada salto según la conectividad y el sustituyente; no uses «aromático» como criterio único.',
      fields:[
        {key:'order',label:'Orden de menor a mayor basicidad',options:[['','Seleccionar'],['n-a-m-b','p-NO₂-anilina < anilina < p-OCH₃-anilina < bencilamina'],['a-n-b-m','anilina < p-NO₂-anilina < bencilamina < p-OCH₃-anilina'],['n-m-a-b','p-NO₂-anilina < p-OCH₃-anilina < anilina < bencilamina']],answer:'n-a-m-b',why:'NO₂ retira densidad; OCH₃ en para puede donar por resonancia; CH₂ sp³ separa el N de bencilamina del anillo.'},
        {key:'shared',label:'Efecto compartido por las tres anilinas',options:[['','Seleccionar'],['direct','Par de N conjugado directamente con el anillo'],['sp3','CH₂ sp³ entre N y anillo'],['none','Ninguno']],answer:'direct',why:'Todas las anilinas unen N directamente a un C sp² del anillo; ese efecto común no decide su orden interno.'},
        {key:'benzyl',label:'Qué distingue a bencilamina',options:[['','Seleccionar'],['sp3','CH₂ sp³ interrumpe conjugación directa'],['aromatic-lost','Pierde aromaticidad al protonar'],['no-pair','No tiene par libre']],answer:'sp3',why:'El N de bencilamina no está conjugado directamente con el benceno; protonar una anilina tampoco destruye el sexteto del benceno.'}
      ],next:'Dibuja los cuatro ácidos conjugados con el H nuevo y la carga + en N.'},
    {id:'sv-pep-hetero',title:'Tres anillos, tres destinos del par',prompt:'Compara piperidina, piridina y pirrol en agua. Predice los extremos de basicidad y el destino del sexteto π al protonar el N de piridina.',
      fields:[
        {key:'most',label:'Más básica del conjunto',options:[['','Seleccionar'],['piperidine','Piperidina'],['pyridine','Piridina'],['pyrrole','Pirrol']],answer:'piperidine',why:'El par de una amina alifática saturada está disponible; en estas condiciones supera al N piridínico y al pirrólico.'},
        {key:'least',label:'Menos básica del conjunto',options:[['','Seleccionar'],['piperidine','Piperidina'],['pyridine','Piridina'],['pyrrole','Pirrol']],answer:'pyrrole',why:'El par de N pirrólico aporta al sexteto aromático; usarlo para captar H⁺ sacrifica esa contribución.'},
        {key:'pyridinium',label:'Al formar piridinio',options:[['','Seleccionar'],['retained','Se conserva el sexteto aromático'],['lost','Desaparece el sexteto'],['opened','Se abre el anillo']],answer:'retained',why:'El par que protona piridina está fuera del sistema π; el anillo mantiene seis electrones π.'}
      ],next:'Dibuja un par orbital perpendicular al anillo y otro en el plano para contrastar pirrol y piridina.'}
  ];
  const byId=id=>cases.find(item=>item.id===id)||null;
  function misconception(id,field,answer) {
    if(id==='sv-protonation'&&field==='charge'&&answer==='0')return 'org.charge.disappears';
    if(id==='sv-heterocycle'&&field==='site'&&answer==='nh')return 'org.pyridine-pyrrole.same-pair';
    if(id==='sv-resonance'&&field==='conjugates'&&answer==='both')return 'org.resonance.crosses-sp3';
    if(id==='sv-induction'&&field==='path'&&answer==='pi')return 'org.induction-is-resonance';
    if(id==='sv-pka'&&field==='logA'&&Math.abs(Number(answer.replace(',','.'))+2.3)<.05)return 'org.pka.inverted';
    return null;
  }
  function evaluate(id,answers={}) {
    const item=byId(id);if(!item)throw new Error('unknown_structured_case');
    let count=0,firstWrong=null;
    for(const field of item.fields) {
      const value=String(answers[field.key]??'').trim();
      const correct=field.type==='number'&&value!==''?
        Number.isFinite(Number(value.replace(',','.')))&&Math.abs(Number(value.replace(',','.'))-field.answer)<=.05:
        value===field.answer;
      if(correct)count+=1;else if(!firstWrong)firstWrong=field;
    }
    const firstValue=String(answers[firstWrong?.key]??'').trim();
    const missing=item.fields.some(field=>String(answers[field.key]??'').trim()==='');
    const misconceptionId=firstWrong?misconception(id,firstWrong.key,firstValue):null;
    const kind=count===item.fields.length?'correct':missing?'incomplete':misconceptionId?'conceptual':
      firstWrong?.type==='number'?'procedural':'surface';
    return {outcome:count===item.fields.length?'correct':'incorrect',kind,correct:count,total:item.fields.length,
      firstWrong:firstWrong?.key||null,
      misconceptionId,
      what:count===item.fields.length?'Coinciden todas las decisiones comprobables.':
        missing?'Completa las decisiones antes de evaluar el caso.':`Coinciden ${count} de ${item.fields.length} decisiones.`,
      why:firstWrong?firstWrong.why:'La pauta estructurada coincide; esto no verifica automáticamente tu explicación escrita.',
      next:item.next};
  }
  function render(state) {
    const records=state.organicProgress?.['org-01']?.structured||{};
    return `<div class="structured-cases">${cases.map(item=>{
      const record=records[item.id]||{},answers=record.answers||{},result=record.result;
      return `<form class="structured-case" data-structured-case="${item.id}"><h3>${esc(item.title)}</h3><p>${esc(item.prompt)}</p>
        <div class="structured-fields">${item.fields.map(field=>`<label class="field"><span>${esc(field.label)}</span>${field.type==='number'?
          `<input name="${field.key}" type="text" inputmode="decimal" autocomplete="off" value="${esc(answers[field.key]||'')}" required>`:
          `<select name="${field.key}" required>${field.options.map(([value,label])=>`<option value="${esc(value)}" ${answers[field.key]===value?'selected':''}>${esc(label)}</option>`).join('')}</select>`}</label>`).join('')}</div>
        <button type="submit" class="primary-btn" ${result?.outcome==='correct'?'disabled':''}>${result?.outcome==='correct'?'Comprobado':'Comprobar decisiones'}</button>
        ${result?`<div class="structured-feedback ${result.outcome}" role="status"><strong>${esc(result.kind==='error_repaired'?'Error reparado: las decisiones ahora coinciden.':result.what)}</strong><p><b>Por qué:</b> ${esc(result.why)}</p><p><b>Ahora:</b> ${esc(result.next)}</p>${record.attempts>1?'<small>Reintento después de ver feedback: cuenta como práctica con ayuda. Para comprobar autonomía, resuelve otra variante sin pauta.</small>':''}</div>`:''}
      </form>`;}).join('')}</div>`;
  }
  window.NexoAcademicStructured=Object.freeze({cases,byId,evaluate,render});
})();
