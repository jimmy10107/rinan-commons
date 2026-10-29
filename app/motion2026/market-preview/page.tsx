import type { Metadata } from "next";
import MarketPageLayout from "./page-layout";

export const metadata: Metadata = {
  title: "走傱市集（預覽）",
  description: "走傱日南 2026 走傱市集｜10/31（六）16:30–21:00 日南車站旁廣場，20 組品牌介紹。",
  robots: { index: false, follow: false },
};
export default function MarketPreviewPage() { return <MarketPageLayout preview />; }
