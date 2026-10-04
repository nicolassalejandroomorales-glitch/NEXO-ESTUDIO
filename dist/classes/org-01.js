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
    sources: {
      [SRC]: { title: 'Clase de cátedra · Aminas', author: 'Dr. Javier Echeverría', detail: 'Química Orgánica II, USACH, 2025-2S', authority: 'Material oficial del curso' }
    },
    misconceptions,
    glossary: [
      ['Electrones de valencia', 'Los electrones de la capa más externa; son los que forman enlaces. El N (grupo 15) tiene 5.'],
      ['Par libre', 'Dos electrones de un mismo átomo que no forman enlace. En el N de una amina hay uno.'],
      ['Base de Brønsted', 'Especie que acepta un protón (H⁺). Para hacerlo entrega un par de electrones.'],
      ['Ácido conjugado', 'Lo que queda cuando una base captó su H⁺. El de una amina es un ion amonio (R–NH₃⁺).'],
      ['Nucleófilo', 'Especie que usa un par de electrones para atacar un átomo pobre en electrones, normalmente un carbono δ+.'],
      ['Grupo R (alquilo / arilo)', 'Cualquier grupo de carbono: metilo CH₃–, etilo CH₃CH₂–, fenilo C₆H₅– (arilo, un anillo aromático).'],
      ['Hibridación sp³', 'Cuatro grupos de electrones alrededor de un átomo se ordenan en tetraedro (unos 109,5°).'],
      ['Quiral', 'Que no se puede superponer con su imagen en el espejo, como tus manos.'],
      ['Enantiómeros', 'Las dos formas "espejo" de una molécula quiral.'],
      ['Mezcla racémica', 'Mitad de cada enantiómero. No desvía la luz polarizada.'],
      ['Sal de amonio', 'Amina protonada (catión) junto a un anión, por ejemplo R–NH₃⁺ Cl⁻. Las de 4 grupos R son cuaternarias.']
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
            { id: 'f4', title: 'Desde cero: qué significa "R"',
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
