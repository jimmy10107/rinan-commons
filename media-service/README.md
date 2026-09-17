# 日南稻站私人照片服務

**狀態：程式及本機權限測試完成；尚未建立雲端資源、部署或匯入照片。** GitHub Pages 不提供私人原圖存取控制，這個服務獨立部署到 Cloudflare。公開 repository 只保存程式、空白 schema 與設定範本。

## 權限

- 私人 R2 ORIGINALS 保存原圖，私人 R2 DISPLAYS 保存縮圖；兩者都禁止 r2.dev 與 bucket 自訂公開網域。
- D1 保存照片索引、署名和發布狀態；初次匯入全部為 draft。
- `/admin*` 由 Cloudflare Access 限定管理者登入；Worker 額外驗證 RS256 簽章、issuer、audience、到期時間及擁有者 email。只有通過驗證才能讀取原圖及管理頁。
- `/image/:id/480.webp`（另有 800、1200）只傳回已核准、已署名、published 的展示圖，永不讀取原圖 bucket。未發布與撤回皆回傳 404。
- 每次圖片请求重新檢查 D1，回應 no-store。管理者撤回後不再提供新請求，但不能撤回訪客已下載或截圖的內容。
- 前端不含儲存憑證；隱藏網址、禁止右鍵、CORS 均不當作權限機制。

## 部署前需有的帳號設定

1. 連接擁有者的 Cloudflare 帳號及可用網域；查看該帳號的 R2 啟用條件及費率後才建立資源，不承諾帳號必然免費。
2. 建立兩個私人 R2 bucket 和一個 D1 database。複製 `wrangler.example.jsonc` 為本資料夾的 `wrangler.jsonc`，填入 bucket 名稱、D1 ID；新增 Worker custom domain 路由。真實設定檔已 gitignore。
3. 在 Zero Trust Access 為該媒體網域的 `/admin*` 建立 self-hosted application，Allow policy 僅指定擁有者 email，不可使用 Everyone/Bypass。把 team domain 和 application AUD 填入設定。
4. 使用 `npx wrangler secret put MEDIA_OWNER_EMAIL --config media-service/wrangler.jsonc` 設定管理者 email。不要將憑證、email 或原圖放入公開 repository。
5. 執行 schema：`npx wrangler d1 execute MEDIA_DB --remote --file media-service/schema.sql --config media-service/wrangler.jsonc`。
6. 通過本機測試後才部署：`npm run test:media-service`；`npx wrangler deploy --config media-service/wrangler.jsonc`。範本停用 workers.dev 及 preview URLs，避免額外入口。

## 匯入及發布

執行 `node media-service/prepare-import.mjs /absolute/private/catalog.sqlite`。只在 gitignored `media-service/import-set` 產生原圖、去 metadata 的 3 種 WebP、D1 匯入 SQL 和 objects.json；校驗原圖 SHA256，拒絕覆蓋既有匯入檔。這個目錄包含私人資料，禁止提交或分享。較小原圖不放大。

依 objects.json 的 binding/key/mime 對應，用已登入的 Wrangler 將每個檔案上傳到其私人 bucket，明確設定 Content-Type。所有物件上傳完整後，使用 `wrangler d1 execute MEDIA_DB --remote --file media-service/import-set/import.sql --config media-service/wrangler.jsonc` 匯入索引。SQL 預設 draft，不會自動發布。

在媒體網域 `/admin` 登入後逐張檢查縮圖、確認展示授權並填署名，再按公開。網頁只能引用核准的 `/image/...`，不得引用原圖。正式接入網站前，需實測未登入／錯誤帳號不能取得原圖、draft 404、核准後可看展示圖、撤回立即 404。雲端尚未部署，因此這些實際環境驗證仍未完成。

## 測試範圍

`service.test.mjs` 使用真實 SQLite schema 和真實 RS256 token，測試匿名、偽造 token、錯誤對象、錯誤帳號、過期 token、原圖存取、核准、撤回、跨來源寫入、錯誤物件鍵、遺失展示圖與過大請求。R2 以 stub 模擬；測試不代表 Cloudflare 帳號已配置妥當。

官方依據：[Access JWT 驗證](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/)、[R2 公開 bucket](https://developers.cloudflare.com/r2/buckets/public-buckets/)、[D1 prepared statements](https://developers.cloudflare.com/d1/worker-api/prepared-statements/)。
