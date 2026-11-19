'use strict';
(async function () {
  const $ = id => document.getElementById(id);
  const base = window.RINAN_MAP_BASE || './';
  const siteRoot = new URL(base, location.href).pathname.replace(/maps\/$/, '');
  const embedded = window.self !== window.top;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const categories = {place:'地方據點',food:'美食店家',select:'地方選物',story:'人物故事'};
  const views = ['stories','places','routes'];
  const pageSize = 6;
  const state = {view:'places',query:'',category:'all',area:'all',place:null,route:null,page:1};
  let places = [], routes = [], placesById = new Map(), routesById = new Map();
  let map, outer, markerLayer, activeTiles, street, satellite, ready = false, boundaryLoaded = false;
  let villages = [], markers = new Map(), pendingSelection = null, heightFrame = 0, lastHeight = 0;
  let queryTimer, tileFailureShown = false, dataLoadFailed = false;

  function el(tag, className, value) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (value !== undefined && value !== null) element.textContent = String(value);
    return element;
  }
  function post(message) { if (embedded) window.parent.postMessage(message, location.origin); }
  function reportHeight() {
    if (!embedded || heightFrame) return;
    heightFrame = requestAnimationFrame(() => {
      heightFrame = 0;
      const height = Math.ceil(document.body.getBoundingClientRect().height);
      if (height > 0 && Math.abs(lastHeight - height) > 1) {
        lastHeight = height;
        post({type:'rinan-map:resize',height});
      }
    });
  }
  if (window.ResizeObserver) new ResizeObserver(reportHeight).observe(document.body);
  window.addEventListener('resize', reportHeight);
  document.fonts?.ready.then(reportHeight);
  function hasPosition(place) {
    return Number.isFinite(place.lat) && Number.isFinite(place.lng) && Math.abs(place.lat) <= 90 && Math.abs(place.lng) <= 180;
  }
  function markerAnchor(place) {
    const parent = typeof place.parentPlaceId === 'string' ? placesById.get(place.parentPlaceId) : null;
    const anchor = parent && hasPosition(parent) ? parent : place;
    return [anchor.lat,anchor.lng];
  }
  function isStory(place) { return place.category === 'story' || (place.links || []).some(link => link.kind === 'story'); }
  function textMatches(place, query) {
    return [place.name,place.address,place.summary,...(place.aliases || []),...(place.passportNumbers || []).map(String)]
      .filter(Boolean).join(' ').toLocaleLowerCase().includes(query);
  }
  function categoryOf(place) { return Object.hasOwn(categories, place.category) ? place.category : 'place'; }
  function normalizedURL(href) {
    if (typeof href !== 'string' || !href.trim()) return null;
    try {
      const url = new URL(href, location.origin);
      if (!['http:','https:'].includes(url.protocol)) return null;
      const internal = href.startsWith('/') || url.origin === location.origin || url.hostname === 'www.rinancommons.com';
      if (internal) {
        let path = url.pathname;
        const prefix = siteRoot.replace(/\/$/, '');
        if (prefix && !path.startsWith(prefix + '/') && path !== prefix) path = prefix + path;
        return {href:path + url.search + url.hash,internal:true};
      }
      return {href:url.href,internal:false};
    } catch (_) { return null; }
  }
  function actionLink(link) {
    const destination = normalizedURL(link.href);
    if (!destination) return null;
    const anchor = el('a','',link.label || (link.kind === 'visit' ? '開啟導航' : '延伸閱讀'));
    anchor.href = destination.href;
    anchor.dataset.kind = link.kind || 'website';
    anchor.target = destination.internal ? '_top' : '_blank';
    if (!destination.internal) anchor.rel = 'noopener noreferrer';
    return anchor;
  }
  for (const anchor of document.querySelectorAll('[data-site-path]')) {
    const destination = normalizedURL(anchor.dataset.sitePath);
    if (destination) anchor.href = destination.href;
  }
  function appendLinks(container, links) {
    const seen = new Set();
    for (const link of links || []) {
      const anchor = actionLink(link);
      if (anchor && !seen.has(anchor.href)) { container.append(anchor); seen.add(anchor.href); }
    }
  }
  function button(label, handler, className = '') {
    const control = el('button',className,label); control.type = 'button'; control.addEventListener('click',handler); return control;
  }
  function cancelPendingSearch() { clearTimeout(queryTimer); queryTimer = undefined; }
  function clearStatus() { $('status').replaceChildren(); }
  function mapStatus(message, retry) {
    $('status').replaceChildren(el('span','',message));
    if (retry) $('status').append(button('重新載入', retry));
    reportHeight();
  }
  function filteredPlaces() {
    const query = state.query.trim().toLocaleLowerCase();
    return places.filter(place => (state.view !== 'stories' || isStory(place)) &&
      (state.category === 'all' || categoryOf(place) === state.category) &&
      (state.area === 'all' || (hasPosition(place) && place.area === state.area)) &&
      (!query || textMatches(place, query)));
  }
  function filteredRoutes() {
    const query = state.query.trim().toLocaleLowerCase();
    return routes.filter(route => !query || [route.title,route.description,...(route.placeIds || []).map(id => placesById.get(id)?.name || '')].join(' ').toLocaleLowerCase().includes(query));
  }
  function labelsFor(place) {
    const labels = el('div','card-labels');
    labels.append(el('span',`category-badge category-${categoryOf(place)}`,categories[categoryOf(place)]));
    const fixed = place.coordinateSource?.method === 'no_fixed_location';
    labels.append(el('span','area-badge',hasPosition(place) ? (place.area === 'nearby' ? '九里周邊' : '日南九里') : (fixed ? '流動出攤' : '位置待確認')));
    if (place.passportNumbers?.length) labels.append(el('span','passport-badge',`護照 ${place.passportNumbers.join('・')}`));
    return labels;
  }
  function writeURL(replace = false) {
    const url = new URL(location.href);
    for (const key of ['view','place','route','q','category','area']) url.searchParams.delete(key);
    if (state.view !== 'places') url.searchParams.set('view',state.view);
    if (state.place) url.searchParams.set('place',state.place);
    if (state.route) url.searchParams.set('route',state.route);
    if (state.query) url.searchParams.set('q',state.query);
    if (state.category !== 'all') url.searchParams.set('category',state.category);
    if (state.area !== 'all') url.searchParams.set('area',state.area);
    if (url.href !== location.href) history[replace ? 'replaceState' : 'pushState'](null,'',url);
  }
  function reportState() { post({type:'rinan-map:state',view:state.view,place:state.place || undefined,route:state.route || undefined}); }
  function readURL() {
    const params = new URLSearchParams(location.search);
    state.view = views.includes(params.get('view')) ? params.get('view') : 'places';
    state.query = (params.get('q') || '').slice(0,160);
    state.category = Object.hasOwn(categories, params.get('category')) ? params.get('category') : 'all';
    state.area = ['rinan','nearby'].includes(params.get('area')) ? params.get('area') : 'all';
    state.place = placesById.has(params.get('place')) ? params.get('place') : null;
    state.route = routesById.has(params.get('route')) ? params.get('route') : null;
    if (state.route) state.view = 'routes';
    state.page = 1;
    if ((params.has('place') && !state.place) || (params.has('route') && !state.route)) $('data-status').textContent = '這個地點或路線暫時找不到，請從清單重新選擇。';
  }
  function openPlace(id, options = {}) {
    if (!placesById.has(id)) return;
    cancelPendingSearch();
    state.place = id;
    if (!options.keepRoute) state.route = null;
    if (state.view === 'routes' && !options.keepRoute) state.view = 'places';
    const filtered = filteredPlaces();
    const index = filtered.findIndex(place => place.id === id);
    if (state.view !== 'routes' && index >= 0) state.page = Math.floor(index / pageSize) + 1;
    render({focusPlace:true,popup:options.popup !== false});
    writeURL(); reportState();
    if (options.focusDetail) $('selected-detail').focus({preventScroll:true});
    if (options.reveal) revealSelection(hasPosition(placesById.get(id)));
  }
  function revealSelection(positioned = true) {
    const mobile = matchMedia('(max-width:680px)').matches;
    const target = positioned ? document.querySelector('.canvas') : $('selected-detail');
    requestAnimationFrame(()=>{
      if (embedded) {
        const bounds = target.getBoundingClientRect();
        post({type:'rinan-map:reveal',top:bounds.top,height:bounds.height,align:mobile?'start':'nearest'});
      } else target.scrollIntoView({behavior:reduced?'auto':'smooth',block:mobile?'start':'nearest'});
    });
  }
  function openRoute(id) {
    if (!routesById.has(id)) return;
    cancelPendingSearch();
    state.view = 'routes'; state.route = id; state.place = null;
    render({focusRoute:true}); writeURL(); reportState(); revealSelection();
  }
  function changeView(view) {
    if (!views.includes(view)) return;
    cancelPendingSearch();
    state.view = view; state.place = null; state.route = null; state.page = 1;
    state.query = ''; state.category = 'all'; state.area = 'all';
    render(); resetBounds(); writeURL(); reportState();
  }
  function placeCard(place) {
    const card = el('article',`place-card${state.place === place.id ? ' is-selected' : ''}`);
    card.dataset.place = place.id;
    card.append(labelsFor(place));
    const title = button(place.name, () => openPlace(place.id,{reveal:true}), 'card-title');
    title.setAttribute('aria-label',`查看${place.name}`); card.append(title);
    if (place.summary) card.append(el('p','card-summary',place.summary));
    if (place.address) card.append(el('p','card-address',place.address));
    const actions = el('div','card-actions');
    actions.append(button(hasPosition(place) ? '在地圖上看' : '查看地點資訊',() => openPlace(place.id,{reveal:true})));
    const story = (place.links || []).find(link => link.kind === 'story');
    const visit = (place.links || []).find(link => link.kind === 'visit');
    appendLinks(actions,[story,visit].filter(Boolean));
    card.append(actions);
    if (!hasPosition(place)) card.append(el('p','card-notice',place.notice || '位置確認中，可先開啟原連結查詢。'));
    return card;
  }
  function routeCard(route) {
    const card = el('article',`route-card${state.route === route.id ? ' is-selected' : ''}`);
    const labels = el('div','card-labels');
    if (route.mode) labels.append(el('span','area-badge',route.mode));
    const count = (route.placeIds || []).filter(id => placesById.has(id)).length;
    labels.append(el('span','category-badge',`${count} 個停留點`));
    card.append(labels,button(route.title,() => openRoute(route.id),'card-title'));
    if (route.description) card.append(el('p','card-summary',route.description));
    const actions = el('div','card-actions'); actions.append(button('查看沿途地點',() => openRoute(route.id))); card.append(actions);
    return card;
  }
  function renderDirectory() {
    if (dataLoadFailed) {
      $('result-summary').textContent='地點清單暫時無法載入';
      $('pagination').hidden=true;
      const fallback=el('div','empty-message');
      fallback.append(el('p','','可以先從走傱護照查看合作據點，或重新載入地點清單。'));
      const links=el('div','detail-links');
      appendLinks(links,[{label:'查看走傱護照',href:'/passport/',kind:'passport'},{label:'查看到訪交通',href:'/visit/',kind:'visit'}]);
      fallback.append(links,button('重新載入',()=>location.reload()));
      $('directory-results').replaceChildren(fallback);
      return;
    }
    const results = state.view === 'routes' ? filteredRoutes() : filteredPlaces();
    const pages = Math.max(1, Math.ceil(results.length / pageSize));
    state.page = Math.min(Math.max(state.page,1),pages);
    $('directory-results').replaceChildren();
    const labels = {stories:'個有故事的地點',places:'個地點',routes:'段探索路線'};
    const missing = state.view === 'routes' ? 0 : results.filter(place => !hasPosition(place)).length;
    $('result-summary').textContent = `${results.length} ${labels[state.view]}${missing ? `・${missing} 個可先查看資訊` : ''}`;
    if (!results.length) {
      const empty = el('div','empty-message');
      empty.append(el('p','',state.query || state.category !== 'all' || state.area !== 'all' ? '沒有符合的結果，試試另一個地名或清除篩選。' : (state.view === 'routes' ? '路線正在整理中，你可以先從地點與故事選擇下一站。' : '這一類內容正在整理中，先看看其他地點。')));
      empty.append(button('查看全部地點',() => changeView('places'))); $('directory-results').append(empty);
    } else results.slice((state.page - 1) * pageSize,state.page * pageSize).forEach(item => $('directory-results').append(state.view === 'routes' ? routeCard(item) : placeCard(item)));
    $('pagination').hidden = pages < 2;
    $('previous-page').disabled = state.page <= 1; $('next-page').disabled = state.page >= pages;
    $('page-label').textContent = `${state.page} / ${pages}`;
  }
  function detailForPlace(place) {
    const detail = $('selected-detail'); detail.replaceChildren();
    const route = routesById.get(state.route);
    if (route) {
      const context = el('div','route-context'); context.append(button('回到整段路線',() => {cancelPendingSearch();state.place=null;render({focusRoute:true});writeURL();reportState();}),document.createTextNode(route.title));detail.append(context);
    }
    detail.append(labelsFor(place),el('h2','',place.name));
    if (place.summary) detail.append(el('p','',place.summary));
    if (place.address) detail.append(el('p','detail-address',place.address));
    if (place.notice) detail.append(el('p','detail-notice',place.notice));
    if (!hasPosition(place) && !place.notice) detail.append(el('p','detail-notice','位置確認中，可先開啟原連結查詢。'));
    const links = el('div','detail-links'); appendLinks(links,place.links); detail.append(links);
    if (route) detail.append(routeStops(route));
  }
  function routeStops(route) {
    const list = el('ol','route-stops');
    for (const id of route.placeIds || []) {
      const place = placesById.get(id); if (!place) continue;
      const item = el('li');
      item.append(button(place.name,() => openPlace(id,{keepRoute:true,reveal:true})));
      if (place.address) item.append(el('small','',place.address));
      list.append(item);
    }
    return list;
  }
  function detailForRoute(route) {
    const detail = $('selected-detail'); detail.replaceChildren(el('p','eyebrow',route.mode || 'EXPLORE RINAN'),el('h2','',route.title));
    if (route.description) detail.append(el('p','',route.description));
    if (route.note) detail.append(el('p','detail-notice',route.note));
    detail.append(routeStops(route));
    const links = el('div','detail-links');appendLinks(links,route.links);if(links.childElementCount)detail.append(links);
  }
  function renderDetail() {
    if (state.place && placesById.has(state.place)) detailForPlace(placesById.get(state.place));
    else if (state.route && routesById.has(state.route)) detailForRoute(routesById.get(state.route));
    else {
      const descriptions = {
        stories:['故事裡的地方，現在在哪裡？','從人物、照片與展覽出發，點一個地點繼續讀，也可以找到前往的方向。'],
        places:['先找一個想去的地方。','點選地圖上的標記或地點清單，查看故事、護照資訊與前往方式。'],
        routes:['選一段，慢慢認識日南。','看看沿途有哪些停留點，再依自己的時間與移動方式安排。']
      };
      const [heading,copy] = descriptions[state.view];
      $('selected-detail').replaceChildren(el('p','eyebrow','NEXT STOP'),el('h2','',heading),el('p','',copy));
    }
  }
  function popupFor(place) {
    const content = el('div'); content.append(el('h3','',place.name));
    if (place.summary) content.append(el('p','',place.summary));
    const links = el('div');
    const primary = (place.links || []).filter(link => ['story','visit','event'].includes(link.kind)).slice(0,3);
    appendLinks(links,primary); content.append(links);
    content.append(button('查看完整地點資訊',() => {
      $('selected-detail').scrollIntoView({behavior:reduced?'auto':'smooth',block:'nearest'});
      $('selected-detail').focus({preventScroll:true});
    }));
    return content;
  }
  function popupForGroup(group) {
    if (group.length === 1) return popupFor(group[0]);
    const content = el('div','shared-location');
    content.append(el('p','shared-location-label',`這個位置有 ${group.length} 項內容`));
    const choices = el('div','shared-location-choices');
    for (const place of group) {
      const choice = button(place.name,()=>openPlace(place.id,{keepRoute:Boolean(state.route)}));
      choice.setAttribute('aria-pressed',String(place.id === state.place));
      choices.append(choice);
    }
    content.append(choices);
    const selected = group.find(place=>place.id === state.place);
    if (selected) content.append(popupFor(selected));
    else content.append(el('p','','選擇一項，查看故事與前往資訊。'));
    return content;
  }
  function renderMarkers() {
    if (!map || !markerLayer) return;
    markerLayer.clearLayers(); markers = new Map();
    const route = routesById.get(state.route);
    let visible = route ? (route.placeIds || []).map(id=>placesById.get(id)).filter(Boolean) : state.view === 'routes' ? places : filteredPlaces();
    const selected = placesById.get(state.place);
    if (selected && !visible.some(place=>place.id===selected.id)) visible = [...visible,selected];
    const groups = new Map();
    for (const place of visible.filter(hasPosition)) {
      const key = markerAnchor(place).join(',');
      if (!groups.has(key)) groups.set(key,[]);
      groups.get(key).push(place);
    }
    for (const group of groups.values()) {
      const place = group.find(item=>item.id===state.place) || group[0];
      const isSelected = group.some(item=>item.id===state.place);
      const iconElement = el('span',`marker-dot category-${categoryOf(place)}`);
      if (group.length > 1) iconElement.append(el('span','marker-count',group.length));
      const icon = L.divIcon({className:`place-marker${isSelected?' is-selected':''}`,html:iconElement,iconSize:[32,32],iconAnchor:[16,16],popupAnchor:[0,-13]});
      const title = group.length > 1 ? `${group.map(item=>item.name).join('／')}（同一位置 ${group.length} 項）` : place.name;
      const marker = L.marker(markerAnchor(place),{icon,title,alt:title,riseOnHover:true,keyboard:true});
      marker.bindPopup(popupForGroup(group),{maxWidth:290,autoPanPadding:[25,60]});
      marker.bindTooltip(el('span','',title),{className:'place-tooltip',direction:'top',offset:[0,-12]});
      marker.on('click',()=>{
        if(group.length===1)openPlace(place.id,{keepRoute:Boolean(state.route)});
        else $('selection').textContent=`同一位置 ${group.length} 項內容`;
      });
      marker.addTo(markerLayer);
      group.forEach(item=>markers.set(item.id,marker));
    }
  }
  function focusPlace(popup) {
    const place = placesById.get(state.place);
    $('selection').textContent = place?.name || '日南九里與周邊';
    if (map && place && hasPosition(place)) {
      map.setView(markerAnchor(place),Math.max(16,map.getZoom()),{animate:!reduced});
      if (popup) markers.get(place.id)?.openPopup();
    }
  }
  function focusRoute() {
    const route = routesById.get(state.route); if (!route) return;
    $('selection').textContent = route.title;
    const points = (route.placeIds || []).map(id=>placesById.get(id)).filter(place=>place && hasPosition(place)).map(place=>[place.lat,place.lng]);
    if (map && points.length) map.fitBounds(L.latLngBounds(points),{padding:[40,65],maxZoom:16,animate:!reduced});
  }
  function render(options = {}) {
    for (const control of document.querySelectorAll('[data-view]')) control.setAttribute('aria-pressed',String(control.dataset.view === state.view));
    $('place-search').value = state.query;
    $('clear-search').hidden = !state.query;
    $('category').value = state.category; $('area').value = state.area;
    $('place-filters').hidden = state.view === 'routes';
    document.querySelector('.search-label').textContent = state.view === 'routes' ? '想沿著什麼主題出發？' : state.view === 'stories' ? '想認識哪一段故事？' : '想找哪一個地方？';
    $('place-search').placeholder = state.view === 'routes' ? '搜尋路線或沿途地點' : '搜尋地點、地址或故事';
    renderDirectory(); renderMarkers(); renderDetail();
    if (options.focusPlace) focusPlace(options.popup);
    else if (options.focusRoute) focusRoute();
    else if (!state.place && !state.route) $('selection').textContent = state.view === 'stories' ? '看看故事發生在哪裡' : '日南九里與周邊';
    reportHeight();
  }
  function resetBounds() {
    if (!map) return;
    map.closePopup();
    villages.forEach(({polygon,checkbox})=>{checkbox.checked=true;polygon.addTo(map);});
    if (outer) map.fitBounds(outer.getBounds(),{padding:[25,55],animate:!reduced});
    else if (markerLayer && markerLayer.getLayers().length) map.fitBounds(markerLayer.getBounds(),{padding:[30,65],maxZoom:14,animate:!reduced});
    else map.setView([24.38,120.65],13);
    $('selection').textContent = '日南九里全區';
  }
  function applySelection(message) {
    cancelPendingSearch();
    const next = message.payload && typeof message.payload === 'object' ? message.payload : message;
    state.view = views.includes(next.view) ? next.view : 'places';
    state.place = typeof next.place === 'string' && placesById.has(next.place) ? next.place : null;
    state.route = typeof next.route === 'string' && routesById.has(next.route) ? next.route : null;
    if (state.route) state.view = 'routes';
    state.query='';state.category='all';state.area='all';state.page=1;
    render({focusPlace:Boolean(state.place),popup:Boolean(state.place),focusRoute:!state.place && Boolean(state.route)});
    if (!state.place && !state.route) resetBounds();
    writeURL(true);reportState();
  }
  window.addEventListener('message',event=>{
    if (!embedded || event.origin !== location.origin || event.source !== window.parent || event.data?.type !== 'rinan-map:select') return;
    if (!ready) pendingSelection = event.data; else applySelection(event.data);
  });
  window.addEventListener('popstate',()=>{
    if(!ready)return;
    cancelPendingSearch();
    readURL();render({focusPlace:Boolean(state.place),popup:Boolean(state.place),focusRoute:!state.place && Boolean(state.route)});reportState();
  });
  document.querySelectorAll('[data-view]').forEach(control=>control.addEventListener('click',()=>changeView(control.dataset.view)));
  $('place-search').addEventListener('input',event=>{
    cancelPendingSearch();
    // Keep the latest input in state; only rendering is delayed. A subsequent
    // selection can cancel this render without reviving an older search value.
    state.query=event.target.value.slice(0,160);state.page=1;state.place=null;state.route=null;
    $('clear-search').hidden=!state.query;
    queryTimer=setTimeout(()=>{queryTimer=undefined;render();writeURL(true);reportState();},120);
  });
  $('clear-search').addEventListener('click',()=>{cancelPendingSearch();state.query='';state.page=1;render();writeURL(true);reportState();$('place-search').focus();});
  for(const key of ['category','area']) $(key).addEventListener('change',event=>{cancelPendingSearch();state[key]=event.target.value;state.page=1;state.place=null;state.route=null;render();writeURL();reportState();});
  for(const [id,delta] of [['previous-page',-1],['next-page',1]]) $(id).addEventListener('click',()=>{
    cancelPendingSearch();state.page += delta;render();writeURL(true);reportState();
    document.querySelector('.directory-head').scrollIntoView({block:'nearest',behavior:reduced?'auto':'smooth'});
  });
  $('reset').addEventListener('click',()=>{cancelPendingSearch();state.place=null;state.route=null;render();resetBounds();writeURL();reportState();});
  $('opacity').addEventListener('input',event=>{const opacity=Number(event.target.value);$('opacity-value').textContent=`${opacity}%`;villages.forEach(({polygon})=>polygon.setStyle({fillOpacity:opacity/100}));});
  $('wheel').addEventListener('change',event=>{if(map)map.scrollWheelZoom[event.target.checked?'enable':'disable']();});
  $('controls').addEventListener('toggle',reportHeight);

  async function readJSON(filename) {
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(),12000);
    try {
      const response = await fetch(base + filename,{credentials:'same-origin',signal:controller.signal});
      if(!response.ok)throw new Error(filename);
      return await response.json();
    } finally { clearTimeout(timeout); }
  }
  function initializeMap(boundary) {
    if (!window.L) {
      document.querySelector('.canvas').classList.add('is-unavailable');
      mapStatus('地圖暫時無法載入。下方地點資訊與導航連結仍可使用。',()=>location.reload());
      return;
    }
    map = L.map('map',{scrollWheelZoom:false,zoomControl:true,zoomAnimation:!reduced,fadeAnimation:!reduced,attributionControl:true});
    street = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'Tiles &copy; Esri — Esri, HERE, Garmin, FAO, NOAA, USGS'});
    satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'Tiles &copy; Esri — Esri, Maxar, Earthstar Geographics'});
    activeTiles=street;
    for(const tiles of [street,satellite])tiles.on('tileerror',()=>{
      if(activeTiles!==tiles || tileFailureShown)return;
      tileFailureShown=true;
      mapStatus('部分底圖暫時無法載入，地點與里界仍可查看。',()=>{tileFailureShown=false;clearStatus();tiles.redraw();});
    });
    street.addTo(map);
    markerLayer=L.featureGroup().addTo(map);
    if(boundary && Array.isArray(boundary.li) && Array.isArray(boundary.outer)){
      villages=boundary.li.map(village=>{
        const polygon=L.polygon(village.latlngs,{color:village.color,weight:1.2,fillOpacity:.16}).addTo(map);
        polygon.bindPopup(el('span','',village.name));
        polygon.on('click',()=>{$('selection').textContent=village.name;});
        const row=el('div','village');const checkbox=el('input');checkbox.type='checkbox';checkbox.checked=true;checkbox.setAttribute('aria-label',`顯示${village.name}`);
        checkbox.addEventListener('change',()=>{if(checkbox.checked)polygon.addTo(map);else map.removeLayer(polygon);});
        const swatch=el('span','swatch');swatch.style.background=village.color;
        const focus=button(village.name,()=>{checkbox.checked=true;polygon.addTo(map);map.fitBounds(polygon.getBounds(),{padding:[30,60],maxZoom:15,animate:!reduced});polygon.openPopup();$('selection').textContent=village.name;});focus.setAttribute('aria-label',`定位${village.name}`);
        row.append(checkbox,swatch,focus);$('villages').append(row);return {polygon,checkbox};
      });
      outer=L.polygon(boundary.outer,{color:'#173b50',weight:2.6,fill:false,interactive:false}).addTo(map);boundaryLoaded=true;
    }else $('data-status').textContent='九里範圍暫時無法載入，地點與導航連結仍可使用。';
    for(const [id,tiles] of [['street',street],['satellite',satellite]]) $(id).addEventListener('click',()=>{
      if(activeTiles!==tiles){map.removeLayer(activeTiles);activeTiles=tiles;tileFailureShown=false;clearStatus();tiles.addTo(map);}
      $('street').setAttribute('aria-pressed',String(tiles===street));$('satellite').setAttribute('aria-pressed',String(tiles===satellite));
    });
    if(window.ResizeObserver)new ResizeObserver(()=>map.invalidateSize({pan:false})).observe($('map'));
    clearStatus();resetBounds();
  }
  const [placeResult,boundaryResult] = await Promise.allSettled([readJSON('places.json'),readJSON('boundaries.json')]);
  if(placeResult.status==='fulfilled' && Array.isArray(placeResult.value.places)){
    places=placeResult.value.places.filter(place=>place && typeof place.id==='string' && typeof place.name==='string');
    placesById=new Map(places.map(place=>[place.id,place]));
    routes=(Array.isArray(placeResult.value.routes)?placeResult.value.routes:[]).filter(route=>route && typeof route.id==='string' && typeof route.title==='string');
    routesById=new Map(routes.map(route=>[route.id,route]));
  }
  dataLoadFailed=placeResult.status!=='fulfilled' || !Array.isArray(placeResult.value?.places);
  try {initializeMap(boundaryResult.status==='fulfilled'?boundaryResult.value:null);} catch(error){
    document.querySelector('.canvas').classList.add('is-unavailable');
    mapStatus('地圖暫時無法顯示，地點資訊與導航連結仍可使用。',()=>location.reload());
  }
  ready=true;readURL();render({focusPlace:Boolean(state.place),popup:Boolean(state.place),focusRoute:!state.place && Boolean(state.route)});
  if(pendingSelection){applySelection(pendingSelection);pendingSelection=null;}
  post({type:'rinan-map:ready'});reportState();reportHeight();
})();
