// Preview and public market pages share this layout and the public-only vendor dataset.
import marketVendors from "../../../content/market-vendors.json";

type MarketVendor = typeof marketVendors[number];
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
function renderVendor(v: MarketVendor) {
  const name = escapeHtml(v.name);
  const intro = escapeHtml(v.intro);
  const story = v.intro.length > 160
    ? `<p class="market-vendor-intro">${escapeHtml(v.intro.split("。")[0])}。</p><details class="market-vendor-story"><summary>品牌故事</summary><p>${intro}</p></details>`
    : intro ? `<p class="market-vendor-intro">${intro}</p>` : "";
  const items = v.products.map(p => `<li>${escapeHtml(p)}</li>`);
  const products = items.length ? `<div class="market-vendor-products"><h4>現場品項</h4><ul>${items.slice(0, 6).join("")}</ul>${items.length > 6 ? `<details><summary>更多品項（共 ${items.length} 項）</summary><ul>${items.slice(6).join("")}</ul></details>` : ""}</div>` : "";
  const social = v.social && /^https:\/\/(www\.)?(facebook\.com|instagram\.com)\//.test(v.social)
    ? `<a class="market-vendor-social" href="${escapeHtml(v.social)}" target="_blank" rel="noopener noreferrer" aria-label="${name} 社群（另開新視窗）">${v.social.includes("instagram.com") ? "Instagram" : "Facebook"} ↗</a>`
    : v.socialLabel ? `<p class="market-vendor-social-label">${escapeHtml(v.socialLabel)}</p>` : "";
  return `<article class="market-vendor" id="vendor-${v.number}" data-vendor-number="${v.number}"><div class="market-vendor-top"><span class="market-vendor-number">${v.number}</span><span class="market-vendor-tag">${escapeHtml(v.label)}</span></div><h3>${name}</h3>${story}${products}${social}</article>`;
}
function renderVendorSection(id: string, title: string, group: MarketVendor[]) {
  return `<section id="${id}" class="market-directory-section"><div class="market-directory-heading"><h2>${title}</h2><span>${group.length} 攤</span></div><div class="market-directory-grid">${group.map(renderVendor).join("")}</div></section>`;
}
export const marketHtml = String.raw`<section id="content" style="background: #1E3B2C; color: #F7F4EC">
<div style="max-width: 1200px; margin: 0 auto; padding: 72px 24px 64px; display: flex; flex-direction: column; gap: 22px">
<div style="font-size: 16px; font-weight: 500; letter-spacing: 3px; color: #F2B544">走傱日南 2026・RINAN IN MOTION</div>
<h1 style="margin: 0; font-size: clamp(36px, 8vw, 72px); line-height: 1.15; font-weight: 900; letter-spacing: 8px">走傱市集</h1>
<p style="margin: 0; max-width: 640px; font-size: 18px; line-height: 1.7; color: #E4E9E1">${marketVendors.length} 個攤位、舞台演出、樹林區與宮崎交流，在日南車站旁走走、吃吃、逛逛。</p>
<div style="display: flex; flex-wrap: wrap; gap: 12px">
<div style="background: #284D3A; border-radius: 12px; padding: 14px 18px; display: flex; flex-direction: column; gap: 2px; min-width: 180px">
<span style="font-size: 13px; color: #C9D6CC">日期</span>
<span style="font-size: 18px; font-weight: 700">10/24（六）</span>
</div>
<div style="background: #284D3A; border-radius: 12px; padding: 14px 18px; display: flex; flex-direction: column; gap: 2px; min-width: 180px">
<span style="font-size: 13px; color: #C9D6CC">時間</span>
<span style="font-size: 18px; font-weight: 700">17:00–21:30</span>
</div>
<div style="background: #284D3A; border-radius: 12px; padding: 14px 18px; display: flex; flex-direction: column; gap: 2px; min-width: 180px">
<span style="font-size: 13px; color: #C9D6CC">地點</span>
<span style="font-size: 18px; font-weight: 700">日南車站旁廣場</span>
</div>
</div>
<div style="display: flex; flex-wrap: wrap; gap: 12px; margin-top: 6px">
<a href="#map" style="display: inline-flex; align-items: center; min-height: 48px; padding: 0 22px; border-radius: 999px; background: #F2B544; color: #2A1E05; font-size: 16px; font-weight: 700; text-decoration: none">看場地配置圖</a>
<a href="#food" style="display: inline-flex; align-items: center; min-height: 48px; padding: 0 22px; border-radius: 999px; border: 2px solid #F7F4EC; color: #F7F4EC; font-size: 16px; font-weight: 700; text-decoration: none; box-sizing: border-box">餐飲美食</a>
<a href="#stalls" style="display: inline-flex; align-items: center; min-height: 48px; padding: 0 22px; border-radius: 999px; border: 2px solid #F7F4EC; color: #F7F4EC; font-size: 16px; font-weight: 700; text-decoration: none; box-sizing: border-box">手作・農產・交流</a>
</div>
</div>
</section>

<section id="map">
<div style="max-width: 1200px; margin: 0 auto; padding: 64px 24px 24px; display: flex; flex-direction: column; gap: 18px">
<div style="display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 8px 24px">
<h2 style="margin: 0; font-size: 32px; font-weight: 900; color: #1E3B2C">場地配置圖</h2>
<span style="font-size: 14px; color: #5F6159">示意圖・非等比例｜手機可左右滑動</span>
</div>
<div style="overflow-x: auto; border-radius: 14px; border: 1px solid #E3DDCD; background: #FFFFFF">
<img src="__BASE__/images/motion2026-market-map.png" alt="走傱市集活動場地配置圖：日南車站、服務台、舞台、樹林區與攤位 01 至 23 的位置" width="3200" height="820" style="display: block; width: 100%; min-width: 960px; max-width: none; height: auto">
</div>
<a href="__BASE__/images/motion2026-market-map.png" target="_blank" rel="noopener" style="align-self: flex-start; display: inline-flex; align-items: center; min-height: 44px; font-size: 15px; font-weight: 700; color: #2E6B4A">開啟原尺寸配置圖 ↗</a>
</div>
</section>

${renderVendorSection("food", "餐飲美食", marketVendors.filter(v => v.category === "餐飲"))}

${renderVendorSection("stalls", "手作・農產・交流", marketVendors.filter(v => v.category !== "餐飲"))}

<section id="info">
<div style="max-width: 1200px; margin: 0 auto; padding: 48px 24px 72px; display: flex; flex-direction: column; gap: 20px">
<h2 style="margin: 0; font-size: 32px; font-weight: 900; color: #1E3B2C">交通・設施</h2>
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px">
<div style="background: #FFFFFF; border: 1px solid #E3DDCD; border-radius: 14px; padding: 20px; display: flex; flex-direction: column; gap: 6px">
<div style="font-size: 17px; font-weight: 700; color: #B23A26">服務設施</div>
<div style="font-size: 15px; line-height: 1.6; color: #4A4F46">服務台、周邊品、醫護站，位於入口意象牆前（01 號攤旁）。</div>
</div>
<div style="background: #FFFFFF; border: 1px solid #E3DDCD; border-radius: 14px; padding: 20px; display: flex; flex-direction: column; gap: 6px">
<div style="font-size: 17px; font-weight: 700; color: #2457A0">流動廁所</div>
<div style="font-size: 15px; line-height: 1.6; color: #4A4F46">日南車站旁、藝人休息帳旁各一處。</div>
</div>
<div style="background: #FFFFFF; border: 1px solid #E3DDCD; border-radius: 14px; padding: 20px; display: flex; flex-direction: column; gap: 6px">
<div style="font-size: 17px; font-weight: 700; color: #1F7A6B">交通方式</div>
<div style="font-size: 15px; line-height: 1.6; color: #4A4F46">台鐵日南車站下車即達，站旁設有 YouBike。</div>
</div>
</div>
</div>
</section>`;
