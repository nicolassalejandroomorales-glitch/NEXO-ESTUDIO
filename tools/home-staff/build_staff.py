"""Pinta el báculo estelar del Inicio (objeto de la Tienda) con código.  — v2 (refinado)

Qué cambió respecto a la v1 (que se veía "lisa", como vector pegado):
  * Paleta de madera tomada del mueble que está detrás (más oscura, menos naranja).
  * Vetas más marcadas, nudos, ancho irregular y una empuñadura de cuero enrollado.
  * Bronce envejecido (menos brillo, pátina verdosa en los surcos) en anillos, luna y regatón.
  * Luna con biselado: el borde se ve con volumen y tiene un surco grabado con 3 puntos (estrellas).
  * "Ajuste de valor": el brillo del báculo sigue la luz real del cuarto en cada altura
    (más luz arriba, cerca de la vela; más sombra abajo, junto al piso).
  * Acabado pintado: filtro bilateral + grano igual al del arte, y bordes suaves.

Mismos CROP, BASE y TOP que la v1, así que la estrella, el brillo y el objeto tocable no se mueven.

Uso:  python tools/home-staff/build_staff.py
Salida: dist/assets/home-scenes/staff.png (RGBA, recorte en CROP, coordenadas del arte 1672x941)
"""
from pathlib import Path
import numpy as np
import cv2
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'dist/assets/home-scenes/refugio-012.png'
OUT = ROOT / 'dist/assets/home-scenes/staff.png'
CROP = (1050, 285, 1170, 625)          # x0, y0, x1, y1 del arte
BASE, TOP = (1093.0, 607.0), (1114.0, 362.0)  # pie y cabeza del báculo
SS = 4
rng = np.random.default_rng(7)

x0, y0, x1, y1 = CROP
w, h = (x1 - x0) * SS, (y1 - y0) * SS
Y, X = np.mgrid[0:h, 0:w].astype(np.float32)
ax, ay = X / SS + x0, Y / SS + y0                    # coordenadas del arte
rgb = np.zeros((h, w, 3), np.float32)
alpha = np.zeros((h, w), np.float32)
aa = lambda d: np.clip(d * SS / 1.4, 0, 1)            # borde antialias a partir de una distancia (px del arte)


def over(color, a):
    global rgb, alpha
    a = np.clip(a, 0, 1)[..., None]
    rgb = rgb * (1 - a) + color * a
    alpha = alpha + (1 - alpha) * a[..., 0]


def noise(sx, sy, seed):
    g = np.random.default_rng(seed).normal(0, 1, (h, w)).astype(np.float32)
    g = cv2.GaussianBlur(g, (0, 0), sigmaX=sx * SS, sigmaY=sy * SS)
    return g / (g.std() + 1e-6)


