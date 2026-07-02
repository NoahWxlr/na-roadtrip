(function () {
  'use strict';

  let _entries = [];
  let _session = null;
  let _editingId = null;
  let _pendingPhotos = [];

  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function slug(date, title) {
    return `${date}-${title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 40).replace(/-$/, '')}`;
  }

  // ── AUTH ───────────────────────────────────────────────────────────────────

  function showSetPwBar() {
    const setpwBar = document.getElementById('jnl-setpw-bar');
    if (!setpwBar) return;
    setpwBar.style.display = '';
    document.querySelector('[data-panel="journal-panel"]')?.click();
    setTimeout(() => setpwBar.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 150);
  }

  function setSession(session) {
    _session = session;
    const authBar = document.getElementById('jnl-auth-bar');
    const setpwBar = document.getElementById('jnl-setpw-bar');
    const magicBtn = document.getElementById('jnl-magic-btn');
    const signoutBtn = document.getElementById('jnl-signout-btn');
    const pwSet = localStorage.getItem('jnl-pw-set') === '1';
    if (session) {
      if (authBar) authBar.style.display = 'none';
      if (setpwBar) setpwBar.style.display = pwSet ? 'none' : '';
      if (signoutBtn) signoutBtn.style.display = '';
    } else {
      if (setpwBar) setpwBar.style.display = 'none';
      if (signoutBtn) signoutBtn.style.display = 'none';
    }
    if (magicBtn) magicBtn.style.display = pwSet ? 'none' : '';
  }

  function showAuthUI() {
    // Switch to journal panel if needed, then reveal the sign-in form
    if (!document.getElementById('journal-panel').classList.contains('active')) {
      document.querySelector('[data-panel="journal-panel"]')?.click();
    }
    const authBar = document.getElementById('jnl-auth-bar');
    if (authBar) {
      authBar.style.display = '';
      setTimeout(() => authBar.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
    }
  }

  function handleNewEntryClick() {
    if (_session) {
      openForm();
    } else {
      showAuthUI();
    }
  }

  // ── INIT ───────────────────────────────────────────────────────────────────

  async function init() {
    // Check URL hash immediately — Supabase puts type=recovery here when arriving
    // from a password reset email. Must run before any async calls so we don't miss it.
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const isRecovery = hashParams.get('type') === 'recovery';
    if (isRecovery) {
      localStorage.removeItem('jnl-pw-set');
      history.replaceState(null, '', location.pathname + location.search);
    }
    // ?resetpw=1 lets us manually clear a stale flag during dev/troubleshooting
    if (new URLSearchParams(location.search).get('resetpw') === '1') {
      localStorage.removeItem('jnl-pw-set');
    }

    _session = await sbGetSession();
    sbOnAuthChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (isRecovery && event === 'SIGNED_IN')) {
        _session = session;
        document.getElementById('jnl-auth-bar')?.style && (document.getElementById('jnl-auth-bar').style.display = 'none');
        showSetPwBar();
        return;
      }
      setSession(session);
      if (session) {
        loadEntries();
        const authBar = document.getElementById('jnl-auth-bar');
        if (authBar && authBar.style.display !== 'none') {
          authBar.style.display = 'none';
          openForm();
        }
      }
    });

    // If we landed via recovery link and Supabase already has a session, show the bar now
    if (isRecovery && _session) showSetPwBar();

    setSession(_session);

    // Keyboard shortcut: Shift+L shows auth UI
    document.addEventListener('keydown', e => { if (e.shiftKey && e.key === 'L') showAuthUI(); });

    // Gallery "Add Photos" button routes to the journal new-entry flow
    document.getElementById('gallery-add-btn')?.addEventListener('click', () => {
      document.querySelector('[data-panel="journal-panel"]')?.click();
      handleNewEntryClick();
    });

    // Password sign-in
    const pwInput = document.getElementById('jnl-password');
    document.getElementById('jnl-signin-btn')?.addEventListener('click', async () => {
      const btn = document.getElementById('jnl-signin-btn');
      const errEl = document.getElementById('jnl-auth-error');
      const password = pwInput?.value;
      if (!password) return;
      btn.textContent = 'Signing in…';
      btn.disabled = true;
      errEl.style.display = 'none';
      const { error } = await sbSignInWithPassword(password);
      if (error) {
        btn.textContent = 'Sign in';
        btn.disabled = false;
        errEl.style.display = '';
        pwInput.value = '';
        pwInput.focus();
      }
    });
    pwInput?.addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('jnl-signin-btn')?.click();
    });

    // Forgot password — sends a reset link to the owner's inbox
    document.getElementById('jnl-reset-btn')?.addEventListener('click', async () => {
      const btn = document.getElementById('jnl-reset-btn');
      btn.textContent = 'Sending…';
      btn.disabled = true;
      const { error } = await sbSendPasswordReset();
      if (error) {
        btn.textContent = 'Forgot password? Send reset link →';
        btn.disabled = false;
      } else {
        btn.textContent = '✓ Reset link sent — check your inbox.';
      }
    });

    // Magic link fallback — used once to establish a session so a password can be set
    document.getElementById('jnl-magic-btn')?.addEventListener('click', async () => {
      const btn = document.getElementById('jnl-magic-btn');
      btn.textContent = 'Sending…';
      btn.disabled = true;
      const { error } = await sbSendMagicLink();
      if (error) {
        btn.textContent = 'Or send a magic link instead →';
        btn.disabled = false;
      } else {
        btn.textContent = '✓ Magic link sent — check your inbox.';
      }
    });

    // Set-password flow (shown when logged in via magic link with no password yet)
    document.getElementById('jnl-setpw-btn')?.addEventListener('click', async () => {
      const btn = document.getElementById('jnl-setpw-btn');
      const input = document.getElementById('jnl-new-password');
      const msg = document.getElementById('jnl-setpw-msg');
      const pw = input?.value;
      if (!pw || pw.length < 8) { msg.textContent = 'Password must be at least 8 characters.'; msg.style.cssText = 'display:;color:var(--rust);font-size:13px;margin-top:7px'; return; }
      btn.textContent = 'Saving…'; btn.disabled = true;
      const { error } = await sbSetPassword(pw);
      if (error) {
        msg.textContent = 'Error: ' + error.message;
        msg.style.cssText = 'display:;color:var(--rust);font-size:13px;margin-top:7px';
        btn.textContent = 'Set password'; btn.disabled = false;
      } else {
        localStorage.setItem('jnl-pw-set', '1');
        const bar = document.getElementById('jnl-setpw-bar');
        if (bar) bar.innerHTML = '<div class="jnl-auth-card"><div class="jnl-auth-sent">✓ Password set. Sign in with it directly from now on.</div></div>';
        // Hide the magic link button now that a permanent password exists
        const magicBtn = document.getElementById('jnl-magic-btn');
        if (magicBtn) magicBtn.style.display = 'none';
      }
    });

    document.getElementById('jnl-signout-btn')?.addEventListener('click', async () => {
      await sbSignOut();
    });

    // New entry button — always visible; shows auth flow if not signed in
    document.getElementById('jnl-new-btn')?.addEventListener('click', handleNewEntryClick);

    // Form controls
    document.getElementById('jnl-form-close')?.addEventListener('click', closeForm);
    document.getElementById('jnl-form-cancel')?.addEventListener('click', closeForm);
    document.getElementById('jnl-form-save')?.addEventListener('click', saveEntry);
    document.getElementById('jnl-loc-mode-stop')?.addEventListener('click', () => switchLocMode('stop'));
    document.getElementById('jnl-loc-mode-pin')?.addEventListener('click', () => switchLocMode('pin'));
    document.getElementById('jnl-drop-pin-btn')?.addEventListener('click', startPinDrop);
    document.getElementById('jnl-photo-input')?.addEventListener('change', onPhotosSelected);
    document.getElementById('jnl-write-tab')?.addEventListener('click', () => switchBodyTab('write'));
    document.getElementById('jnl-preview-tab')?.addEventListener('click', () => switchBodyTab('preview'));
    document.getElementById('jnl-body')?.addEventListener('input', updatePreview);

    // Dismiss modal on backdrop click
    document.getElementById('jnl-form-modal')?.addEventListener('click', e => {
      if (e.target.id === 'jnl-form-modal') closeForm();
    });

    // Populate stop dropdown
    const sel = document.getElementById('jnl-stop-select');
    if (sel) {
      sel.innerHTML = '<option value="">— Select a stop —</option>' +
        STOPS.map(s => `<option value="${s.num}">${s.num}. ${esc(s.name)}, ${esc(s.state)}</option>`).join('');
    }

    // Listen for sidebar open (dispatched from app.js)
    document.addEventListener('na-sidebar-open', onSidebarOpen);

    await loadEntries();

    // Handle ?entry=slug deep-link
    const params = new URLSearchParams(location.search);
    if (params.get('entry')) {
      setTimeout(() => scrollToEntry(params.get('entry')), 300);
    }
  }

  // ── DATA ───────────────────────────────────────────────────────────────────

  async function loadEntries() {
    try {
      _entries = await sbListEntries();
    } catch (_) {
      _entries = [];
    }
    renderPanel();
    window.renderGallery?.(_entries);
    document.dispatchEvent(new CustomEvent('journal-entries-updated', { detail: { entries: _entries } }));
  }

  // ── PANEL ──────────────────────────────────────────────────────────────────

  function renderPanel() {
    const list = document.getElementById('journal-list');
    if (!list) return;

    if (!_entries.length) {
      list.innerHTML = '<div class="jnl-empty">Trip hasn\'t started yet — first entry coming soon 🗺</div>';
      return;
    }

    // Build flat photo list for lightbox cross-entry navigation
    const allPhotos = [];
    _entries.forEach(e => (e.entry_photos || []).forEach(p => allPhotos.push({ ...p, entry: e })));

    list.innerHTML = _entries.map(entry => {
      const stop = STOPS.find(s => s.num === entry.stop_num);
      const locLabel = stop
        ? `📍 ${stop.name}, ${stop.state}`
        : `📍 ${entry.custom_label || 'Custom location'}`;
      const photos = (entry.entry_photos || []).sort((a, b) => a.sort_order - b.sort_order);
      const isOwner = _session && entry.author_id === _session.user.id;

      const safeBody = window.DOMPurify && window.marked
        ? DOMPurify.sanitize(marked.parse(entry.body || ''))
        : `<p>${esc(entry.body || '')}</p>`;

      const photoStrip = photos.length
        ? `<div class="jnl-photo-strip">${photos.slice(0, 5).map((p, i) => {
            const globalIdx = allPhotos.findIndex(ap => ap.id === p.id);
            return `<img class="jnl-strip-thumb" src="${esc(sbPublicUrl(p.storage_path))}" loading="lazy"
              alt="${esc(p.caption || '')}" data-photo-idx="${globalIdx}" role="button" tabindex="0"/>`;
          }).join('')}${photos.length > 5 ? `<div class="jnl-photo-more">+${photos.length - 5}</div>` : ''}</div>`
        : '';

      return `<article class="jnl-card" id="jnl-${esc(entry.id)}" data-slug="${esc(entry.slug)}">
        <div class="jnl-card-meta">
          <span class="jnl-card-date">${esc(entry.entry_date)}</span>
          <span class="jnl-card-loc">${esc(locLabel)}</span>
        </div>
        <h3 class="jnl-card-title">${esc(entry.title)}</h3>
        <div class="jnl-card-body prose">${safeBody}</div>
        ${photoStrip}
        <div class="jnl-card-actions">
          <button class="jnl-permalink" data-share-slug="${esc(entry.slug)}" data-share-title="${esc(entry.title)}" type="button">🔗 Share</button>
          ${isOwner ? `<button class="jnl-edit-btn" data-id="${esc(entry.id)}">Edit</button>
          <button class="jnl-del-btn" data-id="${esc(entry.id)}">Delete</button>` : ''}
        </div>
      </article>`;
    }).join('');

    list.querySelectorAll('.jnl-edit-btn').forEach(btn =>
      btn.addEventListener('click', () => openForm(btn.dataset.id)));
    list.querySelectorAll('.jnl-del-btn').forEach(btn =>
      btn.addEventListener('click', () => confirmDelete(btn.dataset.id)));

    list.querySelectorAll('.jnl-strip-thumb').forEach(img => {
      const open = () => {
        const idx = parseInt(img.dataset.photoIdx, 10);
        window.openGalleryAt?.(allPhotos, idx);
      };
      img.addEventListener('click', open);
      img.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });

    list.querySelectorAll('[data-share-slug]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const slug_ = btn.dataset.shareSlug;
        const title = btn.dataset.shareTitle;
        const url = `${location.origin}${location.pathname}?entry=${encodeURIComponent(slug_)}`;
        // Use native share sheet on mobile if available
        if (navigator.share) {
          try { await navigator.share({ title, url }); return; } catch (_) {}
        }
        // Fallback: copy to clipboard
        try {
          await navigator.clipboard.writeText(url);
          const orig = btn.textContent;
          btn.textContent = '✓ Copied!';
          setTimeout(() => { btn.textContent = orig; }, 2000);
        } catch (_) {
          prompt('Copy this link:', url);
        }
      });
    });
  }

  function scrollToEntry(slug_) {
    const el = document.querySelector(`[data-slug="${CSS.escape(slug_)}"]`);
    if (!el) return;
    document.querySelector('[data-panel="journal-panel"]')?.click();
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    el.classList.add('jnl-highlighted');
    setTimeout(() => el.classList.remove('jnl-highlighted'), 2500);
  }

  // ── SIDEBAR HOOK ───────────────────────────────────────────────────────────

  function onSidebarOpen(e) {
    const stopNum = e.detail.stopNum;
    const hits = _entries.filter(en => en.stop_num === stopNum);
    if (!hits.length) return;
    const content = document.getElementById('sidebar-content');
    if (!content) return;
    let html = '<div class="sb-section" style="margin-top:16px">Journal</div>';
    hits.forEach(en => {
      const photos = (en.entry_photos || []).slice(0, 3);
      html += `<div class="sb-journal-entry">
        <div class="sb-journal-date">${esc(en.entry_date)}</div>
        <div class="sb-journal-title"><a href="?entry=${encodeURIComponent(en.slug)}">${esc(en.title)}</a></div>
        ${photos.length ? `<div class="sb-journal-photos">${photos.map(p =>
          `<img class="sb-journal-thumb" src="${esc(sbPublicUrl(p.storage_path))}" loading="lazy" alt=""/>`
        ).join('')}${(en.entry_photos||[]).length > 3 ? `<span class="sb-journal-more">+${en.entry_photos.length - 3}</span>` : ''}</div>` : ''}
      </div>`;
    });
    content.insertAdjacentHTML('beforeend', html);
  }

  // ── FORM ───────────────────────────────────────────────────────────────────

  function openForm(editId) {
    _editingId = editId || null;
    _pendingPhotos = [];
    document.getElementById('jnl-photo-preview-list').innerHTML = '';
    const modal = document.getElementById('jnl-form-modal');
    if (!modal) return;
    modal.classList.add('open');
    document.body.classList.add('modal-open');

    const titleEl = document.getElementById('jnl-form-heading');
    if (editId) {
      const entry = _entries.find(e => e.id === editId);
      if (!entry) return;
      if (titleEl) titleEl.textContent = 'Edit Entry';
      document.getElementById('jnl-date').value = entry.entry_date;
      document.getElementById('jnl-title').value = entry.title;
      document.getElementById('jnl-body').value = entry.body || '';
      if (entry.stop_num != null) {
        switchLocMode('stop');
        document.getElementById('jnl-stop-select').value = entry.stop_num;
      } else {
        switchLocMode('pin');
        document.getElementById('jnl-pin-label').value = entry.custom_label || '';
        document.getElementById('jnl-pin-lat').value = entry.custom_lat || '';
        document.getElementById('jnl-pin-lng').value = entry.custom_lng || '';
      }
    } else {
      if (titleEl) titleEl.textContent = 'New Entry';
      document.getElementById('jnl-date').value = new Date().toISOString().slice(0, 10);
      document.getElementById('jnl-title').value = '';
      document.getElementById('jnl-body').value = '';
      document.getElementById('jnl-stop-select').value = '';
      document.getElementById('jnl-pin-label').value = '';
      document.getElementById('jnl-pin-lat').value = '';
      document.getElementById('jnl-pin-lng').value = '';
      switchLocMode('stop');
    }
    switchBodyTab('write');
  }

  function closeForm() {
    document.getElementById('jnl-form-modal')?.classList.remove('open');
    document.body.classList.remove('modal-open');
    _editingId = null;
    _pendingPhotos.forEach(p => URL.revokeObjectURL(p.preview));
    _pendingPhotos = [];
    document.getElementById('jnl-photo-preview-list').innerHTML = '';
  }

  function switchLocMode(mode) {
    const isPinMode = mode === 'pin';
    document.getElementById('jnl-stop-row').style.display = isPinMode ? 'none' : '';
    document.getElementById('jnl-pin-row').style.display = isPinMode ? '' : 'none';
    document.getElementById('jnl-loc-mode-stop').classList.toggle('active', !isPinMode);
    document.getElementById('jnl-loc-mode-pin').classList.toggle('active', isPinMode);
  }

  function startPinDrop() {
    closeForm();
    document.querySelector('[data-panel="map-panel"]')?.click();

    const canvas = document.getElementById('map-canvas');
    canvas.style.cursor = 'crosshair';
    const toast = document.createElement('div');
    toast.id = 'pin-drop-toast';
    toast.textContent = 'Click map to place journal pin · Esc to cancel';
    document.getElementById('map-panel').appendChild(toast);

    function cancel() {
      canvas.style.cursor = '';
      toast.remove();
      window.onMapPinDrop = null;
      document.removeEventListener('keydown', onEsc);
    }
    function onEsc(e) {
      if (e.key === 'Escape') { cancel(); openForm(_editingId); }
    }
    document.addEventListener('keydown', onEsc);

    // app.js checks window.onMapPinDrop on each map click
    window.onMapPinDrop = function (lat, lng) {
      cancel();
      const label = prompt('Name this location (e.g. "Wild swimming spot"):') ||
        `Pin at ${lat.toFixed(3)}, ${lng.toFixed(3)}`;
      openForm(_editingId);
      switchLocMode('pin');
      document.getElementById('jnl-pin-lat').value = lat.toFixed(5);
      document.getElementById('jnl-pin-lng').value = lng.toFixed(5);
      document.getElementById('jnl-pin-label').value = label;
    };
  }

  function onPhotosSelected(e) {
    Array.from(e.target.files).forEach(file => {
      _pendingPhotos.push({ file, preview: URL.createObjectURL(file), caption: '' });
    });
    e.target.value = '';
    renderPhotoPreviews();
  }

  function renderPhotoPreviews() {
    const container = document.getElementById('jnl-photo-preview-list');
    container.innerHTML = '';
    _pendingPhotos.forEach((p, i) => {
      const div = document.createElement('div');
      div.className = 'jnl-preview-item';
      div.innerHTML = `<img src="${esc(p.preview)}" alt=""/>
        <input class="jnl-input jnl-caption-input" type="text" placeholder="Caption…" value="${esc(p.caption)}" aria-label="Photo caption"/>
        <button class="jnl-remove-photo" aria-label="Remove" data-i="${i}">✕</button>`;
      div.querySelector('.jnl-caption-input').addEventListener('input', ev => { _pendingPhotos[i].caption = ev.target.value; });
      div.querySelector('.jnl-remove-photo').addEventListener('click', () => {
        URL.revokeObjectURL(p.preview);
        _pendingPhotos.splice(i, 1);
        renderPhotoPreviews();
      });
      container.appendChild(div);
    });
  }

  function switchBodyTab(tab) {
    const isPreview = tab === 'preview';
    document.getElementById('jnl-body').style.display = isPreview ? 'none' : '';
    document.getElementById('jnl-body-preview').style.display = isPreview ? '' : 'none';
    document.getElementById('jnl-write-tab').classList.toggle('active', !isPreview);
    document.getElementById('jnl-preview-tab').classList.toggle('active', isPreview);
    if (isPreview) updatePreview();
  }

  function updatePreview() {
    const body = document.getElementById('jnl-body')?.value || '';
    const el = document.getElementById('jnl-body-preview');
    if (!el) return;
    el.innerHTML = window.DOMPurify && window.marked
      ? DOMPurify.sanitize(marked.parse(body))
      : esc(body);
  }

  async function saveEntry() {
    if (!_session) return;
    const btn = document.getElementById('jnl-form-save');
    const date = document.getElementById('jnl-date').value;
    const title = document.getElementById('jnl-title').value.trim();
    const body = document.getElementById('jnl-body').value.trim();
    const isPinMode = document.getElementById('jnl-pin-row').style.display !== 'none';

    if (!title) { alert('Title is required.'); return; }
    if (!date) { alert('Date is required.'); return; }

    let stop_num = null, custom_lat = null, custom_lng = null, custom_label = null;
    if (!isPinMode) {
      const val = document.getElementById('jnl-stop-select').value;
      if (!val) { alert('Select a planned stop or drop a pin.'); return; }
      stop_num = parseInt(val, 10);
    } else {
      custom_lat = parseFloat(document.getElementById('jnl-pin-lat').value);
      custom_lng = parseFloat(document.getElementById('jnl-pin-lng').value);
      custom_label = document.getElementById('jnl-pin-label').value.trim() || 'Custom location';
      if (isNaN(custom_lat) || isNaN(custom_lng)) { alert('Drop a pin on the map first.'); return; }
    }

    const entrySlug = slug(date, title);
    btn.disabled = true;
    btn.textContent = 'Saving…';

    try {
      let entry;
      if (_editingId) {
        entry = await sbUpdateEntry(_editingId, { title, body, entry_date: date, stop_num, custom_lat, custom_lng, custom_label, slug: entrySlug });
      } else {
        entry = await sbSaveEntry({ title, body, entry_date: date, stop_num, custom_lat, custom_lng, custom_label, slug: entrySlug, author_id: _session.user.id });
      }

      // Upload pending photos
      const baseOrder = (_entries.find(e => e.id === entry.id)?.entry_photos || []).length;
      for (let i = 0; i < _pendingPhotos.length; i++) {
        btn.textContent = `Uploading ${i + 1}/${_pendingPhotos.length}…`;
        const p = _pendingPhotos[i];
        try {
          const { path, width, height, taken_at } = await sbUploadPhoto(entry.id, p.file);
          await sbInsertPhoto({ entry_id: entry.id, storage_path: path, caption: p.caption || null, width, height, taken_at, sort_order: baseOrder + i });
        } catch (photoErr) {
          console.warn('Photo upload error:', photoErr);
        }
      }

      closeForm();
      await loadEntries();
    } catch (err) {
      alert('Save failed: ' + (err.message || err));
    } finally {
      btn.disabled = false;
      btn.textContent = 'Save';
    }
  }

  async function confirmDelete(id) {
    if (!confirm('Delete this entry and all its photos?')) return;
    try {
      const entry = _entries.find(e => e.id === id);
      for (const photo of (entry?.entry_photos || [])) {
        await sbDeletePhoto(photo.id, photo.storage_path);
      }
      await sbDeleteEntry(id);
      await loadEntries();
    } catch (err) {
      alert('Delete failed: ' + (err.message || err));
    }
  }

  // ── START ──────────────────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
