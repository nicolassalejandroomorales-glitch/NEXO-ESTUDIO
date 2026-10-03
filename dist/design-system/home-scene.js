/* UPDATE 01.3 checkpoint 1 — one profile; only the window is a slot/hotspot. */
(() => {
  'use strict';
  const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
  const profiles=freeze({
    'refugio-012':{
      sceneId:'refugio-012',referenceWidth:1672,referenceHeight:941,
      backgroundAsset:'assets/home-scenes/refugio-012.png',cleanPlateAsset:null,
      layers:{background:0,ambientBack:1,modularObjects:2,mascotBack:3,mascot:4,mascotFront:5,ambientFront:6,integratedUI:7,hotspots:8},
      slots:[{id:'window',type:'window',zone:'window-area',bounds:[.045,.08,.235,.40],layer:'modularObjects',renderMode:'baked',asset:null,foregroundAsset:null,replacementReady:false}],
      hotspots:[{id:'window-focus',slot:'window',inset:[.04,.04,.76,.60],action:'focus-light',accessibleLabel:'Ventana: resaltar suavemente la luz de entrada'}],
      mascotAnchors:{
        desk:{zone:'desk-area',bounds:[.025,.46,.345,.18],point:[.205,.55],layer:'mascot',active:true,seat:{width:.12,foot:.89}},
        window:{zone:'window-area',bounds:[.045,.08,.235,.40],point:[.16,.44],layer:'mascotBack',active:false},
        bookshelf:{zone:'bookshelf-area',bounds:[.34,.075,.40,.49],point:[.54,.55],layer:'mascotBack',active:false},
        rest:{zone:'rest-area',bounds:[.76,.42,.225,.33],point:[.87,.70],layer:'mascotBack',active:false}
      },
      ambientLayers:[
        {id:'window-view',className:'home-window-view',bounds:[120/1672,85/941,160/1672,320/941],depth:1},
        {id:'foliage-back',className:'refuge-foliage',bounds:[0,0,1,1],depth:1},
        {id:'window-tone',className:'home-window-tone',slot:'window',inset:[.025531914893617,.0375,.817021276595745,.8875],depth:2},
        {id:'light-rays',className:'refuge-light',bounds:[0,0,1,1],depth:3}
      ],
      lightingProfile:{sourceSlot:'window',driver:'NexoAmbientTime',states:['morning','day','dusk','night'],feedback:{duration:600,peakBrightness:1.12}}
    }
  });
  const defaultSceneId='refugio-012';
  function getProfile(id=defaultSceneId) {
    if(!profiles[id])throw new Error('Unknown home scene profile: '+id);
    return profiles[id];
  }
  const geometry=b=>`left:${b[0]*100}%;top:${b[1]*100}%;width:${b[2]*100}%;height:${b[3]*100}%;`;
  function ambientBounds(profile,layer) {
    if(!layer.slot)return layer.bounds;
    const slot=profile.slots.find(item=>item.id===layer.slot);
    const [x,y,w,h]=slot.bounds,[ix,iy,iw,ih]=layer.inset;
    return [x+w*ix,y+h*iy,w*iw,h*ih];
  }
  function replacementReady(profile,slot) {
    return slot.renderMode==='modular'&&slot.replacementReady===true&&Boolean(profile.cleanPlateAsset&&slot.asset);
  }
  function debugEnabled() {return new URLSearchParams(location.search).get('debugScene')==='true';}
  function render(profile=getProfile()) {
    const debug=debugEnabled();
    const ambient=profile.ambientLayers.map(layer=>`<div class="${layer.className} scene-ambient-layer" data-ambient-layer="${layer.id}" style="${geometry(ambientBounds(profile,layer))}--scene-depth:${layer.depth}" aria-hidden="true"></div>`).join('');
    const slots=profile.slots.map(slot=>{
      const ready=replacementReady(profile,slot);
      // A replacement is never painted over an object still baked in the base.
      const image=ready?`<img src="${slot.asset}" alt="" class="scene-object-image">`:'';
      const foreground=ready&&slot.foregroundAsset?`<span class="scene-slot" style="${geometry(slot.bounds)}--scene-depth:${profile.layers.mascotFront}" aria-hidden="true"><img src="${slot.foregroundAsset}" alt="" class="scene-object-foreground"></span>`:'';
      return `<span class="scene-slot" data-scene-slot="${slot.id}" data-replacement-ready="${ready}" style="${geometry(slot.bounds)}--scene-depth:${profile.layers[slot.layer]}" aria-hidden="true">${image}${debug?`<small class="scene-debug-label">slot · ${slot.id} · ${slot.renderMode}</small>`:''}</span>${foreground}`;
    }).join('');
    const hotspots=profile.hotspots.map(h=>{
      const slot=profile.slots.find(item=>item.id===h.slot);
      return `<button type="button" class="scene-hotspot" data-scene-hotspot="${h.id}" data-scene-slot-ref="${h.slot}" style="${geometry(ambientBounds(profile,h))}--scene-depth:${profile.layers.hotspots}" aria-label="${h.accessibleLabel}">${debug?`<small class="scene-debug-label">hotspot · ${h.id}</small>`:''}</button>`;
    }).join('');
    const anchors=debug?Object.entries(profile.mascotAnchors).map(([id,a])=>`<span class="scene-debug-anchor" style="left:${a.point[0]*100}%;top:${a.point[1]*100}%" aria-hidden="true"><small>${id}</small></span>`).join(''):'';
    return {markup:ambient+slots+hotspots+anchors,debug,backgroundAsset:profile.cleanPlateAsset||profile.backgroundAsset};
  }
  function legacyContract(profile=getProfile()) {
    const desk=profile.mascotAnchors.desk;
    const anchors=Object.fromEntries(Object.entries(profile.mascotAnchors).map(([id,a])=>[id==='rest'?'rest-area':id,{...a,selector:`[data-scene-zone="${a.zone}"]`}]));
    return freeze({artSize:[profile.referenceWidth,profile.referenceHeight],layers:{...profile.layers,scene:profile.layers.modularObjects,interactive:profile.layers.hotspots},currentSeat:{zone:desk.zone,x:desk.point[0],y:desk.point[1],...desk.seat},anchors});
  }
  let pulse=null;
  function cleanup() {pulse?.cancel();pulse=null;}
  function activate(id,root,profile=getProfile()) {
    const hotspot=profile.hotspots.find(item=>item.id===id);
    if(!hotspot||hotspot.action!=='focus-light')return false;
    cleanup();
    if(matchMedia('(prefers-reduced-motion: reduce)').matches||document.body.classList.contains('reduce-motion')||document.body.dataset.nexoAmbientMotion==='reduced')return true;
    const tone=root.querySelector('[data-ambient-layer="window-tone"]');
    if(!tone?.animate)return true;
    const feedback=profile.lightingProfile.feedback;
    pulse=tone.animate([{filter:'brightness(1)'},{filter:`brightness(${feedback.peakBrightness})`,offset:.5},{filter:'brightness(1)'}],{duration:feedback.duration,easing:'ease-in-out'});
    const active=pulse;
    active.finished.then(()=>{if(pulse===active)pulse=null;}).catch(()=>{});
    return true;
  }
  if(typeof matchMedia==='function')matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change',cleanup);
  if(typeof document!=='undefined')document.addEventListener('visibilitychange',()=>{if(document.hidden)cleanup();});
  window.NexoHomeScene=Object.freeze({profiles,getProfile,ambientBounds,replacementReady,render,legacyContract,activate,cleanup});
})();
