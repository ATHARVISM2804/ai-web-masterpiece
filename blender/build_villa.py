"""Builds Atharv's Bali villa and its surroundings for the "day with Atharv"
scroll, and exports them as a glTF. Run headless:

  Blender -b --factory-startup -P blender/build_villa.py -- <out.glb> [previews-dir [cams]]

Modern tropical, the way Canggu and Uluwatu villas are built: white render
and teak, terrazzo and ironwood underfoot, a volcanic-stone feature wall,
rattan and cane, rooms open to an infinity pool, a thatched bale for the gym,
a family shrine in the garden, and a candi bentar gate onto the lane. The
floor plan keeps the levels src/life/world.ts expects (ground 0, first
floor 3.5 m, roof 7 m).

Naming contract with world.ts:
  material "glass*" / "*_glass"   transparent glazing
  material "glow_*"               lamps, brighter after dusk
  material "city_win*"            windows that light up at night
  material "pool_water" / "sea"   animated water
"""
import bpy, math, os, random, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *  # noqa
import bali_tex
import bali_props as bp
import bali

random.seed(7)
F, R = 3.5, 7.0
reset()
T = bali_tex.all_textures()

# ---------------- materials ----------------
M = dict(
    render=flat("render", "#f4f0e8", rough=0.85),
    slab=flat("slab", "#ece6dc", rough=0.85),
    terrazzo=gen_mat("terrazzo", T["terrazzo"], 2.2, rough=0.35),
    teakfloor=tex_mat("teak_floor", "laminate_floor_02", 2.4, tint="#e9c9a0"),
    ulin=tex_mat("ulin_deck", "wood_floor_deck", 2.0, tint="#8a6a52"),
    teak=tex_mat("teak", "laminate_floor_02", 2.4, tint="#e7b27c"),
    beam=tex_mat("teak_beam", "wood_table_001", 1.4, tint="#ffd9a8"),
    cedar=tex_mat("cedar", "laminate_floor_02", 1.6, tint="#d08a5c"),
    villa_win=flat("city_win_villa", "#2c3a40", rough=0.08, metal=0.3, emit="#ffcf8a", emit_strength=1.0),
    suar=tex_mat("suar", "laminate_floor_02", 3.0, tint="#d49f6c"),
    paras=tex_mat("paras", "white_sandstone_bricks", 2.0, tint="#f3eadc"),
    candi=tex_mat("batu_candi", "volcanic_rock_tiles", 1.6, tint="#f2eee6"),
    riverstone=tex_mat("river_stone", "stacked_stone_wall", 1.8, tint="#cfc6b8"),
    redbrick=tex_mat("red_brick", "red_brick", 1.4, tint="#e7b39a"),
    pavers=tex_mat("pavers", "concrete_pavers", 2.0, tint="#d9d2c6"),
    thatch=gen_mat("thatch", T["thatch"], 1.5, rough=0.95),
    bamboo=flat("bamboo_ceiling", "#c8a874", rough=0.8),
    rattan=gen_mat("rattan", T["rattan"], 0.5, rough=0.7, alpha=True),
    lattice=gen_mat("rattan_lattice", T["lattice"], 1.0, rough=0.7, alpha=True),
    palmprint=gen_mat("palm_print", T["palm_print"], 0.55, rough=0.95),
    mottle=gen_mat("rug_mottle", T["mottle"], 2.4, rough=1.0),
    plank=tex_mat("plank_floor", "laminate_floor_02", 2.6, tint="#b98c66"),
    rattan_solid=gen_mat("rattan_solid", T["rattan"], 0.5, rough=0.7),
    pooltile=gen_mat("pool_stone", T["pool"], 2.0, rough=0.4),
    lawn=gen_mat("lawn", T["lawn"], 3.0, tint="#a3b28f", rough=1.0),
    rice=gen_mat("rice", T["rice"], 4.0, rough=0.8),
    sand=gen_mat("sand", T["sand"], 3.0, rough=0.95),
    zellige=gen_mat("zellige", T["pool"], 0.8, tint="#b9d9c7", rough=0.15),
    bronze=flat("bronze", "#5a4632", rough=0.4, metal=0.7),
    brass=flat("brass", "#e6c27a", rough=0.22, metal=1.0),
    chrome=flat("chrome", "#d9dce2", rough=0.18, metal=1.0),
    alu=flat("aluminium", "#c4c7cc", rough=0.32, metal=0.9),
    steel=flat("steel_black", "#1b1c1f", rough=0.42, metal=0.6),
    black=flat("matte_black", "#151517", rough=0.6),
    rubberb=flat("rubber_black", "#1a1a1c", rough=0.85),
    rubber=flat("rubber_floor", "#2a2b2e", rough=0.9),
    linen=flat("linen", "#eee6d8", rough=0.95),
    cushion=flat("cushion", "#f2ece1", rough=0.95),
    sage=flat("fabric_sage", "#9fae92", rough=0.95),
    clay=flat("terracotta", "#c47a52", rough=0.8),
    ceramic=flat("ceramic", "#f4f1ea", rough=0.25),
    glass=flat("glass_clear", "#e3f1f2", rough=0.05, alpha=0.16),
    water=flat("pool_water", "#3fb6b0", rough=0.03, metal=0.1, alpha=0.62),
    bulb=flat("glow_warm", "#fff1d6", emit="#ffd9a0", emit_strength=3.0),
    led=flat("glow_led", "#fff6e8", emit="#fff2dc", emit_strength=4.0),
    fire=flat("glow_fire", "#ffb15c", emit="#ff8a2a", emit_strength=6.0),
    mat_yoga=flat("yoga_mat", "#c9a77c", rough=0.85),
    book=[flat(f"book_{i}", c, rough=0.7) for i, c in enumerate(["#c8553d", "#e9c46a", "#2a4b6e", "#3f6f4f", "#efe6d8", "#1d1d21", "#8c6a9f", "#d98c5f"])],
)

