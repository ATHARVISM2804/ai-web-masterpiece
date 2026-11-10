"""Builds the cast: Atharv and the founders he spends the day with, as rigged,
realistic bodies for three.js. Run headless:

  Blender -b --factory-startup -P blender/build_men.py -- <out.glb> [preview.png]

Bodies come from MakeHuman's CC0 data (assets/mh): the base mesh is morphed
with its macro targets (young male, maximum muscle, low body fat, a mix of
ethnicities), the 163-bone default skeleton is placed from the morphed joint
vertices and skinned with the default weights, and proxies (eyes, brows,
lashes, hair) are fitted the way MakeHuman fits them. Everyone is shirtless
in swim shorts: it is Bali. No add-on is used; this file reads the data.

Each character becomes one armature with its meshes, all at the origin,
named "<id>" with children "<id>_body", "<id>_hair" and so on.
"""
import bpy, bmesh, json, math, os, sys
import numpy as np
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import hex_rgb  # noqa

MH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "mh")
SYS = os.path.join(MH, "sys")

# ---------------- MakeHuman data ----------------

def read_obj(path, groups=None):
    """Vertices, UVs and faces (with UV indices) of an OBJ; optionally only
    the faces in the given groups."""
    vs, vts, faces = [], [], []
    g = None
    for line in open(path):
        if line.startswith("v "):
            vs.append([float(x) for x in line.split()[1:4]])
        elif line.startswith("vt "):
            vts.append([float(x) for x in line.split()[1:3]])
        elif line.startswith("g "):
            g = line.split()[1]
        elif line.startswith("f "):
            if groups and g not in groups:
                continue
            idx = [p.split("/") for p in line.split()[1:]]
            faces.append(([int(p[0]) - 1 for p in idx], [int(p[1]) - 1 if len(p) > 1 and p[1] else -1 for p in idx]))
    return np.array(vs), np.array(vts) if vts else np.zeros((0, 2)), faces


def read_target(name):
    idx, off = [], []
    for line in open(os.path.join(MH, "targets", name + ".target")):
        if line.startswith("#") or not line.strip():
            continue
        p = line.split()
        idx.append(int(p[0]))
        off.append([float(p[1]), float(p[2]), float(p[3])])
    return np.array(idx), np.array(off)


BASE_V, BASE_VT, _ = read_obj(os.path.join(MH, "core", "base.obj"))
_, _, BODY_F = read_obj(os.path.join(MH, "core", "base.obj"), groups={"body"})
SKEL = json.load(open(os.path.join(MH, "core", "default.mhskel")))
WEIGHTS = json.load(open(os.path.join(MH, "core", "default_weights.mhw")))["weights"]
_targets = {}


def morph(mix):
    v = BASE_V.copy()
    for name, w in mix.items():
        if not w:
            continue
        if name not in _targets:
            _targets[name] = read_target(name)
        i, d = _targets[name]
        v[i] += d * w
    return v


def vertex_weights():
    """Per base vertex: {bone: weight}."""
    out = {}
    for bone, pairs in WEIGHTS.items():
        for vi, w in pairs:
            out.setdefault(vi, {})[bone] = out.get(vi, {}).get(bone, 0) + w
    return out


VW = vertex_weights()


def read_mhclo(path):
    scale = {}
    refs = []
    obj = None
    mat = None
    in_verts = False
    for line in open(path):
        s = line.strip()
        if not s or s.startswith("#"):
            continue
        p = s.split()
        if in_verts and p[0].lstrip("-").replace(".", "", 1).isdigit():
            if True:
                nums = [float(x) for x in p]
                if len(nums) == 1:
                    refs.append(((int(nums[0]), 0, 0), (1.0, 0, 0), (0, 0, 0)))
                else:
                    refs.append(((int(nums[0]), int(nums[1]), int(nums[2])), tuple(nums[3:6]), tuple(nums[6:9])))
                continue
        if p[0] == "obj_file":
            obj = p[1]
        elif p[0] == "material":
            mat = p[1]
        elif p[0] in ("x_scale", "y_scale", "z_scale"):
            scale[p[0][0]] = (int(p[1]), int(p[2]), float(p[3]))
        elif p[0] == "verts":
            in_verts = True
        elif p[0] in ("delete_verts", "weights"):
            in_verts = False
    return obj, mat, scale, refs


