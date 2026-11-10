"""Everything outside the villa walls, and the garden inside them: the pool
and ironwood deck, the gym bale, a daybed bale, the family shrine, the
candi bentar gate onto a scooter lane with a warung and a kopi place, rice
terraces with coconut palms, neighbouring villas, the road to a black-sand
beach with jukungs and a beach club, and Mount Agung on the horizon.

Units are metres, three.js coordinates (Y up, +Z towards the pool)."""
import bpy, bmesh, json, math, os, random
from lib import ROOT, P, box, cyl, sphere, flat, link, collection, model, uv_world
import bali_props as bp

GROUND = -0.3   # garden lawn; decks and the villa floor sit at 0
# luxury villas around Atharv's, each facing its own pool
NEIGHBOURS_RY = [(-32.0, 2.0, 0.0), (-33.0, -26.0, 0.0), (36.0, -27.0, 0.0), (38.0, 1.0, 0.0), (-32.0, 36.0, math.pi), (32.0, 37.0, math.pi), (-62.0, -4.0, 0.3), (66.0, 30.0, math.pi), (4.0, -30.0, 0.0)]
NEIGHBOURS = [(x, z) for x, z, _ in NEIGHBOURS_RY]
LANE = -0.32
rnd = random.Random(31)
PADDIES = []


def terrain(name, x0, x1, z0, z1, nx, nz, height, mat, coll):
    bm = bmesh.new()
    grid = []
    for j in range(nz + 1):
        row = []
        for i in range(nx + 1):
            x = x0 + (x1 - x0) * i / nx
            z = z0 + (z1 - z0) * j / nz
            row.append(bm.verts.new(P(x, height(x, z), z)))
        grid.append(row)
    for j in range(nz):
        for i in range(nx):
            f = bm.faces.new((grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]))
            f.smooth = True
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    o.data.materials.append(mat)
    link(o, coll)
    return o


def villa_luxe(name, x, z, coll, M, ry=0.0):
    """A neighbour worth the street: a glass ground floor under a cantilevered
    white upper volume with teak louvres, a flat roof with a deep overhang,
    an infinity pool and a lawn, all ringed by palms."""
    c, s_ = math.cos(ry), math.sin(ry)

    def at(u, v):
        return x + u * c + v * s_, z - u * s_ + v * c

    def bx(n, w, h, d, u, y, v, m, bev=0.02):
        px, pz = at(u, v)
        box(f"{name}_{n}", w, h, d, px, y, pz, m, ry=ry, bevel=bev, coll=coll)

    win = M["villa_win"]
    bx("lawn", 26, 0.3, 22, 0, GROUND - 0.3, 2, M["lawn"], 0)
    bx("deck", 14, 0.32, 5.5, 0, GROUND - 0.02, 6.2, M["ulin"], 0.005)
    bx("pool", 11, 0.03, 3.4, 0, GROUND + 0.22, 7.0, M["water"], 0)
    bx("slab0", 12, 0.3, 8, 0, GROUND, 0, M["slab"])
    bx("glass0", 10.5, 3.0, 6.5, -0.5, GROUND + 0.3, -0.3, win, 0.01)
    for k in range(6):
        bx(f"mull{k}", 0.08, 3.0, 0.08, -5.6 + k * 2.1, GROUND + 0.3, 2.95, M["teak"], 0.005)
    bx("upper", 13.5, 3.2, 7.0, 0.8, GROUND + 3.3, 0.6, M["render"])
    bx("upper_win", 9.0, 2.0, 0.05, 0.8, GROUND + 3.9, 4.12, win, 0)
    for k in range(22):
        bx(f"louvre{k}", 0.07, 2.6, 0.18, -5.3 + k * 0.5, GROUND + 3.6, 4.25, M["teak"], 0.005)
    bx("roof", 15.0, 0.25, 8.6, 0.8, GROUND + 6.5, 0.8, M["slab"])
    bx("roof_fascia", 15.05, 0.08, 0.06, 0.8, GROUND + 6.45, 5.12, M["teak"], 0.004)
    for k in range(5):
        px, pz = at(rnd.uniform(-12, 12), rnd.choice((-9.0, 10.5)) + rnd.uniform(-1, 1))
        bp.palm(f"{name}_palm{k}", px, GROUND, pz, coll)
    bx_, bz_ = at(8.2, 6.4)
    bp.bale(f"{name}_bale", bx_, GROUND, bz_, 2.6, 2.6, coll, M, post_h=2.3, rise=1.6, floor=0.3)


