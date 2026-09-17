// Local preparation only. Never uploads or publishes photographs.
import {DatabaseSync} from 'node:sqlite';
import {mkdir,writeFile,realpath} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
const source=process.argv[2];
if(!source)throw new Error('Usage: node media-service/prepare-import.mjs /absolute/private/catalog.sqlite');
const base=dirname(fileURLToPath(import.meta.url));
const target=resolve(base,'import-set');
// Fixed, gitignored destination. Do not allow symlinks to redirect private output.
await mkdir(target,{recursive:true,mode:0o700});
if(await realpath(target)!==target)throw new Error('Import directory must not be a symlink');
const db=new DatabaseSync(resolve(source),{readOnly:true});
const quote=value=>"'"+String(value).replaceAll("'","''")+"'";
const statements=['PRAGMA foreign_keys=ON;'];
const manifest=[];
for(const row of db.prepare('SELECT * FROM assets ORDER BY id').all()){
 if(!/^[A-Za-z0-9_-]{1,64}$/.test(row.id))throw new Error('Invalid asset ID');
 const bytes=Buffer.from(row.original_bytes),hash=createHash('sha256').update(bytes).digest('hex');
 if(hash!==row.sha256)throw new Error('Original checksum mismatch');
 const extension={'image/jpeg':'jpg','image/png':'png'}[row.mime_type];if(!extension)throw new Error('Unsupported original type');
 const originalKey=`originals/${hash}.${extension}`;
 const save=async(key,data)=>{const path=resolve(target,key);await mkdir(dirname(path),{recursive:true,mode:0o700});if(await realpath(dirname(path))!==dirname(path))throw new Error('Symlink rejected');await writeFile(path,data,{mode:0o600,flag:'wx'});};
 await save(originalKey,bytes);manifest.push({binding:'ORIGINALS',key:originalKey,mime:row.mime_type});
 statements.push(`INSERT INTO media_assets(id,title,category,original_key,mime_type,width,height) VALUES(${[row.id,row.title,row.category,originalKey,row.mime_type,row.width,row.height].map(quote).join(',')});`);
 for(const width of [480,800,1200]){
  const key=`previews/${hash}/${width}.webp`;
  const preview=await sharp(bytes).rotate().resize({width,withoutEnlargement:true}).webp({quality:76}).toBuffer();
  await save(key,preview);manifest.push({binding:'DISPLAYS',key,mime:'image/webp'});
  statements.push(`INSERT INTO media_variants(asset_id,width,object_key) VALUES(${quote(row.id)},${width},${quote(key)});`);
 }
}
await writeFile(resolve(target,'import.sql'),statements.join('\n')+'\n',{mode:0o600,flag:'wx'});
await writeFile(resolve(target,'objects.json'),JSON.stringify(manifest,null,2),{mode:0o600,flag:'wx'});
db.close();console.log(`Prepared ${manifest.length/4} draft assets locally. No upload or publication performed.`);
