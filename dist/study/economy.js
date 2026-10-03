/* Reglas únicas de recompensas por tiempo; sin estado ni dependencia del DOM. */
(() => {
  'use strict';
  function sessionReward(seconds) {
    const minutes = Math.floor(Math.max(0, Number(seconds) || 0) / 60);
    return minutes >= 120 ? 250 : minutes >= 60 ? 100 : minutes >= 30 ? 25 : minutes >= 15 ? 15 : minutes >= 5 ? 3 : 0;
  }
  function sessionXp(seconds) { return Math.min(60, Math.floor(Math.max(0, Number(seconds) || 0) / 300) * 5); }
  window.NexoEconomy = { sessionReward, sessionXp };
})();
