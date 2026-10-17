/* IconLi admin — vector icon editor (v2: simple, pixel-friendly).
 * Layered mode: shapes carry a role (Shape / Cut-out / Line / Gap) and outline, solid and duotone are generated.
 * Raw mode: Signature originals, edited per style with their exact paint.
 * UX patterns: resize/rotate box, X/Y/W/H fields, pixel snapping + point snapping with guides, zoom & pan,
 * big handles, double-click to edit points, Alt-drag to duplicate, Alt-click to delete a point.
 */
(function () {
  const P = window.IconPath, M = window.IconModel, L = window.IconLi;
  const NS = 'http://www.w3.org/2000/svg';
  const ROLE = {
    b: ['Shape', '#9a88ff', 'Outlined in Outline, filled in Solid, tinted in Duotone'],
    d: ['Cut-out', '#4be1c8', 'Drawn as a line, but cut out of the filled Solid shape'],
    o: ['Line', '#f2c46d', 'Always a stroke, in every style'],
    k: ['Gap', '#ff7d97', 'Invisible. Clears space around it, e.g. behind a badge'],
  };
  const TOOLS = [['select', 'V', 'Select, move & resize', 'Cursor'], ['node', 'A', 'Edit points', 'Pen Tool'], ['pen', 'P', 'Pen', 'Bezier'], ['rect', 'R', 'Rectangle', 'Checkbox Empty'], ['ellipse', 'E', 'Ellipse', 'Radio Button Off'], ['line', 'L', 'Line', 'Minus']];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const icon = (name, size = 18) => { const ic = L.icons.find((i) => i.name === name && i.style === 'outline') || L.icons.find((i) => i.name === name); return ic ? L.render(ic, { size }) : ''; };
  const el = (tag, at = {}) => { const e = document.createElementNS(NS, tag); Object.keys(at).forEach((k) => e.setAttribute(k, at[k])); return e; };
  const r3 = (v) => Math.round(v * 1000) / 1000;

  class Editor {
    constructor(root, opts = {}) {
      this.root = root;
      this.onChange = opts.onChange || (() => {});
      this.mode = 'layered';
      this.layers = [];
      this.bodies = null;
      this.style = 'outline';
      this.sel = new Set();
      this.nsel = []; // selected points: { id, si, ni }
      this.tool = 'select';
      this.snap = 0.5;
      this.snapPts = true;
      this.grid = true;
      this.keys = true;
      this.newRole = 'b';
      this.unsupported = [];
      this.view = { x: -1.5, y: -1.5, w: 27 };
      this.clip = null;
      this.hist = []; this.fut = [];
      this.build();
    }

    /* ---------- UI scaffold ---------- */
    build() {
      this.root.innerHTML = `
      <div class="ed">
        <div class="ed-tools" role="toolbar" aria-label="Tools">
          ${TOOLS.map(([k, key, label, ic]) => `<button type="button" class="tool" data-tool="${k}" title="${label} (${key})" aria-label="${label}">${icon(ic)}<kbd>${key}</kbd></button>`).join('')}
          <span class="sep"></span>
          <button type="button" class="tool" data-act="undo" title="Undo (⌘Z)" aria-label="Undo">${icon('Undo')}</button>
          <button type="button" class="tool" data-act="redo" title="Redo (⇧⌘Z)" aria-label="Redo">${icon('Redo')}</button>
        </div>
        <div class="ed-stage">
          <div class="ed-bar">
            <div class="seg plain" data-styles role="group" aria-label="Preview style"></div>
            <div class="ed-opts">
              <label>Snap <select data-snap aria-label="Snap to pixel grid"><option value="0">Off</option><option value="0.25">¼ px</option><option value="0.5" selected>½ px</option><option value="1">1 px</option></select></label>
              <label class="chk" title="Snap to other points and keylines"><input type="checkbox" data-snappts checked> Points</label>
              <label class="chk"><input type="checkbox" data-grid checked> Grid</label>
              <label class="chk"><input type="checkbox" data-keys checked> Keylines</label>
              <span class="zoom" role="group" aria-label="Zoom"><button type="button" data-act="zoom-out" aria-label="Zoom out">−</button><button type="button" data-act="zoom-fit" data-zoomlbl title="Fit (0)">100%</button><button type="button" data-act="zoom-in" aria-label="Zoom in">+</button></span>
            </div>
          </div>
          <div class="ed-canvas-wrap"><svg class="ed-canvas" viewBox="-1.5 -1.5 27 27" tabindex="0" aria-label="Icon canvas"></svg></div>
          <div class="ed-status"><span data-pos>x — y —</span><span data-hint></span></div>
        </div>
        <div class="ed-side">
          <div class="tabs" role="tablist">
            ${['Design', 'Layers', 'Code', 'Import'].map((t, i) => `<button type="button" role="tab" data-tab="${t.toLowerCase()}" aria-selected="${i === 0}">${t}</button>`).join('')}
          </div>
          <div class="ed-panel" data-panel="design"></div>
          <div class="ed-panel" data-panel="layers" hidden></div>
          <div class="ed-panel" data-panel="code" hidden>
            <p class="hint">One line per shape. <code>data-role</code>: b = Shape, d = Cut-out, o = Line, k = Gap. <code>data-anim</code> = hover motion.</p>
            <textarea data-code spellcheck="false" aria-label="Icon code"></textarea>
            <div class="row"><button type="button" class="btn btn-sm btn-primary" data-act="apply-code">Apply code</button><button type="button" class="btn btn-sm" data-act="copy-svg">Copy SVG (current style)</button></div>
          </div>
          <div class="ed-panel" data-panel="import" hidden>
            <p class="hint">Paste an SVG from Figma, Illustrator or anywhere, or choose a file. It's scaled to the 24px grid and split into shapes.</p>
            <textarea data-import placeholder="<svg viewBox=&quot;0 0 24 24&quot;>…</svg>" spellcheck="false" aria-label="SVG to import"></textarea>
            <div class="row"><label class="btn btn-sm">Choose .svg file<input type="file" accept=".svg,image/svg+xml" data-file hidden></label>
              <label class="chk"><input type="checkbox" data-isnap checked> Snap to ½ px</label>
              <label class="chk"><input type="checkbox" data-iappend> Add to current</label></div>
            <div class="row"><button type="button" class="btn btn-sm btn-primary" data-act="import">Import SVG</button></div>
            <p class="hint" data-imsg></p>
          </div>
          <div class="ed-preview" aria-label="Preview"></div>
        </div>
      </div>`;
      const $ = (s) => this.root.querySelector(s);
      this.$ = $;
      this.svg = $('.ed-canvas');
      ['grid', 'prev', 'over', 'selg', 'nodes', 'guides', 'draft'].forEach((g) => { this[g] = el('g', { class: 'ed-' + g }); this.svg.appendChild(this[g]); });
      this.root.querySelectorAll('[data-tool]').forEach((b) => (b.onclick = () => this.setTool(b.dataset.tool)));
      this.root.querySelectorAll('[role=tab]').forEach((b) => (b.onclick = () => this.showTab(b.dataset.tab)));
      $('[data-snap]').onchange = (e) => (this.snap = parseFloat(e.target.value));
      $('[data-snappts]').onchange = (e) => (this.snapPts = e.target.checked);
      $('[data-grid]').onchange = (e) => { this.grid = e.target.checked; this.drawGrid(); };
      $('[data-keys]').onchange = (e) => { this.keys = e.target.checked; this.drawGrid(); };
      this.root.addEventListener('click', (e) => { const a = e.target.closest('[data-act]'); if (a) this.act(a.dataset.act, a, e); });
      $('[data-file]').onchange = async (e) => { const f = e.target.files[0]; if (f) $('[data-import]').value = await f.text(); };
      this.bindCanvas();
      this.keyHandler = (e) => this.onKey(e);
      this.keyUp = (e) => { if (e.code === 'Space') { this.space = false; this.svg.classList.remove('panning'); } };
      document.addEventListener('keydown', this.keyHandler);
      document.addEventListener('keyup', this.keyUp);
      this.drawGrid();
      this.setTool('select');
    }

    /* ---------- Loading / saving ---------- */
    load(data) {
      this.mode = data.mode;
      if (data.mode === 'raw') { this.bodies = data.bodies; this.style = data.bodies.outline ? 'outline' : Object.keys(data.bodies)[0]; this.layers = this.bodies[this.style]; }
      else { this.bodies = null; this.layers = data.layers; this.style = 'outline'; }
      this.unsupported = data.unsupported || [];
      this.sel.clear(); this.nsel = []; this.hist = []; this.fut = [];
      this.zoomTo(1);
      this.renderStyleTabs();
      this.refresh();
    }
    result() {
      if (this.mode === 'raw') { this.bodies[this.style] = this.layers; const out = {}; Object.keys(this.bodies).forEach((k) => (out[k] = M.toRaw(this.bodies[k]))); return { mode: 'raw', bodies: out }; }
      return { mode: 'layered', layers: M.toRecordLayers(this.layers) };
    }
    renderStyleTabs() {
      const box = this.$('[data-styles]');
      const styles = this.mode === 'raw' ? Object.keys(this.bodies) : ['outline', 'solid', 'duotone'];
      box.innerHTML = styles.map((s) => `<button type="button" data-style="${s}" aria-pressed="${s === this.style}">${s[0].toUpperCase() + s.slice(1)}${this.mode === 'raw' ? ' drawing' : ''}</button>`).join('');
      box.querySelectorAll('button').forEach((b) => (b.onclick = () => {
        if (this.mode === 'raw') { this.bodies[this.style] = this.layers; this.layers = this.bodies[b.dataset.style]; this.sel.clear(); this.nsel = []; }
        this.style = b.dataset.style;
        box.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        this.refresh();
      }));
    }

    /* ---------- History ---------- */
    snapshot() { this.hist.push(JSON.stringify(this.layers)); if (this.hist.length > 150) this.hist.shift(); this.fut = []; }
    undo() { if (!this.hist.length) return; this.fut.push(JSON.stringify(this.layers)); this.layers = JSON.parse(this.hist.pop()); this.cleanSel(); this.changed(); }
    redo() { if (!this.fut.length) return; this.hist.push(JSON.stringify(this.layers)); this.layers = JSON.parse(this.fut.pop()); this.cleanSel(); this.changed(); }
    cleanSel() { const ids = new Set(this.layers.map((l) => l.id)); [...this.sel].forEach((i) => !ids.has(i) && this.sel.delete(i)); this.nsel = this.nsel.filter((n) => ids.has(n.id)); }
    changed() { if (this.mode === 'raw') this.bodies[this.style] = this.layers; this.refresh(); this.onChange(); }

    /* ---------- Zoom & pan ---------- */
    zoomTo(z, cx = 12, cy = 12) {
      z = Math.min(8, Math.max(1, z));
      const w = 27 / z;
      this.view = z === 1 ? { x: -1.5, y: -1.5, w: 27 } : { x: cx - w / 2, y: cy - w / 2, w };
      this.applyView();
    }
    applyView() {
      const v = this.view;
      this.svg.setAttribute('viewBox', `${r3(v.x)} ${r3(v.y)} ${r3(v.w)} ${r3(v.w)}`);
      const z = this.$('[data-zoomlbl]'); if (z) z.textContent = Math.round((27 / v.w) * 100) + '%';
      this.drawSelection();
    }
    unit() { return this.view.w / (this.svg.clientWidth || 540); }

    /* ---------- Drawing ---------- */
    drawGrid() {
      const g = this.grid; g.innerHTML = '';
      const add = (t, a) => g.appendChild(el(t, a));
      add('rect', { x: 0, y: 0, width: 24, height: 24, class: 'artboard' });
      if (this.grid) for (let i = 1; i < 24; i++) {
        add('line', { x1: i, y1: 0, x2: i, y2: 24, class: i % 4 ? 'gl' : 'gl major' });
        add('line', { x1: 0, y1: i, x2: 24, y2: i, class: i % 4 ? 'gl' : 'gl major' });
      }
      add('rect', { x: 2, y: 2, width: 20, height: 20, class: 'safe' });
      if (this.keys) {
        add('circle', { cx: 12, cy: 12, r: 10, class: 'kl' });
        add('rect', { x: 2, y: 2, width: 20, height: 20, rx: 5, class: 'kl' });
        add('rect', { x: 4, y: 3, width: 16, height: 18, rx: 4, class: 'kl' });
        add('rect', { x: 3, y: 4, width: 18, height: 16, rx: 4, class: 'kl' });
        add('circle', { cx: 12, cy: 12, r: 6, class: 'kl' });
      }
    }
    previewMarkup(style, size) {
      if (this.mode === 'raw') return L.renderBody(M.toRaw(this.layers), { size });
      const def = L.layersToDef({ layers: M.toRecordLayers(this.layers) });
      return L.renderDef(def, style, { size });
    }
    refresh() {
      this.prev.innerHTML = this.previewMarkup(this.style, 24).replace('<svg ', '<svg x="0" y="0" ');
      this.over.innerHTML = '';
      this.layers.forEach((ly) => {
        const d = P.serialize(M.layerSubs(ly));
        const col = this.mode === 'raw' ? '#b4b1d0' : (ROLE[ly.role] || ROLE.b)[1];
        this.over.appendChild(el('path', { d, class: 'ov' + (this.sel.has(ly.id) ? ' on' : ''), stroke: col }));
        this.over.appendChild(el('path', { d, class: 'hit', 'data-layer': ly.id }));
      });
      this.drawSelection();
      if (this.liveRefresh) this.syncDesign(); else this.renderDesign();
      this.renderLayers();
      this.renderPreview();
      if (!this.$('[data-panel=code]').hidden) this.$('[data-code]').value = M.toMarkup(this.layers);
      this.root.querySelector('[data-act=undo]').disabled = !this.hist.length;
      this.root.querySelector('[data-act=redo]').disabled = !this.fut.length;
    }
    selectedLayers() { return this.layers.filter((l) => this.sel.has(l.id)); }
    drawSelection() {
      if (!this.selg) return;
      this.selg.innerHTML = ''; this.nodes.innerHTML = '';
      const sl = this.selectedLayers();
      if (!sl.length) return;
      const u = this.unit();
      if (this.tool !== 'node') {
        const b = M.bounds(sl);
        this.selg.appendChild(el('rect', { x: b.x, y: b.y, width: b.w, height: b.h, class: 'selbox' }));
        if (this.tool !== 'select') return;
        // resize + rotate handles
        const hs = 11 * u, cx = b.x + b.w / 2, cy = b.y + b.h / 2;
        const pos = { nw: [b.x, b.y], n: [cx, b.y], ne: [b.x + b.w, b.y], e: [b.x + b.w, cy], se: [b.x + b.w, b.y + b.h], s: [cx, b.y + b.h], sw: [b.x, b.y + b.h], w: [b.x, cy] };
        const rotY = b.y - 26 * u;
        this.selg.appendChild(el('line', { x1: cx, y1: b.y, x2: cx, y2: rotY, class: 'rotline' }));
        this.selg.appendChild(el('circle', { cx, cy: rotY, r: 6 * u, class: 'th rot', 'data-th': 'rot' }));
        Object.keys(pos).forEach((k) => {
          if ((b.w < 0.01 && /[ew]/.test(k) && k.length === 1) || (b.h < 0.01 && /[ns]/.test(k) && k.length === 1)) return;
          this.selg.appendChild(el('rect', { x: pos[k][0] - hs / 2, y: pos[k][1] - hs / 2, width: hs, height: hs, rx: 2 * u, class: 'th', 'data-th': k }));
        });
        return;
      }
      sl.forEach((ly) => {
        if (ly.type !== 'path') return;
        ly.subs.forEach((s, si) => s.nodes.forEach((nd, ni) => {
          const on = this.nsel.some((q) => q.id === ly.id && q.si === si && q.ni === ni);
          if (on || this.isAdjacentSelected(ly.id, si, ni)) {
            [['i', nd.ix, nd.iy], ['o', nd.ox, nd.oy]].forEach(([h, hx, hy]) => {
              if (Math.abs(hx - nd.x) < 1e-6 && Math.abs(hy - nd.y) < 1e-6) return;
              this.nodes.appendChild(el('line', { x1: nd.x, y1: nd.y, x2: hx, y2: hy, class: 'hline' }));
              this.nodes.appendChild(el('circle', { cx: hx, cy: hy, r: 5 * u, class: 'handle' }));
              this.nodes.appendChild(el('circle', { cx: hx, cy: hy, r: 11 * u, class: 'grab', 'data-handle': h, 'data-layer': ly.id, 'data-si': si, 'data-ni': ni }));
            });
          }
          const sz = (on ? 12 : 10) * u;
          this.nodes.appendChild(el('rect', { x: nd.x - sz / 2, y: nd.y - sz / 2, width: sz, height: sz, rx: 2 * u, class: 'anchor' + (on ? ' on' : '') + (si === 0 && ni === 0 ? ' first' : '') }));
          this.nodes.appendChild(el('circle', { cx: nd.x, cy: nd.y, r: 12 * u, class: 'grab', 'data-anchor': 1, 'data-layer': ly.id, 'data-si': si, 'data-ni': ni }));
        }));
      });
    }
    isAdjacentSelected(id, si, ni) { return this.nsel.some((q) => q.id === id && q.si === si && Math.abs(q.ni - ni) <= 1); }

    /* ---------- Design panel (the friendly one) ---------- */
    showTab(t) {
      this.root.querySelectorAll('[role=tab]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === t)));
      this.root.querySelectorAll('[data-panel]').forEach((p) => (p.hidden = p.dataset.panel !== t));
      if (t === 'code') this.$('[data-code]').value = M.toMarkup(this.layers);
    }
    syncDesign() {
      const sl = this.selectedLayers(); if (!sl.length) return;
      const b = M.bounds(sl), vals = { x: b.x, y: b.y, w: b.w, h: b.h };
      this.$('[data-panel=design]').querySelectorAll('input[data-f]').forEach((i) => { if (i !== document.activeElement && !(this.edit && this.edit.inp === i) && vals[i.dataset.f] != null) i.value = r3(vals[i.dataset.f]); });
    }
    renderDesign() {
      const box = this.$('[data-panel=design]');
      const sl = this.selectedLayers();
      const raw = this.mode === 'raw';
      const num = (label, key, val, step = 0.5, extra = '') => `<label class="num"><span>${label}</span><input type="number" step="${step}" data-f="${key}" value="${val === '' ? '' : r3(val)}" ${extra}></label>`;
      let h = '';
      if (!sl.length) {
        h = `<div class="empty-state">${icon('Cursor', 22)}<p><b>Nothing selected</b></p><p class="hint">Click a shape on the canvas, or draw one with <b>R</b> (rectangle), <b>E</b> (ellipse), <b>L</b> (line) or <b>P</b> (pen).</p>
          <ul class="tips"><li><b>Drag</b> handles to resize, Shift keeps proportions</li><li><b>Double-click</b> a shape to edit its points</li><li><b>Alt-drag</b> duplicates, <b>arrows</b> nudge (Shift for 1px)</li><li><b>⌘ + scroll</b> zooms, <b>Space-drag</b> pans</li></ul></div>`;
        if (!raw) h += this.roleChooser();
      } else {
        const b = M.bounds(sl);
        h += `<section><h4>Position & size</h4><div class="nums four">${num('X', 'x', b.x)}${num('Y', 'y', b.y)}${num('W', 'w', b.w, 0.5, 'min="0"')}${num('H', 'h', b.h, 0.5, 'min="0"')}</div>
          <div class="row tight"><label class="chk"><input type="checkbox" data-lock ${this.lockRatio ? 'checked' : ''}> Keep proportions</label>${num('Rotate°', 'rot', 0, 15)}</div></section>`;
        const pt = M.getPaint(sl[0]);
        const dis = pt.stroke ? '' : 'disabled';
        const cr = this.cornerOf(sl);
        h += `<section><h4>Corners</h4>${cr === null
            ? '<p class="hint">This shape has no corners to round.</p>'
            : `<div class="corner-row"><div class="seg plain small" role="group" aria-label="Corner radius presets">${[[0, 'Sharp'], [1, '1'], [1.5, '1.5'], [2, '2'], [3, '3']].map(([v, t]) => `<button type="button" data-corner="${v}" aria-pressed="${cr !== '' && Math.abs(cr - v) < 0.06}" title="${v ? 'Corner radius ' + v + 'px' : 'Sharp corners (radius 0)'}">${t}</button>`).join('')}</div>${num('Radius', 'corner', cr, 0.25, 'min="0" max="12"')}</div>
              <p class="hint">Rounds the shape itself, like Figma's corner radius. Signature icons use 1.5–3px.</p>`}</section>`;
        h += `<section><h4>Stroke</h4>
          <div class="paint-row"><label class="switchline"><button type="button" class="switch" role="switch" data-p="stroke" aria-checked="${pt.stroke}" aria-label="Stroke"></button> ${pt.stroke ? 'On' : 'Off'}</label>
            ${num('Width', 'pw', pt.width || L.settings.stroke || 1.5, 0.25, `min="0.25" max="4" ${dis}`)}</div>
          <p class="sub-lbl">Ends</p>
          <div class="seg plain small" role="group" aria-label="Stroke ends">${['round', 'butt', 'square'].map((c) => `<button type="button" data-cap="${c}" aria-pressed="${pt.cap === c}" ${dis}>${c === 'butt' ? 'Flat' : c[0].toUpperCase() + c.slice(1)}</button>`).join('')}</div>
          <p class="sub-lbl">Joins <span class="hint">(where the stroke turns a corner)</span></p>
          <div class="seg plain small" role="group" aria-label="Stroke joins">${['round', 'miter', 'bevel'].map((c) => `<button type="button" data-join="${c}" aria-pressed="${pt.join === c}" ${dis}>${c[0].toUpperCase() + c.slice(1)}</button>`).join('')}</div>
          <p class="sub-lbl">Style</p>
          <div class="seg plain small" role="group" aria-label="Stroke style">${[['solid', 'Solid'], ['dash', 'Dashed'], ['dot', 'Dotted']].map(([k, t]) => `<button type="button" data-dash="${k}" aria-pressed="${pt.dash === k}" ${dis}>${t}</button>`).join('')}</div></section>`;
        h += `<section><h4>Fill</h4><div class="seg plain small" role="group" aria-label="Fill">${(raw ? ['none', 'solid'] : ['auto', 'none', 'solid']).map((f) => `<button type="button" data-fill="${f}" aria-pressed="${pt.fill === f}" title="${f === 'auto' ? 'Filled only in Solid, tinted in Duotone' : f === 'none' ? 'Never filled' : 'Always filled'}">${f === 'auto' ? 'By style' : f === 'none' ? 'None' : 'Filled'}</button>`).join('')}</div>
          <label class="num wide"><span>Opacity <output>${Math.round(pt.opacity * 100)}%</output></span><input type="range" min="0.1" max="1" step="0.05" value="${pt.opacity}" data-p="opacity" style="--p:${((pt.opacity - 0.1) / 0.9) * 100}%"></label></section>`;
        if (!raw) {
          const motions = window.IconLiAnim ? Object.keys(window.IconLiAnim.MOTIONS) : [];
          h += `<section><h4>Behaviour</h4>${this.roleChooser(sl)}
            <label class="num wide"><span>Hover motion</span><select data-cls><option value="">None</option>${motions.map((m) => `<option ${sl.length === 1 && sl[0].cls === m ? 'selected' : ''}>${m}</option>`).join('')}</select></label></section>`;
        }
        h += `<section><h4>Arrange</h4><div class="icon-row">
            ${[['align-left', '⇤', 'Align left'], ['align-hcenter', '↔', 'Centre horizontally'], ['align-right', '⇥', 'Align right'], ['align-top', '⤒', 'Align top'], ['align-vcenter', '↕', 'Centre vertically'], ['align-bottom', '⤓', 'Align bottom']].map(([a, g, t]) => `<button type="button" class="ib" data-act="${a}" title="${t} (to the 2px safe area)" aria-label="${t}">${g}</button>`).join('')}
          </div><div class="icon-row">
            <button type="button" class="ib" data-act="flip-h" title="Flip horizontal" aria-label="Flip horizontal">⇋</button><button type="button" class="ib" data-act="flip-v" title="Flip vertical" aria-label="Flip vertical">⇵</button>
            <button type="button" class="ib" data-act="rot90" title="Rotate 90°" aria-label="Rotate 90 degrees">⟳</button><button type="button" class="ib" data-act="front" title="Bring to front" aria-label="Bring to front">⬆</button><button type="button" class="ib" data-act="back" title="Send to back" aria-label="Send to back">⬇</button>
            <button type="button" class="ib" data-act="dup" title="Duplicate (⌘D)" aria-label="Duplicate">⧉</button><button type="button" class="ib" data-act="snap-sel" title="Snap all points to the grid" aria-label="Snap to grid">#</button><button type="button" class="ib danger" data-act="delete" title="Delete (⌫)" aria-label="Delete">✕</button>
          </div></section>`;
        if (sl.length === 1) {
          const ly = sl[0];
          if (ly.type !== 'path') h += `<section><h4>Shape</h4>${this.primitiveFields(ly, num)}<button type="button" class="btn btn-sm" data-act="to-path">Edit points (convert to path)</button></section>`;
          else {
            const ns = this.nsel.filter((q) => q.id === ly.id);
            h += `<section><h4>Points</h4>`;
            if (ns.length === 1) { const nd = ly.subs[ns[0].si].nodes[ns[0].ni]; h += `<div class="nums">${num('Point X', 'nx', nd.x)}${num('Point Y', 'ny', nd.y)}</div><div class="row tight"><button type="button" class="btn btn-sm" data-act="smooth">Smooth</button><button type="button" class="btn btn-sm" data-act="corner">Corner</button><button type="button" class="btn btn-sm" data-act="del-node">Delete point</button></div>`; }
            else h += `<p class="hint">${this.tool === 'node' ? 'Click a point to select it, or double-click the outline to add one.' : 'Double-click the shape (or press A) to edit its points.'}</p>`;
            h += `<div class="row tight"><button type="button" class="btn btn-sm" data-act="toggle-close">${ly.subs.every((s) => s.closed) ? 'Open path' : 'Close path'}</button><button type="button" class="btn btn-sm" data-act="reverse">Reverse</button></div></section>`;
          }
        }
      }
      box.innerHTML = h;
      this.bindDesign(box, sl);
    }
    roleChooser(sl) {
      const cur = sl ? (sl.every((l) => l.role === sl[0].role) ? sl[0].role : null) : this.newRole;
      return `<div class="roles" role="radiogroup" aria-label="${sl ? 'Shape role' : 'New shapes are'}">${sl ? '' : '<span class="hint">New shapes are</span>'}${Object.keys(ROLE).map((r) => `<button type="button" role="radio" class="role" data-role="${r}" aria-checked="${cur === r}" style="--rc:${ROLE[r][1]}" title="${ROLE[r][2]}"><i></i>${ROLE[r][0]}</button>`).join('')}</div>${sl && cur ? `<p class="hint">${ROLE[cur][2]}.</p>` : ''}`;
    }
    primitiveFields(ly, num) {
      const a = ly.a;
      if (ly.type === 'circle') return `<div class="nums">${num('Centre X', 'cx', a.cx)}${num('Centre Y', 'cy', a.cy)}${num('Radius', 'r', a.r)}</div>`;
      if (ly.type === 'ellipse') return `<div class="nums four">${num('Centre X', 'cx', a.cx)}${num('Centre Y', 'cy', a.cy)}${num('Radius X', 'rx', a.rx)}${num('Radius Y', 'ry', a.ry)}</div>`;
      if (ly.type === 'line') return `<div class="nums four">${num('X1', 'x1', a.x1)}${num('Y1', 'y1', a.y1)}${num('X2', 'x2', a.x2)}${num('Y2', 'y2', a.y2)}</div>`;
      return '';
    }
    bindDesign(box, sl) {
      const ids = new Set(sl.map((l) => l.id));
      const mapSel = (fn) => { this.layers = this.layers.map((l) => (ids.has(l.id) ? fn(l) : l)); };
      box.querySelectorAll('.role').forEach((b) => (b.onclick = () => {
        if (!sl.length) { this.newRole = b.dataset.role; return this.renderDesign(); }
        this.snapshot(); sl.forEach((l) => (this.layer(l.id).role = b.dataset.role)); this.changed();
      }));
      const lock = box.querySelector('[data-lock]'); if (lock) lock.onchange = () => (this.lockRatio = lock.checked);
      // Number fields apply live while you type, scrub (drag the label) or use the arrow keys.
      // Each edit session starts from the drawing as it was, so relative values (rotation, size) never compound.
      box.querySelectorAll('input[data-f]').forEach((inp) => {
        const start = () => { if (!this.edit || this.edit.inp !== inp) this.edit = { inp, base: JSON.stringify(this.layers), saved: false }; };
        const live = () => {
          const v = parseFloat(inp.value); if (!Number.isFinite(v)) return;
          start();
          if (!this.edit.saved) { this.snapshot(); this.edit.saved = true; this.hist[this.hist.length - 1] = this.edit.base; }
          this.layers = JSON.parse(this.edit.base);
          this.applyField(inp.dataset.f, v);
          this.liveRefresh = true; this.changed(); this.liveRefresh = false;
        };
        let t;
        inp.addEventListener('focus', start);
        inp.addEventListener('input', () => { clearTimeout(t); t = setTimeout(live, 140); });
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { clearTimeout(t); live(); this.endEdit(); } if (e.key === 'Escape') { clearTimeout(t); if (this.edit && this.edit.saved) this.undo(); this.edit = null; this.renderDesign(); } });
        inp.addEventListener('change', () => { clearTimeout(t); live(); });
        inp.addEventListener('blur', () => setTimeout(() => { if (this.edit && this.edit.inp === inp) this.endEdit(); }, 0));
        // scrub: drag the label left / right (Shift = ×10)
        const lbl = inp.previousElementSibling;
        if (lbl && !inp.disabled) {
          lbl.classList.add('scrub'); lbl.title = 'Drag left or right to change';
          lbl.onpointerdown = (e) => {
            e.preventDefault(); lbl.setPointerCapture(e.pointerId);
            const x0 = e.clientX, v0 = parseFloat(inp.value) || 0, st = parseFloat(inp.step) || 0.5;
            const min = inp.min !== '' ? +inp.min : -Infinity, max = inp.max !== '' ? +inp.max : Infinity;
            this.edit = null; start();
            lbl.onpointermove = (ev) => {
              const v = Math.min(max, Math.max(min, v0 + Math.round((ev.clientX - x0) / 3) * st * (ev.shiftKey ? 10 : 1)));
              if (String(v) !== inp.value) { inp.value = r3(v); live(); }
            };
            lbl.onpointerup = () => { lbl.onpointermove = lbl.onpointerup = null; this.endEdit(); };
          };
        }
      });
      box.querySelectorAll('[data-corner]').forEach((b) => (b.onclick = () => { this.snapshot(); this.applyField('corner', +b.dataset.corner); this.changed(); }));
      const setP = (fn) => { this.snapshot(); sl.forEach((l) => { const ly = this.layer(l.id), p = M.getPaint(ly); fn(p); M.setPaint(ly, p, this.mode === 'raw'); }); this.changed(); };
      box.querySelectorAll('[data-p=stroke]').forEach((b) => (b.onclick = () => setP((p) => {
        p.stroke = !p.stroke;
        if (!p.stroke && p.fill !== 'solid') p.fill = 'solid'; // a shape with neither stroke nor fill would vanish
        else if (p.stroke && p.fill === 'solid') p.fill = this.mode === 'raw' ? 'none' : 'auto'; // back to a normal outlined shape
      })));
      box.querySelectorAll('[data-dash]').forEach((b) => (b.onclick = () => setP((p) => (p.dash = b.dataset.dash))));
      box.querySelectorAll('[data-cap]').forEach((b) => (b.onclick = () => setP((p) => (p.cap = b.dataset.cap))));
      box.querySelectorAll('[data-join]').forEach((b) => (b.onclick = () => setP((p) => (p.join = b.dataset.join))));
      box.querySelectorAll('[data-fill]').forEach((b) => (b.onclick = () => setP((p) => { p.fill = b.dataset.fill; if (p.fill === 'none' && !p.stroke) p.stroke = true; })));
      const op = box.querySelector('[data-p=opacity]');
      if (op) { op.oninput = () => { op.previousElementSibling.querySelector('output').textContent = Math.round(op.value * 100) + '%'; op.style.setProperty('--p', ((op.value - 0.1) / 0.9) * 100 + '%'); }; op.onchange = () => setP((p) => (p.opacity = +op.value)); }
      const cls = box.querySelector('[data-cls]'); if (cls) cls.onchange = () => { this.snapshot(); sl.forEach((l) => (this.layer(l.id).cls = cls.value || null)); this.changed(); };
    }
    endEdit() { this.edit = null; this.renderDesign(); }
    // Corner radius of the selection: a number, '' when mixed, null when nothing has corners
    cornerOf(sl) {
      const rs = sl.map((l) => (l.type === 'rect' ? l.a.rx || 0 : l.type === 'path' ? P.cornerRadius(l.subs) : null)).filter((v) => v !== null);
      if (!rs.length) return null;
      return rs.every((v) => Math.abs(v - rs[0]) < 0.06) ? rs[0] : '';
    }
    applyField(k, v) {
      const ids = this.sel, sl = this.selectedLayers();
      if (!sl.length) return;
      const b = M.bounds(sl);
      const mapSel = (fn) => { this.layers = this.layers.map((l) => (ids.has(l.id) ? fn(l) : l)); };
      if (k === 'x' || k === 'y') mapSel((l) => M.move(l, k === 'x' ? v - b.x : 0, k === 'y' ? v - b.y : 0));
      else if (k === 'w' || k === 'h') {
        v = Math.max(0.25, v);
        let sx = k === 'w' ? (b.w ? v / b.w : 1) : 1, sy = k === 'h' ? (b.h ? v / b.h : 1) : 1;
        if (this.lockRatio) { if (k === 'w') sy = sx; else sx = sy; }
        mapSel((l) => M.scaleLayer(l, [sx, 0, 0, sy, b.x - sx * b.x, b.y - sy * b.y]));
      } else if (k === 'rot') {
        const a = (v * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a), cx = b.x + b.w / 2, cy = b.y + b.h / 2;
        mapSel((l) => this.rotateLayer(l, [c, s, -s, c, cx - c * cx + s * cy, cy - s * cx - c * cy], cx, cy));
      } else if (k === 'corner') {
        v = Math.max(0, v);
        mapSel((l) => {
          const c = M.clone(l);
          if (c.type === 'rect') { c.a.rx = Math.min(v, c.a.width / 2, c.a.height / 2); delete c.a.ry; }
          else if (c.type === 'path') c.subs = P.setCorners(c.subs, v);
          return c;
        });
      } else if (k === 'pw') sl.forEach((l) => { const ly = this.layer(l.id), p = M.getPaint(ly); p.width = Math.max(0.25, v); M.setPaint(ly, p, this.mode === 'raw'); });
      else if (k === 'nx' || k === 'ny') {
        const ly = this.layer(sl[0].id), q = this.nsel.find((x) => x.id === ly.id); if (!q) return;
        const nd = ly.subs[q.si].nodes[q.ni], dx = k === 'nx' ? v - nd.x : 0, dy = k === 'ny' ? v - nd.y : 0;
        ['x', 'ix', 'ox'].forEach((p) => (nd[p] += dx)); ['y', 'iy', 'oy'].forEach((p) => (nd[p] += dy));
      } else {
        const ly = this.layer(sl[0].id);
        if (k === 'rrx') ly.a.rx = Math.max(0, Math.min(v, ly.a.width / 2, ly.a.height / 2));
        else if (k === 'r' || k === 'rx' || k === 'ry') ly.a[k] = Math.max(0.1, v);
        else ly.a[k] = v;
      }
    }
    rotateLayer(l, m, cx, cy) {
      if (l.type === 'circle') { const [x, y] = P.ap(m, l.a.cx, l.a.cy); const c = M.clone(l); c.a.cx = x; c.a.cy = y; return c; }
      return M.transformLayer(l, m);
    }

    /* ---------- Layers panel ---------- */
    renderLayers() {
      const box = this.$('[data-panel=layers]');
      const raw = this.mode === 'raw';
      box.innerHTML = `${this.unsupported.length ? `<p class="warn">This icon uses ${this.unsupported.join(', ')}, which the canvas can't show. Edit it in Code, or convert it.</p>` : ''}
        ${raw ? `<p class="hint">Signature icon: each style is drawn by hand. You're editing the <b>${this.style}</b> drawing. <button type="button" class="linkbtn" data-act="to-layered">Convert to auto styles</button></p>` : ''}
        <ol class="layer-list">${this.layers.map((ly, i) => `<li class="${this.sel.has(ly.id) ? 'on' : ''}" data-pick="${ly.id}">
          ${raw ? '' : `<i class="rdot" style="--rc:${(ROLE[ly.role] || ROLE.b)[1]}" title="${(ROLE[ly.role] || ROLE.b)[0]}"></i>`}
          <span class="lname">${ly.fill ? 'Dot' : ly.type[0].toUpperCase() + ly.type.slice(1)}${raw ? '' : ` <small>${(ROLE[ly.role] || ROLE.b)[0]}</small>`}${ly.cls ? ` · <em>${ly.cls}</em>` : ''}</span>
          <span class="lact"><button type="button" data-up="${i}" aria-label="Move up" title="Move up">↑</button><button type="button" data-down="${i}" aria-label="Move down" title="Move down">↓</button><button type="button" data-del="${ly.id}" aria-label="Delete shape" title="Delete">×</button></span>
        </li>`).join('') || '<li class="empty">No shapes yet. Pick a tool and draw on the canvas.</li>'}</ol>`;
      box.querySelectorAll('[data-pick]').forEach((li) => (li.onclick = (e) => { if (e.target.closest('button')) return; this.select(li.dataset.pick, e.shiftKey); }));
      box.querySelectorAll('[data-up]').forEach((b) => (b.onclick = () => this.reorder(+b.dataset.up, -1)));
      box.querySelectorAll('[data-down]').forEach((b) => (b.onclick = () => this.reorder(+b.dataset.down, 1)));
      box.querySelectorAll('[data-del]').forEach((b) => (b.onclick = () => { this.snapshot(); this.layers = this.layers.filter((l) => l.id !== b.dataset.del); this.cleanSel(); this.changed(); }));
    }
    renderPreview() {
      const box = this.$('.ed-preview');
      const styles = this.mode === 'raw' ? Object.keys(this.bodies) : ['outline', 'solid', 'duotone'];
      box.innerHTML = `<div class="pv-row">${[16, 20, 24, 32, 48].map((s) => `<span class="pv" title="${s}px">${this.previewMarkup(this.style, s)}</span>`).join('')}</div>
        <div class="pv-row">${styles.map((st) => `<span class="pv big ${st === this.style ? 'on' : ''}" title="${st}">${this.mode === 'raw' ? L.renderBody(M.toRaw(st === this.style ? this.layers : this.bodies[st]), { size: 36 }) : this.previewMarkup(st, 36)}</span>`).join('')}
        <span class="pv big dark">${this.previewMarkup(this.style, 36)}</span></div>`;
    }

    /* ---------- Actions ---------- */
    layer(id) { return this.layers.find((l) => l.id === id); }
    select(id, add) {
      if (!add) this.sel.clear();
      if (add && this.sel.has(id)) this.sel.delete(id); else this.sel.add(id);
      this.nsel = this.nsel.filter((q) => this.sel.has(q.id));
      this.refresh();
    }
    reorder(i, dir) { const j = i + dir; if (j < 0 || j >= this.layers.length) return; this.snapshot(); const a = this.layers; [a[i], a[j]] = [a[j], a[i]]; this.changed(); }
    setTool(t) {
      this.finishPen();
      this.tool = t;
      this.root.querySelectorAll('[data-tool]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tool === t)));
      if (t === 'node') this.selectedLayers().filter((l) => l.type !== 'path').forEach((l) => this.convertToPath(l.id, true));
      this.svg.dataset.tool = t;
      this.$('[data-hint]').textContent = { select: 'Drag to move, drag handles to resize, drag the dot above to rotate. Alt-drag duplicates', node: 'Drag points and handles. Double-click the outline to add a point, Alt-click a point to delete it. Enter when done', pen: 'Click to add points, drag to curve, click the first point to close, Enter to finish', rect: 'Drag to draw (Shift for a square)', ellipse: 'Drag to draw (Shift for a circle)', line: 'Drag to draw a line (Shift for 45° steps)' }[t];
      this.refresh();
    }
    convertToPath(id, silent) { const i = this.layers.findIndex((l) => l.id === id); if (i < 0 || this.layers[i].type === 'path') return; if (!silent) this.snapshot(); this.layers[i] = M.toPath(this.layers[i]); if (!silent) this.changed(); }
    applyMatrix(m) { this.snapshot(); this.layers = this.layers.map((l) => (this.sel.has(l.id) ? M.transformLayer(l, m) : l)); this.changed(); }
    act(a, btn) {
      const sl = this.selectedLayers();
      const b = sl.length ? M.bounds(sl) : null;
      const cx = b ? b.x + b.w / 2 : 12, cy = b ? b.y + b.h / 2 : 12;
      if (a === 'undo') return this.undo();
      if (a === 'redo') return this.redo();
      if (a === 'zoom-in') return this.zoomTo((27 / this.view.w) * 1.5, this.view.x + this.view.w / 2, this.view.y + this.view.w / 2);
      if (a === 'zoom-out') return this.zoomTo((27 / this.view.w) / 1.5, this.view.x + this.view.w / 2, this.view.y + this.view.w / 2);
      if (a === 'zoom-fit') return this.zoomTo(1);
      if (!sl.length && !['apply-code', 'copy-svg', 'import', 'to-layered'].includes(a)) return;
      if (a === 'flip-h') return this.applyMatrix([-1, 0, 0, 1, 2 * cx, 0]);
      if (a === 'flip-v') return this.applyMatrix([1, 0, 0, -1, 0, 2 * cy]);
      if (a === 'rot90') return this.applyMatrix([0, 1, -1, 0, cx + cy, cy - cx]);
      if (a.startsWith('align-')) {
        const al = a.slice(6);
        const dx = al === 'left' ? 2 - b.x : al === 'right' ? 22 - (b.x + b.w) : al === 'hcenter' ? 12 - cx : 0;
        const dy = al === 'top' ? 2 - b.y : al === 'bottom' ? 22 - (b.y + b.h) : al === 'vcenter' ? 12 - cy : 0;
        this.snapshot(); this.layers = this.layers.map((l) => (this.sel.has(l.id) ? M.move(l, dx, dy) : l)); return this.changed();
      }
      if (a === 'front' || a === 'back') { this.snapshot(); const keep = this.layers.filter((l) => !this.sel.has(l.id)); this.layers = a === 'front' ? keep.concat(sl) : sl.concat(keep); return this.changed(); }
      if (a === 'dup') { this.snapshot(); const copies = sl.map((l) => Object.assign(M.move(l, 1, 1), { id: M.uid() })); this.layers.push(...copies); this.sel = new Set(copies.map((c) => c.id)); return this.changed(); }
      if (a === 'delete') { this.snapshot(); this.layers = this.layers.filter((l) => !this.sel.has(l.id)); this.sel.clear(); this.nsel = []; return this.changed(); }
      if (a === 'snap-sel') { this.snapshot(); this.layers = this.layers.map((l) => (this.sel.has(l.id) ? M.snapLayer(l, this.snap || 0.5) : l)); return this.changed(); }
      if (a === 'to-path' && sl.length === 1) { this.convertToPath(sl[0].id); return this.setTool('node'); }
      if (a === 'toggle-close' && sl.length === 1) { this.snapshot(); const close = !sl[0].subs.every((s) => s.closed); sl[0].subs.forEach((s) => (s.closed = close)); return this.changed(); }
      if (a === 'reverse' && sl.length === 1) { this.snapshot(); sl[0].subs = sl[0].subs.map((s) => ({ closed: s.closed, nodes: s.nodes.slice().reverse().map((nd) => ({ x: nd.x, y: nd.y, ix: nd.ox, iy: nd.oy, ox: nd.ix, oy: nd.iy })) })); this.nsel = []; return this.changed(); }
      if (a === 'smooth' || a === 'corner') { this.snapshot(); this.nsel.forEach((q) => this.setSmooth(q, a === 'smooth')); return this.changed(); }
      if (a === 'del-node') return this.deleteNodes();
      if (a === 'apply-code') {
        try { const res = M.parseMarkup(this.$('[data-code]').value, { layered: this.mode !== 'raw' }); this.snapshot(); this.layers = res.layers.map((l) => Object.assign(l, { role: this.mode === 'raw' ? null : l.role || 'b' })); this.sel.clear(); this.nsel = []; this.changed(); }
        catch (e) { alert(e.message); }
        return;
      }
      if (a === 'copy-svg') { navigator.clipboard.writeText(this.previewMarkup(this.style, 24)); return; }
      if (a === 'import') {
        const msg = this.$('[data-imsg]');
        try {
          if (this.mode === 'raw') { msg.textContent = 'Convert this Signature icon to auto styles first (Layers tab), then import.'; return; }
          const res = M.importSvg(this.$('[data-import]').value, { snap: this.$('[data-isnap]').checked ? 0.5 : 0 });
          this.snapshot();
          this.layers = this.$('[data-iappend]').checked ? this.layers.concat(res.layers) : res.layers;
          this.sel = new Set(res.layers.map((l) => l.id)); this.changed(); this.showTab('design');
          msg.textContent = `Imported ${res.layers.length} shape${res.layers.length === 1 ? '' : 's'}${res.unsupported.length ? '. Masks and clip paths were skipped.' : '.'}`;
        } catch (e) { msg.textContent = e.message; }
        return;
      }
      if (a === 'to-layered') {
        if (!confirm('Convert this Signature icon to auto-generated outline, solid and duotone? It will be redrawn from the outline drawing.')) return;
        this.mode = 'layered';
        this.layers = M.rawToRoles(M.toRaw(this.bodies.outline || this.layers));
        this.bodies = null; this.style = 'outline'; this.hist = []; this.fut = [];
        this.renderStyleTabs(); this.changed();
      }
    }
    setSmooth(q, smooth) {
      const ly = this.layer(q.id), s = ly.subs[q.si], nd = s.nodes[q.ni];
      if (!smooth) { nd.ix = nd.x; nd.iy = nd.y; nd.ox = nd.x; nd.oy = nd.y; return; }
      const prev = s.nodes[(q.ni - 1 + s.nodes.length) % s.nodes.length], next = s.nodes[(q.ni + 1) % s.nodes.length];
      const dx = next.x - prev.x, dy = next.y - prev.y, len = Math.hypot(dx, dy) || 1;
      const lp = Math.hypot(nd.x - prev.x, nd.y - prev.y) / 3, ln = Math.hypot(next.x - nd.x, next.y - nd.y) / 3;
      nd.ix = nd.x - (dx / len) * lp; nd.iy = nd.y - (dy / len) * lp; nd.ox = nd.x + (dx / len) * ln; nd.oy = nd.y + (dy / len) * ln;
    }
    deleteNodes() {
      if (!this.nsel.length) return;
      this.snapshot();
      const byLayer = {};
      this.nsel.forEach((q) => ((byLayer[q.id] = byLayer[q.id] || []).push(q)));
      Object.keys(byLayer).forEach((id) => {
        const ly = this.layer(id);
        byLayer[id].sort((a, b) => b.ni - a.ni).forEach((q) => ly.subs[q.si].nodes.splice(q.ni, 1));
        ly.subs = ly.subs.filter((s) => s.nodes.length > 1);
        if (!ly.subs.length) this.layers = this.layers.filter((l) => l.id !== id);
      });
      this.nsel = []; this.cleanSel(); this.changed();
    }

    /* ---------- Snapping ---------- */
    snapTargets(exclude) {
      const pts = [[2, 2], [22, 2], [2, 22], [22, 22], [12, 12], [12, 2], [12, 22], [2, 12], [22, 12]];
      this.layers.forEach((l) => {
        if (exclude && exclude.has(l.id)) return;
        M.layerSubs(l).forEach((s) => s.nodes.forEach((n) => pts.push([n.x, n.y])));
      });
      return pts;
    }
    // Snap a point: to another point / keyline intersection first (shows a guide), otherwise to the pixel grid
    sp(x, y, exclude) {
      this.guides.innerHTML = '';
      if (this.snapPts) {
        const th = 9 * this.unit();
        let best = null, bd = th;
        for (const [px, py] of this.snapTargets(exclude)) { const d = Math.hypot(px - x, py - y); if (d < bd) { bd = d; best = [px, py]; } }
        if (best) { this.guides.appendChild(el('circle', { cx: best[0], cy: best[1], r: 7 * this.unit(), class: 'snapmark' })); return { x: best[0], y: best[1] }; }
        // align with points horizontally / vertically
        let gx = null, gy = null;
        for (const [px, py] of this.snapTargets(exclude)) { if (gx == null && Math.abs(px - x) < th * 0.6) gx = px; if (gy == null && Math.abs(py - y) < th * 0.6) gy = py; }
        const sx = gx != null ? gx : P.snap(x, this.snap), sy = gy != null ? gy : P.snap(y, this.snap);
        if (gx != null) this.guides.appendChild(el('line', { x1: gx, y1: -50, x2: gx, y2: 50, class: 'guide' }));
        if (gy != null) this.guides.appendChild(el('line', { x1: -50, y1: gy, x2: 50, y2: gy, class: 'guide' }));
        return { x: sx, y: sy };
      }
      return { x: P.snap(x, this.snap), y: P.snap(y, this.snap) };
    }
    sn(v) { return P.snap(v, this.snap); }

    /* ---------- Canvas interaction ---------- */
    pt(e) { const p = this.svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const q = p.matrixTransform(this.svg.getScreenCTM().inverse()); return { x: q.x, y: q.y }; }
    bindCanvas() {
      const s = this.svg;
      s.addEventListener('pointerdown', (e) => this.down(e));
      s.addEventListener('pointermove', (e) => {
        const p = this.pt(e);
        this.$('[data-pos]').textContent = `x ${P.num(this.sn(p.x))}  y ${P.num(this.sn(p.y))}`;
        if (this.drag) this.moveDrag(e, p); else if (this.tool === 'pen') this.penHover(p);
      });
      s.addEventListener('pointerup', (e) => this.up(e));
      s.addEventListener('dblclick', (e) => this.dbl(e));
      s.addEventListener('pointerleave', () => (this.$('[data-pos]').textContent = 'x — y —'));
      s.addEventListener('wheel', (e) => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          const p = this.pt(e), z0 = 27 / this.view.w, z = Math.min(8, Math.max(1, z0 * (e.deltaY < 0 ? 1.15 : 1 / 1.15)));
          const w = 27 / z, k = w / this.view.w;
          this.view = z === 1 ? { x: -1.5, y: -1.5, w: 27 } : { x: p.x - (p.x - this.view.x) * k, y: p.y - (p.y - this.view.y) * k, w };
          this.applyView();
        } else if (this.view.w < 27) { e.preventDefault(); const u = this.unit(); this.view.x += e.deltaX * u; this.view.y += e.deltaY * u; this.applyView(); }
      }, { passive: false });
    }
    down(e) {
      this.svg.focus({ preventScroll: true });
      const p = this.pt(e), t = e.target, ds = t.dataset || {};
      this.svg.setPointerCapture(e.pointerId);
      if (this.space || e.button === 1) { this.drag = { kind: 'pan', sx: e.clientX, sy: e.clientY, v: Object.assign({}, this.view) }; return; }
      if (ds.th) { // resize / rotate handle
        const sl = this.selectedLayers(); const b = M.bounds(sl);
        this.snapshot();
        this.drag = { kind: ds.th === 'rot' ? 'rotate' : 'scale', h: ds.th, b, orig: JSON.parse(JSON.stringify(this.layers)), start: p, a0: Math.atan2(p.y - (b.y + b.h / 2), p.x - (b.x + b.w / 2)) };
        return;
      }
      if (this.tool === 'node' && (ds.anchor || ds.handle)) {
        const q = { id: ds.layer, si: +ds.si, ni: +ds.ni };
        if (ds.anchor && e.altKey) { this.nsel = [q]; return this.deleteNodes(); }
        if (ds.anchor) {
          const has = this.nsel.some((x) => x.id === q.id && x.si === q.si && x.ni === q.ni);
          if (e.shiftKey) { if (has) this.nsel = this.nsel.filter((x) => !(x.id === q.id && x.si === q.si && x.ni === q.ni)); else this.nsel.push(q); }
          else if (!has) this.nsel = [q];
        }
        this.snapshot();
        const nd = this.layer(q.id).subs[q.si].nodes[q.ni];
        this.drag = { kind: ds.anchor ? 'nodes' : 'handle', h: ds.handle, q, start: p, base: { x: nd.x, y: nd.y }, orig: JSON.parse(JSON.stringify(this.layers)), smooth: ds.handle && this.isSmooth(nd) };
        return this.refresh();
      }
      if (this.tool === 'select' || this.tool === 'node') {
        const id = ds.layer;
        if (id) {
          if (e.shiftKey) this.sel.has(id) ? this.sel.delete(id) : this.sel.add(id); else if (!this.sel.has(id)) { this.sel = new Set([id]); this.nsel = []; }
          if (this.tool === 'node') { this.convertToPath(id, true); this.refresh(); return; }
          this.snapshot();
          if (e.altKey) { // Alt-drag duplicates
            const copies = this.selectedLayers().map((l) => Object.assign(M.clone(l), { id: M.uid() }));
            this.layers.push(...copies); this.sel = new Set(copies.map((c) => c.id));
          }
          const b = M.bounds(this.selectedLayers());
          this.drag = { kind: 'move', start: p, b, orig: JSON.parse(JSON.stringify(this.layers)) };
        } else { this.sel.clear(); this.nsel = []; if (this.tool === 'node') this.setTool('select'); }
        return this.refresh();
      }
      if (this.tool === 'pen') return this.penDown(p);
      if (['rect', 'ellipse', 'line'].includes(this.tool)) {
        this.snapshot();
        const q = this.sp(p.x, p.y);
        const ly = { id: M.uid(), role: this.mode === 'raw' ? null : this.tool === 'line' ? 'o' : this.newRole, type: this.tool, a: this.tool === 'rect' ? { x: q.x, y: q.y, width: 0, height: 0, rx: 0 } : this.tool === 'ellipse' ? { cx: q.x, cy: q.y, rx: 0, ry: 0 } : { x1: q.x, y1: q.y, x2: q.x, y2: q.y }, fill: false, cls: null, extra: this.rawPaint() };
        this.layers.push(ly); this.sel = new Set([ly.id]);
        this.drag = { kind: 'create', id: ly.id, start: q };
        this.refresh();
      }
    }
    rawPaint() { return this.mode === 'raw' ? { stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' } : {}; }
    isSmooth(nd) {
      const a = Math.atan2(nd.y - nd.iy, nd.x - nd.ix), b = Math.atan2(nd.oy - nd.y, nd.ox - nd.x);
      const both = Math.hypot(nd.ix - nd.x, nd.iy - nd.y) > 1e-3 && Math.hypot(nd.ox - nd.x, nd.oy - nd.y) > 1e-3;
      return both && Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b))) < 0.06;
    }
    moveDrag(e, p) {
      const d = this.drag;
      if (d.kind === 'pan') { const u = this.unit(); this.view.x = d.v.x - (e.clientX - d.sx) * u; this.view.y = d.v.y - (e.clientY - d.sy) * u; return this.applyView(); }
      if (d.kind === 'move') {
        // snap the selection's top-left corner (so shapes land on the pixel grid / other points)
        const tgt = this.sp(d.b.x + p.x - d.start.x, d.b.y + p.y - d.start.y, this.sel);
        const dx = tgt.x - d.b.x, dy = tgt.y - d.b.y;
        this.layers = d.orig.map((l) => (this.sel.has(l.id) ? M.move(l, dx, dy) : l));
      } else if (d.kind === 'scale') {
        const b = d.b, h = d.h;
        const ax = e.altKey ? b.x + b.w / 2 : h.includes('w') ? b.x + b.w : b.x;
        const ay = e.altKey ? b.y + b.h / 2 : h.includes('n') ? b.y + b.h : b.y;
        const q = this.sp(p.x, p.y, this.sel);
        const ow = e.altKey ? b.w / 2 : b.w, oh = e.altKey ? b.h / 2 : b.h;
        let sx = h.includes('e') || h.includes('w') ? (q.x - ax) / (h.includes('w') ? -ow : ow) : 1;
        let sy = h.includes('n') || h.includes('s') ? (q.y - ay) / (h.includes('n') ? -oh : oh) : 1;
        if (!Number.isFinite(sx) || ow < 1e-6) sx = 1;
        if (!Number.isFinite(sy) || oh < 1e-6) sy = 1;
        if (e.shiftKey || this.lockRatio) { const s = h.length === 2 ? Math.max(Math.abs(sx), Math.abs(sy)) : h === 'e' || h === 'w' ? Math.abs(sx) : Math.abs(sy); sx = Math.sign(sx || 1) * s; sy = Math.sign(sy || 1) * s; }
        if (Math.abs(sx) < 0.02) sx = 0.02 * Math.sign(sx || 1);
        if (Math.abs(sy) < 0.02) sy = 0.02 * Math.sign(sy || 1);
        const m = [sx, 0, 0, sy, ax - sx * ax, ay - sy * ay];
        this.layers = d.orig.map((l) => (this.sel.has(l.id) ? M.scaleLayer(l, m) : l));
        this.$('[data-pos]').textContent = `W ${P.num(Math.abs(b.w * sx))}  H ${P.num(Math.abs(b.h * sy))}`;
      } else if (d.kind === 'rotate') {
        const b = d.b, cx = b.x + b.w / 2, cy = b.y + b.h / 2;
        let ang = Math.atan2(p.y - cy, p.x - cx) - d.a0;
        if (e.shiftKey) ang = Math.round(ang / (Math.PI / 12)) * (Math.PI / 12);
        const c = Math.cos(ang), s = Math.sin(ang);
        const m = [c, s, -s, c, cx - c * cx + s * cy, cy - s * cx - c * cy];
        this.layers = d.orig.map((l) => (this.sel.has(l.id) ? this.rotateLayer(l, m, cx, cy) : l));
        this.$('[data-pos]').textContent = `${Math.round((ang * 180) / Math.PI)}°`;
      } else if (d.kind === 'nodes') {
        const q = this.sp(d.base.x + p.x - d.start.x, d.base.y + p.y - d.start.y, new Set());
        const dx = q.x - d.base.x, dy = q.y - d.base.y;
        this.layers = JSON.parse(JSON.stringify(d.orig));
        this.nsel.forEach((sq) => { const nd = this.layer(sq.id).subs[sq.si].nodes[sq.ni]; ['x', 'ix', 'ox'].forEach((k) => (nd[k] += dx)); ['y', 'iy', 'oy'].forEach((k) => (nd[k] += dy)); });
      } else if (d.kind === 'handle') {
        this.layers = JSON.parse(JSON.stringify(d.orig));
        const nd = this.layer(d.q.id).subs[d.q.si].nodes[d.q.ni];
        const q = this.sp(p.x, p.y);
        const [a, b] = d.h === 'i' ? ['i', 'o'] : ['o', 'i'];
        nd[a + 'x'] = q.x; nd[a + 'y'] = q.y;
        if (d.smooth && !e.altKey) { const len = Math.hypot(nd[b + 'x'] - nd.x, nd[b + 'y'] - nd.y), ang = Math.atan2(nd.y - q.y, nd.x - q.x); nd[b + 'x'] = nd.x + Math.cos(ang) * len; nd[b + 'y'] = nd.y + Math.sin(ang) * len; }
      } else if (d.kind === 'create') {
        const ly = this.layer(d.id);
        let q = this.sp(p.x, p.y, new Set([d.id]));
        if (this.tool === 'line') {
          if (e.shiftKey) { const ang = Math.round(Math.atan2(q.y - d.start.y, q.x - d.start.x) / (Math.PI / 4)) * (Math.PI / 4), len = Math.hypot(q.x - d.start.x, q.y - d.start.y); q = { x: d.start.x + Math.cos(ang) * len, y: d.start.y + Math.sin(ang) * len }; }
          ly.a.x2 = q.x; ly.a.y2 = q.y;
        } else {
          let w = q.x - d.start.x, h = q.y - d.start.y;
          if (e.shiftKey) { const m = Math.max(Math.abs(w), Math.abs(h)); w = Math.sign(w || 1) * m; h = Math.sign(h || 1) * m; }
          if (this.tool === 'rect') Object.assign(ly.a, { x: Math.min(d.start.x, d.start.x + w), y: Math.min(d.start.y, d.start.y + h), width: Math.abs(w), height: Math.abs(h), rx: Math.min(Math.abs(w), Math.abs(h)) > 6 ? 3 : Math.min(Math.abs(w), Math.abs(h)) > 2 ? 1 : 0 });
          else {
            const a = { cx: d.start.x + w / 2, cy: d.start.y + h / 2, rx: Math.abs(w / 2), ry: Math.abs(h / 2) };
            if (Math.abs(a.rx - a.ry) < 1e-6) { ly.type = 'circle'; ly.a = { cx: a.cx, cy: a.cy, r: a.rx }; } else { ly.type = 'ellipse'; ly.a = a; }
          }
        }
      } else if (d.kind === 'pen-handle') {
        const nd = this.pen.subs[0].nodes[this.pen.subs[0].nodes.length - 1];
        const q = this.sp(p.x, p.y);
        nd.ox = q.x; nd.oy = q.y; nd.ix = 2 * nd.x - q.x; nd.iy = 2 * nd.y - q.y;
      }
      this.refresh();
    }
    up() {
      const d = this.drag; this.drag = null;
      this.guides.innerHTML = '';
      if (!d || d.kind === 'pan') return;
      if (d.kind === 'create') {
        const ly = this.layer(d.id), a = ly.a;
        const tiny = ly.type === 'line' ? Math.hypot(a.x2 - a.x1, a.y2 - a.y1) < 0.2 : ly.type === 'rect' ? a.width < 0.2 || a.height < 0.2 : (a.r || a.rx || 0) < 0.1;
        if (tiny) { this.layers = this.layers.filter((l) => l.id !== d.id); this.hist.pop(); this.sel.clear(); }
        else if (!this.keepTool) this.setTool('select'); // after drawing, go straight to resizing
      }
      if (d.kind === 'pen-handle') return this.refresh();
      this.changed();
    }
    dbl(e) {
      const ds = e.target.dataset || {};
      if (this.tool === 'node' && ds.anchor) { this.snapshot(); const q = { id: ds.layer, si: +ds.si, ni: +ds.ni }; const nd = this.layer(q.id).subs[q.si].nodes[q.ni]; this.setSmooth(q, !(Math.hypot(nd.ix - nd.x, nd.iy - nd.y) > 1e-3 || Math.hypot(nd.ox - nd.x, nd.oy - nd.y) > 1e-3)); return this.changed(); }
      if (!ds.layer) return;
      if (this.tool === 'select') { this.sel = new Set([ds.layer]); return this.setTool('node'); }
      if (this.tool === 'node') {
        this.convertToPath(ds.layer, true);
        const ly = this.layer(ds.layer), p = this.pt(e);
        const hit = P.nearest(ly.subs, p.x, p.y);
        if (hit.dist < 1.5) { this.snapshot(); const ni = P.insertNode(ly.subs[hit.si], hit.a, hit.b, hit.t); this.nsel = [{ id: ly.id, si: hit.si, ni }]; this.changed(); }
      }
    }
    penDown(p) {
      const q = this.sp(p.x, p.y);
      if (!this.pen) {
        this.snapshot();
        this.pen = { id: M.uid(), role: this.mode === 'raw' ? null : this.newRole, type: 'path', subs: [{ closed: false, nodes: [] }], fill: false, cls: null, extra: this.rawPaint() };
        this.layers.push(this.pen); this.sel = new Set([this.pen.id]);
      }
      const nodes = this.pen.subs[0].nodes;
      if (nodes.length > 2 && Math.hypot(nodes[0].x - q.x, nodes[0].y - q.y) < 0.6) { this.pen.subs[0].closed = true; this.finishPen(); this.changed(); return; }
      nodes.push({ x: q.x, y: q.y, ix: q.x, iy: q.y, ox: q.x, oy: q.y });
      this.drag = { kind: 'pen-handle' };
      this.refresh();
    }
    penHover(p) {
      this.draft.innerHTML = '';
      if (!this.pen) return;
      const n = this.pen.subs[0].nodes, last = n[n.length - 1];
      if (!last) return;
      const q = this.sp(p.x, p.y);
      this.draft.appendChild(el('path', { d: `M${last.x} ${last.y}C${last.ox} ${last.oy} ${q.x} ${q.y} ${q.x} ${q.y}`, class: 'pen-ghost' }));
    }
    finishPen() {
      if (!this.pen) return;
      const n = this.pen.subs[0].nodes;
      if (n.length < 2) this.layers = this.layers.filter((l) => l !== this.pen);
      else if (!this.pen.subs[0].closed && this.pen.role === 'b' && this.mode !== 'raw') this.pen.role = 'o';
      this.pen = null; if (this.draft) this.draft.innerHTML = '';
      this.onChange();
    }
    onKey(e) {
      if (!this.root.offsetParent) return; // editor not visible
      const tag = (document.activeElement && document.activeElement.tagName) || '';
      if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
      const k = e.key, mod = e.metaKey || e.ctrlKey;
      if (e.code === 'Space') { e.preventDefault(); this.space = true; this.svg.classList.add('panning'); return; }
      if (mod && k.toLowerCase() === 'z') { e.preventDefault(); return e.shiftKey ? this.redo() : this.undo(); }
      if (mod && k.toLowerCase() === 'd') { e.preventDefault(); return this.act('dup'); }
      if (mod && k.toLowerCase() === 'c' && this.sel.size) { this.clip = JSON.stringify(this.selectedLayers()); return; }
      if (mod && k.toLowerCase() === 'v' && this.clip) { e.preventDefault(); this.snapshot(); const copies = JSON.parse(this.clip).map((l) => Object.assign(M.move(l, 1, 1), { id: M.uid() })); this.layers.push(...copies); this.sel = new Set(copies.map((c) => c.id)); return this.changed(); }
      if (mod && k.toLowerCase() === 'a') { e.preventDefault(); this.sel = new Set(this.layers.map((l) => l.id)); return this.refresh(); }
      if (mod) return;
      if (k === '+' || k === '=') return this.act('zoom-in');
      if (k === '-') return this.act('zoom-out');
      if (k === '0') return this.act('zoom-fit');
      const tool = { v: 'select', a: 'node', p: 'pen', r: 'rect', e: 'ellipse', l: 'line' }[k.toLowerCase()];
      if (tool) return this.setTool(tool);
      if (k === 'Enter' || k === 'Escape') {
        if (this.pen) { this.finishPen(); return this.refresh(); }
        if (this.tool === 'node') return this.setTool('select');
        if (k === 'Escape') { this.sel.clear(); this.nsel = []; return this.refresh(); }
      }
      if (k === 'Delete' || k === 'Backspace') {
        e.preventDefault();
        if (this.tool === 'node' && this.nsel.length) return this.deleteNodes();
        if (this.sel.size) return this.act('delete');
      }
      const arrows = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[k];
      if (arrows && this.sel.size) {
        e.preventDefault();
        const st = e.shiftKey ? 1 : this.snap || 0.1, dx = arrows[0] * st, dy = arrows[1] * st;
        this.snapshot();
        if (this.tool === 'node' && this.nsel.length) this.nsel.forEach((q) => { const nd = this.layer(q.id).subs[q.si].nodes[q.ni]; ['x', 'ix', 'ox'].forEach((p) => (nd[p] += dx)); ['y', 'iy', 'oy'].forEach((p) => (nd[p] += dy)); });
        else this.layers = this.layers.map((l) => (this.sel.has(l.id) ? M.move(l, dx, dy) : l));
        this.changed();
      }
    }
    destroy() { document.removeEventListener('keydown', this.keyHandler); document.removeEventListener('keyup', this.keyUp); }
  }
  window.IconEditor = Editor;
})();
