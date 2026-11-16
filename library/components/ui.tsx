"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { fmtClock, fmtDate } from "@/lib/format";
import { signOut, type Who } from "@/lib/session";

export function Clock() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { setNow(Date.now()); const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  return (
    <div className="clock" aria-label="現在時間（台北）">
      <span>{now ? fmtClock(now) : "--:--:--"}</span>
      <small>{now ? fmtDate(now) : ""}</small>
    </div>
  );
}

export function Header({ who, title }: { who: Who | null; title: string }) {
  const staff = who?.role === "staff" || who?.role === "director";
  return (
    <header className="top">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">日南</span>
        <div><strong>{title}</strong><small>日南書架</small></div>
      </div>
      {staff && <Clock />}
      <div className="who">
        {staff && (
          <nav className="topnav">
            <Link href="/desk">櫃台</Link>
            {who?.role === "director" && <Link href="/admin">館長管理</Link>}
          </nav>
        )}
        <span className="who-mail">{who?.email}</span>
        <button className="link" type="button" onClick={signOut}>登出</button>
      </div>
    </header>
  );
}

export function Loading({ text = "讀取中…" }: { text?: string }) {
  return <div className="loading" role="status">{text}</div>;
}

export function Msg({ m }: { m: { text: string; kind?: "ok" | "bad" } | null }) {
  return <p className={"msg" + (m?.kind ? " " + m.kind : "")} aria-live="polite">{m?.text ?? ""}</p>;
}

export function Status({ out, late }: { out: boolean; late?: boolean }) {
  if (!out) return <span className="badge in">在架上</span>;
  return <span className={"badge " + (late ? "late" : "out")}>{late ? "逾期" : "借出中"}</span>;
}

export function Dialog({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current; if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} onClose={onClose} onClick={(e) => { if (e.target === ref.current) onClose(); }}>
      <div className="dlg">
        <div className="dlg-head"><h3>{title}</h3><button className="link" type="button" onClick={onClose}>關閉</button></div>
        {open && children}
      </div>
    </dialog>
  );
}
