import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import test from 'node:test';
const root = fileURLToPath(new URL('../out/', import.meta.url));
function walk(dir) { return readdirSync(dir).flatMap(name => { const f=path.join(dir,name); return statSync(f).isDirectory()?walk(f):[f]; }); }
const htmlFiles = walk(root).filter(f=>f.endsWith('.html') && !f.endsWith('404.html') && !f.includes('_not-found') && !f.includes(`${path.sep}maps${path.sep}`) && !f.includes(`${path.sep}404${path.sep}`));
test('all seventeen public and preview routes export headings, main content and indexable metadata', () => {
  assert.equal(htmlFiles.length, 17);
  for (const file of htmlFiles) {
    const html=readFileSync(file,'utf8');
    assert.equal((html.match(/<h1[\s>]/g)||[]).length, 1, file);
    assert.match(html, /id="content"/);
    // 預覽頁不被搜尋引擎收錄，其餘公開頁維持可收錄
    if (file.includes(`${path.sep}market-preview${path.sep}`)) assert.match(html, /name="robots" content="noindex, nofollow"/);
    else assert.match(html, /name="robots" content="index, follow"/);
    assert.doesNotMatch(html, /從一粒米出發/);
    assert.doesNotMatch(html, /中山路二段\s*1\s*號對面/, file);
  }
});
test('copyright notice and working footer links appear on all published pages', () => {
  const notice = readFileSync(path.join(root, 'copyright/index.html'), 'utf8');
  const sitemap = readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8');
    assert.match(html, /href="\/rinan-commons\/copyright\/"[^>]*>版權聲明<\/a>/, file);
    assert.match(html, /href="\/rinan-commons\/"[^>]*>日南稻站 Rinan Commons<\/a>/, file);
    assert.match(html, /保留所有權利/, file);
  }
  const map = readFileSync(path.join(root, 'maps/index.html'), 'utf8');
  assert.match(map, /https:\/\/www\.rinancommons\.com\/copyright\//);
  assert.match(sitemap, /https:\/\/www\.rinancommons\.com\/copyright\//);
  for (const phrase of ['本網站所刊載之文字、照片、影像、插圖、地圖、版面設計與標誌', '權利歸原權利人所有', '未經書面同意', '新聞報導、教學、評論', '活動資訊以官方公告為準', '最後更新：2026 年 10 月']) assert.ok(notice.includes(phrase), phrase);
  assert.match(notice, /href="mailto:rinancommons@gmail\.com"/);
});
test('internal links and images resolve inside the GitHub Pages base path', () => {
  for (const file of htmlFiles) {
    const html=readFileSync(file,'utf8');
    for (const match of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
      const url = match[1];
      assert.ok(url.startsWith('/rinan-commons/'), `${file}: missing basePath: ${url}`);
      const relative = decodeURIComponent(url.slice('/rinan-commons/'.length));
      const target=path.join(root,relative);
      assert.ok(existsSync(target) || existsSync(path.join(target,'index.html')), `${file}: missing asset or route: ${url}`);
    }
    for (const match of html.matchAll(/href="#([^"]+)"/g)) assert.ok(html.includes(`id="${match[1]}"`), `${file}: broken anchor: ${match[1]}`);
  }
});
test('unpublished vendor names do not leak through static HTML or browser bundles', () => {
  for (const file of walk(root).filter(f=>/\.(html|js|txt|json)$/.test(f))) {
    const text=readFileSync(file,'utf8');
    assert.doesNotMatch(text, /3Ｑ米食|東明國小家長會長推薦攤位/, file);
  }
});

test('approved homepage and about review stays linked and keeps planned services distinct', () => {
  const home = readFileSync(path.join(root, 'index.html'), 'utf8');
  const about = readFileSync(path.join(root, 'about/index.html'), 'utf8');
  const visit = readFileSync(path.join(root, 'visit/index.html'), 'utf8');
  assert.match(home, /車站旁，一個可以停下來休息的地方。/);
  assert.match(home, /href="\/rinan-commons\/about\/#place"/);
  assert.match(home, /href="\/rinan-commons\/explore\/"/);
  assert.match(home, /最新活動公告/);
  assert.match(home, /10\.31/);
  assert.match(home, /437 臺中市大甲區孟春里中山路二段 6 號/);
  assert.match(home, /commons-exterior-1200\.webp/);
  assert.match(home, /日南稻站外側/);
  assert.doesNotMatch(home, /日南車站｜日常往返的地方/);
  assert.match(about, /id="place"/);
  assert.match(about, /commons-interior-1200\.webp/);
  assert.match(about, /日南稻站室內/);
  assert.doesNotMatch(about, /影像來源：臺中市文化資產處/);
  assert.match(about, /活動限定／預約合作/);
  assert.match(about, /實際開放項目、時間及使用方式/);
  assert.match(visit, /437 臺中市大甲區孟春里中山路二段 6 號/);
});

test('both event addresses render one shared page and exhibition has no PDF button', () => {
  const motion = readFileSync(path.join(root, 'motion2026/index.html'), 'utf8');
  const legacy = readFileSync(path.join(root, 'walk/2026/index.html'), 'utf8');
  const exhibit = readFileSync(path.join(root, 'exhibition/to-and-from/index.html'), 'utf8');
  const content = html => html.slice(html.indexOf('<main class="event-page"'), html.indexOf('</main>') + 7);
  assert.equal(content(motion), content(legacy));
  for (const html of [motion, legacy]) {
    assert.match(html, /返回日南稻站首頁/);
    assert.match(html, /437 臺中市大甲區孟春里中山路二段 6 號/);
    assert.match(html, /開幕系列活動/);
    assert.match(html, /音樂演出・走傱市集/);
    assert.match(html, /10\.31/);
    assert.doesNotMatch(html, /報名連結準備中|1 號對面/);
  }
  assert.match(exhibit, /植物落回土地/);
  assert.match(exhibit, /稻作與植物/);
  assert.doesNotMatch(exhibit, /開啟 PDF|rinancommons\.s\.gy\/pdf/);
});

test('published market is discoverable and retains the corrected vendor information', () => {
  const market = readFileSync(path.join(root, 'motion2026/market/index.html'), 'utf8');
  const preview = readFileSync(path.join(root, 'motion2026/market-preview/index.html'), 'utf8');
  const event = readFileSync(path.join(root, 'motion2026/index.html'), 'utf8');
  const sitemap = readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  for (const html of [market, preview]) {
    const renderedMain = html.slice(html.indexOf('<main class="market-page"'), html.indexOf("</main>"));
    assert.equal((renderedMain.match(/data-vendor-number=/g) || []).length, 20);
    for (const text of ['御鼎饌廚房', '原豆粹食 GOOD SOYFOOD', '采點雞蛋糕', '睿阿嬤-純米手作']) assert.ok(html.includes(text), text);
    assert.doesNotMatch(html, /現場品項|更多品項|豆奶烏龍飲 60 元|爆米花 150 元|待補|攤商確認中|烤花椒香腸|御頂饌廚房|原味豆腐|慈德路口雞蛋糕|范媽媽客家美食傳統|\[品項待補\]|\[內容待補\]/);
    const pairs = [...renderedMain.matchAll(/data-vendor-number="(\d{2})"[\s\S]*?<h3>([^<]+)<\/h3>/g)].map(m => [m[1], m[2]]);
    assert.deepEqual(pairs.map(p => p[0]), Array.from({length:20}, (_, i) => String(i + 1).padStart(2, '0')));
    for (const pair of [['01','華山基金會大甲站'], ['02','Snowfat 肥雪工作室'], ['04','善群農莊'], ['07','小島青鳥'], ['09','原豆粹食 GOOD SOYFOOD'], ['14','日南來心肉共生廚房 × 崩八食堂'], ['18','旺定巷1號'], ['19','水蛙刺青甘草芭樂'], ['20','台灣宮崎縣人會 いっちゃが会']]) assert.ok(pairs.some(p => p[0] === pair[0] && p[1] === pair[1]), pair.join(':'));
    assert.doesNotMatch(renderedMain, /motion2026-market-map|入口服務區|主動線南側|東側直列/);
    for (const text of ['https://www.facebook.com/SugrMan', 'https://www.facebook.com/profile.php?id=100063936458121', '台農2號土鳳梨', '騷莎雞肉酪梨鹹派', '肉桂酪梨奶油檸檬派', 'id="vendor-story-07"', 'id="vendor-story-18"']) assert.ok(renderedMain.includes(text), text);
    for (const highlight of ['限定似顏繪', '粉漿蛋餅', '九種口味雪花冰', '姊妹站宮崎日南推廣']) assert.ok(renderedMain.includes(highlight), highlight);
    assert.doesNotMatch(renderedMain, /越南攤位|幸福里謝家米食|宮崎縣人會｜遊戲|東room藝術工作室|LOPIA X 乾杯集団|日南レモン|茶御品|米佐狀元糕|謝家米食/);
    assert.doesNotMatch(renderedMain, /09\d{2}(?:[- ]?\d{3}){2}|現場負責人行動電話|現場主要負責人姓名|押金匯款後五碼|進場卸貨車輛登記/);
  }
  assert.match(event, /href="\/rinan-commons\/motion2026\/market\/"/);
  assert.match(sitemap, /https:\/\/www.rinancommons.com\/motion2026\/market\//);
  assert.doesNotMatch(sitemap, /market-preview/);
  assert.match(market, /name="robots" content="index, follow"/);
  assert.match(preview, /name="robots" content="noindex, nofollow"/);
});

test('mobile menu leads with event, market and transport; desktop keeps them on the right', () => {
  const home = readFileSync(path.join(root, 'index.html'), 'utf8');
  const desktop = home.match(/<nav class="site-navigation"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
  const mobile = home.match(/<nav aria-label="手機網站導覽">([\s\S]*?)<\/nav>/)?.[1];
  assert.ok(desktop && mobile);
  const links = nav => [...nav.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(links(desktop).slice(-3), ['/rinan-commons/motion2026/', '/rinan-commons/motion2026/market/', '/rinan-commons/visit/']);
  assert.deepEqual(links(mobile).slice(0, 3), ['/rinan-commons/motion2026/', '/rinan-commons/motion2026/market/', '/rinan-commons/visit/']);
  assert.deepEqual(links(mobile).slice(-2), ['/rinan-commons/explore/', '/rinan-commons/plants/']);
});

test('people stories lead the home journal and the full journal, with covers', () => {
  const home = readFileSync(path.join(root, 'index.html'), 'utf8');
  const journal = readFileSync(path.join(root, 'stories/index.html'), 'utf8');
  const homeStories = home.slice(home.indexOf('class="story-teasers"'), home.indexOf('class="visit-invitation"'));
  const journalStories = journal.slice(journal.indexOf('class="journal-results"'), journal.indexOf('class="empty-results"'));
  for (const section of [homeStories, journalStories]) {
    assert.ok(section.indexOf('走傱的日南人 1') < section.indexOf('日南稻站：打開車站旁的舊營房'));
    assert.ok(section.indexOf('走傱的日南人 2') < section.indexOf('日南稻站：打開車站旁的舊營房'));
    assert.ok(section.indexOf('走傱的日南人 3') < section.indexOf('日南稻站：打開車站旁的舊營房'));
  }
  assert.ok(homeStories.indexOf('走傱的日南人 1') > homeStories.indexOf('<picture>'));
  assert.ok(journal.indexOf('人物故事</button>') < journal.indexOf('鐵道文史</button>'));
});


test('market schedule uses October 31 17:00–21:00 across public and preview pages', () => {
  for (const route of ['motion2026/market', 'motion2026/market-preview']) {
    const html = readFileSync(path.join(root, route, 'index.html'), 'utf8');
    assert.match(html, /10\/31（六）17:00–21:00/);
    assert.doesNotMatch(html, /21:30|尚待確認|新的日期及活動安排將另行公告/);
  }
  for (const route of ['motion2026', 'walk/2026']) {
    const html = readFileSync(path.join(root, route, 'index.html'), 'utf8');
    const panel = html.slice(html.indexOf('id="event-program"'), html.indexOf('id="registration"'));
    assert.match(panel, /aria-label="10月31日節目"/);
    assert.match(panel, /market-plan/);
    assert.doesNotMatch(panel, /10\/24・17:00|21:30/);
  }
  const source = readFileSync(new URL('../app/motion2026/event-site.tsx', import.meta.url), 'utf8');
  const dayTwo = source.slice(source.indexOf('function DayTwo()'), source.indexOf('function LocalInfo()'));
  assert.match(dayTwo, /10\/31・17:00–21:00/);
  assert.match(dayTwo, /vendor-details/);
  assert.match(source, /10月31日節目/);
  assert.doesNotMatch(source, /10月24日節目|21:30/);
  const visit = readFileSync(path.join(root, 'visit/index.html'), 'utf8');
  assert.match(visit, /10\/31 晚間/);
  assert.doesNotMatch(visit, /10\/24 晚間|10\.24（六）/);
});
