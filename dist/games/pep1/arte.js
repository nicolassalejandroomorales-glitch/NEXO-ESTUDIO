/* =====================================================================
   ARTE: jefes en 3D simple (esferas + enlaces que giran) y arenas pintadas por código.
   Cada jefe: P1.arte.jefes[id](g, x, y, k, st)   (k = escala; st = estado de animación)
   Cada arena: P1.arte.arenas[id] = {fijo(g,W,H,G), vivo(g,W,H,G,t,fase,dt)}
   Lo "fijo" se pinta una vez en un lienzo aparte; lo "vivo" se anima cada cuadro.
   ===================================================================== */
(function(){
const P1 = window.P1 = window.P1 || {};
const A = P1.arte = {jefes:{}, arenas:{}};
const TAU = Math.PI*2, RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
A.RM = RM;
const rand=(a,b)=>a+Math.random()*(b-a), clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function seeded(seed){return ()=>(seed=(seed*16807)%2147483647)/2147483647;}

/* ---------- utilidades 3D y de dibujo ---------- */
const rotY=(p,a)=>{const c=Math.cos(a),s=Math.sin(a);return {x:p.x*c+p.z*s,y:p.y,z:-p.x*s+p.z*c};};
const rotX=(p,a)=>{const c=Math.cos(a),s=Math.sin(a);return {x:p.x,y:p.y*c-p.z*s,z:p.y*s+p.z*c};};
const rotZ=(p,a)=>{const c=Math.cos(a),s=Math.sin(a);return {x:p.x*c-p.y*s,y:p.x*s+p.y*c,z:p.z};};
const proj=(p,x,y)=>{const f=420/(420+p.z);return {x:x+p.x*f,y:y+p.y*f,s:f,z:p.z};};
function sphere(g,x,y,r,c1,c2,glow){
  if(r<=0)return;
  if(glow){const gg=g.createRadialGradient(x,y,r*.6,x,y,r*1.9);gg.addColorStop(0,glow);gg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gg;g.beginPath();g.arc(x,y,r*1.9,0,TAU);g.fill();}
  const gr=g.createRadialGradient(x-r*.35,y-r*.4,r*.08,x,y,r);gr.addColorStop(0,c1);gr.addColorStop(1,c2);
  g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();
  g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(x-r*.36,y-r*.42,r*.22,r*.13,-.6,0,TAU);g.fill();
  g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=Math.max(1,r*.06);g.beginPath();g.arc(x,y,r-.5,.2,Math.PI-.2);g.stroke();
}
function stick(g,a,b,w,col,hi){
  g.lineCap='round';g.strokeStyle=col;g.lineWidth=w;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();
  g.strokeStyle=hi||'rgba(255,255,255,.35)';g.lineWidth=w*.35;g.beginPath();g.moveTo(a.x,a.y-w*.15);g.lineTo(b.x,b.y-w*.15);g.stroke();
}
function glow(g,x,y,r,rgb,a){const gg=g.createRadialGradient(x,y,0,x,y,r);gg.addColorStop(0,`rgba(${rgb},${a})`);gg.addColorStop(1,`rgba(${rgb},0)`);g.fillStyle=gg;g.fillRect(x-r,y-r,r*2,r*2);}
function flame(g,x,y,s,t,seed,hot){
  const fk=RM?1:.85+.15*Math.sin(t*11+seed)+.07*Math.sin(t*23+seed*2), c=hot||'255,180,90';
  g.save();g.globalCompositeOperation='lighter';glow(g,x,y-4*s,26*s*fk,c,.28);
  for(let k=0;k<3;k++){const h=(16-k*4)*s*fk*(1+(RM?0:.12*Math.sin(t*9+k*1.7+seed))),w=(6-k*1.6)*s,sx=RM?0:Math.sin(t*7+k+seed)*1.4*s;
    g.fillStyle=k<2?`rgba(${c},${.55-k*.15})`:'rgba(255,245,215,.8)';g.beginPath();g.moveTo(x-w,y);
    g.quadraticCurveTo(x-w*.8+sx,y-h*.6,x+sx*1.5,y-h);g.quadraticCurveTo(x+w*.8+sx,y-h*.6,x+w,y);g.fill();}
  g.restore();
}
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function hexPath(g,x,y,r,rot){g.beginPath();for(let i=0;i<6;i++){const a=rot+i*Math.PI/3;g[i?'lineTo':'moveTo'](x+Math.cos(a)*r,y+Math.sin(a)*r);}g.closePath();}
A.util={rotY,rotX,proj,sphere,glow,flame,rr,hexPath,seeded};

/* Ojos y boca compartidos. o = {ojo:'presumido'|'nervioso'|'malvado'|'real', enojo, brillo:'r,g,b'} */
function face(g,x,y,k,st,o){
  const look=st.look||0, lx=Math.cos(look)*2.6*k, ly=Math.sin(look)*2.2*k, bl=st.blink?.12:1, hit=st.flash>.3;
  const sep=(o.sep||12)*k, ew=(o.ew||7)*k, eh=(o.eh||8)*k;
  for(const sx of [-1,1]){
    const ex=x+sx*sep, ey=y;
    if(hit){g.strokeStyle='#10171a';g.lineWidth=2.4*k;g.beginPath();g.moveTo(ex-ew*.8,ey-eh*.5);g.lineTo(ex+ew*.8,ey+eh*.5);g.moveTo(ex+ew*.8,ey-eh*.5);g.lineTo(ex-ew*.8,ey+eh*.5);g.stroke();continue;}
    if(o.brillo){glow(g,ex,ey,ew*2.4,o.brillo,.5);}
    g.fillStyle=o.blanco||'#f5f0e4';g.beginPath();g.ellipse(ex,ey,ew,eh*bl,0,0,TAU);g.fill();
    g.fillStyle=o.pupila||'#10171a';const pr=(o.ojo==='nervioso'?2.2:3.4)*k, jit=o.ojo==='nervioso'&&!RM?Math.sin(st.t*40+sx)*.8*k:0;
    g.beginPath();g.ellipse(ex+lx+jit,ey+ly*bl,pr,pr*1.15*bl,0,0,TAU);g.fill();
    if(o.ojo==='presumido'&&bl>.5){g.fillStyle=o.piel||'#3a3f9e';g.beginPath();g.ellipse(ex,ey-eh*.55,ew*1.15,eh*.62,0,Math.PI,TAU);g.fill();}
    if(o.enojo||o.ojo==='malvado'){g.strokeStyle='#10171a';g.lineWidth=2.8*k;g.beginPath();g.moveTo(ex-sx*ew*1.3,ey-eh*1.6);g.lineTo(ex+sx*ew*.6,ey-eh*.85);g.stroke();}
    if(o.ojo==='nervioso'){g.strokeStyle='#10171a';g.lineWidth=2*k;g.beginPath();g.moveTo(ex-ew,ey-eh*1.5+sx*1.5*k);g.lineTo(ex+ew,ey-eh*1.5-sx*1.5*k);g.stroke();}
  }
  const my=y+(o.my||15)*k; g.strokeStyle='#10171a'; g.lineWidth=2.2*k; g.beginPath();
  if(o.boca==='sonrisa') g.arc(x,my-6*k,8*k,.25,Math.PI-.25);
  else if(o.boca==='mueca'){g.moveTo(x-9*k,my);g.quadraticCurveTo(x+2*k,my+5*k,x+11*k,my-4*k);}
  else if(o.boca==='ondas'){for(let i=0;i<=8;i++){const px=x-12*k+i*3*k,py=my+Math.sin(i*1.7+st.t*(RM?0:12))*2*k;g[i?'lineTo':'moveTo'](px,py);}}
  else if(o.boca==='dientes'){g.fillStyle='#10171a';g.beginPath();g.moveTo(x-14*k,my-3*k);g.quadraticCurveTo(x,my+10*k,x+14*k,my-3*k);g.closePath();g.fill();
    g.fillStyle='#f5f0e4';for(let i=0;i<5;i++){const px=x-10*k+i*5*k;g.beginPath();g.moveTo(px-2*k,my-1.5*k);g.lineTo(px+2*k,my-1.5*k);g.lineTo(px,my+2.5*k);g.fill();}return;}
  else g.arc(x,my+4*k,8*k,Math.PI+.5,-.5);
  g.stroke();
}

/* ======================= JEFES ======================= */
/* st: {t, fase, flash, sq (aplastamiento), look, blink, enter(0-1), dissolve(0-1), atacando, especial} */
function base(st,k){
  const e=1-Math.pow(1-clamp(st.enter??1,0,1),3), bob=RM?0:Math.sin(st.t*1.6)*6*k, br=1+(RM?0:Math.sin(st.t*1.6+1)*.025);
  return {dy:bob-(1-e)*140*k, sy:br*(1-(st.sq||0)), sx:(1+(st.sq||0)*.6)/br*br, alpha:e*(1-(st.dissolve||0)), spread:1+(st.dissolve||0)*.9};
}

/* --- 1. TRIMETILAMINA --- */
A.jefes.amina=function(g,x,y,k,st){
  const B=base(st,k); if(B.alpha<=.01)return; y+=B.dy;
  const f2=st.fase>=2, t=st.t, inv=st.especial??(f2?-1:1); // inv: 1 = par libre arriba, −1 = invertida
  g.save(); g.globalAlpha=B.alpha; g.translate(x,y); g.scale(B.sx,B.sy); g.translate(-x,-y);
  glow(g,x,y,120*k,f2?'190,220,90':'150,200,120',.22);
  // vapores de olor
  g.lineCap='round';
  for(let i=0;i<5;i++){const tt=((t*(f2?.9:.55)+i*.37)%1.6)/1.6, ox=x+(i-2)*30*k+Math.sin(t+i)*6*k, oy=y+30*k-tt*170*k;
    g.strokeStyle=`rgba(184,216,107,${(1-tt)*.5})`;g.lineWidth=(5-tt*3)*k;g.beginPath();
    for(let j=0;j<=10;j++){const yy=oy-j*4*k,xx=ox+Math.sin(j*.7+t*3+i)*6*k;g[j?'lineTo':'moveTo'](xx,yy);}g.stroke();}
  const L=78*k*B.spread, spin=t*(f2?1.1:.55);
  const dirs=[0,1,2].map(i=>{const a=spin+i*TAU/3;return {x:Math.cos(a)*.88,y:.46*inv,z:Math.sin(a)*.88};}).map(p=>rotX(p,.18));
  const items=[];
  dirs.forEach((d,i)=>{
    const c=proj({x:d.x*L,y:d.y*L,z:d.z*L},x,y);
    const Hs=[0,1,2].map(j=>{const a=-spin*1.7+j*TAU/3+i;return proj({x:d.x*L+Math.cos(a)*20*k,y:d.y*L+(d.y>0?14:-14)*k+Math.sin(a*2)*3*k,z:d.z*L+Math.sin(a)*20*k},x,y);});
    items.push({z:d.z*L,draw(){
      stick(g,{x,y},c,7*k*c.s,'#5d6a77');
      Hs.sort((a,b)=>a.z-b.z).forEach(h=>{stick(g,c,h,3.5*k,'#8e9aa6');sphere(g,h.x,h.y,7*k*h.s,'#ffffff','#a9b4bd');});
      sphere(g,c.x,c.y,17*k*c.s,'#b9c3cc','#3a444e');
      g.fillStyle='rgba(16,23,26,.75)';g.font=`700 ${10*k*c.s}px "Segoe UI",sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText('CH₃',c.x,c.y+.5);
    }});
  });
  // par libre (lóbulo con dos electrones)
  const lob=()=>{const ly=y-inv*62*k*B.spread, pul=1+(RM?0:Math.sin(t*3)*.06);
    g.save();g.translate(x,ly);g.scale(1,inv);
    const lg=g.createRadialGradient(0,-6*k,2*k,0,0,30*k);lg.addColorStop(0,f2?'rgba(230,255,160,.75)':'rgba(200,220,255,.65)');lg.addColorStop(1,'rgba(160,190,255,0)');
    g.fillStyle=lg;g.beginPath();g.moveTo(0,26*k);g.bezierCurveTo(-30*k*pul,0,-18*k*pul,-34*k*pul,0,-32*k*pul);g.bezierCurveTo(18*k*pul,-34*k*pul,30*k*pul,0,0,26*k);g.fill();
    for(const s of [0,Math.PI]){const a=t*4+s;sphere(g,Math.cos(a)*8*k,-10*k+Math.sin(a)*4*k,4*k,'#fffbe6','#d9ac68','rgba(255,220,150,.5)');}
    g.restore();};
  items.filter(i=>i.z<0).sort((a,b)=>a.z-b.z).forEach(i=>i.draw());
  if(inv>0) lob();
  sphere(g,x,y,36*k,f2?'#c8d47a':'#b7c4ff',f2?'#3f4f1a':'#2c3290',f2?'rgba(190,230,90,.35)':'rgba(140,160,255,.35)');
  if(st.flash>0){g.fillStyle=`rgba(255,250,235,${st.flash*.75})`;g.beginPath();g.arc(x,y,36*k,0,TAU);g.fill();}
  face(g,x,y-2*k,k,st,{ojo:'presumido',piel:f2?'#6d7a2c':'#4b52b8',enojo:f2,boca:'mueca',brillo:f2?'210,255,120':null});
  g.fillStyle='rgba(16,23,26,.55)';g.font=`700 ${12*k}px "Segoe UI",sans-serif`;g.textAlign='center';g.fillText('N',x+22*k,y+22*k);
  if(inv<=0) lob();
  items.filter(i=>i.z>=0).sort((a,b)=>a.z-b.z).forEach(i=>i.draw());
  g.restore();
};

/* --- 2. CICLOBUTADIENO --- */
A.jefes.ciclo=function(g,x,y,k,st){
  const B=base(st,k); if(B.alpha<=.01)return; y+=B.dy;
  const f2=st.fase>=2, t=st.t, nerv=(RM?0:1)*(1.4+(f2?2.6:0)+(st.atacando?1.5:0));
  x+=Math.sin(t*53)*nerv*k*.6; y+=Math.cos(t*47)*nerv*k*.6;
  g.save(); g.globalAlpha=B.alpha; g.translate(x,y); g.scale(B.sx,B.sy); g.translate(-x,-y);
  glow(g,x,y,130*k,f2?'255,90,70':'255,160,77',.24);
  const sw=RM?0:Math.sin(t*(f2?6:2.2)), a=44*k*(1+.13*sw)*B.spread, b=44*k*(1-.13*sw)*B.spread;
  const tilt=.32+(RM?0:Math.sin(t*.8)*.12), wob=RM?0:Math.sin(t*.6)*.45;
  const P=(px,py,pz=0)=>proj(rotY(rotX({x:px,y:py,z:pz},tilt),wob),x,y);
  const C=[P(-a,-b),P(a,-b),P(a,b),P(-a,b)], Hh=[P(-a*1.62,-b*1.62),P(a*1.62,-b*1.62),P(a*1.62,b*1.62),P(-a*1.62,b*1.62)];
  // núcleo con cara (detrás de los enlaces del frente)
  const core=P(0,0,0);
  const cg=g.createRadialGradient(core.x,core.y,4*k,core.x,core.y,40*k);cg.addColorStop(0,f2?'rgba(255,120,90,.95)':'rgba(255,190,120,.95)');cg.addColorStop(1,f2?'rgba(140,30,30,.85)':'rgba(170,80,20,.85)');
  g.fillStyle=cg;g.beginPath();g.moveTo(C[0].x,C[0].y);for(let i=1;i<4;i++)g.lineTo(C[i].x,C[i].y);g.closePath();g.fill();
  if(f2){g.strokeStyle='rgba(255,230,180,.7)';g.lineWidth=1.4*k;g.beginPath();g.moveTo(core.x-20*k,core.y-26*k);g.lineTo(core.x-8*k,core.y-10*k);g.lineTo(core.x-16*k,core.y+4*k);g.moveTo(core.x+24*k,core.y+18*k);g.lineTo(core.x+10*k,core.y+8*k);g.stroke();}
  if(st.flash>0){g.fillStyle=`rgba(255,250,235,${st.flash*.7})`;g.fill();}
  // enlaces: los dobles están en los lados cortos (y cambian de lugar: desplazamiento de enlaces)
  for(let i=0;i<4;i++){const p=C[i],q=C[(i+1)%4];stick(g,p,q,6*k,'#f5f0e4');
    const corto=(i%2===1)===(sw>0);
    if(corto){const mx=(p.x+q.x)/2,my=(p.y+q.y)/2,dx=core.x-mx,dy=core.y-my,d=Math.hypot(dx,dy)||1,ox=dx/d*9*k,oy=dy/d*9*k;
      stick(g,{x:p.x+(q.x-p.x)*.2+ox,y:p.y+(q.y-p.y)*.2+oy},{x:p.x+(q.x-p.x)*.8+ox,y:p.y+(q.y-p.y)*.8+oy},4.5*k,'#ffa04d','rgba(255,240,200,.6)');}}
  for(let i=0;i<4;i++){stick(g,C[i],Hh[i],3.5*k,'#c8ced4');sphere(g,Hh[i].x,Hh[i].y,9*k*Hh[i].s,'#ffffff','#b6bfc7');}
  for(let i=0;i<4;i++)sphere(g,C[i].x,C[i].y,14*k*C[i].s,'#ffd0a0','#8a3d12','rgba(255,160,77,.35)');
  face(g,core.x,core.y-4*k,k*.95,st,{ojo:'nervioso',boca:'ondas',sep:11,ew:7.5,eh:8.5,my:14,enojo:f2});
  // gotas de sudor
  g.fillStyle='#6fd6ff';
  for(let i=0;i<2;i++){const tt=((t*.7+i*.5)%1), sx=x+(i?1:-1)*(a+26*k), sy=y-b+tt*60*k;g.globalAlpha=B.alpha*(1-tt);
    g.beginPath();g.arc(sx,sy,3.4*k,0,TAU);g.moveTo(sx-3.4*k,sy);g.lineTo(sx,sy-8*k);g.lineTo(sx+3.4*k,sy);g.fill();}
  g.globalAlpha=B.alpha;
  // chispas de inestabilidad (se desvanecen; nunca parpadean rápido)
  if(!RM){g.strokeStyle=f2?'rgba(255,120,90,.8)':'rgba(255,220,150,.75)';g.lineWidth=1.6*k;
    for(let i=0;i<4;i++){const ph=(t*1.3+i*.25)%1;if(ph>.35)continue;const p=C[i],q=C[(i+1)%4];g.globalAlpha=B.alpha*(1-ph/.35);g.beginPath();g.moveTo(p.x,p.y);
      for(let j=1;j<6;j++){const u=j/6;g.lineTo(p.x+(q.x-p.x)*u+Math.sin(i*7+j*3+Math.floor(t*6))*7*k,p.y+(q.y-p.y)*u+Math.cos(i*5+j*2+Math.floor(t*6))*7*k);}g.lineTo(q.x,q.y);g.stroke();}
    g.globalAlpha=B.alpha;}
  g.restore();
};

/* --- 3. BENCENO MALVADO --- */
A.jefes.benceno=function(g,x,y,k,st){
  const B=base(st,k); if(B.alpha<=.01)return; y+=B.dy;
  const f2=st.fase>=2, t=st.t, spin=t*(f2?.9:.35)*(st.atacando?1.8:1), tilt=1.0+(RM?0:Math.sin(t*.7)*.08), wob=RM?0:Math.sin(t*.5)*.25;
  g.save(); g.globalAlpha=B.alpha; g.translate(x,y); g.scale(B.sx,B.sy); g.translate(-x,-y);
  const auraC=f2?'255,70,130':'169,139,255';
  glow(g,x,y,150*k,auraC,.28);
  if(f2){g.strokeStyle=`rgba(255,90,140,${.35+.15*Math.sin(t*4)})`;g.lineWidth=4*k;hexPath(g,x,y,(96+Math.sin(t*4)*4)*k,-spin*.7);g.stroke();}
  const R=52*k*B.spread, P=(px,py,pz)=>proj(rotY(rotX(rotZ({x:px,y:py,z:pz},spin),tilt),wob),x,y);
  const C=[...Array(6)].map((_,i)=>P(Math.cos(i*TAU/6)*R,Math.sin(i*TAU/6)*R,0));
  const Hh=[...Array(6)].map((_,i)=>P(Math.cos(i*TAU/6)*R*1.55,Math.sin(i*TAU/6)*R*1.55,0));
  const cloud=(dz,front)=>{const pts=[...Array(24)].map((_,i)=>P(Math.cos(i*TAU/24)*R*.92,Math.sin(i*TAU/24)*R*.92,dz));
    g.fillStyle=f2?`rgba(255,80,150,${front?.2:.28})`:`rgba(169,139,255,${front?.18:.28})`;g.strokeStyle=f2?'rgba(255,150,190,.55)':'rgba(210,190,255,.5)';g.lineWidth=2*k;
    g.beginPath();pts.forEach((p,i)=>g[i?'lineTo':'moveTo'](p.x,p.y));g.closePath();g.fill();g.stroke();};
  // la nube π de arriba/abajo: la que queda atrás se dibuja primero
  const nUp=P(0,0,-20*k), backDz=nUp.z>0?-20*k:20*k;
  cloud(-backDz,false);
  const atoms=C.map((c,i)=>({c,h:Hh[i],z:c.z})).sort((a,b)=>a.z-b.z);
  for(let i=0;i<6;i++){const p=C[i],q=C[(i+1)%6];stick(g,p,q,6*k,'#e9e3ff');}
  // dobles enlaces que resuenan (alternan de posición)
  const res=Math.floor(t*(f2?1.4:.55))%2;
  for(let i=res;i<6;i+=2){const p=C[i],q=C[(i+1)%6],c0=P(0,0,0),mx=(p.x+q.x)/2,my=(p.y+q.y)/2,dx=c0.x-mx,dy=c0.y-my,d=Math.hypot(dx,dy)||1,ox=dx/d*8*k,oy=dy/d*8*k;
    stick(g,{x:p.x+(q.x-p.x)*.22+ox,y:p.y+(q.y-p.y)*.22+oy},{x:p.x+(q.x-p.x)*.78+ox,y:p.y+(q.y-p.y)*.78+oy},4*k,f2?'#ff6fa8':'#a98bff','rgba(255,255,255,.5)');}
  atoms.forEach(a=>{stick(g,a.c,a.h,3.2*k,'#c9c2e6');sphere(g,a.h.x,a.h.y,8*k*a.h.s,'#ffffff','#b8b0d6');sphere(g,a.c.x,a.c.y,13*k*a.c.s,'#c9b8ff','#3b2a7a','rgba(169,139,255,.3)');});
  cloud(backDz,true);
  // cara malvada flotando al centro
  const c0=P(0,0,0);
  g.fillStyle=f2?'rgba(60,10,35,.85)':'rgba(30,16,60,.85)';g.beginPath();g.ellipse(c0.x,c0.y,30*k,24*k,0,0,TAU);g.fill();
  if(st.flash>0){g.fillStyle=`rgba(255,250,235,${st.flash*.7})`;g.fill();}
  face(g,c0.x,c0.y-4*k,k*.95,st,{ojo:'malvado',boca:'dientes',blanco:f2?'#ffd0e0':'#e6dcff',pupila:f2?'#b0003a':'#3b1a8a',brillo:f2?'255,60,120':'190,160,255',sep:11,ew:6.5,eh:6,my:11});
  // corona de hexágonos
  for(let i=0;i<5;i++){const a=-Math.PI/2+(i-2)*.32,r=78*k,hx=x+Math.cos(a)*r,hy=y-40*k+Math.sin(a)*r*.5+(RM?0:Math.sin(t*2+i)*3*k);
    g.strokeStyle=f2?'rgba(255,140,180,.85)':'rgba(217,172,104,.9)';g.lineWidth=2*k;hexPath(g,hx,hy,7*k,t*(i%2?1:-1));g.stroke();}
  g.restore();
};

/* --- 4. REY AMONIO (v2): cuerpo de cristal con núcleo de N, corona con halo, manto de armiño, cetro con H⁺ --- */
A.jefes.rey=function(g,x,y,k,st){
  const B=base(st,k); if(B.alpha<=.01)return; y+=B.dy;
  const ph=st.fase||1, t=st.t, f2=ph>=2, f3=ph>=3;
  const C=f3?{aura:'255,70,70',core:'255,120,110',coreD:'120,10,30',capa:['#6a0f24','#1c0308'],gema:'#ff3355'}
    :f2?{aura:'230,110,140',core:'255,170,190',coreD:'110,30,70',capa:['#5e1530','#22060f'],gema:'#ff5577'}
    :{aura:'217,172,104',core:'150,240,230',coreD:'20,90,100',capa:['#20356a','#0b1430'],gema:'#c0304a'};
  g.save(); g.globalAlpha=B.alpha;
  // sombra en el suelo (lo "asienta")
  g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(x,y+118*k-B.dy*.5,70*k,12*k,0,0,TAU);g.fill();
  g.translate(x,y); g.scale(B.sx,B.sy); g.translate(-x,-y);
  g.save();g.globalCompositeOperation='lighter';glow(g,x,y,170*k,C.aura,.32);g.restore();
  // MANTO: capa larga que ondea con borde dorado y hexágonos bordados
  const wav=i=>RM?0:Math.sin(t*2.2+i)*7*k;
  const cg=g.createLinearGradient(x,y-10*k,x,y+120*k);cg.addColorStop(0,C.capa[0]);cg.addColorStop(1,C.capa[1]);
  g.fillStyle=cg;g.beginPath();g.moveTo(x-34*k,y+4*k);
  g.bezierCurveTo(x-70*k,y+30*k,x-92*k+wav(1),y+80*k,x-100*k+wav(2),y+118*k);
  for(let i=0;i<=10;i++){const u=i/10;g.lineTo(x-100*k+u*200*k+wav(i*.8)*.4,y+118*k+Math.sin(u*10+t*(RM?0:2.6))*7*k);}
  g.bezierCurveTo(x+92*k+wav(3),y+80*k,x+70*k,y+30*k,x+34*k,y+4*k);g.closePath();g.fill();
  g.strokeStyle='#e3b45c';g.lineWidth=3*k;g.stroke();
  g.save();g.clip();g.strokeStyle='rgba(227,180,92,.18)';g.lineWidth=1.2*k;
  for(let r=0;r<4;r++)for(let c=-4;c<=4;c++){hexPath(g,x+c*22*k+(r%2)*11*k,y+40*k+r*19*k,7*k,0);g.stroke();}g.restore();
  // CETRO flotante con un H⁺ en la punta (gira a un lado)
  const sa=RM?0:Math.sin(t*1.3)*.15, sx0=x+78*k, sy0=y+10*k+(RM?0:Math.sin(t*1.7)*5*k);
  g.save();g.translate(sx0,sy0);g.rotate(.25+sa);
  const rod=g.createLinearGradient(-3*k,0,3*k,0);rod.addColorStop(0,'#8a5a1c');rod.addColorStop(.5,'#fff0b8');rod.addColorStop(1,'#8a5a1c');
  g.fillStyle=rod;g.fillRect(-2.5*k,-46*k,5*k,92*k);
  for(const yy of [-30,0,30]){g.fillStyle='#e3b45c';g.fillRect(-4.5*k,yy*k,9*k,4*k);}
  g.save();g.globalCompositeOperation='lighter';glow(g,0,-56*k,26*k,'255,110,120',.6);g.restore();
  sphere(g,0,-56*k,10*k,'#ffd6da','#c0304a');g.fillStyle='#2a1015';g.font=`800 ${9*k}px "Segoe UI",sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText('H⁺',0,-55.5*k);
  g.strokeStyle='#e3b45c';g.lineWidth=2*k;g.beginPath();g.arc(0,-56*k,13*k,Math.PI*.15,Math.PI*.85,true);g.stroke();
  g.restore();
  // TETRAEDRO de H: los 4 giran en 3D sobre un eje inclinado (ninguno queda tapando la corona)
  const spin=t*(f3?1.9:f2?1.4:.8)*(RM?.3:1), L=74*k*B.spread;
  const V=[[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]].map(([a,b,c])=>{let p={x:a/1.732,y:b/1.732,z:c/1.732};p=rotY(p,spin);p=rotX(p,.55);return p;});
  const Hs=V.map(d=>proj({x:d.x*L,y:d.y*L*.85+6*k,z:d.z*L},x,y));
  const beam=h=>{const gr=g.createLinearGradient(x,y,h.x,h.y);gr.addColorStop(0,`rgba(${C.core},.9)`);gr.addColorStop(1,'rgba(255,240,200,.9)');
    g.strokeStyle=gr;g.lineCap='round';g.lineWidth=7*k*h.s;g.globalAlpha=B.alpha*.35;g.beginPath();g.moveTo(x,y);g.lineTo(h.x,h.y);g.stroke();
    g.globalAlpha=B.alpha;g.lineWidth=2.6*k*h.s;g.beginPath();g.moveTo(x,y);g.lineTo(h.x,h.y);g.stroke();};
  const orb=h=>{g.save();g.globalCompositeOperation='lighter';glow(g,h.x,h.y,26*k*h.s,f2?'255,180,190':'255,245,215',.45);g.restore();
    sphere(g,h.x,h.y,13*k*h.s,'#ffffff',f2?'#d8a0aa':'#cfd8d4');
    g.fillStyle='#172126';g.font=`800 ${11*k*h.s}px "Segoe UI",sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText('H',h.x,h.y+.5);};
  Hs.filter(h=>h.z<0).forEach(h=>{beam(h);orb(h);});
  // CUERPO de cristal con núcleo brillante de nitrógeno
  const R=40*k;
  g.save();g.globalCompositeOperation='lighter';glow(g,x,y,R*1.6,C.core,.35);g.restore();
  const body=g.createRadialGradient(x-R*.3,y-R*.35,R*.1,x,y,R);body.addColorStop(0,'rgba(255,255,255,.55)');body.addColorStop(.35,`rgba(${C.core},.55)`);body.addColorStop(1,`rgba(${C.coreD},.92)`);
  g.fillStyle=body;g.beginPath();g.arc(x,y,R,0,TAU);g.fill();
  // remolino de electrones dentro del cristal
  g.save();g.beginPath();g.arc(x,y,R-2*k,0,TAU);g.clip();g.globalCompositeOperation='lighter';
  for(let i=0;i<3;i++){g.strokeStyle=`rgba(${C.core},${.35-i*.08})`;g.lineWidth=(3-i*.6)*k;g.beginPath();
    for(let j=0;j<=40;j++){const a=j/40*TAU*1.4+t*(1.5+i*.4)+i*2,r=R*(.25+.55*j/40);g[j?'lineTo':'moveTo'](x+Math.cos(a)*r,y+Math.sin(a)*r*.75);}g.stroke();}
  glow(g,x,y+4*k,R*.55,'255,255,255',.35+(RM?0:.1*Math.sin(t*3)));
  g.restore();
  if(f3&&!RM){g.strokeStyle='rgba(255,230,180,.9)';g.lineWidth=1.6*k;g.beginPath();g.moveTo(x-30*k,y-10*k);g.lineTo(x-14*k,y+2*k);g.lineTo(x-22*k,y+20*k);g.moveTo(x+30*k,y+16*k);g.lineTo(x+14*k,y+6*k);g.lineTo(x+20*k,y-8*k);g.stroke();}
  g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=2*k;g.beginPath();g.arc(x,y,R-1,Math.PI*1.1,Math.PI*1.55);g.stroke();
  g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.ellipse(x-R*.38,y-R*.45,R*.2,R*.1,-.6,0,TAU);g.fill();
  if(st.flash>0){g.fillStyle=`rgba(255,250,235,${st.flash*.75})`;g.beginPath();g.arc(x,y,R,0,TAU);g.fill();}
  // CUELLO de armiño (piel blanca con motas) y broche "+"
  g.fillStyle='#f4efe6';g.beginPath();g.ellipse(x,y+R*.92,R*1.05,R*.32,0,0,TAU);g.fill();
  g.fillStyle='#1a1a1a';for(let i=-4;i<=4;i++){g.beginPath();g.ellipse(x+i*R*.22,y+R*.92+((i%2)?3:-2)*k,1.6*k,3*k,0,0,TAU);g.fill();}
  sphere(g,x,y+R*1.02,8*k,'#fff0c0','#b07a20','rgba(255,210,120,.4)');g.fillStyle='#3a2410';g.font=`800 ${12*k}px "Segoe UI",sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText('+',x,y+R*1.02+1);
  // CARA: ojos dorados que brillan, cejas gruesas, sonrisa de colmillos en la fase 2+
  const look=st.look||0, lx=Math.cos(look)*2.4*k, ly=Math.sin(look)*2*k, bl=st.blink?.12:1, hit=st.flash>.3;
  for(const s of [-1,1]){const ex=x+s*14*k, ey=y-4*k;
    if(hit){g.strokeStyle='#10171a';g.lineWidth=2.6*k;g.beginPath();g.moveTo(ex-6*k,ey-5*k);g.lineTo(ex+6*k,ey+5*k);g.moveTo(ex+6*k,ey-5*k);g.lineTo(ex-6*k,ey+5*k);g.stroke();continue;}
    g.fillStyle='#10171a';g.beginPath();g.ellipse(ex,ey,9*k,7.5*k*bl,s*.12,0,TAU);g.fill();
    g.save();g.globalCompositeOperation='lighter';glow(g,ex+lx,ey+ly,12*k,f2?'255,90,90':'255,210,120',.6);g.restore();
    g.fillStyle=f2?'#ff6b6b':'#ffd27a';g.beginPath();g.ellipse(ex+lx,ey+ly*bl,4.2*k,4.6*k*bl,0,0,TAU);g.fill();
    g.fillStyle='#fff';g.beginPath();g.arc(ex+lx-1.4*k,ey+ly-1.6*k,1.2*k,0,TAU);g.fill();
    g.strokeStyle='#10171a';g.lineWidth=4*k;g.lineCap='round';g.beginPath();
    if(f2){g.moveTo(ex-s*10*k,ey-14*k);g.lineTo(ex+s*6*k,ey-8*k);}else{g.moveTo(ex-s*9*k,ey-12*k);g.quadraticCurveTo(ex,ey-15*k,ex+s*8*k,ey-11*k);}g.stroke();}
  const my=y+15*k; g.strokeStyle='#10171a';g.lineWidth=2.6*k;g.beginPath();
  if(st.feliz){g.arc(x,my-5*k,8*k,.25,Math.PI-.25);g.stroke();}
  else if(f2){g.moveTo(x-11*k,my);g.quadraticCurveTo(x,my-5*k,x+11*k,my);g.stroke();g.fillStyle='#fff';for(const s of [-1,1]){g.beginPath();g.moveTo(x+s*6*k,my-2.5*k);g.lineTo(x+s*3.5*k,my-2.5*k);g.lineTo(x+s*4.8*k,my+3*k);g.fill();}}
  else {g.moveTo(x-9*k,my);g.quadraticCurveTo(x+1*k,my+4*k,x+10*k,my-3*k);g.stroke();}
  // CORONA grande con halo (con inercia)
  const cy=y-R-6*k+(RM?0:Math.sin(t*1.6-.7)*3*k), tiltc=f3&&!RM?Math.sin(t*3)*.08:0;
  g.save();g.translate(x,cy);g.rotate(tiltc);
  g.save();g.globalCompositeOperation='lighter';g.strokeStyle=`rgba(${f2?'255,150,150':'255,225,150'},${.55+(RM?0:.2*Math.sin(t*2))})`;g.lineWidth=2.5*k;g.beginPath();g.ellipse(0,-34*k,30*k,7*k,0,0,TAU);g.stroke();glow(g,0,-34*k,34*k,f2?'255,120,120':'255,220,140',.18);g.restore();
  const gold=g.createLinearGradient(0,-30*k,0,6*k);gold.addColorStop(0,'#fff6cc');gold.addColorStop(.45,'#e9b955');gold.addColorStop(1,'#7a4c14');
  g.fillStyle=gold;g.beginPath();g.moveTo(-32*k,4*k);
  [[-35,-18],[-24,-8],[-17,-28],[-7,-12],[0,-32],[7,-12],[17,-28],[24,-8],[35,-18],[32,4]].forEach(([px,py])=>g.lineTo(px*k,py*k));g.closePath();g.fill();
  g.strokeStyle='rgba(60,35,10,.7)';g.lineWidth=1.3*k;g.stroke();
  g.fillStyle='#7a4c14';g.fillRect(-32*k,-2*k,64*k,6*k);g.fillStyle='rgba(255,255,255,.45)';g.fillRect(-30*k,-1.5*k,60*k,1.6*k);
  sphere(g,0,-7*k,5.5*k,'#ffd0d6',C.gema,'rgba(255,80,110,.5)');
  for(const s of [-1,1]){sphere(g,s*16*k,-6*k,3.6*k,'#d0fff8','#2f8f8a');sphere(g,s*28*k,-4*k,2.8*k,'#e6dcff','#5a3aa0');}
  for(const [px,py] of [[-35,-18],[-17,-28],[0,-32],[17,-28],[35,-18]])sphere(g,px*k,py*k,3*k,'#fffbe6','#d9ac68','rgba(255,230,160,.4)');
  g.restore();
  Hs.filter(h=>h.z>=0).forEach(h=>{beam(h);orb(h);});
  g.restore();
};

/* ======================= KIT MÁGICO (lo que hace que una arena se sienta "de jefe") ======================= */
A.cam={x:0,y:0};
A.baja=/[?&]calidad=baja/.test(location.search); // calidad baja: sin rayos ni remolinos (se activa sola si el juego va lento)           // paralaje: lo actualiza el motor según dónde está la estrella (-1 a 1)
A.pulso=()=>0;             // pulso de la música (lo conecta el motor)
const GLIFOS={
  amina:'N · R₃N · :N · pKaH · NH₂ · 1° 2° 3° · δ− · ',
  ciclo:'4n · π · ⚠ · C₄H₄ · 4n · ↯ · σ · ',
  benceno:'π · 4n+2 · C₆H₆ · E⁺ · σ · ⬡ · ',
  trono:'NH₄⁺ · pKa · H⁺ · ⁺ · N · Kb · '
};
/* Sello mágico giratorio. o={col:'r,g,b', glif, lados (polígono), sy (aplastado para el piso), a (alfa), vel} */
function sello(g,x,y,R,t,o){
  const col=o.col, a=(o.a??1)*(1+(o.pulso||0)*.6), sp=RM?0:(o.vel??1), sy=o.sy??1, lados=o.lados||6;
  g.save(); g.translate(x,y); g.scale(1,sy); g.globalCompositeOperation='lighter';
  const halo=g.createRadialGradient(0,0,R*.2,0,0,R*1.25);halo.addColorStop(0,`rgba(${col},${.08*a})`);halo.addColorStop(.75,`rgba(${col},${.05*a})`);halo.addColorStop(1,`rgba(${col},0)`);
  g.fillStyle=halo;g.beginPath();g.arc(0,0,R*1.25,0,TAU);g.fill();
  const ring=(r,w,al)=>{g.strokeStyle=`rgba(${col},${al*a*.35})`;g.lineWidth=w*3;g.beginPath();g.arc(0,0,r,0,TAU);g.stroke();g.strokeStyle=`rgba(${col},${al*a})`;g.lineWidth=w;g.stroke();};
  ring(R,2.2,.9); ring(R*.93,1,.6); ring(R*.62,1.6,.7); ring(R*.2,1.2,.6);
  // marcas que giran en sentido contrario
  g.save();g.rotate(-t*.25*sp);g.strokeStyle=`rgba(${col},${.7*a})`;g.lineWidth=1.4;
  for(let i=0;i<48;i++){const an=i/48*TAU,r1=R*.93,r2=i%4?R*.97:R*1.04;g.beginPath();g.moveTo(Math.cos(an)*r1,Math.sin(an)*r1);g.lineTo(Math.cos(an)*r2,Math.sin(an)*r2);g.stroke();}
  g.restore();
  // anillo de glifos (runas químicas): se pinta una vez en un lienzo aparte y después solo se gira
  if(o.glif){const img=anilloGlifos(R,col,o.glif);g.save();g.rotate(t*.12*sp);g.globalAlpha=Math.min(1,.85*a);g.drawImage(img,-img._r,-img._r,img._r*2,img._r*2);g.restore();}
  // polígono doble (estrella)
  g.save();g.rotate(t*.2*sp);g.strokeStyle=`rgba(${col},${.8*a})`;g.lineWidth=1.8;
  for(const off of [0,Math.PI/lados]){g.beginPath();for(let i=0;i<=lados;i++){const an=off+i/lados*TAU;g[i?'lineTo':'moveTo'](Math.cos(an)*R*.62,Math.sin(an)*R*.62);}g.stroke();}
  for(let i=0;i<lados;i++){const an=i/lados*TAU;g.beginPath();g.arc(Math.cos(an)*R*.62,Math.sin(an)*R*.62,R*.05,0,TAU);g.stroke();}
  g.restore();
  g.restore();
}
const glifCache={};
function anilloGlifos(R,col,glif){
  const key=Math.round(R)+'|'+col+'|'+glif; if(glifCache[key]) return glifCache[key];
  const k=2, r=Math.ceil(R*.9), c=document.createElement('canvas'); c.width=c.height=r*2*k; c._r=r;
  const g=c.getContext('2d'); g.setTransform(k,0,0,k,r*k,r*k); g.fillStyle=`rgb(${col})`;
  g.font=`600 ${Math.max(9,R*.085)}px "Iowan Old Style",Georgia,serif`; g.textAlign='center'; g.textBaseline='middle';
  const txt=(glif+glif).split(''), n=txt.length; for(let i=0;i<n;i++){g.save();g.rotate(i/n*TAU);g.translate(0,-R*.78);g.fillText(txt[i],0,0);g.restore();}
  return glifCache[key]=c;
}
function rayos(g,x,y,n,len,t,col,a,ancho=.07){
  if(A.baja) return;
  g.save();g.globalCompositeOperation='lighter';g.translate(x,y);g.rotate(RM?0:t*.04);
  for(let i=0;i<n;i++){const an=i/n*TAU+Math.sin(i*3.7)*.2, w=ancho*(.6+.4*Math.sin(i*1.9)), al=a*(.6+.4*Math.sin(t*.9+i*2.1));
    const gr=g.createLinearGradient(0,0,Math.cos(an)*len,Math.sin(an)*len);gr.addColorStop(0,`rgba(${col},${al})`);gr.addColorStop(1,`rgba(${col},0)`);
    g.fillStyle=gr;g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(an-w)*len,Math.sin(an-w)*len);g.lineTo(Math.cos(an+w)*len,Math.sin(an+w)*len);g.closePath();g.fill();}
  g.restore();
}
function vineta(g,W,H,a,col='0,0,0'){const gr=g.createRadialGradient(W/2,H*.45,Math.min(W,H)*.35,W/2,H*.5,Math.max(W,H)*.78);gr.addColorStop(0,`rgba(${col},0)`);gr.addColorStop(1,`rgba(${col},${a})`);g.fillStyle=gr;g.fillRect(0,0,W,H);}
/* partículas que giran en espiral hacia el jefe (energía que se junta) */
function vortice(S,g,G,t,dt,col,n,fuerza){
  if(A.baja) return;
  S.vx=S.vx||Array.from({length:RM?Math.ceil(n/3):n},()=>({a:rand(0,TAU),r:rand(60,260),v:rand(.4,1),s:rand(.8,2.2)}));
  g.save();g.globalCompositeOperation='lighter';
  for(const p of S.vx){if(!RM){p.a+=dt*p.v*(.6+fuerza);p.r-=dt*(14+fuerza*40)*p.v;if(p.r<30){p.r=rand(200,280);p.a=rand(0,TAU);}}
    const x=G.ex+Math.cos(p.a)*p.r, y=G.ey+Math.sin(p.a)*p.r*.55, al=clamp((p.r-30)/60,0,1)*.8;
    g.fillStyle=`rgba(${col},${al})`;g.beginPath();g.arc(x,y,p.s,0,TAU);g.fill();}
  g.restore();
}
/* Árbol muerto retorcido (silueta), ramas recursivas con semilla para que siempre salga igual */
function arbol(g,x,y,len,ang,grosor,r,depth){
  if(depth<=0||len<4)return;
  const x2=x+Math.cos(ang)*len, y2=y+Math.sin(ang)*len, cx=x+Math.cos(ang+(r()-.5)*.8)*len*.5, cy=y+Math.sin(ang+(r()-.5)*.8)*len*.5;
  g.lineWidth=grosor;g.lineCap='round';g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(cx,cy,x2,y2);g.stroke();
  const n=depth>3?2:1+Math.round(r());
  for(let i=0;i<n+ (r()<.4?1:0);i++) arbol(g,x2,y2,len*(.6+r()*.25),ang+(r()-.5)*1.3,grosor*.62,r,depth-1);
}

/* ======================= ARENAS v2 ======================= */
/* Cada arena: lejos (fijo, detrás) · atras (vivo, detrás del jefe) · cerca (fijo, delante) · frente (vivo, delante) */
const sky=(g,W,H,stops)=>{const gr=g.createLinearGradient(0,0,0,H);stops.forEach(([p,c])=>gr.addColorStop(p,c));g.fillStyle=gr;g.fillRect(-40,-40,W+80,H+80);};

/* --- 1. CIÉNAGA MALDITA (Trimetilamina) --- */
A.arenas.pantano={
  lejos(g,W,H,G){
    const r=seeded(11), hz=G.hz;
    sky(g,W,H,[[0,'#04100c'],[.35,'#0d2a22'],[hz/H,'#2f6a45'],[hz/H+.001,'#0b2421'],[1,'#030a09']]);
    for(let i=0;i<60;i++){g.fillStyle=`rgba(220,255,210,${.15+r()*.4})`;g.fillRect(r()*W,r()*hz*.6,1.2,1.2);}
    // templo hundido y torres en el horizonte
    g.fillStyle='#0c2219';
    const tx=W*(G.narrow?.18:.2);g.fillRect(tx-40,hz-46,80,46);g.beginPath();g.arc(tx,hz-46,34,Math.PI,0);g.fill();
    for(let i=0;i<5;i++)g.fillRect(tx-38+i*18,hz-62,6,20);g.fillRect(tx-3,hz-96,6,18);
    for(const [px,h] of [[.78,80],[.86,58],[.92,96]]){g.fillRect(W*px-8,hz-h,16,h);g.beginPath();g.moveTo(W*px-11,hz-h);g.lineTo(W*px,hz-h-20);g.lineTo(W*px+11,hz-h);g.fill();}
    // bosque muerto lejano
    g.strokeStyle='#0a1d16';for(let i=0;i<22;i++){const bx=r()*W;arbol(g,bx,hz+2,14+r()*16,-Math.PI/2+(r()-.5)*.3,3,r,4);}
    // agua y reflejos
    const wg=g.createLinearGradient(0,hz,0,H);wg.addColorStop(0,'#1d4a3c');wg.addColorStop(.4,'#0b2420');wg.addColorStop(1,'#030a09');g.fillStyle=wg;g.fillRect(-40,hz,W+80,H-hz+40);
    g.strokeStyle='rgba(160,230,180,.06)';for(let i=0;i<30;i++){const y=hz+3+Math.pow(r(),1.6)*(H-hz);const x=r()*W;g.beginPath();g.moveTo(x,y);g.lineTo(x+20+r()*60,y);g.stroke();}
    // altar de piedra en medio del agua (donde se pelea)
    const ax=W/2, ay=G.by+(G.narrow?18:22), aw=G.narrow?W*.48:W*.36, ah=aw*.24;
    g.fillStyle='#0d1a17';g.beginPath();g.ellipse(ax,ay+10,aw*1.04,ah*1.1,0,0,TAU);g.fill();
    const sg=g.createLinearGradient(0,ay-ah,0,ay+ah);sg.addColorStop(0,'#4a5a52');sg.addColorStop(1,'#1d2a26');g.fillStyle=sg;g.beginPath();g.ellipse(ax,ay,aw,ah,0,0,TAU);g.fill();
    g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=1.5;for(let i=0;i<14;i++){const a=i/14*TAU;g.beginPath();g.moveTo(ax+Math.cos(a)*aw*.78,ay+Math.sin(a)*ah*.78);g.lineTo(ax+Math.cos(a)*aw,ay+Math.sin(a)*ah);g.stroke();}
    g.beginPath();g.ellipse(ax,ay,aw*.78,ah*.78,0,0,TAU);g.stroke();
    // piedras y pilares rotos alrededor del altar
    for(const [dx,h] of [[-1.15,44],[1.12,36],[-.82,22],[.86,28]]){const px=ax+dx*aw,py=ay+(Math.abs(dx)<1?ah*.6:0);g.fillStyle='#22302b';g.fillRect(px-7,py-h,14,h);g.fillStyle='#2f3f39';g.fillRect(px-9,py-h-4,18,5);
      g.fillStyle='rgba(120,220,140,.25)';g.fillRect(px-7,py-h*.6,14,2);}
    this.altar={x:ax,y:ay,w:aw,h:ah};
  },
  cerca(g,W,H,G){
    const r=seeded(77);
    // árboles gigantes retorcidos que enmarcan la escena
    g.strokeStyle='#020806';g.fillStyle='#020806';
    for(const s of [-1,1]){const bx=s<0?-10:W+10;
      g.beginPath();g.moveTo(bx-s*0,H+20);g.bezierCurveTo(bx+s*50,H*.7,bx+s*10,H*.4,bx+s*60,H*.1);g.lineTo(bx+s*20,-20);g.lineTo(bx-s*40,-20);g.lineTo(bx-s*40,H+20);g.fill();
      arbol(g,bx+s*48,H*.22,W*(G.narrow?.18:.15),s<0?-.35:Math.PI+.35,9,r,6);
      arbol(g,bx+s*40,H*.48,W*(G.narrow?.14:.1),s<0?-.15:Math.PI+.15,6,r,5);
      // musgo colgante
      g.lineWidth=1.4;for(let i=0;i<9;i++){const mx=bx+s*(40+r()*W*.16),my=H*.12+r()*H*.2;g.beginPath();g.moveTo(mx,my);g.bezierCurveTo(mx+4,my+20,mx-4,my+40,mx+2,my+50+r()*40);g.stroke();}
      // hongos que brillan en el tronco
      for(let i=0;i<4;i++){const hx=bx+s*(22+i*6),hy=H*(.55+i*.08);glow(g,hx,hy,16,'120,255,190',.35);g.fillStyle='#8fffc8';g.beginPath();g.ellipse(hx,hy,6-i,3,0,Math.PI,TAU);g.fill();g.fillStyle='#020806';}
    }
    // juncos en primer plano
    g.strokeStyle='#020806';g.lineWidth=3;for(let i=0;i<16;i++){const x=(i<8?i*W*.02:W-(i-8)*W*.02),h=H*(.12+r()*.12);g.beginPath();g.moveTo(x,H);g.quadraticCurveTo(x+4,H-h*.5,x+(r()-.5)*14,H-h);g.stroke();}
  },
  atras(g,W,H,G,t,ph,dt,pul){
    const S=this.s||(this.s={rip:[],bub:[],wisp:Array.from({length:RM?5:14},()=>({x:Math.random(),y:rand(.2,.55),p:rand(0,TAU)})),cl:Array.from({length:4},(_,i)=>({x:Math.random(),y:.08+i*.05,w:rand(.25,.45),v:rand(.006,.014)}))});
    const mx=G.ex, my=G.ey-4, mR=Math.min(W,H)*(G.narrow?.24:.27), mc=ph>=2?'190,255,110':'200,255,170';
    // luna tóxica gigante detrás del jefe (aureola)
    g.save();g.globalCompositeOperation='lighter';glow(g,mx,my,mR*2.4,mc,.16+pul*.08);g.restore();
    const mg=g.createRadialGradient(mx-mR*.3,my-mR*.3,mR*.1,mx,my,mR);mg.addColorStop(0,ph>=2?'#eaffb0':'#effff0');mg.addColorStop(1,ph>=2?'#7fbf40':'#9fd8a0');
    g.globalAlpha=.78;g.fillStyle=mg;g.beginPath();g.arc(mx,my,mR,0,TAU);g.fill();g.globalAlpha=1;
    g.fillStyle='rgba(60,110,70,.3)';for(const [a,b,c] of [[-.35,-.2,.2],[.3,.25,.14],[-.05,.4,.1],[.4,-.35,.08]]){g.beginPath();g.arc(mx+a*mR,my+b*mR,c*mR,0,TAU);g.fill();}
    // nubes que cruzan la luna
    for(const c of S.cl){if(!RM)c.x=(c.x+c.v*dt)%1.5;const cx=(c.x-.25)*W,cy=c.y*H+my*.6;g.fillStyle='rgba(8,24,18,.75)';
      g.beginPath();g.ellipse(cx,cy,c.w*W*.5,10,0,0,TAU);g.ellipse(cx+c.w*W*.2,cy-6,c.w*W*.25,8,0,0,TAU);g.fill();}
    rayos(g,mx,my,10,H*1.1,t,mc,.06+pul*.03);
    sello(g,mx,my,mR*1.32,t,{col:ph>=2?'190,255,90':'140,255,170',glif:GLIFOS.amina,lados:3,a:.75,pulso:pul,vel:ph>=2?2:1});
    // reflejo de la luna en el agua
    g.save();g.globalCompositeOperation='lighter';
    for(let i=0;i<14;i++){const y=G.hz+5+i*7,w=(10+i*4)*(1+.3*Math.sin(t*1.8+i*1.3));g.fillStyle=`rgba(${mc},${.14-i*.008})`;g.fillRect(mx-w/2+Math.sin(t*.9+i)*5,y,w,2);}
    // fuegos fatuos
    for(const w of S.wisp){if(!RM){w.x+=Math.sin(t*.4+w.p)*dt*.02;w.y+=Math.cos(t*.5+w.p)*dt*.01;}const a=.5+.4*Math.sin(t*2+w.p);
      glow(g,w.x*W,w.y*H+G.hz*.6,14,'140,255,200',a*.5);g.fillStyle=`rgba(220,255,230,${a})`;g.beginPath();g.arc(w.x*W,w.y*H+G.hz*.6,2,0,TAU);g.fill();}
    g.restore();
    // burbujas tóxicas que suben del agua y revientan
    if(!RM&&Math.random()<dt*4)S.bub.push({x:rand(.05,.95)*W,y:rand(G.hz+8,H*.95),r:0,max:rand(3,7)});
    for(let i=S.bub.length-1;i>=0;i--){const b=S.bub[i];b.r+=dt*6;if(b.r>b.max){S.rip.push({x:b.x,y:b.y,r:b.r,a:.5});S.bub.splice(i,1);continue;}
      g.strokeStyle='rgba(180,255,140,.6)';g.lineWidth=1;g.beginPath();g.arc(b.x,b.y-b.r,b.r,0,TAU);g.stroke();}
    g.strokeStyle='rgba(180,255,160,.4)';for(let i=S.rip.length-1;i>=0;i--){const r0=S.rip[i];r0.r+=dt*16;r0.a-=dt*.6;if(r0.a<=0){S.rip.splice(i,1);continue;}g.globalAlpha=r0.a;g.beginPath();g.ellipse(r0.x,r0.y,r0.r,r0.r*.3,0,0,TAU);g.stroke();}
    g.globalAlpha=1;
    // sello en el altar
    const al=this.altar; if(al) sello(g,al.x,al.y,al.w*.78,t,{col:ph>=2?'190,255,90':'120,255,170',glif:GLIFOS.amina,lados:3,sy:al.h/al.w,a:.6,pulso:pul,vel:-1});
    vortice(S,g,G,t,dt,'170,255,150',40,ph>=2?1:.3);
  },
  frente(g,W,H,G,t,ph,dt,pul){
    const S=this.f||(this.f={fog:Array.from({length:6},(_,i)=>({x:Math.random(),y:rand(.55,.95),w:rand(.3,.5),v:rand(.008,.018)*(i%2?1:-1)})),sp:Array.from({length:RM?6:24},()=>({x:Math.random(),y:Math.random(),v:rand(.01,.03),p:rand(0,TAU)}))});
    for(const f of S.fog){if(!RM)f.x=((f.x+f.v*dt)%1.6+1.6)%1.6;const fx=(f.x-.3)*W,fy=f.y*H,fw=f.w*W;
      const fg=g.createRadialGradient(fx,fy,0,fx,fy,fw);fg.addColorStop(0,`rgba(140,220,120,${ph>=2?.13:.08})`);fg.addColorStop(1,'rgba(140,220,120,0)');
      g.save();g.translate(fx,fy);g.scale(1,.22);g.translate(-fx,-fy);g.fillStyle=fg;g.fillRect(fx-fw,fy-fw,fw*2,fw*2);g.restore();}
    g.save();g.globalCompositeOperation='lighter';for(const s of S.sp){if(!RM){s.y-=s.v*dt;s.x+=Math.sin(t+s.p)*dt*.01;if(s.y<0){s.y=1;s.x=Math.random();}}
      g.fillStyle=`rgba(190,255,150,${.3+.3*Math.sin(t*3+s.p)})`;g.fillRect(s.x*W,s.y*H,1.6,1.6);}g.restore();
    vineta(g,W,H,.7,'2,10,6');
  }
};

/* --- 2. REACTOR DE INESTABILIDAD (Ciclobutadieno) --- */
A.arenas.laboratorio={
  lejos(g,W,H,G){
    const r=seeded(23), hz=G.hz;
    sky(g,W,H,[[0,'#0b0f16'],[hz/H,'#1a2230'],[hz/H+.001,'#141a22'],[1,'#06080b']]);
    // techo roto: agujero irregular que deja ver la tormenta (la tormenta se anima en "atras")
    const hx=W/2, hw=G.narrow?W*.7:W*.5; this.hoyo={x:hx,w:hw,h:hz*.32};
    // paredes: paneles metálicos con remaches
    for(let x=0;x<W;x+=W*(G.narrow?.2:.1)){const pg=g.createLinearGradient(x,0,x+W*.1,0);pg.addColorStop(0,'#1d2633');pg.addColorStop(1,'#141b25');g.fillStyle=pg;g.fillRect(x+2,hz*.32,W*(G.narrow?.2:.1)-4,hz*.68);
      g.fillStyle='#2b3647';for(let y=hz*.36;y<hz;y+=hz*.16){g.beginPath();g.arc(x+8,y,2,0,TAU);g.arc(x+W*(G.narrow?.2:.1)-8,y,2,0,TAU);g.fill();}}
    // tanques con líquido brillante
    for(const [px,col] of (G.narrow?[[.1,'80,220,255'],[.9,'255,120,60']]:[[.08,'80,220,255'],[.18,'140,255,120'],[.82,'255,120,60'],[.92,'255,80,170']])){
      const x=W*px,w=G.narrow?30:36,top=hz*.42,h=hz*.55;g.fillStyle='#202a36';g.fillRect(x-w/2-4,top-8,w+8,h+16);
      const lg=g.createLinearGradient(0,top,0,top+h);lg.addColorStop(0,`rgba(${col},.15)`);lg.addColorStop(.3,`rgba(${col},.7)`);lg.addColorStop(1,`rgba(${col},.35)`);g.fillStyle=lg;g.fillRect(x-w/2,top+h*.25,w,h*.75);
      g.strokeStyle='rgba(220,240,255,.35)';g.lineWidth=1.5;g.strokeRect(x-w/2,top,w,h);glow(g,x,top+h*.6,w*1.6,col,.18);}
    // piso de rejilla metálica en perspectiva
    const fl=g.createLinearGradient(0,hz,0,H);fl.addColorStop(0,'#232c38');fl.addColorStop(1,'#07090c');g.fillStyle=fl;g.fillRect(-40,hz,W+80,H-hz+40);
    g.strokeStyle='rgba(150,190,220,.1)';g.lineWidth=1;
    for(let i=1;i<=12;i++){const y=hz+(H-hz)*Math.pow(i/12,1.7);g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}
    for(let i=-14;i<=14;i++){const bx=W/2+i*(W/10);g.beginPath();g.moveTo(W/2+(bx-W/2)*.15,hz);g.lineTo(bx,H);g.stroke();}
    // franjas de peligro
    for(let x=-20;x<W;x+=26){g.fillStyle='#e0b020';g.beginPath();g.moveTo(x,hz);g.lineTo(x+13,hz);g.lineTo(x+21,hz+7);g.lineTo(x+8,hz+7);g.fill();}
    // plataforma de contención bajo la caja
    const px=W/2,py=G.by+(G.narrow?18:22),pw=G.narrow?W*.5:W*.38,ph=pw*.24; this.plat={x:px,y:py,w:pw,h:ph};
    g.fillStyle='#0b0e13';g.beginPath();g.ellipse(px,py+8,pw*1.05,ph*1.15,0,0,TAU);g.fill();
    const pg2=g.createLinearGradient(0,py-ph,0,py+ph);pg2.addColorStop(0,'#3a4656');pg2.addColorStop(1,'#151b23');g.fillStyle=pg2;g.beginPath();g.ellipse(px,py,pw,ph,0,0,TAU);g.fill();
    g.strokeStyle='#e0b020';g.lineWidth=3;g.setLineDash([12,10]);g.beginPath();g.ellipse(px,py,pw*.96,ph*.96,0,0,TAU);g.stroke();g.setLineDash([]);
    // carcasa del reactor detrás del jefe (marco cuadrado gigante)
    const rx=G.ex, ry=G.ey, rs=G.narrow?W*.36:Math.min(H*.42,W*.24); this.reac={x:rx,y:ry,s:rs};
    g.save();g.translate(rx,ry);g.rotate(Math.PI/4);
    g.fillStyle='#10151c';g.fillRect(-rs*1.08,-rs*1.08,rs*2.16,rs*2.16);
    const mg=g.createLinearGradient(-rs,-rs,rs,rs);mg.addColorStop(0,'#46526a');mg.addColorStop(.5,'#232a36');mg.addColorStop(1,'#3a4558');g.fillStyle=mg;
    g.fillRect(-rs,-rs,rs*2,rs*.22);g.fillRect(-rs,rs*.78,rs*2,rs*.22);g.fillRect(-rs,-rs,rs*.22,rs*2);g.fillRect(rs*.78,-rs,rs*.22,rs*2);
    g.fillStyle='#0a0d12';g.fillRect(-rs*.78,-rs*.78,rs*1.56,rs*1.56);
    g.fillStyle='#e0b020';for(let i=0;i<8;i++){g.save();g.rotate(i*Math.PI/2*(i<4?1:1));g.restore();}
    g.fillStyle='#9aa7b8';for(const [a,b] of [[-.89,-.89],[.89,-.89],[.89,.89],[-.89,.89]]){g.beginPath();g.arc(a*rs,b*rs,rs*.06,0,TAU);g.fill();}
    g.restore();
  },
  cerca(g,W,H,G){
    // tuberías gruesas y cables que enmarcan
    g.fillStyle='#070a0e';
    for(const s of [-1,1]){const x=s<0?0:W;
      g.fillRect(s<0?0:W-(G.narrow?22:34),0,G.narrow?22:34,H);
      g.fillStyle='#0d1219';g.fillRect(s<0?(G.narrow?16:26):W-(G.narrow?30:46),0,14,H);g.fillStyle='#070a0e';
      for(let y=H*.15;y<H;y+=H*.22){g.fillStyle='#1a222d';g.fillRect(s<0?0:W-(G.narrow?32:50),y,G.narrow?32:50,10);g.fillStyle='#070a0e';}
      g.strokeStyle='#05070a';g.lineWidth=4;g.beginPath();g.moveTo(x,H*.05);g.bezierCurveTo(x-s*W*.15,H*.25,x-s*W*.08,H*.3,x-s*W*.22,H*.18);g.stroke();
    }
  },
  atras(g,W,H,G,t,ph,dt,pul){
    const S=this.s||(this.s={rain:Array.from({length:RM?20:60},()=>({x:Math.random(),y:Math.random(),v:rand(.8,1.3)})),bolt:0,next:2.5,seed:1,arcs:[],deb:Array.from({length:10},(_,i)=>({a:i/10*TAU,r:rand(.9,1.5),h:rand(-.6,.6),s:rand(5,11),rot:rand(0,TAU),vr:rand(-2,2),tipo:i%3})),steam:[]});
    const Hh=this.hoyo; if(Hh){
      // tormenta por el techo roto
      g.save();g.beginPath();g.moveTo(Hh.x-Hh.w/2,0);for(let i=0;i<=12;i++){const u=i/12;g.lineTo(Hh.x-Hh.w/2+u*Hh.w,Hh.h*(.75+.25*Math.sin(i*2.7))*(1-Math.pow(2*u-1,6)*.6));}g.lineTo(Hh.x+Hh.w/2,0);g.closePath();g.clip();
      const sg=g.createLinearGradient(0,0,0,Hh.h);sg.addColorStop(0,'#1a1040');sg.addColorStop(1,'#3a2a70');g.fillStyle=sg;g.fillRect(0,0,W,Hh.h);
      g.fillStyle='rgba(80,60,140,.6)';for(let i=0;i<6;i++){const cx=((i*.21+t*.012)%1.2-.1)*W;g.beginPath();g.ellipse(cx,Hh.h*.35+i*4,W*.14,12,0,0,TAU);g.fill();}
      if(!RM){S.next-=dt;if(S.next<=0){S.bolt=1;S.next=rand(2.5,5.5);S.seed=Math.random()*99;}}
      if(S.bolt>0){g.fillStyle=`rgba(200,200,255,${S.bolt*.4})`;g.fillRect(0,0,W,Hh.h);g.strokeStyle=`rgba(240,240,255,${S.bolt})`;g.lineWidth=2.5;g.beginPath();let lx=Hh.x+(S.seed%1-.5)*Hh.w*.6,ly=0;g.moveTo(lx,ly);for(let i=0;i<6;i++){lx+=Math.sin(S.seed+i*2.3)*16;ly+=Hh.h/6;g.lineTo(lx,ly);}g.stroke();S.bolt=Math.max(0,S.bolt-dt*1.8);}
      g.strokeStyle='rgba(170,180,230,.35)';g.lineWidth=1;for(const d of S.rain){if(!RM){d.y+=d.v*dt*1.2;if(d.y>1){d.y=0;d.x=Math.random();}}const x=Hh.x-Hh.w/2+d.x*Hh.w,y=d.y*Hh.h;g.beginPath();g.moveTo(x,y);g.lineTo(x-2,y+10);g.stroke();}
      g.restore();
    }
    // NÚCLEO del reactor: anillo cuadrado de energía que gira en 3D + plasma
    const R=this.reac; if(R){
      const col=ph>=2?'255,90,60':'255,160,70', core=ph>=2?'255,200,160':'255,230,170';
      g.save();g.globalCompositeOperation='lighter';glow(g,R.x,R.y,R.s*1.9,col,.25+pul*.1);
      for(let k=0;k<3;k++){const ay=t*(.6+k*.35)*(RM?0:1)*(ph>=2?1.8:1)+k, ax=.5+k*.3;
        const pts=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>proj(rotX(rotY({x:a*R.s*(.55-k*.1),y:b*R.s*(.55-k*.1),z:0},ay),ax),R.x,R.y));
        g.strokeStyle=`rgba(${col},${.75-k*.15})`;g.lineWidth=3-k*.6;g.beginPath();pts.forEach((p,i)=>g[i?'lineTo':'moveTo'](p.x,p.y));g.closePath();g.stroke();
        g.strokeStyle=`rgba(${col},.18)`;g.lineWidth=10-k*2;g.stroke();}
      glow(g,R.x,R.y,R.s*.5,core,.55+pul*.2);
      // arcos del marco al núcleo
      if(!RM&&Math.random()<dt*6)S.arcs.push({a:1,ang:rand(0,TAU),seed:Math.random()*99});
      for(let i=S.arcs.length-1;i>=0;i--){const a=S.arcs[i];a.a-=dt*3;if(a.a<=0){S.arcs.splice(i,1);continue;}
        g.strokeStyle=`rgba(200,230,255,${a.a})`;g.lineWidth=1.6;g.beginPath();g.moveTo(R.x,R.y);
        for(let j=1;j<=7;j++){const u=j/7;g.lineTo(R.x+Math.cos(a.ang)*R.s*.95*u+Math.sin(a.seed+j*4)*8,R.y+Math.sin(a.ang)*R.s*.95*u+Math.cos(a.seed+j*3)*8);}g.stroke();}
      g.restore();
      sello(g,R.x,R.y,R.s*1.35,t,{col:ph>=2?'255,90,60':'255,170,80',glif:GLIFOS.ciclo,lados:4,a:.7,pulso:pul,vel:ph>=2?2.4:1.2});
      // escombros que orbitan el reactor
      for(const d of S.deb){if(!RM){d.a+=dt*.3*(ph>=2?1.8:1);d.rot+=dt*d.vr;}const z=Math.sin(d.a),x=R.x+Math.cos(d.a)*R.s*d.r*1.2,y=R.y+d.h*R.s*.8+z*14,s=d.s*(1+z*.25);
        g.save();g.translate(x,y);g.rotate(d.rot);g.globalAlpha=.55+.4*(z+1)/2;
        if(d.tipo===0){g.fillStyle='#4a566a';g.fillRect(-s,-s*.5,s*2,s);g.fillStyle='#e0b020';g.fillRect(-s,-s*.5,s*.5,s);}
        else if(d.tipo===1){g.fillStyle='rgba(180,230,255,.55)';g.beginPath();g.moveTo(0,-s);g.lineTo(s*.6,s*.5);g.lineTo(-s*.5,s*.7);g.closePath();g.fill();}
        else {g.fillStyle='#2a3240';g.beginPath();g.arc(0,0,s*.7,0,TAU);g.fill();g.fillStyle='rgba(255,160,70,.8)';g.beginPath();g.arc(0,0,s*.25,0,TAU);g.fill();}
        g.restore();}
    }
    // plataforma: anillo de contención encendido
    const P=this.plat; if(P) sello(g,P.x,P.y,P.w*.8,t,{col:ph>=2?'255,90,60':'110,220,255',glif:GLIFOS.ciclo,lados:4,sy:P.h/P.w,a:.65,pulso:pul,vel:-1.4});
    vortice(S,g,G,t,dt,'255,190,110',36,ph>=2?1.2:.4);
    // vapor de las válvulas
    if(!RM&&Math.random()<dt*3)S.steam.push({x:pick2(W*.06,W*.94),y:G.hz-4,a:.35,r:5});
    for(let i=S.steam.length-1;i>=0;i--){const s=S.steam[i];s.y-=dt*30;s.r+=dt*10;s.a-=dt*.18;if(s.a<=0){S.steam.splice(i,1);continue;}g.fillStyle=`rgba(200,215,230,${s.a*.35})`;g.beginPath();g.arc(s.x,s.y,s.r,0,TAU);g.fill();}
  },
  frente(g,W,H,G,t,ph,dt,pul){
    const S=this.f||(this.f={sp:[]});
    if(!RM&&Math.random()<dt*(ph>=2?10:4))S.sp.push({x:rand(.1,.9)*W,y:-4,vx:rand(-30,30),vy:rand(20,60),a:1});
    for(let i=S.sp.length-1;i>=0;i--){const s=S.sp[i];s.vy+=dt*240;s.x+=s.vx*dt;s.y+=s.vy*dt;s.a-=dt*.7;if(s.a<=0||s.y>H){S.sp.splice(i,1);continue;}g.fillStyle=`rgba(255,210,120,${s.a})`;g.fillRect(s.x,s.y,2,2);}
    if(ph>=2){const a=RM?0:t*2.4;g.save();g.globalCompositeOperation='lighter';g.translate(W/2,0);g.rotate(Math.sin(a)*.8);
      const eg=g.createLinearGradient(0,0,0,H);eg.addColorStop(0,'rgba(255,70,40,.2)');eg.addColorStop(1,'rgba(255,70,40,0)');g.fillStyle=eg;g.beginPath();g.moveTo(-8,0);g.lineTo(8,0);g.lineTo(110,H);g.lineTo(-110,H);g.fill();g.restore();}
    vineta(g,W,H,.72,ph>=2?'30,4,0':'4,6,12');
  }
};
const pick2=(a,b)=>Math.random()<.5?a:b;

/* --- 3. CATEDRAL AROMÁTICA (Benceno malvado) --- */
A.arenas.catedral={
  lejos(g,W,H,G){
    const r=seeded(31), hz=G.hz;
    sky(g,W,H,[[0,'#0d0620'],[hz/H,'#24123f'],[hz/H+.001,'#1a0f30'],[1,'#07030f']]);
    // nave en perspectiva: arcos que se repiten hacia el fondo
    for(let i=5;i>=0;i--){const u=i/5,s=.35+u*.65,w=W*s*(G.narrow?1:.9),top=hz-(hz-12)*s,x=W/2;
      g.strokeStyle=`rgba(${Math.round(40+u*30)},${Math.round(25+u*20)},${Math.round(80+u*40)},1)`;g.lineWidth=6+u*14;
      g.beginPath();g.moveTo(x-w/2,hz+(H-hz)*u*.4);g.lineTo(x-w/2,top+w*.25);g.quadraticCurveTo(x-w/2,top,x,top-w*.06);g.quadraticCurveTo(x+w/2,top,x+w/2,top+w*.25);g.lineTo(x+w/2,hz+(H-hz)*u*.4);g.stroke();}
    // rosetón hexagonal (benceno) detrás del jefe
    const cx=G.ex, cy=G.ey-(G.narrow?2:6), R=G.narrow?W*.27:Math.min(H*.36,W*.2); this.rose={x:cx,y:cy,R};
    g.fillStyle='#0c0718';hexPath(g,cx,cy,R*1.12,Math.PI/6);g.fill();
    const cols=['#7c4dff','#ff4fa3','#ffd23f','#3fd0ff','#a98bff','#ff7a4d'];
    for(let i=0;i<6;i++){const a0=Math.PI/6+i*Math.PI/3,a1=a0+Math.PI/3;
      for(let ring=0;ring<2;ring++){const r0=R*(ring?.55:.25),r1=R*(ring?1:.55);g.fillStyle=cols[(i+ring*2)%6];g.globalAlpha=.85;
        g.beginPath();g.moveTo(cx+Math.cos(a0)*r0,cy+Math.sin(a0)*r0);g.lineTo(cx+Math.cos(a0)*r1,cy+Math.sin(a0)*r1);g.lineTo(cx+Math.cos(a1)*r1,cy+Math.sin(a1)*r1);g.lineTo(cx+Math.cos(a1)*r0,cy+Math.sin(a1)*r0);g.closePath();g.fill();}}
    g.globalAlpha=1;g.strokeStyle='#120a1e';g.lineWidth=4;hexPath(g,cx,cy,R,Math.PI/6);g.stroke();hexPath(g,cx,cy,R*.55,Math.PI/6);g.stroke();hexPath(g,cx,cy,R*.25,Math.PI/6);g.stroke();
    for(let i=0;i<6;i++){const a=Math.PI/6+i*Math.PI/3;g.beginPath();g.moveTo(cx+Math.cos(a)*R*.25,cy+Math.sin(a)*R*.25);g.lineTo(cx+Math.cos(a)*R,cy+Math.sin(a)*R);g.stroke();}
    g.strokeStyle='#d9ac68';g.lineWidth=3;hexPath(g,cx,cy,R*1.12,Math.PI/6);g.stroke();
    // vitrales laterales altos
    for(const s of [-1,1]){for(let i=0;i<(G.narrow?1:2);i++){const x=W/2+s*W*(.3+i*.12),w=W*.045,top=H*.1,h=hz*.6;
      g.fillStyle='#0c0718';g.fillRect(x-w/2-3,top-3,w+6,h+6);for(let j=0;j<5;j++){g.fillStyle=cols[(j+i*2+(s>0?3:0))%6];g.globalAlpha=.7;g.fillRect(x-w/2,top+j*h/5,w,h/5-2);}g.globalAlpha=1;
      g.fillStyle='#0c0718';g.beginPath();g.arc(x,top,w/2+3,Math.PI,0);g.fill();}}
    // piso de mármol pulido con hexágonos
    const fl=g.createLinearGradient(0,hz,0,H);fl.addColorStop(0,'#2a1d44');fl.addColorStop(1,'#0a0614');g.fillStyle=fl;g.fillRect(-40,hz,W+80,H-hz+40);
    g.strokeStyle='rgba(217,172,104,.12)';g.lineWidth=1;
    for(let row=0;row<9;row++){const u=Math.pow((row+.5)/9,1.6),y=hz+(H-hz)*u,s=6+u*26;for(let x=-s+(row%2)*s*.9;x<W+s;x+=s*1.8){g.save();g.translate(x,y);g.scale(1,.35+u*.25);hexPath(g,0,0,s,Math.PI/6);g.restore();g.stroke();}}
    // reflejo del rosetón en el piso
    const rg=g.createRadialGradient(W/2,hz+(H-hz)*.3,0,W/2,hz+(H-hz)*.3,W*.35);rg.addColorStop(0,'rgba(169,139,255,.18)');rg.addColorStop(1,'rgba(169,139,255,0)');g.fillStyle=rg;g.fillRect(0,hz,W,H-hz);
    // alfombra
    const cw1=G.narrow?W*.22:W*.12,cw2=G.narrow?W*.7:W*.48;g.fillStyle='#3e1550';g.beginPath();g.moveTo(W/2-cw1/2,hz);g.lineTo(W/2+cw1/2,hz);g.lineTo(W/2+cw2/2,H);g.lineTo(W/2-cw2/2,H);g.fill();
    g.strokeStyle='#d9ac68';g.lineWidth=2;g.stroke();
    this.circ={x:W/2,y:G.by+(G.narrow?14:18),w:G.narrow?W*.48:W*.34};
  },
  cerca(g,W,H,G){
    // columnas enormes en primer plano y cortinas violetas
    for(const s of [-1,1]){const w=G.narrow?40:58,x=s<0?0:W-w;
      const cg=g.createLinearGradient(x,0,x+w,0);cg.addColorStop(0,s<0?'#05020c':'#1c1030');cg.addColorStop(1,s<0?'#1c1030':'#05020c');g.fillStyle=cg;g.fillRect(x,0,w,H);
      g.fillStyle='#8a6a30';g.fillRect(x,H*.32,w,6);g.fillRect(x,H*.86,w,8);
      g.fillStyle='#2a0d3a';g.beginPath();const cx0=s<0?w:W-w;g.moveTo(cx0,0);g.quadraticCurveTo(cx0+s*W*.12,H*.08,cx0+s*W*.04,H*.36);g.quadraticCurveTo(cx0+s*W*.02,H*.18,cx0,H*.12);g.fill();
      g.strokeStyle='#d9ac68';g.lineWidth=1.5;g.stroke();}
  },
  atras(g,W,H,G,t,ph,dt,pul){
    const S=this.s||(this.s={dust:Array.from({length:RM?10:40},()=>({x:Math.random(),y:Math.random(),v:rand(.004,.012),p:rand(0,TAU)})),plat:Array.from({length:6},(_,i)=>({x:(i%3)/2*.7+.15,y:i<3?.28:.5,p:rand(0,TAU),s:rand(.7,1.1),z:i<3?.6:1}))});
    const R=this.rose; if(!R)return;
    const rc=ph>=2?'255,80,150':'190,150,255';
    g.save();g.globalCompositeOperation='lighter';glow(g,R.x,R.y,R.R*1.7,rc,.24+pul*.12);g.restore();
    rayos(g,R.x,R.y,9,H*1.2,t,ph>=2?'255,120,180':'210,180,255',.07+pul*.03,.06);
    sello(g,R.x,R.y,R.R*1.35,t,{col:ph>=2?'255,90,160':'200,170,255',glif:GLIFOS.benceno,lados:6,a:.8,pulso:pul,vel:ph>=2?2:1});
    // plataformas hexagonales flotantes con velas
    for(const [i,p] of S.plat.entries()){const x=p.x*W,y=p.y*H+(RM?0:Math.sin(t*.9+p.p)*7),s=p.s*(G.narrow?14:18)*p.z;
      g.fillStyle='#1a0f2c';g.save();g.translate(x,y);g.scale(1,.38);hexPath(g,0,0,s,0);g.restore();g.fill();
      g.fillStyle='#2e1d4c';g.fillRect(x-s*.9,y,s*1.8,s*.35);
      g.save();g.globalCompositeOperation='lighter';glow(g,x,y+s*.6,s*1.4,'169,139,255',.2);g.restore();
      g.fillStyle='#f0e6d0';g.fillRect(x-2,y-12*p.z,4,12*p.z);flame(g,x,y-12*p.z,.4*p.z,t,i*3,ph>=2?'255,110,150':null);}
    // polvo en la luz
    g.save();g.globalCompositeOperation='lighter';
    for(const d of S.dust){if(!RM){d.y-=d.v*dt;if(d.y<0){d.y=1;d.x=Math.random();}}g.fillStyle=`rgba(255,225,160,${.25+.3*Math.sin(t*2+d.p)})`;g.fillRect(d.x*W,d.y*H,1.6,1.6);}
    g.restore();
    const C=this.circ; if(C) sello(g,C.x,C.y,C.w*.8,t,{col:ph>=2?'255,90,160':'190,150,255',glif:GLIFOS.benceno,lados:6,sy:.24,a:.65,pulso:pul,vel:-1});
    vortice(S,g,G,t,dt,'210,180,255',40,ph>=2?1.1:.35);
  },
  frente(g,W,H,G,t,ph,dt,pul){
    const S=this.f||(this.f={smoke:[]});
    // incensarios que se balancean desde arriba
    for(const [i,x] of (G.narrow?[W*.2,W*.8]:[W*.18,W*.82]).entries()){const sw=RM?0:Math.sin(t*1.1+i*1.6)*.25,len=G.narrow?H*.16:H*.22,px=x+Math.sin(sw)*len,py=Math.cos(sw)*len;
      g.strokeStyle='#8a6a30';g.lineWidth=1.5;g.beginPath();g.moveTo(x,0);g.lineTo(px,py);g.stroke();
      g.fillStyle='#b88a40';g.beginPath();g.arc(px,py+6,7,0,TAU);g.fill();g.save();g.globalCompositeOperation='lighter';glow(g,px,py+8,18,'255,180,120',.35);g.restore();
      if(!RM&&Math.random()<dt*4)S.smoke.push({x:px,y:py,a:.3,r:4});}
    for(let i=S.smoke.length-1;i>=0;i--){const s=S.smoke[i];s.y-=dt*12;s.x+=Math.sin(s.y*.06)*.4;s.r+=dt*5;s.a-=dt*.07;if(s.a<=0){S.smoke.splice(i,1);continue;}g.fillStyle=`rgba(210,190,250,${s.a*.3})`;g.beginPath();g.arc(s.x,s.y,s.r,0,TAU);g.fill();}
    vineta(g,W,H,.72,ph>=2?'30,0,15':'6,2,14');
  }
};

/* --- 4. SALÓN DEL TRONO (Rey Amonio) --- */
A.arenas.trono={
  lejos(g,W,H,G){
    const r=seeded(41), hz=G.hz, vx=G.ex, vy=G.ey;
    sky(g,W,H,[[0,'#08121c'],[hz/H,'#14283a'],[hz/H+.001,'#0e1a24'],[1,'#04080c']]);
    // bóveda: nervios que convergen al centro
    g.strokeStyle='#1d3346';g.lineWidth=3;for(let i=0;i<9;i++){const x=i/8*W;g.beginPath();g.moveTo(x,0);g.quadraticCurveTo((x+vx)/2,hz*.15,vx,hz*.32);g.stroke();}
    // ventanales altos con luna y estrellas
    for(const s of [-1,1]){for(let i=0;i<(G.narrow?1:2);i++){const x=vx+s*W*(.22+i*.14),w=W*(.06-i*.01),top=hz*.12+i*hz*.06,h=hz*(.62-i*.08);
      g.fillStyle='#0a1430';g.beginPath();g.moveTo(x-w/2,top+h);g.lineTo(x-w/2,top+w/2);g.arc(x,top+w/2,w/2,Math.PI,0);g.lineTo(x+w/2,top+h);g.fill();
      for(let j=0;j<10;j++){g.fillStyle=`rgba(255,255,240,${.3+r()*.6})`;g.fillRect(x-w/2+r()*w,top+w*.3+r()*(h-w*.3),1.3,1.3);}
      g.strokeStyle='#d9ac68';g.lineWidth=1.5;g.stroke();g.beginPath();g.moveTo(x,top);g.lineTo(x,top+h);g.stroke();}}
    // trono gigante detrás del jefe
    const tw=G.narrow?W*.42:W*.24, tb=hz+(G.narrow?16:12), tt=G.ey-(G.narrow?120:140);
    const tg=g.createLinearGradient(vx-tw/2,0,vx+tw/2,0);tg.addColorStop(0,'#5a380e');tg.addColorStop(.5,'#f0c66c');tg.addColorStop(1,'#5a380e');
    g.fillStyle=tg;g.beginPath();g.moveTo(vx-tw/2,tb);g.lineTo(vx-tw/2,tt+50);
    [[-.46,.06],[-.34,.3],[-.22,-.06],[-.1,.22],[0,-.22],[.1,.22],[.22,-.06],[.34,.3],[.46,.06]].forEach(([u,v])=>g.lineTo(vx+u*tw,tt+50*v));
    g.lineTo(vx+tw/2,tt+50);g.lineTo(vx+tw/2,tb);g.closePath();g.fill();g.strokeStyle='rgba(60,35,10,.7)';g.lineWidth=2;g.stroke();
    g.fillStyle='#6a1428';rr(g,vx-tw*.36,tt+56,tw*.72,tb-tt-74,12);g.fill();g.strokeStyle='#e3b45c';g.lineWidth=2;g.stroke();
    // escalinata
    for(let i=0;i<4;i++){const w=tw*(1.25+i*.28),y=tb+i*6;g.fillStyle=i%2?'#2e2620':'#3e322a';g.fillRect(vx-w/2,y,w,6);g.fillStyle='rgba(227,180,92,.55)';g.fillRect(vx-w/2,y,w,1.4);}
    // piso de mármol en damero con brillo
    const fy=tb+24, fl=g.createLinearGradient(0,fy,0,H);fl.addColorStop(0,'#1d3040');fl.addColorStop(1,'#060b10');g.fillStyle=fl;g.fillRect(-40,fy,W+80,H-fy+40);
    for(let row=0;row<10;row++){const u0=Math.pow(row/10,1.7),u1=Math.pow((row+1)/10,1.7),y0=fy+(H-fy)*u0,y1=fy+(H-fy)*u1, X=(b,y)=>vx+(W/2+b*(W/7)-vx)*((y-(hz-60))/(H-(hz-60)));
      for(let c=-10;c<10;c++){if((row+c)%2)continue;g.fillStyle='rgba(159,208,207,.05)';g.beginPath();g.moveTo(X(c,y0),y0);g.lineTo(X(c+1,y0),y0);g.lineTo(X(c+1,y1),y1);g.lineTo(X(c,y1),y1);g.fill();}}
    // alfombra roja hasta el trono
    const cw1=tw*.62,cw2=G.narrow?W*.82:W*.56;g.fillStyle='#7e1a30';g.beginPath();g.moveTo(vx-cw1/2,fy);g.lineTo(vx+cw1/2,fy);g.lineTo(W/2+cw2/2,H+40);g.lineTo(W/2-cw2/2,H+40);g.closePath();g.fill();
    g.strokeStyle='#e3b45c';g.lineWidth=3;g.stroke();
    // columnata dorada que retrocede hacia el trono (profundidad)
    for(let i=3;i>=0;i--){const u=i/3,s=.4+u*.6;for(const sd of [-1,1]){const x=vx+sd*(tw*.7+u*W*(G.narrow?.32:.36)),w=10+s*16,top=hz*.18*(1-u)+4,bot=fy+(H-fy)*u*.55;
      const cg=g.createLinearGradient(x-w,0,x+w,0);cg.addColorStop(0,'#0c1820');cg.addColorStop(.5,'#2c4a5c');cg.addColorStop(1,'#0a141a');g.fillStyle=cg;g.fillRect(x-w,top,w*2,bot-top);
      g.fillStyle='#d9ac68';g.fillRect(x-w-3,top,w*2+6,4+s*3);g.fillRect(x-w-4,bot-6-s*3,w*2+8,6+s*3);g.fillRect(x-w,top+(bot-top)*.45,w*2,2+s*2);
      // cristales al pie
      for(let j=0;j<3;j++){const cx=x+(j-1)*8*s,ch=(10+j%2*8)*s;const cg2=g.createLinearGradient(cx,bot-ch,cx,bot);cg2.addColorStop(0,'#d0fff8');cg2.addColorStop(1,'#2f8f8a');g.fillStyle=cg2;g.beginPath();g.moveTo(cx,bot-ch-6);g.lineTo(cx+4*s,bot-ch*.4);g.lineTo(cx,bot);g.lineTo(cx-4*s,bot-ch*.4);g.fill();}}}
    this.trono={x:vx,y:tt+20,w:tw};
    this.circ={x:W/2,y:G.by+(G.narrow?14:18),w:G.narrow?W*.5:W*.36};
  },
  cerca(g,W,H,G){
    // cortinas de terciopelo rojo que enmarcan arriba, con borla dorada
    for(const s of [-1,1]){const x0=s<0?0:W;
      const cg=g.createLinearGradient(x0,0,x0+s*W*.2,0);cg.addColorStop(0,'#3a0612');cg.addColorStop(1,'#7a1428');g.fillStyle=cg;
      g.beginPath();g.moveTo(x0,0);g.lineTo(x0+s*W*(G.narrow?.32:.26),0);g.quadraticCurveTo(x0+s*W*.1,H*.12,x0+s*W*(G.narrow?.08:.06),H*.42);g.lineTo(x0,H*.5);g.closePath();g.fill();
      g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=2;for(let i=1;i<5;i++){g.beginPath();g.moveTo(x0+s*W*.05*i,0);g.quadraticCurveTo(x0+s*W*.04*i,H*.12,x0+s*W*.016*i,H*.4);g.stroke();}
      g.strokeStyle='#e3b45c';g.lineWidth=3;g.beginPath();g.moveTo(x0+s*W*(G.narrow?.32:.26),0);g.quadraticCurveTo(x0+s*W*.1,H*.12,x0+s*W*(G.narrow?.08:.06),H*.42);g.stroke();
      sphere(g,x0+s*W*(G.narrow?.08:.06),H*.43,6,'#fff0c0','#b07a20');
      // columna cercana
      const w=G.narrow?20:30;g.fillStyle='#04080b';g.fillRect(s<0?0:W-w,0,w,H);g.fillStyle='#8a6a30';g.fillRect(s<0?0:W-w,H*.62,w,5);}
  },
  atras(g,W,H,G,t,ph,dt,pul){
    const S=this.s||(this.s={roca:Array.from({length:8},()=>({x:Math.random(),y:rand(.5,1),v:rand(.02,.05),s:rand(4,10),r:rand(0,TAU)}))});
    const T=this.trono; if(!T)return;
    const col=ph>=3?'255,70,70':ph>=2?'240,120,140':'255,210,120';
    g.save();g.globalCompositeOperation='lighter';glow(g,G.ex,G.ey,Math.min(W,H)*.55,col,.22+pul*.1);g.restore();
    rayos(g,G.ex,G.ey-10,12,H*1.2,t,col,.06+pul*.03,.05);
    sello(g,G.ex,G.ey-6,Math.min(W*.42,H*.46)*(G.narrow?1.05:1),t,{col,glif:GLIFOS.trono,lados:4,a:.85,pulso:pul,vel:ph>=3?2.6:ph>=2?1.7:1});
    // estandartes que ondean
    for(const [i,bx] of (G.narrow?[W*.2,W*.8]:[W*.3,W*.7]).entries()){const bw=G.narrow?22:28,bh=G.narrow?64:86,by=G.narrow?H*.05:H*.04;
      g.fillStyle=ph>=2?'#5a1020':'#1f3a6e';g.beginPath();g.moveTo(bx-bw/2,by);g.lineTo(bx+bw/2,by);
      for(let j=0;j<=6;j++){const u=j/6;g.lineTo(bx+bw/2+(RM?0:Math.sin(t*2+u*3+i)*3*u),by+u*bh);}
      g.lineTo(bx,by+bh-10+(RM?0:Math.sin(t*2+3+i)*3));
      for(let j=6;j>=0;j--){const u=j/6;g.lineTo(bx-bw/2+(RM?0:Math.sin(t*2+u*3+i)*3*u),by+u*bh);}g.closePath();g.fill();
      g.strokeStyle='#d9ac68';g.lineWidth=1.5;g.stroke();g.fillStyle='#e3b45c';g.font=`700 ${G.narrow?13:17}px "Iowan Old Style",Georgia,serif`;g.textAlign='center';g.textBaseline='middle';g.fillText('N',bx,by+bh*.45);}
    // candelabros
    for(const [i,cx] of (G.narrow?[W*.24,W*.76]:[W*.17,W*.83]).entries()){const sw=RM?0:Math.sin(t*.8+i*1.7)*.05,ly=G.narrow?H*.12:H*.2,px=cx+Math.sin(sw)*ly;
      g.strokeStyle='#8a6a30';g.lineWidth=1.5;g.beginPath();g.moveTo(cx,0);g.lineTo(px,ly);g.stroke();
      g.strokeStyle='#d9ac68';g.lineWidth=3;g.beginPath();g.ellipse(px,ly+6,28,7,0,0,TAU);g.stroke();
      for(let j=0;j<6;j++){const a=j/6*TAU+.3,vx=px+Math.cos(a)*28,vy=ly+6+Math.sin(a)*7;g.fillStyle='#f0e6d0';g.fillRect(vx-2,vy-10,4,10);flame(g,vx,vy-10,.4,t,i*7+j,ph>=3?'255,100,90':null);}}
    // braseros a los lados del trono
    for(const [i,s] of [-1,1].entries()){const bx=T.x+s*T.w*.72,by=G.hz+(G.narrow?6:2);
      g.fillStyle='#2a1c12';g.fillRect(bx-4,by,8,24);g.fillStyle='#b88a40';g.beginPath();g.moveTo(bx-15,by-4);g.lineTo(bx+15,by-4);g.lineTo(bx+9,by+6);g.lineTo(bx-9,by+6);g.fill();
      flame(g,bx,by-4,1.15,t,i*4,ph>=3?'255,90,80':ph>=2?'255,140,120':null);}
    // rocas que levitan (desde la fase 2)
    if(ph>=2) for(const rk of S.roca){if(!RM){rk.y-=rk.v*dt;rk.r+=dt*.6;if(rk.y<.1){rk.y=1;rk.x=Math.random();}}
      g.save();g.translate(rk.x*W,rk.y*H);g.rotate(rk.r);g.fillStyle='#2a2530';g.beginPath();g.moveTo(-rk.s,0);g.lineTo(-rk.s*.3,-rk.s*.8);g.lineTo(rk.s,-rk.s*.2);g.lineTo(rk.s*.4,rk.s*.7);g.closePath();g.fill();
      g.strokeStyle=`rgba(${col},.6)`;g.lineWidth=1;g.stroke();g.restore();}
    const C=this.circ; if(C) sello(g,C.x,C.y,C.w*.8,t,{col,glif:GLIFOS.trono,lados:4,sy:.24,a:.7,pulso:pul,vel:-1});
    vortice(S,g,G,t,dt,ph>=3?'255,120,100':'255,220,150',46,ph>=2?1.2:.4);
  },
  frente(g,W,H,G,t,ph,dt,pul){
    const S=this.f||(this.f={emb:Array.from({length:RM?10:30},()=>({x:Math.random(),y:Math.random(),v:rand(.02,.06),p:rand(0,TAU)}))});
    g.save();g.globalCompositeOperation='lighter';
    for(const e of S.emb){if(!RM){e.y-=e.v*dt*(1+ph*.4);if(e.y<-.05){e.y=1.05;e.x=Math.random();}}
      const a=.3+.4*Math.sin(t*3+e.p);g.fillStyle=ph>=3?`rgba(255,110,80,${a})`:`rgba(255,215,140,${a})`;g.beginPath();g.arc(e.x*W+Math.sin(t+e.p)*8,e.y*H,1.5,0,TAU);g.fill();}
    g.restore();
    if(ph>=2){g.fillStyle=`rgba(120,10,30,${ph>=3?.12:.07})`;g.fillRect(0,0,W,H);}
    vineta(g,W,H,.75,ph>=3?'30,0,4':'2,6,10');
  }
};

/* ---------- Pintar: capas fijas (con paralaje) + capas vivas ---------- */
const cache={}, PAD=30;
function capa(id,nombre,W,H,G,k){
  const ar=A.arenas[id], key=nombre+'|'+W+'|'+H+'|'+k;
  if(!cache[id+nombre]||cache[id+nombre].key!==key){
    const c=document.createElement('canvas');c.width=Math.round((W+PAD*2)*k);c.height=Math.round((H+PAD*2)*k);
    const cg=c.getContext('2d');cg.setTransform(k,0,0,k,PAD*k,PAD*k);
    if(nombre==='lejos'){ar.s=null;ar.f=null;}
    ar[nombre](cg,W,H,G); cache[id+nombre]={key,c};
  }
  return cache[id+nombre].c;
}
A.pintarArena=function(id,g,W,H,G,k,t,ph,dt){
  const ar=A.arenas[id]; if(!ar) return;
  const c=capa(id,'lejos',W,H,G,k), px=-A.cam.x*6, py=-A.cam.y*3;
  g.drawImage(c,-PAD+px,-PAD+py,W+PAD*2,H+PAD*2);
  ar.atras&&ar.atras(g,W,H,G,t,ph,dt,A.pulso());
};
A.pintarFrente=function(id,g,W,H,G,k,t,ph,dt){
  const ar=A.arenas[id]; if(!ar) return;
  if(ar.cerca){const c=capa(id,'cerca',W,H,G,k), px=-A.cam.x*16, py=-A.cam.y*6; g.drawImage(c,-PAD+px,-PAD+py,W+PAD*2,H+PAD*2);}
  ar.frente&&ar.frente(g,W,H,G,t,ph,dt,A.pulso());
};
})();
