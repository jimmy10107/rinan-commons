# 九里地圖地點來源與座標查核｜2026-11-20

## 本次資料範圍

- 共 31 筆內容：29 筆有地理參考位置、2 筆無固定據點品牌、0 筆實體地址尚未定位。
- 有位置的資料依既有界線計算：九里內 23 筆、周邊 6 筆。無固定據點者不加入地理數量。
- 這是地圖資料查核，不是營業、集章條件、步行路徑或現場出入口查核。地址參考、範圍參考與共同場域均在資料及介面提醒中保留精度。
- 來源為現行 `public/passport/index.html`、套用全部 SQL UPDATE 後的 `public_content`、交通頁、策展人物資料及活動頁。已讀正式站 `/visit/`、`/walk/2026/`、`/motion2026/` 比對公開外鏈。
- `content/market-vendors.json` 是歷屆市集來源，未將其全部品牌自動視為常態實體店家。未發現目前公開來源的鹹菜醃桶／小精靈迷宮地圖外鏈，因此未自行新增。
- 日南稻站／走傱日南周邊與選物合成一場所，保留護照 19、33 及兩個既有短鏈；日南慈德宮／慈德宮合併。日頭伙俥站保留獨立內容入口，透過 `parentPlaceId: rinan-kitchen` 表示位於日南來心肉場域。
- 松柏漁港與生鱻市集有不同 Google 地標與位置，保留兩筆，不用港口中心代替市集。

## 座標取得與驗證方法

1. Google 分享短鏈先檢查最終 place URL 的 `!3d`／`!4d`，不採用 `@` 後的鏡頭中心。
2. 讀取公開 Google Maps 頁面所列的 preload 資料，核對目標場所的名稱、地址、地標識別碼及 record[9] 的地點經緯度。多結果搜尋需同時符合大甲／苑裡與原有名稱或門牌，不取第一個任意座標。
3. 部分預載回應為二進位格式；改讀公開 Google 地圖搜尋資料 `https://www.google.com/search?tbm=map&hl=zh-TW&q=...`，並再次比對名稱與地址。
4. 只有地址相符、沒有獨立商家地標的資料標為 `google_maps_address_reference`。範圍地名及廣場借用車站等情形另標 `precision`，不宣稱精確入口。
5. 以 `public/maps/boundaries.json` 九個里多邊形進行 point-in-polygon。該檔沿用使用者提供的 2021 資料；`boundaryVillage` 只表示此資料判定，不能取代最新行政地址。

## 逐筆座標與匹配證據

