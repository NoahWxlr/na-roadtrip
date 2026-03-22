(function(){
'use strict';

// ── PANEL NAV ──────────────────────────────────────────────────────────────
const navBtns = document.querySelectorAll('.nav-btn');
const panels  = document.querySelectorAll('.panel');
navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    navBtns.forEach(b => b.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.panel).classList.add('active');
    if(btn.dataset.panel === 'map-panel') requestAnimationFrame(drawMap);
  });
});

// ── MAP ENGINE ─────────────────────────────────────────────────────────────
const canvas  = document.getElementById('map-canvas');
const ctx     = canvas.getContext('2d');
const tooltip = document.getElementById('map-tooltip');
const sidebar = document.getElementById('map-sidebar');
const sideContent = document.getElementById('sidebar-content');
document.getElementById('sidebar-close').addEventListener('click', () => sidebar.classList.remove('open'));

// Map bounds (geographic)
const GEO = { minLat:22, maxLat:55, minLng:-130, maxLng:-55 };
// Zoom/pan state
let transform = { x:0, y:0, scale:1 };
let isDragging = false, dragStart = {x:0,y:0}, dragTransform = {x:0,y:0};

function resize(){
  canvas.width  = canvas.offsetWidth  * devicePixelRatio;
  canvas.height = canvas.offsetHeight * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
  drawMap();
}

function geoToPixel(lat, lng){
  const W = canvas.offsetWidth, H = canvas.offsetHeight;
  // Mercator-ish projection
  const x = (lng - GEO.minLng) / (GEO.maxLng - GEO.minLng) * W;
  const latR = lat * Math.PI/180;
  const maxR = GEO.maxLat * Math.PI/180;
  const minR = GEO.minLat * Math.PI/180;
  const projected = Math.log(Math.tan(Math.PI/4 + latR/2));
  const projMax   = Math.log(Math.tan(Math.PI/4 + maxR/2));
  const projMin   = Math.log(Math.tan(Math.PI/4 + minR/2));
  const y = (1 - (projected - projMin)/(projMax - projMin)) * H;
  return { x: x*transform.scale + transform.x, y: y*transform.scale + transform.y };
}

const TYPE_COLORS = { np:'#6db56d', city:'#5b9fd4', climb:'#c8a84b' };

function drawMap(){
  if(!canvas.offsetWidth) return;
  const W = canvas.offsetWidth, H = canvas.offsetHeight;
  ctx.clearRect(0,0,W,H);

  // Background
  ctx.fillStyle = '#0e1210';
  ctx.fillRect(0,0,W,H);

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  for(let lng=-130; lng<=-55; lng+=10){
    const a = geoToPixel(55,lng), b = geoToPixel(22,lng);
    ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
  }
  for(let lat=25; lat<=55; lat+=5){
    const a = geoToPixel(lat,-130), b = geoToPixel(lat,-55);
    ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
  }

  // Route line
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(109,181,109,0.25)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4,6]);
  STOPS.forEach((s,i) => {
    const p = geoToPixel(s.lat,s.lng);
    if(i===0) ctx.moveTo(p.x,p.y); else ctx.lineTo(p.x,p.y);
  });
  ctx.stroke();
  ctx.setLineDash([]);

  // Stop dots
  const scale = Math.max(0.6, Math.min(1.4, transform.scale));
  STOPS.forEach(s => {
    const p = geoToPixel(s.lat,s.lng);
    const r = (s.permit ? 6 : 4.5) * scale;
    const color = s.permit ? '#c46b3d' : (TYPE_COLORS[s.type] || '#888');

    // glow
    const g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r*3);
    g.addColorStop(0, color.replace(')',',0.3)').replace('rgb','rgba').replace('#','rgba(').replace(/([0-9a-f]{2})/gi, (m,c) => parseInt(c,16)+',') );
    // simpler glow:
    ctx.beginPath();
    ctx.arc(p.x,p.y,r*2.5,0,Math.PI*2);
    ctx.fillStyle = hexToRgba(color, 0.1);
    ctx.fill();

    // dot
    ctx.beginPath();
    ctx.arc(p.x,p.y,r,0,Math.PI*2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // number label
    if(scale > 0.8){
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.round(8*scale)}px Inter,sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.num, p.x, p.y);
    }
  });
}

