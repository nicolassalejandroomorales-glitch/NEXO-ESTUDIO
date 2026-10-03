/* Nexo mascot runtime — local Rive idle animations with layered-look fallback. */
(function initNexoMascotRuntime(global) {
  const imageCache = new Map();
  const diffCache = new Map();
  const vectorCache = new Map();

  function loadImage(src) {
    if (imageCache.has(src)) return imageCache.get(src);
    const promise = new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
    imageCache.set(src, promise);
    return promise;
  }

  function fittedRect(image, size) {
    const scale = Math.min(size / image.width, size / image.height);
    const width = image.width * scale;
    const height = image.height * scale;
    return { x: (size - width) / 2, y: (size - height) / 2, width, height };
  }

  async function differenceLayer(baseSrc, skinSrc, size) {
    const key = `${baseSrc}|${skinSrc}|${size}`;
    if (diffCache.has(key)) return diffCache.get(key);
    const promise = Promise.all([loadImage(baseSrc), loadImage(skinSrc)]).then(([base, skin]) => {
      const baseCanvas = document.createElement('canvas');
      const skinCanvas = document.createElement('canvas');
      const output = document.createElement('canvas');
      baseCanvas.width = skinCanvas.width = output.width = size;
      baseCanvas.height = skinCanvas.height = output.height = size;
      const baseContext = baseCanvas.getContext('2d', { willReadFrequently: true });
      const skinContext = skinCanvas.getContext('2d', { willReadFrequently: true });
      const outputContext = output.getContext('2d');
      const baseRect = fittedRect(base, size);
      const skinRect = fittedRect(skin, size);
      baseContext.drawImage(base, baseRect.x, baseRect.y, baseRect.width, baseRect.height);
      skinContext.drawImage(skin, skinRect.x, skinRect.y, skinRect.width, skinRect.height);
      const baseData = baseContext.getImageData(0, 0, size, size);
      const skinData = skinContext.getImageData(0, 0, size, size);
      const pixels = skinData.data;
      const original = baseData.data;
      for (let index = 0; index < pixels.length; index += 4) {
        const alpha = pixels[index + 3];
        if (alpha < 8) continue;
        const baseAlpha = original[index + 3];
        const difference = Math.abs(pixels[index] - original[index])
          + Math.abs(pixels[index + 1] - original[index + 1])
          + Math.abs(pixels[index + 2] - original[index + 2])
          + Math.abs(alpha - baseAlpha);
        if (baseAlpha > 8 && difference < 54) pixels[index + 3] = 0;
      }
      outputContext.putImageData(skinData, 0, 0);
      return output;
    });
    diffCache.set(key, promise);
    if (diffCache.size > 24) diffCache.delete(diffCache.keys().next().value);
    return promise;
  }

  function skinPath(species, slot, key) {
    return key && key !== 'none' ? `./assets/avatar/skins/${species}-${slot}-${key}.webp` : null;
  }

  function selectedLayers(config) {
    return ['aura','tail','shirt','back','head','face'].map(slot=>{
      const item=global.NexoAvatar?.byId.get(config[slot]);
      return item && item.slot===slot ? {slot,item} : null;
    }).filter(Boolean);
  }
  function vectorImage(item,species) {
    const key=`${item.id}:${species}`;
    if(!vectorCache.has(key)) {
      const svg=global.NexoVectorArt.svg(item,species);
      vectorCache.set(key,loadImage('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)));
    }
    return vectorCache.get(key);
  }
  async function accessories(config,size) {
    const baseSrc=`./assets/avatar/base/${config.species||'pig'}.webp`;
    return Promise.all(selectedLayers(config).map(async entry=>{
      const item=entry.item;
      const image=item.assetKey.startsWith('vector:')
        ? await vectorImage(item,config.species)
        : await differenceLayer(baseSrc,skinPath(config.species,item.metadata.legacyKind,item.metadata.legacyKey),size);
      return {...entry,image};
    }));
  }
  async function drawLayered(canvas, config) {
    const size = canvas.width || 640;
    const context = canvas.getContext('2d');
    const species = config.species || 'pig';
    const hasEquipment=selectedLayers(config).length>0;
    const pose=config.intent==='read'||config.intent==='think'?'read':config.intent==='ready'?'ready':'idle';
    const baseSrc = species==='pig'&&!hasEquipment
      ? `./assets/avatar/poses/pig-${pose}.png`
      : `./assets/avatar/base/${species}.webp`;
    const base = await loadImage(baseSrc);
    const layers=await accessories(config,size);
    if (!canvas.isConnected) return;
    context.clearRect(0, 0, size, size);
    for(const layer of layers.filter(item=>['aura','tail'].includes(item.slot)))
      context.drawImage(layer.image,0,0,size,size);
    const rect = fittedRect(base, size);
    context.drawImage(base, rect.x, rect.y, rect.width, rect.height);
    ['shirt', 'back', 'head','face'].forEach(slot => {
      const layer = layers.find(item => item.slot === slot);
      if (layer) context.drawImage(layer.image, 0, 0, size, size);
    });
    canvas.style.backgroundImage='none';
    canvas.dataset.engine = 'layered';
  }

  async function mountRive(canvas, config) {
    // This Rive file has no verified accessory anchors. Keep equipped pieces
    // composited with the body in the still-frame fallback until the rig is upgraded.
    if (selectedLayers(config).length) return false;
    if (config.mini || document.body.classList.contains('reduce-motion') ||
      document.body.dataset.nexoMascotMotion==='reduced' || document.body.dataset.nexoQuality==='low' ||
      matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    if (!canvas.isConnected) return false;
    try {
      await global.NexoLoader.script('./vendor/rive/rive.js');
      if (!canvas.isConnected || !global.rive) return false;
      const { Rive, Layout, Fit, Alignment, RuntimeLoader } = global.rive;
      RuntimeLoader.setWasmUrl('./vendor/rive/rive.wasm');
      let instance;
      const pose = config.intent === 'read' || config.intent === 'think' ? 'Read'
        : config.intent === 'ready' ? 'Ready' : 'Idle';
      const newPigRig = config.species === 'pig';
      instance = new Rive({
        src: newPigRig ? './assets/avatar/nexo-companion-v2.riv' : './assets/avatar/mascots.riv',
        canvas,
        artboard: config.species || 'pig',
        autoplay: true,
        ...(newPigRig ? { animations: pose } : { stateMachines: 'Idle' }),
        layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
        onLoad: () => {
          if (!canvas.isConnected) return instance.cleanup();
          instance.resizeDrawingSurfaceToCanvas();
          canvas.dataset.engine = 'rive';
          canvas.dataset.pose = newPigRig ? pose : 'Idle';
          canvas.style.backgroundImage='none';
          const syncPlayback=()=>{
            if(document.hidden || canvas.__nexoVisible===false)instance.pause();
            else instance.play();
          };
          canvas.__nexoVisible=true;
          canvas.__nexoObserver=new IntersectionObserver(entries=>{
            canvas.__nexoVisible=entries[0]?.isIntersecting===true;
            syncPlayback();
          },{threshold:0.01});
          canvas.__nexoObserver.observe(canvas);
          canvas.__nexoVisibility=syncPlayback;
          document.addEventListener('visibilitychange',syncPlayback);
          syncPlayback();
        },
        onLoadError: () => {
          instance.cleanup();
          if (canvas.isConnected) drawLayered(canvas, config).catch(() => {});
        }
      });
      canvas.__nexoRive = instance;
      return true;
    } catch {
      return false;
    }
  }

  async function mount(canvas, config) {
    if (canvas.dataset.rendered === '1') return;
    canvas.dataset.rendered = '1';
    if (await mountRive(canvas, config)) return;
    try {
      await drawLayered(canvas, config);
    } catch {
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function cleanup(root) {
    root.querySelectorAll('canvas[data-mascot-config]').forEach(canvas => {
      canvas.__nexoObserver?.disconnect();
      if(canvas.__nexoVisibility)document.removeEventListener('visibilitychange',canvas.__nexoVisibility);
      canvas.__nexoObserver=null;canvas.__nexoVisibility=null;
      canvas.__nexoRive?.cleanup();
      canvas.__nexoRive = null;
    });
  }

  // Single high-level boundary. UI does not select Rive, Canvas or layers.
  global.NexoAvatarRenderer = { mount, cleanup };
  global.NexoMascotRuntime = global.NexoAvatarRenderer; // legacy integration alias
})(window);
