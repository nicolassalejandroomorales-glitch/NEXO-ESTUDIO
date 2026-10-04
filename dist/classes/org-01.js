/* Orgánica II · PEP 1 · Aminas. Borrador de la Misión 1 (el par libre).
   Fuente: diapositivas de cátedra "Aminas", Dr. Javier Echeverría, USACH 2025-2S (diap. 2, 5 y 11),
   y el apunte propio "1.1 Compuestos nitrogenados - Aminas" (Obsidian). Las demás misiones se agregan aquí. */
(() => {
  'use strict';
  const SRC = 'catedra-aminas';
  const misconceptions = {
    'carbon-rule': {
      label: 'Clasificaste por el carbono, como en los alcoholes',
      why: 'En los alcoholes se mira el carbono que lleva el –OH. En las aminas no: se cuentan los grupos de carbono unidos directamente al nitrógeno.',
      prereq: { title: 'Qué es una amina y cómo se clasifica', mission: 'm1', block: 'b1' }
    },
    'count-groups': {
      label: 'Contaste mal los grupos unidos al N',
      why: 'Marca el N y cuenta solo los enlaces N–C. Cada grupo R unido al N suma uno; los H no cuentan.',
      prereq: { title: 'Qué es una amina y cómo se clasifica', mission: 'm1', block: 'b1' }
    },
    'nh-acid': {
      label: 'Confundiste quién acepta el protón',
      why: 'Una base acepta un H⁺ usando un par de electrones. Los H del N no aceptan nada: lo que usa la amina es su par libre.',
      prereq: { title: 'El par libre: base y nucleófilo', mission: 'm1', block: 'b2' }
    },
    'flat-n': {
      label: 'Olvidaste que el par libre ocupa espacio',
      why: 'El N es sp³: tiene 3 enlaces y 1 par libre en 4 orbitales. El par libre empuja a los enlaces y la forma queda piramidal, no plana.',
      prereq: { title: 'Hibridación sp³ (Orgánica I)', mission: 'm1', block: 'b3' }
    },
    'tetra-shape': {
      label: 'Mezclaste la forma de los electrones con la forma de la molécula',
      why: 'Los 4 pares (3 enlaces + 1 libre) se ordenan en tetraedro, pero la forma de la molécula se describe solo con los átomos: queda una pirámide trigonal de unos 108°.',
      prereq: { title: 'Hibridación sp³ (Orgánica I)', mission: 'm1', block: 'b3' }
    },
    'n-binds-cl': {
      label: 'Confundiste base con nucleófilo',
      why: 'Frente a HCl la amina actúa como base: su par libre capta el H⁺ y queda un ion amonio con el Cl⁻ como contraión. No se forma un enlace N–Cl.',
      prereq: { title: 'El par libre: base y nucleófilo', mission: 'm1', block: 'b2' }
    },
    'lone-pair-not-group': {
      label: 'El par libre sí cuenta como cuarto "grupo"',
      why: 'Con tres grupos distintos más el par libre, el N es un centro quiral. El problema no es ese: es que la inversión piramidal es tan rápida que los enantiómeros se convierten uno en otro.',
      prereq: { title: 'Geometría del nitrógeno', mission: 'm1', block: 'b3' }
    },
    'neutral-in-acid': {
      label: 'Olvidaste que en medio ácido la amina se protona',
      why: 'Con muchos H⁺ alrededor, el par libre de la amina capta uno: la forma mayoritaria es el ion amonio R–NH₃⁺.',
      prereq: { title: 'El par libre: base y nucleófilo', mission: 'm1', block: 'b2' }
    }
  };


  const NH3_SVG = `<svg viewBox="0 0 200 130" role="img" aria-label="Estructura de Lewis del amoníaco: N con tres enlaces a H y un par libre arriba" class="cr-svg">
    <g fill="currentColor" font-family="Georgia, serif" font-size="26" text-anchor="middle">
      <text x="100" y="78">N</text><text x="35" y="78">H</text><text x="165" y="78">H</text><text x="100" y="124">H</text></g>
    <g stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="50" y1="69" x2="85" y2="69"/><line x1="115" y1="69" x2="150" y2="69"/><line x1="100" y1="84" x2="100" y2="102"/></g>
    <g fill="#b0721a"><circle cx="92" cy="40" r="5"/><circle cx="108" cy="40" r="5"/></g>
    <text x="140" y="30" font-size="13" fill="#8a5d17" font-family="sans-serif">par libre</text></svg>`;
  const PROTON_SVG = `<svg viewBox="0 0 420 130" role="img" aria-label="Protonación: el amoníaco usa su par libre para captar un H+ y forma el ion amonio con carga +1" class="cr-svg">
    <g fill="currentColor" font-family="Georgia, serif" font-size="22" text-anchor="middle">
      <text x="70" y="72">N</text><text x="22" y="72">H</text><text x="118" y="72">H</text><text x="70" y="116">H</text>
      <text x="170" y="72">+</text><text x="205" y="72">H⁺</text><text x="245" y="72">→</text>
      <text x="335" y="72">N</text><text x="290" y="72">H</text><text x="380" y="72">H</text><text x="335" y="116">H</text><text x="335" y="28">H</text>
      <text x="405" y="36" font-size="20">+</text></g>
    <g stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="33" y1="64" x2="58" y2="64"/><line x1="82" y1="64" x2="107" y2="64"/><line x1="70" y1="78" x2="70" y2="96"/>
      <line x1="301" y1="64" x2="323" y2="64"/><line x1="347" y1="64" x2="369" y2="64"/><line x1="335" y1="78" x2="335" y2="96"/><line x1="335" y1="34" x2="335" y2="50"/></g>
    <g fill="#b0721a"><circle cx="63" cy="40" r="4"/><circle cx="77" cy="40" r="4"/></g>
    <path d="M80 34 C 120 6, 175 10, 196 50" fill="none" stroke="#b0721a" stroke-width="2" marker-end="url(#crArrow)"/>
    <defs><marker id="crArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#b0721a"/></marker></defs></svg>`;

  const choice = (id, prompt, options, extra = {}) => ({ id, type: 'choice', prompt, options, source: SRC, ...extra });

  window.NexoClasses = window.NexoClasses || {};
  window.NexoClasses['org-01'] = {
    id: 'org-01',
    subject: 'organica',
    title: 'Aminas',
    evaluation: 'PEP 1',
    status: 'borrador',
    /* Meta de la clase: los puntos de la prueba que esta clase te prepara a asegurar (pauta PEP 1 2025,
       dist/assets/exams/13_org2_pep1_2025_aminas_aromaticos.jpg). Un punto cuenta cuando aciertas sin ayuda
       el caso estilo prueba (transferencia) de las misiones que lo preparan. */
    goal: {
      total: 15,
      text: 'Asegurar los 6 puntos de Aminas de la PEP 1',
      questions: [
        { id: 'P3', label: 'Ordenar por basicidad', points: 1, missions: ['m4', 'm5'] },
        { id: 'P4', label: 'Proponer aminas y reactivos', points: 3, missions: ['m6', 'm7'] },
        { id: 'P6', label: 'Predecir productos (Gabriel, Hofmann)', points: 2, missions: ['m6', 'm7'] }
      ],
      rest: [{ label: 'Aromáticos (P1, P2 y P5)', points: 9, note: 'clase en preparación' }]
    },
    sources: {
      [SRC]: { title: 'Clase de cátedra · Aminas', author: 'Dr. Javier Echeverría', detail: 'Química Orgánica II, USACH, 2025-2S', authority: 'Material oficial del curso' }
    },
    misconceptions,
    glossary: [
      { term: 'Electrones de valencia', mission: 'm1', def: 'Los electrones de la capa más externa; son los que forman enlaces. El N (grupo 15) tiene 5.',
        simple: 'Son los electrones «de afuera» del átomo, los únicos que participan cuando se une con otros. El N tiene 5: usa 3 para enlazarse y le sobran 2.',
        simpler: 'Si el átomo fuera una persona, los electrones de valencia serían sus manos: con ellas se toma de la mano con otros átomos.' },
      { term: 'Par libre', mission: 'm1', def: 'Dos electrones de un mismo átomo que no forman enlace. En el N de una amina hay uno.',
        simple: 'Son 2 electrones del N que no están unidos a nada. Como están libres, el N los puede usar para agarrar algo nuevo, como un H⁺.',
        simpler: 'Es una mano libre del nitrógeno. Con esa mano agarra cosas: por eso las aminas reaccionan.' },
      { term: 'Base de Brønsted', mission: 'm1', def: 'Especie que acepta un protón (H⁺). Para hacerlo entrega un par de electrones.',
        simple: 'Una base es algo que atrapa un H⁺. La amina lo atrapa con su par libre.',
        simpler: 'El H⁺ es una pelota que anda suelta; la base es quien la atrapa.' },
      { term: 'Ácido conjugado', mission: 'm1', def: 'Lo que queda cuando una base captó su H⁺. El de una amina es un ion amonio (R–NH₃⁺).',
        simple: 'Cuando la amina atrapa el H⁺ se transforma en ion amonio (R–NH₃⁺). Esa forma «con el H⁺ puesto» es su ácido conjugado, porque ahora podría devolverlo.',
        simpler: 'Es la amina después de atrapar la pelota. Si la suelta, vuelve a ser amina.' },
      { term: 'Nucleófilo', mission: 'm1', def: 'Especie que usa un par de electrones para atacar un átomo pobre en electrones, normalmente un carbono δ+.',
        simple: 'Algo rico en electrones que busca un átomo con carga positiva parcial (δ+), casi siempre un carbono, para formar un enlace nuevo.',
        simpler: '«Nucleófilo» significa «amante de núcleos», o sea, de lo positivo: va directo a lo positivo como un imán.' },
      { term: 'Grupo R (alquilo / arilo)', mission: 'm1', def: 'Cualquier grupo de carbono: metilo CH₃–, etilo CH₃CH₂–, fenilo C₆H₅– (arilo, un anillo aromático).',
        simple: 'La R es un comodín: significa «aquí va algún grupo de carbonos». Puede ser una cadena (alquilo) o un anillo aromático (arilo).',
        simpler: 'Es como la «x» en matemáticas: R puede ser cualquier pedazo de carbono.' },
      { term: 'Hibridación sp³', mission: 'm1', def: 'Cuatro grupos de electrones alrededor de un átomo se ordenan en tetraedro (unos 109,5°).',
        simple: 'Cuando el N tiene 4 cosas alrededor (3 enlaces y su par libre), se ordenan lo más lejos posible entre sí y forman un tetraedro, una pirámide de base triangular.',
        simpler: 'Son 4 globos amarrados a un mismo punto: solos se acomodan apuntando en 4 direcciones distintas.' },
      { term: 'Quiral', mission: 'm1', def: 'Que no se puede superponer con su imagen en el espejo, como tus manos.',
        simple: 'Una molécula es quiral cuando su reflejo en el espejo es distinto a ella y no hay forma de girarla para que calcen.',
        simpler: 'Como tus manos: la izquierda es el reflejo de la derecha, pero un guante derecho no le queda a la izquierda.' },
      { term: 'Enantiómeros', mission: 'm1', def: 'Las dos formas "espejo" de una molécula quiral.',
        simple: 'Son las dos versiones espejo de una molécula quiral: misma fórmula y mismos enlaces, pero en 3D son reflejos.',
        simpler: 'Son la mano derecha y la mano izquierda de una misma molécula.' },
      { term: 'Mezcla racémica', mission: 'm1', def: 'Mitad de cada enantiómero. No desvía la luz polarizada.',
        simple: 'Es 50 % de cada enantiómero. Uno gira la luz polarizada hacia un lado y el otro hacia el lado contrario, así que se anulan.',
        simpler: 'Un equipo con la mitad empujando a la izquierda y la mitad a la derecha: no se mueve.' },
      { term: 'Sal de amonio', mission: 'm3', def: 'Amina protonada (catión) junto a un anión, por ejemplo R–NH₃⁺ Cl⁻. Las de 4 grupos R son cuaternarias.',
        simple: 'Cuando una amina atrapa el H⁺ de un ácido (como HCl) queda con carga + y se junta con el anión (Cl⁻): eso es una sal. Si el N tiene 4 grupos de carbono es cuaternaria y ya no tiene par libre.',
        simpler: 'Es la amina «vestida» de sal: con carga, sólida y soluble en agua, como la sal de mesa.' }
    ],
    curiosities: [
      { text: 'El olor a pescado se debe a aminas pequeñas como la trimetilamina, que se forman cuando las enzimas descomponen proteínas del pescado.', slide: 13 },
      { text: 'La putrescina y la cadaverina son aminas con olor desagradable que se forman en la descomposición de la carne.', slide: 13 },
      { text: 'Los alcaloides, como la morfina, la cocaína y la nicotina, son aminas naturales aisladas de plantas.', slide: 4 },
      { text: 'La efedrina pura funde a 79 °C, huele a pescado y se oxida al aire. Su clorhidrato funde a 217 °C y casi no tiene olor: por eso los fármacos se venden como sales.', slide: 16 },
      { text: 'El bupropión se creó como antidepresivo y resultó ayudar a dejar de fumar.', slide: 14 }
    ],
    /* Texto de las diapositivas de cátedra que usa la clase (se proyecta mientras no estén las imágenes).
       Cuando existan, las imágenes van en assets/classes/org-01/slides/NN.webp y se listan en slideImages. */
    slideImages: {},
    slides: {
      2: { title: 'Aminas · Introducción', bullets: ['Aminas son derivados orgánicos del amoníaco donde uno de los H unidos al N es reemplazado por uno o más grupos alquilo o arilo (R).', 'Clasificación: primarias, secundarias o terciarias, dependiendo del número de grupos unidos al N.'] },
      4: { title: 'Aminas · Introducción', bullets: ['Aminas naturales aisladas de plantas o animales se llaman alcaloides.', 'Muchas aminas desempeñan papeles vitales en la neuroquímica.'] },
      9: { title: 'Aminas · Nomenclatura', bullets: ['Las sales de amonio cuaternario tienen 4 enlaces alquilo o arilo con un N.', 'El N tiene carga positiva (+), como en sales de amonio simples como el cloruro de amonio.', 'En heterociclos nitrogenados, al N generalmente se le asigna la posición 1.'] },
      13: { title: 'Aminas · Otras características', bullets: ['Aminas de bajo peso molecular, como la trimetilamina, suelen tener olor a pescado.', 'El olor del pescado lo causan aminas que se producen cuando las enzimas descomponen ciertas proteínas.', 'Ejemplos: putrescina y cadaverina.'] },
      14: { title: 'Aminas · Ejemplo aplicado a fármacos', bullets: ['La mayoría de los fármacos producen más de una respuesta fisiológica.', 'El bupropión se desarrolló como antidepresivo, pero ayuda a dejar de fumar.', 'El sildenafil se diseñó para tratar la angina.'] },
      5: { title: 'Aminas · Reactividad', bullets: ['El N de una amina posee un par electrónico solitario o libre: una región de alta densidad de electrones (mapa de potencial electrostático de la trimetilamina).', 'El par solitario es responsable de la mayoría de las reacciones de las aminas.', 'El par electrónico libre puede funcionar como una base o como un nucleófilo.'] },
      11: { title: 'Aminas · Geometría', bullets: ['El N de una amina se hibrida típicamente sp³ y el par solitario ocupa un orbital sp³.', 'El N exhibe geometría piramidal trigonal, con ángulos de enlace de unos 108°.', 'Aminas con tres grupos alquilo diferentes son quirales.', 'La inversión piramidal ocurre con bastante rapidez y produce una mezcla racémica de enantiómeros.'] },
      12: { title: 'Aminas · Solubilidad y puntos de ebullición', bullets: ['El punto de ebullición aumenta cuando aumenta la capacidad de formar enlaces de H.', 'Las aminas primarias tienen típicamente puntos de ebullición más altos; las terciarias, más bajos.'] },
      16: { title: 'Aminas · Sales', bullets: ['Medicamentos y aminas bioactivas se almacenan y usan principalmente como sus sales.', 'Las sales de amina son menos propensas a la oxidación y son solubles en agua.', 'La sal de clorhidrato es preferible para compuestos de medicamentos.'] }
    },
    missions: [
      {
        id: 'm1',
        title: 'El par libre',
        subtitle: 'Qué es una amina, cómo se clasifica y por qué todo depende de su par de electrones',
        minutes: 12,
        slides: '2, 5 y 11',
        stages: {
          diagnostic: [
            choice('m1-d1', '¿Qué tipo de amina es la terc-butilamina, (CH₃)₃C–NH₂?', [
              { text: 'Primaria', correct: true },
              { text: 'Terciaria', misconception: 'carbon-rule' },
              { text: 'Secundaria', misconception: 'count-groups' }
            ], { explain: 'El N está unido a un solo grupo de carbono (el terc-butilo): es primaria. Que ese carbono sea terciario no importa.', slide: 2, hint: 'Mira el nitrógeno, no el carbono. ¿Cuántos carbonos tocan al N?' }),
            choice('m1-d2', '¿Qué parte de una amina le permite actuar como base?', [
              { text: 'Los H unidos al nitrógeno', misconception: 'nh-acid' },
              { text: 'El par de electrones libre del nitrógeno', correct: true },
              { text: 'El enlace C–N', note: 'Esos electrones ya están ocupados en el enlace con el carbono; no quedan libres para un H⁺.' }
            ], { explain: 'El par libre del N es una zona de alta densidad electrónica: puede captar un H⁺ (base) o atacar un centro con carga parcial positiva (nucleófilo).', slide: 5, hint: 'Para captar un H⁺, la base necesita electrones que entregarle.' }),
            choice('m1-d3', '¿Qué forma tiene la molécula alrededor del N en la trimetilamina, (CH₃)₃N?', [
              { text: 'Plana trigonal, 120°', misconception: 'flat-n' },
              { text: 'Tetraédrica, 109,5°', misconception: 'tetra-shape' },
              { text: 'Piramidal trigonal, unos 108°', correct: true }
            ], { explain: 'El N es sp³ y el par libre ocupa un orbital sp³. La forma de los átomos es piramidal trigonal con ángulos de unos 108°.', slide: 11, hint: 'Cuenta 3 enlaces + 1 par libre. ¿Qué forma queda si solo miras los átomos?' })
          ],
          fundamentals: [
            { id: 'f1', title: 'Desde cero: el nitrógeno y sus 5 electrones', svg: NH3_SVG,
              body: 'El nitrógeno está en el grupo 15: tiene **5 electrones de valencia**. Para completar su octeto comparte 3 de ellos formando **3 enlaces**, y le sobran 2 electrones que no comparte con nadie.',
              deeper: 'Míralo en el amoníaco, NH₃: tres enlaces N–H (cada uno son 2 electrones compartidos) y arriba dos puntos, que son los 2 electrones que sobran. 3 enlaces × 2 = 6 electrones compartidos + 2 propios = 8: octeto completo. Esos 2 electrones propios son el famoso **par libre**.' },
            { id: 'f2', title: 'Desde cero: qué es un par libre',
              body: 'Un par libre son **2 electrones de un mismo átomo que no forman enlace**. Como son carga negativa concentrada, atraen a cosas positivas.',
              deeper: 'Piensa en el N como alguien con una mano libre. Con esa mano puede agarrar un protón (H⁺, que es carga positiva pura) o puede "tocar" un carbono que esté un poco positivo (δ+). Todo lo que hacen las aminas sale de esa mano libre.' },
            { id: 'f3', title: 'Desde cero: qué es una base', svg: PROTON_SVG,
              body: 'En la definición de Brønsted–Lowry, un **ácido entrega un H⁺** y una **base lo acepta**. El H⁺ no trae electrones, así que la base pone los 2 del nuevo enlace: usa su par libre.',
              deeper: 'NH₃ + H⁺ → NH₄⁺. Antes, el N tenía 3 enlaces y 1 par libre. Después tiene 4 enlaces y ningún par libre. Su carga formal pasa a +1 (5 electrones de valencia − 0 sin compartir − 4 enlaces = +1). Por eso el ion amonio lleva un "+".' },
            { id: 'f4', deeper: 'La R es como la «x» de matemáticas: un espacio donde va cualquier pedazo de carbono. Si ves R–NH₂, lee «algún carbono con un NH₂». Si ese carbono es parte de una cadena, es **alquilo**; si es parte de un anillo aromático, es **arilo** (como en la anilina).', title: 'Desde cero: qué significa "R"',
              body: 'En orgánica, **R** es cualquier grupo de carbono. Puede ser una cadena (alquilo, como metilo CH₃– o etilo CH₃CH₂–) o un anillo aromático (arilo, como el fenilo C₆H₅–).',
              rows: [['CH₃–', 'metilo (alquilo)'], ['CH₃CH₂–', 'etilo (alquilo)'], ['C₆H₅–', 'fenilo (arilo)']] },
            { id: 'f5', title: 'Desde cero: hibridación sp³ en un minuto',
              body: 'Cuando un átomo tiene **4 grupos de electrones** a su alrededor (enlaces o pares libres), los separa lo más posible: en forma de tetraedro, a unos 109,5°.',
              deeper: 'El N de una amina tiene 3 enlaces + 1 par libre = 4 grupos, así que es sp³. Si solo miras dónde están los átomos (no el par libre), la forma es una pirámide de base triangular. El par libre empuja un poco más que un enlace, así que los ángulos quedan en unos 107–108°, un poco menos que 109,5°.' }
          ],
          explain: [
            { id: 'b1', deeper: 'Receta para clasificar: 1) encuentra el N; 2) mira quiénes están unidos directamente a él; 3) cuenta cuántos son carbonos. Uno → primaria (CH₃NH₂, metilamina). Dos → secundaria ((CH₃)₂NH, dimetilamina). Tres → terciaria ((CH₃)₃N, trimetilamina). Si fueran cuatro carbonos, el N quedaría con carga +: sería una sal de amonio cuaternario (diap. 9).', title: 'Una amina es amoníaco "disfrazado"', slide: 2,
              body: 'Si a una molécula de NH₃ le reemplazas uno o más H por grupos de carbono (R, alquilo o arilo), obtienes una amina. Se clasifica contando cuántos grupos R están unidos **al nitrógeno**.',
              rows: [['NH₃', 'amoníaco'], ['R–NH₂', 'primaria (1°)'], ['R₂NH', 'secundaria (2°)'], ['R₃N', 'terciaria (3°)']] },
            { id: 'b2', deeper: 'Base y nucleófilo usan el mismo par libre; lo que cambia es a quién atacan. Como base, atacan un H⁺: CH₃NH₂ + HCl → CH₃NH₃⁺ Cl⁻. Como nucleófilo, atacan un carbono pobre en electrones, como el C unido al yodo en el CH₃I: (CH₃)₃N + CH₃I → (CH₃)₄N⁺ I⁻, una sal de amonio cuaternario.', title: 'El par libre lo hace todo', slide: 5,
              body: 'El N tiene un par de electrones que no forma enlace. Con él, la amina puede hacer dos cosas:',
              rows: [['Base', 'R₃N + H⁺ ⇌ R₃NH⁺ (capta un protón)'], ['Nucleófilo', 'R₃N + R′–X → R₃N⁺–R′ + X⁻ (ataca un carbono)']],
              note: 'Casi todas las reacciones de las aminas que verás en esta clase nacen de este par.' },
            { id: 'b3', deeper: 'Imagina una pirámide baja: el N arriba, los 3 grupos en la base y el par libre apuntando hacia afuera. La inversión piramidal es esa pirámide dándose vuelta (pasa por una forma plana), como un paraguas con el viento. En el amoníaco ocurre unas 24 mil millones de veces por segundo; en aminas simples, millones de veces. Por eso no alcanzas a separar los dos enantiómeros.', title: 'Un nitrógeno con forma de pirámide', slide: 11,
              body: 'El N es sp³ y su par libre ocupa uno de los 4 orbitales. Por eso la molécula es piramidal trigonal, con ángulos de unos 108°.',
              note: 'Si el N tiene tres grupos distintos, es un centro quiral. Pero la inversión piramidal ocurre tan rápido que los dos enantiómeros se transforman uno en otro: queda una mezcla racémica que no se puede separar.' }
          ],
          worked: {
            prompt: 'Dietilamina, (CH₃CH₂)₂NH, se mezcla con HCl. ¿Qué tipo de amina es y qué se forma?',
            steps: [
              { text: 'Cuenta los grupos de carbono unidos al N: dos etilos. Es una amina **secundaria**.' },
              { text: 'Ubica el par libre: está en el N, en un orbital sp³.' },
              { text: 'El HCl entrega un H⁺. El par libre del N lo capta: la amina actúa como **base**.', ask: '¿Qué hace el par libre con el H⁺?' },
              { text: 'Queda (CH₃CH₂)₂NH₂⁺ Cl⁻, una sal de amonio (cloruro de dietilamonio). El N tiene 4 enlaces y ningún par libre: carga +1.', ask: '¿Cómo queda la carga del N?' }
            ]
          },
          practice: [
            choice('m1-p1', '¿Qué tipo de amina es (CH₃)₂N–CH₂CH₃?', [
              { text: 'Secundaria', misconception: 'count-groups' },
              { text: 'Terciaria', correct: true },
              { text: 'Primaria', note: 'Primaria tendría un solo grupo R y dos H en el N.' }
            ], { explain: 'El N está unido a tres grupos de carbono (dos metilos y un etilo) y a ningún H: es terciaria.', slide: 2, hint: 'Cuenta todos los grupos unidos al N, incluido el etilo.' }),
            choice('m1-p2', 'La trimetilamina reacciona con HCl. ¿Qué se forma?', [
              { text: '(CH₃)₃NH⁺ Cl⁻', correct: true },
              { text: '(CH₃)₃N⁺–Cl', misconception: 'n-binds-cl' },
              { text: '(CH₃)₂NH + CH₃Cl', note: 'Eso sería romper un enlace C–N. El HCl no hace eso: solo entrega su H⁺.' }
            ], { explain: 'La amina actúa como base: su par libre capta el H⁺ del HCl. Se forma el ion trimetilamonio con Cl⁻ como contraión.', slide: 5, hint: '¿Qué parte del HCl puede captar un par de electrones?' }),
            choice('m1-p3', 'Una amina con tres grupos distintos en el N es quiral, pero sus enantiómeros no se pueden separar. ¿Por qué?', [
              { text: 'Porque el par libre no cuenta como grupo, así que no hay centro quiral', misconception: 'lone-pair-not-group' },
              { text: 'Porque la inversión piramidal los interconvierte muy rápido', correct: true },
              { text: 'Porque el N es plano y no tiene forma 3D' , misconception: 'flat-n' }
            ], { explain: 'La pirámide del N se "da vuelta" como un paraguas con el viento, muy rápido. Los dos enantiómeros se convierten uno en otro y queda una mezcla racémica.', slide: 11, hint: 'Piensa en un paraguas que se da vuelta.' })
          ],
          challenge: [
            choice('m1-c1', 'Desafío: ¿cuál de estas aminas NO puede formar puentes de hidrógeno entre sus propias moléculas?', [
              { text: 'Propilamina, CH₃CH₂CH₂NH₂', note: 'Es primaria: tiene dos enlaces N–H, así que sí dona puentes de H.' },
              { text: 'Etilmetilamina, CH₃CH₂NHCH₃', note: 'Es secundaria: le queda un enlace N–H para donar un puente de H.' },
              { text: 'Trimetilamina, (CH₃)₃N', correct: true }
            ], { explain: 'Para donar un puente de H hace falta un enlace N–H. La trimetilamina es terciaria y no tiene ninguno: solo puede aceptar puentes de H.', slide: 12, hint: '¿Cuál no tiene ningún H unido al N?' })
          ],
          transfer: [
            choice('m1-t1', 'La anfetamina es C₆H₅–CH₂–CH(CH₃)–NH₂. ¿Qué tipo de amina es?', [
              { text: 'Secundaria, porque el carbono unido al N es secundario', misconception: 'carbon-rule' },
              { text: 'Primaria', correct: true },
              { text: 'Terciaria', note: 'Terciaria necesitaría tres grupos de carbono unidos al N; aquí hay uno.' }
            ], { explain: 'El N está unido a un solo grupo de carbono. Es primaria, aunque ese carbono esté unido a otros dos carbonos.', slide: 2, hint: 'Ya lo viste en el diagnóstico: ¿qué se mira, el N o el C?' }),
            choice('m1-t2', 'En el estómago (medio muy ácido), ¿cómo está mayoritariamente la anfetamina?', [
              { text: 'Neutra, como R–NH₂', misconception: 'neutral-in-acid' },
              { text: 'Protonada, como R–NH₃⁺', correct: true },
              { text: 'Desprotonada, como R–NH⁻', note: 'Quitarle un H al N requiere una base fortísima, no un medio ácido.' }
            ], { explain: 'En medio ácido abundan los H⁺ y el par libre de la amina capta uno. Por eso muchos fármacos con aminas se venden como sales (clorhidratos), que son su forma protonada (diap. 16).', slide: 5, hint: 'Hay muchos H⁺ alrededor. ¿Qué hace el par libre?' })
          ]
        }
      }
    ]
  };
})();

