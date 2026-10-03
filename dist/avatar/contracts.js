/* Contrato V13 compartido entre el renderer Canvas y futuros rigs Rive. */
(() => {
  'use strict';
  const slots = Object.freeze(['head', 'face', 'shirt', 'back', 'tail', 'aura', 'background','main_hand','off_hand']);
  const anchors = Object.freeze(['head_anchor', 'face_anchor', 'torso_anchor', 'back_anchor', 'tail_anchor', 'aura_anchor','main_hand_anchor','off_hand_anchor']);
  const futureStates = Object.freeze(['idle', 'study', 'happy', 'celebrate', 'sleep', 'dance', 'surprised', 'rare_drop','read','write','think','ready']);
  const legacySlot = Object.freeze({ hat: 'head', bag: 'back', tail: 'tail', shirt: 'shirt',scene:'background' });
  const speciesAnchors=Object.freeze(Object.fromEntries(['pig','cat','dog'].map(species=>[species,Object.freeze({
    head_anchor:[.53,.22],face_anchor:[.64,.37],torso_anchor:[.59,.59],
    back_anchor:[.38,.65],tail_anchor:[.27,.68],aura_anchor:[.52,.49],
    main_hand_anchor:null,off_hand_anchor:null
  })])));
  const rigCapabilities=Object.freeze({riveArtboards:['pig','cat','dog'],stateMachines:['Idle','Companion'],
    timelines:Object.freeze({pig:['Idle','Read','Ready'],cat:['Idle'],dog:['Idle']}),
    animatedSlots:[],verifiedAnchors:[]});
  function compatibility(species,slot,item,room) {
    if(!['pig','cat','dog'].includes(species)||!slots.includes(slot))return false;
    if(item&&item.slot!==slot)return false;
    if(item&&!(item.compatibleSpecies?.includes('*')||item.compatibleSpecies?.includes(species)))return false;
    if(room==='games'&&slot==='main_hand')return false;
    return true;
  }
  function cosmetic(item, species = []) {
    if (!item?.id || !legacySlot[item.kind]) return null;
    return {
      id: item.id,
      name: item.name,
      slot: legacySlot[item.kind],
      rarity: ['common','uncommon','rare','epic','legendary'][Math.min(4,Number(item.rarity)||0)],
      price: Number(item.price) || 0,
      compatibleSpecies: [...species],
      asset: species.length ? Object.fromEntries(species.map(id => [id, `./assets/avatar/skins/${id}-${item.kind}-${item.key}.webp`])) : null
    };
  }
  window.NexoAvatarContracts = { slots, anchors, futureStates, legacySlot, speciesAnchors,
    rigCapabilities,compatibility,cosmetic };
})();