V = collection("villa")
I = collection("interior")
G = collection("garden")

# ---------------- shell ----------------
W, D = 12.4, 8.4
# the first floor only covers the left half: the right is a double-height room
for y, w_, cx in ((0.0, W, 0.0), (F, 6.3, -3.05), (R, W, 0.0)):
    box(f"slab_{y}", w_, 0.38, D, cx, y - 0.38, 0, M["slab"], bevel=0.02, coll=V)
    # a slim teak fascia on the open edges, the way villas trim their slabs
    box(f"fascia_f_{y}", w_ + 0.04, 0.12, 0.05, cx, y - 0.3, D / 2 + 0.025, M["teak"], bevel=0.005, coll=V)
for y in (0.0, R):
    box(f"fascia_r_{y}", 0.05, 0.12, D + 0.04, W / 2 + 0.025, y - 0.3, 0, M["teak"], bevel=0.005, coll=V)
# the mezzanine edge: a black steel band under a glass balustrade
box("mezz_band", 0.1, 0.5, D, 0.14, F - 0.5, 0, M["steel"], bevel=0.005, coll=V)
box("mezz_glass", 0.02, 1.05, 7.9, 0.08, F, 0.05, M["glass"], bevel=0, coll=V)
box("mezz_rail", 0.05, 0.03, 7.9, 0.08, F + 1.05, 0.05, M["steel"], bevel=0.004, coll=V)
for k in range(5):
    box(f"mezz_post_{k}", 0.05, 0.24, 0.05, 0.08, F, -3.6 + k * 1.85, M["steel"], bevel=0.004, coll=V)
for y in (F, R):
    w_, cx = (5.9, -3.05) if y == F else (W - 0.4, 0.0)
    box(f"cove_f_{y}", w_, 0.03, 0.04, cx, y - 0.42, D / 2 - 0.1, M["led"], bevel=0, coll=V)
box("floor_ground", 6.0, 0.02, 8.0, -3.0, -0.012, 0, M["terrazzo"], bevel=0, coll=V)
box("floor_living", 6.0, 0.02, 8.0, 3.0, -0.012, 0, M["plank"], bevel=0, coll=V)
box("floor_first", 6.05, 0.02, 8.0, -3.05, F - 0.012, 0, M["teakfloor"], bevel=0, coll=V)
box("floor_roof", 12.0, 0.04, 8.0, 0, R - 0.02, 0, M["ulin"], bevel=0.004, coll=V)

back = box("wall_back", W, R + 0.5, 0.3, 0, -0.38, -4.05, M["render"], bevel=0.01, coll=V)
left = box("wall_left", 0.3, R + 0.5, D, -6.05, -0.38, 0, M["render"], bevel=0.01, coll=V)
OPEN_BACK = [(-4.7, -2.1, 1.15, 2.3), (0.6, 5.7, F - 0.3, F + 2.9), (-5.6, -4.6, F + 0.4, F + 2.95)]
OPEN_LEFT = [(0.7, 3.2, 0.5, 2.8), (0.9, 3.4, F + 0.6, F + 2.95)]
boolean_cut(back, [box(f"c_b{i}", x1 - x0, y1 - y0, 0.8, (x0 + x1) / 2, y0, -4.05, None, bevel=0) for i, (x0, x1, y0, y1) in enumerate(OPEN_BACK)])
boolean_cut(left, [box(f"c_l{i}", 0.8, y1 - y0, z1 - z0, -6.05, y0, (z0 + z1) / 2, None, bevel=0) for i, (z0, z1, y0, y1) in enumerate(OPEN_LEFT)])


