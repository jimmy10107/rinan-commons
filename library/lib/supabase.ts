"use client";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return client;
}

/** 把資料庫丟回來的錯誤轉成給人看的一句話 */
export function errText(e: any): string {
  const m = String(e?.message || "");
  if (/JWT|session|not authenticated/i.test(m)) return "登入已過期，請重新登入。";
  if (/Failed to fetch|NetworkError/i.test(m)) return "連不上伺服器，請檢查網路後再試。";
  if (/permission denied/i.test(m)) return "沒有權限做這件事。";
  return m || "發生錯誤，請再試一次。";
}
