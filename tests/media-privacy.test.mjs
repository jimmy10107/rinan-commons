import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {checkPublicMedia} from '../scripts/check-public-media.mjs';
test('private catalogs, unknown photos and disguised JPEGs fail the public media gate',()=>{
 const root=mkdtempSync(path.join(tmpdir(),'rinan-media-'));
 try{writeFileSync(path.join(root,'catalog.sqlite'),'private');writeFileSync(path.join(root,'upload.jpg'),Buffer.from('ffd8ff','hex'));writeFileSync(path.join(root,'hidden.txt'),Buffer.from('ffd8ff','hex'));const errors=checkPublicMedia(root,{});assert.ok(errors.some(e=>e.includes('catalog.sqlite')));assert.ok(errors.some(e=>e.includes('upload.jpg')));assert.ok(errors.some(e=>e.includes('hidden.txt')));}finally{rmSync(root,{recursive:true,force:true});}
});
test('private file references cannot ship in public JSON',()=>{const root=mkdtempSync(path.join(tmpdir(),'rinan-ref-'));try{writeFileSync(path.join(root,'data.json'),'"libfile_example"');assert.equal(checkPublicMedia(root,{}).length,1);}finally{rmSync(root,{recursive:true,force:true});}});
