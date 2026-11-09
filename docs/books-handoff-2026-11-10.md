# 稻站書架獨立頁

- Goal：使用者提供的71本旋轉書架書單，設計為符合稻站主視覺的獨立網址，不加入官網導覽。
- Owner：Codex；期限：本次交付；Checkpoint：完整書目、桌機及390px手機預覽、正式發布。
- Baseline：本回合使用者書單與附件HTML，71本／11主題／15筆資料待確認，四面18／17／17／19本。
- Decision：`public/books/index.html` 為自包含的靜態獨立頁，`/books/`；不改首頁、導覽、sitemap。noindex僅避免此未整併頁被搜尋引擎主動索引，不是存取權限。
- Assets：僅使用本回合授權的4張書架照片，WebP顯示版本登錄既有圖片白名單；不使用附件影音。
- Completed：靛藍、米白、稻金版面、既有正式Logo、書名／作者／出版社搜尋、11主題與四面三層交集篩選、照片定位、完整介紹dialog、隨機選書、可分享的#book-NNN網址。
- Evidence：本機靜態建置成功；pages 12、content 3、plants 6及media 2測試通過。瀏覽器桌機與390px iframe預覽通過；搜尋東野圭吾為2本、第三面下層為5本、空結果畫面與詳細介紹通過。
- Limitations：書目依使用者提供，未另作出版社考證，15筆待確認保留。搜尋書籍資料連結為博客來搜尋，未宣稱為官方書訊。
- Published：2026-11-10，正式網址 https://www.rinancommons.com/books/index.html 。Vercel部署檢查success；71本及6張顯示圖片正常，正式站搜尋東野圭吾為2本，分享#book-053重載後可開啟解憂雜貨店。www目前不將/books/自動解析為index.html，請分享完整入口。
- State：completed。官網選單、首頁與sitemap未新增入口。
- Next：若要改書目，維護data.js並同步初始靜態卡片。
