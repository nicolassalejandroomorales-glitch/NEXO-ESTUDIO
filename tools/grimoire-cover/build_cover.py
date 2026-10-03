"""Portada del grimorio de Nexo, pintada 100 % con código (diseño original).

Cómo funciona (en simple):
  1. Se dibujan "máscaras" (siluetas en blanco y negro) de cada pieza: marcos, esquinas de bronce,
     medallón, runas, luna, gema, título, enredadera de hiedra grabada, broche...
  2. Con esas máscaras se arma un MAPA DE ALTURA (qué está en relieve y qué está hundido).
  3. De la altura se calcula hacia dónde mira cada punto (la "normal") y se ilumina como un objeto 3D:
     luz desde arriba a la izquierda, brillo especular en el oro y el bronce, sombra en los surcos.
  4. Cada material tiene su color: cuero verde, pan de oro gastado, bronce con pátina y una gema turquesa.
  5. Se exportan capas separadas para animar la apertura:
       grimoire-cover.webp        portada completa (sin broche)
       grimoire-cover-clasp.png   broche de cuero y bronce (se suelta antes de abrir)
       grimoire-cover-glow.png    runas, hexágono y gema "encendidos" (brillan durante la intro)
       grimoire-endpaper.webp     guarda interior (papel jaspeado) que se ve al girar la tapa

Uso:  python tools/grimoire-cover/build_cover.py
Fuentes: Cinzel y Cinzel Decorative (licencia OFL, en tools/grimoire-cover/fonts).
"""
from pathlib import Path
import math
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'dist/assets/grimoire'
OUT.mkdir(parents=True, exist_ok=True)
FONTS = Path(__file__).resolve().parent / 'fonts'
BW, BH = 1200, 1600            # unidades de diseño
S = 1.5                         # sobre-muestreo: se pinta a 1800x2400 y se reduce
W, H = int(BW * S), int(BH * S)
FINAL = (900, 1200)
rng = np.random.default_rng(2026)
C = (600, 800)                  # centro del medallón

Y, X = np.mgrid[0:H, 0:W].astype(np.float32)
ux, uy = X / S, Y / S           # coordenadas en unidades de diseño


def canvas():
    return Image.new('L', (W, H), 0)


def arr(img):
    return np.asarray(img, np.float32) / 255.0


def P(x, y):
    return (x * S, y * S)


def noise(sigma, seed, shape=(H, W)):
    g = np.random.default_rng(seed).normal(0, 1, shape).astype(np.float32)
    g = cv2.GaussianBlur(g, (0, 0), sigma * S)
    return g / (g.std() + 1e-6)


def dist_in(mask):
    m = (mask > .5).astype(np.uint8)
    return cv2.distanceTransform(m, cv2.DIST_L2, 5) / S


def bevel(mask, width):
    d = np.clip(dist_in(mask) / width, 0, 1)
    return 1 - (1 - d) ** 2


def soft(mask, s=.6):
    return cv2.GaussianBlur(mask.astype(np.float32), (0, 0), s * S)


# ------------------------------------------------------------------ formas base
def rounded_rect(x0, y0, x1, y1, r):
    im = canvas(); ImageDraw.Draw(im).rounded_rectangle([P(x0, y0), P(x1, y1)], r * S, fill=255); return arr(im)


def rect_line(inset, width, r=0):
    im = canvas(); d = ImageDraw.Draw(im)
    d.rounded_rectangle([P(inset, inset), P(BW - inset, BH - inset)], r * S, outline=255, width=max(1, int(width * S)))
    return arr(im)


def polyline_mask(polys, width, closed=False):
    im = canvas(); d = ImageDraw.Draw(im)
    for pts in polys:
        q = [P(*p) for p in pts]
        if closed:
            q = q + [q[0]]
        d.line(q, fill=255, width=max(1, int(width * S)), joint='curve')
        for p in (q[0], q[-1]):
            rr = width * S / 2
            d.ellipse([p[0] - rr, p[1] - rr, p[0] + rr, p[1] + rr], fill=255)
    return arr(im)


def circle(cx, cy, r):
    return (np.hypot(ux - cx, uy - cy) < r).astype(np.float32)


