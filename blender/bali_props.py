"""Bali props, modelled procedurally: coconut palms, frangipani, banana
plants, thatched bale pavilions, the candi bentar split gate, penjor poles,
a family shrine, scooters, sunbeds, parasols, jukung outrigger boats,
surfboards and rattan pendants.

Vegetation is built once per variant as a template mesh and placed as
linked copies, so the glTF stores each variant once and three.js can
instance it."""
import bpy, bmesh, math, random
from mathutils import Vector, Matrix
from lib import P, box, cyl, sphere, tube, flat, link, hex_rgb

rnd = random.Random(23)
_tpl = {}


def _mesh_obj(name, bm, mats):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for m in mats:
        me.materials.append(m)
    return me


def place(tpl, name, x, y, z, ry=0.0, s=1.0, coll=None):
    o = bpy.data.objects.new(name, tpl)
    link(o, coll)
    o.location = P(x, y, z)
    o.rotation_euler = (0, 0, ry)
    o.scale = (s, s, s)
    return o


# ---------------- vegetation ----------------

def _ring(bm, c, r, n, wobble=0.0):
    vs = []
    for i in range(n):
        a = i / n * math.tau
        rr = r * (1 + wobble * math.sin(a * 3))
        vs.append(bm.verts.new((c.x + math.cos(a) * rr, c.y + math.sin(a) * rr, c.z)))
    return vs


def _loft(bm, rings, mat_index=0, cap=True):
    n = len(rings[0])
    for a, b in zip(rings, rings[1:]):
        for i in range(n):
            f = bm.faces.new((a[i], a[(i + 1) % n], b[(i + 1) % n], b[i]))
            f.material_index = mat_index
            f.smooth = True
    if cap:
        f = bm.faces.new(list(reversed(rings[-1])))
        f.material_index = mat_index


def _frond(bm, base, azimuth, length, lift, droop, width, mat_index, segs=12):
    """A palm frond: a drooping rib with a row of leaflets either side."""
    d = Vector((math.cos(azimuth), math.sin(azimuth), 0))
    side = Vector((-d.y, d.x, 0))
    pts = []
    for j in range(segs + 1):
        s = j / segs
        p = base + d * (length * s) + Vector((0, 0, lift * s - droop * s * s))
        pts.append(p)
    for j in range(segs):
        s = (j + 0.5) / segs
        w = width * math.sin(math.pi * min(1.0, s * 1.15)) + 0.05
        a, b = pts[j], pts[j + 1]
        for sgn in (-1, 1):
            hang = Vector((0, 0, -w * 0.45))
            v0 = bm.verts.new(a)
            v1 = bm.verts.new(b)
            v2 = bm.verts.new(b + side * sgn * w + hang + d * 0.08)
            v3 = bm.verts.new(a + side * sgn * w * 0.9 + hang)
            f = bm.faces.new((v0, v1, v2, v3) if sgn > 0 else (v1, v0, v3, v2))
            f.material_index = mat_index


def _frond_fine(bm, base, azimuth, length, lift, droop, width, mat_index, n=26):
    """A feathered frond: a thin rib with slim separate leaflets, so light and
    sky show through it."""
    d = Vector((math.cos(azimuth), math.sin(azimuth), 0))
    side = Vector((-d.y, d.x, 0))
    at = lambda s: base + d * (length * s) + Vector((0, 0, lift * s - droop * s * s))
    for j in range(n):
        s = (j + 0.5) / n
        a = at(s)
        w = (width * 1.35) * math.sin(math.pi * min(1.0, s * 1.08)) ** 0.7 + 0.08
        for sgn in (-1, 1):
            tip = a + side * sgn * w + d * (0.22 * w) + Vector((0, 0, -w * 0.62))
            v0 = bm.verts.new(a - d * 0.035)
            v1 = bm.verts.new(a + d * 0.035)
            v2 = bm.verts.new(tip + d * 0.012)
            v3 = bm.verts.new(tip - d * 0.012)
            f = bm.faces.new((v0, v1, v2, v3) if sgn > 0 else (v1, v0, v3, v2))
            f.material_index = mat_index


