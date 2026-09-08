import type { Metadata } from "next";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: {
    default: "日南稻站 Rinan Commons",
    template: "%s｜日南稻站",
  },
  description: "日南車站旁的地方文化據點。從一粒米出發，認識日南的人、土地與生活。",
  robots: { index: false, follow: false },
  other: { "codex-preview": "development" },
  icons: { icon: `${basePath}/favicon.svg`, shortcut: `${basePath}/favicon.svg` },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-Hant"><body>{children}</body></html>;
}
