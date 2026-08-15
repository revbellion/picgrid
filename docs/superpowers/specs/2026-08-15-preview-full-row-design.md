# Template Photos Maker — Sidebar + Preview Luas

Tanggal: 2026-08-15 (revisi dari desain "Preview Full Row")
Status: Disetujui (brainstorming)

## Tujuan

Layout dua kolom: **sidebar kiri** berisi Preset, Ukuran & Margin, dan daftar foto;
**area kanan** diisi preview yang seluas mungkin.

## Lingkup

- `index.html` — restrukturisasi markup (memindahkan elemen, tanpa mengubah ID)
- `css/styles.css` — layout sidebar + preview
- `js/app.js` — TIDAK disentuh (sudah diverifikasi: tidak ada referensi ke ID wrapper)

## Desain

1. **Struktur baru** (ID elemen yang direferensikan JS tidak berubah):

```
#app
  #header
  #main-layout            (baru: flex row, gap 12px)
    #sidebar              (baru: flex 0 0 300px, kolom)
      #preset-card        (dipindah dari atas)
      #settings-card      (dipindah dari atas)
      #left-panel         (toolbar + daftar foto, flex: 1)
    #content-area         (baru: flex 1, kolom, min-width 0)
      #info-strip         (dipindah ke sini)
      #right-panel        (preview, flex: 1)
      #action-bar         (Posisi/Orientasi/Print/Export)
      #status-bar
```

2. **CSS**:
   - `#app` max-width 1240px → **1560px** (biar preview lebih lebar)
   - `#main-layout`: `display: flex; gap: 12px; align-items: stretch; min-height: 560px`
   - `#sidebar`: `flex: 0 0 300px; display: flex; flex-direction: column; min-width: 0`
   - `#left-panel`: `flex: 1` (mengisi sisa tinggi sidebar); `#list-container` tetap `flex: 1`
   - `#right-panel`: `flex: 1`; `#preview-border` tetap `flex: 1` sehingga preview mengisi semua sisa area kanan
   - `#content-area`: `flex: 1; min-width: 0; display: flex; flex-direction: column`
   - `#info-strip` margin-bottom dipertahankan
   - Rule lama `#main-content` dihapus/diganti

3. **Responsive (≤768px)**: `#main-layout { flex-direction: column }`,
   `#sidebar { width: 100% }`, `#left-panel { flex: none; width: 100% }`,
   `#right-panel { min-height: 280px }` — perilaku bertumpuk dipertahankan.

## Non-goals

- Tidak mengubah logika aplikasi, ID elemen yang dipakai JS, print, export, preset
- Tidak menambah fitur baru

## Verifikasi

1. Buka `http://localhost/template-photos-maker/`
2. Sidebar kiri berisi Preset → Ukuran & Margin → daftar foto (bertumpuk rapi)
3. Preview mengisi seluruh area kanan (lebar dan tinggi)
4. Tambah foto, pilih, scroll list, zoom/pan preview, navigasi halaman tetap jalan
5. Layout ≤768px tetap bertumpuk rapi (DevTools)
6. Print & Export PNG tetap bekerja