def ring(cx, cy, r0, r1):
    d = np.hypot(ux - cx, uy - cy)
    return ((d >= r0) & (d <= r1)).astype(np.float32)


def text_mask(txt, font_file, size, cy, tracking=0):
    font = ImageFont.truetype(str(FONTS / font_file), int(size * S))
    im = canvas(); d = ImageDraw.Draw(im)
    widths = [d.textlength(ch, font=font) for ch in txt]
    total = sum(widths) + tracking * S * (len(txt) - 1)
    x = W / 2 - total / 2
    asc, desc = font.getmetrics()
    for ch, w in zip(txt, widths):
        d.text((x, cy * S - (asc + desc) / 2), ch, font=font, fill=255)
        x += w + tracking * S
    return arr(im)


# ------------------------------------------------------------------ 1. cuero
board = rounded_rect(4, 4, BW - 4, BH - 4, 22)
edge_d = np.clip(dist_in(board) / 26, 0, 1)
h = (1 - (1 - edge_d) ** 3) * 1.2                     # cantos redondeados de la tapa
pebble = noise(2.2, 1) * .5 + noise(5, 2) * .35 + noise(1.0, 3) * .15     # grano del cuero (se aplica al final, solo en cuero)
# arrugas finas del cuero
creases = np.zeros((H, W), np.float32)
for k in range(46):
    x0, y0 = rng.uniform(0, BW), rng.uniform(0, BH)
    ang = rng.uniform(0, math.pi); ln = rng.uniform(30, 150)
    pts = [(x0 + math.cos(ang) * t + rng.normal(0, 2), y0 + math.sin(ang) * t + rng.normal(0, 2)) for t in np.linspace(0, ln, 8)]
    creases = np.maximum(creases, polyline_mask([pts], rng.uniform(.8, 1.6)) * rng.uniform(.3, 1))
h -= soft(creases, .8) * .09
# junta del lomo (la tapa se dobla aquí)
hinge = np.exp(-((ux - 58) / 5) ** 2) * (uy > 20) * (uy < BH - 20)
h -= hinge * .35

# ------------------------------------------------------------------ 2. marcos
gold = np.zeros((H, W), np.float32)                   # dónde hay pan de oro
bronze = np.zeros((H, W), np.float32)
outer_line = rect_line(62, 3, 10) + rect_line(74, 1.4, 8)
gold = np.maximum(gold, np.clip(outer_line, 0, 1))
h -= soft(np.clip(outer_line, 0, 1), .5) * .12        # filetes dorados: hundidos (grabado en caliente)
# panel interior en relieve
panel_band = np.clip(rect_line(128, 16, 14), 0, 1)
h += bevel(panel_band, 6) * .35
gold_panel_line = rect_line(128, 2.2, 14) + rect_line(146, 1.4, 10)
gold = np.maximum(gold, np.clip(gold_panel_line, 0, 1))

# ------------------------------------------------------------------ 3. hiedra grabada entre los marcos
def ivy_path():
    x0, y0, x1, y1 = 101, 101, BW - 101, BH - 101
    per = 2 * ((x1 - x0) + (y1 - y0))
    def at(s):
        s %= per
        if s < x1 - x0: return x0 + s, y0, (0, 1)
        s -= x1 - x0
        if s < y1 - y0: return x1, y0 + s, (-1, 0)
        s -= y1 - y0
        if s < x1 - x0: return x1 - s, y1, (0, -1)
        s -= x1 - x0
        return x0, y1 - s, (1, 0)
    return at, per


at, per = ivy_path()
stem = []; leaves = []
for s in np.arange(0, per, 3):
    x, y, n = at(s)
    off = math.sin(s / 34) * 7
    stem.append((x + n[0] * off, y + n[1] * off))
