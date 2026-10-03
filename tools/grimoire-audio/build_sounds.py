"""Sonidos del grimorio, sintetizados con código (nada grabado ni copiado). — v2 "suave"

Qué cambió respecto a la v1 (que sonaba tosca):
  * Sin clics ni ruidos ásperos: todo tiene ataques lentos (8–40 ms) y pasa por filtros que cortan los agudos duros.
  * Destellos y campanas con ondas puras (sin modulación metálica) y menos parciales agudos.
  * El "soplo" de la tapa es más grave, más estrecho y más bajito; el golpe de la tapa casi no se nota.
  * Reverberación más larga y más oscura (como una biblioteca de piedra), y volumen general más bajo.

1) grimoire-open (~5 s) sigue el guion de la intro v2 (platform/animation.js, 3,4 s):
   0,0–3,4 s   colchón cálido en La mayor que respira
   0,0–0,9 s   aparece el círculo mágico: un "brillo" que sube
   0,7–1,5 s   24 destellos suaves, uno por runa, girando de izquierda a derecha
   1,35 s      la gema: una campana suave
   1,55–1,65 s el broche: dos "tin" delicados
   1,75–2,6 s  la tapa se abre: soplo grave y suave
   2,65 s      empuje final: el acorde florece con un arpegio y un brillo agudo muy tenue
2) page-turn (~0,8 s): un "fsss" de papel suave y una caída casi muda.

Salida: dist/assets/audio/*.mp3 y *.webm (Opus). Uso: python tools/grimoire-audio/build_sounds.py
"""
from pathlib import Path
import subprocess
import wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'dist/assets/audio'
OUT.mkdir(parents=True, exist_ok=True)
SR = 44100
rng = np.random.default_rng(2026)


def t_axis(sec):
    return np.arange(int(sec * SR)) / SR


def place(buf, sig, at, pan=0.0, gain=1.0):
    i = int(at * SR)
    j = min(buf.shape[0], i + len(sig))
    if j <= i:
        return
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i:j, 0] += sig[:j - i] * l * gain
    buf[i:j, 1] += sig[:j - i] * r * gain


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype='band', fs=SR, output='sos'), x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, btype='low', fs=SR, output='sos'), x)


def attack(n, sec):
    a = np.ones(n)
    k = min(n, int(sec * SR))
    a[:k] = np.sin(np.linspace(0, np.pi / 2, k)) ** 2       # entrada redonda, sin clic
    return a


def soft_bell(freq, dur, att=.012):
    """Campana suave: fundamental + octava + un parcial dulce, que se apagan a distinto ritmo."""
    t = t_axis(dur)
    s = (np.sin(2 * np.pi * freq * t) * np.exp(-t * 1.6)
         + .32 * np.sin(2 * np.pi * freq * 2 * t) * np.exp(-t * 3.0)
         + .12 * np.sin(2 * np.pi * freq * 3.01 * t) * np.exp(-t * 4.5))
    return s * attack(len(t), att)


def twinkle(freq, dur=.7):
    t = t_axis(dur)
    s = np.sin(2 * np.pi * freq * t) * np.exp(-t * 5.5) + .2 * np.sin(2 * np.pi * freq * 2 * t) * np.exp(-t * 9)
    return s * attack(len(t), .008)


def noise(sec):
    return rng.normal(0, 1, int(sec * SR))


def reverb(x, sec=3.4, decay=2.0, wet=.42, tone=3600):
    n = int(sec * SR)
    t = np.arange(n) / SR
    ir = np.zeros((n, 2))
    for ch in range(2):
        z = rng.normal(0, 1, n) * np.exp(-t * decay)
        z = lp(z, tone)
        z[:int(.018 * SR)] *= np.linspace(0, 1, int(.018 * SR))   # pre-delay suave
        ir[:, ch] = z / np.sqrt(np.sum(z ** 2))
    y = np.zeros((x.shape[0] + n - 1, 2))
    for ch in range(2):
        y[:, ch] = fftconvolve(x[:, ch], ir[:, ch])
    y[:x.shape[0]] = y[:x.shape[0]] * wet + x * (1 - wet)
    y[x.shape[0]:] *= wet
    return y


def master(y, peak=.62, fade=.6, cutoff=6500):
    y = np.stack([lp(y[:, 0], cutoff), lp(y[:, 1], cutoff)], 1)   # nada de agudos que piquen
    y = np.tanh(y / (np.max(np.abs(y)) + 1e-9) * 1.1) / np.tanh(1.1) * peak   # compresión suave
    f = int(fade * SR)
    y[-f:] *= np.linspace(1, 0, f)[:, None] ** 2
    return y


def export(y, name):
    wav = OUT / f'{name}.wav'
    pcm = (np.clip(y, -1, 1) * 32767).astype('<i2')
    with wave.open(str(wav), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(wav), '-c:a', 'libmp3lame', '-b:a', '128k', str(OUT / f'{name}.mp3')], check=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(wav), '-c:a', 'libopus', '-b:a', '96k', str(OUT / f'{name}.webm')], check=True)
    wav.unlink()