def window(name, u0, u1, y0, y1, plane, fixed, panes_u=3):
    """Slim bronze-and-teak framed glazing."""
    w, h = u1 - u0, y1 - y0
    t = 0.05

    def B(n, bw, bh, bx, by, m=M["teak"]):
        if plane == "back":
            return box(n, bw, bh, 0.07, (u0 + u1) / 2 + bx, y0 + by, fixed, m, bevel=0.005, coll=V)
        return box(n, 0.07, bh, bw, fixed, y0 + by, (u0 + u1) / 2 + bx, m, bevel=0.005, coll=V)

    if plane == "back":
        box(name + "_glass", w, h, 0.01, (u0 + u1) / 2, y0, fixed, M["glass"], bevel=0, coll=V)
    else:
        box(name + "_glass", 0.01, h, w, fixed, y0, (u0 + u1) / 2, M["glass"], bevel=0, coll=V)
    B(name + "_t", w, t, 0, h - t)
    B(name + "_b", w, t, 0, 0)
    B(name + "_l", t, h, -w / 2 + t / 2, 0)
    B(name + "_r", t, h, w / 2 - t / 2, 0)
    for i in range(1, panes_u):
        B(f"{name}_m{i}", 0.03, h, -w / 2 + w * i / panes_u, 0, M["bronze"])


for i, (x0, x1, y0, y1) in enumerate(OPEN_BACK):
    window(f"win_b{i}", x0, x1, y0, y1, "back", -4.0, panes_u=max(1, round((x1 - x0) / 1.1)))
for i, (z0, z1, y0, y1) in enumerate(OPEN_LEFT):
    window(f"win_l{i}", z0, z1, y0, y1, "left", -6.0, panes_u=max(1, round((z1 - z0) / 1.1)))

# volcanic stone feature wall in the studio, paras behind the meeting screen
box("candi_studio", 6.0, R - F - 0.38, 0.04, -3.0, F, -3.88, M["candi"], bevel=0, coll=V)
boolean_cut(bpy.data.objects["candi_studio"], [box("c_cs", 1.0, 2.55, 0.4, -5.1, F + 0.4, -3.88, None, bevel=0)])
box("zellige_kitchen", 5.3, 0.5, 0.02, -3.2, 0.91, -3.87, M["zellige"], bevel=0, coll=V)

# render columns at the open corners
for (x, z) in ((5.95, 3.95), (5.95, -3.85), (-5.85, 3.95)):
    box(f"col_{x}_{z}", 0.36, R, 0.36, x, -0.38, z, M["paras"], bevel=0.02, coll=V)

# ground floor divider: a teak batten screen
for i in range(26):
    z = -3.75 + i * 0.3
    if -0.2 < z < 1.6:
        continue  # the opening between kitchen and living
    box(f"screen_{i}", 0.06, 3.1, 0.05, 0, 0, z, M["teak"], bevel=0.005, coll=V)
box("screen_head", 0.1, 0.06, 7.8, 0, 3.06, 0.1, M["teak"], coll=V)

# ---------------- kitchen (ground, left) ----------------
K = I
box("k_kick", 5.2, 0.1, 0.62, -3.2, 0, -3.5, M["black"], bevel=0, coll=K)
box("k_body", 5.2, 0.76, 0.66, -3.2, 0.1, -3.5, M["teak"], bevel=0.004, coll=K)
for i in range(8):
    x = -5.8 + 0.325 + i * 0.65
    box(f"k_door_{i}", 0.6, 0.7, 0.025, x, 0.13, -3.155, M["rattan_solid"], bevel=0.004, coll=K)
    box(f"k_frame_{i}", 0.635, 0.76, 0.02, x, 0.1, -3.165, M["teak"], bevel=0.004, coll=K)
    box(f"k_pull_{i}", 0.014, 0.2, 0.02, x + (0.25 if i % 2 else -0.25), 0.55, -3.13, M["brass"], bevel=0, coll=K)
box("k_top", 5.3, 0.05, 0.72, -3.2, 0.86, -3.48, M["terrazzo"], bevel=0.008, coll=K)
box("k_sink", 0.62, 0.02, 0.4, -1.75, 0.905, -3.45, M["chrome"], bevel=0.01, coll=K)
cyl("k_tap", 0.016, 0.016, 0.34, -1.75, 0.91, -3.7, M["brass"], coll=K)
tube("k_spout", [(-1.75, 1.25, -3.7), (-1.75, 1.3, -3.6), (-1.75, 1.22, -3.48)], 0.014, M["brass"], coll=K)
for j, y in enumerate((1.5, 2.0)):
    box(f"k_shelf_{j}", 1.1, 0.045, 0.26, -1.3, y, -3.77, M["teak"], bevel=0.004, coll=K)
