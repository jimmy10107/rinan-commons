# CIS v2｜地方閱讀與操作體驗改版（未發布）

2026-09-19。Owner：Codex；品牌審閱與發布決策：使用者。Deadline：本回合。
Checkpoint：參考研究 → 獨立分支 → 實作 → 建置與互動檢查 → 交付預覽。
DoD：至少 20 項可核對調整；可操作的預覽；保留 v1；不動 main、不觸發部署。

## 基線與範圍

- 正式站基線：08097b43e16e24692cb992caee556c2fc557c718。
- CIS v1 已保存：design/cis-v1-draft-2026-09-19，e398aecbde092c9a59c0e5878e46120d7da83731。
- 本輪：design/cis-v2-ux-draft-2026-09-19。
- 使用者回饋：v1 有 CIS 配色，但缺乏質感、像樣板、操作不順。
- 設計判斷：減少無內容的大型裝飾和色塊；用地方照片、中文閱讀層級和操作回饋形成可信的地方文化網站。屬設計假設，不宣稱已經使用者測試證实。
- 不更改活動／展覽內容、Logo 母版、私人照片、SQL 資料與雲端權限；不發佈。既有照片來源保留。
- 成本／時間：無新增付費服務；以現有 React 和原生 dialog 實作。參考元件庫的方法，沒有整套引入大型 UI 套件。

## 公開 GitHub 與當期文件研究

以下於 2026-09-19 查閱線上 repo、文件；「近期」指本次取得的當期公開文件與 release 頁，不宣稱所有專案都是今年才出現，也未使用未證實的熱門排名。

