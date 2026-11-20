// Build the numbered card's unnumbered artwork. The exact gold emblem is from the supplied exhibition artwork.
const path = require('node:path');
const sharp = require('sharp');
const dir = path.join(__dirname,'../public/quiz');
async function build() {
const emblem = (await sharp(path.join(dir,'pearl-emblem.webp')).png().toBuffer()).toString('base64');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="960" height="1220" viewBox="0 0 960 1220">
<defs>
 <linearGradient id="pearl" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox"><stop stop-color="#d8f2ef"/><stop offset=".32" stop-color="#f7fbff"/><stop offset=".63" stop-color="#e8dff4"/><stop offset=".84" stop-color="#f9efe0"/><stop offset="1" stop-color="#e4f0e8"/></linearGradient>
 <linearGradient id="edge"><stop stop-color="#adc6c2"/><stop offset=".33" stop-color="#f9faf9"/><stop offset=".66" stop-color="#c4bec9"/><stop offset="1" stop-color="#f8f4df"/></linearGradient>
 <clipPath id="window"><rect x="89" y="297" width="782" height="697" rx="15"/></clipPath>
</defs>
<rect width="960" height="1220" fill="#14231f"/>
<g transform="rotate(-1 480 610)">
 <rect x="48" y="55" width="882" height="1128" rx="34" fill="#0d1816"/>
 <rect x="40" y="42" width="880" height="1128" rx="34" fill="url(#pearl)" stroke="url(#edge)" stroke-width="10"/>
 <rect x="64" y="66" width="832" height="1080" rx="19" fill="none" stroke="#9caea9"/>
 <g font-family="Noto Sans CJK TC,sans-serif" fill="#173d32">
 <text x="93" y="133" font-family="sans-serif" font-size="24" font-weight="bold" letter-spacing="4">RINAN COMMONS</text>
 <rect x="684" y="91" width="183" height="58" rx="29" fill="#22473b"/><text x="775" y="131" text-anchor="middle" fill="#fff8d8" font-size="30" font-weight="bold">八題全對</text>
 <text x="89" y="215" font-family="Noto Serif CJK TC,serif" font-size="57" font-weight="bold">日南稻站走傱日南紀念章</text>
 <text x="94" y="267" font-size="32" fill="#3b5a50">在往返之間認識日南</text>
 <image x="89" y="297" width="782" height="697" preserveAspectRatio="xMidYMid slice" clip-path="url(#window)" xlink:href="data:image/png;base64,${emblem}"/>
 <rect x="89" y="297" width="782" height="697" rx="15" fill="none" stroke="#b5afa1" stroke-width="2"/>
 <text x="480" y="1066" text-anchor="middle" font-size="35" font-family="Noto Serif CJK TC,serif" font-weight="bold">一起看見日南的鐵路、人物、植物與書架</text>
 <path d="M92 1096h246m284 0h247" stroke="#a6afa3"/><text x="480" y="1105" text-anchor="middle" font-family="sans-serif" font-size="19" letter-spacing="3" fill="#506958">RINAN  ·  2026</text>
 </g></g></svg>`;
await sharp(Buffer.from(svg)).webp({quality:94}).toFile(path.join(dir,'pearl-card.webp'));
}
build().catch(e=>{console.error(e);process.exitCode=1});
