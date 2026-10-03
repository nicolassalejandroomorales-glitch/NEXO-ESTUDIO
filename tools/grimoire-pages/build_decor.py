"""Decoración de las páginas del grimorio, una por ramo, dibujada con código como si fuera tinta a mano.

Para cada ramo se generan tres SVG en dist/assets/grimoire/decor/:
  <ramo>-tile.svg   fondo que se repite: muchos motivos pequeños y tenues
  <ramo>-hero.svg   ilustración grande para la esquina superior de la página derecha
  <ramo>-foot.svg   viñeta ancha para el pie de la página izquierda
y además index-tile.svg (mezcla de los cuatro ramos) para el índice.

Ramos:
  organica   moléculas: benceno, piridina, naftaleno, silla de ciclohexano, cadenas, flechas de mecanismo
  analitica  bureta, matraces, pipeta, curva de titulación, cromatograma, ecuaciones de equilibrio
  fisico     ΔG = ΔH − TΔS, diagrama de energía, isotermas, Jablonski, Michaelis–Menten, Arrhenius
  fisio      corazón, ECG, neurona, glóbulos rojos, arteria con placa, pulmones, célula

El trazo tiene un leve temblor (como pluma) y a veces una segunda pasada más suave.
Uso: python tools/grimoire-pages/build_decor.py
"""
from pathlib import Path
import math
import random

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'dist/assets/grimoire/decor'
OUT.mkdir(parents=True, exist_ok=True)
INK = {'organica': '#7a3a22', 'analitica': '#1d5958', 'fisico': '#2c4a82', 'fisio': '#5a3770', 'index': '#5b4426'}
FONT = "Georgia,'Iowan Old Style','Times New Roman',serif"


