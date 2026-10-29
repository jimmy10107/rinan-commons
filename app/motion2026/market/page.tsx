import type { Metadata } from "next";
import MarketPageLayout from "../market-preview/page-layout";

export const metadata: Metadata = {
  title: "走傱市集｜20 組品牌介紹",
  description: "10/31（六）17:00–21:00，日南車站旁廣場。認識走傱市集的餐飲美食、手作藝術、有機農產與臺日交流攤位。",
  alternates: { canonical: "https://www.rinancommons.com/motion2026/market/" },
  robots: { index: true, follow: true },
  openGraph: { title: "走傱市集｜20 組品牌介紹", description: "10/31（六）17:00–21:00，日南車站旁廣場。來吃米食、逛手作，認識地方品牌。", url: "https://www.rinancommons.com/motion2026/market/" },
};
export default function MarketPage() { return <MarketPageLayout />; }
