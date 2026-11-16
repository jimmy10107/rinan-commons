import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // 這個資料夾是獨立的網站，不沿用上層官網的設定
  turbopack: { root: path.resolve(__dirname) },
  outputFileTracingRoot: path.resolve(__dirname),
  // 不讓搜尋引擎收錄借書系統
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Robots-Tag", value: "noindex, nofollow" },
      { key: "Referrer-Policy", value: "same-origin" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
    ] }];
  },
};

export default nextConfig;
