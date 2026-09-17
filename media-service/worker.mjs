import {verifyOwner} from './auth.mjs';
import {adminHtml} from './admin.mjs';
const ID='[A-Za-z0-9_-]{1,64}';
const previewRoute=new RegExp(`^/(image|admin/preview)/(${ID})/(480|800|1200)\\.webp$`);
const originalRoute=new RegExp(`^/admin/original/(${ID})$`);
const editRoute=new RegExp(`^/admin/(publish|unpublish)/(${ID})$`);
const baseHeaders={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex, nofollow'};
function reply(message,status=200,headers={}){return new Response(message,{status,headers:{...baseHeaders,'Content-Type':'text/plain; charset=utf-8',...headers}});}
function json(data){return reply(JSON.stringify(data),200,{'Content-Type':'application/json; charset=utf-8'});}
function validPreviewKey(key,width){return typeof key==='string'&&new RegExp(`^previews/[a-f0-9]{64}/${width}\\.webp$`).test(key);}
export function createHandler(authorize=verifyOwner){return async function handle(request,env){
 const url=new URL(request.url),route=url.pathname;
 const original=route.match(originalRoute),preview=route.match(previewRoute),edit=route.match(editRoute);
 if(!['GET','HEAD','POST'].includes(request.method))return reply('Method not allowed',405,{'Allow':'GET, HEAD, POST'});
 if(!env.MEDIA_DB||!env.ORIGINALS||!env.DISPLAYS)return reply('Media service not configured',503);
 const admin=route==='/admin'||route.startsWith('/admin/');
 if(admin){try{await authorize(request,env);}catch{return reply('Authentication and owner permission required',403);}}
 try{
  if(edit){
   if(request.method!=='POST')return reply('Method not allowed',405,{'Allow':'POST'});
   if(request.headers.get('origin')!==url.origin||request.headers.get('content-type')?.split(';')[0]!=='application/json')return reply('Invalid request origin or content type',403);
   if(Number(request.headers.get('content-length')||0)>4096)return reply('Request too large',413);
   const reader=request.body?.getReader();let size=0,parts=[];if(!reader)return reply('Body required',400);
   while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>4096){await reader.cancel();return reply('Request too large',413);}parts.push(value);}
   const data=JSON.parse(new TextDecoder().decode(await new Blob(parts).arrayBuffer()));
   const id=edit[2],publish=edit[1]==='publish';
   const asset=await env.MEDIA_DB.prepare('SELECT id FROM media_assets WHERE id=?').bind(id).first();if(!asset)return reply('Not found',404);
   if(publish){
    if(data.displayApproved!==true||typeof data.credit!=='string'||!data.credit.trim()||data.credit.length>200)return reply('Display approval and credit required',400);
    const result=await env.MEDIA_DB.prepare('SELECT width,object_key FROM media_variants WHERE asset_id=? ORDER BY width').bind(id).all();
    if(result.results.length!==3||result.results.some((v,i)=>v.width!==[480,800,1200][i]||!validPreviewKey(v.object_key,v.width)))return reply('Display variants incomplete',409);
    for(const variant of result.results){const object=await env.DISPLAYS.head(variant.object_key);if(!object||object.httpMetadata?.contentType!=='image/webp')return reply('Display image missing or invalid',409);}
    await env.MEDIA_DB.prepare("UPDATE media_assets SET status='published',display_approved=1,credit=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(data.credit.trim(),id).run();
   }else await env.MEDIA_DB.prepare("UPDATE media_assets SET status='revoked',display_approved=0,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(id).run();
   return json({id,status:publish?'published':'revoked'});
  }
  if(request.method==='POST')return reply('Method not allowed',405,{'Allow':'GET, HEAD'});
  if(route==='/admin'||route==='/admin/'){
   const nonce=Array.from(crypto.getRandomValues(new Uint8Array(18)),n=>n.toString(16).padStart(2,'0')).join('');
   return reply(request.method==='HEAD'?null:adminHtml(nonce),200,{'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':`default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; img-src 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'`});
  }
  if(route==='/admin/catalog'){
   const after=url.searchParams.get('after')||'';if(after&&!new RegExp(`^${ID}$`).test(after))return reply('Invalid cursor',400);
   const result=await env.MEDIA_DB.prepare('SELECT id,title,category,credit,status,width,height FROM media_assets WHERE id>? ORDER BY id LIMIT 51').bind(after).all();const items=result.results.slice(0,50);return json({items,next:result.results.length>50?items.at(-1).id:null});
  }
  if(original){
   const asset=await env.MEDIA_DB.prepare('SELECT original_key,mime_type FROM media_assets WHERE id=?').bind(original[1]).first();
   if(!asset||!/^originals\/[a-f0-9]{64}\.(jpg|png)$/.test(asset.original_key)||!['image/jpeg','image/png'].includes(asset.mime_type))return reply('Not found',404);
   const object=await env.ORIGINALS.get(asset.original_key);if(!object)return reply('Not found',404);
   return reply(request.method==='HEAD'?null:object.body,200,{'Content-Type':asset.mime_type,'Content-Disposition':`attachment; filename="${original[1]}.${asset.mime_type==='image/png'?'png':'jpg'}"`});
  }
  if(preview){
   const [,kind,id,width]=preview;
   const asset=await env.MEDIA_DB.prepare('SELECT v.object_key,a.status,a.display_approved FROM media_variants v JOIN media_assets a ON a.id=v.asset_id WHERE v.asset_id=? AND v.width=?').bind(id,Number(width)).first();
   if(!asset||(kind==='image'&&(asset.status!=='published'||asset.display_approved!==1))||!validPreviewKey(asset.object_key,width))return reply('Not found',404);
   const object=await env.DISPLAYS.get(asset.object_key);if(!object||object.httpMetadata?.contentType!=='image/webp')return reply('Not found',404);
   // Check publication on every request; never cache private photos or allow CDN cache to bypass revocation.
   return reply(request.method==='HEAD'?null:object.body,200,{'Content-Type':'image/webp','Content-Disposition':'inline'});
  }
  return reply('Not found',404);
 }catch{return reply('Request could not be completed',400);}
};}
export default {fetch:createHandler()};
