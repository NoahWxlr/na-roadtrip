(function(){
'use strict';

// ── PANEL NAV ─────────────────────────────────────────────────────────────
const navBtns = document.querySelectorAll('.nav-btn');
const panels  = document.querySelectorAll('.panel');
let map, markersLayer, routeLine;

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    navBtns.forEach(b => b.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.panel).classList.add('active');
    if (btn.dataset.panel === 'map-panel') {
      setTimeout(() => { if (map) map.invalidateSize(); }, 50);
    }
  });
});

// ── LEAFLET MAP ────────────────────────────────────────────────────────────
function initMap() {
  map = L.map('map-canvas', {
    center: [44, -97],
    zoom: 4,
    zoomControl: true
  });

  // Dark map tiles — CartoDB Dark Matter, no API key needed
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  drawRoute();
}

const TYPE_COLORS = { np: '#6db56d', city: '#5b9fd4', climb: '#c8a84b' };

function makeIcon(stop) {
  const color = stop.permit ? '#c46b3d' : (TYPE_COLORS[stop.type] || '#888');
  const size  = stop.permit ? 14 : 11;
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:2px solid rgba(0,0,0,0.5);
      box-shadow:0 0 6px ${color}88;
      display:flex;align-items:center;justify-content:center;
      font-size:7px;font-weight:700;color:rgba(0,0,0,0.7);
      font-family:Inter,sans-serif;
    ">${stop.num}</div>`,
    iconSize:   [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor:[0, -size/2]
  });
}

function drawRoute() {
  // Draw the route polyline
  const latlngs = STOPS.map(s => [s.lat, s.lng]);
  routeLine = L.polyline(latlngs, {
    color: '#6db56d',
    weight: 2,
    opacity: 0.45,
    dashArray: '6 8'
  }).addTo(map);

  // Add markers
  markersLayer = L.layerGroup().addTo(map);
  STOPS.forEach(stop => {
    const marker = L.marker([stop.lat, stop.lng], { icon: makeIcon(stop) });
    marker.addTo(markersLayer);
    marker.on('click', () => openSidebar(stop));
    marker.on('mouseover', () => {
      marker.bindTooltip(`
        <div style="font-size:11px;color:#9da89b;margin-bottom:2px">Stop ${stop.num}</div>
        <div style="font-size:13px;font-weight:600;color:#e4e8e0">${stop.name}</div>
        <div style="font-size:11px;color:#4d5a4b;margin-top:1px">${stop.state}</div>
      `, {
        direction: 'top',
        offset: [0, -8],
        className: 'map-tooltip-leaflet'
      }).openTooltip();
    });
    marker.on('mouseout', () => marker.closeTooltip());
  });
}

// ── SIDEBAR ────────────────────────────────────────────────────────────────
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

document.getElementById('sidebar-close').addEventListener('click', () => {
  document.getElementById('map-sidebar').classList.remove('open');
});