for j, (x, y, r, h) in enumerate([(-1.7, 1.545, 0.07, 0.16), (-1.5, 1.545, 0.07, 0.16), (-1.05, 1.545, 0.09, 0.1), (-0.95, 2.045, 0.06, 0.22), (-1.55, 2.045, 0.08, 0.14)]):
    cyl(f"k_jar_{j}", r, r, h, x, y, -3.77, M["clay"] if j % 2 else M["ceramic"], coll=K)
box("k_fridge", 0.9, 2.2, 0.72, -5.45, 0, -1.25, M["teak"], ry=math.pi / 2, bevel=0.006, coll=K)
box("k_fridge_line", 0.004, 2.1, 0.01, -5.07, 0.05, -1.25, M["black"], bevel=0, coll=K)
box("k_tall", 0.9, 2.2, 0.72, -5.45, 0, -2.2, M["teak"], ry=math.pi / 2, bevel=0.006, coll=K)
for dz in (-0.06, 0.06):
    box(f"k_fh_{dz}", 0.02, 0.6, 0.02, -5.06, 0.9, -1.25 + dz, M["brass"], bevel=0, coll=K)
# island: fluted teak body, terrazzo slab
box("k_island", 2.5, 0.86, 1.0, -3.2, 0, -0.75, M["teak"], bevel=0.006, coll=K)
for i in range(30):
    box(f"k_flute_{i}", 0.05, 0.8, 0.03, -4.42 + i * 0.084, 0.03, -0.24, M["teak"], bevel=0.012, coll=K)
box("k_island_top", 2.8, 0.07, 1.2, -3.2, 0.86, -0.75, M["terrazzo"], bevel=0.012, coll=K)
box("k_hob", 0.56, 0.008, 0.44, -2.75, 0.93, -0.95, flat("hob_glass", "#0c0c0e", rough=0.08), bevel=0.01, coll=K)
model("pot_enamel_01", -2.75, 0.94, -0.95, ry=0.4, coll=K)
model("wooden_cutting_board", -3.7, 0.93, -0.65, ry=0.2, coll=K)
model("food_avocado_01", -3.62, 0.97, -0.62, coll=K)
model("lemon", -3.85, 0.97, -0.7, ry=1.0, coll=K)
model("food_lime_01", -3.55, 0.97, -0.74, coll=K)
model("wooden_bowl_01", -4.15, 0.93, -0.9, coll=K)
for j, (x, z) in enumerate([(-4.2, -0.88), (-4.12, -0.94), (-4.22, -0.95)]):
    model("lemon" if j % 2 else "food_lime_01", x, 0.96, z, ry=j, coll=K)
model("ceramic_vase_01", -5.1, 0.91, -3.55, s=0.8, coll=K)
model("potted_plant_04", -0.95, 0.91, -3.5, s=1.4, coll=K)
for x in (-3.9, -2.5):
    model("bar_chair_round_01", x, 0, 0.12, coll=K)
for x in (-3.8, -2.6):
    bp.rattan_pendant(f"k_pend_{x}", x, 2.2, -0.75, K, M)

# ---------------- the double-height living room (right) ----------------
def sofa(name, x, y, z, w, d=0.95, ry=0.0, fab=None, coll=K, seats=2):
    fab = fab or M["linen"]
    c, s_ = math.cos(ry), math.sin(ry)

    def at(dx, dz):
        return x + dx * c + dz * s_, z - dx * s_ + dz * c

    px, pz = at(0, 0)
    box(f"{name}_base", w, 0.24, d, px, y + 0.06, pz, fab, ry=ry, bevel=0.05, coll=coll, seg=3)
    inner = w - 0.4
    for i in range(seats):
        cx, cz = at(-inner / 2 + inner / seats * (i + 0.5), 0.08)
        box(f"{name}_seat{i}", inner / seats - 0.02, 0.2, d - 0.3, cx, y + 0.28, cz, M["cushion"], ry=ry, bevel=0.08, coll=coll, seg=4)
    bx_, bz_ = at(0, -d / 2 + 0.12)
    box(f"{name}_back", w, 0.46, 0.24, bx_, y + 0.28, bz_, fab, ry=ry, bevel=0.09, coll=coll, seg=4)
    for sx in (-1, 1):
        ax, az = at(sx * (w / 2 - 0.1), 0)
        box(f"{name}_arm{sx}", 0.2, 0.3, d, ax, y + 0.28, az, fab, ry=ry, bevel=0.08, coll=coll, seg=4)


