import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import test from 'node:test';
const root = fileURLToPath(new URL('../out/', import.meta.url));
function walk(dir) { return readdirSync(dir).flatMap(name => { const f=path.join(dir,name); return statSync(f).isDirectory()?walk(f):[f]; }); }
const htmlFiles = walk(root).filter(f=>f.endsWith('.html') && !f.endsWith('404.html') && !f.includes('_not-found') && !f.includes(`${path.sep}maps${path.sep}`) && !f.includes(`${path.sep}404${path.sep}`));
test('all sixteen public and preview routes export headings, main content and indexable metadata', () => {
  assert.equal(htmlFiles.length, 16);
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
  assert.match(home, /報名已截止/);
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
    assert.match(html, /生命・文化的走傱/);
    assert.match(html, /報名已截止/);
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
    assert.equal((renderedMain.match(/data-vendor-number=/g) || []).length, 23);
    for (const text of ['御鼎饌廚房', '原豆粹食 GOOD SOYFOOD', '采點雞蛋糕', '睿阿嬤-純米手作']) assert.ok(html.includes(text), text);
    assert.doesNotMatch(html, /現場品項|更多品項|豆奶烏龍飲 60 元|爆米花 150 元|待補|攤商確認中|烤花椒香腸|御頂饌廚房|原味豆腐|慈德路口雞蛋糕|范媽媽客家美食傳統|\[品項待補\]|\[內容待補\]/);
    const pairs = [...renderedMain.matchAll(/data-vendor-number="(\d{2})"[\s\S]*?<h3>([^<]+)<\/h3>/g)].map(m => [m[1], m[2]]);
    assert.deepEqual(pairs.map(p => p[0]), Array.from({length:23}, (_, i) => String(i + 1).padStart(2, '0')));
    for (const pair of [['02','善群農莊'], ['05','東room藝術工作室'], ['06','LOPIA X 乾杯集団'], ['09','采點雞蛋糕'], ['11','小胖稻草芋頭'], ['14','茶御品'], ['19','原豆粹食 GOOD SOYFOOD'], ['23','謝家米食']]) assert.ok(pairs.some(p => p[0] === pair[0] && p[1] === pair[1]), pair.join(':'));
    assert.match(renderedMain, /motion2026-market-map-20261023.png/);
    assert.doesNotMatch(renderedMain, /越南攤位|幸福里謝家米食|宮崎縣人會｜遊戲/);
    for (const privateValue of ['0931657945', '0972315700', 'owen657945', 'backcountry', 'BMF-1370', 'BRP-9202', '押金匯款', '現場負責人行動電話']) assert.ok(!html.includes(privateValue), privateValue);
  }
  assert.match(event, /href="\/rinan-commons\/motion2026\/market\/"/);
  assert.match(sitemap, /https:\/\/www.rinancommons.com\/motion2026\/market\//);
  assert.doesNotMatch(sitemap, /market-preview/);
  assert.match(market, /name="robots" content="index, follow"/);
  assert.match(preview, /name="robots" content="noindex, nofollow"/);
});

test('entry media wires the two approved videos and keeps one visible player at a time', () => {
  const layout = readFileSync(fileURLToPath(new URL('../app/layout.tsx', import.meta.url)), 'utf8');
  const media = readFileSync(fileURLToPath(new URL('../app/entry-media.tsx', import.meta.url)), 'utf8');
  const styles = readFileSync(fileURLToPath(new URL('../app/entry-media.css', import.meta.url)), 'utf8');
  assert.match(layout, /<EntryMedia\s*\/>/);
  assert.match(media, /filmId = "_ydtsZWwZJk"/);
  assert.match(media, /songId = "UjBET5cz8gE"/);
  assert.match(media, /sessionStorage\.setItem\(seenKey/);
  assert.match(media, /mute=\$\{view === "film" \? "1" : "0"\}/);
  assert.equal((media.match(/<iframe\b/g) ?? []).length, 1);
  assert.match(styles, /\.entry-media-screen iframe\{display:block/);
  assert.match(styles, /height:clamp\(200px/);
});
