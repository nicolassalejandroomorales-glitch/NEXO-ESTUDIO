/* Ketcher stays lazy-loaded. Split the upstream bundle only to satisfy the
   hosting per-file limit; execute its original bytes without modification. */
(() => {
  const anchor = document.currentScript;
  const base = new URL('./', anchor.src);
  const pieces = ['main.e47c48ad.part1.txt', 'main.e47c48ad.part2.txt'];
  Promise.all(pieces.map(async name => {
    const response = await fetch(new URL(name, base));
    if (!response.ok) throw new Error(`No se pudo cargar ${name} (${response.status})`);
    return response.arrayBuffer();
  })).then(parts => {
    const objectUrl = URL.createObjectURL(new Blob(parts, { type: 'text/javascript' }));
    const script = document.createElement('script');
    script.src = objectUrl;
    script.onload = () => URL.revokeObjectURL(objectUrl);
    script.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      document.getElementById('root').textContent = 'No se pudo abrir el editor químico. Recarga la clase para intentarlo de nuevo.';
    };
    document.head.appendChild(script);
  }).catch(error => {
    console.error(error);
    document.getElementById('root').textContent = 'No se pudo abrir el editor químico. Revisa tu conexión y vuelve a intentarlo.';
  });
})();
