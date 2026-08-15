# Template Photos Maker — Strip Foto Horizontal di Atas Preview

Tanggal: 2026-08-15 (revisi dari desain "Sidebar + Preview Luas")
Status: Disetujui (brainstorming)

## Tujuan

Daftar foto pindah dari sidebar kanan menjadi **strip horizontal (filmstrip)** di atas
preview. Setiap foto tampil sebagai tile thumbnail, deret ke kanan, scroll horizontal
bila banyak.

## Lingkup

- `index.html` — pindah `#left-panel` dari `#right-sidebar` ke `#content-area` (di atas `#right-panel`)
- `css/styles.css` — layout strip horizontal + tile
- `js/app.js` — render tile dengan thumbnail + drag urutkan pakai sumbu X

## Desain

1. **Struktur**:
   - `#right-sidebar` dihapus (tidak dipakai lagi)
   - `#content-area`: `#info-strip` → `#left-panel` (toolbar + `#list-container`) → `#right-panel` (preview) → `#action-bar` → `#status-bar`

2. **Strip & tile**:
   - `#list-container`: tinggi tetap ~120px, `overflow: hidden`
   - `#photo-list`: flex row, `overflow-x: auto`, gap 8px
   - `.photo-list-item`: tile ~86px lebar, kolom: thumbnail (img, object-fit: cover, tinggi ~62px) + nama (ellipsis) + ukuran; drag-handle overlay kiri-atas; badge filter overlay kanan-atas
   - Thumbnail memakai `p.dataUrl`/`p.img.src` langsung (CSS resize, tidak buat thumbnail terpisah)

3. **JS** (`js/app.js` `_rebuildListbox` ~line 1024):
   - item.innerHTML diubah ke layout tile + `<img class="photo-thumb">`
   - Logika drag reorder: `e.clientY` → `e.clientX` (2 tempat: pointermove; threshold `Math.abs(e.clientY - drag.y)` → clientX; hit-test `el.getBoundingClientRect().left/right`)
   - Seleksi (click/ctrl/shift/contextmenu), badge filter, drag-handle, `_movePhoto` TIDAK diubah

4. **CSS tile**:
   - `.photo-list-item`: `display: flex; flex-direction: column; flex: 0 0 86px; padding: 4px`
   - `.photo-list-item .photo-thumb`: `width: 100%; height: 62px; object-fit: cover; border-radius: 4px`
   - `.photo-list-item.drag-over`: `border-top` → `border-left` (indikator insert horizontal)
   - `.photo-name`/`.photo-size`: diperkecil (10px/9px), ellipsis
   - `.drag-handle`: overlay absolute (kiri-atas, semi-transparan)
   - Rule `#right-sidebar` dihapus dari CSS (termasuk override media query)
   - Rule media query `#left-panel { flex: none }`, `#list-container { min-height: 240px }` tidak diperlukan lagi (tinggi tetap) — diganti `#list-container { height: 120px }` bila perlu

5. **Mobile (≤768px)**: strip tetap horizontal scroll (konsisten, tidak bertumpuk)

## Non-goals

- Tidak mengubah logika layout halaman, print, export, preset, pagination
- Tidak menambah fitur baru (filter, rotate, dll) — perilaku tile sama dengan list lama, hanya tampilan berbeda

## Verifikasi

1. Buka `http://localhost/template-photos-maker/`
2. Tambah 5+ foto berbeda orientasi: tile thumbnail muncul berderet di atas preview
3. Scroll horizontal strip bila banyak foto; seleksi (klik/Ctrl/Shift/klik kanan) jalan
4. Drag via handle urutkan ulang secara horizontal
5. Badge GRAY/B&W muncul di tile; preview & pagination tetap benar
6. Print & Export PNG tetap bekerja
7. Mobile: strip tetap scroll horizontal, preview di bawahnya