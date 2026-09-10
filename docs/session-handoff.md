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