# ---------------------------------------------------------------- eje de madera
bx, by = BASE; tx, ty = TOP
t = np.clip((by - ay) / (by - ty), 0, 1)               # 0 pie -> 1 cabeza
wob = noise(.1, 30, 11)[:, w // 2][:, None] * .35      # ondulación leve a lo largo (madera tallada a mano)
cx = bx + (tx - bx) * t + np.sin(t * np.pi) * 2.0 + wob
knots = 0.8 * np.exp(-((t - .30) / .022) ** 2) + 0.6 * np.exp(-((t - .74) / .018) ** 2)
half = 3.6 + 1.0 * (1 - t) + knots
u = (ax - cx) / half                                    # -1..1 a lo ancho
body = aa(half - np.abs(ax - cx)) * aa(by + .5 - ay) * aa(ay - (ty - 2))
nz = np.sqrt(np.clip(1 - u ** 2, 0, 1))
key = np.clip(-u * .45 + nz * .7, 0, 1) ** 1.6          # luz suave desde arriba-izquierda
rim = np.clip((u - .45) / .55, 0, 1) ** 2.2             # borde cálido derecho (vela de la estantería)
occ = 1 - .45 * np.clip((-u - .55) / .45, 0, 1)          # oclusión en el borde izquierdo
grain = noise(.25, 7, 1) * .6 + noise(.12, 2.5, 2) * .4
streak = np.clip(noise(.18, 12, 3) - 1.1, 0, None)       # vetas oscuras largas
# paleta del mueble de atrás (más oscura y menos saturada que la v1)
dark = np.array([20, 11, 6], np.float32); mid = np.array([66, 38, 20], np.float32); lite = np.array([128, 84, 50], np.float32)
wood = dark + (mid - dark) * np.clip(key * 1.5, 0, 1)[..., None] + (lite - mid) * np.clip(key - .6, 0, 1)[..., None] * 1.8
wood *= (1 + grain * .16 - streak * .35)[..., None] * occ[..., None]
# nudos: anillos oscuros concéntricos
for tk, sk in ((.30, .022), (.74, .018)):
    ring = np.exp(-((t - tk) / sk) ** 2)
    wood *= (1 - .35 * ring * (.6 + .4 * np.sin((t - tk) / sk * 6)))[..., None]
wood += rim[..., None] * np.array([58, 32, 12])
over(wood, body)

# ---------------------------------------------------------------- empuñadura de cuero enrollado
g0, g1 = .52, .64
grip = (t > g0) & (t < g1)
phase = ((ay - (u * half) * .55) / 3.2) % 1                 # tiras diagonales
strip = np.clip(np.minimum(phase, 1 - phase) * 6, 0, 1)      # 0 en la unión de cada vuelta
gh = half + .7
gu = (ax - cx) / gh
gnz = np.sqrt(np.clip(1 - gu ** 2, 0, 1))
gl = np.clip(-gu * .4 + gnz * .75, 0, 1) ** 1.5
leather = np.array([26, 15, 10], np.float32) + np.array([62, 36, 22], np.float32) * gl[..., None]
leather *= (.55 + .45 * strip)[..., None] * (1 + noise(.3, .3, 4) * .06)[..., None]
grip_a = aa(gh - np.abs(ax - cx)) * aa(np.minimum(t - g0, g1 - t) * (by - ty))
over(leather, grip_a * grip)

# ---------------------------------------------------------------- bronce envejecido
BR_D, BR_M, BR_L = np.array([40, 26, 12], np.float32), np.array([104, 72, 36], np.float32), np.array([164, 122, 70], np.float32)
PATINA = np.array([58, 74, 58], np.float32)


def bronze(lit, crev):
    col = BR_D + (BR_M - BR_D) * np.clip(lit * 1.6, 0, 1)[..., None] + (BR_L - BR_M) * np.clip(lit - .62, 0, 1)[..., None] * 2.4
    return col * (1 - crev[..., None] * .35) + PATINA * crev[..., None] * .35


def band(yc, hh, wide=1.18):
    hw = half * wide
    uu = (ax - cx) / hw
    l = np.clip(-uu * .45 + np.sqrt(np.clip(1 - uu ** 2, 0, 1)) * .75, 0, 1) ** 1.8
    l *= 1 - .5 * np.clip(np.abs(ay - yc) / hh - .55, 0, 1)   # el borde del anillo cae en sombra
    edges = np.clip(np.abs(ay - yc) / hh - .7, 0, 1) * 1.5
    over(bronze(l, edges), aa(hw - np.abs(ax - cx)) * aa(hh - np.abs(ay - yc)))


for yc, hh in ((375.5, 2.2), (383, 1.4), (451, 1.8), (548, 1.3)):
    band(yc, hh)
# regatón (punta de abajo): cono de bronce corto
fh = 6.0
fm = (ay > by - fh) & (ay <= by + .5)
fw = half * (1.1 - .25 * np.clip((ay - (by - fh)) / fh, 0, 1))
fu = (ax - cx) / fw
fl = np.clip(-fu * .45 + np.sqrt(np.clip(1 - fu ** 2, 0, 1)) * .7, 0, 1) ** 1.8 * .7
over(bronze(fl, np.clip(np.abs(fu) - .7, 0, 1)), aa(fw - np.abs(ax - cx)) * aa(np.minimum(ay - (by - fh), by + .5 - ay)) * fm)

# ---------------------------------------------------------------- luna creciente con bisel
mcx, mcy, MR = tx + 1.0, ty - 19.0, 19.5
icx, icy, IR = mcx + 9.0, mcy - 2.0, 15.5
d_out = MR - np.hypot(ax - mcx, ay - mcy)               # >0 dentro del círculo exterior
d_in = np.hypot(ax - icx, ay - icy) - IR                 # >0 fuera del círculo interior
moon = aa(d_out) * aa(d_in)
edge_d = np.minimum(d_out, d_in)                          # distancia al borde más cercano
# normal aproximada del bisel: apunta hacia afuera del borde más cercano
nx_o, ny_o = (ax - mcx), (ay - mcy); no = np.hypot(nx_o, ny_o) + 1e-6
nx_i, ny_i = -(ax - icx), -(ay - icy); ni = np.hypot(nx_i, ny_i) + 1e-6
use_o = d_out < d_in
nx = np.where(use_o, nx_o / no, nx_i / ni); ny = np.where(use_o, ny_o / no, ny_i / ni)
bev = np.clip(1 - edge_d / 2.6, 0, 1)                     # 1 en el borde, 0 en la cara plana
light = np.array([-.62, -.78])                            # luz desde arriba-izquierda
face = .42 + .1 * noise(1.5, 1.5, 5)                      # cara plana: valor medio, con leve martillado
bevel_l = np.clip(.45 + 1.1 * (nx * light[0] + ny * light[1]), 0, 1)
lit = face * (1 - bev) + bevel_l * bev
rim_m = np.clip((nx * .8 + ny * -.3), 0, 1) * bev * .35   # reflejo cálido de la vela (derecha)
groove_r = MR - 5.2
groove = np.exp(-((np.hypot(ax - mcx, ay - mcy) - groove_r) / .45) ** 2) * aa(d_in - 2.5)
crev = np.clip(groove * .9 + bev * .25, 0, 1)
mcol = bronze(np.clip(lit + rim_m, 0, 1), crev) * (1 - groove[..., None] * .45)
# tres puntitos grabados (estrellas) sobre la cara de la luna
ang0 = np.arctan2(ay - mcy, ax - mcx)
for a in (-2.35, -3.0, 2.55):
    sx, sy = mcx + np.cos(a) * (MR - 9.5), mcy + np.sin(a) * (MR - 9.5)
    dot = np.exp(-(((ax - sx) ** 2 + (ay - sy) ** 2) / .55))
    mcol = mcol * (1 - dot[..., None] * .5) + np.array([210, 170, 105]) * dot[..., None] * .35
over(np.clip(mcol, 0, 255), moon)
# cuello: une el eje con la luna (bronce)
neck_m = aa(3.0 - np.abs(ax - (tx + .5))) * aa(np.minimum(ay - (ty - 4), ty + 4 - ay))
nl = np.clip(.55 - (ax - tx) / 7, 0, 1)
over(bronze(nl, np.zeros_like(nl)), neck_m)

# ---------------------------------------------------------------- reducir, igualar la luz del cuarto y acabado pintado
small = lambda img: cv2.resize(img, ((x1 - x0), (y1 - y0)), interpolation=cv2.INTER_AREA)
rgb_s = small(rgb * alpha[..., None]); a_s = small(alpha)
rgb_s = np.where(a_s[..., None] > 1e-3, rgb_s / np.maximum(a_s[..., None], 1e-3), 0).astype(np.float32)

src = np.array(Image.open(SRC).convert('RGB')).astype(np.float32)
full_L = src @ np.array([.299, .587, .114], np.float32)
# luz local por altura: luminancia del fondo alrededor del báculo (franja de 70 px), muy suavizada
band_L = cv2.GaussianBlur(full_L, (0, 0), 14)[y0:y1, x0:x1].mean(1)
rel = band_L / np.median(band_L)
rgb_s *= np.clip(.78 + .3 * rel, .72, 1.18)[:, None, None]
# tinte cálido del entorno (sin cambiar el valor)
amb = cv2.GaussianBlur(src[y0:y1, x0:x1], (0, 0), 18).reshape(-1, 3).mean(0)
rgb_s *= (1 + (amb / amb.mean() - 1) * .35)
# acabado pintado: suaviza en manchas sin perder bordes y agrega el grano del arte
rgb_s = cv2.bilateralFilter(np.clip(rgb_s, 0, 255).astype(np.float32), 3, 18, 2)
rgb_s += np.random.default_rng(5).normal(0, 2.4, rgb_s.shape)
a_s = cv2.GaussianBlur(a_s, (0, 0), .35)

# ---------------------------------------------------------------- sombras: contacto en el piso + proyectada sobre el mueble
yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32)
contact = np.exp(-(((xx - bx - 4) / 10) ** 2 + ((yy - by - 1.5) / 2.8) ** 2)) * .65
cast = cv2.GaussianBlur(np.roll(np.roll(a_s, 6, axis=1), 3, axis=0), (0, 0), 3.6) * .45
shadow = np.clip(np.maximum(contact, cast) * (1 - a_s), 0, 1)
out_a = a_s + shadow
out_rgb = (rgb_s * a_s[..., None] + np.array([10, 6, 4]) * shadow[..., None]) / np.maximum(out_a[..., None], 1e-3)
rgba = np.dstack([np.clip(out_rgb, 0, 255), np.clip(out_a, 0, 1) * 255]).astype(np.uint8)
Image.fromarray(rgba, 'RGBA').save(OUT, optimize=True)
m = rgba[..., 3] > 200
print('ok', OUT.name, rgba.shape, 'L mediana', np.median(rgba[..., :3][m] @ [.299, .587, .114]).round(1))
