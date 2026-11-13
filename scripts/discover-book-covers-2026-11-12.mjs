import fs from 'node:fs';

const books = [
  [72,'蓬山八社巡禮：大甲城：道卡斯族','',''],
  [73,'媽祖遶醮','',''],
  [74,'微笑台灣 2026 秋季號：暗光鳥的夜遊計畫','天下雜誌','天下雜誌'],
  [75,'日南火車站百年歲月','臺中市大甲區公所','臺中市大甲區公所'],
  [76,'走在日南社雙寮社','臺中市大甲區公所','臺中市大甲區公所'],
  [77,'大甲文昌祠 甲辰醮','臺中市大甲區公所','臺中市大甲區公所'],
  [78,'文訊雜誌 400 期：一頁知年','文訊雜誌社','文訊雜誌社'],
  [79,'臺灣源流 108、109 期','臺灣省姓氏研究學會','臺灣省姓氏研究學會'],
  [80,'BE A DOER 第一本都市行動指南：如何從社區開始實踐','','田園城市'],
  [81,'你想活出怎樣的小鎮？','何培鈞、楊麗玲','天下文化'],
  [82,'新文化苦旅','余秋雨','爾雅'],
  [83,'如何閱讀一本書','艾德勒、范多倫','臺灣商務'],
  [84,'最高學習法','傑瑞德．庫尼．霍維斯','大田'],
  [85,'隱性潛能','亞當．格蘭特','平安文化'],
  [86,'競合策略','布蘭登伯格、奈勒波夫','雲夢千里'],
  [87,'記得你是誰','黛西．魏德蔓','天下雜誌'],
  [88,'為什麼我們這樣生活，那樣工作？','查爾斯．杜希格','大塊文化'],
  [89,'這輩子，你想做什麼？','波．布朗森','早安財經'],
  [90,'每天最重要的2小時','喬許．戴維斯','大塊文化'],
  [91,'再忙也不會出錯的完美工作執行力','','樂金文化'],
  [92,'好事即將發生','亞伯拉罕．J．托爾斯基、查爾斯．舒茲','圓神'],
  [93,'生活是無以名狀的碎片','不朽','皇冠'],
  [94,'安好誌','白安','圓神'],
  [95,'大概是時間在煮我吧','張西','三采'],
  [96,'靜靜的山','王靜','時報出版'],
  [97,'學會愛人的100堂課','伊芙 Evelyn','皇冠'],
  [98,'喀布爾的書商。和他的女人','奧斯娜．塞厄斯塔','網路與書'],
  [99,'龍紋身的女孩','史迪格．拉森','寂寞'],
  [100,'勇者帕尼泊','',''],
  [101,'布魯克林孤兒','強納森．列瑟','春天出版'],
  [102,'寄生上流：原著劇本','奉俊昊、韓珍元','寫樂文化'],
  [103,'大騙局','丹．布朗','時報出版'],
  [104,'百年孤寂','馬奎斯','皇冠'],
  [105,'異鄉人','卡繆','麥田'],
  [106,'過於喧囂的孤獨','赫拉巴爾','大塊文化'],
  [107,'白馬走過天亮','言叔夏','九歌'],
  [108,'最完美的遺憾','艾琳．古吉','春天出版'],
  [109,'一本你希望父母讀過的書','菲莉帕．派瑞','木馬文化'],
  [110,'寫作，是最好的自我投資','陳立飛','遠流'],
  [111,'重回大地：薩爾加多的凝視','薩爾加多、伊莎貝爾．馮克','衛城'],
  [112,'論攝影','蘇珊．桑塔格','麥田'],
  [113,'歌仔戲表演型態研究','林茂賢','前衛'],
  [114,'山頂的厝：台語詩選','李瓜',''],
  [115,'酒蜜100','韓滿',''],
  [116,'寶島素描簿','陳義仁','草根'],
];

const strip = s => s.replace(/<[^>]+>/g,' ').replace(/&[^;]+;/g,' ').replace(/\s+/g,' ').trim();
const norm = s => s.normalize('NFKC').replace(/[\s：:：。．・，,？！?（）()\-—_]/g,'').toLowerCase();
for (const [n,title,author,pub] of books) {
  const q = encodeURIComponent(title.split('：')[0]);
  const html = await (await fetch(`https://www.sanmin.com.tw/search?ct=k&ls=sd&qu=${q}`, {headers:{'user-agent':'Mozilla/5.0'}})).text();
  const products = [...html.matchAll(/<div[^>]*class="sProduct"[^>]*>[\s\S]*?(?=<div[^>]*class="sProduct"|<div class="pagination|$)/g)].map(m=>{
    const part=m[0];
    const name=strip((part.match(/<h3[^>]*>([\s\S]*?)<\/h3>/)||[])[1]||'');
    const path=(part.match(/href="(\/product\/index\/\d+)"/)||[])[1]||'';
    const image=(part.match(/data-src="([^"]*product_images[^"]+)"/)||[])[1]||'';
    const text=strip(part);
    let score=0; const nt=norm(title),nn=norm(name);
    if (nn===nt) score+=100;
    if (nn.includes(nt)||nt.includes(nn)) score+=55;
    for (const tok of norm(title).match(/.{2,6}/g)||[]) if(nn.includes(tok)) score+=3;
    if(author && norm(text).includes(norm(author.split(/[、；]/)[0]))) score+=15;
    if(pub && norm(text).includes(norm(pub.replace('出版','')))) score+=8;
    return {name,page:path?`https://www.sanmin.com.tw${path}`:'',image,text:text.slice(0,260),score};
  }).filter(x=>x.name&&x.page).sort((a,b)=>b.score-a.score).slice(0,5);
  console.log(JSON.stringify({n,title,candidates:products}));
  await new Promise(r=>setTimeout(r,180));
}
