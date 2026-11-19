'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { sitePath } from './site-path';
import './map-explorer.css';

type MapView = 'stories' | 'places' | 'routes';
type MapSelection = { view: MapView; place?: string; route?: string };

const views: { id: MapView; label: string; description: string }[] = [
  { id: 'stories', label: '看故事', description: '從人物與展覽出發' },
  { id: 'places', label: '找地點', description: '找到店家與地方據點' },
  { id: 'routes', label: '選路線', description: '沿著主題繼續探索' },
];
const initialSelection: MapSelection = { view: 'places' };

function cleanId(value: unknown): string | undefined {
  return typeof value === 'string' && /^[a-z0-9][a-z0-9_-]{0,99}$/.test(value) ? value : undefined;
}

function normalizeSelection(value: Record<string, unknown>): MapSelection {
  const place = cleanId(value.place);
  const route = cleanId(value.route);
  const view = views.some((item) => item.id === value.view)
    ? value.view as MapView
    : route ? 'routes' : 'places';
  return { view, place, route };
}

function selectionFromLocation(): MapSelection {
  const params = new URLSearchParams(window.location.search);
  return normalizeSelection({ view: params.get('view'), place: params.get('place'), route: params.get('route') });
}

function mapHref(selection: MapSelection): string {
  const params = new URLSearchParams({ view: selection.view });
  if (selection.place) params.set('place', selection.place);
  if (selection.route) params.set('route', selection.route);
  return `${sitePath('/maps/')}?${params.toString()}`;
}

function syncPageLocation(selection: MapSelection) {
  const url = new URL(window.location.href);
  for (const key of ['view', 'place', 'route']) url.searchParams.delete(key);
  url.searchParams.set('view', selection.view);
  if (selection.place) url.searchParams.set('place', selection.place);
  if (selection.route) url.searchParams.set('route', selection.route);
  if (url.href !== window.location.href) window.history.replaceState(window.history.state, '', url);
}