/* ───────── Misiones 2 a 8: todo Aminas para la PEP 1 ─────────
   Fuente: diapositivas de cátedra "Aminas" (Dr. J. Echeverría, USACH 2025-2S) y PEP 1 2025 (pauta).
   Valores de pKa del ácido conjugado (pKaH) de tablas estándar de química orgánica. */
(() => {
  'use strict';
  const cls = window.NexoClasses['org-01'];
  const SRC = 'catedra-aminas';
  const q = (id, prompt, options, extra = {}) => ({ id, type: 'choice', prompt, options, source: SRC, ...extra });
  const order = (id, prompt, cards, answer, extra = {}) => ({ id, type: 'order', prompt, cards: cards.map(([cid, text]) => ({ id: cid, text })), answer, source: SRC, ...extra });
  const classify = (id, prompt, buckets, cards, extra = {}) => ({ id, type: 'classify', prompt, buckets: buckets.map(([bid, label]) => ({ id: bid, label })), cards: cards.map(([cid, text, bucket]) => ({ id: cid, text, bucket })), source: SRC, ...extra });
  const match = (id, prompt, pairs, extra = {}) => ({ id, type: 'match', prompt, pairs: pairs.map(([left, right]) => ({ left, right })), source: SRC, ...extra });
  const pick = (id, prompt, molecules, targets, answer, extra = {}) => ({ id, type: 'pick', prompt, molecules, targets, answer, source: SRC, ...extra });
  // Respuesta escrita (escalón 5): escribes, ves la respuesta modelo y marcas qué ideas tenías.
  const write = (id, prompt, model, rubric, extra = {}) => ({ id, type: 'write', prompt, model, rubric, source: SRC, ...extra });

  Object.assign(cls.misconceptions, {
    'forgot-di': { label: 'Olvidaste contar los grupos repetidos', why: 'Si el mismo grupo aparece dos veces se usa "di" (dietil), tres veces "tri". Cuenta cada grupo unido al N.', prereq: { title: 'Nombrar secundarias y terciarias', mission: 'm2', block: 'b24' } },
    'amine-priority': { label: 'Le diste prioridad a la amina', why: 'El alcohol (y el ácido carboxílico) tienen más prioridad que la amina: dan el sufijo, y el NH₂ se nombra como prefijo "amino".', prereq: { title: 'Prioridad de grupos funcionales', mission: 'm2', block: 'f22' } },
    'alpha-order': { label: 'Los grupos van en orden alfabético', why: 'En una alquilamina los grupos se escriben en orden alfabético: etil antes que metil, metil antes que propil.', prereq: { title: 'Nombrar secundarias y terciarias', mission: 'm2', block: 'b24' } },
    'n-locant': { label: 'Los grupos sobre el N llevan "N-"', why: 'Un grupo unido al nitrógeno (no a un carbono de la cadena) se indica con el localizador N, no con un número.', prereq: { title: 'Nombrar secundarias y terciarias', mission: 'm2', block: 'b24' } },
    'parent-complex': { label: 'La cadena principal es el grupo más complejo', why: 'Cuando un grupo es más complejo que los otros, ese da el nombre base (alcanamina); los simples van como N-sustituyentes.', prereq: { title: 'Nombrar secundarias y terciarias', mission: 'm2', block: 'b24' } },
    'tertiary-donor': { label: 'Una terciaria no dona puentes de H', why: 'Para donar un puente de hidrógeno hace falta un enlace N–H. La terciaria no tiene: sus moléculas se atraen menos y hierve más bajo.', prereq: { title: 'Puentes de hidrógeno', mission: 'm3', block: 'f31' } },
    'size-solubility': { label: 'Más carbonos, menos soluble', why: 'La parte NH₂ se lleva bien con el agua, pero la cadena de carbonos no. Sobre unos 5 carbonos la cadena gana y la amina es poco soluble.', prereq: { title: 'Lo semejante disuelve lo semejante', mission: 'm3', block: 'f32' } },
    'salt-organic': { label: 'Una sal no se queda en el solvente orgánico', why: 'Al protonarse, la amina queda como ion (R–NH₃⁺Cl⁻). Los iones se disuelven en agua, no en éter.', prereq: { title: 'Sales y extracción', mission: 'm3', block: 'b34' } },
    'pka-inverted': { label: 'Invertiste el sentido del pKa', why: 'Se compara el pKa del ácido conjugado (el ion amonio). Mientras MÁS ALTO, más le cuesta soltar el H⁺, y por lo tanto MÁS básica es la amina.', prereq: { title: 'Ka y pKa', mission: 'm4', block: 'f41' } },
    'strong-side': { label: 'El equilibrio va hacia el lado débil', why: 'En una reacción ácido–base el equilibrio favorece al ácido más débil (el de pKa mayor), no al más fuerte.', prereq: { title: 'El lado débil gana', mission: 'm4', block: 'f42' } },
    'sum14': { label: 'pKa y pKb se complementan', why: 'Para un par conjugado en agua a 25 °C, pKa + pKb = 14. Si el pKa es 10,6, el pKb es 3,4.', prereq: { title: 'Pares conjugados', mission: 'm4', block: 'f43' } },
    'aromatic-more': { label: 'El anillo aromático le quita basicidad al N', why: 'En la anilina el par libre del N se deslocaliza en el anillo: está menos disponible para captar un H⁺. Las arilaminas son mucho menos básicas que las alquilaminas.', prereq: { title: 'Resonancia', mission: 'm5', block: 'f51' } },
    'pyrrole-pair': { label: 'El par del pirrol es parte del sexteto aromático', why: 'En el pirrol el par libre del N forma parte de los 6 electrones π aromáticos. Protonarlo destruiría la aromaticidad: por eso es una base extremadamente débil.', prereq: { title: 'Aromaticidad en un minuto', mission: 'm5', block: 'f52' } },
    'amide-basic': { label: 'El N de una amida no es básico', why: 'En una amida el par del N está muy deslocalizado hacia el C=O. Ese N casi no tiene densidad electrónica: no actúa como base ni como nucleófilo.', prereq: { title: 'Resonancia', mission: 'm5', block: 'f51' } },
    'subst-effect': { label: 'Mezclaste el efecto de los sustituyentes', why: 'Un donador (–OCH₃ en para) aumenta un poco la basicidad de la anilina; un aceptor (–NO₂) la baja mucho. La alquilamina sin anillo es la más básica de todas.', prereq: { title: 'Sustituyentes en el anillo', mission: 'm5', block: 'b53' } },
    'hybrid-s': { label: 'Más carácter s, menos básico', why: 'Un orbital con más carácter s retiene más sus electrones: sp³ (alquilamina) > sp² (piridina) > sp (nitrilo) en basicidad.', prereq: { title: 'Hibridación y basicidad', mission: 'm5', block: 'b55' } },
    'overalkylation': { label: 'La amina producto sigue reaccionando', why: 'La amina que se forma también es nucleófila (incluso más que el NH₃), así que vuelve a atacar al R–X: se obtiene una mezcla de 1°, 2°, 3° y sal cuaternaria.', prereq: { title: 'Alquilación del amoníaco', mission: 'm6', block: 'b61' } },
    'gabriel-poly': { label: 'Gabriel no sobrealquila', why: 'El N de la N-alquilftalimida ya no tiene H y su par está deslocalizado por los dos C=O: no reacciona otra vez. Por eso Gabriel da solo la amina primaria.', prereq: { title: 'Síntesis de Gabriel', mission: 'm6', block: 'b63' } },
    'gabriel-stop': { label: 'Falta liberar la amina', why: 'La N-alquilftalimida es el intermedio. Hay que tratarla con hidrazina (o hidrolizar) para liberar R–NH₂.', prereq: { title: 'Síntesis de Gabriel', mission: 'm6', block: 'b63' } },
    'zaitsev-hofmann': { label: 'En Hofmann gana el alqueno MENOS sustituido', why: 'El grupo saliente –N(CH₃)₃⁺ es muy voluminoso: el estado de transición hacia el alqueno más sustituido tiene una interacción gauche que lo encarece. Se forma más rápido el menos sustituido (control cinético).', prereq: { title: 'Eliminación de Hofmann', mission: 'm7', block: 'b72' } },
    'tertiary-acyl': { label: 'Para formar amida el N necesita un H', why: 'En la acilación el N reemplaza a su H por el grupo acilo. Una amina terciaria no tiene H en el N: no forma amida.', prereq: { title: 'Acilación', mission: 'm7', block: 'b71' } },
    'nitration-confusion': { label: 'Eso nitra el anillo, no forma el diazonio', why: 'HNO₃/H₂SO₄ introduce un –NO₂ en el benceno. Para pasar de –NH₂ a –N₂⁺ se usa NaNO₂ con HCl, en frío (0–5 °C).', prereq: { title: 'Sales de diazonio', mission: 'm7', block: 'b73' } },
    'ir-peaks': { label: 'Cuenta los enlaces N–H', why: 'Cada tipo de amina da tantas señales N–H como permite su estructura: la 1° (NH₂) da dos picos (estiramiento simétrico y asimétrico), la 2° uno, la 3° ninguno.', prereq: { title: 'IR de aminas', mission: 'm8', block: 'b81' } },
    'n-rule': { label: 'Regla del nitrógeno', why: 'Un número impar de N da masa molecular impar; ningún N o un número par de N da masa par.', prereq: { title: 'Masa par o impar', mission: 'm8', block: 'f82' } }
  });

  Object.assign(cls.slides, {
    6: { title: 'Aminas · Nomenclatura (primarias)', bullets: ['Si el grupo alquilo es simple, se nombran como alquilamina: sustituyente + sufijo -amina.', 'Si es más complejo, se nombran como alcanamina: como un alcohol, con -amina en lugar de -ol.', 'Cuando hay otro grupo funcional, el amino se nombra como sustituyente y el otro grupo (excepto halógenos) da el sufijo.'] },
    7: { title: 'Aminas · Nomenclatura (arilaminas)', bullets: ['Las aminas aromáticas se nombran como derivados de la anilina.', 'La numeración empieza en el C unido al grupo amino y sigue en la dirección que da el número más bajo al primer punto de diferencia (2-fluoro en lugar de 3-etil).'] },
    8: { title: 'Aminas · Nomenclatura (secundarias y terciarias)', bullets: ['Si todos los grupos son simples, se nombran en orden alfabético con di-, tri-, tetra- si se repiten.', 'Si un grupo es complejo, se nombra como alcanamina con ese grupo como parental y los simples como sustituyentes con el localizador "N".'] },
    10: { title: 'Aminas · Ejercicios de nomenclatura', bullets: ['Ejercicio 1 y 2: asignar nombre a compuestos.', 'Ejercicio 3: dibujar la estructura a partir del nombre.'] },
    15: { title: 'Aminas · Sales de amonio cuaternario', bullets: ['Cuatro grupos alquilo o arilo unidos al N, que queda con carga positiva.'] },
    17: { title: 'Aminas · Basicidad', bullets: ['Las aminas son bases más fuertes que alcoholes o éteres y se protonan incluso con ácidos débiles.', 'Trietilamina + ácido acético: pKa 4,76 (ácido acético) frente a 10,76 (ion amonio).', 'El equilibrio favorece al ácido más débil: la amina queda casi toda protonada (1 de cada 1.000.000 neutra).', 'pKa alto del ion amonio = amina fuertemente básica.'] },
    18: { title: 'Aminas · Basicidad', bullets: ['La basicidad se cuantifica con el pKa del ion amonio correspondiente.', 'pKa alto: fuertemente básica. pKa bajo: débilmente básica.'] },
    19: { title: 'Aminas · Sales', bullets: ['La protonación de una amina da una sal de amina (ion amonio + anión del ácido).', 'La formación de sales puede usarse como método de aislación.'] },
    20: { title: 'Aminas · Ka y Kb', bullets: ['A veces no se informan Kb o pKb, sino Ka o pKa del ácido conjugado (el ion amonio).', 'Ka del ion amonio × Kb de la amina = Kw. Válido para cualquier par ácido–base conjugado.'] },
    22: { title: 'Efectos en la basicidad · Resonancia', bullets: ['En la p-nitroanilina el par libre está ampliamente deslocalizado.', 'Las amidas son un caso extremo: el par del N está muy deslocalizado; el N casi no tiene densidad electrónica y no actúa como base ni nucleófilo.'] },
    23: { title: 'Efectos en la basicidad · Resonancia', bullets: ['Arilaminas: bases mucho más débiles que las aminas alifáticas.', 'La resonancia estabiliza la amina libre; esa estabilización se pierde en el ion anilinio, así que el equilibrio se desplaza a la izquierda.'] },
    24: { title: 'Efectos en la basicidad · Sustituyentes', bullets: ['Grupos donadores (metoxi) aumentan ligeramente la basicidad de arilaminas.', 'Grupos aceptores (nitro) la disminuyen significativamente.'] },
    25: { title: 'Efectos en la basicidad · Deslocalización', bullets: ['Iones amonio de alquilaminas: pKa 10–11. Los de arilaminas son más ácidos (pKa menor).', 'En la arilamina el par ocupa un orbital p deslocalizado por el sistema aromático; se pierde al protonar.'] },
    26: { title: 'Efectos en la basicidad · Pirrol y piridina', bullets: ['En el pirrol el par libre participa en la aromaticidad: protonarlo la destruiría, es una base extremadamente débil.', 'En la piridina el par está localizado y no participa: puede actuar como base sin perder aromaticidad.', 'La piridina es unas 100.000 veces (5 órdenes de magnitud) más básica que el pirrol.'] },
    27: { title: 'Efectos en la basicidad · Hibridación', bullets: ['Orbitales con más carácter s retienen más sus electrones.', 'Piridina: par en orbital sp², menos disponible que el sp³ de una amina alifática.', 'Nitrilos (sp) son bases muy débiles: el acetonitrilo tiene pKb 24.'] },
    28: { title: 'Ejercicios de basicidad', bullets: ['Ejercicio 4: en cada par, identificar la base más fuerte.', 'Ejercicio 5: clasificar compuestos por basicidad.'] },
    29: { title: 'Síntesis de aminas', bullets: ['A partir de un haluro de alquilo.', 'A partir de un ácido carboxílico.', 'Preparación de anilina y derivados desde el benceno.'] },
    30: { title: 'Síntesis · Alquilación del amoníaco', bullets: ['NH₃ + R–X: la reacción puede continuar a aminas 2°, 3° y sal cuaternaria (polialquilación). Un exceso de NH₃ favorece la primaria.'] },
    31: { title: 'Síntesis · Azida y Gabriel', bullets: ['Azida: R–X + NaN₃ → R–N₃, luego reducción (LiAlH₄) → R–NH₂.', 'Gabriel: ftalimida potásica + R–X, luego hidrazina o hidrólisis → R–NH₂.', 'Ambas evitan la polialquilación.'] },
    32: { title: 'Síntesis · Aminación reductiva', bullets: ['Aldehído o cetona + NH₃ o amina, con un agente reductor (por ejemplo NaBH₃CN).', 'Con NH₃ da amina 1°; con amina 1° da 2°; con amina 2° da 3°.'] },
    33: { title: 'Resumen de estrategias de síntesis', bullets: ['Haluros (azida, Gabriel), carbonilos (aminación reductiva), amidas (LiAlH₄) y nitroarenos (reducción a anilina).'] },
    34: { title: 'Reacciones · Acilación', bullets: ['Aminas 1° y 2° reaccionan con haluros de acilo o anhídridos y forman amidas.'] },
    35: { title: 'Reacciones · Eliminación de Hofmann', bullets: ['Metilación exhaustiva (CH₃I en exceso) → sal de amonio cuaternario; Ag₂O, H₂O y calor → alqueno + N(CH₃)₃.'] },
    36: { title: 'Eliminación de Hofmann · Regioquímica', bullets: ['Las E2 suelen dar el alqueno más sustituido, pero en Hofmann el producto principal es el MENOS sustituido.', 'Argumento estérico: el grupo saliente es muy voluminoso; la conformación anticoplanar hacia el más sustituido tiene una interacción gauche.'] },
    37: { title: 'Eliminación de Hofmann · Control cinético', bullets: ['El estado de transición hacia el alqueno menos sustituido es de menor energía: se forma más rápido aunque no sea el más estable.'] },
    39: { title: 'Reacciones de iones aril diazonio', bullets: ['Muchos reactivos reemplazan el grupo diazo: permite introducir gran variedad de grupos en el anillo aromático.'] },
    40: { title: 'Diazonio · Sandmeyer y Schiemann', bullets: ['Sandmeyer: CuCl, CuBr o CuCN reemplazan el –N₂⁺ por –Cl, –Br o –CN.', 'Schiemann: HBF₄ y calor dan Ar–F.', 'Otras: H₂O y calor dan fenol; KI da Ar–I.'] },
    44: { title: 'Espectroscopía IR de aminas', bullets: ['1° y 2° muestran señales N–H entre 3350 y 3500 cm⁻¹, menos intensas que las O–H.', '1°: dos picos (simétrico y asimétrico). 2°: uno. 3°: ninguno.', 'Las 3° se detectan tratándolas con HCl: el N–H resultante da señal entre 2200 y 3000 cm⁻¹.'] },
    45: { title: 'RMN ¹H de aminas', bullets: ['H unido al N: señal ancha entre 0,5 y 5,0 ppm.', 'H α al N: entre 2 y 3 ppm; el efecto disminuye con la distancia (β ~1,5; γ ~0,9 ppm).'] },
    46: { title: 'RMN ¹³C de aminas', bullets: ['C α al N: entre 30 y 50 ppm, unos 20 ppm campo abajo por el desapantallamiento del N.'] },
    47: { title: 'Espectrometría de masas', bullets: ['Regla del nitrógeno: un número impar de N da un ion molecular de masa impar.', 'Las aminas sufren escisión α: radical + catión estabilizado por resonancia.'] }
  });

  cls.glossary.push(
    { term: 'Alquilamina / alcanamina', mission: 'm2', def: 'Dos formas de nombrar: grupo + "amina" (etilamina) o alcano con -amina (2-butanamina).',
      simple: 'Hay dos formas válidas de nombrar una amina: decir el grupo y agregar «amina» (etilamina), o tomar el alcano y cambiar la -o final por -amina (etanamina).',
      simpler: 'Es como decir «el auto de Juan» o «Juan, el del auto»: lo mismo, dicho de dos maneras.' },
    { term: 'Anilina', mission: 'm2', def: 'C₆H₅–NH₂, la amina aromática base. Sus derivados se nombran a partir de ella.',
      simple: 'Es un anillo de benceno con un NH₂ pegado. Es la amina aromática más simple, y las demás se nombran como «anilinas con algo».',
      simpler: 'Es el apellido de la familia: 3-cloroanilina es «anilina con un Cl en el carbono 3».' },
    { term: 'pKa del ion amonio (pKaH)', mission: 'm4', def: 'Mide la basicidad de una amina: mientras más alto, más básica.',
      simple: 'Para saber qué tan básica es una amina se mira el pKa de su forma protonada (R–NH₃⁺). Si es alto, el ion no suelta el H⁺: la amina lo agarra fuerte y es más básica.',
      simpler: 'Número alto = la amina agarra fuerte el H⁺ = más básica.' },
    { term: 'pKa + pKb = 14', mission: 'm4', def: 'Relación entre un ácido y su base conjugada en agua a 25 °C (Ka·Kb = Kw).',
      simple: 'Si conoces el pKb de la amina, el pKa de su ion amonio es 14 menos ese valor (en agua, a 25 °C). Sirve para pasar de un dato al otro.',
      simpler: 'Los dos números siempre suman 14: si te dan uno, restas y tienes el otro.' },
    { term: 'Resonancia / deslocalización', mission: 'm5', def: 'Electrones repartidos en varios átomos; un par repartido está menos disponible para captar H⁺.',
      simple: 'A veces un par de electrones no se queda en un átomo, sino que se reparte entre varios (por ejemplo, entre el N y el anillo). Repartido, está menos disponible para atrapar un H⁺: la amina es menos básica.',
      simpler: 'Es como tener la plata repartida en varias cuentas: es la misma plata, pero tienes menos a mano para gastar al tiro.' },
    { term: 'Aromaticidad (Hückel)', mission: 'm5', def: 'Anillo plano, conjugado y con 4n + 2 electrones π: muy estable.',
      simple: 'Un anillo es aromático si es plano, todos sus átomos tienen un orbital p conectado y tiene 2, 6, 10… electrones π (4n + 2). Eso lo hace muy estable, y no quiere perder esa estabilidad.',
      simpler: 'Es un club exclusivo de anillos súper estables. Si un par de electrones ya es parte del club (como en el pirrol), no lo suelta para atrapar un H⁺.' },
    { term: 'Efecto inductivo', mission: 'm5', def: 'Atracción o donación de densidad electrónica a través de enlaces σ.',
      simple: 'Un átomo electronegativo (O, Cl, el N de un NO₂) tira de los electrones a través de los enlaces y se los quita al N, que entonces atrapa peor un H⁺. Los alquilos hacen lo contrario: empujan electrones hacia el N.',
      simpler: 'Es un tira y afloja de electrones: si un vecino tira para su lado, al N le quedan menos.' },
    { term: 'Carácter s', mission: 'm5', def: 'Proporción de orbital s en un híbrido: sp (50 %) > sp² (33 %) > sp³ (25 %). Más carácter s retiene más los electrones.',
      simple: 'Los orbitales s están más cerca del núcleo. Un N sp (50 % s) tiene su par más pegado al núcleo que uno sp³ (25 % s), así que lo comparte peor: es menos básico.',
      simpler: 'Mientras más «s», más apretado tiene el N su par y menos lo presta. Orden: sp³ > sp² > sp.' },
    { term: 'SN2', mission: 'm6', def: 'Sustitución en un paso: el nucleófilo entra por detrás y el grupo saliente sale.',
      simple: 'El nucleófilo ataca al carbono por el lado contrario al grupo saliente y, en el mismo instante, ese grupo se va. Todo pasa en un solo paso.',
      simpler: 'Como el juego de las sillas: uno se sienta justo cuando el otro se para.' },
    { term: 'Polialquilación', mission: 'm6', def: 'Cuando la amina formada sigue reaccionando con el haluro y se obtiene una mezcla.',
      simple: 'Al hacer reaccionar NH₃ con R–X, la amina que se forma sigue siendo nucleófila (más que el NH₃) y vuelve a atacar. Terminas con una mezcla de 1°, 2°, 3° y sal cuaternaria.',
      simpler: 'Querías poner un solo R y la reacción no para: como pedir una papa frita y que te sigan sirviendo.' },
    { term: 'Síntesis de Gabriel', mission: 'm6', def: 'Ftalimida + KOH, R–X, luego hidrazina: da solo la amina primaria.',
      simple: 'Un truco para obtener solo la amina primaria: el N de la ftalimida puede alquilarse una sola vez, y al final la hidrazina lo libera como R–NH₂.',
      simpler: 'Es un molde que deja pasar un solo R: siempre sale una amina primaria y nada más.' },
    { term: 'Aminación reductiva', mission: 'm6', def: 'Carbonilo + NH₃ o amina + reductor (NaBH₃CN): forma una amina.',
      simple: 'Juntas un aldehído o cetona con NH₃ o una amina: se forma una imina (C=N) y el reductor la convierte en amina (C–N). El C del carbonilo termina unido al N.',
      simpler: 'Le pegas un nitrógeno donde antes había un oxígeno.' },
    { term: 'Eliminación de Hofmann', mission: 'm7', def: 'CH₃I en exceso, Ag₂O y calor: da el alqueno menos sustituido.',
      simple: 'La amina se convierte en sal de amonio cuaternario (CH₃I en exceso), se cambia el anión por OH⁻ (Ag₂O) y se calienta: sale un alqueno. Como el grupo que sale es muy voluminoso, la base saca el H más accesible y se forma el alqueno menos sustituido.',
      simpler: 'El grupo que sale es grande y torpe: saca el H más fácil de alcanzar, el de la orilla.' },
    { term: 'Sal de diazonio', mission: 'm7', def: 'Ar–N₂⁺, formada con NaNO₂/HCl en frío; el N₂ es un grupo saliente excelente.',
      simple: 'Si tratas una amina aromática (Ar–NH₂) con NaNO₂ y HCl en frío, el NH₂ se convierte en –N₂⁺. Ese grupo se va como gas N₂ con mucha facilidad, y en su lugar puedes poner casi cualquier cosa.',
      simpler: 'Es un comodín en el anillo: lo cambias por Cl, Br, CN, F, OH o I según lo que necesites.' },
    { term: 'Sandmeyer / Schiemann', mission: 'm7', def: 'Sales de cobre(I) dan Ar–Cl, Ar–Br, Ar–CN; HBF₄ y calor dan Ar–F.',
      simple: 'Son las reacciones que reemplazan el –N₂⁺ de una sal de diazonio: con CuCl, CuBr o CuCN (Sandmeyer) entra Cl, Br o CN; con HBF₄ y calor (Schiemann) entra F.',
      simpler: 'Sandmeyer usa cobre para poner Cl, Br o CN; Schiemann es el que pone el F.' },
    { term: 'Regla del nitrógeno', mission: 'm8', def: 'Número impar de N → masa molecular impar.',
      simple: 'El N pesa 14 pero forma 3 enlaces, un número impar. Por eso, si una molécula tiene un número impar de N, su masa molecular sale impar.',
      simpler: 'Masa impar en el espectro de masas = sospecha de un nitrógeno.' },
    { term: 'Escisión α', mission: 'm8', def: 'Ruptura típica de aminas en masas: radical + catión estabilizado.',
      simple: 'En el espectrómetro de masas, la amina se rompe en el enlace C–C vecino al carbono unido al N. Queda un catión con el N, estabilizado por resonancia, que da una señal fuerte.',
      simpler: 'La amina se corta «al lado del vecino» del N, porque el pedazo con el N queda estable.' }
  );

  cls.missions.push(
  /* ── Misión 2 ── */
  {
    id: 'm2', title: 'Nombrar aminas', subtitle: 'Alquilaminas, alcanaminas, anilinas y sales: el nombre correcto a la primera', minutes: 15, slides: '6–10', pep: 'base de todo',
    stages: {
      diagnostic: [
        q('m2-d1', '¿Cómo se llama CH₃CH₂NH₂?', [{ text: 'Etilamina', correct: true }, { text: 'Dietilamina', misconception: 'forgot-di' }, { text: 'Etanol', note: 'Etanol es CH₃CH₂OH: tiene –OH, no –NH₂.' }], { explain: 'Un grupo etilo unido a un NH₂: etilamina (también se acepta etanamina).', slide: 6 }),
        q('m2-d2', 'En una molécula con –OH y –NH₂, ¿qué grupo da el sufijo del nombre?', [{ text: 'El –NH₂ (sufijo -amina)', misconception: 'amine-priority' }, { text: 'El –OH (sufijo -ol)', correct: true }, { text: 'Ninguno, se nombran los dos como prefijos', note: 'Siempre hay un grupo principal que da el sufijo.' }], { explain: 'El alcohol tiene más prioridad que la amina: da el sufijo -ol, y el NH₂ va como prefijo "amino".', slide: 6 })
      ],
      fundamentals: [
        { id: 'f21', deeper: 'Los prefijos son un conteo: **met** (1), **et** (2), **prop** (3), **but** (4); desde 5 se usan los números griegos: **pent**, **hex**. Después pones el final según el papel: si la cadena «cuelga» de algo, termina en **-ilo** (etilo); si es la cadena principal, en **-ano** (etano). CH₃CH₂–NH₂ = grupo etilo + amina = **etilamina**.', title: 'Desde cero: cómo se nombra una cadena', body: 'Las cadenas se nombran según su número de carbonos. Como grupo unido a algo terminan en **-ilo** (metilo, etilo); como cadena principal, en **-ano** (metano, etano).',
          rows: [['1 C', 'met-'], ['2 C', 'et-'], ['3 C', 'prop-'], ['4 C', 'but-'], ['5 C', 'pent-'], ['6 C', 'hex-']] },
        { id: 'f22', title: 'Desde cero: prioridad de grupos funcionales', body: 'Cuando una molécula tiene varios grupos, uno **manda** y da el sufijo; los demás van como prefijos. Para esta clase basta saber que **ácido carboxílico > alcohol > amina**.',
          deeper: 'Ejemplo: H₂N–CH₂CH₂CH₂CH₂–OH. Manda el alcohol, así que el nombre termina en -ol y el NH₂ se llama "amino": 4-amino-1-butanol. Ojo: los halógenos nunca mandan; se nombran como prefijos (cloro, bromo).', slide: 6 }
      ],
      explain: [
        { id: 'b21', title: 'Aminas primarias: dos formas de nombrar', slide: 6, body: 'Si el grupo es simple, se nombra como **alquilamina**: el grupo + "amina". Si es más complejo, como **alcanamina**: igual que un alcohol, pero con -amina en vez de -ol.',
          rows: [['CH₃CH₂NH₂', 'etilamina'], ['(CH₃)₂CH–NH₂', 'isopropilamina'], ['C₆H₁₁–NH₂', 'ciclohexilamina'], ['CH₃CH(NH₂)CH₂CH₃', '2-butanamina']],
          deeper: 'Para una alcanamina: 1) busca la cadena más larga que contenga el C unido al N; 2) numérala desde el extremo más cercano al N; 3) el nombre del alcano pierde la "o" y gana "-amina", con el número del C que lleva el N: 2-butanamina.' },
        { id: 'b22', deeper: 'Los grupos funcionales tienen jerarquía, como un equipo: el capitán pone el apellido (el sufijo) y los demás van adelante como prefijos. El –OH y el –COOH le ganan al –NH₂. Por eso H₂N–CH₂CH₂CH₂CH₂–OH es un **alcohol** (butanol) que lleva un **amino** en el C4: 4-amino-1-butanol.', title: 'Cuando hay otro grupo que manda', slide: 6, body: 'Si hay un grupo con más prioridad (alcohol, ácido), ese da el sufijo y el NH₂ se nombra como **amino**.',
          rows: [['H₂N–(CH₂)₄–OH', '4-amino-1-butanol'], ['H₂N–C₆H₄–COOH (para)', 'ácido p-aminobenzoico']] },
        { id: 'b23', deeper: 'Parte siempre desde la anilina: el C que lleva el NH₂ es el **1**. Luego cuenta hacia el lado donde aparece primero otro sustituyente. Con F en el C2 y etilo en el C5 queda **5-etil-2-fluoroanilina** (los prefijos van en orden alfabético: etil antes que fluoro).', title: 'Arilaminas: todo gira en torno a la anilina', slide: 7, body: 'Las aminas aromáticas se nombran como **derivados de la anilina** (C₆H₅–NH₂). El C que lleva el NH₂ es el 1, y se numera hacia donde el primer sustituyente quede con el número más bajo.',
          rows: [['Cl en posición 3', '3-cloroanilina (m-cloroanilina)'], ['F en 2 y etilo en 5', '5-etil-2-fluoroanilina']],
          note: 'En la segunda: numerando hacia el F los localizadores son 2 y 5; hacia el otro lado, 3 y 6. Gana el que tiene el número más bajo en la primera diferencia: 2.' },
        { id: 'b24', title: 'Secundarias y terciarias', slide: 8, body: 'Si todos los grupos son simples, se nombran en **orden alfabético**, con di- o tri- si se repiten. Si uno es complejo, ese es la cadena principal (alcanamina) y los simples van con el localizador **N-**.',
          rows: [['CH₃–NH–CH₂CH₃', 'etilmetilamina'], ['(CH₃CH₂)₃N', 'trietilamina'], ['CH₃(CH₂)₅–N(CH₃)CH₂CH₃', 'N-etil-N-metil-1-hexanamina']],
          deeper: 'El "N-" dice que el grupo está pegado al nitrógeno y no a un carbono de la cadena. En N-etil-N-metil-1-hexanamina: la cadena es el hexilo (el grupo más complejo), el N está en el C1, y sobre el N hay un etilo y un metilo.' },
        { id: 'b25', deeper: 'Si el N tiene **4 carbonos** pegados, ya no le queda par libre y queda con carga **+**. Se nombra como una sal: primero el anión, luego «de» y el catión terminado en **-amonio**. (CH₃CH₂)₄N⁺ I⁻ = yoduro + cuatro etilos en el N = **yoduro de tetraetilamonio**.', title: 'Sales cuaternarias y heterociclos', slide: 9, body: 'Si el N tiene 4 grupos de carbono queda con carga + y es una **sal de amonio cuaternario**: se nombra el catión "-amonio" y su anión. En los anillos con N, el N es la posición 1.',
          rows: [['(CH₃CH₂)₄N⁺ I⁻', 'yoduro de tetraetilamonio'], ['N-butilpiridinio + Br⁻', 'bromuro de N-butilpiridinio']] }
      ],
      worked: {
        prompt: 'Nombra CH₃–CH(NH₂)–CH₂–CH₃.',
        steps: [
          { text: 'Busca la cadena más larga que incluya el C que lleva el N: 4 carbonos, **butano**.' },
          { text: 'Numera desde el extremo más cercano al N: el N queda en el **C2**.', ask: '¿Desde qué extremo numeras?' },
          { text: 'Cambia la "o" final por "-amina" y pon el número: **2-butanamina** (también sec-butilamina).' },
          { text: 'El C2 tiene H, CH₃, CH₂CH₃ y NH₂: cuatro grupos distintos, es **quiral**. Si te dan la configuración, va al comienzo: (R)-2-butanamina.', ask: '¿Ese carbono es un centro quiral?' }
        ]
      },
      practice: [
        q('m2-p1', '¿Cómo se llama (CH₃CH₂)₂NH?', [{ text: 'Dietilamina', correct: true }, { text: 'Etilamina', misconception: 'forgot-di' }, { text: 'Trietilamina', note: 'Trietilamina tiene tres etilos y ningún H en el N.' }], { explain: 'Dos grupos etilo en el N: dietilamina (secundaria).', slide: 8, hint: 'Cuenta los etilos unidos al N.' }),
        match('m2-p2', 'Une cada estructura con su nombre.', [['CH₃NH₂', 'Metilamina'], ['(CH₃)₃N', 'Trimetilamina'], ['C₆H₅–NH₂', 'Anilina'], ['CH₃–NH–CH₂CH₃', 'Etilmetilamina'], ['(CH₃CH₂)₄N⁺ I⁻', 'Yoduro de tetraetilamonio']], { explain: 'Grupos simples en orden alfabético con di-/tri-; la amina aromática es anilina; con 4 grupos es sal de amonio cuaternario.', slide: 8, hint: 'Empieza por los que reconozcas al tiro: anilina y la sal con carga +.' }),
        q('m2-p3', 'H₂N–CH₂–CH₂–CH₂–CH₂–OH se llama…', [{ text: '4-hidroxi-1-butanamina', misconception: 'amine-priority' }, { text: '4-amino-1-butanol', correct: true }, { text: '1-amino-4-butanol', note: 'Se numera desde el grupo que manda (el OH), que queda en el C1.' }], { explain: 'Manda el alcohol: sufijo -ol en C1; el NH₂ es "amino" en C4.', slide: 6, hint: '¿Quién manda: el alcohol o la amina?' }),
        q('m2-p4', 'Anilina con un Cl en la posición meta (3). ¿Su nombre?', [{ text: '3-cloroanilina', correct: true }, { text: '1-amino-3-clorobenceno', note: 'Describe bien la molécula, pero las arilaminas se nombran como derivados de la anilina.' }, { text: '5-cloroanilina', note: 'Se numera hacia donde el sustituyente queda con el número más bajo: 3, no 5.' }], { explain: 'El C con NH₂ es el 1; el Cl queda en el 3: 3-cloroanilina (m-cloroanilina).', slide: 7, hint: 'La anilina es el nombre base; numera desde el C del NH₂.' })
      ],
      challenge: [
        q('m2-c1', 'CH₃(CH₂)₅–N(CH₃)–CH₂CH₃ se llama…', [{ text: 'N-etil-N-metil-1-hexanamina', correct: true }, { text: '1-etil-1-metilhexanamina', misconception: 'n-locant' }, { text: 'N-hexil-N-metiletanamina', misconception: 'parent-complex' }], { explain: 'El hexilo es el grupo más complejo: es la cadena principal. El etilo y el metilo están sobre el N: llevan "N-".', slide: 8, hint: '¿Cuál es el grupo más complejo? Ese da el nombre base.' })
      ],
      transfer: [
        q('m2-t1', '¿Cómo se llama CH₃CH₂CH₂–NH–CH₃?', [{ text: 'Propilmetilamina', misconception: 'alpha-order' }, { text: 'Metilpropilamina', correct: true }, { text: 'Butilamina', note: 'Tiene 4 carbonos en total, pero repartidos en dos grupos sobre el N: es secundaria.' }], { explain: 'Dos grupos simples, en orden alfabético: metil antes que propil.', slide: 8 }),
        pick('m2-t2', 'En el ácido p-aminobenzoico, toca el grupo que da el sufijo del nombre.', [[{ t: 'H₂N', target: 'amino' }, { t: '–C₆H₄–' }, { t: 'COOH', target: 'acid' }]],
          { amino: { label: 'El grupo –NH₂', misconception: 'amine-priority' }, acid: { label: 'El grupo –COOH' } }, 'acid', { explain: 'El ácido carboxílico tiene la mayor prioridad: da el nombre "ácido …benzoico", y el NH₂ va como prefijo "amino".', slide: 6, captions: ['Ácido p-aminobenzoico'] })
      ]
    }
  },
  /* ── Misión 3 ── */
  {
    id: 'm3', title: 'Propiedades y sales', subtitle: 'Por qué unas aminas hierven más, cuáles se disuelven en agua y por qué los fármacos son sales', minutes: 12, slides: '12–16, 19', pep: 'teoría',
    stages: {
      diagnostic: [
        q('m3-d1', '¿Cuál hierve a mayor temperatura: propilamina o trimetilamina (misma masa)?', [{ text: 'Propilamina', correct: true }, { text: 'Trimetilamina', misconception: 'tertiary-donor' }, { text: 'Igual, porque tienen la misma masa', note: 'Misma masa, pero distinta capacidad de formar puentes de H.' }], { explain: 'La propilamina (1°) forma puentes de H entre sus moléculas; la trimetilamina (3°) no puede donarlos.', slide: 12 }),
        q('m3-d2', 'La octilamina (8 carbonos) en agua es…', [{ text: 'Poco soluble', correct: true }, { text: 'Muy soluble, como toda amina', misconception: 'size-solubility' }, { text: 'Insoluble porque no tiene N–H', note: 'Sí tiene N–H (es primaria). El problema es la cadena larga.' }], { explain: 'Con más de unos 5 carbonos la parte apolar domina: la octilamina es escasamente soluble.', slide: 12 })
      ],
      fundamentals: [
        { id: 'f31', title: 'Desde cero: puentes de hidrógeno', body: 'Un H unido a N, O o F queda con carga parcial **δ+** y es atraído por un **par libre** de otra molécula. Para **donar** un puente de H se necesita un enlace N–H u O–H; para **aceptarlo** basta un par libre.',
          deeper: 'Una amina 1° (R–NH₂) tiene dos N–H: dona y acepta. Una 2° (R₂NH) tiene uno. Una 3° (R₃N) no tiene ninguno: solo acepta. Por eso entre moléculas de amina terciaria las atracciones son más débiles.' },
        { id: 'f32', deeper: 'Piensa en el agua como un grupo de amigos tomados de la mano (puentes de H). El NH₂ sabe tomarse de la mano, así que lo aceptan; la cadena de carbonos no sabe y estorba. Si la cadena es corta, el NH₂ alcanza a «convencer» al agua; si es larga, gana el estorbo y la amina no se disuelve.', title: 'Desde cero: lo semejante disuelve lo semejante', body: 'El agua es polar. El grupo NH₂ también, y forma puentes de H con el agua. La cadena de carbonos es apolar y "molesta" al agua. Mientras más larga la cadena, menos soluble.' }
      ],
      explain: [
        { id: 'b31', deeper: 'Regla práctica: **cuenta los carbonos**. Hasta unos 5, el NH₂ alcanza para que la amina se disuelva en agua. Con más, gana la parte «aceitosa». Etilamina (2 C): soluble. Octilamina (8 C): casi nada.', title: 'Solubilidad', slide: 12, body: 'Las aminas se parecen a los alcoholes: con menos de unos 5 carbonos son **solubles** en agua; con más, **escasamente solubles**.', rows: [['Etilamina (2 C)', 'soluble'], ['Octilamina (8 C)', 'poco soluble']] },
        { id: 'b32', deeper: 'Para hervir, las moléculas tienen que separarse, y si están tomadas de la mano con puentes de H cuesta más. Una amina **1°** tiene 2 H en el N (más puentes), una **2°** tiene 1 y una **3°** ninguno. Por eso, con la misma fórmula, la 1° hierve más alto que la 2°, y la 2° más que la 3°.', title: 'Puntos de ebullición', slide: 12, body: 'Más capacidad de formar puentes de H entre moléculas → más energía para separarlas → **mayor punto de ebullición**. Entre isómeros: 1° > 2° > 3°.',
          rows: [['Propilamina (1°)', '48 °C'], ['Etilmetilamina (2°)', '37 °C'], ['Trimetilamina (3°)', '3 °C']], note: 'Las tres son C₃H₉N: misma masa. La diferencia es solo cuántos N–H tienen.' },
        { id: 'b33', deeper: 'Las aminas chicas se evaporan fácil y llegan rápido a tu nariz: el olor a pescado es **trimetilamina**. Cuando las proteínas se descomponen, algunos aminoácidos pierden CO₂ y quedan aminas como la **putrescina** y la **cadaverina**.', title: 'Olor', slide: 13, body: 'Las aminas pequeñas, como la trimetilamina, huelen a **pescado**. La putrescina y la cadaverina aparecen cuando se descomponen proteínas.' },
        { id: 'b34', title: 'Sales y extracción', slide: 16, body: 'Al protonar una amina con un ácido se forma una **sal** (R–NH₃⁺ Cl⁻): iónica, soluble en agua, sin olor y más estable. Por eso los fármacos se venden como clorhidratos. Y sirve para **separar** aminas de compuestos neutros.',
          deeper: 'Extracción: amina + compuesto neutro en éter. Agregas HCl acuoso: la amina se protona, se vuelve ion y se va al agua; el neutro se queda en el éter. Separas las capas. Al agua le agregas NaOH: la amina pierde el H⁺, vuelve a ser neutra y sale del agua.' }
      ],
      worked: {
        prompt: 'Tienes ciclohexilamina mezclada con naftaleno (neutro), ambos disueltos en éter. Sepáralos.',
        steps: [
          { text: 'Agrega HCl acuoso: la amina (base) capta el H⁺ y queda como **cloruro de ciclohexilamonio**, un ion.', ask: '¿Qué le pasa a la amina cuando agregas HCl?' },
          { text: 'Los iones se disuelven en agua: la sal pasa a la **fase acuosa**; el naftaleno se queda en el **éter**. Separas las dos capas.' },
          { text: 'A la fase acuosa le agregas **NaOH**: le quita el H⁺ al ion amonio y la amina vuelve a ser neutra, poco soluble en agua. La recuperas.', ask: '¿Cómo recuperas la amina libre?' }
        ]
      },
      practice: [
        order('m3-p1', 'Ordena estos isómeros C₃H₉N de menor a mayor punto de ebullición.', [['tri', 'Trimetilamina (3°)'], ['etme', 'Etilmetilamina (2°)'], ['prop', 'Propilamina (1°)']], ['tri', 'etme', 'prop'],
          { direction: 'De menor a mayor punto de ebullición.', explain: 'Trimetilamina 3 °C < etilmetilamina 37 °C < propilamina 48 °C: más N–H, más puentes de H.', misconception: 'tertiary-donor', slide: 12, hint: 'Cuenta cuántos N–H tiene cada una.' }),
        classify('m3-p2', 'Clasifica según su solubilidad en agua.', [['sol', 'Soluble'], ['poco', 'Poco soluble']], [['me', 'Metilamina', 'sol'], ['et', 'Etilamina', 'sol'], ['bu', 'Butilamina', 'sol'], ['oc', 'Octilamina', 'poco'], ['de', 'Decilamina', 'poco']],
          { explain: 'Hasta unos 5 carbonos son solubles; con cadenas largas (8, 10 C) la parte apolar gana.', misconception: 'size-solubility', slide: 12, hint: 'Fíjate en el número de carbonos.' }),
        q('m3-p3', '¿Por qué los fármacos con aminas se venden como clorhidratos?', [{ text: 'Son más estables, solubles en agua y casi sin olor', correct: true }, { text: 'Porque así son más básicos', note: 'La sal ya está protonada: no es más básica.' }, { text: 'Porque son más volátiles', note: 'Al revés: las sales son sólidos iónicos de punto de fusión alto.' }], { explain: 'La sal resiste la oxidación, se disuelve en agua (jarabes, inyectables) y no huele. Ejemplo: efedrina funde a 79 °C y huele; su clorhidrato funde a 217 °C y casi no huele.', slide: 16, hint: 'Piensa en la efedrina y su clorhidrato.' })
      ],
      transfer: [
        q('m3-t1', 'Una amina y un compuesto neutro están en éter. Agregas HCl acuoso y separas las capas. ¿Dónde está la amina?', [{ text: 'En la fase acuosa, como R–NH₃⁺ Cl⁻', correct: true }, { text: 'En el éter, sin cambios', misconception: 'salt-organic' }, { text: 'Se evaporó con el éter', note: 'Al protonarse se vuelve una sal iónica, nada volátil.' }], { explain: 'Protonada es un ion: se disuelve en agua y se separa del compuesto neutro.', slide: 19 }),
        q('m3-t2', '¿Cómo recuperas la amina libre desde esa fase acuosa?', [{ text: 'Agregando NaOH', correct: true }, { text: 'Agregando más HCl', note: 'Eso la mantiene protonada.' }, { text: 'Calentando hasta evaporar el agua', note: 'Obtendrías la sal, no la amina libre.' }], { explain: 'La base fuerte le quita el H⁺ al ion amonio: la amina vuelve a ser neutra y sale del agua.', slide: 19 })
      ]
    }
  },
  /* ── Misión 4 ── */
  {
    id: 'm4', title: 'Basicidad I: medirla con el pKa', subtitle: 'Cómo se compara la basicidad usando el pKa del ion amonio y hacia dónde va un equilibrio ácido–base', minutes: 15, slides: '17–20', pep: 'base de la pregunta 3',
    stages: {
      diagnostic: [
        q('m4-d1', 'Un pKa alto del ion amonio (R–NH₃⁺) significa que la amina es…', [{ text: 'Fuertemente básica', correct: true }, { text: 'Débilmente básica', misconception: 'pka-inverted' }, { text: 'No se puede saber con el pKa', note: 'Justamente así se mide la basicidad de una amina.' }], { explain: 'Si al ion amonio le cuesta soltar el H⁺ (pKa alto), es porque la amina lo retiene bien: es una base fuerte.', slide: 18 }),
        q('m4-d2', 'En una reacción ácido–base, el equilibrio favorece…', [{ text: 'La formación del ácido más débil', correct: true }, { text: 'La formación del ácido más fuerte', misconception: 'strong-side' }, { text: 'Siempre a los reactivos', note: 'Depende de los pKa de cada lado.' }], { explain: 'El equilibrio va hacia el lado del ácido más débil (pKa mayor).', slide: 17 })
      ],
      fundamentals: [
        { id: 'f41', title: 'Desde cero: Ka y pKa', body: 'El **Ka** mide cuánto suelta un ácido su H⁺. El **pKa = −log Ka**: un pKa **bajo** es un ácido fuerte; un pKa **alto**, un ácido débil. Cada unidad de pKa es un factor 10.',
          deeper: 'Ácido acético, pKa 4,76; ion amonio de la trietilamina, pKa 10,76. Diferencia: 6 unidades = 10⁶. El ácido acético es un millón de veces más ácido.' },
        { id: 'f42', deeper: 'Imagina dos especies peleando por un H⁺. Se lo queda la que lo agarra más fuerte, y esa forma el **ácido más débil** (el que menos quiere soltarlo, de pKa más alto). Por eso el equilibrio siempre termina del lado del ácido con **pKa mayor**.', title: 'Desde cero: el lado débil gana', body: 'En HA + B ⇌ A⁻ + BH⁺ compiten dos ácidos: HA y BH⁺. El equilibrio se desplaza hacia el lado del **ácido más débil** (el de pKa mayor), que es el que menos quiere soltar su H⁺.' },
        { id: 'f43', deeper: 'Toda base tiene su «pareja ácida»: ella misma con un H⁺ más. Si la base es fuerte, su pareja ácida es débil, y al revés. En números, en agua: **pKa + pKb = 14**. Si el ion metilamonio tiene pKa 10,6, la metilamina tiene pKb 14 − 10,6 = **3,4**.', title: 'Desde cero: pares conjugados', body: 'Base + H⁺ → ácido conjugado. Para un par conjugado en agua a 25 °C: **Ka · Kb = Kw = 1,0 × 10⁻¹⁴**, es decir, **pKa + pKb = 14**.', rows: [['pKa del ion amonio', '10,6'], ['pKb de la amina', '14 − 10,6 = 3,4']] }
      ],
      explain: [
        { id: 'b41', deeper: 'Pregúntale al ion amonio: «¿te cuesta soltar tu H⁺?». Si su pKa es **alto** (10–11), le cuesta mucho: la amina lo agarra fuerte, es una base **fuerte**. Si el pKa es **bajo** (4,6 en la anilina), lo suelta fácil: la amina es una base **débil**.', title: 'La basicidad se mide con el pKa del ion amonio', slide: 18, body: 'En vez de dar el Kb de la amina, normalmente se da el **pKa de su ácido conjugado** (el ion amonio, a veces escrito pKaH). Mientras **más alto**, **más básica** la amina.',
          rows: [['NH₄⁺ (amoníaco)', 'pKa 9,25'], ['CH₃NH₃⁺ (metilamina)', 'pKa 10,66'], ['C₆H₅NH₃⁺ (anilina)', 'pKa 4,6']] },
        { id: 'b42', deeper: 'Compara los dos pKa: acético 4,76 contra trietilamonio 10,76. Son 6 unidades y cada una vale un factor 10: la constante del equilibrio es **10⁶**. El H⁺ se va con quien lo agarra más fuerte (la amina), así que el equilibrio queda muy desplazado hacia la sal. La diapositiva lo resume como «1 de cada 1.000.000 queda neutra».', title: 'Trietilamina + ácido acético', slide: 17, body: 'Los ácidos en juego: ácido acético (pKa 4,76) e ion trietilamonio (pKa 10,76). El equilibrio favorece al ácido más débil, el ion amonio: la amina queda **casi toda protonada**, solo 1 de cada 1.000.000 moléculas queda neutra.',
          note: 'Por eso las aminas se protonan incluso con ácidos débiles: son bases más fuertes que alcoholes o éteres.' },
        { id: 'b43', deeper: 'pKa y pKb miden lo mismo desde dos lados. Si te dan el pKb de la amina, réstalo de 14 y tienes el pKa del ion amonio: pKb 3,36 → pKa **10,64**. Así comparas todas las aminas en una sola escala.', title: 'Ka y Kb', slide: 20, body: 'Si te dan Kb (o pKb) de la amina, puedes pasar al pKa del ion amonio con **pKa + pKb = 14**. Vale para cualquier par ácido–base conjugado.' }
      ],
      worked: {
        prompt: 'Metilamina + ácido acético. ¿Hacia dónde va el equilibrio y con qué fuerza?',
        steps: [
          { text: 'Identifica los dos ácidos: **CH₃COOH** (pKa 4,76) a la izquierda y **CH₃NH₃⁺** (pKa 10,66) a la derecha.' },
          { text: 'El equilibrio favorece al ácido más débil: el **CH₃NH₃⁺** (pKa mayor). Va hacia los **productos**: la amina se protona.', ask: '¿Cuál de los dos ácidos es más débil?' },
          { text: 'Cuánto: 10^(10,66 − 4,76) = 10^5,9 ≈ **8 × 10⁵**. La constante de equilibrio es enorme.', ask: '¿Cómo calculas la K del equilibrio con los pKa?' }
        ]
      },
      practice: [
        q('m4-p1', 'Amina A: pKa del ion amonio 10,7. Amina B: 4,6. ¿Cuál es más básica?', [{ text: 'A', correct: true }, { text: 'B', misconception: 'pka-inverted' }, { text: 'Igual de básicas', note: 'Hay 6 unidades de diferencia: un millón de veces.' }], { explain: 'Mayor pKa del ion amonio = base más fuerte. A podría ser una alquilamina; B se parece a la anilina.', slide: 18, hint: 'pKa alto del ion amonio = le cuesta soltar el H⁺.' }),
        q('m4-p2', 'El pKa de un ion amonio es 10,6. ¿Cuál es el pKb de la amina?', [{ text: '3,4', correct: true }, { text: '10,6', note: 'Ese es el pKa del ácido conjugado, no el pKb.' }, { text: '24,6', misconception: 'sum14' }], { explain: 'pKa + pKb = 14 → pKb = 14 − 10,6 = 3,4.', slide: 20, hint: 'pKa + pKb = 14.' }),
        order('m4-p3', 'Ordena de menor a mayor basicidad usando el pKa de su ion amonio.', [['an', 'Anilina (4,6)'], ['nh3', 'Amoníaco (9,25)'], ['me', 'Metilamina (10,66)']], ['an', 'nh3', 'me'],
          { direction: 'De menor a mayor basicidad.', explain: 'Mayor pKa del ion amonio = más básica: anilina < amoníaco < metilamina.', misconception: 'pka-inverted', slide: 18, hint: 'Ordena por el número entre paréntesis.' })
      ],
      transfer: [
        q('m4-t1', 'Trietilamina en presencia de ácido acético. ¿En qué forma está mayoritariamente?', [{ text: 'Protonada, como ion trietilamonio', correct: true }, { text: 'Mitad y mitad', note: 'Con 6 unidades de diferencia de pKa no hay empate.' }, { text: 'Casi toda neutra', misconception: 'strong-side' }], { explain: 'El ion amonio (pKa 10,76) es un ácido mucho más débil que el acético (4,76): el equilibrio está desplazado a la sal. Solo 1 de cada millón queda neutra.', slide: 17 }),
        q('m4-t2', 'Un ácido HA (pKa 5) reacciona con una amina cuyo ion amonio tiene pKa 9. El equilibrio está…', [{ text: 'Desplazado hacia la sal (productos)', correct: true }, { text: 'Desplazado hacia los reactivos', misconception: 'strong-side' }, { text: 'Exactamente en el medio', note: 'Hay 4 unidades de diferencia: K = 10⁴.' }], { explain: 'El ion amonio (pKa 9) es el ácido más débil: se favorece su formación, con K = 10^(9−5) = 10⁴.', slide: 17 }),
        write('m4-w1', 'Explícalo con tus palabras: ¿por qué la trietilamina queda casi toda protonada en ácido acético?',
          'Compito los dos ácidos del equilibrio: el ácido acético (pKa 4,76) y el ion trietilamonio (pKa 10,76). El equilibrio favorece al ácido más débil, el de pKa mayor: el ion trietilamonio. Como la diferencia es de 6 unidades (K = 10⁶), casi toda la amina queda protonada.',
          ['Comparé los pKa de los dos ácidos (4,76 y 10,76)', 'Dije que el equilibrio favorece al ácido más débil (el de pKa mayor)', 'Concluí que la amina queda como ion trietilamonio'],
          { explain: 'El H⁺ termina donde lo agarran más fuerte: en el lado del ácido más débil.', slide: 17 })
      ]
    }
  },
  /* ── Misión 5 ── */
  {
    id: 'm5', title: 'Basicidad II: qué la sube y qué la baja', subtitle: 'Resonancia, sustituyentes, heterociclos e hibridación: la pregunta 3 de la PEP', minutes: 18, slides: '21–28', pep: 'pregunta 3 (1,0 pt)',
    stages: {
      diagnostic: [
        q('m5-d1', '¿Cuál es más básica: ciclohexilamina o anilina?', [{ text: 'Ciclohexilamina', correct: true }, { text: 'Anilina', misconception: 'aromatic-more' }, { text: 'Igual, ambas son aminas primarias', note: 'Ser primarias no basta: importa si el par está deslocalizado.' }], { explain: 'En la anilina el par del N se deslocaliza en el anillo. Ciclohexilamina: pKa del ion amonio 10,6; anilina: 4,6.', slide: 23 }),
        q('m5-d2', '¿Cuál es más básica: piridina o pirrol?', [{ text: 'Piridina', correct: true }, { text: 'Pirrol', misconception: 'pyrrole-pair' }, { text: 'Igual, ambos son aromáticos con N', misconception: 'pyrrole-pair' }], { explain: 'El par de la piridina no participa en la aromaticidad; el del pirrol sí. La piridina es unas 10⁵ veces más básica.', slide: 26 })
      ],
      fundamentals: [
        { id: 'f51', title: 'Desde cero: resonancia', body: 'Cuando un par libre está junto a enlaces π con orbitales p alineados, sus electrones pueden **repartirse** sobre varios átomos. Repartir = **estabilizar**. Un par repartido está menos disponible para captar un H⁺.',
          deeper: 'En la anilina el N está pegado al anillo: su par se mete en el sistema π del benceno. Para protonar el N hay que "sacar" ese par del anillo y se pierde la estabilización. Por eso la anilina prefiere no protonarse: es menos básica.', slide: 23 },
        { id: 'f52', title: 'Desde cero: aromaticidad en un minuto', body: 'Un anillo **plano**, **conjugado** y con **4n + 2 electrones π** (2, 6, 10…, regla de Hückel) es aromático: muy estable. Perder la aromaticidad cuesta mucha energía.',
          deeper: 'Pirrol: anillo de 5 con un N–H. Para llegar a 6 electrones π necesita los 2 del par libre del N. Si protonas ese N, el par se va al enlace con el H⁺ y el anillo deja de ser aromático. Piridina: anillo de 6 como el benceno; ya tiene 6 electrones π sin el par del N, que queda libre "afuera" en un orbital sp².' },
        { id: 'f53', deeper: 'Piensa en los electrones como una frazada que comparten los átomos. Un grupo **electronegativo** (O, Cl, NO₂) tira la frazada para su lado y deja al N con menos: le cuesta más atrapar un H⁺ (**menos básico**). Un **alquilo** empuja un poco de frazada hacia el N (**más básico**).', title: 'Desde cero: efecto inductivo', body: 'Átomos o grupos **electronegativos** (O, Cl, NO₂) atraen densidad electrónica a través de los enlaces σ y la sacan del N: bajan la basicidad. Los grupos alquilo **donan** un poco: la suben.' }
      ],
      explain: [
        { id: 'b51', deeper: 'En la anilina, el par libre del N no se queda en el N: se **reparte por el anillo** (resonancia). Repartido, está menos disponible para atrapar un H⁺. En la ciclohexilamina el par se queda en el N, listo para usarse. Por eso la anilina es **un millón de veces** menos básica (pKa 4,6 contra 10,6).', title: 'Resonancia: arilaminas débiles', slide: 25, body: 'En las arilaminas el par del N está deslocalizado por el anillo, así que el ion amonio es más ácido (pKa menor) que el de una alquilamina.', rows: [['Ciclohexilamina', 'pKa 10,6'], ['Anilina', 'pKa 4,6']] },
        { id: 'b52', deeper: 'En una amida el N está pegado a un **C=O**, un gran «ladrón» de electrones. El par libre del N se va hacia el oxígeno por resonancia. Resultado: el N casi no tiene par disponible, así que **no atrapa H⁺** (no es básico) **ni ataca carbonos** (no es nucleófilo).', title: 'Amidas: el caso extremo', slide: 22, body: 'En una amida (R–CO–NH₂) el par del N se deslocaliza hacia el C=O. El N casi no tiene densidad electrónica: **no es básico ni nucleófilo**.' },
        { id: 'b53', deeper: 'El anillo es un puente entre el sustituyente y el N. Si el sustituyente **da** electrones (–OCH₃), le llegan un poco al N y la amina es algo más básica. Si los **quita** con fuerza (–NO₂), le roba todavía más al N: la p-nitroanilina (pKa 1,0) es unas **4.000 veces** menos básica que la anilina.', title: 'Sustituyentes en el anillo', slide: 24, body: 'Un **donador** (–OCH₃) devuelve densidad al anillo y sube un poco la basicidad. Un **aceptor** (–NO₂) saca todavía más densidad del N y la baja mucho.',
          rows: [['p-Metoxianilina', 'pKa 5,3'], ['Anilina', 'pKa 4,6'], ['p-Nitroanilina', 'pKa 1,0']] },
        { id: 'b54', deeper: 'Los dos tienen el N en un anillo aromático, pero el par libre está en lugares distintos. En el **pirrol**, el par es parte de los 6 electrones aromáticos: si lo usara para atrapar un H⁺, el anillo dejaría de ser aromático, y no le conviene. En la **piridina**, el par apunta hacia afuera del anillo y no participa en la aromaticidad: puede atrapar un H⁺ sin perder nada.', title: 'Pirrol y piridina', slide: 26, body: 'En el **pirrol** el par libre es parte del sexteto aromático: protonarlo destruiría la aromaticidad, así que es una base extremadamente débil. En la **piridina** el par está en un orbital sp², fuera del sistema π: se puede protonar sin perder la aromaticidad.', note: 'La piridina es unas 100.000 veces más básica que el pirrol.' },
        { id: 'b55', deeper: 'Más carácter **s** = electrones más cerca del núcleo = más «apretados». El N **sp³** (25 % s) los tiene sueltos y los presta fácil; el **sp²** (33 %) un poco menos; el **sp** (50 %) casi nada. Por eso: alquilamina (sp³) > piridina (sp²) > nitrilo (sp).', title: 'Hibridación y basicidad', slide: 27, body: 'Un orbital con más carácter s mantiene sus electrones más cerca del núcleo: están menos disponibles. Basicidad: **sp³ > sp² > sp**.',
          rows: [['Alquilamina (N sp³)', 'pKa 10–11'], ['Piridina (N sp²)', 'pKa 5,2'], ['Acetonitrilo (N sp)', 'pKb 24: muy débil']] },
        { id: 'b56', deeper: 'Hay dos efectos peleando. **1.** Cada alquilo empuja electrones al N: más grupos, más básica. **2.** En agua, el ion amonio se estabiliza con puentes de H usando los H del N: más grupos, menos H, menos estabilizado. La **secundaria** queda con el mejor balance; la terciaria dona más, pero casi no se estabiliza en agua.', title: 'En agua: 2° > 1° > 3°', slide: 25, body: 'Los alquilos donan densidad (suben la basicidad), pero en agua también importa cuánto se estabiliza el ion amonio con puentes de H. El balance deja a las secundarias arriba.',
          rows: [['Dimetilamina', 'pKa 10,73'], ['Metilamina', 'pKa 10,66'], ['Trimetilamina', 'pKa 9,80']], note: 'Este orden viene de tu apunte y de tablas estándar; la diapositiva 25 da el rango 10–11 para alquilaminas.' }
      ],
      worked: {
        prompt: 'Ordena de menor a mayor basicidad: anilina, ciclohexilamina y p-nitroanilina.',
        steps: [
          { text: 'Primero pregunta: **¿el par del N está libre o deslocalizado?** En la ciclohexilamina está libre (N sp³, sin anillo aromático): será la más básica.' },
          { text: 'En la anilina y la p-nitroanilina el par se deslocaliza en el anillo: ambas son mucho menos básicas.', ask: '¿Qué tienen en común anilina y p-nitroanilina?' },
          { text: 'El –NO₂ es un aceptor fuerte: saca todavía más densidad del N. La **p-nitroanilina** es la menos básica.', ask: '¿Qué hace el –NO₂ con la densidad del N?' },
          { text: 'Orden: **p-nitroanilina (1,0) < anilina (4,6) < ciclohexilamina (10,6)**.' }
        ]
      },
      practice: [
        order('m5-p1', 'Ordena de menor a mayor basicidad.', [['nitro', 'p-Nitroanilina'], ['an', 'Anilina'], ['meo', 'p-Metoxianilina'], ['cy', 'Ciclohexilamina']], ['nitro', 'an', 'meo', 'cy'],
          { direction: 'De menor a mayor basicidad.', explain: 'p-Nitroanilina (1,0) < anilina (4,6) < p-metoxianilina (5,3) < ciclohexilamina (10,6).', misconception: 'subst-effect', slide: 24, hint: 'Primero separa la que no tiene anillo; después mira donador y aceptor.' }),
        pick('m5-p2', 'La nicotina tiene dos nitrógenos. Toca el más básico.', [[{ t: 'N del anillo de seis (aromático)', target: 'pyr' }], [{ t: 'N–CH₃ del anillo de cinco (saturado)', target: 'pyrr' }]],
          { pyr: { label: 'N de la piridina', misconception: 'hybrid-s' }, pyrr: { label: 'N de la pirrolidina' } }, 'pyrr',
          { explain: 'El N de la pirrolidina es sp³ con su par libre localizado (su ion amonio tiene pKa ≈ 8). El de la piridina es sp²: su par está más retenido (pKa ≈ 3 en la nicotina). Justo lo que pregunta la PEP: "¿cuál N es más básico?"', slide: 27, captions: ['Nicotina'], hint: '¿Cuál de los dos N es como el de una amina común, y cuál como el de la piridina?' }),
        pick('m5-p3', 'En H₂N–CH₂–CH₂–NH–CO–CH₃, toca el nitrógeno más básico.', [[{ t: 'H₂N', target: 'amine' }, { t: '–CH₂–CH₂–' }, { t: 'NH', target: 'amide' }, { t: '–CO–CH₃' }]],
          { amine: { label: 'El NH₂ (amina)' }, amide: { label: 'El NH de la amida', misconception: 'amide-basic' } }, 'amine',
          { explain: 'El NH₂ es una amina alifática con su par libre disponible. El NH pegado al C=O es una amida: su par está deslocalizado y no es básico.', slide: 22, captions: ['N-(2-aminoetil)acetamida'], hint: '¿Cuál N está pegado a un C=O?' }),
        classify('m5-p4', '¿Este factor sube o baja la basicidad del N?', [['up', 'Sube la basicidad'], ['down', 'Baja la basicidad']],
          [['res', 'Par libre deslocalizado en un anillo aromático', 'down'], ['no2', 'Grupo –NO₂ en el anillo', 'down'], ['sp', 'N con hibridación sp', 'down'], ['ome', 'Grupo –OCH₃ en para', 'up'], ['alk', 'Grupo alquilo unido al N (frente al NH₃)', 'up'], ['amide', 'N unido a un C=O (amida)', 'down']],
          { explain: 'Todo lo que deja el par menos disponible (resonancia, aceptores, más carácter s, amidas) baja la basicidad; los donadores la suben.', misconception: 'subst-effect', slide: 24, hint: 'Pregúntate: ¿el par queda más libre o más retenido?' })
      ],
      challenge: [
        order('m5-c1', 'Desafío: ordena de menor a mayor basicidad.', [['cn', 'Acetonitrilo (N sp)'], ['py', 'Piridina (N sp²)'], ['et3n', 'Trietilamina (N sp³)']], ['cn', 'py', 'et3n'],
          { direction: 'De menor a mayor basicidad.', explain: 'Más carácter s, menos básico: sp (acetonitrilo, pKb 24) < sp² (piridina, 5,2) < sp³ (trietilamina, 10,75).', misconception: 'hybrid-s', slide: 27, hint: 'Más carácter s retiene más los electrones.' })
      ],
      transfer: [
        order('m5-t1', 'Estilo PEP: ordena de menor a mayor basicidad.', [['pyrrole', 'Pirrol'], ['pyridine', 'Piridina'], ['piperidine', 'Piperidina (anillo saturado con N–H)']], ['pyrrole', 'pyridine', 'piperidine'],
          { direction: 'De menor a mayor basicidad.', explain: 'Pirrol (par en el sexteto aromático) < piridina (sp², pKa 5,2) < piperidina (sp³, pKa ≈ 11).', misconception: 'pyrrole-pair', slide: 26 }),
        q('m5-t2', '¿Por qué el pirrol casi no es básico?', [{ text: 'Porque protonar su N destruiría la aromaticidad', correct: true }, { text: 'Porque su N no tiene par libre', note: 'Sí lo tiene, pero ese par forma parte del sexteto aromático.' }, { text: 'Porque su N es sp³', misconception: 'pyrrole-pair' }], { explain: 'Su par libre es uno de los 6 electrones π. Usarlo para captar un H⁺ rompe la aromaticidad: cuesta demasiado.', slide: 26 }),
        write('m5-w1', 'Explícalo con tus palabras: ¿por qué la anilina es mucho menos básica que la ciclohexilamina?',
          'En la anilina el par libre del N está deslocalizado en el anillo por resonancia, así que está menos disponible para captar un H⁺. Además, al protonarla se pierde esa estabilización. En la ciclohexilamina el par queda localizado en el N. Por eso el pKa del ion anilinio es 4,6 y el del ciclohexilamonio 10,6.',
          ['Dije que el par libre de la anilina se reparte en el anillo (resonancia)', 'Dije que así está menos disponible para captar un H⁺', 'Comparé con la ciclohexilamina, donde el par queda en el N'],
          { explain: 'Un par repartido es un par menos disponible.', slide: 23 })
      ]
    }
  },
  /* ── Misión 6 ── */
  {
    id: 'm6', title: 'Síntesis de aminas', subtitle: 'Alquilación, azida, Gabriel, aminación reductiva y reducciones: las preguntas 4 y 6 de la PEP', minutes: 18, slides: '29–33', pep: 'preguntas 4 y 6',
    stages: {
      diagnostic: [
        q('m6-d1', '¿Qué problema tiene preparar una amina primaria con NH₃ + R–X?', [{ text: 'Sigue reaccionando y da mezcla de aminas', correct: true }, { text: 'El NH₃ no reacciona con haluros', note: 'Sí reacciona: es nucleófilo.' }, { text: 'Solo funciona con anillos aromáticos', note: 'Funciona con haluros de alquilo (SN2).' }], { explain: 'La amina formada también ataca al R–X: se forma una mezcla de 1°, 2°, 3° y sal cuaternaria (polialquilación).', slide: 30 }),
        q('m6-d2', '¿Qué hace el LiAlH₄?', [{ text: 'Reduce (agrega H)', correct: true }, { text: 'Oxida', note: 'Es justo lo contrario: es un reductor fuerte.' }, { text: 'Deshidrata alcoholes', note: 'Eso lo hace un ácido fuerte con calor.' }], { explain: 'LiAlH₄ es un reductor fuerte: convierte azidas y amidas en aminas.', slide: 31 })
      ],
      fundamentals: [
        { id: 'f61', title: 'Desde cero: SN2 en un minuto', body: 'Un **nucleófilo** ataca al C unido a un grupo saliente (Cl, Br, I) por el lado opuesto y lo desplaza **en un solo paso**. Funciona mejor en carbonos primarios.', deeper: 'Ejemplo: N₃⁻ + CH₃CH₂CH₂Br → CH₃CH₂CH₂N₃ + Br⁻. El nucleófilo entra y el bromuro sale al mismo tiempo.' },
        { id: 'f62', deeper: 'Truco para reconocer una reducción: **cuenta los H y los O**. Si la molécula ganó H o perdió O, se redujo. R–C≡N → R–CH₂–NH₂ ganó 4 H; Ar–NO₂ → Ar–NH₂ perdió 2 O y ganó 2 H. Los reactivos que hacen eso son los **reductores**: LiAlH₄, NaBH₃CN, H₂/Pt, Fe/HCl, Sn/HCl.', title: 'Desde cero: reducir', body: 'En orgánica, **reducir** es agregar H o quitar O. Reductores típicos: **LiAlH₄**, **NaBH₃CN**, **H₂ con catalizador (Pt)** y metales en ácido (**Fe/HCl**, **Sn/HCl**).' }
      ],
      explain: [
        { id: 'b61', deeper: 'El NH₃ ataca al R–X y forma R–NH₂. El problema: esa amina nueva **también tiene par libre**, y es mejor nucleófila que el NH₃ (el R le dona electrones). Entonces compite por el R–X que queda y forma R₂NH, después R₃N y al final R₄N⁺. Para que gane la primaria se usa **mucho NH₃**: así el R–X choca casi siempre con NH₃.', title: 'Alquilación del amoníaco', slide: 30, body: 'NH₃ + R–X → R–NH₂, pero la amina producto también es nucleófila (incluso más) y vuelve a atacar: se obtiene una **mezcla** de 1°, 2°, 3° y sal cuaternaria. Un gran exceso de NH₃ favorece la primaria.' },
        { id: 'b62', deeper: 'La azida (N₃⁻) ataca una vez y queda como R–N₃, que **ya no es nucleófila**: no puede volver a atacar. Entra un solo R. Después el LiAlH₄ reduce el R–N₃ a R–NH₂ y se libera N₂. Resultado: **amina primaria limpia**.', title: 'Síntesis de azida', slide: 31, body: '**R–X + NaN₃ → R–N₃** (SN2) y luego **LiAlH₄ → R–NH₂**. La azida entra una sola vez: no hay polialquilación.' },
        { id: 'b63', title: 'Síntesis de Gabriel', slide: 31, body: 'Ftalimida + KOH → **N⁻** (nucleófilo). + R–X (SN2) → **N-alquilftalimida**. + hidrazina (H₂N–NH₂) o hidrólisis → **R–NH₂** (amina primaria).',
          deeper: 'Por qué no sobrealquila: en la N-alquilftalimida el N ya no tiene H y su par está deslocalizado entre los dos C=O. No ataca a otro R–X. Al final la hidrazina corta los enlaces C–N del anillo y libera R–NH₂.' },
        { id: 'b64', deeper: '**Paso 1:** el N ataca al C=O y, al perder agua, se forma una **imina** (C=N). **Paso 2:** el reductor convierte el C=N en C–N. Para predecir el producto: el C del carbonilo queda unido al N, y el N gana **un grupo más** del que tenía (NH₃ → 1°, 1° → 2°, 2° → 3°).', title: 'Aminación reductiva', slide: 32, body: 'Aldehído o cetona + NH₃ o una amina, con un reductor (NaBH₃CN o H₂/catalizador). Se forma una imina que se reduce a amina. El tipo de producto depende de lo que pongas.',
          rows: [['Con NH₃', 'amina 1°'], ['Con amina 1°', 'amina 2°'], ['Con amina 2°', 'amina 3°']] },
        { id: 'b65', deeper: 'Dos caminos más. Con una **amida**, el LiAlH₄ convierte el C=O en CH₂ y el N se queda donde estaba: R–CO–NH₂ → R–CH₂–NH₂. Con un **nitrobenceno**, la reducción le quita los O al NO₂ y le pone H: Ar–NO₂ → Ar–NH₂. Es la forma típica de poner un NH₂ en un anillo.', title: 'Otras rutas: amidas y nitroarenos', slide: 29, body: 'Una **amida + LiAlH₄** da R–CH₂–NH₂ (el C=O se vuelve CH₂). Un **nitrobenceno** se reduce a **anilina** con H₂/Pt, Fe/HCl o Sn/HCl.' }
      ],
      worked: {
        prompt: 'PEP 1 2025, pregunta 6b: ftalimida + 1) KOH, 2) CH₃CH₂CH₂Br, 3) H₂NNH₂. ¿Producto?',
        steps: [
          { text: 'El KOH le quita el H al N de la ftalimida: queda un **N⁻ nucleófilo**.' },
          { text: 'El N⁻ ataca al CH₃CH₂CH₂Br por SN2: se forma la **N-propilftalimida**.', ask: '¿Qué hace el N⁻ con el bromuro de propilo?' },
          { text: 'La hidrazina libera la amina: **CH₃CH₂CH₂NH₂, propilamina**. Es la respuesta de la pauta.', ask: '¿Qué libera la hidrazina?' }
        ]
      },
      practice: [
        q('m6-p1', '¿Por qué NH₃ + R–X da mezcla de aminas?', [{ text: 'La amina formada también es nucleófila y sigue reaccionando', correct: true }, { text: 'El NH₃ se descompone', note: 'No se descompone: actúa como nucleófilo.' }, { text: 'Se forma un alqueno', note: 'La eliminación puede competir, pero no explica la mezcla de aminas.' }], { explain: 'Cada amina formada ataca de nuevo al haluro: polialquilación.', slide: 30, hint: '¿El producto todavía tiene un par libre?' }),
        match('m6-p2', 'Une cada reactivo con lo que logra.', [['NaN₃, luego LiAlH₄', 'R–X → R–NH₂ (vía azida)'], ['Ftalimida/KOH, R–X, luego H₂NNH₂', 'Gabriel: amina primaria'], ['Cetona + NH₃ + NaBH₃CN', 'Aminación reductiva'], ['Fe/HCl sobre nitrobenceno', 'Anilina'], ['LiAlH₄ sobre una amida', 'R–CO–NH₂ → R–CH₂–NH₂']],
          { explain: 'Haluros: azida o Gabriel. Carbonilos: aminación reductiva. Amidas y nitroarenos: reducción.', slide: 33, hint: 'Parte por los nombres que conoces: Gabriel y aminación reductiva.' }),
        order('m6-p3', 'Ordena los pasos de la síntesis de Gabriel.', [['koh', 'Ftalimida + KOH (forma el N⁻)'], ['sn2', 'N⁻ + R–Br (SN2)'], ['hyd', 'Hidrazina (libera R–NH₂)']], ['koh', 'sn2', 'hyd'],
          { direction: 'Del primer al último paso.', explain: 'Primero se genera el nucleófilo, luego la alquilación y al final se libera la amina.', slide: 31, hint: '¿Qué necesitas antes de poder atacar al R–Br?' })
      ],
      challenge: [
        q('m6-c1', 'Benzaldehído + metilamina + NaBH₃CN. ¿Producto?', [{ text: 'N-Metilbencilamina, C₆H₅CH₂–NH–CH₃', correct: true }, { text: 'Bencilamina, C₆H₅CH₂–NH₂', note: 'Para la primaria se usaría NH₃.' }, { text: 'N,N-Dimetilbencilamina', note: 'Se necesitaría dimetilamina.' }], { explain: 'Aminación reductiva con una amina primaria: se obtiene una amina secundaria.', slide: 32, hint: 'Con amina 1° se obtiene…' })
      ],
      transfer: [
        q('m6-t1', 'Ftalimida + 1) KOH, 2) CH₃CH₂CH₂Br, 3) H₂NNH₂. ¿Producto?', [{ text: 'Propilamina', correct: true }, { text: 'Dipropilamina', misconception: 'gabriel-poly' }, { text: 'N-Propilftalimida', misconception: 'gabriel-stop' }], { explain: 'Gabriel da solo la amina primaria: CH₃CH₂CH₂NH₂.', slide: 31 }),
        q('m6-t2', 'Estilo PEP (pregunta 4b): ¿cómo preparas C₆H₅–CH₂–N(CH₃)₂?', [{ text: 'Cloruro de benzoílo + dimetilamina, luego LiAlH₄', correct: true }, { text: 'Bencilamina + CH₃I en exceso', misconception: 'overalkylation' }, { text: 'Benceno + dimetilamina', note: 'El benceno no reacciona así con aminas.' }], { explain: 'La amida C₆H₅–CO–N(CH₃)₂ se reduce con LiAlH₄: el C=O pasa a CH₂. Es la ruta de la pauta 2025.', slide: 33 })
      ]
    }
  },
  /* ── Misión 7 ── */
  {
    id: 'm7', title: 'Reacciones de aminas', subtitle: 'Acilación, eliminación de Hofmann y sales de diazonio', minutes: 18, slides: '34–40', pep: 'preguntas 4 y 6',
    stages: {
      diagnostic: [
        q('m7-d1', 'En una E2 común, ¿qué alqueno suele predominar?', [{ text: 'El más sustituido (Zaitsev)', correct: true }, { text: 'El menos sustituido', note: 'Eso pasa en casos especiales, como Hofmann.' }, { text: 'Siempre mitad y mitad', note: 'Hay preferencia según estabilidad y estérico.' }], { explain: 'Normalmente gana el alqueno más sustituido. Hofmann es la excepción que veremos.', slide: 36 }),
        q('m7-d2', '¿Qué reactivo convierte la anilina en sal de bencenodiazonio?', [{ text: 'NaNO₂ con HCl, en frío', correct: true }, { text: 'HNO₃ / H₂SO₄', misconception: 'nitration-confusion' }, { text: 'CuCl', note: 'El CuCl se usa después, sobre la sal de diazonio.' }], { explain: 'NaNO₂/HCl a 0–5 °C transforma Ar–NH₂ en Ar–N₂⁺.', slide: 39 })
      ],
      fundamentals: [
        { id: 'f71', deeper: 'Tres cosas pasan **al mismo tiempo**: la base saca un H del carbono vecino, esos electrones forman el doble enlace C=C y el grupo saliente se va con su par. Para que funcione, el H y el grupo saliente deben estar en **lados opuestos** (anti), como dos personas en los extremos de una cuerda.', title: 'Desde cero: eliminación E2', body: 'Una base quita un H del carbono **vecino** al que lleva el grupo saliente, se forma un doble enlace y el grupo sale, todo **en un paso**. El H y el grupo saliente deben estar **anticoplanares** (en lados opuestos).' },
        { id: 'f72', deeper: 'Un buen grupo saliente es uno que queda **estable** cuando se va con los electrones: I⁻, Br⁻, H₂O, N₂. El NH₂⁻ es una base fortísima e inestable: no quiere salir. El truco de Hofmann es convertir el N en **–N(CH₃)₃⁺**, que sale como trimetilamina neutra y estable.', title: 'Desde cero: buen grupo saliente', body: 'Sale bien un grupo que queda estable con el par de electrones: I⁻, Br⁻, H₂O, N₂. El NH₂⁻ es pésimo. Por eso, para eliminar una amina, primero se convierte en –N(CH₃)₃⁺, que sale como N(CH₃)₃ neutra.' }
      ],
      explain: [
        { id: 'b71', deeper: 'El N ataca al C=O del cloruro de ácido y el Cl se va. El N **cambia uno de sus H** por el grupo acilo (R–C=O). Para eso necesita tener al menos un H: las aminas **1° y 2°** pueden; la **3°** no tiene H que cambiar. El HCl que se forma lo atrapa otra amina o una base.', title: 'Acilación: de amina a amida', slide: 34, body: 'Una amina **1° o 2°** + cloruro de ácido (o anhídrido) → **amida** + HCl. El N cambia su H por el grupo acilo. Una terciaria no tiene H en el N: no forma amida.', rows: [['CH₃CH₂NH₂ + CH₃COCl', 'CH₃CH₂NH–COCH₃ + HCl']] },
        { id: 'b72', title: 'Eliminación de Hofmann', slide: 35, body: '1) **CH₃I en exceso**: la amina se metila hasta sal de amonio cuaternario. 2) **Ag₂O, H₂O**: el contraión pasa a OH⁻. 3) **Calor**: E2 que da un alqueno + N(CH₃)₃. El producto principal es el alqueno **MENOS** sustituido.',
          deeper: 'Por qué al revés de Zaitsev: el grupo saliente –N(CH₃)₃⁺ es enorme. En la conformación anticoplanar que lleva al alqueno más sustituido aparece una interacción gauche que sube la energía del estado de transición. El camino al menos sustituido es más barato y más rápido: control cinético (diap. 36–37).' },
        { id: 'b73', deeper: '**Paso 1:** conviertes el NH₂ del anillo en –N₂⁺ con NaNO₂ y HCl **en hielo** (a temperatura ambiente se descompone). **Paso 2:** como el N₂ quiere irse como gas, lo reemplazas por lo que necesites: Cu con Cl, Br o CN (Sandmeyer); HBF₄ y calor para F; agua caliente para OH; KI para I.', title: 'Sales de diazonio', slide: 40, body: 'Ar–NH₂ + NaNO₂/HCl (0–5 °C) → **Ar–N₂⁺**. El N₂ es un grupo saliente excelente: muchos reactivos lo reemplazan.',
          rows: [['CuCl / CuBr / CuCN (Sandmeyer)', 'Ar–Cl / Ar–Br / Ar–CN'], ['HBF₄, calor (Schiemann)', 'Ar–F'], ['H₂O, calor', 'Ar–OH (fenol)'], ['KI', 'Ar–I']] }
      ],
      worked: {
        prompt: 'Eliminación de Hofmann de la 2-butanamina, CH₃–CH(NH₂)–CH₂–CH₃.',
        steps: [
          { text: 'CH₃I en exceso: el N se metila tres veces → **CH₃–CH(N(CH₃)₃⁺)–CH₂–CH₃ I⁻**.' },
          { text: 'Ag₂O, H₂O: el I⁻ se cambia por **OH⁻**, que será la base.' },
          { text: 'Calor: E2. El OH⁻ quita un H del **CH₃** (el lado menos impedido), no del CH₂.', ask: '¿De qué carbono saca el H la base?' },
          { text: 'Producto principal: **1-buteno** (menos sustituido) + N(CH₃)₃ + H₂O.' }
        ]
      },
      practice: [
        q('m7-p1', 'En la eliminación de Hofmann, ¿qué alqueno predomina?', [{ text: 'El menos sustituido', correct: true }, { text: 'El más sustituido', misconception: 'zaitsev-hofmann' }, { text: 'No se forma alqueno', note: 'Sí: es una eliminación E2.' }], { explain: 'El grupo saliente voluminoso hace que gane el alqueno menos sustituido (control cinético).', slide: 36, hint: 'Piensa en el tamaño de –N(CH₃)₃⁺.' }),
        match('m7-p2', 'Une cada reactivo con el producto que forma desde una sal de arildiazonio.', [['CuCl', 'Ar–Cl'], ['CuCN', 'Ar–CN'], ['HBF₄, calor', 'Ar–F'], ['H₂O, calor', 'Ar–OH (fenol)'], ['KI', 'Ar–I']],
          { explain: 'Sandmeyer usa sales de cobre(I); Schiemann, HBF₄ para el flúor; agua caliente da fenol; KI da el yoduro.', slide: 40, hint: 'Sandmeyer = cobre.' }),
        q('m7-p3', '¿Cuál NO forma amida con cloruro de acetilo?', [{ text: 'Trimetilamina', correct: true }, { text: 'Etilamina', note: 'Es primaria: forma amida.' }, { text: 'Dietilamina', note: 'Es secundaria: forma amida.' }], { explain: 'La acilación reemplaza un H del N por el acilo. La trimetilamina no tiene H en el N.', slide: 34, hint: '¿Cuál no tiene H en el N?' })
      ],
      challenge: [
        order('m7-c1', 'Desafío: ordena la secuencia para obtener clorobenceno desde anilina.', [['diaz', 'Anilina + NaNO₂/HCl, 0–5 °C'], ['salt', 'Se forma la sal de bencenodiazonio'], ['cu', 'Se agrega CuCl (Sandmeyer)'], ['prod', 'Clorobenceno + N₂']], ['diaz', 'salt', 'cu', 'prod'],
          { direction: 'Del primer al último paso.', explain: 'Diazotación, sal de diazonio, Sandmeyer con CuCl y sale N₂.', slide: 40, hint: 'Primero hay que fabricar el buen grupo saliente.' })
      ],
      transfer: [
        q('m7-t1', '2-Butanamina + 1) CH₃I exceso 2) Ag₂O, H₂O, calor. ¿Producto principal?', [{ text: '1-Buteno', correct: true }, { text: '2-Buteno', misconception: 'zaitsev-hofmann' }, { text: '2-Butanol', note: 'No es una sustitución: es una eliminación E2.' }], { explain: 'Hofmann: el alqueno menos sustituido.', slide: 36 }),
        q('m7-t2', 'Estilo PEP (pregunta 4a): desde anilina, ¿cómo obtienes la sal C₆H₅N₂⁺?', [{ text: 'NaNO₂ / HCl en frío', correct: true }, { text: 'HNO₃ / H₂SO₄', misconception: 'nitration-confusion' }, { text: 'CH₃I en exceso', note: 'Eso metila el N; no forma diazonio.' }], { explain: 'La diazotación con NaNO₂/HCl (0–5 °C) es la respuesta de la pauta.', slide: 39 }),
        write('m7-w1', 'Explícalo con tus palabras: ¿por qué una amina terciaria no forma amida con cloruro de acetilo?',
          'Para formar la amida, el N ataca al C=O y después cambia uno de sus H por el grupo acilo. Una amina terciaria no tiene H en el N, así que no puede completar ese cambio y no se forma la amida neutra.',
          ['Dije que la amina terciaria no tiene H en el N', 'Expliqué que en la acilación el N cambia un H por el grupo acilo', 'Concluí que sin ese H no se forma la amida'],
          { explain: 'Acilar es cambiar un H del N por un acilo: sin H no hay cambio.', slide: 35 })
      ]
    }
  },
  /* ── Misión 8 ── */
  {
    id: 'm8', title: 'Espectroscopía de aminas', subtitle: 'Reconocer aminas en IR, RMN y masas', minutes: 12, slides: '44–47', pep: 'teoría',
    stages: {
      diagnostic: [
        q('m8-d1', '¿Cuántos picos N–H da una amina primaria en IR (3350–3500 cm⁻¹)?', [{ text: 'Dos', correct: true }, { text: 'Uno', misconception: 'ir-peaks' }, { text: 'Ninguno', misconception: 'ir-peaks' }], { explain: 'El NH₂ tiene estiramiento simétrico y asimétrico: dos picos.', slide: 44 }),
        q('m8-d2', 'Una masa molecular impar sugiere…', [{ text: 'Un número impar de átomos de N', correct: true }, { text: 'Que no hay nitrógeno', misconception: 'n-rule' }, { text: 'Un error de medición', note: 'Es normal y muy informativo: regla del nitrógeno.' }], { explain: 'Regla del nitrógeno: número impar de N → masa impar.', slide: 47 })
      ],
      fundamentals: [
        { id: 'f81', deeper: 'Piensa en los enlaces como **resortes**. Cada resorte vibra a su ritmo: los livianos y rígidos (N–H, O–H) vibran rápido, a números de onda altos. La luz IR que coincide con ese ritmo se absorbe y aparece como un **pico**. Mirando dónde están los picos, sabes qué enlaces hay.', title: 'Desde cero: IR', body: 'Cada enlace **vibra** a una frecuencia propia. El IR mide qué frecuencias absorbe la molécula: así reconoce grupos funcionales. Los N–H aparecen entre 3350 y 3500 cm⁻¹.' },
        { id: 'f82', deeper: 'C (12) y O (16) pesan número par. El N también (14), pero forma **3 enlaces**, un número impar, y eso obliga a que la molécula tenga un número **impar de H**. Un H impar hace la suma impar. Por eso un N (o 3, o 5…) da masa **impar**.', title: 'Desde cero: masa par o impar', body: 'Con C = 12, H = 1, O = 16 y N = 14, una molécula sin N (o con un número par de N) tiene masa **par**. Con un número impar de N, la masa es **impar**.', rows: [['C₄H₁₁N (butilamina)', '4·12 + 11 + 14 = 73, impar'], ['C₄H₁₀O (butanol)', '4·12 + 10 + 16 = 74, par']] }
      ],
      explain: [
        { id: 'b81', deeper: 'Cuenta los H del N y tendrás los picos. La **1°** (NH₂) tiene dos H, que vibran juntos o alternados: **dos picos**. La **2°** (NH) tiene uno: **un pico**. La **3°** no tiene H en el N: **ninguno** en esa zona.', title: 'IR de aminas', slide: 44, body: 'Primarias: **dos picos** N–H (3350–3500 cm⁻¹). Secundarias: **uno**. Terciarias: **ninguno**. Las N–H son menos intensas que las O–H.', note: 'Para detectar una terciaria se trata con HCl: el N–H⁺ resultante da señal entre 2200 y 3000 cm⁻¹.' },
        { id: 'b82', deeper: 'El N es electronegativo: le quita densidad a los H cercanos y estos aparecen a **más ppm**. Mientras más cerca del N, más efecto: H α ≈ 2,7 ppm, β ≈ 1,5 y γ ≈ 0,9 (ya casi como un alcano). El H del propio N da una **señal ancha** que cambia según la concentración.', title: 'RMN', slide: 45, body: 'En ¹H-RMN, el H unido al N da una **señal ancha** entre 0,5 y 5 ppm, y los H α al N aparecen entre **2 y 3 ppm**. En ¹³C-RMN, el C α aparece entre **30 y 50 ppm**.', rows: [['H α', '≈ 2,7 ppm'], ['H β', '≈ 1,5 ppm'], ['H γ', '≈ 0,9 ppm (sin efecto)']] },
        { id: 'b83', deeper: 'Dos pistas para reconocer una amina en masas. **1.** Si el ion molecular tiene masa **impar**, sospecha de un N. **2.** La molécula se corta en el enlace C–C **vecino al C unido al N**, porque el pedazo con el N queda como un catión estable (C=N⁺). Ese fragmento suele ser el pico más alto.', title: 'Espectrometría de masas', slide: 47, body: '**Regla del nitrógeno**: número impar de N → ion molecular de masa impar. Las aminas se rompen por **escisión α**: un radical y un catión estabilizado por resonancia.' }
      ],
      worked: {
        prompt: 'Un compuesto da M⁺ = 73 y en IR muestra dos picos cerca de 3400 cm⁻¹. ¿Qué es?',
        steps: [
          { text: 'Masa impar → número **impar de N** (lo más simple: uno).', ask: '¿Qué te dice una masa impar?' },
          { text: 'Dos picos N–H → **amina primaria**.' },
          { text: 'C₄H₁₁N = 48 + 11 + 14 = **73**. Es una amina primaria de 4 carbonos, por ejemplo **butilamina**.' }
        ]
      },
      practice: [
        classify('m8-p1', 'Clasifica cada pista o compuesto como amina 1°, 2° o 3°.', [['p1', 'Primaria'], ['p2', 'Secundaria'], ['p3', 'Terciaria']],
          [['two', 'Dos picos a 3350–3500 cm⁻¹', 'p1'], ['one', 'Un pico a 3350–3500 cm⁻¹', 'p2'], ['none', 'Sin señal a 3350–3500 cm⁻¹', 'p3'], ['et', 'Etilamina', 'p1'], ['det', 'Dietilamina', 'p2'], ['tet', 'Trietilamina', 'p3']],
          { explain: 'Picos N–H = cuántos N–H tiene: 1° dos, 2° uno, 3° ninguno.', misconception: 'ir-peaks', slide: 44, hint: 'Cuenta los H unidos al N.' }),
        q('m8-p2', 'Un compuesto tiene M⁺ = 59. ¿Qué indica?', [{ text: 'Número impar de N (por ejemplo C₃H₉N)', correct: true }, { text: 'No tiene nitrógeno', misconception: 'n-rule' }, { text: 'Tiene dos N', note: 'Dos N darían masa par.' }], { explain: '59 es impar: un número impar de N. C₃H₉N = 36 + 9 + 14 = 59 (propilamina u otra).', slide: 47, hint: 'Regla del nitrógeno.' }),
        match('m8-p3', 'Une cada núcleo con dónde aparece.', [['H α al N (¹H)', '2–3 ppm'], ['H unido al N (¹H)', 'Señal ancha, 0,5–5 ppm'], ['C α al N (¹³C)', '30–50 ppm']],
          { explain: 'El N desapantalla a sus vecinos: H α 2–3 ppm, C α 30–50 ppm; el N–H es ancho y variable.', slide: 45, hint: 'El que dice ¹³C va con el rango más grande.' })
      ],
      transfer: [
        q('m8-t1', 'Una amina C₃H₉N no muestra señal entre 3350 y 3500 cm⁻¹. ¿Cuál es?', [{ text: 'Trimetilamina', correct: true }, { text: 'Propilamina', misconception: 'ir-peaks' }, { text: 'Etilmetilamina', misconception: 'ir-peaks' }], { explain: 'Sin N–H → terciaria. De C₃H₉N, la única terciaria es (CH₃)₃N.', slide: 44 })
      ]
    }
  }
  );

  /* Conceptos: las hojas del árbol vivo (docs/clase-viva/DISENO.md §3). "needs" son sus prerrequisitos;
     los que empiezan con "base." son raíces que enseñará la clase base. */
  cls.concepts = [
    { id: 'base.lewis', title: 'Lewis y par libre', root: true },
    { id: 'base.carga', title: 'Cargas formales', root: true, needs: ['base.lewis'] },
    { id: 'base.acido-base', title: 'Ácido-base y pKa', root: true, needs: ['base.lewis'] },
    { id: 'base.sn-e', title: 'SN2 y E2', root: true, needs: ['base.lewis'] },
    { id: 'am.par-libre', mission: 'm1', title: 'El par libre: base y nucleófilo', needs: ['base.lewis', 'base.carga'] },
    { id: 'am.clasificacion', mission: 'm1', title: 'Aminas 1°, 2°, 3° y sales', needs: ['am.par-libre'] },
    { id: 'am.geometria', mission: 'm1', title: 'Forma e inversión del N', needs: ['am.par-libre'] },
    { id: 'am.nombres', mission: 'm2', title: 'Nombrar alquilaminas', needs: ['am.clasificacion'] },
    { id: 'am.nombres-aril', mission: 'm2', title: 'Anilinas y prioridad de grupos', needs: ['am.nombres'] },
    { id: 'am.fisicas', mission: 'm3', title: 'Ebullición y solubilidad', needs: ['am.clasificacion'] },
    { id: 'am.sales', mission: 'm3', title: 'Sales y extracción', needs: ['am.par-libre', 'base.acido-base'] },
    { id: 'am.pka', mission: 'm4', title: 'Basicidad con el pKa', needs: ['base.acido-base'] },
    { id: 'am.equilibrio', mission: 'm4', title: 'Hacia dónde va el equilibrio', needs: ['am.pka'] },
    { id: 'am.resonancia', mission: 'm5', title: 'Resonancia y sustituyentes', needs: ['am.pka'] },
    { id: 'am.heterociclos', mission: 'm5', title: 'Heterociclos e hibridación', needs: ['am.pka'] },
    { id: 'am.orden', mission: 'm5', title: 'Ordenar por basicidad (P3)', needs: ['am.resonancia', 'am.heterociclos'] },
    { id: 'am.alquilacion', mission: 'm6', title: 'Alquilación, azida y Gabriel', needs: ['am.par-libre', 'base.sn-e'] },
    { id: 'am.reduccion', mission: 'm6', title: 'Reducciones y aminación reductiva', needs: ['am.par-libre'] },
    { id: 'am.acilacion', mission: 'm7', title: 'Acilación: de amina a amida', needs: ['am.par-libre', 'am.clasificacion'] },
    { id: 'am.hofmann', mission: 'm7', title: 'Eliminación de Hofmann', needs: ['base.sn-e'] },
    { id: 'am.diazonio', mission: 'm7', title: 'Sales de diazonio', needs: ['am.par-libre'] },
    { id: 'am.espectro', mission: 'm8', title: 'IR, RMN y masas', needs: ['am.clasificacion'] }
  ];
  const CONCEPT_OF = {
    'm1-d1': 'am.clasificacion', 'm1-d2': 'am.par-libre', 'm1-d3': 'am.geometria', 'm1-p1': 'am.clasificacion', 'm1-p2': 'am.par-libre',
    'm1-p3': 'am.geometria', 'm1-c1': 'am.clasificacion', 'm1-t1': 'am.clasificacion', 'm1-t2': 'am.par-libre',
    'm2-d1': 'am.nombres', 'm2-d2': 'am.nombres-aril', 'm2-p1': 'am.nombres', 'm2-p2': 'am.nombres', 'm2-p3': 'am.nombres-aril',
    'm2-p4': 'am.nombres-aril', 'm2-c1': 'am.nombres', 'm2-t1': 'am.nombres', 'm2-t2': 'am.nombres-aril',
    'm3-d1': 'am.fisicas', 'm3-d2': 'am.fisicas', 'm3-p1': 'am.fisicas', 'm3-p2': 'am.fisicas', 'm3-p3': 'am.sales', 'm3-t1': 'am.sales', 'm3-t2': 'am.sales',
    'm4-d1': 'am.pka', 'm4-d2': 'am.equilibrio', 'm4-p1': 'am.pka', 'm4-p2': 'am.pka', 'm4-p3': 'am.pka', 'm4-t1': 'am.equilibrio',
    'm4-t2': 'am.equilibrio', 'm4-w1': 'am.equilibrio',
    'm5-d1': 'am.resonancia', 'm5-d2': 'am.heterociclos', 'm5-p1': 'am.orden', 'm5-p2': 'am.heterociclos', 'm5-p3': 'am.resonancia',
    'm5-p4': 'am.resonancia', 'm5-c1': 'am.orden', 'm5-t1': 'am.orden', 'm5-t2': 'am.heterociclos', 'm5-w1': 'am.resonancia',
    'm6-d1': 'am.alquilacion', 'm6-d2': 'am.reduccion', 'm6-p1': 'am.alquilacion', 'm6-p2': 'am.reduccion', 'm6-p3': 'am.alquilacion',
    'm6-c1': 'am.reduccion', 'm6-t1': 'am.alquilacion', 'm6-t2': 'am.reduccion',
    'm7-d1': 'am.hofmann', 'm7-d2': 'am.diazonio', 'm7-p1': 'am.hofmann', 'm7-p2': 'am.diazonio', 'm7-p3': 'am.acilacion',
    'm7-c1': 'am.diazonio', 'm7-t1': 'am.hofmann', 'm7-t2': 'am.diazonio', 'm7-w1': 'am.acilacion',
    'm8-d1': 'am.espectro', 'm8-d2': 'am.espectro', 'm8-p1': 'am.espectro', 'm8-p2': 'am.espectro', 'm8-p3': 'am.espectro', 'm8-t1': 'am.espectro'
  };
  /* Actividades de dibujo (etapa 2): construir moléculas y trazar flechas de mecanismo.
     Las estructuras se revisan con RDKit en tools/molecule-test.cjs ("smiles" es la respuesta en notación química). */
  const mission = id => cls.missions.find(m => m.id === id);
  const atom = (id, el, x, y, q = 0) => ({ id, el, x, y, q });
  mission('m1').stages.practice.push(
    { id: 'm1-a1', type: 'arrows', source: SRC, concept: 'am.par-libre', slide: 5,
      prompt: 'La metilamina atrapa el H⁺ del HCl. Dibuja las 2 flechas del mecanismo.',
      scene: { atoms: [atom('c', 'C', 80, 140), atom('n', 'N', 150, 140), atom('h', 'H', 265, 140), atom('cl', 'Cl', 335, 140)], bonds: [{ a: 'c', b: 'n', o: 1 }, { a: 'h', b: 'cl', o: 1 }] },
      lonePairs: { n: 1, cl: 3 }, lpAngle: { n: -90 },
      answer: [['lp:n', 'a:h'], ['b:1', 'a:cl']],
      notes: { 'lp:n>a:cl': 'El N no ataca al Cl: el Cl ya tiene sus electrones completos. El N busca el H, que es el que sale como H⁺.',
        'b:1>a:h': 'Cuando se rompe el enlace H–Cl, los electrones se van con el Cl, que es más electronegativo. Así queda Cl⁻.',
        'lp:n>b:1': 'Casi: el par del N ataca al H (al átomo), y el enlace H–Cl se rompe aparte.',
        'lp:cl>a:h': 'El Cl ya está unido a ese H: sus pares no atacan. El que ataca es el N de la amina.' },
      explain: 'El par libre del N ataca al H y, al mismo tiempo, el enlace H–Cl se rompe: sus electrones se van al Cl. Resultado: CH₃–NH₃⁺ y Cl⁻.',
      hint: 'Las flechas salen de electrones (el par libre del N o el enlace H–Cl) y llegan a quien los recibe.' },
    { id: 'm1-b1', type: 'build', source: SRC, concept: 'base.carga', slide: 5, smiles: 'C[NH3+]',
      prompt: 'Dibuja lo que se forma: la metilamina después de atrapar el H⁺. Ya tienes la metilamina; complétala.',
      start: { atoms: [atom('c', 'C', 150, 130), atom('n', 'N', 240, 130)], bonds: [{ a: 'c', b: 'n', o: 1 }] },
      target: { atoms: [atom('c', 'C', 150, 130), atom('n', 'N', 240, 130, 1)], bonds: [{ a: 'c', b: 'n', o: 1 }] },
      explain: 'Al atrapar el H⁺, el N queda con 4 enlaces (3 H y el C) y sin par libre. Carga formal: 5 − 0 − 4 = +1. Se escribe CH₃–NH₃⁺.',
      hint: 'Con 4 enlaces el N queda con carga. Elige el botón ± y toca el N.' });
  mission('m7').stages.practice.push(
    { id: 'm7-a1', type: 'arrows', source: SRC, concept: 'am.acilacion', slide: 35,
      prompt: 'Primer paso de la acilación: la metilamina ataca al cloruro de acetilo. Dibuja las 2 flechas.',
      scene: { atoms: [atom('c1', 'C', 45, 150), atom('n', 'N', 115, 150), atom('c2', 'C', 250, 150), atom('o', 'O', 250, 70), atom('c3', 'C', 320, 190), atom('cl', 'Cl', 195, 205)],
        bonds: [{ a: 'c1', b: 'n', o: 1 }, { a: 'c2', b: 'o', o: 2 }, { a: 'c2', b: 'c3', o: 1 }, { a: 'c2', b: 'cl', o: 1 }] },
      lonePairs: { n: 1, o: 2, cl: 3 }, lpAngle: { n: -40 },
      answer: [['lp:n', 'a:c2'], ['b:1', 'a:o']],
      notes: { 'lp:n>a:o': 'El N no ataca al O: el O es rico en electrones (δ−). El N busca al carbono del C=O, que es δ+.',
        'lp:n>a:cl': 'El Cl sale después, en el segundo paso. Primero el N ataca al carbono del C=O.',
        'b:3>a:cl': 'Eso pasa en el segundo paso, cuando vuelve a formarse el C=O. En el primero, los electrones del C=O suben al O.',
        'b:1>a:c2': 'Los electrones del C=O se van hacia el O, que es más electronegativo, no hacia el C.' },
      explain: 'El par libre del N ataca al carbono δ+ del C=O y los electrones del enlace C=O suben al oxígeno. Queda un intermediario con O⁻; después vuelve el C=O y sale el Cl⁻.',
      hint: 'El N busca el átomo más pobre en electrones. Cuando llega, el C=O tiene que soltar un par: ¿hacia dónde?' },
    { id: 'm7-b1', type: 'build', source: SRC, concept: 'am.acilacion', slide: 35, smiles: 'CCCNC(C)=O',
      prompt: 'Dibuja la amida que se forma con propilamina + cloruro de acetilo. Ya tienes la propilamina; agrégale lo que falta.',
      start: { atoms: [atom('a', 'C', 60, 160), atom('b', 'C', 115, 125), atom('c', 'C', 170, 160), atom('n', 'N', 225, 125)], bonds: [{ a: 'a', b: 'b', o: 1 }, { a: 'b', b: 'c', o: 1 }, { a: 'c', b: 'n', o: 1 }] },
      target: { atoms: [atom('a', 'C', 60, 160), atom('b', 'C', 115, 125), atom('c', 'C', 170, 160), atom('n', 'N', 225, 125), atom('d', 'C', 280, 160), atom('o', 'O', 280, 220), atom('e', 'C', 335, 125)],
        bonds: [{ a: 'a', b: 'b', o: 1 }, { a: 'b', b: 'c', o: 1 }, { a: 'c', b: 'n', o: 1 }, { a: 'n', b: 'd', o: 1 }, { a: 'd', b: 'o', o: 2 }, { a: 'd', b: 'e', o: 1 }] },
      explain: 'El N cambia uno de sus H por el grupo acetilo (CH₃–C=O) y el Cl se va. Producto: N-propilacetamida, CH₃CH₂CH₂–NH–CO–CH₃.',
      hint: 'Al N se le une el carbono del C=O. Ese carbono lleva un O con doble enlace y un CH₃. El Cl no queda en el producto.' });

  for (const m of cls.missions) for (const stage of ['diagnostic', 'practice', 'challenge', 'transfer'])
    for (const item of m.stages[stage] || []) item.concept ||= CONCEPT_OF[item.id];
})();
