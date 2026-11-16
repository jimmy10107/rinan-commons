"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase, errText } from "@/lib/supabase";
import { useWho } from "@/lib/session";
import { cleanIsbn, dayKey, fmtDT, fmtHM, fmtShort, isLate, norm } from "@/lib/format";
import { Dialog, Header, Loading, Msg, Status } from "@/components/ui";
import { Barcode, Scanner } from "@/components/barcode";
import { Ticket } from "@/components/ticket";

type Book = { code: string; title: string; subtitle: string; author: string; publisher: string; category: string; location: string; planted: string; isbn: string | null };
type Member = { card_no: string; name: string; email: string | null; phone_masked: string; note: string; user_id: string | null; active: boolean; created_at: string };
type Loan = { id: number; book_code: string; card_no: string; out_at: string; due_at: string; returned_at: string | null };
type M = { text: string; kind?: "ok" | "bad" } | null;
type View = "desk" | "books" | "members" | "log";

const MEMBER_COLS = "card_no, name, email, phone_masked, note, user_id, active, created_at";

export default function Desk() {
  const who = useWho(["staff", "director"]);
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [rules, setRules] = useState({ loan_days: 14, max_loans: 3, library_name: "日南書架" });
  const [ready, setReady] = useState(false);
  const [loadErr, setLoadErr] = useState("");
  const [view, setView] = useState<View>("desk");

  const load = useCallback(async () => {
    const sb = supabase();
    const [b, m, l, s] = await Promise.all([
      sb.from("books").select("code, title, subtitle, author, publisher, category, location, planted, isbn").order("code"),
      sb.from("members").select(MEMBER_COLS).order("created_at", { ascending: false }),
      sb.from("loans").select("id, book_code, card_no, out_at, due_at, returned_at").order("out_at", { ascending: false }).limit(5000),
      sb.from("settings").select("loan_days, max_loans, library_name").single(),
    ]);
    const e = b.error || m.error || l.error;
    if (e) { setLoadErr(errText(e)); return; }
    setBooks(b.data as Book[]); setMembers(m.data as Member[]); setLoans(l.data as Loan[]); if (s.data) setRules(s.data);
    setLoadErr(""); setReady(true);
  }, []);

  useEffect(() => { if (who) load(); }, [who, load]);
  // 其他櫃台人員的操作：每 30 秒同步一次，切回這個分頁時也同步
  useEffect(() => {
    if (!who) return;
    const id = setInterval(load, 30000);
    const vis = () => { if (document.visibilityState === "visible") load(); };
    document.addEventListener("visibilitychange", vis);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", vis); };
  }, [who, load]);
  useEffect(() => {
    const h = () => { const v = location.hash.slice(1) as View; if (["desk", "books", "members", "log"].includes(v)) setView(v); };
    h(); window.addEventListener("hashchange", h); return () => window.removeEventListener("hashchange", h);
  }, []);
  const go = (v: View) => { setView(v); history.replaceState(null, "", "#" + v); };

  const bookBy = useMemo(() => new Map(books.map((b) => [b.code, b])), [books]);
  const memberBy = useMemo(() => new Map(members.map((m) => [m.card_no, m])), [members]);
  const openBy = useMemo(() => new Map(loans.filter((l) => !l.returned_at).map((l) => [l.book_code, l])), [loans]);

  const [dlgBook, setDlgBook] = useState<string | null>(null);
  const [dlgMember, setDlgMember] = useState<string | null>(null);
  const [preMember, setPreMember] = useState<string | null>(null);

  if (!who) return <Loading />;
  const ctx = { books, members, loans, rules, bookBy, memberBy, openBy, load, openBook: setDlgBook, openMember: setDlgMember };
  const outN = openBy.size;

  return (
    <div className="shell">
      <Header who={who} title="借書櫃台" />
      {loadErr && <div className="banner">{loadErr}</div>}
      <nav className="tabs" role="tablist">
        {([["desk", "櫃台", ""], ["books", "館藏", books.length], ["members", "會員", members.length], ["log", "借閱紀錄", outN + " 借出中"]] as const).map(([v, l, n]) => (
          <button key={v} className="tab" role="tab" aria-selected={view === v} type="button" onClick={() => go(v)}>{l}{n !== "" && <span className="n">{n}</span>}</button>
        ))}
      </nav>
      {!ready ? <Loading /> : (
        <>
          {view === "desk" && <DeskView ctx={ctx} preMember={preMember} clearPre={() => setPreMember(null)} />}
          {view === "books" && <BooksView ctx={ctx} />}
          {view === "members" && <MembersView ctx={ctx} />}
          {view === "log" && <LogView ctx={ctx} />}
        </>
      )}
      <BookDialog ctx={ctx} code={dlgBook} onClose={() => setDlgBook(null)} />
      <MemberDialog ctx={ctx} card={dlgMember} onClose={() => setDlgMember(null)}
        onBorrow={(c) => { setDlgMember(null); setPreMember(c); go("desk"); }} />
    </div>
  );
}