| ID／網站名稱 | 緯度、經度 | 地理分類／精度 | Google 匹配名稱、地址 | 查核來源 |
|---|---|---|---|---|
| rinan-commons<br>日南稻站 Rinan Commons | 24.3749504, 120.6516875 | 九里內／孟春里；place | 日南稻站 Rinan Commons；437臺中市大甲區孟春里中山路二段6號 | [查核來源](https://maps.app.goo.gl/VD6aVDVXgYVA7n9S6) |
| rinan-station<br>日南車站 | 24.3780650, 120.6541180 | 九里內／孟春里；place | 日南車站；437臺中市大甲區 | [查核來源](https://maps.app.goo.gl/HNQpY3hKnP5kuRAs7) |
| narin<br>娜翎の窩 Thai Narin | 24.4048045, 120.6412677 | 九里內／龍泉里；place | 娜翎的窩；437臺中市大甲區西岐里順帆路13號 | [查核來源](https://maps.app.goo.gl/JKiB8jF9BRfP2Lwf7?g_st=ic) |
| longan-rice<br>隆安米（東興香品行） | 24.3957038, 120.6484128 | 九里內／日南里；place | 東興香品行；437臺中市大甲區經國路2740-5號 | [查核來源](https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E8%88%88%E9%A6%99%E5%93%81%E8%A1%8C%20%E5%A4%A7%E7%94%B2%20%E7%B6%93%E5%9C%8B%E8%B7%AF2740-5%E8%99%9F) |
| cide-temple<br>日南慈德宮 | 24.3809002, 120.6564162 | 九里內／孟春里；place | 日南慈德宮 三庄媽；437臺中市大甲區孟春里通天路152號 | [查核來源](https://www.google.com/maps/search/?api=1&query=%E6%97%A5%E5%8D%97%E6%85%88%E5%BE%B7%E5%AE%AE) |
| rinan-plaza<br>日南車站旁廣場 | 24.3780650, 120.6541180 | 九里內／孟春里；station_reference | 日南車站；437臺中市大甲區 | [查核來源](https://maps.app.goo.gl/NoN8DrkZRdcLhcoW6) |
| rinan-kitchen<br>日南來心肉共生廚房 × 崩八食堂 | 24.3802590, 120.6549291 | 九里內／孟春里；place | 日南來心肉共生廚房（可大量訂餐、會議便當、外燴）；437臺中市大甲區孟春里中山路二段206號 | [查核來源](https://www.google.com/maps/search/?api=1&query=%E6%97%A5%E5%8D%97%E4%BE%86%E5%BF%83%E8%82%89%20%E8%87%BA%E4%B8%AD%E5%B8%82%E5%A4%A7%E7%94%B2%E5%8D%80%E4%B8%AD%E5%B1%B1%E8%B7%AF%E4%BA%8C%E6%AE%B5206%E8%99%9F) |
| good-soyfoods<br>原豆粹食 GOOD SOYFOODS | 24.4401149, 120.6543131 | 周邊；place | 原豆粹食 GOOD SOYFOODS；358苗栗縣苑裡鎮苑南里新興路86-1號 | [查核來源](https://www.google.com/search?tbm=map&hl=zh-TW&q=%E5%8E%9F%E8%B1%86%E7%B2%B9%E9%A3%9F%20GOOD%20SOYFOODS%20%E8%8B%91%E8%A3%A1) |
| huaning-studio<br>椛檸製所 | 24.3810993, 120.6547757 | 九里內／孟春里；place | 椛檸製所；437臺中市大甲區孟春里通天路172號 | [查核來源](https://www.google.com/maps/search/?api=1&query=%E6%A4%9B%E6%AA%B8%E8%A3%BD%E6%89%80%20%E5%A4%A7%E7%94%B2) |
| mountain-riceball<br>山腳下飯糰 | 24.4380507, 120.6497695 | 周邊；place | 山腳下飯糰；358苗栗縣苑裡鎮房裡里博愛路6號 | [查核來源](https://www.google.com/maps/search/?api=1&query=%E5%B1%B1%E8%85%B3%E4%B8%8B%E9%A3%AF%E7%B3%B0%20%E8%8B%91%E8%A3%A1) |
| frog-guava<br>水蛙刺青甘草芭樂 | 24.3807920, 120.6547904 | 九里內／孟春里；address | 437台中市大甲区孟春里中山路二段231號；437台中市大甲区孟春里中山路二段231號 | [查核來源](https://www.google.com/maps/search/?api=1&query=%E8%87%BA%E4%B8%AD%E5%B8%82%E5%A4%A7%E7%94%B2%E5%8D%80%E4%B8%AD%E5%B1%B1%E8%B7%AF%E4%BA%8C%E6%AE%B5231%E8%99%9F) |
| wangding-lane<br>旺定巷1號 | — | 無固定據點 | 無固定據點，流動出攤，地點與時間依粉專公告 | [查核來源](https://www.facebook.com/profile.php?id=100063936458121) |
| tea-198<br>198茶苑 | 24.3814570, 120.6542214 | 九里內／孟春里；address | 437臺中市大甲區孟春里121縣道198號；437臺中市大甲區孟春里121縣道198號 | [查核來源](https://www.google.com/maps/search/?api=1&query=437%E8%87%BA%E4%B8%AD%E5%B8%82%E5%A4%A7%E7%94%B2%E5%8D%80%E5%AD%9F%E6%98%A5%E9%87%8C121%E7%B8%A3%E9%81%93198%E8%99%9F) |
| shiguang-537<br>拾光伍參柒 | 24.3881985, 120.6549470 | 九里內／幸福里；place | 拾光伍參柒；437臺中市大甲區幸福里中山路二段537巷5號 | [查核來源](https://www.google.com/search?tbm=map&hl=zh-TW&q=%E6%8B%BE%E5%85%89%E4%BC%8D%E5%8F%83%E6%9F%92%20%E5%A4%A7%E7%94%B2) |
| snowfat<br>Snowfat 肥雪工作室 | — | 無固定據點 | 創作品牌・依合作場次與社群公告 | [查核來源](https://www.facebook.com/groups/447512692753212) |
| shanqun-farm<br>善群有機農莊｜Yüanli | 24.3693499, 120.6934304 | 周邊；place | 善群農莊；358苗栗縣苑裡鎮上舘里；上舘 里 10 鄰 198 號 | [查核來源](https://www.google.com/search?tbm=map&hl=zh-TW&q=%E5%96%84%E7%BE%A4%E6%9C%89%E6%A9%9F%E8%BE%B2%E8%8E%8A) |
| yusoy<br>御豆坊（美華數位影像中心） | 24.3795700, 120.6544020 | 九里內／孟春里；place | 美華數位影像中心；437臺中市大甲區孟春里中山路二段196號 | [查核來源](https://www.google.com/maps/search/?api=1&query=%E7%BE%8E%E8%8F%AF%E6%95%B8%E4%BD%8D%E5%BD%B1%E5%83%8F%E4%B8%AD%E5%BF%83%20%E5%A4%A7%E7%94%B2%20%E4%B8%AD%E5%B1%B1%E8%B7%AF%E4%BA%8C%E6%AE%B5196%E8%99%9F) |
| sunlight-train<br>日頭伙俥站 | 24.3802022, 120.6548392 | 九里內／孟春里；shared_venue | 崩八食堂x日南來心肉；437臺中市大甲區孟春里中山路二段204號 | [查核來源](https://maps.app.goo.gl/qYGsVgte1gPwcu3L9) |
| shallow-green-books<br>淺山綠 獨立書店 | 24.3921731, 120.7092352 | 周邊；place | 淺山綠 獨立書店；358苗栗縣苑裡鎮南勢里南勢七鄰93號 | [查核來源](https://www.google.com/maps/search/?api=1&query=%E6%B7%BA%E5%B1%B1%E7%B6%A0%20%E7%8D%A8%E7%AB%8B%E6%9B%B8%E5%BA%97) |
| little-courtyard<br>小院子的日常 | 24.3675570, 120.7095243 | 周邊；place | 小院子的日常；358苗栗縣苑裡鎮上舘里上舘49號 | [查核來源](https://www.google.com/maps/search/?api=1&query=%E5%B0%8F%E9%99%A2%E5%AD%90%E7%9A%84%E6%97%A5%E5%B8%B8) |
| wild-books<br>野人讀冊店 | 24.3556865, 120.6318143 | 周邊；place | 野人讀冊店；437臺中市大甲區頂店里大智街10號 | [查核來源](https://www.google.com/maps/search/?api=1&query=%E9%87%8E%E4%BA%BA%E8%AE%80%E5%86%8A%E5%BA%97) |
| arima-horse<br>有馬家休閒馬場 | 24.4208894, 120.6205511 | 九里內／西岐里；place | 有馬家休閒馬場；437臺中市大甲區西岐里如意路37巷13號 | [查核來源](https://www.google.com/maps/search/?api=1&query=%E6%9C%89%E9%A6%AC%E5%AE%B6%E4%BC%91%E9%96%92%E9%A6%AC%E5%A0%B4) |
| songbai-market<br>松柏漁港生鱻市集 | 24.4292278, 120.6164014 | 九里內／福德里；place | 松柏漁港生鱻市集；437臺中市大甲區福德里順帆路233-6號 | [查核來源](https://www.google.com/maps/search/?api=1&query=%E6%9D%BE%E6%9F%8F%E6%BC%81%E6%B8%AF%E7%94%9F%E9%B1%BB%E5%B8%82%E9%9B%86) |
| sunflower-farm<br>李安妮向日葵農場 | 24.4188310, 120.6173730 | 九里內／西岐里；place | 李安妮向日葵農場；437臺中市大甲區西岐里如意路27巷1之1號 | [查核來源](https://www.google.com/search?tbm=map&hl=zh-TW&q=%E6%9D%8E%E5%AE%89%E5%A6%AE%E5%90%91%E6%97%A5%E8%91%B5%E8%BE%B2%E5%A0%B4) |
| huangmiao-shrine<br>黃苗祠 | 24.3810969, 120.6525949 | 九里內／孟春里；place | 台中大甲~孟春黃苗祠(義俠~黃苗公)；437臺中市大甲區孟春里臨江路54巷2號 | [查核來源](https://www.google.com/maps/search/?api=1&query=%E9%BB%83%E8%8B%97%E7%A5%A0%20%E5%A4%A7%E7%94%B2) |
| jianxing-temple<br>大甲建興宮 | 24.4131979, 120.6142788 | 九里內／建興里；place | 大甲建興宮；437臺中市大甲區建興里如意路21巷1號 | [查核來源](https://maps.app.goo.gl/sAawGo8cPvHSgXPDA) |
| jiuzhangli<br>九張犁聚落 | 24.3720840, 120.6544180 | 九里內／太白里；area_reference | 九張犁；437臺中市大甲區太白里 | [查核來源](https://www.google.com/maps/search/?api=1&query=%E4%B9%9D%E5%BC%B5%E7%8A%81%20%E5%A4%A7%E7%94%B2) |
| rinan-spring<br>日南冷泉 | 24.3672431, 120.6829956 | 九里內／太白里；place | 日南冷泉／太白里湧泉；437臺中市大甲區太白里 | [查核來源](https://www.google.com/maps/search/?api=1&query=%E6%97%A5%E5%8D%97%E5%86%B7%E6%B3%89%20%E5%A4%A7%E7%94%B2) |
| youshi-industrial<br>大甲幼獅工業區 | 24.4031440, 120.6503110 | 九里內／日南里；area_reference | 台中幼獅工業區；437臺中市大甲區日南里 | [查核來源](https://www.google.com/maps/search/?api=1&query=%E5%A4%A7%E7%94%B2%E5%B9%BC%E7%8D%85%E5%B7%A5%E6%A5%AD%E5%8D%80) |
| songbai-harbor<br>松柏漁港 | 24.4274103, 120.6173585 | 九里內／福德里；area_reference | 松柏漁港；臺中市大甲區 | [查核來源](https://www.google.com/maps/search/?api=1&query=%E6%9D%BE%E6%9F%8F%E6%BC%81%E6%B8%AF%20%E5%A4%A7%E7%94%B2) |
| jiuzhangli-park<br>九張犁公園 | 24.3737366, 120.6644844 | 九里內／太白里；place | 臺中市大甲區太白里九張犂休憩公園；437臺中市大甲區太白里通天路47號 | [查核來源](https://www.google.com/maps/search/?api=1&query=%E4%B9%9D%E5%BC%B5%E7%8A%81%E5%85%AC%E5%9C%92%20%E5%A4%A7%E7%94%B2) |

## 重要例外與判斷

### 日南稻站：同址的兩個地標紀錄

- 保留護照短鏈 `VD6aVDVXgYVA7n9S6` 最終 URL 的地標點 `24.3749504, 120.6516875`。後續 Google place record 回傳「日南稻站」、同一門牌的 `24.3748681, 120.6516826`；兩個紀錄相距約 9 公尺。為保持既有公開短鏈的定位語義，本期採用該短鏈明示 pin，另保存目前 record 作比對。
- settings 與護照均已確認地址為中山路二段 6 號；未沿用 seed 初始 INSERT 的「1號對面」。

### 日頭伙俥站：同場域不同名稱

- 護照短鏈 `qYGsVgte1gPwcu3L9` 指向「崩八食堂x日南來心肉」，Google 地址為中山路二段 204 號。
- [臺中市政府 2025-12-27 新聞](https://www.taichung.gov.tw/8868/8872/9962/3174681) 明載日南來心肉場域以日南火車站意象打造日頭伙俥站。
- [2026-05-15 活動資訊](https://www.taiwantt.org.tw/tw/index.php?id=21145&option=com_content&task=view) 列日南來心肉／日頭伙俥站 2F，地址中山路二段 206 號。
- 因此屬可證實的共同場域關係；採原短鏈的場域 pin，保留 `parentPlaceId`，不把不同名稱當作無關店家。展示地址依既有內容 206 號；204／206 與入口樓層差異保留本紀錄，提醒依現場指引。

### 日南車站旁廣場：原外鏈指向車站

- `NoN8DrkZRdcLhcoW6` 與車站短鏈解析到同一日南車站地標 `24.378065, 120.654118`。
- 保留活動場地的內容入口，但精度標為 `station_reference`，並提醒廣場入口依現場指引。沒有為避免重疊而捏造偏移座標。

### 198茶苑：只有建物地址可核對

- 原 Google 地圖地址搜尋精確回傳「437臺中市大甲區孟春里121縣道198號」，點位 `24.381457, 120.6542214`，類型為建物地址，不是已核對的茶店獨立地標。
- 官方 LINE 社群可對到品牌及日南飲料美食，未提供精確店面入口佐證。因此使用 `google_maps_address_reference` 與 `precision: address`；明示「依護照地址標示參考位置；店家入口請向店家確認。」

### 水蛙刺青甘草芭樂：排除搜尋錯配

- 原「水蛙刺青甘草芭樂 大甲」Google 搜尋回傳蔣公路 138 號的另一家芭樂店，地址、名稱均不符，已排除其座標。
- 以護照中山路二段 231 號重新查得精確門牌參考點 `24.380792, 120.6547904`；獨立查詢「水蛙刺青」也回傳相同門牌、二樓，商家 pin 為 `24.3807694, 120.6548783`。
- 甘草芭樂販售點未另有獨立地標，本期使用門牌參考點，提醒販售與集章位置向店家確認。
- 新地圖的按鈕改為已核對的門牌查詢，標題「前往護照地址」；原搜尋外鏈仍保留於 `sourceUrls` 供反查。

### 隆安米、御豆坊：依護照指定的承載店面

- 隆安米原地址搜尋只回傳 2740 號，不是 2740-5 號，未採用。以「東興香品行」與完整門牌重新查核，取得名稱、2740-5 號與地點 pin 完全相符的 record。
- 御豆坊用護照明列的「美華數位影像中心」與中山路二段 196 號再次核對，採該場所地標，而不是猜測稻田、工廠或個人住址。

### 九張犁公園：排除其他行政區同名地點

- 原搜尋同時列大甲與烏日地點。本期採「臺中市大甲區太白里九張犂休憩公園」，通天路 47 號，未採烏日九德里正德三巷的同名公園，也未採旁邊 iBike 站作公園入口。

### 範圍地名與里界差異

- 九張犁聚落、幼獅工業區、松柏漁港標為範圍參考，不能視為特定可通行入口。
- 娜翎的窩 Google 地址文字為「西岐里順帆路13號」，其 pin 在提供的 2021 多邊形資料中落於「龍泉里」。網站保留提供者地址原文，`area` 仍為九里內，`boundaryVillage` 只記 2021 資料計算結果，沒有靜默改寫行政地址。

## 既有內容與外鏈保存

| ID | 原始檔案證據 | 原有導航／別名 |
|---|---|---|
| rinan-commons | public/passport/index.html:165<br>public/passport/index.html:201<br>content/seed.sql (place-1, public_content after updates) | [外鏈 1](https://maps.app.goo.gl/VD6aVDVXgYVA7n9S6)<br>[外鏈 2](https://maps.app.goo.gl/ZkkY3JdqTLjPKb3NA)<br>別名：日南稻站、走傱日南周邊與選物 |
| rinan-station | public/passport/index.html:200<br>content/seed.sql (place-0, public_content after updates) | [外鏈 1](https://maps.app.goo.gl/HNQpY3hKnP5kuRAs7)<br>[外鏈 2](https://www.google.com/maps/search/?api=1&query=%E6%97%A5%E5%8D%97%E8%BB%8A%E7%AB%99%20%E5%8F%B0%E4%B8%AD%E5%A4%A7%E7%94%B2) |
| narin | app/exhibition/to-and-from/exhibit-data.ts:14-17<br>content/seed.sql (people-narin) | [外鏈 1](https://maps.app.goo.gl/JKiB8jF9BRfP2Lwf7?g_st=ic)<br>別名：娜翎的窩、娜翎の窩、Thai Narin |
| longan-rice | public/passport/index.html:169 | [外鏈 1](https://www.google.com/maps/search/?api=1&query=437%E8%87%BA%E4%B8%AD%E5%B8%82%E5%A4%A7%E7%94%B2%E5%8D%80%E7%B6%93%E5%9C%8B%E8%B7%AF2740-5%E8%99%9F)<br>別名：隆安米、東興香品行 |
| cide-temple | public/passport/index.html:203<br>content/seed.sql (place-6, public_content after updates) | [外鏈 1](https://www.google.com/maps/search/?api=1&query=%E6%97%A5%E5%8D%97%E6%85%88%E5%BE%B7%E5%AE%AE)<br>[外鏈 2](https://www.google.com/maps/search/?api=1&query=%E6%85%88%E5%BE%B7%E5%AE%AE%20%E6%97%A5%E5%8D%97%20%E5%A4%A7%E7%94%B2)<br>別名：慈德宮 |
| rinan-plaza | app/motion2026/event-site.tsx:9 | [外鏈 1](https://maps.app.goo.gl/NoN8DrkZRdcLhcoW6) |
| rinan-kitchen | public/passport/index.html:102 | [外鏈 1](https://www.google.com/maps/search/?api=1&query=%E6%97%A5%E5%8D%97%E4%BE%86%E5%BF%83%E8%82%89%20%E8%87%BA%E4%B8%AD%E5%B8%82%E5%A4%A7%E7%94%B2%E5%8D%80%E4%B8%AD%E5%B1%B1%E8%B7%AF%E4%BA%8C%E6%AE%B5206%E8%99%9F) |
| good-soyfoods | public/passport/index.html:108 | [外鏈 1](https://www.google.com/maps/search/?api=1&query=%E5%8E%9F%E8%B1%86%E7%B2%B9%E9%A3%9F%20%E8%8B%97%E6%A0%97%E7%B8%A3%E8%8B%91%E8%A3%A1%E9%8E%AE%E6%96%B0%E8%88%88%E8%B7%AF86-1%E8%99%9F) |
| huaning-studio | public/passport/index.html:114 | [外鏈 1](https://www.google.com/maps/search/?api=1&query=%E6%A4%9B%E6%AA%B8%E8%A3%BD%E6%89%80%20%E5%A4%A7%E7%94%B2) |
| mountain-riceball | public/passport/index.html:120 | [外鏈 1](https://www.google.com/maps/search/?api=1&query=%E5%B1%B1%E8%85%B3%E4%B8%8B%E9%A3%AF%E7%B3%B0%20%E8%8B%91%E8%A3%A1) |
| frog-guava | public/passport/index.html:133 | [外鏈 1](https://www.google.com/maps/search/?api=1&query=%E6%B0%B4%E8%9B%99%E5%88%BA%E9%9D%92%E7%94%98%E8%8D%89%E8%8A%AD%E6%A8%82%20%E5%A4%A7%E7%94%B2)<br>[外鏈 2](https://www.google.com/maps/search/?api=1&query=%E8%87%BA%E4%B8%AD%E5%B8%82%E5%A4%A7%E7%94%B2%E5%8D%80%E4%B8%AD%E5%B1%B1%E8%B7%AF%E4%BA%8C%E6%AE%B5231%E8%99%9F)<br>別名：水蛙刺青 |
| wangding-lane | public/passport/index.html:139 |  |
| tea-198 | public/passport/index.html:145 | [外鏈 1](https://www.google.com/maps/search/?api=1&query=437%E8%87%BA%E4%B8%AD%E5%B8%82%E5%A4%A7%E7%94%B2%E5%8D%80%E5%AD%9F%E6%98%A5%E9%87%8C121%E7%B8%A3%E9%81%93198%E8%99%9F) |
| shiguang-537 | public/passport/index.html:166 | [外鏈 1](https://www.google.com/maps/search/?api=1&query=%E6%8B%BE%E5%85%89%E4%BC%8D%E5%8F%83%E6%9F%92%20%E5%A4%A7%E7%94%B2) |
| snowfat | public/passport/index.html:167 |  |
| shanqun-farm | public/passport/index.html:168 | [外鏈 1](https://www.google.com/maps/search/?api=1&query=%E5%96%84%E7%BE%A4%E6%9C%89%E6%A9%9F%E8%BE%B2%E8%8E%8A%20%E8%8B%97%E6%A0%97%E7%B8%A3%E8%8B%91%E8%A3%A1%E9%8E%AE%E4%B8%8A%E8%88%98%E9%87%8C10%E9%84%B0%E4%B8%8A%E9%A4%A8198%E8%99%9F)<br>別名：善群農莊、善群有機農莊 |
| yusoy | public/passport/index.html:170 | [外鏈 1](https://www.google.com/maps/search/?api=1&query=437%E8%87%BA%E4%B8%AD%E5%B8%82%E5%A4%A7%E7%94%B2%E5%8D%80%E5%AD%9F%E6%98%A5%E9%87%8C%E4%B8%AD%E5%B1%B1%E8%B7%AF%E4%BA%8C%E6%AE%B5196%E8%99%9F)<br>別名：御豆坊、美華數位影像中心 |
| sunlight-train | public/passport/index.html:202 | [外鏈 1](https://maps.app.goo.gl/qYGsVgte1gPwcu3L9) |
| shallow-green-books | public/passport/index.html:204 | [外鏈 1](https://www.google.com/maps/search/?api=1&query=%E6%B7%BA%E5%B1%B1%E7%B6%A0%20%E7%8D%A8%E7%AB%8B%E6%9B%B8%E5%BA%97) |
| little-courtyard | public/passport/index.html:205 | [外鏈 1](https://www.google.com/maps/search/?api=1&query=%E5%B0%8F%E9%99%A2%E5%AD%90%E7%9A%84%E6%97%A5%E5%B8%B8) |
| wild-books | public/passport/index.html:211 | [外鏈 1](https://www.google.com/maps/search/?api=1&query=%E9%87%8E%E4%BA%BA%E8%AE%80%E5%86%8A%E5%BA%97) |
| arima-horse | public/passport/index.html:212 | [外鏈 1](https://www.google.com/maps/search/?api=1&query=%E6%9C%89%E9%A6%AC%E5%AE%B6%E4%BC%91%E9%96%92%E9%A6%AC%E5%A0%B4) |
| songbai-market | public/passport/index.html:213 | [外鏈 1](https://www.google.com/maps/search/?api=1&query=%E6%9D%BE%E6%9F%8F%E6%BC%81%E6%B8%AF%E7%94%9F%E9%B1%BB%E5%B8%82%E9%9B%86) |
| sunflower-farm | public/passport/index.html:214 | [外鏈 1](https://www.google.com/maps/search/?api=1&query=%E6%9D%8E%E5%AE%89%E5%A6%AE%E5%90%91%E6%97%A5%E8%91%B5%E8%BE%B2%E5%A0%B4) |
| huangmiao-shrine | public/passport/index.html:215 | [外鏈 1](https://www.google.com/maps/search/?api=1&query=%E9%BB%83%E8%8B%97%E7%A5%A0%20%E5%A4%A7%E7%94%B2) |
| jianxing-temple | public/passport/index.html:216 | [外鏈 1](https://maps.app.goo.gl/sAawGo8cPvHSgXPDA) |
| jiuzhangli | content/seed.sql (place-2, public_content after updates)<br>app/visit/page.tsx | [外鏈 1](https://www.google.com/maps/search/?api=1&query=%E4%B9%9D%E5%BC%B5%E7%8A%81%20%E5%A4%A7%E7%94%B2) |
| rinan-spring | content/seed.sql (place-3, public_content after updates)<br>app/visit/page.tsx | [外鏈 1](https://www.google.com/maps/search/?api=1&query=%E6%97%A5%E5%8D%97%E5%86%B7%E6%B3%89%20%E5%A4%A7%E7%94%B2) |
| youshi-industrial | content/seed.sql (place-4, public_content after updates)<br>app/visit/page.tsx | [外鏈 1](https://www.google.com/maps/search/?api=1&query=%E5%A4%A7%E7%94%B2%E5%B9%BC%E7%8D%85%E5%B7%A5%E6%A5%AD%E5%8D%80) |
| songbai-harbor | content/seed.sql (place-5, public_content after updates)<br>app/visit/page.tsx | [外鏈 1](https://www.google.com/maps/search/?api=1&query=%E6%9D%BE%E6%9F%8F%E6%BC%81%E6%B8%AF%20%E5%A4%A7%E7%94%B2) |
| jiuzhangli-park | content/seed.sql (place-7, public_content after updates)<br>app/visit/page.tsx | [外鏈 1](https://www.google.com/maps/search/?api=1&query=%E4%B9%9D%E5%BC%B5%E7%8A%81%E5%85%AC%E5%9C%92%20%E5%A4%A7%E7%94%B2)<br>別名：臺中市大甲區太白里九張犂休憩公園 |

## 驗證結果

- 所有 ID 唯一；所有地點具內容入口及原導航或官方社群；護照使用穩定 `#passport-N` 錨點。
- 所有有座標資料均附查核 URL、日期、方式及名稱／地址匹配證據；無固定據點為 null，不用虛構位置。
- 所有已定位資料的九里內外分類與同版 boundaries point-in-polygon 相符。
- 使用既有根路徑內容連結，保留 GitHub Pages base path 由前端統一處理。
- 不將同一地點的鏡頭中心視為 pin、不為標記避讓製造坐標、不把導航點擊當作實際到訪。
