import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "走傱日南 2026",
  description: "走傱日南 2026 最新活動時刻：10/25 開幕系列、10/31 音樂演出與走傱市集。",
  alternates: { canonical: "https://www.rinancommons.com/motion2026" },
};

export default function Motion2026Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