function hexToRgba(hex, alpha){
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function hitTest(mx,my){
  const scale = Math.max(0.6,Math.min(1.4,transform.scale));
  const hitR = (8*scale + 4) * devicePixelRatio;
  for(let i=STOPS.length-1;i>=0;i--){
    const s = STOPS[i];
    const p = geoToPixel(s.lat,s.lng);
    const px = p.x * devicePixelRatio;
    const py = p.y * devicePixelRatio;
    const dx = mx-px, dy = my-py;
    if(Math.sqrt(dx*dx+dy*dy) < hitR) return s;
  }
  return null;
}

// Mouse events
canvas.addEventListener('mousemove', e => {
  if(isDragging){
    transform.x = dragTransform.x + (e.clientX - dragStart.x);
    transform.y = dragTransform.y + (e.clientY - dragStart.y);
    drawMap();
    tooltip.style.display='none';
    return;
  }
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX-rect.left)*devicePixelRatio;
  const my = (e.clientY-rect.top)*devicePixelRatio;
  const hit = hitTest(mx,my);
  if(hit){
    canvas.style.cursor='pointer';
    tooltip.style.display='block';
    tooltip.style.left=(e.clientX-rect.left+12)+'px';
    tooltip.style.top =(e.clientY-rect.top-10)+'px';
    tooltip.innerHTML=`<div class="tt-num">Stop ${hit.num}</div><div class="tt-name">${hit.name}</div><div style="font-size:10px;color:#5f6b5d;margin-top:2px">${hit.state}</div>`;
  } else {
    canvas.style.cursor='grab';
    tooltip.style.display='none';
  }
});

canvas.addEventListener('mousedown', e => {
  isDragging=true;
  dragStart={x:e.clientX,y:e.clientY};
  dragTransform={x:transform.x,y:transform.y};
  canvas.style.cursor='grabbing';
});

canvas.addEventListener('mouseup', e => {
  const dist = Math.abs(e.clientX-dragStart.x)+Math.abs(e.clientY-dragStart.y);
  isDragging=false;
  canvas.style.cursor='grab';
  if(dist<5){
    const rect=canvas.getBoundingClientRect();
    const mx=(e.clientX-rect.left)*devicePixelRatio;
    const my=(e.clientY-rect.top)*devicePixelRatio;
    const hit=hitTest(mx,my);
    if(hit) openSidebar(hit);
  }
});

canvas.addEventListener('mouseleave',()=>{ isDragging=false; tooltip.style.display='none'; });

canvas.addEventListener('wheel', e=>{
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX-rect.left;
  const my = e.clientY-rect.top;
  const delta = e.deltaY > 0 ? 0.85 : 1.18;
  const newScale = Math.max(0.4, Math.min(5, transform.scale*delta));
  transform.x = mx - (mx-transform.x)*(newScale/transform.scale);
  transform.y = my - (my-transform.y)*(newScale/transform.scale);
  transform.scale = newScale;
  drawMap();
},{passive:false});

// Touch support
let lastTouchDist=0;
canvas.addEventListener('touchstart',e=>{
  if(e.touches.length===1){
    isDragging=true;
    dragStart={x:e.touches[0].clientX,y:e.touches[0].clientY};
    dragTransform={x:transform.x,y:transform.y};
  } else if(e.touches.length===2){
    lastTouchDist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
  }
},{passive:true});
canvas.addEventListener('touchmove',e=>{
  e.preventDefault();
  if(e.touches.length===1 && isDragging){
    transform.x=dragTransform.x+(e.touches[0].clientX-dragStart.x);
    transform.y=dragTransform.y+(e.touches[0].clientY-dragStart.y);
    drawMap();
  } else if(e.touches.length===2){
    const dist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
    const delta=dist/lastTouchDist;
    transform.scale=Math.max(0.4,Math.min(5,transform.scale*delta));
    lastTouchDist=dist;
    drawMap();
  }
},{passive:false});
canvas.addEventListener('touchend',e=>{ if(e.touches.length===0) isDragging=false; });

