/* V13: catalog metadata and avatar domain. Stable V11 IDs preserve ownership. */
(() => {
  'use strict';
  const legacySlot={hat:'head',bag:'back',shirt:'shirt',tail:'tail',scene:'background'};
  const slots=['head','face','shirt','back','tail','aura','background','main_hand','off_hand'];
  const labels={head:'Cabeza',face:'Cara',shirt:'Ropa',back:'Espalda',tail:'Cola',aura:'Aura',background:'Fondos',
    main_hand:'Mano principal',off_hand:'Mano secundaria',species:'Mascotas'};
  const rarities=['common','uncommon','rare','epic','legendary'];
  const names={
    'shirt-barca':'Túnica de resonancia', 'shirt-real':'Guardapolvo cristalino',
    'shirt-udechile':'Capa de análisis', 'shirt-colocolo':'Uniforme de entropía',
    'hat-asta-band':'Banda del catalizador', 'hat-golden-circlet':'Aro de la aurora',
    'hat-bulls-hood':'Capucha de observatorio','bag-grimoire':'Morral de fórmulas',
    'bag-bulls-mission':'Mochila de expedición', 'bag-golden-wind':'Mochila de resonancia',
    'tail-antimagic':'Estela de vacío', 'tail-wind-spirit':'Estela de brisa',
    'tail-salamander':'Estela de magma'
  };
  const originalArt=new Set(Object.keys(names));
  const catalog=[
    ...NEXO_DATA.companions.map(item=>({id:item.id,name:item.name,description:item.detail,slot:'species',
      rarity:rarities[Math.min(4,item.rarity||1)],price:item.price,compatibleSpecies:['*'],assetKey:item.species,
      active:true,metadata:{personality:item.species==='pig'?'curioso y metódico':'observador',
        dialogueProfile:'study_companion',preferredAnimations:['idle','study','happy']}})),
    ...NEXO_DATA.rewards.filter(item=>legacySlot[item.kind]).map(item=>({
      id:item.id,name:names[item.id]||item.name,description:item.detail,
      slot:legacySlot[item.kind],rarity:rarities[Math.min(4,item.rarity||1)],price:item.price,
      compatibleSpecies:['pig','cat','dog'],assetKey:originalArt.has(item.id)?`vector:${item.id}`:
        `${item.kind}:${item.key}`,active:true,metadata:{legacyKind:item.kind,legacyKey:item.key}
    })),
    ...[
      {id:'face-lens',name:'Lente de espectro',description:'Observa patrones invisibles entre cada intento.',slot:'face',rarity:'rare',price:140,assetKey:'vector:face-lens'},
      {id:'aura-resonance',name:'Aura de resonancia',description:'Una órbita suave que acompaña al estudio.',slot:'aura',rarity:'epic',price:310,assetKey:'vector:aura-resonance'},
      {id:'scene-archive',name:'Archivo astral',description:'Un refugio para ideas en construcción.',slot:'background',rarity:'rare',price:190,assetKey:'scene:archive'}
    ].map(item=>({...item,compatibleSpecies:['*'],active:true,metadata:{}})),
    ...[
      ['scene-ruins','Refugio de Nexo',0,'common','ruins'],
      ['scene-forest','Bosque de musgo',90,'uncommon','forest'],
      ['scene-lab','Laboratorio lunar',130,'rare','lab'],
      ['scene-sunset','Atardecer ámbar',170,'rare','sunset']
    ].map(([id,name,price,rarity,tone])=>({id,name,description:'Un entorno para tu compañero.',
      slot:'background',rarity,price,compatibleSpecies:['*'],assetKey:`scene:${tone}`,active:true,metadata:{tone}}))
  ];
  const byId=new Map(catalog.map(item=>[item.id,Object.freeze(item)]));
  const aliases={head:'hat',back:'bag',background:'scene'};
  function normalize(mascot={},inventory=['species-pig','scene-ruins']) {
    const current=mascot&&typeof mascot==='object'?mascot:{};
    const owned=new Set(inventory);
    const species=['pig','cat','dog'].includes(current.species)&&owned.has(`species-${current.species}`)
      ?current.species:'pig';
    const equipped={...current.slots};
    for(const slot of slots) {
      const legacy=aliases[slot]||slot;
      if(equipped[slot]===undefined) equipped[slot]=current[legacy]||null;
      const item=byId.get(equipped[slot]);
      if(!item||item.slot!==slot||!owned.has(item.id)||
        !(item.compatibleSpecies.includes('*')||item.compatibleSpecies.includes(species)))
        equipped[slot]=slot==='background'?'scene-ruins':null;
    }
    const result={...current,species,name:current.name||'Nexo',slots:equipped,
      animation:current.animation||'idle',appearance:current.appearance||{},
      renderer:current.renderer||'auto'};
    for(const slot of slots) result[aliases[slot]||slot]=equipped[slot];
    result.look=null;
    return result;
  }
  function preview(mascot,inventory,itemId) {
    const item=byId.get(itemId);
    if(!item)return normalize(mascot,inventory);
    const base=normalize(mascot,inventory);
    if(item.slot==='species')return {...base,species:item.assetKey};
    const next={...base,slots:{...base.slots,[item.slot]:item.id}};
    next[aliases[item.slot]||item.slot]=item.id;
    return next;
  }
  function equip(mascot,inventory,itemId,slot) {
    const item=itemId?byId.get(itemId):null;
    if(!slots.includes(slot)&&slot!=='species')throw new Error('invalid_slot');
    if(itemId&&(!item||item.slot!==slot||!inventory.includes(itemId)))throw new Error('item_not_owned');
    const base=normalize(mascot,inventory);
    if(slot==='species')return normalize({...base,species:item.assetKey},inventory);
    if(item&&!(item.compatibleSpecies.includes('*')||item.compatibleSpecies.includes(base.species)))
      throw new Error('incompatible_species');
    if(slot==='background'&&!itemId)throw new Error('background_required');
    return normalize({...base,slots:{...base.slots,[slot]:itemId}},inventory);
  }
  window.NexoAvatar={catalog,byId,slots,labels,rarities,legacySlot,normalize,preview,equip};
})();