# =============================================================== apertura del grimorio (v2)
TOTAL = 3.6
buf = np.zeros((int(TOTAL * SR), 2))
t = t_axis(TOTAL)

# 1) colchón: La mayor con novena, ondas casi puras que respiran; se ilumina al final (empuje 2,65 s)
chord = [110.0, 164.81, 220.0, 277.18, 329.63, 493.88]
swell = np.clip(t / 1.4, 0, 1) ** 1.5 * (1 + .35 * np.clip((t - 2.5) / .5, 0, 1)) * np.clip((3.6 - t) / 1.0, 0, 1)
pad = np.zeros_like(t)
for i, f in enumerate(chord):
    for det in (-.25, .3):
        ff = f * 2 ** (det * 6 / 1200)
        ph = rng.uniform(0, 6)
        pad += (np.sin(2 * np.pi * ff * t + ph) + .12 * np.sin(4 * np.pi * ff * t + ph)) / (1 + i * .45)
pad *= swell * (1 + .05 * np.sin(2 * np.pi * .7 * t))
pad = lp(pad, 1600)
place(buf, pad, 0, -.2, .3)
place(buf, pad[::-1][::-1], 0, .2, .3)

# 2) aparece el círculo: un brillo que sube (glissando muy suave de 2 notas)
tg = t_axis(1.0)
rise = np.sin(2 * np.pi * (660 + 220 * tg ** 2) * tg) * np.sin(np.pi * tg) ** 2
place(buf, lp(rise, 3000), 0.05, 0, .06)

# 3) runas: 24 destellos suaves en pentatónica de La, girando de izquierda a derecha
penta = [880, 987.77, 1108.73, 1318.51, 1479.98, 1760, 1975.53]
for k in range(24):
    at = .7 + k * .033 + rng.uniform(-.004, .004)
    f = penta[(k * 3) % len(penta)]
    place(buf, twinkle(f), at, np.sin(k / 24 * 2 * np.pi) * .75, .05 + .03 * (k / 24))

# 4) gema: campana suave (Mi) con su octava baja
place(buf, soft_bell(1318.51, 2.6, .02), 1.35, .12, .12)
place(buf, soft_bell(659.25, 2.8, .03), 1.35, -.12, .1)

# 5) broche: dos "tin" delicados
for at, f in ((1.55, 2093.0), (1.66, 1760.0)):
    place(buf, soft_bell(f, .6, .006), at, .5, .045)

# 6) tapa que se abre: soplo grave, estrecho y bajito
dur = .95
wh = noise(dur)
n = len(wh)
out = np.zeros(n)
for seg in range(16):
    a, b = int(seg * n / 16), int((seg + 1) * n / 16)
    fc = 220 * (5 ** (seg / 15))
    out[a:b] = bp(wh, fc * .7, fc * 1.4)[a:b]
out = lp(out, 2200) * np.sin(np.pi * np.linspace(0, 1, n)) ** 2.2
place(buf, out, 1.75, -.25, .09)
place(buf, out, 1.77, .25, .07)

# 7) golpe de la tapa: casi mudo, solo cuerpo grave
th = np.sin(2 * np.pi * 70 * t_axis(.5)) * np.exp(-t_axis(.5) * 9) * attack(int(.5 * SR), .01)
place(buf, th, 2.62, -.2, .12)

# 8) empuje final: arpegio ascendente dulce y brillo aéreo tenue
for k, f in enumerate([440, 554.37, 659.25, 880, 1108.73]):
    place(buf, soft_bell(f, 2.2, .03), 2.66 + k * .085, -.35 + k * .17, .07)
air = sum(np.sin(2 * np.pi * f * t_axis(1.4)) for f in (2637.0, 3135.96)) * np.sin(np.pi * np.linspace(0, 1, int(1.4 * SR))) ** 2
place(buf, air, 2.7, 0, .012)

y = reverb(buf, 3.4, 1.9, .44, 3400)
y = y[:int(5.2 * SR)]
export(master(y, .6, 1.2), 'grimoire-open')

# =============================================================== cambio de página (v2)
DUR = .9
pg = np.zeros((int(DUR * SR), 2))
nn = int(DUR * SR)
tt = np.arange(nn) / SR
swish = bp(noise(DUR), 350, 2400)
swish *= np.exp(-((tt - .34) / .17) ** 2)
place(pg, swish, 0, -.15, .2)
# un poquito de textura de papel, muy suave y filtrada
tex = lp(bp(noise(DUR), 1200, 4000) * (rng.random(nn) < .02), 3500) * np.exp(-((tt - .25) / .2) ** 2)
place(pg, tex, 0, .1, .35)
# la hoja se apoya: un toque grave y blando
tap = lp(noise(.15), 500) * np.exp(-t_axis(.15) * 30) * attack(int(.15 * SR), .006)
place(pg, tap, .66, -.2, .25)
y2 = reverb(pg, 1.0, 6, .2, 3000)
export(master(y2, .45, .3, 5000), 'page-turn')
for f in sorted(OUT.iterdir()):
    print(f.name, round(f.stat().st_size / 1024, 1), 'KB')
