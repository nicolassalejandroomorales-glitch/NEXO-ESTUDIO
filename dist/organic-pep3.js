window.NEXO_ORGANIC_COURSE = window.NEXO_ORGANIC_COURSE || {};
Object.assign(window.NEXO_ORGANIC_COURSE, {
  'org-10': {
    title: 'Ácidos carboxílicos: estructura, acidez y síntesis',
    central: '¿Por qué el ácido carboxílico dona H⁺ y cómo se llega a él sin perder el esqueleto?',
    duration: 80,
    source: { lecture: 'Ácidos carboxílicos', pages: 'clase completa', guide: 'Guía 5 · Ácidos carboxílicos', status: 'Cátedra 2025 usada este semestre; ubicación exacta en PEP por confirmar.' },
    goals: ['Justificar acidez comparando conjugadas, no por una etiqueta.', 'Distinguir O–H ácido de C–H alfa y predecir el efecto de sustituyentes.', 'Elegir una ruta hacia ácido desde alcohol, aldehído o nitrilo según el producto.'],
    terms: [
      ['Ácido carboxílico', 'Grupo R–C(=O)–OH; el protón de O–H puede transferirse a una base.'],
      ['Carboxilato', 'Base conjugada R–COO⁻ cuya carga se distribuye entre los dos oxígenos por resonancia.'],
      ['Efecto inductivo', 'Desplazamiento de densidad a través de enlaces σ; un sustituyente atractor puede estabilizar la base conjugada.'],
      ['pKa', 'Medida logarítmica de acidez: menor pKa implica ácido más fuerte en el mismo medio.'],
      ['Hidrólisis de nitrilo', 'Conversión R–C≡N en R–COOH bajo condiciones apropiadas; el carbono del nitrilo permanece como carbono carbonílico.']
    ],
    reading: [
      { title: 'Acidez: compara las especies después de perder H⁺', paragraphs: [
        'La diferencia esencial entre un alcohol y un ácido carboxílico no es que uno «tenga más oxígenos» como regla aislada. Es que el carboxilato producido al desprotonar el ácido reparte densidad entre dos O; un alcóxido ordinario no dispone de esa deslocalización equivalente. La comparación relevante es la estabilidad de las bases conjugadas.',
        'No dibujes dos moléculas de carboxilato que se transforman una en otra. Las estructuras de resonancia son contribuyentes de una misma especie. Tampoco pongas la carga en el carbono si no conservas los electrones y las valencias.'
      ] },
      { title: 'Qué hacen los sustituyentes', paragraphs: [
        'Un grupo atractor de electrones cerca de COOH suele estabilizar COO⁻ por inducción y aumentar acidez; el efecto disminuye con la distancia. Un donador puede producir el efecto opuesto. En un ácido aromático se suman otros efectos y la posición importa: no basta memorizar «halógeno aumenta».',
        'Una transferencia ácido–base se decide comparando la fuerza de los ácidos en ambos lados y considerando el medio. Bicarbonato, por ejemplo, permite distinguir muchos ácidos carboxílicos de fenoles y alcoholes en condiciones usuales; no es una prueba universal sin contexto.'
      ] },
      { title: 'Planificación de una síntesis', paragraphs: [
        'Un alcohol primario puede oxidarse hasta ácido con un oxidante fuerte acuoso. Un aldehído también puede oxidarse a ácido. Un nitrilo permite introducir un carbono adicional desde un haluro apropiado: primero sustitución a R–C≡N; después hidrólisis a R–COOH.',
        'En cada ruta dibuja el esqueleto y marca el carbono que será el carbonilo. Si la cadena de producto tiene un carbono más, la ruta por nitrilo es candidata; si la longitud se conserva y ya hay un alcohol primario, compara oxidación. El reactivo no sustituye el razonamiento de contabilidad de carbonos.'
      ] },
      { title: 'Conexión con derivados', paragraphs: [
        'COOH puede convertirse en éster, amida o cloruro de acilo, pero la dirección y condiciones de cada conversión no son intercambiables. La reactividad de derivados se entenderá al estudiar qué grupo saliente queda y cuán estabilizado está.',
        'El mapa de la unidad es: estructura del ácido → base conjugada → acidez → rutas de síntesis → transformación del grupo acilo. Este mapa evita aprender reacciones como fichas inconexas.'
      ] }
    ],
    molecules: [
      { name: 'Ácido acético', smiles: 'CC(=O)O', observation: 'Localiza el H unido al O sencillo; ese es el protón ácido habitual.' },
      { name: 'Acetato', smiles: 'CC(=O)[O-]', observation: 'Los dos enlaces C–O del anión real comparten carácter; la fórmula aquí es un contribuyente.' },
      { name: 'Ácido cloroacético', smiles: 'ClCC(=O)O', observation: 'El Cl cercano atrae densidad por inducción y estabiliza el carboxilato.' }
    ],
    worked: { prompt: 'Desde bromuro de etilo, construye ácido propanoico y explica el carbono adicional.', steps: [
      'Cuenta: bromuro de etilo tiene dos carbonos; el ácido propanoico tiene tres. Una oxidación sola no crea el tercero.',
      'Sustitución de Br por CN⁻ sobre el carbono primario: CH₃CH₂CN. El carbono de CN es el nuevo carbono 3.',
      'Hidrólisis del nitrilo bajo condiciones adecuadas produce CH₃CH₂COOH. Comprueba el número de carbonos y el destino del N.'
    ], result: 'CH₃CH₂Br → CH₃CH₂CN → CH₃CH₂COOH.', contrast: 'Oxidar bromuro de etilo directamente no es la ruta pertinente ni agrega un carbono.' },
    task: { prompt: 'Dibuja el ácido que resulta de convertir 1-bromopropano en nitrilo y luego hidrolizarlo. Justifica el número de carbonos.', accepted: ['CCCC(=O)O'], seed: 'CCCBr', reasoning: '¿Qué carbono de la molécula final proviene de CN⁻? ¿Qué paso reemplaza Br y qué paso transforma C≡N?', rubric: ['El producto tiene cuatro carbonos, no tres.', 'El carbono del nitrilo acaba como carbono de COOH.', 'Distingue sustitución e hidrólisis.'], hint: 'Cuenta el carbono de CN⁻ como parte de la cadena.', solution: '1-bromopropano → butanonitrilo → ácido butanoico. CN⁻ sustituye Br y aporta un carbono; la hidrólisis convierte C≡N en COOH.', error: 'Olvidar el carbono aportado por CN⁻ o proponer una oxidación sin cambiar longitud.' },
    transfer: { prompt: 'Compara ácido acético, ácido cloroacético y etanol: ordénalos cualitativamente por acidez y justifica desde las bases conjugadas.', answer: 'Ácido cloroacético > ácido acético >> etanol en acidez usual. Ambos carboxilatos están estabilizados por resonancia frente a etóxido; Cl estabiliza adicionalmente por inducción al carboxilato cercano.', check: ['Compara bases conjugadas.', 'Reconoce resonancia de carboxilato.', 'Añade efecto inductivo de Cl.'] },
    notebook: { write: ['Dibujo de ácido ↔ carboxilato con dos contribuyentes de resonancia.', 'Mapa de síntesis con conteo de carbonos.', 'Tu error concreto al comparar ácidos.'], avoid: ['Lista de pKa sin explicación.', 'Tratar estructuras de resonancia como especies separadas.'] }
  },
  'org-11': {
    title: 'Derivados de ácido: sustitución acílica y selectividad',
    central: '¿Por qué algunos carbonilos sustituyen un grupo y otros solo adicionan?',
    duration: 85,
    source: { lecture: 'Derivados de ácidos carboxílicos', pages: 'clase completa', guide: 'Guía 7 · Derivados', status: 'Cátedra 2025 usada este semestre; ubicación exacta en PEP por confirmar.' },
    goals: ['Construir el mecanismo adición–eliminación con intermedio tetraédrico.', 'Comparar cloruro de acilo, anhídrido, éster y amida por grupo saliente y resonancia.', 'Escoger reactivo y orden para una conversión de derivado sin proponer una inversa imposible.'],
    terms: [
      ['Grupo acilo', 'Fragmento R–C(=O)– que mantiene el carbono carbonílico durante sustitución acílica.'],
      ['Sustitución nucleofílica acílica', 'Nu ataca C=O, se forma intermedio tetraédrico y luego sale un grupo unido a ese carbono.'],
      ['Intermedio tetraédrico', 'Centro C que temporalmente tiene cuatro enlaces σ; puede colapsar restaurando C=O.'],
      ['Grupo saliente', 'Fragmento que abandona con el par C–X; su estabilidad contribuye a la posibilidad de reacción.'],
      ['Transesterificación', 'Intercambio del grupo –OR de un éster por otro alcohol bajo catálisis apropiada; equilibrio condicionado por proporciones.']
    ],
    reading: [
      { title: 'El mecanismo común, paso a paso', paragraphs: [
        'En R–C(=O)–X, el nucleófilo dona un par al carbono del carbonilo y el π C=O pasa al O. Aparece un intermedio tetraédrico. Después O devuelve densidad para formar C=O y se rompe C–X hacia X. Según cargas y medio, hay transferencias de protones antes o después.',
        'La diferencia con una cetona no es que la cetona «no reaccione». Reacciona por adición, pero carece de un X adecuado para una eliminación ordinaria. Si dibujas salida de un carbanión desde una cetona simple, has postulado un pésimo grupo saliente sin justificarlo.'
      ] },
      { title: 'Reactividad no es una escala mágica', paragraphs: [
        'Cloruros de acilo y anhídridos suelen ser más reactivos que ésteres; las amidas son menos reactivas en sustitución habitual. Influyen la aptitud de X para salir, la donación por resonancia al carbonilo, el impedimento y condiciones. No memorices solo una flecha de mayor a menor sin explicar por qué.',
        'El nitrógeno de una amida dona su par al carbonilo y reduce carácter electrofílico del carbono; expulsar NH₂⁻ sería muy desfavorable. Esto conecta con la baja basicidad relativa de la amida respecto de una amina: el par está comprometido en resonancia.'
      ] },
      { title: 'Diseña el producto desde el nucleófilo y el grupo saliente', paragraphs: [
        'Cloruro de acilo + alcohol, con base apropiada, permite éster. Cloruro de acilo + amina permite amida. El nucleófilo determina el grupo que queda unido al acilo; el Cl es el saliente. Una amina adicional o base neutraliza el ácido generado.',
        'Un éster puede hidrolizarse a ácido/carboxilato según medio. En medio básico la saponificación queda impulsada por formación de carboxilato. Convertir una amida directamente en cloruro de acilo por simple tratamiento con Cl⁻ no sigue la escala favorable.'
      ] },
      { title: 'Qué conservar en síntesis', paragraphs: [
        'Rastrea el carbono carbonílico del reactivo al producto. Dibuja qué grupo reemplaza a X; conserva el resto R. Si hay reacción de Grignard con un éster, espera posible doble adición porque la cetona intermedia puede recibir otra equivalente; no trates esa ruta como si parara por defecto en cetona.',
        'En una ruta multietapa, decide dónde conviene activar el ácido y dónde debes proteger una función sensible. Especificar la familia de reacción no es suficiente para garantizar selectividad.'
      ] }
    ],
    molecules: [
      { name: 'Cloruro de acetilo', smiles: 'CC(=O)Cl', observation: 'Cl es el grupo que puede abandonar después del ataque nucleofílico.' },
      { name: 'Acetato de etilo', smiles: 'CC(=O)OCC', observation: 'Conserva el grupo acetilo; OEt entró desde etanol.' },
      { name: 'Acetamida', smiles: 'CC(=O)N', observation: 'El par de N se comunica con C=O; no equivale a una amina libre.' }
    ],
    worked: { prompt: 'Predice cloruro de acetilo + etanol en presencia de base.', steps: [
      'El O de etanol aporta el par; C carbonílico del cloruro de acetilo acepta.',
      'Tras ataque se forma un tetraedro. El O carbonílico reforma C=O y sale Cl⁻.',
      'Una base elimina el H del O incorporado y captura el ácido formado. Revisa que el acilo sea CH₃CO– y el grupo nuevo –OCH₂CH₃.'
    ], result: 'Acetato de etilo, CH₃C(=O)OCH₂CH₃.', contrast: 'La reacción no genera éter CH₃CH₂OCH₃ ni cetona: rastrea el grupo carbonilo.' },
    task: { prompt: 'Dibuja el producto orgánico de cloruro de acetilo con etanol, en presencia de una base. Explica las dos flechas del colapso tetraédrico.', accepted: ['CC(=O)OCC'], seed: 'CC(=O)Cl', reasoning: '¿Qué fragmento entra, qué fragmento sale y por qué vuelve a aparecer C=O?', rubric: ['El grupo acetilo se conserva.', '–OCH₂CH₃ sustituye a Cl, sin perder el carbonilo.', 'El colapso reforma C=O y rompe C–Cl.'], hint: 'Dibuja primero C con cuatro enlaces σ y luego deja que el O reforme C=O.', solution: 'El producto es acetato de etilo: el O de etanol se une al C acílico, el O⁻ del intermedio reforma C=O y se expulsa Cl⁻; una base desprotona.', error: 'Dibujar una adición estable sin expulsar Cl o reemplazar el carbono del acilo.' },
    transfer: { prompt: 'Explica por qué una amida resiste más una sustitución acílica que un cloruro de acilo y relaciona eso con la basicidad de N.', answer: 'La amida recibe donación por resonancia del par de N, reduciendo electrofilia del C=O; además, expulsar un anión nitrogenado es desfavorable. Ese mismo par menos disponible hace al N de la amida menos básico que una amina ordinaria.', check: ['Menciona resonancia de N.', 'Menciona aptitud del grupo saliente.', 'Conecta la disponibilidad del par con basicidad.'] },
    notebook: { write: ['Mecanismo ataque → tetraedro → colapso → ajuste ácido–base.', 'Tabla derivado / grupo saliente / donación por resonancia.', 'Transformación de cloruro de acilo a éster y amida.'], avoid: ['Una escala de reactividad sin justificación.', 'Copiar cada reacción como caso aislado.'] }
  },
  'org-12': {
    title: 'Carbono alfa: enoles, enolatos y sustitución',
    central: '¿Cómo puede reaccionar el carbono junto al C=O en lugar del propio carbonilo?',
    duration: 85,
    source: { lecture: 'Condensaciones y sustituciones alfa', pages: 'bloque inicial', guide: 'Guía 9 · Carbono alfa y condensaciones', status: 'Cátedra 2025 usada este semestre; ubicación exacta en PEP por confirmar.' },
    goals: ['Distinguir carbono carbonílico, alfa y beta en una estructura nueva.', 'Derivar el enolato con flechas y ubicar sus dos sitios nucleofílicos.', 'Predecir producto de alquilación alfa y declarar límites de selectividad.'],
    terms: [
      ['Carbono alfa', 'Carbono directamente vecino al carbono C=O; sus hidrógenos pueden ser relativamente ácidos.'],
      ['Enolato', 'Base conjugada tras retirar H alfa; densidad compartida entre C alfa y O por resonancia.'],
      ['Enol', 'Isómero con C=C y OH que se interconvierte con el carbonilo por tautomería.'],
      ['Tautomería', 'Interconversión de estructuras constitucionales con movimiento de H y doble enlace; no es resonancia.'],
      ['Alquilación alfa', 'Formación de enlace C(alfa)–C a partir de un enolato y un electrófilo adecuado.']
    ],
    reading: [
      { title: 'Dos centros reactivos en una misma molécula', paragraphs: [
        'El carbono del C=O suele ser electrófilo; en cambio, quitar un H del carbono alfa permite crear un enolato nucleofílico. Esta dualidad prepara aldol y Michael: el mismo tipo de molécula puede ser donador o aceptor según condiciones.',
        'En una cetona como acetona, identifica C=O, luego los dos carbonos adyacentes: ambos son alfa. Un carbono que está dos enlaces más lejos es beta. Nombrar bien evita dibujar la alquilación en la posición equivocada.'
      ] },
      { title: 'Por qué es más ácido un H alfa', paragraphs: [
        'Al retirar H alfa, el par puede quedar en C alfa y deslocalizarse hacia O mediante el sistema C=C–O. El enolato se representa con contribuyentes C⁻–C=O y C=C–O⁻. La carga no está viajando entre dos moléculas: son dibujos de una misma especie.',
        'Enolato y enol no son contribuyentes de resonancia. Cambia la posición de un protón, por lo tanto son especies constitucionalmente distintas. Este error arrastra después fallos al justificar catálisis ácida y básica.'
      ] },
      { title: 'Forma el enlace alfa con criterio', paragraphs: [
        'Un enolato puede atacar un haluro de alquilo primario por SN2 para formar C–C alfa. Pero la base, disolvente, número de hidrógenos alfa y competencia de O-alquilación o eliminación pueden alterar selectividad. Un haluro terciario no es buen compañero para SN2.',
        'Si la cetona tiene dos posiciones alfa diferentes, predicción de producto único exige controlar enolato cinético/termodinámico u otras condiciones. Decir solo «base» no demuestra que se haya seleccionado una posición.'
      ] },
      { title: 'Puente hacia condensaciones', paragraphs: [
        'En la aldol, el enolato ataca a otro carbonilo, no a un haluro. En Michael, ataca al carbono beta de un aceptor α,β-insaturado. El núcleo común es el nucleófilo en C alfa; lo que cambia es el electrófilo y el número de pasos.',
        'En una respuesta de prueba marca con color o numeración los carbonos que formarán el enlace nuevo. Después reconstruye el producto; así evitas confiar en una plantilla visual parecida pero incorrecta.'
      ] }
    ],
    molecules: [
      { name: 'Acetona', smiles: 'CC(C)=O', observation: 'Los dos CH₃ junto al carbonilo tienen H alfa.' },
      { name: 'Enolato de acetona', smiles: 'C=C(C)[O-]', observation: 'Esta es la forma con carga en O; la otra forma tiene carga en C alfa.' },
      { name: 'Butan-2-ona', smiles: 'CCC(C)=O', observation: 'Posee dos posiciones alfa no equivalentes: la selectividad requiere condiciones.' }
    ],
    worked: { prompt: 'Acetona → enolato → reacción con bromuro de metilo: ¿qué enlace se forma?', steps: [
      'Quita un H alfa con base adecuada y dibuja el enolato; el extremo C alfa puede aportar densidad.',
      'Ese C alfa ataca al carbono de CH₃Br por SN2 y C–Br sale hacia Br.',
      'Se obtiene butan-2-ona por C-alquilación. Revisa que ahora haya cuatro carbonos y que el carbonilo se conserve.'
    ], result: 'CH₃COCH₃ → CH₃COCH₂CH₃.', contrast: 'No es una adición al C=O ni la transformación de cetona en alcohol.' },
    task: { prompt: 'Dibuja el producto de C-alquilación del enolato de acetona con CH₃Br. Explica dónde se formó el enlace nuevo.', accepted: ['CCC(C)=O'], seed: 'CC(C)=O', reasoning: '¿Qué H se retiró, cuál átomo del enolato atacó y cuál enlace salió?', rubric: ['La cetona conserva C=O.', 'Se añade un CH₃ al C alfa, dando butan-2-ona.', 'Justifica ataque SN2 al carbono de CH₃Br y salida de Br.'], hint: 'El nuevo C–C no se forma sobre el oxígeno carbonílico.', solution: 'El C alfa del enolato de acetona ataca CH₃Br; sale Br⁻ y se obtiene CH₃COCH₂CH₃.', error: 'O-alquilación dibujada como si fuera el producto de C-alquilación solicitado, o pérdida del carbonilo.' },
    transfer: { prompt: 'Para butan-2-ona, ¿puedes anunciar un solo producto alfa-alquilado si el enunciado dice simplemente «base + CH₃Br»? Justifica.', answer: 'No necesariamente. La butan-2-ona tiene dos carbonos alfa no equivalentes; sin condiciones que seleccionen enolato cinético o termodinámico, no está justificada una única regioquímica. Deben declararse las condiciones o una mezcla posible.', check: ['Identifica ambas posiciones alfa.', 'Declara falta de selectividad justificada.', 'Relaciona el control con condiciones.'] },
    notebook: { write: ['C=O, C alfa y C beta rotulados en dos sustratos.', 'Flechas de formación del enolato y dos contribuyentes.', 'Una excepción: cetona asimétrica y regioselectividad.'], avoid: ['Confundir tautomería y resonancia.', 'Escribir «el enolato ataca» sin marcar el átomo que lo hace.'] }
  },
  'org-13': {
    title: 'Condensaciones: aldol, Michael y anulación de Robinson',
    central: '¿Cómo construir el esqueleto de un producto nuevo, no solo reconocer el nombre de la reacción?',
    duration: 100,
    source: { lecture: 'Condensaciones y sustituciones alfa', pages: 'bloques de aldol, Michael y Robinson', guide: 'Guía 9 · Carbono alfa y condensaciones', status: 'Cátedra 2025 usada este semestre; ubicación exacta en PEP por confirmar.' },
    goals: ['Desconectar una aldol en el enlace C(alfa)–C(carbonilo original).', 'Distinguir adición 1,2 al carbonilo de adición conjugada 1,4.', 'Secuenciar Michael → aldol intramolecular → deshidratación en Robinson.'],
    terms: [
      ['Aldol', 'Adición de un enolato a un carbonilo que produce un β-hidroxicarbonilo; puede deshidratar a carbonilo α,β-insaturado.'],
      ['Donador', 'Compuesto que genera el enolato y aporta el carbono alfa nucleofílico.'],
      ['Aceptor', 'Compuesto que aporta el centro electrofílico: C=O en aldol o C beta en Michael.'],
      ['Adición conjugada (Michael)', 'Ataque nucleofílico al C beta de un sistema C=C–C=O; después se restablece el carbonilo.'],
      ['Anulación de Robinson', 'Secuencia de Michael y aldol intramolecular, seguida de deshidratación, para formar un anillo de enona.']
    ],
    reading: [
      { title: 'Aldol: el enlace nuevo revela a los participantes', paragraphs: [
        'Primero genera enolato desde un carbonilo con H alfa. Ese C alfa ataca al carbono de otro C=O, cuyo π va a O. Tras protonación obtienes un β-hidroxicarbonilo: el OH queda en el carbono que originalmente era electrófilo; el C=O que conserva el producto pertenece al donador.',
        'Con calor/condiciones apropiadas puede ocurrir deshidratación para dar un carbonilo α,β-insaturado. No borres el O del carbonilo remanente ni supongas deshidratación si el problema pide el aldol de adición. La distinción producto de adición versus condensación importa.'
      ] },
      { title: 'Intramolecular: cuenta el anillo antes de dibujarlo', paragraphs: [
        'Si una molécula tiene dos carbonilos y un H alfa adecuado, una aldol intramolecular puede cerrar un anillo. Marca el C alfa nucleófilo y el C del carbonilo aceptor, traza el enlace nuevo y cuenta todos los átomos del ciclo. Los anillos de cinco o seis miembros suelen ser candidatos favorables, pero no sustituyen la verificación geométrica.',
        'Una retrosíntesis útil rompe mentalmente el enlace C(alfa)–C(antiguo carbonilo) en el producto. Así recuperas donador y aceptor. Funciona mejor que mirar el producto y recordar una figura de diapositiva.'
      ] },
      { title: 'Michael: cambia el sitio de ataque', paragraphs: [
        'Un carbonilo α,β-insaturado tiene dos centros de ataque posibles: carbono carbonílico (1,2) y carbono beta (1,4). Un enolato estabilizado puede añadir en conjugación al C beta, formando un enlace C–C y dejando un sistema que se protona/restaura C=O. La selectividad depende del nucleófilo y condiciones; no toda reacción con una enona será 1,4.',
        'En el producto de Michael, el carbonilo del aceptor no desaparece. Si dibujas un alcohol como resultado necesario, probablemente aplicaste el esquema de adición 1,2 en vez de conjugada.'
      ] },
      { title: 'Robinson: una secuencia, no un sello', paragraphs: [
        'Después de Michael aparece un 1,5-dicarbonilo apropiado. Entonces una aldol intramolecular cierra el anillo y una deshidratación puede generar enona. Marca por separado el enlace hecho en Michael y el hecho en aldol; así puedes explicar la topología del producto.',
        'Para resolver síntesis, separa los tres eventos en un mapa: (1) C alfa del donador → C beta del aceptor; (2) C alfa del intermedio → C carbonílico interno; (3) pérdida de H₂O desde el β-hidroxicarbonilo. El mecanismo completo es más seguro que reconocer una silueta.'
      ] }
    ],
    molecules: [
      { name: 'Acetona', smiles: 'CC(C)=O', observation: 'Puede aportar enolato en una aldol.' },
      { name: 'Aldol de acetona', smiles: 'CC(=O)CC(C)(C)O', observation: 'El OH está en el antiguo C=O aceptor; el otro C=O permanece.' },
      { name: 'Óxido de mesitilo', smiles: 'CC(=O)C=C(C)C', observation: 'La pérdida de agua crea la conjugación C=C–C=O.' }
    ],
    worked: { prompt: 'Autocondensación de acetona con calor: rastrea los dos carbonilos.', steps: [
      'Una acetona genera enolato: su C alfa ataca al C=O de otra acetona.',
      'Tras protonación aparece 4-hidroxi-4-metilpentan-2-ona (alcohol diacetona). El C=O conservado procede del donador.',
      'Bajo deshidratación, se elimina H₂O y resulta 4-metilpent-3-en-2-ona (óxido de mesitilo). Comprueba seis carbonos y el sistema conjugado.'
    ], result: 'Aldol de adición: CH₃COCH₂C(OH)(CH₃)₂. Condensación: CH₃COCH=C(CH₃)₂.', contrast: '«Aldol» puede referirse al producto β-hidroxicarbonílico, no necesariamente al producto deshidratado.' },
    task: { prompt: 'Dibuja el producto deshidratado de la autocondensación de acetona con calor. Después marca qué acetona fue donador y cuál aceptor.', accepted: ['CC(=O)C=C(C)C'], seed: 'CC(C)=O', reasoning: '¿Dónde se formó el enlace C–C, cuál carbonilo se conservó y de dónde sale el agua?', rubric: ['Seis carbonos en el producto.', 'Carbonilo y C=C conjugados.', 'Identifica donador, aceptor y pérdida de H₂O.'], hint: 'Primero dibuja el β-hidroxicarbonilo; después quita OH del C beta y H del C alfa.', solution: 'La acetona donadora conserva C=O; su C alfa se une al C=O aceptor. Tras β-hidroxicarbonilo y deshidratación se obtiene CH₃COCH=C(CH₃)₂.', error: 'Producto con cinco carbonos, doble enlace fuera de conjugación o ausencia del carbonilo donador.' },
    transfer: { prompt: 'En una enona, un enolato estabilizado ataca C beta. ¿Sería el primer paso una aldol o una Michael? ¿Qué evento adicional permitiría una anulación de Robinson?', answer: 'Es una adición de Michael (1,4) porque el ataque ocurre en C beta del sistema conjugado. Si el aducto presenta carbonilos con geometría e H alfa apropiados, una aldol intramolecular puede cerrar anillo y luego deshidratar a enona.', check: ['Distingue ataque 1,4 de 1,2.', 'Identifica la segunda etapa aldol intramolecular.', 'Incluye deshidratación como etapa posterior condicionada.'] },
    notebook: { write: ['Mapa donador C alfa → aceptor C=O en aldol; donador C alfa → aceptor C beta en Michael.', 'Tres estructuras: reactivos, β-hidroxicarbonilo, enona.', 'Robinson como dos enlaces C–C construidos en pasos distintos.'], avoid: ['Una lista de nombres sin rastrear carbonos.', 'Dibujar un anillo sin contar sus átomos.'] }
  }
});
