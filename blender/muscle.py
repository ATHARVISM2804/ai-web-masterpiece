"""Shredded: bakes muscle definition into a tangent-space normal map.

A subdivided copy of the body gets relief sculpted from its own skeleton,
which places it right on any build: the six-pack's linea alba and tendinous
rows, the obliques' borders, the V-lines down to the hips, the lower edge of
the pecs and the sternum, serratus fingers, the deltoid's cap and veins up the
forearms. Cycles bakes the copy onto the game mesh. The body shares
MakeHuman's UV layout with the whole cast, so one map serves everyone.
"""
import bpy, math, os
import numpy as np
from mathutils import Vector

SIZE = 2048


def _seg(p, a, b):
    """Parameter along a->b, distance from the line, and the radial vector."""
    d = b - a
    L2 = float(d @ d)
    t = ((p - a) @ d) / L2
    r = p - (a + np.outer(t, d))
    return t, np.linalg.norm(r, axis=1), r, d / math.sqrt(L2)


def _g(x, w):
    return np.exp(-((x / w) ** 2))


def relief(P, N, bone):
    """Height (metres) to push each point along its normal. P, N: (n, 3) in
    Blender space, character facing -Y, Z up."""
    zh = (bone("upperleg01.L").z + bone("upperleg01.R").z) / 2
    zs = (bone("upperarm01.L").z + bone("upperarm01.R").z) / 2
    T = zs - zh
    X, Z = np.abs(P[:, 0]), P[:, 2]
    front = np.clip(-N[:, 1], 0, 1)
    side = np.clip(np.abs(N[:, 0]), 0, 1)
    h = np.zeros(len(P))

    # six-pack: the centre line, three tendinous rows, the outer borders
    absz = (Z > zh + 0.1 * T) & (Z < zh + 0.68 * T)
    inside = X < 0.1
    h -= 0.0045 * _g(X, 0.007) * absz * front
    for k in (0.31, 0.43, 0.55):
        zr = zh + k * T + 0.025 * (X / 0.1) ** 2
        h -= 0.004 * _g(Z - zr, 0.0065) * inside * absz * front
    h -= 0.0055 * _g(X - 0.103, 0.009) * absz * front
    # each block bulges a little between its grooves
    h += 0.0016 * inside * absz * front * np.clip(np.sin(np.clip(X / 0.1, 0, 1) * math.pi), 0, 1)

    # the V-lines from the obliques down to the hips
    a = np.array([0.115, 0.0, zh + 0.17 * T])
    b = np.array([0.035, 0.0, zh - 0.07 * T])
    q = np.stack([X, np.zeros_like(X), Z], 1)
    t, dist, _, _ = _seg(q, a, b)
    h -= 0.005 * _g(dist, 0.008) * ((t > 0) & (t < 1)) * front

    # pecs: the lower border curving up to the armpit, the sternum between them
    zb = zh + T * (0.73 + 1.8 * (X - 0.055) ** 2)
    h -= 0.006 * _g(Z - zb, 0.011) * (X < 0.2) * front
    h += 0.0025 * (Z > zb) * (Z < zb + 0.12) * (X < 0.18) * front * _g(X - 0.09, 0.07)
    h -= 0.0035 * _g(X, 0.006) * (Z > zh + 0.72 * T) * (Z < zh + 0.95 * T) * front

    # serratus: fingers along the ribs under the arms
    serr = (X > 0.1) & (X < 0.17) & (Z > zh + 0.5 * T) & (Z < zh + 0.74 * T)
    h += 0.0018 * np.sin((Z - X * 0.6) / 0.034 * math.tau) * serr * np.clip(side + front * 0.5, 0, 1)

    for s in ("L", "R"):
        sh, el, wr = bone(f"upperarm01.{s}"), bone(f"lowerarm01.{s}"), bone(f"wrist.{s}")
        # the deltoid's lower edge, round the upper arm
        t, dist, _, _ = _seg(P, np.array(sh), np.array(el))
        near = (dist < 0.08) & (t > -0.05) & (t < 1.0)
        h -= 0.005 * _g(t - 0.42, 0.04) * near
        h += 0.002 * _g(t - 0.22, 0.12) * near
        # the line between biceps and triceps
        t2, dist2, r, ax = _seg(P, np.array(sh), np.array(el))
        fwd = np.array([0.0, -1.0, 0.0])
        fwd = fwd - ax * (fwd @ ax)
        fwd /= np.linalg.norm(fwd)
        out = np.cross(ax, fwd)
        ang = np.arctan2(r @ out, r @ fwd)
        h -= 0.003 * _g(np.abs(ang) - 1.5, 0.12) * near * (t2 > 0.45)
        # veins up the inside of the forearm
        t, dist, r, ax = _seg(P, np.array(el), np.array(wr))
        fwd = np.array([0.0, -1.0, 0.0])
        fwd = fwd - ax * (fwd @ ax)
        fwd /= np.linalg.norm(fwd)
        out = np.cross(ax, fwd)
        ang = np.arctan2(r @ out, r @ fwd)
        arm = (dist < 0.07) & (t > 0.08) & (t < 0.9)
        for k, base in enumerate((0.35, -0.5)):
            path = base + 0.32 * np.sin(t * 7.0 + k * 2.0)
            h += 0.0016 * _g(ang - path, 0.07) * arm
        # quads: the line between the outer quad and the rectus
        hip, kn = bone(f"upperleg01.{s}"), bone(f"lowerleg01.{s}")
        t, dist, r, ax = _seg(P, np.array(hip), np.array(kn))
        fwd = np.array([0.0, -1.0, 0.0])
        fwd = fwd - ax * (fwd @ ax)
        fwd /= np.linalg.norm(fwd)
        out = np.cross(ax, fwd)
        ang = np.arctan2(r @ out, r @ fwd)
        leg = (dist < 0.12) & (t > 0.25) & (t < 0.95)
        sgn = 1 if s == "L" else -1
        h -= 0.0035 * _g(ang - sgn * 0.75, 0.1) * leg
        h -= 0.0035 * _g(ang + sgn * 0.55, 0.09) * leg * (t > 0.6)  # the teardrop above the knee
    return h