type Ctx = {
  books: Book[]; members: Member[]; loans: Loan[]; rules: { loan_days: number; max_loans: number; library_name: string };
  bookBy: Map<string, Book>; memberBy: Map<string, Member>; openBy: Map<string, Loan>;
  load: () => Promise<void>; openBook: (c: string) => void; openMember: (c: string) => void;
};

function findBooks(q: string, list: Book[]) {
  const n = norm(q); if (!n) return [];
  const isbn = cleanIsbn(q);
  const exact = list.filter((b) => norm(b.code) === n || (isbn.length >= 10 && b.isbn === isbn));
  if (exact.length) return exact;
  return list.filter((b) => norm([b.title, b.subtitle, b.author, b.publisher, b.code, b.isbn].join(" ")).includes(n)).slice(0, 8);
}
function findMembers(q: string, list: Member[]) {
  const n = norm(q); if (!n) return [];
  const exact = list.filter((m) => norm(m.card_no) === n);
  if (exact.length) return exact;
  return list.filter((m) => norm([m.name, m.email, m.card_no, m.phone_masked.slice(-3)].join(" ")).includes(n)).slice(0, 8);
}
function dueFromToday(days: number) { return Date.now() + days * 864e5; }

/* ================================================================ 櫃台 */
function DeskView({ ctx, preMember, clearPre }: { ctx: Ctx; preMember: string | null; clearPre: () => void }) {
  const [mode, setMode] = useState<"borrow" | "return">("borrow");
  return (
    <div className="cols">
      <section className="panel">
        <div className="seg">
          <button type="button" aria-pressed={mode === "borrow"} onClick={() => setMode("borrow")}>借書</button>
          <button type="button" aria-pressed={mode === "return"} onClick={() => setMode("return")}>還書</button>
        </div>
        {mode === "borrow" ? <Borrow ctx={ctx} preMember={preMember} clearPre={clearPre} /> : <Return ctx={ctx} />}
      </section>
      <Today ctx={ctx} />
    </div>
  );
}

