// Shared, same-origin renderer for the public preview and authenticated LINE collection.
const markup="<style>\n*{box-sizing:border-box}:host{display:block;border-radius:.6rem;margin:0;background:#14201b;color:#faf6df;font:1rem/1.65 system-ui,sans-serif}main{max-width:30rem;margin:auto;padding:1rem 1rem 2rem;text-align:center}h2{margin:0;font:600 1.12rem/1.6 serif}header p{margin:.18rem 0 .7rem;color:#d4dfd5;font-size:.93rem}.stage{perspective:1000px;margin:auto;padding:.5rem;max-width:min(100%,55svh);touch-action:pan-y pinch-zoom}.tilt,.card{border-radius:5%;position:relative}.tilt{transition:transform .16s ease-out;transform:rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))}.card{overflow:hidden;background:#edf2ef;box-shadow:0 5px 11px #020d083b;animation:sway 7s ease-in-out infinite alternate}.card svg{width:100%;height:auto;display:block}.card:after{content:\"\";position:absolute;inset:0;pointer-events:none;border-radius:inherit;background:radial-gradient(ellipse at var(--x,30%) var(--y,28%),#fff7,transparent 48%);opacity:.6;mix-blend-mode:soft-light}.stage[data-point] .card,.stage[data-still] .card{animation:none}.stage[data-still] .tilt{transform:none}.stage[data-still] .card:after{opacity:0}@keyframes sway{from{transform:rotateY(-5deg) rotateX(2deg)}to{transform:rotateY(5deg) rotateX(-2deg)}}@media(prefers-reduced-motion:reduce){.tilt{transition:none;transform:none}.card{animation:none}.card:after{opacity:0}}button,a.action{font:inherit;border:1px solid #c4d0c1;border-radius:.4rem;padding:.55rem .9rem;min-height:44px;cursor:pointer;color:#173a30;background:#f6f2df;text-decoration:none}button.secondary{background:transparent;color:inherit}nav{display:flex;justify-content:center;gap:.55rem;flex-wrap:wrap;margin-top:.75rem}p.note{font-size:.86rem;color:#c7d0c7}#fallback img{width:100%;height:auto}button:focus-visible,a:focus-visible{outline:3px solid #fad984;outline-offset:3px}\n</style><main><header><h2>走傱日南｜電子活動章</h2><p>移動滑鼠或輕觸卡面看珠光；存圖時保留固定角度。</p></header>\n<div class=\"stage\" id=\"stage\"><div class=\"tilt\"><div class=\"card\">\n<svg id=\"face\" xmlns=\"http://www.w3.org/2000/svg\" width=\"960\" height=\"1344\" viewBox=\"0 0 960 1344\" role=\"img\" aria-label=\"走傱日南電子活動章：八題全對，金色傱字與珍珠紋卡面\">\n<defs><linearGradient id=\"pearl\" x2=\".95\" y2=\"1\"><stop stop-color=\"#d4f1ee\"/><stop offset=\".31\" stop-color=\"#f6f7fb\"/><stop offset=\".52\" stop-color=\"#e9e0f3\"/><stop offset=\".72\" stop-color=\"#e1eff1\"/><stop offset=\"1\" stop-color=\"#f4e4e7\"/></linearGradient><linearGradient id=\"gold\"><stop stop-color=\"#ab814c\"/><stop offset=\".42\" stop-color=\"#c9a36e\"/><stop offset=\".75\" stop-color=\"#a58554\"/><stop offset=\"1\" stop-color=\"#b99c73\"/></linearGradient><pattern id=\"rings\" width=\"960\" height=\"1344\" patternUnits=\"userSpaceOnUse\"><g fill=\"none\" stroke=\"#fff\" stroke-width=\"7\" opacity=\".24\"><circle cx=\"480\" cy=\"574\" r=\"15\"/><circle cx=\"480\" cy=\"574\" r=\"50\"/><circle cx=\"480\" cy=\"574\" r=\"85\"/><circle cx=\"480\" cy=\"574\" r=\"120\"/><circle cx=\"480\" cy=\"574\" r=\"155\"/><circle cx=\"480\" cy=\"574\" r=\"190\"/><circle cx=\"480\" cy=\"574\" r=\"225\"/><circle cx=\"480\" cy=\"574\" r=\"260\"/><circle cx=\"480\" cy=\"574\" r=\"295\"/><circle cx=\"480\" cy=\"574\" r=\"330\"/><circle cx=\"480\" cy=\"574\" r=\"365\"/><circle cx=\"480\" cy=\"574\" r=\"400\"/><circle cx=\"480\" cy=\"574\" r=\"435\"/><circle cx=\"480\" cy=\"574\" r=\"470\"/><circle cx=\"480\" cy=\"574\" r=\"505\"/><circle cx=\"480\" cy=\"574\" r=\"540\"/><circle cx=\"480\" cy=\"574\" r=\"575\"/><circle cx=\"480\" cy=\"574\" r=\"610\"/><circle cx=\"480\" cy=\"574\" r=\"645\"/><circle cx=\"480\" cy=\"574\" r=\"680\"/><circle cx=\"480\" cy=\"574\" r=\"715\"/><circle cx=\"480\" cy=\"574\" r=\"750\"/></g></pattern><path id=\"mark\" d=\"M896.4 752.8C883.5 773.0 869.2 791.9 853.6 809.5C849.6 805.5 844.0 800.2 836.4 792.9C803.6 762.1 775.0 735.2 763.1 721.7C761.4 720.0 754.2 713.4 737.6 698.8C724.6 687.5 708.7 673.6 706.4 670.9C696.8 660.3 611.2 566.8 576.8 564.2L573.4 564.2C572.1 564.2 570.8 563.8 569.5 563.8L565.8 563.8C564.2 563.8 561.8 563.5 559.2 563.2L558.2 563.2C549.2 562.8 541.9 573.4 535.6 583.1C533.7 586.0 531.7 588.7 530.7 590.0C528.7 592.0 526.7 594.7 524.4 597.3C513.8 609.9 495.9 631.5 481.9 630.8C478.9 630.5 476.6 629.5 474.0 627.8C464.4 619.9 468.3 608.6 475.3 593.7C477.0 589.4 478.9 585.7 479.9 582.4C481.6 576.4 482.3 569.8 482.9 563.8C483.6 557.9 484.3 551.9 485.6 546.9C488.2 536.6 490.9 528.3 493.2 521.1C501.5 495.5 505.5 482.6 499.2 440.8C498.5 437.5 497.2 432.5 495.9 426.9C494.2 421.6 491.9 412.0 490.2 404.0C489.2 396.7 494.9 389.8 502.2 390.1L502.5 390.1C509.8 390.4 517.1 393.1 520.4 396.4C525.7 402.0 536.6 418.3 539.0 424.6C542.9 436.5 547.3 447.4 551.9 459.4C554.5 466.0 557.2 473.0 559.9 480.3C561.2 483.3 562.5 486.2 564.2 488.9C567.1 494.2 569.8 498.2 568.8 504.5C568.5 506.1 568.8 507.8 570.1 508.8C571.1 509.4 572.1 509.8 573.1 510.1C573.8 510.1 574.1 510.1 574.8 509.8L577.4 509.1C582.4 507.8 586.4 503.8 588.4 499.2C592.3 488.6 591.4 478.9 590.4 469.7C589.7 464.7 589.4 459.7 589.4 454.7C589.7 446.8 590.0 438.8 590.4 430.9C591.0 410.3 591.7 388.8 593.0 368.2C593.0 365.9 593.3 363.6 593.3 361.2C593.7 349.0 594.0 343.0 605.3 338.0C611.6 335.0 617.2 334.0 622.2 334.0C627.5 334.4 632.1 336.7 636.1 341.0C646.1 352.3 647.7 375.5 646.4 391.7C646.4 393.4 647.1 394.7 648.4 395.7C649.0 396.4 650.0 397.0 651.0 397.0C651.7 397.0 652.0 397.0 652.7 396.7C660.3 394.7 677.6 391.7 693.8 392.4C707.7 393.1 717.3 396.4 721.7 401.7C724.3 404.3 725.0 408.0 724.6 412.3C724.0 415.3 716.4 425.6 710.7 433.2C701.1 445.5 694.5 454.7 691.8 461.7C690.8 464.4 688.8 466.7 686.2 467.7C684.5 468.3 682.5 468.7 680.5 468.7C674.9 468.3 668.6 465.4 662.3 462.4C657.3 460.0 652.4 457.7 647.7 456.7L646.7 456.7C645.4 456.4 644.1 457.1 643.4 457.7C642.1 458.7 641.4 460.4 641.7 462.0C643.1 474.0 639.4 485.2 635.1 497.2C633.8 501.5 632.1 505.8 630.8 510.4C628.8 517.7 632.1 525.4 639.1 529.0L654.7 538.0C655.7 538.6 656.3 539.0 657.3 540.0C676.9 559.8 715.7 591.3 760.5 627.8C847.7 698.4 876.8 709.4 896.4 752.8Z M607.4 277.7C604.7 271.3 570.9 258.1 563.1 256.8C559.1 252.1 600.3 211.4 585.6 197.5C584.8 196.8 568.1 188.3 566.0 187.5C551.9 182.4 536.2 181.0 521.3 181.4C515.1 195.2 510.1 221.3 502.8 234.4C502.4 235.1 501.2 238.5 501.1 239.4C499.6 255.0 496.1 266.4 488.6 279.7C487.9 281.0 487.4 282.4 487.3 283.9C487.2 286.5 486.0 289.5 486.4 291.5C487.9 297.7 496.1 316.6 503.0 317.6C505.6 317.9 524.8 306.8 527.5 304.5C533.6 299.5 544.1 275.8 551.2 274.3C560.1 272.3 572.4 304.3 589.1 304.9C599.9 305.3 611.8 287.9 607.4 277.7Z M309.7 186.9C308.4 183.9 307.0 180.2 305.5 175.5C303.4 168.9 299.4 165.3 295.0 166.0C285.6 167.4 279.5 181.6 272.4 187.4C257.0 200.0 234.4 247.5 226.9 275.2C221.0 296.8 200.8 316.2 208.8 337.2C221.7 371.0 251.3 315.3 264.3 300.2C272.2 291.2 280.9 285.4 288.6 275.9C293.2 270.3 302.8 249.3 306.8 249.4C307.5 249.5 307.3 249.4 307.4 248.9C310.5 233.2 311.5 216.5 312.0 199.9C312.2 195.1 311.4 190.5 309.7 186.9Z M283.7 306.9L300.1 307.8C310.1 313.9 334.8 388.8 332.1 430.4C330.0 464.1 326.0 497.6 324.0 512.1C313.9 583.7 302.4 564.6 264.3 612.1C249.1 631.1 234.2 619.8 227.9 597.0C224.5 584.9 220.7 569.3 229.9 560.5C279.0 513.5 282.1 489.5 286.0 446.0C288.3 420.1 260.8 344.3 270.5 315.4C272.3 310.0 277.7 306.5 283.7 306.9Z M441.7 395.4C441.7 418.2 442.9 440.9 440.5 463.7C438.4 482.7 430.5 530.9 425.1 548.1C422.5 556.6 412.0 579.5 402.3 576.5C381.3 553.8 388.6 516.7 390.2 486.6C391.3 465.6 392.5 436.6 396.5 415.8C401.9 387.5 420.9 398.8 441.7 395.4Z M692.3 270.7C698.8 271.9 707.5 270.0 713.6 272.2C714.8 272.7 749.5 303.3 750.1 304.5C752.2 308.4 750.9 312.4 748.9 315.9C748.0 317.4 736.3 331.4 735.4 331.9C723.0 338.3 670.2 304.2 678.9 285.3C666.7 283.7 657.2 292.9 651.0 301.9C640.3 303.7 622.3 275.5 622.2 265.7C622.0 257.4 628.2 244.5 630.2 235.7C632.1 227.0 632.2 205.8 639.1 199.4C652.7 186.6 681.2 196.4 691.6 209.6C694.6 213.3 694.7 218.5 697.4 221.4C700.0 224.3 706.7 225.1 708.5 228.3C715.5 240.8 687.1 264.7 692.3 270.7Z M490.0 209.4C492.7 214.7 472.6 239.4 467.7 244.1C459.8 251.7 419.9 283.2 411.4 285.8C400.9 289.0 382.8 286.7 372.4 282.9C362.7 279.2 339.5 257.9 348.4 246.8C351.6 243.0 410.2 225.6 420.4 222.0C442.1 214.3 467.3 193.6 490.0 209.4Z M418.6 319.5C428.1 319.8 456.0 326.2 457.3 337.0C458.5 347.8 431.2 367.8 421.5 372.0C408.3 365.7 369.9 351.3 379.0 332.5C382.2 325.7 410.5 319.2 418.6 319.5Z\"/></defs>\n<rect x=\"2\" y=\"2\" width=\"956\" height=\"1340\" rx=\"46\" fill=\"url(#pearl)\" stroke=\"#e7ecea\" stroke-width=\"4\"/><rect x=\"4\" y=\"4\" width=\"952\" height=\"1336\" rx=\"44\" fill=\"url(#rings)\"/>\n<g text-anchor=\"middle\" fill=\"#263e33\" font-family=\"serif\"><text x=\"480\" y=\"127\" font-size=\"53\" font-weight=\"700\">走傱日南｜電子活動章</text><text x=\"480\" y=\"196\" font-size=\"32\">在往返之間，認識日南。</text></g>\n<g transform=\"translate(173 266) scale(.615)\"><g transform=\"translate(2 5)\" fill=\"#99805e\"><use href=\"#mark\"/><circle cx=\"500\" cy=\"500\" r=\"470\" fill=\"none\" stroke=\"#99805e\" stroke-width=\"28\"/></g><use href=\"#mark\" fill=\"url(#gold)\"/><circle cx=\"500\" cy=\"500\" r=\"470\" fill=\"none\" stroke=\"url(#gold)\" stroke-width=\"28\"/></g>\n<g fill=\"#496355\" opacity=\".22\" font-family=\"sans-serif\" font-size=\"15\" letter-spacing=\"3\" text-anchor=\"middle\"><text x=\"180\" y=\"341\" transform=\"rotate(-10 180 341)\">RINAN COMMONS</text><text x=\"800\" y=\"740\" transform=\"rotate(-10 800 740)\">RINAN COMMONS</text><text id=\"owner-mark\" x=\"498\" y=\"722\" font-size=\"18\" letter-spacing=\"1.5\" transform=\"rotate(-13 498 722)\"></text></g>\n<text x=\"480\" y=\"915\" text-anchor=\"middle\" fill=\"#375247\" font-size=\"31\" font-family=\"serif\">一起看見日南的鐵路、人物、植物與書架</text>\n<rect x=\"48\" y=\"960\" width=\"864\" height=\"328\" rx=\"26\" fill=\"#fffaf4\" fill-opacity=\".9\" stroke=\"#bac6bd\" stroke-width=\"2\"/>\n<g fill=\"#263e33\" font-family=\"sans-serif\"><text x=\"92\" y=\"1023\" font-size=\"36\" font-weight=\"700\">日南稻站線上小測驗｜八題全對</text><text x=\"92\" y=\"1084\" font-size=\"33\" fill=\"#7b5731\" font-weight=\"700\">可兌換一枚實體活動章</text><text x=\"92\" y=\"1133\" font-size=\"26\">請出示 LINE 動態碼，由工作人員現場核銷。</text><text x=\"92\" y=\"1174\" font-size=\"25\">紀念用｜非實體章兌換憑證</text><path d=\"M92 1201h774\" stroke=\"#afbbaf\"/><text id=\"serial\" x=\"92\" y=\"1252\" font-size=\"25\">活動章編號｜預覽未核發</text><text id=\"date\" x=\"525\" y=\"1252\" font-size=\"25\"></text></g></svg>\n</div></div></div><nav><button id=\"motion\" class=\"secondary\" aria-pressed=\"false\">暫停動態</button><button id=\"save\" disabled>儲存靜態 PNG</button><button id=\"share\" hidden>分享圖片</button></nav><p class=\"note\" id=\"status\" role=\"status\"></p><div id=\"fallback\"></div></main>\n";
export function showPreview(container){return mount(container,null)}
// Normalized planar projection, shared by CSS and PNG. Left edge is nearer;
// right edge recedes. The inset keeps all four corners inside the frame.
const pose={a:.999,b:.027,c:.056,d:.073,e:.968,f:.030,g:.130,h:.035};
function cssPose(w,h){
  const p=pose;
  return 'matrix3d('+[p.a,p.d*h/w,0,p.g/w,p.b*w/h,p.e,0,p.h/h,0,0,1,0,p.c*w,p.f*h,0,1].join(',')+')';
}
const finishStyle=`
.stage .card{transform-origin:0 0;transform:var(--pose);animation:none;box-shadow:0 5px 11px #020d0838}
.stage .tilt{animation:drift 8s ease-in-out infinite alternate}
.stage[data-point] .tilt,.stage[data-still] .tilt{animation:none}
.stage .card:after{display:none}
.foil-ribbon{animation:glint 5.8s ease-in-out -2.6s infinite alternate}
.stage[data-point] .foil-ribbon{animation:none;transform:translate(var(--glint-x,0%),var(--glint-y,0%))}
.pearl-mote{transform-box:fill-box;transform-origin:center;animation:floatLight 4.8s ease-in-out var(--phase,0s) infinite alternate}
.stage[data-still] .foil-ribbon{display:none}
.stage[data-still] .pearl-mote{animation:none}
@keyframes drift{from{transform:rotateY(-2deg) rotateX(1deg)}to{transform:rotateY(2deg) rotateX(-1deg)}}
@keyframes glint{from{transform:translate(-46%,18%)}to{transform:translate(46%,-18%)}}
@keyframes floatLight{from{transform:translate(-.45px,.72px) scale(.74);opacity:.4}to{transform:translate(.64px,-.8px) scale(1.12);opacity:1}}
@media(prefers-reduced-motion:reduce){.stage .tilt,.foil-ribbon,.pearl-mote{animation:none}}
`;
function projectPNG(img){
  const w=960,h=1344, canvas=document.createElement('canvas');
  canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  ctx.drawImage(img,0,0,w,h);
  const src=ctx.getImageData(0,0,w,h).data, layer=ctx.createImageData(w,h),dst=layer.data;
  const {a,b,c,d,e,f,g,h:k}=pose;
  // Inverse project the destination pixel centres; bilinear sampling keeps
  // serial/date text smooth, without the seams of a tiled triangle mesh.
  for(let j=0;j<h;j++){
    const y=(j+.5)/h,D=d-y*g,E=e-y*k,F=y-f;
    for(let i=0;i<w;i++){
      const x=(i+.5)/w,A=a-x*g,B=b-x*k,C=x-c,det=A*E-B*D;
      const u=(C*E-B*F)/det,v=(A*F-C*D)/det;
      if(u<0||u>=1||v<0||v>=1)continue;
      const sx=Math.max(0,Math.min(w-1.001,u*w-.5)),sy=Math.max(0,Math.min(h-1.001,v*h-.5));
      const ix=Math.floor(sx),iy=Math.floor(sy),dx=sx-ix,dy=sy-iy,p=(iy*w+ix)*4,q=(j*w+i)*4;
      for(let z=0;z<4;z++)dst[q+z]=(1-dy)*((1-dx)*src[p+z]+dx*src[p+4+z])+dy*((1-dx)*src[p+4*w+z]+dx*src[p+4*w+4+z]);
    }
  }
  const sheet=document.createElement('canvas');sheet.width=w;sheet.height=h;sheet.getContext('2d').putImageData(layer,0,0);
  ctx.fillStyle='#14201b';ctx.fillRect(0,0,w,h);ctx.shadowOffsetY=9;ctx.shadowBlur=18;ctx.shadowColor='#08130c66';ctx.drawImage(sheet,0,0);
  return canvas;
}
export function renderSouvenir(container,serial){
  if(typeof serial!=='string'||!/^RC-\d{6,}$/.test(serial))throw Error('尚未取得 LINE 活動章編號。');
  return mount(container,serial);
}
async function mount(container,serial){
const host=document.createElement('div'),root=host.attachShadow({mode:'open'});root.innerHTML=markup;container.replaceChildren(host);
const life=new AbortController();
const style=document.createElement('style');style.textContent=finishStyle;root.append(style);
const plane=root.querySelector('.card'),tilt=root.querySelector('.tilt');
function sizePose(){const w=tilt.clientWidth;if(w)plane.style.setProperty('--pose',cssPose(w,w*1.4))}
sizePose();const ro=new ResizeObserver(sizePose);ro.observe(tilt);life.signal.addEventListener('abort',()=>ro.disconnect(),{once:true});
// All foil is inline SVG: pigment, white nacre, streaks and flecks are below
// the type, emblem and ticket. The static export uses the same printed layers.
const face=root.getElementById('face'),defs=face.querySelector('defs');
function node(tag,attrs,parent){const n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);if(parent)parent.append(n);return n}
function gradient(tag,id,coords,stops){const g=node(tag,{id,...coords},defs);for(const [offset,color,opacity=1] of stops)node('stop',{offset,'stop-color':color,'stop-opacity':opacity},g)}
const rings=face.querySelector('rect[fill="url(#rings)"]'),field=node('g',{'aria-hidden':'true'});rings.before(field);
const clip=node('clipPath',{id:'foil-edge'},defs);node('rect',{x:4,y:4,width:952,height:1336,rx:44},clip);
field.setAttribute('clip-path','url(#foil-edge)');
for(const [id,cx,cy,r,color,peak] of [
 ['lagoon','.03','.22','.76','#51bcea','.89'],['rose','.98','.35','.68','#ff8fbd','.82'],
 ['ice','.13','.83','.50','#82c8fb','.85'],['shell','.57','.47','.37','#fffdf7','.96']
]){
 gradient('radialGradient',id,{cx,cy,r},[[0,color,peak],[.49,color,Number(peak)*.66],[1,color,0]]);
 node('rect',{width:960,height:1344,fill:'url(#'+id+')'},field);
}
const axis={gradientUnits:'userSpaceOnUse',x1:0,y1:1050,x2:960,y2:180};
gradient('linearGradient','printed-glint',axis,[[0,'#fff',0],[.27,'#a7d6ff',0],[.38,'#bdeaff',.46],[.46,'#fff',.83],[.51,'#fffcf1',.61],[.58,'#ffbbdf',.48],[.74,'#ffd8ec',0],[1,'#fff',0]]);
node('rect',{width:960,height:1344,fill:'url(#printed-glint)'},field);
gradient('linearGradient','floating-glint',axis,[[.30,'#80cfff',0],[.39,'#8cd4ff',.54],[.47,'#fff',.87],[.485,'#fff',.97],[.525,'#fff',.50],[.59,'#ffb2de',.64],[.70,'#ffcaec',0]]);
node('rect',{class:'foil-ribbon','data-live-only':'',x:-960,y:-1344,width:2880,height:4032,fill:'url(#floating-glint)'},field);
gradient('radialGradient','mote-bloom',{},[[0,'#fff',.96],[.26,'#fff',.62],[1,'#f5fcff',0]]);
const motes=node('g',{'aria-hidden':'true'});rings.after(motes);
for(const [x,y,size,delay] of [[135,258,13,-1],[782,258,9,-3],[851,462,14,-2],[105,656,11,-4],[776,832,12,-.5]]){
 const anchor=node('g',{transform:'translate('+x+' '+y+') scale('+size+')'},motes);
 const star=node('g',{class:'pearl-mote',style:'--phase:'+delay+'s'},anchor);
 // Animate in local star units, not in multiples of the outer scale.
 node('circle',{r:2.45,fill:'url(#mote-bloom)'},star);
 node('path',{d:'M0 -1.4 Q.13 -.17 .93 0 Q.13 .17 0 1.4 Q-.13 .17 -.93 0 Q-.13 -.17 0 -1.4Z',fill:'#fff'},star);
}

