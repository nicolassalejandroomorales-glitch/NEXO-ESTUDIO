"""Genera la capa nocturna del piso del Inicio: las manchas de sol pintadas desaparecen.

Idea: detectar las manchas de sol (zonas mucho más claras que su entorno), estimar cómo
se vería esa superficie sin sol (inpainting) y DIVIDIR la imagen por esa "ganancia de luz".
Así se conserva la textura de la alfombra y la madera; sólo se quita la luz.

Uso (desde la raíz del proyecto):
    pip install numpy opencv-python pillow
    python tools/home-night/build_floor_night.py

Entrada : dist/assets/home-scenes/refugio-012.png
Salida  : dist/assets/home-scenes/floor-night.webp (RGBA; recorte x220-978 / y600-941)
Los brillos de faroles en el piso (lado derecho) se conservan a propósito.
"""
from pathlib import Path
import numpy as np
import cv2
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'dist/assets/home-scenes/refugio-012.png'
OUT = ROOT / 'dist/assets/home-scenes/floor-night.webp'
CROP = (220, 600, 978, 941)

src8 = np.array(Image.open(SRC).convert('RGB'))
src = src8.astype(np.float32)
H, W = src.shape[:2]
hsv = cv2.cvtColor(src8, cv2.COLOR_RGB2HSV).astype(np.float32)
L = cv2.cvtColor(src8, cv2.COLOR_RGB2LAB)[..., 0].astype(np.float32)
Y, X = np.mgrid[0:H, 0:W]

# 1. Manchas de sol: "top-hat" (más claras que el fondo local), cálidas y brillantes.
region = (Y >= 585) & (X >= 230) & (X < 1470)
background = cv2.GaussianBlur(cv2.morphologyEx(L, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (31, 31))), (0, 0), 6)
cand = region & (L - background > 28) & (hsv[..., 2] > 150) & (hsv[..., 0] < 35)
cand = cv2.morphologyEx(cand.astype(np.uint8), cv2.MORPH_OPEN, np.ones((2, 2), np.uint8))
n, lbl, st, _ = cv2.connectedComponentsWithStats(cand, 8)
sun = np.zeros((H, W), bool)
for i in range(1, n):
    if st[i, cv2.CC_STAT_AREA] >= 25:
        sun |= lbl == i
sun &= ~((Y < 610) & (X < 360))            # tope de la banqueta
sun &= (X < 980) & ~((Y < 690) & (X > 860))  # reflejos de faroles: se quedan

# 2. Superficie sin sol + ganancia de luz suave.
md = cv2.dilate(sun.astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
base = cv2.inpaint(src8, md, 9, cv2.INPAINT_TELEA).astype(np.float32)
gain = np.clip((cv2.GaussianBlur(src, (0, 0), 2.5) + 1) / (cv2.GaussianBlur(base, (0, 0), 2.5) + 1), 1, 6)
w = np.clip(cv2.GaussianBlur(md.astype(np.float32), (0, 0), 3.0) * 1.4, 0, 1)
unlit = np.clip(src / (1 + (gain - 1) * w[..., None]), 0, 255)
alpha = np.clip(w * 1.2, 0, 1) * 255

x0, y0, x1, y1 = CROP
rgba = np.dstack([unlit, alpha])[y0:y1, x0:x1].astype(np.uint8)
Image.fromarray(rgba, 'RGBA').save(OUT, 'WEBP', quality=82, method=6)
print('ok', OUT.name)
