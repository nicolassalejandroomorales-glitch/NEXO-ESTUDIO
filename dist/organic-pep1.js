/* Lecciones originales de Nexo. El material de cátedra se referencia, no se redistribuye. */
window.NEXO_ORGANIC_COURSE = window.NEXO_ORGANIC_COURSE || {};
Object.assign(window.NEXO_ORGANIC_COURSE, {
  'org-01': {
    title: 'Aminas: ¿qué nitrógeno capta H⁺ y por qué?',
    central: 'Basicidad desde el par libre, la aromaticidad y la estabilidad de la base y su ácido conjugado.',
    duration: 85,
    source: { lecture: 'Aminas', pages: '5, 29–31', guide: 'Guía 1a · Aminas', status: 'Base necesaria para PEP 1; cotejada con cátedra 2025 usada este semestre.' },
    goals: ['Identificar un par libre, un enlace π o un enlace σ como origen real de una flecha.', 'Determinar el destino electrofílico y verificar qué enlace debe romperse.', 'Dibujar un producto coherente con valencia, carga y conservación de átomos.'],
    terms: [
      ['Par libre', 'Dos electrones no compartidos por un enlace. Puede donar densidad, pero su disponibilidad depende de resonancia, carga y medio.'],
      ['Nucleófilo', 'Especie que aporta un par electrónico a un centro; es un papel en una reacción, no una identidad permanente.'],
      ['Electrófilo', 'Centro que acepta densidad electrónica. Una carga positiva ayuda a reconocerlo, pero un enlace polarizado también puede crearlo.'],
      ['Grupo saliente', 'Fragmento que puede abandonar un centro llevándose el par del enlace. Su aptitud depende de estabilidad y condiciones.'],
      ['Flecha curva', 'Contabilidad de un par de electrones: comienza en un par libre o enlace y termina donde ese par formará otro enlace o quedará localizado.']
    ],
    reading: [
      { title: 'La reacción es una redistribución, no una lista de nombres', paragraphs: [
        'Antes de preguntar «¿qué reacción es?», haz un inventario: qué átomos tienen pares libres, dónde hay enlaces π, qué enlaces están polarizados, qué cargas existen y qué centro puede aceptar densidad. Esa lectura permite predecir un primer paso aun cuando la molécula sea nueva.',
        'Una flecha curva de dos puntas representa dos electrones. Por eso no nace del símbolo − ni de un átomo vacío: nace del par o enlace que aporta los electrones. La punta indica el destino de ese par. Después de cada flecha se vuelven a contar enlaces, octetos y cargas.'
      ] },
      { title: 'Dos flechas pueden ser simultáneas', paragraphs: [
        'En una sustitución SN2, el nucleófilo forma un enlace con el carbono mientras el enlace carbono–grupo saliente entrega su par al grupo saliente. Si dibujas solo el primer movimiento sobre un carbono que ya tiene cuatro enlaces, le asignas cinco: tu dibujo delata que falta la segunda flecha.',
        'No basta ver un carbono con halógeno. En un carbono saturado y accesible puede dominar sustitución; en uno muy impedido podría competir eliminación. El disolvente y la base también importan. Una regla de examen útil es declarar primero el modelo y luego justificar por qué se aplica a ese sustrato.'
      ] },
      { title: 'Qué cambia y qué permanece', paragraphs: [
        'Los átomos no desaparecen por comodidad. En la reacción de bromuro de bencilo con amoníaco, el carbono bencílico conserva el esqueleto; se reemplaza C–Br por C–N. Br sale como bromuro. La primera sustitución produce una especie amonio que debe desprotonarse para obtener la amina neutra.',
        'Separar pasos es crucial: «formar C–N» y «perder un protón» no son la misma operación. Si omites el paso ácido–base, la carga de N parecerá inexplicable. Esa distinción volverá en síntesis de aminas, carbonilos y sustitución aromática.'
      ] },
      { title: 'Cómo detectar una solución falsa', paragraphs: [
        'Antes de aceptar tu producto, realiza cuatro controles: ¿conservaste todos los átomos relevantes?, ¿cada flecha salió de electrones?, ¿un átomo excede su valencia?, ¿la suma de cargas de cada paso es coherente? Este control es más general que memorizar cien transformaciones.',
        'Una estructura correcta por azar no demuestra el mecanismo. Escribe una frase causal: «N dona su par al carbono bencílico; C–Br entrega el suyo a Br; una base retira H de N». Si no puedes explicar ese orden, todavía hay una base que reparar.'
      ] }
    ],
    molecules: [
      { name: 'Bromuro de bencilo', smiles: 'BrCc1ccccc1', observation: 'El carbono CH₂ unido a Br es el centro donde se sustituye.' },
      { name: 'Amoníaco', smiles: 'N', observation: 'El nitrógeno aporta un par libre; al enlazarse inicialmente queda con carga positiva.' },
      { name: 'Bencilamina', smiles: 'NCc1ccccc1', observation: 'El enlace nuevo es C–N; el esqueleto bencílico permanece.' }
    ],
    worked: { prompt: 'Bromuro de bencilo + exceso de NH₃: predice la amina y justifica cada paso.', steps: [
      'Marca N de NH₃ como fuente del par y el carbono unido a Br como destino.',
      'Dibuja la formación C–N a la vez que C–Br se rompe hacia Br. El primer producto orgánico es un ion bencilamonio, no la amina neutra.',
      'Otra molécula de NH₃ actúa como base y retira H⁺. Resulta bencilamina; comprueba que N tiene tres enlaces y un par.'
    ], result: 'Producto neutro tras desprotonación: Ph–CH₂–NH₂. Se conserva el carbono bencílico; cambia Br por N.', contrast: 'Si dibujas directamente Ph–CH₂–NH₂, explica dónde quedó el protón: saltarse la contabilidad de carga es una trampa frecuente.' },
    task: { prompt: 'Dibuja en el editor la bencilamina final obtenida a partir de bromuro de bencilo y amoníaco en exceso. Luego explica por qué existe primero un intermedio con N positivo.', accepted: ['NCc1ccccc1'], seed: 'BrCc1ccccc1', reasoning: '¿De dónde parten las dos flechas de la sustitución y por qué se requiere desprotonación?', rubric: ['La flecha hacia C sale del par de N, no del símbolo de carga.', 'La salida de Br ocurre al mismo tiempo que se forma C–N.', 'El N del primer aducto tiene cuatro enlaces y carga +; una base retira H⁺.'], hint: 'Cuenta los enlaces del nitrógeno inmediatamente después de formar C–N.', solution: 'NH₃ ataca por su par al carbono bencílico y C–Br se rompe hacia Br. Se forma Ph–CH₂–NH₃⁺; otra base quita H⁺ y deja Ph–CH₂–NH₂.', error: 'Producto plausible con valencia o carga del intermedio sin justificar.' },
    transfer: { prompt: 'Si reemplazas bromuro de bencilo por clorobenceno, ¿seguirías proponiendo la misma SN2 en el carbono unido a Cl? Explica qué cambió en el sustrato.', answer: 'No. Un carbono arílico sp² no sigue la SN2 alifática ordinaria. Para sustitución nucleofílica aromática se necesitan condiciones y, en la vía de adición–eliminación, grupos atractores apropiados.', check: ['Diferencia carbono bencílico sp³ de carbono arílico sp².', 'No usa el mismo mecanismo por analogía superficial.', 'Indica qué condición adicional podría habilitar SNA.'] },
    notebook: { write: ['Inventario: fuente del par → destino → enlace que sale.', 'Intermedio Ph–CH₂–NH₃⁺ y paso de desprotonación.', 'Tu primer error real al dibujar flechas o cargas.'], avoid: ['Una lista de productos sin mecanismo.', 'Copiar todas las figuras de la diapositiva.'] }
  },
  'org-02': {
    title: 'Ácido–base: la dirección y la forma de la amina',
    central: '¿Cuándo una amina está libre, protonada y capaz de reaccionar como nucleófilo?',
    duration: 70,
    source: { lecture: 'Aminas', pages: '15–21', guide: 'Guía 1a · Aminas', status: 'Cátedra actual: sales, pKa del ion amonio y equilibrio.' },
    goals: ['Dibujar pares ácido/base conjugada sin cambiar el esqueleto.', 'Usar pKa de ácidos conjugados para estimar dirección de transferencia de H⁺.', 'Relacionar protonación, solubilidad y disponibilidad del par libre.'],
    terms: [
      ['Base de Brønsted', 'Acepta un protón; para hacerlo dona un par electrónico al H.'],
      ['Ácido conjugado', 'Especie que resulta al añadir exactamente H⁺ a una base; conserva los demás átomos.'],
      ['pKa', 'Medida logarítmica de acidez: menor pKa, ácido más fuerte. Para comparar aminas se suele medir el pKa de sus iones amonio.'],
      ['Equilibrio ácido–base', 'Favorece, en general, el lado que contiene el ácido y la base más débiles; comparar los pKa de los ácidos de ambos lados orienta la predicción.'],
      ['Sal de amonio', 'Amina protonada o cuaternizada acompañada de un contraión. Cambian carga y propiedades de solubilidad, no desaparece el esqueleto carbonado.']
    ],
    reading: [
      { title: 'Qué significa que una amina sea básica', paragraphs: [
        'Una amina neutra suele disponer de un par libre en N. Ese par puede unirse a H⁺: RNH₂ + H⁺ → RNH₃⁺. No basta escribir «se protona»: dibuja la flecha desde el par de N hacia H y otra desde el enlace H–A hacia A si el ácido se presenta como H–A.',
        'El ácido conjugado de una amina se reconoce porque tiene un H adicional y una carga más positiva. Si la amina ya tiene cuatro sustituyentes sobre N y carga +, como un amonio cuaternario, no hay par libre para otra protonación normal.'
      ] },
      { title: 'pKa no es una etiqueta de la amina neutra', paragraphs: [
        'A menudo se informa el pKa de RNH₃⁺, no de RNH₂. Cuanto mayor sea el pKa de ese ácido conjugado, más débil es como ácido y, dentro de comparaciones razonables en el mismo medio, más fuerte tiende a ser su base RNH₂. No inviertas esa relación.',
        'Para una reacción B + HA ⇌ BH⁺ + A⁻, una estimación útil es K ≈ 10^[pKa(BH⁺) − pKa(HA)]. Se trata de una aproximación condicionada por el disolvente y las especies; antes de aplicarla, identifica correctamente cuál ácido está a cada lado.'
      ] },
      { title: 'Por qué importa en fármacos y síntesis', paragraphs: [
        'Protonar una amina modifica su carga y suele facilitar la disolución acuosa. Por eso muchas formulaciones se preparan como sales. Pero una amina protonada ya no puede atacar por el par que estaba en N: primero debe existir una fracción no protonada o una etapa de desprotonación.',
        'La forma predominante depende del pH y del pKa de su ácido conjugado. En medio fuertemente ácido domina RNH₃⁺; al subir el pH aumenta RNH₂. Eso no significa que todas las aminas tengan idéntico pKa: resonancia, sustituyentes, solvatación y geometría lo cambian.'
      ] },
      { title: 'Comprobación que evita errores de signo', paragraphs: [
        'En ácido–base no elijas el lado por el número «más pequeño» sin identificar qué se está comparando. Si HA tiene pKa 2 y BH⁺ pKa 10, formar BH⁺ y A⁻ produce el ácido más débil: productos favorecidos aproximadamente por ocho órdenes de magnitud.',
        'En el cuaderno basta un esquema con ambos ácidos subrayados, sus pKa y dos flechas electrónicas. No copies una tabla extensa de valores si aún no sabes por qué dirección se desplaza el equilibrio.'
      ] }
    ],
    molecules: [
      { name: 'Metilamina', smiles: 'CN', observation: 'N neutro: tres enlaces posibles y par libre disponible.' },
      { name: 'Metilamonio', smiles: 'C[NH3+]', observation: 'Tras captar H⁺, N tiene cuatro enlaces y carga positiva.' },
      { name: 'Anilina', smiles: 'Nc1ccccc1', observation: 'También es amina, pero el entorno del par libre es distinto.' }
    ],
    worked: { prompt: 'Metilamina + HCl: ¿qué especie nitrogenada predomina?', steps: [
      'Reconoce la base CH₃NH₂ por su par libre y el ácido H–Cl por su protón transferible.',
      'N dona el par a H; el enlace H–Cl deja su par en Cl. El esqueleto CH₃–N no se altera.',
      'Obtienes CH₃NH₃⁺ y Cl⁻. HCl es mucho más ácido que CH₃NH₃⁺, por lo que la protonación está muy favorecida.'
    ], result: 'Cloruro de metilamonio: [CH₃NH₃]⁺ Cl⁻. La carga orgánica es +1.', contrast: 'El cloruro no se une covalentemente al carbono en esta transferencia de protones.' },
    task: { prompt: 'Dibuja únicamente el ion orgánico predominante cuando metilamina se trata con HCl. No incluyas Cl⁻ en el editor; explícalo en tu razonamiento.', accepted: ['C[NH3+]'], seed: 'CN', reasoning: '¿Dónde empieza y termina la flecha de protonación? ¿Por qué Cl⁻ es contraión y no sustituyente?', rubric: ['La especie orgánica gana un H y una carga positiva en N.', 'El enlace H–Cl se rompe hacia Cl.', 'Distingue sal iónica de sustitución covalente C–Cl.'], hint: 'Cuenta los cuatro enlaces de N después de captar H.', solution: 'CH₃NH₂ + HCl → CH₃NH₃⁺ + Cl⁻. La amina donó el par al protón y el enlace H–Cl quedó en Cl.', error: 'Dibujar la amina neutra o unir Cl covalentemente al carbono.' },
    transfer: { prompt: 'Una amina debe actuar como nucleófilo en medio muy ácido. ¿Qué tensión existe entre solubilidad como sal y disponibilidad del par? Propón una decisión experimental razonada.', answer: 'En medio ácido la amina se protona, suele disolverse mejor en agua pero pierde el par libre para el ataque. Puede necesitarse ajustar pH o añadir una base compatible para generar fracción de amina libre, cuidando el resto de grupos funcionales.', check: ['Relaciona pH y estado de protonación.', 'Distingue solubilidad de nucleofilia.', 'No promete que toda base o medio sirve en cualquier reacción.'] },
    notebook: { write: ['B + HA ⇌ BH⁺ + A⁻ con flechas y pKa de ambos ácidos.', 'Amina libre: par disponible; amonio: par comprometido.', 'Una frase sobre por qué sales y bases libres se comportan distinto.'], avoid: ['Memorizar «pKa alto = ...» sin especificar de qué especie es el pKa.', 'Copiar tablas antes de poder ubicar los conjugados.'] }
  },
  'org-03': {
    title: 'Aminas: basicidad, síntesis y heterociclos',
    central: '¿Cómo decide el entorno del N su basicidad y qué ruta crea un enlace C–N sin sobrealquilación?',
    duration: 95,
    source: { lecture: 'Aminas', pages: '22–43', guide: 'Guía 1a · Aminas', status: 'Cátedra actual: efectos electrónicos, síntesis, diazonio y heterociclos.' },
    goals: ['Comparar basicidad distinguiendo resonancia, inducción y solvatación.', 'Elegir entre sustitución y aminación reductiva para preparar una amina.', 'Reconocer cuándo el par de un N heterocíclico participa en aromaticidad.'],
    terms: [
      ['Resonancia', 'Distribución de densidad en estructuras que comparten conectividad; no es un átomo «saltando» entre dibujos.'],
      ['Efecto inductivo', 'Desplazamiento de densidad por enlaces σ debido a grupos atractores o donadores. Decae con la distancia.'],
      ['Aminación reductiva', 'Carbonilo + amina → imina/iminio → reducción del enlace C=N para crear C–N.'],
      ['Sobrealquilación', 'La amina producto todavía puede atacar otro haluro y formar productos más sustituidos; dificulta seleccionar una sola alquilación.'],
      ['Par piridínico / pirrólico', 'En piridina el par de N no integra el sexteto π; en pirrol sí aporta dos electrones al sistema aromático.']
    ],
    reading: [
      { title: 'La basicidad compara dos estados, no un par aislado', paragraphs: [
        'Al comparar bases, pregúntate qué estabilidad se pierde en la especie neutra y qué estabilidad gana el ácido conjugado. El N de una alquilamina tiene un par relativamente localizado. En anilina puede conjugase con el anillo; al protonar, esa donación del par al sistema π desaparece. Por ello una alquilamina simple suele ser más básica que anilina en agua.',
        'Un sustituyente nitro en posición para retira densidad por resonancia e inducción, debilitando aún más la basicidad de la anilina. Una amida es un caso distinto: el par de N se conjuga fuertemente con C=O; protonar el N rompe esa contribución y el N amídico es una base muy débil. No reduzcas todo a «tiene más oxígenos».'
      ] },
      { title: 'Basicidad y nucleofilia no son el mismo examen', paragraphs: [
        'Basicidad describe un equilibrio con H⁺; nucleofilia describe velocidad de ataque a otro centro. Ambas se relacionan con disponibilidad electrónica, pero también intervienen impedimento estérico, disolvente y naturaleza del electrófilo.',
        'Una amina muy impedida puede captar un protón pequeño con relativa facilidad y atacar lentamente un carbono congestionado. En una PEP, antes de ordenar nucleófilos identifica si te piden equilibrio ácido–base, velocidad SN2 o resultado de síntesis.'
      ] },
      { title: 'Elegir una ruta de síntesis', paragraphs: [
        'NH₃ o una amina puede sustituir un haluro alifático accesible, pero la amina formada aún conserva un par y puede alquilarse otra vez. Exceso de NH₃ puede favorecer el producto primario, aunque no resuelve todos los casos. Una azida seguida de reducción es otra estrategia para una amina primaria cuando el sustrato permite sustitución.',
        'La aminación reductiva usa primero un carbonilo y una amina para formar imina o ion iminio; luego reduce C=N. Si quieres Ph–CH₂–NH–CH₃, desconectar el enlace C–N revela benzaldehído + metilamina. El carbono del carbonilo pasa a ser el carbono unido a N, no se pierde el anillo.'
      ] },
      { title: 'Heterociclos y transformaciones de anilina', paragraphs: [
        'En piridina, el par libre de N está en un orbital del plano del anillo y no cuenta para los seis electrones π: puede protonarse sin destruir el sexteto aromático. En pirrol, el par del N sí aporta dos electrones π; protonarlo en N compromete la aromaticidad. Ésta es una razón estructural, no una excepción arbitraria.',
        'Las aminas aromáticas primarias pueden convertirse, mediante nitrito en ácido frío, en sales de arildiazonio. Desde allí se introducen ciertos sustituyentes por reemplazo del grupo diazonio. Esta ruta exige reconocer primero la clase de amina y las condiciones; no se aplica como plantilla indistinta a cualquier amina.'
      ] },
      { title: 'Arildiazonio: una salida que abre rutas nuevas', paragraphs: [
        'La diazotación parte de una arilamina primaria, por ejemplo anilina, con nitrito en ácido y control de temperatura. El producto Ar–N₂⁺ conserva inicialmente el enlace C(arilo)–N; después N₂ puede salir y permitir instalar otros grupos. Es distinto de alquilar el N de anilina.',
        'En síntesis, esta ruta importa cuando el grupo que quieres colocar no se instala con la orientación o condiciones de una SEA directa. Dibuja primero la posición del NH₂ en el anillo: el reemplazo posterior ocurre en esa posición. Revisa por separado si otras funciones del sustrato toleran el medio ácido.'
      ] },
      { title: 'Cómo usar espectros sin adivinar la estructura', paragraphs: [
        'Una amina primaria tiene dos enlaces N–H, una secundaria uno y una terciaria ninguno; en IR esto puede dar dos, una o ninguna banda de estiramiento N–H, aunque intensidad y solapamiento limitan la lectura. Una amida también tiene N–H posible, pero su carbonilo y su entorno electrónico obligan a otra interpretación.',
        'En RMN, protones unidos a N pueden intercambiarse y variar con disolvente y concentración. No identifiques una amina solo por un desplazamiento suelto: combina fórmula, integrales, patrón del esqueleto y evidencia IR. La pregunta de prueba suele exigir descartar una alternativa cercana, no solo reconocer una banda.'
      ] }
    ],
    molecules: [
      { name: 'Ciclohexilamina', smiles: 'NC1CCCCC1', observation: 'Par de N no conjugado con un anillo aromático.' },
      { name: 'Anilina', smiles: 'Nc1ccccc1', observation: 'El par puede deslocalizarse hacia el anillo.' },
      { name: 'p-nitroanilina', smiles: 'Nc1ccc([N+](=O)[O-])cc1', observation: 'NO₂ retira densidad; no se vuelve más básica por tener más heteroátomos.' },
      { name: 'Piridina', smiles: 'n1ccccc1', observation: 'El par de N no integra el sexteto π.' },
      { name: 'Pirrol', smiles: 'c1cc[nH]c1', observation: 'El par del N sí participa en el sexteto π.' }
    ],
    worked: { prompt: 'Diseña N-metilbencilamina desde un carbonilo y explica por qué no necesitas alquilar N varias veces.', steps: [
      'Desconecta el enlace entre carbono bencílico y N: el precursor carbonílico es benzaldehído y el nitrógeno proviene de metilamina.',
      'Benzaldehído y metilamina condensan con pérdida de agua para formar una imina; dibuja C=N antes de reducir.',
      'Un reductor adecuado de aminación reductiva convierte C=N en C–N. El producto es Ph–CH₂–NH–CH₃; verifica el número de H de N.'
    ], result: 'Benzaldehído + CH₃NH₂ → imina → N-metilbencilamina tras reducción.', contrast: 'Ph–CO–NH–CH₃ sería una amida; el carbonilo de la aminación reductiva no permanece como C=O.' },
    task: { prompt: 'Dibuja el producto orgánico final de benzaldehído + metilamina, seguidos de aminación reductiva. Justifica la desconexión retrosintética.', accepted: ['CNCc1ccccc1'], seed: 'O=Cc1ccccc1', reasoning: '¿Qué enlace nuevo se forma, qué intermedio aparece y por qué no queda un grupo C=O?', rubric: ['El enlace nuevo es C(bencílico)–N.', 'Primero se forma imina/iminio y luego se reduce C=N.', 'El producto es amina secundaria; no amida ni alcohol.'], hint: 'Cuenta los H del carbono que antes era carbonílico después de reducir C=N.', solution: 'Benzaldehído + CH₃NH₂ forman Ph–CH=N–CH₃; la reducción da Ph–CH₂–NH–CH₃. El oxígeno sale como agua durante la condensación.', error: 'Confundir aminación reductiva con formación de amida o con reducción del carbonilo a alcohol.' },
    transfer: { prompt: 'Piridina y pirrol tienen N en un anillo aromático. ¿Cuál N protonarías más fácilmente y por qué? Relaciona la respuesta con el conteo π.', answer: 'El N de piridina posee un par que no integra el sexteto π; su protonación conserva la aromaticidad del anillo. En pirrol el par sí aporta dos electrones al sexteto, por lo que protonar N compromete esa estabilización y es mucho menos favorable.', check: ['Identifica el origen de los electrones π.', 'Distingue el par en cada N.', 'No usa «ambos son aromáticos» como explicación suficiente.'] },
    notebook: { write: ['Tabla de tres especies: alquilamina / anilina / amida y destino del par libre.', 'Retrosíntesis de aminación reductiva: C–N ← carbonilo + amina.', 'Piridina vs pirrol: dónde está el par del N.'], avoid: ['Una lista de 20 reactivos sin saber qué enlace forman.', 'Ordenar basicidad solo por número de N/O.'] }
  },
  'org-04': {
    title: 'Aromaticidad y heterociclos: cerrar el circuito',
    central: '¿Por qué algunos anillos con dobles enlaces son aromáticos, otros antiaromáticos y otros ninguno?',
    duration: 85,
    source: { lecture: 'Aromáticos I', pages: '4–26, 32, 50', guide: 'Guía 1b · Compuestos aromáticos', status: 'Cátedra actual y ejercicios de clasificación.' },
    goals: ['Exigir ciclo, conjugación continua y geometría compatible antes de contar electrones.', 'Contar electrones π de dobles enlaces, pares y cargas según su orbital.', 'Distinguir aromático, antiaromático y no aromático con una causa estructural.'],
    terms: [
      ['Conjugación cíclica', 'Cadena cerrada de orbitales p que pueden solaparse; un átomo sp³ sin orbital p disponible la interrumpe.'],
      ['Aromaticidad', 'Estabilización de un circuito π cíclico, conjugado y aproximadamente plano con 4n+2 electrones π.'],
      ['Antiaromaticidad', 'Desestabilización de un circuito cíclico, conjugado y plano con 4n electrones π.'],
      ['No aromaticidad', 'Ausencia de un requisito previo del circuito; no equivale a antiaromaticidad.'],
      ['Regla de Hückel', 'Conteo 4n+2 para un sistema cíclico conjugado adecuado; no reemplaza la inspección de geometría y orbitales.']
    ],
    reading: [
      { title: 'El orden de decisión importa más que la fórmula', paragraphs: [
        'Primero dibuja un recorrido cerrado por los átomos del anillo. En cada posición debe existir un orbital p que pueda solaparse con el siguiente; un carbono saturado con cuatro enlaces σ suele cortar la ruta. Después pregunta si el anillo puede ser plano o casi plano. Solo entonces cuenta electrones π.',
        'Aplicar 4n+2 a un compuesto no conjugado es un error lógico: obtienes un número, pero no un circuito aromático. Antiaromático requiere un circuito conjugado y plano de 4n electrones; una molécula puede evitar esa situación torciéndose y ser no aromática.'
      ] },
      { title: 'Qué se cuenta y qué no', paragraphs: [
        'Cada doble enlace situado en el circuito aporta dos electrones π. Un par libre de heteroátomo se suma solo si ocupa un orbital p que forma parte del circuito. En pirrol, los dos dobles enlaces aportan cuatro y el par de N otros dos. En piridina, los tres dobles enlaces ya aportan seis y el par libre de N está fuera del circuito π.',
        'Una carga no determina por sí sola el conteo. Un carbocatión puede aportar un orbital p vacío; un carbanión puede aportar un par en p. Necesitas dibujar orbitales y electrones, no sumar «cargas» como si cada signo valiera dos.'
      ] },
      { title: 'Por qué benceno prefiere sustitución', paragraphs: [
        'El benceno presenta seis electrones π deslocalizados en un circuito de seis orbitales p. Una adición permanente rompería ese circuito, por lo que muchos procesos favorecen sustituir un H y recuperar aromaticidad al final. Esta relación conecta la clasificación de esta clase con el mecanismo SEA de la siguiente.',
        'Resonancia es una manera de representar esa deslocalización, no una oscilación de enlaces que se vuelven simples y dobles por turnos. En una prueba, dibujar dos Kekulé puede ayudar, pero la justificación debe mencionar el circuito y su estabilización.'
      ] },
      { title: 'Heterociclos: la pregunta decisiva sobre N', paragraphs: [
        'Piridina y pirrol son ambos aromáticos de seis electrones π, pero obtienen esos electrones de manera distinta. La diferencia predice dónde está disponible el par libre para protonación. En sistemas fusionados o con varios heteroátomos, decide átomo por átomo si cada par pertenece al circuito.',
        'El error típico es declarar antiaromático cualquier anillo con cuatro electrones contados sin comprobar si realmente es plano y conjugado. Primero prueba las condiciones geométricas; la clasificación viene al final.'
      ] }
    ],
    molecules: [
      { name: 'Benceno', smiles: 'c1ccccc1', observation: 'Seis orbitales p y seis electrones π.' },
      { name: 'Piridina', smiles: 'n1ccccc1', observation: 'El par de N queda fuera del sexteto π.' },
      { name: 'Pirrol', smiles: 'c1cc[nH]c1', observation: 'El par de N aporta dos electrones al sexteto.' },
      { name: 'Cicloheptatrieno', smiles: 'C1=CC=CC=CC1', observation: 'Un carbono sp³ corta la conjugación del anillo neutro.' }
    ],
    worked: { prompt: 'Clasifica piridina, pirrol y cicloheptatrieno sin partir por la regla numérica.', steps: [
      'Para cada anillo comprueba un orbital p continuo. El carbono CH₂ de cicloheptatrieno interrumpe la conjugación.',
      'Piridina: tres enlaces π aportan seis electrones; el par de N queda en el plano y no se cuenta.',
      'Pirrol: dos enlaces π aportan cuatro y el par de N en p aporta dos. Ambos heterociclos suman seis y son aromáticos; cicloheptatrieno neutro no es aromático.'
    ], result: 'Piridina y pirrol: aromáticos; cicloheptatrieno: no aromático.', contrast: 'No aromático no significa antiaromático; en cicloheptatrieno falta continuidad p.' },
    task: { prompt: 'Dibuja el ion 1-metilpiridinio que resulta de alquilar el par libre de piridina con CH₃I. ¿Sigue siendo aromático?', accepted: ['C[n+]1ccccc1'], seed: 'n1ccccc1', reasoning: '¿De dónde salen los seis electrones π antes y después de alquilar N? ¿Qué pasa con el par libre?', rubric: ['N queda cuaternizado con carga + y unido a CH₃.', 'Los tres enlaces π mantienen seis electrones en el anillo.', 'El par libre de piridina no era parte del sexteto: la aromaticidad se conserva.'], hint: 'En piridina cuenta los tres enlaces π sin sumar el par libre.', solution: 'Piridina + CH₃I → 1-metilpiridinio I⁻. El N usa su par para enlazarse a CH₃ y queda positivo; el sexteto π del anillo permanece.', error: 'Contar el par de piridina como parte del sexteto y concluir que se pierde aromaticidad.' },
    transfer: { prompt: 'Un anillo de ocho miembros con cuatro dobles enlaces se tuerce y no mantiene todos sus orbitales p paralelos. ¿Es antiaromático solo porque 8=4n?', answer: 'No. Si la geometría rompe el solapamiento cíclico efectivo, no cumple el requisito de antiaromaticidad y se clasifica como no aromático. El conteo 4n por sí solo no basta.', check: ['Comprueba geometría además de conteo.', 'Distingue antiaromático de no aromático.', 'No aplica Hückel antes de revisar el circuito.'] },
    notebook: { write: ['Árbol: circuito p continuo → planitud → conteo 4n+2 o 4n.', 'Piridina vs pirrol con el par que cuenta o no cuenta.', 'Un ejemplo propio de no aromático y por qué.'], avoid: ['Solo escribir «4n+2» sin dibujar orbitales.', 'Clasificar por número de dobles enlaces sin revisar sp³.'] }
  },
  'org-05': {
    title: 'SEA: mecanismo, directores y ruta aromática',
    central: '¿Por qué un sustituyente cambia la velocidad y la posición de la siguiente sustitución?',
    duration: 105,
    source: { lecture: 'Aromáticos II', pages: '2–61', guide: 'Guía 1c · SEA', status: 'Cátedra actual; síntesis y productos de PEP 1 real 2025.' },
    goals: ['Dibujar formación del complejo σ y recuperación de aromaticidad.', 'Separar velocidad (activación) de orientación orto/para/meta.', 'Elegir orden de pasos en una síntesis aromática corta y detectar limitaciones de Friedel–Crafts.'],
    terms: [
      ['Electrófilo de SEA', 'Especie suficientemente pobre en electrones para aceptar densidad del anillo; a menudo se genera con ácido o ácido de Lewis.'],
      ['Complejo σ', 'Intermedio en que el electrófilo ya se unió por un enlace σ y el anillo perdió temporalmente aromaticidad.'],
      ['Activación', 'Cambio de velocidad relativo al benceno; no determina por sí mismo en qué posición entra el siguiente grupo.'],
      ['Efecto director', 'Preferencia relativa orto/para o meta, explicada por estabilidad de los complejos σ posibles.'],
      ['Sustitución nucleofílica aromática', 'Mecanismo diferente de SEA: ciertos haluros arílicos activados por grupos atractores orto/para pueden reaccionar con nucleófilos.']
    ],
    reading: [
      { title: 'El costo de interrumpir la aromaticidad', paragraphs: [
        'En SEA el anillo dona densidad π a un electrófilo fuerte y forma un enlace C–E. Aparece un complejo σ con carga positiva distribuible por resonancia, pero sin el circuito aromático completo. Una base retira H del carbono sustituido; los electrones C–H restauran el enlace π y con él la aromaticidad.',
        'No confundas sustitución con adición. En una adición el anillo quedaría con dos enlaces nuevos y perdería estabilización aromática; en SEA la desprotonación recupera el circuito. Dibuja al menos una forma útil del complejo σ para justificar dirección.'
      ] },
      { title: 'Activar y dirigir son preguntas distintas', paragraphs: [
        'Un donador como –OMe estabiliza especialmente los complejos σ de ataque orto y para; suele activar el anillo y orientar hacia esas posiciones. Un aceptor fuerte como –NO₂ desactiva y hace relativamente menos desfavorable el ataque meta, porque evita una forma de resonancia especialmente inestable para orto/para.',
        'Los halógenos son la excepción clásica: desactivan por inducción, pero orientan orto/para por donación de par en las formas relevantes del complejo σ. Por eso una tabla que dice «activador = orto/para» falla. Explica los dos ejes por separado.'
      ] },
      { title: 'El repertorio tiene condiciones y límites', paragraphs: [
        'Br₂/FeBr₃ o Cl₂/FeCl₃ generan especies halogenantes; HNO₃/H₂SO₄ produce el electrófilo nitronio; SO₃/H₂SO₄ permite sulfonación. Friedel–Crafts alquila con un electrófilo carbonado, pero puede sufrir reordenamiento y polialquilación. La acilación forma una arilcetona y suele evitar esos problemas por la desactivación del producto.',
        'Un anillo muy desactivado puede no reaccionar por Friedel–Crafts; una amina fuertemente coordinada o protonada puede cambiar lo que esperabas. Antes de escribir reactivos de una ruta de dos pasos, predice cómo el primer grupo modificará la segunda sustitución.'
      ] },
      { title: 'De producto a ruta y de ruta a producto', paragraphs: [
        'Para sintetizar un anillo disustituido, parte del patrón relativo de sustitución. Si quieres meta respecto de un grupo carbonilo, instalar primero un acilo puede dirigir la etapa siguiente; si quieres orto/para respecto de un grupo donador, instalarlo primero puede ayudar. Luego revisa si la reacción elegida tolera ese sustituyente.',
        'En un anillo con dos sustituyentes, combina efectos directores y estéricos, pero no inventes un producto único cuando hay mezcla. Una respuesta universitaria puede justificar dos regioisómeros y proponer cuál se favorece bajo condiciones declaradas.'
      ] },
      { title: 'Sustitución nucleofílica aromática no es una SEA al revés', paragraphs: [
        'Un haluro arílico ordinario no hace SN2 en el carbono sp². En la vía de adición–eliminación de SNA, un grupo fuertemente atractor orto o para respecto del halógeno puede estabilizar el intermedio de adición del nucleófilo. Luego se recupera aromaticidad al salir el haluro. La posición del atractor debe poder estabilizar ese intermedio; un grupo meta no ejerce el mismo papel por resonancia.',
        'Hay mecanismos alternativos bajo condiciones muy fuertes, como la vía de bencino; no atribuyas automáticamente cualquier sustitución arílica a adición–eliminación. Empieza por reconocer sustrato, posición de grupos, nucleófilo y condiciones.'
      ] },
      { title: 'Espectros como comprobación de regioquímica', paragraphs: [
        'En RMN de ¹H, una sustitución simétrica puede reducir el número de entornos aromáticos distintos; orto, meta y para no tienen por qué mostrar el mismo patrón. Un protón aromático suele aparecer desplazado respecto de un protón alifático por anisotropía del anillo, pero el rango aislado no prueba la conectividad.',
        'Primero predice cuántos H aromáticos no equivalentes tendría cada regioisómero y si hay simetría. Luego usa integrales y acoplamientos disponibles para contrastar. En IR, señales fuera del plano pueden apoyar patrones de sustitución, pero conviene evitar identificaciones absolutas con una sola banda.'
      ] }
    ],
    molecules: [
      { name: 'Anisol', smiles: 'COc1ccccc1', observation: '–OMe activa y orienta orto/para.' },
      { name: 'Nitrobenceno', smiles: 'O=[N+]([O-])c1ccccc1', observation: '–NO₂ desactiva y orienta meta.' },
      { name: 'Bromobenceno', smiles: 'Brc1ccccc1', observation: 'Br desactiva, pero dirige orto/para.' },
      { name: 'm-dinitrobenceno', smiles: 'O=[N+]([O-])c1cccc([N+](=O)[O-])c1', observation: 'El segundo NO₂ se instala en meta bajo condiciones suficientemente enérgicas.' }
    ],
    worked: { prompt: 'Nitrobenceno + mezcla nitrante: ¿dónde entra el segundo NO₂ y por qué la reacción es lenta?', steps: [
      'La mezcla HNO₃/H₂SO₄ genera NO₂⁺. El anillo debe donar densidad para formar el complejo σ.',
      'El NO₂ existente retira densidad y desactiva el anillo. Compara complejos σ: ataques orto/para colocan una forma de carga positiva especialmente desfavorable junto al grupo atractor.',
      'El ataque meta evita esa forma particularmente mala. Tras perder H⁺ se recupera aromaticidad y se obtiene m-dinitrobenceno.'
    ], result: 'Regioisómero meta; menor velocidad que la nitración de benceno.', contrast: '«Meta» responde orientación; «más lento» responde activación. Son conclusiones relacionadas, pero no equivalentes.' },
    task: { prompt: 'Dibuja el producto meta de la segunda nitración de nitrobenceno. Explica por qué el primer NO₂ desactiva, aunque la posición meta sea relativamente preferida.', accepted: ['O=[N+]([O-])c1cccc([N+](=O)[O-])c1'], seed: 'O=[N+]([O-])c1ccccc1', reasoning: 'Compara el complejo σ de ataque meta con el de orto/para y separa velocidad de dirección.', rubric: ['Los dos NO₂ quedan en relación 1,3 (meta).', 'NO₂ retira densidad y hace lenta la reacción.', 'La orientación se justifica comparando complejos σ, no por «meta tiene más electrones».'], hint: 'Busca en qué ataque aparece una forma de resonancia con carga positiva en el carbono unido a NO₂.', solution: 'La nitración en condiciones suficientes da 1,3-dinitrobenceno. El grupo NO₂ desactiva el anillo; entre rutas desfavorables, el complejo σ meta evita una forma especialmente desestabilizada de las vías orto/para.', error: 'Confundir desactivación global con la preferencia relativa por meta.' },
    transfer: { prompt: 'Bromobenceno se bromina de nuevo. ¿Esperas un anillo más rápido que benceno? ¿A qué posiciones dirige el Br inicial? Justifica ambos juicios por efectos distintos.', answer: 'Más lento que benceno por el efecto inductivo atractor de Br; orienta orto/para porque el par de Br puede estabilizar ciertos complejos σ. Habrá mezcla de regioisómeros, con estérica influyendo en sus proporciones.', check: ['Desactivación y orientación separadas.', 'Menciona inducción y donación de par.', 'No afirma un producto único sin condiciones.'] },
    notebook: { write: ['SEA: activar E⁺ → complejo σ → quitar H⁺ y recuperar aromaticidad.', 'Tabla en dos columnas: velocidad y dirección; incluye halógeno.', 'Una ruta de síntesis de dos pasos con por qué ese orden.'], avoid: ['Una lista plana de directores sin el complejo σ.', 'Escribir «el anillo siempre reacciona» ignorando desactivación y límites de Friedel–Crafts.'] }
  }
});