def palm_template(v, fine=False):
    key = f"palm{v}{'f' if fine else ''}"
    if key in _tpl:
        return _tpl[key]
    r = random.Random(100 + v)
    h = [9.0, 11.5, 7.5][v % 3]
    lean = [1.4, 2.4, 0.8][v % 3]
    bm = bmesh.new()
    rings = []
    N = 18
    for i in range(N + 1):
        t = i / N
        c = Vector((lean * t * t, 0, h * t))
        rings.append(_ring(bm, c, 0.2 * (1 - 0.35 * t) * (1.06 if i % 2 else 1.0), 8))
    _loft(bm, rings, 0)
    top = Vector((lean, 0, h))
    for k in range(15):
        az = k / 15 * math.tau + r.uniform(-0.15, 0.15)
        up = k % 3 == 0
        (_frond_fine if fine else _frond)(bm, top, az, r.uniform(3.0, 3.8), 1.3 if up else 0.7, 2.3 if up else 2.9, 0.55, 1)
    for k in range(6):
        a = k / 6 * math.tau
        bmesh.ops.create_icosphere(bm, subdivisions=1, radius=0.13, matrix=Matrix.Translation(top + Vector((math.cos(a) * 0.25, math.sin(a) * 0.25, -0.35))))
    for f in bm.faces:
        if f.material_index == 0 and len(f.verts) == 3:
            f.material_index = 2
    me = _mesh_obj(key, bm, [flat("palm_trunk", "#8a7a66", rough=0.9), flat("palm_frond", "#5d7c35", rough=0.75), flat("coconut", "#6b6a2e", rough=0.6)])
    # icosphere faces were created with material 0; tag every triangle near the crown
    for p in me.polygons:
        if len(p.vertices) == 3 and p.center.z > h - 0.6:
            p.material_index = 2
    _tpl[key] = me
    return me


def frangipani_template():
    if "frangi" in _tpl:
        return _tpl["frangi"]
    r = random.Random(7)
    bm = bmesh.new()
    bark = 0
    leaf = 1
    flower = 2
    branches = [(Vector((0, 0, 0)), Vector((0, 0, 1.2)))]
    tips = []
    for k in range(5):
        a = k / 5 * math.tau + r.random() * 0.4
        tip = Vector((math.cos(a) * r.uniform(1.0, 1.6), math.sin(a) * r.uniform(1.0, 1.6), r.uniform(2.4, 3.2)))
        branches.append((Vector((0, 0, 1.2)), tip))
        tips.append(tip)
    for a, b in branches:
        d = b - a
        n = 6
        rings = [_ring(bm, a + d * (i / 3), 0.11 * (1 - 0.4 * i / 3), n) for i in range(4)]
        _loft(bm, rings, bark)
    for tip in tips:
        for j in range(5):
            o = tip + Vector((r.uniform(-0.5, 0.5), r.uniform(-0.5, 0.5), r.uniform(-0.1, 0.4)))
            g = bmesh.ops.create_icosphere(bm, subdivisions=2, radius=r.uniform(0.35, 0.55), matrix=Matrix.Translation(o) @ Matrix.Diagonal((1, 1, 0.55, 1)))
            for f in {f for v in g["verts"] for f in v.link_faces}:
                f.material_index = leaf
                f.smooth = True
        for j in range(9):
            o = tip + Vector((r.uniform(-0.6, 0.6), r.uniform(-0.6, 0.6), r.uniform(0.15, 0.45)))
            g = bmesh.ops.create_icosphere(bm, subdivisions=1, radius=0.06, matrix=Matrix.Translation(o))
            for f in {f for v in g["verts"] for f in v.link_faces}:
                f.material_index = flower
    me = _mesh_obj("frangi", bm, [flat("frangi_bark", "#8d8476", rough=0.9), flat("frangi_leaf", "#3f6b2c", rough=0.7), flat("frangi_flower", "#fbf3dc", rough=0.5)])
    _tpl["frangi"] = me
    return me