export function MapExplorer({ primary = false }: { primary?: boolean }) {
  const Heading = primary ? 'h1' : 'h3';
  const [open, setOpen] = useState(true);
  const [ready, setReady] = useState(false);
  const [measured, setMeasured] = useState(false);
  const [frameHeight, setFrameHeight] = useState(860);
  const [selection, setSelection] = useState<MapSelection>(initialSelection);
  // Resolve the page's deep link before creating the frame, so its initial
  // default state cannot overwrite a requested place or route during hydration.
  const [frameSource, setFrameSource] = useState<string | null>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const toggleButton = useRef<HTMLButtonElement>(null);
  const selectionRef = useRef<MapSelection>(initialSelection);
  const readyRef = useRef(false);

  const rememberSelection = useCallback((next: MapSelection) => {
    selectionRef.current = next;
    setSelection((current) => current.view === next.view && current.place === next.place && current.route === next.route ? current : next);
  }, []);

  const sendSelection = useCallback(() => {
    frame.current?.contentWindow?.postMessage({ type: 'rinan-map:select', ...selectionRef.current }, window.location.origin);
  }, []);

  useEffect(() => {
    const next = selectionFromLocation();
    rememberSelection(next);
    setFrameSource(mapHref(next));

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return;
      const data = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.type === 'rinan-map:resize' && typeof data.height === 'number' && Number.isFinite(data.height)) {
        const height = Math.min(14000, Math.max(360, Math.ceil(data.height)));
        setFrameHeight((current) => Math.abs(current - height) > 1 ? height : current);
        setMeasured(true);
      } else if (data.type === 'rinan-map:ready') {
        readyRef.current = true;
        setReady(true);
        sendSelection();
      } else if (data.type === 'rinan-map:state') {
        const nextSelection = normalizeSelection(data);
        rememberSelection(nextSelection);
        syncPageLocation(nextSelection);
      } else if (data.type === 'rinan-map:reveal'
        && typeof data.top === 'number' && Number.isFinite(data.top) && Math.abs(data.top) <= 14000
        && typeof data.height === 'number' && Number.isFinite(data.height) && data.height > 0 && data.height <= 14000) {
        // The frame grows with its content, so its own scrollIntoView cannot
        // reliably reveal a target in the outer page. Move this window instead.
        requestAnimationFrame(() => {
          const currentFrame = frame.current;
          if (!currentFrame || currentFrame.contentWindow !== event.source) return;
          const headerBottom = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 88;
          const safeTop = Math.max(88, Math.min(headerBottom, window.innerHeight / 2)) + 12;
          const safeBottom = window.innerHeight - 20;
          const targetTop = currentFrame.getBoundingClientRect().top + data.top;
          const targetBottom = targetTop + data.height;
          let delta = 0;
          if (data.align === 'start' || targetTop < safeTop || data.height > safeBottom - safeTop) {
            delta = targetTop - safeTop;
          } else if (targetBottom > safeBottom) {
            delta = targetBottom - safeBottom;
          }
          if (Math.abs(delta) > 1) window.scrollTo({
            top: Math.max(0, window.scrollY + delta),
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
          });
        });
      }
    };

    const handleHistory = () => {
      const nextSelection = selectionFromLocation();
      rememberSelection(nextSelection);
      setOpen(true);
      if (readyRef.current) sendSelection();
      else setFrameSource(mapHref(nextSelection));
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('popstate', handleHistory);
    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('popstate', handleHistory);
    };
  }, [rememberSelection, sendSelection]);

  const chooseView = (view: MapView) => {
    const nextSelection: MapSelection = { view };
    rememberSelection(nextSelection);
    syncPageLocation(nextSelection);
    if (!open || !readyRef.current) {
      setFrameSource(mapHref(nextSelection));
      setOpen(true);
    } else sendSelection();
  };

  const closeMap = () => {
    readyRef.current = false;
    setReady(false);
    setMeasured(false);
    setOpen(false);
  };

  const toggleMap = () => {
    if (open) closeMap();
    else {
      setFrameSource(mapHref(selectionRef.current));
      setOpen(true);
    }
  };

  return (
    <div className="map-explorer map-explorer-linked">
      <div className="map-explorer-intro">
        <div>
          <span className="kicker">RINAN / NINE VILLAGES</span>
          <Heading>從稻站出發，走進日南九里。</Heading>
          <p>把本站的故事、護照據點與活動場域放回地圖。點選一個地方，繼續閱讀它的故事、查看活動，或開啟導航前往。</p>
        </div>
        <div className="map-explorer-actions">
          <a className="underlined-link" href={mapHref(selection)} target="_blank" rel="noopener noreferrer">另開大地圖 ↗</a>
          <button ref={toggleButton} className="map-explorer-toggle" aria-expanded={open} aria-controls="interactive-map" onClick={toggleMap}>
            {open ? '收起地圖' : '展開地圖'} <span aria-hidden="true">{open ? '−' : '＋'}</span>
          </button>
        </div>
      </div>

      <div className="map-explorer-start">
        <p className="map-explorer-question">看完稻站，接著想去哪裡？</p>
        <div className="map-explorer-modes" role="group" aria-label="選擇認識日南的方式">
          {views.map((view) => (
            <button key={view.id} type="button" aria-pressed={selection.view === view.id} aria-controls="interactive-map" onClick={() => chooseView(view.id)}>
              <strong>{view.label}</strong>
              <span>{view.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div id="interactive-map" className="map-explorer-viewport">
        {open && <>
          {!ready && <p role="status" className="map-loading">正在載入地點與故事… 若連線較慢，可另開大地圖。</p>}
          {frameSource && <iframe
            ref={frame}
            className="rinan-map-frame"
            style={{ height: frameHeight }}
            src={frameSource}
            title="日南九里地圖：故事、地點與路線"
            scrolling={measured ? 'no' : 'auto'}
            onLoad={() => {
              readyRef.current = true;
              setReady(true);
              sendSelection();
            }}
          />}
          <p className="map-return"><button type="button" onClick={() => { closeMap(); toggleButton.current?.focus(); }}>收起地圖，繼續閱讀 ↑</button></p>
        </>}
      </div>
    </div>
  );
}
