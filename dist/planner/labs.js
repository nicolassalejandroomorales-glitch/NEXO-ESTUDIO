(function (root) {
  'use strict';
  const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) &&
    !Number.isNaN(new Date(`${value}T12:00:00`).getTime()) &&
    new Date(`${value}T12:00:00`).toISOString().slice(0, 10) === value;
  const cleanDate = value => validDate(value) ? value : '';
  const cleanText = (value, max) => String(value || '').trim().slice(0, max);
  function normalize(input) {
    const plan = input && typeof input === 'object' ? input : {};
    return {
      manual: cleanText(plan.manual, 300),
      prelab: { dueDate: cleanDate(plan.prelab?.dueDate), done: plan.prelab?.done === true },
      during: { checklist: Array.isArray(plan.during?.checklist) ? plan.during.checklist.map(item => cleanText(item, 120)).filter(Boolean).slice(0, 8) : [] },
      after: { reportDueDate: cleanDate(plan.after?.reportDueDate), reportDone: plan.after?.reportDone === true }
    };
  }
  function fromForm(formData, previous) {
    const old = normalize(previous);
    const checklist = cleanText(formData.get('labChecklist'), 1000).split(/\r?\n/).map(item => item.trim()).filter(Boolean).slice(0, 8);
    return normalize({
      manual: formData.get('labManual'),
      prelab: { dueDate: formData.get('labPrelabDate'), done: old.prelab.done },
      during: { checklist },
      after: { reportDueDate: formData.get('labReportDate'), reportDone: old.after.reportDone }
    });
  }
  root.NexoLabPlan = Object.freeze({ normalize, fromForm, validDate });
})(typeof window !== 'undefined' ? window : globalThis);
