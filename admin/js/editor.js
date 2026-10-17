/* IconLi admin — vector icon editor.
 * Layered mode: shapes carry roles (body / detail / open / knockout) and outline, solid and duotone are generated.
 * Raw mode: Signature originals, edited per style with their exact paint.
 */
(function () {
  const P = window.IconPath, M = window.IconModel, L = window.IconLi;
  const NS = 'http://www.w3.org/2000/svg';
  const ROLE = { b: ['Body', '#9a88ff'], d: ['Detail', '#4be1c8'], o: ['Open stroke', '#f2c46d'], k: ['Knockout', '#ff7d97'] };
  const TOOLS = [['select', 'V', 'Select & move', 'Cursor'], ['node', 'A', 'Edit nodes', 'Pen Tool'], ['pen', 'P', 'Pen', 'Bezier'], ['rect', 'R', 'Rectangle', 'Checkbox Empty'], ['ellipse', 'E', 'Ellipse', 'Radio Button Off'], ['line', 'L', 'Line', 'Minus']];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const icon = (name, size = 18) => { const ic = L.icons.find((i) => i.name === name && i.style === 'outline') || L.icons.find((i) => i.name === name); return ic ? L.render(ic, { size }) : ''; };
  const el = (tag, at = {}) => { const e = document.createElementNS(NS, tag); Object.keys(at).forEach((k) => e.setAttribute(k, at[k])); return e; };

  class Editor {
    constructor(root, opts = {}) {
      this.root = root;
      this.onChange = opts.onChange || (() => {});
      this.mode = 'layered';
      this.layers = [];
      this.bodies = null;
      this.style = 'outline';
      this.sel = new Set();
      this.nsel = []; // selected nodes: { id, si, ni }
      this.tool = 'select';
      this.snap = 0.25;
      this.grid = true;
      this.keys = true;
      this.newRole = 'b';
      this.unsupported = [];
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
              <label>Snap <select data-snap aria-label="Snap step"><option value="0">Off</option><option value="0.125">⅛ px</option><option value="0.25" selected>¼ px</option><option value="0.5">½ px</option><option value="1">1 px</option></select></label>
              <label class="chk"><input type="checkbox" data-grid checked> Grid</label>
              <label class="chk"><input type="checkbox" data-keys checked> Keylines</label>
            </div>
          </div>
          <div class="ed-canvas-wrap"><svg class="ed-canvas" viewBox="-1.5 -1.5 27 27" tabindex="0" aria-label="Icon canvas"></svg></div>
          <div class="ed-status"><span data-pos>x — y —</span><span data-hint></span></div>
        </div>
        <div class="ed-side">
          <div class="tabs" role="tablist">
            ${['Layers', 'Inspect', 'Code', 'Import'].map((t, i) => `<button type="button" role="tab" data-tab="${t.toLowerCase()}" aria-selected="${i === 0}">${t}</button>`).join('')}
          </div>
          <div class="ed-panel" data-panel="layers"></div>
          <div class="ed-panel" data-panel="inspect" hidden></div>
          <div class="ed-panel" data-panel="code" hidden>
            <p class="hint">Each shape is one line. <code>data-role</code> = b (body), d (detail), o (open stroke), k (knockout). <code>data-anim</code> = hover motion.</p>
            <textarea data-code spellcheck="false" aria-label="Icon code"></textarea>
            <div class="row"><button type="button" class="btn btn-sm btn-primary" data-act="apply-code">Apply code</button><button type="button" class="btn btn-sm" data-act="copy-svg">Copy SVG (current style)</button></div>
          </div>
          <div class="ed-panel" data-panel="import" hidden>
            <p class="hint">Paste an SVG from Figma, Illustrator or anywhere, or choose a file. It is scaled to the 24px grid and converted into layers. Closed shapes become bodies, open lines become strokes and tiny filled bits become dots.</p>
            <textarea data-import placeholder="<svg viewBox=&quot;0 0 24 24&quot;>…</svg>" spellcheck="false" aria-label="SVG to import"></textarea>
            <div class="row"><label class="btn btn-sm">Choose .svg file<input type="file" accept=".svg,image/svg+xml" data-file hidden></label>
              <label class="chk"><input type="checkbox" data-isnap checked> Snap to ¼ px</label>
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
      ['grid', 'prev', 'over', 'selg', 'nodes', 'draft'].forEach((g) => { this[g] = el('g', { class: 'ed-' + g }); this.svg.appendChild(this[g]); });
      this.root.querySelectorAll('[data-tool]').forEach((b) => (b.onclick = () => this.setTool(b.dataset.tool)));
      this.root.querySelectorAll('[role=tab]').forEach((b) => (b.onclick = () => this.showTab(b.dataset.tab)));
      $('[data-snap]').onchange = (e) => (this.snap = parseFloat(e.target.value));
      $('[data-grid]').onchange = (e) => { this.grid = e.target.checked; this.drawGrid(); };
      $('[data-keys]').onchange = (e) => { this.keys = e.target.checked; this.drawGrid(); };
      this.root.addEventListener('click', (e) => { const a = e.target.closest('[data-act]'); if (a) this.act(a.dataset.act, a); });
      $('[data-file]').onchange = async (e) => { const f = e.target.files[0]; if (f) $('[data-import]').value = await f.text(); };
      this.bindCanvas();
      this.keyHandler = (e) => this.onKey(e);
      document.addEventListener('keydown', this.keyHandler);
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
      box.innerHTML = styles.map((s) => `<button type="button" data-style="${s}" aria-pressed="${s === this.style}">${s[0].toUpperCase() + s.slice(1)}${this.mode === 'raw' ? ' layer' : ''}</button>`).join('');
      box.querySelectorAll('button').forEach((b) => (b.onclick = () => {
        if (this.mode === 'raw') { this.bodies[this.style] = this.layers; this.layers = this.bodies[b.dataset.style]; this.sel.clear(); this.nsel = []; }
        this.style = b.dataset.style;
        box.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        this.refresh();
      }));
    }

    /* ---------- History ---------- */
    snapshot() { this.hist.push(JSON.stringify(this.layers)); if (this.hist.length > 120) this.hist.shift(); this.fut = []; }
    undo() { if (!this.hist.length) return; this.fut.push(JSON.stringify(this.layers)); this.layers = JSON.parse(this.hist.pop()); this.cleanSel(); this.changed(); }
    redo() { if (!this.fut.length) return; this.hist.push(JSON.stringify(this.layers)); this.layers = JSON.parse(this.fut.pop()); this.cleanSel(); this.changed(); }
    cleanSel() { const ids = new Set(this.layers.map((l) => l.id)); [...this.sel].forEach((i) => !ids.has(i) && this.sel.delete(i)); this.nsel = this.nsel.filter((n) => ids.has(n.id)); }
    changed() { if (this.mode === 'raw') this.bodies[this.style] = this.layers; this.refresh(); this.onChange(); }

    /* ---------- Drawing ---------- */
    unit() { return 27 / (this.svg.clientWidth || 540); }
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
      // live render of the current style
      this.prev.innerHTML = this.previewMarkup(this.style, 24).replace('<svg ', '<svg x="0" y="0" ');
      // editable outlines
      this.over.innerHTML = '';
      this.layers.forEach((ly) => {
        const d = P.serialize(M.layerSubs(ly));
        const col = this.mode === 'raw' ? '#b4b1d0' : (ROLE[ly.role] || ROLE.b)[1];
        const hit = el('path', { d, class: 'hit', 'data-layer': ly.id });
        const vis = el('path', { d, class: 'ov' + (this.sel.has(ly.id) ? ' on' : ''), stroke: col });
        this.over.appendChild(vis); this.over.appendChild(hit);
      });
      this.drawSelection();
      this.renderLayers();
      this.renderInspector();
      this.renderPreview();
      if (!this.$('[data-panel=code]').hidden) this.$('[data-code]').value = M.toMarkup(this.layers);
      const tb = this.root.querySelector('[data-act=undo]'), tr = this.root.querySelector('[data-act=redo]');
      tb.disabled = !this.hist.length; tr.disabled = !this.fut.length;
    }
    drawSelection() {
      this.selg.innerHTML = ''; this.nodes.innerHTML = '';
      const sl = this.layers.filter((l) => this.sel.has(l.id));
      if (!sl.length) return;
      const u = this.unit();
      if (this.tool !== 'node') {
        const b = M.bounds(sl);
        this.selg.appendChild(el('rect', { x: b.x - 0.3, y: b.y - 0.3, width: b.w + 0.6, height: b.h + 0.6, class: 'selbox' }));
        return;
      }
      sl.forEach((ly) => {
        if (ly.type !== 'path') return;
        ly.subs.forEach((s, si) => s.nodes.forEach((nd, ni) => {
          const on = this.nsel.some((q) => q.id === ly.id && q.si === si && q.ni === ni);
          if (on || this.nsel.length < 2) {
            [['i', nd.ix, nd.iy], ['o', nd.ox, nd.oy]].forEach(([h, hx, hy]) => {
              if (Math.abs(hx - nd.x) < 1e-6 && Math.abs(hy - nd.y) < 1e-6) return;
              if (!on && !this.isAdjacentSelected(ly.id, si, ni)) return;
              this.nodes.appendChild(el('line', { x1: nd.x, y1: nd.y, x2: hx, y2: hy, class: 'hline' }));
              this.nodes.appendChild(el('circle', { cx: hx, cy: hy, r: 4 * u, class: 'handle', 'data-handle': h, 'data-layer': ly.id, 'data-si': si, 'data-ni': ni }));
            });
          }
          const sz = (on ? 9 : 7) * u;
          this.nodes.appendChild(el('rect', { x: nd.x - sz / 2, y: nd.y - sz / 2, width: sz, height: sz, class: 'anchor' + (on ? ' on' : '') + (si === 0 && ni === 0 ? ' first' : ''), 'data-anchor': 1, 'data-layer': ly.id, 'data-si': si, 'data-ni': ni }));
        }));
      });
    }
    isAdjacentSelected(id, si, ni) { return this.nsel.some((q) => q.id === id && q.si === si && Math.abs(q.ni - ni) <= 1); }

    /* ---------- Side panels ---------- */
    showTab(t) {
      this.root.querySelectorAll('[role=tab]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === t)));
      this.root.querySelectorAll('[data-panel]').forEach((p) => (p.hidden = p.dataset.panel !== t));
      if (t === 'code') this.$('[data-code]').value = M.toMarkup(this.layers);
    }
    renderLayers() {
      const box = this.$('[data-panel=layers]');
      const raw = this.mode === 'raw';
      box.innerHTML = `${this.unsupported.length ? `<p class="warn">This icon uses ${this.unsupported.join(', ')}, which the canvas can't show. Edit it in Code or convert it to layers.</p>` : ''}
        ${raw ? `<p class="hint">Signature icon: each style is drawn by hand. You are editing the <b>${this.style}</b> layer. <button type="button" class="linkbtn" data-act="to-layered">Convert to auto styles</button></p>` : `<div class="row tight"><span class="hint">New shapes get</span>${Object.keys(ROLE).map((r) => `<button type="button" class="chip-role" data-act="new-role" data-role="${r}" aria-pressed="${this.newRole === r}" style="--rc:${ROLE[r][1]}">${ROLE[r][0]}</button>`).join('')}</div>`}
        <ol class="layer-list">${this.layers.map((ly, i) => `<li class="${this.sel.has(ly.id) ? 'on' : ''}" data-pick="${ly.id}">
          ${raw ? '' : `<select data-role-of="${ly.id}" aria-label="Role" style="--rc:${(ROLE[ly.role] || ROLE.b)[1]}">${Object.keys(ROLE).map((r) => `<option value="${r}" ${ly.role === r ? 'selected' : ''}>${ROLE[r][0]}</option>`).join('')}</select>`}
          <span class="lname">${ly.fill ? 'Dot' : ly.type[0].toUpperCase() + ly.type.slice(1)}${ly.cls ? ` · <em>${ly.cls}</em>` : ''}</span>
          <span class="lact"><button type="button" data-up="${i}" aria-label="Move up" title="Move up">↑</button><button type="button" data-down="${i}" aria-label="Move down" title="Move down">↓</button><button type="button" data-del="${ly.id}" aria-label="Delete layer" title="Delete">×</button></span>
        </li>`).join('') || '<li class="empty">No shapes yet. Pick a tool and draw on the canvas.</li>'}</ol>`;
      box.querySelectorAll('[data-pick]').forEach((li) => (li.onclick = (e) => { if (e.target.closest('select,button')) return; this.select(li.dataset.pick, e.shiftKey); }));
      box.querySelectorAll('[data-role-of]').forEach((s) => (s.onchange = () => { this.snapshot(); this.layer(s.dataset.roleOf).role = s.value; this.changed(); }));
      box.querySelectorAll('[data-up]').forEach((b) => (b.onclick = () => this.reorder(+b.dataset.up, -1)));
      box.querySelectorAll('[data-down]').forEach((b) => (b.onclick = () => this.reorder(+b.dataset.down, 1)));
      box.querySelectorAll('[data-del]').forEach((b) => (b.onclick = () => { this.snapshot(); this.layers = this.layers.filter((l) => l.id !== b.dataset.del); this.cleanSel(); this.changed(); }));
    }
    renderInspector() {
      const box = this.$('[data-panel=inspect]');
      const sl = this.layers.filter((l) => this.sel.has(l.id));
      const numIn = (label, key, val, step = 0.25) => `<label class="num"><span>${label}</span><input type="number" step="${step}" data-k="${key}" value="${P.num(val)}"></label>`;
      let h = '';
      if (!sl.length) h = '<p class="hint">Select a shape on the canvas or in Layers. Tips: <b>V</b> select, <b>A</b> nodes, <b>P</b> pen, double-click a path to add a point, double-click a point to make it smooth or a corner, arrows nudge (hold Shift for 1px), <b>⌘D</b> duplicate.</p>';
      else {
        h += `<div class="row tight"><button type="button" class="btn btn-sm" data-act="flip-h">Flip H</button><button type="button" class="btn btn-sm" data-act="flip-v">Flip V</button><button type="button" class="btn btn-sm" data-act="rot90">Rotate 90°</button><button type="button" class="btn btn-sm" data-act="dup">Duplicate</button><button type="button" class="btn btn-sm" data-act="snap-sel">Snap to grid</button></div>
          <div class="row tight"><span class="hint">Align to artboard</span>${['left', 'hcenter', 'right', 'top', 'vcenter', 'bottom'].map((a) => `<button type="button" class="btn btn-sm" data-act="align" data-align="${a}">${{ left: '⇤', hcenter: '↔', right: '⇥', top: '⤒', vcenter: '↕', bottom: '⤓' }[a]}</button>`).join('')}</div>`;
        if (sl.length === 1) {
          const ly = sl[0];
          if (this.mode !== 'raw') {
            const motions = window.IconLiAnim ? Object.keys(window.IconLiAnim.MOTIONS) : [];
            h += `<div class="row"><label class="chk"><input type="checkbox" data-fill ${ly.fill ? 'checked' : ''}> Solid dot (filled, no stroke)</label></div>
              <label class="num wide"><span>Hover motion</span><select data-cls><option value="">None</option>${motions.map((m) => `<option ${ly.cls === m ? 'selected' : ''}>${m}</option>`).join('')}</select></label>`;
          }
          const a = ly.a || {};
          if (ly.type === 'circle') h += `<div class="nums">${numIn('cx', 'cx', a.cx)}${numIn('cy', 'cy', a.cy)}${numIn('r', 'r', a.r)}</div>`;
          if (ly.type === 'ellipse') h += `<div class="nums">${numIn('cx', 'cx', a.cx)}${numIn('cy', 'cy', a.cy)}${numIn('rx', 'rx', a.rx)}${numIn('ry', 'ry', a.ry)}</div>`;
          if (ly.type === 'rect') h += `<div class="nums">${numIn('x', 'x', a.x)}${numIn('y', 'y', a.y)}${numIn('w', 'width', a.width)}${numIn('h', 'height', a.height)}${numIn('radius', 'rx', a.rx || 0)}</div>`;
          if (ly.type === 'line') h += `<div class="nums">${numIn('x1', 'x1', a.x1)}${numIn('y1', 'y1', a.y1)}${numIn('x2', 'x2', a.x2)}${numIn('y2', 'y2', a.y2)}</div>`;
          if (ly.type !== 'path') h += `<button type="button" class="btn btn-sm" data-act="to-path">Convert to path (edit nodes)</button>`;
          else {
            const ns = this.nsel.filter((q) => q.id === ly.id);
            if (ns.length === 1) { const nd = ly.subs[ns[0].si].nodes[ns[0].ni]; h += `<p class="hint">Selected point</p><div class="nums">${numIn('x', 'node-x', nd.x)}${numIn('y', 'node-y', nd.y)}</div><div class="row tight"><button type="button" class="btn btn-sm" data-act="smooth">Smooth</button><button type="button" class="btn btn-sm" data-act="corner">Corner</button><button type="button" class="btn btn-sm" data-act="del-node">Delete point</button></div>`; }
            h += `<div class="row tight"><button type="button" class="btn btn-sm" data-act="toggle-close">${ly.subs.every((s) => s.closed) ? 'Open path' : 'Close path'}</button><button type="button" class="btn btn-sm" data-act="reverse">Reverse</button></div>
              <label class="num wide"><span>Path data</span><textarea data-d spellcheck="false">${esc(P.serialize(ly.subs))}</textarea></label>`;
          }
        }
      }
      box.innerHTML = h;
      const ly = sl.length === 1 ? sl[0] : null;
      box.querySelectorAll('input[data-k]').forEach((inp) => (inp.onchange = () => {
        const v = parseFloat(inp.value); if (!Number.isFinite(v)) return;
        this.snapshot();
        const k = inp.dataset.k;
        if (k === 'node-x' || k === 'node-y') {
          const q = this.nsel.find((x) => x.id === ly.id), nd = ly.subs[q.si].nodes[q.ni];
          const dx = k === 'node-x' ? v - nd.x : 0, dy = k === 'node-y' ? v - nd.y : 0;
          ['', 'i', 'o'].forEach((p) => { nd[p ? p + 'x' : 'x'] += dx; nd[p ? p + 'y' : 'y'] += dy; });
        } else ly.a[k] = v;
        this.changed();
      }));
      const fill = box.querySelector('[data-fill]'); if (fill) fill.onchange = () => { this.snapshot(); ly.fill = fill.checked; this.changed(); };
      const cls = box.querySelector('[data-cls]'); if (cls) cls.onchange = () => { this.snapshot(); ly.cls = cls.value || null; this.changed(); };
      const d = box.querySelector('[data-d]'); if (d) d.onchange = () => { try { const subs = P.parse(d.value); if (!subs.length) throw 0; this.snapshot(); ly.subs = subs; this.nsel = []; this.changed(); } catch (e) { d.classList.add('bad'); } };
    }
    renderPreview() {
      const box = this.$('.ed-preview');
      const styles = this.mode === 'raw' ? Object.keys(this.bodies) : ['outline', 'solid', 'duotone'];
      const sizes = [16, 20, 24, 32, 48];
      box.innerHTML = `<div class="pv-row">${sizes.map((s) => `<span class="pv" title="${s}px">${this.previewMarkup(this.style, s)}</span>`).join('')}</div>
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
      this.tool = t;
      this.root.querySelectorAll('[data-tool]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tool === t)));
      if (t === 'node') this.layers.filter((l) => this.sel.has(l.id) && l.type !== 'path').forEach((l) => this.convertToPath(l.id, true));
      this.svg.dataset.tool = t;
      this.$('[data-hint]').textContent = { select: 'Click to select, drag to move, Shift-click to add to the selection', node: 'Drag points and handles. Double-click the path to add a point, Alt-drag a handle to break symmetry', pen: 'Click to add points, drag to curve, click the first point to close, Enter to finish', rect: 'Drag to draw (Shift for a square)', ellipse: 'Drag to draw (Shift for a circle)', line: 'Drag to draw a line' }[t];
      this.finishPen();
      this.refresh();
    }
    convertToPath(id, silent) { const i = this.layers.findIndex((l) => l.id === id); if (i < 0 || this.layers[i].type === 'path') return; if (!silent) this.snapshot(); this.layers[i] = M.toPath(this.layers[i]); if (!silent) this.changed(); }
    selectedLayers() { return this.layers.filter((l) => this.sel.has(l.id)); }
    applyMatrix(m) {
      this.snapshot();
      this.layers = this.layers.map((l) => (this.sel.has(l.id) ? M.transformLayer(l, m) : l));
      this.changed();
    }
    act(a, btn) {
      const sl = this.selectedLayers();
      const b = sl.length ? M.bounds(sl) : null;
      const cx = b ? b.x + b.w / 2 : 12, cy = b ? b.y + b.h / 2 : 12;
      if (a === 'undo') return this.undo();
      if (a === 'redo') return this.redo();
      if (a === 'new-role') { this.newRole = btn.dataset.role; return this.renderLayers(); }
      if (a === 'flip-h' && sl.length) return this.applyMatrix([-1, 0, 0, 1, 2 * cx, 0]);
      if (a === 'flip-v' && sl.length) return this.applyMatrix([1, 0, 0, -1, 0, 2 * cy]);
      if (a === 'rot90' && sl.length) return this.applyMatrix([0, 1, -1, 0, cx + cy, cy - cx]);
      if (a === 'align' && sl.length) {
        const al = btn.dataset.align;
        const dx = al === 'left' ? 2 - b.x : al === 'right' ? 22 - (b.x + b.w) : al === 'hcenter' ? 12 - cx : 0;
        const dy = al === 'top' ? 2 - b.y : al === 'bottom' ? 22 - (b.y + b.h) : al === 'vcenter' ? 12 - cy : 0;
        this.snapshot(); this.layers = this.layers.map((l) => (this.sel.has(l.id) ? M.move(l, dx, dy) : l)); return this.changed();
      }
      if (a === 'dup' && sl.length) {
        this.snapshot();
        const copies = sl.map((l) => Object.assign(M.move(l, 1, 1), { id: M.uid() }));
        this.layers.push(...copies); this.sel = new Set(copies.map((c) => c.id)); return this.changed();
      }
      if (a === 'snap-sel' && sl.length) { this.snapshot(); this.layers = this.layers.map((l) => (this.sel.has(l.id) ? M.snapLayer(l, this.snap || 0.25) : l)); return this.changed(); }
      if (a === 'to-path' && sl.length === 1) { this.convertToPath(sl[0].id); return this.setTool('node'); }
      if (a === 'toggle-close' && sl.length === 1) { this.snapshot(); const close = !sl[0].subs.every((s) => s.closed); sl[0].subs.forEach((s) => (s.closed = close)); return this.changed(); }
      if (a === 'reverse' && sl.length === 1) {
        this.snapshot();
        sl[0].subs = sl[0].subs.map((s) => ({ closed: s.closed, nodes: s.nodes.slice().reverse().map((nd) => ({ x: nd.x, y: nd.y, ix: nd.ox, iy: nd.oy, ox: nd.ix, oy: nd.iy })) }));
        this.nsel = []; return this.changed();
      }
      if (a === 'smooth' || a === 'corner') { this.snapshot(); this.nsel.forEach((q) => this.setSmooth(q, a === 'smooth')); return this.changed(); }
      if (a === 'del-node') return this.deleteNodes();
      if (a === 'apply-code') {
        try {
          const res = M.parseMarkup(this.$('[data-code]').value, { layered: this.mode !== 'raw' });
          this.snapshot(); this.layers = res.layers.map((l) => Object.assign(l, { role: this.mode === 'raw' ? null : l.role || 'b' })); this.sel.clear(); this.nsel = []; this.changed();
        } catch (e) { alert(e.message); }
        return;
      }
      if (a === 'copy-svg') { navigator.clipboard.writeText(this.previewMarkup(this.style, 24)); return; }
      if (a === 'import') {
        const msg = this.$('[data-imsg]');
        try {
          const res = M.importSvg(this.$('[data-import]').value, { snap: this.$('[data-isnap]').checked ? 0.25 : 0 });
          if (this.mode === 'raw') { msg.textContent = 'Convert this Signature icon to auto styles first, then import.'; return; }
          this.snapshot();
          this.layers = this.$('[data-iappend]').checked ? this.layers.concat(res.layers) : res.layers;
          this.sel = new Set(res.layers.map((l) => l.id)); this.changed();
          msg.textContent = `Imported ${res.layers.length} shape${res.layers.length === 1 ? '' : 's'}${res.unsupported.length ? `. Masks and clip paths were skipped.` : '.'} Check the roles in Layers.`;
        } catch (e) { msg.textContent = e.message; }
        return;
      }
      if (a === 'to-layered') {
        if (!confirm('Convert this Signature icon to auto-generated outline, solid and duotone? It will be redrawn from the outline layer.')) return;
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

    /* ---------- Canvas interaction ---------- */
    pt(e) {
      const p = this.svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
      const q = p.matrixTransform(this.svg.getScreenCTM().inverse());
      return { x: q.x, y: q.y };
    }
    sn(v) { return P.snap(v, this.snap); }
    bindCanvas() {
      const s = this.svg;
      s.addEventListener('pointerdown', (e) => this.down(e));
      s.addEventListener('pointermove', (e) => { const p = this.pt(e); this.$('[data-pos]').textContent = `x ${P.num(this.sn(p.x))}  y ${P.num(this.sn(p.y))}`; if (this.drag) this.moveDrag(e, p); else if (this.tool === 'pen') this.penHover(p); });
      s.addEventListener('pointerup', (e) => this.up(e));
      s.addEventListener('dblclick', (e) => this.dbl(e));
      s.addEventListener('pointerleave', () => (this.$('[data-pos]').textContent = 'x — y —'));
    }
    down(e) {
      this.svg.focus({ preventScroll: true });
      const p = this.pt(e), t = e.target, ds = t.dataset || {};
      this.svg.setPointerCapture(e.pointerId);
      if (this.tool === 'node' && (ds.anchor || ds.handle)) {
        const q = { id: ds.layer, si: +ds.si, ni: +ds.ni };
        if (ds.anchor) {
          const has = this.nsel.some((x) => x.id === q.id && x.si === q.si && x.ni === q.ni);
          if (e.shiftKey) { if (has) this.nsel = this.nsel.filter((x) => !(x.id === q.id && x.si === q.si && x.ni === q.ni)); else this.nsel.push(q); }
          else if (!has) this.nsel = [q];
        }
        this.snapshot();
        const ly = this.layer(q.id), nd = ly.subs[q.si].nodes[q.ni];
        const smooth = ds.handle && this.isSmooth(nd);
        this.drag = { kind: ds.anchor ? 'nodes' : 'handle', h: ds.handle, q, start: p, orig: JSON.parse(JSON.stringify(this.layers)), smooth };
        return this.refresh();
      }
      if (this.tool === 'select' || this.tool === 'node') {
        const id = ds.layer;
        if (id) {
          if (e.shiftKey) this.sel.has(id) ? this.sel.delete(id) : this.sel.add(id); else if (!this.sel.has(id)) { this.sel = new Set([id]); this.nsel = []; }
          if (this.tool === 'node') { this.convertToPath(id, true); this.refresh(); return; }
          this.snapshot();
          this.drag = { kind: 'move', start: p, orig: JSON.parse(JSON.stringify(this.layers)) };
        } else { this.sel.clear(); this.nsel = []; }
        return this.refresh();
      }
      if (this.tool === 'pen') return this.penDown(p, e);
      if (['rect', 'ellipse', 'line'].includes(this.tool)) {
        this.snapshot();
        const x = this.sn(p.x), y = this.sn(p.y);
        const ly = { id: M.uid(), role: this.mode === 'raw' ? null : this.tool === 'line' ? 'o' : this.newRole, type: this.tool, a: this.tool === 'rect' ? { x, y, width: 0, height: 0, rx: 0 } : this.tool === 'ellipse' ? { cx: x, cy: y, rx: 0, ry: 0 } : { x1: x, y1: y, x2: x, y2: y }, fill: false, cls: null, extra: this.rawPaint() };
        this.layers.push(ly); this.sel = new Set([ly.id]);
        this.drag = { kind: 'create', id: ly.id, start: { x, y } };
        this.refresh();
      }
    }
    rawPaint() { return this.mode === 'raw' ? { stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' } : {}; }
    isSmooth(nd) {
      const a = Math.atan2(nd.y - nd.iy, nd.x - nd.ix), b = Math.atan2(nd.oy - nd.y, nd.ox - nd.x);
      const hasBoth = Math.hypot(nd.ix - nd.x, nd.iy - nd.y) > 1e-3 && Math.hypot(nd.ox - nd.x, nd.oy - nd.y) > 1e-3;
      return hasBoth && Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b))) < 0.06;
    }
    moveDrag(e, p) {
      const d = this.drag;
      if (d.kind === 'move') {
        const dx = this.sn(p.x - d.start.x), dy = this.sn(p.y - d.start.y);
        this.layers = d.orig.map((l) => (this.sel.has(l.id) ? M.move(l, dx, dy) : l));
      } else if (d.kind === 'nodes') {
        const dx = this.sn(p.x - d.start.x), dy = this.sn(p.y - d.start.y);
        this.layers = JSON.parse(JSON.stringify(d.orig));
        this.nsel.forEach((q) => { const nd = this.layer(q.id).subs[q.si].nodes[q.ni]; ['x', 'ix', 'ox'].forEach((k) => (nd[k] += dx)); ['y', 'iy', 'oy'].forEach((k) => (nd[k] += dy)); });
      } else if (d.kind === 'handle') {
        this.layers = JSON.parse(JSON.stringify(d.orig));
        const nd = this.layer(d.q.id).subs[d.q.si].nodes[d.q.ni];
        const hx = this.sn(p.x), hy = this.sn(p.y);
        const [a, b] = d.h === 'i' ? ['i', 'o'] : ['o', 'i'];
        nd[a + 'x'] = hx; nd[a + 'y'] = hy;
        if (d.smooth && !e.altKey) {
          const len = Math.hypot(nd[b + 'x'] - nd.x, nd[b + 'y'] - nd.y), ang = Math.atan2(nd.y - hy, nd.x - hx);
          nd[b + 'x'] = nd.x + Math.cos(ang) * len; nd[b + 'y'] = nd.y + Math.sin(ang) * len;
        }
      } else if (d.kind === 'create') {
        const ly = this.layer(d.id);
        let x = this.sn(p.x), y = this.sn(p.y);
        if (this.tool === 'line') { ly.a.x2 = x; ly.a.y2 = y; }
        else {
          let w = x - d.start.x, h = y - d.start.y;
          if (e.shiftKey) { const m = Math.max(Math.abs(w), Math.abs(h)); w = Math.sign(w || 1) * m; h = Math.sign(h || 1) * m; }
          if (this.tool === 'rect') Object.assign(ly.a, { x: Math.min(d.start.x, d.start.x + w), y: Math.min(d.start.y, d.start.y + h), width: Math.abs(w), height: Math.abs(h), rx: Math.min(Math.abs(w), Math.abs(h)) > 6 ? 3 : 0 });
          else Object.assign(ly.a, { cx: d.start.x + w / 2, cy: d.start.y + h / 2, rx: Math.abs(w / 2), ry: Math.abs(h / 2) });
          if (this.tool === 'ellipse' && Math.abs(ly.a.rx - ly.a.ry) < 1e-6) { ly.type = 'circle'; ly.a = { cx: ly.a.cx, cy: ly.a.cy, r: ly.a.rx }; } else if (this.tool === 'ellipse' && ly.type === 'circle') { ly.type = 'ellipse'; }
        }
      } else if (d.kind === 'pen-handle') {
        const nd = this.pen.subs[0].nodes[this.pen.subs[0].nodes.length - 1];
        const hx = this.sn(p.x), hy = this.sn(p.y);
        nd.ox = hx; nd.oy = hy; nd.ix = 2 * nd.x - hx; nd.iy = 2 * nd.y - hy;
      }
      this.refresh();
    }
    up() {
      const d = this.drag; this.drag = null;
      if (!d) return;
      if (d.kind === 'create') {
        const ly = this.layer(d.id), a = ly.a;
        const tiny = ly.type === 'line' ? Math.hypot(a.x2 - a.x1, a.y2 - a.y1) < 0.2 : ly.type === 'rect' ? a.width < 0.2 || a.height < 0.2 : (a.r || a.rx) < 0.1;
        if (tiny) { this.layers = this.layers.filter((l) => l.id !== d.id); this.hist.pop(); this.sel.clear(); }
      }
      if (d.kind === 'pen-handle') return this.refresh();
      this.changed();
    }
    dbl(e) {
      if (this.tool !== 'node' && this.tool !== 'select') return;
      const ds = e.target.dataset || {};
      if (ds.anchor) { this.snapshot(); const q = { id: ds.layer, si: +ds.si, ni: +ds.ni }; const nd = this.layer(q.id).subs[q.si].nodes[q.ni]; this.setSmooth(q, !(Math.hypot(nd.ix - nd.x, nd.iy - nd.y) > 1e-3 || Math.hypot(nd.ox - nd.x, nd.oy - nd.y) > 1e-3)); return this.changed(); }
      if (ds.layer) {
        if (this.tool === 'select') { this.sel = new Set([ds.layer]); return this.setTool('node'); }
        this.convertToPath(ds.layer, true);
        const ly = this.layer(ds.layer), p = this.pt(e);
        const hit = P.nearest(ly.subs, p.x, p.y);
        if (hit.dist < 1.2) { this.snapshot(); const ni = P.insertNode(ly.subs[hit.si], hit.a, hit.b, hit.t); this.nsel = [{ id: ly.id, si: hit.si, ni }]; this.changed(); }
      }
    }
    penDown(p, e) {
      const x = this.sn(p.x), y = this.sn(p.y);
      if (!this.pen) {
        this.snapshot();
        this.pen = { id: M.uid(), role: this.mode === 'raw' ? null : this.newRole, type: 'path', subs: [{ closed: false, nodes: [] }], fill: false, cls: null, extra: this.rawPaint() };
        this.layers.push(this.pen); this.sel = new Set([this.pen.id]);
      }
      const nodes = this.pen.subs[0].nodes;
      if (nodes.length > 2 && Math.hypot(nodes[0].x - x, nodes[0].y - y) < 0.6) { this.pen.subs[0].closed = true; this.finishPen(); this.changed(); return; }
      nodes.push({ x, y, ix: x, iy: y, ox: x, oy: y });
      this.drag = { kind: 'pen-handle' };
      this.refresh();
    }
    penHover(p) {
      this.draft.innerHTML = '';
      if (!this.pen) return;
      const n = this.pen.subs[0].nodes, last = n[n.length - 1];
      if (!last) return;
      this.draft.appendChild(el('path', { d: `M${last.x} ${last.y}C${last.ox} ${last.oy} ${this.sn(p.x)} ${this.sn(p.y)} ${this.sn(p.x)} ${this.sn(p.y)}`, class: 'pen-ghost' }));
    }
    finishPen() {
      if (!this.pen) return;
      const n = this.pen.subs[0].nodes;
      if (n.length < 2) this.layers = this.layers.filter((l) => l !== this.pen);
      else if (!this.pen.subs[0].closed && this.pen.role === 'b' && this.mode !== 'raw') this.pen.role = 'o';
      this.pen = null; this.draft.innerHTML = '';
      this.onChange();
    }
    onKey(e) {
      if (!this.root.offsetParent) return; // editor not visible
      const tag = (document.activeElement && document.activeElement.tagName) || '';
      if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
      const k = e.key, mod = e.metaKey || e.ctrlKey;
      if (mod && k.toLowerCase() === 'z') { e.preventDefault(); return e.shiftKey ? this.redo() : this.undo(); }
      if (mod && k.toLowerCase() === 'd') { e.preventDefault(); return this.act('dup'); }
      if (mod) return;
      const tool = { v: 'select', a: 'node', p: 'pen', r: 'rect', e: 'ellipse', l: 'line' }[k.toLowerCase()];
      if (tool) return this.setTool(tool);
      if (k === 'Enter' || k === 'Escape') { if (this.pen) { this.finishPen(); return this.refresh(); } if (k === 'Escape') { this.sel.clear(); this.nsel = []; return this.refresh(); } }
      if (k === 'Delete' || k === 'Backspace') {
        e.preventDefault();
        if (this.tool === 'node' && this.nsel.length) return this.deleteNodes();
        if (this.sel.size) { this.snapshot(); this.layers = this.layers.filter((l) => !this.sel.has(l.id)); this.sel.clear(); return this.changed(); }
      }
      const arrows = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[k];
      if (arrows && this.sel.size) {
        e.preventDefault();
        const st = e.shiftKey ? 1 : this.snap || 0.25, dx = arrows[0] * st, dy = arrows[1] * st;
        this.snapshot();
        if (this.tool === 'node' && this.nsel.length) this.nsel.forEach((q) => { const nd = this.layer(q.id).subs[q.si].nodes[q.ni]; ['x', 'ix', 'ox'].forEach((p) => (nd[p] += dx)); ['y', 'iy', 'oy'].forEach((p) => (nd[p] += dy)); });
        else this.layers = this.layers.map((l) => (this.sel.has(l.id) ? M.move(l, dx, dy) : l));
        this.changed();
      }
    }
    destroy() { document.removeEventListener('keydown', this.keyHandler); }
  }
  window.IconEditor = Editor;
})();
