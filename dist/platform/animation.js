/* GSAP opcional para microinteracciones; nunca se carga con movimiento reducido. */
(() => {
  'use strict';
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.body.classList.contains('reduce-motion');
  const presets={
    fadeIn:[{opacity:0},{opacity:1,duration:.2}],
    slideIn:[{opacity:0,y:14},{opacity:1,y:0,duration:.26}],
    scalePop:[{opacity:0,scale:.93},{opacity:1,scale:1,duration:.26}],
    rewardPop:[{scale:.88},{scale:1,duration:.36,ease:'back.out(1.5)'}],
    equipPulse:[{filter:'brightness(1.6)'},{filter:'brightness(1)',duration:.3}],
    modalEnter:[{opacity:0,scale:.96},{opacity:1,scale:1,duration:.2}],
    modalExit:[{opacity:1,scale:1},{opacity:0,scale:.97,duration:.16}]
  };
  async function run(target,preset='fadeIn') {
    if (!target || reduced()) return;
    try {
      await window.NexoLoader.script('./vendor/gsap/gsap.min.js');
      if(!target.isConnected)return;
      const [from,to]=presets[preset]||presets.fadeIn;
      window.gsap?.fromTo(target,from,{...to,ease:to.ease||'power1.out',clearProps:'transform,opacity,filter'});
    } catch { /* La interfaz sigue funcionando sin animación. */ }
  }
  let navigationAnimation=null, openingLeaf=null, openedInMemory=false, origin=null, previousFolio=null;
  const running=new Set();
  function prepare(root) {
    const source=root.querySelector('.continue-volume');
    const rect=source?.getBoundingClientRect();
    origin=rect&&rect.bottom>0&&rect.top<innerHeight?rect:null;
    previousFolio=root.querySelector('.grimoire-folio')?.innerHTML||null;
  }
  function animate(target,frames,options) {
    const animation=target.animate(frames,options);
    running.add(animation);
    animation.finished.finally(()=>running.delete(animation)).catch(()=>{});
    return animation;
  }
  function cancel() {
    running.forEach(animation=>animation.cancel());running.clear();
    navigationAnimation=null;openingLeaf?.remove();openingLeaf=null;
  }
  function transitionFor(previous,next,opened) {
    const from=String(previous||'').split('/'), to=String(next||'').split('/');
    const learn=parts=>['learn','subjects','subject','lesson','library','knowledge','inspector'].includes(parts[0]);
    if(previous===next) return {kind:'none',duration:0};
    if(learn(to)&&!learn(from)) return {kind:opened?'book-return':'book-first',duration:opened?500:1100};
    if(learn(from)&&to[0]==='home') return {kind:'book-close',duration:280};
    if(learn(to)&&learn(from)) return {kind:'page-turn',duration:320};
    return {kind:'none',duration:0};
  }
  function navigate(root,previous,next) {
    cancel();
    let opened=openedInMemory;
    try { opened=opened||sessionStorage.getItem('nexo-grimoire-update01')==='1'; } catch { /* tab memory fallback */ }
    const spec=transitionFor(previous,next,opened);
    if(spec.kind==='book-first') {
      openedInMemory=true;
      try { sessionStorage.setItem('nexo-grimoire-update01','1'); } catch { /* storage disabled */ }
    }
    root.dataset.worldTransition=spec.kind;
    root.dataset.transitionDuration=String(spec.duration);
    if(reduced()||document.body.dataset.nexoAmbientMotion==='reduced'||spec.kind==='none') return;
    const book=root.querySelector('.grimoire'),refuge=root.querySelector('.refuge');
    const target=book||refuge;
    if(!target?.animate)return;
    if(['book-first','book-return'].includes(spec.kind)&&book) {
      const leaf=document.createElement('div');
      leaf.className='book-passage';leaf.setAttribute('aria-hidden','true');
      leaf.innerHTML='<div class="book-passage-pages"><span>✦</span><div class="book-opening-glow"></div><i class="book-opening-spark">✧</i><i class="book-opening-spark">✦</i><i class="book-opening-spark">✧</i></div><div class="book-passage-cover"><span>✧</span><b>NEXO</b><small>GRIMORIO DEL CONOCIMIENTO</small><i>✦</i></div>';
      const measured=book.getBoundingClientRect();
      const rect={left:measured.left,top:measured.top+scrollY,width:measured.width,height:Math.max(180,Math.min(measured.height,innerHeight-(measured.top+scrollY)-20))};
      Object.assign(leaf.style,{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px'});
      document.body.append(leaf);openingLeaf=leaf;
      const start=origin?`translate(${origin.left-rect.left}px,${origin.top-rect.top}px) scale(${origin.width/rect.width},${origin.height/rect.height})`:'translateY(35px) scale(.88)';
      animate(leaf,[{transform:start,opacity:1},{transform:'none',opacity:1,offset:.38},{transform:'none',opacity:1,offset:.9},{transform:'none',opacity:0}],{duration:spec.duration,easing:'cubic-bezier(.2,.65,.25,1)',fill:'forwards'});
      navigationAnimation=animate(leaf.querySelector('.book-passage-cover'),[{transform:'rotateY(0deg)'},{transform:'rotateY(0deg)',offset:.16},{transform:'rotateY(-164deg)',offset:.96},{transform:'rotateY(-174deg)'}],{duration:spec.duration,easing:'cubic-bezier(.35,0,.35,1)',fill:'forwards'});
      animate(leaf.querySelector('.book-opening-glow'),[{opacity:0},{opacity:.55,offset:.55},{opacity:0}],{duration:spec.duration,easing:'ease-in-out',fill:'both'});
      leaf.querySelectorAll('.book-opening-spark').forEach((spark,index)=>animate(spark,[{opacity:0,transform:'translateY(5px) scale(.8)'},{opacity:.65,transform:'translateY(0) scale(1.06)',offset:.5},{opacity:0,transform:'translateY(-8px) scale(.9)'}],{duration:spec.duration*.65,delay:spec.duration*(.18+index*.07),easing:'ease-in-out',fill:'both'}));
      animate(book,[{opacity:0},{opacity:0,offset:.38},{opacity:1,offset:.86},{opacity:1}],{duration:spec.duration});
      navigationAnimation.finished.then(()=>{leaf.remove();if(openingLeaf===leaf)openingLeaf=null;}).catch(()=>leaf.remove());
    } else if(spec.kind==='page-turn'&&book&&previousFolio) {
      const leaf=document.createElement('div');
      leaf.className='grimoire-folio page-turn-leaf';leaf.setAttribute('aria-hidden','true');leaf.inert=true;
      leaf.innerHTML=previousFolio;book.append(leaf);openingLeaf=leaf;
      navigationAnimation=animate(leaf,[{transform:'rotateY(0deg)',opacity:1},{transform:'rotateY(-96deg)',opacity:1,offset:.7},{transform:'rotateY(-150deg)',opacity:0}],{duration:spec.duration,easing:'ease-in-out',fill:'forwards'});
      navigationAnimation.finished.then(()=>{leaf.remove();if(openingLeaf===leaf)openingLeaf=null;}).catch(()=>leaf.remove());
    } else {
      const frames=spec.kind==='page-turn'?[{transform:'perspective(1200px) rotateY(-4deg)',opacity:.72},{transform:'perspective(1200px) rotateY(0)',opacity:1}]
        :spec.kind==='book-close'?[{transform:'scale(1.025)',opacity:.7},{transform:'scale(1)',opacity:1}]
          :[{transform:'translateY(7px) scale(.985)',opacity:.8},{transform:'translateY(0) scale(1)',opacity:1}];
      navigationAnimation=animate(target,frames,{duration:spec.duration,easing:'ease-out'});
    }
  }
  // Stop an in-flight opening when motion preference changes or the tab is hidden.
  if(typeof matchMedia==='function')matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change',cancel);
  if(typeof document!=='undefined')document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel();});
  window.NexoAnimation = { reveal:target=>run(target,'slideIn'),run,reduced,presets:Object.keys(presets),transitionFor,navigate,prepare };
})();
