const TZ = "Asia/Taipei";
const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("zh-TW", { timeZone: TZ, ...o });

const clock = f({ hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
const date = f({ year: "numeric", month: "numeric", day: "numeric", weekday: "short" });
const short = f({ month: "numeric", day: "numeric", weekday: "short" });
const dt = f({ month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
const hm = f({ hour: "2-digit", minute: "2-digit", hour12: false });
const ymd = f({ year: "numeric", month: "2-digit", day: "2-digit" });

const t = (v: string | number | Date) => new Date(v);
export const fmtClock = (v: string | number | Date) => clock.format(t(v));
export const fmtDate = (v: string | number | Date) => date.format(t(v));
export const fmtShort = (v: string | number | Date) => short.format(t(v));
export const fmtDT = (v: string | number | Date) => dt.format(t(v));
export const fmtHM = (v: string | number | Date) => hm.format(t(v));
export const dayKey = (v: string | number | Date) => ymd.format(t(v));

export const isLate = (l: { returned_at: string | null; due_at: string }) => !l.returned_at && Date.now() > Date.parse(l.due_at);

/** 剩幾天到期（台北日期計算）；負數代表逾期 */
export function daysLeft(due: string) {
  const a = Date.parse(dayKey(Date.now()).replace(/\//g, "-"));
  const b = Date.parse(dayKey(due).replace(/\//g, "-"));
  return Math.round((b - a) / 864e5);
}

/** 比對用：去掉空白與標點、轉小寫 */
export const norm = (s: unknown) => String(s ?? "").toLowerCase().replace(/[\s\-—．・.,，:：、?？!！「」《》()（）]/g, "");
export const cleanIsbn = (s: string) => s.replace(/[^0-9Xx]/g, "").toUpperCase();
