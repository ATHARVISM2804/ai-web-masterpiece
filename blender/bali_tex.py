"""Procedural textures for the Bali build, painted with numpy: alang-alang
thatch, rice paddy, rattan weave, cream terrazzo, green Sukabumi pool stone,
black volcanic sand and lawn. Each lands in assets/gen/<name>.png and is
reused from there on later builds."""
import os
import numpy as np
import bpy

from lib import ASSETS

GEN = os.path.join(ASSETS, "gen")
rng = np.random.default_rng(5)


def _noise(n, scale, octaves=4):
    """Tileable value noise in 0..1."""
    out = np.zeros((n, n))
    amp, tot = 1.0, 0.0
    for o in range(octaves):
        s = scale * 2 ** o
        g = rng.random((s, s))
        x = np.linspace(0, s, n, endpoint=False)
        i0 = np.floor(x).astype(int) % s
        i1 = (i0 + 1) % s
        f = x - np.floor(x)
        f = f * f * (3 - 2 * f)
        a = g[i0][:, i0] * (1 - f)[None, :] + g[i0][:, i1] * f[None, :]
        b = g[i1][:, i0] * (1 - f)[None, :] + g[i1][:, i1] * f[None, :]
        out += amp * (a * (1 - f)[:, None] + b * f[:, None])
        tot += amp
        amp *= 0.5
    return out / tot


def _save(name, rgb, alpha=None):
    os.makedirs(GEN, exist_ok=True)
    p = os.path.join(GEN, f"{name}.png")
    n = rgb.shape[0]
    a = np.ones((n, n)) if alpha is None else alpha
    px = np.dstack([np.clip(rgb, 0, 1), np.clip(a, 0, 1)]).astype(np.float32)
    img = bpy.data.images.new(name, n, n, alpha=alpha is not None)
    img.pixels.foreach_set(np.flipud(px).ravel())
    img.filepath_raw = p
    img.file_format = "PNG"
    img.save()
    bpy.data.images.remove(img)
    return p


def thatch(n=512):
    # bundles of dry grass laid in courses: streaks along v, a shadow line per course
    streak = _noise(n, 64, 2)[:, :1].repeat(n, 1).T
    fine = rng.random((1, n)).repeat(n, 0)
    v = (np.arange(n)[:, None] % 64) / 64
    course = 0.75 + 0.25 * np.clip(v * 2.2, 0, 1)
    base = 0.55 + 0.25 * streak + 0.2 * fine
    base *= course * (0.85 + 0.15 * _noise(n, 8))
    rgb = np.dstack([base * 0.72, base * 0.58, base * 0.36])
    return _save("thatch", rgb)


def rice(n=512):
    # young rice in rows, standing water showing between them
    rows = (np.sin(np.arange(n) / n * np.pi * 2 * 48) * 0.5 + 0.5)[None, :].repeat(n, 0)
    tuft = (np.sin(np.arange(n) / n * np.pi * 2 * 96)[:, None] * 0.5 + 0.5)
    leaf = np.clip(rows * 0.7 + tuft * 0.3 + _noise(n, 16) * 0.4 - 0.35, 0, 1)
    lush = _noise(n, 4)
    g = np.dstack([0.32 + 0.18 * lush, 0.55 + 0.2 * lush, 0.16 + 0.08 * lush])
    w = np.ones((n, n, 3)) * np.array([0.42, 0.5, 0.48])
    rgb = g * leaf[..., None] + w * (1 - leaf[..., None])
    return _save("rice", rgb)


