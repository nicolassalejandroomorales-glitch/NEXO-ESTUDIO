const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const manifest=process.env.NEXO_ORIGINAL_MANIFEST||'../MANIFIESTO_SHA256.tsv';
const allowed=new Set(['dist/app.js','dist/index.html','dist/design-system/rooms.js','dist/platform/animation.js','dist/startup-bundle.js','tools/build.cjs','smoke-test.cjs','IMPLEMENTATION_STATUS.md']);
const changed=[];let unchanged=0;
for(const line of fs.readFileSync(manifest,'utf8').split(/\r?\n/).slice(1)){
 const [original,bytes,sha]=line.split('\t');
 if(!original?.startsWith('ESTUDIO_APP_1_0/'))continue;
 const relative=original.slice('ESTUDIO_APP_1_0/'.length);
 assert.ok(fs.existsSync(relative),`Se perdió un archivo original: ${relative}`);
 const hash=crypto.createHash('sha256').update(fs.readFileSync(relative)).digest('hex');
 if(hash!==sha){assert.ok(allowed.has(relative),`Cambio fuera de alcance: ${relative}`);changed.push(relative);}else unchanged++;
}
const backup='../BACKUP_V14/nexo-estudio-v14-original-20260927.zip';
const entry=fs.readFileSync(manifest,'utf8').split(/\r?\n/).find(line=>line.startsWith('BACKUP_V14/')).split('\t');
assert.equal(crypto.createHash('sha256').update(fs.readFileSync(backup)).digest('hex'),entry[2]);
console.log(JSON.stringify({passed:true,unchangedOriginalFiles:unchanged,changedOriginalFiles:changed,removedFiles:0,backupUnchanged:true},null,2));
