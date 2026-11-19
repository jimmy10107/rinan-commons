# 日南到站紀念章

獨立 Worker + 專用 D1，勿覆蓋主網域、既有植生牆 LIFF 或 webhook。先在非正式環境驗收。

1. 複製 wrangler.example.jsonc 為本機 wrangler.jsonc，建立專用 D1 並填入 ID；套用 schema.sql。執行 npm install。Worker 使用套件在本地產生 QR，不把兌換 token 傳給圖碼服務。
2. 在既有 LINE Login channel **新增** LIFF，endpoint 指到這個 Worker 的 HTTPS 根網址，啟用 openid。設定 Worker 的 LIFF_ID、CHANNEL_ID、END_AT（含時區）、PRIVACY_NOTICE（含蒐集者、利用範圍、保存期限、權利聯絡方式與拒絕後果）。以 Worker secret 設定穩定的隨機 IDENTITY_KEY（至少 32 bytes），不能放 Git。更換金鑰會改變活動內帳號識別，因此活動期間不要更換。
3. 工作人員本人登入 /?staff=1，將申請代碼交給主辦核對；管理員將核准的代碼加入 STAFF_KEYS，逗號分隔。知道代碼本身不能登入或核銷。無名單預設拒絕。
4. 實機驗收後，主站建置時設 NEXT_PUBLIC_STAMP_ORIGIN 為上述 HTTPS origin。測驗不採及格門檻；答案是自填，不是身分憑證；防重複以後端已驗證 LINE 帳號為準。QR 90 秒有效，新碼會取代舊碼；掃描不會直接核銷。短效碼仍可被即時轉傳，請工作人員要求現場重新出示。
5. 活動截止即拒絕新操作；依公告期限清理本活動 D1 資料及備份。正式啟用前指定刪除負責人與日期。勿記錄 Authorization、ID token 或掃碼內容。

測試：node --test stamp-service/service.test.mjs（從專案根目錄，Node 22+）。
