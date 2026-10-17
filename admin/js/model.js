/* IconLi admin — layer model.
 * A layer is one shape: { id, role, type, a (geometry attrs), subs (paths), fill, cls, extra }.
 *   role : 'b' body · 'd' detail (knocked out of solid) · 'o' open stroke · 'k' knockout zone · null (raw Signature paint)
 *   type : 'path' | 'circle' | 'ellipse' | 'rect' | 'line'
 *   fill : true for solid dots (fill="currentColor" stroke="none")
 *   cls  : hover-motion name (Animated category), e.g. 'ring'
 *   extra: other attributes kept verbatim (stroke, fill-rule, pathLength, opacity …)
 */
(function () {
  const P = window.IconPath;
  const NS = 'http://www.w3.org/2000/svg';
  const n = P.num;
  let seq = 0;
  const uid = () => 'L' + Date.now().toString(36) + (seq++).toString(36);
  const GEOM = { path: ['d'], circle: ['cx', 'cy', 'r'], ellipse: ['cx', 'cy', 'rx', 'ry'], rect: ['x', 'y', 'width', 'height', 'rx', 'ry'], line: ['x1', 'y1', 'x2', 'y2'], polyline: ['points'], polygon: ['points'] };
  const PAINT = ['stroke', 'fill', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'fill-rule', 'clip-rule', 'opacity', 'stroke-opacity', 'fill-opacity', 'stroke-miterlimit'];
  const SKIP = new Set(['transform', 'id', 'class', 'style', 'data-role', 'data-anim']);

  /* ---------- Parse SVG markup → layers ---------- */
  function parseMarkup(markup, opts = {}) {
    const doc = new DOMParser().parseFromString(`<svg xmlns="${NS}">${markup}</svg>`, 'image/svg+xml');
    if (doc.querySelector('parsererror')) throw new Error('That SVG markup could not be read.');
    const layers = [];
    const unsupported = new Set();
    const walk = (el, m, paint, cls) => {
      for (const c of el.children) {
        const tag = c.localName;
        if (['defs', 'mask', 'clipPath', 'linearGradient', 'radialGradient', 'style', 'title', 'desc', 'metadata'].includes(tag)) { if (tag === 'mask' || tag === 'clipPath') unsupported.add(tag); continue; }
        const mm = c.getAttribute('transform') ? P.mul(m, P.parseTransform(c.getAttribute('transform'))) : m;
        const pp = Object.assign({}, paint);
        PAINT.forEach((k) => { if (c.hasAttribute(k)) pp[k] = c.getAttribute(k); });
        const cc = (c.getAttribute('class') || '').match(/\bia-([a-z0-9-]+)/);
        const ccls = cc ? cc[1] : c.getAttribute('data-anim') || cls;
        if (c.hasAttribute('mask') || c.hasAttribute('clip-path')) unsupported.add('mask');
        if (tag === 'g' || tag === 'svg') { walk(c, mm, pp, ccls); continue; }
        if (!GEOM[tag]) continue;
        const a = {};
        GEOM[tag].forEach((k) => { if (c.hasAttribute(k)) a[k] = c.getAttribute(k); });
        const extra = {};
        for (const at of c.attributes) if (!GEOM[tag].includes(at.name) && !SKIP.has(at.name) && !PAINT.includes(at.name)) extra[at.name] = at.value;
        Object.assign(extra, pp);
        const isDot = extra.fill && extra.fill !== 'none' && (extra.stroke === 'none' || !extra.stroke) && opts.layered;
        // layered icons get their paint from the role; explicit per-shape paint (stroke off, width, fill …) is kept as an override
        if (isDot) { delete extra.fill; delete extra.stroke; }
        const identity = mm.every((v, i) => Math.abs(v - P.I[i]) < 1e-9);
        let layer;
        if (tag !== 'path' && identity && ['circle', 'ellipse', 'rect', 'line'].includes(tag)) {
          const na = {};
          Object.keys(a).forEach((k) => (na[k] = parseFloat(a[k])));
          layer = { type: tag, a: na };
        } else {
          let subs = P.fromShape(tag, a);
          if (!identity) subs = P.transform(subs, mm);
          layer = { type: 'path', subs };
        }
        layers.push(Object.assign(layer, { id: uid(), role: c.getAttribute('data-role') || opts.role || null, fill: !!isDot, cls: ccls || null, extra }));
      }
    };
    walk(doc.documentElement, P.I, {}, null);
    return { layers, unsupported: [...unsupported] };
  }

  /* ---------- Layers → SVG markup ---------- */
  const attrs = (o) => Object.keys(o).filter((k) => o[k] != null && o[k] !== '').map((k) => ` ${k}="${String(o[k]).replace(/"/g, '&quot;')}"`).join('');
  function shapeMarkup(ly, withRole) {
    const ex = Object.assign({}, ly.extra || {});
    if (ly.fill) { ex.fill = 'currentColor'; ex.stroke = 'none'; }
    if (withRole && ly.role) ex['data-role'] = ly.role;
    if (withRole && ly.cls) ex['data-anim'] = ly.cls;
    let el;
    if (ly.type === 'path') el = `<path d="${P.serialize(ly.subs)}"${attrs(ex)}/>`;
    else if (ly.type === 'line') el = `<path d="M${n(ly.a.x1)} ${n(ly.a.y1)}L${n(ly.a.x2)} ${n(ly.a.y2)}"${attrs(ex)}/>`;
    else {
      const g = {};
      Object.keys(ly.a).forEach((k) => { if (ly.a[k] != null && !(k === 'rx' || k === 'ry') || ly.a[k]) g[k] = n(ly.a[k]); });
      el = `<${ly.type}${attrs(g)}${attrs(ex)}/>`;
    }
    return !withRole && ly.cls ? `<g class="ia ia-${ly.cls}">${el}</g>` : el;
  }
  const toMarkup = (layers) => layers.map((l) => shapeMarkup(l, true)).join('\n');
  const toRaw = (layers) => layers.map((l) => shapeMarkup(l, false)).join('');
  const toRecordLayers = (layers) => layers.filter((l) => l.role).map((l) => ({ role: l.role, svg: shapeMarkup(l, false) }));

  /* ---------- Existing icons → layers ---------- */
  // Extended def: bake optical fit, flips and badge placement into real coordinates.
  function defToLayers(def) {
    const L = window.IconLi;
    L.renderDef(def, 'outline'); // makes sure def.fit is known
    const f = def.fit || 1;
    const bd = def.badge;
    const bT = bd ? `translate(${bd.x} ${bd.y}) scale(${bd.s}) translate(-17.5 -17.5)` : '';
    const wrap = (s) => `<g transform="matrix(${f} 0 0 ${f} ${12 - 12 * f} ${12 - 12 * f})"><g transform="${def.t || ''}">${s}</g></g>`;
    const out = [];
    ['b', 'd', 'o', 'k'].forEach((role) => {
      const parts = (def[role] || []).join('');
      if (!parts) return;
      const inner = bd && (role === 'o' || role === 'k') ? `<g transform="${bT}">${parts}</g>` : parts;
      parseMarkup(wrap(inner), { layered: true, role }).layers.forEach((l) => out.push(l));
    });
    return out;
  }
  // CMS record layers ([{role, svg}]) → editable layers
  function recordToLayers(rec) {
    const out = [];
    (rec.layers || []).forEach((ly) => parseMarkup(ly.svg, { layered: true, role: ly.role }).layers.forEach((l) => out.push(l)));
    return out;
  }
  // Raw Signature body (exact paint kept)
  const rawToLayers = (body) => parseMarkup(body, { layered: false });
  // Signature outline body → auto-style layers (closed shapes become bodies, open strokes stay strokes, filled bits become dots)
  function rawToRoles(body) {
    const { layers } = parseMarkup(body, { layered: false });
    return layers.map((l) => {
      const filled = l.extra && l.extra.fill && l.extra.fill !== 'none';
      const closed = l.type !== 'path' ? l.type !== 'line' : l.subs.every((s) => s.closed);
      const out = Object.assign({}, l, { extra: {} });
      if (filled && !(l.extra.stroke && l.extra.stroke !== 'none')) { out.role = 'd'; out.fill = true; } else out.role = closed ? 'b' : 'o';
      return out;
    });
  }

  /* ---------- Editing helpers ---------- */
  function toPath(ly) {
    if (ly.type === 'path') return ly;
    const a = {};
    Object.keys(ly.a).forEach((k) => (a[k] = ly.a[k]));
    return Object.assign({}, ly, { type: 'path', subs: P.fromShape(ly.type, a), a: undefined });
  }
  function move(ly, dx, dy) {
    const c = clone(ly);
    if (c.type === 'path') c.subs = P.translate(c.subs, dx, dy);
    else if (c.type === 'circle' || c.type === 'ellipse') { c.a.cx += dx; c.a.cy += dy; }
    else if (c.type === 'rect') { c.a.x += dx; c.a.y += dy; }
    else if (c.type === 'line') { c.a.x1 += dx; c.a.y1 += dy; c.a.x2 += dx; c.a.y2 += dy; }
    return c;
  }
  function transformLayer(ly, m) {
    const p = toPath(clone(ly));
    p.subs = P.transform(p.subs, m);
    return p;
  }
  function layerSubs(ly) { return ly.type === 'path' ? ly.subs : P.fromShape(ly.type, ly.a); }
  function bounds(layers) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    layers.forEach((l) => { const b = P.bbox(layerSubs(l)); x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.w); y1 = Math.max(y1, b.y + b.h); });
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }
  function snapLayer(ly, step) {
    const c = clone(ly), s = (v) => P.snap(v, step);
    if (c.type === 'path') c.subs.forEach((sp) => sp.nodes.forEach((nd) => ['x', 'y', 'ix', 'iy', 'ox', 'oy'].forEach((k) => (nd[k] = s(nd[k])))));
    else Object.keys(c.a).forEach((k) => (c.a[k] = s(c.a[k])));
    return c;
  }
  const clone = (o) => JSON.parse(JSON.stringify(o));
  // Scale/translate with an axis-aligned matrix [sx,0,0,sy,tx,ty], keeping clean primitives where possible.
  function scaleLayer(ly, m) {
    const [sx, , , sy, tx, ty] = m;
    const X = (x) => sx * x + tx, Y = (y) => sy * y + ty;
    const c = clone(ly);
    if (c.type === 'rect' && sx > 0 && sy > 0) { const a = c.a; Object.assign(a, { x: X(a.x), y: Y(a.y), width: a.width * sx, height: a.height * sy }); a.rx = Math.min(a.rx || 0, a.width / 2, a.height / 2); if (a.ry) a.ry = Math.min(a.ry, a.width / 2, a.height / 2); return c; } // corner radius stays, like Figma
    if (c.type === 'line') { const a = c.a; Object.assign(a, { x1: X(a.x1), y1: Y(a.y1), x2: X(a.x2), y2: Y(a.y2) }); return c; }
    if (c.type === 'circle' && Math.abs(Math.abs(sx) - Math.abs(sy)) < 1e-6) { c.a = { cx: X(c.a.cx), cy: Y(c.a.cy), r: c.a.r * Math.abs(sx) }; return c; }
    if (c.type === 'circle' || c.type === 'ellipse') { const rx = c.type === 'circle' ? c.a.r : c.a.rx, ry = c.type === 'circle' ? c.a.r : c.a.ry; c.type = 'ellipse'; c.a = { cx: X(c.a.cx), cy: Y(c.a.cy), rx: rx * Math.abs(sx), ry: ry * Math.abs(sy) }; return c; }
    return transformLayer(c, m);
  }
  // Paint overrides for one shape (stored as SVG attributes on the shape)
  function getPaint(ly) {
    const ex = ly.extra || {};
    return {
      stroke: ly.fill ? false : ex.stroke !== 'none',
      fill: ly.fill ? 'solid' : ex.fill === 'none' ? 'none' : ex.fill ? 'solid' : 'auto',
      width: ex['stroke-width'] ? parseFloat(ex['stroke-width']) : null,
      cap: ex['stroke-linecap'] || 'round', join: ex['stroke-linejoin'] || 'round',
      opacity: ex.opacity != null ? parseFloat(ex.opacity) : 1,
    };
  }
  function setPaint(ly, pt, raw) {
    const ex = Object.assign({}, ly.extra || {});
    ly.fill = false;
    if (raw) {
      ex.stroke = pt.stroke ? (ex.stroke && ex.stroke !== 'none' ? ex.stroke : 'currentColor') : 'none';
      ex.fill = pt.fill === 'solid' ? 'currentColor' : 'none';
    } else {
      if (pt.stroke) delete ex.stroke; else ex.stroke = 'none';
      if (pt.fill === 'auto') delete ex.fill; else ex.fill = pt.fill === 'solid' ? 'currentColor' : 'none';
      if (!pt.stroke && pt.fill === 'solid') { ly.fill = true; delete ex.stroke; delete ex.fill; }
    }
    if (pt.width && pt.stroke) ex['stroke-width'] = String(+pt.width.toFixed(3)); else if (!raw) delete ex['stroke-width'];
    if (pt.cap && pt.cap !== 'round') ex['stroke-linecap'] = pt.cap; else if (!raw) delete ex['stroke-linecap']; else ex['stroke-linecap'] = pt.cap;
    if (pt.join && pt.join !== 'round') ex['stroke-linejoin'] = pt.join; else if (!raw) delete ex['stroke-linejoin']; else ex['stroke-linejoin'] = pt.join;
    if (pt.opacity < 0.999) ex.opacity = String(+pt.opacity.toFixed(2)); else delete ex.opacity;
    ly.extra = ex;
  }

  /* ---------- Import any SVG (Figma, Illustrator …) ---------- */
  function importSvg(text, opts = {}) {
    const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
    const svg = doc.querySelector('svg');
    if (!svg || doc.querySelector('parsererror')) throw new Error('Paste a complete <svg>…</svg> file.');
    let vb = (svg.getAttribute('viewBox') || '').split(/[\s,]+/).map(parseFloat);
    if (vb.length !== 4 || vb.some((v) => !Number.isFinite(v))) vb = [0, 0, parseFloat(svg.getAttribute('width')) || 24, parseFloat(svg.getAttribute('height')) || 24];
    const scale = 24 / Math.max(vb[2], vb[3]);
    const ox = (24 - vb[2] * scale) / 2, oy = (24 - vb[3] * scale) / 2;
    const m = `matrix(${scale} 0 0 ${scale} ${ox - vb[0] * scale} ${oy - vb[1] * scale})`;
    const res = parseMarkup(`<g transform="${m}">${svg.innerHTML}</g>`, { layered: false });
    let layers = res.layers.map((l) => {
      const filled = l.extra.fill && l.extra.fill !== 'none';
      const stroked = l.extra.stroke && l.extra.stroke !== 'none';
      const closed = l.type !== 'path' ? l.type !== 'line' : l.subs.every((s) => s.closed);
      const b = P.bbox(layerSubs(l));
      const out = Object.assign(toPath(l), { extra: {} });
      if (filled && !stroked && b.w < 3 && b.h < 3) { out.role = 'd'; out.fill = true; } else out.role = closed ? 'b' : 'o';
      return out;
    });
    if (opts.snap) layers = layers.map((l) => snapLayer(l, opts.snap));
    return { layers, unsupported: res.unsupported };
  }

  window.IconModel = { uid, scaleLayer, getPaint, setPaint, parseMarkup, toMarkup, toRaw, toRecordLayers, shapeMarkup, defToLayers, recordToLayers, rawToLayers, rawToRoles, toPath, move, transformLayer, layerSubs, bounds, snapLayer, importSvg, clone };
})();
