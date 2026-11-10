"""Helpers for the loft build: three.js-style coordinates, PBR materials, and
primitive builders that bake real dimensions into the mesh (no object scale),
so the exported glTF matches the layout in src/life/world.ts.

Coordinates: every function takes three.js coordinates (Y up, +Z towards the
camera). P() turns them into Blender's Z-up space; the glTF exporter turns them
back.
"""
import bpy, bmesh, math, os
from mathutils import Vector, Matrix

ROOT = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(ROOT, "assets")


def P(x, y, z):
    return Vector((x, -z, y))


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for c in list(bpy.data.collections):
        bpy.data.collections.remove(c)


def link(o, coll=None):
    (coll or bpy.context.scene.collection).objects.link(o)
    return o


def collection(name):
    c = bpy.data.collections.get(name) or bpy.data.collections.new(name)
    if c.name not in bpy.context.scene.collection.children:
        bpy.context.scene.collection.children.link(c)
    return c


# ---------------- materials ----------------

def _bsdf(m):
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes.get("Principled BSDF")
    return nt, b


def flat(name, color, rough=0.5, metal=0.0, emit=None, emit_strength=1.0, alpha=None):
    m = bpy.data.materials.get(name)
    if m:
        return m
    m = bpy.data.materials.new(name)
    nt, b = _bsdf(m)
    c = hex_rgb(color)
    b.inputs["Base Color"].default_value = (*c, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if emit:
        b.inputs["Emission Color"].default_value = (*hex_rgb(emit), 1)
        b.inputs["Emission Strength"].default_value = emit_strength
    if alpha is not None:
        b.inputs["Alpha"].default_value = alpha
        m.blend_method = "BLEND" if hasattr(m, "blend_method") else None
        try:
            m.surface_render_method = "BLENDED"
        except Exception:
            pass
    m.diffuse_color = (*c, 1)
    return m


def tex_mat(name, tex, tile, tint=None, rough_mult=None, normal=1.0, metal=0.0):
    """A tiling PBR material from assets/textures/<tex>. `tile` is metres per
    texture repeat, read by uv_world() when it lays out the UVs."""
    m = bpy.data.materials.get(name)
    if m:
        return m
    m = bpy.data.materials.new(name)
    m["tile"] = tile
    nt, b = _bsdf(m)
    d = os.path.join(ASSETS, "textures", tex)

    def img(file, non_color=False):
        p = os.path.join(d, file)
        if not os.path.exists(p):
            return None
        n = nt.nodes.new("ShaderNodeTexImage")
        n.image = bpy.data.images.load(p, check_existing=True)
        if non_color:
            n.image.colorspace_settings.name = "Non-Color"
        return n

    col = img("Diffuse.jpg")
    if col:
        if tint:
            mix = nt.nodes.new("ShaderNodeMix")
            mix.data_type = "RGBA"
            mix.blend_type = "MULTIPLY"
            mix.inputs["Factor"].default_value = 1.0
            mix.inputs[7].default_value = (*hex_rgb(tint), 1)
            nt.links.new(col.outputs["Color"], mix.inputs[6])
            nt.links.new(mix.outputs[2], b.inputs["Base Color"])
        else:
            nt.links.new(col.outputs["Color"], b.inputs["Base Color"])
    r = img("Rough.jpg", True)
    if r:
        nt.links.new(r.outputs["Color"], b.inputs["Roughness"])
    n = img("nor_gl.jpg", True)
    if n:
        nm = nt.nodes.new("ShaderNodeNormalMap")
        nm.inputs["Strength"].default_value = normal
        nt.links.new(n.outputs["Color"], nm.inputs["Color"])
        nt.links.new(nm.outputs["Normal"], b.inputs["Normal"])
    b.inputs["Metallic"].default_value = metal
    m.diffuse_color = (*(hex_rgb(tint) if tint else (0.7, 0.7, 0.7)), 1)
    return m


def gen_mat(name, path, tile, tint=None, rough=0.7, metal=0.0, alpha=False):
    """A tiling material from a generated texture (bali_tex)."""
    m = bpy.data.materials.get(name)
    if m:
        return m
    m = bpy.data.materials.new(name)
    m["tile"] = tile
    nt, b = _bsdf(m)
    n = nt.nodes.new("ShaderNodeTexImage")
    n.image = bpy.data.images.load(path, check_existing=True)
    out = n.outputs["Color"]
    if tint:
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
        try:
            m.surface_render_method = "DITHERED"
        except Exception:
            pass
        m.blend_method = "CLIP" if hasattr(m, "blend_method") else None
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    m.diffuse_color = (*(hex_rgb(tint) if tint else (0.7, 0.7, 0.7)), 1)
    return m


def image_mat(name, path, rough=0.6, emissive=False):
    m = bpy.data.materials.get(name)
    if m:
        return m
    m = bpy.data.materials.new(name)
    nt, b = _bsdf(m)
    n = nt.nodes.new("ShaderNodeTexImage")
    n.image = bpy.data.images.load(path, check_existing=True)
    nt.links.new(n.outputs["Color"], b.inputs["Base Color"])
    if emissive:
        nt.links.new(n.outputs["Color"], b.inputs["Emission Color"])
        b.inputs["Emission Strength"].default_value = 1.0
    b.inputs["Roughness"].default_value = rough
    return m


def hex_rgb(h):
    h = h.lstrip("#")
    srgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb)


