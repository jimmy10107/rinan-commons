import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {weld,simplify,prune,dedup,meshopt} from '@gltf-transform/functions';
import {MeshoptDecoder,MeshoptEncoder,MeshoptSimplifier} from 'meshoptimizer';
import sharp from 'sharp';import {readFileSync,writeFileSync} from 'node:fs';
await Promise.all([MeshoptDecoder.ready,MeshoptEncoder.ready,MeshoptSimplifier.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
const plants=JSON.parse(readFileSync('app/plants/assets.json','utf8'));
for(const p of plants)for(const a of [...p.stages,p.organ]){
 const doc=await io.read('public/plants/'+a.file);let tris=0;for(const mesh of doc.getRoot().listMeshes())for(const prim of mesh.listPrimitives())tris+=(prim.getIndices()?.getCount()||prim.getAttribute('POSITION').getCount())/3;
 await doc.transform(weld(),simplify({simplifier:MeshoptSimplifier,ratio:Math.min(1,16000/tris),error:.06}),prune(),dedup());
 for(const t of doc.getRoot().listTextures())if(t.getImage()){const bytes=await sharp(t.getImage()).resize({width:128,height:128,fit:'inside',withoutEnlargement:true}).webp({quality:60}).toBuffer();t.setImage(bytes).setMimeType('image/webp');}
 await doc.transform(meshopt({encoder:MeshoptEncoder,level:'medium'}));const file=a.file.replace('.glb','-lite.glb');const bytes=await io.writeBinary(doc);writeFileSync('public/plants/'+file,bytes);a.lite={file,bytes:bytes.length};console.log(file,bytes.length);
}
writeFileSync('app/plants/assets.json',JSON.stringify(plants,null,2)+'\n');
writeFileSync('app/plants/preload.json',JSON.stringify([plants[2],...plants.filter((_,i)=>i!==2)].map(p=>(p.stages[2].lite.bytes<350000?p.stages[2]:p.stages[0]).lite.file))+'\n');
