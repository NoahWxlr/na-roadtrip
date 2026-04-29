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

  // Add markers — popups are interactive so the Google Maps link is clickable.
  // closeTimer + popup-hover handlers let the user move from marker → popup → link.
  markersLayer = L.layerGroup().addTo(map);
  let closeTimer = null;
  const cancelClose = () => { if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; } };
  const scheduleClose = (m) => {
    cancelClose();
    closeTimer = setTimeout(() => m.closePopup(), 250);
  };

  STOPS.forEach(stop => {
    const marker = L.marker([stop.lat, stop.lng], {
      icon: makeIcon(stop),
      keyboard: true,
      title: `Stop ${stop.num}: ${stop.name}, ${stop.state}`,
      alt: `Stop ${stop.num}: ${stop.name}, ${stop.state}`
    });
    marker.addTo(markersLayer);

    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.name + ', ' + stop.state)}`;
    const popupHtml = `
      <div class="map-tip-num">Stop ${stop.num}</div>
      <div class="map-tip-name">${stop.name}</div>
      <div class="map-tip-state">${stop.state}</div>
      <a class="map-tip-link" href="${mapsUrl}" target="_blank" rel="noopener noreferrer"
         aria-label="Open ${stop.name}, ${stop.state} in Google Maps (opens in a new tab)">
        Open in Google Maps <span aria-hidden="true">↗</span>
      </a>`;

    marker.bindPopup(popupHtml, {
      className: 'map-tip',
      closeButton: false,
      autoClose: true,
      closeOnClick: false,
      offset: [0, -10]
    });

    // Click on marker → open the sidebar (existing behavior). Suppress popup toggle.
    marker.off('click');
    marker.on('click', () => openSidebar(stop));

    marker.on('mouseover', () => {
      cancelClose();
      marker.openPopup();
    });
    marker.on('mouseout', () => scheduleClose(marker));

    // Keep popup open while user hovers it / focuses the link inside.
    marker.on('popupopen', (e) => {
      const el = e.popup.getElement();
      if (!el) return;
      el.addEventListener('mouseenter', cancelClose);
      el.addEventListener('mouseleave', () => scheduleClose(marker));
      const link = el.querySelector('.map-tip-link');
      if (link) {
        link.addEventListener('focus', cancelClose);
        link.addEventListener('blur', () => scheduleClose(marker));
      }
    });
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

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function chipHtml(stop) {
  const out = [];
  if (typeof stop.elev === 'number') {
    const elevStr = stop.elev.toLocaleString() + ' ft';
    out.push(`<span class="chip chip-elev" title="Elevation">⛰ ${elevStr}</span>`);
  }
  if (stop.climate) out.push(`<span class="chip chip-climate" title="Climate type">${escapeHtml(stop.climate)}</span>`);
  return out.join('');
}

function openSidebar(stop) {
  const color = stop.permit ? '#c46b3d' : (TYPE_COLORS[stop.type] || '#888');
  const typeLabel = { np:'National Park', city:'City / Town', climb:'Climb / Summit' }[stop.type] || '';

  // Find next stop in the route (not the current one) for directions link
  const nextStop = STOPS.find(s => s.num === stop.num + 1);
  const directionsUrl = nextStop
    ? `https://www.google.com/maps/dir/?api=1&origin=${stop.lat},${stop.lng}&destination=${nextStop.lat},${nextStop.lng}&travelmode=driving`
    : null;

  let html = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
      <div class="sb-num" style="background:${hexToRgba(color,0.15)};color:${color}">${stop.num}</div>
      <div>
        <div class="sb-name">${escapeHtml(stop.name)}</div>
        <div class="sb-state">${escapeHtml(stop.state)} · ${typeLabel}</div>
      </div>
    </div>
    <div class="sb-chips">${chipHtml(stop)}</div>
    <div class="sb-body" style="margin-bottom:10px">${stop.sub}</div>
    <div class="sb-dist">
      <span class="sb-dist-icon">🚗</span>
      <span>${escapeHtml(stop.miles)} &nbsp;·&nbsp; ${escapeHtml(stop.hrs)} drive to next stop</span>
    </div>`;

  if (directionsUrl) {
    html += `<div class="sb-directions">
      <span aria-hidden="true">🧭</span>
      <a class="sb-directions-link" href="${directionsUrl}" target="_blank" rel="noopener noreferrer"
         aria-label="Open driving directions to ${escapeHtml(nextStop.name)} in Google Maps (opens in a new tab)">
        Directions to ${escapeHtml(nextStop.name)} <span aria-hidden="true">↗</span>
      </a>
    </div>`;
  }

  if (stop.seasonNote) {
    html += `<div class="sb-season">
      <div class="sb-season-title">Season &amp; weather</div>
      <div>${escapeHtml(stop.seasonNote)}</div>
    </div>`;
  }

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
        <div class="camp-name">⛺ ${escapeHtml(c.name)}</div>
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

    const chips = [];
    if (typeof s.elev === 'number') chips.push(`<span class="chip chip-elev" title="Elevation">⛰ ${s.elev.toLocaleString()} ft</span>`);
    if (s.climate) chips.push(`<span class="chip chip-climate" title="Climate type">${escapeHtml(s.climate)}</span>`);
    if (s.seasonNote) {
      const seasonShort = s.seasonNote.length > 90 ? s.seasonNote.slice(0, 87).trim() + '…' : s.seasonNote;
      chips.push(`<span class="chip chip-season" title="${escapeHtml(s.seasonNote)}">⚠ <span class="chip-season-text">${escapeHtml(seasonShort)}</span></span>`);
    }

    const row = document.createElement('div');
    row.className = 'stop-row';
    row.dataset.num = s.num;
    row.innerHTML = `
      <div class="stop-badge" style="background:${bgColor};color:${color}">${s.num}</div>
      <div class="stop-info">
        <div class="stop-name">${escapeHtml(s.name)}${s.canada ? ' 🇨🇦' : ''}</div>
        <div class="stop-sub">${escapeHtml(s.state)} · ${s.sub}</div>
        <div class="stop-meta">
          <span class="type-tag ${badgeClass}">${typeLabel}</span>
          ${s.permit ? '<span class="type-tag" style="background:rgba(196,107,61,0.12);color:#c46b3d">Permit</span>' : ''}
          <span class="dist-chip">${escapeHtml(s.miles)} · ${escapeHtml(s.hrs)}</span>
        </div>
        ${chips.length ? `<div class="info-chips">${chips.join('')}</div>` : ''}
        ${buildPrintBlock(s)}
      </div>`;

    row.addEventListener('click', () => {
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

// Print-only block per stop — hidden on screen, shown when printing.
// Includes everything you'd want offline: highlights, camping, permit notes,
// season warnings, full driving info, and Google Maps URLs.
function buildPrintBlock(s) {
  const parts = [];
  parts.push(`<strong>${escapeHtml(s.name)}, ${escapeHtml(s.state)}</strong>`);
  if (typeof s.elev === 'number') parts.push(`Elevation: ${s.elev.toLocaleString()} ft · ${escapeHtml(s.climate || '')}`);
  parts.push(`Drive to next: ${escapeHtml(s.miles)} (${escapeHtml(s.hrs)})`);
  if (s.seasonNote) parts.push(`<strong>Season:</strong> ${escapeHtml(s.seasonNote)}`);
  if (s.permitNote) parts.push(`<strong>Permit:</strong> ${escapeHtml(s.permitNote)}`);

  let inner = parts.map(p => `<div>${p}</div>`).join('');

  if (s.highlights && s.highlights.length) {
    inner += `<div><strong>Highlights:</strong></div><ul>${s.highlights.map(h => `<li>${escapeHtml(h)}</li>`).join('')}</ul>`;
  }
  if (s.camping && s.camping.length) {
    inner += `<div><strong>Camping:</strong></div><ul>${s.camping.map(c => `<li><strong>${escapeHtml(c.name)}:</strong> ${escapeHtml(c.detail)}</li>`).join('')}</ul>`;
  }
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.name + ', ' + s.state)}`;
  inner += `<div>Google Maps: <a href="${mapsUrl}">${mapsUrl}</a></div>`;

  return `<div class="print-block">${inner}</div>`;
}

