# PicGrid

Susun, atur, dan cetak foto dalam layout lembar (A4/A5/A3/Legal/Custom) dengan rapi — pasfoto, polaroid, strip, hingga ukuran KTP. Aplikasi web murni (HTML + CSS + JavaScript) tanpa backend, semua diproses di browser Anda.

**Demo:** https://red-anteater-980940.hostingersite.com/picgrid/

## Fitur

- **Preset siap pakai** — pasfoto (2x3, 3x4, 4x6), KTP, cetak foto (2R/3R/4R/5R/6R), dan 12 variasi polaroid (termasuk border asimetris ala polaroid asli)
- **Preset strip multi-foto** — satu kartu berisi 3–4 foto (3 STRIP, 4 STRIP, 3 STRIP Landscape)
- **Isi slot otomatis** — foto diulang/cycle mengisi semua slot hingga lembar penuh (bisa dimatikan)
- **Ukuran kertas & orientasi** — A4, A5, A3, Legal, atau Custom (lebar × tinggi mm), portrait/landscape
- **Atur posisi di halaman** — posisi dokumen, tengah, raster/kanan/kiri, hingga fit satu halaman
- **Mode tile** — bagi lembar rata sesuai baris × kolom
- **Per-foto** — rotasi 90°, flip horizontal/vertikal, flip rasio (foto ikut terputar), filter grayscale & black-and-white
- **Border putih** — tebal atas/bawah/kiri/kanan dapat diatur per sisi
- **Border & garis potong** — outline dan hairline opsional untuk memudahkan pemotongan
- **Undo/Redo** — Ctrl+Z, Ctrl+Shift+Z / Ctrl+Y (maks. 50 langkah)
- **Zoom & pan** — navigasi preview, wheel zoom
- **Import banyak** — pilih file, drag & drop, tempel (paste), atau ZIP
- **Export & Print** — PNG 300 DPI per halaman, print langsung dengan ukuran kertas menyesuaikan
- **Auto-save** — semua pengaturan & foto tersimpan otomatis di localStorage (lanjut di lain waktu)
- **Bilingual** — Indonesia / English
- **Pembuat:** Hendrik Adi Saputra | Revbellion

## Cara pakai singkat

1. Tambahkan foto (pilih file / drag & drop / paste / ZIP).
2. Pilih preset ukuran foto (mis. Pasfoto 4x6 atau Polaroid Mini).
3. Atur ukuran kertas & orientasi, posisi, margin, border — hasil terlihat langsung di preview.
4. (Opsional) Duplikat, rotasi, filter, atau atur ulang urutan foto.
5. Export PNG atau Print.

## Struktur

```
index.html   — UI aplikasi
js/app.js    — seluruh logika aplikasi (tanpa framework)
css/styles.css — styling
```

## Teknologi

- Vanilla JavaScript (ES2020+), Canvas API untuk rendering 300 DPI
- localStorage untuk persistensi state
- CDN jsdelivr: jszip (di-load lazy, hanya saat import ZIP)

## Lisensi

Bebas digunakan untuk keperluan pribadi & komersial.

---

Dibuat dengan ❤ oleh **Hendrik Adi Saputra | Revbellion**.
