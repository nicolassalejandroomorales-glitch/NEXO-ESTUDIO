/* Unidades presentes en las diapositivas de cátedra 2025. PEP actual aún por confirmar. */
window.NEXO_ORGANIC_COURSE = window.NEXO_ORGANIC_COURSE || {};
Object.assign(window.NEXO_ORGANIC_COURSE, {
  'org-14': {
    title: 'Carbohidratos I: estereoquímica y cierre de anillo',
    central: '¿Cómo puede una misma fórmula de azúcar dar estructuras y propiedades distintas?',
    duration: 95,
    source: { lecture: 'Hidratos de carbono', pages: 'monosacáridos, D/L y formas cíclicas', guide: 'Guía 4 · Hidratos de carbono', status: 'Diapositivas 2025 usadas este semestre; PEP actual por confirmar.' },
    goals: ['Distinguir enantiómero, epímero y anómero sin usar los nombres como sinónimos.', 'Explicar el cierre intramolecular del carbonilo a hemiacetal.', 'Reconocer carbono anomérico y su relación con mutarrotación.'],
    terms: [
      ['Proyección de Fischer', 'Convención plana para representar configuración: enlaces horizontales salen hacia el observador y verticales van atrás.'],
      ['D/L', 'Relación configuracional con gliceraldehído, definida por el centro quiral de mayor numeración en una Fischer; no indica signo de rotación óptica.'],
      ['Epímeros', 'Diastereómeros que difieren en un solo centro estereogénico no anomérico.'],
      ['Anómeros', 'Formas cíclicas que difieren en configuración del nuevo carbono anomérico.'],
      ['Hemiacetal', 'Centro con –OH y –OR en el mismo carbono, originado por adición de alcohol a aldehído; hemicetal si procede de cetona.']
    ],
    reading: [
      { title: 'El esqueleto primero, la configuración después', paragraphs: [
        'Una aldosa tiene un aldehído en cadena abierta; una cetosa tiene una cetona. Para clasificar un monosacárido cuentan tanto los carbonos como la posición del carbonilo. Dos azúcares con la misma fórmula pueden ser isómeros constitucionales o estereoisómeros; esas diferencias predicen reactividad y reconocimiento biológico.',
        'En Fischer, D/L se asigna observando el centro quiral más alejado del carbonilo: OH a la derecha corresponde a D en la convención habitual; izquierda, L. No conviertas D en «gira la luz a la derecha». El signo de rotación se mide, no sale de esa letra.'
      ] },
      { title: 'Qué cambia al cerrar el anillo', paragraphs: [
        'Un OH de la misma molécula ataca al carbono del carbonilo. En una aldosa se forma un hemiacetal cíclico; en una cetosa, un hemicetal. La cadena no pierde átomos: se forma un enlace O–C y el O del antiguo carbonilo termina como OH después de ajustes de protones.',
        'El antiguo carbono carbonílico se vuelve anomérico y puede adoptar dos configuraciones. En un azúcar reductor, el hemiacetal puede reabrirse; esto permite interconversión entre anómeros en solución (mutarrotación). No confundas una silla/conformación con un cambio de configuración anomérica.'
      ] },
      { title: 'Pirano, furano y dibujo fiable', paragraphs: [
        'Un anillo de seis miembros con un O es piranosa; uno de cinco es furanosa. La glucosa suele representarse como glucopiranosa; la fructosa también puede formar furanosa. Hay que contar los átomos del ciclo real, no el número total de carbonos del azúcar.',
        'Al convertir Fischer a Haworth, marca la numeración, el O del anillo y el carbono anomérico antes de colocar OH arriba/abajo. La equivalencia de orientación depende de la convención dibujada: copiar una Haworth sin numeración es una fuente común de errores.'
      ] },
      { title: 'Qué debes inferir', paragraphs: [
        'Dos moléculas que difieren en un OH no son automáticamente anómeros: solo si el centro cambiado es el anomérico. Si el cambio ocurre en otro centro, son epímeros. Si cambia el esqueleto o la posición del carbonilo, no se corrige con una etiqueta estereoquímica.',
        'En prueba, justifica con una cadena: carbonilo inicial → OH intramolecular que ataca → tamaño del anillo → nuevo centro anomérico → posibilidad o no de apertura. Esa cadena vale más que recordar un dibujo aislado.'
      ] }
    ],
    molecules: [
      { name: 'D-gliceraldehído (modelo)', smiles: 'O=C[C@H](O)CO', observation: 'Un solo centro quiral; la etiqueta D se decide en Fischer, no por la dirección visual de este dibujo.' },
      { name: '4-hidroxibutanal', smiles: 'OCCCC=O', observation: 'Un OH terminal puede atacar el aldehído y formar un ciclo de cinco miembros.' },
      { name: 'Hemiacetal cíclico', smiles: 'OC1CCCO1', observation: 'El antiguo C=O ahora tiene OH y O del anillo; se convirtió en centro anomérico.' }
    ],
    worked: { prompt: '4-hidroxibutanal cierra intramolecularmente: cuenta el ciclo.', steps: [
      'Marca el C del aldehído como electrófilo y el O del OH terminal como donador de par.',
      'Forma O–C y desplaza el par π C=O al oxígeno; ajusta protones. El antiguo C=O queda con OH y O del ciclo.',
      'Cuenta en el camino de retorno: cuatro carbonos y un oxígeno en el anillo. Es un hemiacetal de cinco miembros.'
    ], result: 'Tetrahidrofurano-2-ol como modelo sencillo de cierre hemiacetálico.', contrast: 'La molécula no perdió el oxígeno carbonílico: pasó a OH.' },
    task: { prompt: 'Dibuja el hemiacetal cíclico de cinco miembros de 4-hidroxibutanal. Explica qué oxígeno forma el anillo.', accepted: ['OC1CCCO1'], seed: 'OCCCC=O', reasoning: '¿Cuál O ataca, cuál O acaba como OH y cuántos átomos hay en el ciclo?', rubric: ['El ciclo tiene cuatro carbonos y un O.', 'El antiguo C=O queda como C–OH.', 'El O del OH terminal es el O del anillo.'], hint: 'El oxígeno que ataca queda unido a dos carbonos después del cierre.', solution: 'El O del OH terminal forma el nuevo enlace con el C aldehídico; tras protonación resulta tetrahidrofurano-2-ol.', error: 'Contar mal el anillo o hacer desaparecer un oxígeno.' },
    transfer: { prompt: 'Dos glucopiranosas difieren solo en el OH del C1. ¿Son epímeros o anómeros? ¿Por qué podrían interconvertirse en agua?', answer: 'Son anómeros porque C1 proviene del carbonilo y es el carbono anomérico. El hemiacetal puede abrirse a cadena carbonílica y volver a cerrarse por cualquiera de las dos caras, produciendo mutarrotación.', check: ['Identifica C1 anomérico.', 'Nombra anómeros, no solo epímeros.', 'Explica apertura y cierre.'] },
    notebook: { write: ['Fischer numerada y regla D/L con su límite.', 'Dibujo del cierre: origen del O del anillo y del OH anomérico.', 'Comparación anómero / epímero / enantiómero.'], avoid: ['Igualar D con dextrógiro.', 'Memorizar Haworth sin numeración.'] }
  },
  'org-15': {
    title: 'Carbohidratos II: reactividad y enlace glucosídico',
    central: '¿Qué hace reductor a un azúcar y qué cambia cuando se bloquea su carbono anomérico?',
    duration: 90,
    source: { lecture: 'Hidratos de carbono', pages: 'reacciones y disacáridos', guide: 'Guía 4 · Hidratos de carbono', status: 'Diapositivas 2025 usadas este semestre; PEP actual por confirmar.' },
    goals: ['Predecir si un hemiacetal puede reabrirse a carbonilo.', 'Distinguir hemiacetal reductor de glucósido acetal.', 'Rastrear carbono anomérico y enlace glucosídico en un disacárido.'],
    terms: [
      ['Azúcar reductor', 'Puede generar una forma con carbonilo capaz de reducir ciertos reactivos de ensayo bajo condiciones apropiadas.'],
      ['Glucósido', 'Acetal/ketal formado al sustituir el OH anomérico por OR; su apertura simple al carbonilo queda bloqueada hasta hidrólisis.'],
      ['Enlace glucosídico', 'Enlace desde un carbono anomérico hacia O, N u otro átomo del grupo que se incorporó.'],
      ['Extremo reductor', 'Unidad de una cadena o disacárido cuyo carbono anomérico conserva comportamiento de hemiacetal libre.'],
      ['Oxidación de azúcar', 'La forma carbonílica puede oxidarse; el producto exacto depende del oxidante y de qué función se transforma.']
    ],
    reading: [
      { title: 'La prueba de reducción nace del equilibrio estructural', paragraphs: [
        'Un hemiacetal anomérico libre puede abrirse a una forma carbonílica. Una fracción pequeña en cadena abierta puede ser suficiente para reaccionar con ensayos oxidantes como Tollens. No necesitas que la mayoría de moléculas esté abierta en un instante.',
        'La fructosa es una cetosa, pero en medio básico puede isomerizarse por enediol a aldosas; por eso una regla «cetosa = no reductora» es insegura para algunos ensayos. Declara condiciones antes de inferir.'
      ] },
      { title: 'Hemiacetal frente a acetal', paragraphs: [
        'El hemiacetal tiene OH y OR en el mismo carbono; un glucósido tiene OR y OR. Formar el enlace glucosídico en el carbono anomérico elimina el OH de hemiacetal y bloquea la apertura directa al carbonilo. La hidrólisis ácida apropiada puede revertir el acetal.',
        'Esto conecta carbohidratos con la protección de carbonilos: un acetal resiste condiciones básicas ordinarias mejor que un hemiacetal libre, pero no es indestructible. Sigue los enlaces, no solo el nombre de un azúcar.'
      ] },
      { title: 'Disacáridos: cuenta extremos, no monómeros', paragraphs: [
        'En maltosa, un carbono anomérico participa en el enlace y el otro queda libre: hay extremo reductor. En sacarosa, ambos carbonos anoméricos participan en el enlace: no hay extremo reductor bajo condiciones usuales. El criterio no es cuántas unidades de glucosa/fructosa haya, sino qué ocurre con cada centro anomérico.',
        'Al escribir una notación como α(1→4), el primer número designa el carbono anomérico del donador y el segundo el carbono receptor; α/β describe configuración anomérica. No adivines si una sustancia es reductora solo por esta abreviatura sin mirar el otro extremo.'
      ] },
      { title: 'Reconstrucción de prueba', paragraphs: [
        'Para analizar un disacárido nuevo, marca ambos carbonos anoméricos, clasifica cada uno como hemiacetal libre o acetal glucosídico, y solo entonces responde sobre reducción e hidrólisis. Esta secuencia funciona aunque el dibujo sea desconocido.',
        'Los numerosos OH también permiten esterificación y formación de éteres; la selectividad de una sola posición requiere protección o condiciones controladas. Evita proponer un producto único de polisustitución sin justificarlo.'
      ] }
    ],
    molecules: [
      { name: 'Hemiacetal modelo', smiles: 'OC1CCCO1', observation: 'El carbono junto a O del anillo conserva un OH y puede reabrirse.' },
      { name: 'Glucósido metílico modelo', smiles: 'COC1CCCO1', observation: 'El OH anomérico fue sustituido por OMe: ahora es acetal.' },
      { name: 'Metanol', smiles: 'CO', observation: 'Aporta el fragmento OMe en una glucosilación modelo.' }
    ],
    worked: { prompt: 'Convierte un hemiacetal cíclico modelo en su metil glucósido.', steps: [
      'Identifica el carbono anomérico: porta OH y O del anillo.',
      'Con metanol y catálisis ácida adecuada, reemplaza OH anomérico por OMe. No toques el O del anillo.',
      'El carbono ahora tiene dos enlaces C–O de tipo acetal. Ya no se abre simplemente como el hemiacetal original.'
    ], result: 'Hemiacetal → metil acetal/glucósido modelo.', contrast: 'La sustitución ocurre en el OH anomérico, no en cualquier OH de la molécula.' },
    task: { prompt: 'Dibuja el producto de sustituir el OH anomérico de tetrahidrofurano-2-ol por OCH₃. Justifica el efecto sobre apertura a carbonilo.', accepted: ['COC1CCCO1'], seed: 'OC1CCCO1', reasoning: '¿Cuál OH se reemplaza y qué dos oxígenos quedan unidos al carbono anomérico?', rubric: ['Se conserva el O del ciclo.', 'El antiguo OH anomérico pasa a OMe.', 'El centro anomérico es acetal y no abre directamente a aldehído.'], hint: 'No agregues OMe a otro carbono; usa el que ya porta OH junto al O del ciclo.', solution: 'El producto modelo es 2-metoxitetrahidrofurano: tiene O del anillo y OMe en el carbono anomérico, por lo que queda como acetal.', error: 'Confundir un acetal con hemiacetal al dejar OH y agregar OMe al mismo carbono.' },
    transfer: { prompt: 'Maltosa y sacarosa tienen dos unidades. ¿Por qué solo una presenta extremo reductor en condiciones usuales?', answer: 'En maltosa queda libre un carbono anomérico hemiacetálico; puede abrirse a forma carbonílica. En sacarosa ambos carbonos anoméricos forman el enlace glucosídico como acetal/ketal y ninguno queda libre.', check: ['Marca ambos centros anoméricos.', 'Distingue hemiacetal de acetal.', 'No decide por número de unidades.'] },
    notebook: { write: ['Árbol: anomérico libre → apertura posible → reductor; bloqueado como acetal → no directo.', 'Maltosa versus sacarosa: marca los dos anoméricos.', 'Una condición del ensayo Tollens y su límite.'], avoid: ['Memorizar reductores por nombre sin estructura.', 'Suponer que todas las cetosas son siempre no reductoras.'] }
  },
  'org-16': {
    title: 'Ácidos nucleicos: base, azúcar y fosfato como sistema',
    central: '¿Cómo una modificación química pequeña cambia la identidad y estabilidad de un nucleótido?',
    duration: 85,
    source: { lecture: 'Ácidos nucleicos', pages: 'clase completa', guide: 'Diapositivas de cátedra', status: 'Diapositivas 2025 usadas este semestre; PEP actual por confirmar.' },
    goals: ['Separar base nitrogenada, nucleósido y nucleótido.', 'Rastrear enlace N-glucosídico y 3′–5′ fosfodiéster.', 'Justificar dos diferencias estructurales ARN/ADN sin convertirlas en eslóganes.'],
    terms: [
      ['Base nitrogenada', 'Heterociclo aromático con N, como purinas y pirimidinas.'],
      ['Nucleósido', 'Base unida a una pentosa por enlace N-glucosídico; no incluye fosfato en la definición.'],
      ['Nucleótido', 'Nucleósido con uno o más grupos fosfato.'],
      ['Enlace fosfodiéster', 'Fosfato que conecta dos azúcares, usualmente 3′ de una unidad con 5′ de la siguiente en ácidos nucleicos.'],
      ['Desoxirribosa', 'Pentosa del ADN sin OH en C2′; no significa ausencia de todos los oxígenos.']
    ],
    reading: [
      { title: 'Tres niveles que no deben mezclarse', paragraphs: [
        'Una base sola no es nucleósido. Cuando se une por N al carbono anomérico de ribosa o desoxirribosa, aparece un nucleósido. Añadir fosfato produce un nucleótido. Al responder una estructura, señala físicamente dónde están base, azúcar y fosfato, no solo tres palabras.',
        'Purinas tienen dos anillos fusionados; pirimidinas, uno. La unión N-glucosídica usa posiciones características de cada familia. Numerar los átomos del azúcar con primas evita confundirlos con los de la base.'
      ] },
      { title: 'ARN y ADN: dos cambios con consecuencias', paragraphs: [
        'ARN contiene ribosa con OH en 2′; ADN contiene 2′-desoxirribosa. El 2′-OH puede participar en rutas de hidrólisis del esqueleto fosfodiéster, lo que ayuda a explicar la menor estabilidad química habitual de ARN. La estabilidad real depende también de secuencia, estructura y condiciones.',
        'En ARN aparece uracilo de forma canónica; ADN emplea timina. La timina es 5-metiluracilo: hay un CH₃ adicional en el anillo. No es correcto decir que el ADN carece de bases pirimidínicas, porque citosina y timina lo son.'
      ] },
      { title: 'El esqueleto tiene dirección', paragraphs: [
        'El fosfato enlaza OH 3′ de una pentosa con la posición 5′ de otra. Por eso las cadenas se escriben 5′→3′ y no son intercambiables al invertir el orden. Las bases sobresalen del esqueleto y pueden establecer interacciones complementarias.',
        'A–T (o A–U en ARN canónico) y G–C son apareamientos frecuentes por geometría y puentes de H. No digas que los puentes de H son el enlace covalente que une los nucleótidos de una cadena: ese trabajo lo realiza el fosfodiéster.'
      ] },
      { title: 'Conexión con función', paragraphs: [
        'ATP es un nucleótido triphosfato; su utilidad energética se entiende por el contexto de hidrólisis y acoplamiento celular, no porque un enlace individual «contenga energía» como una batería suelta. AMP, ADP y ATP se diferencian por el número de fosfatos.',
        'En síntesis farmacéutica, reconocer qué parte de un análogo de nucleósido se modificó ayuda a predecir si una polimerasa podría incorporarlo o si faltará un OH necesario para prolongar la cadena. Esa predicción requiere el mecanismo concreto, pero empieza por leer la estructura.'
      ] }
    ],
    molecules: [
      { name: 'Uracilo', smiles: 'O=c1cc[nH]c(=O)[nH]1', observation: 'Pirimidina sin metilo en C5.' },
      { name: 'Timina', smiles: 'Cc1c[nH]c(=O)[nH]c1=O', observation: '5-metiluracilo: el cambio de conectividad es un CH₃ en el anillo.' },
      { name: 'Fosfato (modelo)', smiles: 'O=P(O)(O)O', observation: 'En un nucleótido se esterifica al azúcar; una cadena utiliza fosfodiéster.' }
    ],
    worked: { prompt: 'Uracilo → timina: identifica la diferencia sin redibujar todo el sistema.', steps: [
      'Reconoce el anillo pirimidínico y sus dos carbonilos; no cambian.',
      'Numera el anillo: en C5 se incorpora un grupo metilo.',
      'La nueva molécula es 5-metiluracilo, denominada timina. Esto no agrega ni azúcar ni fosfato.'
    ], result: 'Timina = uracilo con CH₃ en C5.', contrast: 'Una base modificada sigue siendo base; no se convierte en nucleótido sin pentosa y fosfato.' },
    task: { prompt: 'Dibuja timina a partir de uracilo añadiendo un CH₃ en C5. Explica por qué el producto aún no es un nucleótido.', accepted: ['Cc1c[nH]c(=O)[nH]c1=O'], seed: 'O=c1cc[nH]c(=O)[nH]1', reasoning: '¿Qué átomos se conservan y qué componentes faltarían para formar nucleótido?', rubric: ['Conserva anillo y dos carbonilos de uracilo.', 'Añade un CH₃ al C5.', 'Indica que faltan pentosa y fosfato.'], hint: 'Timina es 5-metiluracilo: cambia solo un sustituyente del anillo.', solution: 'Uracilo con CH₃ en C5 da timina. Para un nucleótido harían falta enlace a pentosa y grupo fosfato.', error: 'Agregar el metilo sobre N u O, o llamar nucleótido a una base libre.' },
    transfer: { prompt: 'En una cadena de ARN, ¿qué enlace une unidades consecutivas y cuál mantiene el apareamiento entre dos cadenas? ¿Dónde influye el 2′-OH?', answer: 'El fosfodiéster 3′–5′ une covalentemente nucleótidos de una cadena. Los puentes de H entre bases participan en apareamiento entre cadenas/regiones. El 2′-OH de ribosa puede favorecer rutas de hidrólisis del esqueleto y afecta estabilidad química.', check: ['Distingue enlace covalente de interacción entre bases.', 'Indica 3′–5′.', 'Sitúa el 2′-OH en azúcar.'] },
    notebook: { write: ['Dibujo base → nucleósido → nucleótido con numeración 2′,3′,5′.', 'ARN vs ADN en dos cambios estructurales y consecuencias.', 'Fosfodiéster frente a puentes de H.'], avoid: ['Una lista de siglas sin estructuras.', 'Llamar «enlace de hidrógeno» al esqueleto covalente.'] }
  },
  'org-17': {
    title: 'Aminoácidos: carga, pI y enlace peptídico',
    central: '¿Cómo predices la carga de un aminoácido y la dirección de su movimiento sin memorizar una tabla?',
    duration: 90,
    source: { lecture: 'Aminoácidos', pages: 'estructura, ácido–base, síntesis y reacciones', guide: 'Diapositivas de cátedra', status: 'Diapositivas 2025 usadas este semestre; PEP actual por confirmar.' },
    goals: ['Dibujar formas catiónica, zwitteriónica y aniónica desde pH y pKa.', 'Distinguir pI de pKa y predecir carga neta.', 'Explicar cómo se forma el enlace amida peptídico y por qué puede requerir protección.'],
    terms: [
      ['Zwitterión', 'Una molécula con cargas positiva y negativa en distintos grupos, pero carga neta cero.'],
      ['Punto isoeléctrico (pI)', 'pH al cual la carga neta promedio es cero para ese aminoácido en el modelo pertinente.'],
      ['Enlace peptídico', 'Amida entre carboxilo de un residuo y amino de otro; presenta resonancia y rotación restringida parcial.'],
      ['Electroforesis', 'Separación por migración de especies cargadas en campo eléctrico; dirección depende de signo neto.'],
      ['Protección de grupo', 'Bloqueo temporal de una función para evitar reacciones alternativas durante síntesis.']
    ],
    reading: [
      { title: 'Lee primero los sitios ácido–base', paragraphs: [
        'Un α-aminoácido tiene COOH y NH₂ en el mismo carbono alfa (salvo la cadena lateral). En agua cerca de pH intermedio, la transferencia de protón favorece COO⁻ y NH₃⁺: un zwitterión. No dibujes la forma completamente neutra como si fuese siempre la dominante.',
        'Al subir pH, los grupos se desprotonan según sus pKa; al bajar pH, se protonan. La carga neta es suma de cargas formales de todos los sitios, incluida la cadena lateral ionizable. Un mismo aminoácido puede cambiar de dirección de migración al cruzar su pI.'
      ] },
      { title: 'pI no es un pKa', paragraphs: [
        'Para glicina, el estado con carga neta cero queda entre dos desprotonaciones. Su pI se aproxima con el promedio de los dos pKa que flanquean la especie neutra neta; esta receta debe adaptarse cuando hay una cadena lateral ionizable.',
        'No se promedian siempre «los dos números más bajos» ni todos los pKa. Primero dibuja y ordena las formas de carga; después selecciona los dos cambios que rodean la especie de carga neta cero.'
      ] },
      { title: 'Estereoquímica y síntesis', paragraphs: [
        'Excepto glicina, los α-aminoácidos estándar suelen tener C alfa quiral. D/L describe configuración relativa; la mayoría de residuos proteinogénicos naturales son L, pero L no significa automáticamente S en todas las moléculas. La cisteína es un ejemplo importante para revisar prioridades CIP.',
        'Una aminación reductiva de α-cetoácido puede crear α-aminoácido, pero sin control quiral puede formar mezcla. Una ruta que produce el esqueleto correcto no garantiza configuración correcta.'
      ] },
      { title: 'Del monómero a péptido', paragraphs: [
        'El enlace peptídico une C acílico de un residuo con N de otro. Una condensación directa de dos aminoácidos sin estrategia puede competir por múltiples sitios; en síntesis se activan funciones y se protegen otras para controlar secuencia. El péptido tiene extremo N y extremo C distinguibles.',
        'La amida peptídica comparte par de N con C=O. Eso restringe parcialmente la rotación C–N y conecta esta unidad con la baja basicidad de amidas y con la estructura de proteínas.'
      ] }
    ],
    molecules: [
      { name: 'Glicina, forma zwitteriónica', smiles: '[NH3+]CC(=O)[O-]', observation: 'Dos cargas internas; suma neta cero.' },
      { name: 'Glicina, forma catiónica', smiles: '[NH3+]CC(=O)O', observation: 'A pH muy ácido, el carboxilo se protona y la carga neta es +1.' },
      { name: 'Glicina, forma aniónica', smiles: 'NCC(=O)[O-]', observation: 'A pH alto, el amonio se desprotona y la carga neta es −1.' }
    ],
    worked: { prompt: 'Glicina entre sus dos pKa: construye la forma predominante y la carga.', steps: [
      'El carboxilo ya ha perdido H⁺: escribe COO⁻.',
      'El amonio aún no ha perdido H⁺: escribe NH₃⁺.',
      'Suma +1 y −1: carga neta cero, aunque la molécula tiene dos cargas formales.'
    ], result: 'H₃N⁺–CH₂–COO⁻, forma zwitteriónica.', contrast: 'Carga neta cero no significa todos los átomos sin carga.' },
    task: { prompt: 'Dibuja la forma zwitteriónica predominante de glicina entre sus pKa. Justifica cada carga.', accepted: ['[NH3+]CC(=O)[O-]'], seed: 'NCC(=O)O', reasoning: '¿Qué grupo perdió H⁺ primero y qué grupo sigue protonado?', rubric: ['NH₃⁺ en el extremo amino.', 'COO⁻ en el carboxilo.', 'Carga neta cero con cargas formales no nulas.'], hint: 'Suma las cargas después de escribir cada estado de protonación.', solution: 'H₃N⁺–CH₂–COO⁻. El carboxilo perdió H⁺, el grupo amino permanece protonado y la carga total es cero.', error: 'Dibujar NH₂–CH₂–COOH como forma principal cerca de pI o borrar las cargas formales.' },
    transfer: { prompt: 'Si pH está por debajo del pI de glicina, ¿qué signo neto esperas y hacia qué electrodo migraría? ¿Qué cambia por encima de pI?', answer: 'Debajo de pI predomina carga neta positiva y migra hacia el cátodo negativo; por encima de pI, carga neta negativa y migra hacia el ánodo positivo. La dirección requiere fijar la convención de signos de los electrodos.', check: ['Predice signo con pH relativo a pI.', 'Identifica electrodo de signo opuesto.', 'No confunde carga neta con cargas internas.'] },
    notebook: { write: ['Tres formas de glicina alineadas por pH y carga.', 'pI: primero dibujar especies, luego promediar pKa que rodean carga cero.', 'Enlace peptídico con extremos N y C.'], avoid: ['Tabla de pI sin dibujos.', 'Igualar L con S sin revisar estructura.'] }
  },
  'org-18': {
    title: 'Lípidos: estructura, saponificación y membranas',
    central: '¿Cómo explica la estructura de un lípido su estado físico, su reactividad y su comportamiento en agua?',
    duration: 95,
    source: { lecture: 'Lípidos', pages: 'ácidos grasos, grasas, micelas, fosfolípidos, esteroides y terpenos', guide: 'Guía 8 · Lípidos', status: 'Diapositivas 2025 usadas este semestre; PEP actual por confirmar.' },
    goals: ['Relacionar longitud, dobles enlaces cis/trans y empaquetamiento.', 'Derivar productos de saponificación desde enlaces éster.', 'Distinguir micela, bicapa fosfolipídica, esteroide y terpeno por estructura.'],
    terms: [
      ['Ácido graso', 'Ácido carboxílico con cadena hidrocarbonada larga; saturación y geometría afectan empaquetamiento.'],
      ['Triacilglicérido', 'Glicerol esterificado con tres ácidos grasos; almacenamiento de energía, no es un fosfolípido.'],
      ['Saponificación', 'Hidrólisis básica de ésteres de grasas que produce carboxilatos y glicerol.'],
      ['Anfipático', 'Con regiones que interactúan de manera distinta con agua y con ambientes apolares.'],
      ['Fosfolípido', 'Lípido con región polar fosfatada y colas hidrofóbicas; muchos forman bicapas.']
    ],
    reading: [
      { title: 'Del doble enlace al punto de fusión', paragraphs: [
        'Una cadena saturada relativamente recta puede empaquetarse con otras y favorecer interacciones de dispersión. Un C=C cis introduce una curvatura que dificulta ese empaquetamiento y suele bajar el punto de fusión. Un C=C trans mantiene una geometría más extendida y puede empaquetarse de otra manera. Longitud y número de insaturaciones también importan.',
        'Evita el eslogan «insaturado = líquido»: es una tendencia bajo condiciones comparables, no una ley absoluta. Para comparar dos ácidos grasos, declara primero igualdad o diferencia de longitud de cadena.'
      ] },
      { title: 'Ésteres y saponificación', paragraphs: [
        'Un triacilglicérido contiene tres enlaces éster. En hidrólisis básica, cada acilo genera un carboxilato y el glicerol recupera grupos OH. Si el enunciado usa tres cadenas distintas, debes mostrar tres carboxilatos diferentes; no basta escribir «jabón».',
        'El carboxilato de cadena larga tiene cabeza iónica y cola apolar. En agua, esa dualidad permite agregados como micelas; las colas se esconden del agua y la superficie polar interactúa con ella. El mecanismo de limpieza implica dispersar grasa en estructuras que el agua puede arrastrar.'
      ] },
      { title: 'Fosfolípidos y membrana', paragraphs: [
        'Muchos fosfolípidos tienen dos colas apolares y un grupo fosfato con cabeza polar. Esta geometría favorece bicapas en vez de asumir una micela igual a la de un jabón de una sola cola. La composición de colas afecta fluidez; colesterol y otros componentes modifican propiedades de membrana.',
        'No dibujes un fosfolípido como triacilglicérido con un fosfato añadido encima de tres ésteres de ácido graso: en un glicerofosfolípido habitual, una posición de glicerol está asociada al grupo fosfato.'
      ] },
      { title: 'Familias que no caben en «grasa»', paragraphs: [
        'Los esteroides poseen un sistema de cuatro anillos fusionados; los terpenos se describen por unidades de isopreno en su origen biosintético. Prostaglandinas derivan de ácidos grasos y actúan como mediadores. Clasificar requiere reconocer esqueletos y grupos funcionales, no solo que sean hidrofóbicos.',
        'Como químico farmacéutico, conecta propiedad con función: cola y cabeza explican agregación; enlaces éster explican hidrólisis; geometría de dobles enlaces explica empaquetamiento. Esa cadena permite deducir más que una lista de nombres.'
      ] }
    ],
    molecules: [
      { name: 'Palmitato de metilo (modelo de éster)', smiles: 'CCCCCCCCCCCCCCCC(=O)OC', observation: 'El enlace C(acilo)–OCH₃ es susceptible a hidrólisis básica.' },
      { name: 'Ion palmitato', smiles: 'CCCCCCCCCCCCCCCC(=O)[O-]', observation: 'Cabeza COO⁻ y cola apolar extensa: estructura anfipática.' },
      { name: 'Glicerol', smiles: 'OCC(O)CO', observation: 'Producto del esqueleto de un triacilglicérido tras romper sus tres ésteres.' }
    ],
    worked: { prompt: 'Hidrólisis básica de palmitato de metilo: sigue el acilo.', steps: [
      'OH⁻ ataca al carbono del éster; el intermedio tetraédrico colapsa expulsando metóxido en el balance mecanístico.',
      'El producto ácido se desprotona en el medio básico: ion palmitato. El fragmento metoxi acaba como metanol tras transferencia de protón.',
      'Rastrea dieciséis carbonos en la cadena acílica y uno en el alcohol: no se transforma un carbono de cola en cabeza.'
    ], result: 'Palmitato de metilo + base → palmitato (sal) + metanol.', contrast: 'Un triacilglicérido repetiría el patrón tres veces y además daría glicerol, no metanol.' },
    task: { prompt: 'Dibuja el carboxilato obtenido al saponificar palmitato de metilo. Explica qué otro producto orgánico se libera.', accepted: ['CCCCCCCCCCCCCCCC(=O)[O-]'], seed: 'CCCCCCCCCCCCCCCC(=O)OC', reasoning: '¿Qué fragmento sale del éster y por qué el ácido acaba como carboxilato en base?', rubric: ['Se conserva la cola de dieciséis carbonos.', 'El éster se convierte en COO⁻.', 'El fragmento OMe da metanol tras transferencia de protón.'], hint: 'Rompe el enlace entre carbono acílico y O del metoxi, no la cadena hidrocarbonada.', solution: 'Se forma ion palmitato y metanol. En medio básico el ácido graso queda como carboxilato.', error: 'Perder o añadir carbonos a la cola; dibujar ácido neutro como producto dominante de un medio fuertemente básico.' },
    transfer: { prompt: 'Compara dos ácidos grasos de igual longitud: uno saturado y otro con doble enlace cis. Predice tendencia de fusión y vincúlala con membranas.', answer: 'El cis introduce una curvatura que reduce empaquetamiento regular y suele bajar punto de fusión frente al saturado comparable. Más colas cis-insaturadas tienden a aumentar fluidez de membrana en condiciones comparables; la composición total y temperatura también cuentan.', check: ['Mantiene longitud comparable.', 'Relaciona cis con empaquetamiento.', 'Conecta el efecto con fluidez sin universalizar.'] },
    notebook: { write: ['Ácido graso cis vs saturado: dibujo y consecuencia física.', 'Éster → carboxilato + alcohol con contabilidad de átomos.', 'Micela / bicapa / esteroide / terpeno por esqueleto.'], avoid: ['«Todo lípido es un triacilglicérido».', '«Insaturado siempre líquido» sin condiciones.'] }
  }
});
