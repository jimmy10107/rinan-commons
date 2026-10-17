# 地方筆記・人物故事｜2026-10-17

Goal：在地方筆記加入人物故事分類，刊載使用者提供的三篇完整故事與全部 22 張照片。
Owner：Codex；內容確認與公開指示：邱大澤。
Deadline：本回合。
Checkpoint：確認 main 與附件 → 圖文排版 → 建置與手機瀏覽器檢查 → main 發布與正式頁驗證。
Definition of Done：三篇完整文字、8/7/7 張照片、人物分類/搜尋/系列連結可用；桌機與手機尺寸無水平溢出；正式頁可讀。
Baseline：27a3ca353a327d7a8249cc14a9d49d06e70ab427。

## 來源與決策

- 文字依使用者本回合定稿逐段保留，未自行新增人物經歷、獎項、年代或合作內容；本次為刊載任務，未重新執行歷史與獎項事實查核。
- 照片來自本回合明確要求公開的《人物故事集.7z》，按資料夾對應陳隆安 8 張、鄭筱萱 7 張、娜翎 7 張。
- 每張提供 640 與 1440 像素 WebP，移除 EXIF、保留完整比例；文章中使用全部照片，首圖優先載入，內文延後載入。
- 圖說限描述畫面。圖片署名採「日南稻站提供」，未套用既有車站照片的文化資產處來源。
- 人物分類可由 `/stories/?category=people` 直接進入；各人物有獨立網址、分享摘要與系列導覽。
- 全部分類顯示最新人物故事優先；保留鐵道文史與空間日常。主站首頁既有文章選擇不變。
- 原始附件保留，公開 repo 僅放展示照片。公開圖片雜湊逐一加入既有 allowlist，不放寬媒體檢查。
- 照片對應與原檔校驗：`docs/people-photo-manifest-2026-10-17.json`。

## 路徑

- `/stories/people-chen-long-an/`
- `/stories/people-cheng-hsiao-hsuan/`
- `/stories/people-narin/`

## 驗證

- 來源文字逐段比對完全一致，照片數為 8 / 7 / 7，每篇無重複漏圖。
- 完成後補記建置與瀏覽器結果於下方；實體 iOS / Android 裝置不在本次測試環境。

- 靜態建置、TypeScript、內容 3 項、頁面 3 項、媒體隱私 2 項、媒體服務 7 項、植物回歸 6 項皆通過。
- 本機瀏覽器受環境 socket 權限限制無法啟動；不將此列為畫面測試通過。將於發布後以雲端瀏覽器驗證。

## 正式發布驗證

- 主站發布 commit：`c53d7bf80f5acf7eadaab1b1b99625f027460bed`；Vercel 回報 Deployment has completed。
- GitHub Pages Actions [39026534418](https://github.com/jimmy10107/rinan-commons/actions/runs/39026534418) completed / success。
- 雲端 Chrome 正式站桌機驗證：人物分類顯示 3 篇；搜尋 Narin 剩 1 篇；返回分類恢復 3 篇；系列文章連結可互相導覽。
- 正式站逐篇讀取完整段落，捲動後確認 8 / 7 / 7 張圖片 complete 且 naturalWidth > 0，無漏圖。
- 已檢查文章首圖、內文照片、圖說、篇末系列導覽；畫面證據：`docs/qa/people-stories/live-2026-10-17.jpg`。
- 手機單欄與響應式圖片已實作；本環境未提供可用的行動 viewport／實體裝置檢驗，故手機視覺驗收仍列為未驗證，不宣稱通過。
- 正式入口：https://www.rinancommons.com/stories?category=people
- 正式文章：https://www.rinancommons.com/stories/people-chen-long-an 、https://www.rinancommons.com/stories/people-cheng-hsiao-hsuan 、https://www.rinancommons.com/stories/people-narin 。