def fit_proxy(path, base):
    """MakeHuman proxy fitting: every proxy vertex sits at a weighted triangle
    of base vertices plus an offset scaled with the body's own proportions."""
    d = os.path.dirname(path)
    obj, mat, scale, refs = read_mhclo(path)
    pv, pvt, pf = read_obj(os.path.join(d, obj))
    sc = np.ones(3)
    for k, ax in (("x", 0), ("y", 1), ("z", 2)):
        if k in scale:
            a, b, dist = scale[k]
            sc[ax] = abs(base[a][ax] - base[b][ax]) / dist
    out = np.zeros((len(refs), 3))
    wts = []
    for n, (vi, w, off) in enumerate(refs):
        out[n] = w[0] * base[vi[0]] + w[1] * base[vi[1]] + w[2] * base[vi[2]] + np.array(off) * sc
        acc = {}
        for k in range(3):
            if w[k] <= 0:
                continue
            for bone, bw in VW.get(vi[k], {}).items():
                acc[bone] = acc.get(bone, 0) + bw * w[k]
        t = sum(acc.values()) or 1
        wts.append({b: x / t for b, x in acc.items()})
    texture = None
    alpha = False
    if mat:
        for line in open(os.path.join(d, mat)):
            if line.startswith("diffuseTexture"):
                texture = os.path.join(d, line.split()[1])
            if line.startswith("transparent True"):
                alpha = True
    return out, pvt, pf, wts, texture, alpha


# ---------------- Blender building ----------------

M_TO = 0.1  # MakeHuman units are decimetres


def to_bl(v):
    """MakeHuman (Y up, facing +Z) to Blender (Z up, facing -Y): the glTF
    exporter turns that back into three.js's Y up, facing +Z."""
    return Vector((v[0] * M_TO, -v[2] * M_TO, v[1] * M_TO))


def material(name, tex=None, tint="#ffffff", rough=0.55, alpha=False, spec=0.4):
    m = bpy.data.materials.get(name)
    if m:
        return m
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Roughness"].default_value = rough
    try:
        b.inputs["Specular IOR Level"].default_value = spec
    except KeyError:
        pass
    if tex:
        n = nt.nodes.new("ShaderNodeTexImage")
        n.image = bpy.data.images.load(tex, check_existing=True)
        out = n.outputs["Color"]
        if tint.lower() != "#ffffff":
            mix = nt.nodes.new("ShaderNodeMix")
            mix.data_type = "RGBA"
            mix.blend_type = "MULTIPLY"
            mix.inputs["Factor"].default_value = 1.0
            mix.inputs[7].default_value = (*hex_rgb(tint), 1)
            nt.links.new(out, mix.inputs[6])
            out = mix.outputs[2]
        nt.links.new(out, b.inputs["Base Color"])
        if alpha:
            nt.links.new(n.outputs["Alpha"], b.inputs["Alpha"])
            m.blend_method = "CLIP" if hasattr(m, "blend_method") else None
    else:
        b.inputs["Base Color"].default_value = (*hex_rgb(tint), 1)
    return m


def mesh_obj(name, verts_mh, uvs, faces, mat, weights, arm, smooth=True):
    """A skinned mesh from MakeHuman-space vertices; faces carry UV indices."""
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bv = [bm.verts.new(to_bl(v)) for v in verts_mh]
    bm.verts.ensure_lookup_table()
    uv = bm.loops.layers.uv.new("UVMap")
    for vi, ti in faces:
        try:
            f = bm.faces.new([bv[i] for i in vi])
        except ValueError:
            continue
        f.smooth = smooth
        if len(uvs) and ti[0] >= 0:
            for l, t in zip(f.loops, ti):
                l[uv].uv = uvs[t]
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(o)
    me.materials.append(mat)
    groups = {}
    for i, w in enumerate(weights):
        for bone, x in w.items():
            if x < 0.01:
                continue
            g = groups.get(bone) or o.vertex_groups.new(name=bone)
            groups[bone] = g
            g.add([i], x, "REPLACE")
    mod = o.modifiers.new("arm", "ARMATURE")
    mod.object = arm
    o.parent = arm
    return o