stem_mask = polyline_mask([stem], 2.6, closed=True)
leaf_im = canvas(); dl = ImageDraw.Draw(leaf_im)
for i, s in enumerate(np.arange(20, per, 54)):
    x, y, n = at(s)
    side = 1 if i % 2 else -1
    off = math.sin(s / 34) * 7
    bx, by = x + n[0] * off, y + n[1] * off
    tx, ty = n[1], -n[0]                                    # tangente
    lx, ly = n[0] * side, n[1] * side                       # hacia dónde apunta la hoja
    sz = 15 if i % 3 else 18
    cx_, cy_ = bx + lx * sz * .9, by + ly * sz * .9
    pts = []
    for k in range(10):                                     # hoja de hiedra de 5 lóbulos
        a = k / 10 * 2 * math.pi
        rr = sz * (0.62 + 0.38 * (k % 2 == 0))
        vx = math.cos(a) * rr; vy = math.sin(a) * rr
        pts.append(P(cx_ + vx * tx + vy * lx, cy_ + vx * ty + vy * ly))
    dl.polygon(pts, fill=255)
    dl.line([P(bx, by), P(cx_, cy_)], fill=255, width=int(1.6 * S))
leaf_mask = arr(leaf_im)
ivy = np.clip(stem_mask + leaf_mask, 0, 1)
h -= soft(ivy, .7) * .16                                    # grabado ciego (hundido, sin oro)
leaf_gilt = np.maximum(leaf_mask * (noise(14, 9) > -.2), stem_mask * (noise(20, 8) > .3) * .8)   # el oro se conserva a tramos
gold = np.maximum(gold, leaf_gilt * .9)

# ------------------------------------------------------------------ 4. rayos detrás del medallón
rays = np.zeros((H, W), np.float32)
ray_im = canvas(); dr = ImageDraw.Draw(ray_im)
for k in range(48):
    a = k / 48 * 2 * math.pi
    r0, r1 = 300, (430 if k % 2 == 0 else 372)
    dr.line([P(C[0] + math.cos(a) * r0, C[1] + math.sin(a) * r0), P(C[0] + math.cos(a) * r1, C[1] + math.sin(a) * r1)], fill=255, width=int((2.2 if k % 2 == 0 else 1.4) * S))
    if k % 2 == 0:
        ex, ey = C[0] + math.cos(a) * (r1 + 9), C[1] + math.sin(a) * (r1 + 9)
        dr.ellipse([P(ex - 3.5, ey - 3.5), P(ex + 3.5, ey + 3.5)], fill=255)
rays = arr(ray_im) * np.clip((np.hypot(ux - C[0], uy - C[1]) - 300) / 12, 0, 1)
h -= soft(rays, .5) * .1
gold = np.maximum(gold, rays * (noise(10, 11) > -.6))

# ------------------------------------------------------------------ 5. medallión de bronce con runas
R_OUT, R_IN = 272, 214
med_ring = ring(C[0], C[1], R_IN, R_OUT)
med_h = np.clip(np.minimum(np.hypot(ux - C[0], uy - C[1]) - R_IN, R_OUT - np.hypot(ux - C[0], uy - C[1])) / 14, 0, 1)
med_h = (1 - (1 - med_h) ** 2) * med_ring
h += med_h * .95
bronze = np.maximum(bronze, med_ring)
# filete fino en el centro del anillo (dos ranuras)
for rr in (R_IN + 9, R_OUT - 9):
    groove = np.exp(-((np.hypot(ux - C[0], uy - C[1]) - rr) / 1.3) ** 2) * med_ring
    h -= groove * .22
# perlas alrededor
beads = np.zeros((H, W), np.float32)
for k in range(72):
    a = k / 72 * 2 * math.pi
    bx, by = C[0] + math.cos(a) * (R_OUT + 13), C[1] + math.sin(a) * (R_OUT + 13)
    d = np.hypot(ux - bx, uy - by)
    beads = np.maximum(beads, np.clip(1 - (d / 5.2) ** 2, 0, 1))
h += np.sqrt(beads) * .55
bronze = np.maximum(bronze, (beads > 0).astype(np.float32))

# runas originales (trazos en una caja de -1..1; "arriba" apunta hacia afuera del anillo)
def circ(cx, cy, r, n=14):
    return [(cx + r * math.cos(t), cy + r * math.sin(t)) for t in np.linspace(0, 2 * math.pi, n)]


