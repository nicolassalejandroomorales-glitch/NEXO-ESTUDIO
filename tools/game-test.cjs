const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const loads=[];
const ctx={URLSearchParams,location:{search:''},window:{NexoLoader:{async script(path){loads.push(path);}},Phaser:{}}};
vm.runInNewContext(fs.readFileSync('dist/game/manager.js','utf8'),ctx);
const manager=ctx.window.NexoGame;
assert.equal(loads.length,0,'Phaser stays out of startup');
assert.equal(manager.registered().length,0,'technical scene is hidden normally');
let destroyed=0,paused=0,resumed=0;
manager.registerGame('test',()=>({scene:{pause(){paused++;},resume(){resumed++;}},destroy(){destroyed++;}}));
(async()=>{
  await manager.loadGame('test',{});
  assert.equal(loads[0],'./vendor/phaser/phaser.min.js');
  manager.pauseGame();manager.resumeGame();manager.destroyGame();
  assert.equal(paused,1);assert.equal(resumed,1);assert.equal(destroyed,1);
  assert.equal(manager.registered().length,1);
  console.log('OK: Phaser lazy, registro, pausa, reanudación y liberación.');
})().catch(error=>{console.error(error);process.exitCode=1});
