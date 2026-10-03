"""Genera las vistas exteriores de la ventana del Inicio (amanecer, atardecer, noche).

Idea: el fondo original NO se modifica. Sólo se calcula una máscara del vidrio
(lo que se ve hacia afuera) y, para cada momento del día, se pinta una vista nueva
recortada a esa máscara. El marco, las plantas y el cuarto quedan intactos.

Uso (desde la raíz del proyecto):
    pip install numpy opencv-python pillow
    python tools/window-views/build_window_views.py

Entrada : dist/assets/home-scenes/refugio-012.png (1672x941)
Salida  : dist/assets/home-scenes/window-view-{morning,dusk,night}.png
          (RGBA, recorte x120-280 / y85-405 del fondo; ver home-scene.js)
"""
from pathlib import Path
import numpy as np
import cv2
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'dist/assets/home-scenes/refugio-012.png'
OUT = ROOT / 'dist/assets/home-scenes'
CROP = (120, 85, 280, 405)  # x0, y0, x1, y1 en píxeles del fondo

src8 = np.array(Image.open(SRC).convert('RGB'))
src = src8.astype(np.float32) / 255
H, W = src.shape[:2]
hsv = cv2.cvtColor(src8, cv2.COLOR_RGB2HSV).astype(np.float32)
h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
k3 = np.ones((3, 3), np.uint8)

# 1. Abertura de la ventana: contorno del arco que contiene todos los vidrios.
poly = np.array([(127, 96), (150, 93), (202, 92), (205, 100), (220, 108), (235, 118), (248, 132),
                 (258, 148), (265, 165), (270, 185), (272, 210), (273, 250), (274, 300), (275, 400),
                 (127, 400)], np.int32)
opening = np.zeros((H, W), np.uint8)
cv2.fillPoly(opening, [poly], 255)
opening = opening > 0
border = cv2.dilate((~opening).astype(np.uint8), k3) > 0

# 2. Madera del marco (y maceteros): tono anaranjado saturado.
wood = (h >= 5) & (h <= 22) & (s > 60) & (v > 90)
wood = cv2.morphologyEx(wood.astype(np.uint8), cv2.MORPH_CLOSE, k3) > 0

# 3. Hojas del cuarto delante del vidrio: más saturadas, más contraste y más oscuras que
#    los árboles de afuera (que se ven con neblina). Sólo cuentan si se conectan con el cuarto.
S = cv2.GaussianBlur(s, (5, 5), 0)
V = cv2.GaussianBlur(v, (5, 5), 0)
g = cv2.cvtColor(src8, cv2.COLOR_RGB2GRAY).astype(np.float32)
lap = cv2.blur(np.abs(cv2.Laplacian(cv2.GaussianBlur(g, (3, 3), 0), cv2.CV_32F)), (7, 7))
score = np.clip((S - 95) / 60, 0, 1) * .7 + np.clip((lap - 8) / 12, 0, 1) * .3 + np.clip((170 - V) / 80, 0, 1) * .3
front = ((score > .5) & (h > 20) & (h < 85)).astype(np.uint8)
front = cv2.morphologyEx(front, cv2.MORPH_OPEN, k3)
front = cv2.morphologyEx(front, cv2.MORPH_CLOSE, k3)
n, lbl, _, _ = cv2.connectedComponentsWithStats(front, 8)
leaves = np.zeros((H, W), bool)
for i in range(1, n):
    m = lbl == i
    if (m & border).any():
        leaves |= m

# 4. Vidrio = abertura - madera - hojas - zonas oscuras (macetas, tallos, sombras).
viewlike = (V > 135) | ((h >= 85) & (h <= 120))
glass = opening & ~(wood | leaves | ~viewlike)
glass = cv2.morphologyEx(glass.astype(np.uint8), cv2.MORPH_OPEN, np.ones((2, 2), np.uint8)) > 0
n, lbl, st, _ = cv2.connectedComponentsWithStats(glass.astype(np.uint8), 8)
for i in range(1, n):
    if st[i, cv2.CC_STAT_AREA] < 12:
        glass[lbl == i] = False
# Islas "de cuarto" encerradas por vidrio (sin tocar el cuarto) son en realidad paisaje.
n, lbl, st, _ = cv2.connectedComponentsWithStats((opening & ~glass).astype(np.uint8), 8)
for i in range(1, n):
    m = lbl == i
    if not (m & border).any() and st[i, cv2.CC_STAT_AREA] < 600:
        glass[m] = True


# 5. Alpha suave: guided filter (los bordes siguen los contornos reales del dibujo).
def box(x, r):
    return cv2.boxFilter(x, -1, (2 * r + 1, 2 * r + 1))


def guided(I, p, r=2, eps=4e-3):
    hh, ww = p.shape
    mI = [box(I[..., c], r) for c in range(3)]
    mp = box(p, r)
    cov = np.stack([box(I[..., c] * p, r) - mI[c] * mp for c in range(3)], -1)
    var = np.zeros((hh, ww, 3, 3), np.float32)
    for i in range(3):
        for j in range(3):
            var[..., i, j] = box(I[..., i] * I[..., j], r) - mI[i] * mI[j] + (eps if i == j else 0)
    a = np.linalg.solve(var, cov[..., None])[..., 0]
    b = mp - sum(a[..., c] * mI[c] for c in range(3))
    return sum(box(a[..., c], r) * I[..., c] for c in range(3)) + box(b, r)


