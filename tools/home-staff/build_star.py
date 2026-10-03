"""Estrella colgante del báculo estelar: cadena + estrella dorada (se anima en CSS, balanceándose).

Uso: python tools/home-staff/build_star.py
Salida: dist/assets/home-scenes/staff-star.png. Imprime los bounds para home-scene.js
(el punto de cuelgue queda arriba al centro de la imagen: transform-origin 50% 0).
"""
from pathlib import Path
import numpy as np
import cv2
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'dist/assets/home-scenes/staff-star.png'
# mismos parámetros que build_staff.py
tx, ty = 1114.0, 362.0
c1, r1 = np.array([tx + 1.0, ty - 19.0]), 19.5
c2, r2 = np.array([tx + 10.0, ty - 21.0]), 15.5
d = np.linalg.norm(c2 - c1); a = (r1 ** 2 - r2 ** 2 + d ** 2) / (2 * d); hh = np.sqrt(r1 ** 2 - a ** 2)
base = c1 + a * (c2 - c1) / d; perp = np.array([-(c2 - c1)[1], (c2 - c1)[0]]) / d
tips = [base + perp * hh, base - perp * hh]
pivot = min(tips, key=lambda p: p[1])            # punta superior de la luna
W, H, SS = 28, 40, 4
px, py = pivot[0] - W / 2, pivot[1] - 1           # esquina sup. izq. del recorte (arte)
Y, X = np.mgrid[0:H * SS, 0:W * SS].astype(np.float32) / SS
rgb = np.zeros((H * SS, W * SS, 3), np.float32); al = np.zeros((H * SS, W * SS), np.float32)
def over(col, a):
    global rgb, al
    a = np.clip(a, 0, 1)[..., None]; rgb = rgb * (1 - a) + col * a; al = al + (1 - al) * a[..., 0]
# cadena: eslabones pequeños
for k in range(6):
    cy = 1.2 + k * 1.9
    e = np.hypot((X - W / 2) / (.55 if k % 2 else .9), (Y - cy) / .9)
    over(np.array([196, 150, 80], np.float32), np.clip((1 - np.abs(e - .8) / .35), 0, 1))
# estrella de 5 puntas
scx, scy, R, r = W / 2, 22.0, 9.0, 3.8
ang = np.arctan2(X - scx, -(Y - scy)); rad = np.hypot(X - scx, Y - scy)
k = (ang % (2 * np.pi / 5)) / (2 * np.pi / 5)
edge_r = 1 / (np.abs(k - .5) * 2 * (1 / R - 1 / r) * -1 + 1 / r)  # interpolación punta-valle
edge_r = r + (R - r) * (1 - np.abs(k - .5) * 2) ** 1.6
star = np.clip((edge_r - rad) * SS / 1.5, 0, 1)
facet = np.where(((ang % (2 * np.pi / 5)) / (2 * np.pi / 5)) < .5, 1.0, .72)
G_D, G_L = np.array([150, 98, 30], np.float32), np.array([255, 226, 140], np.float32)
col = G_D + (G_L - G_D) * (facet * np.clip(1 - rad / R * .5, 0, 1))[..., None]
col += np.exp(-rad ** 2 / 3)[..., None] * 60
over(np.clip(col, 0, 255), star)
small = lambda im: cv2.resize(im, (W, H), interpolation=cv2.INTER_AREA)
a_s = small(al); rgb_s = small(rgb * al[..., None]) / np.maximum(a_s[..., None], 1e-3)
Image.fromarray(np.dstack([np.clip(rgb_s, 0, 255), a_s * 255]).astype(np.uint8), 'RGBA').save(OUT, optimize=True)
print('ok bounds', round(px, 2), round(py, 2), W, H, 'pivot', pivot.round(2))