const el=id=>root.getElementById(id),stage=el('stage'),motion=el('motion'),reduce=matchMedia('(prefers-reduced-motion: reduce)');let paused=false;
function sync(){const still=paused||reduce.matches;stage.toggleAttribute('data-still',still);motion.disabled=reduce.matches;motion.textContent=still?'動態已暫停':'暫停動態';if(paused&&!reduce.matches)motion.textContent='播放動態';motion.setAttribute('aria-pressed',String(still))}
motion.onclick=()=>{paused=!paused;sync()};reduce.addEventListener?.('change',sync,{signal:life.signal});sync();
function reset(){delete stage.dataset.point;for(const k of ['--rx','--ry','--x','--y'])stage.style.removeProperty(k)}
stage.onpointermove=stage.onpointerdown=e=>{if(paused||reduce.matches)return;const r=stage.getBoundingClientRect(),x=Math.min(1,Math.max(0,(e.clientX-r.left)/r.width)),y=Math.min(1,Math.max(0,(e.clientY-r.top)/r.height));stage.dataset.point='';for(const [k,v] of Object.entries({'--rx':(.5-y)*6+'deg','--ry':(x-.5)*8+'deg','--glint-x':(x-.5)*42+'%','--glint-y':(y-.5)*28+'%'}))stage.style.setProperty(k,v)};
stage.onpointercancel=stage.onpointerleave=reset;stage.onpointerup=e=>{if(e.pointerType!=='mouse')reset()};
const date=new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());el('date').textContent='製圖日期｜'+date;
// No claim is minted by this standalone preview. Production supplies the verified claim, never a URL serial.
async function makePNG(){const svg=el('face').cloneNode(true);svg.querySelectorAll('[data-live-only]').forEach(n=>n.remove());const img=new Image(),src=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml;charset=utf-8'}));try{img.src=src;await img.decode();const c=projectPNG(img);return await new Promise((ok,no)=>c.toBlob(b=>b?ok(b):no(Error('PNG')),'image/png'))}finally{URL.revokeObjectURL(src)}}

if(serial){el('serial').textContent='活動章編號｜'+serial;el('owner-mark').textContent='RINAN COMMONS · '+serial}
el('status').textContent=serial?'這是你的電子活動章。儲存或分享圖片不會核銷。':'這是無編號預覽，並非已領取的電子活動章。';
let url;const blob=await makePNG();url=URL.createObjectURL(blob);
const filename='走傱日南_電子活動章_'+(serial||'預覽')+'.png';
const save=el('save');save.disabled=false;
save.onclick=()=>{const a=document.createElement('a');a.href=url;a.download=filename;root.append(a);a.click();a.remove();const img=new Image();img.src=url;img.alt='可長按儲存的靜態電子活動章';el('fallback').replaceChildren(img);el('status').textContent='如果未出現下載提示，請長按下方靜態圖儲存。'};
if(typeof File==='function'&&navigator.canShare){const files=[new File([blob],filename,{type:'image/png'})];if(navigator.canShare({files})){const share=el('share');share.hidden=false;share.onclick=()=>navigator.share({files}).catch(e=>{if(e.name!=='AbortError')el('status').textContent='請使用「儲存靜態 PNG」。'})}}
window.addEventListener('pagehide',e=>{if(!e.persisted){life.abort();URL.revokeObjectURL(url)}},{signal:life.signal});
}
