"use client";
import { useEffect, useRef, useState } from "react";

/** 顯示 CODE128 條碼（館藏碼或借書證號） */
export function Barcode({ value, height = 52 }: { value: string; height?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    let alive = true;
    import("jsbarcode").then(({ default: JsBarcode }) => {
      if (!alive || !ref.current) return;
      try { JsBarcode(ref.current, value, { format: "CODE128", height, fontSize: 14, margin: 6, lineColor: "#312c25", background: "#fffdf7" }); }
      catch { /* 不合法的字元就只顯示文字 */ }
    });
    return () => { alive = false; };
  }, [value, height]);
  return <div className="barcode"><svg ref={ref} role="img" aria-label={"條碼 " + value} /></div>;
}

/**
 * 用手機鏡頭掃條碼。支援 BarcodeDetector 的瀏覽器（Android Chrome）直接用；
 * 其他（iPhone Safari）改用 ZXing。掃到一次就停。
 */
export function Scanner({ onCode, onClose }: { onCode: (code: string) => void; onClose: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    let stop = () => {};
    let done = false;
    const hit = (code: string) => { if (done || !code) return; done = true; stop(); onCode(code.trim()); };
    (async () => {
      try {
        const BD = (window as any).BarcodeDetector;
        if (BD) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
          const v = video.current!; v.srcObject = stream; await v.play();
          const det = new BD({ formats: ["ean_13", "ean_8", "code_128", "code_39", "upc_a", "qr_code"] });
          let raf = 0;
          const loop = async () => {
            if (done) return;
            try { const r = await det.detect(v); if (r[0]?.rawValue) return hit(r[0].rawValue); } catch { /* 下一格再試 */ }
            raf = requestAnimationFrame(loop);
          };
          stop = () => { cancelAnimationFrame(raf); stream.getTracks().forEach((t) => t.stop()); };
          loop();
        } else {
          const { BrowserMultiFormatReader } = await import("@zxing/browser");
          const reader = new BrowserMultiFormatReader();
          const ctl = await reader.decodeFromVideoDevice(undefined, video.current!, (res) => { if (res) hit(res.getText()); });
          stop = () => ctl.stop();
        }
      } catch (e: any) {
        setErr(/NotAllowed|Permission/i.test(String(e?.name || e?.message))
          ? "沒有鏡頭權限。請在瀏覽器設定允許這個網站使用相機，或改用輸入。"
          : "這台裝置無法開啟鏡頭，請改用輸入或條碼槍。");
      }
    })();
    return () => { done = true; stop(); };
  }, [onCode]);
  return (
    <div className="scanner" role="dialog" aria-label="掃描條碼">
      <video ref={video} playsInline muted />
      <div className="scan-frame" aria-hidden="true" />
      <p className="scan-hint">{err || "把條碼對準框內，掃到會自動帶入。"}</p>
      <button className="btn ghost light" type="button" onClick={onClose}>取消掃描</button>
    </div>
  );
}
