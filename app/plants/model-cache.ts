// Shared by the lightweight site preloader and the interactive renderer. No service worker.
const CACHE='rinan-plant-models-v3';
export function allowBackgroundModels(){
 const connection=(navigator as Navigator & {connection?:{saveData?:boolean;effectiveType?:string}}).connection;
 return navigator.onLine&&!connection?.saveData&&!['slow-2g','2g','3g'].includes(connection?.effectiveType||'');
}
export async function modelBytes(url:string,signal:AbortSignal){
 let cache:Cache|undefined;
 try{if('caches' in window)cache=await caches.open(CACHE);const hit=await cache?.match(url);if(hit){signal.throwIfAborted();return hit.arrayBuffer();}}catch(e){if(signal.aborted)throw e;}
 const response=await fetch(url,{signal});if(!response.ok)throw Error('Model unavailable');
 const bytes=await response.arrayBuffer();signal.throwIfAborted();
 // Cache only small first-pass assets. Detailed models use the normal HTTP cache.
 if(cache&&url.endsWith('-lite.glb'))try{await cache.put(url,new Response(bytes,{headers:{'Content-Type':'model/gltf-binary'}}));}catch{/* Private mode / quota: rendering still works. */}
 return bytes;
}