# ---------------- geometry ----------------

def _obj(name, bm, mat, coll=None):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    if mat:
        o.data.materials.append(mat)
    link(o, coll)
    return o


def box(name, w, h, d, x, y, z, mat, ry=0.0, bevel=0.008, coll=None, rx=0.0, seg=2):
    """A box resting on y (three.js), centred on x/z, rotated ry about Y."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=Vector((w, d, h)), verts=bm.verts)
    bmesh.ops.translate(bm, vec=Vector((0, 0, h / 2)), verts=bm.verts)
    if bevel > 0:
        bv = min(bevel, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4)
        bmesh.ops.bevel(bm, geom=bm.edges[:], offset=bv, segments=seg, affect="EDGES", profile=0.5)
    o = _obj(name, bm, mat, coll)
    o.location = P(x, y, z)
    o.rotation_euler = (rx, 0, ry)
    return o


def cyl(name, r_top, r_bot, h, x, y, z, mat, seg=32, coll=None, ry=0.0, rx=0.0, rz=0.0, bevel=0.0):
    """Upright cylinders rest on y; tipped ones (rx or rz) are centred on the point."""
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r_bot, radius2=r_top, depth=h)
    if not (rx or rz):
        bmesh.ops.translate(bm, vec=Vector((0, 0, h / 2)), verts=bm.verts)
    if bevel:
        edges = [e for e in bm.edges if len(e.link_faces) == 2 and abs(e.link_faces[0].normal.dot(e.link_faces[1].normal)) < 0.5]
        bmesh.ops.bevel(bm, geom=edges, offset=bevel, segments=2, affect="EDGES")
    for f in bm.faces:
        f.smooth = abs(f.normal.z) < 0.5
    o = _obj(name, bm, mat, coll)
    o.location = P(x, y, z)
    o.rotation_euler = (rx, rz, ry)
    return o


def sphere(name, r, x, y, z, mat, coll=None, scale=(1, 1, 1)):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=24, v_segments=16, radius=r)
    bmesh.ops.scale(bm, vec=Vector((scale[0], scale[2], scale[1])), verts=bm.verts)
    for f in bm.faces:
        f.smooth = True
    o = _obj(name, bm, mat, coll)
    o.location = P(x, y, z)
    return o


def torus(name, R, r, x, y, z, mat, coll=None, rx=0.0, ry=0.0, seg=40):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, major_segments=seg, minor_segments=12)
    o = bpy.context.active_object
    o.name = name
    for c in o.users_collection:
        c.objects.unlink(o)
    link(o, coll)
    o.data.materials.append(mat)
    o.location = P(x, y, z)
    o.rotation_euler = (rx, 0, ry)
    bpy.ops.object.select_all(action="DESELECT")
    return o


def tube(name, pts, r, mat, coll=None):
    """A round bar through three.js points."""
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = r
    cu.bevel_resolution = 3
    sp = cu.splines.new("POLY")
    sp.points.add(len(pts) - 1)
    for p, (x, y, z) in zip(sp.points, pts):
        p.co = (*P(x, y, z), 1)
    o = bpy.data.objects.new(name, cu)
    o.data.materials.append(mat)
    link(o, coll)
    return o


def uv_world(o, tile=None):
    """Box-project UVs in world metres so tiling textures keep a true scale."""
    if o.type != "MESH":
        return
    me = o.data
    if not me.uv_layers:
        me.uv_layers.new(name="UVMap")
    mw = o.matrix_world
    bm = bmesh.new()
    bm.from_mesh(me)
    uv = bm.loops.layers.uv.active or bm.loops.layers.uv.new()
    rot = mw.to_3x3()
    for f in bm.faces:
        m = me.materials[f.material_index] if me.materials else None
        t = tile or (m.get("tile") if m else None) or 1.0
        n = (rot @ f.normal).normalized()
        ax = max(range(3), key=lambda i: abs(n[i]))
        for l in f.loops:
            w = mw @ l.vert.co
            if ax == 2:
                u, v = w.x, w.y
            elif ax == 0:
                u, v = w.y, w.z
            else:
                u, v = w.x, w.z
            l[uv].uv = (u / t, v / t)
    bm.to_mesh(me)
    bm.free()


def boolean_cut(o, cutters):
    for c in cutters:
        mod = o.modifiers.new("cut", "BOOLEAN")
        mod.operation = "DIFFERENCE"
        mod.object = c
        mod.solver = "EXACT"
    bpy.context.view_layer.objects.active = o
    for mod in list(o.modifiers):
        bpy.ops.object.modifier_apply(modifier=mod.name)
    for c in cutters:
        bpy.data.objects.remove(c)


# ---------------- imported models ----------------

_models = {}
# small props seen from metres away get a tighter triangle budget
BUDGET = {"ceramic_vase_01": 800, "street_lamp_01": 4000, "food_lime_01": 1200, "lemon": 1200,
          "food_avocado_01": 1200, "wooden_bowl_01": 2500, "bar_chair_round_01": 5000}


def model(mid, x, y, z, ry=0.0, s=1.0, coll=None, name=None, sz=None, budget=6000):
    """Place a Poly Haven model, base on y. Later copies share mesh data, so the
    glTF stores each model once."""
    if mid not in _models:
        path = os.path.join(ASSETS, "models", mid, f"{mid}.gltf")
        before = set(bpy.data.objects)
        bpy.ops.import_scene.gltf(filepath=path)
        objs = [o for o in bpy.data.objects if o not in before]
        names = [o.name for o in objs]
        meshes = [o for o in objs if o.type == "MESH"]
        bpy.ops.object.select_all(action="DESELECT")
        for o in meshes:
            o.select_set(True)
        bpy.context.view_layer.objects.active = meshes[0]
        # scanned props carry far more triangles than they need at this
        # distance: cap each part, so a plant pot is not 46k triangles
        budget = BUDGET.get(mid, budget)
        for o in meshes:
            tris = sum(len(p.vertices) - 2 for p in o.data.polygons)
            if tris > budget:
                d = o.modifiers.new("dec", "DECIMATE")
                d.ratio = budget / tris
                bpy.context.view_layer.objects.active = o
                bpy.ops.object.modifier_apply(modifier="dec")
        bpy.context.view_layer.objects.active = meshes[0]
        # flatten the import into one object at the origin with its base on 0
        bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM")
        if len(meshes) > 1:
            bpy.ops.object.join()
        src = bpy.context.active_object
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        for n in names:
            o = bpy.data.objects.get(n)
            if o and o != src:
                bpy.data.objects.remove(o)
        zs = [v.co.z for v in src.data.vertices]
        xs = [v.co.x for v in src.data.vertices]
        ys = [v.co.y for v in src.data.vertices]
        off = Vector(((min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2, min(zs)))
        src.data.transform(Matrix.Translation(-off))
        for c in src.users_collection:
            c.objects.unlink(src)
        src.name = f"src_{mid}"
        _models[mid] = src
    src = _models[mid]
    o = bpy.data.objects.new(name or mid, src.data)
    link(o, coll)
    o.location = P(x, y, z)
    o.rotation_euler = (0, 0, ry)
    o.scale = (s, s, sz if sz else s)
    return o


def dims(mid):
    o = _models[mid]
    xs = [v.co.x for v in o.data.vertices]
    ys = [v.co.y for v in o.data.vertices]
    zs = [v.co.z for v in o.data.vertices]
    return max(xs) - min(xs), max(zs) - min(zs), max(ys) - min(ys)
