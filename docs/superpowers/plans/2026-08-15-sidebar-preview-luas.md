# Sidebar + Preview Luas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restrukturisasi layout Template Photos Maker menjadi sidebar kiri (Preset, Ukuran & Margin, daftar foto) dan area preview selebar mungkin di kanan.

**Architecture:** Perubahan `index.html` (wrap + pindah elemen) dan `css/styles.css` (layout 2 kolom). `js/app.js` tidak disentuh — sudah diverifikasi tidak mereferensikan ID wrapper (`main-content`, `left-panel`, `right-panel`, `info-strip`, `action-bar`, `status-bar`, `preset-card`, `settings-card`). Canvas preview memakai logika fit-to-container, jadi otomatis menyesuaikan.

**Tech Stack:** HTML + CSS vanilla. Tanpa test runner — verifikasi manual browser. Tanpa git repo (langkah commit dilewati).

---

### Task 1: Restrukturisasi index.html

**Files:**
- Modify: `C:\laragon\www\template-photos-maker\index.html`

- [ ] **Step 1: Baca file saat ini**

Baca `index.html` untuk memastikan struktur sekarang (header → preset-card → settings-card → info-strip → main-content{left-panel,right-panel} → action-bar → status-bar → dialog).

- [ ] **Step 2: Wrap bagian layout**

Ubah dari:

```html
  <section id="preset-card" class="card">
```

...dan blok-blok berikutnya, menjadi struktur:

```html
  <div id="main-layout">
    <div id="sidebar">

      <section id="preset-card" class="card">
        ... (isi tidak berubah)
      </section>

      <section id="settings-card" class="card">
        ... (isi tidak berubah)
      </section>

      <div id="left-panel">
        <div id="toolbar" class="row">...</div>
        <div id="list-container">...</div>
      </div>

    </div>
    <div id="content-area">

      <div id="info-strip">...</div>

      <div id="right-panel">
        <div id="preview-header">...</div>
        <div id="preview-border">
          <canvas id="preview-canvas"></canvas>
        </div>
      </div>

      <div id="action-bar">...</div>

      <div id="status-bar">...</div>

    </div>
  </div>
```

Instruksi konkret:
1. Hapus `<div id="main-content">` (yang lama) dan `</div>` penutupnya
2. Bungkus `#preset-card`, `#settings-card`, `#left-panel` dengan `<div id="sidebar">` (di dalam `<div id="main-layout">`)
3. Bungkus `#info-strip`, `#right-panel`, `#action-bar`, `#status-bar` dengan `<div id="content-area">`
4. Pastikan SEMUA atribut id, class, dan isi elemen di dalam blok-blok tersebut TIDAK berubah satu pun

- [ ] **Step 3: Verifikasi struktur**

Baca ulang `index.html` dan pastikan:
- Urutan: `#main-layout` → `#sidebar` (preset, settings, left-panel) + `#content-area` (info-strip, right-panel, action-bar, status-bar)
- Semua elemen yang direferensikan JS masih ada dengan id sama: photo-width, photo-height, min-margin, margin-atas, show-border, border-hairline, border-width, show-cutlines, show-white-border, wb-top, wb-bottom, wb-left, wb-right, fit-mode, preset-combo, info-label, photo-list, list-placeholder, list-container, preview-canvas, zoom-label, status-text, file-input, context-menu, btn-orientation, auto-rotate, tile-enable, tile-rows, tile-cols, dialog-overlay, dialog-content, page-nav, page-label, btn-add, btn-paste, btn-remove, btn-clear, btn-move-up, btn-move-down, btn-fill, btn-page-prev, btn-page-next, btn-page-position, btn-print, btn-export-png
- Tag penutup seimbang (buka/tutup div match)

---

### Task 2: Layout CSS sidebar + preview luas

**Files:**
- Modify: `C:\laragon\www\template-photos-maker\css\styles.css`

- [ ] **Step 1: Lebarkan #app**

Ubah:

```css
#app {
  max-width: 1240px;
  margin: 0 auto;
  padding: 20px 20px 16px;
}
```

menjadi:

