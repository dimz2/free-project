'use client';
import { useState, useEffect } from 'react';

const emptyVariant = () => ({ name: '', total: 1, selected: 1, thumb: '', drive: '', files: [] });
const emptyFile = () => ({ n: '', s: '' });

function Avatar({ size = 36 }) {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <div className="avatar-fallback" style={{ width: size, height: size, fontSize: size * 0.42 }}>D</div>
    );
  }
  return (
    <img
      src="/profile.jpg"
      alt="dimz"
      className="avatar-img"
      style={{ width: size, height: size }}
      onError={() => setError(true)}
    />
  );
}

function useOverlayAnim(open) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (open) {
      setShow(false);
      const t = setTimeout(() => setShow(true), 20);
      return () => clearTimeout(t);
    }
    setShow(false);
  }, [open]);
  return show;
}

export default function Page() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [view, setView] = useState('grid');
  const [activeCategory, setActiveCategory] = useState('character');
  const [currentId, setCurrentId] = useState(null);
  const [variantIdx, setVariantIdx] = useState(0);
  const detailShow = useOverlayAnim(view === 'detail');

  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [password, setPassword] = useState('');

  const [showGate, setShowGate] = useState(false);
  const [gatePass, setGatePass] = useState('');
  const [gateError, setGateError] = useState('');
  const gateShow = useOverlayAnim(showGate);

  const [showFiles, setShowFiles] = useState(false);
  const filesShow = useOverlayAnim(showFiles);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(null);
  const formShow = useOverlayAnim(showForm);

  const [toast, setToast] = useState('');

  useEffect(() => {
    fetch('/api/data')
      .then((r) => r.json())
      .then((res) => {
        setData(res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  async function persist(newData) {
    setSaving(true);
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, data: newData }),
      });
      setSaving(false);
      if (!res.ok) {
        showToast('Gagal simpan — password mungkin udah gak valid, login ulang.');
        return false;
      }
      return true;
    } catch {
      setSaving(false);
      showToast('Gagal simpan — cek koneksi.');
      return false;
    }
  }

  async function submitGate() {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: gatePass }),
      });
      if (res.ok) {
        setPassword(gatePass);
        setAdminUnlocked(true);
        setShowGate(false);
        setGatePass('');
        setGateError('');
      } else {
        setGateError('Password salah.');
      }
    } catch {
      setGateError('Gagal konek ke server.');
    }
  }

  function lockAdmin() {
    setAdminUnlocked(false);
    setPassword('');
  }

  function openDetail(id) {
    setCurrentId(id);
    setVariantIdx(0);
    setView('detail');
  }
  function closeDetail() {
    setView('grid');
  }

  function openCharacterForm(id) {
    setEditingId(id || null);
    if (id) {
      const ch = data.find((c) => c.id === id);
      setForm({ category: 'character', ...JSON.parse(JSON.stringify(ch)) });
    } else {
      setForm({
        category: activeCategory,
        name: '',
        eyebrow: activeCategory === 'addon' ? 'ADDON' : 'CHARACTER',
        rarity: 'common',
        thumb: '',
        color: '#3a4a6b',
        variants: [emptyVariant()],
      });
    }
    setShowForm(true);
  }

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  function updateVariant(i, key, value) {
    setForm((f) => {
      const variants = [...f.variants];
      variants[i] = { ...variants[i], [key]: value };
      return { ...f, variants };
    });
  }
  function addVariant() {
    setForm((f) => ({ ...f, variants: [...f.variants, emptyVariant()] }));
  }
  function removeVariant(i) {
    setForm((f) => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }));
  }
  function updateFile(vi, fi, key, value) {
    setForm((f) => {
      const variants = [...f.variants];
      const files = [...variants[vi].files];
      files[fi] = { ...files[fi], [key]: value };
      variants[vi] = { ...variants[vi], files };
      return { ...f, variants };
    });
  }
  function addFile(vi) {
    setForm((f) => {
      const variants = [...f.variants];
      variants[vi] = { ...variants[vi], files: [...variants[vi].files, emptyFile()] };
      return { ...f, variants };
    });
  }
  function removeFile(vi, fi) {
    setForm((f) => {
      const variants = [...f.variants];
      variants[vi] = { ...variants[vi], files: variants[vi].files.filter((_, idx) => idx !== fi) };
      return { ...f, variants };
    });
  }

  async function saveForm() {
    if (!form.name.trim()) {
      alert('Nama character wajib diisi.');
      return;
    }
    let newData;
    if (editingId) {
      newData = data.map((c) => (c.id === editingId ? { ...form, id: editingId } : c));
    } else {
      const newId = data.reduce((m, c) => Math.max(m, c.id), 0) + 1;
      newData = [...data, { ...form, id: newId }];
    }
    const ok = await persist(newData);
    if (ok) {
      setData(newData);
      setShowForm(false);
      showToast('Tersimpan & langsung live buat semua orang.');
    }
  }

  async function deleteCharacter(id) {
    if (!confirm('Hapus character ini? Langsung ke-apply buat semua orang.')) return;
    const newData = data.filter((c) => c.id !== id);
    const ok = await persist(newData);
    if (ok) {
      setData(newData);
      if (currentId === id) setView('grid');
      showToast('Terhapus.');
    }
  }

  const current = data.find((c) => c.id === currentId);
  const variant = current?.variants?.[variantIdx];
  const filteredData = data.filter((c) => (c.category || 'character') === activeCategory);

  if (loading) {
    return (
      <div className="loading-screen">
        <Avatar size={72} />
        <div className="loading-name">dimz</div>
        <div className="loading-sub">Variant Gallery</div>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <>
      <div className="topbar">
        <Avatar size={34} />
        <div className="brand">
          <h1>Variant Gallery</h1>
          <div className="brand-by">by dimz</div>
        </div>
        <div className="sub">
          {filteredData.length} items{saving ? ' · saving…' : ''}
        </div>
        <button className="icon-btn" onClick={() => (adminUnlocked ? lockAdmin() : setShowGate(true))} title="Admin">
          {adminUnlocked ? '🔓' : '⚙'}
        </button>
      </div>

      {adminUnlocked && (
        <div className="admin-bar">
          <button className="btn btn-primary" onClick={() => openCharacterForm()}>
            + Tambah {activeCategory === 'addon' ? 'Plugin/Addon' : 'Character'}
          </button>
          <button className="btn btn-secondary" onClick={lockAdmin}>🔒 Keluar</button>
        </div>
      )}

      {view === 'grid' && (
        <div>
          <div className="tabs">
            <button
              className={`tab ${activeCategory === 'character' ? 'active' : ''}`}
              onClick={() => setActiveCategory('character')}
            >◆ CHARACTERS</button>
            <button
              className={`tab ${activeCategory === 'addon' ? 'active' : ''}`}
              onClick={() => setActiveCategory('addon')}
            >◆ PLUGIN/ADDONS</button>
          </div>
          <div className="grid">
            {filteredData.map((ch) => (
              <div
                key={ch.id}
                className={`card ${ch.rarity}`}
                style={{ background: `linear-gradient(160deg, ${ch.color}, #14161d)` }}
                onClick={() => openDetail(ch.id)}
              >
                <div className="card-art"><img src={ch.thumb} alt={ch.name} loading="lazy" /></div>
                <div className="card-name">{ch.name}</div>
                {adminUnlocked && (
                  <div className="admin-actions">
                    <button onClick={(e) => { e.stopPropagation(); openCharacterForm(ch.id); }} title="Edit">✎</button>
                    <button onClick={(e) => { e.stopPropagation(); deleteCharacter(ch.id); }} title="Hapus">🗑</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'detail' && current && (
        <div className={`detail ${detailShow ? 'show' : ''}`}>
          <div className="detail-header">
            <div>
              <div className="detail-eyebrow">{current.eyebrow}</div>
              <div className="detail-title">{current.name}</div>
            </div>
            <button className="close-btn" onClick={closeDetail}>✕</button>
          </div>
          <div className="hr"></div>
          <div className="action-row">
            <button
              className="btn btn-primary"
              onClick={() => {
                if (!variant?.drive) { alert('Link Google Drive belum diisi untuk variant ini.'); return; }
                window.open(variant.drive, '_blank');
              }}
            >⬇ Download</button>
            <button className="btn btn-secondary" onClick={() => setShowFiles(true)}>▤ Files</button>
            {adminUnlocked && (
              <>
                <button className="btn btn-secondary" onClick={() => openCharacterForm(current.id)}>✎ Edit</button>
                <button className="btn btn-secondary" onClick={() => deleteCharacter(current.id)}>🗑 Hapus</button>
              </>
            )}
          </div>
          <div className="preview" style={{ background: `linear-gradient(160deg, ${current.color}, #14161d)` }}>
            <div className="card-art">
              <img src={variant?.thumb || current.thumb} alt={variant?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className="check">✓</div>
          </div>
          {current.variants.length > 1 && (
            <div className="variant-switch">
              {current.variants.map((v, i) => (
                <div key={i} className={`chip ${i === variantIdx ? 'active' : ''}`} onClick={() => setVariantIdx(i)}>{v.name}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {showFiles && variant && (
        <div className={`overlay active ${filesShow ? 'show' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setShowFiles(false); }}>
          <div className="sheet">
            <h3>Files in this variant</h3>
            <div>
              {variant.files.map((f, i) => (
                <div key={i} className="file-item"><span className="fname">{f.n}</span><span className="fsize">{f.s}</span></div>
              ))}
            </div>
            <button className="btn btn-secondary" style={{ width: '100%', marginTop: 14, justifyContent: 'center' }} onClick={() => setShowFiles(false)}>Close</button>
          </div>
        </div>
      )}

      {showGate && (
        <div className={`overlay active ${gateShow ? 'show' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setShowGate(false); }}>
          <div className="sheet">
            <h3>Masuk Admin</h3>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                autoFocus
                value={gatePass}
                onChange={(e) => setGatePass(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submitGate(); }}
              />
            </div>
            {gateError && <div id="gateError">{gateError}</div>}
            <div className="action-row" style={{ marginTop: 16, marginBottom: 0 }}>
              <button className="btn btn-primary" onClick={submitGate}>Masuk</button>
              <button className="btn btn-secondary" onClick={() => setShowGate(false)}>Batal</button>
            </div>
          </div>
        </div>
      )}

      {showForm && form && (
        <div className={`overlay active ${formShow ? 'show' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="sheet" style={{ maxHeight: '88vh', overflowY: 'auto' }}>
            <h3>{editingId ? 'Edit' : 'Tambah'} {form.category === 'addon' ? 'Plugin/Addon' : 'Character'}</h3>
            <div className="field">
              <label>Kategori</label>
              <select value={form.category} onChange={(e) => updateField('category', e.target.value)}>
                <option value="character">Character</option>
                <option value="addon">Plugin/Addons</option>
              </select>
            </div>
            <div className="field"><label>Nama</label><input value={form.name} onChange={(e) => updateField('name', e.target.value)} /></div>
            <div className="field"><label>Eyebrow / Kategori</label><input value={form.eyebrow} onChange={(e) => updateField('eyebrow', e.target.value)} /></div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div className="field" style={{ flex: 1 }}>
                <label>Rarity</label>
                <select value={form.rarity} onChange={(e) => updateField('rarity', e.target.value)}>
                  <option value="common">common</option>
                  <option value="rare">rare</option>
                  <option value="epic">epic</option>
                </select>
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label>Warna gradient</label>
                <input type="color" value={form.color} onChange={(e) => updateField('color', e.target.value)} />
              </div>
            </div>
            <div className="field"><label>Thumbnail URL (grid)</label><input value={form.thumb} onChange={(e) => updateField('thumb', e.target.value)} placeholder="https://..." /></div>

            <div className="hr"></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h3 style={{ margin: 0 }}>Variants</h3>
              <button type="button" className="chip" onClick={addVariant}>+ Variant</button>
            </div>

            {form.variants.map((v, vi) => (
              <div className="variant-block" key={vi}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <strong style={{ fontSize: 13 }}>Variant</strong>
                  <button type="button" className="chip" onClick={() => removeVariant(vi)}>✕ Hapus variant</button>
                </div>
                <div className="field"><label>Nama variant</label><input value={v.name} onChange={(e) => updateVariant(vi, 'name', e.target.value)} /></div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div className="field" style={{ flex: 1 }}><label>Total</label><input type="number" min="1" value={v.total} onChange={(e) => updateVariant(vi, 'total', parseInt(e.target.value) || 1)} /></div>
                  <div className="field" style={{ flex: 1 }}><label>Selected</label><input type="number" min="1" value={v.selected} onChange={(e) => updateVariant(vi, 'selected', parseInt(e.target.value) || 1)} /></div>
                </div>
                <div className="field"><label>Preview thumbnail URL</label><input value={v.thumb} onChange={(e) => updateVariant(vi, 'thumb', e.target.value)} /></div>
                <div className="field"><label>Link Google Drive</label><input value={v.drive} onChange={(e) => updateVariant(vi, 'drive', e.target.value)} /></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Files</span>
                  <button type="button" className="chip" onClick={() => addFile(vi)}>+ File</button>
                </div>
                {v.files.map((f, fi) => (
                  <div key={fi} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input placeholder="nama file" value={f.n} onChange={(e) => updateFile(vi, fi, 'n', e.target.value)} style={{ flex: 2, padding: '9px 10px', borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 13 }} />
                    <input placeholder="ukuran" value={f.s} onChange={(e) => updateFile(vi, fi, 's', e.target.value)} style={{ flex: 1, padding: '9px 10px', borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 13 }} />
                    <button type="button" className="chip" onClick={() => removeFile(vi, fi)}>✕</button>
                  </div>
                ))}
              </div>
            ))}

            <div className="action-row" style={{ marginTop: 18, marginBottom: 0 }}>
              <button className="btn btn-primary" onClick={saveForm} disabled={saving}>{saving ? 'Menyimpan…' : '💾 Simpan'}</button>
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
