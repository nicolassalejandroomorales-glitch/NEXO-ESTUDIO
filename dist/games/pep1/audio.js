/* =====================================================================
   AUDIO: música de jefe "orquestal" sintetizada en vivo + efectos.
   Todo es composición original para Nexo (no cita obras existentes). No son grabaciones:
   coro = ondas de sierra filtradas con formantes de la vocal "a"; metales = sierra con filtro que se abre; etc.
   ===================================================================== */
(function(){
const P1 = window.P1 = window.P1 || {};
const rand=(a,b)=>a+Math.random()*(b-a);
const mtof=m=>440*Math.pow(2,(m-69)/12);
const SND={ctx:null,on:true,layers:{},mode:'calm',phase:1,song:'mapa',step:0,next:0};

/* ---------- Canciones ----------
   key: nota MIDI de la tónica · bpm por fase · prog: 8 acordes (2 compases cada par)
   ost: ostinato de 16 semicorcheas (semitonos sobre la raíz del acorde; null = silencio)
   mel: [paso de 0 a 127, semitonos sobre key, duración en semicorcheas] */
const CH={i:[0,3,7],iv:[5,8,12],V:[7,11,14],VI:[8,12,15],III:[3,7,10],VII:[10,14,17],bII:[1,5,8]};
const MEL_REY=[[0,19,6],[6,20,2],[8,19,4],[12,15,4],[16,12,8],[24,15,4],[28,19,4],[32,20,6],[38,22,2],[40,24,4],[44,22,4],[48,20,12],[60,19,4],
  [64,17,6],[70,19,2],[72,20,4],[76,24,4],[80,29,8],[88,27,4],[92,24,4],[96,23,6],[102,24,2],[104,26,4],[108,27,4],[112,26,12],[124,23,4]];
const SONGS={
  // Mapa: calma, campanas sobre el coro (La menor).
  mapa:{key:57,bpm:[72],prog:['i','i','VI','VI','III','III','VII','V'],coro:true,leadCalm:true,melVoz:'bell',
    mel:[[0,12,8],[8,15,8],[32,15,8],[40,19,8],[64,19,8],[72,15,8],[96,14,8],[104,11,8]]},
  // Trimetilamina: Mi menor, pizzicato burlón y metales graves.
  amina:{key:52,bpm:[100,112],prog:['i','i','VI','VI','iv','iv','V','V'],coro:true,metal:true,timp:true,
    ost:[0,null,7,null,12,null,7,null,0,7,12,7,0,null,-5,null],ostVoz:['pizz'],ostVoz2:['pizz','strings'],
    taiko:[0,10],taiko2:[0,6,10,14],melVoz:'brass',brillo:.55,
    mel:[[0,12,3],[3,11,1],[4,12,2],[6,7,2],[8,3,4],[12,7,4],[16,12,2],[18,14,2],[20,15,4],[24,14,2],[26,12,2],[28,11,4],
      [32,15,3],[35,14,1],[36,12,2],[38,8,2],[40,12,4],[44,15,4],[48,17,6],[54,15,2],[56,12,8],
      [64,17,3],[67,15,1],[68,12,2],[70,8,2],[72,5,4],[76,8,4],[80,12,6],[86,8,2],[88,5,8],
      [96,11,3],[99,12,1],[100,14,2],[102,11,2],[104,7,4],[108,11,4],[112,14,8],[120,11,4],[124,7,4]]},
  // Ciclobutadieno: Do menor nervioso, con el acorde napolitano (D♭) que "no sabe dónde estar".
  ciclo:{key:48,bpm:[116,126],prog:['i','bII','i','bII','iv','V','i','V'],coro:true,metal:true,timp:true,
    ost:[0,12,0,12,1,13,0,12,0,12,1,13,7,6,1,0],ostVoz:['strings'],taiko:[0,4,8,12],taiko2:[0,3,6,8,11,14],melVoz:'brass',brillo:1.2,
    mel:[[0,12,2],[2,15,2],[4,19,2],[6,15,2],[8,12,2],[10,15,2],[12,19,4],[16,20,2],[18,17,2],[20,13,2],[22,17,2],[24,20,4],[28,17,4],
      [32,19,3],[35,18,1],[36,19,4],[40,15,4],[44,12,4],[48,13,4],[52,17,4],[56,20,6],[62,19,2],
      [64,24,4],[68,20,2],[70,17,2],[72,20,4],[76,24,4],[80,23,4],[84,26,4],[88,23,2],[90,19,2],[92,23,4],
      [96,24,6],[102,22,2],[104,19,4],[108,15,4],[112,23,8],[120,19,4],[124,23,4]]},
  // Benceno malvado: Sol menor de catedral, órgano y coro.
  benceno:{key:55,bpm:[88,98],prog:['i','VI','III','VII','iv','i','V','V'],coro:true,organo:true,metal:true,timp:true,
    ost:[0,null,null,7,null,null,12,null,0,null,null,7,null,null,12,7],ostVoz:['strings'],taiko:[0,8],taiko2:[0,3,8,11],melVoz:'organ',
    mel:[[0,19,8],[8,15,4],[12,12,4],[16,15,6],[22,17,2],[24,20,8],[32,22,8],[40,19,4],[44,15,4],[48,17,6],[54,19,2],[56,21,8],
      [64,24,8],[72,20,4],[76,17,4],[80,19,6],[86,17,2],[88,15,8],[96,23,4],[100,26,4],[104,23,4],[108,19,4],[112,23,12],[124,19,4]]},
  // Rey Amonio: Re menor; fase 2 cambia Sol menor por E♭ (napolitano); fase 3 acelera y el coro canta la melodía.
  rey:{key:50,bpm:[92,104,112],prog:['i','i','VI','VI','iv','iv','V','V'],prog2:['i','i','VI','VI','bII','bII','V','V'],coro:true,metal:true,timp:true,
    ost:[0,0,12,0,7,0,12,7,0,0,12,0,7,12,7,1],ostVoz:['strings'],taiko:[0,6,10],taiko2:[0,3,6,10,13],melVoz:'brass',coroMel:3,
    mel:MEL_REY, mel2:MEL_REY.map(([s,n,l])=>s===70?[s,18,l]:(s===76||s===92)?[s,25,l]:[s,n,l])}
};

/* ---------- Motor ---------- */
function init(){
  if(SND.ctx){ if(SND.ctx.state==='suspended') SND.ctx.resume(); return; }
  const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
  const c=SND.ctx=new AC();
  const comp=c.createDynamicsCompressor(); comp.threshold.value=-16; comp.ratio.value=4; comp.connect(c.destination);
  SND.master=c.createGain(); SND.master.gain.value=SND.on?.62:0; SND.master.connect(comp);
  // Reverberación de "catedral" generada con ruido.
  const len=c.sampleRate*3.4, ir=c.createBuffer(2,len,c.sampleRate);
  for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6);}
  SND.verb=c.createConvolver(); SND.verb.buffer=ir; const vg=c.createGain(); vg.gain.value=.32; SND.verb.connect(vg).connect(SND.master);
  SND.music=c.createGain(); SND.music.gain.value=.6; SND.music.connect(SND.master);
  SND.sfx=c.createGain(); SND.sfx.gain.value=.8; SND.sfx.connect(SND.master); SND.sfx.connect(SND.verb);
  for(const k of ['choir','organ','bell','strings','pizz','brass','timp','taiko','lead']){
    const g=c.createGain(); g.gain.value=0; g.connect(SND.music); if(k!=='taiko') g.connect(SND.verb); SND.layers[k]=g; }
  const nb=c.createBuffer(1,c.sampleRate,c.sampleRate),nd=nb.getChannelData(0); for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1; SND.noise=nb;
  SND.next=c.currentTime+.1; SND.step=0;
  setInterval(schedule,25);
  setMode(SND.mode);
  document.addEventListener('visibilitychange',()=>{ if(document.hidden) c.suspend(); else c.resume(); });
}
function tone(t,m,dur,o){
  const c=SND.ctx,osc=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();
  osc.type=o.type||'sine'; osc.frequency.value=mtof(m); if(o.detune) osc.detune.value=o.detune;
  f.type='lowpass'; f.frequency.value=o.cut||3000;
  const a=o.attack||.008, r=Math.min(o.release||.08,dur*.9), pk=o.gain||.2;
  g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(pk,t+a); g.gain.setValueAtTime(pk,t+Math.max(a,dur-r)); g.gain.linearRampToValueAtTime(0,t+dur);
  if(o.slide){ osc.frequency.setValueAtTime(mtof(m),t); osc.frequency.exponentialRampToValueAtTime(mtof(m+o.slide),t+dur); }
  osc.connect(f).connect(g).connect(o.bus); osc.start(t); osc.stop(t+dur+.05);
}
function noise(t,dur,o){
  const c=SND.ctx,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();
  s.buffer=SND.noise; f.type=o.ft||'highpass'; f.frequency.value=o.freq||6000; if(o.q) f.Q.value=o.q;
  g.gain.setValueAtTime(o.gain||.2,t); g.gain.exponentialRampToValueAtTime(.0008,t+dur);
  s.connect(f).connect(g).connect(o.bus); s.start(t,Math.random()*.5); s.stop(t+dur+.02);
}
function choir(t,m,dur,g,bus){
  const c=SND.ctx,src=c.createGain(),out=c.createGain(),end=t+dur;
  out.gain.setValueAtTime(0,t); out.gain.linearRampToValueAtTime(g,t+Math.min(.7,dur*.4));
  out.gain.setValueAtTime(g,Math.max(t+.7,end-.8)); out.gain.linearRampToValueAtTime(0,end+.5);
  const lfo=c.createOscillator(),lg=c.createGain(); lfo.frequency.value=rand(4.4,5.4); lg.gain.value=10; lfo.connect(lg);
  for(const d of [-12,0,11]){const o=c.createOscillator();o.type='sawtooth';o.frequency.value=mtof(m);o.detune.value=d+rand(-3,3);lg.connect(o.detune);o.connect(src);o.start(t);o.stop(end+.55);}
  for(const [f,q,a] of [[720,6,1.6],[1100,8,.9],[2500,10,.45]]){const bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.value=f;bp.Q.value=q;const fg=c.createGain();fg.gain.value=a;src.connect(bp).connect(fg).connect(out);}
  out.connect(bus); lfo.start(t); lfo.stop(end+.55);
}
function brass(t,m,dur,g,bus,bright=1){
  const c=SND.ctx,f=c.createBiquadFilter(),v=c.createGain(),end=t+dur;
  f.type='lowpass'; f.Q.value=1.4;
  f.frequency.setValueAtTime(240,t); f.frequency.linearRampToValueAtTime(900+1600*bright,t+.09);
  f.frequency.exponentialRampToValueAtTime(520+800*bright,t+Math.max(.1,Math.min(dur,.7)));
  v.gain.setValueAtTime(0,t); v.gain.linearRampToValueAtTime(g,t+.05);
  v.gain.linearRampToValueAtTime(g*.8,Math.max(t+.06,end-.12)); v.gain.linearRampToValueAtTime(0,end);
  for(const d of [-7,6]){const o=c.createOscillator();o.type='sawtooth';o.frequency.value=mtof(m);o.detune.value=d;o.connect(f);o.start(t);o.stop(end+.05);}
  f.connect(v).connect(bus);
}
function organ(t,m,dur,g,bus){
  const c=SND.ctx,v=c.createGain(),end=t+dur;
  v.gain.setValueAtTime(0,t); v.gain.linearRampToValueAtTime(g,t+.06); v.gain.setValueAtTime(g,Math.max(t+.06,end-.15)); v.gain.linearRampToValueAtTime(0,end+.1);
  for(const [h,a] of [[1,1],[2,.55],[3,.3],[4,.22],[6,.1]]){const o=c.createOscillator(),og=c.createGain();o.frequency.value=mtof(m)*h;o.detune.value=rand(-4,4);og.gain.value=a;o.connect(og).connect(v);o.start(t);o.stop(end+.15);}
  v.connect(bus);
}
function pizz(t,m,g,bus){
  const c=SND.ctx,o=c.createOscillator(),v=c.createGain(),f=c.createBiquadFilter();
  o.type='triangle'; o.frequency.value=mtof(m); f.type='lowpass'; f.frequency.setValueAtTime(2600,t); f.frequency.exponentialRampToValueAtTime(380,t+.3);
  v.gain.setValueAtTime(g,t); v.gain.exponentialRampToValueAtTime(.001,t+.35); o.connect(f).connect(v).connect(bus); o.start(t); o.stop(t+.4);
}
function timp(t,m,g,bus){
  const c=SND.ctx,o=c.createOscillator(),v=c.createGain();
  o.frequency.setValueAtTime(mtof(m)*1.05,t); o.frequency.exponentialRampToValueAtTime(mtof(m),t+.09);
  v.gain.setValueAtTime(g,t); v.gain.exponentialRampToValueAtTime(.001,t+1.4); o.connect(v).connect(bus); o.start(t); o.stop(t+1.45);
  noise(t,.1,{ft:'lowpass',freq:520,gain:g*.7,bus});
}
function taiko(t,g,bus){
  const c=SND.ctx,o=c.createOscillator(),v=c.createGain();
  o.frequency.setValueAtTime(100,t); o.frequency.exponentialRampToValueAtTime(46,t+.25);
  v.gain.setValueAtTime(g,t); v.gain.exponentialRampToValueAtTime(.001,t+.8); o.connect(v).connect(bus); o.start(t); o.stop(t+.82);
  noise(t,.14,{ft:'lowpass',freq:800,gain:g*.55,bus});
}
function bell(t,m,g,bus){
  for(const [r,a,d] of [[.5,.5,4],[1,1,3.4],[2,.4,2.3],[2.76,.35,1.7],[5.4,.16,.9],[8.93,.07,.5]]){
    const c=SND.ctx,o=c.createOscillator(),v=c.createGain(); o.frequency.value=mtof(m)*r;
    v.gain.setValueAtTime(0,t); v.gain.linearRampToValueAtTime(g*a,t+.006); v.gain.exponentialRampToValueAtTime(.0005,t+d);
    o.connect(v).connect(bus); o.start(t); o.stop(t+d+.05);}
}
const wrap=(m,lo=58,hi=72)=>{while(m<lo)m+=12;while(m>=hi)m-=12;return m;};
function voz(v,t,m,dur,g,bus,song){
  if(v==='brass') brass(t,m,dur,g*1.45,bus,song.brillo||1);
  else if(v==='organ') organ(t,m,dur,g*1.1,bus);
  else if(v==='bell') bell(t,m,g*1.1,bus);
  else if(v==='pizz') pizz(t,m,g*2.4,bus);
  else if(v==='coro') choir(t,m,dur+.2,g*1.3,bus);
  else { tone(t,m,dur,{type:'sawtooth',gain:g*.8,cut:1500,detune:-9,release:.06,bus}); tone(t,m,dur,{type:'sawtooth',gain:g*.8,cut:1500,detune:9,release:.06,bus}); }
}
function schedule(){
  const c=SND.ctx; if(!c||c.state!=='running') return;
  const L=SND.layers;
  while(SND.next<c.currentTime+.15){
    const song=SONGS[SND.song]||SONGS.mapa, ph=Math.min(SND.phase,song.bpm.length), sd=60/song.bpm[ph-1]/4;
    const t=SND.next, s=SND.step%128, bar=s>>4, b=s&15, prog=(SND.phase>=2&&song.prog2)||song.prog, ch=CH[prog[bar]];
    const r0=ch[0]>6?ch[0]-12:ch[0], K=song.key, fill=(bar&1)===1;
    if(b===0&&!fill){
      if(song.coro){ for(const n of ch) choir(t,wrap(K+12+n),sd*32,.2,L.choir); choir(t,K+r0,sd*32,.16,L.choir); }
      if(song.organo) for(const n of ch) organ(t,wrap(K+n,50,64),sd*31,.05,L.organ);
      if(song.metal){ brass(t,K+r0,sd*7,.16,L.brass,.6); brass(t,K+r0+7,sd*7,.11,L.brass,.6); }
    }
    if(b===0&&(bar%4===0||(SND.phase>=2&&!fill))&&!song.leadCalm) bell(t,wrap(K+12+ch[0],62,76),.2,L.bell);
    if(song.ost){ const o=song.ost[b]; if(o!==null&&o!==undefined) for(const v of (SND.phase>=2&&song.ostVoz2)||song.ostVoz) voz(v,t,K+r0+o,sd*.8,.075,v==='pizz'?L.pizz:L.strings,song); }
    if(b%4===0) tone(t,K-12+r0,sd*3.6,{type:'sawtooth',gain:.13,cut:380,release:.1,bus:L.strings});
    if(song.metal&&fill&&(b===10||b===12||b===14)){ brass(t,K+r0,sd*1.6,.18,L.brass,1); brass(t,K+r0+7,sd*1.6,.12,L.brass,1); }
    if(song.timp){ if(b===0) timp(t,K+r0,.26,L.timp); if(b===8) timp(t,K+r0+7,.18,L.timp); if(fill&&b>=12) timp(t,K+r0,.08+(b-12)*.045,L.timp); }
    if(song.taiko&&((SND.phase>=2&&song.taiko2)||song.taiko).includes(b)) taiko(t,b===0?.55:.38,L.taiko);
    for(const [st,n,len] of (SND.phase>=2&&song.mel2)||song.mel){ if(st!==s) continue;
      voz(song.melVoz,t,K+n,sd*len,.075,L.lead,song);
      if(song.coroMel&&SND.phase>=song.coroMel) choir(t,K+n,sd*len+.2,.08,L.lead);
      tone(t,K+n-12,sd*len,{type:'triangle',gain:.04,attack:.03,release:.12,bus:L.lead}); }
    SND.next+=sd; SND.step++;
  }
}
function setMode(mode){
  SND.mode=mode; if(!SND.ctx) return;
  const p2=SND.phase>=2, song=SONGS[SND.song]||SONGS.mapa, z={choir:0,organ:0,bell:0,strings:0,pizz:0,brass:0,timp:0,taiko:0,lead:0};
  const mix={
    calm:{...z,choir:.72,organ:.5,bell:.6,strings:p2?.3:.14,pizz:.35,timp:p2?.3:.15,lead:song.leadCalm?.55:0},
    battle:{choir:.85,organ:.6,bell:.4,strings:.9,pizz:.75,brass:.8,timp:.85,taiko:.9,lead:p2?.85:.55},
    end:{...z,choir:.6,organ:.4,bell:.5}, silent:z}[mode]||z;
  const now=SND.ctx.currentTime;
  for(const k in mix) SND.layers[k].gain.setTargetAtTime(mix[k],now,mode==='battle'?.15:.5);
}
function setSong(id){
  if(SND.song===id) return;
  SND.song=id; SND.step=0; SND.phase=1;
  if(SND.ctx){ for(const k in SND.layers) SND.layers[k].gain.setTargetAtTime(0,SND.ctx.currentTime,.05); SND.next=SND.ctx.currentTime+.35; setTimeout(()=>setMode(SND.mode),300); }
}
function setPhase(n){ SND.phase=n; setMode(SND.mode); }
function toggle(){ SND.on=!SND.on; if(SND.master) SND.master.gain.setTargetAtTime(SND.on?.62:0,SND.ctx.currentTime,.05); return SND.on; }

