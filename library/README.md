# 日南書架借書系統

網址（部署後）：`https://library.rinancommons.com`
程式碼位置：`rinan-commons` repo 的 `library` 分支、`library/` 資料夾。
**這個分支不併入 main**，官網 `www.rinancommons.com` 的部署完全不受影響；官網也沒有任何連結指向這裡，並設定搜尋引擎不收錄。

## 三種身分

| 身分 | 怎麼取得 | 看得到 | 能做 |
|---|---|---|---|
| 館長 | 部署時手動指定（見步驟 5），之後可由館長指派 | 全部，含稽核紀錄 | 借還書、發證、管理館藏、指派職員、修改借期規則 |
| 職員 | 館長在「館長管理」頁指派 | 館藏、會員（電話預設遮罩）、借閱紀錄 | 借還書、發證、修改會員資料、新增館藏、登錄 ISBN |
| 會員 | 職員發證時填 email，會員用該 email 登入即自動綁定 | **只有自己**的借書證、目前借閱、借閱歷程 | 只能看 |
| 其他人 | — | 什麼都看不到（未登入連書目都讀不到） | — |

權限由資料庫的列級權限（Row Level Security）判斷，不是靠前端隱藏。所有寫入都只能透過資料庫函式完成，函式內檢查身分、借書上限、書是否已借出，並寫入稽核紀錄。稽核紀錄任何人都不能修改或刪除。

規則細節見 `supabase/migrations/20261116233303_library.sql`，自動化測試見 `tests/rls.test.mjs`（`npm run test:rls`，用六種身分逐一驗證）。

## 部署步驟（約 30 分鐘）

### 1～2. Supabase 專案與資料表（已完成）
- 專案：`rinan-library`（日南稻站組織，東京機房），網址 `https://htfbmddeofcotggklbfa.supabase.co`
- 資料表、權限規則、116 本館藏都已套用，並已在正式資料庫上驗證權限。
- 之後修改資料庫：在 `supabase/migrations/` 新增 SQL 檔並推送到 `library` 分支，GitHub Actions 會自動套用（需先設定下方「自動化」的兩個金鑰）。

### 3. 設定登入
1. **Authentication → URL Configuration**
   - Site URL：`https://library.rinancommons.com`
   - Redirect URLs 加入：`https://library.rinancommons.com/auth/callback`
2. **Authentication → Email Templates → Magic Link**，把內容換成（讓信裡同時有登入碼和連結）：
   ```html
   <h2>日南書架登入</h2>
   <p>你的登入碼：<strong style="font-size:24px">{{ .Token }}</strong></p>
   <p>或直接點這裡登入：<a href="{{ .ConfirmationURL }}">登入日南書架</a></p>
   <p>這組登入碼 1 小時內有效。不是你本人申請的話，忽略這封信即可。</p>
   ```
3. **寄信服務（正式上線前必做）**：Supabase 內建寄信每小時只能寄很少封，只適合測試。到 **Project Settings → Authentication → SMTP Settings** 接上自己的寄信服務（例如 Resend、Gmail Workspace 的 SMTP），寄件人可設為 `library@rinancommons.com`。

### 4. 部署到 Vercel
1. Vercel → Add New → Project → 匯入 `jimmy10107/rinan-commons`。
2. **Root Directory** 選 `library`。Framework 會自動辨識為 Next.js。
3. **Environment Variables** 加兩個：
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://htfbmddeofcotggklbfa.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Supabase 專案 Settings → API Keys 頁面的 **Publishable key**（`sb_publishable_` 開頭；本來就設計成可以公開，權限由資料庫規則把關；**不要**填 secret / service_role key）
4. Deploy。完成後到這個新專案的 **Settings → Git → Production Branch**，改成 `library`，再 Redeploy 一次。
5. **Settings → Domains** 加入 `library.rinancommons.com`。若 `rinancommons.com` 的 DNS 已在 Vercel 管理會自動生效；否則照 Vercel 顯示的 CNAME 值到網域商新增一筆紀錄。

> 官網的 Vercel 專案也會替 `library` 分支建一個預覽版本，這不影響正式官網。若不想看到它，可在官網專案的 Settings → Git → Ignored Build Step 填 `[ "$VERCEL_GIT_COMMIT_REF" = "library" ] && exit 0 || exit 1`。

### 5. 指定第一位館長
1. 打開 `https://library.rinancommons.com`，用你自己的 email 登入一次（此時會看到「還沒有借書證」，正常）。
2. 回到 Supabase SQL Editor，執行（把 email 換成你的）：
   ```sql
   insert into public.staff (user_id, email, role)
   select id, lower(email), 'director' from auth.users where lower(email) = lower('你的email');
   ```
3. 重新整理網頁，就會進入櫃台，右上角出現「館長管理」。
4. 之後的職員都在「館長管理」頁指派，不需要再進 Supabase。

## 自動化流程

推送到 `library` 分支後：
1. **GitHub Actions**（`.github/workflows/library.yml`）跑權限測試與建置檢查。
2. 測試通過後，自動把 `supabase/migrations/` 裡尚未執行的 SQL 套用到 Supabase。
3. **Vercel** 偵測到 `library` 分支更新，自動部署到 `library.rinancommons.com`。

第 2 步需要在 GitHub repo 的 Settings → Secrets and variables → Actions 新增兩個 secret（沒設定時會自動略過這一步，不會失敗）：
- `SUPABASE_ACCESS_TOKEN`：Supabase 右上角頭像 → Account preferences → Access Tokens → Generate new token
- `SUPABASE_DB_PASSWORD`：Supabase 專案 Settings → Database → Reset database password 產生的密碼

## 日常操作

- **發證**：櫃台 →「會員」→ 辦新的借書證。填 email 的會員可以自己登入看借書證與借閱紀錄。
- **借書**：櫃台 → 借書 → 掃借書證 → 掃書 → 確認借出。
- **還書**：櫃台 → 還書 → 掃書 → 還書。
- **掃條碼**：手機鏡頭（按「掃書」「掃借書證」）、USB 條碼槍（游標在輸入框直接掃）都可以。
- **書上的 ISBN 條碼**：首批 116 本還沒有 ISBN。在「館藏」篩選「未登錄 ISBN」，點進每本書按「掃描」掃書背條碼即可補登；或直接列印館藏碼條碼貼在書上。
- **借書證與館藏條碼**：在會員或書的詳細頁截圖列印即可。

## 本機開發

```bash
cd library
cp .env.example .env.local   # 填入 Supabase 的 URL 與 anon key
npm install
npm run dev                  # http://localhost:3000
npm run test:rls             # 權限測試（不需要 Supabase，用內嵌 Postgres）
```

## 安全上要知道的事

- repo 是公開的，所以程式碼裡沒有、也不能放任何密碼或 service_role key。
- 館長是最高權限，看得到所有會員資料。
- 前端只負責顯示；就算有人改了前端程式，資料庫規則仍會擋下越權的讀寫。
- 會員停用後無法登入查看，也不能借書；歷史紀錄保留。
