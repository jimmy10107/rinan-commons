'use strict';
(async function () {
  const status = document.getElementById('status');
  const showError = (message, retry) => {
    status.replaceChildren(document.createTextNode(message));
    const button = document.createElement('button');
    button.textContent = '重新載入'; button.onclick = retry; status.append(button);
  };
  try {
    if (!window.L) throw new Error('地圖程式未能載入。');
    const response = await fetch('boundaries.json');
    if (!response.ok) throw new Error('里界資料未能載入。');
    const data = await response.json();
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const map = L.map('map', {scrollWheelZoom:false, zoomControl:true, zoomAnimation:!reduced, fadeAnimation:!reduced, attributionControl:true});
    const options = {maxZoom:19};
    const street = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {...options, attribution:'Tiles &copy; Esri — Esri, HERE, Garmin, FAO, NOAA, USGS'});
    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {...options, attribution:'Tiles &copy; Esri — Esri, Maxar, Earthstar Geographics'});
    let active = street;
    for (const layer of [street,satellite]) {
      layer.on('tileerror', () => {if(active===layer) showError('部分底圖暫時無法載入，里界仍可操作。可切換底圖或重試。', () => {status.replaceChildren();layer.redraw();});});
    }
    street.addTo(map);
    const outer = L.polygon(data.outer,{color:'#1a1ae0',weight:4,fill:false,interactive:false});
    const entries = data.li.map(v => {
      const polygon = L.polygon(v.latlngs,{color:v.color,weight:2,fillOpacity:.42}).addTo(map);
      polygon.bindPopup(v.name);
      polygon.on('click',()=>{document.getElementById('selection').textContent=v.name;});
      const row = document.createElement('div'); row.className='village';
      const checkbox = document.createElement('input');checkbox.type='checkbox';checkbox.checked=true;checkbox.setAttribute('aria-label',`顯示${v.name}`);
      checkbox.onchange=()=>{if(checkbox.checked)polygon.addTo(map);else map.removeLayer(polygon);};
      const swatch=document.createElement('span');swatch.className='swatch';swatch.style.background=v.color;
      const focus=document.createElement('button');focus.textContent=v.name;focus.setAttribute('aria-label',`定位${v.name}`);
      const arrow=document.createElement('span');arrow.textContent='定位 ↗';focus.append(arrow);
      focus.onclick=()=>{checkbox.checked=true;polygon.addTo(map);map.fitBounds(polygon.getBounds(),{padding:[45,60],animate:!reduced,maxZoom:15});polygon.openPopup();document.getElementById('selection').textContent=v.name;};
      row.append(checkbox,swatch,focus);document.getElementById('villages').append(row);
      return {polygon,checkbox};
    });
    outer.addTo(map);
    const reset=()=>{map.closePopup();entries.forEach(({polygon,checkbox})=>{checkbox.checked=true;polygon.addTo(map);});map.fitBounds(outer.getBounds(),{padding:[35,65],animate:!reduced});document.getElementById('selection').textContent='九里全區';};
    document.getElementById('reset').onclick=reset;
    document.getElementById('opacity').oninput=event=>{document.getElementById('opacity-value').textContent=`${event.target.value}%`;entries.forEach(({polygon})=>polygon.setStyle({fillOpacity:Number(event.target.value)/100}));};
    document.getElementById('wheel').onchange=event=>{map.scrollWheelZoom[event.target.checked?'enable':'disable']();};
    for(const [id,layer] of [['street',street],['satellite',satellite]]) document.getElementById(id).onclick=()=>{if(active!==layer){map.removeLayer(active);active=layer;status.replaceChildren();layer.addTo(map);}document.getElementById('street').setAttribute('aria-pressed',String(layer===street));document.getElementById('satellite').setAttribute('aria-pressed',String(layer===satellite));};
    if(matchMedia('(max-width:680px)').matches)document.getElementById('controls').open=false;
    new ResizeObserver(()=>map.invalidateSize({pan:false})).observe(document.getElementById('map'));
    status.replaceChildren();reset();
  } catch(error) { showError(`${error.message || '地圖暫時無法載入'} 請稍後重試。`,()=>location.reload()); }
})();
