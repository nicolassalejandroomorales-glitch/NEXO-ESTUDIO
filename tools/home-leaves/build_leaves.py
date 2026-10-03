"""Hojas con vida: separa algunas enredaderas que cuelgan del arte original para que se mezan.

Para cada enredadera (caja en coordenadas del arte 1672x941):
  1. Detecta las hojas por color (verdes) dentro de la caja.
  2. leaf-<id>.png  -> las hojas originales recortadas (los mismos píxeles del arte).
  3. leaf-<id>-plate.png -> lo que hay "detrás" de las hojas, reconstruido con inpainting.
     Va debajo y solo se asoma unos pocos píxeles cuando la hoja se mece.
El original refugio-012.png no se modifica. CSS hace el balanceo (rotación suave desde arriba).

Uso:  python tools/home-leaves/build_leaves.py
Imprime los bounds para pegarlos en home-scene.js.
"""
from pathlib import Path
import numpy as np
import cv2
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'dist/assets/home-scenes/refugio-012.png'
OUT = ROOT / 'dist/assets/home-scenes'
VINES = {                                   # id: (x0, y0, x1, y1)
    'a': (858, 52, 935, 282),
    'b': (930, 56, 986, 248),
    'c': (712, 36, 790, 168),
    'd': (1296, 116, 1386, 200),
}
src = np.array(Image.open(SRC).convert('RGB'))
hsv = cv2.cvtColor(src, cv2.COLOR_RGB2HSV)
H, S, V = [hsv[..., i].astype(np.float32) for i in range(3)]
green = ((H > 18) & (H < 52) & (S > 48) & (V > 26)).astype(np.uint8)   # OpenCV: H va de 0 a 180

for vid, (x0, y0, x1, y1) in VINES.items():
    m = green[y0:y1, x0:x1].copy()
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m)
    keep = np.zeros_like(m)
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] > 40:
            keep[lab == i] = 1
    # feather: el borde de la hoja se funde 1 px
    leaf_a = cv2.GaussianBlur(cv2.dilate(keep, np.ones((3, 3), np.uint8)).astype(np.float32), (0, 0), .8)
    # el recorte se desvanece en los bordes izquierdo, derecho e inferior de la caja (no se ve el corte al rotar)
    fade = np.ones_like(leaf_a)
    ry = np.arange(y1 - y0)[:, None]; rx = np.arange(x1 - x0)[None, :]
    edge = np.minimum(np.minimum(rx, x1 - x0 - 1 - rx), y1 - y0 - 1 - ry)   # arriba no: ahí está el punto de giro
    fade *= np.clip(edge / 4, 0, 1)
    leaf_a *= fade
    crop = src[y0:y1, x0:x1]
    Image.fromarray(np.dstack([crop, np.clip(leaf_a * 255, 0, 255).astype(np.uint8)]), 'RGBA').save(OUT / f'leaf-{vid}.png', optimize=True)
    # plate: inpainting de una zona algo más grande que la hoja
    pad = 12
    X0, Y0, X1, Y1 = x0 - pad, y0 - pad, x1 + pad, y1 + pad
    big = np.zeros((Y1 - Y0, X1 - X0), np.uint8); big[pad:-pad, pad:-pad] = keep
    hole = cv2.dilate(big, np.ones((7, 7), np.uint8))
    filled = cv2.inpaint(src[Y0:Y1, X0:X1], hole * 255, 6, cv2.INPAINT_TELEA)
    filled = cv2.GaussianBlur(filled, (0, 0), 1.2)
    plate_a = cv2.GaussianBlur(hole.astype(np.float32), (0, 0), 1.5)[pad:-pad, pad:-pad] * fade
    plate = filled[pad:-pad, pad:-pad]
    Image.fromarray(np.dstack([plate, np.clip(plate_a * 255, 0, 255).astype(np.uint8)]), 'RGBA').save(OUT / f'leaf-{vid}-plate.png', optimize=True)
    print(f"{{id:'leaf-{vid}',bounds:[{x0}/1672,{y0}/941,{x1 - x0}/1672,{y1 - y0}/941]}}  hojas={int(keep.sum())}px")