def banana_template():
    if "banana" in _tpl:
        return _tpl["banana"]
    r = random.Random(9)
    bm = bmesh.new()
    rings = [_ring(bm, Vector((0, 0, z)), 0.13 - z * 0.02, 8) for z in (0, 0.8, 1.6, 2.2)]
    _loft(bm, rings, 0)
    for k in range(7):
        az = k / 7 * math.tau + r.random() * 0.3
        d = Vector((math.cos(az), math.sin(az), 0))
        side = Vector((-d.y, d.x, 0))
        base = Vector((0, 0, 2.1))
        L = r.uniform(1.6, 2.1)
        segs = 8
        prev = None
        for j in range(segs + 1):
            s = j / segs
            c = base + d * (0.4 + L * s) + Vector((0, 0, 0.9 * s - 1.3 * s * s))
            w = 0.32 * math.sin(math.pi * min(1, s * 1.05 + 0.05))
            row = (bm.verts.new(c - side * w), bm.verts.new(c + side * w))
            if prev:
                f = bm.faces.new((prev[0], prev[1], row[1], row[0]))
                f.material_index = 1
                f.smooth = True
            prev = row
    me = _mesh_obj("banana", bm, [flat("banana_stem", "#7b8a4a", rough=0.8), flat("banana_leaf", "#78a845", rough=0.7)])
    _tpl["banana"] = me
    return me


def vine_template():
    """A clump of trailing creeper: leaf pairs down a few hanging strands,
    hooked over an edge at the origin and falling towards +z."""
    if "vine" in _tpl:
        return _tpl["vine"]
    r = random.Random(4)
    bm = bmesh.new()
    for k in range(5):
        x0 = r.uniform(-0.35, 0.35)
        L = r.uniform(0.6, 1.5)
        n = int(L / 0.09)
        for j in range(n):
            t = j / n
            c = Vector((x0 + math.sin(t * 6 + k) * 0.04, -0.05 - 0.08 * t, -t * L))
            for sgn in (-1, 1):
                a = r.uniform(0.6, 1.1) * sgn
                sz = 0.07 * (1 - 0.4 * t) + 0.02
                d = Vector((math.cos(a) * sz, -abs(math.sin(a)) * sz * 0.6 - 0.02, -sz * 0.4))
                v0 = bm.verts.new(c)
                v1 = bm.verts.new(c + d * 0.6 + Vector((0, 0, sz * 0.5)))
                v2 = bm.verts.new(c + d * 1.4)
                v3 = bm.verts.new(c + d * 0.6 - Vector((0, 0, sz * 0.45)))
                bm.faces.new((v0, v1, v2, v3))
    # the clump on top of the edge
    for k in range(4):
        bmesh.ops.create_icosphere(bm, subdivisions=1, radius=0.16, matrix=Matrix.Translation(Vector((r.uniform(-0.3, 0.3), 0.05, 0.08))))
    me = _mesh_obj("vine", bm, [flat("vine_leaf", "#3f7a33", rough=0.7)])
    for p in me.polygons:
        p.use_smooth = True
    _tpl["vine"] = me
    return me


PENDANT_PROFILES = {
    # (height, radius) from the crown down, in metres
    "tear": [(0.0, 0.03), (0.06, 0.05), (0.2, 0.13), (0.42, 0.25), (0.62, 0.31), (0.78, 0.27), (0.88, 0.16), (0.92, 0.05)],
    "bell": [(0.0, 0.04), (0.05, 0.08), (0.14, 0.26), (0.28, 0.38), (0.46, 0.44), (0.64, 0.46), (0.72, 0.45)],
}


