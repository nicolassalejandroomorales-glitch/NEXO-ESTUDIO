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

/* --- 4. REY AMONIO --- */
A.jefes.rey=function(g,x,y,k,st){
  const B=base(st,k); if(B.alpha<=.01)return; y+=B.dy;
  const ph=st.fase||1, t=st.t, f2=ph>=2, f3=ph>=3;
  g.save(); g.globalAlpha=B.alpha; g.translate(x,y); g.scale(B.sx,B.sy); g.translate(-x,-y);
  glow(g,x,y,150*k,f3?'255,70,70':f2?'217,138,143':'217,172,104',.3);
  // capa real que ondea
  const capa=f3?['#5a0f1e','#22050c']:f2?['#6e1630','#2c0812']:['#26407a','#0f1a3a'];
  const cg=g.createLinearGradient(x,y-20*k,x,y+110*k);cg.addColorStop(0,capa[0]);cg.addColorStop(1,capa[1]);
  g.fillStyle=cg;g.beginPath();g.moveTo(x-30*k,y-14*k);
  g.bezierCurveTo(x-60*k,y+10*k,x-78*k,y+60*k,x-86*k,y+100*k);
  for(let i=0;i<=8;i++){const u=i/8,px=x-86*k+u*172*k,py=y+100*k+Math.sin(u*9+t*(RM?0:2.4))*6*k;g.lineTo(px,py);}
  g.bezierCurveTo(x+78*k,y+60*k,x+60*k,y+10*k,x+30*k,y-14*k);g.closePath();g.fill();
  g.strokeStyle='rgba(217,172,104,.85)';g.lineWidth=2.5*k;g.stroke();
  // tetraedro: 1 H arriba y 3 abajo, girando en 3D
  const spin=t*(f3?2.2:f2?1.6:.9)*(RM?.3:1), L=66*k*B.spread;
  const dirs=[{x:0,y:-1,z:0,top:true},...[0,1,2].map(i=>{const a=spin+i*TAU/3;return {x:Math.cos(a)*.943,y:.333,z:Math.sin(a)*.943};})].map(p=>({...rotX(p,.12),top:p.top}));
  const Hs=dirs.map(d=>({...proj({x:d.x*L,y:d.y*L+(d.top?-10*k:0),z:d.z*L},x,y),top:d.top}));
  const hc=f3?'#e8a0a8':f2?'#c9a1a8':'#a9bdb9';
  const drawH=h=>{stick(g,{x,y},h,5*k*h.s,'rgba(245,240,228,.8)');sphere(g,h.x,h.y,14*k*h.s,'#ffffff',hc,'rgba(255,255,255,.25)');
    g.fillStyle='#172126';g.font=`700 ${11*k*h.s}px "Segoe UI",sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText('H',h.x,h.y+.5);};
  Hs.filter(h=>h.z<0&&!h.top).forEach(drawH);
  // medallón de carga +1 que orbita
  const ma=t*1.2, mp=proj({x:Math.cos(ma)*58*k,y:-6*k+Math.sin(t*2)*4*k,z:Math.sin(ma)*58*k},x,y);
  const medal=()=>{sphere(g,mp.x,mp.y,10*k*mp.s,'#fff0c0','#b07a20','rgba(255,210,120,.5)');g.fillStyle='#3a2410';g.font=`800 ${14*k*mp.s}px "Segoe UI",sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText('+',mp.x,mp.y+1);};
  if(mp.z<0) medal();
  sphere(g,x,y,38*k,f3?'#ffb0b0':'#b4e2e0',f3?'#6b1c2d':f2?'#6b3c4d':'#2f6f72',f2?'rgba(217,138,143,.35)':'rgba(159,208,207,.35)');
  if(st.flash>0){g.fillStyle=`rgba(255,250,235,${st.flash*.75})`;g.beginPath();g.arc(x,y,38*k,0,TAU);g.fill();}
  if(f3&&!RM){g.strokeStyle='rgba(255,220,150,.8)';g.lineWidth=1.5*k;g.beginPath();g.moveTo(x-30*k,y-8*k);g.lineTo(x-16*k,y+2*k);g.lineTo(x-22*k,y+18*k);g.moveTo(x+28*k,y+14*k);g.lineTo(x+14*k,y+6*k);g.stroke();}
  face(g,x,y-2*k,k,st,{ojo:'real',enojo:f2,boca:st.feliz?'sonrisa':'normal',brillo:f3?'255,80,80':null});
  Hs.filter(h=>h.top).forEach(drawH);
  // corona con inercia (llega un poco tarde al movimiento)
  const cy=y-38*k+(RM?0:Math.sin(t*1.6-.7)*2.5*k)-2*k, tiltc=f3?Math.sin(t*3)*.08:0;
  g.save();g.translate(x,cy);g.rotate(tiltc);
  const gold=g.createLinearGradient(0,-24*k,0,4*k);gold.addColorStop(0,'#fff0b8');gold.addColorStop(.5,'#e3b45c');gold.addColorStop(1,'#8a5a1c');
  g.fillStyle=gold;g.beginPath();g.moveTo(-26*k,2*k);
  [[-28,-16],[-17,-6],[-9,-22],[0,-9],[9,-22],[17,-6],[28,-16],[26,2]].forEach(([px,py])=>g.lineTo(px*k,py*k));g.closePath();g.fill();
  g.strokeStyle='rgba(60,35,10,.6)';g.lineWidth=1.2*k;g.stroke();
  g.fillStyle='rgba(255,255,255,.4)';g.fillRect(-24*k,-3*k,48*k,2*k);
  sphere(g,0,-5*k,4.5*k,'#ffd0d6',f2?'#b0002a':'#c0304a');sphere(g,-14*k,-4*k,3*k,'#d0fff8','#2f8f8a');sphere(g,14*k,-4*k,3*k,'#d0fff8','#2f8f8a');
  for(const [px,py] of [[-28,-16],[-9,-22],[9,-22],[28,-16]])sphere(g,px*k,py*k,2.6*k,'#fffbe6','#d9ac68');
  g.restore();
  Hs.filter(h=>h.z>=0&&!h.top).forEach(drawH);
  if(mp.z>=0) medal();
  g.restore();
};

/* ======================= ARENAS ======================= */
/* G: {hz (horizonte), ex, ey (jefe), bx, by (caja), narrow} */
const sky=(g,W,H,stops)=>{const gr=g.createLinearGradient(0,0,0,H);stops.forEach(([p,c])=>gr.addColorStop(p,c));g.fillStyle=gr;g.fillRect(0,0,W,H);};
function floorPersp(g,W,H,hz,c1,c2,line,rows=9,cols=12){
  const fl=g.createLinearGradient(0,hz,0,H);fl.addColorStop(0,c1);fl.addColorStop(1,c2);g.fillStyle=fl;g.fillRect(0,hz,W,H-hz);
  g.strokeStyle=line;g.lineWidth=1;
  for(let i=1;i<=rows;i++){const y=hz+(H-hz)*Math.pow(i/rows,1.8);g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}
  const vx=W/2,vy=hz-70;for(let i=-cols;i<=cols;i++){const bx=W/2+i*(W/8);g.beginPath();g.moveTo(vx+(bx-vx)*((hz-vy)/(H-vy)),hz);g.lineTo(bx,H);g.stroke();}
}

