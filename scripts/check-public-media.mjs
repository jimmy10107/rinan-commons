import {readdirSync,readFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
export function checkPublicMedia(root,approved,allowGenerated=false){
 const issues=[];
 function visit(dir){for(const name of readdirSync(dir)){const file=path.join(dir,name),rel=path.relative(root,file).split(path.sep).join('/');if(statSync(file).isDirectory()){visit(file);continue;}
  if(/(?:private-media|media-private|originals|catalog)\//i.test(rel)||/\.(?:sqlite3?|db|zip)$/i.test(rel))issues.push(`Private archive/database is not a public asset: ${rel}`);
  const bytes=readFileSync(file);
  const raster=/\.(?:jpg|jpeg|png|webp|avif|heic|tiff?)$/i.test(rel)||bytes.subarray(0,3).toString('hex')==='ffd8ff'||bytes.subarray(0,8).toString('hex')==='89504e470d0a1a0a';
  if(raster){
   if(allowGenerated&&/^images\/optimized\/rinan-station(?:-front)?-(480|800|1200)\.webp$/.test(rel))continue;
   if(!approved[rel])issues.push(`Image needs explicit publication approval: ${rel}`);
   else if(createHash('sha256').update(bytes).digest('hex')!==approved[rel])issues.push(`Approved image was replaced: ${rel}`);
  }
  if(/\.(?:json|html|js|txt|sql)$/i.test(rel)&&/libfile_[a-z0-9]+|BEGIN PRIVATE KEY/.test(bytes.toString()))issues.push(`Private reference or key in public output: ${rel}`);
 }}visit(root);return issues;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const approved=JSON.parse(readFileSync('content/public-image-allowlist.json','utf8'));
 const issues=checkPublicMedia('public',approved,true);
 if(issues.length){console.error(issues.join('\n'));process.exitCode=1;}else console.log('Public assets contain only approved image sources and generated display variants; no private catalogs.');
}
