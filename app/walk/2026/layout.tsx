import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "走傱日南 2026",
  description: "走傱日南 2026：10/25 開幕系列；10/31（六）走傱市集 16:30–21:00、音樂演出 17:00–21:00，日南車站旁廣場。",
};

export default function Walk2026Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