/* --- 1. Muelle del pantano (noche, faroles, niebla verde) --- */
A.arenas.pantano={
  fijo(g,W,H,G){
    const r=seeded(11), hz=G.hz;
    sky(g,W,H,[[0,'#081722'],[.45,'#123a44'],[hz/H,'#2a5a52'],[1,'#0a1c1f']]);
    for(let i=0;i<70;i++){g.fillStyle=`rgba(245,240,228,${.2+r()*.5})`;g.fillRect(r()*W,r()*hz*.75,1+r()*1.2,1+r()*1.2);}
    // luna
    const mx=W*.8,my=H*.15,mr=Math.min(W,H)*.06;
    glow(g,mx,my,mr*4.5,'220,240,200',.22);
    const mg=g.createRadialGradient(mx-mr*.3,my-mr*.3,mr*.2,mx,my,mr);mg.addColorStop(0,'#fbffe8');mg.addColorStop(1,'#cfe0b4');g.fillStyle=mg;g.beginPath();g.arc(mx,my,mr,0,TAU);g.fill();
    g.fillStyle='rgba(150,170,130,.35)';[[-.3,-.2,.22],[.25,.15,.16],[-.05,.35,.12]].forEach(([a,b,c])=>{g.beginPath();g.arc(mx+a*mr,my+b*mr,c*mr,0,TAU);g.fill();});
    // colinas y árboles lejanos
    for(const [col,base,amp] of [['#0f2a2e',hz-6,1],['#0b2124',hz,.7]]){g.fillStyle=col;g.beginPath();g.moveTo(0,H);g.lineTo(0,base);
      for(let x=0;x<=W;x+=18){const h=(Math.sin(x*.012+amp*3)*16+Math.sin(x*.041)*7+22)*amp;g.lineTo(x,base-h);}g.lineTo(W,H);g.fill();
      for(let i=0;i<14;i++){const tx=r()*W,th=(20+r()*34)*amp;g.beginPath();g.ellipse(tx,base-th*.8,th*.35,th*.6,0,0,TAU);g.fill();g.fillRect(tx-1.5,base-th*.3,3,th*.3);}}
    // palafitos con ventanas cálidas
    const casas=G.narrow?[[W*.13,.9],[W*.86,.8]]:[[W*.1,1],[W*.27,.75],[W*.74,.8],[W*.9,1]];
    for(const [cx,s] of casas){const w=46*s,h=30*s,by=hz-4;
      g.fillStyle='#0d1f22';for(const px of [-w*.4,-w*.1,w*.2,w*.42])g.fillRect(cx+px,by-6,2.5,14);
      g.fillRect(cx-w/2,by-h-6,w,h);g.beginPath();g.moveTo(cx-w/2-5,by-h-6);g.lineTo(cx,by-h-6-h*.7);g.lineTo(cx+w/2+5,by-h-6);g.fill();
      for(const [wx,wy] of [[-.25,.45],[.18,.45]]){glow(g,cx+wx*w,by-h-6+wy*h,16*s,'255,184,92',.35);g.fillStyle='#ffc46e';g.fillRect(cx+wx*w-4*s,by-h-6+wy*h-4*s,8*s,7*s);}}
    // agua
    const wg=g.createLinearGradient(0,hz,0,H);wg.addColorStop(0,'#1d4a4c');wg.addColorStop(.5,'#0f2c30');wg.addColorStop(1,'#071518');g.fillStyle=wg;g.fillRect(0,hz,W,H-hz);
    g.strokeStyle='rgba(160,210,200,.06)';for(let i=0;i<26;i++){const y=hz+4+Math.pow(r(),1.5)*(H-hz);g.beginPath();g.moveTo(r()*W,y);g.lineTo(r()*W,y);g.stroke();}
    // muelle de tablas en perspectiva
    const dTop=G.by-(G.narrow?120:105), dW1=G.narrow?W*.55:W*.42, dW2=W*1.1;
    const tg=g.createLinearGradient(0,dTop,0,H);tg.addColorStop(0,'#4a3220');tg.addColorStop(1,'#2a1a10');g.fillStyle=tg;
    g.beginPath();g.moveTo(W/2-dW1/2,dTop);g.lineTo(W/2+dW1/2,dTop);g.lineTo(W/2+dW2/2,H);g.lineTo(W/2-dW2/2,H);g.closePath();g.fill();
    g.strokeStyle='rgba(20,10,4,.6)';g.lineWidth=1.4;
    for(let i=1;i<14;i++){const u=Math.pow(i/14,1.6),y=dTop+(H-dTop)*u,hw=(dW1+(dW2-dW1)*u)/2;g.beginPath();g.moveTo(W/2-hw,y);g.lineTo(W/2+hw,y);g.stroke();}
    g.strokeStyle='rgba(255,220,170,.06)';for(let i=1;i<14;i++){const u=Math.pow(i/14,1.6),y=dTop+(H-dTop)*u+1.5,hw=(dW1+(dW2-dW1)*u)/2;g.beginPath();g.moveTo(W/2-hw,y);g.lineTo(W/2+hw,y);g.stroke();}
    g.fillStyle='#24160c';for(const s of [-1,1]){for(let i=0;i<4;i++){const u=i/3.5,y=dTop+(H-dTop)*Math.pow(u,1.4),hw=(dW1+(dW2-dW1)*Math.pow(u,1.4))/2;g.fillRect(W/2+s*hw-4-(s>0?4:0),y-24-u*30,8+u*6,26+u*30);}}
    // barriles, cajas, red
    const props=(px,py,s)=>{const bw=26*s,bh=34*s;const bg=g.createLinearGradient(px-bw/2,0,px+bw/2,0);bg.addColorStop(0,'#3a2414');bg.addColorStop(.5,'#7a5030');bg.addColorStop(1,'#2a180c');
      g.fillStyle=bg;rr(g,px-bw/2,py-bh,bw,bh,6*s);g.fill();g.fillStyle='#1b1b1b';g.fillRect(px-bw/2,py-bh*.75,bw,2.5*s);g.fillRect(px-bw/2,py-bh*.3,bw,2.5*s);
      g.fillStyle='#5c3d22';g.fillRect(px+bw*.6,py-24*s,30*s,24*s);g.strokeStyle='#2a1a0e';g.lineWidth=2*s;g.strokeRect(px+bw*.6,py-24*s,30*s,24*s);g.beginPath();g.moveTo(px+bw*.6,py-24*s);g.lineTo(px+bw*.6+30*s,py);g.stroke();
      g.fillStyle='#b8d86b';g.globalAlpha=.8;g.beginPath();g.ellipse(px+bw*.6+15*s,py-28*s,10*s,4*s,.2,0,TAU);g.fill();g.beginPath();g.moveTo(px+bw*.6+24*s,py-28*s);g.lineTo(px+bw*.6+30*s,py-33*s);g.lineTo(px+bw*.6+30*s,py-23*s);g.fill();g.globalAlpha=1;};
    const s0=G.narrow?.8:1;props(W*.1,H*.97,s0*1.2);props(W*.84,H*.99,s0);
    g.strokeStyle='rgba(200,190,160,.25)';g.lineWidth=1;const nx=G.narrow?W*.02:W*.03,ny=H*.52;for(let i=0;i<7;i++){g.beginPath();g.moveTo(nx+i*7,ny);g.quadraticCurveTo(nx+i*7+10,ny+40,nx+i*9,ny+70);g.stroke();g.beginPath();g.moveTo(nx,ny+i*10);g.lineTo(nx+50,ny+i*11);g.stroke();}
  },
  vivo(g,W,H,G,t,ph,dt){
    const S=this.s||(this.s={ff:Array.from({length:RM?6:22},()=>({x:Math.random(),y:rand(.25,.85),p:rand(0,TAU),v:rand(.2,.6)})),rip:[],fog:Array.from({length:5},(_,i)=>({x:Math.random(),y:rand(.45,.8),w:rand(.25,.45),v:rand(.004,.012)*(i%2?1:-1)}))});
    const hz=G.hz;
    // brillo de la luna sobre el agua
    const mx=W*.8;g.save();g.globalCompositeOperation='lighter';
    for(let i=0;i<16;i++){const y=hz+6+i*((H-hz)*.5/16),w=(8+i*2.4)*(1+.3*Math.sin(t*1.8+i*1.3)),a=.16-i*.007;g.fillStyle=`rgba(230,245,200,${a})`;g.fillRect(mx-w/2+Math.sin(t*.9+i)*4,y,w,2);}
    g.restore();
    // ondas en el agua
    if(!RM&&Math.random()<dt*.6)S.rip.push({x:rand(.05,.95)*W,y:rand(hz+10,hz+(H-hz)*.35),r:2,a:.5});
    g.strokeStyle='rgba(200,240,230,.4)';g.lineWidth=1;for(let i=S.rip.length-1;i>=0;i--){const r=S.rip[i];r.r+=dt*14;r.a-=dt*.35;if(r.a<=0){S.rip.splice(i,1);continue;}g.globalAlpha=r.a;g.beginPath();g.ellipse(r.x,r.y,r.r,r.r*.3,0,0,TAU);g.stroke();}
    g.globalAlpha=1;
    // faroles que se mecen
    const posts=G.narrow?[W*.16,W*.84]:[W*.24,W*.76];
    posts.forEach((px,i)=>{const top=G.by-(G.narrow?200:170),bot=G.by+(G.narrow?30:10);g.fillStyle='#22150b';g.fillRect(px-3,top,6,bot-top);g.fillRect(px-3,top,(i?-1:1)*22,4);
      const sw=RM?0:Math.sin(t*1.3+i)*.18,ax=px+(i?-1:1)*20,ay=top+4,lx=ax+Math.sin(sw)*22,ly=ay+Math.cos(sw)*22;
      g.strokeStyle='#120a05';g.lineWidth=1.5;g.beginPath();g.moveTo(ax,ay);g.lineTo(lx,ly-6);g.stroke();
      g.save();g.globalCompositeOperation='lighter';glow(g,lx,ly,70,'255,190,100',.3+.05*Math.sin(t*7+i));g.restore();
      g.fillStyle='#2a1a0c';g.fillRect(lx-7,ly-8,14,3);g.fillRect(lx-6,ly+9,12,3);g.fillStyle='rgba(255,200,120,.9)';g.fillRect(lx-5,ly-5,10,14);
      flame(g,lx,ly+6,.45,t,i*3);
      // reflejo
      g.save();g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,190,100,.08)';g.fillRect(lx-6,G.by+40,12,60+Math.sin(t*2+i)*6);g.restore();});
    // luciérnagas
    g.save();g.globalCompositeOperation='lighter';
    for(const f of S.ff){if(!RM){f.x+=Math.sin(t*f.v+f.p)*dt*.02;f.y+=Math.cos(t*f.v*1.3+f.p)*dt*.015;}const a=.3+.6*Math.max(0,Math.sin(t*2*f.v+f.p));
      glow(g,f.x*W,f.y*H,8,'210,255,120',a*.5);g.fillStyle=`rgba(230,255,170,${a})`;g.fillRect(f.x*W-1,f.y*H-1,2,2);}
    g.restore();
    // juncos en los bordes (se mecen)
    g.strokeStyle='#0a1a12';g.lineCap='round';
    for(let i=0;i<18;i++){const left=i<9,bx=left?(i*W*.012):W-(i-9)*W*.012,h=H*(.22+((i*37)%10)/40),sw=RM?0:Math.sin(t*1.1+i)*8;
      g.lineWidth=2.5;g.beginPath();g.moveTo(bx,H);g.quadraticCurveTo(bx+sw*.3,H-h*.5,bx+sw,H-h);g.stroke();
      if(i%3===0){g.fillStyle='#3a2414';g.beginPath();g.ellipse(bx+sw,H-h,3,9,sw*.02,0,TAU);g.fill();}}
    // niebla verde (más espesa en la fase 2)
    for(const f of S.fog){if(!RM)f.x=((f.x+f.v*dt)%1.6+1.6)%1.6;const fx=(f.x-.3)*W,fy=f.y*H,fw=f.w*W;
      const fg=g.createRadialGradient(fx,fy,0,fx,fy,fw);fg.addColorStop(0,`rgba(170,210,110,${ph>=2?.12:.07})`);fg.addColorStop(1,'rgba(170,210,110,0)');
      g.save();g.translate(fx,fy);g.scale(1,.25);g.translate(-fx,-fy);g.fillStyle=fg;g.fillRect(fx-fw,fy-fw,fw*2,fw*2);g.restore();}
    if(ph>=2){g.fillStyle='rgba(120,160,40,.08)';g.fillRect(0,0,W,H);}
  }
};

/* --- 2. Laboratorio en ruinas (tormenta, bobina de Tesla, estantes de matraces) --- */
A.arenas.laboratorio={
  fijo(g,W,H,G){
    const r=seeded(23), hz=G.hz;
    // pared de azulejos
    sky(g,W,H,[[0,'#121c24'],[hz/H,'#1d2b35'],[1,'#0b1116']]);
    g.strokeStyle='rgba(140,180,200,.07)';g.lineWidth=1;for(let y=0;y<hz;y+=18){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();for(let x=(y/18%2)*12;x<W;x+=24){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+18);g.stroke();}}
    // ventanal en arco detrás del jefe (la tormenta se anima en "vivo")
    const wx=W/2,ww=G.narrow?W*.56:W*.36,wt=G.narrow?H*.04:H*.03,wb=hz-8; this.win={x:wx-ww/2,y:wt,w:ww,h:wb-wt};
    g.fillStyle='#1a1030';g.beginPath();g.moveTo(wx-ww/2,wb);g.lineTo(wx-ww/2,wt+ww/2);g.arc(wx,wt+ww/2,ww/2,Math.PI,0);g.lineTo(wx+ww/2,wb);g.closePath();g.fill();
    // tuberías del techo
    g.fillStyle='#2a3a44';g.fillRect(0,8,W,9);g.fillRect(0,22,W*.4,6);g.fillStyle='#3d5260';for(let x=30;x<W;x+=120){g.fillRect(x,5,10,15);}
    g.strokeStyle='#c46a2a';g.lineWidth=3;g.beginPath();g.arc(W*.62,19,8,0,TAU);g.stroke();
    // pizarra
    const bx=G.narrow?W*.03:W*.05,by=H*.12,bw=G.narrow?W*.22:W*.2,bh=H*.2;
    g.fillStyle='#4a3020';g.fillRect(bx-5,by-5,bw+10,bh+10);g.fillStyle='#1e3a2e';g.fillRect(bx,by,bw,bh);
    g.strokeStyle='rgba(240,240,220,.7)';g.fillStyle='rgba(240,240,220,.75)';g.lineWidth=1.5;g.font=`${G.narrow?10:13}px "Segoe UI",sans-serif`;g.textAlign='left';
    g.fillText('4n + 2 → aromático',bx+8,by+20);g.fillText('4n → ¡antiaromático!',bx+8,by+40);
    g.strokeRect(bx+12,by+bh-38,22,22);g.beginPath();g.moveTo(bx+50,by+bh-20);g.lineTo(bx+70,by+bh-20);g.stroke();hexPath(g,bx+bw-30,by+bh-27,13,0);g.stroke();
    // estantes con matraces de colores
    const shelf=(sx,sw,sy)=>{g.fillStyle='#3a2a1c';g.fillRect(sx,sy,sw,6);g.fillStyle='#24180e';g.fillRect(sx+6,sy+6,4,12);g.fillRect(sx+sw-10,sy+6,4,12);
      const cols=['80,220,255','255,80,170','140,255,120','255,190,70','180,140,255'];let x=sx+8;const items=[];
      while(x<sx+sw-20){const c=cols[Math.floor(r()*cols.length)],w=10+r()*10,h=14+r()*18,typ=Math.floor(r()*3);items.push({x:x+w/2,y:sy,w,h,c,typ});x+=w+5+r()*6;}
      for(const it of items){g.fillStyle=`rgba(${it.c},.75)`;
        if(it.typ===0){g.beginPath();g.moveTo(it.x-it.w*.18,it.y-it.h);g.lineTo(it.x+it.w*.18,it.y-it.h);g.lineTo(it.x+it.w/2,it.y);g.lineTo(it.x-it.w/2,it.y);g.closePath();}
        else if(it.typ===1){g.beginPath();g.arc(it.x,it.y-it.w/2,it.w/2,0,TAU);g.rect(it.x-2,it.y-it.h,4,it.h-it.w*.8);}
        else {g.beginPath();g.rect(it.x-it.w/2.6,it.y-it.h,it.w/1.3,it.h);}
        g.fill();g.strokeStyle='rgba(220,240,255,.45)';g.lineWidth=1;g.stroke();g.fillStyle='rgba(255,255,255,.35)';g.fillRect(it.x-it.w*.25,it.y-it.h*.8,1.5,it.h*.5);}
      return items;};
    this.flasks=[];
    const L=G.narrow?[[W*.02,W*.26]]:[[W*.02,W*.24],[W*.76,W*.22]];
    for(const [sx,sw] of L){for(const sy of [hz*.62,hz*.86]) this.flasks.push(...shelf(sx,sw,sy));}
    if(G.narrow) for(const sy of [hz*.62,hz*.86]) this.flasks.push(...shelf(W*.72,W*.26,sy));
    // piso de baldosas
    floorPersp(g,W,H,hz,'#24323b','#0b1014','rgba(150,200,220,.08)');
    g.fillStyle='rgba(0,0,0,.25)';for(let i=0;i<8;i++){const x=r()*W,y=hz+r()*(H-hz);g.beginPath();g.ellipse(x,y,18+r()*30,4+r()*6,0,0,TAU);g.fill();}
    // franja de peligro
    const hy=hz+4;for(let x=-20;x<W;x+=26){g.fillStyle='#e0b020';g.beginPath();g.moveTo(x,hy);g.lineTo(x+13,hy);g.lineTo(x+21,hy+7);g.lineTo(x+8,hy+7);g.fill();}
    // mesón con mechero y bobina de Tesla
    const mx=G.narrow?W*.02:W*.03,my=G.by-(G.narrow?50:30),mw=G.narrow?W*.24:W*.2;
    g.fillStyle='#3d2c1f';g.fillRect(mx,my,mw,10);g.fillStyle='#22180f';g.fillRect(mx+6,my+10,8,H-my);g.fillRect(mx+mw-14,my+10,8,H-my);
    this.burner={x:mx+mw*.6,y:my};g.fillStyle='#555';g.fillRect(mx+mw*.6-4,my-16,8,16);
    g.strokeStyle='rgba(220,240,255,.5)';g.lineWidth=1.5;g.beginPath();g.arc(mx+mw*.6,my-34,14,0,TAU);g.stroke();g.fillStyle='rgba(80,220,255,.35)';g.beginPath();g.arc(mx+mw*.6,my-34,13,.3,Math.PI-.3);g.fill();
    const tx=G.narrow?W*.9:W*.9,ty=G.by+(G.narrow?20:30);this.tesla={x:tx,y:ty-110};
    g.fillStyle='#2b3138';g.fillRect(tx-14,ty-10,28,14);const cg=g.createLinearGradient(tx-8,0,tx+8,0);cg.addColorStop(0,'#5a3a1a');cg.addColorStop(.5,'#c08040');cg.addColorStop(1,'#5a3a1a');
    g.fillStyle=cg;g.fillRect(tx-7,ty-95,14,86);g.strokeStyle='rgba(60,30,10,.6)';for(let y=ty-92;y<ty-12;y+=4){g.beginPath();g.moveTo(tx-7,y);g.lineTo(tx+7,y);g.stroke();}
    const tg=g.createRadialGradient(tx-6,ty-114,2,tx,ty-110,22);tg.addColorStop(0,'#e8eef4');tg.addColorStop(1,'#56606a');g.fillStyle=tg;g.beginPath();g.ellipse(tx,ty-108,24,10,0,0,TAU);g.fill();
    // cartel
    const sx=G.narrow?W*.9:W*.86,sy=hz*.24;g.fillStyle='#e0b020';g.beginPath();g.moveTo(sx,sy-16);g.lineTo(sx+18,sy+14);g.lineTo(sx-18,sy+14);g.closePath();g.fill();
    g.fillStyle='#1a1a1a';g.font='bold 16px "Segoe UI",sans-serif';g.textAlign='center';g.fillText('!',sx,sy+10);
  },
  vivo(g,W,H,G,t,ph,dt){
    const S=this.s||(this.s={rain:Array.from({length:RM?20:70},()=>({x:Math.random(),y:Math.random(),v:rand(.6,1.1)})),bolt:0,next:3,arcs:[],bub:[],seed:1,sparks:[]});
    const w=this.win;
    if(w){g.save();g.beginPath();g.moveTo(w.x,w.y+w.h);g.lineTo(w.x,w.y+w.w/2);g.arc(w.x+w.w/2,w.y+w.w/2,w.w/2,Math.PI,0);g.lineTo(w.x+w.w,w.y+w.h);g.closePath();g.clip();
      const sg=g.createLinearGradient(0,w.y,0,w.y+w.h);sg.addColorStop(0,'#1a1238');sg.addColorStop(1,'#2d2650');g.fillStyle=sg;g.fillRect(w.x,w.y,w.w,w.h);
      g.fillStyle='rgba(60,50,90,.7)';for(let i=0;i<5;i++){const cx=w.x+((i*.27+t*.01)%1)*w.w,cy=w.y+w.h*.25+i*8;g.beginPath();g.ellipse(cx,cy,w.w*.25,14,0,0,TAU);g.fill();}
      // relámpago suave (máx. uno cada 3 s, sin parpadeo)
      if(!RM){S.next-=dt;if(S.next<=0){S.bolt=1;S.next=rand(3.5,7);S.seed=Math.random()*99;}}
      if(S.bolt>0){g.fillStyle=`rgba(200,200,255,${S.bolt*.35})`;g.fillRect(w.x,w.y,w.w,w.h);
        g.strokeStyle=`rgba(240,240,255,${S.bolt})`;g.lineWidth=2;g.beginPath();let lx=w.x+w.w*(.3+(S.seed%1)*.4),ly=w.y;g.moveTo(lx,ly);
        for(let i=0;i<7;i++){lx+=Math.sin(S.seed+i*2.3)*14;ly+=w.h*.1;g.lineTo(lx,ly);}g.stroke();S.bolt=Math.max(0,S.bolt-dt*1.6);}
      g.strokeStyle='rgba(170,180,230,.35)';g.lineWidth=1;
      for(const d of S.rain){if(!RM){d.y+=d.v*dt*.9;if(d.y>1){d.y=0;d.x=Math.random();}}const x=w.x+d.x*w.w,y=w.y+d.y*w.h;g.beginPath();g.moveTo(x,y);g.lineTo(x-2,y+9);g.stroke();}
      g.restore();
      g.strokeStyle='#2a1c12';g.lineWidth=6;g.beginPath();g.moveTo(w.x,w.y+w.h);g.lineTo(w.x,w.y+w.w/2);g.arc(w.x+w.w/2,w.y+w.w/2,w.w/2,Math.PI,0);g.lineTo(w.x+w.w,w.y+w.h);g.stroke();
      g.lineWidth=3;g.beginPath();g.moveTo(w.x+w.w/2,w.y);g.lineTo(w.x+w.w/2,w.y+w.h);g.moveTo(w.x,w.y+w.h*.55);g.lineTo(w.x+w.w,w.y+w.h*.55);g.stroke();}
    // lámparas colgantes con cono de luz
    for(const [i,lx] of (G.narrow?[W*.25,W*.75]:[W*.22,W*.5,W*.78]).entries()){const sw=RM?0:Math.sin(t*.9+i)*.05,ly=G.narrow?50:40,px=lx+Math.sin(sw)*40;
      g.strokeStyle='#111';g.lineWidth=1.5;g.beginPath();g.moveTo(lx,16);g.lineTo(px,ly);g.stroke();
      g.fillStyle='#2f3b44';g.beginPath();g.moveTo(px-12,ly+8);g.lineTo(px+12,ly+8);g.lineTo(px+5,ly);g.lineTo(px-5,ly);g.fill();
      const fl=ph>=2&&!RM?.75+.25*Math.sin(t*3+i*2):1;g.save();g.globalCompositeOperation='lighter';
      const cg=g.createLinearGradient(0,ly,0,G.hz+40);cg.addColorStop(0,`rgba(255,230,170,${.16*fl})`);cg.addColorStop(1,'rgba(255,230,170,0)');
      g.fillStyle=cg;g.beginPath();g.moveTo(px-10,ly+8);g.lineTo(px+10,ly+8);g.lineTo(px+70,G.hz+40);g.lineTo(px-70,G.hz+40);g.fill();glow(g,px,ly+9,18,'255,230,170',.6*fl);g.restore();}
    // burbujas en los matraces
    if(!RM&&this.flasks&&Math.random()<dt*14){const f=this.flasks[Math.floor(Math.random()*this.flasks.length)];S.bub.push({x:f.x+rand(-2,2),y:f.y-3,top:f.y-f.h-8,c:f.c,a:1});}
    for(let i=S.bub.length-1;i>=0;i--){const b=S.bub[i];b.y-=dt*14;if(b.y<b.top){S.bub.splice(i,1);continue;}g.fillStyle=`rgba(${b.c},.9)`;g.beginPath();g.arc(b.x+Math.sin(b.y*.5)*1.2,b.y,1.6,0,TAU);g.fill();}
    if(this.burner){flame(g,this.burner.x,this.burner.y-16,.5,t,2,'120,170,255');}
    // arcos de la bobina de Tesla (se renuevan suave)
    if(this.tesla){const T=this.tesla;if(!RM&&Math.random()<dt*5)S.arcs.push({a:1,ang:rand(Math.PI*.9,Math.PI*1.9),len:rand(30,70),seed:Math.random()*99});
      g.save();g.globalCompositeOperation='lighter';glow(g,T.x,T.y,50,'120,200,255',.25+(ph>=2?.15:0));
      for(let i=S.arcs.length-1;i>=0;i--){const a=S.arcs[i];a.a-=dt*3;if(a.a<=0){S.arcs.splice(i,1);continue;}
        g.strokeStyle=`rgba(190,230,255,${a.a})`;g.lineWidth=1.6;g.beginPath();let x=T.x,y=T.y;g.moveTo(x,y);
        for(let j=1;j<=6;j++){const u=j/6;x=T.x+Math.cos(a.ang)*a.len*u+Math.sin(a.seed+j*4)*6;y=T.y+Math.sin(a.ang)*a.len*u+Math.cos(a.seed+j*3)*6;g.lineTo(x,y);}g.stroke();}
      g.restore();}
    // chispas de un cable roto
    if(!RM&&Math.random()<dt*(ph>=2?6:2))S.sparks.push({x:W*.62,y:22,vx:rand(-30,30),vy:rand(0,30),a:1});
    for(let i=S.sparks.length-1;i>=0;i--){const s=S.sparks[i];s.vy+=dt*220;s.x+=s.vx*dt;s.y+=s.vy*dt;s.a-=dt*1.2;if(s.a<=0||s.y>H){S.sparks.splice(i,1);continue;}g.fillStyle=`rgba(255,210,120,${s.a})`;g.fillRect(s.x,s.y,2,2);}
    // luz de emergencia giratoria en la fase 2
    if(ph>=2){const a=RM?0:t*2.2;g.save();g.globalCompositeOperation='lighter';g.translate(W*.5,14);g.rotate(Math.sin(a)*.9);
      const eg=g.createLinearGradient(0,0,0,G.hz);eg.addColorStop(0,'rgba(255,90,40,.22)');eg.addColorStop(1,'rgba(255,90,40,0)');g.fillStyle=eg;g.beginPath();g.moveTo(-6,0);g.lineTo(6,0);g.lineTo(90,G.hz);g.lineTo(-90,G.hz);g.fill();g.restore();
      g.fillStyle='rgba(255,60,30,.06)';g.fillRect(0,0,W,H);}
  }
};

