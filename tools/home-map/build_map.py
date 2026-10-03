"""Pinta el mapa pirata medio enrollado que está en el piso del Inicio (objeto de la Bitácora).

1. Se dibuja el mapa "plano" (pergamino, costa, montañas, ruta punteada, X y rosa de los vientos).
2. Se proyecta en perspectiva sobre el piso (warpPerspective).
3. Se agrega el rollo (cilindro de pergamino) en el borde izquierdo, la cuerda y la sombra.
4. Se ajusta a la luz cálida y al grano del cuarto.

Uso:  python tools/home-map/build_map.py
Salida: dist/assets/home-scenes/map.png (RGBA; recorte CROP en coordenadas del arte 1672x941)
"""
from pathlib import Path
import numpy as np
import cv2
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'dist/assets/home-scenes/refugio-012.png'
OUT = ROOT / 'dist/assets/home-scenes/map.png'
CROP = (600, 600, 800, 705)
# esquinas del pergamino sobre el piso (TL, TR, BR, BL) en coordenadas del arte
QUAD = np.float32([(642, 626), (762, 630), (782, 678), (630, 674)])
SS = 4
rng = np.random.default_rng(11)

# ---------- 1. mapa plano
MW, MH = 640, 300
paper = np.zeros((MH, MW, 3), np.float32) + np.array([222, 196, 150], np.float32)
noise = cv2.GaussianBlur(rng.normal(0, 1, (MH, MW)).astype(np.float32), (0, 0), 9) * 22
paper += noise[..., None] * np.array([1, .9, .7])
yy, xx = np.mgrid[0:MH, 0:MW].astype(np.float32)
vign = np.clip(1 - (((xx - MW / 2) / (MW / 2)) ** 2 + ((yy - MH / 2) / (MH / 2)) ** 2) * .35, 0, 1)
paper *= (.72 + .28 * vign)[..., None]
img = paper.copy()
ink = (70, 45, 28)
canvas = np.clip(img, 0, 255).astype(np.uint8).copy()
# costa (isla) con contorno irregular
ang = np.linspace(0, 2 * np.pi, 90)
rad = 1 + .18 * np.sin(ang * 3 + .5) + .1 * np.sin(ang * 7) + rng.normal(0, .03, ang.size)
isl = np.stack([360 + np.cos(ang) * 150 * rad, 150 + np.sin(ang) * 85 * rad], 1).astype(np.int32)
cv2.fillPoly(canvas, [isl], (196, 170, 112))
cv2.polylines(canvas, [isl], True, ink, 3, cv2.LINE_AA)
cv2.polylines(canvas, [(isl - [360, 150]) * 1.12 + [360, 150]].__iter__().__next__().astype(np.int32)[None], True, (120, 92, 60), 1, cv2.LINE_AA)
# montañas
for mx, my in [(320, 120), (350, 105), (382, 125), (300, 140)]:
    cv2.polylines(canvas, [np.int32([(mx - 16, my + 12), (mx, my - 10), (mx + 16, my + 12)])], False, ink, 2, cv2.LINE_AA)
# ruta punteada hasta la X
pts = [(110, 250), (170, 215), (230, 230), (290, 190), (340, 175), (400, 160), (440, 140)]
for (a, b) in zip(pts, pts[1:]):
    n = int(np.hypot(b[0] - a[0], b[1] - a[1]) / 14)
    for i in range(n):
        if i % 2 == 0:
            p0 = (int(a[0] + (b[0] - a[0]) * i / n), int(a[1] + (b[1] - a[1]) * i / n))
            p1 = (int(a[0] + (b[0] - a[0]) * (i + 1) / n), int(a[1] + (b[1] - a[1]) * (i + 1) / n))
            cv2.line(canvas, p0, p1, (150, 40, 30), 3, cv2.LINE_AA)