def villa_small(name, x, z, w, d, coll, M, ry=0.0):
    """A neighbour: rendered walls, teak openings, a thatched hip roof."""
    box(name + "_body", w, 3.2, d, x, GROUND, z, M["render"], ry=ry, bevel=0.03, coll=coll)
    box(name + "_door", w * 0.5, 2.4, 0.05, x, GROUND + 0.1, z + d / 2 + 0.01, M["teak"], ry=ry, bevel=0.01, coll=coll)
    bp.hip_roof(name + "_roof", x, GROUND + 3.15, z, w + 1.6, d + 1.6, 2.2, M["thatch"], M["bamboo"], coll)
    if rnd.random() < 0.7:
        box(name + "_pool", w * 0.8, 0.05, 3.0, x, GROUND - 0.02, z + d / 2 + 2.2, M["water"], ry=ry, bevel=0, coll=coll)


def build(M, F, R):
    C = collection("bali")
    Gd = collection("garden")

    # ---------------- the plot ----------------
    box("lawn", 29.0, 0.3, 25.0, 2.5, GROUND - 0.3, 1.5, M["lawn"], bevel=0, coll=Gd)
    # ironwood deck around the pool, flush with the villa floor; the west end
    # drops into a sunken lounge, the east end runs under the swim-up bar
    decks = [(-11.0, 13.0, 4.2, 6.0), (-11.0, 13.0, 10.9, 12.5), (-11.0, -6.0, 6.0, 6.4), (-11.0, -6.0, 10.0, 10.9),
             (-11.0, -10.6, 6.4, 10.0), (-7.0, -6.0, 6.4, 10.0), (8.6, 13.0, 6.0, 10.9)]
    for (x0, x1, z0, z1) in decks:
        box(f"deck_{x0}_{z0}", x1 - x0, 0.3, z1 - z0, (x0 + x1) / 2, -0.3, (z0 + z1) / 2, M["ulin"], bevel=0.005, coll=Gd)
    # a 15-metre infinity pool: green Sukabumi stone, paras coping on three
    # sides, the far edge a vanishing weir into a stone trough
    PX0, PX1, PZ0, PZ1 = -6.0, 8.6, 6.0, 10.4
    pw, pd, pcx, pcz = PX1 - PX0, PZ1 - PZ0, (PX0 + PX1) / 2, (PZ0 + PZ1) / 2
    box("pool_floor", pw, 0.1, pd, pcx, -1.2, pcz, M["pooltile"], bevel=0, coll=Gd)
    box("pool_wall_n", pw, 1.1, 0.1, pcx, -1.1, PZ0 + 0.05, M["pooltile"], bevel=0, coll=Gd)
    box("pool_wall_s", pw, 1.0, 0.1, pcx, -1.1, PZ1 - 0.05, M["pooltile"], bevel=0, coll=Gd)
    box("pool_wall_w", 0.1, 1.1, pd, PX0 + 0.05, -1.1, pcz, M["pooltile"], bevel=0, coll=Gd)
    box("pool_wall_e", 0.1, 1.1, pd, PX1 - 0.05, -1.1, pcz, M["pooltile"], bevel=0, coll=Gd)
    for k in range(3):
        box(f"pool_step_{k}", 1.0 - k * 0.3, 0.35 * (3 - k) - 0.05, pd - 0.2, PX0 + 0.5 + k * 0.15, -1.1, pcz, M["pooltile"], bevel=0.01, coll=Gd)
    box("pool_water", pw - 0.1, 0.02, pd + 0.15, pcx, -0.1, pcz + 0.07, M["water"], bevel=0, coll=Gd)
    box("pool_weir", pw, 0.4, 0.5, pcx, -0.5, PZ1 + 0.25, M["candi"], bevel=0.01, coll=Gd)
    box("pool_weir_sheet", pw, 0.02, 0.45, pcx, -0.12, PZ1 + 0.25, M["water"], bevel=0, coll=Gd)
    for (w, d, x, z) in ((pw + 0.6, 0.3, pcx, PZ0 - 0.15), (0.3, pd + 0.3, PX0 - 0.15, pcz), (0.3, pd + 0.3, PX1 + 0.15, pcz)):
        box(f"coping_{x}_{z}", w, 0.05, d, x, -0.03, z, M["paras"], bevel=0.01, coll=Gd)
    # underwater lights along the north wall
    for k in range(6):
        cyl(f"pool_light{k}", 0.09, 0.09, 0.02, PX0 + 1.4 + k * 2.3, -0.55, PZ0 + 0.11, M["led"], seg=16, rx=math.pi / 2, coll=Gd)

    # floating breakfast: a rattan tray of fruit, coconut and coffee
    TX, TZ = 2.6, 7.4
    box("tray", 0.8, 0.06, 0.55, TX, -0.1, TZ, M["rattan_solid"], ry=0.3, bevel=0.02, coll=Gd)
    model("wooden_bowl_01", TX - 0.15, -0.04, TZ + 0.05, coll=Gd)
    for j, (dx, dz, f) in enumerate(((-0.2, 0.05, "lemon"), (-0.12, 0.1, "food_lime_01"), (0.2, -0.12, "food_avocado_01"))):
        model(f, TX + dx, -0.03, TZ + dz, ry=j, coll=Gd)
    sphere("coconut_tray", 0.11, TX + 0.22, 0.06, TZ + 0.1, flat("coconut_green", "#7f9a3d", rough=0.6), coll=Gd)
    cyl("straw_tray", 0.006, 0.006, 0.18, TX + 0.24, 0.13, TZ + 0.09, flat("straw", "#f2efe6", rough=0.6), seg=6, coll=Gd)
    for j, dx in enumerate((-0.02, 0.1)):
        cyl(f"cup_tray{j}", 0.04, 0.035, 0.07, TX + dx, -0.04, TZ - 0.15, M["ceramic"], coll=Gd)
    for j in range(3):
        sphere(f"dragonfruit{j}", 0.05, TX - 0.25 + j * 0.06, -0.01, TZ - 0.12, flat("dragonfruit", "#d63d78", rough=0.5), coll=Gd)

    # the swim-up bar: stools in the water, a counter, a thatched bale above
    box("bar_counter", 0.7, 1.15, 3.2, 9.0, -1.1, 8.2, M["paras"], bevel=0.02, coll=Gd)
    box("bar_top", 0.9, 0.06, 3.4, 9.0, 0.05, 8.2, M["suar"], bevel=0.015, coll=Gd)
    for k in range(4):
        cyl(f"bar_stool{k}", 0.2, 0.22, 0.65, 8.15, -1.1, 6.95 + k * 0.85, M["paras"], seg=20, coll=Gd)
    bp.bale("bar", 11.0, 0.0, 8.2, 3.6, 3.6, Gd, M, post_h=2.5, rise=1.7, floor=0.0)
    box("bar_back", 2.6, 1.0, 0.45, 12.4, 0.0, 8.2, M["teak"], ry=math.pi / 2, bevel=0.02, coll=Gd)
    for k in range(7):
        cyl(f"bottle{k}", 0.035, 0.035, 0.28, 12.4, 1.0, 7.1 + k * 0.32, flat(f"bottle_{k % 3}", ("#2f5d3a", "#8a5a2a", "#d9d2c0")[k % 3], rough=0.15), coll=Gd)
    for k in range(3):
        sphere(f"bar_coconut{k}", 0.11, 9.0 - 0.1, 0.19, 7.4 + k * 0.7, flat("coconut_green", "#7f9a3d", rough=0.6), coll=Gd)

    # the sunken lounge: a cushioned U round a fire pit, half a metre down
    LX0, LX1, LZ0, LZ1 = -10.6, -7.0, 6.4, 10.0
    box("lounge_floor", LX1 - LX0, 0.3, LZ1 - LZ0, (LX0 + LX1) / 2, -0.75, (LZ0 + LZ1) / 2, M["ulin"], bevel=0, coll=Gd)
    for (x0, x1, z0, z1) in ((LX0, LX0 + 0.6, LZ0, LZ1), (LX0, LX1, LZ0, LZ0 + 0.6), (LX0, LX1, LZ1 - 0.6, LZ1)):
        box(f"lounge_seat_{x0}_{z0}", x1 - x0, 0.4, z1 - z0, (x0 + x1) / 2, -0.45, (z0 + z1) / 2, M["paras"], bevel=0.02, coll=Gd)
        box(f"lounge_pad_{x0}_{z0}", x1 - x0 - 0.06, 0.12, z1 - z0 - 0.06, (x0 + x1) / 2, -0.05, (z0 + z1) / 2, M["linen"], bevel=0.05, coll=Gd)
    box("firepit", 0.9, 0.32, 0.9, (LX0 + LX1) / 2 + 0.3, -0.45, (LZ0 + LZ1) / 2, M["candi"], bevel=0.02, coll=Gd)
    for k in range(5):
        a = k / 5 * math.tau
        sphere(f"pit_fire_{k}", 0.08, (LX0 + LX1) / 2 + 0.3 + math.cos(a) * 0.12, -0.08, (LZ0 + LZ1) / 2 + math.sin(a) * 0.12, M["fire"], coll=Gd, scale=(1, 1.7, 1))

    # the gym bale: rubber floor, a rack, dumbbells, a bag, ropes
    GX, GZ = 11.6, -0.5
    bp.bale("gym", GX, GROUND, GZ, 5.2, 6.4, Gd, M, post_h=2.9, rise=2.0, floor=0.45, posts=6)
    fy = GROUND + 0.45
    box("gym_floor", 5.2, 0.03, 6.4, GX, fy, GZ, M["rubber"], bevel=0, coll=Gd)
    RX, RZ = GX - 1.7, GZ - 1.9
    for dx in (-0.55, 0.55):
        for dz in (-0.6, 0.6):
            box(f"rk_up_{dx}_{dz}", 0.075, 2.3, 0.075, RX + dx, fy, RZ + dz, M["steel"], bevel=0.006, coll=Gd)
    for dz in (-0.6, 0.6):
        box(f"rk_top_{dz}", 1.18, 0.075, 0.075, RX, fy + 2.23, RZ + dz, M["steel"], bevel=0.006, coll=Gd)
    for dx in (-0.55, 0.55):
        box(f"rk_side_{dx}", 0.075, 0.075, 1.27, RX + dx, fy + 2.23, RZ, M["steel"], bevel=0.006, coll=Gd)
    cyl("rk_bar", 0.014, 0.014, 2.2, RX + 0.6, fy + 1.38, RZ, M["chrome"], rx=math.pi / 2, coll=Gd)
    for dz in (-0.78, -0.72, 0.72, 0.78):
        cyl(f"rk_plate_{dz}", 0.225, 0.225, 0.05, RX + 0.6, fy + 1.38, RZ + dz, M["rubberb"], rx=math.pi / 2, coll=Gd, seg=40, bevel=0.006)
    box("bn_pad", 1.2, 0.08, 0.3, GX + 0.3, fy + 0.4, GZ - 2.2, flat("bench_pad", "#141416", rough=0.7), bevel=0.03, coll=Gd)
    for dx in (-0.45, 0.45):
        box(f"bn_leg_{dx}", 0.06, 0.4, 0.06, GX + 0.3 + dx, fy, GZ - 2.2, M["steel"], coll=Gd)
    box("db_frame", 0.5, 0.75, 2.2, GX + 2.1, fy, GZ + 0.6, M["teak"], bevel=0.01, coll=Gd)
    for j, y in enumerate((0.38, 0.72)):
        for i in range(6):
            z = GZ - 0.3 + i * 0.36
            r = 0.055 + (i + j * 6) * 0.004
            for side in (-0.11, 0.11):
                cyl(f"db_{j}_{i}_{side}", r, r, 0.08, GX + 2.1, fy + y + 0.03 + r, z + side, M["rubberb"], seg=6, rx=math.pi / 2, coll=Gd)
    for k, (x, z, s_) in enumerate(((GX - 1.2, GZ + 2.3, 1.0), (GX - 0.8, GZ + 2.4, 0.85), (GX + 1.5, GZ + 2.4, 1.15))):
        sphere(f"kb_{k}", 0.11 * s_, x, fy + 0.1 * s_, z, M["black"], coll=Gd, scale=(1, 0.95, 1))
    cyl("bag_chain", 0.01, 0.01, 0.6, GX - 1.8, fy + 2.35, GZ + 1.6, M["steel"], seg=6, coll=Gd)
    cyl("bag", 0.18, 0.18, 1.1, GX - 1.8, fy + 1.25, GZ + 1.6, flat("bag_leather", "#2b2622", rough=0.6), seg=20, coll=Gd)
    box("gym_mat", 0.68, 0.008, 1.85, GX + 0.3, fy + 0.03, GZ + 0.9, M["mat_yoga"], bevel=0.003, coll=Gd)
    model("potted_plant_02", GX + 2.3, fy, GZ - 2.7, s=1.3, coll=Gd)

    # wellness: a cedar sauna, two ice baths and a rain shower under teak slats
    box("well_deck", 8.0, 0.3, 6.2, 12.6, GROUND, -7.5, M["paras"], bevel=0.01, coll=Gd)
    cedar = M["cedar"]
    SXc, SZc = 10.2, -8.7
    for (w, h, d, dx, dz) in ((2.4, 2.4, 0.12, 0, -1.05), (0.12, 2.4, 2.2, -1.14, 0), (0.12, 2.4, 2.2, 1.14, 0)):
        box(f"sauna_wall_{dx}_{dz}", w, h, d, SXc + dx, 0.0, SZc + dz, cedar, bevel=0.01, coll=Gd)
    box("sauna_roof", 2.6, 0.14, 2.4, SXc, 2.4, SZc, cedar, bevel=0.02, coll=Gd)
    box("sauna_glass", 2.2, 2.3, 0.03, SXc, 0.05, SZc + 1.08, M["glass"], bevel=0, coll=Gd)
    for k, (y, dz) in enumerate(((0.45, -0.75), (0.85, -0.45))):
        box(f"sauna_bench{k}", 2.2, 0.06, 0.5, SXc, y, SZc + dz, cedar, bevel=0.01, coll=Gd)
        box(f"sauna_bench_leg{k}", 2.2, y, 0.08, SXc, 0.0, SZc + dz + 0.2, cedar, bevel=0.005, coll=Gd)
    box("sauna_heater", 0.45, 0.6, 0.4, SXc + 0.8, 0.0, SZc + 0.6, M["black"], bevel=0.02, coll=Gd)
    box("sauna_glow", 2.1, 0.03, 0.05, SXc, 2.3, SZc - 0.95, M["bulb"], bevel=0, coll=Gd)
    ice = flat("ice_water", "#bfe6ee", rough=0.04, metal=0.1, alpha=0.7)
    for k, z in enumerate((-9.1, -6.7)):
        # hollow, so whoever is in it sits in the water
        box(f"icebath{k}_floor", 1.9, 0.1, 1.0, 13.4, 0.0, z, M["candi"], bevel=0.02, coll=Gd)
        for (w, d, dx, dz) in ((1.9, 0.1, 0, -0.45), (1.9, 0.1, 0, 0.45), (0.1, 1.0, -0.9, 0), (0.1, 1.0, 0.9, 0)):
            box(f"icebath{k}_{dx}_{dz}", w, 0.75, d, 13.4 + dx, 0.0, z + dz, M["candi"], bevel=0.02, coll=Gd)
        box(f"icebath{k}_water", 1.7, 0.02, 0.8, 13.4, 0.62, z, ice, bevel=0, coll=Gd)
        for j in range(6):
            box(f"ice{k}_{j}", 0.12, 0.08, 0.12, 13.4 - 0.6 + j * 0.24 + rnd.uniform(-0.05, 0.05), 0.6, z + rnd.uniform(-0.25, 0.25), flat("ice_cube", "#eef8fb", rough=0.1), ry=rnd.random(), bevel=0.02, coll=Gd)
    box("shower_wall", 1.6, 2.6, 0.25, 15.8, 0.0, -9.6, M["candi"], bevel=0.02, coll=Gd)
    cyl("shower_pipe", 0.02, 0.02, 2.2, 15.8, 0.0, -9.4, M["brass"], seg=10, coll=Gd)
    cyl("shower_head", 0.16, 0.16, 0.02, 15.8, 2.25, -9.15, M["brass"], seg=24, coll=Gd)
    box("towel_rack", 1.0, 1.1, 0.08, 15.6, 0.0, -5.0, M["teak"], bevel=0.01, coll=Gd)
    for k in range(2):
        box(f"towel{k}", 0.4, 0.6, 0.06, 15.4 + k * 0.45, 0.45, -4.97, flat("towel", "#e9dcc5", rough=0.95), bevel=0.02, coll=Gd)
    for x in (8.9, 16.3):
        for z in (-10.4, -4.6):
            box(f"well_post_{x}_{z}", 0.16, 2.9, 0.16, x, 0.0, z, M["teak"], bevel=0.02, coll=Gd)
    for k in range(18):
        box(f"well_slat{k}", 7.6, 0.08, 0.12, 12.6, 2.9, -10.3 + k * 0.33, M["teak"], bevel=0.01, coll=Gd)

    # river stone round the base of the deck, as in a bale on a stone plinth
    box("skirt_s", 24.2, 0.3, 0.08, 1.0, -0.3, 12.54, M["riverstone"], bevel=0.005, coll=Gd)
    box("skirt_w", 0.08, 0.3, 8.4, -11.04, -0.3, 8.35, M["riverstone"], bevel=0.005, coll=Gd)
    box("skirt_e", 0.08, 0.3, 8.4, 13.04, -0.3, 8.35, M["riverstone"], bevel=0.005, coll=Gd)
    # jungle: banana and palm thick along the walls, so the villa sits in green
    for side, (x0, z0, x1, z1) in enumerate(((-11.4, -10.4, -11.4, 3.8), (-11.3, 12.9, -3.5, 13.4), (9.5, 13.4, 16.3, 13.2), (-8.0, -10.5, 7.5, -10.5), (16.4, -3.2, 16.4, 12.6))):
        n = int(math.hypot(x1 - x0, z1 - z0) / 1.5)
        for k in range(n):
            t = (k + 0.5) / n
            bp.banana(f"jungle_{side}_{k}", x0 + (x1 - x0) * t + rnd.uniform(-0.35, 0.35), GROUND, z0 + (z1 - z0) * t + rnd.uniform(-0.3, 0.3), Gd, s=rnd.uniform(0.75, 1.3))

    # the family shrine in the garden's kaja-kangin corner, flowers around it
    bp.shrine("shrine", -10.4, GROUND, -9.3, Gd, M)
    bp.frangipani("frangi_shrine", -8.3, GROUND, -9.6, Gd, s=1.0)

    # river-stone boundary walls, the split gate at the lane
    WALL_H = 2.2
    for (x0, x1, z) in ((-12.0, 2.2, 14.0), (3.8, 17.0, 14.0), (-12.0, 17.0, -11.0)):
        box(f"wall_{x0}_{z}", x1 - x0, WALL_H, 0.35, (x0 + x1) / 2, GROUND, z, M["riverstone"], bevel=0.02, coll=Gd)
        box(f"wallcap_{x0}_{z}", x1 - x0 + 0.1, 0.1, 0.45, (x0 + x1) / 2, GROUND + WALL_H, z, M["paras"], bevel=0.01, coll=Gd)
    for x in (-12.0, 17.0):
        box(f"wall_side_{x}", 0.35, WALL_H, 25.0, x, GROUND, 1.5, M["riverstone"], bevel=0.02, coll=Gd)
        box(f"wallcap_side_{x}", 0.45, 0.1, 25.1, x, GROUND + WALL_H, 1.5, M["paras"], bevel=0.01, coll=Gd)
    bp.candi_bentar("gate", 3.0, LANE, 14.0, Gd, M, gap=1.6)
    box("path", 1.4, 0.3, 1.5, 3.0, GROUND, 13.25, M["paras"], bevel=0.01, coll=Gd)

    # planting: palms, frangipani, banana, potted ferns
    for i, (x, z) in enumerate(((-10.2, 12.2), (-10.6, 2.6), (7.6, -10.3), (-3.0, -9.6), (16.0, -2.4), (-11.0, -4.5), (-6.5, 13.0), (-7.5, -10.2), (1.0, 13.2))):
        bp.palm(f"palm_g{i}", x, GROUND, z, Gd, fine=True)
        cyl(f"uplight_{i}", 0.09, 0.1, 0.06, x + 0.6, GROUND, z + 0.4, M["led"], seg=12, coll=Gd)
    for i, (x, z) in enumerate(((-9.6, 13.0), (8.4, 13.0), (-10.0, -0.8), (14.8, 9.6))):
        bp.frangipani(f"frangi_g{i}", x, GROUND, z, Gd, s=rnd.uniform(0.9, 1.15))
    for i, (x, z) in enumerate(((-11.4, 4.6), (-11.3, 1.0), (16.2, 2.5), (-11.2, -7.2), (1.5, -10.3), (5.5, -10.3), (-6.5, -10.3), (13.6, 13.2))):
        bp.banana(f"banana_g{i}", x, GROUND, z, Gd, s=rnd.uniform(0.8, 1.1))

    # ---------------- the lane: scooters, a penjor, a warung, kopi ----------------
    box("lane", 208.0, 0.04, 4.0, 44.0, LANE - 0.04, 16.35, M["pavers"], bevel=0, coll=C)
    box("lane_edge_n", 208.0, 0.12, 0.25, 44.0, LANE - 0.04, 14.25, M["paras"], bevel=0.01, coll=C)
    bp.penjor("penjor_gate", 5.2, LANE, 14.6, C, ry=-math.pi / 2)
    bp.penjor("penjor_gate2", 0.8, LANE, 14.6, C, ry=-math.pi / 2)
    for k, (x, z, ry, col) in enumerate(((6.4, 15.3, 0.25, "#9fd3c7"), (7.6, 15.25, 0.15, "#1f1f22"), (-4.0, 18.0, math.pi + 0.2, "#e9e1cf"), (24.0, 15.4, 0.0, "#b8342f"))):
        bp.scooter(f"scooter{k}", x, LANE, z, ry, col, C)
    # warung: a small open shop with a thatched roof, across the lane
    box("warung", 4.2, 2.8, 3.2, -6.5, LANE, 20.3, M["render"], bevel=0.03, coll=C)
    box("warung_open", 3.2, 1.4, 0.2, -6.5, LANE + 0.9, 18.75, flat("warung_dark", "#2b2520", rough=0.8), bevel=0, coll=C)
    box("warung_counter", 3.6, 0.9, 0.5, -6.5, LANE, 18.5, M["teak"], bevel=0.02, coll=C)
    bp.hip_roof("warung_roof", -6.5, LANE + 2.75, 20.3, 5.6, 4.6, 1.6, M["thatch"], M["bamboo"], C)
    _sign("warung_sign", "WARUNG", -6.5, LANE + 2.35, 18.68, C)
    box("kopi", 6.0, 3.2, 4.4, 4.5, LANE, 21.0, M["render"], bevel=0.03, coll=C)
    box("kopi_glass", 4.8, 2.4, 0.05, 4.5, LANE + 0.3, 18.79, M["glass"], bevel=0, coll=C)
    box("kopi_awning", 6.2, 0.08, 1.4, 4.5, LANE + 2.75, 18.2, M["teak"], rx=0.12, bevel=0.01, coll=C)
    _sign("kopi_sign", "KOPI", 4.5, LANE + 3.0, 18.76, C)
    for k, x in enumerate((2.6, 6.4)):
        cyl(f"kopi_table{k}", 0.35, 0.35, 0.04, x, LANE + 0.72, 17.9, M["teak"], coll=C)
        cyl(f"kopi_leg{k}", 0.03, 0.03, 0.72, x, LANE, 17.9, M["bronze"], coll=C)

    # ---------------- rice terraces ----------------
    paddy = M["rice"]
    water = flat("paddy_water", "#5f7f86", rough=0.08, metal=0.3)
    gold = flat("paddy_gold", "#a9a35a", rough=0.9)
    bund = flat("bund_earth", "#6f6a4a", rough=1.0)

    def terrace_y(x, z):
        # paddies step gently down from the villa and climb towards the hills
        d = max(0.0, -z - 11.0)
        return GROUND - 0.5 + math.floor(d / 14.0) * 0.55

    def field(name, x0, x1, z0, z1, step_by):
        """Paddies on a jittered grid, leaving room for the neighbours."""
        z = z0
        k = 0
        while z < z1:
            dz = rnd.uniform(6, 9)
            x = x0
            while x < x1:
                dx = rnd.uniform(7, 11)
                cx, cz = x + dx / 2, z + dz / 2
                if any(abs(cx - nx) < 15 and abs(cz - nz) < 14 for nx, nz in NEIGHBOURS):
                    x += dx
                    continue
                y = step_by(cx, cz)
                r = rnd.random()
                mat = water if r < 0.1 else gold if r < 0.16 else paddy
                box(f"{name}_b{k}", dx, 0.5, dz, cx, y - 0.55, cz, bund, bevel=0, coll=C)
                box(f"{name}_{k}", dx - 0.45, 0.06, dz - 0.45, cx, y - 0.06, cz, mat, bevel=0, coll=C)
                if mat is not water and math.hypot(cx, cz) < 95:
                    PADDIES.append([round(cx, 2), round(y, 3), round(cz, 2), round(dx - 0.45, 2), round(dz - 0.45, 2), 1 if mat is gold else 0])
                if rnd.random() < 0.2:
                    bp.palm(f"{name}_palm{k}", x + rnd.uniform(0, 1) * dx, y - 0.05, z, C)
                x += dx
                k += 1
            z += dz

    field("rice_back", -90, 120, -150, -11.5, terrace_y)
    field("rice_left", -120, -12.5, -11.5, 14.0, lambda x, z: GROUND - 0.4)
    field("rice_front", -90, 140, 24.0, 120, lambda x, z: LANE - 0.4 - math.floor((z - 22) / 20) * 0.3)
    field("rice_right", 17.5, 138, -11.5, 14.0, lambda x, z: GROUND - 0.4)
    # three.js grows real rice on the nearby paddies
    with open(os.path.join(ROOT, "..", "public", "life", "paddies.json"), "w") as f:
        json.dump(PADDIES, f, separators=(",", ":"))
    # the green beyond the paddies
    lowland = flat("lowland", "#6f8f4e", rough=1.0)
    terrain("lowland", -1600, 141, -1600, 1600, 8, 8, lambda x, z: GROUND - 1.2, lowland, C)
    # palm groves in the distance: rows of coconut palms on the edges
    for i in range(140):
        a = rnd.random() * math.tau
        r = rnd.uniform(160, 520)
        x, z = math.cos(a) * r, math.sin(a) * r
        if x > 140:  # that way is the sea
            continue
        bp.palm(f"palm_far{i}", x, GROUND - 1.2, z, C)

    # ---------------- neighbours ----------------
    for k, (x, z, ry) in enumerate(NEIGHBOURS_RY):
        villa_luxe(f"nb{k}", x, z, C, M, ry=ry)

    # ---------------- the beach ----------------
    SX = 150.0  # where the sand starts
    terrain("beach", SX - 10, SX + 46, -260, 260, 14, 40, lambda x, z: GROUND - 0.35 - max(0.0, (x - SX)) * 0.024, M["sand"], C)
    sea = flat("sea", "#2f6f86", rough=0.06, metal=0.25)
    box("sea", 4000, 0.02, 4000, SX + 2030, GROUND - 1.25, 0, sea, bevel=0, coll=C)
    foam = flat("foam", "#eef3f2", rough=0.6)
    for k in range(3):
        box(f"foam{k}", 1.4 - k * 0.35, 0.03, 520, SX + 37.8 + k * 4.0, GROUND - 1.17, 0, foam, bevel=0, coll=C)
    for i in range(36):
        z = -170 + i * 9.5 + rnd.uniform(-2, 2)
        bp.palm(f"palm_beach{i}", SX - 6 + rnd.uniform(-4, 4), GROUND - 0.3, z, C, v=i % 3, fine=True)
    for k, (x, z, ry, col) in enumerate(((SX + 30, -34, 1.4, "#2f7fc1"), (SX + 28, -42, 1.65, "#d9433b"), (SX + 31, -50, 1.3, "#e9b733"), (SX + 26, -64, 1.5, "#2f7fc1"), (SX + 33, 30, 1.5, "#d9433b"))):
        bp.jukung(f"jukung{k}", x, GROUND - 0.85, z, ry, C, stripe=col)
    # a beach club: parasols and bean bags, a bar under a thatched bale
    for k in range(6):
        x = SX + 6 + (k % 3) * 4.0
        z = -18 + (k // 3) * 5.0
        bp.parasol(f"bc_parasol{k}", x, GROUND - 0.5, z, C, M, r=1.3)
        box(f"bc_bean{k}a", 0.9, 0.35, 0.9, x - 0.7, GROUND - 0.5, z + 0.6, M["linen"], bevel=0.15, coll=C)
        box(f"bc_bean{k}b", 0.9, 0.35, 0.9, x + 0.7, GROUND - 0.5, z + 0.6, flat("bean_ochre", "#d9a441", rough=0.95), bevel=0.15, coll=C)
    bp.bale("beachbar", SX + 2, GROUND - 0.4, -30, 4.5, 3.5, C, M, post_h=2.6, rise=1.8, floor=0.3)
    # surfboards on a rack for the morning session
    for k, col in enumerate(("#f2efe6", "#79c1c4", "#f0a25a", "#ffffff")):
        bp.surfboard(f"board{k}", SX + 14 + k * 0.42, GROUND - 0.7, -8.0, 0.0, col, C)
    box("board_rack", 2.1, 0.08, 0.3, SX + 14.6, GROUND - 0.2, -8.0, M["teak"], bevel=0.01, coll=C)

    # ---------------- Mount Agung on the horizon ----------------
    def agung(x, z):
        dx, dz = x + 2600, z + 6400
        r = math.hypot(dx, dz)
        return GROUND - 2 + max(0.0, 820 - r * 0.42) + 14 * math.sin(dx / 90) * math.cos(dz / 110) * min(1, r / 400)

    terrain("agung", -5000, -200, -8800, -4000, 40, 40, agung, flat("volcano", "#56685f", rough=1.0), C)

    # ---------------- join: near and far, by where the geometry is ----------------
    for coll in (C, Gd):
        for o in list(coll.objects):
            if o.type == "MESH" and o.data.users == 1:
                uv_world(o)
    curves = [o for o in list(C.objects) + list(Gd.objects) if o.type in ("CURVE", "FONT")]
    bpy.ops.object.select_all(action="DESELECT")
    for o in curves:
        o.select_set(True)
    if curves:
        bpy.context.view_layer.objects.active = curves[0]
        bpy.ops.object.convert(target="MESH")
    near, mid, far = [], [], []
    for o in list(C.objects) + list(Gd.objects):
        if o.type != "MESH" or o.data.users > 1:
            continue
        mw = o.matrix_world
        reach = max((mw @ v.co).length for v in o.data.vertices)
        (near if reach < 40 else mid if reach < 260 else far).append(o)
    for group, nm in ((near, "bali_near"), (mid, "bali_mid"), (far, "bali_far")):
        if not group:
            continue
        bpy.ops.object.select_all(action="DESELECT")
        for o in group:
            o.select_set(True)
        bpy.context.view_layer.objects.active = group[0]
        bpy.ops.object.join()
        bpy.context.active_object.name = nm


def _sign(name, text, x, y, z, coll):
    cu = bpy.data.curves.new(name, "FONT")
    cu.body = text
    for f in ("/System/Library/Fonts/Avenir Next.ttc", "/System/Library/Fonts/HelveticaNeue.ttc"):
        try:
            cu.font = bpy.data.fonts.load(f, check_existing=True)
            break
        except Exception:
            pass
    cu.size = 0.42
    cu.extrude = 0.01
    cu.align_x = "CENTER"
    cu.align_y = "CENTER"
    o = bpy.data.objects.new(name, cu)
    o.data.materials.append(flat("sign_paint", "#2e2a26", rough=0.6))
    link(o, coll)
    o.rotation_euler = (math.pi / 2, 0, 0)
    o.location = P(x, y, z)
    return o
