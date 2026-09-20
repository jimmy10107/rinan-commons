# 網站工作交接｜2026-09-10

Goal: 研究三個參考網站，整合優點，更新 jimmy10107/rinan-commons 與內容資料庫。
Owner: Codex；最終品牌與發布內容負責人為使用者。
Deadline: 本回合交付。
Checkpoint: 基線與參考檢視 → SQLite 與頁面改版 → 建置檢查 → GitHub 提交與部署驗證。
Definition of Done: GitHub 程式可建置、公開內容從資料庫產生、原路徑可用、GitHub Pages 部署成功；原 ChatGPT Site 不被改動。

Completed: 研究三站的內容及首頁畫面；建立 8 頁；資料種子、schema、發布快照；修正 GitHub base path；補充來源、sitemap 及可存取性樣式。
Decisions: 主句「在往返之間，認識日南。」；GitHub Pages 公開；SQLite 為建置時內容庫；不綁定原 Sites D1；未確認名單不進前台。
Evidence: docs/website-redesign-2026-09-10.md、tests/content.test.mjs、tests/pages.test.mjs、Git commit 與 Actions 結果。
Open questions: 正式報名表單、營業時間、最終卡司與攤商；是否另設有登入權限的雲端後台。
Relevant files: content/seed.sql、db/migrations/0001_content.sql、scripts/build-content.mjs、app/commons.css、app/content.ts。
Risk: draft 在公開 GitHub 中不保密；目前沒有即時雲端寫入能力；未做新版瀏覽器互動及手機實機 QA。
Next actions: 正式資訊補入 seed.sql；如需雲端 CMS，另取得獨立後端服務並測試權限後再發布。

## 發布驗證完成

- 部署版本：b774649c705853e4faba1b17e14ffbabbbe568c3。
- GitHub Actions：https://github.com/jimmy10107/rinan-commons/actions/runs/34433630119；build、deploy 皆 success。
- 正式首頁、地方筆記、活動、展覽、到訪頁皆 HTTP 200，且包含新版對應內容。
- 本機與 CI 通過 SQLite 3 項測試、靜態輸出 3 項測試及 TypeScript 建置。
- 未執行新版瀏覽器互動／手機實機驗收；不將 HTTP 檢查視為視覺 QA。
- 本節僅更新交接紀錄，不改動網站程式。

## 2026-09-17 手機閱讀與私人素材

- 改版前備份：backup/pre-mobile-refresh-2026-09-17，指向 dba66745eaab192f8a4cd984b4b93b47f9dc5ebd。
- 新版：2164cc7fce856e5f73010089f7e262e3e88dbedb；Actions 35202356149 completed/success。
- 正式首頁已確認使用 800px WebP，桌面無橫向溢出；活動切到10/25及在地資訊後可瀏覽器返回；地圖 iframe 開啟前0、開啟後1、收起後0；九里圖層載入成功。
- 搜尋以實際鍵盤輸入確認0筆空狀態，清除可回復2筆。瀏覽器 fill 操作未觸發React更新，未將此工具特性誤判為網站故障。
- 完成：私人照片資料庫（19張原圖／20來源）與搜尋目錄保存；公開repo未包含任何新上傳照片、縮圖或私人索引。
- 阻塞：私人雲端媒體API未連接服務帳號，尚未啟用遠端登入/下載ACL/簽名網址。新照片未上架。
- 限制：此雲端瀏覽器無viewport resize，未做手機實機驗收。不把CSS設計及桌面測試等同實機觸控結果。
- 詳細研究／安全邊界／後續方案：docs/mobile-refresh-2026-09-17.md。

## 2026-09-17 私人雲端服務準備

- media-service/ 新增獨立 Worker、D1 schema、Access JWT 驗證、管理頁與原圖/展示圖分離。
- 7 項本機測試通過，涵蓋錯誤/偽造/過期 token、擁有者、發布/撤回、跨站寫入、原圖路徑隔離。R2 使用 stub，並非雲端驗收。
- 19 張照片已產生本機私密匯入組（原圖、3 種 WebP、SQL），全部 draft；匯入資料被 gitignore 排除，未上傳。原始資料庫已有獨立保存。
- 待接通擁有者 Cloudflare 帳號、私人 R2、D1、Access 及媒體網域後才能部署，完成實際未登入與撤回測試後才接入公開網站。
- 部署操作與權限界線：media-service/README.md。

## 2026-09-17 到站敘事修訂

- 修改前備份 backup/pre-arrival-copy-2026-09-17 指向 1680aea4d373744b69910d8454f33d11cf7eba53。
- 首頁手機主句置前；副句改為「車站旁，一個可以停下來休息的地方！」；保留關於我們按鈕及三個入口。
- 關於頁與地方筆記補述守橋營房、軍方禁區到公共空間的轉變。依使用者本回合確認，並核對既有《日南稻站_設計需求文件》之守橋兵營描述，不新增年代、部隊或橋名。
- 四項空間用途描述皆不超過20字，SQL來源同步更新。
- 下一站日南加入原創SVG火車圖與推薦搭車的小字，位於導航之前；九里地圖維持到訪頁最下方，首頁快速入口不再強調地圖。
- 走傱日南頁、報名區與活動資料不改，待新版landing page準備好再串接。

## 2026-09-19 地圖預設展開與置頂

- 依使用者最新指示，到訪頁九里地圖移至頁首導覽下方、火車與交通介紹之前，取代先前地圖置底安排。
- MapExplorer 初始展開並載入 iframe；保留收起、重新開啟及另開大地圖。同步修正載入說明與上下方導航文字。
- 修改前已備份 backup/pre-map-first-2026-09-19。僅更新 GitHub Pages。

