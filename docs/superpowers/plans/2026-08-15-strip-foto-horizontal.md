# Strip Foto Horizontal di Atas Preview — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pindahkan daftar foto ke atas preview sebagai strip horizontal dengan tile thumbnail (filmstrip, scroll X, drag urutkan horizontal).

**Architecture:** 3 file disentuh: `index.html` (pindah `#left-panel` ke `#content-area`, hapus `#right-sidebar`), `css/styles.css` (strip + tile layout, hapus rule `#right-sidebar`), `js/app.js` (`_rebuildListbox` render tile + drag pakai clientX). Tidak ada test runner — verifikasi manual browser. Tanpa git repo (tanpa commit).

**Tech Stack:** HTML + CSS + vanilla JS.

---

### Task 1: Pindahkan #left-panel ke atas preview (index.html)

**Files:**
- Modify: `C:\laragon\www\template-photos-maker\index.html`

- [ ] **Step 1: Baca index.html** dan pastikan struktur saat ini: `#main-layout` > `#sidebar` (preset, settings) + `#content-area` (info-strip, right-panel, action-bar, status-bar) + `#right-sidebar` (left-panel).

- [ ] **Step 2: Pindah & hapus wrapper**

1. Potong seluruh blok `<div id="left-panel">…</div>` dari dalam `#right-sidebar`
2. Hapus `<div id="right-sidebar">` dan `</div>` penutupnya
3. Tempel blok `#left-panel` (toolbar + list-container, isi byte-identical) ke dalam `#content-area` SETELAH `#info-strip` dan SEBELUM `#right-panel`
4. Indentasi disesuaikan; tidak ada perubahan lain

- [ ] **Step 3: Verifikasi** — tag div balance; id unik (photo-list, list-container, toolbar, btn-*, preview-canvas); urutan content-area = info-strip → left-panel → right-panel → action-bar → status-bar; `#right-sidebar` = 0 kemunculan.

---

### Task 2: Layout strip horizontal + tile (css/styles.css)

**Files:**
- Modify: `C:\laragon\www\template-photos-maker\css\styles.css`

- [ ] **Step 1: Hapus rule `#right-sidebar`** (blok dengan flex 0 0 300px + sticky, ~line 296) dan comment pemisahnya jika ada.

- [ ] **Step 2: Ganti rule `#list-container`** (~line 308) dari `flex: 1; ... position: relative; overflow: hidden;` menjadi:

```css
#list-container {
  height: 120px;
  flex-shrink: 0;
  background: var(--bg-elev);
  border-radius: var(--radius);
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border);
  transition: border-color 0.2s;
}
```

- [ ] **Step 3: Ubah `#photo-list`** dari scroll vertikal menjadi horizontal:

```css
#photo-list {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: row;
  gap: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 6px;
  scrollbar-width: thin;
}
#photo-list::-webkit-scrollbar { height: 8px; }
#photo-list::-webkit-scrollbar-track { background: transparent; }
#photo-list::-webkit-scrollbar-thumb { background: #2a3242; border-radius: 4px; }
```

- [ ] **Step 4: Ubah `.photo-list-item`** menjadi tile kolom:

```css
.photo-list-item {
  flex: 0 0 86px;
  padding: 4px;
  font-size: 10px;
  cursor: pointer;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  display: flex;
  flex-direction: column;
  gap: 3px;
  color: var(--text);
  user-select: none;
  transition: background 0.12s, border-color 0.12s;
}
```

Pertahankan rule seleksi/hover yang ada (`.photo-list-item:hover`, `.selected`) — hanya sesuaikan bila diperlukan.

- [ ] **Step 5: Tambah style thumbnail & sesuaikan badge/name/size** — tambah setelah rule `.photo-list-item`:

```css
.photo-list-item .photo-thumb {
  width: 100%;
  height: 62px;
  object-fit: cover;
  border-radius: 4px;
  background: #0a0d13;
  flex-shrink: 0;
}
.photo-list-item .photo-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 10px;
  line-height: 1.2;
  flex: 1;
}
.photo-list-item .photo-size {
  font-size: 9px;
  opacity: 0.65;
  font-variant-numeric: tabular-nums;
}
.photo-list-item .drag-handle {
  position: absolute;
  top: 2px;
  left: 2px;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 4px;
  z-index: 2;
  font-size: 12px;
  padding: 1px 5px;
  margin: 0;
}
.photo-list-item .photo-filter-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  z-index: 2;
  margin: 0;
}
```