RUNES = [
    [[(0, -1), (0, 1)], [(0, -.2), (-.6, -.8)], [(0, .2), (.6, -.4)]],
    [circ(0, 0, .75), circ(0, 0, .12, 6)],
    [[(-.8, .7), (0, -.8), (.8, .7), (-.8, .7)], [(-.45, .1), (.45, .1)]],
    [[(math.cos(t) * .8, math.sin(t) * .8) for t in np.linspace(math.pi / 6, math.pi / 6 + 2 * math.pi, 7)]],
    [[(.3, -.9), (-.5, -.5), (-.6, .3), (-.1, .85), (.4, .75)]],
    [[(0, 1), (0, -1)], [(-.6, -.4), (0, -1), (.6, -.4)], [(-.5, .35), (.5, .35)]],
    [[(-.9, .2), (-.45, -.4), (0, .2), (.45, -.4), (.9, .2)], [(-.6, .7), (.6, .7)]],
    [[(-.5, -1), (-.5, 1)], [(.5, -1), (.5, 1)], [(-.5, 0), (0, -.5), (.5, 0), (0, .5), (-.5, 0)]],
    [circ(0, -.6, .16, 6), circ(-.6, .5, .16, 6), circ(.6, .5, .16, 6), [(0, -.4), (-.5, .4)], [(0, -.4), (.5, .4)]],
    [[(-.7, -.7), (.7, .7)], [(.7, -.7), (-.7, .7)], circ(0, 0, .45)],
    [[(0, -1), (.25, -.25), (1, 0), (.25, .25), (0, 1), (-.25, .25), (-1, 0), (-.25, -.25), (0, -1)]],
    [[(-.7, 1), (-.7, -.3), (0, -1), (.7, -.3), (.7, 1)], [(-.7, .3), (.7, .3)]],
]
rune_im = canvas(); drn = ImageDraw.Draw(rune_im)
R_MID = (R_IN + R_OUT) / 2
NR = 24
for k in range(NR):
    a = -math.pi / 2 + k / NR * 2 * math.pi
    glyph = RUNES[(k * 5) % len(RUNES)]
    cx_, cy_ = C[0] + math.cos(a) * R_MID, C[1] + math.sin(a) * R_MID
    out = (math.cos(a), math.sin(a)); tan = (-math.sin(a), math.cos(a))
    sc = 13
    for stroke in glyph:
        pts = [P(cx_ + (gx * tan[0] - gy * out[0]) * sc, cy_ + (gx * tan[1] - gy * out[1]) * sc) for gx, gy in stroke]
        drn.line(pts, fill=255, width=int(2.6 * S), joint='curve')
rune_mask = arr(rune_im) * med_ring
h -= soft(rune_mask, .5) * .4                               # runas grabadas en el bronce

# disco central (cuero hundido)
disc = circle(C[0], C[1], R_IN - 2)
h -= disc * .25
# hexágono dorado (guiño químico: anillo aromático) + círculo interior
hexa = [(C[0] + 168 * math.cos(math.pi / 6 + k * math.pi / 3), C[1] + 168 * math.sin(math.pi / 6 + k * math.pi / 3)) for k in range(6)]
hex_in = [(C[0] + 150 * math.cos(math.pi / 6 + k * math.pi / 3), C[1] + 150 * math.sin(math.pi / 6 + k * math.pi / 3)) for k in range(6)]
hex_mask = polyline_mask([hexa], 3, closed=True)
hex_mask = np.maximum(hex_mask, polyline_mask([hex_in[0:2], hex_in[2:4], hex_in[4:6]], 2))   # tres dobles enlaces
hex_dots = np.zeros((H, W), np.float32)
for (vx, vy) in hexa:
    hex_dots = np.maximum(hex_dots, circle(vx, vy, 7))
hex_all = np.clip(hex_mask + hex_dots, 0, 1) * disc
h -= soft(hex_all, .5) * .1
gold = np.maximum(gold, hex_all)

