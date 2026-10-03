/* V13 shop and wardrobe view. No storage or Supabase access in this module. */
(() => {
  'use strict';
  const A=window.NexoAvatar;
  const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const categories=[['all','Todo'],...['head','face','shirt','back','tail','aura','background','species']
    .map(slot=>[slot,A.labels[slot]])];
  function catalogFor(view) {
    const remote=new Map((view.cloud.catalog||[]).map(item=>[item.cosmetic_id,item]));
    return A.catalog.filter(item=>item.active && (!view.cloud.authenticated||!remote.size||remote.get(item.id)?.active))
      .map(item=>({...item,...(remote.get(item.id)?{
        price:remote.get(item.id).price,name:remote.get(item.id).name,
        rarity:remote.get(item.id).rarity}:null)}));
  }
  const rarityNames={common:'Común',uncommon:'Inusual',rare:'Raro',epic:'Épico',legendary:'Legendario'};
  function badge(item) {return `<span class="forge-rarity" data-rarity="${escape(item.rarity)}">${rarityNames[item.rarity]||escape(item.rarity)}</span>`;}
  function stage(view,item,mode) {
    const mascot=item?A.preview(view.state.mascot,view.state.inventory,item.id):view.state.mascot;
    const scene=mascot.slots?.background||mascot.scene||'scene-ruins';
    return `<div class="forge-stage forge-${escape(scene.replace('scene-',''))}" data-forge-stage>
      <span class="forge-orbit" aria-hidden="true"></span>${view.avatarMarkup({large:true,model:mascot})}
      <p class="forge-stage-caption">${item?`VISTA PREVIA · ${escape(item.name)}`:
        mode==='shop'?'TU COMPAÑERO':'TU AVATAR ACTUAL'}</p></div>`;
  }
  function card(item,view,selected,mode) {
    const owned=view.state.inventory.includes(item.id);
    const equipped=item.slot==='species'?view.state.mascot.species===item.assetKey:
      view.state.mascot.slots?.[item.slot]===item.id;
    const art=item.slot==='species'?`<img class="forge-item-art" src="./assets/avatar/base/${escape(item.assetKey)}.webp" alt="" loading="lazy">`:
      item.slot==='background'?`<span class="forge-background-art forge-${escape(item.id.replace('scene-',''))}" aria-hidden="true">✧</span>`:
        window.NexoVectorArt.thumbnail(item,view.state.mascot.species);
    return `<article class="forge-card ${selected?'is-selected':''}" data-rarity="${escape(item.rarity)}">
      <button class="forge-card-preview" data-v13-preview="${escape(item.id)}" aria-label="Previsualizar ${escape(item.name)}">
        <span class="forge-item-symbol" aria-hidden="true">${art}</span>
        ${badge(item)}<strong>${escape(item.name)}</strong><small>${escape(A.labels[item.slot])}</small>
      </button><div class="forge-card-bottom"><span>${equipped?'✓ Equipado':owned?'✓ En inventario':item.price?`${item.price} ⚛`:'Gratis'}</span>
      ${mode==='shop'?'<span class="forge-card-cta">Ver →</span>':equipped?`<button data-v13-unequip="${escape(item.slot)}" ${item.slot==='background'||item.slot==='species'?'disabled':''}>Quitar</button>`:
        owned?`<button data-v13-equip="${escape(item.id)}">Equipar</button>`:
          `<button data-v13-buy="${escape(item.id)}" ${view.busy?'disabled':''}>Comprar</button>`}</div></article>`;
  }
  function renderShop(view) {
    const catalog=catalogFor(view),filter=view.filter||'all';
    const items=catalog.filter(item=>filter==='all'||item.slot===filter);
    const selected=catalog.find(item=>item.id===view.previewId)||null;
    return `<section class="page forge-page" data-v13-shop><header class="forge-intro"><div>
      <p class="eyebrow">MERCADO ARCANO</p><h1>Tienda</h1></div></header>
      <div class="forge-layout"><aside class="forge-preview-panel">${stage(view,selected,'shop')}
      <div class="forge-selection">${selected?`${badge(selected)}<h2>${escape(selected.name)}</h2><p>${escape(selected.description)}</p>
        <div class="forge-actions"><button class="secondary-btn" data-v13-clear-preview>Volver a mi avatar</button>
        ${view.state.inventory.includes(selected.id)?`<button class="primary-btn" data-v13-equip="${escape(selected.id)}">Equipar</button>`:
          `<button class="primary-btn" data-v13-buy="${escape(selected.id)}" ${view.busy?'disabled':''}>Comprar · ${selected.price} ⚛</button>`}</div>`:
        '<h2>Vista previa</h2><p>Elige un artículo.</p>'}</div></aside>
      <div class="forge-catalog"><nav class="forge-filters" aria-label="Categorías de la tienda">${categories.map(([id,label])=>
        `<button data-v13-filter="${id}" aria-pressed="${filter===id}" class="${filter===id?'active':''}">${label}</button>`).join('')}</nav>
        <div class="forge-grid">${items.map(item=>card(item,view,selected?.id===item.id,'shop')).join('')||
          '<p class="forge-empty">Aún no hay piezas disponibles en esta categoría.</p>'}</div></div></div>
      <p class="forge-note">${view.cloud.authenticated?'Compras verificadas por el servidor; el equipamiento se sincroniza con tu cuenta.':
        'Modo invitado: átomos y compras quedan en este dispositivo; no son saldo comercial verificable.'}</p>
    </section>`;
  }
  function renderEditor(view) {
    const filter=view.filter==='all'?'head':view.filter;
    const owned=catalogFor(view).filter(item=>view.state.inventory.includes(item.id)&&item.slot===filter);
    const selected=A.catalog.find(item=>item.id===view.previewId)||null;
    return `<section class="page forge-page forge-editor" data-v13-editor><header class="forge-intro"><div>
      <h1>Vestuario</h1></div>
      <button class="secondary-btn" data-route="shop">Explorar tienda →</button></header>
      <div class="forge-layout"><aside class="forge-preview-panel">${stage(view,selected,'editor')}
        <label class="field forge-name"><span>Nombre de tu compañero</span>
          <input data-mascot-name maxlength="24" value="${escape(view.state.mascot.name)}"></label>
        ${selected?`<button class="primary-btn" data-v13-equip="${escape(selected.id)}" ${view.state.inventory.includes(selected.id)?'':'disabled'}>Equipar pieza</button>`:''}
      </aside><div class="forge-catalog"><nav class="forge-filters" aria-label="Ranuras del avatar">${categories.slice(1).map(([id,label])=>
        `<button data-v13-filter="${id}" aria-pressed="${filter===id}" class="${filter===id?'active':''}">${label}</button>`).join('')}</nav>
        <div class="forge-slot-heading"><h2>${escape(A.labels[filter]||'Inventario')}</h2><small>${owned.length} disponibles</small>
          ${!['background','species'].includes(filter)?`<button class="text-btn" data-v13-unequip="${filter}">Desequipar ranura</button>`:''}</div>
        <div class="forge-grid">${owned.map(item=>card(item,view,selected?.id===item.id,'editor')).join('')||
          `<div class="forge-empty"><span>✧</span><h3>Todavía no tienes piezas aquí</h3>
            <p>Estudia con Nexo y explora el catálogo cuando quieras personalizar esta ranura.</p>
            <button class="secondary-btn" data-route="shop">Abrir tienda</button></div>`}</div></div></div></section>`;
  }
  window.NexoAvatarExperience={renderShop,renderEditor,catalogFor};
})();
