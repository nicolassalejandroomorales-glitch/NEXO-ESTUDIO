/* Read-only projection of existing PEP catalog and calendar. No academic state writes. */
(() => {
  'use strict';
  const examTypes = ['exam','Prueba','control'];
  // Deliberately strict: a Control 1 is not PEP 1, nor is a vaguely named event.
  const pepNumber = name => String(name || '').match(/^PEP\s+(\d+)(?:\s*[·:–—-].*)?$/i)?.[1] || null;
  function evaluations(subject, events = []) {
    const candidates = events.filter(event => event.subject === subject.id && examTypes.includes(event.type));
    const matched = new Set();
    const chapters = subject.peps.map((pep,index) => {
      const number = pepNumber(pep.name);
      const dates = number ? candidates.filter(event => pepNumber(event.title) === number) : [];
      dates.forEach(event => matched.add(event.id));
      return { id:`pep-${index+1}`, name:pep.name, lessons:[...pep.lessons], events:dates,
        source:'catalog', kind:number?'Evaluación':'Bloque del catálogo' };
    });
    return [...chapters, ...candidates.filter(event => !matched.has(event.id)).map(event => ({
      id:`event-${event.id}`, name:event.title, lessons:[], events:[event], source:'calendar', kind:'Evaluación del calendario'
    }))];
  }
  // Coordinates stay proportional; text uses normal CSS flow, never SVG text.
  function layout(count) {
    const positions=[22,50,78,68,38,22];
    return Array.from({length:count},(_,index)=>({x:positions[index%positions.length],y:90+index*140}));
  }
  window.NexoPreparation=Object.freeze({evaluations,layout});
})();