function Borrow({ ctx, preMember, clearPre }: { ctx: Ctx; preMember: string | null; clearPre: () => void }) {
  const [mq, setMq] = useState(""); const [card, setCard] = useState<string | null>(preMember);
  const [bq, setBq] = useState(""); const [picked, setPicked] = useState<string[]>([]);
  const [scan, setScan] = useState<null | "member" | "book">(null);
  const [bm, setBm] = useState<M>(null); const [done, setDone] = useState<M>(null); const [busy, setBusy] = useState(false);
  useEffect(() => { if (preMember) { setCard(preMember); clearPre(); } }, [preMember, clearPre]);

  const member = card ? ctx.memberBy.get(card) : null;
  const have = card ? ctx.loans.filter((l) => l.card_no === card && !l.returned_at).length : 0;
  const mHits = card ? [] : findMembers(mq, ctx.members);
  const bHits = findBooks(bq, ctx.books).filter((b) => !picked.includes(b.code));

  const chooseMember = (c: string) => { const m = ctx.memberBy.get(c); if (!m) return; setCard(c); setMq(""); setDone(null); };
  const addBook = (code: string) => {
    if (ctx.openBy.has(code)) { setBm({ text: `《${ctx.bookBy.get(code)?.title}》目前借出中，要先還書。`, kind: "bad" }); return; }
    if (!picked.includes(code)) setPicked([...picked, code]);
    setBq(""); setBm(null); setDone(null);
  };
  const onScanMember = useCallback((code: string) => {
    setScan(null); const hits = findMembers(code, ctx.members);
    if (hits.length === 1) chooseMember(hits[0].card_no); else setMq(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.members]);
  const onScanBook = useCallback((code: string) => {
    setScan(null); const hits = findBooks(code, ctx.books);
    if (hits.length === 1) addBook(hits[0].code);
    else setBm({ text: `掃到 ${code}，館藏裡找不到。若是書上的 ISBN，請先到「館藏」為這本書登錄 ISBN。`, kind: "bad" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.books, picked, ctx.openBy]);

  async function confirm() {
    if (!card || !picked.length) return;
    setBusy(true);
    const { data, error } = await supabase().rpc("borrow_books", { p_card: card, p_codes: picked });
    setBusy(false);
    if (error) { setDone({ text: errText(error), kind: "bad" }); return; }
    setDone({ text: `${fmtDT(data.at)} 已借出 ${data.count} 本給 ${member?.name}，${fmtShort(data.due_at)} 前歸還。`, kind: "ok" });
    setPicked([]); setCard(null); await ctx.load();
  }

  return (
    <>
      <div className="step">
        <div className="step-lab"><span className="num">1</span>誰要借？</div>
        {member ? (
          <div className="chosen">
            <span className="t"><strong>{member.name}</strong>　<span className="code">{member.card_no}</span>
              <div className="sub">目前借了 {have} 本，最多 {ctx.rules.max_loans} 本{!member.active && "　・此證已停用"}</div></span>
            <button className="link" type="button" onClick={() => setCard(null)}>換人</button>
          </div>
        ) : (
          <>
            <div className="row">
              <input className="big" type="search" id="m-q" placeholder="掃描或輸入借書證號，也可以打姓名" autoComplete="off" value={mq}
                onChange={(e) => setMq(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && mHits.length === 1) chooseMember(mHits[0].card_no); }} />
              <button className="btn ghost" type="button" onClick={() => setScan("member")}>掃借書證</button>
            </div>
            <div className="sug">
              {mHits.map((m) => (
                <button key={m.card_no} className="opt" type="button" onClick={() => chooseMember(m.card_no)}>
                  <span className="t">{m.name}<span className="sub">　{m.phone_masked}</span></span><span className="code">{m.card_no}</span>
                </button>
              ))}
              {mq.trim() && !mHits.length && <p className="msg">找不到這位會員。可到「會員」分頁辦新的借書證。</p>}
            </div>
          </>
        )}
      </div>

      <div className="step">
        <div className="step-lab"><span className="num">2</span>借哪幾本？</div>
        <div className="row">
          <input className="big" type="search" id="b-q" placeholder="掃描或輸入館藏碼、ISBN，也可以打書名" autoComplete="off" value={bq}
            onChange={(e) => { setBq(e.target.value); setBm(null); }} onKeyDown={(e) => { if (e.key === "Enter" && bHits.length === 1) addBook(bHits[0].code); }} />
          <button className="btn ghost" type="button" onClick={() => setScan("book")}>掃書</button>
        </div>
        <Msg m={bm} />
        <div className="sug">
          {bHits.map((b) => { const l = ctx.openBy.get(b.code); return (
            <button key={b.code} className="opt" type="button" disabled={!!l} onClick={() => addBook(b.code)}>
              <span className="t">{b.title}<span className="sub">　{b.author}</span></span>
              <span className="row" style={{ flex: "none" }}><span className="code">{b.code}</span><Status out={!!l} late={l ? isLate(l) : false} /></span>
            </button>); })}
          {bq.trim() && !bHits.length && <p className="msg">館藏裡找不到。可到「館藏」分頁新增這本書。</p>}
        </div>
        {picked.map((c) => (
          <div className="chosen" key={c}>
            <span className="t"><strong>{ctx.bookBy.get(c)?.title}</strong>　<span className="code">{c}</span></span>
            <button className="link" type="button" onClick={() => setPicked(picked.filter((x) => x !== c))}>移除</button>
          </div>
        ))}
      </div>

      <div className="step">
        <div className="step-lab"><span className="num">3</span>確認</div>
        <p className="msg">{card && picked.length
          ? `借出 ${picked.length} 本，${fmtShort(dueFromToday(ctx.rules.loan_days))} 前歸還（借期 ${ctx.rules.loan_days} 天）。`
          : "選好會員和書之後，按下方按鈕就完成。"}</p>
        <button className="btn go" type="button" disabled={!card || !picked.length || busy} onClick={confirm}>{busy ? "處理中…" : "確認借出"}</button>
        <Msg m={done} />
      </div>
      {scan && <Scanner onCode={scan === "member" ? onScanMember : onScanBook} onClose={() => setScan(null)} />}
    </>
  );
}

function Return({ ctx }: { ctx: Ctx }) {
  const [q, setQ] = useState(""); const [m, setM] = useState<M>(null); const [scan, setScan] = useState(false); const [busy, setBusy] = useState<string | null>(null);
  const open = ctx.loans.filter((l) => !l.returned_at).sort((a, b) => Date.parse(a.due_at) - Date.parse(b.due_at));
  const n = norm(q), isbn = cleanIsbn(q);
  const shown = n ? open.filter((l) => { const b = ctx.bookBy.get(l.book_code), mm = ctx.memberBy.get(l.card_no);
    return (isbn.length >= 10 && b?.isbn === isbn) || norm([b?.title, l.book_code, mm?.name, l.card_no].join(" ")).includes(n); }) : open;

  async function doReturn(code: string) {
    setBusy(code);
    const { data, error } = await supabase().rpc("return_book", { p_code: code });
    setBusy(null);
    if (error) return setM({ text: errText(error), kind: "bad" });
    setM({ text: `${fmtDT(data.at)} 已歸還《${ctx.bookBy.get(code)?.title}》。`, kind: "ok" }); setQ(""); await ctx.load();
  }
  const onScan = useCallback((code: string) => { setScan(false); setQ(code); }, []);

  return (
    <>
      <div className="step">
        <div className="step-lab"><span className="num">1</span>還哪一本？</div>
        <div className="row">
          <input className="big" type="search" id="r-q" placeholder="掃描或輸入館藏碼、ISBN，也可以打書名或會員姓名" autoComplete="off" value={q}
            onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && n && shown.length === 1) doReturn(shown[0].book_code); }} />
          <button className="btn ghost" type="button" onClick={() => setScan(true)}>掃書</button>
        </div>
        <Msg m={m} />
      </div>
      <div className="step">
        <div className="step-lab"><span className="num">2</span>按「還書」</div>
        <div className="list">
          {shown.length === 0 && <p className="empty">{q ? "借出中的書裡沒有符合的。" : "目前沒有借出中的書。"}</p>}
          {shown.map((l) => <LoanRow key={l.id} ctx={ctx} l={l} action={<button className="btn sm" type="button" disabled={busy === l.book_code} onClick={() => doReturn(l.book_code)}>還書</button>} />)}
        </div>
      </div>
      {scan && <Scanner onCode={onScan} onClose={() => setScan(false)} />}
    </>
  );
}

