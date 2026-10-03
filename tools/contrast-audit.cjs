// Mide el contraste (WCAG) del texto en las pantallas principales. Requiere el servidor en :8765 y playwright.
// Uso: node tools/contrast-audit.cjs home learn practice/exercises ...
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const routes=process.argv.slice(2).length?process.argv.slice(2):['home','learn','subject/organica','train','practice/exercises','practice/guides','practice/errors','practice/exams','practice/labs','games','profile','hub/calendar','hub/timer','shop','settings','stats','knowledge','reviews','lesson/org-01'];
const fn=()=>{
 const parse=c=>{const m=c.match(/rgba?\(([^)]+)\)/);if(!m)return null;const [r,g,b,a=1]=m[1].split(/[ ,\/]+/).filter(Boolean).map(Number);return {r,g,b,a}};
 const lum=({r,g,b})=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(r)+.7152*f(g)+.0722*f(b)};
 const blend=(f,b)=>({r:f.r*f.a+b.r*(1-f.a),g:f.g*f.a+b.g*(1-f.a),b:f.b*f.a+b.b*(1-f.a),a:1});
 function bgOf(el){const st=[];for(let e=el;e;e=e.parentElement){const c=parse(getComputedStyle(e).backgroundColor);if(c&&c.a>0){st.push(c);if(c.a>=1)break}}
  let base={r:18,g:26,b:22,a:1};for(let i=st.length-1;i>=0;i--)base=blend(st[i],base);return base}
 const out=[];
 for(const el of document.querySelectorAll('#app *')){
  const own=[...el.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim()).map(n=>n.textContent.trim()).join(' ');
  if(!own)continue;const cs=getComputedStyle(el),r=el.getBoundingClientRect();
  if(r.width<2||r.height<2||cs.visibility==='hidden'||cs.display==='none')continue;
  let op=1;for(let e=el;e;e=e.parentElement)op*=+getComputedStyle(e).opacity; if(op<.9)continue; // salta animaciones a medias
  const fg=parse(cs.color);if(!fg)continue;const bg=bgOf(el),f=blend({...fg,a:fg.a*op},bg);
  const L1=lum(f),L2=lum(bg),ratio=(Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);
  const size=parseFloat(cs.fontSize),large=size>=24||(size>=18.66&&+cs.fontWeight>=700);
  if(ratio<(large?3:4.5))out.push({ratio:+ratio.toFixed(2),sel:el.tagName.toLowerCase()+(typeof el.className==='string'&&el.className?'.'+el.className.trim().split(/\s+/).join('.'):''),txt:own.slice(0,40),fg:cs.color,bg:`rgb(${bg.r|0},${bg.g|0},${bg.b|0})`});
 }
 return out;
};
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 const p=await b.newPage({viewport:{width:1440,height:900}});const all={};
 for(const r of routes){await p.goto('http://127.0.0.1:8765/#/'+r);await p.waitForTimeout(3600);
  for(const x of await p.evaluate(fn)){const k=x.sel+'|'+x.fg+'|'+x.bg;(all[k]=all[k]||{...x,routes:new Set()}).routes.add(r)}}
 const list=Object.values(all).sort((a,b)=>a.ratio-b.ratio);
 console.log('problemas de contraste:',list.length);
 for(const x of list)console.log(x.ratio,x.sel,'"'+x.txt+'"',x.fg,'/',x.bg,'·',[...x.routes].join(','));
 await b.close(); process.exit(list.length?1:0);
})();