def pendant_template(kind, mat):
    """A big woven lamp, a surface of revolution with a lattice texture."""
    key = f"pendant_{kind}"
    if key in _tpl:
        return _tpl[key]
    prof = PENDANT_PROFILES[kind]
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new("UVMap")
    N = 28
    rings = [[bm.verts.new((math.cos(i / N * math.tau) * r, math.sin(i / N * math.tau) * r, -h)) for i in range(N)] for h, r in prof]
    for j in range(len(rings) - 1):
        for i in range(N):
            i2 = (i + 1) % N
            f = bm.faces.new((rings[j][i], rings[j + 1][i], rings[j + 1][i2], rings[j][i2]))
            f.smooth = True
            v0, v1 = prof[j][0] * 3.2, prof[j + 1][0] * 3.2
            u0, u1 = i / N * 7, (i + 1) / N * 7
            for l, c in zip(f.loops, ((u0, v0), (u0, v1), (u1, v1), (u1, v0))):
                l[uv].uv = c
    me = _mesh_obj(key, bm, [mat])
    _tpl[key] = me
    return me


def pendant(name, kind, x, y, z, coll, M, s=1.0, ceiling=6.5):
    """Hung from `ceiling`, its crown at height y."""
    place(pendant_template(kind, M["lattice"]), name, x, y, z, ry=rnd.random() * math.tau, s=s, coll=coll)
    cyl(name + "_cord", 0.005, 0.005, ceiling - y, x, y, z, flat("cord", "#2a2622", rough=0.8), seg=6, coll=coll)
    sphere(name + "_bulb", 0.07, x, y - 0.42 * s, z, M["bulb"], coll=coll)


def palm(name, x, y, z, coll, v=None, ry=None, fine=False):
    v = rnd.randrange(3) if v is None else v
    return place(palm_template(v, fine), name, x, y, z, ry=rnd.random() * math.tau if ry is None else ry, s=rnd.uniform(0.85, 1.15), coll=coll)


def frangipani(name, x, y, z, coll, s=1.0):
    return place(frangipani_template(), name, x, y, z, ry=rnd.random() * math.tau, s=s, coll=coll)


def banana(name, x, y, z, coll, s=1.0):
    return place(banana_template(), name, x, y, z, ry=rnd.random() * math.tau, s=s, coll=coll)


# ---------------- architecture ----------------