# luna creciente (relieve de oro) — abierta hacia arriba a la derecha
mc, mr = (C[0] - 18, C[1] + 6), 118
ic, ir = (C[0] + 30, C[1] - 26), 100
moon = circle(*mc, mr) * (1 - circle(*ic, ir))
h += bevel(moon, 10) * .7
gold = np.maximum(gold, moon)
# gema cabujón en el hueco de la luna
gc, gr = (C[0] + 34, C[1] - 30), 40
gem = circle(*gc, gr)
setting = ring(gc[0], gc[1], gr, gr + 9)
h += bevel(setting, 4) * .5 * setting
bronze = np.maximum(bronze, setting)
gd = np.clip(1 - (np.hypot(ux - gc[0], uy - gc[1]) / gr) ** 2, 0, 1)
h += np.sqrt(gd) * .9 * gem
# estrellitas de 4 puntas alrededor
def star4(cx, cy, r):
    pts = []
    for k in range(8):
        a = -math.pi / 2 + k * math.pi / 4
        rr = r if k % 2 == 0 else r * .3
        pts.append(P(cx + math.cos(a) * rr, cy + math.sin(a) * rr))
    im = canvas(); ImageDraw.Draw(im).polygon(pts, fill=255); return arr(im)


stars = np.zeros((H, W), np.float32)
for (sx, sy, sr) in ((C[0] - 95, C[1] - 95, 14), (C[0] + 104, C[1] + 70, 11), (C[0] - 70, C[1] + 118, 9), (C[0] + 120, C[1] - 120, 9)):
    stars = np.maximum(stars, star4(sx, sy, sr))
h += bevel(stars, 3) * .35
gold = np.maximum(gold, stars)

# ------------------------------------------------------------------ 6. textos
title = text_mask('NEXO', 'cinzel-decorative-latin-900-normal.woff', 150, 300, tracking=26)
h += bevel(title, 5) * .55
gold = np.maximum(gold, title)
sub = text_mask('GRIMORIO DEL CONOCIMIENTO', 'cinzel-latin-700-normal.woff', 40, 1196, tracking=6)
h += bevel(sub, 2.5) * .3
gold = np.maximum(gold, sub)
vol = text_mask('VOLUMEN  I', 'cinzel-latin-700-normal.woff', 28, 1272, tracking=9)
h += bevel(vol, 2) * .22
gold = np.maximum(gold, vol * .85)
# separadores con rombo
sep = polyline_mask([[(380, 400), (560, 400)], [(640, 400), (820, 400)], [(420, 1236), (560, 1236)], [(640, 1236), (780, 1236)]], 2)
for (dx, dy, r) in ((600, 400, 12), (600, 1236, 9)):
    sep = np.maximum(sep, star4(dx, dy, r))
gold = np.maximum(gold, sep)
h -= soft(sep, .5) * .08

# ------------------------------------------------------------------ 7. esquinas de bronce
corner = np.zeros((H, W), np.float32)
corner_holes = np.zeros((H, W), np.float32)
rivets = np.zeros((H, W), np.float32)
for fx, fy in ((0, 0), (1, 0), (0, 1), (1, 1)):
    lx = np.where(fx, BW - ux, ux); ly = np.where(fy, BH - uy, uy)
    plate = (lx < 236) & (ly < 236) & (np.hypot(lx - 250, ly - 250) > 206) & (lx > 6) & (ly > 6)
    corner = np.maximum(corner, plate.astype(np.float32))
    hole = (np.hypot(lx - 70, ly - 70) < 24) & ~(np.hypot(lx - 82, ly - 60) < 20)      # lunita calada
    hole |= (np.hypot(lx - 150, ly - 34) < 8) | (np.hypot(lx - 34, ly - 150) < 8)
    corner_holes = np.maximum(corner_holes, hole.astype(np.float32))
    for (rx, ry) in ((30, 30), (196, 22), (22, 196), (110, 110)):
        d = np.hypot(lx - rx, ly - ry)
        rivets = np.maximum(rivets, np.clip(1 - (d / 7.5) ** 2, 0, 1))
