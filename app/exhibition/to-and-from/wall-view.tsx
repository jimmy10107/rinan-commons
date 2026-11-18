'use client';
import { useEffect, useRef, useState } from 'react';
import { wallUrl } from './exhibit-data';
import s from './exhibit.module.css';

type Mode = 'idle' | 'watch' | 'paused' | 'unsupported' | 'offline';
// The external wall does not report scene readiness. Never treat iframe load as live data.
export function WallView() {
  const host = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>('idle');
  const [late, setLate] = useState(false);
  const [session, setSession] = useState(0);
  function start() {
    if (!navigator.onLine) { setMode('offline'); return; }
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2');
      if (!gl) { setMode('unsupported'); return; }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    } catch { setMode('unsupported'); return; }
    setLate(false); setSession(n => n + 1); setMode('watch');
  }
  useEffect(() => {
    if (!host.current || !('IntersectionObserver' in window)) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & {connection?: {saveData?: boolean; effectiveType?: string}}).connection;
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      if (!media.matches && !connection?.saveData && !/2g/.test(connection?.effectiveType ?? '') && !document.hidden) start();
    }, {rootMargin: '80px'});
    observer.observe(host.current);
    const offline = () => setMode('offline');
    const quiet = () => { if (media.matches) setMode(m => m === 'watch' ? 'paused' : m); };
    const stop = () => { if (document.hidden) setMode(m => m === 'watch' ? 'paused' : m); };
    media.addEventListener('change', quiet); window.addEventListener('offline', offline); document.addEventListener('visibilitychange',stop);
    return () => { observer.disconnect(); media.removeEventListener('change', quiet); window.removeEventListener('offline', offline); document.removeEventListener('visibilitychange',stop); };
  }, []);
  useEffect(() => {
    if (mode !== 'watch') return;
    const id = window.setTimeout(() => setLate(true), 12000);
    return () => window.clearTimeout(id);
  }, [mode, session]);
  return <div ref={host} className={s.viewer}>
    <div className={s.toolrow}><strong>稻站植生牆</strong><button type="button" onClick={() => mode === 'watch' ? setMode('paused') : start()}>
      {mode === 'watch' ? '暫停畫面' : mode === 'idle' ? '載入花園' : mode === 'paused' ? '繼續觀看' : '重新載入'}</button>
      <a href={wallUrl} target="_blank" rel="noopener noreferrer">操作完整花園 ↗</a></div>
    {mode === 'watch' ? <div inert className={s.frame}><iframe key={session} src={wallUrl} title="日南稻站植生牆・觀看模式" tabIndex={-1} referrerPolicy="strict-origin-when-cross-origin" /></div> :
      <p className={s.fallback}>{mode === 'unsupported' ? '這台裝置無法顯示 3D 花園。' : mode === 'offline' ? '目前沒有網路連線。' : mode === 'paused' ? '花園畫面已暫停。' : '花園裡的每一株植物，都來自一次種植。'}你可以先閱讀種植步驟，再用 LINE 種下自己的植物。</p>}
    <p aria-live="polite" className={s.fine}>{mode === 'watch' ? late ? '尚未確認花園是否載入完成。如果未見畫面，可暫停後重試，或另開完整花園。' : '觀看時可直接向下捲動；想移動視角或尋找植物，請另開完整花園。' : '種植與閱讀不需要開啟 3D 畫面。'}</p>
  </div>;
}