function openSidebar(stop){
  const color = stop.permit ? '#c46b3d' : (TYPE_COLORS[stop.type]||'#888');
  const typeLabel = {np:'National Park',city:'City / Town',climb:'Climb'}[stop.type]||'';
  let html = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
      <div class="sb-num" style="background:${hexToRgba(color,0.15)};color:${color}">${stop.num}</div>
      <div>
        <div class="sb-name">${stop.name}</div>
        <div class="sb-state">${stop.state} · ${typeLabel}</div>
      </div>
    </div>
    <div class="sb-body" style="margin-bottom:10px">${stop.sub}</div>
    <div class="sb-dist"><span class="sb-dist-icon">🚗</span><span>${stop.miles} · ${stop.hrs} drive</span></div>
  `;

  if(stop.permitNote){
    html += `<div class="permit-alert"><div class="permit-alert-title">⚠ Permit Required</div><div class="permit-alert-body">${stop.permitNote}</div></div>`;
  }

  if(stop.highlights && stop.highlights.length){
    html += `<div class="sb-section">Highlights</div>`;
    stop.highlights.forEach(h => {
      html += `<div style="display:flex;gap:7px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.04)"><span style="color:#3d5c3d;font-size:12px;flex-shrink:0;padding-top:1px">▸</span><span class="sb-body">${h}</span></div>`;
    });
  }

  if(stop.camping && stop.camping.length){
    html += `<div class="sb-section">Camping</div>`;
    stop.camping.forEach(c => {
      html += `<div class="camp-item"><div class="camp-name">⛺ ${c.name}</div><div class="camp-detail">${c.detail}</div></div>`;
    });
  }

  sideContent.innerHTML = html;
  sidebar.classList.add('open');
}

// ── ROUTE LIST ─────────────────────────────────────────────────────────────
let activeFilter = 'all';
let searchQ = '';

document.querySelectorAll('.rf-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.rf-btn').forEach(b=>b.classList.remove('on'));
    btn.classList.add('on');
    activeFilter=btn.dataset.f;
    renderRoute();
  });
});

const routeSearch = document.getElementById('route-search');
routeSearch.addEventListener('input',e=>{ searchQ=e.target.value.toLowerCase(); renderRoute(); });

function matchFilter(s){
  if(activeFilter==='all') return true;
  if(activeFilter==='np') return s.type==='np';
  if(activeFilter==='city') return s.type==='city';
  if(activeFilter==='climb') return s.type==='climb';
  if(activeFilter==='canada') return s.canada;
  if(activeFilter==='permit') return s.permit;
  return true;
}

function renderRoute(){
  const list = document.getElementById('route-list');
  list.innerHTML='';
  const visible = STOPS.filter(s=>matchFilter(s)&&(!searchQ||s.name.toLowerCase().includes(searchQ)||s.state.toLowerCase().includes(searchQ)||s.sub.toLowerCase().includes(searchQ)));
  if(!visible.length){ list.innerHTML='<p style="color:#4d5a4b;padding:20px 0;text-align:center">No stops match.</p>'; return; }
  visible.forEach((s,i)=>{
    const color = s.permit ? '#c46b3d' : (TYPE_COLORS[s.type]||'#888');
    const bgColor = hexToRgba(color,0.12);
    const typeLabel = {np:'Park',city:'City',climb:'Climb'}[s.type]||'';
    const badgeClass = {np:'tag-np',city:'tag-city',climb:'tag-climb'}[s.type]||'tag-city';
    const row = document.createElement('div');
    row.className='stop-row';
    row.style.animationDelay=(i*0.015)+'s';
    row.innerHTML=`
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
    row.addEventListener('click',()=>{
      document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
      document.querySelector('[data-panel="map-panel"]').classList.add('active');
      document.getElementById('map-panel').classList.add('active');
      requestAnimationFrame(()=>{ drawMap(); openSidebar(s); });
    });
    list.appendChild(row);
    if(i<visible.length-1){
      const arr=document.createElement('div'); arr.className='route-arrow'; arr.textContent='↓'; list.appendChild(arr);
    }
  });
}

// ── PERMITS ────────────────────────────────────────────────────────────────
function renderPermits(){
  const grid = document.getElementById('perm-grid');
  PERMITS.forEach((p,i)=>{
    const diffClass={extreme:'diff-extreme',hard:'diff-hard',moderate:'diff-moderate'}[p.diff]||'';
    const pills=p.best.map(b=>`<span class="season-pill">${b}</span>`).join('');
    const card=document.createElement('div');
    card.className='perm-card';
    card.innerHTML=`
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

window.togglePerm=function(i){
  const body=document.getElementById('pbody-'+i);
  const chev=document.getElementById('pchev-'+i);
  const open=body.classList.contains('open');
  body.classList.toggle('open',!open);
  chev.classList.toggle('open',!open);
};

// ── RECOMMENDATIONS ────────────────────────────────────────────────────────
function renderRecs(){
  const inner=document.getElementById('recs-inner');
  let html='<div class="recs-section-title">Must-add (high priority)</div><div class="recs-grid">';
  RECS_HIGH.forEach(r=>{ html+=`<div class="rec-card"><div class="rec-card-top"><div class="rec-card-name">${r.name}</div><span class="rec-tag">${r.tag}</span></div><div class="rec-body">${r.body}</div></div>`; });
  html+='</div><div class="recs-section-title">Worth the slight detour</div><div class="recs-grid">';
  RECS_MED.forEach(r=>{ html+=`<div class="rec-card"><div class="rec-card-top"><div class="rec-card-name">${r.name}</div><span class="rec-tag">${r.tag}</span></div><div class="rec-body">${r.body}</div></div>`; });
  html+='</div>';
  inner.innerHTML=html;
}

// ── INIT ───────────────────────────────────────────────────────────────────
window.addEventListener('resize', resize);
renderRoute();
renderPermits();
renderRecs();
resize();

})();