corner = corner * (1 - corner_holes)
h += bevel(corner, 8) * .9 + np.sqrt(rivets) * .5
bronze = np.maximum(bronze, corner)
bronze = np.maximum(bronze, (rivets > 0).astype(np.float32))
# líneas grabadas en las esquinas (siguen la curva)
cl = np.zeros((H, W), np.float32)
for fx, fy in ((0, 0), (1, 0), (0, 1), (1, 1)):
    lx = np.where(fx, BW - ux, ux); ly = np.where(fy, BH - uy, uy)
    cl = np.maximum(cl, np.exp(-((np.hypot(lx - 250, ly - 250) - 222) / 1.4) ** 2) * (lx < 230) * (ly < 230))
h -= cl * corner * .25

# grano: el cuero es rugoso; el metal y el oro en relieve son lisos (con un martillado muy fino en el bronce)
metal = np.clip(title + sub + vol + moon + stars + med_ring + (beads > 0) + corner + setting + gem + (rivets > 0), 0, 1)
metal_s = soft(metal, 1.2)
h += pebble * .055 * (1 - metal_s)
h += noise(1.3, 60) * .012 * np.clip(bronze, 0, 1)

# ------------------------------------------------------------------ 8. iluminación
def shade(height, strength=26.0):
    gy, gx = np.gradient(cv2.GaussianBlur(height, (0, 0), .6 * S))
    nx, ny, nz = -gx * strength, -gy * strength, np.ones_like(height)
    n = np.sqrt(nx ** 2 + ny ** 2 + nz ** 2)
    return nx / n, ny / n, nz / n


nx, ny, nz = shade(h)
L = np.array([-.48, -.62, .62]); L /= np.linalg.norm(L)
V = np.array([0, 0, 1.0]); Hv = (L + V) / np.linalg.norm(L + V)
diff = np.clip(nx * L[0] + ny * L[1] + nz * L[2], 0, 1)
ndh = np.clip(nx * Hv[0] + ny * Hv[1] + nz * Hv[2], 0, 1)
ao = np.clip(1 - np.clip(cv2.GaussianBlur(h, (0, 0), 7 * S) - h, 0, None) * 1.6, .35, 1)

# albedos
blot = noise(70, 21)
leather = np.dstack([np.full((H, W), 34), np.full((H, W), 58), np.full((H, W), 44)]).astype(np.float32)
leather *= (1 + blot * .10)[..., None]
leather += (noise(25, 22) * 4)[..., None]
# desgaste: cantos y esquinas más claros y pardos
wear = np.clip(1 - edge_d * 1.6, 0, 1) * (noise(4, 23) * .5 + .7)
wear = np.clip(wear + np.clip(noise(30, 24) - 1.6, 0, 1) * .5, 0, 1)
leather = leather * (1 - wear[..., None] * .55) + np.array([92, 78, 52], np.float32) * wear[..., None] * .55

gold_worn = gold * np.clip(.62 + noise(5, 30) * .32 + .32 * (1 - wear) + metal_s * .62, 0, 1)
gold_worn = np.clip(gold_worn, 0, 1)
gold_alb = np.array([200, 156, 74], np.float32) * (1 + noise(12, 31) * .05)[..., None]
bronze_alb = np.array([118, 82, 44], np.float32) * (1 + noise(3, 32) * .08)[..., None]
patina = np.clip((1 - ao) * 2.2 + np.clip(noise(5, 33) - .8, 0, 1) * .5, 0, 1)
bronze_alb = bronze_alb * (1 - patina[..., None] * .55) + np.array([62, 104, 88], np.float32) * patina[..., None] * .55

amb = .36
col_leather = leather * (amb + diff * .95)[..., None] * ao[..., None] + (ndh ** 18 * 18)[..., None]
col_gold = gold_alb * (amb * .8 + diff * 1.05)[..., None] * ao[..., None] + (ndh ** 34 * 210)[..., None] * np.array([1, .9, .7])
col_bronze = bronze_alb * (amb + diff * 1.0)[..., None] * ao[..., None] + (ndh ** 26 * 140)[..., None] * np.array([1, .85, .65])
# gema turquesa: luz interior + reflejo
gdist = np.hypot(ux - gc[0], uy - gc[1]) / gr
gem_col = np.array([18, 92, 96], np.float32) + np.array([60, 160, 150], np.float32) * np.clip(1 - np.hypot(ux - gc[0] - 8, uy - gc[1] - 10) / gr, 0, 1)[..., None] ** 1.5
gem_col += (ndh ** 60 * 255)[..., None]
gem_col *= np.clip(1.1 - gdist * .35, 0, 1.2)[..., None]