| 公開專案 | 閱讀的文件／實作 | 適合本案的原則 | 本案落地／未採用 |
|---|---|---|---|
| [Radix Primitives](https://github.com/radix-ui/primitives) | [Dialog](https://www.radix-ui.com/primitives/docs/components/dialog)、[dialog.tsx](https://github.com/radix-ui/primitives/blob/main/packages/react/dialog/src/dialog.tsx) | modal 背景不可操作、焦點受控、Escape、關閉後返回觸發點 | 原生 dialog 手機選單；未複製原始碼 |
| [Adobe React Spectrum / Aria](https://github.com/adobe/react-spectrum) | [SearchField](https://react-aria.adobe.com/SearchField) | 可見標籤、清除操作、鍵盤與結果回饋 | 搜尋標籤、一鍵清除、Escape、live region |
| [shadcn/ui](https://github.com/shadcn-ui/ui) | [Empty](https://ui.shadcn.com/docs/components/base/empty)、[Releases](https://github.com/shadcn-ui/ui/releases) | 空狀態說明原因並提供恢復動作、可組合元件 | 無結果時提供關鍵字建議與清除條件；不套用 SaaS 卡片皮膚 |
| [Astro Starlight](https://github.com/withastro/starlight) | [Authoring Content](https://starlight.astro.build/guides/authoring-content/)、[Releases](https://github.com/withastro/starlight/releases) | 明確標題階層、可掃讀的長文結構 | 正文行長、段落索引、來源區分層；未把網站改成技術文件外觀 |
| [Ionic Framework](https://github.com/ionic-team/ionic-framework) | [Content](https://ionicframework.com/docs/api/content)、[Advanced theming](https://ionicframework.com/docs/theming/advanced)、[Releases](https://github.com/ionic-team/ionic-framework/releases) | 安全區、捲動容器、設計 token | 選單使用 dvh、安全區和捲動隔離；沒有攔截主頁捲動 |
| [Expo](https://github.com/expo/expo) | [Native tabs](https://docs.expo.dev/router/advanced/native-tabs/) | 路由與明確選中狀態、文字標籤 | 導覽有目前頁面狀態；未硬加一列重複底部分頁或仿製玻璃效果 |
| Google web.dev | [Optimize CLS](https://web.dev/articles/optimize-cls) | 預留圖片／動態内容空間，減少載入位移 | 固定圖片比例、地圖載入層佔用原位置 |

直接程式碼查閱成功：Radix dialog。Adobe SearchField 與 Starlight MobileMenuToggle 的 GitHub blob 讀取失敗，改以已成功讀取的官方文件分析；不把它們計為讀過完整程式碼。其餘 repo 為公開專案與文件層級研究。

## 33 項可核對優化

| # | 問題／調整 | 主要位置 | 驗收方式 |
|---|---|---|---|
| 01 | 移除巨大弧形照片裁切，保留完整場景感 | 首頁 hero | 查看方正 5:4／手機 4:3 圖框 |
| 02 | 移除無資訊的裝飾曲線與漂浮橙點 | 首頁 | hero 後直接接內容 |
| 03 | 藍色回到操作與連結，降低滿版色塊 | 全站母站 | 活動卡改淺米、展覽卡淡藍 |
| 04 | 主句保持第一資訊，縮短手機首屏空白 | 首頁 | 手機先見主標、說明、CTA |
| 05 | 照片註解移到圖下，不壓照片 | 首頁 | 圖面無深色漸層文字 |
| 06 | 桌機圖文比例重排為 .94:1.06 | 首頁 | 標題與車站照片共同構成首屏 |
| 07 | 使用統一流動字級與負字距，降低笨重感 | 主標／次標 | 320 至 1440 寬度檢查 |
| 08 | 敘事引句使用宋體層級，功能文字維持黑體 | 介紹／願景 | 使用已內嵌的 Noto 字體子集，缺字才回退系統 |
| 09 | 一致的頁邊距與區段節奏 | 全站 | CSS gutter/rhythm tokens |
| 10 | 英文與編號降為輔助資訊 | section mast／cards | 不與中文主標競爭 |
| 11 | 活動入口用真實日期取代巨大英文裝飾 | 首頁活動卡 | 10.24—10.25，保留活動內容與 CTA |
| 12 | 三入口改輕量文字列，保留整列可點 | 首頁 | 手機單欄、無額外容器堆疊 |
| 13 | 重整故事圖框比例與閱讀時間層級 | 地方筆記入口 | 照片與無照片卡同一比例 |
| 14 | 尾段到訪區改淺色接續，不以大黑塊截斷閱讀 | 首頁底部 | 地址／按鈕層級清楚 |
| 15 | 手機 header 縮至 68px，保留可辨識品牌 | 母站頁首 | 不遮住太多內容 |
| 16 | 手機選單改原生 modal，隔離背景操作 | 新 DraftMobileMenu | 開啟時 focus containment／背景 inert |
| 17 | 手機選單 Escape、關閉鍵、遮罩關閉、焦點歸還 | 新 DraftMobileMenu | 鍵盤與滑鼠操作 |
| 18 | 選單鎖背景捲動、內部可捲、支援安全区 | 新 DraftMobileMenu | 矮螢幕與 dvh／safe-area |
| 19 | 回到桌機寬度自動關閉手機 modal | 新 DraftMobileMenu | 開啟後 resize >1200 |
| 20 | 母站內頁導覽使用 Next Link，避免整頁重載 | 內部 CTA 與頁首 | GitHub basePath、路由回返驗證 |
| 21 | 站內箭頭 →、外站 ↗，區分行為 | 母站 CTA | 不誤導外部開新頁 |
| 22 | 搜尋清除鈕與 Escape，清除後焦點留輸入欄 | 地方筆記 | 輸入、清除、重新輸入 |
| 23 | 搜尋做大小寫與全半形正規化 | 地方筆記 | NFKC、lowercase、trim |
| 24 | 搜尋與分類写入網址，返回／重整保留 | 地方筆記 | q/category 參數與 popstate；附件路由有獨立限制 |
| 25 | 分類顯示篇數、明確選中、結果數朗讀 | 地方筆記 | aria-pressed、role=status |
| 26 | 空結果提供具體建議與一鍵復原 | 地方筆記 | 零結果 → 全部文章 |
| 27 | 加入交通段落快捷與地址複製／手動備援 | 到訪 | 跳火車／公車／汽機車；clipboard success/failure |
| 28 | 地址桌機隨讀、手機回到一般流排 | 到訪 | sticky 在手機關閉 |
| 29 | 地圖收起不卸載，重新展開保留視野 | 九里地圖 | iframe DOM 同一節點與來源 |
| 30 | 地圖預留高度、延遲說明與重試 | 九里地圖 | 慢連線 12秒提示／retry；底圖錯誤由內嵌地圖處理 |
| 31 | 長文加入段落索引、限制行長、來源獨立區 | 單篇筆記 | 錨點皆存在、正文可掃讀 |
| 32 | Hover 僅滑鼠啟用，短按回饋，減少動態偏好保留 | 母站 | hover media、active、reduced-motion |

| 33 | 同源子集中文字體，補足「傱」與全形標點；減少裝置字體落差 | 三個 WOFF2 約 314 KiB | Noto Sans TC 400/500、Noto Serif TC 400，保留 SIL OFL；字形覆蓋檢查 |

附加修正：九里地圖與交通維持獨立頁；不增加重複頁內切換列。私密照片仍不進公開 repo。按鈕至少44px，表單文字16px。

## 預覽方式

`scripts/build-review.mjs` 從實際 React 頁面／元件建立單檔 HTML；沿用建置 CSS 和已公開 WebP。搜尋、選單、地址與地圖控制不是另畫的假按鈕。僅 Next Link 路由和資產路径作本機附件適配；活動／展覽開啟原有線上頁面。7 個母站頁面包含兩篇筆記。

附件使用 iframe srcdoc，本機檔案環境不具正式網址，因此搜尋網址持久化和 Next 預載應以正式 build 測試為準；搜尋本身可用。地圖需要網路；圖片已內嵌。未部署新的預覽網站。

## 驗證紀錄

- `npm run build:pages` 通過：TypeScript、9 個內容路由輸出、公開圖片與私人媒體檢查。
- `npm run test:pages` 3/3 通過。補充：Next 自動產生的同源 preconnect 不屬導航，測試排除它，仍逐項檢查所有頁面與資產 URL。
- Chromium 153 桌面模擬：320 / 390 / 768 / 1440px × 首頁／關於／筆記列表／交通／筆記正文，共20個版面檢查無横向溢出。
- 手機選單：Tab 迴圈、Escape、焦點歸還、背景鎖捲、桌機寬度自動收合通過。
- 搜尋：零結果→清除、分類選中、網址查詢參數、重整保留、進入文章再返回保留通過。
- 交通：無地圖 iframe；公車段落跳轉通過；剪貼簿成功與拒絕後手動複製備援通過（剪貼簿 API 使用測試替身）。
- 地圖：預設開啟；收起再展開仍為同一 iframe 節點。未把 iframe load 當成全部遠端圖磚／衛星底圖成功。
- reduced-motion 過渡停用通過。
- 下載型單檔預覽：實際開啟並操作手機選單、進入地方筆記、搜尋、清除，通過；未出現 JS 頁面錯誤。
- 已檢視桌機與390px手機長頁截圖，修正缺字後再次確認；自動化總計28項結果記錄於 `docs/cis-v2-qa-results.json`。
- 限制：屬 Chromium 模擬，沒有實體 iPhone／Android 或 Safari 觸控測試；地圖外部服務、即時班次不屬本輪完整驗收。未做真人使用者測試或宣稱 Lighthouse 分數。
- 字型補字檢查：三個字型都包含「走傱日南，・！？」；新文案若新增字形需重跑子集腳本，系統 fallback 作備援。
- 未發布：main 保持原版本；沒有修改 Actions 或呼叫部署。