def build_character(cid, cfg):
    base = morph(cfg["mix"])
    # feet on the ground, then scale to the wanted height
    body_idx = sorted({i for vi, _ in BODY_F for i in vi})
    ys = base[body_idx, 1]
    base[:, 1] -= ys.min()
    k = cfg["height"] / (M_TO * (ys.max() - ys.min()))
    base *= k

    # skeleton from the morphed joint vertices
    joints = {n: base[v].mean(axis=0) for n, v in SKEL["joints"].items()}
    arm_data = bpy.data.armatures.new(cid + "_rig")
    arm = bpy.data.objects.new(cid, arm_data)
    bpy.context.scene.collection.objects.link(arm)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode="EDIT")
    for bname, b in SKEL["bones"].items():
        eb = arm_data.edit_bones.new(bname)
        eb.head = to_bl(joints[b["head"]])
        eb.tail = to_bl(joints[b["tail"]])
        if (eb.tail - eb.head).length < 1e-4:
            eb.tail = eb.head + Vector((0, 0, 0.01))
    for bname, b in SKEL["bones"].items():
        if b["parent"]:
            arm_data.edit_bones[bname].parent = arm_data.edit_bones[b["parent"]]
    bpy.ops.object.mode_set(mode="OBJECT")

    # the body: only the "body" faces, re-indexed
    remap = {old: new for new, old in enumerate(body_idx)}
    faces = [([remap[i] for i in vi], ti) for vi, ti in BODY_F]
    skin = material(f"skin_{cid}", os.path.join(SYS, "skins", cfg["skin"][0], cfg["skin"][1]), tint=cfg["tint"], rough=0.6, spec=0.36)
    body = mesh_obj(cid + "_body", base[body_idx], BASE_VT, faces, skin, [VW.get(i, {}) for i in body_idx], arm)

    # swim shorts: the hips and upper thighs, lifted a few millimetres off the skin
    hip_y = joints["pelvis.L____head"][1] if "pelvis.L____head" in joints else base[body_idx, 1].mean()
    knee_y = joints["lowerleg01.L____head"][1]
    top = hip_y + (hip_y - knee_y) * 0.12
    low = knee_y + (hip_y - knee_y) * 0.42
    # only skin carried by the hips and thighs: the hands hang at this height too
    def hip_skin(i):
        w = VW.get(body_idx[i], {})
        return sum(x for b, x in w.items() if b.startswith(("pelvis", "upperleg", "spine05", "root"))) > 0.5
    # faces touching the band, then every vertex clamped into it: a straight hem
    keep = [f for f in faces if any(low < base[body_idx[i], 1] < top for i in f[0]) and all(hip_skin(i) for i in f[0])]
    used = sorted({i for vi, _ in keep for i in vi})
    rm = {o: n for n, o in enumerate(used)}
    # push out along the vertex normal of the body
    me = body.data
    me.update()
    # Blender normals back into MakeHuman axes; 0.06 units is about 6 mm
    normals = np.array([[v.normal.x, v.normal.z, -v.normal.y] for v in me.vertices])
    sv = np.array([base[body_idx[i]] + normals[i] * 0.06 for i in used])
    sv[:, 1] = np.clip(sv[:, 1], low, top)
    shorts = material(f"shorts_{cfg['shorts']}", tint=cfg["shorts"], rough=0.75, spec=0.2)
    mesh_obj(cid + "_shorts", sv, BASE_VT, [([rm[i] for i in vi], ti) for vi, ti in keep], shorts, [VW.get(body_idx[i], {}) for i in used], arm)

    # proxies
    for part, (path, tint) in cfg["proxies"].items():
        pv, pvt, pf, pw, tex, alpha = fit_proxy(path, base)
        if part == "eyes":
            m = material("eyes_brown", os.path.join(SYS, "eyes", "materials", "brown_eye.png"), rough=0.1, spec=0.6)
        else:
            tex = tex if tex and os.path.exists(tex) else None
            m = material(f"{part}_{os.path.basename(path)}_{tint}", tex, tint=tint, rough=0.6, alpha=alpha or part in ("hair", "brows", "lashes"))
        mesh_obj(f"{cid}_{part}", pv, pvt, pf, m, pw, arm)
    return arm