// ── PERMITS ────────────────────────────────────────────────────────────────
// Build the countdown badge HTML for a permit's `next` window.
// Today is computed at render time so the badge stays current.
function permitCountdownHtml(next) {
  if (!next) return '';
  if (next.kind === 'closed') {
    return `<div class="perm-countdown past" role="status">${escapeHtml(next.label)}</div>`;
  }
  if (next.kind === 'rolling') {
    return `<div class="perm-countdown rolling" role="status">↻ Rolling — ${escapeHtml(next.label)}</div>`;
  }
  // fixed date
  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(next.date + 'T00:00:00');
  const diffMs = target.getTime() - today.getTime();
  const days = Math.round(diffMs / 86400000);
  let cls = 'perm-countdown';
  let prefix;
  if (days < 0) {
    cls += ' past';
    prefix = `Window passed (${Math.abs(days)} days ago)`;
  } else if (days === 0) {
    cls += ' urgent';
    prefix = 'Opens TODAY';
  } else if (days <= 14) {
    cls += ' urgent';
    prefix = `<span class="perm-countdown-num">${days}</span> day${days===1?'':'s'} away`;
  } else {
    prefix = `<span class="perm-countdown-num">${days}</span> days away`;
  }
  const dateStr = target.toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'});
  return `<div class="${cls}" role="status" aria-label="${escapeHtml(next.label)}, ${days >= 0 ? days + ' days away' : 'past'}">
    ⏱ ${prefix} · ${dateStr} — ${escapeHtml(next.label)}
  </div>`;
}

