const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=path.join(root,'migrations');
const target=path.join(root,'supabase','migrations');
fs.mkdirSync(target,{recursive:true});
for(const name of fs.readdirSync(source).filter(name=>/^\d+_.*\.sql$/.test(name)).sort()) {
  fs.copyFileSync(path.join(source,name),path.join(target,name));
  console.log(name);
}