img = col_leather
bm = soft(np.clip(bronze, 0, 1), .4)[..., None]
img = img * (1 - bm) + col_bronze * bm
gm = soft(gold_worn, .4)[..., None]
img = img * (1 - gm) + col_gold * gm
gem_m = soft(gem, .5)[..., None]
img = img * (1 - gem_m) + gem_col * gem_m
# viñeta suave y grano
pool = 1.07 - .16 * np.clip((ux / BW) * .55 + (uy / BH) * .45, 0, 1)   # charco de luz arriba a la izquierda
vign = pool - .28 * np.clip((np.hypot((ux - BW / 2) / (BW * .62), (uy - BH / 2) / (BH * .62))) - .45, 0, 1)
img *= vign[..., None]
img += np.random.default_rng(7).normal(0, 2.0, img.shape)
img = np.clip(img, 0, 255)
alpha = soft(board, .5)

# ------------------------------------------------------------------ 9. broche (capa aparte)
strap = rounded_rect(1018, 724, BW - 2, 876, 8)
plate = rounded_rect(988, 700, 1100, 900, 26)
s_h = bevel(strap, 6) * .5 + noise(1.4, 40) * .05
stitch = np.zeros((H, W), np.float32)
for yy in (736, 864):
    for xx in np.arange(1112, BW - 8, 15):
        stitch = np.maximum(stitch, rounded_rect(xx, yy - 1.5, xx + 8, yy + 1.5, 1.5))
s_h -= soft(stitch, .4) * .15
p_h = bevel(plate, 10) * 1.1
key = circle(1044, 784, 13) + (np.abs(ux - 1044) < 5) * (uy > 784) * (uy < 822)
key = np.clip(key, 0, 1) * plate
p_h -= soft(key, .5) * .6
p_riv = np.zeros((H, W), np.float32)
for (rx, ry) in ((1010, 722), (1078, 722), (1010, 878), (1078, 878)):
    p_riv = np.maximum(p_riv, np.clip(1 - (np.hypot(ux - rx, uy - ry) / 7) ** 2, 0, 1))
p_h += np.sqrt(p_riv) * .45
p_line = np.exp(-((np.minimum.reduce([ux - 988, 1100 - ux, uy - 700, 900 - uy]) - 9) / 1.2) ** 2) * plate
p_h -= p_line * .25
clasp_h = np.where(plate > .5, p_h + .9, s_h + .4)
cx_n, cy_n, cz_n = shade(clasp_h)
cdiff = np.clip(cx_n * L[0] + cy_n * L[1] + cz_n * L[2], 0, 1)
cndh = np.clip(cx_n * Hv[0] + cy_n * Hv[1] + cz_n * Hv[2], 0, 1)
strap_col = np.array([70, 44, 26], np.float32) * (1 + noise(8, 41) * .08)[..., None] * (amb + cdiff * .95)[..., None] + (cndh ** 16 * 20)[..., None]
strap_col = np.where(stitch[..., None] > .5, np.array([150, 128, 92], np.float32) * (amb + cdiff)[..., None], strap_col)
cpat = np.clip(np.clip(noise(4, 42) - .7, 0, 1) * .6 + key * .6, 0, 1)
plate_alb = np.array([124, 88, 46], np.float32) * (1 - cpat[..., None] * .5) + np.array([62, 104, 88], np.float32) * cpat[..., None] * .5
plate_col = plate_alb * (amb + cdiff * 1.05)[..., None] + (cndh ** 28 * 150)[..., None] * np.array([1, .86, .66])
pm = soft(plate, .5)[..., None]
clasp_rgb = strap_col * (1 - pm) + plate_col * pm
clasp_a = np.clip(soft(np.clip(strap + plate, 0, 1), .5), 0, 1)
# sombra del broche sobre la tapa
shadow = cv2.GaussianBlur(np.roll(np.roll(clasp_a, int(6 * S), 0), int(-5 * S), 1), (0, 0), 6 * S) * .55 * (1 - clasp_a)
clasp_out_a = np.clip(clasp_a + shadow, 0, 1)
clasp_out = (clasp_rgb * clasp_a[..., None] + np.array([6, 8, 6]) * shadow[..., None]) / np.maximum(clasp_out_a[..., None], 1e-3)