/* --- 3. Catedral aromática (rosetón hexagonal, vitrales, velas) --- */
A.arenas.catedral={
  fijo(g,W,H,G){
    const r=seeded(31), hz=G.hz;
    sky(g,W,H,[[0,'#120a24'],[hz/H,'#2a1a4a'],[1,'#0c0716']]);
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
    // columnas góticas con capiteles dorados (en perspectiva)
    const cols2=G.narrow?[[.05,1],[.95,1],[.2,.7],[.8,.7]]:[[.04,1.15],[.96,1.15],[.16,.9],[.84,.9],[.27,.7],[.73,.7]];
    for(const [px,s] of cols2.sort((a,b)=>a[1]-b[1])){const x=W*px,w=22*s,top=0,bot=hz+(H-hz)*(s-.6)*1.1;
      const sg=g.createLinearGradient(x-w,0,x+w,0);sg.addColorStop(0,'#1a1030');sg.addColorStop(.5,'#3c2a66');sg.addColorStop(1,'#140b26');
      g.fillStyle=sg;g.fillRect(x-w,top,w*2,bot-top);g.fillStyle='#d9ac68';g.fillRect(x-w-4*s,hz*.35,w*2+8*s,6*s);g.fillRect(x-w-5*s,bot-8*s,w*2+10*s,8*s);
      g.strokeStyle='rgba(169,139,255,.18)';g.lineWidth=1;for(const f of [-.4,0,.4]){g.beginPath();g.moveTo(x+w*f,hz*.35+8);g.lineTo(x+w*f,bot-10);g.stroke();}}
    // arcos superiores
    g.strokeStyle='#2a1a4a';g.lineWidth=G.narrow?12:16;g.beginPath();g.moveTo(W*.04,H*.5);g.quadraticCurveTo(W*.04,0,W*.5,-H*.05);g.quadraticCurveTo(W*.96,0,W*.96,H*.5);g.stroke();
    // piso de mármol hexagonal
    const fl=g.createLinearGradient(0,hz,0,H);fl.addColorStop(0,'#2a1d44');fl.addColorStop(1,'#0d0818');g.fillStyle=fl;g.fillRect(0,hz,W,H-hz);
    g.strokeStyle='rgba(217,172,104,.12)';g.lineWidth=1;
    for(let row=0;row<9;row++){const u=Math.pow((row+.5)/9,1.6),y=hz+(H-hz)*u,s=6+u*26;for(let x=-s+(row%2)*s*.9;x<W+s;x+=s*1.8){g.save();g.translate(x,y);g.scale(1,.35+u*.25);hexPath(g,0,0,s,Math.PI/6);g.restore();g.stroke();}}
    // alfombra púrpura con borde dorado
    const cw1=G.narrow?W*.26:W*.14,cw2=G.narrow?W*.7:W*.5;g.fillStyle='#4a1a5a';g.beginPath();g.moveTo(W/2-cw1/2,hz);g.lineTo(W/2+cw1/2,hz);g.lineTo(W/2+cw2/2,H);g.lineTo(W/2-cw2/2,H);g.fill();
    g.strokeStyle='#d9ac68';g.lineWidth=2;g.stroke();
    // estandartes y candelabros
    for(const [bx,s] of (G.narrow?[[W*.12,.8],[W*.88,.8]]:[[W*.1,1],[W*.9,1]])){const bw=34*s,bh=80*s,by=H*.08;
      g.fillStyle='#3b1a6a';g.beginPath();g.moveTo(bx-bw/2,by);g.lineTo(bx+bw/2,by);g.lineTo(bx+bw/2,by+bh);g.lineTo(bx,by+bh-12*s);g.lineTo(bx-bw/2,by+bh);g.closePath();g.fill();g.strokeStyle='#d9ac68';g.lineWidth=1.5;g.stroke();
      g.strokeStyle='#d9ac68';hexPath(g,bx,by+bh*.42,9*s,0);g.stroke();g.beginPath();g.arc(bx,by+bh*.42,4.5*s,0,TAU);g.stroke();}
    this.cand=[];
    for(const [cx2,s] of (G.narrow?[[W*.16,.8],[W*.84,.8]]:[[W*.22,1],[W*.78,1]])){const by=G.by-(G.narrow?60:40);
      g.fillStyle='#b88a40';g.fillRect(cx2-3*s,by-60*s,6*s,60*s);g.fillRect(cx2-14*s,by-4,28*s,6);
      for(const dx of [-18,0,18]){g.fillRect(cx2+dx*s-2,by-62*s-(dx?0:8*s),4,6);g.fillStyle='#f0e6d0';g.fillRect(cx2+dx*s-3,by-76*s-(dx?0:8*s),6,14*s);g.fillStyle='#b88a40';this.cand.push({x:cx2+dx*s,y:by-76*s-(dx?0:8*s)});}
      g.strokeStyle='#b88a40';g.lineWidth=3*s;g.beginPath();g.moveTo(cx2-18*s,by-58*s);g.quadraticCurveTo(cx2,by-40*s,cx2+18*s,by-58*s);g.stroke();}
  },
  vivo(g,W,H,G,t,ph,dt){
    const S=this.s||(this.s={dust:Array.from({length:RM?10:40},()=>({x:Math.random(),y:Math.random(),v:rand(.004,.012),p:rand(0,TAU)})),fc:Array.from({length:6},()=>({x:rand(.1,.9),y:rand(.15,.45),p:rand(0,TAU)})),smoke:[]});
    const R=this.rose; if(!R)return;
    // brillo del vitral que late + rayos de luz
    g.save();g.globalCompositeOperation='lighter';
    const rc=ph>=2?'255,80,150':'190,150,255', pul=.5+.15*Math.sin(t*1.4);
    glow(g,R.x,R.y,R.R*1.5,rc,.22*pul+.1);
    const rot=RM?0:t*.03;
    for(let i=0;i<6;i++){const a=Math.PI/2+(i-2.5)*.16+Math.sin(rot+i)*.04;const lg=g.createLinearGradient(R.x,R.y,R.x+Math.cos(a)*H,R.y+Math.sin(a)*H);
      lg.addColorStop(0,`rgba(${i%2?rc:'255,220,150'},${.09+(ph>=2?.04:0)})`);lg.addColorStop(1,`rgba(${rc},0)`);g.fillStyle=lg;
      g.beginPath();g.moveTo(R.x+Math.cos(a-.5)*R.R*.3,R.y+Math.sin(a-.5)*R.R*.3);g.lineTo(R.x+Math.cos(a-.06)*H*1.2,R.y+Math.sin(a-.06)*H*1.2);g.lineTo(R.x+Math.cos(a+.06)*H*1.2,R.y+Math.sin(a+.06)*H*1.2);g.lineTo(R.x+Math.cos(a+.5)*R.R*.3,R.y+Math.sin(a+.5)*R.R*.3);g.fill();}
    // polvo dorado flotando en la luz
    for(const d of S.dust){if(!RM){d.y-=d.v*dt;d.x+=Math.sin(t*.5+d.p)*dt*.004;if(d.y<0){d.y=1;d.x=Math.random();}}
      const a=.25+.3*Math.sin(t*2+d.p);g.fillStyle=`rgba(255,225,160,${a})`;g.fillRect(d.x*W,d.y*H,1.6,1.6);}
    g.restore();
    // velas del candelabro y velas flotantes
    (this.cand||[]).forEach((c,i)=>flame(g,c.x,c.y,.5,t,i));
    for(const [i,f] of S.fc.entries()){const x=f.x*W,y=f.y*H+(RM?0:Math.sin(t*.8+f.p)*8);g.fillStyle='#f0e6d0';g.fillRect(x-3,y,6,14);flame(g,x,y,.45,t,i*5,ph>=2?'255,110,150':null);}
    // humo de incienso
    if(!RM&&Math.random()<dt*3)S.smoke.push({x:G.narrow?W*.5:W*.5+rand(-W*.3,W*.3),y:G.hz+20,a:.25,r:6});
    for(let i=S.smoke.length-1;i>=0;i--){const s=S.smoke[i];s.y-=dt*16;s.x+=Math.sin(s.y*.05)*.3;s.r+=dt*6;s.a-=dt*.05;if(s.a<=0){S.smoke.splice(i,1);continue;}
      g.fillStyle=`rgba(200,180,240,${s.a*.3})`;g.beginPath();g.arc(s.x,s.y,s.r,0,TAU);g.fill();}
    if(ph>=2){g.fillStyle='rgba(140,10,60,.08)';g.fillRect(0,0,W,H);}
  }
};