Catatan: `.photo-list-item` butuh `position: relative` (tambahkan ke Step 4).

- [ ] **Step 6: Indikator insert horizontal** — ubah rule `.photo-list-item.drag-over` dari `border-top: 2px solid var(--accent)` menjadi:

```css
.photo-list-item.drag-over {
  border-left: 2px solid var(--accent);
  border-radius: 3px;
}
```

- [ ] **Step 7: Perbarui media query ≤768px** — hapus `#right-sidebar { ... }`, `#left-panel { flex: none; width: 100%; }`, `#list-container { min-height: 240px; }` dari blok media query. Tambahkan `#list-container { height: 120px; }` jika belum tercakup (properti sama dengan base, boleh dilewati). `#main-layout { flex-direction: column }` dan `#sidebar { width: 100% }` TETAP.

- [ ] **Step 8: Verifikasi** — grep `right-sidebar` = 0; grep `photo-thumb` ada; `.photo-list-item` punya `position: relative`; tidak ada rule lama yang bentrok.

---

### Task 3: Render tile + drag horizontal (js/app.js)

**Files:**
- Modify: `C:\laragon\www\template-photos-maker\js\app.js`

- [ ] **Step 1: Ubah item.innerHTML di `_rebuildListbox` (~line 1031)**

Dari:

```js
item.innerHTML = `<span class="drag-handle" title="Geser untuk urutkan">&#8283;</span><span class="photo-name">${this._escapeHtml(p.name)}</span><span class="photo-size">${this._fmtSize(p.width, p.height)}</span>${p.filter === 'gray' ? '<span class="photo-filter-badge">GRAY</span>' : p.filter === 'bw' ? '<span class="photo-filter-badge bw">B&amp;W</span>' : ''}`;
```

Menjadi:

```js
const src = p.dataUrl || (p.img && p.img.src) || '';
item.innerHTML = `<span class="drag-handle" title="Geser untuk urutkan">&#8283;</span>${src ? `<img class="photo-thumb" src="${src}" alt="" draggable="false">` : '<div class="photo-thumb" style="display:flex;align-items:center;justify-content:center;color:#6b7280;">?</div>'}<span class="photo-name">${this._escapeHtml(p.name)}</span><span class="photo-size">${this._fmtSize(p.width, p.height)}</span>${p.filter === 'gray' ? '<span class="photo-filter-badge">GRAY</span>' : p.filter === 'bw' ? '<span class="photo-filter-badge bw">B&amp;W</span>' : ''}`;
```

- [ ] **Step 2: Ubah drag reorder ke sumbu X** (dua tempat di `_rebuildListbox`, ~line 1059-1071)

1. `drag = { from: i, y: e.clientY, moved: false };` → `drag = { from: i, x: e.clientX, moved: false };`
2. `if (Math.abs(e.clientY - drag.y) > 5) drag.moved = true;` → `if (Math.abs(e.clientX - drag.x) > 5) drag.moved = true;`
3. `let to = items.findIndex(el => e.clientY < el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2);` → `let to = items.findIndex(el => e.clientX < el.getBoundingClientRect().left + el.getBoundingClientRect().width / 2);`

- [ ] **Step 3: Verifikasi** — baca ulang `_rebuildListbox` (line ~1024-1090): tidak ada sisa `clientY`/`drag.y`; `photo-thumb` dirender; klik/contextmenu/selectRange/`_movePhoto` tidak berubah.

---

### Task 4: Verifikasi Manual di Browser

**Files:**
- Test: `http://localhost/template-photos-maker/`

- [ ] **Step 1**: Buka aplikasi, cek tidak ada error konsol (F12)
- [ ] **Step 2**: Tambah 5+ foto berbagai orientasi → tile thumbnail berderet di atas preview, scroll horizontal lancar
- [ ] **Step 3**: Seleksi: klik (tunggal), Ctrl+klik, Shift+klik, klik kanan → menu konteks jalan
- [ ] **Step 4**: Drag pakai handle (⠿) → urutan berubah sesuai arah horizontal
- [ ] **Step 5**: Filter grayscale/B&W via menu konteks → badge muncul di tile; preview mengikuti
- [ ] **Step 6**: Print & Export PNG masih benar; pagination ←/→ jalan
- [ ] **Step 7**: DevTools ≤768px: strip tetap horizontal scroll, layout bertumpuk rapi