function openSidebar(stop) {
  const color = stop.permit ? '#c46b3d' : (TYPE_COLORS[stop.type] || '#888');
  const typeLabel = { np:'National Park', city:'City / Town', climb:'Climb / Summit' }[stop.type] || '';

  let html = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
      <div class="sb-num" style="background:${hexToRgba(color,0.15)};color:${color}">${stop.num}</div>
      <div>
        <div class="sb-name">${stop.name}</div>
        <div class="sb-state">${stop.state} · ${typeLabel}</div>
      </div>
    </div>
    <div class="sb-body" style="margin-bottom:10px">${stop.sub}</div>
    <div class="sb-dist">
      <span class="sb-dist-icon">🚗</span>
      <span>${stop.miles} &nbsp;·&nbsp; ${stop.hrs} drive to next stop</span>
    </div>`;

  if (stop.permitNote) {
    html += `<div class="permit-alert">
      <div class="permit-alert-title">⚠ Permit Required</div>
      <div class="permit-alert-body">${stop.permitNote}</div>
    </div>`;
  }

  if (stop.highlights && stop.highlights.length) {
    html += `<div class="sb-section">Highlights</div>`;
    stop.highlights.forEach(h => {
      html += `<div style="display:flex;gap:7px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.04)">
        <span style="color:#3d5c3d;font-size:12px;flex-shrink:0;padding-top:1px">▸</span>
        <span class="sb-body">${h}</span>
      </div>`;
    });
  }

  if (stop.camping && stop.camping.length) {
    html += `<div class="sb-section">Camping</div>`;
    stop.camping.forEach(c => {
      html += `<div class="camp-item">
        <div class="camp-name">⛺ ${c.name}</div>
        <div class="camp-detail">${c.detail}</div>
      </div>`;
    });
  }

  document.getElementById('sidebar-content').innerHTML = html;
  document.getElementById('map-sidebar').classList.add('open');
  setTimeout(() => { if (map) map.invalidateSize(); }, 320);
}

// ── ROUTE LIST ─────────────────────────────────────────────────────────────
let activeFilter = 'all';
let searchQ = '';

document.querySelectorAll('.rf-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.rf-btn').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    activeFilter = btn.dataset.f;
    renderRoute();
  });
});

document.getElementById('route-search').addEventListener('input', e => {
  searchQ = e.target.value.toLowerCase();
  renderRoute();
});

function matchFilter(s) {
  if (activeFilter === 'all')    return true;
  if (activeFilter === 'np')     return s.type === 'np';
  if (activeFilter === 'city')   return s.type === 'city';
  if (activeFilter === 'climb')  return s.type === 'climb';
  if (activeFilter === 'canada') return s.canada;
  if (activeFilter === 'permit') return s.permit;
  return true;
}

function renderRoute() {
  const list = document.getElementById('route-list');
  list.innerHTML = '';
  const visible = STOPS.filter(s =>
    matchFilter(s) && (!searchQ ||
      s.name.toLowerCase().includes(searchQ) ||
      s.state.toLowerCase().includes(searchQ) ||
      s.sub.toLowerCase().includes(searchQ))
  );

  if (!visible.length) {
    list.innerHTML = '<p style="color:#4d5a4b;padding:20px 0;text-align:center">No stops match.</p>';
    return;
  }

  visible.forEach((s, i) => {
    const color    = s.permit ? '#c46b3d' : (TYPE_COLORS[s.type] || '#888');
    const bgColor  = hexToRgba(color, 0.12);
    const typeLabel = { np:'Park', city:'City', climb:'Climb' }[s.type] || '';
    const badgeClass = { np:'tag-np', city:'tag-city', climb:'tag-climb' }[s.type] || 'tag-city';

    const row = document.createElement('div');
    row.className = 'stop-row';
    row.innerHTML = `
      <div class="stop-badge" style="background:${bgColor};color:${color}">${s.num}</div>
      <div class="stop-info">
        <div class="stop-name">${s.name}${s.canada ? ' 🇨🇦' : ''}</div>
        <div class="stop-sub">${s.state} · ${s.sub}</div>
        <div class="stop-meta">
          <span class="type-tag ${badgeClass}">${typeLabel}</span>
          ${s.permit ? '<span class="type-tag" style="background:rgba(196,107,61,0.12);color:#c46b3d">Permit</span>' : ''}
          <span class="dist-chip">${s.miles} · ${s.hrs}</span>
        </div>
      </div>`;

    row.addEventListener('click', () => {
      // Switch to map tab and open sidebar
      navBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      document.querySelector('[data-panel="map-panel"]').classList.add('active');
      document.getElementById('map-panel').classList.add('active');
      setTimeout(() => {
        if (map) {
          map.invalidateSize();
          map.setView([s.lat, s.lng], 8, { animate: true });
        }
        openSidebar(s);
      }, 60);
    });

    list.appendChild(row);
    if (i < visible.length - 1) {
      const arrow = document.createElement('div');
      arrow.className = 'route-arrow';
      arrow.textContent = '↓';
      list.appendChild(arrow);
    }
  });
}

// ── PERMITS ────────────────────────────────────────────────────────────────
function renderPermits() {
  const grid = document.getElementById('perm-grid');
  PERMITS.forEach((p, i) => {
    const diffClass = { extreme:'diff-extreme', hard:'diff-hard', moderate:'diff-moderate' }[p.diff] || '';
    const pills = p.best.map(b => `<span class="season-pill">${b}</span>`).join('');
    const card = document.createElement('div');
    card.className = 'perm-card';
    card.innerHTML = `
      <div class="perm-card-header" onclick="togglePerm(${i})">
        <div class="perm-card-title">${p.name}</div>
        <div class="perm-card-right">
          <span class="diff-pill ${diffClass}">${p.diffLabel}</span>
          <span class="perm-chev" id="pchev-${i}">›</span>
        </div>
      </div>
      <div class="perm-body" id="pbody-${i}">
        <div class="perm-row"><div class="perm-label">Best time</div><div class="perm-val">${pills}</div></div>
        <div class="perm-row"><div class="perm-label">How to apply</div><div class="perm-val">${p.how}</div></div>
        <div class="perm-row"><div class="perm-label">Website</div><div class="perm-val"><a href="https://${p.website}" target="_blank" rel="noopener">${p.website}</a></div></div>
        <div class="perm-row"><div class="perm-label">Cost</div><div class="perm-val">${p.cost}</div></div>
        <div class="perm-row"><div class="perm-label">When to apply</div><div class="perm-val">${p.when}</div></div>
        <div class="perm-row"><div class="perm-label">Key notes</div><div class="perm-val">${p.notes}</div></div>
      </div>`;
    grid.appendChild(card);
  });
}

window.togglePerm = function(i) {
  const body = document.getElementById('pbody-' + i);
  const chev = document.getElementById('pchev-' + i);
  const open = body.classList.contains('open');
  body.classList.toggle('open', !open);
  chev.classList.toggle('open', !open);
};

// ── RECOMMENDATIONS ────────────────────────────────────────────────────────
function renderRecs() {
  const inner = document.getElementById('recs-inner');
  let html = '<div class="recs-section-title">Must-add (high priority)</div><div class="recs-grid">';
  RECS_HIGH.forEach(r => {
    html += `<div class="rec-card">
      <div class="rec-card-top">
        <div class="rec-card-name">${r.name}</div>
        <span class="rec-tag">${r.tag}</span>
      </div>
      <div class="rec-body">${r.body}</div>
    </div>`;
  });
  html += '</div><div class="recs-section-title">Worth the slight detour</div><div class="recs-grid">';
  RECS_MED.forEach(r => {
    html += `<div class="rec-card">
      <div class="rec-card-top">
        <div class="rec-card-name">${r.name}</div>
        <span class="rec-tag">${r.tag}</span>
      </div>
      <div class="rec-body">${r.body}</div>
    </div>`;
  });
  html += '</div>';
  inner.innerHTML = html;
}

// ── INIT ───────────────────────────────────────────────────────────────────
renderRoute();
renderPermits();
renderRecs();
initMap();

})();
