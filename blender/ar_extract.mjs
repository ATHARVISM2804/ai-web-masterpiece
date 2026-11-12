// Rebuild public/life/villa-ar.glb from villa.glb (needs: npm i --no-save @gltf-transform/core@4 @gltf-transform/extensions@4 @gltf-transform/functions@4 meshoptimizer sharp draco3dgltf)
//   node blender/ar_extract.mjs public/life/villa.glb public/life/villa-ar.glb
// villa.glb (the whole island) -> ar.glb: just the villa plot, desk-sized, no meshopt or instancing,
// so model-viewer, Android Scene Viewer and iOS Quick Look (via model-viewer's USDZ export) all read it
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import { prune, dedup, uninstance, textureCompress, draco, weld } from '@gltf-transform/functions';
import sharp from 'sharp';
import draco3d from 'draco3dgltf';
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.decoder': MeshoptDecoder,
  'draco3d.encoder': await draco3d.createEncoderModule(),
  'draco3d.decoder': await draco3d.createDecoderModule(),
});
const [src, out] = process.argv.slice(2);
const doc = await io.read(src);
const root = doc.getRoot();
const IN = (x, z) => x > -12.6 && x < 17.4 && z > -11.6 && z < 14.4;
// the island's far and middle rings go
for (const n of root.listNodes()) if (['bali_far', 'bali_mid'].includes(n.getName())) n.dispose();
// instanced plants and lamps: keep only the copies on the plot
for (const n of root.listNodes()) {
  const inst = n.getExtension('EXT_mesh_gpu_instancing');
  if (!inst) continue;
  const T = inst.getAttribute('TRANSLATION');
  const keep = [];
  for (let i = 0; i < T.getCount(); i++) { const [x, , z] = T.getElement(i, []); if (IN(x, z)) keep.push(i); }
  if (!keep.length) { n.dispose(); continue; }
  for (const sem of inst.listSemantics()) {
    const a = inst.getAttribute(sem);
    const size = a.getElementSize();
    const arr = new Float32Array(keep.length * size);
    keep.forEach((i, k) => arr.set(a.getElement(i, []), k * size));
    a.setArray(arr).setNormalized(false);
  }
}
await doc.transform(uninstance());
// merged meshes reach past the plot (the lane, its traffic): drop the triangles whose middle is outside
for (const n of root.listNodes()) {
  const mesh = n.getMesh();
  if (!mesh || n.getName() === 'villa_ar') continue;
  const m = n.getWorldMatrix();
  for (const prim of mesh.listPrimitives()) {
    const idx = prim.getIndices();
    const pos = prim.getAttribute('POSITION');
    if (!idx || !pos) continue;
    const p = [], kept = [];
    const world = (i) => { pos.getElement(i, p); return [m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12], m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]]; };
    for (let t = 0; t < idx.getCount(); t += 3) {
      const a = world(idx.getScalar(t)), b = world(idx.getScalar(t + 1)), c = world(idx.getScalar(t + 2));
      if (IN((a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3)) kept.push(idx.getScalar(t), idx.getScalar(t + 1), idx.getScalar(t + 2));
    }
    if (kept.length === idx.getCount()) continue;
    if (!kept.length) { prim.dispose(); continue; }
    idx.setArray(new Uint32Array(kept));
  }
}
// one parent, scaled so the villa is ~60 cm across on a table
const scene = root.listScenes()[0];
const holder = doc.createNode('villa_ar').setScale([0.02, 0.02, 0.02]);
for (const c of scene.listChildren()) { scene.removeChild(c); holder.addChild(c); }
scene.addChild(holder);
await doc.transform(
  prune(), dedup(), weld(),
  textureCompress({ encoder: sharp, resize: [512, 512], targetFormat: 'jpeg', quality: 80, pattern: /.*/, formats: /webp|png|jpeg/ }),
  draco(),
);
// textures with alpha (cutout leaves, rattan) were skipped: make those small pngs, since Scene Viewer can't read webp
for (const t of root.listTextures()) {
  if (t.getMimeType() !== 'image/webp') continue;
  t.setImage(await sharp(t.getImage()).resize(512, 512, { fit: 'inside' }).png({ compressionLevel: 9, palette: true }).toBuffer()).setMimeType('image/png');
  if (t.getURI()) t.setURI(t.getURI().replace(/\.webp$/, '.png'));
}
for (const e of root.listExtensionsUsed()) if (['EXT_meshopt_compression', 'EXT_texture_webp'].includes(e.extensionName)) e.dispose();
await io.write(out, doc);
