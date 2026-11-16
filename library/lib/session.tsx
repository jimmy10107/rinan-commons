"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./supabase";

export type Role = "director" | "staff" | "member" | "none";
export type Who = { role: Role; card_no: string | null; email: string | null };

export const HOME: Record<Role, string> = { director: "/desk", staff: "/desk", member: "/me", none: "/no-access" };

/** 讀出目前身分（會先替會員認領借書證）。前端只用來決定顯示哪個畫面，資料權限由資料庫把關。 */
export async function resolveWho(): Promise<Who | null> {
  const sb = supabase();
  const { data } = await sb.auth.getUser();
  if (!data.user) return null;
  await sb.rpc("claim_membership");
  const { data: who, error } = await sb.rpc("whoami");
  if (error || !who) return { role: "none", card_no: null, email: data.user.email ?? null };
  return who as Who;
}

/** 頁面守門：身分不符就送回該去的地方 */
export function useWho(allowed: Role[]) {
  const router = useRouter();
  const [who, setWho] = useState<Who | null>(null);
  useEffect(() => {
    let alive = true;
    resolveWho().then((w) => {
      if (!alive) return;
      if (!w) { router.replace("/login"); return; }
      if (!allowed.includes(w.role)) { router.replace(HOME[w.role]); return; }
      setWho(w);
    });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return who;
}

export async function signOut() {
  await supabase().auth.signOut();
  window.location.href = "/login";
}
