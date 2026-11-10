"""EEVEE previews of the loft from the chapter cameras (three.js coordinates)."""
import bpy, math, os
from mathutils import Vector
from lib import P, link

CAMS = {
    "intro": ((17, 12.5, 19), (0, 3.4, 0)),
    "run": ((174.0, 0.4, 10.0), (181.0, -0.4, 0.0)),
    "hiit": ((6.5, 2.4, 7.0), (11.4, 0.9, 0.2)),
    "cook": ((-0.55, 2.5, 5.7), (-3.2, 1.3, -1.1)),
    "build": ((1.9, 6.5, 5.6), (-3.1, 4.7, -1.9)),
    "clients": ((4.4, 3.0, 7.7), (3.0, 1.2, -1.3)),
    "post": ((7.6, 6.6, 5.4), (3, 4.5, -2.3)),
    "network": ((7.0, 9.7, 8.4), (3.2, 8.0, -0.4)),
}


def render(args):
    out = args[0]
    which = args[1].split(",") if len(args) > 1 else list(CAMS)
    sc = bpy.context.scene
    for e in ("BLENDER_EEVEE_NEXT", "BLENDER_EEVEE"):
        try:
            sc.render.engine = e
            break
        except Exception:
            pass
    sc.render.resolution_x, sc.render.resolution_y = 1280, 720
    sc.view_settings.view_transform = "AgX"
    w = bpy.data.worlds.new("sky")
    sc.world = w
    w.use_nodes = True
    bg = w.node_tree.nodes["Background"]
    sky = w.node_tree.nodes.new("ShaderNodeTexSky")
    try:
        sky.sky_type = "NISHITA"
        sky.sun_elevation = math.radians(28)
        sky.sun_rotation = math.radians(150)
    except Exception:
        pass
    w.node_tree.links.new(sky.outputs["Color"], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = 0.35
    sun = bpy.data.lights.new("sun", "SUN")
    sun.energy = 4.0
    sun.angle = math.radians(2)
    so = bpy.data.objects.new("sun", sun)
    link(so)
    so.rotation_euler = (math.radians(55), 0, math.radians(-35))
    cam = bpy.data.cameras.new("cam")
    cam.sensor_fit = "VERTICAL"
    cam.angle_y = math.radians(32)
    cam.clip_end = 9000
    co = bpy.data.objects.new("cam", cam)
    link(co)
    sc.camera = co
    for n in which:
        pos, look = CAMS[n]
        co.location = P(*pos)
        d = P(*look) - P(*pos)
        co.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
        sc.render.filepath = os.path.join(out, f"pv_{n}.png")
        bpy.ops.render.render(write_still=True)
