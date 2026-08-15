# Preview Full Row Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membuat area preview GTA Template Photos Maker melebar selebar layar (full row) di bawah kartu Preset & Ukuran.

**Architecture:** Perubahan murni CSS pada `css/styles.css` — daftar foto menjadi sidebar sempit, preview mengambil sisa lebar. `index.html` dan `js/app.js` tidak diubah. Logika canvas (fit-to-area, zoom/pan) berbasis ukuran container, jadi otomatis menyesuaikan.

**Tech Stack:** HTML + CSS vanilla (tanpa framework). Tidak ada test runner — verifikasi manual via browser.

**Catatan:** Proyek belum memiliki git repo; langkah commit dilewati sampai repo diinisialisasi.

---

### Task 1: Perubahan Layout di CSS

**Files:**
- Modify: `C:\laragon\www\template-photos-maker\css\styles.css` (baris ~280-291, ~410-415)

- [ ] **Step 1: Perbarui `#main-content`**

Buka `css/styles.css` dan ubah blok berikut:

```css
#main-content {
  display: flex;
  gap: 12px;
  min-height: 420px;
  margin-bottom: 10px;
}
```

menjadi:

```css
#main-content {
  display: flex;
  gap: 12px;
  min-height: 520px;
  margin-bottom: 10px;
}
```

- [ ] **Step 2: Sempitkan panel kiri (daftar foto)**

Ubah:

```css
#left-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
```

menjadi:

```css
#left-panel {
  flex: 0 0 190px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
```

- [ ] **Step 3: Lebarkan panel kanan (preview)**

Ubah:

```css
#right-panel {
  flex: 1.5;
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

- [ ] **Step 4: Periksa hasil edit**

Baca `css/styles.css` baris 280-470 dan pastikan:
- `#main-content` memiliki `min-height: 520px`
- `#left-panel` memiliki `flex: 0 0 190px`
- `#right-panel` memiliki `flex: 1`
- Tidak ada blok CSS lain yang tertimpa

---

### Task 2: Verifikasi Manual di Browser

**Files:**
- Test: `C:\laragon\www\template-photos-maker\index.html` (dibuka di browser)

- [ ] **Step 1: Pastikan Laragon jalan**

Cek dengan membuka `http://localhost/template-photos-maker/` di browser. Jika tidak tampil, start Laragon dulu.

- [ ] **Step 2: Cek layout utama**

Periksa di viewport lebar (>= 1200px):
- Daftar foto adalah kolom sempit (~190px) di kiri
- Preview melebar memenuhi sisa layar di baris yang sama
- Kartu Preset & Ukuran tetap di atas, info-strip & action-bar tetap di posisinya

- [ ] **Step 3: Cek fungsi aplikasi tetap jalan**

- Tambah beberapa foto (+ Tambah Foto)
- Scroll & pilih item di daftar foto
- Zoom in/out preview (tombol +, −, 1:1)
- Navigasi halaman (← / →) tetap bekerja

- [ ] **Step 4: Cek responsive**

Buka DevTools (F12) → toggle device toolbar → lebar <= 768px:
- `#main-content` menumpuk vertikal (kolom)
- Preview tetap punya `min-height: 280px` sesuai media query yang ada

- [ ] **Step 5: Deploy ulang (opsional, jika mau sinkron dengan hosting)**

Upload `css/styles.css` ke `https://red-anteater-980940.hostingersite.com/template-maker/css/styles.css` (sesuai metode upload yang biasa dipakai), lalu verifikasi hash:

```
curl.exe -s --max-time 30 -o NUL -w "%{http_code}" https://red-anteater-980940.hostingersite.com/template-maker/css/styles.css
```

Bandingkan MD5 lokal vs remote:

```
Get-FileHash "C:\laragon\www\template-photos-maker\css\styles.css" -Algorithm MD5
```
