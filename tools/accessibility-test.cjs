const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require('playwright');

const dist=path.resolve(__dirname,'..','dist');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml',
  '.png':'image/png','.webp':'image/webp','.json':'application/json','.wasm':'application/wasm'};
const server=http.createServer((request,response)=>{
  const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
  const file=path.resolve(dist,`./${pathname==='/'?'index.html':pathname.slice(1)}`);
  if(!file.startsWith(`${dist}${path.sep}`)){response.writeHead(403).end();return;}
  fs.readFile(file,(error,data)=>error?response.writeHead(404).end():
    response.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'}).end(data));
});

(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch(process.env.PLAYWRIGHT_EXECUTABLE_PATH
    ? {executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:['--no-sandbox'],headless:true}
    : {channel:process.env.PLAYWRIGHT_CHANNEL||'msedge',headless:true});
  const issues=[];
  try{
    const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
    for(const route of ['home','learn','train','games','lesson/org-01','hub/calendar','hub/grades','shop','profile']){
      await page.goto(`http://127.0.0.1:${server.address().port}/#/${route}`);
      await page.locator('main#app').waitFor();
      await page.waitForTimeout(120);
      const result=await page.evaluate(()=>{
        const visible=el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);
          return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none';};
        const label=el=>el.getAttribute('aria-label')||el.getAttribute('title')||
          el.labels?.[0]?.textContent||el.closest('label')?.textContent||el.textContent||
          (el.tagName==='IMG'?el.getAttribute('alt'):null);
        const unnamed=[...document.querySelectorAll('button,a,input,select,textarea,[role="button"]')]
          .filter(visible).filter(el=>!String(label(el)||'').trim())
          .map(el=>`${el.tagName.toLowerCase()}${el.className?'.'+String(el.className).split(' ')[0]:''}`);
        const missingAlt=[...document.querySelectorAll('img')].filter(visible)
          .filter(el=>!el.hasAttribute('alt')).map(el=>el.currentSrc.split('/').at(-1));
        return {unnamed,missingAlt,overflow:document.documentElement.scrollWidth-innerWidth,
          mainCount:document.querySelectorAll('main').length};
      });
      if(result.unnamed.length)issues.push(`${route}: controles sin nombre: ${result.unnamed.join(', ')}`);
      if(result.missingAlt.length)issues.push(`${route}: imágenes sin alt: ${result.missingAlt.join(', ')}`);
      if(result.overflow>1)issues.push(`${route}: desbordamiento horizontal ${result.overflow}px`);
      if(result.mainCount!==1)issues.push(`${route}: ${result.mainCount} elementos main`);
    }
    await page.goto(`http://127.0.0.1:${server.address().port}/#/home`);
    await page.locator('.rpg-stage').waitFor();
    await page.evaluate(()=>document.documentElement.style.fontSize='200%');
    const zoomOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    if(zoomOverflow>1)issues.push(`Home con texto a 200%: desbordamiento ${zoomOverflow}px`);
    await page.keyboard.press('Tab');
    const focused=await page.evaluate(()=>document.activeElement?.tagName);
    assert.notEqual(focused,'BODY','La navegación con Tab no alcanza un control.');
    assert.deepEqual(issues,[],issues.join('\n'));
    console.log('Accesibilidad básica: nombres, alt, landmarks, teclado y texto 200% OK.');
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
