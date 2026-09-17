# 日南稻站手機體驗與私人素材｜2026-09-17

## Baseline / Version control
- Owner：Codex；Deadline：本次網站更新；Checkpoint：備份 → 私人素材整理 → 手機排版與互動 → 建置 → 發布驗證。
- 改版前 SHA：dba66745eaab192f8a4cd984b4b93b47f9dc5ebd。
- 遠端保留分支：backup/pre-mobile-refresh-2026-09-17，已建立成功。
- 回復時從保留分支建立新的回復 commit，不強制覆寫 main 歷史。
- 範圍：GitHub rinan-commons；不修改原 ChatGPT Site。

## Findings and implementation
- 活動頁固定 scrollTo(180) 不隨字級、手機尺寸與內容改變。改為實際節目區塊定位，支援 hash 分享、上一頁、鍵盤焦點及減少動態偏好。
- 手機上下重複的活動切換列造成版面壓迫。保留頂端固定三分類；分類名稱改成實際內容，主操作至少 44px。
- 網站選單增加首頁、當前頁指示、Escape 關閉、點外側關閉；在較窄平板也改採收合選單。
- 首頁增加三個明確入口；統一照片比例、色調背景、文字層級、段落行長與行距。手機主要內文以 16–17px 為主，不限制使用者縮放。
- 地圖採主動開啟，首次閱讀不下載里界、Leaflet 或外部底圖；可收起或另開完整地圖。
- 已公開的兩張站房照片建置為 480/800/1200px WebP，使用 srcset/sizes；主圖 eager/high priority，其餘 lazy/async；保留來源與替代文字。
- 原 JPG 409209 / 329572 bytes；800px 顯示版本 86146 / 56358 bytes。只代表這兩張圖的檔案節省，非實際 Core Web Vitals 成績。

## Photos / Current protection
- 20 個上傳來源 → 19 張唯一素材。私人離線 SQLite 保存原始 BLOB、SHA-256、尺寸、編輯分類與來源對照；每筆原始 bytes 已校驗。
- 可搜尋的 HTML 縮圖目錄與 SQLite 一起保存為私人附件，不位於 repository，不向任何第三人分享。
- 原檔、縮圖、私人識別資訊均未進入 GitHub。公開站本輪仍使用先前已公開照片；本次新照片未上架。
- visibility=private 是目錄欄位，不是 SQLite 自带登入。檔案持有者可以讀取，保護來自保存位置的帳號權限；不是已部署的媒體 API。
- 公開素材 allowlist 記錄既有 8 個圖片來源的 SHA-256；build gate 阻擋不符的照片、資料庫、壓縮包、私人檔案識別字串。此防誤上傳檢查不能代替後端權限，也不保護 Git 歷史中已公開資料。

## Cloud media continuation (not deployed)
- 建議獨立私人 R2 bucket：關閉 r2.dev 與公開 custom domain，不綁原 Sites bucket。
- 管理者登入後才可查詢目錄／下載原圖；登入驗證與權限判斷在伺服器，禁止把 API key 放進 NEXT_PUBLIC 或前端程式。
- 原圖 URL 需短時效簽名並限制權限；不存永久公開 URL，不提供匿名完整目錄。
- 網站只使用經核准、移除 EXIF 的限尺寸展示圖；公開可見圖片仍可被儲存或截圖。Referer、CORS、禁右鍵、隱藏路徑都不是授權驗證。
- 尚缺：可用的雲端照片服務帳號／連線，以及對外展示圖的授權與尺寸政策。本回合不聲稱已設定遠端 bucket ACL。

## Verification
- Next 靜態建置、8 頁路由檢查與 SQLite tests；另有私人檔案防誤發布 gate tests。
- 雲端瀏覽器不提供 viewport resize；本機 preview 連線被瀏覽器 URL policy 阻擋。未繞過政策，也不把桌面瀏覽器測試稱為手機實機驗收。
- 320/390/768px 的樣式已設計，仍需手機實際觸控與 200% 字級驗收。
- 正式部署後驗收首頁、活動切換／返回、搜尋與地圖開關。部署結果記於 session-handoff。

## Research / Skills
- W3C Reflow：https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
- W3C Target Size：https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html （WCAG AA最低目標與本案主要操作44px設計值區分）
- MDN img/srcset/sizes/loading：https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img
- web.dev lazy loading：https://web.dev/articles/browser-level-image-lazy-loading
- Cloudflare private/public buckets：https://developers.cloudflare.com/r2/buckets/public-buckets/
- Cloudflare signed URLs：https://developers.cloudflare.com/r2/api/s3/presigned-urls/
- 已檢索可用 skills，採用日南稻站文案、DAZE Project OS、Library、control-browser；沒有宣稱已安装其他 UX skill。
