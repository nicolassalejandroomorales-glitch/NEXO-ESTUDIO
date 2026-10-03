/* Indexed prerequisite DAG, independent from org-01 content. */
(() => {
  'use strict';
  function create(nodes,edges) {
    const ids=new Set(nodes.map(node=>typeof node==='string'?node:node.id));
    if(ids.size!==nodes.length)throw new Error('duplicate_concept');
    const incoming=new Map([...ids].map(id=>[id,[]])),outgoing=new Map([...ids].map(id=>[id,[]]));
    for(const edge of edges) {
      if(!ids.has(edge.from)||!ids.has(edge.to)||!['required','recommended'].includes(edge.strength))
        throw new Error('invalid_prerequisite');
      outgoing.get(edge.from).push(edge);incoming.get(edge.to).push(edge);
    }
    const color=new Map();
    function visit(id) {
      if(color.get(id)===1)throw new Error('prerequisite_cycle');
      if(color.get(id)===2)return;
      color.set(id,1);for(const edge of outgoing.get(id))visit(edge.to);color.set(id,2);
    }
    for(const id of ids)visit(id);
    function walk(start,adjacent,getNext,strength) {
      if(!ids.has(start))throw new Error('unknown_concept');
      const found=new Set(),stack=[start];
      while(stack.length)for(const edge of adjacent.get(stack.pop())) {
        if(strength&&edge.strength!==strength)continue;
        const id=getNext(edge);if(!found.has(id)){found.add(id);stack.push(id);}
      }
      return [...found];
    }
    return Object.freeze({
      direct:id=>[...(incoming.get(id)||[])],
      unlocks:id=>[...(outgoing.get(id)||[])],
      ancestors:(id,strength)=>walk(id,incoming,edge=>edge.from,strength),
      descendants:(id,strength)=>walk(id,outgoing,edge=>edge.to,strength)
    });
  }
  window.NexoPrerequisites={create};
})();
