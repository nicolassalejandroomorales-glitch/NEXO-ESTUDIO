"""Genera el arte de la torre del alquimista (aula de Nexo).

Lee las pinturas originales de art-source/classroom/ (Canva, entregadas por Niquito) y escribe:
  - dist/assets/classroom/torre-{amanecer,mediodia,atardecer,noche}.webp
    (el mediodía se deriva del atardecer: más luz, luz blanca y fría en vez de dorada)
  - dist/assets/classroom/spots/{escena}-{objeto}.webp: el objeto recortado de la pintura, iluminado,
    con bordes difuminados. El aula lo muestra al pasar el mouse para que se note qué se puede tocar.
  - dist/classes/tower-art.js: rutas y posiciones (desde tools/classroom-art/hotspots.json).
Uso: python3 tools/classroom-art/build_tower.py
"""
import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'art-source' / 'classroom'
OUT = ROOT / 'dist' / 'assets' / 'classroom'
SPOTS = OUT / 'spots'
KEYS = {'dawn': 'amanecer', 'day': 'mediodia', 'dusk': 'atardecer', 'night': 'noche'}


def daylight(img):
    """Atardecer → mediodía: sube la exposición, aclara sombras y enfría la luz dorada."""
    a = np.asarray(img).astype(np.float32) / 255.0
    a = np.power(a, 0.78) * 1.12                      # aclara sombras y medios tonos
    lum = a.mean(axis=2, keepdims=True)
    a = lum + (a - lum) * 0.82                        # baja la saturación anaranjada
    a *= np.array([0.93, 1.0, 1.10], dtype=np.float32)  # de dorado a luz de día
    return Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))


def glow_crop(img, rect):
    """Recorta un objeto, lo ilumina y le difumina el borde (máscara elíptica suave)."""
    w, h = img.size
    x, y, rw, rh = rect
    box = (round(x / 100 * w), round(y / 100 * h), round((x + rw) / 100 * w), round((y + rh) / 100 * h))
    crop = img.crop(box).convert('RGB')
    a = np.asarray(crop).astype(np.float32) / 255.0
    a = np.clip(np.power(a, 0.8) * 1.28 + np.array([0.06, 0.04, 0.0], dtype=np.float32), 0, 1)  # más luz, un toque cálido
    lit = Image.fromarray((a * 255).astype(np.uint8))
    mask = Image.new('L', crop.size, 0)
    pad = 0.12
    ImageDraw.Draw(mask).ellipse((crop.width * pad, crop.height * pad, crop.width * (1 - pad), crop.height * (1 - pad)), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(min(crop.size) * 0.12))
    lit.putalpha(mask)
    return lit


def main():
    hotspots = json.loads((ROOT / 'tools' / 'classroom-art' / 'hotspots.json').read_text())
    OUT.mkdir(parents=True, exist_ok=True)
    SPOTS.mkdir(parents=True, exist_ok=True)
    images = {name: Image.open(SRC / f'torre-{name}.jpg').convert('RGB') for name in ('amanecer', 'atardecer', 'noche')}
    images['mediodia'] = daylight(images['atardecer'])
    art = {'scenes': {}, 'hotspots': {}, 'glows': {}}
    for key, name in KEYS.items():
        img = images[name]
        img.save(OUT / f'torre-{name}.webp', 'WEBP', quality=82, method=6)
        art['scenes'][key] = f'assets/classroom/torre-{name}.webp'
        art['hotspots'][key] = hotspots[name]
        art['glows'][key] = {}
        for spot, rect in hotspots[name].items():
            path = SPOTS / f'{name}-{spot}.webp'
            glow_crop(img, rect).save(path, 'WEBP', quality=80, method=6)
            art['glows'][key][spot] = f'assets/classroom/spots/{name}-{spot}.webp'
    js = ('/* Generado por tools/classroom-art/build_tower.py: no editar a mano. */\n'
          f'window.NexoTowerArt = Object.freeze({json.dumps(art, ensure_ascii=False, indent=2)});\n')
    (ROOT / 'dist' / 'classes' / 'tower-art.js').write_text(js)
    print('Torre: 4 escenas y', sum(len(v) for v in art['glows'].values()), 'brillos de objetos.')


if __name__ == '__main__':
    main()