def pillows(name, x, y, z, ry, across, coll=K):
    """A row of plump cushions along a sofa back, every other one palm-printed."""
    c, s_ = math.cos(ry), math.sin(ry)
    n = int(across / 0.52)
    for i in range(n):
        u = -across / 2 + (i + 0.5) * across / n
        big = i % 2 == 0
        size = 0.5 if big else 0.42
        m = M["palmprint"] if i % 3 == 1 else (M["cushion"] if big else M["linen"])
        box(f"{name}_{i}", size, size, 0.15, x + u * c, y, z - u * s_, m, ry=ry, rx=-0.28, bevel=0.07, coll=coll, seg=4)


# floating stair: thick teak treads cantilevered off the back wall, up to the mezzanine
for i in range(20):
    x = 5.72 - i * 0.29
    top = (i + 1) * 0.175
    box(f"stair_{i}", 0.34, 0.15, 1.05, x, top - 0.15, -3.36, M["teak"], bevel=0.01, coll=K)
    box(f"stair_glass_{i}", 0.3, 1.0, 0.02, x, top, -2.82, M["glass"], bevel=0, coll=K)
tube("stair_rail", [(5.9, 1.2, -2.82), (0.2, 3.5 + 1.0, -2.82)], 0.014, M["steel"], coll=K)
# the garden under the stair
box("stair_bed", 4.6, 0.14, 0.95, 3.2, 0, -3.4, M["candi"], bevel=0.02, coll=K)
for k, (x, s_) in enumerate(((1.4, 0.72), (2.3, 0.6), (3.2, 0.42))):
    bp.banana(f"stair_banana{k}", x, 0.14, -3.4, K, s=s_)
model("ceramic_pot", 4.3, 0.14, -3.4, s=0.9, coll=K)
model("ceramic_pot", 4.95, 0.14, -3.5, ry=1.1, s=0.65, coll=K)
model("potted_plant_02", 3.8, 0.14, -3.3, s=0.8, coll=K)

# two long white sofas round two teak beams
box("lv_rug", 4.5, 0.012, 3.3, 3.25, 0, -0.05, M["mottle"], bevel=0, coll=K)
sofa("lv_sofa", 3.3, 0, -1.85, 3.9, d=1.1, seats=3)
pillows("lv_pil", 3.3, 0.5, -2.1, 0.0, 3.3)
sofa("lv_sofa2", 0.95, 0, 0.2, 3.0, d=1.1, ry=math.pi / 2, seats=2)
pillows("lv_pil2", 0.72, 0.5, 0.2, math.pi / 2, 2.4)
for k, z in enumerate((-0.42, 0.42)):
    box(f"lv_beam{k}", 2.5, 0.36, 0.72, 3.35, 0.0, z, M["beam"], bevel=0.012, coll=K)
    for sx in (-1, 1):
        box(f"lv_strap{k}{sx}", 0.3, 0.385, 0.74, 3.35 + sx * 1.0, 0.0, z, M["black"], bevel=0.006, coll=K)
for k, (x, z, c) in enumerate(((2.8, -0.42, 0), (3.1, -0.45, 1), (3.9, 0.4, 2), (2.9, 0.42, 3))):
    box(f"lv_book{k}", 0.36, 0.035, 0.26, x, 0.36, z, M["book"][c], ry=0.2 * k, bevel=0.004, coll=K)
model("wooden_bowl_01", 3.6, 0.36, -0.4, s=0.9, coll=K)
model("modern_arm_chair_01", 5.45, 0, -0.5, ry=-math.pi / 2, coll=K)
model("modern_arm_chair_01", 5.45, 0, 0.55, ry=-math.pi / 2, coll=K)
# the cloud lamp on its teak tripod
for k in range(3):
    a = k * 2.094 + 0.5
    tube(f"cl_leg{k}", [(5.55 + math.cos(a) * 0.32, 0, -2.25 + math.sin(a) * 0.32), (5.55, 1.75, -2.25)], 0.02, M["teak"], coll=K)
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=4, radius=0.42)
cloud = bpy.context.active_object
for c in list(cloud.users_collection):
    c.objects.unlink(cloud)
link(cloud, K)
cloud.name = "cl_shade"
for v in cloud.data.vertices:
    n = v.co.normalized()
    v.co *= 1 + 0.16 * math.sin(n.x * 8 + n.z * 3) * math.cos(n.y * 7) + 0.08 * math.sin(n.z * 15)
for f in cloud.data.polygons:
    f.use_smooth = True
