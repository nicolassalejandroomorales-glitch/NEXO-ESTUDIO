const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');

const created=[];
const listeners={};
const document={hidden:false,addEventListener(name,fn){listeners[name]=fn;}};
class Howl {
  constructor(options){this.options=options;this.playing=false;this.unloaded=false;created.push(this);}
  play(){this.playing=true;}
  stop(){this.playing=false;}
  unload(){this.unloaded=true;this.playing=false;}
  volume(value){this.options.volume=value;}
}
const window={Howl,NexoLoader:{script:async()=>{}}};
const context={window,document,Uint8Array,Int16Array,DataView,Math,Number,Object,
  btoa:value=>Buffer.from(value,'binary').toString('base64')};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/platform/audio.js'),'utf8'),context);
const audio=window.NexoAudio;
const tick=async()=>{await Promise.resolve();await Promise.resolve();await new Promise(resolve=>setImmediate(resolve));};
(async()=>{
  assert.equal(audio.settings.gesture,false);
  audio.configure({ambient:true,music:true,sound:true});
  audio.setRoom(['home']);await tick();
  assert.equal(created.length,0,'no autoplay before gesture');
  audio.activate();await tick();
  assert.equal(created.filter(item=>item.options.loop).length,2);
  assert.equal(audio.settings.ambientPlaying,true);
  assert.equal(audio.settings.musicPlaying,true);
  audio.setRoom(['lesson','org-01']);await tick();
  assert.equal(audio.settings.ambientPlaying,false,'lessons remain quiet');
  assert.equal(audio.settings.musicPlaying,false,'music stops in lessons');
  audio.setRoom(['train']);await tick();
  assert.equal(audio.settings.ambientPlaying,true);
  audio.configure({ambient:true,music:false,sound:false,ambientVolume:.2});await tick();
  assert.equal(audio.settings.ambientPlaying,true);
  assert.equal(audio.settings.musicPlaying,false);
  document.hidden=true;listeners.visibilitychange();await tick();
  assert.equal(audio.settings.ambientPlaying,false,'hidden tabs must stop loops');
  document.hidden=false;listeners.visibilitychange();await tick();
  assert.equal(audio.settings.ambientPlaying,true);
  audio.dispose();assert.equal(audio.settings.ambientPlaying,false);
  assert.equal(created.filter(item=>item.options.loop).every(item=>item.unloaded),true);
  console.log('Audio: opt-in, canales separados, habitaciones, silencio académico y pausa oculta OK');
})().catch(error=>{console.error(error);process.exitCode=1;});