def S(*p):
    return os.path.join(SYS, *p)


LEAN = {  # young male, maximum muscle, low body fat
    "universal-male-young-maxmuscle-minweight": 1.0,
    "male-young-maxmuscle-minweight-idealproportions": 1.0,
    "torso-vshape-incr": 0.75,
    "torso-muscle-pectoral-incr": 0.65,
    "torso-muscle-dorsi-incr": 0.6,
    "stomach-tone-incr": 1.0,
    # athletic shredded: full arms, capped delts, legs and neck on the lean build
    "l-upperarm-muscle-incr": 1.0, "r-upperarm-muscle-incr": 1.0,
    "l-upperarm-shoulder-muscle-incr": 1.0, "r-upperarm-shoulder-muscle-incr": 1.0,
    "l-lowerarm-muscle-incr": 0.8, "r-lowerarm-muscle-incr": 0.8,
    "l-upperleg-muscle-incr": 0.7, "r-upperleg-muscle-incr": 0.7,
    "l-lowerleg-muscle-incr": 0.6, "r-lowerleg-muscle-incr": 0.6,
    "neck-scale-horiz-incr": 0.3,
}


def look(eth, extra=None):
    m = dict(LEAN)
    m.update(eth)
    m.update(extra or {})
    return m


EYES = (S("eyes", "low-poly", "low-poly.mhclo"), "#ffffff")
BROWS = (S("eyebrows", "eyebrow001", "eyebrow001.mhclo"), "#2a1d16")
LASHES = (S("eyelashes", "eyelashes01", "eyelashes01.mhclo"), "#1a1411")

CAST = {
    # Atharv: 5'8", lean and muscular, warm brown skin, tight dark curls
    "atharv": dict(height=1.73, mix=look({"caucasian-male-young": 0.45, "asian-male-young": 0.3, "african-male-young": 0.25}),
                   skin=("young_caucasian_male", "young_lightskinned_male_diffuse.png"), tint="#a98068", shorts="#1d2430",
                   proxies=dict(eyes=EYES, brows=BROWS, lashes=LASHES, hair=(S("hair", "afro01", "afro01.mhclo"), "#3a2a22"))),
    "luca": dict(height=1.86, mix=look({"caucasian-male-young": 0.9, "asian-male-young": 0.1}, {"torso-vshape-incr": 0.8}),
                 skin=("young_caucasian_male", "young_lightskinned_male_diffuse.png"), tint="#f0c7a6", shorts="#e7dcc8",
                 proxies=dict(eyes=EYES, brows=(S("eyebrows", "eyebrow001", "eyebrow001.mhclo"), "#6b4c34"), lashes=LASHES, hair=(S("hair", "short02", "short02.mhclo"), "#8a6a4c"))),
    "kwame": dict(height=1.84, mix=look({"african-male-young": 1.0}, {"universal-male-young-maxmuscle-averageweight": 0.45, "universal-male-young-maxmuscle-minweight": 0.55}),
                  skin=("young_african_male", "young_darkskinned_male_diffuse.png"), tint="#ffffff", shorts="#2f6f6a",
                  proxies=dict(eyes=EYES, brows=BROWS, lashes=LASHES, hair=(S("hair", "short01", "short01.mhclo"), "#141010"))),
    "kenji": dict(height=1.77, mix=look({"asian-male-young": 1.0}),
                  skin=("young_asian_male", "young_lightskinned_male_diffuse3.png"), tint="#f1caa2", shorts="#b8442f",
                  proxies=dict(eyes=EYES, brows=BROWS, lashes=LASHES, hair=(S("hair", "short04", "short04.mhclo"), "#16110e"))),
    "mateo": dict(height=1.81, mix=look({"caucasian-male-young": 0.7, "african-male-young": 0.15, "asian-male-young": 0.15}),
                  skin=("young_caucasian_male", "young_lightskinned_male_diffuse.png"), tint="#d9a07c", shorts="#d9b44a",
                  proxies=dict(eyes=EYES, brows=BROWS, lashes=LASHES, hair=(S("hair", "short02", "short02.mhclo"), "#2a1d16"))),
    "arjun": dict(height=1.79, mix=look({"caucasian-male-young": 0.55, "asian-male-young": 0.35, "african-male-young": 0.1}, {"universal-male-young-maxmuscle-averageweight": 0.35, "universal-male-young-maxmuscle-minweight": 0.65}),
                  skin=("young_caucasian_male", "young_lightskinned_male_diffuse.png"), tint="#c4906c", shorts="#3d5a3a",
                  proxies=dict(eyes=EYES, brows=BROWS, lashes=LASHES, hair=(S("hair", "short01", "short01.mhclo"), "#120e0c"))),
}


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    out = argv[0] if argv else os.path.join(os.path.dirname(__file__), "men.glb")
    for cid, cfg in CAST.items():
        build_character(cid, cfg)
        print("built", cid)
    # one baked map of muscle definition, from Atharv's body, for the whole cast
    import muscle
    nmap = muscle.bake_definition(bpy.data.objects["atharv_body"], bpy.data.objects["atharv"], os.path.join(os.path.dirname(os.path.abspath(__file__)), "muscle_normal.png"))
    for cid in CAST:
        muscle.apply_normal(bpy.data.materials[f"skin_{cid}"], nmap, strength=1.0)
    if len(argv) > 1:
        preview(argv[1])
    bpy.ops.export_scene.gltf(filepath=out, export_format="GLB", export_apply=False, export_yup=True,
                              export_skins=True, export_animations=False, export_morph=False, export_image_format="AUTO")
    print("EXPORTED", out)


