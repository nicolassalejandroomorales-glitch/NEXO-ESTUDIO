window.NEXO_ORGANIC_COURSE = window.NEXO_ORGANIC_COURSE || {};
Object.assign(window.NEXO_ORGANIC_COURSE, {
  'org-06': {
    title: 'Carbonilo: polarización, modelo y selectividad',
    central: '¿Qué hace del carbono carbonílico un destino y qué decide si una adición es fácil?',
    duration: 75,
    source: { lecture: 'Aldehídos y cetonas', pages: '2–37', guide: 'Guía 3 · Aldehídos y cetonas', status: 'Cátedra 2025; confirmar tramo exacto de PEP 2 en programación actual.' },
    goals: ['Traducir C=O en una predicción de sitio electrófilo y sitio básico.', 'Comparar reactividad de aldehído y cetona sin ignorar estérica ni efectos electrónicos.', 'Reconocer cuándo una ruta produce alcohol, hidrato o derivado de carbonilo.'],
    terms: [
      ['Carbonilo', 'Enlace C=O polarizado: O concentra densidad y el carbono puede aceptar un par nucleofílico.'],
      ['Adición nucleofílica', 'Formación de enlace Nu–C y desplazamiento del par π C=O hacia O; el centro pasa de trigonal a tetraédrico.'],
      ['Intermedio tetraédrico', 'Centro carbonílico tras la adición: ahora tiene cuatro enlaces σ; O suele estar como alcóxido o alcohol según el medio.'],
      ['Activación ácida', 'Protonar O aumenta la electrofilia del carbono, pero también puede protonar y desactivar al nucleófilo: hay que considerar ambos efectos.'],
      ['Trabajo final', 'Etapa posterior al ataque que protona un alcóxido o neutraliza especies cargadas; no debe confundirse con el reactivo que forma el enlace principal.']
    ],
    reading: [
      { title: 'Del dipolo a las dos flechas', paragraphs: [
        'El oxígeno es más electronegativo que el carbono y el enlace π C=O está polarizado. El carbono carbonílico es un centro electrofílico; el oxígeno puede protonarse o coordinar un ácido de Lewis. Esta imagen es más útil que una lista de «reactivos que dan alcohol»: predice dónde comienza el ataque.',
        'En una adición, la primera flecha va desde el par o enlace del nucleófilo al carbono del C=O. La segunda va del enlace π C=O al O. Si no desplazas ese par, dibujas un carbono pentavalente. El alcóxido resultante se protona durante el trabajo final.'
      ] },
      { title: 'Aldehído y cetona: tendencia, no dogma', paragraphs: [
        'Un aldehído tiene un sustituyente carbonado y un H; una cetona tiene dos sustituyentes carbonados. En comparaciones simples, los aldehídos suelen ser más susceptibles a adición por menor impedimento estérico y menor donación electrónica desde grupos alquilo.',
        'No uses esta tendencia a ciegas: grupos atractores, conjugación, tamaño del nucleófilo, disolvente y equilibrio pueden alterar el resultado. En hidratación, por ejemplo, el equilibrio de gem-dioles depende fuertemente del entorno del carbonilo.'
      ] },
      { title: 'Leer una transformación antes de memorizar el reactivo', paragraphs: [
        'Si el producto posee un enlace C–C nuevo sobre el antiguo carbono carbonílico, busca un nucleófilo carbonado (por ejemplo, un organometálico o cianuro) o una transformación posterior. Si el producto conserva el esqueleto y convierte C=O en C–OH con H añadido, piensa en reducción.',
        'En síntesis, retrocede desde el enlace nuevo: el carbono con OH en el producto suele señalar dónde estaba el C=O. Comprueba después si el nucleófilo y los grupos funcionales presentes son compatibles.'
      ] },
      { title: 'Controles de una respuesta PEP', paragraphs: [
        'Traza el esqueleto primero; colorea mentalmente el carbono del carbonilo antes y después. Pregunta si se creó un nuevo centro estereogénico. Si ambas caras planas son accesibles y no hay control quiral, puede formarse mezcla racémica; no inventes una configuración absoluta.',
        'Por último, identifica el trabajo final. Una reacción con Grignard genera primero un alcóxido; el H₃O⁺ de la segunda etapa da el alcohol. Escribir el alcohol directamente puede ser válido como producto final, pero debes saber en qué momento aparece.'
      ] }
    ],
    molecules: [
      { name: 'Benzaldehído', smiles: 'O=Cc1ccccc1', observation: 'C del C=O es el destino del nucleófilo; O recibirá el par π.' },
      { name: 'Acetofenona', smiles: 'CC(=O)c1ccccc1', observation: 'Cetona: dos sustituyentes carbonados alrededor del carbonilo.' },
      { name: 'Difenilmetanol', smiles: 'OC(c1ccccc1)c1ccccc1', observation: 'El antiguo carbono carbonílico lleva OH y un nuevo enlace C–Ph.' }
    ],
    worked: { prompt: 'Benzaldehído + PhMgBr; después H₃O⁺. ¿Dónde se forma el enlace y qué tipo de alcohol resulta?', steps: [
      'Trata el carbono unido a MgBr como equivalente nucleofílico de Ph⁻. Marca el carbono del aldehído como electrófilo.',
      'El enlace C–Mg entrega densidad a C=O mientras π C=O se desplaza al O: se crea C–Ph y un alcóxido.',
      'El trabajo ácido protona el alcóxido. El centro del antiguo carbonilo queda unido a dos fenilos, H y OH: alcohol secundario.'
    ], result: 'Ph₂CHOH (difenilmetanol). Se forma C–C en el antiguo carbono carbonílico.', contrast: 'La protonación es posterior; H₃O⁺ no debe estar presente durante la adición del reactivo de Grignard.' },
    task: { prompt: 'Dibuja el producto orgánico final de benzaldehído + PhMgBr, seguido de H₃O⁺. Luego identifica en tu razonamiento el alcóxido previo.', accepted: ['OC(c1ccccc1)c1ccccc1'], seed: 'O=Cc1ccccc1', reasoning: '¿Qué enlace C–C aparece? ¿Qué hace la flecha del enlace π y por qué el H del OH llega después?', rubric: ['Ph se une al carbono del C=O, no al O.', 'El par π C=O termina en O y aparece un alcóxido.', 'H₃O⁺ protona al final; el alcohol es secundario.'], hint: 'Localiza el H que ya tenía el carbono aldehídico: permanece en el producto.', solution: 'El fenilo de PhMgBr ataca el carbono carbonílico de PhCHO; se forma Ph₂CH–O⁻. El trabajo ácido da Ph₂CHOH.', error: 'Unir el fenilo al oxígeno o mezclar la etapa de Grignard con ácido desde el inicio.' },
    transfer: { prompt: 'Si sustituyes benzaldehído por benzofenona y mantienes PhMgBr/H₃O⁺, ¿qué cambia en el grado del alcohol? Justifica sin dibujar por memoria.', answer: 'Benzofenona ya tiene dos grupos fenilo unidos al C=O. Añadir otro Ph y protonar produce trifenilmetanol, un alcohol terciario: el antiguo carbono carbonílico queda enlazado a tres carbonos.', check: ['Cuenta los sustituyentes del carbono carbonílico inicial.', 'Conserva el nuevo enlace C–Ph.', 'Clasifica el alcohol por vecinos carbonados del carbono con OH.'] },
    notebook: { write: ['C=O: C δ+; dos flechas de adición y trabajo ácido separado.', 'Aldehído vs cetona: estérica y donación electrónica como tendencias.', 'Un ejemplo de retrosíntesis desde el carbono con OH.'], avoid: ['Tabla de productos sin explicar el enlace que nace.', 'Asignar estereoquímica no controlada.'] }
  },
  'org-07': {
    title: 'Adiciones al carbonilo: O, CN y protección',
    central: '¿Por qué unas adiciones quedan como alcoholes y otras son equilibrios que conviene desplazar?',
    duration: 85,
    source: { lecture: 'Aldehídos y cetonas', pages: '33–45, 62–65', guide: 'Guía 3 · Aldehídos y cetonas', status: 'Cátedra 2025 y PEP 2 real 2025: cianohidrinas, protección e hidrólisis.' },
    goals: ['Distinguir adición simple de formación de hemiacetal/acetal.', 'Explicar el papel de ácido, agua y exceso de alcohol en un equilibrio de protección.', 'Reconocer el nuevo enlace C–C en una cianohidrina y la posible mezcla estereoisomérica.'],
    terms: [
      ['Hidrato', 'Gem-diol formado al añadir agua a C=O; su proporción depende del sustrato y del equilibrio.'],
      ['Hemiacetal', 'Centro con OH y OR después de una primera adición de alcohol a un aldehído o cetona.'],
      ['Acetal / cetal', 'Centro con dos grupos OR; se forma en ácido con alcohol y eliminación de agua, y puede proteger al carbonilo.'],
      ['Cianohidrina', 'Producto de añadir CN⁻ al carbono carbonílico y protonar el O; contiene OH y CN en el mismo carbono.'],
      ['Protección', 'Conversión reversible de un grupo funcional para impedir que reaccione durante otra etapa de síntesis.']
    ],
    reading: [
      { title: 'El mismo primer gesto, destinos distintos', paragraphs: [
        'Agua, alcohol o cianuro pueden aportar un par al carbono de C=O. En todos los casos el enlace π se desplaza hacia O. Lo que ocurre después depende de protonaciones, capacidad de salir de un grupo, concentración de agua y estabilidad del producto. No conviene memorizar «alcohol da acetal» sin pasar por el hemiacetal.',
        'Un alcohol añade primero para dar un hemiacetal. Bajo catálisis ácida, protonar el OH facilita la salida de agua y otro alcohol ocupa su lugar; tras desprotonación queda acetal. Agua abundante y ácido permiten la hidrólisis inversa.'
      ] },
      { title: 'Por qué un acetal sirve en una secuencia', paragraphs: [
        'Convertir un carbonilo en acetal lo protege frente a muchos nucleófilos y bases que atacarían C=O. Más tarde, ácido acuoso regenera el aldehído o la cetona. No confundas la protección con reducir: el carbono sigue unido a dos oxígenos y puede volver al carbonilo.',
        'En una ruta de varias etapas, ordena protección → reacción en otro sitio → desprotección. Si haces la desprotección antes del ataque de un organometálico, el C=O vuelve a estar expuesto y la selectividad puede perderse.'
      ] },
      { title: 'Cianuro crea un enlace C–C', paragraphs: [
        'CN⁻ ataca por su carbono al carbono carbonílico; C=O entrega el par π a O y el alcóxido se protona. La cianohidrina conserva el carbono original y añade el carbono del nitrilo: es una ruta de alargamiento de cadena, no solo «un OH más».',
        'Un carbonilo plano puede ser atacado por ambas caras. Si se forma un nuevo centro quiral sin agente quiral, no dibujes una configuración única como si estuviera garantizada. Especifica que la representación sin cuña indica mezcla posible.'
      ] },
      { title: 'Condiciones y límites', paragraphs: [
        'La formación de acetales requiere catálisis ácida, alcohol y control del agua; la hidrólisis requiere agua y ácido. Una base por sí sola no suele ser la herramienta para desmontar un acetal corriente. Cuando una PEP mezcla grupos protegidos con otras transformaciones, identifica exactamente cuál grupo sobrevive a cada condición.',
        'La adición de HCN/CN⁻ es un contenido teórico de reacción; el cianuro es extremadamente peligroso en laboratorio. Nexo nunca debe convertir un ejercicio de mecanismo en instrucciones prácticas de manipulación fuera del protocolo docente.'
      ] }
    ],
    molecules: [
      { name: 'Benzaldehído', smiles: 'O=Cc1ccccc1', observation: 'Plano en el centro carbonílico.' },
      { name: 'Mandelonitrilo', smiles: 'N#CC(O)c1ccccc1', observation: 'El C del CN crea un enlace nuevo con el antiguo C=O.' },
      { name: 'Acetal de benzaldehído', smiles: 'COC(OC)c1ccccc1', observation: 'Dos OR sustituyen la función carbonilo de forma reversible.' }
    ],
    worked: { prompt: 'Benzaldehído + HCN: identifica el producto y el riesgo de asignar una estereoquímica única.', steps: [
      'Marca el carbono del nitrilo de CN⁻ como fuente de ataque y C=O del benzaldehído como destino.',
      'Se forma C–C y π C=O se rompe hacia O; la protonación da el grupo OH.',
      'El carbono del antiguo carbonilo queda unido a Ph, H, OH y CN: es quiral. Sin control quiral explícito, considera ambas caras de ataque.'
    ], result: 'Ph–CH(OH)–C≡N (mandelonitrilo), normalmente representado sin configuración única.', contrast: 'Atacar por N del cianuro daría una conectividad distinta; aquí el enlace nuevo es C–C.' },
    task: { prompt: 'Dibuja una estructura sin estereoquímica especificada de la cianohidrina de benzaldehído. En tu explicación identifica el carbono nuevo.', accepted: ['N#CC(O)c1ccccc1'], seed: 'O=Cc1ccccc1', reasoning: '¿Qué átomo de CN forma el enlace nuevo? ¿Por qué no impones R o S sin información adicional?', rubric: ['El carbono del CN se une al antiguo carbono carbonílico.', 'El oxígeno de C=O acaba como OH.', 'Reconoce el centro quiral y no inventa configuración única.'], hint: 'El grupo nitrilo debe conservar C≡N: verifica de qué extremo cuelga del centro con OH.', solution: 'CN⁻ ataca por C; tras protonación resulta Ph–CH(OH)–C≡N. La aproximación por dos caras da una mezcla si no hay inducción quiral.', error: 'Conectar N al carbonilo o dibujar una sola configuración sin justificación.' },
    transfer: { prompt: 'Debes reaccionar un organometálico en una molécula que tiene dos C=O, pero solo uno debe reaccionar. Explica qué aporta proteger uno como acetal y qué etapa lo regenera.', answer: 'El acetal oculta temporalmente uno de los carbonilos frente al organometálico. Tras la reacción selectiva y el trabajo apropiado, hidrólisis ácida acuosa regenera el C=O protegido. Hay que verificar compatibilidad de todos los demás grupos.', check: ['Ordena proteger → reaccionar → desproteger.', 'Distingue acetal de reducción irreversible.', 'Nombra ácido acuoso para regenerar C=O.'] },
    notebook: { write: ['C=O → hemiacetal → acetal y ruta inversa; indica papel del agua.', 'Cianohidrina: enlace C–C nuevo y posible estereoisomería.', 'Un mapa de protección en tres etapas.'], avoid: ['Solo nombres sin estructuras de hemiacetal/acetal.', 'Usar condiciones de laboratorio sin protocolo de seguridad.'] }
  },
  'org-08': {
    title: 'Nitrógeno en carbonilos: iminas y enaminas',
    central: '¿Por qué una amina primaria y una secundaria no dejan el mismo producto con una cetona?',
    duration: 85,
    source: { lecture: 'Aldehídos y cetonas', pages: '46–58', guide: 'Guía 3 · Aldehídos y cetonas', status: 'Cátedra y PEP 2 real 2025: hidrazonas, iminas y enaminas.' },
    goals: ['Construir el intermedio carbinolamina y seguir sus transferencias de protones.', 'Predecir imina con amina primaria y enamina con amina secundaria cuando existe Hα.', 'Explicar por qué pH muy bajo también puede frenar la reacción al protonar la amina.'],
    terms: [
      ['Carbinolamina', 'Intermedio tetraédrico con OH y N unidos al antiguo carbono carbonílico.'],
      ['Imina', 'Producto con C=N formado al condensar un carbonilo con amina primaria y perder agua.'],
      ['Ion iminio', 'Especie con C=N⁺; conecta condensación, formación de enamina y aminación reductiva.'],
      ['Enamina', 'Alqueno unido a N de amina secundaria; se forma al desprotonar un carbono α de un iminio.'],
      ['Hidrógeno α', 'H en carbono vecino al C=O o al centro iminio; su extracción puede formar un doble enlace C=C.']
    ],
    reading: [
      { title: 'Mecanismo común hasta la pérdida de agua', paragraphs: [
        'La amina aporta su par al carbono carbonílico y el enlace π va a O. Tras transferencias de protones aparece la carbinolamina. Para que salga agua, el OH debe protonarse: OH⁻ sería un mal grupo saliente. Al perder H₂O se llega a un ion iminio.',
        'El medio ácido cataliza estos cambios, pero demasiado ácido protona la amina de partida y le quita el par nucleofílico. La velocidad y el equilibrio dependen de un compromiso de condiciones, no de la regla «más ácido siempre mejor».'
      ] },
      { title: 'Primaria da imina; secundaria necesita otra salida', paragraphs: [
        'Con una amina primaria, después de formar iminio el N todavía tiene un H. Una base lo retira y queda C=N neutro: imina. Con una amina secundaria, el N del iminio ya no tiene H; si existe Hα, una base lo remueve y el doble enlace pasa a C=C vecino a N: enamina.',
        'Si no hay Hα accesible, la ruta ordinaria hacia enamina no está disponible. Antes de dibujar el producto, cuenta sustituyentes y H en N y en el carbono α. Éste es un control estructural, no una excepción para memorizar.'
      ] },
      { title: 'De la imina a una síntesis', paragraphs: [
        'Una imina puede reducirse a amina. Esta secuencia permite construir un enlace C–N de manera planificada, como viste en aminación reductiva. El carbono del antiguo C=O pierde su O como agua antes de la reducción; por eso el producto final no es una amida.',
        'Las hidrazonas y oximas son parientes: otros nucleófilos de N se condensan con C=O para producir variantes del enlace C=N. Pregunta qué átomo del reactivo porta el N que se enlaza al carbono del carbonilo.'
      ] },
      { title: 'Aplicación a una PEP de estructuras', paragraphs: [
        'Una pregunta puede darte una cetona y dos aminas diferentes y pedir productos. No escribas «condensación» como respuesta: dibuja C=N o C=C–N, conserva los sustituyentes del C=O y verifica dónde estuvo el H que se retiró.',
        'Si el problema muestra un producto de enamina, puedes trabajar hacia atrás: identifica el carbono unido a N y el carbono α del doble enlace; reconstruye el carbonilo y la amina secundaria que los originaron.'
      ] }
    ],
    molecules: [
      { name: 'Benzaldehído', smiles: 'O=Cc1ccccc1', observation: 'El carbono carbonílico formará el enlace a N.' },
      { name: 'Metilamina', smiles: 'CN', observation: 'Amina primaria: conserva H en N para dar imina.' },
      { name: 'Imina resultante', smiles: 'CN=Cc1ccccc1', observation: 'C=N reemplaza funcionalmente al C=O tras perder agua.' }
    ],
    worked: { prompt: 'Benzaldehído + metilamina bajo catálisis ácida moderada: deriva la imina.', steps: [
      'El par de metilamina ataca el carbono aldehídico; π C=O pasa a O.',
      'Transferencias de H crean una carbinolamina; protonar OH facilita la pérdida de H₂O y forma iminio.',
      'Como el N provenía de amina primaria, aún tiene H. Desprotonarlo da Ph–CH=N–CH₃.'
    ], result: 'N-metilbenzaldimina y agua; el esqueleto fenilo–CH se conserva.', contrast: 'Con una amina secundaria y un carbonilo con Hα se busca enamina, no la misma imina neutra.' },
    task: { prompt: 'Dibuja la imina de benzaldehído y metilamina, sin imponer geometría E/Z. Identifica el paso que elimina el oxígeno.', accepted: ['CN=Cc1ccccc1'], seed: 'O=Cc1ccccc1', reasoning: '¿Qué intermedio tetraédrico se forma, por qué sale H₂O y de dónde proviene el H perdido por N?', rubric: ['Se forma enlace C=N con el N de metilamina.', 'Hay carbinolamina e iminio antes de la imina.', 'El oxígeno sale como agua tras protonación del OH.'], hint: 'La metilamina es primaria: tras el iminio todavía queda un H en N.', solution: 'Ph–CHO + CH₃NH₂ ⇌ Ph–CH=N–CH₃ + H₂O. La carbinolamina pierde agua tras activar su OH; finalmente se desprotona N.', error: 'Dejar el oxígeno como amida o eliminar agua sin protonar el OH.' },
    transfer: { prompt: 'Ciclohexanona reacciona con pirrolidina. ¿Por qué no esperas la misma imina neutra de una amina primaria y qué átomo se desprotona al final?', answer: 'Pirrolidina es secundaria; el N del iminio no conserva H para formar una imina neutra. Un carbono α de ciclohexanona sí tiene H: desprotonarlo genera un doble enlace C=C vecino al N, es decir, una enamina.', check: ['Cuenta sustituyentes/H en N.', 'Identifica Hα.', 'Predice enamina mediante desprotonación en C, no en N.'] },
    notebook: { write: ['Carbonilo → carbinolamina → iminio → imina o enamina.', 'Tabla amina primaria/secundaria y ubicación del H final.', 'Condición: ácido cataliza pero exceso protona el nucleófilo.'], avoid: ['Una flecha única C=O → C=N sin intermedios.', 'Confundir amida con imina por contener C y N.'] }
  },
  'org-09': {
    title: 'Carbonilos en síntesis: reducción, Wittig y rutas',
    central: '¿Cómo elegir la transformación que cambia exactamente el enlace que necesito?',
    duration: 95,
    source: { lecture: 'Aldehídos y cetonas', pages: '23–32, 59–75', guide: 'Guía 3 · Aldehídos y cetonas', status: 'Cátedra y PEP 2 real 2025: Wittig, Grignard, oxidación/reducción y mapas.' },
    goals: ['Distinguir reducción C=O → alcohol de reemplazo C=O → C=C de Wittig.', 'Reconocer cuándo Grignard construye un enlace C–C y qué funcionalidad destruye ácido/agua.', 'Resolver una ruta corta por retrosíntesis y verificar compatibilidad de pasos.'],
    terms: [
      ['Hidruro', 'Equivalente de H⁻ donado por un reductor al carbono carbonílico; el O se protona en trabajo final.'],
      ['Reactivo de Grignard', 'Organomagnesiano que aporta un grupo carbonado nucleofílico; incompatible con agua o ácidos próticos durante el ataque.'],
      ['Iluro de fósforo', 'Reactivo usado en Wittig que reemplaza el O del carbonilo por un fragmento carbonado y forma C=C.'],
      ['Retrosíntesis', 'Análisis desde el producto hacia precursores al desconectar el enlace que se formó en la última transformación.'],
      ['Compatibilidad', 'Exigencia de que un reactivo no destruya otro grupo funcional ni sea neutralizado por el medio antes de lograr el cambio buscado.']
    ],
    reading: [
      { title: 'Leer el producto por el destino del oxígeno', paragraphs: [
        'Si un aldehído/cetona se reduce con un hidruro apropiado, el carbono del C=O recibe H y el O permanece como OH tras trabajo final. NaBH₄ suele reducir aldehídos y cetonas; LiAlH₄ es más reactivo y obliga a revisar otras funciones presentes. El nombre del reductor no sustituye el análisis de selectividad.',
        'En Wittig, en cambio, el O carbonílico no queda en el producto orgánico principal: el carbono del carbonilo establece C=C con el carbono del iluro. La pregunta retrospectiva es «¿cuál de los dos carbonos del nuevo doble enlace venía del carbonilo?». Eso reconstruye los precursores.'
      ] },
      { title: 'Grignard crea C–C, pero exige orden', paragraphs: [
        'Un organomagnesiano ataca el carbono carbonílico y produce un alcóxido. Agua o ácido presentes al inicio protonan el organomagnesiano y consumen su carácter nucleofílico; el trabajo ácido se añade después de la adición. Ante un producto alcohol, marca el nuevo enlace C–C para saber cuál fragmento viene del Grignard.',
        'Aldehído + Grignard suele dar alcohol secundario; cetona + Grignard, terciario. Formaldehído es el caso que da alcohol primario. Esto se deduce contando los sustituyentes del antiguo carbono carbonílico, no memorizando tres dibujos.'
      ] },
      { title: 'Oxidar y reducir sin perder la ruta', paragraphs: [
        'Un alcohol primario puede oxidarse a aldehído bajo condiciones que detengan allí la oxidación, o hasta ácido con oxidación más enérgica/acuosa. Un alcohol secundario da cetona. El producto depende de reactivo y medio, por lo que «oxidante» no es una instrucción suficiente en un mapa de síntesis.',
        'Al planificar, anota cada carbono y la función antes y después de un paso. Si una molécula contiene una amina, ácido o alcohol libre, pregunta si interferirá con un Grignard. Proteger o reordenar pasos puede ser más importante que recordar el nombre de una reacción.'
      ] },
      { title: 'Un examen no siempre tiene ruta única', paragraphs: [
        'Una secuencia de cuatro flechas puede admitir rutas alternativas. Se evalúa que cada paso sea químicamente razonable, produzca la conectividad correcta y no presuponga selectividad imposible. Si propusiste una ruta corta, intenta falsarla: ¿el reactivo también atacaría otro grupo? ¿el intermedio se puede aislar?',
        'En el cuaderno guarda una matriz de decisiones: si necesito C–H/OH, reducción; si necesito C–C/OH, organometálico; si necesito C=C, Wittig u otra olefinación. Añade a cada fila un límite de condiciones.'
      ] }
    ],
    molecules: [
      { name: 'Ciclohexanona', smiles: 'O=C1CCCCC1', observation: 'El C=O define el carbono que quedará en el alqueno.' },
      { name: 'Metilenociclohexano', smiles: 'C=C1CCCCC1', observation: 'Wittig incorpora un carbono nuevo como CH₂ del doble enlace exocíclico.' },
      { name: 'Ciclohexanol', smiles: 'OC1CCCCC1', observation: 'Una reducción conservaría el O y produciría este alcohol, no el alqueno.' }
    ],
    worked: { prompt: 'Ciclohexanona + Ph₃P=CH₂: deduce el producto y compáralo con NaBH₄.', steps: [
      'En Wittig identifica el carbono carbonílico dentro del anillo y el carbono CH₂ del iluro.',
      'El O carbonílico se elimina del producto orgánico principal y se establece C(anillo)=CH₂: doble enlace exocíclico.',
      'Con NaBH₄ no se aporta un carbono: el C=O recibe H, el O pasa a OH y obtendrías ciclohexanol.'
    ], result: 'Metilenociclohexano por Wittig; ciclohexanol por reducción. Productos de familias distintas.', contrast: 'No confundas Ph₃P=CH₂ con un reductor que simplemente agrega H al carbonilo.' },
    task: { prompt: 'Dibuja el producto orgánico principal de ciclohexanona + iluro Ph₃P=CH₂. Después compara el destino del O con una reducción por NaBH₄.', accepted: ['C=C1CCCCC1'], seed: 'O=C1CCCCC1', reasoning: '¿Cuál C del doble enlace proviene del carbonilo y cuál del iluro? ¿Qué producto diferente daría NaBH₄?', rubric: ['El doble enlace es exocíclico y contiene el nuevo CH₂ del iluro.', 'El O no queda en el producto orgánico de Wittig.', 'NaBH₄ daría ciclohexanol, no el mismo alqueno.'], hint: 'La cetona tenía un C dentro del anillo; el CH₂ nuevo debe quedar fuera.', solution: 'La olefinación da metilenociclohexano. El carbono C=O del anillo forma C=CH₂ con el carbono del iluro; una reducción conservaría el O como OH.', error: 'Dibujar ciclohexanol o un doble enlace interno sin rastrear el C del iluro.' },
    transfer: { prompt: 'Quieres transformar benzaldehído en Ph–CH=CH–CH₃. ¿Qué fragmento debe aportar el iluro de Wittig? ¿Por qué no sirve Ph₃P=CH₂?', answer: 'El carbono del iluro debe portar CH₃ y H: Ph₃P=CH–CH₃ (iluro apropiado). Ph₃P=CH₂ daría Ph–CH=CH₂, que tiene un carbono menos en la porción nueva.', check: ['Rastrea ambos carbonos del C=C.', 'Conserva Ph–CH del benzaldehído.', 'Detecta por qué el iluro de metileno falla.'] },
    notebook: { write: ['Matriz: reducción → C–OH; Grignard → C–C + OH; Wittig → C=C.', 'Marca en un producto qué átomos procedían del C=O y del reactivo.', 'Orden seco del Grignard y trabajo ácido final.'], avoid: ['Catálogo de nombres sin producto estructural.', 'Usar agua antes de completar la adición organometálica.'] }
  }
});
