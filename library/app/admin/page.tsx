"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase, errText } from "@/lib/supabase";
import { useWho } from "@/lib/session";
import { fmtDT } from "@/lib/format";
import { Header, Loading, Msg } from "@/components/ui";

const ACTION: Record<string, string> = {
  "member.create": "發借書證", "member.update": "修改會員資料", "member.claim": "會員首次登入綁定",
  "member.reveal_phone": "查看完整電話", "loan.borrow": "借出", "loan.return": "歸還",
  "book.add": "新增館藏", "book.isbn": "登錄 ISBN", "staff.set_role": "變更職員權限", "settings.update": "修改借閱規則",
};
type M = { text: string; kind?: "ok" | "bad" } | null;

export default function Admin() {
  const who = useWho(["director"]);
  const [staff, setStaff] = useState<any[]>([]);
  const [audit, setAudit] = useState<any[]>([]);
  const [rules, setRules] = useState({ library_name: "", loan_days: 14, max_loans: 3 });
  const [email, setEmail] = useState(""); const [role, setRole] = useState("staff");
  const [m1, setM1] = useState<M>(null); const [m2, setM2] = useState<M>(null);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    const sb = supabase();
    const [s, a, r] = await Promise.all([
      sb.from("staff").select("user_id, email, role, created_at").order("created_at"),
      sb.from("audit_log").select("id, at, actor, action, target, detail").order("at", { ascending: false }).limit(300),
      sb.from("settings").select("library_name, loan_days, max_loans").single(),
    ]);
    setStaff(s.data || []); setAudit(a.data || []); if (r.data) setRules(r.data);
  }, []);
  useEffect(() => { if (who) load(); }, [who, load]);

  if (!who) return <Loading />;
  const byId = Object.fromEntries(staff.map((s) => [s.user_id, s.email]));
  const shown = audit.filter((a) => !q || [a.action, ACTION[a.action], a.target, byId[a.actor], JSON.stringify(a.detail)].join(" ").toLowerCase().includes(q.toLowerCase()));

  async function setStaffRole(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase().rpc("set_staff_role", { p_email: email.trim(), p_role: role });
    if (error) return setM1({ text: errText(error), kind: "bad" });
    setM1({ text: role === "none" ? `已移除 ${email} 的職員權限。` : `已把 ${email} 設為${role === "director" ? "館長" : "職員"}。`, kind: "ok" });
    setEmail(""); load();
  }
  async function saveRules(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase().rpc("update_settings", { p_library_name: rules.library_name, p_loan_days: Number(rules.loan_days), p_max_loans: Number(rules.max_loans) });
    setM2(error ? { text: errText(error), kind: "bad" } : { text: "已儲存。之後的借書都會套用新規則。", kind: "ok" }); load();
  }

  return (
    <div className="shell">
      <Header who={who} title="館長管理" />
      <div className="cols">
        <section className="panel">
          <h2>職員與權限</h2>
          <p className="sub" style={{ margin: 0 }}>請對方先用自己的 email 登入一次，再在這裡指定身分。職員可以借還書、發證、管理館藏；只有館長看得到稽核紀錄、能改規則與職員名單。</p>
          <form className="form" onSubmit={setStaffRole}>
            <label className="f wide">對方的 email<input type="email" id="staff-email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
            <label className="f">身分<select id="staff-role" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="staff">職員</option><option value="director">館長</option><option value="none">移除權限</option></select></label>
            <button className="btn" type="submit">套用</button>
          </form>
          <Msg m={m1} />
          <div className="list">
            {staff.map((s) => (
              <div className="item" key={s.user_id}>
                <div className="t"><strong>{s.email}</strong><div className="sub">加入 {fmtDT(s.created_at)}</div></div>
                <div className="r"><span className="badge role">{s.role === "director" ? "館長" : "職員"}</span></div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>借閱規則</h2>
          <form className="form" onSubmit={saveRules}>
            <label className="f wide">書架名稱（顯示在借書證上）<input type="text" id="lib-name" maxLength={30} value={rules.library_name} onChange={(e) => setRules({ ...rules, library_name: e.target.value })} /></label>
            <label className="f">借期（天）<input type="number" id="loan-days" min={1} max={120} value={rules.loan_days} onChange={(e) => setRules({ ...rules, loan_days: Number(e.target.value) })} /></label>
            <label className="f">每人最多借幾本<input type="number" id="max-loans" min={1} max={50} value={rules.max_loans} onChange={(e) => setRules({ ...rules, max_loans: Number(e.target.value) })} /></label>
            <button className="btn" type="submit">儲存規則</button>
          </form>
          <Msg m={m2} />
        </section>
      </div>

      <section className="panel">
        <h2>稽核紀錄</h2>
        <p className="sub" style={{ margin: 0 }}>每一次發證、借還書、查看電話、改權限都會記在這裡，任何人（包括館長）都無法修改或刪除。最近 300 筆。</p>
        <input type="search" id="audit-q" placeholder="搜尋動作、證號、職員 email" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="scroll-x">
          <table className="audit">
            <thead><tr><th>時間</th><th>誰</th><th>做了什麼</th><th>對象</th><th>細節</th></tr></thead>
            <tbody>
              {shown.map((a) => (
                <tr key={a.id}>
                  <td style={{ whiteSpace: "nowrap" }}>{fmtDT(a.at)}</td>
                  <td>{byId[a.actor] || (a.action === "member.claim" ? "會員本人" : "—")}</td>
                  <td>{ACTION[a.action] || a.action}</td>
                  <td className="code">{a.target}</td>
                  <td className="sub">{detailText(a)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {shown.length === 0 && <p className="empty">還沒有紀錄。</p>}
        </div>
      </section>
    </div>
  );
}

function detailText(a: any) {
  const d = a.detail || {};
  if (d.books) return d.books.join("、") + (d.due_at ? `，${fmtDT(d.due_at)} 到期` : "");
  if (d.book) return d.book;
  if (d.role) return { staff: "職員", director: "館長", none: "移除" }[d.role as string] || d.role;
  if (d.name) return d.name;
  if (d.title) return d.title;
  if (d.loan_days) return `借期 ${d.loan_days} 天，上限 ${d.max_loans} 本`;
  if ("isbn" in d) return d.isbn || "清除";
  return "";
}
