import json,urllib.request,sys
UA={"User-Agent":"atharv-portfolio-build/1.0"}
def get(u): return json.load(urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=20))
ids=sys.argv[1:]
for i in ids:
    try:
        d=get(f"https://api.polyhaven.com/info/{i}")
        f=get(f"https://api.polyhaven.com/files/{i}")
        g=f.get('gltf',{}).get('1k',{}).get('gltf',{})
        size=g.get('size',0)+sum(v.get('size',0) for v in g.get('include',{}).values())
        print(f"{i:32} polys={d.get('polycount')} dims={d.get('dimensions')} 1k={size/1e6:.1f}MB")
    except Exception as e: print(i,'ERR',e)
