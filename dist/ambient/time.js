/* Ambient light follows local time with a five-minute update, never a permanent RAF loop. */
(() => {
  'use strict';
  const stops=[
    [0,[24,33,49]],[5,[36,46,64]],[7,[116,108,94]],
    [10,[146,160,146]],[16,[151,155,132]],[18,[173,122,101]],
    [20,[76,67,81]],[24,[24,33,49]]
  ];
  let interval=null;
  const mix=(a,b,t)=>a.map((value,index)=>Math.round(value+(b[index]-value)*t));
  function colorAt(hour) {
    const h=((Number(hour)||0)%24+24)%24;
    for(let i=1;i<stops.length;i+=1)if(h<=stops[i][0]) {
      const [start,a]=stops[i-1], [end,b]=stops[i];
      return mix(a,b,(h-start)/(end-start));
    }
    return stops[0][1];
  }
  function update(at=new Date()) {
    const hour=at.getHours()+at.getMinutes()/60;
    const [r,g,b]=colorAt(hour);
    document.body.style.setProperty('--ambient-rgb',`${r} ${g} ${b}`);
    document.body.dataset.nexoTime=hour<6?'night':hour<10?'morning':hour<17?'day':hour<20?'dusk':'night';
    document.body.classList.toggle('ambient-paused',document.hidden);
  }
  function start() {
    if(interval)return;
    update();
    interval=setInterval(()=>{if(!document.hidden)update();},300000);
    document.addEventListener('visibilitychange',()=>update());
  }
  window.NexoAmbientTime=Object.freeze({colorAt,update,start});
})();
