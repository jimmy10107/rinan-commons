// Preview and public market pages share this layout and the public-only vendor dataset.
import marketVendors from "../../../content/market-vendors.json";

type MarketVendor = typeof marketVendors[number];
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
function renderVendor(v: MarketVendor) {
  const name = escapeHtml(v.name);
  const intro = escapeHtml(v.intro.replace(/\[?(?:品項待補|內容待補|攤商確認中|待補)\]?/g, "").trim());
  const story = intro && intro !== `${v.highlights}。` ? `<p class="market-vendor-intro">${intro}</p>` : '<div class="market-vendor-intro" aria-hidden="true"></div>';
  const longStory = v.intro.length > 60;
  const detail = longStory ? `<button type="button" class="market-vendor-more" data-market-open="vendor-story-${v.number}" aria-haspopup="dialog">品牌故事 <span aria-hidden="true">↗</span></button>` : "";
  const dialog = longStory ? `<dialog class="market-story-dialog" id="vendor-story-${v.number}" aria-labelledby="vendor-story-title-${v.number}"><form method="dialog"><button class="market-story-close" aria-label="關閉品牌故事" autofocus>關閉 ✕</button></form><span class="market-story-eyebrow">${v.number} · ${escapeHtml(v.label)}</span><h2 id="vendor-story-title-${v.number}">${name}</h2><p>${intro}</p></dialog>` : "";
  const social = v.social && /^https:\/\/(www\.)?(facebook\.com|instagram\.com)\//.test(v.social)
    ? `<a class="market-vendor-social" href="${escapeHtml(v.social)}" target="_blank" rel="noopener noreferrer" aria-label="${name} 社群（另開新視窗）">${v.social.includes("instagram.com") ? "Instagram" : "Facebook"} ↗</a>`
    : v.socialLabel ? `<span class="market-vendor-social-label">${escapeHtml(v.socialLabel)}</span>` : "";
  return `<article class="market-vendor" id="vendor-${v.number}" data-vendor-number="${v.number}"><div class="market-vendor-top"><span class="market-vendor-number">品牌 ${v.number}</span><span class="market-vendor-tag">${escapeHtml(v.label)}</span></div><h3>${name}</h3><p class="market-vendor-highlights">${escapeHtml(v.highlights)}</p>${story}<div class="market-vendor-footer">${detail}${social}</div>${dialog}</article>`;
}
function renderVendorSection(id: string, title: string, group: MarketVendor[]) {
  return `<section id="${id}" class="market-directory-section"><div class="market-directory-heading"><h2>${title}</h2><span>${group.length} 組品牌</span></div><div class="market-directory-grid">${group.map(renderVendor).join("")}</div></section>`;
}
export const marketHtml = String.raw`<section id="content" style="background: #1E3B2C; color: #F7F4EC">
<div style="max-width: 1200px; margin: 0 auto; padding: 72px 24px 64px; display: flex; flex-direction: column; gap: 22px">
<div style="font-size: 16px; font-weight: 500; letter-spacing: 3px; color: #F2B544">走傱日南 2026・RINAN IN MOTION</div>
<h1 style="margin: 0; font-size: clamp(36px, 8vw, 72px); line-height: 1.15; font-weight: 900; letter-spacing: 8px">走傱市集</h1>
<p style="margin: 0; max-width: 640px; font-size: 18px; line-height: 1.7; color: #E4E9E1">${marketVendors.length} 組品牌，從在地美食、手作文創、小農好物到公益義賣，在日南車站旁一起相聚。</p>
<div style="display: flex; flex-wrap: wrap; gap: 12px">
<div style="background: #284D3A; border-radius: 12px; padding: 14px 18px; display: flex; flex-direction: column; gap: 2px; min-width: 180px">
<span style="font-size: 13px; color: #C9D6CC">日期</span>
<span style="font-size: 18px; font-weight: 700">10/31（六）</span>
</div>
<div style="background: #284D3A; border-radius: 12px; padding: 14px 18px; display: flex; flex-direction: column; gap: 2px; min-width: 180px">
<span style="font-size: 13px; color: #C9D6CC">時間</span>
<span style="font-size: 18px; font-weight: 700">16:30–21:00</span>
</div>
<div style="background: #284D3A; border-radius: 12px; padding: 14px 18px; display: flex; flex-direction: column; gap: 2px; min-width: 180px">
<span style="font-size: 13px; color: #C9D6CC">地點</span>
<span style="font-size: 18px; font-weight: 700">日南車站旁廣場</span>
</div>
</div>
<div style="display: flex; flex-wrap: wrap; gap: 12px; margin-top: 6px">
<a href="#stalls" style="display: inline-flex; align-items: center; min-height: 48px; padding: 0 22px; border-radius: 999px; background: #F2B544; color: #2A1E05; font-size: 16px; font-weight: 700; text-decoration: none">認識 20 組品牌</a>
<a href="#info" style="display: inline-flex; align-items: center; min-height: 48px; padding: 0 22px; border-radius: 999px; border: 2px solid #F7F4EC; color: #F7F4EC; font-size: 16px; font-weight: 700; text-decoration: none; box-sizing: border-box">交通・設施</a>
</div>
</div>
</section>

${renderVendorSection("stalls", "品牌總覽", marketVendors)}

<section id="info">
<div style="max-width: 1200px; margin: 0 auto; padding: 48px 24px 72px; display: flex; flex-direction: column; gap: 20px">
<h2 style="margin: 0; font-size: 32px; font-weight: 900; color: #1E3B2C">交通・設施</h2>
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px">
<div style="background: #FFFFFF; border: 1px solid #E3DDCD; border-radius: 14px; padding: 20px; display: flex; flex-direction: column; gap: 6px">
<div style="font-size: 17px; font-weight: 700; color: #B23A26">服務設施</div>
<div style="font-size: 15px; line-height: 1.6; color: #4A4F46">服務台、走傱日南周邊商品區與醫護站，位置請依現場標示。</div>
</div>
<div style="background: #FFFFFF; border: 1px solid #E3DDCD; border-radius: 14px; padding: 20px; display: flex; flex-direction: column; gap: 6px">
<div style="font-size: 17px; font-weight: 700; color: #2457A0">流動廁所</div>
<div style="font-size: 15px; line-height: 1.6; color: #4A4F46">現場設有流動廁所，位置請依現場標示。</div>
</div>
<div style="background: #FFFFFF; border: 1px solid #E3DDCD; border-radius: 14px; padding: 20px; display: flex; flex-direction: column; gap: 6px">
<div style="font-size: 17px; font-weight: 700; color: #1F7A6B">交通方式</div>
<div style="font-size: 15px; line-height: 1.6; color: #4A4F46">台鐵日南車站下車即達，站旁設有 YouBike。</div>
</div>
</div>
</div>
</section>`;
