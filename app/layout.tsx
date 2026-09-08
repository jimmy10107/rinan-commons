import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "走傱日南｜活動與地方指南",
  description: "2026 走傱日南 10/24–25 節目、市集、地方店家、觀光地圖、策展手冊與夥伴資訊。",
  other: { "codex-preview": "development" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-Hant"><body>{children}</body></html>;
}
