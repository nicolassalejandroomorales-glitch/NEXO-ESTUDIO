/* Original accessory shapes composed over the mascot; no combination sprites. */
(() => {
  const esc=value=>String(value).replace(/[^a-z0-9-]/gi,'');
  function svg(item,species='pig') {
    const seed=[...item.id].reduce((n,c)=>n+c.charCodeAt(0),0);
    const palette=['#73d9cd','#e4ac75','#af92e9','#d78493','#f0d590','#78aad4'];
    const tone=palette[seed%palette.length],dark='#1f2535',light='#f9e9c8';
    const shift=species==='cat'?-7:species==='dog'?5:0;
    const paths={
      head:`<path d="M252 ${155+shift} Q262 ${100+shift} 335 ${101+shift} Q397 ${101+shift} 421 ${154+shift} L419 ${172+shift} Q335 ${145+shift} 252 ${172+shift}Z" fill="${dark}" stroke="${light}" stroke-width="6"/><path d="M266 ${150+shift} Q336 ${127+shift} 409 ${150+shift}" fill="none" stroke="${tone}" stroke-width="12"/><path d="M329 ${127+shift} l12 -18 12 18 -12 17z" fill="${tone}"/>`,
      face:`<path d="M344 237 Q375 214 399 237 M405 231 Q425 219 446 239" fill="none" stroke="${tone}" stroke-width="10" stroke-linecap="round"/><circle cx="405" cy="235" r="9" fill="${light}" stroke="${dark}" stroke-width="4"/>`,
      shirt:`<path d="M326 320 L350 345 L392 333 L442 362 L461 421 L433 436 L430 519 Q374 541 320 514 L311 425 L292 432 L293 370 Z" fill="${dark}" stroke="${light}" stroke-width="6"/><path d="M344 355 Q385 382 428 352 M342 483 Q378 496 420 483" fill="none" stroke="${tone}" stroke-width="12"/><path d="M381 393 l18 18 -18 18 -18 -18z" fill="${tone}"/>`,
      back:`<path d="M238 351 Q216 366 206 415 L207 487 Q243 504 280 482 L285 387 Q271 360 238 351Z" fill="${dark}" stroke="${light}" stroke-width="7"/><path d="M219 400 Q242 417 278 401 M232 454 L258 454" fill="none" stroke="${tone}" stroke-width="12"/>`,
      tail:`<path d="M218 451 Q144 461 134 413 Q120 359 176 335" fill="none" stroke="${dark}" stroke-width="34" stroke-linecap="round"/><path d="M218 451 Q144 461 134 413 Q120 359 176 335" fill="none" stroke="${tone}" stroke-width="24" stroke-linecap="round"/>`,
      aura:`<ellipse cx="333" cy="314" rx="199" ry="256" fill="none" stroke="${tone}" stroke-width="9" opacity=".7" stroke-dasharray="22 16"/><path d="M139 330 l-17 -20 -17 20 17 20z M520 219 l-13 -17 -13 17 13 17z M488 488 l-14 -18 -14 18 14 18z" fill="${light}" stroke="${tone}" stroke-width="5"/>`
    };
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="640" height="640" aria-hidden="true" data-item="${esc(item.id)}">${paths[item.slot]||''}</svg>`;
  }
  const crops={head:'215 65 270 165',face:'320 165 150 130',shirt:'260 285 230 270',
    back:'160 305 160 215',tail:'90 300 160 210',aura:'95 35 460 565'};
  function thumbnail(item,species='pig') {
    return svg(item,species).replace('viewBox="0 0 640 640"',`viewBox="${crops[item.slot]||'0 0 640 640'}"`)
      .replace('width="640" height="640"','class="forge-item-art"');
  }
  window.NexoVectorArt={svg,thumbnail};
})();