function Today({ ctx }: { ctx: Ctx }) {
  const k = dayKey(Date.now());
  const ev: { t: string; kind: "借出" | "歸還"; l: Loan }[] = [];
  ctx.loans.forEach((l) => {
    if (dayKey(l.out_at) === k) ev.push({ t: l.out_at, kind: "借出", l });
    if (l.returned_at && dayKey(l.returned_at) === k) ev.push({ t: l.returned_at, kind: "歸還", l });
  });
  ev.sort((a, b) => Date.parse(b.t) - Date.parse(a.t));
  const late = ctx.loans.filter(isLate).length;
  return (
    <section className="panel">
      <h2>今天的紀錄</h2>
      {late > 0 && <div className="banner">目前有 {late} 本逾期未還，可在「借閱紀錄」篩選逾期。</div>}
      <div className="list">
        {ev.length === 0 && <p className="empty">今天還沒有借還書。完成後會依時間列在這裡。</p>}
        {ev.map((e, i) => (
          <button className="item" type="button" key={i} onClick={() => ctx.openBook(e.l.book_code)}>
            <div className="t"><span className="time">{fmtHM(e.t)}</span><strong>{ctx.bookBy.get(e.l.book_code)?.title}</strong>
              <div className="sub">{ctx.memberBy.get(e.l.card_no)?.name}　{e.l.card_no}</div></div>
            <div className="r"><span className={"badge " + (e.kind === "借出" ? "out" : "in")}>{e.kind}</span></div>
          </button>
        ))}
      </div>
    </section>
  );
}

