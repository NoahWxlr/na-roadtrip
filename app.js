/* ─────────────────────────────────────────────────────────
   NA Road Trip App — UI Logic
───────────────────────────────────────────────────────── */

(function () {
  'use strict';

  /* ── TABS ─────────────────────────────────────────── */
  const tabBtns   = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + target).classList.add('active');
    });
  });

  /* ── ROUTE ────────────────────────────────────────── */
  let activeFilter = 'all';
  let searchQuery  = '';

  const filterBtns  = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('stop-search');
  const routeList   = document.getElementById('route-list');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      renderRoute();
    });
  });

  searchInput.addEventListener('input', e => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderRoute();
  });

  function matchesFilter(stop) {
    if (activeFilter === 'all')    return true;
    if (activeFilter === 'np')     return stop.type === 'np';
    if (activeFilter === 'city')   return stop.type === 'city';
    if (activeFilter === 'climb')  return stop.type === 'climb';
    if (activeFilter === 'canada') return stop.canada === true;
    return true;
  }

  function matchesSearch(stop) {
    if (!searchQuery) return true;
    return (
      stop.name.toLowerCase().includes(searchQuery) ||
      stop.sub.toLowerCase().includes(searchQuery)
    );
  }

  function renderRoute() {
    routeList.innerHTML = '';
    const visible = STOPS.filter(s => matchesFilter(s) && matchesSearch(s));

    if (visible.length === 0) {
      routeList.innerHTML = '<p style="color:var(--text3);padding:20px 0;text-align:center;">No stops match that filter.</p>';
      return;
    }

    visible.forEach((stop, idx) => {
      const card = document.createElement('div');
      card.className = 'stop-card';
      card.style.animationDelay = (idx * 0.02) + 's';

      const numClass = { np: 'stop-num--np', city: 'stop-num--city', climb: 'stop-num--climb' }[stop.type] || '';
      const typeLabel = { np: 'Park', city: 'City', climb: 'Climb' }[stop.type] || '';
      const badgeClass = { np: 'type-badge--np', city: 'type-badge--city', climb: 'type-badge--climb' }[stop.type] || '';

      card.innerHTML =
        '<div class="stop-num ' + numClass + '">' + stop.num + '</div>' +
        '<div class="stop-info">' +
          '<div class="stop-name">' + escHtml(stop.name) + '</div>' +
          '<div class="stop-sub">' + escHtml(stop.sub) + '</div>' +
          '<div class="stop-meta">' +
            '<span class="type-badge ' + badgeClass + '">' + typeLabel + '</span>' +
            '<span class="dist-tag">' + escHtml(stop.miles) + ' · ' + escHtml(stop.hrs) + '</span>' +
          '</div>' +
        '</div>';

      routeList.appendChild(card);

      if (idx < visible.length - 1) {
        const arrow = document.createElement('div');
        arrow.className = 'route-arrow';
        arrow.textContent = '↓';
        routeList.appendChild(arrow);
      }
    });
  }

  /* ── PERMITS ──────────────────────────────────────── */
  const permitsList = document.getElementById('permits-list');

  function renderPermits() {
    PERMITS.forEach((p, i) => {
      const diffClass = { extreme: 'diff--extreme', hard: 'diff--hard', moderate: 'diff--moderate' }[p.diff] || '';

      const pills = p.best.map(b =>
        '<span class="best-pill">' + escHtml(b) + '</span>'
      ).join('');

      const card = document.createElement('div');
      card.className = 'permit-card';

      card.innerHTML =
        '<div class="permit-header" role="button" tabindex="0" aria-expanded="false" data-idx="' + i + '">' +
          '<span class="permit-title">' + escHtml(p.name) + '</span>' +
          '<div class="permit-right">' +
            '<span class="diff-badge ' + diffClass + '">' + escHtml(p.diffLabel) + '</span>' +
            '<span class="chevron" id="chev-' + i + '">›</span>' +
          '</div>' +
        '</div>' +
        '<div class="permit-body" id="pbody-' + i + '">' +
          '<div class="permit-row"><div class="pr-label">Best time</div><div class="pr-val"><div class="best-pills">' + pills + '</div></div></div>' +
          '<div class="permit-row"><div class="pr-label">How to apply</div><div class="pr-val">' + escHtml(p.how) + '</div></div>' +
          '<div class="permit-row"><div class="pr-label">Website</div><div class="pr-val"><a href="https://' + escHtml(p.website) + '" target="_blank" rel="noopener">' + escHtml(p.website) + '</a></div></div>' +
          '<div class="permit-row"><div class="pr-label">Cost</div><div class="pr-val">' + escHtml(p.cost) + '</div></div>' +
          '<div class="permit-row"><div class="pr-label">When to apply</div><div class="pr-val">' + escHtml(p.when) + '</div></div>' +
          '<div class="permit-row"><div class="pr-label">Key notes</div><div class="pr-val">' + escHtml(p.notes) + '</div></div>' +
        '</div>';

      permitsList.appendChild(card);

      const header = card.querySelector('.permit-header');
      header.addEventListener('click', () => togglePermit(i));
      header.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') togglePermit(i); });
    });
  }

  function togglePermit(i) {
    const body = document.getElementById('pbody-' + i);
    const chev = document.getElementById('chev-' + i);
    const isOpen = body.classList.contains('open');
    body.classList.toggle('open', !isOpen);
    chev.classList.toggle('open', !isOpen);
    body.closest('.permit-header') && body.closest('.permit-header').setAttribute('aria-expanded', !isOpen);
  }

  /* ── RECOMMENDATIONS ──────────────────────────────── */
  function renderRecs(arr, containerId) {
    const container = document.getElementById(containerId);
    arr.forEach(rec => {
      const card = document.createElement('div');
      card.className = 'rec-card';
      card.innerHTML =
        '<h3>' + escHtml(rec.name) + '<span class="new-badge">' + escHtml(rec.tag) + '</span></h3>' +
        '<p>' + escHtml(rec.body) + '</p>';
      container.appendChild(card);
    });
  }

  /* ── UTILITY ──────────────────────────────────────── */
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ── INIT ─────────────────────────────────────────── */
  renderRoute();
  renderPermits();
  renderRecs(RECS_HIGH, 'recs-high');
  renderRecs(RECS_MED,  'recs-med');

})();
