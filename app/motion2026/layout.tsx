import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "走傱日南 2026",
  description: "2026 走傱日南 10/24–25 節目、市集、地方店家與日南觀光地圖。",
  alternates: { canonical: "https://www.rinancommons.com/motion2026" },
};

export default function Motion2026Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
