/** Rebuild the published derivatives from the separately retained v2 production pack.
 * Usage: node scripts/build-plants.mjs /absolute/path/to/botanical-closeup-v2-delivery
 * Original photographs remain under their individual source licences.
 */
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS, EXTTextureWebP} from '@gltf-transform/extensions';
import {weld, simplify, prune, dedup, meshopt} from '@gltf-transform/functions';
import {MeshoptEncoder, MeshoptSimplifier} from 'meshoptimizer';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';

const source=process.argv[2];
if(!source) throw Error('Supply the original v2 production directory; the site never downloads private sources.');
const dest='public/plants';
await fs.mkdir(`${dest}/models`,{recursive:true});await fs.mkdir(`${dest}/previews`,{recursive:true});await fs.mkdir(`${dest}/references`,{recursive:true});
await MeshoptEncoder.ready;await MeshoptSimplifier.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder});
const catalog=JSON.parse(await fs.readFile(path.join(source,'catalog.json'),'utf8'));
const macro=JSON.parse(await fs.readFile(path.join(source,'macros/catalog.json'),'utf8'));
const corrections=JSON.parse(await fs.readFile('content/plants-reference-corrections.json','utf8'));
const allPhotos=JSON.parse(await fs.readFile(path.join(source,'references/photos.json'),'utf8')).map(p=>({...p,...corrections[String(p.commons_id)]}));
const textureCache=new Map();const records=[];const metrics=[];
const triCount=d=>d.getRoot().listMeshes().reduce((sum,m)=>sum+m.listPrimitives().reduce((s,p)=>s+(p.getIndices()?.getCount()??0)/3,0),0);
async function model(file,name,quality='balanced'){
 const doc=await io.read(path.join(source,file));const original=triCount(doc),budget=quality==='detail'?300000:70000;
 await doc.transform(weld(),simplify({simplifier:MeshoptSimplifier,ratio:Math.min(1,budget/original),error:quality==='detail'?.001:.008}),prune(),dedup());
 if(quality==='balanced'&&triCount(doc)>110000)await doc.transform(simplify({simplifier:MeshoptSimplifier,ratio:70000/triCount(doc),error:.035}));
 const size=quality==='detail'?1024:512;
 for(const t of doc.getRoot().listTextures()){
  const img=t.getImage();if(!img)continue;
  const key=createHash('sha256').update(img).update(String(size)).digest('hex');
  if(!textureCache.has(key))textureCache.set(key,await sharp(img).resize(size,size,{fit:'inside',withoutEnlargement:true}).webp({quality:t.getName().includes('normal')?90:84,effort:4}).toBuffer());
  t.setImage(textureCache.get(key)).setMimeType('image/webp');
 }
 doc.createExtension(EXTTextureWebP).setRequired(true);
 await doc.transform(meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16,quantizeNormal:10,quantizeTexcoord:14}));
 const filename=`models/${name}.glb`;await io.write(`${dest}/${filename}`,doc);
 const bytes=(await fs.stat(`${dest}/${filename}`)).size;const triangles=triCount(doc);
 metrics.push({file:filename,bytes,triangles,originalTriangles:original});console.log(name,triangles,(bytes/1024).toFixed(0)+' KiB');
 return {file:filename,bytes,triangles};
}
for(const sp of catalog){
 const m=macro.find(m=>m.id===sp.id);
 const organ=await model(m.file,`${sp.id}-macro`);
 const detail=await model(m.file,`${sp.id}-detail`,'detail');
 const stages=[];
 for(let s=0;s<5;s++)stages.push({...await model(sp.assets[s].web.file,`${sp.id}-${s+1}`),label:sp.stages[s],preview:`previews/${sp.id}-${s+1}.webp`});
 for(const size of [480,960])await sharp(path.join(source,'renders',`${sp.id}_detail.png`)).resize(size,size).webp({quality:86}).toFile(`${dest}/previews/${sp.id}-${size}.webp`);
 const photos=[];
 for(const p of allPhotos.filter(p=>p.species_id===sp.id)){
  const filename=`references/${sp.id}-${p.commons_id}.webp`;await sharp(path.join(source,p.file)).resize(720,720,{fit:'inside',withoutEnlargement:true}).webp({quality:84}).toFile(`${dest}/${filename}`);
  photos.push({file:filename,title:p.title,author:p.author,license:p.license,licenseUrl:p.license_url,source:p.source_page,note:p.observation,type:p.reference_type});
 }
 records.push({id:sp.id,name:sp.name,latin:sp.latin,note:sp.note,organ,detail,stages,photos});
}
await fs.writeFile('app/plants/assets.json',JSON.stringify(records,null,2)+'\n');
await fs.writeFile('docs/plants-asset-budget.json',JSON.stringify({files:metrics.length,totalBytes:metrics.reduce((a,m)=>a+m.bytes,0),largestBytes:Math.max(...metrics.map(m=>m.bytes)),models:metrics},null,2)+'\n');
console.log('Built',metrics.length,'independently loadable models.');