def bake_definition(body, arm, out_path):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "METAL"
    prefs.get_devices()
    for d in prefs.devices:
        d.use = True
    sc.cycles.device = "GPU"
    sc.cycles.samples = 4

    def bone(n):
        return arm.data.bones[n].head_local

    # a dense copy carrying the relief
    hi = body.copy()
    hi.data = body.data.copy()
    hi.modifiers.clear()
    hi.parent = None
    hi.matrix_world = body.matrix_world.copy()
    sc.collection.objects.link(hi)
    sub = hi.modifiers.new("sub", "SUBSURF")
    sub.subdivision_type = "CATMULL_CLARK"  # smooth, so no facets get baked in
    sub.levels = sub.render_levels = 2
    bpy.ops.object.select_all(action="DESELECT")
    bpy.context.view_layer.objects.active = hi
    hi.select_set(True)
    bpy.ops.object.modifier_apply(modifier="sub")
    me = hi.data
    n = len(me.vertices)
    P = np.empty(n * 3)
    N = np.empty(n * 3)
    me.vertices.foreach_get("co", P)
    me.vertices.foreach_get("normal", N)
    P, N = P.reshape(-1, 3), N.reshape(-1, 3)
    h = relief(P, N, bone)
    me.vertices.foreach_set("co", (P + N * h[:, None]).ravel())
    me.update()
    print("MUSCLE verts", n, "relief range", h.min(), h.max())

    img = bpy.data.images.new("muscle_normal", SIZE, SIZE, alpha=False)
    img.colorspace_settings.name = "Non-Color"
    mat = body.data.materials[0]
    node = mat.node_tree.nodes.new("ShaderNodeTexImage")
    node.image = img
    mat.node_tree.nodes.active = node

    bpy.ops.object.select_all(action="DESELECT")
    hi.select_set(True)
    body.select_set(True)
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.bake(type="NORMAL", normal_space="TANGENT", use_selected_to_active=True,
                        cage_extrusion=0.012, max_ray_distance=0.03, margin=8, use_clear=True)
    img.filepath_raw = out_path
    img.file_format = "PNG"
    img.save()
    mat.node_tree.nodes.remove(node)
    bpy.data.objects.remove(hi)
    return out_path


def apply_normal(mat, path, strength=1.0):
    """Wire the baked definition into a skin material (exported as the glTF
    normal texture)."""
    nt = mat.node_tree
    b = nt.nodes["Principled BSDF"]
    t = nt.nodes.new("ShaderNodeTexImage")
    t.image = bpy.data.images.load(path, check_existing=True)
    t.image.colorspace_settings.name = "Non-Color"
    nm = nt.nodes.new("ShaderNodeNormalMap")
    nm.inputs["Strength"].default_value = strength
    nt.links.new(t.outputs["Color"], nm.inputs["Color"])
    nt.links.new(nm.outputs["Normal"], b.inputs["Normal"])