function LoanRow({ ctx, l, action }: { ctx: Ctx; l: Loan; action?: React.ReactNode }) {
  const b = ctx.bookBy.get(l.book_code), m = ctx.memberBy.get(l.card_no);
  return (
    <div className="item">
      <div className="t"><strong>{b?.title ?? l.book_code}</strong>
        <div className="sub">{m?.name ?? l.card_no}　<span className="code">{l.book_code}</span>　借 {fmtDT(l.out_at)}{l.returned_at ? `　還 ${fmtDT(l.returned_at)}` : `　${fmtShort(l.due_at)} 到期`}</div></div>
      <div className="r">{l.returned_at ? <span className="badge in">已還</span> : <Status out late={isLate(l)} />}{action}</div>
    </div>
  );
}

/* ================================================================ 館藏 */
function BooksView({ ctx }: { ctx: Ctx }) {
  const [q, setQ] = useState(""); const [f, setF] = useState<"all" | "in" | "out" | "late" | "noisbn">("all");
  const n = norm(q);
  const list = ctx.books.filter((b) => {
    const l = ctx.openBy.get(b.code);
    const ok = f === "all" || (f === "in" && !l) || (f === "out" && l) || (f === "late" && l && isLate(l)) || (f === "noisbn" && !b.isbn);
    return ok && (!n || norm([b.title, b.subtitle, b.author, b.publisher, b.code, b.isbn].join(" ")).includes(n));
  });
  return (
    <section className="panel">
      <AddBook ctx={ctx} />
      <input type="search" id="bk-q" placeholder="搜尋書名、作者、出版社、館藏碼、ISBN" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="chips">
        {([["all", "全部"], ["in", "在架上"], ["out", "借出中"], ["late", "逾期"], ["noisbn", "未登錄 ISBN"]] as const).map(([v, l]) => (
          <button key={v} className="chip" type="button" aria-pressed={f === v} onClick={() => setF(v)}>{l}</button>))}
      </div>
      <div className="list">
        {list.length === 0 && <p className="empty">沒有符合的書。</p>}
        {list.map((b) => { const l = ctx.openBy.get(b.code); return (
          <button key={b.code} className="item" type="button" onClick={() => ctx.openBook(b.code)}>
            <div className="t"><strong>{b.title}</strong><div className="sub">{[b.author, b.publisher, b.location].filter(Boolean).join("｜")}</div></div>
            <div className="r"><span className="code">{b.code}</span><Status out={!!l} late={l ? isLate(l) : false} /></div>
          </button>); })}
      </div>
    </section>
  );
}

function AddBook({ ctx }: { ctx: Ctx }) {
  const [v, setV] = useState({ title: "", author: "", publisher: "", isbn: "", location: "" });
  const [m, setM] = useState<M>(null); const [scan, setScan] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const isbn = cleanIsbn(v.isbn);
    if (isbn && isbn.length !== 10 && isbn.length !== 13) return setM({ text: "ISBN 應為 10 或 13 碼。", kind: "bad" });
    const { data, error } = await supabase().rpc("add_book", { p_title: v.title, p_author: v.author, p_publisher: v.publisher, p_isbn: isbn || null, p_category: "", p_location: v.location });
    if (error) return setM({ text: /duplicate|unique/i.test(error.message) ? "這個 ISBN 已經在館藏裡了。" : errText(error), kind: "bad" });
    setM({ text: `已加入《${v.title}》，館藏碼 ${data}。可點這本書列印館藏條碼。`, kind: "ok" });
    setV({ title: "", author: "", publisher: "", isbn: "", location: "" }); ctx.load();
  }
  return (
    <details className="add">
      <summary>新增一本書</summary>
      <form className="form" onSubmit={submit}>
        <label className="f">書名（必填）<input type="text" id="ab-title" required maxLength={200} value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} /></label>
        <label className="f">ISBN<span className="row"><input type="text" id="ab-isbn" inputMode="numeric" maxLength={20} value={v.isbn} onChange={(e) => setV({ ...v, isbn: e.target.value })} />
          <button className="btn ghost sm" type="button" onClick={() => setScan(true)}>掃描</button></span></label>
        <label className="f">作者<input type="text" id="ab-author" maxLength={120} value={v.author} onChange={(e) => setV({ ...v, author: e.target.value })} /></label>
        <label className="f">出版社<input type="text" id="ab-pub" maxLength={80} value={v.publisher} onChange={(e) => setV({ ...v, publisher: e.target.value })} /></label>
        <label className="f">放在哪裡<input type="text" id="ab-loc" maxLength={60} placeholder="例：黑色書櫃" value={v.location} onChange={(e) => setV({ ...v, location: e.target.value })} /></label>
        <button className="btn" type="submit">加入館藏</button>
        <p className="msg wide">館藏碼會自動編號，並記下今天為種下日期。</p>
      </form>
      <Msg m={m} />
      {scan && <Scanner onCode={(c) => { setScan(false); setV((x) => ({ ...x, isbn: cleanIsbn(c) })); }} onClose={() => setScan(false)} />}
    </details>
  );
}