## 2026-09-19 九里地圖與到訪交通拆頁

- 備份 backup/pre-map-visit-split-2026-09-19；新增 /explore/ 九里互動地圖，/visit/ 保留到訪交通及周邊導航。
- 地圖頁預設展開；到訪頁不再載入地圖 iframe。既有 /maps/ 全頁地圖保留。
- 桌面、手機及頁尾加入兩個入口，兩頁互有切換頁籤及目前頁面狀態；sitemap 同步。
- 靜態建置與九路由連結檢查通過，確認地圖頁展開、交通頁無 iframe、地址導航保留。

## 2026-09-19 移除重複頁內導覽

- 頂端九里互動地圖與到訪交通入口保留，移除兩個頁面內容上方的重複切換列。
- /visit/ 首個內容為下一站日南、火車插畫與交通；不嵌入九里地圖。/explore/ 才嵌入地圖。
- 修改前備份 backup/pre-nav-dedup-2026-09-19。

## 2026-09-20 植物近觀室

- 使用者授權整合植物資產並直接部署 GitHub 官網；新增 /plants/，桌面、手機與頁尾選單同步。
- 六種植物、30 生長狀態、6 器官特寫及精細選項，共 42 個壓縮 GLB；29 張署名參考圖。
- 先呈現預覽，點選才載入 3D；單一模型、可取消下載、離屏／靜止停止繪製，手機可調細節與下載 GLB。
- 基線 08097b43e16e24692cb992caee556c2fc557c718；更新前已保留 backup/pre-plants-2026-09-20 備份。
- 實作與限制：docs/plants-2026-09-20.md。瀏覽器模擬與截圖：docs/qa/plants。既有私人媒體檢查保留。

- 應用提交：d34126d2a4864da42eabb10f24b39c87925e4b21。GitHub Actions 35492784709 建置、測試與部署全部成功。
- 正式網址：https://jimmy10107.github.io/rinan-commons/plants/ 。2026-09-20 正式站手機選單、芋頭／水稻／臺灣欒樹模型載入通過，無瀏覽器錯誤。
- 全部 42 模型於本機瀏覽器驗證；360–1440px 無橫向溢出。慢網路模擬 LCP 924ms、CLS 0、初始傳輸 264836 bytes、零 GLB 請求；實機速度仍依裝置與網路而異。
- 正式驗證紀錄：docs/qa/plants/live-report.json；本機及正式站皆以 Chromium 驗證，尚無實體 iOS／Android 裝置測試。

## 日南植物形態室 v3｜使用者最新調整

- 基線 5b206058；最新指示改名、第一版三欄布局、進入即 3D、逐級提升細節與官網跨頁預載。
- 本次修改與限制見 docs/plants-morphology-v3.md；舊版首次零 GLB 策略已被取代。
- 預載只處理約 1.16 MB 的六份輕量模型，尊重省流量與使用者當前操作，不在其他頁建立 3D 場景。
- 應用提交 251942b7f702dabbb92e55cacdd49c0c8940d2c4，GitHub Actions 35508601131 建置、測試及部署成功。
- 正式站手機選單、自動輕量 3D、細緻模型、特寫放大精細模型依序載入通過，無瀏覽器錯誤。結果見 docs/qa/plants-v3/live-report.json。
- 發布前已承接 c88aeb47 的市集 11 組公開名單與測試修正。

## 植物形態室 v4｜先看影格再操作

- 使用者回饋 v3 太慢，改為 SVG 五段生長動畫約 6.5 秒，並行準備同植物的五個輕量 3D；可略過動畫或直接選階段。
- 解析後模型快取與延後精細下載取代先前每次切換都再解析／自動加載細緻模型。保留全部下載與特寫。
- 任務契約、來源、測試與速度限制見 docs/plants-lifecycle-v4.md；基線 575f2055。
- 六植物冷載入：首影格 376–762 ms；當前植物五個輕量階段 2210–5931 ms，測試條件與完整證據見 docs/qa/plants-v4/cold-network-report.json。

- 應用提交 65ae8138e7cb8327540172f1969af5528db1cb7c；GitHub Actions 35509663528 建置、測試與 Pages 部署成功。
- 2026-09-20 正式站手機選單、SVG 動畫、五階段預備及無新增下載切換、放大補細節全部通過；無瀏覽器錯誤、無水平溢出。證據 docs/qa/plants-v4/live-report.json 與 live-mobile.png。

## 植物形態室 v5｜放慢與交接

- Decision：依使用者新指示，五個生長姿態由 6.5 秒延長為 12 秒，每張 2.4 秒；影格淡化由 240ms 改為 700ms。
- Task：Owner Codex／Lead Digital & Data；期限本次交付；Checkpoint 修改→瀏覽器→正式部署；DoD 完整 12 秒、結尾 800ms 交叉淡化、保留操作與低動態偏好。
- 最後一張保留到實際模型完成渲染，再以 800ms 淡入 3D；重播重設到全株最後階段，避免動畫結尾跳回前次特寫或其他階段。略過則前往當前影格階段。
- 基線 ba0b2ad；沒有修改模型與下載素材。工作區原有的 casuarina_03.svg 修改未納入本次發布；靜態素材測試於隔離的發布基線驗證。
- Evidence：docs/qa/plants-v5/browser-report.json；舊版證據保留於 plants-v4。
- 發布提交 175ef188a66014599d22c84b63809ee3028414ab；Actions 35510030040 建置與部署成功。正式站實測 12026ms；交接中 SVG opacity 0.707、3D opacity 0.293，0.8s 過渡生效。手機、五階段快取切換、放大補细節通過，無瀏覽器錯誤。證據 docs/qa/plants-v5/live-report.json。
