(function() {
'use strict';

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const DPI = 300;
const CLIP_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.bmp', '.gif', '.tiff', '.tif', '.webp', '.ico'];

const BUILTIN_PRESETS = [
  { name: 'Polaroid Mini',             photo_w_cm: 5.4,  photo_h_cm: 8.6,  wb_top_mm: 4.0, wb_bottom_mm: 20.0, wb_left_mm: 4.0, wb_right_mm: 4.0 },
  { name: 'Polaroid 2R',               photo_w_cm: 6.0,  photo_h_cm: 9.0,  wb_top_mm: 4.0, wb_bottom_mm: 20.0, wb_left_mm: 4.0, wb_right_mm: 4.0 },
  { name: 'Polaroid 7x10',             photo_w_cm: 7.0,  photo_h_cm: 10.0, wb_top_mm: 4.0, wb_bottom_mm: 20.0, wb_left_mm: 4.0, wb_right_mm: 4.0 },
  { name: 'Polaroid SQUARE',           photo_w_cm: 7.0,  photo_h_cm: 9.0,  wb_top_mm: 4.0, wb_bottom_mm: 20.0, wb_left_mm: 4.0, wb_right_mm: 4.0 },
  { name: 'Polaroid 3 STRIP Landscape', photo_w_cm: 7.7, photo_h_cm: 17.8, wb_top_mm: 4.5, wb_bottom_mm: 22.5, wb_left_mm: 4.5, wb_right_mm: 4.5, strip: 3 },
  { name: 'Polaroid 3R',               photo_w_cm: 8.6,  photo_h_cm: 12.6, wb_top_mm: 5.0, wb_bottom_mm: 25.0, wb_left_mm: 5.0, wb_right_mm: 5.0 },
  { name: 'Polaroid WIDE',             photo_w_cm: 11.0, photo_h_cm: 9.0,  wb_top_mm: 5.0, wb_bottom_mm: 25.0, wb_left_mm: 5.0, wb_right_mm: 5.0 },
  { name: 'Polaroid 4R',               photo_w_cm: 10.0, photo_h_cm: 15.0, wb_top_mm: 5.5, wb_bottom_mm: 27.5, wb_left_mm: 5.5, wb_right_mm: 5.5 },
  { name: 'Polaroid SNAPSHOT A',       photo_w_cm: 10.0, photo_h_cm: 15.0, wb_top_mm: 5.5, wb_bottom_mm: 27.5, wb_left_mm: 5.5, wb_right_mm: 5.5 },
  { name: 'Polaroid SNAPSHOT B',       photo_w_cm: 11.5, photo_h_cm: 17.0, wb_top_mm: 6.0, wb_bottom_mm: 30.0, wb_left_mm: 6.0, wb_right_mm: 6.0 },
  { name: 'Polaroid 3 STRIP',          photo_w_cm: 5.0,  photo_h_cm: 15.0, wb_top_mm: 4.0, wb_bottom_mm: 20.0, wb_left_mm: 4.0, wb_right_mm: 4.0, strip: 3 },
  { name: 'Polaroid 4 STRIP',          photo_w_cm: 5.0,  photo_h_cm: 18.5, wb_top_mm: 4.0, wb_bottom_mm: 20.0, wb_left_mm: 4.0, wb_right_mm: 4.0, strip: 4 },
  { name: '3R',              photo_w_cm: 8.9, photo_h_cm: 12.7, wb_top_mm: 0,  wb_bottom_mm: 0,  wb_left_mm: 0, wb_right_mm: 0 },
  { name: '4R',              photo_w_cm: 10.2, photo_h_cm: 15.2, wb_top_mm: 0,  wb_bottom_mm: 0,  wb_left_mm: 0, wb_right_mm: 0 },
  { name: '2R',              photo_w_cm: 6.4, photo_h_cm: 8.9, wb_top_mm: 0,  wb_bottom_mm: 0,  wb_left_mm: 0, wb_right_mm: 0 },
  { name: '5R',              photo_w_cm: 12.7, photo_h_cm: 17.8, wb_top_mm: 0, wb_bottom_mm: 0, wb_left_mm: 0, wb_right_mm: 0 },
  { name: '6R',              photo_w_cm: 15.2, photo_h_cm: 20.3, wb_top_mm: 0, wb_bottom_mm: 0, wb_left_mm: 0, wb_right_mm: 0 },
  { name: 'A4',              photo_w_cm: 21.0, photo_h_cm: 29.7, wb_top_mm: 0, wb_bottom_mm: 0, wb_left_mm: 0, wb_right_mm: 0, min_margin_mm: 0, margin_atas_mm: 0 },
  { name: 'Pasfoto 2x3',    photo_w_cm: 2.0, photo_h_cm: 3.0, wb_top_mm: 1.0, wb_bottom_mm: 1.0, wb_left_mm: 1.0, wb_right_mm: 1.0 },
  { name: 'Pasfoto 3x4',    photo_w_cm: 3.0, photo_h_cm: 4.0, wb_top_mm: 1.5, wb_bottom_mm: 1.5, wb_left_mm: 1.5, wb_right_mm: 1.5 },
  { name: 'Pasfoto 4x6',    photo_w_cm: 4.0, photo_h_cm: 6.0, wb_top_mm: 2.0, wb_bottom_mm: 2.0, wb_left_mm: 2.0, wb_right_mm: 2.0 },
  { name: 'KTP',            photo_w_cm: 8.56, photo_h_cm: 5.4, wb_top_mm: 0, wb_bottom_mm: 0, wb_left_mm: 0, wb_right_mm: 0 },
];

const POSITIONS = {
  'as-doc': 'As in Document',
  'fit-page': 'Fit to Page',
  'center': 'Center of Page',
  'top-center': 'Top Center',
  'left-center': 'Left Center',
  'right-center': 'Right Center',
  'bottom-center': 'Bottom Center',
  'top-left': 'Top Left Corner',
  'top-right': 'Top Right Corner',
  'bottom-left': 'Bottom Left Corner',
  'bottom-right': 'Bottom Right Corner',
};
const POS_SHORT = {
  'fit-page': 'FULL', 'center': 'CTR', 'top-center': 'TC', 'left-center': 'LC',
  'right-center': 'RC', 'bottom-center': 'BC', 'top-left': 'TL', 'top-right': 'TR',
  'bottom-left': 'BL', 'bottom-right': 'BR',
};

const I18N = {
  'lang.toggle':      { id: 'Ganti bahasa', en: 'Switch language' },
  'subtitle':         { id: 'Susun, atur, dan cetak foto dalam layout A4 dengan rapi.', en: 'Arrange, adjust, and print photos neatly in an A4 layout.' },
  'sizeMargin':       { id: 'Ukuran & Margin', en: 'Size & Margin' },
  'width':            { id: 'Lebar', en: 'Width' },
  'height':           { id: 'Tinggi', en: 'Height' },
  'minMargin':        { id: 'Min Margin', en: 'Min Margin' },
  'marginTop':        { id: 'Margin Atas', en: 'Top Margin' },
  'border':           { id: 'Border', en: 'Border' },
  'thickness':        { id: 'Tebal', en: 'Thickness' },
  'hairline':         { id: 'Hairline', en: 'Hairline' },
  'cutLines':         { id: 'Garis Potong', en: 'Cut Lines' },
  'autoRotate':       { id: 'Auto-rotate', en: 'Auto-rotate' },
  'mode':             { id: 'Mode', en: 'Mode' },
  'modeHint':         { id: 'fill=potong  fit=muat  stretch=tarik', en: 'fill=crop  fit=contain  stretch=stretch' },
  'bgEnable':         { id: 'Ganti Latar Foto', en: 'Replace Photo BG' },
  'bgTol':            { id: 'Toleransi', en: 'Tolerance' },
  'bgFeather':        { id: 'Kehalusan Tepi', en: 'Edge Softness' },
  'bgHint':           { id: 'latar terhubung tepi dihapus, diganti warna', en: 'edge-connected background replaced with color' },
  'tile':             { id: 'Tile (bagi halaman rata)', en: 'Tile (divide page evenly)' },
  'rows':             { id: 'Baris', en: 'Rows' },
  'cols':             { id: 'Kolom', en: 'Columns' },
  'tileHint':         { id: 'canvas dibagi rata sesuai Baris \u00D7 Kolom', en: 'canvas divided evenly by Rows \u00D7 Columns' },
  'whiteBorder':      { id: 'Border Putih', en: 'White Border' },
  'top':              { id: 'Atas', en: 'Top' },
  'bottom':           { id: 'Bawah', en: 'Bottom' },
  'left':             { id: 'Kiri', en: 'Left' },
  'right':            { id: 'Kanan', en: 'Right' },
  'noPhotos':         { id: 'Belum ada foto', en: 'No photos yet' },
  'prevPage':         { id: 'Halaman sebelumnya', en: 'Previous page' },
  'nextPage':         { id: 'Halaman selanjutnya', en: 'Next page' },
  'preview':          { id: 'Preview', en: 'Preview' },
  'pagePosition':     { id: 'Posisi Halaman...', en: 'Page Position...' },
  'orientation':      { id: 'Orientasi', en: 'Orientation' },
  'portrait':         { id: 'Potret', en: 'Portrait' },
  'landscape':        { id: 'Lanskap', en: 'Landscape' },
  'print':            { id: 'Print', en: 'Print' },
  'exportPng':        { id: 'Export PNG', en: 'Export PNG' },
  'preset':           { id: 'Preset', en: 'Preset' },
  'savePreset':       { id: 'Simpan Preset', en: 'Save Preset' },
  'delete':           { id: 'Hapus', en: 'Delete' },
  'addPhoto':         { id: '+ Tambah Foto', en: '+ Add Photos' },
  'remove':           { id: 'Hapus', en: 'Remove' },
  'clearAll':         { id: 'Hapus Semua', en: 'Clear All' },
  'fillAllSlots':     { id: 'Isi Semua Slot', en: 'Fill All Slots' },
  'listPlaceholder':  { id: 'Drag &amp; drop foto di sini<br>atau klik + Tambah Foto', en: 'Drag &amp; drop photos here<br>or click + Add Photos' },
  'ready':            { id: '\u25CF Siap', en: '\u25CF Ready' },
  'cm.setSize':       { id: 'Set Ukuran...', en: 'Set Size...' },
  'cm.rotateCw':      { id: 'Rotate 90\u00B0 CW', en: 'Rotate 90\u00B0 CW' },
  'cm.rotateCcw':     { id: 'Rotate 90\u00B0 CCW', en: 'Rotate 90\u00B0 CCW' },
  'cm.rotate180':     { id: 'Rotate 180\u00B0', en: 'Rotate 180\u00B0' },
  'cm.flipH':         { id: 'Flip Horizontal', en: 'Flip Horizontal' },
  'cm.flipV':         { id: 'Flip Vertical', en: 'Flip Vertical' },
  'cm.flipRatio':     { id: 'Flip Rasio', en: 'Flip Ratio' },
  'cm.duplicate':     { id: 'Duplikat...', en: 'Duplicate...' },
  'cm.color':         { id: 'Warna (Normal)', en: 'Color (Normal)' },
  'cm.gray':          { id: 'Grayscale', en: 'Grayscale' },
  'cm.bw':            { id: 'Black &amp; White', en: 'Black &amp; White' },
  'dlg.setSize':      { id: 'Set Ukuran Foto', en: 'Set Photo Size' },
  'dlg.pagePosition': { id: 'Posisi Halaman', en: 'Page Position' },
  'dlg.savePreset':   { id: 'Simpan Preset', en: 'Save Preset' },
  'dlg.duplicate':    { id: 'Duplikat', en: 'Duplicate' },
  'dlg.ok':           { id: 'OK', en: 'OK' },
  'dlg.cancel':       { id: 'Batal', en: 'Cancel' },
  'dlg.close':        { id: 'Tutup', en: 'Close' },
  'dlg.copiesPer':    { id: 'Jumlah copy per foto:', en: 'Number of copies per photo:' },
  'dlg.presetName':   { id: 'Nama Preset:', en: 'Preset Name:' },
  'dlg.presetPh':     { id: 'Nama preset...', en: 'Preset name...' },
  'pos.hint':         { id: 'Atur posisi blok foto di dalam halaman. Berlaku untuk semua halaman. Pilih "As in Document" untuk kembali ke susunan otomatis (mulai dari margin atas).', en: 'Set the position of the photo block on the page. Applies to all pages. Choose "As in Document" to return to automatic layout (starting from the top margin).' },
  'pos.asDoc':        { id: 'As in Document (otomatis)', en: 'As in Document (automatic)' },
  'pos.fitPage':      { id: 'Fit to Page (isi penuh 1 halaman)', en: 'Fit to Page (fill 1 full page)' },
  'st.noFile':        { id: 'Tidak ada file terdeteksi. Coba extract dulu atau gunakan tombol Tambah Foto.', en: 'No files detected. Try extracting first or use the Add Photos button.' },
  'st.noImgZip':      { id: 'Tidak ada file gambar atau ZIP. Coba extract dulu.', en: 'No image files or ZIP found. Try extracting first.' },
  'st.noImgInZip':    { id: 'Tidak ada gambar ditemukan dalam ZIP', en: 'No images found in the ZIP' },
  'st.extracted':     { id: ' gambar diekstrak dari ZIP', en: ' images extracted from ZIP' },
  'st.zipFailed':     { id: 'Gagal membaca ZIP: ', en: 'Failed to read ZIP: ' },
  'st.zipLoading':    { id: 'Memuat pustaka ZIP…', en: 'Loading ZIP library…' },
  'st.added':         { id: ' foto ditambahkan', en: ' photos added' },
  'st.addedFailed':   { id: ' foto ditambahkan (', en: ' photos added (' },
  'st.failed':        { id: ' gagal)', en: ' failed)' },
  'st.addedClip':     { id: ' foto ditambahkan dari clipboard', en: ' photos added from clipboard' },
  'st.clipEmpty':     { id: 'Clipboard tidak berisi gambar', en: 'Clipboard contains no image' },
  'st.clipFailed':    { id: 'Gagal membaca clipboard', en: 'Failed to read clipboard' },
  'st.remaining':     { id: ' foto tersisa', en: ' photos remaining' },
  'st.cleared':       { id: 'Semua foto dihapus', en: 'All photos removed' },
  'st.duplicated':    { id: ' foto diduplikat', en: ' photos duplicated' },
  'st.copiesAdded':   { id: ' copy ditambahkan', en: ' copies added' },
  'st.rotated':       { id: 'Rotasi ', en: 'Rotated ' },
  'st.flipped':       { id: 'Flip ', en: 'Flipped ' },
  'st.ratioFlipped':  { id: 'Rasio ', en: 'Ratio ' },
  'st.ratioFlipped2': { id: ' foto dibalik', en: ' photos flipped' },
  'st.reordered':     { id: 'Urutan foto diubah', en: 'Photo order changed' },
  'st.undo':          { id: 'Undo', en: 'Undo' },
  'st.redo':          { id: 'Redo', en: 'Redo' },
  'st.autoFilled':    { id: 'Slot terisi otomatis: ', en: 'Slots auto-filled: ' },
  'st.restored':      { id: ' foto dipulihkan', en: ' photos restored' },
  'st.presetApplied': { id: 'Preset \'', en: 'Preset \'' },
  'st.appliedTail':   { id: '\' diterapkan', en: '\' applied' },
  'st.presetSaved':   { id: '\' tersimpan', en: '\' saved' },
  'st.presetDeleted': { id: '\' dihapus', en: '\' deleted' },
  'st.processing':    { id: 'Memproses ', en: 'Processing ' },
  'st.pages':         { id: ' halaman...', en: ' pages...' },
  'st.pageDone':      { id: ' halaman selesai', en: ' pages done' },
  'st.done':          { id: 'Selesai! ', en: 'Done! ' },
  'st.savedPages':    { id: ' halaman tersimpan', en: ' pages saved' },
  'st.sheet':         { id: '1 lembar (', en: '1 sheet (' },
  'st.copies':        { id: ' copy)', en: ' copies)' },
  'st.position':      { id: 'Posisi: ', en: 'Position: ' },
  'st.orientation':   { id: 'Orientasi: ', en: 'Orientation: ' },
  'info.rows':        { id: ' baris, ', en: ' rows, ' },
  'info.photos':      { id: ' foto  |  Atas: ', en: ' photos  |  Top: ' },
  'info.bottom':      { id: 'mm  |  Bawah: ', en: 'mm  |  Bottom: ' },
  'info.pos':         { id: 'mm  |  Posisi: ', en: 'mm  |  Position: ' },
  'info.tile':        { id: 'mm  |  Tile: ', en: 'mm  |  Tile: ' },
  'info.tooBig':      { id: 'Foto tidak cukup muat di A4', en: 'Photos do not fit on A4' },
  'info.selected':    { id: ' terpilih', en: ' selected' },
  'al.selectFirst':   { id: 'Pilih foto yang ingin diduplikat', en: 'Select the photo to duplicate' },
  'al.selectFirst2':  { id: 'Pilih foto yang ingin diduplikat di daftar', en: 'Select the photo to duplicate in the list' },
  'al.min1copy':      { id: 'Minimal 1 copy', en: 'At least 1 copy' },
  'al.addPhoto1':     { id: 'Tambahkan minimal 1 foto', en: 'Add at least 1 photo' },
  'al.tooBigPage':    { id: 'Ukuran foto terlalu besar untuk halaman', en: 'Photo size is too large for the page' },
  'al.notFit':        { id: 'Foto tidak cukup muat', en: 'Not enough photos to fit' },
  'al.sizeZero':      { id: 'Ukuran harus > 0', en: 'Size must be > 0' },
  'al.biggerPage':    { id: 'Foto lebih besar dari halaman', en: 'Photo is bigger than the page' },
  'al.noFit':         { id: 'Tidak ada foto yang muat', en: 'No photos fit' },
  'al.presetEmpty':   { id: 'Nama preset tidak boleh kosong', en: 'Preset name cannot be empty' },
  'al.overwrite':     { id: '\' sudah ada. Timpa?', en: '\' already exists. Overwrite?' },
  'al.builtin':       { id: 'Preset bawaan tidak bisa dihapus', en: 'Built-in presets cannot be deleted' },
  'al.deletePreset':  { id: 'Hapus preset "', en: 'Delete preset "' },
  'al.deleteTail':    { id: '"?', en: '"?' },
  'cf.clearAll':      { id: 'Hapus semua foto?', en: 'Remove all photos?' },
  'dragHint':         { id: 'Geser untuk urutkan', en: 'Drag to reorder' },
  'choosePreset':     { id: '-- Pilih Preset --', en: '-- Choose Preset --' },
  'autoFill':         { id: 'Otomatis isi slot', en: 'Auto-fill slots' },
  'addPreviewHint':   { id: 'Tambahkan foto untuk melihat preview', en: 'Add photos to see the preview' },
};

const POS_BTN = {
  'top-left':     { id: 'Atas Kiri', en: 'Top Left' },
  'top-center':   { id: 'Atas Tengah', en: 'Top Center' },
  'top-right':    { id: 'Atas Kanan', en: 'Top Right' },
  'left-center':  { id: 'Kiri Tengah', en: 'Left Center' },
  'center':       { id: 'Tengah', en: 'Center' },
  'right-center': { id: 'Kanan Tengah', en: 'Right Center' },
  'bottom-left':  { id: 'Bawah Kiri', en: 'Bottom Left' },
  'bottom-center':{ id: 'Bawah Tengah', en: 'Bottom Center' },
  'bottom-right': { id: 'Bawah Kanan', en: 'Bottom Right' },
};

class PhotoTemplateApp {
  constructor() {
    this.lang = localStorage.getItem('template-photos-lang') === 'en' ? 'en' : 'id';
    this.photos = [];
    this.undoStack = [];
    this.redoStack = [];
    this.zoomFactor = 1;
    this.panX = 0;
    this.panY = 0;
    this.panning = false;
    this.panStartX = 0;
    this.panStartY = 0;
    this.refreshTimer = null;
    this.rowsData = [];
    this.marginTopMm = 0;
    this.marginBottomMm = 0;
    this.allPages = [];
    this.currentPage = 0;
    this.position = 'as-doc';
    this.orientation = 'portrait';
    this.autoRotate = true;
    this.tileGrid = null;
    this._filterCache = new Map();

    this.els = {};
    this._cacheDom();
    this._initEvents();
    this._loadPresets();
    this._refreshPresetCombo();
    this._restoreState();
    this._updateOrientationBtn();
    this.els.autoRotate.checked = this.autoRotate;
    this._syncTileUI();
    this._scheduleRefresh();
    this._applyLang();
  }

  // Dimensi halaman (mm) sesuai orientasi: portrait 210x297, landscape 297x210
  _pageW() { return this.orientation === 'landscape' ? A4_HEIGHT_MM : A4_WIDTH_MM; }
  _pageH() { return this.orientation === 'landscape' ? A4_WIDTH_MM : A4_HEIGHT_MM; }

  _minMargin() { const v = parseFloat(this.els.minMargin.value); return isNaN(v) ? 5 : v; }
  _marginAtas() { const v = parseFloat(this.els.marginAtas.value); return isNaN(v) ? 6 : v; }

  // ---- DOM references ----
  _cacheDom() {
    const $ = (id) => document.getElementById(id);
    this.els = {
      photoWidth: $('photo-width'),
      photoHeight: $('photo-height'),
      minMargin: $('min-margin'),
      marginAtas: $('margin-atas'),
      showBorder: $('show-border'),
      borderHairline: $('border-hairline'),
      borderWidth: $('border-width'),
      showCutlines: $('show-cutlines'),
      showWhiteBorder: $('show-white-border'),
      wbTop: $('wb-top'),
      wbBottom: $('wb-bottom'),
      wbLeft: $('wb-left'),
      wbRight: $('wb-right'),
      fitMode: $('fit-mode'),
      bgEnable: $('bg-enable'),
      bgColor: $('bg-color'),
      bgTol: $('bg-tol'),
      bgFeather: $('bg-feather'),
      bgControls: $('bg-controls'),
      presetCombo: $('preset-combo'),
      infoLabel: $('info-label'),
      photoList: $('photo-list'),
      listPlaceholder: $('list-placeholder'),
      listContainer: $('list-container'),
      canvas: $('preview-canvas'),
      zoomLabel: $('zoom-label'),
      statusText: $('status-text'),
      fileInput: $('file-input'),
      contextMenu: $('context-menu'),
      orientationBtn: $('btn-orientation'),
      btnLang: $('btn-lang'),
      autoRotate: $('auto-rotate'),
      tileEnable: $('tile-enable'),
      tileRows: $('tile-rows'),
      tileCols: $('tile-cols'),
      chkAutoFill: $('chk-autofill'),

      dialogOverlay: $('dialog-overlay'),
      dialogContent: $('dialog-content'),
      pageNav: $('page-nav'),
      pageLabel: $('page-label'),
    };
  }

  // ---- Event binding ----
  _initEvents() {
    const els = this.els;
    const inputEvents = ['input', 'change'];

    inputEvents.forEach(ev => {
      els.photoWidth.addEventListener(ev, () => this._scheduleRefresh());
      els.photoHeight.addEventListener(ev, () => this._scheduleRefresh());
      els.minMargin.addEventListener(ev, () => this._scheduleRefresh());
      els.marginAtas.addEventListener(ev, () => this._scheduleRefresh());
      els.showBorder.addEventListener('change', () => this._updatePreview());
      els.borderHairline.addEventListener('change', () => {
        els.borderWidth.disabled = els.borderHairline.checked;
        this._updatePreview();
      });
      els.borderWidth.addEventListener(ev, () => this._updatePreview());
      els.showCutlines.addEventListener('change', () => this._updatePreview());
      els.showWhiteBorder.addEventListener('change', () => this._updatePreview());
      els.autoRotate.addEventListener('change', () => {
        this.autoRotate = els.autoRotate.checked;
        this._saveState();
      });
      const syncTile = () => {
        const on = els.tileEnable.checked;
        const rows = Math.max(1, parseInt(els.tileRows.value, 10) || 1);
        const cols = Math.max(1, parseInt(els.tileCols.value, 10) || 1);
        els.tileRows.value = rows;
        els.tileCols.value = cols;
        els.tileRows.disabled = !on;
        els.tileCols.disabled = !on;
        this.tileGrid = on ? rows + 'x' + cols : null;
        this.currentPage = 0;
        this._scheduleRefresh();
        this._saveState();
      };
      els.tileEnable.addEventListener('change', syncTile);
      els.tileRows.addEventListener('change', syncTile);
      els.tileCols.addEventListener('change', syncTile);
      els.wbTop.addEventListener(ev, () => this._updatePreview());
      els.wbBottom.addEventListener(ev, () => this._updatePreview());
      els.wbLeft.addEventListener(ev, () => this._updatePreview());
      els.wbRight.addEventListener(ev, () => this._updatePreview());
      els.fitMode.addEventListener('change', () => this._scheduleRefresh());
    els.bgEnable.addEventListener('change', () => {
      const sel = this._getSelectedIndices();
      if (sel.length !== 1) return;
      this._pushUndo();
      const p = this.photos[sel[0]];
      p.bg = els.bgEnable.checked ? els.bgColor.value : null;
      this._scheduleRefresh();
      this._saveState();
    });
    els.bgColor.addEventListener('input', () => {
      const sel = this._getSelectedIndices();
      if (sel.length !== 1 || !els.bgEnable.checked) return;
      this.photos[sel[0]].bg = els.bgColor.value;
      this._scheduleRefresh();
    });
    els.bgColor.addEventListener('change', () => this._saveState());
    const bindBgSlide = (key, elsKey) => {
      let dragging = false;
      els[elsKey].addEventListener('input', () => {
        const sel = this._getSelectedIndices();
        if (sel.length !== 1 || !els.bgEnable.checked) return;
        if (!dragging) { this._pushUndo(); dragging = true; }
        this.photos[sel[0]][key] = parseFloat(els[elsKey].value);
        this._scheduleRefresh();
      });
      els[elsKey].addEventListener('change', () => { dragging = false; this._saveState(); });
    };
    bindBgSlide('bgTol', 'bgTol');
    bindBgSlide('bgFeather', 'bgFeather');
    });

    document.getElementById('btn-add').addEventListener('click', () => els.fileInput.click());
    els.fileInput.addEventListener('change', (e) => { this._addPhotos(e.target.files); e.target.value = ''; });
    document.getElementById('btn-remove').addEventListener('click', () => this._removePhotos());
    document.getElementById('btn-clear').addEventListener('click', () => this._clearAll());
    document.getElementById('btn-fill').addEventListener('click', () => this._fillAllSlots());
    document.getElementById('btn-export-png').addEventListener('click', () => this._exportPng());
    document.getElementById('btn-page-position').addEventListener('click', () => this._openPositionDialog());
    document.getElementById('btn-lang').addEventListener('click', () => this._toggleLang());
    document.getElementById('btn-orientation').addEventListener('click', () => this._toggleOrientation());
    document.getElementById('btn-print').addEventListener('click', () => this._printTemplate());
    document.getElementById('btn-save-preset').addEventListener('click', () => this._saveCurrentPresetAs());
    document.getElementById('btn-delete-preset').addEventListener('click', () => this._deletePreset());
    els.presetCombo.addEventListener('change', () => this._onPresetSelect());
    els.chkAutoFill.addEventListener('change', () => localStorage.setItem('template-photos-autofill', els.chkAutoFill.checked ? '1' : '0'));
    document.getElementById('btn-zoom-in').addEventListener('click', () => this._zoomIn());
    document.getElementById('btn-zoom-out').addEventListener('click', () => this._zoomOut());
    document.getElementById('btn-zoom-reset').addEventListener('click', () => this._zoomReset());
    document.getElementById('btn-page-prev').addEventListener('click', () => this._goToPage(this.currentPage - 1));
    document.getElementById('btn-page-next').addEventListener('click', () => this._goToPage(this.currentPage + 1));

    document.addEventListener('keydown', (e) => this._onKey(e));
    document.addEventListener('click', () => this._hideContextMenu());

    els.canvas.addEventListener('wheel', (e) => this._onZoomWheel(e), { passive: false });
    els.canvas.addEventListener('mousedown', (e) => { if (e.button === 1) this._panStart(e); });
    els.canvas.addEventListener('mousemove', (e) => this._panMove(e));
    els.canvas.addEventListener('mouseup', (e) => this._panEnd(e));
    els.canvas.addEventListener('mouseleave', (e) => this._panEnd(e));
    els.canvas.addEventListener('contextmenu', (e) => this._onCanvasContextMenu(e));
    els.canvas.addEventListener('click', (e) => this._onCanvasClick(e));
    window.addEventListener('resize', () => this._updatePreview());

    this._initDragDrop();
    this._initContextMenu();
  }

  _onKey(e) {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'v': e.preventDefault(); this._pasteFromClipboard(); break;
        case 'z': e.preventDefault(); if (e.shiftKey) this._redo(); else this._undo(); break;
        case 'y': e.preventDefault(); this._redo(); break;
        case 'a': e.preventDefault(); this._selectAll(); break;
        case 'd': e.preventDefault(); this._duplicateFast(); break;
      }
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (document.activeElement === document.body || document.activeElement === this.els.photoList) {
        this._removePhotos();
      }
    }
  }

  // ---- Drag & Drop ----
  _initDragDrop() {
    const container = this.els.listContainer;
    let dragCounter = 0;

    document.addEventListener('dragover', (e) => { e.preventDefault(); });
    document.addEventListener('drop', (e) => { e.preventDefault(); });

    this._initDropTarget(container);

    document.addEventListener('drop', (e) => {
      if (e.target !== container && !container.contains(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      this._handleDropFiles(e.dataTransfer);
    });
  }

  _initDropTarget(el) {
    let counter = 0;
    el.addEventListener('dragenter', () => { counter++; el.classList.add('drag-over'); });
    el.addEventListener('dragleave', () => {
      counter--;
      if (counter <= 0) { counter = 0; el.classList.remove('drag-over'); }
    });
    el.addEventListener('dragover', (e) => { e.preventDefault(); });

    el.addEventListener('drop', async (e) => {
      e.stopPropagation();
      e.preventDefault();
      counter = 0;
      el.classList.remove('drag-over');
      await this._handleDropFiles(e.dataTransfer);
    });
  }

  async _handleDropFiles(dt) {
    const files = [];

    try {
      if (dt.items && dt.items.length > 0) {
        for (const item of dt.items) {
          if (item.kind === 'file') {
            const f = item.getAsFile();
            if (f && f.size > 0) files.push(f);
          }
        }
      }
    } catch {}

    try {
      if (files.length === 0 && dt.files && dt.files.length > 0) {
        for (const f of dt.files) {
          if (f && f.size > 0) files.push(f);
        }
      }
    } catch {}

    if (files.length === 0) {
      this._updateStatus(this._t('st.noFile'));
      return;
    }

    const images = [];
    const archives = [];
    const unknown = [];

    for (const f of files) {
      const name = f.name || 'file';
      const ext = '.' + name.split('.').pop().toLowerCase();
      if (CLIP_EXTENSIONS.includes(ext) || (f.type && f.type.startsWith('image/'))) {
        images.push(f);
      } else if (ext === '.zip') {
        archives.push(f);
      } else {
        unknown.push(f);
      }
    }

    for (const f of unknown) {
      const isImg = await this._detectImageByMagic(f);
      if (isImg) {
        images.push(f);
      }
    }

    for (const z of archives) {
      await this._addFromZip(z);
    }
    if (images.length > 0) {
      this._addPhotos(images);
    }
    if (images.length === 0 && archives.length === 0) {
      this._updateStatus(this._t('st.noImgZip'));
    }
  }

  async _detectImageByMagic(file) {
    try {
      const buf = await file.slice(0, 16).arrayBuffer();
      const view = new Uint8Array(buf);
      if (view[0] === 0xFF && view[1] === 0xD8) return true;
      if (view[0] === 0x89 && view[1] === 0x50 && view[2] === 0x4E && view[3] === 0x47) return true;
      if (view[0] === 0x47 && view[1] === 0x49 && view[2] === 0x46) return true;
      if (view[0] === 0x42 && view[1] === 0x4D) return true;
      if (view[0] === 0x52 && view[1] === 0x49 && view[2] === 0x46 && view[3] === 0x46) return true;
      if (view[8] === 0x57 && view[9] === 0x45 && view[10] === 0x42 && view[11] === 0x50) return true;
      return false;
    } catch {
      return false;
    }
  }

  async _addFromZip(zipFile) {
    try {
      this._updateStatus(this._t('st.zipLoading'));
      const JSZipLib = await this._ensureJSZip();
      const arrayBuffer = await zipFile.arrayBuffer();
      const zip = await JSZipLib.loadAsync(arrayBuffer);
      const imageFiles = [];

      zip.forEach((relativePath, entry) => {
        if (!entry.dir) {
          const ext = '.' + relativePath.split('.').pop().toLowerCase();
          if (CLIP_EXTENSIONS.includes(ext)) {
            imageFiles.push({ name: relativePath.split('/').pop(), entry });
          }
        }
      });

      if (imageFiles.length === 0) {
        this._updateStatus(this._t('st.noImgInZip'));
        return;
      }

      this._pushUndo();
      for (const { name, entry } of imageFiles) {
        const blob = await entry.async('blob');
        const f = new File([blob], name, { type: blob.type });
        const w = parseFloat(this.els.photoWidth.value) || 4;
        const h = parseFloat(this.els.photoHeight.value) || 6;
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const entry = { id: Date.now() + '_' + Math.random(), name, file: f, dataUrl: e.target.result, img, width: w, height: h, rotation: 0, filter: 'none', position: 'as-doc' };
            this._autoRotateIfNeeded(entry);
            this.photos.push(entry);
            if (this.photos.length >= imageFiles.length) {
              this._rebuildListbox();
              this._refreshNow();
            }
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(blob);
      }
      this._rebuildListbox();
      this._updateStatus(imageFiles.length + this._t('st.extracted'));
    } catch (e) {
      this._updateStatus(this._t('st.zipFailed') + e.message);
    }
  }

  _ensureJSZip() {
    return new Promise((resolve, reject) => {
      if (window.JSZip) return resolve(window.JSZip);
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
      s.onload = () => resolve(window.JSZip);
      s.onerror = () => reject(new Error('jszip'));
      document.head.appendChild(s);
    });
  }

  // ---- Context menu ----
  _initContextMenu() {
    const menu = this.els.contextMenu;
    const actions = {
      'set-size': () => this._setSizeSelected(),
      'rotate-cw': () => this._rotateSelected(90),
      'rotate-ccw': () => this._rotateSelected(-90),
      'rotate-180': () => this._rotateSelected(180),
      'flip-h': () => this._flipSelected('horizontal'),
      'flip-v': () => this._flipSelected('vertical'),
      'flip-ratio': () => this._flipRatioSelected(),
      'duplicate': () => this._duplicateSelected(),
      'filter-none': () => this._setFilterSelected('none'),
      'filter-gray': () => this._setFilterSelected('gray'),
      'filter-bw': () => this._setFilterSelected('bw'),
    };
    menu.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._hideContextMenu();
        const action = actions[btn.dataset.action];
        if (action) action();
      });
    });
  }

  _showContextMenu(x, y) {
    const menu = this.els.contextMenu;
    // Tandai filter yang sedang aktif (jika semua foto terpilih memakai filter yang sama)
    const sel = this._getSelectedIndices();
    let active = null;
    if (sel.length > 0) {
      const first = this.photos[sel[0]].filter || 'none';
      if (sel.every(i => (this.photos[i].filter || 'none') === first)) active = first;
    }
    menu.querySelectorAll('button[data-action^="filter-"]').forEach(btn => {
      const isActive = active !== null && btn.dataset.action === 'filter-' + active;
      btn.textContent = isActive ? '\u2713 ' + btn.dataset.label : btn.dataset.label;
      btn.style.fontWeight = isActive ? '700' : '';
      btn.style.color = isActive ? '#93c5fd' : '';
    });
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    // Ukur ukuran asli dulu (tanpa menampilkan, biar nggak flicker)
    menu.style.visibility = 'hidden';
    menu.classList.remove('hidden');
    const mw = menu.offsetWidth;
    const mh = menu.offsetHeight;
    const GAP = 4;
    let left = x;
    let top = y;
    // Overflow ke bawah → buka ke atas; overflow ke kanan → buka ke kiri
    if (top + mh > window.innerHeight - GAP) top = Math.max(GAP, y - mh);
    if (left + mw > window.innerWidth - GAP) left = Math.max(GAP, x - mw);
    menu.style.left = left + 'px';
    menu.style.top = top + 'px';
    menu.style.visibility = 'visible';
  }

  _hideContextMenu() {
    this.els.contextMenu.classList.add('hidden');
  }

  // Klik kanan di canvas preview: seleksi foto yang diklik lalu tampilkan menu
  _onCanvasContextMenu(e) {
    e.preventDefault();
    const idx = this._hitTestPhoto(e);
    if (idx < 0) {
      this._hideContextMenu();
      return;
    }
    const list = this.els.photoList;
    list.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
    const item = list.querySelector('.photo-list-item[data-index="' + idx + '"]');
    if (item) item.classList.add('selected');
    this._updateSelectionInfo();
    this._showContextMenu(e.clientX, e.clientY);
  }

  // Klik kiri di canvas preview: foto yang diklik otomatis terpilih (sama seperti listbox)
  _onCanvasClick(e) {
    const idx = this._hitTestPhoto(e);
    if (idx < 0) return;
    const list = this.els.photoList;
    const item = list.querySelector('.photo-list-item[data-index="' + idx + '"]');
    if (!item) return;
    if (e.ctrlKey || e.metaKey) {
      item.classList.toggle('selected');
    } else if (e.shiftKey) {
      this._selectRange(idx);
    } else {
      list.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
      item.classList.add('selected');
    }
    this._updateSelectionInfo();
  }

  // Konversi koordinat klik → foto mana yang berada di posisi itu (mm)
  _hitTestPhoto(e) {
    const canvas = this.els.canvas;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const cw = rect.width;
    const ch = rect.height;
    const pad = 20;
    let scale = Math.min((cw - 2 * pad) / this._pageW(), (ch - 2 * pad) / this._pageH());
    scale *= this.zoomFactor;
    const a4_w = this._pageW() * scale;
    const a4_h = this._pageH() * scale;
    const ox = (cw - a4_w) / 2 + this.panX;
    const oy = (ch - a4_h) / 2 + this.panY;
    if (mx < ox || my < oy) return -1;
    const mmX = (mx - ox) / scale;
    const mmY = (my - oy) / scale;
    for (const [ry, rh, photos] of this.rowsData) {
      if (mmY < ry || mmY > ry + rh) continue;
      for (const [pi, px, pw, ph] of photos) {
        if (mmX >= px && mmX <= px + pw) return pi;
      }
    }
    return -1;
  }

  _setFilterSelected(type) {
    const sel = this._getSelectedIndices();
    if (sel.length === 0) return;
    this._pushUndo();
    sel.forEach(i => { this.photos[i].filter = type; });
    this._rebuildListbox();
    this._updatePreview();
    const label = type === 'none' ? 'Filter: Warna Normal' : type === 'gray' ? 'Filter: Grayscale' : 'Filter: Hitam & Putih';
    this._updateStatus(label);
    this._saveState();
  }

  // Terapkan filter grayscale / hitam-putih ke canvas (non-destructive, dari img asli)
  _applyFilter(img, type) {
    if (!type || type === 'none') return img;
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, c.width, c.height);
    const d = imageData.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      if (type === 'gray') {
        d[i] = d[i + 1] = d[i + 2] = v;
      } else if (type === 'bw') {
        // Hitam-putih dengan intensitas 25%: lembut, dominan abu asli
        const bw = v < 128 ? 0 : 255;
        const s = 0.25;
        d[i] = d[i + 1] = d[i + 2] = bw * s + v * (1 - s);
      }
    }
    ctx.putImageData(imageData, 0, 0);
    return c;
  }

  // ---- Photo management ----
  // Auto-rotate: jika orientasi gambar beda dengan orientasi slot (cm),
  // putar 90° biar foto langsung pas tanpa rotasi manual.
  _autoRotateIfNeeded(entry) {
    if (!this.autoRotate || !entry.img) return;
    const iw = entry.img.naturalWidth || entry.img.width;
    const ih = entry.img.naturalHeight || entry.img.height;
    if (!iw || !ih) return;
    const imgLandscape = iw > ih;
    const slotLandscape = entry.width > entry.height;
    if (imgLandscape !== slotLandscape && (entry.rotation || 0) % 180 === 0) {
      entry.rotation = 90;
    }
  }

  _addPhotos(fileList) {
    const files = Array.from(fileList).filter(f => {
      if (f.size === 0) return false;
      const ext = '.' + f.name.split('.').pop().toLowerCase();
      if (CLIP_EXTENSIONS.includes(ext)) return true;
      if (f.type && f.type.startsWith('image/')) return true;
      return false;
    });
    if (files.length === 0) return;

    this._pushUndo();
    let pending = files.length;
    let loaded = 0;

    files.forEach(f => {
      const name = f.name;
      const w = parseFloat(this.els.photoWidth.value) || 4;
      const h = parseFloat(this.els.photoHeight.value) || 6;

      const entry = { id: Date.now() + '_' + Math.random(), name, file: f, dataUrl: null, img: null, width: w, height: h, rotation: 0, filter: 'none', position: 'as-doc' };
      this.photos.push(entry);

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          entry.dataUrl = e.target.result;
          entry.img = img;
          this._autoRotateIfNeeded(entry);
          loaded++;
          if (loaded >= pending) {
            this._rebuildListbox();
            this._refreshNow();
            this._updateStatus(loaded + this._t('st.added'));
          }
        };
        img.onerror = () => {
          loaded++;
          if (loaded >= pending) {
            this._rebuildListbox();
            this._refreshNow();
            this._updateStatus(loaded + this._t('st.addedFailed') + (pending - loaded) + this._t('st.failed'));
          }
        };
        img.src = e.target.result;
      };
      reader.onerror = () => {
        loaded++;
        if (loaded >= pending) {
          this._rebuildListbox();
          this._refreshNow();
          this._updateStatus(loaded + this._t('st.addedFailed') + (pending - loaded) + this._t('st.failed'));
        }
      };
      reader.readAsDataURL(f);
    });

    this._rebuildListbox();
    this._refreshNow();
  }

  async _pasteFromClipboard() {
    try {
      let added = 0;

      if (navigator.clipboard && navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          for (const type of item.types) {
            if (type.startsWith('image/')) {
              const blob = await item.getType(type);
              const f = new File([blob], 'Clipboard.png', { type });
              const reader = new FileReader();
              await new Promise((resolve) => {
                reader.onload = (e) => {
                  const img = new Image();
                  img.onload = () => {
                    const w = parseFloat(this.els.photoWidth.value) || 4;
                    const h = parseFloat(this.els.photoHeight.value) || 6;
                    const entry = { id: Date.now() + '_' + Math.random(), name: 'Clipboard', file: f, dataUrl: e.target.result, img, width: w, height: h, rotation: 0, filter: 'none', position: 'as-doc' };
                    this._autoRotateIfNeeded(entry);
                    this.photos.push(entry);
                    added++;
                    resolve();
                  };
                  img.src = e.target.result;
                };
                reader.readAsDataURL(blob);
              });
            }
          }
        }
      }

      if (added > 0) {
        this._pushUndo();
        this._rebuildListbox();
        this._scheduleRefresh();
        this._updateStatus(added + this._t('st.addedClip'));
      } else {
        this._updateStatus(this._t('st.clipEmpty'));
      }
    } catch {
      this._updateStatus(this._t('st.clipFailed'));
    }
  }

  _removePhotos() {
    const selected = this._getSelectedIndices();
    if (selected.length === 0) return;
    this._pushUndo();
    selected.sort((a, b) => b - a).forEach(i => this.photos.splice(i, 1));
    this._rebuildListbox();
    this._scheduleRefresh();
    this._updateStatus(this.photos.length + this._t('st.remaining'));
  }

  _clearAll() {
    if (this.photos.length === 0) return;
    if (!confirm(this._t('cf.clearAll'))) return;
    this._pushUndo();
    this.photos = [];
    this._rebuildListbox();
    this._scheduleRefresh();
    this._updateStatus(this._t('st.cleared'));
  }

  _duplicateFast() {
    const sel = this._getSelectedIndices();
    if (sel.length === 0) return;
    this._pushUndo();
    let count = 0;
    const newSel = [];
    sel.sort((a, b) => b - a).forEach(i => {
      const p = this.photos[i];
      const copy = { ...p, id: Date.now() + '_' + Math.random(), name: p.name + ' *' };
      this.photos.splice(i + 1, 0, copy);
      newSel.push(i + 1);
      count++;
    });
    this._rebuildListbox();
    this._reselect(newSel);
    this._scheduleRefresh();
    this._updateStatus(count + this._t('st.duplicated'));
  }

  _duplicateSelected() {
    const sel = this._getSelectedIndices();
    if (sel.length === 0) return alert(this._t('al.selectFirst'));
    this._showDialog(this._t('dlg.duplicate'), (container) => {
      container.innerHTML = `
        <label>${this._t('dlg.copiesPer')}</label>
        <input type="number" id="dlg-num" value="1" min="1">
        <div class="dialog-buttons">
          <button class="btn btn-primary" id="dlg-ok">${this._t('dlg.ok')}</button>
          <button class="btn btn-secondary" id="dlg-cancel">${this._t('dlg.cancel')}</button>
        </div>`;
      const inp = container.querySelector('#dlg-num');
      container.querySelector('#dlg-ok').onclick = () => {
        const num = parseInt(inp.value);
        if (num < 1) return alert(this._t('al.min1copy'));
        this._pushUndo();
        let count = 0;
        const newSel = [];
        [...sel].sort((a, b) => b - a).forEach(idx => {
          const src = this.photos[idx];
          for (let i = 0; i < num; i++) {
            const copy = { ...src, id: Date.now() + '_' + Math.random(), name: src.name + ' #' + (this.photos.length + 1) };
            this.photos.splice(idx + 1, 0, copy);
            newSel.push(idx + 1 + i);
            count++;
          }
        });
        this._rebuildListbox();
        this._reselect(newSel);
        this._scheduleRefresh();
        this._updateStatus(count + this._t('st.copiesAdded'));
        this._hideDialog();
      };
      container.querySelector('#dlg-cancel').onclick = () => this._hideDialog();
      setTimeout(() => inp.focus(), 50);
    });
  }

  _fillAllSlots() {
    if (this.photos.length === 0) return alert(this._t('al.addPhoto1'));
    const sel = this._getSelectedIndices();
    if (sel.length === 0) return alert(this._t('al.selectFirst2'));

    const src = this.photos[sel[0]];
    const w_mm = src.width * 10;
    const h_mm = src.height * 10;
    const min_m = this._minMargin();

    if (w_mm > this._pageW() - 2 * min_m || h_mm > this._pageH() - 2 * min_m) {
      return alert(this._t('al.tooBigPage'));
    }

    let max_per_row = Math.floor((this._pageW() - 2 * min_m) / w_mm);
    while (max_per_row > 0 && (this._pageW() - max_per_row * w_mm) / 2 < min_m) max_per_row--;
    let max_rows = Math.floor((this._pageH() - 2 * min_m) / h_mm);
    while (max_rows > 0 && (this._pageH() - max_rows * h_mm) / 2 < min_m) max_rows--;

    const num = max_per_row * max_rows;
    if (num < 1) return alert(this._t('al.notFit'));

    this._pushUndo();
    this.photos = [];
    for (let i = 0; i < num; i++) {
      this.photos.push({ ...src, id: Date.now() + '_' + Math.random(), name: src.name + ' #' + (i + 1), position: 'as-doc' });
    }
    this._rebuildListbox();
    this._scheduleRefresh();
    this._updateStatus(this._t('st.sheet') + num + this._t('st.copies'));
  }

  _autoFillSlots() {
    if (this.photos.length === 0) return;
    const minMargin = this._minMargin();
    if (minMargin < 0) return;
    const A4_W = this._pageW();
    const A4_H = this._pageH();
    let capacity;
    if (this.tileGrid) {
      const [cols, rows] = this._tileColsRows();
      capacity = cols * rows;
    } else {
      const wmm = [];
      const hmm = [];
      const stp = [];
      for (let k = 0; k < 500; k++) {
        const src = this.photos[k % this.photos.length];
        wmm.push(src.width * 10);
        hmm.push(src.height * 10);
        stp.push(src.strip || 1);
      }
      const [, next_i] = this._packRows(wmm, hmm, 0, 500, A4_W, A4_H, minMargin, stp);
      capacity = next_i;
    }
    if (capacity < 1 || this.photos.length >= capacity) return;
    const originals = this.photos.slice();
    this._pushUndo();
    while (this.photos.length < capacity) {
      const src = originals[this.photos.length % originals.length];
      this.photos.push({ ...src, id: Date.now() + '_' + Math.random(), name: src.name + ' #' + (this.photos.length + 1), position: 'as-doc' });
    }
    this._rebuildListbox();
    this._scheduleRefresh();
    this._updateStatus(this._t('st.autoFilled') + this.photos.length + this._t('st.copies'));
  }

  _moveUp() {
    const sel = this._getSelectedIndices();
    if (sel.length === 0 || sel[0] === 0) return;
    this._pushUndo();
    sel.forEach(i => {
      if (i === 0) return;
      [this.photos[i], this.photos[i - 1]] = [this.photos[i - 1], this.photos[i]];
    });
    this._rebuildListbox();
    this._reselect(sel.map(i => Math.max(0, i - 1)));
    this._scheduleRefresh();
  }

  _moveDown() {
    const sel = this._getSelectedIndices();
    if (sel.length === 0 || sel[sel.length - 1] === this.photos.length - 1) return;
    this._pushUndo();
    const idx = [...sel].sort((a, b) => b - a);
    idx.forEach(i => {
      if (i === this.photos.length - 1) return;
      [this.photos[i], this.photos[i + 1]] = [this.photos[i + 1], this.photos[i]];
    });
    this._rebuildListbox();
    this._reselect(sel.map(i => Math.min(this.photos.length - 1, i + 1)));
    this._scheduleRefresh();
  }

  _movePhoto(fromIdx, toIdx) {
    if (fromIdx === toIdx) return;
    const sel = this._getSelectedIndices();
    const wasSel = sel.includes(fromIdx);
    this._pushUndo();
    const [moved] = this.photos.splice(fromIdx, 1);
    this.photos.splice(toIdx, 0, moved);
    this._rebuildListbox();
    if (wasSel) this._reselect([toIdx]);
    this._scheduleRefresh();
    this._updateStatus(this._t('st.reordered'));
  }

  _selectAll() {
    this.els.photoList.querySelectorAll('.photo-list-item').forEach(el => el.classList.add('selected'));
  }

  _rotateSelected(degrees) {
    const sel = this._getSelectedIndices();
    if (sel.length === 0) return;
    this._pushUndo();
    sel.forEach(i => { this.photos[i].rotation = (this.photos[i].rotation + degrees) % 360; });
    this._updatePreview();
    this._updateStatus(this._t('st.rotated') + degrees + '\u00B0');
    this._saveState();
  }

  _flipSelected(direction) {
    const sel = this._getSelectedIndices();
    if (sel.length === 0) return;
    this._pushUndo();
    sel.forEach(i => {
      const p = this.photos[i];
      const c = document.createElement('canvas');
      const img = p.img;
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext('2d');
      if (direction === 'horizontal') {
        ctx.scale(-1, 1);
        ctx.drawImage(img, -img.width, 0);
      } else {
        ctx.scale(1, -1);
        ctx.drawImage(img, 0, -img.height);
      }
      const dataUrl = c.toDataURL('image/png');
      p.img = c; // canvas hasil flip langsung dipakai (tanpa nunggu decode async)
      p.dataUrl = dataUrl;
      p.rev = (p.rev || 0) + 1; // invalidasi cache thumbnail di _preparePhoto
    });
    this._updatePreview();
    this._updateStatus(this._t('st.flipped') + direction);
    this._saveState();
  }

  _flipRatioSelected() {
    const sel = this._getSelectedIndices();
    if (sel.length === 0) return;
    this._pushUndo();
    sel.forEach(i => {
      const p = this.photos[i];
      [p.width, p.height] = [p.height, p.width];
      p.rotation = (p.rotation + 90) % 360;
    });
    this._rebuildListbox();
    this._reselect(sel);
    this._scheduleRefresh();
    this._updateStatus(this._t('st.ratioFlipped') + sel.length + this._t('st.ratioFlipped2'));
  }

  _setSizeSelected() {
    const sel = this._getSelectedIndices();
    if (sel.length === 0) return;
    const p = this.photos[sel[0]];
    this._showDialog(this._t('dlg.setSize'), (container) => {
      container.innerHTML = `
        <label>${this._t('width')} (cm):</label>
        <input type="number" id="dlg-w" value="${p.width}" step="0.1" min="0.5" max="30">
        <label>${this._t('height')} (cm):</label>
        <input type="number" id="dlg-h" value="${p.height}" step="0.1" min="0.5" max="30">
        <div class="dialog-buttons">
          <button class="btn btn-primary" id="dlg-ok">${this._t('dlg.ok')}</button>
          <button class="btn btn-secondary" id="dlg-cancel">${this._t('dlg.cancel')}</button>
        </div>`;
      const wInp = container.querySelector('#dlg-w');
      const hInp = container.querySelector('#dlg-h');
      container.querySelector('#dlg-ok').onclick = () => {
        const w = parseFloat(wInp.value);
        const h = parseFloat(hInp.value);
        if (w <= 0 || h <= 0) return alert(this._t('al.sizeZero'));
        if (w * 10 > this._pageW() || h * 10 > this._pageH()) return alert(this._t('al.biggerPage'));
        this._pushUndo();
        sel.forEach(i => { this.photos[i].width = w; this.photos[i].height = h; });
        this._rebuildListbox();
        this._reselect(sel);
        this._scheduleRefresh();
        this._hideDialog();
      };
      container.querySelector('#dlg-cancel').onclick = () => this._hideDialog();
      setTimeout(() => wInp.focus(), 50);
    });
  }

  // Posisi konten di dalam halaman (global, berlaku untuk SEMUA halaman)
  _openPositionDialog() {
    const current = this.position || 'as-doc';
    this._showDialog(this._t('dlg.pagePosition'), (container) => {
      const lang = this.lang;
      const posLabel = (key) => (POS_BTN[key] ? POS_BTN[key][lang] : key);
      container.innerHTML = `
        <p class="pos-hint">${this._t('pos.hint')}</p>
        <div class="pos-grid">
          <button type="button" class="pos-btn" data-pos="top-left">${posLabel('top-left')}</button>
          <button type="button" class="pos-btn" data-pos="top-center">${posLabel('top-center')}</button>
          <button type="button" class="pos-btn" data-pos="top-right">${posLabel('top-right')}</button>
          <button type="button" class="pos-btn" data-pos="left-center">${posLabel('left-center')}</button>
          <button type="button" class="pos-btn" data-pos="center">${posLabel('center')}</button>
          <button type="button" class="pos-btn" data-pos="right-center">${posLabel('right-center')}</button>
          <button type="button" class="pos-btn" data-pos="bottom-left">${posLabel('bottom-left')}</button>
          <button type="button" class="pos-btn" data-pos="bottom-center">${posLabel('bottom-center')}</button>
          <button type="button" class="pos-btn" data-pos="bottom-right">${posLabel('bottom-right')}</button>
        </div>
        <div class="pos-extra">
          <button type="button" class="btn btn-secondary pos-extra-btn" data-pos="as-doc">${this._t('pos.asDoc')}</button>
          <button type="button" class="btn btn-secondary pos-extra-btn" data-pos="fit-page">${this._t('pos.fitPage')}</button>
        </div>
        <div class="dialog-buttons">
          <button class="btn btn-secondary" id="dlg-cancel">${this._t('dlg.close')}</button>
        </div>`;
      container.querySelectorAll('.pos-btn, .pos-extra-btn').forEach(btn => {
        if (current === btn.dataset.pos) btn.classList.add('active');
        btn.addEventListener('click', () => this._setPagePosition(btn.dataset.pos));
      });
      container.querySelector('#dlg-cancel').onclick = () => this._hideDialog();
    });
  }

  _setPagePosition(pos) {
    this._pushUndo();
    this.position = pos;
    this._scheduleRefresh();
    this._updateStatus(this._t('st.position') + (POSITIONS[pos] || pos));
    this._saveState();
    this._hideDialog();
  }

  // Ganti orientasi halaman potret <-> lanskap
  _toggleOrientation() {
    this.orientation = this.orientation === 'landscape' ? 'portrait' : 'landscape';
    this.panX = 0;
    this.panY = 0;
    this.zoomFactor = 1;
    this._updateOrientationBtn();
    this._scheduleRefresh();
    this._saveState();
    this._updateStatus(this._t('st.orientation') + (this.orientation === 'landscape' ? this._t('landscape') + ' (297x210mm)' : this._t('portrait') + ' (210x297mm)'));
  }

  _updateOrientationBtn() {
    if (this.els.orientationBtn) {
      this.els.orientationBtn.textContent = this._t('orientation') + ': ' + (this.orientation === 'landscape' ? this._t('landscape') : this._t('portrait'));
    }
  }

  // Terapkan posisi global ke rowsData (satuan mm) + hitung margin atas/bawah
  _applyPagePosition(rowsData) {
    const A4_W = this._pageW(), A4_H = this._pageH();
    const minMargin = this._minMargin();
    if (!rowsData || rowsData.length === 0) return rowsData;

    // Geometri blok konten (koordinat sudah absolut di A4)
    let bl = Infinity, bt = Infinity, br = -Infinity, bb = -Infinity;
    for (const [y, rh, photos] of rowsData) {
      bt = Math.min(bt, y);
      bb = Math.max(bb, y + rh);
      for (const [, px, pw, ph] of photos) {
        bl = Math.min(bl, px);
        br = Math.max(br, px + pw);
      }
    }
    const blockW = br - bl, blockH = bb - bt;
    const m = minMargin;

    if (!this.position || this.position === 'as-doc') {
      this.marginTopMm = bt;
      this.marginBottomMm = A4_H - bb;
      return rowsData;
    }

    if (this.position === 'fit-page') {
      const S = Math.max(A4_W / blockW, A4_H / blockH);
      const dx = (A4_W - blockW * S) / 2 - bl * S;
      const dy = (A4_H - blockH * S) / 2 - bt * S;
      this.marginTopMm = bt * S + dy;
      this.marginBottomMm = A4_H - (bb * S + dy);
      return rowsData.map(([y, rh, photos]) => [
        y * S + dy, rh * S,
        photos.map(([pi, px, pw, ph]) => [pi, px * S + dx, pw * S, ph * S]),
      ]);
    }

    let dx = 0, dy = 0;
    switch (this.position) {
      case 'center': dx = A4_W / 2 - (bl + blockW / 2); dy = A4_H / 2 - (bt + blockH / 2); break;
      case 'top-center': dx = A4_W / 2 - (bl + blockW / 2); dy = m - bt; break;
      case 'left-center': dx = m - bl; dy = A4_H / 2 - (bt + blockH / 2); break;
      case 'right-center': dx = (A4_W - m - blockW) - bl; dy = A4_H / 2 - (bt + blockH / 2); break;
      case 'bottom-center': dx = A4_W / 2 - (bl + blockW / 2); dy = (A4_H - m - blockH) - bt; break;
      case 'top-left': dx = m - bl; dy = m - bt; break;
      case 'top-right': dx = (A4_W - m - blockW) - bl; dy = m - bt; break;
      case 'bottom-left': dx = m - bl; dy = (A4_H - m - blockH) - bt; break;
      case 'bottom-right': dx = (A4_W - m - blockW) - bl; dy = (A4_H - m - blockH) - bt; break;
    }
    this.marginTopMm = bt + dy;
    this.marginBottomMm = A4_H - (bb + dy);
    return rowsData.map(([y, rh, photos]) => [y + dy, rh, photos.map(([pi, px, pw, ph]) => [pi, px + dx, pw, ph])]);
  }

  _pushUndo() {
    this.undoStack.push({ position: this.position || 'as-doc', photos: this.photos.map(p => ({ ...p, img: p.img })) });
    if (this.undoStack.length > 50) this.undoStack.shift();
    this.redoStack = [];
  }

  _snapshot() {
    return { position: this.position || 'as-doc', photos: this.photos.map(p => ({ ...p, img: p.img })) };
  }

  _restoreSnapshot(data) {
    this.position = data.position || 'as-doc';
    this.photos = data.photos.map(d => {
      const img = new Image();
      img.src = d.dataUrl;
      return { ...d, img };
    });
    this._rebuildListbox();
    this._scheduleRefresh();
    this._saveState();
  }

  _undo() {
    if (this.undoStack.length === 0) return;
    this.redoStack.push(this._snapshot());
    if (this.redoStack.length > 50) this.redoStack.shift();
    this._restoreSnapshot(this.undoStack.pop());
    this._updateStatus(this._t('st.undo'));
  }

  _redo() {
    if (this.redoStack.length === 0) return;
    this.undoStack.push(this._snapshot());
    if (this.undoStack.length > 50) this.undoStack.shift();
    this._restoreSnapshot(this.redoStack.pop());
    this._updateStatus(this._t('st.redo'));
  }

  // ---- Listbox ----
  _rebuildListbox() {
    const list = this.els.photoList;
    list.innerHTML = '';
    this.photos.forEach((p, i) => {
      const item = document.createElement('div');
      item.className = 'photo-list-item';
      item.dataset.index = i;
      item.innerHTML = `<span class="drag-handle" title="${this._escapeHtml(this._t('dragHint'))}">&#8283;</span><span class="photo-name">${this._escapeHtml(p.name)}</span><span class="photo-size">${this._fmtSize(p.width, p.height)}</span>${p.filter === 'gray' ? '<span class="photo-filter-badge">GRAY</span>' : p.filter === 'bw' ? '<span class="photo-filter-badge bw">B&amp;W</span>' : ''}`;
      item.addEventListener('click', (e) => {
        if (e.ctrlKey || e.metaKey) {
          item.classList.toggle('selected');
        } else if (e.shiftKey) {
          this._selectRange(i);
        } else {
          list.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
          item.classList.add('selected');
        }
        this._updateSelectionInfo();
      });
      item.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (!item.classList.contains('selected')) {
          list.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
          item.classList.add('selected');
        }
        this._updateSelectionInfo();
        this._showContextMenu(e.clientX, e.clientY);
      });

      // Drag & drop urutan (pointer events: jalan di mouse & layar sentuh)
      const handle = item.querySelector('.drag-handle');
      let drag = null;
      handle.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        drag = { from: i, y: e.clientY, moved: false };
        try { handle.setPointerCapture(e.pointerId); } catch (err) {}
        item.classList.add('dragging');
        document.body.classList.add('drag-active');
      });
      handle.addEventListener('pointermove', (e) => {
        if (!drag) return;
        if (Math.abs(e.clientY - drag.y) > 5) drag.moved = true;
        const items = Array.from(list.children);
        let to = items.findIndex(el => e.clientY < el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2);
        if (to < 0) to = items.length - 1;
        drag.target = to;
        items.forEach((el, idx) => el.classList.toggle('drag-target', idx === to && idx !== drag.from));
      });
      const endDrag = (e) => {
        if (!drag) return;
        const { from, target, moved } = drag;
        drag = null;
        item.classList.remove('dragging');
        document.body.classList.remove('drag-active');
        list.querySelectorAll('.drag-target').forEach(el => el.classList.remove('drag-target'));
        if (!moved) return;
        if (target >= 0 && target !== from) this._movePhoto(from, target);
      };
      handle.addEventListener('pointerup', endDrag);
      handle.addEventListener('pointercancel', endDrag);
      handle.addEventListener('click', (e) => e.stopPropagation());
      list.appendChild(item);
    });
    this._updateListboxPlaceholder();
    this._saveState();
  }

  _selectRange(idx) {
    const list = this.els.photoList;
    const items = list.querySelectorAll('.photo-list-item');
    const selected = list.querySelectorAll('.selected');
    if (selected.length === 0) {
      items[idx].classList.add('selected');
      this._updateSelectionInfo();
      return;
    }
    const lastIdx = parseInt([...selected].pop().dataset.index);
    const [start, end] = lastIdx < idx ? [lastIdx, idx] : [idx, lastIdx];
    items.forEach((item, i) => {
      if (i >= start && i <= end) item.classList.add('selected');
    });
    this._updateSelectionInfo();
  }

  _getSelectedIndices() {
    return [...this.els.photoList.querySelectorAll('.photo-list-item.selected')].map(el => parseInt(el.dataset.index));
  }

  _reselect(indices) {
    const items = this.els.photoList.querySelectorAll('.photo-list-item');
    indices.forEach(i => {
      if (items[i]) items[i].classList.add('selected');
    });
    this._updateSelectionInfo();
  }

  _updateSelectionInfo() {
    const sel = this._getSelectedIndices();
    const single = sel.length === 1;
    this.els.bgControls.style.display = single ? '' : 'none';
    if (single) {
      const p = this.photos[sel[0]];
      this.els.bgEnable.checked = !!p.bg;
      this.els.bgColor.value = p.bg || '#e60000';
      this.els.bgTol.value = p.bgTol ?? 18;
      this.els.bgFeather.value = p.bgFeather ?? 1.5;
    }
    const info = this.els.infoLabel;
    if (sel.length > 0) {
      if (info.textContent.startsWith('\u2713')) return;
      info.textContent = '\u2713 ' + sel.length + this._t('info.selected');
    } else {
      if (info.textContent.startsWith('\u2713')) {
        if (this.photos.length === 0) info.textContent = this._t('noPhotos');
        else this._updatePreview();
      }
    }
  }

  _updateListboxPlaceholder() {
    this.els.listPlaceholder.style.display = this.photos.length === 0 ? 'flex' : 'none';
  }

  _updateStatus(msg) {
    this.els.statusText.textContent = msg;
  }

  _t(key) {
    const d = I18N[key];
    return d ? (d[this.lang] ?? d.id) : key;
  }

  _applyLang() {
    const lang = this.lang;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = this._t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = this._t(el.dataset.i18nHtml); });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = this._t(el.dataset.i18nPh); });
    document.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = this._t(el.dataset.i18nTitle); });
    if (this.els.btnLang) {
      this.els.btnLang.textContent = lang === 'id' ? 'EN' : 'ID';
      this.els.btnLang.title = this._t('lang.toggle');
    }
    this._refreshPresetCombo();
    this._updateOrientationBtn();
    this._updateInfoLabel();
    this._updateSelectionInfo();
    localStorage.setItem('template-photos-lang', lang);
  }

  _toggleLang() {
    this.lang = this.lang === 'id' ? 'en' : 'id';
    this._applyLang();
    this._scheduleRefresh();
  }

  _getBorderWidth(scale) {
    if (this.els.borderHairline.checked) return 1;
    const val = parseFloat(this.els.borderWidth.value);
    if (!val || val <= 0) return 1;
    return Math.max(1, Math.round(val * scale));
  }

  _updateInfoLabel() {
    if (this.photos.length === 0) {
      this.els.infoLabel.textContent = this._t('noPhotos');
      this.els.pageNav.classList.add('hidden');
      return;
    }
    if (this.rowsData.length === 0 || this.allPages.length === 0) {
      this.els.infoLabel.textContent = this._t('info.tooBig');
      this.els.pageNav.classList.add('hidden');
      return;
    }
    const totalPerSheet = this.rowsData.reduce((s, r) => s + r[2].reduce((a, [pi]) => a + (this.photos[pi].strip || 1), 0), 0);
    const posLabel = this.tileGrid
      ? this._t('info.tile') + this.tileGrid.replace('x', '×')
      : this._t('info.pos') + (POSITIONS[this.position] || this.position);
    this.els.infoLabel.textContent =
      this.rowsData.length + this._t('info.rows') + totalPerSheet + this._t('info.photos') + this.marginTopMm.toFixed(1) + this._t('info.bottom') + this.marginBottomMm.toFixed(1) + posLabel;
    if (this.allPages.length > 1) {
      this.els.pageNav.classList.remove('hidden');
      this.els.pageLabel.textContent = (this.currentPage + 1) + ' / ' + this.allPages.length;
    } else {
      this.els.pageNav.classList.add('hidden');
    }
  }

  // ---- Layout engine ----
  // Mode tile: halaman dibagi jadi grid N×M rata; tiap sel diisi 1 foto berurutan
  _buildTileRows(pageStart, pageEnd, a4_w, a4_h, minMargin) {
    const rowsData = [];
    const [cols, rows] = this._tileColsRows();
    const tileW = (a4_w - 2 * minMargin) / cols;
    const tileH = (a4_h - 2 * minMargin) / rows;
    let idx = pageStart;
    for (let r = 0; r < rows && idx < pageEnd; r++) {
      const photos = [];
      for (let c = 0; c < cols && idx < pageEnd; c++) {
        photos.push([idx, minMargin + c * tileW, tileW, tileH]);
        idx++;
      }
      if (photos.length > 0) rowsData.push([minMargin + r * tileH, tileH, photos]);
    }
    return rowsData;
  }

  _tileColsRows() {
    // tileGrid string = 'ROWS x COLS' (semantik user: Baris × Kolom)
    const [r, c] = (this.tileGrid || '1x1').split('x').map(Number);
    return [Math.max(1, c || 1), Math.max(1, r || 1)]; // return [cols, rows]
  }

  _syncTileUI() {
    const [cols, rows] = this._tileColsRows();
    const on = !!this.tileGrid;
    this.els.tileEnable.checked = on;
    this.els.tileRows.value = rows;
    this.els.tileCols.value = cols;
    this.els.tileRows.disabled = !on;
    this.els.tileCols.disabled = !on;
  }

  _packRows(w_mm, h_mm, start, end, a4_w, a4_h, minMargin, strips) {
    const rowsData = [];
    let idx = start;
    while (idx < end) {
      const ph = h_mm[idx];
      const st = strips ? (strips[idx] || 1) : 1;
      if (ph > a4_h - 2 * minMargin || ph <= 0) { idx += st; continue; }

      const photosInRow = [[idx, 0, w_mm[idx], ph]];
      let rowH = ph;
      let rowWSum = w_mm[idx];
      let next_i = idx + st;

      while (next_i < end) {
        const nh = h_mm[next_i];
        if (nh !== rowH) break;
        const nw = w_mm[next_i];
        if ((a4_w - (rowWSum + nw)) / 2 < minMargin) break;
        photosInRow.push([next_i, rowWSum, nw, nh]);
        rowWSum += nw;
        next_i += (strips ? (strips[next_i] || 1) : 1);
      }

      const marginX = (a4_w - rowWSum) / 2;
      if (marginX < minMargin) { idx = next_i; continue; }

      const y = rowsData.length > 0 ? rowsData[rowsData.length - 1][0] + rowsData[rowsData.length - 1][1] : 0;
      if (y + rowH > a4_h - minMargin) break;

      const adjusted = photosInRow.map(([pi, px, pw, phh]) => [pi, marginX + px, pw, phh]);
      rowsData.push([y, rowH, adjusted]);
      idx = next_i;
    }
    return [rowsData, idx];
  }

  _calculatePages() {
    const minMargin = this._minMargin();
    const A4_W = this._pageW();
    const A4_H = this._pageH();
    this.allPages = [];
    if (this.tileGrid) {
      // Mode tile: tiap halaman = cols × rows sel
      const [cols, rows] = this._tileColsRows();
      const perPage = cols * rows;
      for (let i = 0; i < this.photos.length; i += perPage) {
        this.allPages.push([i, Math.min(i + perPage, this.photos.length)]);
      }
      if (this.currentPage >= this.allPages.length) this.currentPage = Math.max(0, this.allPages.length - 1);
      return;
    }
    const w_mm_list = this.photos.map(p => p.width * 10);
    const h_mm_list = this.photos.map(p => p.height * 10);
    const strips = this.photos.map(p => p.strip || 1);
    let i = 0;
    while (i < this.photos.length) {
      const [, next_i] = this._packRows(w_mm_list, h_mm_list, i, this.photos.length, A4_W, A4_H, minMargin, strips);
      if (next_i === i) break;
      this.allPages.push([i, next_i]);
      i = next_i;
    }
    if (this.currentPage >= this.allPages.length) this.currentPage = Math.max(0, this.allPages.length - 1);
  }

  _calculateLayout() {
    const minMargin = this._minMargin();
    const marginAtas = this._marginAtas();
    if (minMargin < 0) { this.rowsData = []; return false; }

    const A4_W = this._pageW();
    const A4_H = this._pageH();

    this._calculatePages();

    if (this.photos.length === 0 || this.allPages.length === 0) {
      this.rowsData = [];
      this.marginTopMm = 0;
      this.marginBottomMm = 0;
      return false;
    }

    if (this.currentPage >= this.allPages.length) this.currentPage = this.allPages.length - 1;
    const [pageStart] = this.allPages[this.currentPage];

    if (pageStart >= this.photos.length) {
      this.currentPage = this.allPages.length - 1;
      return false;
    }

    if (this.tileGrid) {
      // Mode tile: sel tetap, abaikan posisi & marginAtas (pakai minMargin rata)
      const [cols, rows] = this._tileColsRows();
      const perPage = cols * rows;
      this.rowsData = this._buildTileRows(pageStart, Math.min(pageStart + perPage, this.photos.length), A4_W, A4_H, minMargin);
      this.marginTopMm = minMargin;
      this.marginBottomMm = minMargin;
      this._updateInfoLabel();
      return this.rowsData.length > 0;
    }

    const w_mm_list = this.photos.map(p => p.width * 10);
    const h_mm_list = this.photos.map(p => p.height * 10);
    const strips = this.photos.map(p => p.strip || 1);
    const [rowsData, _] = this._packRows(w_mm_list, h_mm_list, pageStart, this.photos.length, A4_W, A4_H, minMargin, strips);

    if (!rowsData || rowsData.length === 0) {
      this.rowsData = [];
      this.marginTopMm = 0;
      this.marginBottomMm = 0;
      return false;
    }

    let offsetY;
    if (marginAtas > 0) {
      offsetY = marginAtas;
      this.marginTopMm = marginAtas;
    } else {
      const totalH = rowsData[rowsData.length - 1][0] + rowsData[rowsData.length - 1][1];
      offsetY = (A4_H - totalH) / 2;
      if (offsetY < minMargin) offsetY = minMargin;
      this.marginTopMm = offsetY;
    }

    this.rowsData = this._applyPagePosition(rowsData.map(([y, rh, photos]) => [y + offsetY, rh, photos]));
    this._updateInfoLabel();
    return true;
  }

  _goToPage(page) {
    if (page < 0 || page >= this.allPages.length) return;
    this.currentPage = page;
    this._refreshNow();
  }

  _scheduleRefresh() {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(() => {
      this._refreshNow();
    }, 80);
  }

  _refreshNow() {
    this._calculateLayout();
    this._updatePreview();
  }

  // ---- Preview rendering ----
  _updatePreview() {
    const canvas = this.els.canvas;
    const parent = canvas.parentElement;
    const rect = parent.getBoundingClientRect();
    const cw = rect.width;
    const ch = rect.height;
    if (cw < 10 || ch < 10) {
      if (!this._resizeObs) {
        this._resizeObs = new ResizeObserver(() => { this._resizeObs.disconnect(); this._resizeObs = null; this._updatePreview(); });
        this._resizeObs.observe(parent);
      }
      return;
    }
    const dpr = window.devicePixelRatio || 1;
    canvas.width = cw * dpr;
    canvas.height = ch * dpr;
    canvas.style.width = cw + 'px';
    canvas.style.height = ch + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    if (!this._calculateLayout() || !this.rowsData.length) {
      this._drawCanvasPlaceholder(ctx, cw, ch);
      return;
    }

    const pad = 20;
    let scale = Math.min((cw - 2 * pad) / this._pageW(), (ch - 2 * pad) / this._pageH());
    scale *= this.zoomFactor;

    const a4_w = this._pageW() * scale;
    const a4_h = this._pageH() * scale;
    const ox = (cw - a4_w) / 2 + this.panX;
    const oy = (ch - a4_h) / 2 + this.panY;

    this.els.zoomLabel.textContent = Math.round(this.zoomFactor * 100) + '%';

    ctx.clearRect(0, 0, cw, ch);
    ctx.fillStyle = '#14181f';
    ctx.fillRect(0, 0, cw, ch);

    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#bbb';
    ctx.lineWidth = 2;
    ctx.fillRect(ox, oy, a4_w, a4_h);
    ctx.strokeRect(ox, oy, a4_w, a4_h);

    ctx.fillStyle = '#888';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('A4 (' + this._pageW() + 'x' + this._pageH() + 'mm)', ox + a4_w / 2, oy + a4_h + 16);

    const hasBorder = this.els.showBorder.checked;
    const hasCutlines = this.els.showCutlines.checked;
    const borderW = this._getBorderWidth(scale);

    // Clip ke area halaman: konten yang meluap (mis. Fit to Page) tidak menimpa margin preview
    ctx.save();
    ctx.beginPath();
    ctx.rect(ox, oy, a4_w, a4_h);
    ctx.clip();

    for (const [ry, rh, photos] of this.rowsData) {
      for (const [pi, px, pw, ph] of photos) {
        const x1 = ox + px * scale;
        const y1 = oy + ry * scale;
        const slotW = Math.max(1, Math.round(pw * scale));
        const slotH = Math.max(1, Math.round(rh * scale));

        try {
          const thumb = this._preparePhoto(pi, slotW, slotH, scale);
          ctx.drawImage(thumb, x1, y1, slotW, slotH);
        } catch {
          ctx.fillStyle = '#ddd';
          ctx.strokeStyle = '#aaa';
          ctx.lineWidth = 1;
          ctx.fillRect(x1, y1, slotW, slotH);
          ctx.strokeRect(x1, y1, slotW, slotH);
        }
      }
    }

    if (hasBorder) {
      ctx.strokeStyle = '#333';
      ctx.lineWidth = borderW;
      for (const [ry, rh, photos] of this.rowsData) {
        for (const [pi, px, pw, ph] of photos) {
          const x1 = ox + px * scale;
          const y1 = oy + ry * scale;
          const w = Math.max(1, Math.round(pw * scale));
          const hh = Math.max(1, Math.round(rh * scale));
          ctx.strokeRect(x1, y1, w, hh);
        }
      }
    }

    if (hasCutlines && this.rowsData.length > 0) {
      ctx.strokeStyle = '#333';
      ctx.lineWidth = borderW;
      for (const [ry, rh] of this.rowsData) {
        const y = oy + ry * scale;
        ctx.beginPath();
        ctx.moveTo(ox, y);
        ctx.lineTo(ox + a4_w, y);
        ctx.stroke();
      }
      const lastRow = this.rowsData[this.rowsData.length - 1];
      const yLast = oy + (lastRow[0] + lastRow[1]) * scale;
      ctx.beginPath();
      ctx.moveTo(ox, yLast);
      ctx.lineTo(ox + a4_w, yLast);
      ctx.stroke();

      // Mode tile: garis vertikal pemisah kolom
      if (this.tileGrid) {
        const [cols] = this._tileColsRows();
        const minM = this._minMargin();
        const tileW = (this._pageW() - 2 * minM) / cols;
        for (let c = 1; c < cols; c++) {
          const x = ox + (minM + c * tileW) * scale;
          ctx.beginPath();
          ctx.moveTo(x, oy);
          ctx.lineTo(x, oy + a4_h);
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  }

  _drawCanvasPlaceholder(ctx, cw, ch) {
    ctx.clearRect(0, 0, cw, ch);
    ctx.fillStyle = '#14181f';
    ctx.fillRect(0, 0, cw, ch);
    ctx.fillStyle = '#3a4a63';
    ctx.font = '36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u25A3', cw / 2, ch / 2 - 20);
    ctx.fillStyle = '#9ca3af';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(this._t('noPhotos'), cw / 2, ch / 2 + 22);
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';
    ctx.fillText(this._t('addPreviewHint'), cw / 2, ch / 2 + 42);
  }

  // ---- Zoom & Pan ----
  _zoomIn() {
    this.zoomFactor = Math.min(this.zoomFactor * 1.25, 8);
    this._resetPan();
    this._updatePreview();
  }
  _zoomOut() {
    this.zoomFactor = Math.max(this.zoomFactor / 1.25, 0.125);
    this._resetPan();
    this._updatePreview();
  }
  _zoomReset() {
    this.zoomFactor = 1;
    this._resetPan();
    this._updatePreview();
  }
  _resetPan() { this.panX = 0; this.panY = 0; }
  _panStart(e) {
    this.panning = true;
    this.panStartX = e.clientX;
    this.panStartY = e.clientY;
    this.els.canvas.style.cursor = 'grabbing';
  }
  _panMove(e) {
    if (!this.panning) return;
    this.panX += e.clientX - this.panStartX;
    this.panY += e.clientY - this.panStartY;
    this.panStartX = e.clientX;
    this.panStartY = e.clientY;
    this._updatePreview();
  }
  _panEnd() {
    this.panning = false;
    this.els.canvas.style.cursor = '';
  }
  _onZoomWheel(e) {
    e.preventDefault();
    if (e.deltaY < 0) this._zoomIn();
    else this._zoomOut();
  }

  // ---- Image processing ----
  _preparePhoto(idx, slotW, slotH, pxPerMm) {
    const p = this.photos[idx];

    // Cache hasil render per (foto, filter, ukuran slot, transform) — biar pan/zoom tetap mulus
    const isFitPage = this.position === 'fit-page';
    const showWB = this.els.showWhiteBorder.checked && !isFitPage;
    const wb_t = showWB ? Math.round((parseFloat(this.els.wbTop.value) || 0) * pxPerMm) : 0;
    const wb_b = showWB ? Math.round((parseFloat(this.els.wbBottom.value) || 0) * pxPerMm) : 0;
    const wb_l = showWB ? Math.round((parseFloat(this.els.wbLeft.value) || 0) * pxPerMm) : 0;
    const wb_r = showWB ? Math.round((parseFloat(this.els.wbRight.value) || 0) * pxPerMm) : 0;
    const N = p.strip || 1;
    const subIds = N > 1 ? this.photos.slice(idx, Math.min(idx + N, this.photos.length)).map(q => q.id + (q.rev || 0)).join(',') : '';
    const bgSig = this.photos.slice(idx, Math.min(idx + N, this.photos.length)).map(q => (q.bg || '0') + ':' + (q.bgTol ?? 18) + ':' + (q.bgFeather ?? 1.5)).join(',');
    const cacheKey = [p.id, p.rev || 0, p.filter || 'none', slotW, slotH, p.rotation,
      this.els.fitMode.value, showWB, wb_t, wb_b, wb_l, wb_r, this.position || 'as-doc', this.orientation || 'portrait', N, subIds, bgSig].join('|');
    if (this._filterCache.has(cacheKey)) return this._filterCache.get(cacheKey);

    const mode = isFitPage ? 'fill' : this.els.fitMode.value;

    const canvas = document.createElement('canvas');
    canvas.width = slotW;
    canvas.height = slotH;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, slotW, slotH);

    const photoWPx = (isFitPage || this.tileGrid) ? slotW : Math.round(p.width * 10 * pxPerMm);
    const photoHPx = (isFitPage || this.tileGrid) ? slotH : Math.round(p.height * 10 * pxPerMm);

    const innerW = Math.max(1, photoWPx - wb_l - wb_r);
    const innerH = Math.max(1, photoHPx - wb_t - wb_b);

    if (N > 1 && !isFitPage && !this.tileGrid) {
      const gap = Math.max(1, Math.round(1 * pxPerMm));
      const subH = Math.max(1, Math.round((innerH - (N - 1) * gap) / N));
      const subW = innerW;
      for (let j = 0; j < N; j++) {
        const srcIdx = Math.min(idx + j, this.photos.length - 1);
        const sp = this.photos[srcIdx];
        let sub = this._applyRotation(sp.img, sp.rotation);
        if (sp.bg) sub = this._replaceBackground(sub, sp.bg, sp.bgTol, sp.bgFeather);
        if (mode === 'fill') {
          sub = this._cropToAspect(sub, subW, subH);
          sub = this._resizeImage(sub, subW, subH);
        } else if (mode === 'fit') {
          sub = this._fitImage(sub, subW, subH);
        } else if (mode === 'stretch') {
          sub = this._resizeImage(sub, subW, subH);
        }
        sub = this._applyFilter(sub, sp.filter);
        const sx = wb_l + Math.round((subW - sub.width) / 2);
        const sy = wb_t + j * (subH + gap) + Math.round((subH - sub.height) / 2);
        ctx.drawImage(sub, sx, sy, sub.width, sub.height);
      }
    } else {
      let processed = this._applyRotation(p.img, p.rotation);
      if (p.bg) processed = this._replaceBackground(processed, p.bg, p.bgTol, p.bgFeather);
      if (mode === 'fill') {
        processed = this._cropToAspect(processed, innerW, innerH);
        processed = this._resizeImage(processed, innerW, innerH);
      } else if (mode === 'fit') {
        processed = this._fitImage(processed, innerW, innerH);
      } else if (mode === 'stretch') {
        processed = this._resizeImage(processed, innerW, innerH);
      }
      processed = this._applyFilter(processed, p.filter);
      const x = wb_l + Math.round((innerW - processed.width) / 2);
      const y = wb_t + Math.round((innerH - processed.height) / 2);
      ctx.drawImage(processed, x, y, processed.width, processed.height);
    }

    if (this._filterCache.size > 80) this._filterCache.clear();
    this._filterCache.set(cacheKey, canvas);

    return canvas;
  }

  _applyRotation(img, degrees) {
    if (degrees === 0) return img;
    const rad = degrees * Math.PI / 180;
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));
    const w = img.width;
    const h = img.height;
    const nw = Math.round(w * cos + h * sin);
    const nh = Math.round(w * sin + h * cos);
    const c = document.createElement('canvas');
    c.width = nw;
    c.height = nh;
    const ctx = c.getContext('2d');
    ctx.translate(nw / 2, nh / 2);
    ctx.rotate(rad);
    ctx.drawImage(img, -w / 2, -h / 2);
    return c;
  }

  _replaceBackground(img, hex, tolerance, feather) {
    const w = img.width, h = img.height;
    const src = document.createElement('canvas');
    src.width = w; src.height = h;
    const sctx = src.getContext('2d');
    sctx.drawImage(img, 0, 0);
    const id = sctx.getImageData(0, 0, w, h);
    const d = id.data;
    const cornerAvg = (cx, cy) => {
      let r = 0, g = 0, b = 0, n = 0;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const x = Math.min(w - 1, Math.max(0, cx + dx));
          const y = Math.min(h - 1, Math.max(0, cy + dy));
          const i = (y * w + x) * 4;
          r += d[i]; g += d[i + 1]; b += d[i + 2]; n++;
        }
      }
      return [r / n, g / n, b / n];
    };
    const c1 = cornerAvg(2, 2), c2 = cornerAvg(w - 3, 2), c3 = cornerAvg(2, h - 3), c4 = cornerAvg(w - 3, h - 3);
    const br = (c1[0] + c2[0] + c3[0] + c4[0]) / 4;
    const bg = (c1[1] + c2[1] + c3[1] + c4[1]) / 4;
    const bb = (c1[2] + c2[2] + c3[2] + c4[2]) / 4;
    const tol = (tolerance == null ? 18 : tolerance) * 2.55;
    const distToBg = (i) => Math.abs(d[i] - br) + Math.abs(d[i + 1] - bg) + Math.abs(d[i + 2] - bb);
    const visited = new Uint8Array(w * h);
    const stack = [];
    const pushEdge = (idx) => { if (!visited[idx]) { visited[idx] = 1; stack.push(idx); } };
    for (let x = 0; x < w; x++) { pushEdge(x); pushEdge((h - 1) * w + x); }
    for (let y = 0; y < h; y++) { pushEdge(y * w); pushEdge(y * w + w - 1); }
    while (stack.length) {
      const idx = stack.pop();
      const i = idx * 4;
      if (d[i + 3] < 128 || distToBg(i) > tol * 3) continue;
      d[i + 3] = 0;
      const x = idx % w, y = (idx / w) | 0;
      if (x > 0 && !visited[idx - 1]) { visited[idx - 1] = 1; stack.push(idx - 1); }
      if (x < w - 1 && !visited[idx + 1]) { visited[idx + 1] = 1; stack.push(idx + 1); }
      if (y > 0 && !visited[idx - w]) { visited[idx - w] = 1; stack.push(idx - w); }
      if (y < h - 1 && !visited[idx + w]) { visited[idx + w] = 1; stack.push(idx + w); }
    }
    const fr = Math.max(0, Math.min(6, feather == null ? 1.5 : feather));
    if (fr > 0) {
      const rad = Math.max(1, Math.round(fr));
      let A = new Float32Array(w * h);
      for (let i = 0; i < A.length; i++) A[i] = d[i * 4 + 3] / 255;
      for (let pass = 0; pass < 2; pass++) {
        const tmp = new Float32Array(w * h);
        for (let y = 0; y < h; y++) {
          const row = y * w;
          let sum = 0;
          for (let x = 0; x <= Math.min(rad, w - 1); x++) sum += A[row + x];
          for (let x = 0; x < w; x++) {
            const lo = Math.max(0, x - rad), hi = Math.min(w - 1, x + rad);
            tmp[row + x] = sum / (hi - lo + 1);
            if (x - rad >= 0) sum -= A[row + x - rad];
            if (x + rad + 1 < w) sum += A[row + x + rad + 1];
          }
        }
        for (let x = 0; x < w; x++) {
          let sum = 0;
          for (let y = 0; y <= Math.min(rad, h - 1); y++) sum += tmp[y * w + x];
          for (let y = 0; y < h; y++) {
            const lo = Math.max(0, y - rad), hi = Math.min(h - 1, y + rad);
            A[y * w + x] = sum / (hi - lo + 1);
            if (y - rad >= 0) sum -= tmp[(y - rad) * w + x];
            if (y + rad + 1 < h) sum += tmp[(y + rad + 1) * w + x];
          }
        }
      }
      for (let i = 0; i < A.length; i++) d[i * 4 + 3] = Math.round(A[i] * 255);
    }
    sctx.putImageData(id, 0, 0);
    const out = document.createElement('canvas');
    out.width = w; out.height = h;
    const octx = out.getContext('2d');
    octx.fillStyle = hex;
    octx.fillRect(0, 0, w, h);
    octx.drawImage(src, 0, 0);
    return out;
  }

  _cropToAspect(img, targetW, targetH) {
    const targetR = targetW / targetH;
    const imgR = img.width / img.height;
    let sx, sy, sw, sh;
    if (imgR > targetR) {
      sh = img.height;
      sw = Math.round(img.height * targetR);
      sx = Math.round((img.width - sw) / 2);
      sy = 0;
    } else {
      sw = img.width;
      sh = Math.round(img.width / targetR);
      sx = 0;
      sy = Math.round((img.height - sh) / 2);
    }
    const c = document.createElement('canvas');
    c.width = sw;
    c.height = sh;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    return c;
  }

  _resizeImage(img, w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, w, h);
    return c;
  }

  _fitImage(img, maxW, maxH) {
    const r = Math.min(maxW / img.width, maxH / img.height);
    const nw = Math.round(img.width * r);
    const nh = Math.round(img.height * r);
    return this._resizeImage(img, nw, nh);
  }

  // ---- Full-resolution export ----
  _renderPage(start) {
    const pxPerMm = DPI / 25.4;
    const a4W = Math.round(this._pageW() * pxPerMm);
    const a4H = Math.round(this._pageH() * pxPerMm);
    const A4_W = this._pageW();
    const A4_H = this._pageH();
    const minMargin = this._minMargin();

    let rowsData;
    if (this.tileGrid) {
      const [cols, rows] = this._tileColsRows();
      rowsData = this._buildTileRows(start, Math.min(start + cols * rows, this.photos.length), A4_W, A4_H, minMargin);
    } else {
      const w_mm_list = this.photos.map(p => p.width * 10);
      const h_mm_list = this.photos.map(p => p.height * 10);
      const strips = this.photos.map(p => p.strip || 1);
      const [rd, _] = this._packRows(w_mm_list, h_mm_list, start, this.photos.length, A4_W, A4_H, minMargin, strips);
      if (rd && rd.length > 0) {
        const marginAtas = this._marginAtas();
        let offsetY;
        if (marginAtas > 0) {
          offsetY = marginAtas;
        } else {
          const totalH = rd[rd.length - 1][0] + rd[rd.length - 1][1];
          offsetY = (A4_H - totalH) / 2;
          if (offsetY < minMargin) offsetY = minMargin;
        }
        rowsData = this._applyPagePosition(rd.map(([y, rh, phs]) => [y + offsetY, rh, phs]));
      } else {
        rowsData = [];
      }
    }
    if (!rowsData || rowsData.length === 0) {
      const c = document.createElement('canvas');
      c.width = a4W; c.height = a4H;
      return c;
    }

    const page = document.createElement('canvas');
    page.width = a4W;
    page.height = a4H;
    const ctx = page.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, a4W, a4H);

    for (const [ry, rh, photos] of rowsData) {
      for (const [pi, px, pw, ph] of photos) {
        const slotW = Math.max(1, Math.round(pw * pxPerMm));
        const slotH = Math.max(1, Math.round(rh * pxPerMm));
        const photoCanvas = this._preparePhoto(pi, slotW, slotH, pxPerMm);
        const x = Math.round(px * pxPerMm);
        const y = Math.round(ry * pxPerMm);
        ctx.drawImage(photoCanvas, x, y);
      }
    }

    const hasBorder = this.els.showBorder.checked;
    const hasCutlines = this.els.showCutlines.checked;

    if (hasBorder) {
      const bw = this._getBorderWidth(pxPerMm);
      ctx.strokeStyle = '#444';
      ctx.lineWidth = bw;
      for (const [ry, rh, photos] of rowsData) {
        for (const [pi, px, pw, ph] of photos) {
          const x1 = Math.round(px * pxPerMm);
          const y1 = Math.round(ry * pxPerMm);
          const x2 = x1 + Math.round(pw * pxPerMm) - 1;
          const y2 = y1 + Math.round(rh * pxPerMm) - 1;
          ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
        }
      }
    }

    if (hasCutlines && rowsData.length > 0) {
      const bw = this._getBorderWidth(pxPerMm);
      ctx.strokeStyle = '#444';
      ctx.lineWidth = bw;
      ctx.setLineDash([5, 3]);
      for (const [ry] of rowsData) {
        const y = Math.round(ry * pxPerMm);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(a4W, y);
        ctx.stroke();
      }
      const yLast = Math.round((rowsData[rowsData.length - 1][0] + rowsData[rowsData.length - 1][1]) * pxPerMm);
      ctx.beginPath();
      ctx.moveTo(0, yLast);
      ctx.lineTo(a4W, yLast);
      ctx.stroke();
      if (this.tileGrid) {
        const [cols] = this._tileColsRows();
        const tileW = (A4_W - 2 * minMargin) / cols;
        for (let c = 1; c < cols; c++) {
          const x = Math.round((minMargin + c * tileW) * pxPerMm);
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, a4H);
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);
    }

    return page;
  }

  async _exportPng() {
    if (this.photos.length === 0) return alert(this._t('al.addPhoto1'));

    this._calculatePages();
    if (this.allPages.length === 0) return alert(this._t('al.noFit'));

    this._updateStatus(this._t('st.processing') + this.allPages.length + this._t('st.pages'));

    for (let s = 0; s < this.allPages.length; s++) {
      const [start] = this.allPages[s];
      const page = this._renderPage(start);
      const blob = await new Promise(resolve => page.toBlob(resolve, 'image/png'));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template_' + (s + 1) + '.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this._updateStatus(this._t('st.pageDone') + (s + 1) + ' / ' + this.allPages.length + this._t('st.pageDone'));
      await this._delay(300);
    }

    this._updateStatus(this._t('st.done') + this.allPages.length + this._t('st.savedPages'));
  }

  async _printTemplate() {
    if (this.photos.length === 0) return alert(this._t('al.addPhoto1'));

    this._calculatePages();
    if (this.allPages.length === 0) return alert(this._t('al.noFit'));

    const images = this.allPages.map(([start]) => this._renderPage(start));
    const imgTags = images.map(c => `<img src="${c.toDataURL('image/png')}">`).join('');

    // Sesuaikan ukuran kertas cetak dengan orientasi (override CSS print statis)
    const orientStyle = document.createElement('style');
    orientStyle.id = 'print-orient-style';
    orientStyle.textContent = this.orientation === 'landscape'
      ? '@page { size: A4 landscape; margin: 0; } @media print { html, body { width: 297mm; height: 210mm; } #print-container img { width: 297mm; height: 210mm; } }'
      : '@page { size: A4 portrait; margin: 0; } @media print { html, body { width: 210mm; height: 297mm; } #print-container img { width: 210mm; height: 297mm; } }';
    document.head.appendChild(orientStyle);

    const container = document.createElement('div');
    container.id = 'print-container';
    container.innerHTML = imgTags;
    document.body.appendChild(container);

    // Tunggu gambar ter-decode dulu sebelum print — kalau tidak, cetakan
    // pertama kosong dan harus klik 2x baru keluar gambarnya.
    const imgs = Array.from(container.querySelectorAll('img'));
    await Promise.all(imgs.map(img => img.decode().catch(() => {})));

    window.print();

    document.body.removeChild(container);
    document.head.removeChild(orientStyle);
  }

  _saveState() {
    try {
      const data = this.photos.filter(p => p.dataUrl).map(p => ({
        id: p.id, name: p.name, dataUrl: p.dataUrl,
        width: p.width, height: p.height, rotation: p.rotation, filter: p.filter || 'none', strip: p.strip || 1,
        bg: p.bg || null, bgTol: p.bgTol ?? 18, bgFeather: p.bgFeather ?? 1.5,
      }));
      localStorage.setItem('a4-photos-state', JSON.stringify(data));
      localStorage.setItem('a4-photos-position', this.position || 'as-doc');
      localStorage.setItem('a4-photos-orientation', this.orientation || 'portrait');
      localStorage.setItem('a4-photos-autorotate', this.autoRotate ? '1' : '0');
      localStorage.setItem('a4-photos-tile', this.tileGrid || '');
    } catch (e) {
      if (e.name === 'QuotaExceededError') console.warn('localStorage penuh');
    }
  }

  _restoreState() {
    try {
      const raw = localStorage.getItem('a4-photos-state');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!Array.isArray(data) || data.length === 0) return;
      this.position = localStorage.getItem('a4-photos-position') || 'as-doc';
      this.orientation = localStorage.getItem('a4-photos-orientation') === 'landscape' ? 'landscape' : 'portrait';
      this.autoRotate = localStorage.getItem('a4-photos-autorotate') !== '0';
      const t = localStorage.getItem('a4-photos-tile');
      if (t && /^\d+x\d+$/.test(t)) {
        const [tc, tr] = t.split('x').map(Number);
        this.tileGrid = (tc >= 1 && tr >= 1) ? t : null;
      } else {
        this.tileGrid = null;
      }
      let loaded = 0;
      const total = data.filter(d => d.dataUrl).length;
      if (total === 0) return;
      for (const d of data) {
        if (!d.dataUrl) { loaded++; continue; }
        const img = new Image();
        const entry = { id: d.id, name: d.name, file: null, dataUrl: d.dataUrl, img, width: d.width, height: d.height, rotation: d.rotation || 0, filter: d.filter || 'none', strip: d.strip || 1, bg: d.bg || null, bgTol: d.bgTol ?? 18, bgFeather: d.bgFeather ?? 1.5 };
        this.photos.push(entry);
        const check = () => { loaded++; if (loaded >= total) { this._rebuildListbox(); this._refreshNow(); this._updateStatus(this.photos.length + this._t('st.restored')); } };
        img.onload = check;
        img.onerror = check;
        img.src = d.dataUrl;
      }
    } catch (e) { console.warn('Gagal memulihkan state:', e.message); }
  }

  _delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  // ---- Presets ----
  _loadPresets() {
    try {
      const data = localStorage.getItem('a4-template-builder-presets');
      this._userPresets = data ? JSON.parse(data) : [];
    } catch { this._userPresets = []; }
  }

  _savePresets() {
    localStorage.setItem('a4-template-builder-presets', JSON.stringify(this._userPresets));
  }

  _refreshPresetCombo() {
    const all = [...BUILTIN_PRESETS, ...this._userPresets];
    const combo = this.els.presetCombo;
    combo.innerHTML = '<option value="">' + this._escapeHtml(this._t('choosePreset')) + '</option>' +
      all.map(p => `<option value="${this._escapeHtml(p.name)}">${this._escapeHtml(p.name)}</option>`).join('');
    document.getElementById('btn-delete-preset').style.display = this._userPresets.length > 0 ? '' : 'none';
  }

  _onPresetSelect() {
    const name = this.els.presetCombo.value;
    if (!name) return;
    const all = [...BUILTIN_PRESETS, ...this._userPresets];
    const preset = all.find(p => p.name === name);
    if (preset) this._applyPreset(preset);
  }

  _applyPreset(data) {
    this.els.photoWidth.value = data.photo_w_cm;
    this.els.photoHeight.value = data.photo_h_cm;
    this.els.wbTop.value = data.wb_top_mm || 0;
    this.els.wbBottom.value = data.wb_bottom_mm || 0;
    this.els.wbLeft.value = data.wb_left_mm || 0;
    this.els.wbRight.value = data.wb_right_mm || 0;
    if (data.wb_top_mm || data.wb_bottom_mm || data.wb_left_mm || data.wb_right_mm) {
      this.els.showWhiteBorder.checked = true;
    }
    if (data.min_margin_mm !== undefined) this.els.minMargin.value = data.min_margin_mm;
    if (data.margin_atas_mm !== undefined) this.els.marginAtas.value = data.margin_atas_mm;
    this.photos.forEach(p => {
      p.width = data.photo_w_cm;
      p.height = data.photo_h_cm;
      p.strip = data.strip || 1;
    });
    this._scheduleRefresh();
    this._updateStatus(this._t('st.presetApplied') + data.name + this._t('st.appliedTail'));
    if (this.els.chkAutoFill.checked && this.photos.length > 0) this._autoFillSlots();
  }

  _saveCurrentPresetAs() {
    this._showDialog(this._t('dlg.savePreset'), (container) => {
      container.innerHTML = `
        <label>${this._t('dlg.presetName')}</label>
        <input type="text" id="dlg-name" placeholder="${this._t('dlg.presetPh')}">
        <div class="dialog-buttons">
          <button class="btn btn-primary" id="dlg-ok">${this._t('dlg.ok')}</button>
          <button class="btn btn-secondary" id="dlg-cancel">${this._t('dlg.cancel')}</button>
        </div>`;
      const inp = container.querySelector('#dlg-name');
      container.querySelector('#dlg-ok').onclick = () => {
        const name = inp.value.trim();
        if (!name) return alert(this._t('al.presetEmpty'));
        const all = [...BUILTIN_PRESETS, ...this._userPresets];
        const existing = all.find(p => p.name === name);
        if (existing) {
          if (!confirm(this._t('st.presetApplied') + name + this._t('al.overwrite'))) return;
          const idx = this._userPresets.findIndex(p => p.name === name);
          if (idx >= 0) this._userPresets.splice(idx, 1);
        }
        this._userPresets.push({
          name,
          photo_w_cm: parseFloat(this.els.photoWidth.value) || 4,
          photo_h_cm: parseFloat(this.els.photoHeight.value) || 6,
          wb_top_mm: parseFloat(this.els.wbTop.value) || 0,
          wb_bottom_mm: parseFloat(this.els.wbBottom.value) || 0,
          wb_left_mm: parseFloat(this.els.wbLeft.value) || 0,
          wb_right_mm: parseFloat(this.els.wbRight.value) || 0,
          min_margin_mm: parseFloat(this.els.minMargin.value) || 0,
          margin_atas_mm: parseFloat(this.els.marginAtas.value) || 0,
        });
        this._savePresets();
        this._refreshPresetCombo();
        this.els.presetCombo.value = name;
        this._hideDialog();
        this._updateStatus(this._t('st.presetApplied') + name + this._t('st.presetSaved'));
      };
      container.querySelector('#dlg-cancel').onclick = () => this._hideDialog();
      setTimeout(() => inp.focus(), 50);
    });
  }

  _deletePreset() {
    const name = this.els.presetCombo.value;
    if (!name) return;
    const idx = this._userPresets.findIndex(p => p.name === name);
    if (idx < 0) return alert(this._t('al.builtin'));
    if (!confirm(this._t('al.deletePreset') + name + this._t('al.deleteTail'))) return;
    this._userPresets.splice(idx, 1);
    this._savePresets();
    this._refreshPresetCombo();
    this.els.presetCombo.value = '';
    this._updateStatus(this._t('st.presetApplied') + name + this._t('st.presetDeleted'));
  }

  // ---- Dialogs ----
  _showDialog(title, buildFn) {
    const overlay = this.els.dialogOverlay;
    overlay.classList.remove('hidden');
    const content = this.els.dialogContent;
    content.innerHTML = '';
    buildFn(content);
    content.insertAdjacentHTML('afterbegin', `<h3>${this._escapeHtml(title)}</h3>`);
    const handler = (e) => { if (e.target === overlay) { this._hideDialog(); overlay.removeEventListener('click', handler); } };
    setTimeout(() => overlay.addEventListener('click', handler), 0);
  }

  _hideDialog() {
    this.els.dialogOverlay.classList.add('hidden');
  }

  // ---- Helpers ----
  _fmtSize(w, h) {
    const f = (v) => v === Math.round(v) ? String(Math.round(v)) : v.toFixed(1);
    return f(w) + '\u00D7' + f(h);
  }

  _escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }
}

// ---- Start ----
let app;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { app = new PhotoTemplateApp(); });
} else {
  app = new PhotoTemplateApp();
}

})();
