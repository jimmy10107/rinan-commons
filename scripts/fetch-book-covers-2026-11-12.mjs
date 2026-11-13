import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const sharp = require('sharp');

const root = new URL('../', import.meta.url);
const outDir = new URL('../public/books/assets/covers/', import.meta.url);

const sanmin = {
  80:'015037686',81:'012898959',82:'000705728',83:'006110495',84:'007766503',85:'013444826',86:'005235345',87:'007761893',88:'003367795',89:'001615253',90:'009496341',91:'007581381',92:'012922761',93:'010694102',94:'011519920',95:'010234900',96:'005533155',97:'011524862',98:'000529647',99:'015591016',100:'000688219',101:'007379696',103:'015262666',104:'006652924',105:'015267763',106:'000747078',107:'015909589',108:'004266772',109:'007686790',110:'014844588',112:'010424405',113:'000485454',114:'011939456',115:'006378985',116:'005220306'
};

const local = {
  72:{title:'蓬山八社巡禮',sub:'大甲城・道卡斯族',page:'https://tcmb.culture.tw/zh-tw/detail?id=235886&indexCode=Culture_Place'},
  73:{title:'媽祖遶醮',sub:'地方信仰紀念冊',page:'https://www.culture.taichung.gov.tw/2061063/2098033/2606453'},
  74:{title:'微笑台灣 2026 秋季號',sub:'暗光鳥的夜遊計畫',page:'https://smiletaiwan.cw.com.tw/article/9428?from_id=4675&from_index=1',actual:true},
  75:{title:'日南火車站百年歲月',sub:'1922—2022',page:'https://www.taichung.gov.tw/2188268/post'},
  76:{title:'走在日南社．雙寮社',sub:'日南地區地名與地景故事',page:'https://www.culture.taichung.gov.tw/2061063/2098033/2188848'},
  77:{title:'大甲文昌祠',sub:'甲辰醮',page:'https://www.taichung.gov.tw/1391133/1391134/1391160/nodeCp?nodeId=2741067'},
  78:{title:'文訊雜誌 400期',sub:'一頁知年',page:'https://play.google.com/store/books/details?id=23uJDwAAQBAJ'},
  79:{title:'臺灣源流',sub:'108・109期',page:'https://surname.com.tw/profile-history.htm'}
};

const special = {
  102:{title:'寄生上流：原著劇本',page:'https://www.books.com.tw/products/0010847902',image:'https://im1.book.com.tw/image/getImage?i=https://www.books.com.tw/img/001/084/79/0010847902.jpg&w=600&h=880&fit=1'},
  111:{title:'重回大地：薩爾加多的凝視',page:'https://www.eslite.com/product/1001260912682029890008'}
};

const headers = {'user-agent':'Mozilla/5.0 (compatible; RinanCommonsBookCatalog/1.0)'};
const decode = s => s.replaceAll('&amp;','&').replaceAll('&#x2F;','/').replaceAll('&quot;','"');
async function html(url){const r=await fetch(url,{headers});if(!r.ok)throw new Error(`${r.status} ${url}`);return r.text();}
async function ogImage(url){const body=await html(url);const m=body.match(/<meta[^>]+(?:property|name)=["']og:image["'][^>]+content=["']([^"']+)/i)||body.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:image["']/i);return m?decode(m[1]):'';}
function esc(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));}
function wrap(s,max=8){const chars=[...s];const lines=[];while(chars.length)lines.push(chars.splice(0,max).join(''));return lines.slice(0,5);}
async function facsimile(n,{title,sub}){
  const palettes=[['#233b51','#d3b271'],['#79523d','#f0dfbe'],['#4d6c69','#e7d7a7'],['#614b70','#e2c18d']];
  const [bg,ink]=palettes[n%palettes.length];
  const titleLines=wrap(title,7); const subLines=wrap(sub||'',10);
  const titleText=titleLines.map((x,i)=>`<text x="150" y="${150+i*48}" text-anchor="middle" class="title">${esc(x)}</text>`).join('');
  const subText=subLines.map((x,i)=>`<text x="150" y="${385+i*25}" text-anchor="middle" class="sub">${esc(x)}</text>`).join('');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="440"><rect width="300" height="440" fill="${bg}"/><path d="M36 58h228M36 76h160M36 363h228" stroke="${ink}" opacity=".8"/><circle cx="248" cy="383" r="27" fill="none" stroke="${ink}"/><path d="M226 398c16-23 31-42 48-55M236 389c-2-15 3-29 14-41" fill="none" stroke="${ink}" stroke-width="3"/><style>.title{fill:#fffdf7;font:500 30px 'Noto Serif TC','Noto Sans CJK TC',serif;letter-spacing:2px}.sub{fill:${ink};font:500 17px 'Noto Sans CJK TC',sans-serif;letter-spacing:1px}.small{fill:${ink};font:12px sans-serif;letter-spacing:3px}</style>${titleText}${subText}<text x="38" y="413" class="small">RINAN LOCAL READING</text></svg>`;
  return Buffer.from(svg);
}

fs.mkdirSync(outDir,{recursive:true});
const sources=[];
for(let n=72;n<=116;n++){
  let page='',image='',title='',mode='actual';
  if(local[n]){({page,title}=local[n]);if(local[n].actual) image=await ogImage(page);else mode='catalog-facsimile';}
  else if(special[n]){({page,title,image}=special[n]);if(!image)image=await ogImage(page);}
  else {page=`https://www.sanmin.com.tw/product/index/${sanmin[n]}`;const body=await html(page);const m=body.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i)||body.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);image=m?decode(m[1]):'';const t=body.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i);title=t?decode(t[1]):`Book ${n}`;}
  let input;
  if(mode==='actual'&&image){const r=await fetch(image,{headers});if(!r.ok)throw new Error(`${r.status} cover ${n} ${image}`);input=Buffer.from(await r.arrayBuffer());}
  else input=await facsimile(n,local[n]);
  const file=path.join(outDir.pathname,String(n).padStart(3,'0')+'.webp');
  await sharp(input).resize(300,440,{fit:'inside',withoutEnlargement:false,background:'#f5f1e7'}).webp({quality:86}).toFile(file);
  sources.push({n,title,page,image:image||null,local:`/books/assets/covers/${String(n).padStart(3,'0')}.webp`,mode});
  console.log(n,title,mode);
}
fs.writeFileSync(new URL('../docs/book-cover-sources-2026-11-13.json',import.meta.url),JSON.stringify(sources,null,2)+'\n');
