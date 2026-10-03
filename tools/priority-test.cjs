const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const window = {};
vm.runInNewContext(fs.readFileSync('dist/planner/priority.js', 'utf8'), { window, Date });
const { rank } = window.NexoPriority;
const events = [
  { id: 'close', subject: 'fisico', type: 'exam', title: 'Control', date: '2026-10-02', priority: 3 },
  { id: 'lab', subject: 'organica', type: 'lab', title: 'Lab', date: '2026-10-03', priority: 2, prepMinutes: 120 },
  { id: 'far', subject: 'analitica', type: 'exam', title: 'PEP', date: '2026-11-20', priority: 3 },
  { id: 'done', subject: 'organica', type: 'lab', date: '2026-10-01', status: 'done', prepMinutes: 300 },
  { id: 'old-exam', subject: 'fisico', type: 'exam', date: '2026-09-01' },
  { id: 'overdue-report', subject: 'organica', type: 'report', date: '2026-09-29' }
];
const items = rank(events, { today: '2026-10-01', weaknesses: { organica: 2 }, prerequisites: { lab: 1 } });
assert.equal(items.length, 4);
assert.equal(items[0].event.id, 'lab');
assert(items[0].reasons.some(reason => reason.includes('preparación pendiente')));
assert(items[0].reasons.some(reason => reason.includes('base pendiente')));
assert.equal(items.at(-1).event.id, 'far');
assert(items.find(item => item.event.id === 'overdue-report').reasons[0].startsWith('Atrasado'));
assert(!items.some(item => item.event.id === 'done' || item.event.id === 'old-exam'));
const labStages = [{ id:'lab-stage', type:'lab', date:'2026-10-15', lab:{ prelab:{dueDate:'2026-10-14',done:false}, after:{reportDueDate:'2026-10-22',reportDone:false} } }];
assert.equal(rank(labStages,{today:'2026-10-13'})[0].stage,'Pre-lab');
labStages[0].lab.prelab.done = true;
assert.equal(rank(labStages,{today:'2026-10-16'})[0].stage,'Informe');
assert.equal(rank(labStages,{today:'2026-10-16'})[0].targetDate,'2026-10-22');
assert.equal(rank([{id:'bad',date:'2026-02-30'}],{today:'2026-02-01'}).length,0);
assert.equal(rank([], { today: '2026-10-01' }).length, 0);
console.log('Priority Engine: orden, razones, atrasos y exclusiones OK');