def rattan(n=512):
    # cane webbing: an over-under weave of light strands
    x = np.arange(n)[None, :].repeat(n, 0)
    y = x.T
    p = 32
    hx = ((x // p + y // (p // 2)) % 2 == 0)
    sx = np.abs(np.sin(y / p * np.pi * 2)) ** 0.3
    sy = np.abs(np.sin(x / p * np.pi * 2)) ** 0.3
    strand = np.where(hx, sx, sy)
    holes = (((x % p) < 6) & ((y % p) < 6))
    tone = 0.75 + 0.25 * _noise(n, 16)
    c = strand * tone
    rgb = np.dstack([0.86 * c, 0.68 * c, 0.44 * c])
    return _save("rattan", rgb, alpha=np.where(holes, 0.0, 1.0))


def terrazzo(n=1024):
    base = 0.93 + 0.03 * _noise(n, 8)
    rgb = np.dstack([base, base * 0.975, base * 0.94])
    for _ in range(1400):
        r = rng.integers(2, 9)
        cx, cy = rng.integers(0, n, 2)
        col = rng.choice([[0.55, 0.53, 0.5], [0.25, 0.25, 0.26], [0.78, 0.7, 0.6], [0.66, 0.62, 0.55]])
        yy, xx = np.ogrid[-r:r + 1, -r:r + 1]
        m = (xx * xx * rng.uniform(0.5, 1.5) + yy * yy) <= r * r
        ys = (np.arange(cy - r, cy + r + 1) % n)[:, None]
        xs = (np.arange(cx - r, cx + r + 1) % n)[None, :]
        sub = rgb[ys, xs]
        sub[m] = col
        rgb[ys, xs] = sub
    return _save("terrazzo", rgb)


def pool(n=512):
    # green Sukabumi stone tiles: 8x8 per texture, each a shade apart
    t = n // 8
    rgb = np.zeros((n, n, 3))
    for i in range(8):
        for j in range(8):
            k = rng.uniform(-0.06, 0.06)
            rgb[i * t:(i + 1) * t, j * t:(j + 1) * t] = [0.36 + k, 0.62 + k, 0.56 + k]
    rgb *= (0.85 + 0.15 * _noise(n, 32))[..., None]
    g = (np.arange(n) % t < 2)
    rgb[g, :] *= 0.75
    rgb[:, g] *= 0.75
    return _save("pool", rgb)


def sand(n=512):
    # Canggu's black volcanic sand, flecked
    v = 0.2 + 0.1 * _noise(n, 32) + 0.08 * rng.random((n, n))
    rgb = np.dstack([v * 1.05, v, v * 0.95])
    return _save("sand", rgb)


def lawn(n=512):
    v = _noise(n, 16) * 0.5 + rng.random((n, n)) * 0.5
    rgb = np.dstack([0.28 + 0.12 * v, 0.5 + 0.14 * v, 0.2 + 0.06 * v])
    return _save("lawn", rgb)


def lattice(n=512):
    # open diamond weave for the big pendants: strands, and air between them
    x = np.arange(n)[None, :].repeat(n, 0)
    y = x.T
    p = 64
    a = np.abs(((x + y) % p) - p / 2) < 5
    b = np.abs(((x - y) % p) - p / 2) < 5
    c = (y % (p * 2)) < 5
    solid = a | b | c
    tone = 0.8 + 0.2 * _noise(n, 32)
    rgb = np.dstack([0.86 * tone, 0.62 * tone, 0.36 * tone])
    return _save("lattice", rgb, alpha=np.where(solid, 1.0, 0.0))


def palm_print(n=256):
    # a linen cushion with a single embroidered palm
    rgb = np.ones((n, n, 3)) * np.array([0.93, 0.9, 0.84])
    green = np.array([0.24, 0.36, 0.22])
    cx, top = n // 2, int(n * 0.28)
    rgb[top:int(n * 0.86), cx - 2:cx + 2] = np.array([0.45, 0.33, 0.2])
    for k in range(-5, 6):
        a = k * 0.5 - 1.5708
        for t in np.linspace(0, 1, 90):
            r = t * n * 0.27
            px = int(cx + np.cos(a) * r)
            py = int(top + np.sin(a) * r * 0.75 + t * t * n * 0.14)
            if 2 <= px < n - 2 and 2 <= py < n - 2:
                rgb[py - 1:py + 2, px - 1:px + 2] = green
    return _save("palm_print", rgb)


def mottle(n=512):
    # the grey, smoky rug
    v = np.clip((_noise(n, 12, 5) - 0.32) * 2.6, 0, 1)
    v = 0.28 + 0.62 * v + rng.random((n, n)) * 0.05
    return _save("mottle", np.dstack([v, v * 0.98, v * 0.95]))


def all_textures():
    return dict(lattice=lattice(), palm_print=palm_print(), mottle=mottle(), thatch=thatch(), rice=rice(), rattan=rattan(), terrazzo=terrazzo(), pool=pool(), sand=sand(), lawn=lawn())