function BookDialog({ ctx, code, onClose }: { ctx: Ctx; code: string | null; onClose: () => void }) {
  const b = code ? ctx.bookBy.get(code) : null;
  const [isbn, setIsbn] = useState(""); const [m, setM] = useState<M>(null); const [scan, setScan] = useState(false);
  useEffect(() => { setIsbn(b?.isbn ?? ""); setM(null); }, [code, b?.isbn]);
  if (!b) return <Dialog open={false} onClose={onClose} title="">{null}</Dialog>;
  const l = ctx.openBy.get(b.code);
  const hist = ctx.loans.filter((x) => x.book_code === b.code);
  async function save() {
    const v = cleanIsbn(isbn);
    if (v && v.length !== 10 && v.length !== 13) return setM({ text: "ISBN 應為 10 或 13 碼。", kind: "bad" });
    const { error } = await supabase().rpc("set_book_isbn", { p_code: b!.code, p_isbn: v || null });
    if (error) return setM({ text: /duplicate|unique/i.test(error.message) ? "這個 ISBN 已登錄在另一本書。" : errText(error), kind: "bad" });
    setM({ text: "已儲存。之後掃這本書背面的條碼就能找到它。", kind: "ok" }); ctx.load();
  }
  async function ret() {
    const { error } = await supabase().rpc("return_book", { p_code: b!.code });
    if (error) return setM({ text: errText(error), kind: "bad" });
    setM({ text: "已歸還。", kind: "ok" }); ctx.load();
  }
  return (
    <Dialog open onClose={onClose} title={b.title + (b.subtitle ? "：" + b.subtitle : "")}>
      <dl className="kv">
        <dt>狀態</dt><dd><Status out={!!l} late={l ? isLate(l) : false} />{l && <>　{ctx.memberBy.get(l.card_no)?.name}，{fmtShort(l.due_at)} 到期</>}</dd>
        <dt>作者</dt><dd>{b.author || "—"}</dd><dt>出版社</dt><dd>{b.publisher || "—"}</dd>
        <dt>位置</dt><dd>{b.location || "—"}</dd><dt>種下</dt><dd>{b.planted || "—"}</dd>
      </dl>
      {l && <button className="btn" type="button" onClick={ret}>還書</button>}
      <h4>館藏條碼（截圖列印後貼在書背）</h4>
      <Barcode value={b.code} />
      <h4>ISBN（書背面條碼下方的數字）</h4>
      <div className="row"><input type="text" id="dlg-isbn" inputMode="numeric" maxLength={20} value={isbn} onChange={(e) => setIsbn(e.target.value)} />
        <button className="btn ghost sm" type="button" onClick={() => setScan(true)}>掃描</button><button className="btn sm" type="button" onClick={save}>儲存</button></div>
      <Msg m={m} />
      <h4>這本書的借閱歷程</h4>
      <div className="list">{hist.length ? hist.map((x) => <LoanRow key={x.id} ctx={ctx} l={x} />) : <p className="empty">還沒有人借過。</p>}</div>
      {scan && <Scanner onCode={(c) => { setScan(false); setIsbn(cleanIsbn(c)); }} onClose={() => setScan(false)} />}
    </Dialog>
  );
}

