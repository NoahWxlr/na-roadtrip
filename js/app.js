(function(){
'use strict';

// ── PANEL SWITCHING — syncs desktop nav + mobile bottom nav ───────────────
let map, currentPanel = 'map-panel';

function switchPanel(panelId) {
  currentPanel = panelId;
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById(panelId).classList.add('active');

  // Sync all nav buttons (both desktop + mobile bottom)
  document.querySelectorAll('.nav-btn, .bot-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.panel === panelId);
  });

  if (panelId === 'map-panel' && map) {
    setTimeout(() => map.invalidateSize(), 60);
  }
}

document.querySelectorAll('.nav-btn, .bot-btn').forEach(btn => {
  btn.addEventListener('click', () => switchPanel(btn.dataset.panel));
});

// ── LEAFLET MAP ────────────────────────────────────────────────────────────
function initMap() {
  map = L.map('map-canvas', {
    center: [44, -97],
    zoom: 4,
    zoomControl: true,
    attributionControl: true
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  // Route polyline
  L.polyline(STOPS.map(s => [s.lat, s.lng]), {
    color: '#6db56d',
    weight: 2,
    opacity: 0.4,
    dashArray: '5 8'
  }).addTo(map);

  // Markers
  const TYPE_COLORS = { np:'#6db56d', city:'#5b9fd4', climb:'#c8a84b' };
  STOPS.forEach(stop => {
    const color = stop.permit ? '#c46b3d' : (TYPE_COLORS[stop.type] || '#888');
    const size  = stop.permit ? 14 : 11;
    const icon  = L.divIcon({
      className: '',
      html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid rgba(0,0,0,0.45);box-shadow:0 0 5px ${color}66;display:flex;align-items:center;justify-content:center;font-size:6px;font-weight:700;color:rgba(0,0,0,0.6);font-family:Inter,sans-serif">${stop.num}</div>`,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2],
      tooltipAnchor: [0, -size/2]
    });

    const marker = L.marker([stop.lat, stop.lng], { icon }).addTo(map);

    marker.bindTooltip(
      `<div style="font-size:10px;color:#8f9b8c;margin-bottom:1px">Stop ${stop.num}</div><div style="font-size:12px;font-weight:600;color:#e4e8e0">${stop.name}</div><div style="font-size:10px;color:#4d5a4b;margin-top:1px">${stop.state}</div>`,
      { direction:'top', className:'map-tip', offset:[0, -4] }
    );

    marker.on('click', () => openSidebar(stop));
  });
}

// ── SIDEBAR ────────────────────────────────────────────────────────────────
const TYPE_COLORS = { np:'#6db56d', city:'#5b9fd4', climb:'#c8a84b' };

function hexRgba(hex, a) {
  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

document.getElementById('sidebar-close').addEventListener('click', () => {
  document.getElementById('map-sidebar').classList.remove('open');
  if (map) setTimeout(() => map.invalidateSize(), 320);
});

function openSidebar(stop) {
  const color = stop.permit ? '#c46b3d' : (TYPE_COLORS[stop.type] || '#888');
  const typeLabel = { np:'National Park', city:'City / Town', climb:'Climb / Summit' }[stop.type] || '';

  let html = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
      <div class="sb-num" style="background:${hexRgba(color,0.15)};color:${color}">${stop.num}</div>
      <div>
        <div class="sb-name">${stop.name}</div>
        <div class="sb-state">${stop.state} · ${typeLabel}</div>
      </div>
    </div>
    <div class="sb-body" style="margin-bottom:10px">${stop.sub}</div>
    <div class="sb-dist"><span style="font-size:14px">🚗</span><span>${stop.miles} &nbsp;·&nbsp; ${stop.hrs} to next stop</span></div>`;

  if (stop.permitNote) {
    html += `<div class="permit-alert"><div class="permit-alert-title">⚠ Permit Required</div><div class="permit-alert-body">${stop.permitNote}</div></div>`;
  }

  if (stop.highlights && stop.highlights.length) {
    html += `<div class="sb-section">Highlights</div>`;
    stop.highlights.forEach(h => {
      html += `<div style="display:flex;gap:7px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.04)"><span style="color:#3d5c3d;font-size:12px;flex-shrink:0;padding-top:1px">▸</span><span class="sb-body">${h}</span></div>`;
    });
  }

  if (stop.camping && stop.camping.length) {
    html += `<div class="sb-section">Camping</div>`;
    stop.camping.forEach(c => {
      html += `<div class="camp-item"><div class="camp-name">⛺ ${c.name}</div><div class="camp-detail">${c.detail}</div></div>`;
    });
  }

  document.getElementById('sidebar-content').innerHTML = html;
  document.getElementById('map-sidebar').classList.add('open');
  if (map) setTimeout(() => map.invalidateSize(), 320);
}

// ── ROUTE LIST ─────────────────────────────────────────────────────────────
let activeFilter = 'all', searchQ = '';

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

function renderRoute() {
  const list = document.getElementById('route-list');
  list.innerHTML = '';
  const visible = STOPS.filter(s =>
    (activeFilter === 'all' || (activeFilter==='np' && s.type==='np') || (activeFilter==='city' && s.type==='city') || (activeFilter==='climb' && s.type==='climb') || (activeFilter==='canada' && s.canada) || (activeFilter==='permit' && s.permit)) &&
    (!searchQ || s.name.toLowerCase().includes(searchQ) || s.state.toLowerCase().includes(searchQ) || s.sub.toLowerCase().includes(searchQ))
  );

  if (!visible.length) {
    list.innerHTML = '<p style="color:#4d5a4b;padding:20px 0;text-align:center">No stops match.</p>';
    return;
  }

  visible.forEach((s, i) => {
    const color = s.permit ? '#c46b3d' : (TYPE_COLORS[s.type] || '#888');
    const bgColor = hexRgba(color, 0.12);
    const typeLabel = { np:'Park', city:'City', climb:'Climb' }[s.type] || '';
    const badgeClass = { np:'tag-np', city:'tag-city', climb:'tag-climb' }[s.type] || 'tag-city';
    const row = document.createElement('div');
    row.className = 'stop-row';
    row.innerHTML = `
      <div class="stop-badge" style="background:${bgColor};color:${color}">${s.num}</div>
      <div class="stop-info">
        <div class="stop-name">${s.name}${s.canada?' 🇨🇦':''}</div>
        <div class="stop-sub">${s.state} · ${s.sub}</div>
        <div class="stop-meta">
          <span class="type-tag ${badgeClass}">${typeLabel}</span>
          ${s.permit?'<span class="type-tag" style="background:rgba(196,107,61,0.12);color:#c46b3d">Permit</span>':''}
          <span class="dist-chip">${s.miles} · ${s.hrs}</span>
        </div>
      </div>`;
    row.addEventListener('click', () => {
      switchPanel('map-panel');
      setTimeout(() => {
        if (map) map.setView([s.lat, s.lng], 8, { animate:true });
        openSidebar(s);
      }, 80);
    });
    list.appendChild(row);
    if (i < visible.length - 1) {
      const a = document.createElement('div');
      a.className = 'route-arrow';
      a.textContent = '↓';
      list.appendChild(a);
    }
  });
}

// ── PERMITS ────────────────────────────────────────────────────────────────
function renderPermits() {
  const grid = document.getElementById('perm-grid');
  PERMITS.forEach((p, i) => {
    const diffClass = { extreme:'diff-extreme', hard:'diff-hard', moderate:'diff-moderate' }[p.diff] || '';
    const card = document.createElement('div');
    card.className = 'perm-card';
    card.innerHTML = `
      <div class="perm-card-header" onclick="togglePerm(${i})">
        <div class="perm-card-title">${p.name}</div>
        <div class="perm-card-right">
          <span class="diff-pill ${diffClass}">${p.diffLabel}</span>
          <span class="perm-chev" id="pc${i}">›</span>
        </div>
      </div>
      <div class="perm-body" id="pb${i}">
        <div class="perm-row"><div class="perm-label">Best time</div><div class="perm-val">${p.best.map(b=>`<span class="season-pill">${b}</span>`).join('')}</div></div>
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
  const body = document.getElementById('pb'+i);
  const chev = document.getElementById('pc'+i);
  const open = body.classList.contains('open');
  body.classList.toggle('open', !open);
  chev.classList.toggle('open', !open);
};

// ── RECS ───────────────────────────────────────────────────────────────────
function renderRecs() {
  const inner = document.getElementById('recs-inner');
  const makeCards = arr => arr.map(r => `
    <div class="rec-card">
      <div class="rec-card-top">
        <div class="rec-card-name">${r.name}</div>
        <span class="rec-tag">${r.tag}</span>
      </div>
      <div class="rec-body">${r.body}</div>
    </div>`).join('');

  inner.innerHTML =
    '<div class="recs-section-title">Must-add (high priority)</div>' +
    '<div class="recs-grid">' + makeCards(RECS_HIGH) + '</div>' +
    '<div class="recs-section-title">Worth the slight detour</div>' +
    '<div class="recs-grid">' + makeCards(RECS_MED) + '</div>';
}

// ── INIT ───────────────────────────────────────────────────────────────────
renderRoute();
renderPermits();
renderRecs();
initMap();

})();