/* --- 4. Salón del trono (trono dorado, alfombra roja, candelabros, vitral eclipse) --- */
A.arenas.trono={
  fijo(g,W,H,G){
    const r=seeded(41), hz=G.hz;
    sky(g,W,H,[[0,'#0c1a26'],[hz/H,'#173040'],[1,'#081016']]);
    // paneles de pared con molduras doradas
    g.strokeStyle='rgba(217,172,104,.22)';g.lineWidth=2;for(let x=W*.02;x<W;x+=W*(G.narrow?.24:.12)){g.strokeRect(x,hz*.3,W*(G.narrow?.2:.1),hz*.62);}
    // ventanales laterales con noche estrellada
    for(const wx of (G.narrow?[W*.08]:[W*.08,W*.92-W*.08]).concat(G.narrow?[W*.84]:[])){const ww=G.narrow?W*.08:W*.08,wt=hz*.12,wh=hz*.6;
      g.fillStyle='#0b1430';g.beginPath();g.moveTo(wx,wt+wh);g.lineTo(wx,wt+ww/2);g.arc(wx+ww/2,wt+ww/2,ww/2,Math.PI,0);g.lineTo(wx+ww,wt+wh);g.fill();
      for(let i=0;i<12;i++){g.fillStyle=`rgba(255,255,240,${.3+r()*.6})`;g.fillRect(wx+r()*ww,wt+ww*.3+r()*(wh-ww*.3),1.4,1.4);}
      g.strokeStyle='#d9ac68';g.lineWidth=2;g.stroke();g.beginPath();g.moveTo(wx+ww/2,wt);g.lineTo(wx+ww/2,wt+wh);g.stroke();}
    // gran vitral circular (eclipse) detrás del trono
    const ex=G.ex, ey=G.ey-(G.narrow?10:16), ER=G.narrow?W*.24:Math.min(H*.3,W*.17); this.eclipse={x:ex,y:ey,R:ER};
    g.fillStyle='#0a0f14';g.beginPath();g.arc(ex,ey,ER*1.08,0,TAU);g.fill();
    // trono
    const tw=G.narrow?W*.36:W*.2, tb=hz+(G.narrow?14:10), tt=G.ey-(G.narrow?95:110);
    const tg=g.createLinearGradient(ex-tw/2,0,ex+tw/2,0);tg.addColorStop(0,'#6a4416');tg.addColorStop(.5,'#e3b45c');tg.addColorStop(1,'#6a4416');
    g.fillStyle=tg;g.beginPath();g.moveTo(ex-tw/2,tb);g.lineTo(ex-tw/2,tt+40);g.lineTo(ex-tw*.32,tt+10);g.lineTo(ex-tw*.16,tt+26);g.lineTo(ex,tt-14);g.lineTo(ex+tw*.16,tt+26);g.lineTo(ex+tw*.32,tt+10);g.lineTo(ex+tw/2,tt+40);g.lineTo(ex+tw/2,tb);g.closePath();g.fill();
    g.strokeStyle='rgba(60,35,10,.7)';g.lineWidth=2;g.stroke();
    g.fillStyle='#7a1f35';rr(g,ex-tw*.36,tt+44,tw*.72,tb-tt-60,10);g.fill();g.strokeStyle='#d9ac68';g.lineWidth=2;g.stroke();
    g.fillStyle='#5a1426';rr(g,ex-tw*.42,tb-30,tw*.84,22,6);g.fill();g.stroke();
    // emblema NH₄⁺
    g.fillStyle='#fff0c0';g.font=`700 ${G.narrow?12:14}px "Segoe UI",sans-serif`;g.textAlign='center';g.fillText('NH₄⁺',ex,tt+8);
    // escalones (estrado)
    for(let i=0;i<3;i++){const w=tw*(1.25+i*.25),y=tb+i*7;g.fillStyle=i%2?'#3a2a22':'#4a3628';g.fillRect(ex-w/2,y,w,7);g.fillStyle='rgba(217,172,104,.5)';g.fillRect(ex-w/2,y,w,1.5);}
    // piso de mármol en damero
    const fl=g.createLinearGradient(0,hz,0,H);fl.addColorStop(0,'#1e2f38');fl.addColorStop(1,'#091116');g.fillStyle=fl;g.fillRect(0,hz+21,W,H-hz-21);
    for(let row=0;row<10;row++){const u0=Math.pow(row/10,1.7),u1=Math.pow((row+1)/10,1.7),y0=hz+21+(H-hz-21)*u0,y1=hz+21+(H-hz-21)*u1;
      for(let c=-10;c<10;c++){if((row+c)%2)continue;const vx=W/2,vy=hz-60,X=b=>vx+(W/2+b*(W/7)-vx)*((y0-vy)/(H-vy));const X1=b=>vx+(W/2+b*(W/7)-vx)*((y1-vy)/(H-vy));
        g.fillStyle='rgba(159,208,207,.05)';g.beginPath();g.moveTo(X(c),y0);g.lineTo(X(c+1),y0);g.lineTo(X1(c+1),y1);g.lineTo(X1(c),y1);g.fill();}}
    // alfombra roja con borde dorado
    const cw1=tw*.7,cw2=G.narrow?W*.8:W*.55,ct=tb+21;g.fillStyle='#8a1f35';g.beginPath();g.moveTo(ex-cw1/2,ct);g.lineTo(ex+cw1/2,ct);g.lineTo(W/2+cw2/2,H);g.lineTo(W/2-cw2/2,H);g.closePath();g.fill();
    g.strokeStyle='#e3b45c';g.lineWidth=3;g.stroke();g.strokeStyle='rgba(227,180,92,.4)';g.lineWidth=1;g.beginPath();g.moveTo(ex-cw1*.4,ct);g.lineTo(W/2-cw2*.42,H);g.moveTo(ex+cw1*.4,ct);g.lineTo(W/2+cw2*.42,H);g.stroke();
    // columnas con bandas doradas
    for(const [px,s] of (G.narrow?[[.03,1],[.97,1]]:[[.03,1.1],[.97,1.1],[.2,.85],[.8,.85]])){const x=W*px,w=18*s,bot=hz+(H-hz)*(s-.6)*1.3;
      const sg=g.createLinearGradient(x-w,0,x+w,0);sg.addColorStop(0,'#10202a');sg.addColorStop(.5,'#2a4656');sg.addColorStop(1,'#0c171e');g.fillStyle=sg;g.fillRect(x-w,0,w*2,bot);
      g.fillStyle='#d9ac68';for(const yy of [hz*.3,hz*.7]){g.fillRect(x-w-3,yy,w*2+6,5*s);}g.fillRect(x-w-5,bot-8,w*2+10,8);
      // cristales a los pies
      for(let i=0;i<3;i++){const cx=x+(i-1)*10*s,ch=(16+i%2*10)*s;const cg=g.createLinearGradient(cx,bot-ch,cx,bot);cg.addColorStop(0,'#d0fff8');cg.addColorStop(1,'#2f8f8a');g.fillStyle=cg;
        g.beginPath();g.moveTo(cx,bot-ch-8);g.lineTo(cx+5*s,bot-ch*.4);g.lineTo(cx,bot);g.lineTo(cx-5*s,bot-ch*.4);g.fill();}}
    // estandartes azules con N dorada
    for(const bx of (G.narrow?[W*.2,W*.8]:[W*.3,W*.7])){const bw=G.narrow?24:30,bh=G.narrow?64:84,by=H*.03;
      g.fillStyle='#1f3a6e';g.beginPath();g.moveTo(bx-bw/2,by);g.lineTo(bx+bw/2,by);g.lineTo(bx+bw/2,by+bh);g.lineTo(bx,by+bh-12);g.lineTo(bx-bw/2,by+bh);g.closePath();g.fill();
      g.strokeStyle='#d9ac68';g.lineWidth=1.5;g.stroke();g.fillStyle='#e3b45c';g.font=`700 ${G.narrow?14:18}px "Iowan Old Style",Georgia,serif`;g.textAlign='center';g.fillText('N',bx,by+bh*.48);}
  },
  vivo(g,W,H,G,t,ph,dt){
    const S=this.s||(this.s={emb:Array.from({length:RM?10:36},()=>({x:Math.random(),y:Math.random(),v:rand(.02,.06),p:rand(0,TAU)}))});
    const E=this.eclipse; if(!E)return;
    // eclipse que late (rojo desde la fase 2)
    const cc=ph>=3?'255,70,70':ph>=2?'230,120,130':'243,217,166';
    g.save();g.globalCompositeOperation='lighter';
    g.translate(E.x,E.y);g.rotate(RM?0:t*.05);
    for(let i=0;i<10;i++){const a=i/10*TAU;g.fillStyle=`rgba(${cc},${.04+.02*Math.sin(t+i)})`;g.beginPath();g.moveTo(Math.cos(a-.06)*E.R,Math.sin(a-.06)*E.R);g.lineTo(Math.cos(a)*E.R*2.6,Math.sin(a)*E.R*2.6);g.lineTo(Math.cos(a+.06)*E.R,Math.sin(a+.06)*E.R);g.fill();}
    g.restore();
    const co=g.createRadialGradient(E.x,E.y,E.R*.9,E.x,E.y,E.R*1.7*(1+(RM?0:Math.sin(t*1.3)*.03)));co.addColorStop(0,`rgba(${cc},.6)`);co.addColorStop(.3,`rgba(${cc},.18)`);co.addColorStop(1,`rgba(${cc},0)`);
    g.fillStyle=co;g.beginPath();g.arc(E.x,E.y,E.R*1.8,0,TAU);g.fill();
    const dk=g.createRadialGradient(E.x-E.R*.25,E.y-E.R*.25,E.R*.1,E.x,E.y,E.R);dk.addColorStop(0,'#16232a');dk.addColorStop(1,'#070b0d');g.fillStyle=dk;g.beginPath();g.arc(E.x,E.y,E.R,0,TAU);g.fill();
    g.strokeStyle=`rgba(${cc},.9)`;g.lineWidth=1.8;g.stroke();
    // candelabros colgantes que se mecen
    for(const [i,cx] of (G.narrow?[W*.22,W*.78]:[W*.2,W*.8]).entries()){const sw=RM?0:Math.sin(t*.8+i*1.7)*.04,ly=G.narrow?H*.1:H*.16,px=cx+Math.sin(sw)*ly;
      g.strokeStyle='#8a6a30';g.lineWidth=1.5;g.beginPath();g.moveTo(cx,0);g.lineTo(px,ly);g.stroke();
      g.strokeStyle='#d9ac68';g.lineWidth=3;g.beginPath();g.ellipse(px,ly+6,26,7,0,0,TAU);g.stroke();
      for(let j=0;j<5;j++){const a=j/5*TAU+.3,vx=px+Math.cos(a)*26,vy=ly+6+Math.sin(a)*7;g.fillStyle='#f0e6d0';g.fillRect(vx-2,vy-10,4,10);flame(g,vx,vy-10,.38,t,i*7+j);}}
    // braseros
    for(const [i,bx] of (G.narrow?[W*.1,W*.9]:[W*.12,W*.88]).entries()){const by=G.by-(G.narrow?90:70);
      g.fillStyle='#2a1c12';g.fillRect(bx-4,by,8,(G.narrow?110:90));g.fillStyle='#b88a40';g.beginPath();g.moveTo(bx-16,by-6);g.lineTo(bx+16,by-6);g.lineTo(bx+9,by+5);g.lineTo(bx-9,by+5);g.fill();
      flame(g,bx,by-6,1.1,t,i*4,ph>=3?'255,90,80':null);}
    // brasas doradas que suben (rojas al final)
    g.save();g.globalCompositeOperation='lighter';
    for(const e of S.emb){if(!RM){e.y-=e.v*dt*(1+ph*.4);if(e.y<-.05){e.y=1.05;e.x=Math.random();}}
      const a=.3+.4*Math.sin(t*3+e.p);g.fillStyle=ph>=3?`rgba(255,110,80,${a})`:`rgba(255,215,140,${a})`;g.beginPath();g.arc(e.x*W+Math.sin(t+e.p)*8,e.y*H,1.4,0,TAU);g.fill();}
    g.restore();
    if(ph>=2){g.fillStyle=`rgba(120,10,30,${ph>=3?.14:.08})`;g.fillRect(0,0,W,H);}
  }
};

/* Cache de la parte fija de cada arena */
const cache={};
A.pintarArena=function(id,g,W,H,G,k,t,ph,dt){
  const ar=A.arenas[id]; if(!ar) return;
  // una sola copia por arena: si cambia el tamaño, se vuelve a pintar (y se recalculan sus posiciones)
  const key=W+'|'+H+'|'+k;
  if(!cache[id]||cache[id].key!==key){const c=document.createElement('canvas');c.width=Math.round(W*k);c.height=Math.round(H*k);const cg=c.getContext('2d');cg.setTransform(k,0,0,k,0,0);ar.s=null;ar.fijo(cg,W,H,G);cache[id]={key,c};}
  g.drawImage(cache[id].c,0,0,W,H);
  ar.vivo(g,W,H,G,t,ph,dt);
};
})();