def hip_roof(name, x, y, z, w, d, rise, mat_top, mat_under, coll, thick=0.28, ridge=0.25):
    """A pyramidal hip roof (thatch above, bamboo below) whose eave rectangle
    w x d sits at height y."""
    bm = bmesh.new()

    def layer(dz, inset):
        e = [bm.verts.new((sx * (w / 2 - inset), sy * (d / 2 - inset), dz)) for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
        rw = max(0.05, w / 2 * ridge - inset)
        rd = max(0.05, d / 2 * ridge - inset)
        t = [bm.verts.new((sx * rw, sy * rd, dz + rise)) for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
        return e, t

    e1, t1 = layer(thick, 0.0)
    e0, t0 = layer(0.0, 0.18)
    for i in range(4):
        j = (i + 1) % 4
        f = bm.faces.new((e1[i], e1[j], t1[j], t1[i]))
        f.material_index = 0
        f = bm.faces.new((e0[j], e0[i], t0[i], t0[j]))
        f.material_index = 1
        f = bm.faces.new((e0[i], e0[j], e1[j], e1[i]))
        f.material_index = 0
    bm.faces.new(t1).material_index = 0
    me = _mesh_obj(name, bm, [mat_top, mat_under])
    o = bpy.data.objects.new(name, me)
    link(o, coll)
    o.location = P(x, y, z)
    # a carved crown on the ridge
    box(name + "_crown", w * ridge + 0.2, 0.35, d * ridge + 0.2, x, y + thick + rise - 0.05, z, flat("crown_stone", "#c9bfae", rough=0.8), bevel=0.04, coll=coll)
    return o


def bale(name, x, y, z, w, d, coll, M, post_h=2.6, rise=1.9, floor=0.45, posts=4):
    """An open Balinese pavilion: paras plinth, teak posts, thatched hip roof."""
    box(name + "_plinth", w + 0.4, floor, d + 0.4, x, y, z, M["paras"], bevel=0.03, coll=coll)
    px = (w / 2 - 0.15)
    pz = (d / 2 - 0.15)
    spots = [(-px, -pz), (px, -pz), (px, pz), (-px, pz)]
    if posts == 6:
        spots += [(0, -pz), (0, pz)]
    for i, (dx, dz) in enumerate(spots):
        box(f"{name}_post{i}", 0.18, post_h, 0.18, x + dx, y + floor, z + dz, M["teak"], bevel=0.02, coll=coll)
        box(f"{name}_base{i}", 0.3, 0.22, 0.3, x + dx, y + floor, z + dz, M["paras"], bevel=0.03, coll=coll)
    for sz in (-1, 1):
        box(f"{name}_beam{sz}", w, 0.18, 0.16, x, y + floor + post_h - 0.18, z + sz * pz, M["teak"], bevel=0.02, coll=coll)
    for sx in (-1, 1):
        box(f"{name}_beamx{sx}", 0.16, 0.18, d, x + sx * px, y + floor + post_h - 0.18, z, M["teak"], bevel=0.02, coll=coll)
    return hip_roof(name + "_roof", x, y + floor + post_h - 0.05, z, w + 1.4, d + 1.4, rise, M["thatch"], M["bamboo"], coll)


def candi_bentar(name, x, y, z, coll, M, gap=1.6, ry=0.0):
    """The split gate: two mirrored stepped towers of red brick with carved
    paras bands, the path running between them."""
    c, s = math.cos(ry), math.sin(ry)
    for side in (-1, 1):
        def bx(n, w, h, d, u, yy):
            # u: offset from the gap centre along the gate's width
            cx = x + (side * u) * c
            cz = z - (side * u) * s
            box(f"{name}_{side}_{n}", w, h, d, cx, y + yy, cz, M[n.split("_")[0]], ry=ry, bevel=0.015, coll=coll)
        tiers = [(2.2, 0.55, 2.0), (2.0, 1.4, 1.8), (1.75, 0.25, 1.6), (1.55, 0.9, 1.45), (1.3, 0.22, 1.25), (1.1, 0.7, 1.1), (0.85, 0.2, 0.9), (0.6, 0.55, 0.7), (0.3, 0.5, 0.35)]
        yy = 0.0
        for k, (w, h, d) in enumerate(tiers):
            # the inner face stays in one plane: that is the split
            u = gap / 2 + w / 2
            mat = "paras" if k % 2 == 0 else "redbrick"
            bx(f"{mat}_{k}", w, h, d, u, yy)
            yy += h
    # steps through the gate
    for k in range(3):
        box(f"{name}_step{k}", gap + 0.4, 0.12, 0.9 - k * 0.25, x, y + k * 0.12, z, M["paras"], ry=ry, bevel=0.01, coll=coll)


def penjor(name, x, y, z, coll, ry=0.0, h=8.0):
    """A penjor: a tall bamboo arching over the lane, hung with an ornament."""
    bam = flat("penjor_bamboo", "#c9b27a", rough=0.7)
    deco = flat("penjor_deco", "#e9d9a3", rough=0.8)
    c, s = math.cos(ry), math.sin(ry)
    pts = []
    for i in range(13):
        t = i / 12
        u = 2.6 * t ** 2.2
        pts.append((x + u * c, y + h * math.sin(t * 1.35) / math.sin(1.35), z - u * s))
    tube(name, pts, 0.05, bam, coll=coll)
    tx, ty, tz = pts[-1]
    cyl(name + "_tassel", 0.12, 0.02, 0.9, tx, ty - 0.95, tz, deco, seg=8, coll=coll)
    for k in range(5):
        px, py, pz = pts[5 + k]
        cyl(f"{name}_hang{k}", 0.05, 0.05, 0.35, px, py - 0.4, pz, deco, seg=6, coll=coll)
    box(name + "_sanggah", 0.35, 0.5, 0.35, x + 0.25, y + 0.9, z + 0.1, bam, bevel=0.01, coll=coll)


def shrine(name, x, y, z, coll, M, ry=0.0):
    """A family shrine (pelinggih): carved stone pedestal, small thatched roof."""
    box(name + "_base", 0.9, 0.5, 0.9, x, y, z, M["paras"], ry=ry, bevel=0.03, coll=coll)
    box(name + "_col", 0.55, 1.1, 0.55, x, y + 0.5, z, M["paras"], ry=ry, bevel=0.02, coll=coll)
    box(name + "_cell", 0.75, 0.55, 0.75, x, y + 1.6, z, M["redbrick"], ry=ry, bevel=0.02, coll=coll)
    box(name + "_door", 0.32, 0.38, 0.04, x, y + 1.66, z + 0.38, flat("shrine_gold", "#c79a3c", rough=0.35, metal=0.8), bevel=0, coll=coll)
    hip_roof(name + "_roof", x, y + 2.15, z, 1.3, 1.3, 0.75, M["thatch"], M["bamboo"], coll, thick=0.18)
    # canang sari offering on the ledge: a palm-leaf tray of petals
    box(name + "_canang", 0.16, 0.03, 0.16, x, y + 0.5, z + 0.32, flat("canang_leaf", "#9bb85a", rough=0.8), bevel=0, coll=coll)
    for k, col in enumerate(("#f2c230", "#e8484a", "#fbf3dc", "#d95fa8")):
        sphere(f"{name}_petal{k}", 0.025, x - 0.04 + (k % 2) * 0.08, y + 0.545, z + 0.28 + (k // 2) * 0.08, flat(f"petal_{col}", col, rough=0.6), coll=coll)


# ---------------- things ----------------

def scooter(name, x, y, z, ry, color, coll):
    body = flat(f"scooter_{color}", color, rough=0.35, metal=0.2)
    dark = flat("scooter_dark", "#1b1c1e", rough=0.6)
    chrome = flat("chrome", "#d9dce2", rough=0.18, metal=1.0)
    c, s = math.cos(ry), math.sin(ry)

    def at(u, v=0.0):
        return x + u * c + v * s, z - u * s + v * c

    def bx(n, l, h, w, u, yy, m, bev=0.06, rx=0.0):
        px, pz = at(u)
        box(f"{name}_{n}", w, h, l, px, y + yy, pz, m, ry=ry + math.pi / 2, bevel=bev, coll=coll, rx=rx)

    bx("deck", 0.55, 0.12, 0.34, 0.05, 0.28, dark)
    bx("rear", 0.75, 0.42, 0.36, -0.45, 0.35, body, 0.14)
    bx("seat", 0.7, 0.12, 0.3, -0.38, 0.77, dark, 0.05)
    bx("shield", 0.18, 0.75, 0.38, 0.5, 0.3, body, 0.07)
    bx("head", 0.22, 0.18, 0.28, 0.6, 1.02, body, 0.06)
    hx, hz = at(0.58)
    cyl(name + "_bar", 0.016, 0.016, 0.62, hx, y + 1.13, hz, chrome, seg=8, coll=coll, rx=math.pi / 2, ry=ry + math.pi / 2)
    for k, u in enumerate((0.62, -0.62)):
        wx, wz = at(u)
        cyl(f"{name}_wheel{k}", 0.24, 0.24, 0.1, wx, y + 0.24, wz, dark, seg=18, coll=coll, rz=math.pi / 2, ry=ry + math.pi / 2)
        cyl(f"{name}_hub{k}", 0.1, 0.1, 0.11, wx, y + 0.24, wz, chrome, seg=12, coll=coll, rz=math.pi / 2, ry=ry + math.pi / 2)


def sunbed(name, x, y, z, ry, coll, M):
    c, s = math.cos(ry), math.sin(ry)

    def at(u):
        return x + u * s, z + u * c

    px, pz = at(0)
    box(name + "_frame", 0.7, 0.28, 2.0, px, y, pz, M["teak"], ry=ry, bevel=0.03, coll=coll)
    box(name + "_pad", 0.66, 0.1, 1.45, *at(0.25)[:1], y + 0.28, at(0.25)[1], M["cushion"], ry=ry, bevel=0.04, coll=coll)
    bx, bz = at(-0.7)
    box(name + "_back", 0.66, 0.1, 0.65, bx, y + 0.42, bz, M["cushion"], ry=ry, rx=0.75, bevel=0.04, coll=coll)
    box(name + "_towel", 0.4, 0.03, 0.5, *at(0.6)[:1], y + 0.385, at(0.6)[1], flat("towel", "#e9dcc5", rough=0.95), ry=ry + 0.1, bevel=0.01, coll=coll)


def parasol(name, x, y, z, coll, M, r=1.4, h=2.5):
    cyl(name + "_pole", 0.03, 0.03, h, x, y, z, M["teak"], seg=8, coll=coll)
    cyl(name + "_top", 0.06, r, 0.45, x, y + h - 0.2, z, flat("canvas", "#efe6d4", rough=0.9), seg=8, coll=coll)
    cyl(name + "_base", 0.25, 0.28, 0.08, x, y, z, M["paras"], seg=12, coll=coll)


def jukung(name, x, y, z, ry, coll, stripe="#2f7fc1"):
    """Outrigger fishing canoe: a slim white hull, a painted stripe, bamboo floats."""
    white = flat("jukung_white", "#f1efe8", rough=0.6)
    col = flat(f"jukung_{stripe}", stripe, rough=0.6)
    bam = flat("jukung_bamboo", "#c6a96b", rough=0.8)
    c, s = math.cos(ry), math.sin(ry)

    def at(u, v=0.0):
        return x + u * c + v * s, z - u * s + v * c

    hull = sphere(name + "_hull", 1.0, x, y + 0.25, z, white, coll=coll, scale=(3.4, 0.35, 0.38))
    hull.rotation_euler = (0, 0, ry)
    st = sphere(name + "_stripe", 1.0, x, y + 0.3, z, col, coll=coll, scale=(3.3, 0.3, 0.385))
    st.rotation_euler = (0, 0, ry)
    for side in (-1, 1):
        fx, fz = at(0, side * 1.6)
        o = cyl(f"{name}_float{side}", 0.07, 0.07, 4.6, fx, y + 0.12, fz, bam, seg=8, coll=coll, rz=math.pi / 2, ry=ry)
        for u in (-1.0, 1.0):
            ax, az = at(u, 0)
            bx, bz = at(u, side * 1.6)
            tube(f"{name}_arm{side}{u}", [(ax, y + 0.5, az), ((ax + bx) / 2, y + 0.75, (az + bz) / 2), (bx, y + 0.15, bz)], 0.035, bam, coll=coll)
    px, pz = at(3.3)
    cyl(name + "_prow", 0.04, 0.02, 0.7, px, y + 0.35, pz, col, seg=6, coll=coll)


def surfboard(name, x, y, z, ry, color, coll, standing=True):
    m = flat(f"board_{color}", color, rough=0.3)
    o = sphere(name, 1.0, x, y + (1.0 if standing else 0.05), z, m, coll=coll, scale=(0.27, 1.05, 0.04) if standing else (0.27, 0.04, 1.05))
    o.rotation_euler = (0.18 if standing else 0, 0, ry)
    return o


def rattan_pendant(name, x, y, z, coll, M, r=0.32):
    cyl(name + "_cord", 0.004, 0.004, 0.9, x, y + r, z, flat("cord", "#2a2622", rough=0.8), seg=6, coll=coll)
    sphere(name + "_shade", r, x, y, z, M["rattan"], coll=coll, scale=(1, 0.8, 1))
    sphere(name + "_bulb", 0.06, x, y - 0.05, z, M["bulb"], coll=coll)