cv2.line(canvas, (428, 128), (452, 152), (160, 30, 26), 6, cv2.LINE_AA)
cv2.line(canvas, (452, 128), (428, 152), (160, 30, 26), 6, cv2.LINE_AA)
# rosa de los vientos
cx, cy = 560, 70
cv2.circle(canvas, (cx, cy), 34, ink, 2, cv2.LINE_AA)
for k in range(8):
    a = k * np.pi / 4; L = 44 if k % 2 == 0 else 26
    cv2.line(canvas, (cx, cy), (int(cx + np.cos(a) * L), int(cy + np.sin(a) * L)), ink, 2 if k % 2 == 0 else 1, cv2.LINE_AA)
# olas
for wx, wy in [(150, 70), (200, 95), (520, 230), (470, 260), (90, 160)]:
    cv2.ellipse(canvas, (wx, wy), (14, 6), 0, 200, 340, (110, 90, 70), 2, cv2.LINE_AA)
cv2.rectangle(canvas, (10, 10), (MW - 10, MH - 10), (120, 90, 60), 2, cv2.LINE_AA)
flat = canvas.astype(np.float32)
# v2: manchas de humedad, pliegues y bordes tostados (el papel se veía demasiado limpio)
stain = cv2.GaussianBlur(np.clip(rng.normal(0, 1, (MH, MW)), 1.2, None).astype(np.float32) - 1.2, (0, 0), 14)
stain = stain / (stain.max() + 1e-6)
flat *= (1 - stain[..., None] * np.array([.28, .32, .40]))
for fx in (MW / 3, 2 * MW / 3):                      # pliegues verticales (doblado en 3)
    dx = xx - fx
    flat *= (1 - .10 * np.exp(-(dx / 2.2) ** 2))[..., None]
    flat *= (1 + .06 * np.exp(-((dx - 4) / 3) ** 2))[..., None]
dy = yy - MH / 2                                      # pliegue horizontal
flat *= (1 - .08 * np.exp(-(dy / 2.2) ** 2))[..., None]
flat *= (1 + .05 * np.exp(-((dy - 4) / 3) ** 2))[..., None]
edge0 = np.minimum.reduce([xx, yy, MW - 1 - xx, MH - 1 - yy])
burn = np.clip(1 - (edge0 + cv2.GaussianBlur(rng.normal(0, 6, (MH, MW)).astype(np.float32), (0, 0), 4)) / 26, 0, 1) ** 1.5
flat = flat * (1 - burn[..., None] * .55) + np.array([70, 42, 22]) * burn[..., None] * .25
# bordes gastados
edge = np.minimum.reduce([xx, yy, MW - 1 - xx, MH - 1 - yy])
wear = np.clip((edge - 3 + cv2.GaussianBlur(rng.normal(0, 4, (MH, MW)).astype(np.float32), (0, 0), 3)) / 8, 0, 1)
flat_a = wear

# ---------- 2. proyección en el piso
x0, y0, x1, y1 = CROP
W, H = (x1 - x0) * SS, (y1 - y0) * SS
dst = (QUAD - [x0, y0]) * SS
M = cv2.getPerspectiveTransform(np.float32([(0, 0), (MW, 0), (MW, MH), (0, MH)]), dst.astype(np.float32))
rgb = cv2.warpPerspective(flat, M, (W, H), flags=cv2.INTER_LINEAR)
alpha = cv2.warpPerspective(flat_a, M, (W, H), flags=cv2.INTER_LINEAR)
# leve curvatura del papel: más claro al centro, sombra junto al rollo
Yg, Xg = np.mgrid[0:H, 0:W].astype(np.float32)
ax, ay = Xg / SS + x0, Yg / SS + y0

def over(col, a):
    global rgb, alpha
    a = np.clip(a, 0, 1)[..., None]
    rgb = rgb * (1 - a) + col * a
    alpha = alpha + (1 - alpha) * a[..., 0]

