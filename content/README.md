# 網站內容資料

唯一可編輯的內容來源是 `content/seed.sql`。每筆 INSERT 的 payload 是有效 JSON；發布狀態為 `published` / `draft` / `archived`。編輯資料後執行：

```bash
npm run content:build
npm run test:content
npm run build:pages
npm run test:pages
```

`content:build` 使用 Node 22.13+ 的 node:sqlite：建立 `.content/content.sqlite`，執行 schema 與種子資料，驗證並查詢 `public_content`，輸出 `app/generated/content.json`。建置產物不進 Git，不部署完整資料庫。SQL 留在 GitHub，因此可追蹤變更並回復。

## 常用欄位

| 需求 | kind / id | 修改位置 |
|---|---|---|
| 品牌、地址、時間、報名網址、PDF | settings / site | payload 對應欄位；空網址用 JSON null |
| 地方筆記 | articles | slug、category、title、summary、image、sections、sourceLabel、sourceUrl |
| 兩日節目 | programs | day、start、end、location、title、tags |
| 市集攤商 | vendors | name、category、theme、note、status；已確認才可 published |
| 展覽章節 | chapters | number、english、title、summary、text |
| 圖片與組織 | organizations | name、logo、href、role；站內圖片使用 /partners/... |

SQL 字串中的單引號以兩個單引號表示。圖片路徑由 `sitePath` 統一套用 GitHub base path。

報名按鈕在 `registrationUrl` 為 null 時顯示準備中；填入有效 HTTPS 表單網址後，下一次建置會切換為可點選連結。

**所有內容都在公開 repository 中。** draft 不會進入網站公開快照，但仍可在 GitHub 讀到；此設計僅用於既有公開內容，不適合個資或機密文件。需私密草稿時，改用獨立且有權限控管的 CMS。

這是一個 SQLite 建置內容流程。沒有雲端 DB、即時寫入 API、管理員登入或隱藏的瀏覽器資料儲存。GitHub Pages 只讀已產生的公開資料。