```css
#app {
  max-width: 1560px;
  margin: 0 auto;
  padding: 20px 20px 16px;
}
```

- [ ] **Step 2: Ganti #main-content dengan layout baru**

Hapus blok:

```css
/* ---- Main content ---- */
#main-content {
  display: flex;
  gap: 12px;
  min-height: 520px;
  margin-bottom: 10px;
}
```

Ganti dengan:

```css
/* ---- Main layout: sidebar + content ---- */
#main-layout {
  display: flex;
  gap: 12px;
  align-items: stretch;
  min-height: 560px;
}
#sidebar {
  flex: 0 0 300px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
#content-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
```

- [ ] **Step 3: Perbarui #left-panel dan #right-panel**

Ubah:

```css
#left-panel {
  flex: 0 0 190px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
```

menjadi:

```css
#left-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
```

Ubah:

```css
#right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
```

menjadi:

```css
#right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
```

(tidak berubah — hanya verifikasi #preview-border tetap `flex: 1` dan `min-height: 320px`)

- [ ] **Step 4: Pastikan #info-strip margin dan card spacing wajar**

Verifikasi: `#info-strip` memiliki `margin-bottom: 10px` (sudah ada, biarkan). `#preset-card` / `#settings-card` memakai `.card` yang punya `margin-bottom: 10px` — dalam sidebar bertumpuk dengan `#left-panel` (bukan .card), spacing 10px konsisten, TIDAK perlu diubah.

- [ ] **Step 5: Perbarui media query mobile**

Ubah:

```css
@media (max-width: 768px) {
  #main-content { flex-direction: column; }
  #left-panel { flex: none; width: 100%; }
  #right-panel { min-height: 280px; }
  #header h1 { font-size: 20px; }
  .setting-row { flex-wrap: wrap; }
  #app { padding: 14px 12px 12px; }
  .btn { padding: 8px 14px; font-size: 13px; }
  #tile-rows, #tile-cols { font-size: 16px; }
}
```

menjadi:

```css
@media (max-width: 768px) {
  #main-layout { flex-direction: column; }
  #sidebar { width: 100%; }
  #left-panel { flex: none; width: 100%; }
  #right-panel { min-height: 280px; }
  #header h1 { font-size: 20px; }
  .setting-row { flex-wrap: wrap; }
  #app { padding: 14px 12px 12px; }
  .btn { padding: 8px 14px; font-size: 13px; }
  #tile-rows, #tile-cols { font-size: 16px; }
}
```

- [ ] **Step 6: Verifikasi CSS**

Baca ulang seluruh area yang diubah (baris ~45-49, ~279-305, ~409-420, ~644-655). Pastikan tidak ada sisa referensi `#main-content`, semua nilai persis sesuai di atas, dan bagian lain (print CSS, dialog, dsb) tidak tersentuh.

---

### Task 3: Verifikasi Manual di Browser

**Files:**
- Test: `http://localhost/template-photos-maker/` (Laragon)

- [ ] **Step 1: Buka aplikasi** di browser, pastikan tidak ada error konsol (F12)
- [ ] **Step 2: Layout desktop** (≥1200px):
  - Sidebar kiri ~300px: Preset → Ukuran & Margin → toolbar + daftar foto
  - Preview mengisi seluruh sisa area kanan
  - Action bar & status bar di bawah preview
- [ ] **Step 3: Fungsi**: tambah foto (beberapa), pilih item di list, scroll, zoom +/−/1:1, pan, navigasi halaman ←/→, filter (klik kanan), duplikat
- [ ] **Step 4: Print & Export PNG** tetap menghasilkan output benar
- [ ] **Step 5: Mobile** (DevTools ≤768px): semua bertumpuk, preview min-height 280px
- [ ] **Step 6 (opsional): Deploy** `index.html` + `css/styles.css` ke hosting, bandingkan MD5:
  `Get-FileHash C:\laragon\www\template-photos-maker\index.html -Algorithm MD5` vs `curl.exe -s https://red-anteater-980940.hostingersite.com/template-maker/index.html | Get-FileHash -Algorithm MD5`