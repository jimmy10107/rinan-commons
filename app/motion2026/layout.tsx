import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "走傱日南 2026",
  description: "走傱日南 2026：10/24 原訂活動確定延期，10/25 是否照常將視天候及安全狀況評估，請以官方後續公告為準。",
  alternates: { canonical: "https://www.rinancommons.com/motion2026" },
};

export default function Motion2026Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
