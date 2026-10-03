/* Game registry: Phaser is downloaded exclusively through explicit loadGame(). */
(() => {
  'use strict';
  const registry = new Map();
  let current = null;
  function registerGame(id, factory) {
    if (!id || typeof factory !== 'function') throw new TypeError('Registro de juego inválido');
    registry.set(id, factory);
  }
  async function loadGame(id, host) {
    const factory = registry.get(id);
    if (!factory) throw new Error(`Juego no registrado: ${id}`);
    destroyGame();
    await window.NexoLoader.script('./vendor/phaser/phaser.min.js');
    current = factory({ Phaser: window.Phaser, host });
    return current;
  }
  function pauseGame() {current?.scene?.pause?.();current?.pause?.();}
  function resumeGame() {current?.scene?.resume?.();current?.resume?.();}
  function destroyGame() {current?.destroy?.(true);current=null;}
  if(new URLSearchParams(location.search).has('nexoDev')) {
    registerGame('dev-canvas-check',({Phaser,host})=>{
      const game=new Phaser.Game({type:Phaser.AUTO,parent:host,width:Math.max(320,host.clientWidth),
        height:240,backgroundColor:'#24223b',scene:{create() {
          this.add.text(20,24,'Nexo · prueba técnica',{fontSize:'18px',color:'#f3dfaa'});
          this.input.on('pointerdown',()=>this.cameras.main.flash(120,70,120,150));
        }}});
      const resize=()=>game.scale.resize(Math.max(320,host.clientWidth),240);
      window.addEventListener('resize',resize);
      return {scene:game.scene,destroy(){window.removeEventListener('resize',resize);game.destroy(true);}};
    });
  }
  window.NexoGame = { register:registerGame,registerGame,loadGame,
    pauseGame,resumeGame,destroyGame,unloadGame:destroyGame,registered: () => [...registry.keys()] };
})();