/* ---------- Efectos ---------- */
const now=()=>SND.ctx.currentTime, ok=()=>!!SND.ctx;
const sfx={
  blip(p=72){ if(!ok())return; tone(now(),p,.05,{type:'square',gain:.03,cut:2200,bus:SND.sfx}); },
  select(){ if(!ok())return; tone(now(),79,.07,{type:'triangle',gain:.12,bus:SND.sfx}); },
  pick(){ if(!ok())return; tone(now(),84,.05,{type:'triangle',gain:.08,bus:SND.sfx}); },
  link(){ if(!ok())return; const t=now(); tone(t,76,.08,{type:'triangle',gain:.1,bus:SND.sfx}); tone(t+.06,83,.1,{type:'triangle',gain:.1,bus:SND.sfx}); },
  good(){ if(!ok())return; const t=now(); [74,78,81,86].forEach((n,i)=>tone(t+i*.07,n,.22,{type:'triangle',gain:.14,bus:SND.sfx})); },
  bad(){ if(!ok())return; tone(now(),58,.35,{type:'sawtooth',gain:.1,cut:900,slide:-7,bus:SND.sfx}); },
  charge(){ if(!ok())return; tone(now(),62,.5,{type:'sine',gain:.12,slide:24,bus:SND.sfx}); },
  hit(){ if(!ok())return; const t=now(); taiko(t,.9,SND.sfx); noise(t,.3,{ft:'lowpass',freq:2400,gain:.5,bus:SND.sfx}); tone(t,86,.3,{type:'triangle',gain:.12,slide:-12,bus:SND.sfx}); },
  crit(){ if(!ok())return; const t=now(); [86,91,98].forEach((n,i)=>tone(t+i*.05,n,.3,{type:'triangle',gain:.12,bus:SND.sfx})); bell(t,86,.15,SND.sfx); },
  hurt(){ if(!ok())return; const t=now(); tone(t,64,.2,{type:'square',gain:.12,cut:1500,slide:-12,bus:SND.sfx}); noise(t,.12,{ft:'bandpass',freq:900,gain:.3,bus:SND.sfx}); },
  graze(){ if(!ok())return; tone(now(),96,.04,{type:'sine',gain:.035,bus:SND.sfx}); },
  focus(){ if(!ok())return; const t=now(); [79,86,91].forEach((n,i)=>tone(t+i*.06,n,.25,{type:'sine',gain:.1,bus:SND.sfx})); },
  heal(){ if(!ok())return; const t=now(); [69,73,76,81].forEach((n,i)=>tone(t+i*.09,n,.4,{type:'sine',gain:.12,bus:SND.sfx})); },
  warn(){ if(!ok())return; tone(now(),86,.06,{type:'sine',gain:.05,bus:SND.sfx}); },
  laser(){ if(!ok())return; tone(now(),45,.25,{type:'sawtooth',gain:.06,cut:900,bus:SND.sfx}); },
  win(){ if(!ok())return; const t=now(); [[62,0],[66,.15],[69,.3],[74,.45],[78,.75],[81,.75],[86,.75]].forEach(([n,d])=>tone(t+d,n,d>.6?1.6:.3,{type:'triangle',gain:.13,release:.8,bus:SND.sfx})); choir(t+.75,62,2.4,.2,SND.sfx); },
  lose(){ if(!ok())return; const t=now(); [69,65,62,57].forEach((n,i)=>tone(t+i*.28,n,.5,{type:'triangle',gain:.12,release:.3,bus:SND.sfx})); },
  unlock(){ if(!ok())return; const t=now(); bell(t,74,.2,SND.sfx); bell(t+.25,81,.2,SND.sfx); },
  phase(){ if(!ok())return; const c=SND.ctx,t=now(),s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();
    s.buffer=SND.noise; s.loop=true; f.type='highpass'; f.frequency.value=3500; g.gain.setValueAtTime(.001,t); g.gain.exponentialRampToValueAtTime(.35,t+1.5); g.gain.linearRampToValueAtTime(0,t+1.56);
    s.connect(f).connect(g).connect(SND.sfx); s.start(t); s.stop(t+1.6); taiko(t+1.55,1,SND.sfx); bell(t+1.55,38,.25,SND.sfx); choir(t+1.55,50,2.5,.2,SND.sfx); }
};

P1.audio={init,setSong,setMode,setPhase,toggle,sfx,get on(){return SND.on;},_SND:SND};
})();
