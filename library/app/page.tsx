"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { HOME, resolveWho } from "@/lib/session";
import { Loading } from "@/components/ui";

// 登入後依身分分流：館長／職員 → 櫃台，會員 → 我的借書證，其他 → 無權限說明
export default function Home() {
  const router = useRouter();
  useEffect(() => { resolveWho().then((w) => router.replace(w ? HOME[w.role] : "/login")); }, [router]);
  return <Loading text="確認身分中…" />;
}
