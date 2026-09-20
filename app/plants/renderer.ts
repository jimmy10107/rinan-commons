import {modelBytes} from './model-cache';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {MeshoptDecoder} from 'three/examples/jsm/libs/meshopt_decoder.module.js';

export type PlantViewer = ReturnType<typeof createPlantViewer>;
export function createPlantViewer(host: HTMLElement, report: (state: 'loading'|'ready'|'error'|'refining'|'refine-error')=>void, onZoom?: (ratio:number)=>void) {
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,matchMedia('(max-width:760px)').matches?1.25:1.5));
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
  const canvas=renderer.domElement;canvas.setAttribute('aria-label','植物三維模型，可拖曳旋轉，或使用下方視角與縮放按鈕');canvas.setAttribute('role','img');host.appendChild(canvas);
  const scene=new THREE.Scene();scene.background=new THREE.Color('#f4f4e9');
  const camera=new THREE.PerspectiveCamera(36,1,.0001,100);
  const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.10;controls.autoRotateSpeed=.65;controls.enablePan=true;
  const hemi=new THREE.HemisphereLight('#eff4df','#586b53',1.3);scene.add(hemi);
  const key=new THREE.DirectionalLight('#fff3dc',2.5);key.position.set(-3,5,4);scene.add(key);
  const fill=new THREE.DirectionalLight('#dbe7ff',.8);fill.position.set(4,1,1);scene.add(fill);
  const rim=new THREE.DirectionalLight('#fff6d8',1.6);rim.position.set(0,3,-3);scene.add(rim);
  const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();
  const environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;scene.environmentIntensity=.32;room.dispose();pmrem.dispose();
  const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  let model:THREE.Group|null=null,dead=false,visible=true,frame=0,frames=0,version=0,abort:AbortController|null=null;
  let dim=1,radius=.5,center=new THREE.Vector3(),fitDistance=2;
  let last=0,slowFrames=0,movingFrames=0,wire=false;
  function disposeModel(root:THREE.Object3D){
    const materials=new Set<THREE.Material>(),textures=new Set<THREE.Texture>();
    root.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});
    for(const m of materials){for(const v of Object.values(m))if(v instanceof THREE.Texture)textures.add(v);m.dispose();}
    for(const t of textures){t.dispose();const image=t.source?.data;if(typeof ImageBitmap!=='undefined'&&image instanceof ImageBitmap)image.close();}
  }
  function tick(now:number){
    frame=0;if(dead||!visible||document.hidden)return;
    const changing=controls.update();renderer.render(scene,camera);renderer.getContext().flush();canvas.dataset.frames=String(++frames);canvas.dataset.triangles=String(renderer.info.render.triangles);
    if(changing||controls.autoRotate){
      if(last&&now-last<200){movingFrames++;if(now-last>40)slowFrames++;}
      if(movingFrames===40&&slowFrames>15&&renderer.getPixelRatio()>1){renderer.setPixelRatio(1);resize();}
      last=now;invalidate();
    }else last=0;
  }
  function invalidate(){if(!frame&&!dead&&visible&&!document.hidden)frame=requestAnimationFrame(tick);}
  controls.addEventListener('change',()=>{invalidate();if(model)onZoom?.(fitDistance/camera.position.distanceTo(controls.target));});
  function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();invalidate();}
  const resizeObserver=new ResizeObserver(()=>{const old=camera.aspect;resize();if(model&&Math.abs(old-camera.aspect)>.25)view('front');});resizeObserver.observe(host);resize();
  const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)invalidate();else{cancelAnimationFrame(frame);frame=0;last=0;}},{threshold:.01});intersection.observe(host);
  function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0;}else invalidate();}document.addEventListener('visibilitychange',visibility);
  function contextLost(e:Event){e.preventDefault();if(!dead)report('error');}canvas.addEventListener('webglcontextlost',contextLost);
  function view(side:'front'|'back'|'side'='front'){
    const direction=side==='back'?new THREE.Vector3(-.55,.42,-1):side==='side'?new THREE.Vector3(1,.2,.1):new THREE.Vector3(.48,.5,1);
    const vertical=THREE.MathUtils.degToRad(camera.fov)/2,horizontal=Math.atan(Math.tan(vertical)*camera.aspect);
    fitDistance=radius/Math.sin(Math.min(vertical,horizontal))*1.08;
    const damping=controls.enableDamping;controls.enableDamping=false;controls.target.copy(center);camera.position.copy(center).add(direction.normalize().multiplyScalar(fitDistance));controls.update();controls.enableDamping=damping;invalidate();
  }
  async function load(url:string,preserve=false){
    const current=++version;abort?.abort();abort=new AbortController();const retained=preserve&&!!model&&canvas.dataset.ready==='true';
    report(retained?'refining':'loading');if(!retained)canvas.dataset.ready='false';
    let incoming:THREE.Group|null=null;
    try{
      const bytes=await modelBytes(url,abort.signal);if(dead||current!==version)return;
      const gltf=await loader.parseAsync(bytes,'');incoming=gltf.scene;
      if(dead||current!==version){disposeModel(incoming);return;}
      incoming.traverse(o=>{if(o instanceof THREE.Mesh)for(const m of Array.isArray(o.material)?o.material:[o.material])if(m instanceof THREE.MeshStandardMaterial)m.wireframe=wire;});
      // Compile the replacement offscreen while the current model remains interactive.
      const staging=new THREE.Scene();staging.environment=scene.environment;staging.environmentIntensity=scene.environmentIntensity;
      for(const light of [hemi,key,fill,rim])staging.add(light.clone());staging.add(incoming);
      if(renderer.extensions.has('KHR_parallel_shader_compile'))await renderer.compileAsync(staging,camera);else renderer.compile(staging,camera);
      if(dead||current!==version){disposeModel(incoming);return;}
      if(model){scene.remove(model);disposeModel(model);}model=incoming;scene.add(model);incoming=null;
      if(!retained){const box=new THREE.Box3().setFromObject(model),sphere=box.getBoundingSphere(new THREE.Sphere());center=box.getCenter(new THREE.Vector3());radius=sphere.radius;dim=box.getSize(new THREE.Vector3()).length();camera.near=dim*.0001;camera.far=dim*80;controls.minDistance=radius*.12;controls.maxDistance=radius*30;view();}
      renderer.render(scene,camera);renderer.getContext().flush();
      canvas.dataset.ready='true';canvas.dataset.model=url;canvas.dataset.distance=String(camera.position.distanceTo(controls.target));
      if(!matchMedia('(prefers-reduced-motion: reduce)').matches)canvas.animate([{opacity:.72},{opacity:1}],{duration:420,easing:'linear'});
      report('ready');invalidate();return true;
    }catch(e){if(incoming)disposeModel(incoming);if(!dead&&current===version&&(e as Error).name!=='AbortError'){report(retained?'refine-error':'error');return false;}}
  }
  function zoom(factor:number){const offset=camera.position.clone().sub(controls.target);offset.multiplyScalar(factor).clampLength(controls.minDistance,controls.maxDistance);camera.position.copy(controls.target).add(offset);controls.update();invalidate();}
  return {load,view,zoom,background(dark:boolean){scene.background=new THREE.Color(dark?'#17231c':'#f4f4e9');invalidate();},wireframe(on:boolean){wire=on;model?.traverse(o=>{if(o instanceof THREE.Mesh)for(const m of Array.isArray(o.material)?o.material:[o.material])if(m instanceof THREE.MeshStandardMaterial)m.wireframe=on;});invalidate();},rotate(on:boolean){controls.autoRotate=on;invalidate();},backlight(on:boolean){rim.intensity=on?4:1.6;key.intensity=on?.85:2.5;invalidate();},snapshot(){renderer.render(scene,camera);return new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/png'));},
    destroy(){dead=true;++version;abort?.abort();cancelAnimationFrame(frame);resizeObserver.disconnect();intersection.disconnect();document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('webglcontextlost',contextLost);controls.dispose();if(model)disposeModel(model);environment.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();}
  };
}
