import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "走傱日南 2026",
  description: "2026 走傱日南 10/24–25 節目、市集、地方店家、觀光地圖、展覽手冊與報名資訊。",
};

export default function Walk2026Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