/* ================================================================ 會員 */
function MembersView({ ctx }: { ctx: Ctx }) {
  const [v, setV] = useState({ name: "", email: "", phone: "", note: "" });
  const [m, setM] = useState<M>(null); const [q, setQ] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const { data, error } = await supabase().rpc("create_member", { p_name: v.name, p_email: v.email || null, p_phone: v.phone, p_note: v.note });
    if (error) return setM({ text: errText(error), kind: "bad" });
    setM({ text: `已發證給 ${v.name}，借書證號 ${data}。${v.email ? "對方用這個 email 登入就能看到自己的借書證。" : ""}`, kind: "ok" });
    setV({ name: "", email: "", phone: "", note: "" }); await ctx.load(); ctx.openMember(data);
  }
  const n = norm(q);
  const list = ctx.members.filter((x) => !n || norm([x.name, x.email, x.card_no, x.phone_masked.slice(-3)].join(" ")).includes(n));
  return (
    <section className="panel">
      <details className="add" open={ctx.members.length === 0}>
        <summary>辦新的借書證</summary>
        <form className="form" onSubmit={submit}>
          <label className="f">姓名（必填）<input type="text" id="am-name" required maxLength={60} value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></label>
          <label className="f">Email（會員用來登入看自己的借書證）<input type="email" id="am-email" maxLength={120} value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} /></label>
          <label className="f">電話<input type="tel" id="am-phone" maxLength={20} value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} /></label>
          <label className="f">備註<input type="text" id="am-note" maxLength={200} value={v.note} onChange={(e) => setV({ ...v, note: e.target.value })} /></label>
          <button className="btn" type="submit">發借書證</button>
          <p className="msg wide">證號會依年份自動編列，例如 RN26-0001。</p>
        </form>
        <Msg m={m} />
      </details>
      <input type="search" id="mb-q" placeholder="搜尋姓名、email、借書證號或電話末三碼" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="list">
        {list.length === 0 && <p className="empty">{ctx.members.length ? "沒有符合的會員。" : "還沒有會員。填上方的表單，發出第一張借書證。"}</p>}
        {list.map((x) => { const o = ctx.loans.filter((l) => l.card_no === x.card_no && !l.returned_at), late = o.some(isLate); return (
          <button key={x.card_no} className="item" type="button" onClick={() => ctx.openMember(x.card_no)}>
            <div className="t"><strong>{x.name}</strong><div className="sub">{[x.phone_masked, x.user_id ? "已綁定登入" : x.email ? "尚未登入" : "無 email"].filter(Boolean).join("｜")}</div></div>
            <div className="r"><span className="code">{x.card_no}</span>
              {!x.active ? <span className="badge late">停用</span> : o.length ? <span className={"badge " + (late ? "late" : "out")}>{late ? "有逾期・" : ""}借 {o.length} 本</span> : <span className="badge in">無借閱</span>}</div>
          </button>); })}
      </div>
    </section>
  );
}

