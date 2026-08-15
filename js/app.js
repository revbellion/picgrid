(function() {
'use strict';

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const DPI = 300;
const CLIP_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.bmp', '.gif', '.tiff', '.tif', '.webp', '.ico'];

const BUILTIN_PRESETS = [
  { name: 'Polaroid Classic', photo_w_cm: 7.0, photo_h_cm: 7.0, wb_top_mm: 10, wb_bottom_mm: 30, wb_left_mm: 8, wb_right_mm: 8 },
  { name: 'Polaroid Mini',   photo_w_cm: 4.6, photo_h_cm: 6.2, wb_top_mm: 8,  wb_bottom_mm: 20, wb_left_mm: 6, wb_right_mm: 6 },
  { name: '3R',              photo_w_cm: 8.9, photo_h_cm: 12.7, wb_top_mm: 0,  wb_bottom_mm: 0,  wb_left_mm: 0, wb_right_mm: 0 },
  { name: '4R',              photo_w_cm: 10.2, photo_h_cm: 15.2, wb_top_mm: 0,  wb_bottom_mm: 0,  wb_left_mm: 0, wb_right_mm: 0 },
  { name: '2R',              photo_w_cm: 6.4, photo_h_cm: 8.9, wb_top_mm: 0,  wb_bottom_mm: 0,  wb_left_mm: 0, wb_right_mm: 0 },
  { name: 'Pasfoto 2x3',    photo_w_cm: 2.0, photo_h_cm: 3.0, wb_top_mm: 1.5, wb_bottom_mm: 1.5, wb_left_mm: 1.5, wb_right_mm: 1.5 },
  { name: 'Pasfoto 3x4',    photo_w_cm: 3.0, photo_h_cm: 4.0, wb_top_mm: 1.5, wb_bottom_mm: 1.5, wb_left_mm: 1.5, wb_right_mm: 1.5 },
  { name: 'Pasfoto 4x6',    photo_w_cm: 4.0, photo_h_cm: 6.0, wb_top_mm: 1.5, wb_bottom_mm: 1.5, wb_left_mm: 1.5, wb_right_mm: 1.5 },
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

class PhotoTemplateApp {
  constructor() {
    this.photos = [];
    this.undoStack = [];
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
  }

  // Dimensi halaman (mm) sesuai orientasi: portrait 210x297, landscape 297x210
  _pageW() { return this.orientation === 'landscape' ? A4_HEIGHT_MM : A4_WIDTH_MM; }
  _pageH() { return this.orientation === 'landscape' ? A4_WIDTH_MM : A4_HEIGHT_MM; }

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
      autoRotate: $('auto-rotate'),
      tileEnable: $('tile-enable'),
      tileRows: $('tile-rows'),
      tileCols: $('tile-cols'),

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
    });

    document.getElementById('btn-add').addEventListener('click', () => els.fileInput.click());
    els.fileInput.addEventListener('change', (e) => { this._addPhotos(e.target.files); e.target.value = ''; });
    document.getElementById('btn-paste').addEventListener('click', () => this._pasteFromClipboard());
    document.getElementById('btn-remove').addEventListener('click', () => this._removePhotos());
    document.getElementById('btn-clear').addEventListener('click', () => this._clearAll());
    document.getElementById('btn-move-up').addEventListener('click', () => this._moveUp());
    document.getElementById('btn-move-down').addEventListener('click', () => this._moveDown());
    document.getElementById('btn-fill').addEventListener('click', () => this._fillAllSlots());
    document.getElementById('btn-export-png').addEventListener('click', () => this._exportPng());
    document.getElementById('btn-page-position').addEventListener('click', () => this._openPositionDialog());
    document.getElementById('btn-orientation').addEventListener('click', () => this._toggleOrientation());
    document.getElementById('btn-print').addEventListener('click', () => this._printTemplate());
    document.getElementById('btn-save-preset').addEventListener('click', () => this._saveCurrentPresetAs());
    document.getElementById('btn-delete-preset').addEventListener('click', () => this._deletePreset());
    els.presetCombo.addEventListener('change', () => this._onPresetSelect());
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
        case 'z': e.preventDefault(); this._undo(); break;
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
      this._updateStatus('Tidak ada file terdeteksi. Coba extract dulu atau gunakan tombol Tambah Foto.');
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
      this._updateStatus('Tidak ada file gambar atau ZIP. Coba extract dulu.');
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
      const arrayBuffer = await zipFile.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
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
        this._updateStatus('Tidak ada gambar ditemukan dalam ZIP');
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
      this._updateStatus(imageFiles.length + ' gambar diekstrak dari ZIP');
    } catch (e) {
      this._updateStatus('Gagal membaca ZIP: ' + e.message);
    }
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
            this._updateStatus(loaded + ' foto ditambahkan');
          }
        };
        img.onerror = () => {
          loaded++;
          if (loaded >= pending) {
            this._rebuildListbox();
            this._refreshNow();
            this._updateStatus(loaded + ' foto ditambahkan (' + (pending - loaded) + ' gagal)');
          }
        };
        img.src = e.target.result;
      };
      reader.onerror = () => {
        loaded++;
        if (loaded >= pending) {
          this._rebuildListbox();
          this._refreshNow();
          this._updateStatus(loaded + ' foto ditambahkan (' + (pending - loaded) + ' gagal)');
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
        this._updateStatus(added + ' foto ditambahkan dari clipboard');
      } else {
        this._updateStatus('Clipboard tidak berisi gambar');
      }
    } catch {
      this._updateStatus('Gagal membaca clipboard');
    }
  }

  _removePhotos() {
    const selected = this._getSelectedIndices();
    if (selected.length === 0) return;
    this._pushUndo();
    selected.sort((a, b) => b - a).forEach(i => this.photos.splice(i, 1));
    this._rebuildListbox();
    this._scheduleRefresh();
    this._updateStatus(this.photos.length + ' foto tersisa');
  }

  _clearAll() {
    if (this.photos.length === 0) return;
    if (!confirm('Hapus semua foto?')) return;
    this._pushUndo();
    this.photos = [];
    this._rebuildListbox();
    this._scheduleRefresh();
    this._updateStatus('Semua foto dihapus');
  }

  _duplicateFast() {
    const sel = this._getSelectedIndices();
    if (sel.length === 0) return;
    this._pushUndo();
    let count = 0;
    sel.sort((a, b) => b - a).forEach(i => {
      const p = this.photos[i];
      const copy = { ...p, id: Date.now() + '_' + Math.random(), name: p.name + ' *' };
      this.photos.splice(i + 1, 0, copy);
      count++;
    });
    this._rebuildListbox();
    this._scheduleRefresh();
    this._updateStatus(count + ' foto diduplikat');
  }

  _duplicateSelected() {
    const sel = this._getSelectedIndices();
    if (sel.length === 0) return alert('Pilih foto yang ingin diduplikat');
    this._showDialog('Duplikat', (container) => {
      container.innerHTML = `
        <label>Jumlah copy per foto:</label>
        <input type="number" id="dlg-num" value="1" min="1">
        <div class="dialog-buttons">
          <button class="btn btn-primary" id="dlg-ok">OK</button>
          <button class="btn btn-secondary" id="dlg-cancel">Batal</button>
        </div>`;
      const inp = container.querySelector('#dlg-num');
      container.querySelector('#dlg-ok').onclick = () => {
        const num = parseInt(inp.value);
        if (num < 1) return alert('Minimal 1 copy');
        this._pushUndo();
        let count = 0;
        [...sel].sort((a, b) => b - a).forEach(idx => {
          const src = this.photos[idx];
          for (let i = 0; i < num; i++) {
            const copy = { ...src, id: Date.now() + '_' + Math.random(), name: src.name + ' #' + (this.photos.length + 1) };
            this.photos.splice(idx + 1, 0, copy);
            count++;
          }
        });
        this._rebuildListbox();
        this._scheduleRefresh();
        this._updateStatus(count + ' copy ditambahkan');
        this._hideDialog();
      };
      container.querySelector('#dlg-cancel').onclick = () => this._hideDialog();
      setTimeout(() => inp.focus(), 50);
    });
  }

  _fillAllSlots() {
    if (this.photos.length === 0) return alert('Tambahkan minimal 1 foto');
    const sel = this._getSelectedIndices();
    if (sel.length === 0) return alert('Pilih foto yang ingin diduplikat di daftar');

    const src = this.photos[sel[0]];
    const w_mm = src.width * 10;
    const h_mm = src.height * 10;
    const min_m = parseFloat(this.els.minMargin.value) || 5;

    if (w_mm > this._pageW() - 2 * min_m || h_mm > this._pageH() - 2 * min_m) {
      return alert('Ukuran foto terlalu besar untuk halaman');
    }

    let max_per_row = Math.floor((this._pageW() - 2 * min_m) / w_mm);
    while (max_per_row > 0 && (this._pageW() - max_per_row * w_mm) / 2 < min_m) max_per_row--;
    let max_rows = Math.floor((this._pageH() - 2 * min_m) / h_mm);
    while (max_rows > 0 && (this._pageH() - max_rows * h_mm) / 2 < min_m) max_rows--;

    const num = max_per_row * max_rows;
    if (num < 1) return alert('Foto tidak cukup muat');

    this._pushUndo();
    this.photos = [];
    for (let i = 0; i < num; i++) {
      this.photos.push({ ...src, id: Date.now() + '_' + Math.random(), name: src.name + ' #' + (i + 1), position: 'as-doc' });
    }
    this._rebuildListbox();
    this._scheduleRefresh();
    this._updateStatus('1 lembar (' + num + ' copy)');
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
    this._updateStatus('Urutan foto diubah');
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
    this._updateStatus('Rotasi ' + degrees + '\u00B0');
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
    this._updateStatus('Flip ' + direction);
    this._saveState();
  }

  _flipRatioSelected() {
    const sel = this._getSelectedIndices();
    if (sel.length === 0) return;
    this._pushUndo();
    sel.forEach(i => {
      const p = this.photos[i];
      [p.width, p.height] = [p.height, p.width];
    });
    this._rebuildListbox();
    this._reselect(sel);
    this._scheduleRefresh();
    this._updateStatus('Rasio ' + sel.length + ' foto dibalik');
  }

  _setSizeSelected() {
    const sel = this._getSelectedIndices();
    if (sel.length === 0) return;
    const p = this.photos[sel[0]];
    this._showDialog('Set Ukuran Foto', (container) => {
      container.innerHTML = `
        <label>Lebar (cm):</label>
        <input type="number" id="dlg-w" value="${p.width}" step="0.1" min="0.5" max="30">
        <label>Tinggi (cm):</label>
        <input type="number" id="dlg-h" value="${p.height}" step="0.1" min="0.5" max="30">
        <div class="dialog-buttons">
          <button class="btn btn-primary" id="dlg-ok">OK</button>
          <button class="btn btn-secondary" id="dlg-cancel">Batal</button>
        </div>`;
      const wInp = container.querySelector('#dlg-w');
      const hInp = container.querySelector('#dlg-h');
      container.querySelector('#dlg-ok').onclick = () => {
        const w = parseFloat(wInp.value);
        const h = parseFloat(hInp.value);
        if (w <= 0 || h <= 0) return alert('Ukuran harus > 0');
        if (w * 10 > this._pageW() || h * 10 > this._pageH()) return alert('Foto lebih besar dari halaman');
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
    this._showDialog('Posisi Halaman', (container) => {
      container.innerHTML = `
        <p class="pos-hint">Atur posisi blok foto di dalam halaman. Berlaku untuk semua halaman. Pilih "As in Document" untuk kembali ke susunan otomatis (mulai dari margin atas).</p>
        <div class="pos-grid">
          <button type="button" class="pos-btn" data-pos="top-left">Atas Kiri</button>
          <button type="button" class="pos-btn" data-pos="top-center">Atas Tengah</button>
          <button type="button" class="pos-btn" data-pos="top-right">Atas Kanan</button>
          <button type="button" class="pos-btn" data-pos="left-center">Kiri Tengah</button>
          <button type="button" class="pos-btn" data-pos="center">Tengah</button>
          <button type="button" class="pos-btn" data-pos="right-center">Kanan Tengah</button>
          <button type="button" class="pos-btn" data-pos="bottom-left">Bawah Kiri</button>
          <button type="button" class="pos-btn" data-pos="bottom-center">Bawah Tengah</button>
          <button type="button" class="pos-btn" data-pos="bottom-right">Bawah Kanan</button>
        </div>
        <div class="pos-extra">
          <button type="button" class="btn btn-secondary pos-extra-btn" data-pos="as-doc">As in Document (otomatis)</button>
          <button type="button" class="btn btn-secondary pos-extra-btn" data-pos="fit-page">Fit to Page (isi penuh 1 halaman)</button>
        </div>
        <div class="dialog-buttons">
          <button class="btn btn-secondary" id="dlg-cancel">Tutup</button>
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
    this._updateStatus('Posisi: ' + (POSITIONS[pos] || pos));
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
    this._updateStatus('Orientasi: ' + (this.orientation === 'landscape' ? 'Lanskap (297x210mm)' : 'Potret (210x297mm)'));
  }

  _updateOrientationBtn() {
    if (this.els.orientationBtn) {
      this.els.orientationBtn.textContent = 'Orientasi: ' + (this.orientation === 'landscape' ? 'Lanskap' : 'Potret');
    }
  }

  // Terapkan posisi global ke rowsData (satuan mm) + hitung margin atas/bawah
  _applyPagePosition(rowsData) {
    const A4_W = this._pageW(), A4_H = this._pageH();
    const minMargin = parseFloat(this.els.minMargin.value) || 5;
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
  }

  _undo() {
    if (this.undoStack.length === 0) return;
    const data = this.undoStack.pop();
    this.position = data.position || 'as-doc';
    this.photos = data.photos.map(d => {
      const img = new Image();
      img.src = d.dataUrl;
      return { ...d, img };
    });
    this._rebuildListbox();
    this._scheduleRefresh();
    this._saveState();
    this._updateStatus('Undo');
  }

  // ---- Listbox ----
  _rebuildListbox() {
    const list = this.els.photoList;
    list.innerHTML = '';
    this.photos.forEach((p, i) => {
      const item = document.createElement('div');
      item.className = 'photo-list-item';
      item.dataset.index = i;
      item.innerHTML = `<span class="drag-handle" title="Geser untuk urutkan">&#8283;</span><span class="photo-name">${this._escapeHtml(p.name)}</span><span class="photo-size">${this._fmtSize(p.width, p.height)}</span>${p.filter === 'gray' ? '<span class="photo-filter-badge">GRAY</span>' : p.filter === 'bw' ? '<span class="photo-filter-badge bw">B&amp;W</span>' : ''}`;
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
    const info = this.els.infoLabel;
    if (sel.length > 0) {
      if (info.textContent.startsWith('\u2713')) return;
      info.textContent = '\u2713 ' + sel.length + ' terpilih';
    } else {
      if (info.textContent.startsWith('\u2713')) {
        if (this.photos.length === 0) info.textContent = 'Belum ada foto';
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

  _getBorderWidth(scale) {
    if (this.els.borderHairline.checked) return 1;
    const val = parseFloat(this.els.borderWidth.value);
    if (!val || val <= 0) return 1;
    return Math.max(1, Math.round(val * scale));
  }

  _updateInfoLabel() {
    if (this.photos.length === 0) {
      this.els.infoLabel.textContent = 'Belum ada foto';
      this.els.pageNav.classList.add('hidden');
      return;
    }
    if (this.rowsData.length === 0 || this.allPages.length === 0) {
      this.els.infoLabel.textContent = 'Foto tidak cukup muat di A4';
      this.els.pageNav.classList.add('hidden');
      return;
    }
    const totalPerSheet = this.rowsData.reduce((s, r) => s + r[2].length, 0);
    const posLabel = this.tileGrid
      ? 'Tile: ' + this.tileGrid.replace('x', '×')
      : 'Posisi: ' + (POSITIONS[this.position] || this.position);
    this.els.infoLabel.textContent =
      `${this.rowsData.length} baris, ${totalPerSheet} foto  |  Atas: ${this.marginTopMm.toFixed(1)}mm  |  Bawah: ${this.marginBottomMm.toFixed(1)}mm  |  ${posLabel}`;
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

  _packRows(w_mm, h_mm, start, end, a4_w, a4_h, minMargin) {
    const rowsData = [];
    let idx = start;
    while (idx < end) {
      const ph = h_mm[idx];
      if (ph > a4_h - 2 * minMargin || ph <= 0) { idx++; continue; }

      const photosInRow = [[idx, 0, w_mm[idx], ph]];
      let rowH = ph;
      let rowWSum = w_mm[idx];
      let next_i = idx + 1;

      while (next_i < end) {
        const nh = h_mm[next_i];
        if (nh !== rowH) break;
        const nw = w_mm[next_i];
        if ((a4_w - (rowWSum + nw)) / 2 < minMargin) break;
        photosInRow.push([next_i, rowWSum, nw, nh]);
        rowWSum += nw;
        next_i++;
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
    const minMargin = parseFloat(this.els.minMargin.value) || 5;
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
    let i = 0;
    while (i < this.photos.length) {
      const [, next_i] = this._packRows(w_mm_list, h_mm_list, i, this.photos.length, A4_W, A4_H, minMargin);
      if (next_i === i) break;
      this.allPages.push([i, next_i]);
      i = next_i;
    }
    if (this.currentPage >= this.allPages.length) this.currentPage = Math.max(0, this.allPages.length - 1);
  }

  _calculateLayout() {
    const minMargin = parseFloat(this.els.minMargin.value) || 5;
    const marginAtas = parseFloat(this.els.marginAtas.value) || 6;
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
    const [rowsData, _] = this._packRows(w_mm_list, h_mm_list, pageStart, this.photos.length, A4_W, A4_H, minMargin);

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
        const minM = parseFloat(this.els.minMargin.value) || 5;
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
    ctx.fillText('Belum ada foto', cw / 2, ch / 2 + 22);
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';
    ctx.fillText('Tambahkan foto untuk melihat preview', cw / 2, ch / 2 + 42);
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
    const cacheKey = [p.id, p.rev || 0, p.filter || 'none', slotW, slotH, p.rotation,
      this.els.fitMode.value, showWB, wb_t, wb_b, wb_l, wb_r, this.position || 'as-doc', this.orientation || 'portrait'].join('|');
    if (this._filterCache.has(cacheKey)) return this._filterCache.get(cacheKey);

    let img = p.img;

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

    let processed = this._applyRotation(img, p.rotation);

    const mode = isFitPage ? 'fill' : this.els.fitMode.value;
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
    const minMargin = parseFloat(this.els.minMargin.value) || 5;

    let rowsData;
    if (this.tileGrid) {
      const [cols, rows] = this._tileColsRows();
      rowsData = this._buildTileRows(start, Math.min(start + cols * rows, this.photos.length), A4_W, A4_H, minMargin);
    } else {
      const w_mm_list = this.photos.map(p => p.width * 10);
      const h_mm_list = this.photos.map(p => p.height * 10);
      const [rd, _] = this._packRows(w_mm_list, h_mm_list, start, this.photos.length, A4_W, A4_H, minMargin);
      if (rd && rd.length > 0) {
        const marginAtas = parseFloat(this.els.marginAtas.value) || 6;
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
    if (this.photos.length === 0) return alert('Tambahkan minimal 1 foto');

    this._calculatePages();
    if (this.allPages.length === 0) return alert('Tidak ada foto yang muat');

    this._updateStatus('Memproses ' + this.allPages.length + ' halaman...');

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
      this._updateStatus('Halaman ' + (s + 1) + ' dari ' + this.allPages.length + ' selesai');
      await this._delay(300);
    }

    this._updateStatus('Selesai! ' + this.allPages.length + ' halaman tersimpan');
  }

  async _printTemplate() {
    if (this.photos.length === 0) return alert('Tambahkan minimal 1 foto');

    this._calculatePages();
    if (this.allPages.length === 0) return alert('Tidak ada foto yang muat');

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
        width: p.width, height: p.height, rotation: p.rotation, filter: p.filter || 'none',
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
        const entry = { id: d.id, name: d.name, file: null, dataUrl: d.dataUrl, img, width: d.width, height: d.height, rotation: d.rotation || 0, filter: d.filter || 'none' };
        this.photos.push(entry);
        const check = () => { loaded++; if (loaded >= total) { this._rebuildListbox(); this._refreshNow(); this._updateStatus(this.photos.length + ' foto dipulihkan'); } };
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
    combo.innerHTML = '<option value="">-- Pilih Preset --</option>' +
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
    this.photos.forEach(p => {
      p.width = data.photo_w_cm;
      p.height = data.photo_h_cm;
    });
    this._scheduleRefresh();
    this._updateStatus('Preset \'' + data.name + '\' diterapkan');
  }

  _saveCurrentPresetAs() {
    this._showDialog('Simpan Preset', (container) => {
      container.innerHTML = `
        <label>Nama Preset:</label>
        <input type="text" id="dlg-name" placeholder="Nama preset...">
        <div class="dialog-buttons">
          <button class="btn btn-primary" id="dlg-ok">OK</button>
          <button class="btn btn-secondary" id="dlg-cancel">Batal</button>
        </div>`;
      const inp = container.querySelector('#dlg-name');
      container.querySelector('#dlg-ok').onclick = () => {
        const name = inp.value.trim();
        if (!name) return alert('Nama preset tidak boleh kosong');
        const all = [...BUILTIN_PRESETS, ...this._userPresets];
        const existing = all.find(p => p.name === name);
        if (existing) {
          if (!confirm('Preset \'' + name + '\' sudah ada. Timpa?')) return;
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
        });
        this._savePresets();
        this._refreshPresetCombo();
        this.els.presetCombo.value = name;
        this._hideDialog();
        this._updateStatus('Preset \'' + name + '\' tersimpan');
      };
      container.querySelector('#dlg-cancel').onclick = () => this._hideDialog();
      setTimeout(() => inp.focus(), 50);
    });
  }

  _deletePreset() {
    const name = this.els.presetCombo.value;
    if (!name) return;
    const idx = this._userPresets.findIndex(p => p.name === name);
    if (idx < 0) return alert('Preset bawaan tidak bisa dihapus');
    if (!confirm('Hapus preset "' + name + '"?')) return;
    this._userPresets.splice(idx, 1);
    this._savePresets();
    this._refreshPresetCombo();
    this.els.presetCombo.value = '';
    this._updateStatus('Preset \'' + name + '\' dihapus');
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
