import type { Metadata } from "next";
import "./globals.css";
import "./commons.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: {
    default: "日南稻站 Rinan Commons",
    template: "%s｜日南稻站",
  },
  description: "日南車站旁的地方文化據點。在往返之間，認識日南的人、土地與生活。",
  metadataBase: new URL("https://jimmy10107.github.io/rinan-commons/"),
  openGraph: { type: "website", locale: "zh_TW", siteName: "日南稻站 Rinan Commons", title: "日南稻站｜在往返之間，認識日南。", description: "日南車站旁的地方文化據點。看看展、坐一下，再往地方裡走。" },
  robots: { index: true, follow: true },
  icons: { icon: `${basePath}/favicon.svg`, shortcut: `${basePath}/favicon.svg` },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-Hant"><body>{children}</body></html>;
}