cloud.data.materials.append(M["cushion"])
cloud.scale = (1, 1, 0.62)
cloud.location = P(5.55, 1.98, -2.25)

# a cloud of rattan pendants, big ones high, little ones low
for k, (kind, x, y, z, s_) in enumerate((
    ("bell", 3.3, 5.3, -0.2, 1.25), ("tear", 2.5, 4.7, 0.3, 1.1), ("tear", 4.1, 4.9, -0.6, 1.2), ("bell", 3.9, 4.2, 0.6, 0.95),
    ("tear", 2.9, 3.9, -0.7, 0.95), ("tear", 3.4, 3.4, 0.15, 0.85), ("bell", 2.1, 3.5, -0.5, 0.8), ("tear", 4.6, 3.7, 0.1, 0.8),
    ("bell", 1.6, 4.7, -2.0, 0.85), ("tear", 2.6, 4.3, -2.2, 0.75), ("tear", 3.6, 4.6, -2.3, 0.8), ("bell", 4.7, 4.5, -2.1, 0.75),
)):
    bp.pendant(f"lv_pend{k}", kind, x, y, z, K, M, s=s_)

# black louvres under the roof, with light strips between them
for i in range(30):
    box(f"louvre_{i}", 5.9, 0.1, 0.06, 3.15, R - 0.5, -3.75 + i * 0.26, M["steel"], bevel=0.004, coll=K)
for x in (1.6, 3.15, 4.7):
    box(f"louvre_beam_{x}", 0.12, 0.14, 7.9, x, R - 0.56, 0.05, M["steel"], bevel=0.004, coll=K)
for z in (-2.4, 0.0, 2.4):
    box(f"louvre_led_{z}", 0.5, 0.02, 0.1, 3.15, R - 0.53, z, M["led"], bevel=0, coll=K)

# warm light under the kitchen's shelves and island lip
box("led_shelf_0", 1.0, 0.012, 0.03, -1.3, 1.49, -3.72, M["bulb"], bevel=0, coll=K)
box("led_shelf_1", 1.0, 0.012, 0.03, -1.3, 1.99, -3.72, M["bulb"], bevel=0, coll=K)
box("led_island", 2.5, 0.015, 0.03, -3.2, 0.84, -0.14, M["bulb"], bevel=0, coll=K)

# ---------------- studio (first floor, left) ----------------
box("s_rug", 2.8, 0.012, 2.0, -3.0, F, -2.5, M["sage"], bevel=0, coll=K)
box("s_desk", 2.2, 0.06, 0.9, -3.0, F + 0.705, -2.55, M["teak"], bevel=0.01, coll=K)
for sx in (-1, 1):
    box(f"s_leg_{sx}", 0.08, 0.705, 0.8, -3.0 + sx * 1.0, F, -2.55, M["teak"], bevel=0.01, coll=K)
model("mid_century_lounge_chair", -3.0, F, -3.35, s=0.92, coll=K)
model("desk_lamp_arm_01", -3.95, F + 0.765, -2.75, ry=-0.6, coll=K)
cyl("s_mug", 0.045, 0.04, 0.1, -2.3, F + 0.765, -2.35, M["clay"], coll=K)
box("s_book", 0.24, 0.025, 0.17, -3.7, F + 0.765, -2.4, M["book"][0], ry=0.3, bevel=0.003, coll=K)
model("potted_plant_01", -5.25, F, -3.25, s=1.1, coll=K)

# the Velyx logo, polished brass on the volcanic stone
import addon_utils
import bmesh as _bm
addon_utils.enable("io_curve_svg", default_set=False)
svg = os.path.join(ROOT, "..", "public", "life", "velyx-v.svg")
before = set(bpy.data.objects)
bpy.ops.import_curve.svg(filepath=svg)
curves = [o for o in bpy.data.objects if o not in before and o.type == "CURVE"]
bpy.ops.object.select_all(action="DESELECT")
for o in curves:
    o.select_set(True)
bpy.context.view_layer.objects.active = curves[0]
if len(curves) > 1:
    bpy.ops.object.join()
bpy.ops.object.convert(target="MESH")
logo = bpy.context.active_object
for c in list(logo.users_collection):
    c.objects.unlink(logo)
