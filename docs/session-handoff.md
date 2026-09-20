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
- 基線 08097b43e16e24692cb992caee556c2fc557c718；部署與正式驗證待本次 GitHub Actions 完成後補記。
- 實作與限制：docs/plants-2026-09-20.md。瀏覽器模擬與截圖：docs/qa/plants。既有私人媒體檢查保留。
