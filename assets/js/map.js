let markers = [];
let lines = [];
let map;
const emoji = { restaurant:'🍽', attraction:'📍', hotel:'🏨', transport:'🚆', airport:'✈️', flight:'✈️', area:'•', activity:'🎈' };

export function initMap() {
  map = L.map('map', { zoomControl:false }).setView([36.8, 30.7], 4);
  L.control.zoom({ position:'topright' }).addTo(map);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom:19, attribution:'&copy; OpenStreetMap &copy; CARTO' }).addTo(map);
  return map;
}

function icon(color, label) {
  return L.divIcon({ className:'', html:`<div style="width:30px;height:30px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 9px rgba(0,0,0,.22);display:flex;align-items:center;justify-content:center;font-size:14px">${label || ''}</div>`, iconSize:[30,30], iconAnchor:[15,15], popupAnchor:[0,-14] });
}

function clearMap() {
  markers.forEach(m => m.remove());
  lines.forEach(l => l.remove());
  markers = [];
  lines = [];
}

export function showMap(day, allDays, placeById) {
  if (!map) initMap();
  clearMap();
  const pts = [];
  const days = day.id === 0 ? allDays.slice(1) : [day];
  for (const d of days) {
    for (const item of d.items || []) {
      const p = placeById.get(item.placeId);
      if (!p?.coordinates) continue;
      const ll = [p.coordinates.lat, p.coordinates.lng];
      pts.push(ll);
      const popup = `<b>${p.name.local}</b><br>${p.name.zh}<br>${d.label}`;
      if (day.id === 0) {
        markers.push(L.circleMarker(ll, { radius:4, color:'#fff', weight:1.4, fillColor:d.color, fillOpacity:.88 }).addTo(map).bindPopup(popup));
      } else {
        markers.push(L.marker(ll, { icon:icon(d.color, emoji[p.type] || '•') }).addTo(map).bindPopup(popup));
      }
    }
  }
  if (day.id !== 0 && pts.length > 1) lines.push(L.polyline(pts, { color:day.color, weight:3, opacity:.55, dashArray:'6,5' }).addTo(map));
  if (pts.length) map.fitBounds(pts, { padding:[36,36], maxZoom:13 });
}

