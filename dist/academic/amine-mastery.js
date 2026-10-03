/* Regla de dominio verificable para la clase de aminas. La autoevaluación no equivale a corrección por IA. */
(() => {
  'use strict';
  const DAY = /^\d{4}-\d{2}-\d{2}$/;
  function eligible(progress, day) {
    return progress?.status === 'inestable'
      && DAY.test(progress.firstAttemptAt || '')
      && DAY.test(day || '')
      && day > progress.firstAttemptAt;
  }
  function canComplete(progress, day) {
    if (!eligible(progress, day)) return false;
    const review = progress.review || {};
    return ['variant', 'transfer'].every(id =>
      (review.answers?.[id] || '').trim().length >= 40
      && review.revealed?.[id] === true
      && review.hinted?.[id] !== true
      && Array.isArray(review.verified?.[id])
      && review.verified[id].length === 3
      && review.verified[id].every(value => value === true)
    );
  }
  window.NexoAmineMastery = { eligible, canComplete };
})();
