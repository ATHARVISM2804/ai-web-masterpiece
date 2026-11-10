"""Download Poly Haven (CC0) models as 1k glTF and textures as 1k jpg into assets/."""
import json, os, sys, urllib.request
UA = {"User-Agent": "atharv-portfolio-build/1.0"}
def get(u): return json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=30))
def save(u, p):
    if os.path.exists(p): return
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60) as r, open(p, "wb") as f: f.write(r.read())
kind, ids = sys.argv[1], sys.argv[2:]
for i in ids:
    f = get(f"https://api.polyhaven.com/files/{i}")
    if kind == "model":
        g = f["gltf"]["1k"]["gltf"]
        d = f"assets/models/{i}"
        save(g["url"], f"{d}/{i}.gltf")
        for rel, v in g["include"].items(): save(v["url"], f"{d}/{rel}")
    else:
        for m in ("Diffuse", "nor_gl", "Rough", "AO"):
            if m in f: save(f[m]["1k"]["jpg"]["url"], f"assets/textures/{i}/{m}.jpg")
    print("ok", i)
