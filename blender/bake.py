"""Bakes real light onto the villa's architecture with Cycles:
  villa_sky  how much sky and bounce each surface sees (three.js aoMap)
  villa_lamp the warm light of the lamps after dark (three.js lightMap)
Static rooms get soft global illumination while the sun, the people and the
day cycle stay live. The maps use a second UV layer, "LM"."""
import bpy, math, os
import numpy as np
from lib import P

SIZE = 2048
LAMPS = [  # three.js position, watts
    (-3.8, 2.1, -0.75, 45), (-2.6, 2.1, -0.75, 45), 
    (-3.0, 5.8, -2.0, 55), (-3.95, 4.9, -2.6, 18), (3.3, 4.6, -0.2, 90), (3.3, 3.0, 0.1, 70), (3.0, 4.1, -2.2, 60), (5.55, 1.9, -2.25, 22),
    (-3.0, 9.3, 0.0, 70), (3.3, 9.3, -0.3, 80), (1.9, 7.6, 1.6, 30),
    (-3.0, 2.8, 2.5, 35), (3.0, 5.6, 2.5, 45), (-3.0, 6.3, 2.5, 35),
]


def _emission(scale):
    saved = {}
    for m in bpy.data.materials:
        if m.use_nodes and m.node_tree and "Principled BSDF" in m.node_tree.nodes:
            i = m.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"]
            saved[m.name] = i.default_value
            i.default_value *= scale
    return saved


def _restore(saved):
    for n, v in saved.items():
        bpy.data.materials[n].node_tree.nodes["Principled BSDF"].inputs["Emission Strength"].default_value = v


def _bake(img, samples):
    sc = bpy.context.scene
    sc.cycles.samples = samples
    bpy.ops.object.bake(type="DIFFUSE", pass_filter={"DIRECT", "INDIRECT"}, margin=8, uv_layer="LM", use_clear=True)
    px = np.array(img.pixels[:], dtype=np.float32).reshape(SIZE, SIZE, 4)[..., :3]
    return px


def _save(px, path):
    img = bpy.data.images.new(os.path.basename(path), SIZE, SIZE, alpha=False)
    rgba = np.dstack([np.clip(px, 0, 1) ** (1 / 2.2), np.ones((SIZE, SIZE))]).astype(np.float32)
    img.pixels.foreach_set(rgba.ravel())
    img.filepath_raw = path
    img.file_format = "PNG"
    img.save()


def run(out_dir, collections):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "METAL"
    prefs.get_devices()
    for d in prefs.devices:
        d.use = True
    sc.cycles.device = "GPU"
    sc.cycles.use_denoising = False

    skip = ("glass", "water", "rattan", "glow_")
    objs = []
    for c in collections:
        for o in c.objects:
            if o.type == "MESH" and o.data.users == 1 and not any(any(k in m.name for k in skip) for m in o.data.materials if m):
                objs.append(o)
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    arch = bpy.context.active_object
    arch.name = "villa_arch"
    print("BAKE joined", len(objs), "faces", len(arch.data.polygons))

    lm = arch.data.uv_layers.new(name="LM")
    arch.data.uv_layers.active = lm
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=math.radians(60), island_margin=0.004)
    # packed by bounding box, so no small island lands inside a big one
    bpy.ops.uv.select_all(action="SELECT")
    bpy.ops.uv.pack_islands(rotate=False, margin=0.003, shape_method="AABB")
    bpy.ops.object.mode_set(mode="OBJECT")

    img = bpy.data.images.new("lm", SIZE, SIZE, float_buffer=True, alpha=False)
    img.colorspace_settings.name = "Non-Color"
    added = []
    for i, m in enumerate(arch.data.materials):
        if m is None:  # slots left behind by the wall cut-outs
            arch.data.materials[i] = bpy.data.materials["render"]
    for m in set(arch.data.materials):
        n = m.node_tree.nodes.new("ShaderNodeTexImage")
        n.image = img
        m.node_tree.nodes.active = n
        added.append((m, n))

    w = bpy.data.worlds.new("bake")
    sc.world = w
    w.use_nodes = True
    bg = w.node_tree.nodes["Background"]

    # the sky: a white dome, no lamps
    bg.inputs[0].default_value = (1, 1, 1, 1)
    bg.inputs[1].default_value = 1.0
    saved = _emission(0)
    sky = _bake(img, 96)
    print("BAKE sky mean", sky.mean(), "p99", np.percentile(sky, 99))
    _save(sky, os.path.join(out_dir, "villa_sky.png"))
    _restore(saved)

    # after dark: no sky, just the lamps
    bg.inputs[1].default_value = 0.0
    saved = _emission(0)
    lights = []
    for i, (x, y, z, watts) in enumerate(LAMPS):
        li = bpy.data.lights.new(f"bake{i}", "POINT")
        li.energy = watts
        li.color = (1.0, 0.72, 0.44)
        li.shadow_soft_size = 0.12
        o = bpy.data.objects.new(f"bake{i}", li)
        sc.collection.objects.link(o)
        o.location = P(x, y, z)
        lights.append(o)
    lamp = _bake(img, 128)
    k = float(np.percentile(lamp, 99.5)) or 1.0
    print("BAKE lamp mean", lamp.mean(), "scale", k)
    _save(lamp / k, os.path.join(out_dir, "villa_lamp.png"))
    _restore(saved)

    for o in lights:
        bpy.data.objects.remove(o)
    for m, n in added:
        m.node_tree.nodes.remove(n)
    bpy.data.images.remove(img)
    # the colour textures read the world-scale layer; the maps read "LM"
    world_uv = next(l for l in arch.data.uv_layers if l.name != "LM")
    arch.data.uv_layers.active = world_uv
    world_uv.active_render = True
    print("BAKE layers", [(l.name, l.active_render) for l in arch.data.uv_layers])
