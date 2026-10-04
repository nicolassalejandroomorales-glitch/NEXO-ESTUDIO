"""Convierte el PDF de una clase de cátedra en imágenes para la pizarra del aula.

Uso:  python3 tools/classroom-art/slides.py RUTA/AL/ARCHIVO.pdf org-01
Escribe:
  - dist/assets/classes/<clase>/slides/NN.webp  (una por diapositiva, 1280 px de ancho)
  - dist/classes/slides/<clase>.js              (lista de imágenes; el aula la carga sola si existe)
Necesita pdftoppm (poppler) y ffmpeg, ya instalados en el entorno.
"""
import json
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def main(pdf, class_id):
    out = ROOT / 'dist' / 'assets' / 'classes' / class_id / 'slides'
    out.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(['pdftoppm', '-r', '110', '-png', pdf, f'{tmp}/p'], check=True)
        pages = sorted(Path(tmp).glob('p-*.png'), key=lambda p: int(p.stem.split('-')[1]))
        images = {}
        for page in pages:
            n = int(page.stem.split('-')[1])
            dest = out / f'{n:02d}.webp'
            subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', str(page), '-vf', 'scale=1280:-2', '-q:v', '82', str(dest)], check=True)
            images[n] = f'assets/classes/{class_id}/slides/{n:02d}.webp'
    js_dir = ROOT / 'dist' / 'classes' / 'slides'
    js_dir.mkdir(parents=True, exist_ok=True)
    (js_dir / f'{class_id}.js').write_text(
        '/* Generado por tools/classroom-art/slides.py: no editar a mano. */\n'
        'window.NexoClassSlides = window.NexoClassSlides || {};\n'
        f'window.NexoClassSlides[{json.dumps(class_id)}] = {json.dumps(images, indent=2)};\n')
    print(f'{class_id}: {len(images)} diapositivas convertidas.')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
