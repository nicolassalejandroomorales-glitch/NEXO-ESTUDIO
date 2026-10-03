const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const zlib=require('node:zlib');
const {chromium}=require('playwright');
const dist=path.resolve(__dirname,'..','dist');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml',
  '.webp':'image/webp','.png':'image/png','.wasm':'application/wasm','.json':'application/json'};
const server=http.createServer((request,response)=>{
  const target=path.resolve(dist,'.'+(new URL(request.url,'http://localhost').pathname==='/'?'/index.html':
    decodeURIComponent(new URL(request.url,'http://localhost').pathname)));
  if(!target.startsWith(dist+path.sep)){response.writeHead(403).end();return;}
  fs.readFile(target,(error,data)=>{
    if(error){response.writeHead(404).end();return;}
    const type=mime[path.extname(target)]||'application/octet-stream';
    if(/text\/|javascript|json|svg/.test(type)&&/gzip/.test(request.headers['accept-encoding']||'')){
      response.writeHead(200,{'Content-Type':type,'Content-Encoding':'gzip','Vary':'Accept-Encoding'})
        .end(zlib.gzipSync(data));return;
    }
    response.writeHead(200,{'Content-Type':type}).end(data);
  });
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch(process.env.PLAYWRIGHT_EXECUTABLE_PATH
    ? {executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:['--no-sandbox'],headless:true}
    : {channel:process.env.PLAYWRIGHT_CHANNEL||'msedge',headless:true});
  const motion=process.env.NEXO_MOTION==='full'?'no-preference':'reduce';
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,
    reducedMotion:motion});
  const page=await context.newPage();
  try{
    const cdp=await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
    await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:100,
      downloadThroughput:2*1024*1024/8,uploadThroughput:750*1024/8});
    await page.addInitScript(()=>{
      window.__vitals={lcp:0,lcpElement:'',lcpText:'',cls:0,events:[]};
      new PerformanceObserver(list=>{for(const item of list.getEntries()){
        window.__vitals.lcp=item.startTime;
        window.__vitals.lcpElement=item.element?.tagName?.toLowerCase()+'.'+String(item.element?.className||'').split(' ')[0];
        window.__vitals.lcpText=String(item.element?.textContent||'').trim().slice(0,100);
      }})
        .observe({type:'largest-contentful-paint',buffered:true});
      new PerformanceObserver(list=>{for(const item of list.getEntries())if(!item.hadRecentInput)
        window.__vitals.cls+=item.value;}).observe({type:'layout-shift',buffered:true});
      try{new PerformanceObserver(list=>{for(const item of list.getEntries())
        window.__vitals.events.push(item.duration);}).observe({type:'event',durationThreshold:16,buffered:true});}
      catch(_) { /* Event Timing unavailable in some browsers. */ }
    });
    const started=Date.now();
    await page.goto(`http://127.0.0.1:${server.address().port}/#/home`,{waitUntil:'domcontentloaded'});
    await page.locator('.rpg-stage').waitFor();
    const visibleMs=Date.now()-started;
    await page.waitForTimeout(1800);
    await page.locator('[data-route="learn"]').last().click();
    await page.locator('.subject-card').first().waitFor();
    const result=await page.evaluate(()=>({
      lcp:window.__vitals.lcp,lcpElement:window.__vitals.lcpElement,lcpText:window.__vitals.lcpText,cls:window.__vitals.cls,
      maxObservedEvent:Math.max(0,...window.__vitals.events),
      resourceBytes:performance.getEntriesByType('resource').reduce((sum,item)=>sum+(item.transferSize||0),0),
      navigation:performance.getEntriesByType('navigation')[0]?.toJSON(),
      memory:performance.memory?.usedJSHeapSize||null
    }));
    console.log(JSON.stringify({profile:`mobile 390x844, 4x CPU, 2 Mbps, 100 ms RTT, motion=${motion}`,
      firstVisibleMs:visibleMs,lcpMs:Math.round(result.lcp),lcpElement:result.lcpElement,lcpText:result.lcpText,
      cls:Number(result.cls.toFixed(3)),
      maxObservedEventMs:result.maxObservedEvent,transferKB:Math.round(result.resourceBytes/1024),
      memoryMB:result.memory&&Math.round(result.memory/1048576)},null,2));
    if(result.lcp>=2500||result.cls>=0.1)process.exitCode=1;
  } finally {await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
