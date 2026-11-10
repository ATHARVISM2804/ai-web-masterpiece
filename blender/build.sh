#!/bin/sh
# Rebuild the villa and the cast: model them in Blender, then compress for the web.
#   sh blender/build.sh
set -e
cd "$(dirname "$0")"
LM="$(pwd)/lightmaps"; mkdir -p "$LM"
VILLA_BAKE="$LM" /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P build_villa.py -- villa.glb
for m in villa_sky villa_lamp; do cwebp -quiet -q 82 "$LM/$m.png" -o "../public/life/$m.webp"; done
T="npx -y @gltf-transform/cli@4"
$T optimize villa.glb villa.opt.glb --palette false --simplify false --prune-attributes false --compress false \
  --texture-compress webp --texture-size 1024
# 16-bit positions: the island is kilometres wide, the floors centimetres apart
$T meshopt villa.opt.glb ../public/life/villa.glb --quantize-position 16
rm -rf villa.opt.glb villa.glb lightmaps
# the cast: realistic rigged men from MakeHuman's CC0 data
/Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P build_men.py -- men.glb
$T optimize men.glb men.opt.glb --palette false --simplify false --compress false --flatten false \
  --join false --instance false --texture-compress webp --texture-size 1024
$T meshopt men.opt.glb ../public/life/men.glb --quantize-position 16
rm men.opt.glb men.glb