x0, y0, x1, y1 = 110, 75, 290, 415
alpha = np.zeros((H, W), np.float32)
alpha[y0:y1, x0:x1] = np.clip((guided(src[y0:y1, x0:x1].copy(), glass[y0:y1, x0:x1].astype(np.float32)) - .15) / .7, 0, 1)
alpha[~cv2.dilate(opening.astype(np.uint8), k3).astype(bool)] = 0
alpha = np.maximum(alpha, cv2.GaussianBlur(glass.astype(np.float32), (0, 0), .5) * .9)
# Bordes claros mezclados (madera/cielo) junto al vidrio: se cubren para evitar halos de noche.
near = cv2.dilate(glass.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
rim = near & ~glass & opening & (v > 200) & (s < 120)
alpha = np.maximum(alpha, cv2.GaussianBlur(rim.astype(np.float32), (0, 0), .5) * .95)

# 6. Cielo vs paisaje dentro del vidrio.
sky = glass & (((h >= 85) & (h <= 118) & (s > 20)) | ((s < 50) & (v > 200)))
skyf = np.clip(cv2.GaussianBlur(cv2.dilate(sky.astype(np.uint8), k3).astype(np.float32), (0, 0), 1.0), 0, 1)
lum = src @ np.array([.299, .587, .114], np.float32)
dev = lum - cv2.GaussianBlur(lum, (0, 0), 12)  # nubes y montaña conservan su forma
cloud = np.clip((40 - S) / 30, 0, 1) * (v > 215)
yy = np.clip((np.arange(H)[:, None] - 92) / (300 - 92), 0, 1) * np.ones((1, W))


def gradient(stops):
    ys = [p for p, _ in stops]
    cs = np.array([c for _, c in stops], np.float32) / 255
    out = np.zeros((H, W, 3), np.float32)
    for c in range(3):
        out[..., c] = np.interp(yy, ys, cs[:, c])
    return out


def save(name, sky_rgb, land_rgb, stars=False, moon=None):
    rng = np.random.default_rng(7)
    view = land_rgb * (1 - skyf[..., None]) + sky_rgb * skyf[..., None]
    if stars:
        st = np.zeros((H, W), np.float32)
        ys, xs = np.nonzero(sky & (cloud < .35) & (yy < .85))
        for i in rng.choice(len(ys), size=len(ys) // 40, replace=False):
            st[ys[i], xs[i]] = rng.uniform(.35, 1.0) ** 2
        glow = np.clip(cv2.GaussianBlur(st, (0, 0), .8) * 3.0 + st * .9, 0, 1)
        view = view + glow[..., None] * np.array([.85, .9, 1.0]) * (1 - yy[..., None] * .6)
    if moon:
        cx, cy, r = moon
        Y, X = np.mgrid[0:H, 0:W]
        d = np.hypot(X - cx, Y - cy)
        d2 = np.hypot(X - cx - r * .45, Y - cy + r * .2)
        disk = np.clip(np.clip(r - d + .5, 0, 1) * np.clip(d2 - r * .9 + .5, 0, 1), 0, 1)
        halo = np.exp(-(d / (r * 3.2)) ** 2) * .28
        glowm = disk[..., None] * np.array([1.0, .95, .82]) + halo[..., None] * np.array([.55, .62, .85])
        view = view * (1 - disk[..., None]) + glowm * skyf[..., None]
    rgba = np.dstack([np.clip(view, 0, 1), alpha])[CROP[1]:CROP[3], CROP[0]:CROP[2]]
    Image.fromarray((rgba * 255 + .5).astype(np.uint8), 'RGBA').save(OUT / f'window-view-{name}.png', optimize=True)
    print('ok', name)


save('night',
     gradient([(0, (20, 32, 72)), (.55, (40, 60, 112)), (1, (84, 100, 150))])
     + dev[..., None] * np.array([.30, .36, .50]) + cloud[..., None] * np.array([.05, .06, .09]),
     (lum[..., None] ** 1.1) * np.array([.17, .24, .34]) + src * .04,
     stars=True, moon=(178, 128, 6.5))
save('dusk',
     gradient([(0, (72, 62, 128)), (.45, (214, 120, 118)), (.8, (250, 170, 110)), (1, (255, 200, 130))])
     + dev[..., None] * np.array([.55, .38, .30]) + cloud[..., None] * np.array([.20, .10, .06]),
     src * np.array([.78, .52, .42]) + lum[..., None] * np.array([.05, 0, .03]))
save('morning',
     gradient([(0, (132, 170, 222)), (.55, (214, 206, 222)), (1, (255, 214, 176))])
     + dev[..., None] * np.array([.55, .52, .50]) + cloud[..., None] * np.array([.10, .07, .05]),
     src * np.array([.96, .9, .86]) + np.array([.03, .02, 0]))
