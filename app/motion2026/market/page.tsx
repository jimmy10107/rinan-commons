import type { Metadata } from "next";
import MarketPageLayout from "../market-preview/page-layout";

export const metadata: Metadata = {
  title: "走傱市集｜攤位介紹・場地配置圖",
  description: "10/24（六）17:00–21:30，日南車站旁廣場。認識走傱市集的餐飲美食、手作藝術、有機農產與臺日交流攤位，閱讀品牌故事與社群連結。",
  alternates: { canonical: "https://www.rinancommons.com/motion2026/market/" },
  robots: { index: true, follow: true },
  openGraph: { title: "走傱市集｜攤位介紹・場地配置圖", description: "10/24（六）17:00–21:30，日南車站旁廣場。來吃米食、逛手作，認識地方品牌。", url: "https://www.rinancommons.com/motion2026/market/" },
};
export default function MarketPage() { return <MarketPageLayout />; }
