# PicGrid

Susun, atur, dan cetak foto dalam layout lembar dengan rapi — pasfoto, polaroid, strip, hingga ukuran KTP. Aplikasi web murni (HTML + CSS + JavaScript) tanpa backend; semua pemrosesan gambar dilakukan di browser Anda (privasi aman, foto tidak dikirim ke mana pun).

**Demo:** https://red-anteater-980940.hostingersite.com/picgrid/

## Daftar Isi

- [Fitur](#fitur)
- [Tutorial Lengkap](#tutorial-lengkap)
  - [1. Menambahkan Foto](#1-menambahkan-foto)
  - [2. Mengelola Foto](#2-mengelola-foto)
  - [3. Memilih Ukuran / Preset](#3-memilih-ukuran--preset)
  - [4. Mengatur Lembar (Kertas & Posisi)](#4-mengatur-lembar-kertas--posisi)
  - [5. Mengatur Tampilan Kartu](#5-mengatur-tampilan-kartu)
  - [6. Edit Per-Foto](#6-edit-per-foto)
  - [7. Isi Slot Otomatis](#7-isi-slot-otomatis)
  - [8. Menavigasi Preview](#8-menavigasi-preview)
  - [9. Export PNG](#9-export-png)
  - [10. Print / Cetak](#10-print--cetak)
  - [11. Auto-Save & Sesi](#11-auto-save--sesi)
  - [12. Ganti Bahasa](#12-ganti-bahasa)
- [Tips & Trik](#tips--trik)
- [FAQ](#faq)
- [Struktur Proyek](#struktur-proyek)
- [Teknologi](#teknologi)
- [Kredit](#kredit)

## Fitur

- **Preset siap pakai** — pasfoto (2x3, 3x4, 4x6), KTP, cetak foto (2R/3R/4R/5R/6R), dan 12 variasi polaroid (termasuk border asimetris ala polaroid asli)
- **Preset strip multi-foto** — satu kartu berisi 3–4 foto (3 STRIP, 4 STRIP, 3 STRIP Landscape)
- **Isi slot otomatis** — foto diulang (cycle) mengisi semua slot hingga lembar penuh (bisa dimatikan)
- **Ukuran kertas & orientasi** — A4, A5, A3, Legal, atau Custom (lebar × tinggi mm), portrait/landscape
- **Atur posisi di halaman** — posisi dokumen, tengah, rata kiri/kanan/tengah, hingga fit satu halaman
- **Mode tile** — bagi lembar rata sesuai baris × kolom
- **Edit per-foto** — rotasi 90°, flip horizontal/vertikal, flip rasio (foto ikut terputar), filter grayscale & black-and-white
- **Border putih** — tebal atas/bawah/kiri/kanan dapat diatur per sisi (untuk polaroid: border bawah lebih tebal)
- **Border & garis potong** — outline + hairline opsional untuk memudahkan pemotongan
- **Undo/Redo** — Ctrl+Z, Ctrl+Shift+Z / Ctrl+Y (maks. 50 langkah)
- **Zoom & pan** — wheel zoom, klik-tengah/drag untuk geser preview
- **Import massal** — pilih file, drag & drop, tempel (paste), atau ZIP
- **Export & Print** — PNG 300 DPI per halaman, print dengan ukuran kertas menyesuaikan
- **Auto-save** — semua pengaturan & foto tersimpan otomatis di localStorage
- **Bilingual** — Indonesia / English

## Tutorial Lengkap

### 1. Menambahkan Foto

Ada 4 cara memasukkan foto:

| Cara | Langkah |
|---|---|
| **Pilih file** | Klik area daftar foto / tombol tambah, pilih satu atau banyak file gambar (JPG/PNG/WebP). |
| **Drag & drop** | Seret file gambar dari Windows Explorer langsung ke area daftar foto. |
| **Paste** | Copy gambar dari aplikasi lain (browser, WhatsApp, editor), lalu Ctrl+V di halaman. |
| **ZIP** | Import file ZIP berisi banyak foto sekaligus (library jszip dimuat otomatis saat itu juga). |

Foto yang masuk tampil di daftar kiri dengan ukuran aslinya (cm) terbaca otomatis.

> **Tips:** Foto potret dari kamera smartphone akan otomatis diputar sesuai orientasi EXIF (bisa dimatikan via ceklis *Auto-rotate*).

### 2. Mengelola Foto

- **Seleksi** — klik satu foto; Ctrl+klik untuk memilih beberapa; Shift+klik untuk rentang.
- **Urutan** — seret gagang (ikon ⠿) untuk menukar posisi. Urutan menentukan posisi foto pada lembar.
- **Duplikat** — klik kanan foto → *Duplikat...* (atau Ctrl+D) untuk membuat salinan (berguna membuat lembar penuh satu foto).
- **Hapus** — tombol Hapus / *Clear All* untuk mengosongkan.
- **Klik kanan di preview** — langsung membuka menu konteks foto yang diklik di posisi itu.
- **Undo/Redo** — setiap aksi (tambah, hapus, putar, ubah ukuran, dst.) bisa dibatalkan: **Ctrl+Z** undo, **Ctrl+Shift+Z** atau **Ctrl+Y** redo (riwayat 50 langkah, dalam sesi berjalan).

### 3. Memilih Ukuran / Preset

Di panel kiri, dropdown **Preset** berisi:

- **Pasfoto** — 2x3, 3x4, 4x6 (ukuran pas foto standar, tanpa border)
- **KTP** — 8,56 × 5,4 cm (sesuai dimensi KTP; lembar A4 menampung 10 kartu)
- **Cetak Foto** — 2R, 3R, 4R, 5R, 6R
- **Polaroid (12 varian)** — foto dengan bingkai putih asimetris khas polaroid; varian *Mini* (kotak 5x5 cm) paling populer untuk undangan/cetakan kecil
- **Strip** — 3 STRIP, 4 STRIP, 3 STRIP Landscape: satu kartu terbagi menjadi 3–4 sub-foto dari foto berbeda (isi minimal 3–4 foto)
- **Custom** — lebar/tinggi foto manual (cm, 0.5–30)

Setelah memilih preset, *auto-fill* langsung mengisi semua slot dengan foto Anda (lihat §7). Preset Anda sendiri bisa **disimpan** (tombol Simpan Preset) dan **dihapus** (dropdown berisi preset custom Anda).

> **Ukuran default & margin** diatur pada bagian *Ukuran & Margin*: Lebar/Tinggi (cm), Margin Minimal antar foto (mm), dan Margin Atas (mm) untuk posisi dokumen.

### 4. Mengatur Lembar (Kertas & Posisi)

Di toolbar bawah (atau menu *Posisi Halaman...*):

- **Kertas** — A4 / A5 / A3 / Legal / **Custom**. Saat memilih Custom muncul input Lebar × Tinggi dalam mm (50–600). Ukuran kertas menentukan jumlah foto per lembar & jumlah halaman.
- **Orientasi** — tombol *Orientasi: Potret / Lanskap* menukar lebar/tinggi kertas.
- **Posisi Halaman...** — dialog untuk memilih:
  - *As-document* — mengikuti urutan dari atas, dengan Margin Atas
  - *Center* / *Rata kiri-tengah* / *Rata kanan-tengah* / *Rata atas-tengah* — meletakkan blok foto pada posisi tertentu
  - *Top-left / Bottom-left / Bottom-center / Bottom-right* — variasi penempatan
  - *Fit Page* — satu foto diperbesar mengisi satu halaman penuh (border putih otomatis dinonaktifkan)
- **Tile** — centang *Tile* lalu tentukan Baris × Kolom: lembar dibagi rata menjadi sel grid; setiap sel berisi satu foto (tanpa menghitung dimensi foto).

### 5. Mengatur Tampilan Kartu

Bagian *Tampilan*:

- **Border Putih** — aktifkan untuk bingkai putih; atur **Atas/Bawah/Kiri/Kanan** (mm) per sisi. Untuk efek polaroid: Atas 4–6 mm, Bawah 18–20 mm, Kiri/Kanan 0.
- **Border** (outline) — garis tepi kartu; atur ketebalan (mm). *Hairline* = garis 0,1 mm untuk memudahkan pemotongan presisi.
- **Garis Potong** — garis potong di setiap sisi kartu (bantu pemotongan manual).
- **Mode** — bagaimana foto ditempatkan di dalam slot:
  - `fill` — foto dipotong (crop) mengisi seluruh slot (hasil selalu penuh, sebagian gambar terpotong)
  - `fit` — seluruh foto tampil muat di dalam slot (ada ruang putih jika rasio berbeda)
  - `stretch` — foto ditarik sesuai rasio slot (bisa terdistorsi)
  - Rekomendasi pasfoto: `fill`.

### 6. Edit Per-Foto

Klik kanan foto (di daftar atau preview) untuk menu:

- **Set Size...** — ubah lebar/tinggi (cm) manual (foto besar di halaman bisa dibatasi dengan alert bila melebihi kertas)
- **Rotate 90° / 180°** — putar searah/jarum jam
- **Flip Horizontal / Vertikal** — cermin gambar
- **Flip Rasio** — menukar rasio lebar↔tinggi; **foto di dalamnya ikut diputar 90°** mengikuti rasio baru
- **Duplikat...**
- **Filter** — Warna (Normal), Grayscale, Black & White

*Auto-rotate* (ceklist) memperbaiki orientasi foto berdasarkan data EXIF kamera saat foto dimasukkan.

### 7. Isi Slot Otomatis

Ceklis **"Otomatis isi slot"** (aktif secara default, tersimpan):

- Setelah memilih preset, semua slot yang kosong langsung diisi dengan foto Anda secara berulang (foto 1, 2, 3, 1, 2, ...) hingga lembar penuh.
- Saat kosong, Anda bisa mengisi manual: klik **Isi Semua Slot** (memakai foto pertama untuk semua slot).
- Matikan ceklis jika ingin mengisi slot satu per satu secara manual.

### 8. Menavigasi Preview

- **Zoom** — tombol + / − / 1:1 di kanan atas preview; **wheel** di atas canvas juga zoom.
- **Pan** — tahan tombol kiri pada area kosong lalu seret (kursor berubah jadi tangan); Reset Zoom mengembalikan tampilan.
- **Halaman** — jika foto melebihi satu lembar, navigasi halaman muncul (‹ Halaman x/y ›) di status bar.
- **Info status** — di bawah preview tampil jumlah foto, jumlah lembar, dan pesan aksi.

### 9. Export PNG

- Klik **Export PNG** → setiap halaman di-render **300 DPI** (A4 ≈ 2480×3508 px) dan diunduh sebagai `template_1.png`, `template_2.png`, dst.
- Hasilnya siap dibawa ke tempat cetak atau dikonversi ke PDF.
- Semua halaman masuk dalam satu dialog unduhan berurutan.

### 10. Print / Cetak

- Klik **Print** → browser membuka dialog cetak dengan:
  - Ukuran kertas otomatis sesuai pilihan Kertas (A4/A5/A3/Legal/Custom) dan orientasi
  - Margin `0` — lembar terisi penuh tanpa spasi
  - Satu halaman hasil = satu halaman cetak
- Untuk **export ke PDF**: di dialog print pilih printer "Microsoft Print to PDF" / "Save as PDF" (setara fitur export PDF).

### 11. Auto-Save & Sesi

- Semua foto (data gambar), ukuran, preset, kertas, orientasi, posisi, dan pengaturan lain otomatis tersimpan di **localStorage** setiap aksi.
- Tutup & buka lagi halaman → pekerjaan Anda kembali persis (termasuk foto).
- Data tidak dikirim ke server mana pun; membersihkan data situs di browser akan menghapusnya.

### 12. Ganti Bahasa

- Tombol **EN** di pojok kanan atas menukar bahasa Indonesia ⇄ English (tersimpan).

## Tips & Trik

1. **Pasfoto 4x6 di A4** — pilih preset Pasfoto 4x6, ukuran kertas A4 → 8 foto per lembar dengan margin aman 5 mm untuk pemotongan.
2. **Polaroid undangan** — preset *Polaroid Mini*, kertas A4, lalu Set Size foto ≈ 4x5,5 cm agar bagian border bawah pas. Foto portrait (tinggi) lebih cocok.
3. **Lembar penuh satu foto** — tambah 1 foto → Duplikat berulang, atau aktifkan posisi *Fit Page* untuk poster ukuran kertas.
4. **Strip** — gunakan preset 4 STRIP dengan tepat 4 foto; urutan foto di daftar menentukan isi strip atas → bawah.
5. **Pemotongan rapi** — aktifkan *Hairline* + *Garis Potong* saat mencetak di kertas foto 10R, potong dengan penggaris.
6. **Foto resolusi rendah** — hasil export tetap 300 DPI; foto kamera 12 MP aman untuk ukuran hingga 4R.
7. **Proyek besar (banyak foto ZIP)** — pastikan tidak menutup tab saat auto-save pertama selesai (status bar menunjukkan jumlah foto ter-import).

## FAQ

**Foto terpotong?** Mode `fill` memang memotong gambar agar mengisi slot. Ganti ke `fit` untuk melihat seluruh foto (atau sesuaikan rasio foto/ukuran preset).

**Kenapa jumlah foto per lembar sedikit?** Margin minimal 5 mm + border kartu menghabiskan ruang. Kurangi *Margin Minimal* atau gunakan *Tile*.

**Ukuran foto tidak sesuai cetakan?** Pastikan preset benar dan *Border Putih* 0 mm untuk ukuran pasfoto standar; output PNG 300 DPI setara spesifikasi cetak.

**Apakah foto saya dikirim ke server?** Tidak. Semua proses 100% di browser.

**Bisa dilanjutkan besok?** Ya — auto-save memulihkan semuanya saat halaman dibuka lagi (di browser yang sama).

## Struktur Proyek

```
index.html      — UI aplikasi
js/app.js       — seluruh logika aplikasi (tanpa framework)
css/styles.css  — styling
README.md       — dokumentasi ini
```

## Teknologi

- Vanilla JavaScript (ES2020+), Canvas API untuk rendering 300 DPI
- localStorage untuk persistensi state
- CDN jsdelivr: jszip (di-load lazy, hanya saat import ZIP)

## Kredit

Dibuat dengan ❤ oleh **Hendrik Adi Saputra | Revbellion**.
