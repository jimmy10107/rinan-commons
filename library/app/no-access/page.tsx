"use client";
import { useWho, signOut } from "@/lib/session";
import { Loading } from "@/components/ui";

export default function NoAccess() {
  const who = useWho(["none"]);
  if (!who) return <Loading />;
  return (
    <main className="auth">
      <div className="auth-box">
        <h1>這個 email 還沒有借書證</h1>
        <p>你已用 <strong>{who.email}</strong> 登入，但系統裡找不到用這個 email 辦的借書證。</p>
        <p>請到日南書架櫃台辦證，或請館方確認登記的 email 是否正確。辦好後重新登入，就會看到你的借書證。</p>
        <button className="btn quiet" type="button" onClick={signOut}>換一個 email 登入</button>
      </div>
    </main>
  );
}