link(logo, K)
logo.name = "velyx_logo"
bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
logo.location = (0, 0, 0)
s_ = 0.62 / logo.dimensions.x
logo.scale = (s_, s_, s_)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
bm = _bm.new()
bm.from_mesh(logo.data)
_bm.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
ext = _bm.ops.extrude_face_region(bm, geom=bm.faces[:])
_bm.ops.translate(bm, vec=Vector((0, 0, 0.035)), verts=[v for v in ext["geom"] if isinstance(v, _bm.types.BMVert)])
_bm.ops.recalc_face_normals(bm, faces=bm.faces)
bm.to_mesh(logo.data)
bm.free()
logo.data.materials.clear()
logo.data.materials.append(M["brass"])
logo.rotation_euler = (math.pi / 2, 0, 0)
logo.location = P(-4.1, F + 2.14, -3.86)
txt = bpy.data.curves.new("wordmark", "FONT")
txt.body = "VELYXLABS"
for f in ("/System/Library/Fonts/Avenir Next.ttc", "/System/Library/Fonts/HelveticaNeue.ttc"):
    if os.path.exists(f):
        try:
            txt.font = bpy.data.fonts.load(f)
            break
        except Exception:
            pass
txt.size = 0.34
txt.extrude = 0.012
txt.space_character = 1.1
txt.align_y = "CENTER"
wo = bpy.data.objects.new("wordmark", txt)
link(wo, K)
wo.data.materials.append(M["brass"])
wo.rotation_euler = (math.pi / 2, 0, 0)
wo.location = P(-3.62, F + 2.14, -3.845)

# the ring light and tripod beside the sofa
for k in range(3):
    a = k * 2.094
    tube(f"l_tri{k}", [(5.25 + math.cos(a) * 0.3, 0, -1.2 + math.sin(a) * 0.3), (5.25, 0.7, -1.2)], 0.01, M["black"], coll=K)
cyl("l_tri_pole", 0.012, 0.012, 0.95, 5.25, 0.7, -1.2, M["black"], coll=K)
torus("l_ring", 0.3, 0.03, 5.25, 1.95, -1.2, M["led"], coll=K, rx=math.pi / 2, ry=-0.6)

# ---------------- roof: sunrise yoga, sunset terrace ----------------
box("parapet_back", W, 0.55, 0.3, 0, R, -4.05, M["render"], bevel=0.01, coll=V)
box("parapet_left", 0.3, 0.55, D, -6.05, R, 0, M["render"], bevel=0.01, coll=V)
box("coping_back", W + 0.04, 0.05, 0.36, 0, R + 0.55, -4.05, M["teak"], bevel=0.005, coll=V)
box("coping_left", 0.36, 0.05, D, -6.05, R + 0.55, 0, M["teak"], bevel=0.005, coll=V)
box("rail_glass_f", 12.0, 1.0, 0.02, 0, R + 0.04, 4.08, M["glass"], bevel=0, coll=V)
box("rail_glass_r", 0.02, 1.0, 8.0, 6.08, R + 0.04, 0, M["glass"], bevel=0, coll=V)
box("rail_top_f", 12.2, 0.05, 0.08, 0, R + 1.04, 4.08, M["teak"], bevel=0.01, coll=V)
box("rail_top_r", 0.08, 0.05, 8.2, 6.08, R + 1.04, 0, M["teak"], bevel=0.01, coll=V)
for sx in (-2.2, 2.2):
    box(f"sign_post_{sx}", 0.06, 1.95, 0.06, -1.2 + sx, R + 0.55, -4.0, M["bronze"], coll=V)
# a thatched alang-alang roof over the yoga deck, on teak posts
for (x, z) in ((-5.75, -3.7), (-5.75, 3.7), (-0.3, -3.7), (-0.3, 3.7)):
    box(f"thatch_post_{x}_{z}", 0.18, 2.75, 0.18, x, R, z, M["teak"], bevel=0.02, coll=V)
for z in (-3.7, 3.7):
    box(f"thatch_beam_{z}", 5.8, 0.2, 0.16, -3.03, R + 2.6, z, M["teak"], bevel=0.02, coll=V)
for x in (-5.75, -0.3):
    box(f"thatch_beamx_{x}", 0.16, 0.2, 7.6, x, R + 2.6, 0, M["teak"], bevel=0.02, coll=V)
bp.hip_roof("roof_thatch", -3.03, R + 2.75, 0.0, 7.4, 9.2, 2.4, M["thatch"], M["bamboo"], V)
# planters on the slab edges, greenery spilling down the facade
vine = bp.vine_template()
# only from the roof, and short, so they frame the rooms without hiding them
for y, z_edge, x_edge in ((R, 4.25, 6.25),):
    for k in range(5):
        z = -3.6 + k * 0.8 + random.uniform(-0.15, 0.15)
        bp.place(vine, f"vine_r_{y}_{k}", x_edge, y - 0.05, z, ry=math.pi / 2 + random.uniform(-0.3, 0.3), s=random.uniform(0.45, 0.65), coll=V)
