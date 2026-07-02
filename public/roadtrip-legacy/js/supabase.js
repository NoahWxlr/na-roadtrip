(function () {
  'use strict';
  const SUPABASE_URL = 'https://rvicudtbaiefbrorfiaj.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_lxRX1TTPK9_Py8nFn-PXqQ_TjQyDAIz';

  const _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true }
  });
  window.SB = _sb;

  window.sbGetSession = async function () {
    const { data: { session } } = await _sb.auth.getSession();
    return session;
  };

  window.sbSendMagicLink = function () {
    return _sb.auth.signInWithOtp({ email: 'noahwxlr@gmail.com', options: { emailRedirectTo: window.location.href } });
  };

  window.sbSignInWithPassword = function (password) {
    return _sb.auth.signInWithPassword({ email: 'noahwxlr@gmail.com', password });
  };

  window.sbSetPassword = function (newPassword) {
    return _sb.auth.updateUser({ password: newPassword });
  };

  window.sbSendPasswordReset = function () {
    return _sb.auth.resetPasswordForEmail('noahwxlr@gmail.com', {
      redirectTo: window.location.origin + window.location.pathname
    });
  };

  window.sbSignOut = function () { return _sb.auth.signOut(); };

  window.sbOnAuthChange = function (cb) { return _sb.auth.onAuthStateChange(cb); };

  window.sbListEntries = async function () {
    const { data, error } = await _sb
      .from('entries')
      .select('*, entry_photos(*)')
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  };

  window.sbSaveEntry = async function (entry) {
    const { data, error } = await _sb.from('entries').insert(entry).select().single();
    if (error) throw error;
    return data;
  };

  window.sbUpdateEntry = async function (id, updates) {
    const { data, error } = await _sb.from('entries').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  };

  window.sbDeleteEntry = async function (id) {
    const { error } = await _sb.from('entries').delete().eq('id', id);
    if (error) throw error;
  };

  window.sbInsertPhoto = async function (meta) {
    const { data, error } = await _sb.from('entry_photos').insert(meta).select().single();
    if (error) throw error;
    return data;
  };

  window.sbDeletePhoto = async function (photoId, storagePath) {
    await _sb.storage.from('journal-photos').remove([storagePath]);
    const { error } = await _sb.from('entry_photos').delete().eq('id', photoId);
    if (error) throw error;
  };

  window.sbPublicUrl = function (path) {
    const { data } = _sb.storage.from('journal-photos').getPublicUrl(path);
    return data.publicUrl;
  };

  window.sbUploadPhoto = async function (entryId, file) {
    const resized = await _resizeImage(file, 2000, 0.85);
    const uid = (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));
    const path = `${entryId}/${uid}.jpg`;
    const { error } = await _sb.storage.from('journal-photos').upload(path, resized, {
      contentType: 'image/jpeg',
      upsert: false
    });
    if (error) throw error;
    const dims = await _imageDims(resized);
    let taken_at = null;
    if (window.exifr) {
      try {
        const exif = await window.exifr.parse(file, ['DateTimeOriginal']);
        if (exif && exif.DateTimeOriginal) taken_at = new Date(exif.DateTimeOriginal).toISOString();
      } catch (_) {}
    }
    return { path, width: dims.w, height: dims.h, taken_at };
  };

  function _resizeImage(file, maxPx, quality) {
    return new Promise(resolve => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const scale = Math.min(1, maxPx / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.naturalWidth * scale);
        canvas.height = Math.round(img.naturalHeight * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      img.src = url;
    });
  }

  function _imageDims(blob) {
    return new Promise(resolve => {
      const img = new Image();
      const url = URL.createObjectURL(blob);
      img.onload = () => { URL.revokeObjectURL(url); resolve({ w: img.naturalWidth, h: img.naturalHeight }); };
      img.onerror = () => { URL.revokeObjectURL(url); resolve({ w: 0, h: 0 }); };
      img.src = url;
    });
  }
})();
