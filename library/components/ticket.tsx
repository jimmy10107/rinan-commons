import { Barcode } from "./barcode";
import { fmtDate } from "@/lib/format";

/** 借書證：仿日南車站的硬卡車票 */
export function Ticket({ name, cardNo, since, library = "日南書架", active = true }:
  { name: string; cardNo: string; since: string; library?: string; active?: boolean }) {
  return (
    <figure className={"ticket" + (active ? "" : " void")} aria-label={"借書證 " + cardNo}>
      <div className="ticket-route">
        <span className="stn">日南<small>Rinan</small></span>
        <span className="arrow" aria-hidden="true" />
        <span className="stn">{library}<small>借書證</small></span>
      </div>
      <div className="ticket-no">{cardNo}</div>
      <div className="ticket-name">{name}</div>
      <div className="ticket-foot"><span>發證　{fmtDate(since)}</span>{!active && <span className="void-stamp">停用</span>}</div>
      <Barcode value={cardNo} height={44} />
    </figure>
  );
}
