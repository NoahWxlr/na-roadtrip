(function () {
  'use strict';

  let _photos = [];
  let _idx = 0;
  let _el = null;

  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  window.renderGallery = function (entries) {
    const container = document.getElementById('gallery-inner');
    if (!container) return;

    // Flatten all photos with their entry context
    const flat = [];
    entries.forEach(entry => {
      const stop = (typeof STOPS !== 'undefined' ? STOPS : []).find(s => s.num === entry.stop_num);
      const locLabel = stop
        ? `${stop.name}, ${stop.state}`
        : (entry.custom_label || 'Custom location');
      (entry.entry_photos || []).sort((a, b) => a.sort_order - b.sort_order).forEach(photo => {
        flat.push({ ...photo, entry, locLabel });
      });
    });

    if (!flat.length) {
      container.innerHTML = '<p class="empty-state">No photos yet — add your first journal entry with photos!</p>';
      return;
    }

    // Group by stop_num or custom entry
    const groupMap = new Map();
    flat.forEach(p => {
      const key = p.entry.stop_num != null ? `stop-${p.entry.stop_num}` : `custom-${p.entry.id}`;
      if (!groupMap.has(key)) groupMap.set(key, { label: p.locLabel, items: [], stopNum: p.entry.stop_num });
      groupMap.get(key).items.push(p);
    });

    const groups = Array.from(groupMap.values()).sort((a, b) => {
      if (a.stopNum != null && b.stopNum != null) return a.stopNum - b.stopNum;
      if (a.stopNum != null) return -1;
      return 1;
    });

    _photos = [];
    let html = '';
    groups.forEach(group => {
      html += `<div class="gallery-group-title">${esc(group.label)}</div><div class="gallery-grid">`;
      group.items.forEach(p => {
        const idx = _photos.length;
        _photos.push(p);
        html += `<div class="gallery-thumb" data-idx="${idx}" role="button" tabindex="0" aria-label="${esc(p.caption || p.locLabel)}">
          <img src="${esc(sbPublicUrl(p.storage_path))}" alt="${esc(p.caption || '')}" loading="lazy"/>
        </div>`;
      });
      html += '</div>';
    });

    container.innerHTML = html;

    container.querySelectorAll('.gallery-thumb').forEach(el => {
      const open = () => openLightbox(parseInt(el.dataset.idx, 10));
      el.addEventListener('click', open);
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
  };

  window.openGalleryAt = function (photos, startIdx) {
    _photos = photos;
    openLightbox(startIdx);
  };

  function openLightbox(idx) {
    _idx = idx;
    if (!_el) buildLightbox();
    updateLightbox();
    _el.classList.add('open');
    document.body.classList.add('lb-open');
    _el.focus();
  }

  function closeLightbox() {
    _el && _el.classList.remove('open');
    document.body.classList.remove('lb-open');
  }

  function buildLightbox() {
    _el = document.createElement('div');
    _el.id = 'lightbox';
    _el.setAttribute('role', 'dialog');
    _el.setAttribute('aria-modal', 'true');
    _el.setAttribute('tabindex', '-1');
    _el.innerHTML = `
      <div id="lb-backdrop"></div>
      <div id="lb-frame">
        <img id="lb-img" alt=""/>
        <div id="lb-info">
          <div id="lb-caption"></div>
          <div id="lb-meta"></div>
        </div>
      </div>
      <button id="lb-prev" aria-label="Previous photo">‹</button>
      <button id="lb-next" aria-label="Next photo">›</button>
      <button id="lb-close" aria-label="Close lightbox">✕</button>`;
    document.body.appendChild(_el);

    _el.querySelector('#lb-close').addEventListener('click', closeLightbox);
    _el.querySelector('#lb-backdrop').addEventListener('click', closeLightbox);
    _el.querySelector('#lb-prev').addEventListener('click', () => { _idx = (_idx - 1 + _photos.length) % _photos.length; updateLightbox(); });
    _el.querySelector('#lb-next').addEventListener('click', () => { _idx = (_idx + 1) % _photos.length; updateLightbox(); });

    _el.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') { _idx = (_idx - 1 + _photos.length) % _photos.length; updateLightbox(); }
      if (e.key === 'ArrowRight') { _idx = (_idx + 1) % _photos.length; updateLightbox(); }
    });

    let tx = 0;
    _el.addEventListener('touchstart', e => { tx = e.changedTouches[0].screenX; }, { passive: true });
    _el.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].screenX - tx;
      if (Math.abs(dx) > 50) {
        _idx = dx > 0
          ? (_idx - 1 + _photos.length) % _photos.length
          : (_idx + 1) % _photos.length;
        updateLightbox();
      }
    }, { passive: true });
  }

  function updateLightbox() {
    const p = _photos[_idx];
    _el.querySelector('#lb-img').src = sbPublicUrl(p.storage_path);
    _el.querySelector('#lb-img').alt = p.caption || '';
    const cap = _el.querySelector('#lb-caption');
    cap.textContent = p.caption || '';
    cap.style.display = p.caption ? '' : 'none';
    _el.querySelector('#lb-meta').innerHTML =
      `<span>${esc(p.entry.entry_date)} — ${esc(p.entry.title)}</span>` +
      `<a class="lb-entry-link" href="?entry=${encodeURIComponent(p.entry.slug)}">View entry →</a>`;
    _el.querySelector('#lb-prev').style.display = _photos.length > 1 ? '' : 'none';
    _el.querySelector('#lb-next').style.display = _photos.length > 1 ? '' : 'none';
  }
})();
