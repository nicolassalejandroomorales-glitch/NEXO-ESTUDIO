const {spawnSync}=require('node:child_process');
const {scripts}=require('../package.json');
const build=spawnSync(process.execPath,['tools/build.cjs'],{stdio:'inherit',env:process.env});
if(build.status!==0)process.exit(build.status||1);
for(const name of ['test','test:e2e','test:perf','test:a11y']) {
  for (const command of scripts[name].split(' && ')) {
    const file = command.match(/^node\s+([\w./-]+\.cjs)$/)?.[1];
    if (!file) throw new Error(`Comando de prueba no admitido: ${command}`);
    const result=spawnSync(process.execPath,[file],{stdio:'inherit',env:process.env});
    if(result.status!==0) process.exit(result.status||1);
  }
}