# ---------- 3. rollo en el borde izquierdo (de TL a BL)
p_top, p_bot = QUAD[0] + [-3, 1], QUAD[3] + [-5, 3]
axis = p_bot - p_top; Lx = np.linalg.norm(axis); dirv = axis / Lx; nrm = np.array([dirv[1], -dirv[0]])
rel = np.stack([ax - p_top[0], ay - p_top[1]], -1)
s = rel @ dirv; d = rel @ nrm
R = 7.0
inroll = (s > 0) & (s < Lx)
v = d / R
cyl = np.clip((1 - np.abs(v)) * R * SS / 1.5, 0, 1) * np.clip(np.minimum(s, Lx - s) * SS / 1.5 + .5, 0, 1)
shade = np.clip(.35 + .65 * np.clip(-v * .5 + np.sqrt(np.clip(1 - v ** 2, 0, 1)) * .8, 0, 1), 0, 1)
pcol = np.array([200, 172, 124], np.float32) * shade[..., None]
pcol *= (1 + cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), 6) * .06)[..., None]
over(pcol, cyl * inroll)
# v2: tapa del rollo en el extremo CERCANO (abajo): así se lee acostado en el piso y no parado
rel_b = np.stack([ax - p_bot[0], ay - p_bot[1]], -1)
cs, cd = rel_b @ dirv, rel_b @ nrm
ell = np.hypot(cd / R, cs / (R * .42))
over(np.array([150, 122, 84], np.float32), np.clip((1 - ell) * R * SS / 2, 0, 1))
spiral_r = np.hypot(cd, cs / .42)
spiral_a = np.arctan2(cs / .42, cd)
spiral = np.abs(((spiral_r - spiral_a / (2 * np.pi) * 1.6) % 1.6) - .8) < .28
over(np.array([92, 66, 40], np.float32), spiral * (ell < .92) * .8)
over(np.array([60, 40, 24], np.float32), np.exp(-(cd ** 2 + (cs / .42) ** 2) / 1.2) * .9)   # hueco del centro
# sombra de contacto a lo largo del rollo (lado del piso)
over(np.array([12, 8, 6], np.float32), np.clip(1 - np.abs(d + R + 1.5) / 2.2, 0, 1) * inroll * .55 * (alpha < .5))
# cuerda roja
mid = p_top + axis * .45
rope = np.abs((np.stack([ax - mid[0], ay - mid[1]], -1) @ dirv)) < 1.3
over(np.array([128, 34, 28], np.float32), rope * (np.abs(d) < R + .6))

# ---------- 4. reducir, sombra, luz del cuarto
small = lambda im: cv2.resize(im, (x1 - x0, y1 - y0), interpolation=cv2.INTER_AREA)
a_s = small(alpha); rgb_s = small(rgb * alpha[..., None]) / np.maximum(a_s[..., None], 1e-3)
rgb_s = cv2.GaussianBlur(rgb_s, (0, 0), .5)
src = np.array(Image.open(SRC).convert('RGB')).astype(np.float32)[y0:y1, x0:x1]
amb = cv2.GaussianBlur(src, (0, 0), 20).reshape(-1, 3).mean(0)
rgb_s = rgb_s * (amb / amb.max()) * .78              # el papel toma la luz cálida y tenue del piso
g = rgb_s.mean(-1, keepdims=True); rgb_s = g + (rgb_s - g) * .72   # menos saturado, como el resto del arte
fall = np.clip((np.mgrid[y0:y1, x0:x1][0] - 626) / 52, 0, 1)        # el borde lejano recibe menos luz
rgb_s *= (.82 + .18 * fall)[..., None]
rgb_s += np.random.default_rng(4).normal(0, 2.0, rgb_s.shape)
sh = cv2.GaussianBlur(np.roll(np.roll(a_s, 3, 0), 3, 1), (0, 0), 3) * .7 * (1 - a_s)
out_a = np.clip(a_s + sh, 0, 1)
out = (rgb_s * a_s[..., None] + np.array([10, 7, 5]) * sh[..., None]) / np.maximum(out_a[..., None], 1e-3)
Image.fromarray(np.dstack([np.clip(out, 0, 255), out_a * 255]).astype(np.uint8), 'RGBA').save(OUT, optimize=True)
print('ok', OUT.name)
