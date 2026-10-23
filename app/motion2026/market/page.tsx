import type { Metadata } from "next";
import MarketPageLayout from "../market-preview/page-layout";

export const metadata: Metadata = {
  title: "走傱市集｜攤位介紹・場地配置圖",
  description: "走傱市集原訂 10/24 活動確定延期，新日期待公告；10/25 相關活動仍視天候及安全狀況評估。",
  alternates: { canonical: "https://www.rinancommons.com/motion2026/market/" },
  robots: { index: true, follow: true },
  openGraph: { title: "走傱市集｜攤位介紹・場地配置圖", description: "走傱市集 10/24 原訂活動確定延期，新日期待公告；10/25 相關活動尚待確認。", url: "https://www.rinancommons.com/motion2026/market/" },
};
export default function MarketPage() { return <MarketPageLayout />; }
