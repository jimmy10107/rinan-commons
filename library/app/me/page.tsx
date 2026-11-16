"use client";
import { useEffect, useState } from "react";
import { supabase, errText } from "@/lib/supabase";
import { useWho } from "@/lib/session";
import { daysLeft, fmtDT, fmtShort, isLate } from "@/lib/format";
import { Header, Loading } from "@/components/ui";
import { Ticket } from "@/components/ticket";

type Loan = { id: number; book_code: string; out_at: string; due_at: string; returned_at: string | null; books: { title: string; author: string } | null };

export default function Me() {
  const who = useWho(["member"]);
  const [me, setMe] = useState<any>(null);
  const [loans, setLoans] = useState<Loan[] | null>(null);
  const [lib, setLib] = useState("日南書架");
  const [phone, setPhone] = useState<string | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!who?.card_no) return;
    const sb = supabase();
    (async () => {
      // 資料庫規則只會回傳本人的資料
      const [m, l, s] = await Promise.all([
        sb.from("members").select("card_no, name, email, phone_masked, active, created_at").eq("card_no", who.card_no).single(),
        sb.from("loans").select("id, book_code, out_at, due_at, returned_at, books(title, author)").order("out_at", { ascending: false }).limit(500),
        sb.from("settings").select("library_name, loan_days, max_loans").single(),
      ]);
      if (m.error || l.error) { setErr(errText(m.error || l.error)); return; }
      setMe({ ...m.data, rules: s.data });
      setLoans(l.data as any);
      if (s.data?.library_name) setLib(s.data.library_name);
    })();
  }, [who]);

  if (!who) return <Loading />;
  const current = (loans || []).filter((l) => !l.returned_at).sort((a, b) => Date.parse(a.due_at) - Date.parse(b.due_at));
  const past = (loans || []).filter((l) => l.returned_at);
  const lateN = current.filter(isLate).length;

  return (
    <div className="shell member">
      <Header who={who} title="我的借書證" />
      {err && <div className="banner">{err}</div>}
      {!me ? <Loading /> : (
        <>
          <Ticket name={me.name} cardNo={me.card_no} since={me.created_at} library={lib} active={me.active} />
          <p className="sub" style={{ textAlign: "center", margin: 0 }}>借書時把這張證的條碼給櫃台掃描即可。</p>

          {lateN > 0 && <div className="banner">有 {lateN} 本已經逾期，請盡快拿回日南書架歸還。</div>}

          <section className="panel">
            <h2>目前借閱</h2>
            <p className="sub" style={{ margin: 0 }}>借期 {me.rules?.loan_days ?? 14} 天，最多同時借 {me.rules?.max_loans ?? 3} 本。你現在借了 {current.length} 本。</p>
            <div className="list">
              {current.length === 0 && <p className="empty">目前沒有借書。到書架挑一本，拿到櫃台就能借。</p>}
              {current.map((l) => {
                const d = daysLeft(l.due_at), late = isLate(l);
                return (
                  <div className="item" key={l.id}>
                    <div className="t"><strong>{l.books?.title ?? l.book_code}</strong><div className="sub">{l.books?.author}　借出 {fmtShort(l.out_at)}</div></div>
                    <div className="r"><span className={"due" + (late ? " late" : d <= 2 ? " soon" : "")}>
                      {late ? `逾期 ${-d} 天` : d === 0 ? "今天到期" : `${fmtShort(l.due_at)} 到期`}</span></div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="panel">
            <h2>借閱歷程</h2>
            <div className="list">
              {past.length === 0 && <p className="empty">還書之後，紀錄會留在這裡。</p>}
              {past.map((l) => (
                <div className="item" key={l.id}>
                  <div className="t"><strong>{l.books?.title ?? l.book_code}</strong><div className="sub">借 {fmtDT(l.out_at)}　還 {fmtDT(l.returned_at!)}</div></div>
                  <div className="r"><span className="badge in">已還</span></div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <h2>登記資料</h2>
            <dl className="kv">
              <dt>姓名</dt><dd>{me.name}</dd>
              <dt>Email</dt><dd>{me.email}</dd>
              <dt>電話</dt><dd>{phone ?? me.phone_masked ?? "—"}{phone === null && me.phone_masked &&
                <> <button className="link" type="button" onClick={async () => { const r = await supabase().rpc("reveal_phone", { p_card: me.card_no }); if (!r.error) setPhone(r.data); }}>顯示完整號碼</button></>}</dd>
            </dl>
            <p className="sub" style={{ margin: 0 }}>資料有誤請告訴櫃台人員修改。這頁只有你自己看得到。</p>
          </section>
        </>
      )}
    </div>
  );
}
