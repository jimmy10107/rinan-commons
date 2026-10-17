# 鐵道文史、空間日常圖文與 SEO｜2026-10-17

Goal：依使用者本回合要求，讓鐵道文史與空間日常各有完整圖文，延伸目前官方社群行銷內容並改善文章 SEO。
Owner：Codex。Lead：Digital & Data；內容方法：Curation & Content。
Deadline：本回合。Checkpoint：社群與文資來源核對 → 內容與影像 → 建置 → 正式部署與驗證。
Definition of Done：原有兩篇網址保留；各有完整文字與三張圖；分類、目錄、內部連結可用；metadata、BlogPosting、BreadcrumbList、sitemap 更新；正式站可讀。
Baseline：2e7b8b0b0eb2472b5501ff69ee8981ef1268d72a。

## 內容與來源

- 鐵道文史 `/stories/a-station-in-daily-life/`：〈日南車站：從木造站房、牛眼窗，讀懂海線的往返日常〉，六節、827 字，站房／月台資料照片與地方空拍社群圖。
- 空間日常 `/stories/a-place-to-stop/`：〈日南稻站：打開車站旁的舊營房，留一個可以停一下的地方〉，六節、871 字，空拍／開幕預告／稻芋田社群圖。
- IG 由使用者已連線 Metricool 讀取已公開貼文。FB connector 本回傳空 rows，因此未宣稱直接讀到 FB 貼文全文；本次社群正文以 IG 為依據。
- 社群來源：8/25 https://www.instagram.com/p/Dcd-nEsyKIX/ ；8/27 https://www.instagram.com/p/DcjGHeWSWEY/ ；8/29 https://www.instagram.com/p/DcoQGWoy9z-/ ；8/31 https://www.instagram.com/p/DctLYv4S7Go/ ；9/12 https://www.instagram.com/p/DdL76E9D0Ar/ 。
- 史實與車站原有公開影像來源：https://www.tchac.taichung.gov.tw/building?pid=22&uid=33 。只採海線建設年代、木造站房、牛眼窗、古蹟公告日期等資料，不把舊文中的旅客數、舊車票販售及開放時間當作即時資訊。
- 空間最小介入／可逆改善採既有網站與使用者已確認基線。開幕以 2026/10/24–25 活動表述；固定開放時間仍以另行公告為準。
- 不將社群文案「停兩分鐘」當成所有列車的實際停站規則。未另增御用米或建築年代推論。
- 使用者本回合要求圖文發布並可參考 FB／IG，沿用官方已公開圖文。圖說明確標示社群圖文或文資資料照片，未將它們冒充空間完工現況照。
- 5 張影像、10 個 WebP 變體，保留原圖版面與比例，按單一來源加白名單；照片署名依原貼文保留 @zifilm.tw。詳見 journal-image-manifest-2026-10-17.json。

## SEO 與閱讀體驗

- 主題明確的 H1、獨立摘要、六個 H2、可點擊目錄、圖片替代文字與來源連結。
- 保留原 slug，無需搬移網址。分類增加導言；串連交通、九里地圖、植物形態室、展覽、活動與人物故事。
- 共用文章模板新增 BlogPosting／BreadcrumbList JSON-LD、Twitter 大圖摘要、OG modifiedTime、署名／更新日期；canonical 與原有 OG 照片保留。sitemap 提供真實內容更新日期。
- 依 Google 官方文件：https://developers.google.com/search/docs/appearance/structured-data/article 、https://developers.google.com/search/docs/fundamentals/creating-helpful-content 。不堆砌關鍵字，不製造問答 rich result，不承諾排名；未設定虛構初次發表日期。

## 驗證

- Next 靜態建置與 TypeScript 通過；媒體白名單 2 項、內容 3 項、頁面 3 項測試通過。
- 匯出 HTML 確認兩篇均有單一 H1、canonical、description、OG image、Twitter card、目錄，以及可解析的 BlogPosting／BreadcrumbList；sitemap 五篇皆有 lastmod。
- 三篇人物故事內容 payload 與本回合基線逐字一致。
- 手機單欄規則沿用前次已實作樣式；本環境未提供可用手機 viewport／實機，不宣稱手機視覺驗收通過。
- 發布後回寫正式站驗證結果。
