import type { Metadata } from "next";
import MarketPageLayout from "./page-layout";

export const metadata: Metadata = {
  title: "走傱市集（預覽）",
  description: "走傱日南 2026 走傱市集｜10/24（六）17:00–21:30 日南車站旁廣場，場地配置圖與攤位介紹。",
  robots: { index: false, follow: false },
};
export default function MarketPreviewPage() { return <MarketPageLayout preview />; }