function MemberDialog({ ctx, card, onClose, onBorrow }: { ctx: Ctx; card: string | null; onClose: () => void; onBorrow: (c: string) => void }) {
  const x = card ? ctx.memberBy.get(card) : null;
  const [phone, setPhone] = useState<string | null>(null);
  const [edit, setEdit] = useState(false);
  const [v, setV] = useState({ name: "", email: "", phone: "", note: "", active: true });
  const [m, setM] = useState<M>(null);
  useEffect(() => { setPhone(null); setEdit(false); setM(null); }, [card]);
  if (!x) return <Dialog open={false} onClose={onClose} title="">{null}</Dialog>;
  const cur = ctx.loans.filter((l) => l.card_no === x.card_no && !l.returned_at);
  const hist = ctx.loans.filter((l) => l.card_no === x.card_no);

  async function reveal(): Promise<string | null> {
    const { data, error } = await supabase().rpc("reveal_phone", { p_card: x!.card_no });
    if (error) { setM({ text: errText(error), kind: "bad" }); return null; }
    setPhone(data || "（未填）"); return (data as string) || "";
  }
  async function startEdit() {
    const p = phone ?? (await reveal()) ?? "";
    setV({ name: x!.name, email: x!.email ?? "", phone: p === "（未填）" ? "" : p, note: x!.note, active: x!.active }); setEdit(true);
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase().rpc("update_member", { p_card: x!.card_no, p_name: v.name, p_email: v.email || null, p_phone: v.phone, p_note: v.note, p_active: v.active });
    if (error) return setM({ text: /duplicate|unique/i.test(error.message) ? "這個 email 已被另一張借書證使用。" : errText(error), kind: "bad" });
    setM({ text: "已儲存。", kind: "ok" }); setEdit(false); setPhone(null); ctx.load();
  }
  return (
    <Dialog open onClose={onClose} title={x.name}>
      <Ticket name={x.name} cardNo={x.card_no} since={x.created_at} library={ctx.rules.library_name} active={x.active} />
      {!edit ? (
        <>
          <dl className="kv">
            <dt>Email</dt><dd>{x.email || "—"}{x.email && <span className="sub">　{x.user_id ? "已綁定登入" : "尚未登入"}</span>}</dd>
            <dt>電話</dt><dd>{phone ?? (x.phone_masked || "—")}{phone === null && x.phone_masked && <>　<button className="link" type="button" onClick={reveal}>顯示完整號碼</button><span className="sub">（會留下查看紀錄）</span></>}</dd>
            <dt>備註</dt><dd>{x.note || "—"}</dd><dt>累計借閱</dt><dd>{hist.length} 次</dd>
          </dl>
          <div className="row">
            {x.active && <button className="btn" type="button" onClick={() => onBorrow(x.card_no)}>幫這位會員借書</button>}
            <button className="btn quiet" type="button" onClick={startEdit}>修改資料</button>
          </div>
        </>
      ) : (
        <form className="form" onSubmit={save}>
          <label className="f">姓名<input type="text" id="ed-name" required maxLength={60} value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></label>
          <label className="f">Email<input type="email" id="ed-email" maxLength={120} value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} /></label>
          <label className="f">電話<input type="tel" id="ed-phone" maxLength={20} value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} /></label>
          <label className="f">備註<input type="text" id="ed-note" maxLength={200} value={v.note} onChange={(e) => setV({ ...v, note: e.target.value })} /></label>
          <label className="f wide" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><input type="checkbox" id="ed-active" checked={v.active} onChange={(e) => setV({ ...v, active: e.target.checked })} />借書證有效（取消勾選即停用，會員將無法登入查看，也不能借書）</label>
          <p className="msg wide">改了 email 之後，會員要用新的 email 重新登入。</p>
          <div className="row"><button className="btn" type="submit">儲存</button><button className="btn quiet" type="button" onClick={() => setEdit(false)}>取消</button></div>
        </form>
      )}
      <Msg m={m} />
      <h4>目前借閱</h4>
      <div className="list">{cur.length ? cur.map((l) => <LoanRow key={l.id} ctx={ctx} l={l} />) : <p className="empty">目前沒有借書。</p>}</div>
      <h4>借閱歷程</h4>
      <div className="list">{hist.length ? hist.map((l) => <LoanRow key={l.id} ctx={ctx} l={l} />) : <p className="empty">還沒有借閱紀錄。</p>}</div>
    </Dialog>
  );
}

/* ================================================================ 借閱紀錄 */
function LogView({ ctx }: { ctx: Ctx }) {
  const [q, setQ] = useState(""); const [f, setF] = useState<"all" | "out" | "late" | "done">("all");
  const n = norm(q);
  const list = ctx.loans.filter((l) => (f === "all" || (f === "out" && !l.returned_at) || (f === "late" && isLate(l)) || (f === "done" && l.returned_at))
    && (!n || norm([ctx.bookBy.get(l.book_code)?.title, l.book_code, ctx.memberBy.get(l.card_no)?.name, l.card_no].join(" ")).includes(n)));
  return (
    <section className="panel">
      <input type="search" id="lg-q" placeholder="搜尋書名、會員姓名或證號" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="chips">
        {([["all", "全部"], ["out", "借出中"], ["late", "逾期"], ["done", "已還"]] as const).map(([v, l]) => (
          <button key={v} className="chip" type="button" aria-pressed={f === v} onClick={() => setF(v)}>{l}</button>))}
      </div>
      <div className="list">
        {list.length === 0 && <p className="empty">{ctx.loans.length ? "沒有符合的紀錄。" : "還沒有借閱紀錄。每一次借出與歸還都會記在這裡，含日期與時間。"}</p>}
        {list.map((l) => <LoanRow key={l.id} ctx={ctx} l={l} />)}
      </div>
    </section>
  );
}
