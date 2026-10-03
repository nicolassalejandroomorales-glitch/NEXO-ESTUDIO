/* Carga compartida de recursos no esenciales, sin bloquear Inicio. */
(() => {
  'use strict';
  const pending = new Map();
  function script(src) {
    if (pending.has(src)) return pending.get(src);
    const promise = new Promise((resolve, reject) => {
      const element = document.createElement('script');
      element.src = src;
      element.async = true;
      element.onload = resolve;
      element.onerror = () => { pending.delete(src); reject(new Error(`No se pudo cargar ${src}`)); };
      document.head.append(element);
    });
    pending.set(src, promise);
    return promise;
  }
  function style(href) {
    if (pending.has(href)) return pending.get(href);
    const promise = new Promise((resolve, reject) => {
      const element = document.createElement('link');
      element.rel = 'stylesheet';
      element.href = href;
      element.onload = resolve;
      element.onerror = () => { pending.delete(href); reject(new Error(`No se pudo cargar ${href}`)); };
      document.head.append(element);
    });
    pending.set(href, promise);
    return promise;
  }
  window.NexoLoader = { script, style };
})();
