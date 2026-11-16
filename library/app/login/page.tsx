"use client";
import { useState } from "react";
import { supabase, errText } from "@/lib/supabase";
import { Msg } from "@/components/ui";

export default function Login() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [m, setM] = useState<{ text: string; kind?: "ok" | "bad" } | null>(
    typeof window !== "undefined" && location.search.includes("e=link") ? { text: "登入連結已失效，請重新寄一次。", kind: "bad" } : null);

  async function send(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setM(null);
    const { error } = await supabase().auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true, emailRedirectTo: location.origin + "/auth/callback" },
    });
    setBusy(false);
    if (error) return setM({ text: /rate|seconds/i.test(error.message) ? "寄送太頻繁，請等一分鐘再試。" : errText(error), kind: "bad" });
    setSent(true); setM({ text: "登入碼已寄出，請到信箱收信。", kind: "ok" });
  }
  async function verify(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    const { error } = await supabase().auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
    setBusy(false);
    if (error) return setM({ text: "登入碼不對或已過期，請再確認一次，或重新寄送。", kind: "bad" });
    location.href = "/";
  }

  return (
    <main className="auth">
      <div className="auth-box">
        <div className="brand"><span className="brand-mark" aria-hidden="true">日南</span><div><strong>日南書架</strong><small>借書系統</small></div></div>
        <h1>登入</h1>
        {!sent ? (
          <form className="step" onSubmit={send}>
            <p>輸入辦借書證時登記的 email，我們會寄一組登入碼給你，不需要密碼。</p>
            <label className="f">Email<input className="big" type="email" id="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
            <button className="btn go" type="submit" disabled={busy}>{busy ? "寄送中…" : "寄登入碼"}</button>
          </form>
        ) : (
          <form className="step" onSubmit={verify}>
            <p>登入碼已寄到 <strong>{email}</strong>。輸入信裡的數字，或直接點信裡的登入連結。</p>
            <label className="f">登入碼<input className="big" type="text" id="code" inputMode="numeric" autoComplete="one-time-code" required maxLength={10} value={code} onChange={(e) => setCode(e.target.value)} /></label>
            <button className="btn go" type="submit" disabled={busy}>{busy ? "確認中…" : "登入"}</button>
            <button className="link" type="button" onClick={() => { setSent(false); setCode(""); setM(null); }}>換一個 email 或重新寄送</button>
          </form>
        )}
        <Msg m={m} />
      </div>
    </main>
  );
}