function renderPermits() {
  const grid = document.getElementById('perm-grid');
  grid.innerHTML = '';
  PERMITS.forEach((p, i) => {
    const diffClass = { extreme:'diff-extreme', hard:'diff-hard', moderate:'diff-moderate' }[p.diff] || '';
    const pills = p.best.map(b => `<span class="season-pill">${b}</span>`).join('');
    const card = document.createElement('div');
    card.className = 'perm-card';
    card.innerHTML = `
      <div class="perm-card-header" onclick="togglePerm(${i})">
        <div class="perm-card-title">${p.name}${permitCountdownHtml(p.next)}</div>
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

// ── METRICS ────────────────────────────────────────────────────────────────
// Count each unique country once, regardless of how many times the route
// enters/exits it. Default is United States; Canada is added only if at
// least one stop is in Canada (stop.canada === true).
function renderMetrics() {
  const countries = new Set(['United States']);
  STOPS.forEach(s => { if (s.canada) countries.add('Canada'); });
  const count = countries.size;
  const label = Array.from(countries).join(' + ');
  ['metric-countries', 'mm-countries'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = count;
      el.setAttribute('title', label);
      el.setAttribute('aria-label', `${count} countries: ${label}`);
    }
  });
}

// ── PRINT / EXPORT ─────────────────────────────────────────────────────────
// Switch to the route panel before printing so the print stylesheet has
// the full route content ready to render. window.print() in modern browsers
// includes a "Save as PDF" destination, so this doubles as PDF export.
function printPlan() {
  navBtns.forEach(b => b.classList.remove('active'));
  panels.forEach(p => p.classList.remove('active'));
  const routeBtn = document.querySelector('[data-panel="route-panel"]');
  if (routeBtn) routeBtn.classList.add('active');
  document.getElementById('route-panel').classList.add('active');
  // Clear search/filter so all stops print
  searchQ = ''; activeFilter = 'all';
  const search = document.getElementById('route-search');
  if (search) search.value = '';
  document.querySelectorAll('.rf-btn').forEach(b => b.classList.toggle('on', b.dataset.f === 'all'));
  renderRoute();
  setTimeout(() => window.print(), 200);
}

const printBtn = document.getElementById('btn-print');
if (printBtn) printBtn.addEventListener('click', printPlan);

// ── SERVICE WORKER (offline-first) ─────────────────────────────────────────
// Caches the app shell and map tiles so the site works without cell signal,
// which is the realistic case in Havasu, Death Valley, Yoho, etc.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(err => {
      console.warn('Service worker registration failed:', err);
    });
  });
}

// ── INIT ───────────────────────────────────────────────────────────────────
renderRoute();
renderPermits();
renderRecs();
renderMetrics();
initMap();

})();
