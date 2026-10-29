# 走傱市集正式時間鎖版｜2026-10-30

Owner: Codex（Lead 08 Digital & Data）
Deadline: 本回合交付
Checkpoint: 官網全域搜尋 → 文字與 metadata 同步 → 乾淨建置及既有測試 → 正式頁回讀
Definition of Done: 官網所有市集正式資訊統一為 10/31（六）16:30–21:00；演出仍為 17:00–21:00，五組演出時刻保持。

## Decision / Fact

本輪使用者明確指定「走傱市集｜10/31（六）16:30–21:00，都定錨成這個時間區間，修改所有正式資訊」。此指示取代前次 17:00–21:00 的市集時間基線。

## Execute / Coverage

- 首頁最新公告與近期活動卡片。
- 走傱日南活動頁與舊 /walk/2026 共用頁面的市集資訊。
- 正式市集頁、預覽頁的置頂公告、時間卡與頁面摘要／Open Graph。
- 全站浮動公告，含展開與收合狀態。
- 活動主頁與舊活動網址的搜尋摘要。
- 既有頁面測試，檢查市集 16:30 與演出 17:00 清楚分開。

沒有修改演出卡司、表演時段、20 組品牌名單或 10/25 歷史節目。原始歷史紀錄保留，以本文件作最新時間基線。

## Verification / State

State: Done。

- content:build、test:content、乾淨 build:pages、test:pages 全部通過。
- 發布提交：9fb4ba85ce351d685f733435f995a46cb8aa70f1；Vercel success。
- 正式首頁公告與活動卡片、活動頁市集區與搜尋摘要、市集頁置頂公告與時間卡、浮動公告展開／收合皆已逐項確認 16:30–21:00。
- 音樂演出仍為 17:00–21:00，五組時刻不變。
- 正式入口：https://www.rinancommons.com/motion2026/market 。

## Handoff

Next: 後續一律沿用本時間基線；WEB-16 已完成。
