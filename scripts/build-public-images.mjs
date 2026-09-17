import sharp from 'sharp';
import { mkdir, stat } from 'node:fs/promises';
// Only these two already-published images are eligible. Private uploads never enter this path.
const approved=['rinan-station','rinan-station-front'];
await mkdir('public/images/optimized',{recursive:true});
for(const name of approved){
 const source=`public/images/${name}.jpg`;
 for(const width of [480,800,1200]){
  const target=`public/images/optimized/${name}-${width}.webp`;
  await sharp(source).rotate().resize({width,withoutEnlargement:true}).webp({quality:82,effort:5}).toFile(target);
 }
 const before=(await stat(source)).size,after=(await stat(`public/images/optimized/${name}-800.webp`)).size;
 console.log(`${name}: original ${before} bytes; 800px display ${after} bytes`);
}
