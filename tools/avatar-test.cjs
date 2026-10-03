const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ctx={window:{}};
vm.createContext(ctx);
for(const file of ['dist/data.js','dist/avatar/catalog.js','dist/avatar/vector-art.js'])
  vm.runInContext(fs.readFileSync(file,'utf8'),ctx);
const A=ctx.window.NexoAvatar;
const owned=['species-pig','scene-ruins','hat-beanie','hat-scholar','shirt-barca','bag-lab',
  'aura-resonance','face-lens','scene-archive'];
const old={species:'pig',hat:'hat-beanie',shirt:'shirt-barca',scene:'scene-ruins',name:'Nexo'};
const migrated=A.normalize(old,owned);
assert.equal(migrated.slots.head,'hat-beanie');
assert.equal(migrated.slots.shirt,'shirt-barca','ownership from older versions survives reskin');
assert.equal(migrated.slots.background,'scene-ruins');
const multi=['shirt','back','aura','face','background'].reduce((state,slot)=>
  A.equip(state,owned,{shirt:'shirt-barca',back:'bag-lab',aura:'aura-resonance',
    face:'face-lens',background:'scene-archive'}[slot],slot),migrated);
assert.equal(multi.slots.head,'hat-beanie');
for(const slot of ['shirt','back','aura','face','background'])assert(multi.slots[slot]);
const alternate=A.equip(multi,owned,'hat-scholar','head');
assert.equal(alternate.slots.head,'hat-scholar');
assert.equal(alternate.slots.shirt,'shirt-barca');
assert.equal(alternate.slots.back,'bag-lab');
assert.equal(multi.slots.head,'hat-beanie','equip returns a new model');
const preview=A.preview(multi,owned,'hat-scholar');
assert.equal(preview.slots.head,'hat-scholar');
assert.equal(multi.slots.head,'hat-beanie','preview never mutates equipped data');
assert.throws(()=>A.equip(multi,owned,'tail-ribbon','tail'),/item_not_owned/);
assert.throws(()=>A.equip(multi,owned,'hat-scholar','face'),/item_not_owned/);
assert.equal(A.normalize({...multi,slots:{...multi.slots,face:'forged'}},owned).slots.face,null);
for(const item of A.catalog) {
  assert(item.id&&item.name&&item.slot&&item.rarity&&item.assetKey);
  assert(Array.isArray(item.compatibleSpecies)&&item.compatibleSpecies.length);
  assert(!/(barça|real madrid|black clover|toro negro|universidad de chile|colo-colo)/i.test(item.name));
}
const vector=ctx.window.NexoVectorArt.svg(A.byId.get('shirt-barca'),'pig');
assert(vector.includes('<svg')&&!/Barça|Madrid/.test(vector));
assert.equal(A.catalog.find(i=>i.id==='face-lens').slot,'face');
console.log('OK: migración de compras, siete ranuras, preview puro, equipamiento y arte propio.');