class Ink:
    """Lienzo de tinta: acumula trazos SVG con temblor de pluma."""

    def __init__(self, seed, color, width=1.6):
        self.r = random.Random(seed)
        self.color = color
        self.w = width
        self.items = []

    # -- utilidades
    def _jit(self, pts, amp=.55, step=9):
        out = []
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            L = math.hypot(x1 - x0, y1 - y0)
            n = max(1, int(L / step))
            nx, ny = (-(y1 - y0) / L, (x1 - x0) / L) if L else (0, 0)
            for i in range(n):
                t = i / n
                j = self.r.uniform(-amp, amp) if 0 < i else 0
                out.append((x0 + (x1 - x0) * t + nx * j, y0 + (y1 - y0) * t + ny * j))
        out.append(pts[-1])
        return out

    @staticmethod
    def _d(pts, closed=False):
        d = 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in pts)
        return d + (' Z' if closed else '')

    def path(self, d, w=None, fill='none', op=1, dash=None, extra=''):
        da = f' stroke-dasharray="{dash}"' if dash else ''
        self.items.append(f'<path d="{d}" fill="{fill}" stroke="{self.color if fill == "none" else "none"}" stroke-width="{w or self.w}" stroke-linecap="round" stroke-linejoin="round" opacity="{op}"{da}{extra}/>')

    def line(self, pts, w=None, closed=False, op=1, sketch=True, dash=None):
        if closed:
            pts = pts + [pts[0]]
        self.path(self._d(self._jit(pts)), w, op=op, dash=dash)
        if sketch and self.r.random() < .45 and not dash:
            self.path(self._d(self._jit(pts, amp=1.0)), (w or self.w) * .55, op=op * .45)

    def circle(self, cx, cy, r, w=None, op=1, n=None):
        n = n or max(14, int(r * .9))
        start = self.r.uniform(0, 6.28)
        pts = [(cx + r * math.cos(start + 2 * math.pi * k / n), cy + r * math.sin(start + 2 * math.pi * k / n)) for k in range(n + 1)]
        self.line(pts, w, op=op)

    def ellipse(self, cx, cy, rx, ry, rot=0, w=None, op=1, a0=0, a1=2 * math.pi, n=40):
        c, s = math.cos(rot), math.sin(rot)
        pts = []
        for k in range(n + 1):
            a = a0 + (a1 - a0) * k / n
            x, y = rx * math.cos(a), ry * math.sin(a)
            pts.append((cx + x * c - y * s, cy + x * s + y * c))
        self.line(pts, w, op=op)

    def dot(self, x, y, r=1.8, op=1):
        self.items.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="{self.color}" opacity="{op}"/>')

    def text(self, x, y, s, size=16, italic=True, anchor='middle', op=1, weight='normal'):
        st = 'italic' if italic else 'normal'
        s = s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        self.items.append(f'<text x="{x:.1f}" y="{y:.1f}" font-family="{FONT}" font-size="{size}" font-style="{st}" font-weight="{weight}" fill="{self.color}" text-anchor="{anchor}" opacity="{op}">{s}</text>')

    def arrow_head(self, x, y, ang, size=7, w=None):
        a1, a2 = ang + math.pi - .45, ang + math.pi + .45
        self.line([(x + size * math.cos(a1), y + size * math.sin(a1)), (x, y), (x + size * math.cos(a2), y + size * math.sin(a2))], w, sketch=False)

    def curved_arrow(self, p0, p1, bend=.4, w=None, head=True):
        (x0, y0), (x1, y1) = p0, p1
        mx, my = (x0 + x1) / 2, (y0 + y1) / 2
        dx, dy = x1 - x0, y1 - y0
        cx, cy = mx - dy * bend, my + dx * bend
        pts = [((1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1, (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y1) for t in [i / 16 for i in range(17)]]
        self.line(pts, w, sketch=False)
        if head:
            self.arrow_head(x1, y1, math.atan2(y1 - pts[-3][1], x1 - pts[-3][0]), w=w)

    def arrow(self, p0, p1, w=None, size=7):
        self.line([p0, p1], w, sketch=False)
        self.arrow_head(p1[0], p1[1], math.atan2(p1[1] - p0[1], p1[0] - p0[0]), size, w)

    def group(self, fn, x, y, rot=0, sc=1):
        start = len(self.items)
        fn(self)
        inner = ''.join(self.items[start:])
        del self.items[start:]
        self.items.append(f'<g transform="translate({x:.1f} {y:.1f}) rotate({rot:.1f}) scale({sc:.3f})">{inner}</g>')

    def svg(self, w, h, opacity=1):
        # la opacidad va "horneada" en el SVG: así CSS puede apilar varias capas en un solo fondo
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">'
                f'<g opacity="{opacity}">' + ''.join(self.items) + '</g></svg>')


# ====================================================================== ORGÁNICA
def hexagon(cx, cy, r, rot=0):
    return [(cx + r * math.cos(rot + math.pi / 6 + k * math.pi / 3), cy + r * math.sin(rot + math.pi / 6 + k * math.pi / 3)) for k in range(6)]


def benzene(ink, cx, cy, r=26, rot=0, mode='kekule', subs=(), hetero=None):
    v = hexagon(cx, cy, r, rot)
    for k in range(6):
        a, b = v[k], v[(k + 1) % 6]
        if hetero is not None and (k == hetero or (k + 1) % 6 == hetero):
            # acortar el enlace junto al heteroátomo para dejar espacio a la letra
            h = v[hetero]
            if k == hetero:
                a = (h[0] + (b[0] - h[0]) * .32, h[1] + (b[1] - h[1]) * .32)
            else:
                b = (h[0] + (a[0] - h[0]) * .32, h[1] + (a[1] - h[1]) * .32)
        ink.line([a, b])
        if mode == 'kekule' and k % 2 == 0:
            # doble enlace interior
            ia = (cx + (v[k][0] - cx) * .78, cy + (v[k][1] - cy) * .78)
            ib = (cx + (v[(k + 1) % 6][0] - cx) * .78, cy + (v[(k + 1) % 6][1] - cy) * .78)
            ia = (ia[0] + (ib[0] - ia[0]) * .12, ia[1] + (ib[1] - ia[1]) * .12)
            ib = (ib[0] + (ia[0] - ib[0]) * .12, ib[1] + (ia[1] - ib[1]) * .12)
            ink.line([ia, ib], ink.w * .9, sketch=False)
    if mode == 'circle':
        ink.circle(cx, cy, r * .58, ink.w * .9)
    if hetero is not None:
        hx, hy = v[hetero]
        ink.text(hx, hy + 6, 'N', 17, italic=False)
    for k, label in subs:
        vx, vy = v[k]
        ux, uy = (vx - cx) / r, (vy - cy) / r
        ex, ey = vx + ux * r * .95, vy + uy * r * .95
        ink.line([(vx, vy), (ex, ey)])
        if label:
            ink.text(ex + ux * 16, ey + uy * 14 + 6, label, 15, italic=False)
    return v


def naphthalene(ink, cx, cy, r=24):
    benzene(ink, cx - r * .866, cy, r, 0, 'kekule')
    v = hexagon(cx + r * .866, cy, r, 0)
    for k in range(6):
        if k in (2,):
            continue
        ink.line([v[k], v[(k + 1) % 6]])
    ink.circle(cx + r * .866, cy, r * .56, ink.w * .9)


def chair(ink, cx, cy, s=1):
    pts = [(-46, 4), (-22, -10), (6, 2), (34, -12), (52, 2), (26, 16), (-2, 4), (-30, 18)]
    P = [(cx + x * s, cy + y * s) for x, y in [(-46, 4), (-22, -12), (8, -2), (40, -14), (52, 2), (28, 14), (-4, 4), (-36, 16)]]
    ring = [P[0], P[1], P[2], P[3], P[4], P[5], P[6], P[7]]
    ink.line([(cx - 46 * s, cy + 2 * s), (cx - 20 * s, cy - 12 * s), (cx + 10 * s, cy - 2 * s), (cx + 40 * s, cy - 16 * s), (cx + 52 * s, cy + 2 * s), (cx + 26 * s, cy + 16 * s), (cx - 4 * s, cy + 6 * s), (cx - 34 * s, cy + 20 * s)], closed=True)
    # enlaces axiales
    ink.line([(cx - 20 * s, cy - 12 * s), (cx - 20 * s, cy - 38 * s)])
    ink.line([(cx + 26 * s, cy + 16 * s), (cx + 26 * s, cy + 42 * s)])


def zigzag(ink, x, y, n=5, step=26, groups=None):
    groups = groups or {}
    pts = [(x + i * step * .866, y + (0 if i % 2 == 0 else -step * .5)) for i in range(n)]
    ink.line(pts)
    for i, g in groups.items():
        px, py = pts[i]
        up = i % 2 == 1
        ey = py - 26 if up else py + 26
        if g == '=O':
            ink.line([(px - 3, py), (px - 3, ey)])
            ink.line([(px + 3, py), (px + 3, ey)])
            ink.text(px, ey - 5 if up else ey + 15, 'O', 16, italic=False)
        else:
            ink.line([(px, py), (px, ey)])
            ink.text(px, ey - 5 if up else ey + 15, g, 14, italic=False)
    return pts


def wedge_center(ink, cx, cy):
    ink.text(cx, cy + 5, 'C', 15, italic=False)
    ink.path(f'M{cx + 8} {cy - 2} L{cx + 40} {cy - 14} L{cx + 41} {cy - 6} Z', fill=ink.color, op=.95)
    for k in range(6):
        t = (k + 1) / 7
        x = cx + 8 + 32 * t
        h = 1 + 5 * t
        ink.line([(x, cy + 6 + 10 * t - h), (x, cy + 6 + 10 * t + h)], ink.w * .8, sketch=False)
    ink.line([(cx - 8, cy - 4), (cx - 32, cy - 20)])
    ink.line([(cx, cy - 10), (cx, cy - 36)])


def org_carbonyl_attack(ink, x, y):
    ink.text(x - 70, y + 6, 'Nu:', 16)
    ink.text(x - 44, y - 8, '⁻', 14, italic=False)
    ink.line([(x - 10, y + 14), (x + 10, y)])
    ink.line([(x + 10, y), (x + 34, y + 14)])
    ink.line([(x + 10, y), (x + 10, y - 28)])
    ink.line([(x + 16, y), (x + 16, y - 28)], ink.w * .9)
    ink.text(x + 13, y - 34, 'O', 16, italic=False)
    ink.text(x + 26, y + 32, 'δ+', 12)
    ink.text(x + 32, y - 40, 'δ−', 12)
    ink.curved_arrow((x - 48, y - 4), (x + 4, y - 6), bend=-.45)
    ink.curved_arrow((x + 13, y - 14), (x + 30, y - 40), bend=.6)


def org_motifs():
    return [
        lambda k: benzene(k, 0, 0, 26, 0, 'kekule'),
        lambda k: benzene(k, 0, 0, 24, 0, 'circle', subs=[(4, 'NH₂')]),
        lambda k: benzene(k, 0, 0, 25, 0, 'kekule', hetero=1),
        lambda k: benzene(k, 0, 0, 25, 0, 'circle', subs=[(0, 'OH'), (3, None)]),
        lambda k: naphthalene(k, 0, 0, 22),
        lambda k: chair(k, 0, 0, .9),
        lambda k: zigzag(k, -60, 0, 6, 24, {2: '=O', 5: 'OH'}),
        lambda k: zigzag(k, -50, 0, 5, 24, {1: 'NH₂'}),
        lambda k: wedge_center(k, 0, 0),
        lambda k: org_carbonyl_attack(k, 0, 0),
        lambda k: (k.text(0, 0, 'pKa ≈ 4,6', 15), k.text(0, 22, 'sp²', 13)),
        lambda k: (k.text(0, 0, 'R–NH₂ + H⁺ ⇌ R–NH₃⁺', 14)),
    ]


def org_hero(k):
    # anilina: el par libre del N entra al anillo (flechas curvas de resonancia)
    v = benzene(k, 150, 220, 62, 0, 'kekule')
    vx, vy = v[4]
    k.line([(vx, vy), (vx + 8, vy - 58)])
    k.text(vx + 14, vy - 66, 'NH₂', 24, italic=False)
    k.dot(vx + 4, vy - 92, 2.4); k.dot(vx + 13, vy - 92, 2.4)
    k.curved_arrow((vx + 6, vy - 84), (vx + 2, vy - 16), bend=.55, w=1.8)
    k.curved_arrow(((v[4][0] + v[5][0]) / 2 + 6, (v[4][1] + v[5][1]) / 2 + 10), (v[5][0] + 4, v[5][1] + 22), bend=-.5, w=1.8)
    k.text(255, 330, 'deslocalización', 16)
    k.text(265, 352, 'del par libre', 16)
    # piridina pequeña
    benzene(k, 320, 120, 32, 0, 'kekule', hetero=1)
    k.text(320, 190, 'piridina', 14)


def org_foot(k):
    pts = zigzag(k, 20, 80, 8, 30, {3: '=O', 7: 'OH'})
    k.arrow((250, 70), (330, 70))
    k.text(290, 58, '1) LDA', 13); k.text(290, 96, '2) R–X', 13)
    benzene(k, 400, 74, 26, 0, 'circle', subs=[(0, None)])
    k.text(468, 80, '⇌', 22, italic=False)


# ====================================================================== ANALÍTICA
def erlenmeyer(k, x, y, s=1, liquid=True):
    P = lambda a, b: (x + a * s, y + b * s)
    k.line([P(-8, -60), P(-8, -30), P(-38, 30), P(-38, 36), P(38, 36), P(38, 30), P(8, -30), P(8, -60)])
    k.line([P(-11, -60), P(11, -60)])
    if liquid:
        k.line([P(-27, 8), P(-12, 10), P(4, 7), P(27, 9)], k.w * .8)
        for bx, by, br in ((-10, 22, 2.5), (6, 18, 2), (14, 26, 3)):
            k.circle(*P(bx, by), br * s, k.w * .7)
    for t in range(3):
        k.line([P(20, 24 - t * 9), P(28, 24 - t * 9)], k.w * .7, sketch=False)


def burette(k, x, y, s=1):
    P = lambda a, b: (x + a * s, y + b * s)
    k.line([P(-7, -150), P(-7, 40), P(-3, 52), P(-3, 70)])
    k.line([P(7, -150), P(7, 40), P(3, 52), P(3, 70)])
    for i in range(18):
        L = 6 if i % 5 == 0 else 3
        k.line([P(-7, -140 + i * 10), P(-7 + L, -140 + i * 10)], k.w * .6, sketch=False)
    k.line([P(-16, 46), P(16, 46)], k.w * 1.3)
    k.circle(*P(19, 46), 3.5 * s, k.w * .8)
    k.path(f'M{x} {y + 80 * s} q {-4 * s} {6 * s} 0 {9 * s} q {4 * s} {-3 * s} 0 {-9 * s}', w=k.w * .9)
    k.line([P(-6, -40), P(6, -38)], k.w * .8)


def vol_flask(k, x, y, s=1):
    P = lambda a, b: (x + a * s, y + b * s)
    k.line([P(-6, -80), P(-6, -18)])
    k.line([P(6, -80), P(6, -18)])
    k.ellipse(x, y + 12 * s, 32 * s, 31 * s, 0, a0=-math.pi / 2 + .2, a1=3 * math.pi / 2 - .2)
    k.line([P(-10, -55), P(10, -55)], k.w * .8)


def pipette(k, x, y, s=1):
    P = lambda a, b: (x + a * s, y + b * s)
    k.line([P(-2, -90), P(-2, -30)]); k.line([P(2, -90), P(2, -30)])
    k.ellipse(x, y, 7 * s, 26 * s)
    k.line([P(-2, 26), P(0, 70), P(2, 26)])
    k.line([P(-6, -70), P(6, -70)], k.w * .7)


def axes(k, x, y, w, h, xl='', yl=''):
    k.arrow((x, y), (x + w, y), size=6)
    k.arrow((x, y), (x, y - h), size=6)
    if xl:
        k.text(x + w - 4, y + 18, xl, 13)
    if yl:
        k.text(x - 6, y - h - 6, yl, 13)


def titration(k, x, y, w=170, h=110):
    axes(k, x, y, w, h, 'V (mL)', 'pH')
    pts = []
    for i in range(41):
        t = i / 40
        v = 1 / (1 + math.exp(-(t - .55) * 22))
        pts.append((x + 8 + t * (w - 20), y - 12 - (h - 24) * (.15 + .75 * v)))
    k.line(pts)
    ex = x + 8 + .55 * (w - 20)
    k.line([(ex, y), (ex, y - h * .55)], k.w * .7, dash='3 4')
    k.text(ex + 4, y + 18, 'V eq', 11)


def chromatogram(k, x, y, w=180, h=70):
    pts = []
    for i in range(91):
        t = i / 90
        v = sum(a * math.exp(-((t - c) / s) ** 2) for a, c, s in ((.9, .2, .025), (.5, .42, .03), (1.0, .63, .02), (.35, .82, .04)))
        pts.append((x + t * w, y - v * h))
    k.line(pts)
    k.line([(x, y), (x + w, y)], k.w * .7)
    k.text(x + w - 6, y + 16, 't (min)', 11)


def beaker(k, x, y, s=1):
    P = lambda a, b: (x + a * s, y + b * s)
    k.line([P(-30, -40), P(-28, 34), P(28, 34), P(30, -40), P(36, -46)])
    for i in range(4):
        k.line([P(-28, 20 - i * 14), P(-18, 20 - i * 14)], k.w * .7, sketch=False)
    k.line([P(-26, -6), P(26, -8)], k.w * .8)


def ana_motifs():
    return [
        lambda k: erlenmeyer(k, 0, 0, .9),
        lambda k: burette(k, 0, 0, .7),
        lambda k: vol_flask(k, 0, 0, .9),
        lambda k: pipette(k, 0, 0, .8),
        lambda k: beaker(k, 0, 0, .9),
        lambda k: titration(k, -80, 50, 150, 95),
        lambda k: chromatogram(k, -80, 30, 160, 60),
        lambda k: k.text(0, 0, 'pH = −log[H₃O⁺]', 15),
        lambda k: (k.text(0, -12, 'Ka = [H₃O⁺][A⁻]', 14), k.line([(-62, -2), (62, -2)], 1, sketch=False), k.text(0, 16, '[HA]', 14)),
        lambda k: k.text(0, 0, 'A = ε · b · c', 15),
        lambda k: k.text(0, 0, 'Kps = [Ag⁺][Cl⁻]', 14),
    ]


def ana_hero(k):
    k.line([(170, 30), (170, 380)], 2.2)            # soporte
    k.line([(120, 380), (260, 380)], 2.4)
    k.line([(170, 120), (215, 120)], 1.8)
    k.circle(170, 120, 6, 1.4)
    burette(k, 220, 150, 1.0)
    erlenmeyer(k, 220, 320, 1.15)
    k.text(310, 140, 'bureta', 15)
    k.text(310, 300, 'analito', 15)
    k.text(310, 322, '+ indicador', 13)


def ana_foot(k):
    titration(k, 20, 135, 230, 120)
    chromatogram(k, 290, 120, 210, 80)


# ====================================================================== FISICOQUÍMICA
def energy_diagram(k, x, y, w=200, h=130, labels=True):
    axes(k, x, y, w, h, 'coord. de reacción', 'E')
    pts = []
    for i in range(61):
        t = i / 60
        base = .62 - .34 * t
        hump = .42 * math.exp(-((t - .45) / .13) ** 2)
        pts.append((x + 10 + t * (w - 22), y - h * (base + hump)))
    k.line(pts)
    r_y, p_y, ts_y = pts[3][1], pts[-3][1], min(p[1] for p in pts)
    k.line([(x + 8, r_y), (x + w * .45, r_y)], k.w * .6, dash='3 4')
    k.line([(x + w * .6, p_y), (x + w - 8, p_y)], k.w * .6, dash='3 4')
    if labels:
        k.arrow((x + w * .3, r_y), (x + w * .3, ts_y + 3), size=5)
        k.text(x + w * .3 - 14, (r_y + ts_y) / 2 + 4, 'Ea', 14)
        k.arrow((x + w * .82, r_y), (x + w * .82, p_y), size=5)
        k.text(x + w * .82 + 18, (r_y + p_y) / 2 + 4, 'ΔH', 14)


def isotherms(k, x, y, w=150, h=110):
    axes(k, x, y, w, h, 'V', 'P')
    for i, c in enumerate((900, 1700, 2700)):
        pts = []
        for j in range(31):
            vv = 14 + j * (w - 20) / 30
            pp = c / vv
            if pp < h - 6:
                pts.append((x + vv, y - pp))
        if len(pts) > 2:
            k.line(pts)
            k.text(pts[-1][0] + 4, pts[-1][1] - 4, f'T{"₁₂₃"[i]}', 12)


def jablonski(k, x, y, s=1):
    P = lambda a, b: (x + a * s, y + b * s)
    for lvl, yy, x0, x1, lab in (('S0', 70, 0, 90, 'S₀'), ('S1', -40, 0, 90, 'S₁'), ('T1', -10, 110, 180, 'T₁')):
        k.line([P(x0, yy), P(x1, yy)], k.w * 1.2)
        for i in range(1, 4):
            k.line([P(x0, yy - i * 7), P(x1, yy - i * 7)], k.w * .5, sketch=False)
        k.text(*P(x0 - 16, yy + 5), lab, 14)
    k.arrow(P(20, 70), P(20, -58), size=6)
    k.line([P(50, -40)] + [P(50 + 4 * math.sin(i), -40 + i * 5) for i in range(1, 22)], k.w * .9)
    k.arrow(P(70, -40), P(70, 68), size=6)
    k.line([P(88, -40)] + [P(88 + i * 4.5, -40 + i * 1.6 + 2 * math.sin(i * 1.4)) for i in range(1, 7)], k.w * .8)
    k.arrow(P(150, -10), P(150, 68), size=6)
    k.text(*P(10, 104), 'abs', 11); k.text(*P(70, 104), 'fluor.', 11); k.text(*P(150, 104), 'fosf.', 11)


def mm_curve(k, x, y, w=150, h=100):
    axes(k, x, y, w, h, '[S]', 'v')
    pts = [(x + t * (w - 10), y - (h - 18) * (t * 5 / (1 + t * 5))) for t in [i / 40 for i in range(41)]]
    k.line(pts)
    k.line([(x, y - (h - 18)), (x + w - 10, y - (h - 18))], k.w * .6, dash='4 4')
    k.text(x + w - 4, y - h + 14, 'Vmáx', 11)


def maxwell(k, x, y, w=150, h=90):
    axes(k, x, y, w, h, 'v', 'f(v)')
    for T, op in ((1, 1), (1.8, .75)):
        pts = []
        for i in range(41):
            v = i / 40 * 4
            f = v * v * math.exp(-v * v / T) / (T ** 1.5) * 2.3
            pts.append((x + 6 + v * (w - 16) / 4, y - f * h * .8))
        k.line(pts, op=op)


def fq_motifs():
    return [
        lambda k: k.text(0, 0, 'ΔG = ΔH − TΔS', 18),
        lambda k: k.text(0, 0, 'ΔG° = −RT ln K', 16),
        lambda k: (k.text(-10, 0, 'k = A·e', 16), k.text(46, -10, '−Ea/RT', 11)),
        lambda k: (k.text(0, -10, '(∂G/∂T)', 15), k.text(44, -2, 'P', 10), k.text(70, -10, '= −S', 15)),
        lambda k: k.text(0, 0, 'dU = δq + δw', 15),
        lambda k: k.text(0, 0, 'ln (k₂/k₁) = −Ea/R (1/T₂ − 1/T₁)', 13),
        lambda k: energy_diagram(k, -90, 60, 170, 110, True),
        lambda k: isotherms(k, -70, 50, 140, 100),
        lambda k: jablonski(k, -80, 0, .75),
        lambda k: mm_curve(k, -70, 50, 140, 95),
        lambda k: maxwell(k, -70, 45, 140, 85),
        lambda k: k.text(0, 0, 'v = Vmáx[S] / (Km + [S])', 13),
    ]


def fq_hero(k):
    energy_diagram(k, 40, 330, 320, 250, labels=True)
    k.text(250, 60, 'ΔG‡', 22)
    k.text(110, 380, 'ΔG = ΔH − TΔS', 20)


def fq_foot(k):
    jablonski(k, 40, 70, .85)
    k.text(330, 60, 'Φ = moléculas que reaccionan', 13)
    k.line([(240, 70), (420, 70)], 1, sketch=False)
    k.text(330, 90, 'fotones absorbidos', 13)


# ====================================================================== FISIOPATOLOGÍA
def ecg(k, x, y, w=220, beats=2, amp=1):
    pts = []
    seg = w / beats
    for b in range(beats):
        bx = x + b * seg
        shape = [(0, 0), (.12, 0), (.16, -6), (.2, 0), (.28, 0), (.31, 4), (.34, -42), (.37, 14), (.4, 0), (.52, 0), (.6, -12), (.68, 0), (1, 0)]
        pts += [(bx + t * seg, y + v * amp) for t, v in shape]
    k.line(pts)


def heart(k, x, y, s=1):
    P = lambda a, b: (x + a * s, y + b * s)
    def bz(*cs):
        d = f'M{P(*cs[0])[0]:.1f} {P(*cs[0])[1]:.1f}'
        for i in range(1, len(cs), 3):
            (a, b), (c, d2), (e, f) = cs[i], cs[i + 1], cs[i + 2]
            d += f' C{P(a, b)[0]:.1f} {P(a, b)[1]:.1f} {P(c, d2)[0]:.1f} {P(c, d2)[1]:.1f} {P(e, f)[0]:.1f} {P(e, f)[1]:.1f}'
        return d
    # cuerpo (ventrículos), ápice abajo a la izquierda
    k.path(bz((-30, -30), (-62, -20), (-70, 30), (-40, 70), (-26, 88), (-6, 102), (4, 110),
              (16, 96), (52, 60), (62, 22), (70, -10), (52, -38), (24, -40)), w=k.w * 1.2)
    # surco interventricular
    k.path(bz((-6, -34), (-2, 10), (-6, 60), (2, 104)), w=k.w * .8)
    # aurícula derecha / vena cava superior
    k.path(bz((-30, -30), (-46, -40), (-48, -62), (-34, -70)), w=k.w)
    k.line([P(-34, -70), P(-34, -110)]); k.line([P(-20, -66), P(-20, -110)])
    # aorta: arco
    k.path(bz((-10, -40), (-14, -80), (-6, -112), (20, -116), (44, -120), (56, -100), (54, -76)), w=k.w * 1.1)
    k.path(bz((6, -40), (4, -78), (12, -96), (24, -98), (36, -100), (42, -88), (40, -72)), w=k.w * 1.1)
    for xx in (2, 16, 30):
        k.line([P(xx, -112), P(xx - 2, -136)])
    # tronco pulmonar
    k.path(bz((10, -36), (18, -60), (34, -64), (52, -60)), w=k.w)
    k.path(bz((22, -32), (28, -48), (40, -50), (56, -48)), w=k.w)
    # coronarias
    k.path(bz((-14, -24), (-30, 0), (-34, 30), (-26, 60)), w=k.w * .6)
    k.path(bz((20, -30), (40, -10), (44, 20), (36, 50)), w=k.w * .6)


def neuron(k, x, y, s=1, seed=3):
    r = random.Random(seed)
    P = lambda a, b: (x + a * s, y + b * s)
    k.circle(*P(0, 0), 13 * s, k.w * 1.1)
    k.dot(*P(0, 0), 3)

    def branch(px, py, ang, L, depth):
        if depth == 0 or L < 5:
            return
        ex, ey = px + math.cos(ang) * L, py + math.sin(ang) * L
        mid = ((px + ex) / 2 + r.uniform(-3, 3), (py + ey) / 2 + r.uniform(-3, 3))
        k.line([P(px, py), P(*mid), P(ex, ey)], k.w * (.5 + .2 * depth), sketch=False)
        for _ in range(2):
            branch(ex, ey, ang + r.uniform(-.7, .7), L * r.uniform(.55, .75), depth - 1)
    for a in (2.2, 2.9, 3.6, 4.3, 1.5):
        branch(math.cos(a) * 13, math.sin(a) * 13, a, 26, 3)
    # axón con mielina
    ax = 13
    k.line([P(ax, 0), P(ax + 150, 6)], k.w * .8, sketch=False)
    for i in range(5):
        cx = ax + 18 + i * 26
        k.ellipse(*P(cx, 1 + i * 1.2), 10 * s, 5 * s, .04, k.w * .9)
    for a in (-.6, 0, .6):
        k.line([P(ax + 150, 6), P(ax + 150 + 16 * math.cos(a), 6 + 16 * math.sin(a))], k.w * .7, sketch=False)
        k.dot(*P(ax + 150 + 18 * math.cos(a), 6 + 18 * math.sin(a)), 2.2)


def rbc(k, x, y, r=16, rot=0):
    k.ellipse(x, y, r, r * .62, rot, k.w)
    k.ellipse(x, y, r * .5, r * .28, rot, k.w * .7, op=.8)


def artery_plaque(k, x, y, s=1):
    k.circle(x, y, 44 * s, k.w * 1.2)
    k.circle(x, y, 34 * s, k.w * .9)
    # placa: media luna que estrecha la luz
    k.path(f'M{x - 33 * s:.1f} {y - 6 * s:.1f} C{x - 26 * s:.1f} {y - 30 * s:.1f} {x + 18 * s:.1f} {y - 36 * s:.1f} {x + 30 * s:.1f} {y - 14 * s:.1f} '
           f'C{x + 12 * s:.1f} {y - 18 * s:.1f} {x - 14 * s:.1f} {y - 12 * s:.1f} {x - 33 * s:.1f} {y - 6 * s:.1f} Z', w=k.w)
    for i in range(7):
        a = -2.6 + i * .35
        k.dot(x + 22 * s * math.cos(a), y - 6 * s + 14 * s * math.sin(a) * .5 - 8 * s, 1.2)
    k.text(x, y + 66 * s, 'placa', 13)


def lungs(k, x, y, s=1, seed=5):
    r = random.Random(seed)
    P = lambda a, b: (x + a * s, y + b * s)
    k.line([P(0, -80), P(0, -30)], k.w * 1.2)
    for side in (-1, 1):
        k.path(f'M{P(side * 10, -50)[0]:.1f} {P(side * 10, -50)[1]:.1f} C{P(side * 50, -70)[0]:.1f} {P(side * 50, -70)[1]:.1f} '
               f'{P(side * 78, 0)[0]:.1f} {P(side * 78, 0)[1]:.1f} {P(side * 70, 60)[0]:.1f} {P(side * 70, 60)[1]:.1f} '
               f'C{P(side * 50, 74)[0]:.1f} {P(side * 50, 74)[1]:.1f} {P(side * 14, 66)[0]:.1f} {P(side * 14, 66)[1]:.1f} {P(side * 12, 30)[0]:.1f} {P(side * 12, 30)[1]:.1f} Z', w=k.w * 1.1)

        def br(px, py, ang, L, d):
            if d == 0:
                return
            ex, ey = px + math.cos(ang) * L, py + math.sin(ang) * L
            k.line([P(px, py), P(ex, ey)], k.w * (.35 + .18 * d), sketch=False)
            br(ex, ey, ang - .45 + r.uniform(-.1, .1), L * .72, d - 1)
            br(ex, ey, ang + .45 + r.uniform(-.1, .1), L * .72, d - 1)
        br(0, -30, math.pi / 2 + side * .75, 22, 4)


def cell(k, x, y, s=1):
    k.ellipse(x, y, 60 * s, 44 * s, .2, k.w * 1.1)
    k.circle(x - 10 * s, y - 4 * s, 16 * s, k.w)
    k.dot(x - 8 * s, y - 2 * s, 3)
    k.ellipse(x + 30 * s, y + 16 * s, 14 * s, 7 * s, .5, k.w * .8)
    k.line([(x + 20 * s, y + 12 * s), (x + 24 * s, y + 20 * s), (x + 28 * s, y + 10 * s), (x + 32 * s, y + 20 * s), (x + 36 * s, y + 12 * s), (x + 40 * s, y + 20 * s)], k.w * .5, sketch=False)


def dna(k, x, y, h=150):
    for side in (0, math.pi):
        pts = [(x + 18 * math.sin(t / 14 + side), y + t) for t in range(0, h, 3)]
        k.line(pts, k.w * .9)
    for t in range(6, h, 12):
        a = 18 * math.sin(t / 14); b = 18 * math.sin(t / 14 + math.pi)
        k.line([(x + a, y + t), (x + b, y + t)], k.w * .5, sketch=False)


def fisio_motifs():
    return [
        lambda k: ecg(k, -90, 0, 180, 2, .8),
        lambda k: heart(k, 0, 0, .55),
        lambda k: neuron(k, -60, 0, .7, seed=random.randint(1, 99)),
        lambda k: (rbc(k, -18, 0, 15, .3), rbc(k, 14, 10, 14, -.4), rbc(k, 4, -18, 13, .9)),
        lambda k: artery_plaque(k, 0, 0, .7),
        lambda k: lungs(k, 0, 0, .55),
        lambda k: cell(k, 0, 0, .8),
        lambda k: dna(k, 0, -60, 120),
        lambda k: k.text(0, 0, 'PA = GC × RVP', 15),
        lambda k: k.text(0, 0, '↑ TNF-α  ·  IL-6', 14),
        lambda k: k.text(0, 0, 'isquemia → hipoxia', 14),
    ]


def fisio_hero(k):
    heart(k, 210, 200, 1.35)
    ecg(k, 40, 380, 330, 3, 1.1)
    k.text(330, 70, 'aorta', 14)


def fisio_foot(k):
    ecg(k, 10, 90, 300, 3, 1)
    artery_plaque(k, 400, 70, .65)


# ====================================================================== v2: más motivos (UPDATE 01.7)
def pentagon(cx, cy, r, rot=-math.pi / 2):
    return [(cx + r * math.cos(rot + k * 2 * math.pi / 5), cy + r * math.sin(rot + k * 2 * math.pi / 5)) for k in range(5)]


def pyrrole(k, x, y, r=22):
    v = pentagon(x, y, r, math.pi / 2)            # N abajo
    for i in range(5):
        a, b = v[i], v[(i + 1) % 5]
        if i == 0 or i == 4:                         # enlaces que tocan el N: se acortan
            h = v[0]
            if i == 0: a = (h[0] + (b[0] - h[0]) * .3, h[1] + (b[1] - h[1]) * .3)
            else: b = (h[0] + (a[0] - h[0]) * .3, h[1] + (a[1] - h[1]) * .3)
        k.line([a, b])
    for i in (1, 3):
        a, b = v[i], v[(i + 1) % 5]
        ia = (x + (a[0] - x) * .74, y + (a[1] - y) * .74); ib = (x + (b[0] - x) * .74, y + (b[1] - y) * .74)
        k.line([ia, ib], k.w * .9, sketch=False)
    k.text(v[0][0], v[0][1] + 6, 'N', 15, italic=False)
    k.text(v[0][0], v[0][1] + 22, 'H', 13, italic=False)


def newman(k, x, y, r=22):
    k.circle(x, y, r)
    for a in (-90, 30, 150):
        t = math.radians(a)
        k.line([(x, y), (x + math.cos(t) * r * 1.5, y + math.sin(t) * r * 1.5)])
    for a in (-30, 90, 210):
        t = math.radians(a)
        k.line([(x + math.cos(t) * r, y + math.sin(t) * r), (x + math.cos(t) * r * 1.6, y + math.sin(t) * r * 1.6)])
    k.dot(x, y, 2)


def cooh(k, x, y):
    zigzag(k, x - 50, y, 4, 24)
    px, py = x - 50 + 3 * 24 * .866, y - 12
    k.line([(px, py), (px + 20, py + 12)])
    k.text(px + 32, py + 18, 'OH', 13, italic=False)
    k.line([(px - 3, py), (px - 3, py - 24)]); k.line([(px + 3, py), (px + 3, py - 24)])
    k.text(px, py - 30, 'O', 15, italic=False)


def resonance(k, x, y):
    benzene(k, x - 40, y, 18, 0, 'kekule')
    k.text(x, y + 6, '↔', 20, italic=False)
    benzene(k, x + 40, y, 18, math.pi / 3, 'kekule')


def tetrahedral(k, x, y):
    k.text(x, y + 5, 'C', 15, italic=False)
    k.line([(x, y - 8), (x, y - 34)])
    k.line([(x - 8, y + 4), (x - 30, y + 20)])
    k.path(f'M{x + 8} {y + 2} L{x + 34} {y + 18} L{x + 30} {y + 24} Z', fill=k.color, op=.9)
    for t in range(5):
        q = (t + 1) / 6
        k.line([(x + 6 + 22 * q, y - 4 - 6 * q - 1 - 3 * q), (x + 6 + 22 * q, y - 4 - 6 * q + 1 + 3 * q)], k.w * .7, sketch=False)
    k.text(x + 12, y - 40, '109,5°', 11)


def enolate(k, x, y):
    k.line([(x - 30, y + 10), (x - 6, y - 4)]); k.line([(x - 28, y + 15), (x - 4, y + 1)], k.w * .9)
    k.line([(x - 6, y - 4), (x - 6, y - 30)])
    k.text(x - 6, y - 36, 'O⁻', 15, italic=False)
    k.line([(x - 6, y - 4), (x + 20, y + 10)])
    k.text(x + 34, y + 40, 'enolato', 12)


def flask_molecules(k, x, y):
    """Balón de destilación sobre un trípode con moléculas que suben como burbujas (escena)."""
    k.circle(x, y, 58, k.w * 1.2)
    k.line([(x - 12, y - 56), (x - 12, y - 120)]); k.line([(x + 12, y - 56), (x + 12, y - 120)])
    k.line([(x - 16, y - 120), (x + 16, y - 120)])
    k.line([(x - 52, y + 22), (x - 18, y + 30), (x + 20, y + 26), (x + 52, y + 20)], k.w * .8)
    for bx, by, br in ((-20, 38, 4), (8, 44, 3), (24, 34, 5), (-4, 30, 2.5)):
        k.circle(x + bx, y + by, br, k.w * .7)
    k.line([(x - 70, y + 74), (x + 70, y + 74)], k.w * 1.2)
    k.line([(x - 52, y + 74), (x - 66, y + 118)]); k.line([(x + 52, y + 74), (x + 66, y + 118)]); k.line([(x, y + 74), (x, y + 118)])
    # llama
    k.path(f'M{x - 10} {y + 112} C{x - 12} {y + 96} {x - 2} {y + 92} {x} {y + 80} C{x + 4} {y + 92} {x + 12} {y + 98} {x + 10} {y + 112} Z', w=k.w * .9)
    # moléculas que salen
    benzene(k, x + 30, y - 170, 18, .2, 'circle')
    benzene(k, x - 34, y - 214, 14, .5, 'kekule')
    pyrrole(k, x + 14, y - 260, 14)
    for (bx, by, br) in ((6, -138, 4), (-12, -150, 3), (18, -196, 3), (-6, -236, 2.5)):
        k.circle(x + bx, y + by, br, k.w * .6)


def sep_funnel(k, x, y, s=1):
    P = lambda a, b: (x + a * s, y + b * s)
    k.line([P(-4, -70), P(-4, -58)]); k.line([P(4, -70), P(4, -58)])
    k.line([P(-4, -58), P(-30, 10), P(-4, 46), P(-4, 70)]); k.line([P(4, -58), P(30, 10), P(4, 46), P(4, 70)])
    k.line([P(-26, 0), P(26, 0)], k.w * .8)
    k.line([P(-12, 46), P(12, 46)], k.w * 1.3); k.circle(*P(15, 46), 3 * s, k.w * .8)
    k.text(*P(44, -6), 'org.', 10); k.text(*P(44, 20), 'ac.', 10)


def test_tubes(k, x, y):
    k.line([(x - 60, y), (x + 60, y)], k.w * 1.2); k.line([(x - 60, y + 30), (x + 60, y + 30)], k.w * 1.2)
    k.line([(x - 56, y), (x - 56, y + 40)]); k.line([(x + 56, y), (x + 56, y + 40)])
    for i in range(4):
        tx = x - 36 + i * 24
        k.line([(tx - 7, y - 46), (tx - 7, y + 20)]); k.line([(tx + 7, y - 46), (tx + 7, y + 20)])
        k.ellipse(tx, y + 20, 7, 6, 0, k.w, a0=0, a1=math.pi)
        k.line([(tx - 7, y - 10 + i * 6), (tx + 7, y - 10 + i * 6)], k.w * .7)


def balance(k, x, y):
    k.line([(x - 50, y + 30), (x + 50, y + 30), (x + 44, y), (x - 44, y), (x - 50, y + 30)])
    k.line([(x - 30, y), (x - 30, y - 40), (x + 30, y - 40), (x + 30, y)])
    k.ellipse(x, y - 46, 30, 5, 0, k.w)
    k.text(x, y + 22, '0,1000 g', 11, italic=False)


def cuvette(k, x, y):
    k.line([(x - 12, y - 30), (x - 12, y + 30), (x + 12, y + 30), (x + 12, y - 30)])
    k.line([(x - 12, y - 6), (x + 12, y - 6)], k.w * .7)
    for i in range(4):
        k.line([(x - 70 + i * 4, y + 4 + (i % 2) * 2), (x - 16 + i * 4, y + 4 + (i % 2) * 2)], k.w * .5, sketch=False)
    k.arrow((x - 70, y + 4), (x - 18, y + 4), size=5)
    k.arrow((x + 16, y + 4), (x + 56, y + 4), size=5)
    k.text(x - 46, y - 8, 'I₀', 12); k.text(x + 40, y - 8, 'I', 12)


def gauss(k, x, y, w=140, h=60):
    pts = [(x + t * w, y - h * math.exp(-((t - .5) / .16) ** 2)) for t in [i / 40 for i in range(41)]]
    k.line(pts)
    k.line([(x, y), (x + w, y)], k.w * .7)
    k.line([(x + w / 2, y), (x + w / 2, y - h)], k.w * .6, dash='3 3')
    k.text(x + w / 2, y + 16, 'x̄ ± s', 12)


def piston(k, x, y, seed=3):
    r = random.Random(seed)
    k.line([(x - 40, y - 60), (x - 40, y + 50), (x + 40, y + 50), (x + 40, y - 60)], k.w * 1.2)
    k.line([(x - 38, y - 30), (x + 38, y - 30)], k.w * 2)
    k.line([(x, y - 30), (x, y - 90)], k.w * 1.4)
    k.line([(x - 14, y - 90), (x + 14, y - 90)], k.w * 1.4)
    for _ in range(9):
        px, py = r.uniform(x - 30, x + 30), r.uniform(y - 20, y + 42)
        k.circle(px, py, 3.2, k.w * .7)
        a = r.uniform(0, 6.28)
        k.line([(px + math.cos(a) * 5, py + math.sin(a) * 5), (px + math.cos(a) * 13, py + math.sin(a) * 13)], k.w * .5, sketch=False)


def thermometer(k, x, y):
    k.line([(x - 5, y - 70), (x - 5, y + 30)]); k.line([(x + 5, y - 70), (x + 5, y + 30)])
    k.ellipse(x, y - 70, 5, 4, 0, k.w, a0=math.pi, a1=2 * math.pi)
    k.circle(x, y + 40, 11)
    k.line([(x, y + 30), (x, y - 20)], k.w * 2.2, sketch=False)
    for i in range(8):
        k.line([(x + 6, y - 60 + i * 10), (x + 11, y - 60 + i * 10)], k.w * .6, sketch=False)


def carnot(k, x, y):
    axes(k, x, y, 150, 110, 'V', 'P')
    a, b, c, d = (x + 25, y - 92), (x + 70, y - 70), (x + 128, y - 22), (x + 60, y - 40)
    k.line([a, (x + 45, y - 82), b]); k.line([b, (x + 100, y - 40), c])
    k.line([c, (x + 92, y - 30), d]); k.line([d, (x + 38, y - 64), a])
    for (p, q) in ((a, b), (c, d)):
        mx, my = (p[0] + q[0]) / 2, (p[1] + q[1]) / 2
        k.arrow_head(mx, my, math.atan2(q[1] - p[1], q[0] - p[0]), 5)
    k.text(x + 80, y - 50, 'W', 13)


def phase_diagram(k, x, y):
    axes(k, x, y, 150, 110, 'T', 'P')
    tp = (x + 55, y - 40)
    k.line([(x + 8, y - 8), (x + 30, y - 22), tp])
    k.line([tp, (x + 90, y - 62), (x + 130, y - 86)])
    k.line([tp, (x + 60, y - 70), (x + 64, y - 102)])
    k.dot(*tp, 2.6); k.dot(x + 130, y - 86, 2.6)
    k.text(x + 28, y - 70, 'sól.', 11); k.text(x + 98, y - 96, 'líq.', 11); k.text(x + 110, y - 30, 'gas', 11)


def langmuir(k, x, y):
    axes(k, x, y, 140, 100, 'P', 'θ')
    pts = [(x + t * 130, y - 82 * (t * 6 / (1 + t * 6))) for t in [i / 40 for i in range(41)]]
    k.line(pts)
    k.text(x + 80, y - 92, 'Langmuir', 11)


def photon(k, x, y):
    pts = [(x + i * 3, y + 7 * math.sin(i * .7)) for i in range(34)]
    k.line(pts)
    k.arrow_head(pts[-1][0] + 2, pts[-1][1], 0, 6)
    k.text(x + 50, y - 14, 'hν', 15)


def psi_box(k, x, y):
    k.line([(x, y - 90), (x, y)], k.w * 1.4); k.line([(x + 120, y - 90), (x + 120, y)], k.w * 1.4)
    k.line([(x, y), (x + 120, y)])
    for n, lvl in ((1, 10), (2, 40), (3, 80)):
        k.line([(x, y - lvl), (x + 120, y - lvl)], k.w * .5, dash='2 4')
        pts = [(x + t * 120, y - lvl - 10 * math.sin(n * math.pi * t)) for t in [i / 40 for i in range(41)]]
        k.line(pts, k.w * .9)
        k.text(x + 136, y - lvl + 4, f'n={n}', 10)


def gas_engine_scene(k, x, y):
    piston(k, x - 60, y, 7)
    thermometer(k, x + 60, y - 10)
    k.path(f'M{x - 74} {y + 96} C{x - 78} {y + 76} {x - 64} {y + 70} {x - 60} {y + 54} C{x - 54} {y + 70} {x - 44} {y + 78} {x - 46} {y + 96} Z', w=k.w)
    k.path(f'M{x - 66} {y + 96} C{x - 68} {y + 84} {x - 60} {y + 80} {x - 60} {y + 72} C{x - 56} {y + 82} {x - 52} {y + 86} {x - 54} {y + 96} Z', w=k.w * .7)
    k.text(x + 10, y + 120, 'q → ΔU + w', 16)


def stethoscope(k, x, y):
    k.path(f'M{x - 40} {y - 70} C{x - 46} {y - 20} {x - 20} {y + 10} {x} {y + 14} C{x + 20} {y + 10} {x + 46} {y - 20} {x + 40} {y - 70}', w=k.w * 1.4)
    k.circle(x - 40, y - 74, 4); k.circle(x + 40, y - 74, 4)
    k.path(f'M{x} {y + 14} C{x} {y + 60} {x + 60} {y + 50} {x + 70} {y + 90}', w=k.w * 1.4)
    k.circle(x + 74, y + 104, 15, k.w * 1.3); k.circle(x + 74, y + 104, 9, k.w * .8)


def capsule(k, x, y, rot=.5):
    k.ellipse(x, y, 26, 10, rot, k.w)
    c, s_ = math.cos(rot), math.sin(rot)
    k.line([(x - s_ * 10, y + c * 10), (x + s_ * 10, y - c * 10)], k.w * .8)


def syringe(k, x, y):
    k.line([(x - 50, y - 8), (x + 30, y - 8), (x + 30, y + 8), (x - 50, y + 8), (x - 50, y - 8)])
    for i in range(6):
        k.line([(x - 40 + i * 12, y - 8), (x - 40 + i * 12, y - 2)], k.w * .6, sketch=False)
    k.line([(x + 30, y), (x + 70, y)], k.w * .8)
    k.line([(x - 50, y), (x - 76, y)], k.w * 1.4); k.line([(x - 76, y - 12), (x - 76, y + 12)], k.w * 1.4)
    k.line([(x - 50, y - 14), (x - 50, y + 14)], k.w * 1.2)


def bacterium(k, x, y, rot=.3, seed=2):
    r = random.Random(seed)
    k.ellipse(x, y, 28, 11, rot, k.w * 1.1)
    c, s_ = math.cos(rot), math.sin(rot)
    ex, ey = x + c * 28, y + s_ * 28
    pts = [(ex + c * i * 3 - s_ * 4 * math.sin(i * .9), ey + s_ * i * 3 + c * 4 * math.sin(i * .9)) for i in range(14)]
    k.line(pts, k.w * .7)
    for _ in range(3):
        k.dot(x + r.uniform(-14, 14) * c, y + r.uniform(-14, 14) * s_ + r.uniform(-3, 3), 1.6)


def virus(k, x, y, r_=16):
    k.circle(x, y, r_)
    for i in range(12):
        a = i * math.pi / 6
        k.line([(x + math.cos(a) * r_, y + math.sin(a) * r_), (x + math.cos(a) * (r_ + 9), y + math.sin(a) * (r_ + 9))], k.w * .8, sketch=False)
        k.dot(x + math.cos(a) * (r_ + 10), y + math.sin(a) * (r_ + 10), 2)


def alveoli(k, x, y):
    k.line([(x, y - 60), (x, y - 20)], k.w * 1.1)
    k.line([(x, y - 20), (x - 22, y)]); k.line([(x, y - 20), (x + 22, y)])
    for (cx, cy) in ((-30, 10), (-18, 22), (-36, 26), (30, 10), (18, 22), (36, 26), (-26, 38), (26, 38), (0, 30)):
        k.circle(x + cx, y + cy, 9, k.w * .8)


def kidney(k, x, y):
    k.path(f'M{x} {y - 50} C{x - 40} {y - 52} {x - 46} {y + 40} {x} {y + 50} C{x + 22} {y + 54} {x + 26} {y + 30} {x + 14} {y + 18} '
           f'C{x + 6} {y + 8} {x + 6} {y - 8} {x + 14} {y - 18} C{x + 26} {y - 30} {x + 22} {y - 52} {x} {y - 50} Z', w=k.w * 1.2)
    k.path(f'M{x + 14} {y} C{x + 30} {y + 4} {x + 40} {y + 30} {x + 44} {y + 80}', w=k.w)
    for i in range(4):
        a = -1.2 + i * .8
        k.line([(x + 6, y), (x + 6 - 22 * math.cos(a), y + 26 * math.sin(a))], k.w * .6, sketch=False)


def wbc(k, x, y):
    k.circle(x, y, 18, k.w)
    k.path(f'M{x - 9} {y - 4} C{x - 12} {y - 14} {x} {y - 14} {x - 2} {y - 4} C{x + 8} {y - 12} {x + 14} {y} {x + 4} {y + 4} C{x + 10} {y + 12} {x - 4} {y + 14} {x - 6} {y + 6} Z', w=k.w * .8)


def steth_heart_scene(k, x, y):
    heart(k, x - 30, y - 20, .75)
    stethoscope(k, x + 90, y - 10)
    ecg(k, x - 150, y + 110, 330, 3, .9)


# --- índice: un poco de cada ramo
def star_d(x, y, r):
    q = r * .3
    return f'M{x} {y - r} L{x + q} {y - q} L{x + r} {y} L{x + q} {y + q} L{x} {y + r} L{x - q} {y + q} L{x - r} {y} L{x - q} {y - q} Z'


def index_hero(k):
    # libro abierto con símbolos que salen flotando
    k.path('M60 330 C120 300 180 300 210 320 C240 300 300 300 360 330 L360 350 C300 322 240 322 210 342 C180 322 120 322 60 350 Z', w=1.8)
    k.line([(210, 320), (210, 342)], 1.2)
    for i in range(5):
        k.line([(80 + i * 22, 336 - i * 3), (190 - i * 4, 330 + i * 0)], .6, sketch=False)
    benzene(k, 130, 200, 24, 0, 'circle')
    erlenmeyer(k, 290, 210, .8)
    k.text(210, 150, 'ΔG < 0', 20)
    ecg(k, 140, 262, 140, 2, .5)
    for (sx, sy, sr) in ((200, 96, 10), (90, 130, 6), (330, 130, 7), (240, 250, 5)):
        k.path(star_d(sx, sy, sr), w=1.2)


def index_scene(k):
    erlenmeyer(k, 70, 120, .9)
    benzene(k, 190, 110, 26, 0, 'kekule', subs=[(4, 'NH₂')])
    energy_diagram(k, 260, 150, 130, 90, labels=False)
    heart(k, 470, 100, .5)


# --- esquinas: voluta de hiedra + símbolo del ramo
def corner(k, symbol):
    k.path('M8 96 C8 40 40 8 96 8', w=1.6)
    k.path('M18 96 C18 48 48 18 96 18', w=.9)
    for (lx, ly, a) in ((22, 60, -.9), (40, 32, -.5), (62, 18, -.1)):
        k.ellipse(lx, ly, 7, 3.5, a, 1.0)
    k.dot(96, 8, 2.4); k.dot(8, 96, 2.4)
    symbol(k)


CORNER_SYMBOL = {
    'organica': lambda k: benzene(k, 30, 30, 9, 0, 'circle'),
    'analitica': lambda k: erlenmeyer(k, 30, 34, .32, liquid=False),
    'fisico': lambda k: k.text(30, 36, 'ΔG', 15),
    'fisio': lambda k: k.path('M30 40 C14 30 18 16 26 18 C29 19 30 22 30 24 C30 22 31 19 34 18 C42 16 46 30 30 40 Z', w=1.3),
    'index': lambda k: k.path('M30 18 L33 27 L42 30 L33 33 L30 42 L27 33 L18 30 L27 27 Z', w=1.2),
}


def org_motifs2():
    return org_motifs() + [lambda k: pyrrole(k, 0, 0, 22), lambda k: newman(k, 0, 0, 20), lambda k: cooh(k, 0, 0),
                           lambda k: resonance(k, 0, 0), lambda k: tetrahedral(k, 0, 0), lambda k: enolate(k, 0, 0)]


def ana_motifs2():
    return ana_motifs() + [lambda k: sep_funnel(k, 0, 0, .8), lambda k: test_tubes(k, 0, 0), lambda k: balance(k, 0, 0),
                           lambda k: cuvette(k, 0, 0), lambda k: gauss(k, -70, 30)]


def fq_motifs2():
    return fq_motifs() + [lambda k: piston(k, 0, 0, random.randint(1, 50)), lambda k: thermometer(k, 0, 0), lambda k: carnot(k, -70, 50),
                          lambda k: phase_diagram(k, -70, 50), lambda k: langmuir(k, -70, 45), lambda k: photon(k, -50, 0),
                          lambda k: psi_box(k, -60, 45), lambda k: k.text(0, 0, 'S = k ln W', 16), lambda k: k.text(0, 0, 'J = −D dc/dx', 15)]


def fisio_motifs2():
    return fisio_motifs() + [lambda k: stethoscope(k, 0, 0), lambda k: capsule(k, 0, 0, random.uniform(-1, 1)), lambda k: syringe(k, 0, 0),
                             lambda k: bacterium(k, 0, 0, random.uniform(-1, 1), random.randint(1, 9)), lambda k: virus(k, 0, 0),
                             lambda k: alveoli(k, 0, 0), lambda k: kidney(k, 0, 0), lambda k: wbc(k, 0, 0)]


# ====================================================================== composición (v2: opacidad horneada, más densa)
def tile(motifs, color, seed, W=640, H=820, n=30, opacity=.21):
    k = Ink(seed, color, 1.45)
    r = random.Random(seed)
    placed = []
    tries = 0
    i = 0
    while len(placed) < n and tries < 6000:
        tries += 1
        x, y = r.uniform(60, W - 60), r.uniform(60, H - 60)
        if any(math.hypot(x - px, y - py) < 112 for px, py in placed):
            continue
        placed.append((x, y))
        fn = motifs[i % len(motifs)]
        i += 1
        k.group(fn, x, y, rot=r.uniform(-16, 16), sc=r.uniform(.72, .98))
    # puntitos y estrellitas entre motivos: "polvo" de tinta
    for _ in range(26):
        x, y = r.uniform(10, W - 10), r.uniform(10, H - 10)
        if all(math.hypot(x - px, y - py) > 40 for px, py in placed):
            if r.random() < .5:
                k.dot(x, y, r.uniform(1, 1.8), op=.8)
            else:
                sr = r.uniform(3, 6)
                k.path(f'M{x} {y - sr} L{x + sr * .3} {y - sr * .3} L{x + sr} {y} L{x + sr * .3} {y + sr * .3} L{x} {y + sr} L{x - sr * .3} {y + sr * .3} L{x - sr} {y} L{x - sr * .3} {y - sr * .3} Z', w=.9)
    return k.svg(W, H, opacity)


def single(fn, color, seed, W, H, width=1.7, opacity=1):
    k = Ink(seed, color, width)
    fn(k)
    return k.svg(W, H, opacity)


def write(name, text):
    (OUT / name).write_text(text, encoding='utf-8')


def write_corners(cid):
    # una voluta por esquina: se dibuja una vez y se refleja con transform (tl, tr, bl, br)
    k = Ink(50, INK[cid], 1.4)
    corner(k, CORNER_SYMBOL[cid])
    inner = ''.join(k.items)
    for name, tf in (('tl', ''), ('tr', 'translate(104 0) scale(-1 1)'), ('bl', 'translate(0 104) scale(1 -1)'), ('br', 'translate(104 104) scale(-1 -1)')):
        write(f'{cid}-corner-{name}.svg', f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 104 104" width="104" height="104"><g opacity=".72" transform="{tf}">{inner}</g></svg>')


SCENES = {'organica': lambda k: flask_molecules(k, 260, 300), 'analitica': lambda k: (test_tubes(k, 120, 300), balance(k, 290, 320), sep_funnel(k, 420, 280, .9), cuvette(k, 240, 180)),
          'fisico': lambda k: (gas_engine_scene(k, 200, 240), phase_diagram(k, 330, 330)), 'fisio': lambda k: steth_heart_scene(k, 260, 230)}
SETS = {
    'organica': (org_motifs2, org_hero, org_foot),
    'analitica': (ana_motifs2, ana_hero, ana_foot),
    'fisico': (fq_motifs2, fq_hero, fq_foot),
    'fisio': (fisio_motifs2, fisio_hero, fisio_foot),
}
for i, (cid, (motifs, hero, foot)) in enumerate(SETS.items()):
    random.seed(100 + i)
    write(f'{cid}-tile.svg', tile(motifs(), INK[cid], 10 + i))
    write(f'{cid}-hero.svg', single(hero, INK[cid], 20 + i, 420, 420, 1.8, .55))
    write(f'{cid}-foot.svg', single(foot, INK[cid], 30 + i, 520, 160, 1.6, .5))
    write(f'{cid}-scene.svg', single(SCENES[cid], INK[cid], 40 + i, 520, 440, 1.7, .5))
    write_corners(cid)
random.seed(7)
mix = [m for s in (org_motifs2(), ana_motifs2(), fq_motifs2(), fisio_motifs2()) for m in s[:8]]
random.Random(4).shuffle(mix)
write('index-tile.svg', tile(mix, INK['index'], 99))
write('index-hero.svg', single(index_hero, INK['index'], 60, 420, 420, 1.8, .55))
write('index-scene.svg', single(index_scene, INK['index'], 61, 560, 200, 1.6, .5))
write('index-foot.svg', single(index_hero, INK['index'], 62, 420, 420, 1.8, .5))
write_corners('index')
for f in sorted(OUT.iterdir()):
    print(f.name, round(f.stat().st_size / 1024, 1), 'KB')
