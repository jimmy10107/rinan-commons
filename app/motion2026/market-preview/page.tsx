import type { Metadata } from "next";
import MarketPageLayout from "./page-layout";

export const metadata: Metadata = {
  title: "走傱市集（預覽）",
  description: "走傱日南 2026 走傱市集｜10/24 原訂活動已延期，新日期及規劃以後續官方公告為準。",
  robots: { index: false, follow: false },
};
export default function MarketPreviewPage() { return <MarketPageLayout preview />; }
