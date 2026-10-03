/* V11: única frontera de persistencia local. Sustituible por una implementación remota. */
(() => {
  'use strict';
  const KEY = 'nexo-study-beta';
  const BACKUP = 'nexo-study-beta-backup';
  const PRE_V11 = 'nexo-study-beta-pre-v11';
  const PRE_V12 = 'nexo-study-beta-pre-v12';
  const PRE_V13 = 'nexo-study-beta-pre-v13';
  const PRE_V14 = 'nexo-study-beta-pre-v14';
  let pending = null;
  let pendingBackup = false;
  let timer = null;
  let errorHandler = null;

  function flush() {
    if (!pending) return true;
    clearTimeout(timer);
    timer = null;
    const value = pending;
    const backup = pendingBackup;
    try {
      const previous = localStorage.getItem(KEY);
      if (backup && previous) {
        JSON.parse(previous);
        localStorage.setItem(BACKUP, previous);
        value.meta.lastBackupAt = new Date().toISOString();
      }
      localStorage.setItem(KEY, JSON.stringify(value));
      pending = null;
      pendingBackup = false;
      return true;
    } catch (error) {
      errorHandler?.(error);
      return false;
    }
  }

  function schedule(value, { backup = true } = {}) {
    pending = value;
    pendingBackup ||= backup;
    if (backup) flush();
    else {
      clearTimeout(timer);
      timer = setTimeout(flush, 250);
    }
  }

  function getItem(key) { flush(); try { return localStorage.getItem(key); } catch (error) { errorHandler?.(error); return null; } }
  function setItem(key, value) { flush(); localStorage.setItem(key, value); }
  function preserveBeforeMigration(raw) {
    try { if (raw && !localStorage.getItem(PRE_V11)) localStorage.setItem(PRE_V11, raw); }
    catch (error) { errorHandler?.(error); }
  }
  function preserveBeforeV12(raw) {
    try { if (raw && !localStorage.getItem(PRE_V12)) localStorage.setItem(PRE_V12,raw); }
    catch (error) { errorHandler?.(error); }
  }
  function preserveBeforeV13(raw) {
    try { if (raw && !localStorage.getItem(PRE_V13)) localStorage.setItem(PRE_V13,raw); }
    catch (error) { errorHandler?.(error); }
  }
  function preserveBeforeV14(raw) {
    try { if (raw && !localStorage.getItem(PRE_V14)) localStorage.setItem(PRE_V14,raw); }
    catch (error) { errorHandler?.(error); }
  }
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });
  window.NexoStorage = { KEY, BACKUP, PRE_V11, PRE_V12, PRE_V13, PRE_V14, getItem, setItem, schedule, flush,
    preserveBeforeMigration, preserveBeforeV12, preserveBeforeV13, preserveBeforeV14,
    onError(handler) { errorHandler = handler; } };
})();