def closeup(path):
    """Atharv alone, torso and face, under a low side light that shows definition."""
    sc = bpy.context.scene
    for o in bpy.data.objects:
        root = o.parent or o
        if root.name in CAST:
            o.hide_render = root.name != "atharv"
    cam = bpy.data.objects["cam"]
    cam.location = (0.25, -1.5, 1.32)
    cam.rotation_euler = (math.radians(90), 0, math.radians(9))
    cam.data.lens = 50
    bpy.data.objects["sun"].rotation_euler = (math.radians(62), 0, math.radians(60))
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)
    cam.location = (0.0, -0.55, 1.6)
    cam.rotation_euler = (math.radians(90), 0, 0)
    cam.data.lens = 85
    sc.render.filepath = path.replace("_close", "_face")
    bpy.ops.render.render(write_still=True)
    for o in bpy.data.objects:
        o.hide_render = False


def preview(path):
    """Line the cast up and render them, lit like a bright Bali morning."""
    for i, cid in enumerate(CAST):
        bpy.data.objects[cid].location.x = (i - (len(CAST) - 1) / 2) * 0.9
    sc = bpy.context.scene
    for e in ("BLENDER_EEVEE_NEXT", "BLENDER_EEVEE"):
        try:
            sc.render.engine = e
            break
        except Exception:
            pass
    sc.render.resolution_x, sc.render.resolution_y = 1600, 900
    sc.view_settings.view_transform = "AgX"
    w = bpy.data.worlds.new("w")
    sc.world = w
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs[0].default_value = (0.8, 0.85, 0.9, 1)
    w.node_tree.nodes["Background"].inputs[1].default_value = 0.6
    sun = bpy.data.lights.new("sun", "SUN")
    sun.energy = 3.5
    so = bpy.data.objects.new("sun", sun)
    sc.collection.objects.link(so)
    so.rotation_euler = (math.radians(50), 0, math.radians(30))
    cam = bpy.data.cameras.new("cam")
    cam.lens = 50
    co = bpy.data.objects.new("cam", cam)
    sc.collection.objects.link(co)
    co.location = (0, -6.5, 1.1)
    co.rotation_euler = (math.radians(88), 0, 0)
    sc.camera = co
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)
    for cid in CAST:
        bpy.data.objects[cid].location.x = 0
    closeup(path.replace(".png", "_close.png"))


main()