# ------------------------------------------------------------------ 10. capa de brillo (intro)
glow_src = np.clip(rune_mask * 1.0 + hex_all * .8 + gem * .9 + moon * .25, 0, 1)
glow = cv2.GaussianBlur(glow_src, (0, 0), 3 * S) * .9 + cv2.GaussianBlur(glow_src, (0, 0), 12 * S) * .7 + glow_src * .6
glow = np.clip(glow, 0, 1)
glow_rgb = np.zeros((H, W, 3), np.float32) + np.array([255, 214, 138], np.float32)
gem_tint = np.clip(cv2.GaussianBlur(gem, (0, 0), 14 * S) * 1.6, 0, 1)[..., None]
glow_rgb = glow_rgb * (1 - gem_tint) + np.array([150, 255, 236], np.float32) * gem_tint


# ------------------------------------------------------------------ 11. exportar
def down(rgb, a):
    small_a = cv2.resize(a, FINAL, interpolation=cv2.INTER_AREA)
    small = cv2.resize(rgb * a[..., None], FINAL, interpolation=cv2.INTER_AREA) / np.maximum(small_a[..., None], 1e-3)
    return np.dstack([np.clip(small, 0, 255), np.clip(small_a, 0, 1) * 255]).astype(np.uint8)


cover = down(img, alpha)
Image.fromarray(cover, 'RGBA').save(OUT / 'grimoire-cover.webp', quality=90, method=6)
Image.fromarray(down(clasp_out, clasp_out_a), 'RGBA').save(OUT / 'grimoire-cover-clasp.png', optimize=True)
Image.fromarray(down(glow_rgb, glow), 'RGBA').save(OUT / 'grimoire-cover-glow.webp', quality=88, method=6)
# vista previa con el broche puesto (para revisar)
prev = Image.fromarray(cover, 'RGBA'); prev.alpha_composite(Image.open(OUT / 'grimoire-cover-clasp.png'))
prev.save(ROOT / 'tools/grimoire-cover/preview.webp', quality=85)

# ------------------------------------------------------------------ 12. guarda interior (papel jaspeado)
EW, EH = 600, 800
yy, xx = np.mgrid[0:EH, 0:EW].astype(np.float32)
def n2(sig, seed):
    g = np.random.default_rng(seed).normal(0, 1, (EH, EW)).astype(np.float32)
    g = cv2.GaussianBlur(g, (0, 0), sig); return g / (g.std() + 1e-6)
wx = xx + n2(46, 50) * 30 + n2(14, 51) * 7
wy = yy + n2(46, 52) * 30 + n2(14, 53) * 7
# jaspeado tipo "peine": muchas vetas finas y onduladas, poco contraste (que no compita con el contenido)
comb = np.sin(wx / 7.5 + np.sin(wy / 41) * 3.1) * .5 + .5
swirl = np.sin(wy / 19 + np.sin(wx / 63) * 2.2 + n2(30, 54) * 1.4) * .5 + .5
base = np.array([33, 58, 47], np.float32)
dark = np.array([22, 40, 34], np.float32); mid = np.array([58, 86, 70], np.float32); gold_v = np.array([170, 138, 80], np.float32)
ep = base + (dark - base) * (swirl[..., None] ** 2) * .9 + (mid - base) * (comb[..., None] ** 6) * .7
ep = ep * (1 - (comb[..., None] ** 40) * .38) + gold_v * (comb[..., None] ** 40) * .38
ep += np.random.default_rng(55).normal(0, 2.0, ep.shape)
Image.fromarray(np.clip(ep, 0, 255).astype(np.uint8), 'RGB').save(OUT / 'grimoire-endpaper.webp', quality=86, method=6)
for f in sorted(OUT.iterdir()):
    print(f.name, f.stat().st_size // 1024, 'KB')