box("yoga_mat", 0.68, 0.008, 1.85, -1.0, R + 0.02, 1.0, M["mat_yoga"], bevel=0.003, coll=V)
for k, (x, z) in enumerate(((-4.6, -2.6), (-3.2, -2.6))):
    box(f"pouf_{k}", 0.9, 0.3, 0.9, x, R, z, M["linen"], bevel=0.12, coll=V)
box("roof_daybed", 2.0, 0.35, 1.4, -4.1, R, 1.8, M["teak"], bevel=0.03, coll=V)
box("roof_daybed_pad", 1.9, 0.14, 1.3, -4.1, R + 0.35, 1.8, M["cushion"], bevel=0.06, coll=V)
model("planter_pot_clay", -5.5, R, -3.6, s=2.0, coll=V)
model("potted_plant_02", -5.45, R, 3.4, s=1.6, coll=V)
# terrace: string-light posts, a high table, an outdoor sofa, a fire bowl
for (x, z) in ((1.0, -3.5), (5.7, -3.5), (5.7, 3.4), (1.0, 3.4)):
    cyl(f"tr_post_{x}_{z}", 0.035, 0.035, 2.5, x, R, z, M["bronze"], seg=12, coll=V)
cyl("tr_table_top", 0.38, 0.38, 0.05, 3.3, R + 1.03, -0.6, M["suar"], bevel=0.01, coll=V)
cyl("tr_table_pole", 0.035, 0.035, 1.03, 3.3, R, -0.6, M["bronze"], coll=V)
cyl("tr_table_foot", 0.24, 0.27, 0.03, 3.3, R, -0.6, M["bronze"], coll=V)
for j, (x, z) in enumerate(((3.18, -0.5), (3.42, -0.7), (3.3, -0.42))):
    cyl(f"tr_glass_{j}", 0.035, 0.03, 0.13, x, R + 1.08, z, M["glass"], coll=V)
sofa("tr_sofa", 4.6, R, 2.55, 2.0, d=0.85, ry=math.pi, fab=M["linen"], coll=V)
cyl("fire_bowl", 0.45, 0.3, 0.35, 1.9, R, 1.6, M["candi"], seg=24, bevel=0.02, coll=V)
for k in range(5):
    a = k / 5 * math.tau
    sphere(f"fire_{k}", 0.1, 1.9 + math.cos(a) * 0.12, R + 0.4, 1.6 + math.sin(a) * 0.12, M["fire"], coll=V, scale=(1, 1.6, 1))
model("planter_pot_clay", 5.5, R, -3.4, s=1.6, coll=V)
# a lily pond along the terrace's back wall, stone-edged like the bale ponds
box("pond_edge", 4.4, 0.22, 1.25, 3.2, R, -3.2, M["candi"], bevel=0.02, coll=V)
box("pond_water", 4.2, 0.02, 1.05, 3.2, R + 0.2, -3.2, M["water"], bevel=0, coll=V)
for k in range(9):
    px, pz = 1.5 + k * 0.42 + random.uniform(-0.1, 0.1), -3.2 + random.uniform(-0.38, 0.38)
    cyl(f"lily_{k}", 0.13, 0.13, 0.01, px, R + 0.225, pz, flat("lily_pad", "#4d8a3f", rough=0.5), seg=14, coll=V)
    if k % 3 == 0:
        sphere(f"lily_flower_{k}", 0.05, px, R + 0.26, pz, flat("lily_flower", "#f3b8cf", rough=0.5), coll=V, scale=(1, 0.7, 1))

# ---------------- pool and garden ----------------
bali.build(M, F, R)

# ---------------- curves and text become meshes ----------------
bpy.ops.object.select_all(action="DESELECT")
cv = [o for o in bpy.data.objects if o.type in ("CURVE", "FONT") and o.name in bpy.context.view_layer.objects]
for o in cv:
    o.select_set(True)
if cv:
    bpy.context.view_layer.objects.active = cv[0]
    bpy.ops.object.convert(target="MESH")

for o in bpy.data.objects:
    if o.type == "MESH" and o.data.materials and any(m and m.get("tile") for m in o.data.materials):
        if not o.name.startswith("src_") and o.data.users == 1:
            uv_world(o)

if os.environ.get("VILLA_BAKE"):
    import bake
    bake.run(os.environ["VILLA_BAKE"], [V, I])

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
out = argv[0] if argv else os.path.join(ROOT, "villa.glb")
if len(argv) > 1:
    import preview
    preview.render(argv[1:])
bpy.ops.export_scene.gltf(
    filepath=out, export_format="GLB", export_apply=True, export_yup=True, export_extras=True,
    export_lights=False, export_cameras=False, export_image_format="AUTO",
)
print("EXPORTED", out)
