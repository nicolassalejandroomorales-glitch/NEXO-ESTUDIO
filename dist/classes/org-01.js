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
    /* Texto de las diapositivas de cátedra que usa la clase (se proyecta mientras no estén las imágenes).
       Cuando existan, las imágenes van en assets/classes/org-01/slides/NN.webp y se listan en slideImages. */
    slideImages: {},
    slides: {
      2: { title: 'Aminas · Introducción', bullets: ['Aminas son derivados orgánicos del amoníaco donde uno de los H unidos al N es reemplazado por uno o más grupos alquilo o arilo (R).', 'Clasificación: primarias, secundarias o terciarias, dependiendo del número de grupos unidos al N.'] },
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
              { text: 'El enlace C–N' }
            ], { explain: 'El par libre del N es una zona de alta densidad electrónica: puede captar un H⁺ (base) o atacar un centro con carga parcial positiva (nucleófilo).', slide: 5, hint: 'Para captar un H⁺, la base necesita electrones que entregarle.' }),
            choice('m1-d3', '¿Qué forma tiene la molécula alrededor del N en la trimetilamina, (CH₃)₃N?', [
              { text: 'Plana trigonal, 120°', misconception: 'flat-n' },
              { text: 'Tetraédrica, 109,5°', misconception: 'tetra-shape' },
              { text: 'Piramidal trigonal, unos 108°', correct: true }
            ], { explain: 'El N es sp³ y el par libre ocupa un orbital sp³. La forma de los átomos es piramidal trigonal con ángulos de unos 108°.', slide: 11, hint: 'Cuenta 3 enlaces + 1 par libre. ¿Qué forma queda si solo miras los átomos?' })
          ],
          explain: [
            { id: 'b1', title: 'Una amina es amoníaco "disfrazado"', slide: 2,
              body: 'Si a una molécula de NH₃ le reemplazas uno o más H por grupos de carbono (R, alquilo o arilo), obtienes una amina. Se clasifica contando cuántos grupos R están unidos **al nitrógeno**.',
              rows: [['NH₃', 'amoníaco'], ['R–NH₂', 'primaria (1°)'], ['R₂NH', 'secundaria (2°)'], ['R₃N', 'terciaria (3°)']] },
            { id: 'b2', title: 'El par libre lo hace todo', slide: 5,
              body: 'El N tiene un par de electrones que no forma enlace. Con él, la amina puede hacer dos cosas:',
              rows: [['Base', 'R₃N + H⁺ ⇌ R₃NH⁺ (capta un protón)'], ['Nucleófilo', 'R₃N + R′–X → R₃N⁺–R′ + X⁻ (ataca un carbono)']],
              note: 'Casi todas las reacciones de las aminas que verás en esta clase nacen de este par.' },
            { id: 'b3', title: 'Un nitrógeno con forma de pirámide', slide: 11,
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
              { text: 'Primaria' }
            ], { explain: 'El N está unido a tres grupos de carbono (dos metilos y un etilo) y a ningún H: es terciaria.', slide: 2, hint: 'Cuenta todos los grupos unidos al N, incluido el etilo.' }),
            choice('m1-p2', 'La trimetilamina reacciona con HCl. ¿Qué se forma?', [
              { text: '(CH₃)₃NH⁺ Cl⁻', correct: true },
              { text: '(CH₃)₃N⁺–Cl', misconception: 'n-binds-cl' },
              { text: '(CH₃)₂NH + CH₃Cl' }
            ], { explain: 'La amina actúa como base: su par libre capta el H⁺ del HCl. Se forma el ion trimetilamonio con Cl⁻ como contraión.', slide: 5, hint: '¿Qué parte del HCl puede captar un par de electrones?' }),
            choice('m1-p3', 'Una amina con tres grupos distintos en el N es quiral, pero sus enantiómeros no se pueden separar. ¿Por qué?', [
              { text: 'Porque el par libre no cuenta como grupo, así que no hay centro quiral', misconception: 'lone-pair-not-group' },
              { text: 'Porque la inversión piramidal los interconvierte muy rápido', correct: true },
              { text: 'Porque el N es plano y no tiene forma 3D' , misconception: 'flat-n' }
            ], { explain: 'La pirámide del N se "da vuelta" como un paraguas con el viento, muy rápido. Los dos enantiómeros se convierten uno en otro y queda una mezcla racémica.', slide: 11, hint: 'Piensa en un paraguas que se da vuelta.' })
          ],
          challenge: [
            choice('m1-c1', 'Desafío: ¿cuál de estas aminas NO puede formar puentes de hidrógeno entre sus propias moléculas?', [
              { text: 'Propilamina, CH₃CH₂CH₂NH₂' },
              { text: 'Etilmetilamina, CH₃CH₂NHCH₃' },
              { text: 'Trimetilamina, (CH₃)₃N', correct: true }
            ], { explain: 'Para donar un puente de H hace falta un enlace N–H. La trimetilamina es terciaria y no tiene ninguno: solo puede aceptar puentes de H.', slide: 12, hint: '¿Cuál no tiene ningún H unido al N?' })
          ],
          transfer: [
            choice('m1-t1', 'La anfetamina es C₆H₅–CH₂–CH(CH₃)–NH₂. ¿Qué tipo de amina es?', [
              { text: 'Secundaria, porque el carbono unido al N es secundario', misconception: 'carbon-rule' },
              { text: 'Primaria', correct: true },
              { text: 'Terciaria' }
            ], { explain: 'El N está unido a un solo grupo de carbono. Es primaria, aunque ese carbono esté unido a otros dos carbonos.', slide: 2, hint: 'Ya lo viste en el diagnóstico: ¿qué se mira, el N o el C?' }),
            choice('m1-t2', 'En el estómago (medio muy ácido), ¿cómo está mayoritariamente la anfetamina?', [
              { text: 'Neutra, como R–NH₂', misconception: 'neutral-in-acid' },
              { text: 'Protonada, como R–NH₃⁺', correct: true },
              { text: 'Desprotonada, como R–NH⁻' }
            ], { explain: 'En medio ácido abundan los H⁺ y el par libre de la amina capta uno. Por eso muchos fármacos con aminas se venden como sales (clorhidratos), que son su forma protonada (diap. 16).', slide: 5, hint: 'Hay muchos H⁺ alrededor. ¿Qué hace el par libre?' })
          ]
        }
      }
    ]
  };
})();
