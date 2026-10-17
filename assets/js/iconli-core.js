/* IconLi core — builds the catalogue and renders SVG markup for any style / size / stroke / colour. */
(function () {
  const CATEGORIES = [
    ['animated', 'Animated'], ['interface', 'Interface'], ['arrows', 'Arrows'], ['communication', 'Communication'], ['media', 'Media'],
    ['files', 'Files'], ['devices', 'Devices'], ['connectivity', 'Connectivity'], ['commerce', 'Commerce & Finance'], ['office', 'Office & Business'],
    ['people', 'People'], ['social', 'Social & Emotions'], ['security', 'Security'], ['nature', 'Weather & Nature'], ['space', 'Space & Galaxy'],
    ['travel', 'Travel & Places'], ['health', 'Health'], ['food', 'Food & Drink'], ['education', 'Education & Science'],
    ['design', 'Design'], ['text', 'Text & Editor'], ['dev', 'Development & AI'], ['charts', 'Charts & Data'],
    ['time', 'Time'], ['lifestyle', 'Home & Lifestyle'], ['games', 'Sports & Games'],
    ['letters', 'Letters & Numbers'], ['currency', 'Currency'], ['math', 'Math & Symbols'], ['shapes', 'Shapes & Geometry'],
  ];
  const BASE_STROKE = 1.5; // geometry is drawn at 1.5; render strokes scale from here
  /* CMS data (assets/js/icons-cms.js, written by the admin's Publish). Drafts never reach the live catalogue. */
  const CMS = (typeof window !== 'undefined' && window.ICONLI_CMS) || {};
  const SETTINGS = Object.assign({ stroke: 1.5, color: '#212226', duotone: 0.22, corner: 1.5, styles: { outline: true, solid: true, duotone: true } }, CMS.settings || {});
  SETTINGS.styles = Object.assign({ outline: true, solid: true, duotone: true }, (CMS.settings || {}).styles || {});
  const RECS = CMS.icons || {};
  const live = (rec) => rec && (rec.status || 'published') === 'published';
  const hidden = (rec) => rec && rec.status === 'hidden';
  if (Array.isArray(CMS.categories) && CMS.categories.length) {
    const base = CATEGORIES.slice();
    CATEGORIES.length = 0;
    CMS.categories.forEach(([k, label, isHidden]) => { if (!isHidden) CATEGORIES.push([k, label]); });
    base.forEach(([k, label]) => { if (!CMS.categories.some(([c]) => c === k)) CATEGORIES.push([k, label]); });
  }
  const hiddenCats = new Set((CMS.categories || []).filter((c) => c[2]).map((c) => c[0]));
  // Editor layers [{ role: 'b'|'d'|'o'|'k', svg: '<path …/>' }] → drawing def
  function layersToDef(rec) {
    const def = { cat: rec.cat, name: rec.name, tags: rec.tags || '', b: [], d: [], o: [], k: [], fit: rec.fit || 1, cms: true };
    (rec.layers || []).forEach((ly) => { if (def[ly.role]) def[ly.role].push(ly.svg); });
    return def;
  }
  const slug = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  /* Soft corners: the Signature set never has sharp geometric corners (objects use ~1.5–3px radii).
     Every corner where two straight segments meet is rounded with a true circular fillet (clamped to the edges),
     so extended icons match. Studio-drawn icons (def.cms) keep exactly what was drawn. */
  const fmt = (v) => { const r = Math.round(v * 1000) / 1000; return String(Object.is(r, -0) ? 0 : r); };
  function absSegs(d) {
    const t = String(d).match(/[MmLlHhVvCcSsQqTtAaZz]|-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g) || [];
    const subs = []; let i = 0, cmd = '', x = 0, y = 0, sx = 0, sy = 0, sub = null, lc = null, lq = null;
    const n = () => +t[i++];
    while (i < t.length) {
      if (/[a-zA-Z]/.test(t[i])) cmd = t[i++];
      const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase(), ox = rel ? x : 0, oy = rel ? y : 0;
      if (C === 'Z') { if (sub) { sub.closed = true; x = sx; y = sy; } sub = null; lc = lq = null; continue; }
      if (C === 'M') { x = n() + ox; y = n() + oy; sx = x; sy = y; sub = { start: [x, y], segs: [], closed: false }; subs.push(sub); cmd = rel ? 'l' : 'L'; lc = lq = null; continue; }
      if (!sub) { sub = { start: [x, y], segs: [], closed: false }; subs.push(sub); }
      let seg;
      if (C === 'L') { const nx = n() + ox, ny = n() + oy; seg = { t: 'L', p: [nx, ny] }; }
      else if (C === 'H') seg = { t: 'L', p: [n() + (rel ? x : 0), y] };
      else if (C === 'V') seg = { t: 'L', p: [x, n() + (rel ? y : 0)] };
      else if (C === 'C') { const a = [n() + ox, n() + oy, n() + ox, n() + oy, n() + ox, n() + oy]; seg = { t: 'C', c: a.slice(0, 4), p: a.slice(4) }; }
      else if (C === 'S') { const r1 = lc ? [2 * x - lc[0], 2 * y - lc[1]] : [x, y]; const a = [n() + ox, n() + oy, n() + ox, n() + oy]; seg = { t: 'C', c: [r1[0], r1[1], a[0], a[1]], p: a.slice(2) }; }
      else if (C === 'Q') { const a = [n() + ox, n() + oy, n() + ox, n() + oy]; seg = { t: 'Q', c: a.slice(0, 2), p: a.slice(2) }; }
      else if (C === 'T') { const q = lq ? [2 * x - lq[0], 2 * y - lq[1]] : [x, y]; seg = { t: 'Q', c: q, p: [n() + ox, n() + oy] }; }
      else if (C === 'A') { const a = [n(), n(), n(), n(), n()]; seg = { t: 'A', a, p: [n() + ox, n() + oy] }; }
      else { i++; continue; }
      lc = seg.t === 'C' ? seg.c.slice(2) : null; lq = seg.t === 'Q' ? seg.c : null;
      seg.from = [x, y]; x = seg.p[0]; y = seg.p[1];
      if (!(seg.t === 'L' && Math.hypot(x - seg.from[0], y - seg.from[1]) < 1e-6)) sub.segs.push(seg);
    }
    return subs;
  }
  function roundD(d, R) {
    const subs = absSegs(d);
    let out = '';
    subs.forEach((s) => {
      const segs = s.segs.slice();
      if (s.closed && segs.length) { const last = segs[segs.length - 1].p; if (Math.hypot(last[0] - s.start[0], last[1] - s.start[1]) > 1e-6) segs.push({ t: 'L', from: last, p: s.start.slice(), close: true }); }
      const N = segs.length;
      if (!N) { out += `M${fmt(s.start[0])} ${fmt(s.start[1])}` + (s.closed ? 'Z' : ''); return; }
      const len = (g) => Math.hypot(g.p[0] - g.from[0], g.p[1] - g.from[1]);
      const corner = new Array(N).fill(null); // corner[k]: fillet at the end of segment k
      for (let k = 0; k < N; k++) {
        const nk = k + 1 < N ? k + 1 : s.closed ? 0 : -1;
        if (nk < 0) continue;
        const a = segs[k], b = segs[nk];
        if (a.t !== 'L' || b.t !== 'L') continue;
        const la = len(a), lb = len(b);
        const u = [(a.p[0] - a.from[0]) / la, (a.p[1] - a.from[1]) / la], v = [(b.p[0] - b.from[0]) / lb, (b.p[1] - b.from[1]) / lb];
        const phi = Math.acos(Math.max(-1, Math.min(1, u[0] * v[0] + u[1] * v[1])));
        if (phi < 0.2 || phi > 3.0) continue;
        let tt = R * Math.tan(phi / 2);
        tt = Math.min(tt, la * 0.48, lb * 0.48);
        const rr = tt / Math.tan(phi / 2), h = (4 / 3) * Math.tan(phi / 4) * rr, V = a.p;
        corner[k] = { t: tt, A: [V[0] - u[0] * tt, V[1] - u[1] * tt], B: [V[0] + v[0] * tt, V[1] + v[1] * tt], c1: [V[0] - u[0] * (tt - h), V[1] - u[1] * (tt - h)], c2: [V[0] + v[0] * (tt - h), V[1] + v[1] * (tt - h)] };
      }
      const P = (p) => `${fmt(p[0])} ${fmt(p[1])}`;
      const lastC = s.closed ? corner[N - 1] : null;
      out += 'M' + P(lastC ? lastC.B : s.start);
      segs.forEach((g, k) => {
        const cn = corner[k];
        if (g.t === 'L') out += 'L' + P(cn ? cn.A : g.p);
        else if (g.t === 'C') out += 'C' + P(g.c.slice(0, 2)) + ' ' + P(g.c.slice(2)) + ' ' + P(g.p);
        else if (g.t === 'Q') out += 'Q' + P(g.c) + ' ' + P(g.p);
        else out += `A${g.a.map(fmt).join(' ')} ${P(g.p)}`;
        if (cn) out += 'C' + P(cn.c1) + ' ' + P(cn.c2) + ' ' + P(cn.B);
      });
      if (s.closed) out += 'Z';
    });
    return out;
  }
  const smoothCache = new WeakMap();
  function smoothParts(arr, R) {
    return (arr || []).map((el) => el
      .replace(/(<path\b[^>]*?\sd=")([^"]+)(")/g, (m, a, d, b) => { try { return a + roundD(d, R) + b; } catch (e) { return m; } })
      .replace(/<rect\b([^>]*?)\/>/g, (m, at) => {
        const g = (k) => { const x = at.match(new RegExp(`\\s${k}="([^"]*)"`)); return x ? parseFloat(x[1]) : 0; };
        const w = g('width'), h = g('height'), rx = g('rx');
        if (rx >= R * 0.66 || !w || !h) return m;
        const nr = fmt(Math.min(R, w / 3, h / 3));
        return '<rect' + (/\srx="/.test(at) ? at.replace(/\srx="[^"]*"/, ` rx="${nr}"`) : at + ` rx="${nr}"`) + '/>';
      }));
  }
  // The def as it is drawn on the site (soft corners baked in). Studio-drawn icons are returned untouched.
  function smoothDef(def) {
    const R = +SETTINGS.corner || 0;
    if (!R || def.cms || def.sharp) return def;
    let c = smoothCache.get(def);
    if (!c || c.R !== R) { c = { R, def: Object.assign({}, def, { b: smoothParts(def.b, R), d: smoothParts(def.d, R * 0.67), o: smoothParts(def.o, R * 0.67), k: def.k }) }; smoothCache.set(def, c); }
    return c.def;
  }

  /* Extended icons: compose body for each style from b / d / o parts. */
  function extBody(def0, style, swIn) {
    const def = smoothDef(def0);
    // fit: optical scale (Signature objects span ~19–20px); strokes are counter-scaled to stay true.
    const f = def0.fit || 1;
    const sw = +(swIn / f).toFixed(4);
    const join = (a) => (a || []).join('');
    const strokeAttrs = `stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"`;
    // k: knockout zones (e.g. a badge) cut from the body and details in every style, leaving a clean gap.
    const bd = def.badge;
    const bT = bd ? ` transform="translate(${bd.x} ${bd.y}) scale(${bd.s}) translate(-17.5 -17.5)"` : '';
    const knock = join(def.k);
    const knockG = knock ? `<g${bT} fill="#000" stroke="#000" stroke-width="${bd ? (sw + 1.5) / bd.s : sw + 2.5}" stroke-linejoin="round">${knock}</g>` : '';
    // badge strokes are counter-scaled so they keep the same visual weight as the rest of the glyph
    const openG = (a) => (a && a.length ? (bd ? `<g ${strokeAttrs} fill="none"><g${bT} stroke-width="${sw / bd.s}">${join(a)}</g></g>` : `<g ${strokeAttrs} fill="none">${join(a)}</g>`) : '');
    const maskDef = (id, inner) => `<mask id="__ID__${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24"><rect width="24" height="24" fill="#fff"/>${inner}</mask>`;
    const kAttr = knock ? ' mask="url(#__ID__z)"' : '';
    let out = knock ? `<defs>${maskDef('z', knockG)}</defs>` : '';
    if (style === 'outline') {
      out += `<g ${strokeAttrs} fill="none"${kAttr}>${join(def.b)}${join(def.d)}</g>${openG(def.o)}`;
    } else if (style === 'duotone') {
      out += `<g${kAttr}><g fill="currentColor" opacity="${SETTINGS.duotone}">${join(def.b)}</g><g ${strokeAttrs} fill="none">${join(def.b)}${join(def.d)}</g></g>${openG(def.o)}`;
    } else {
      const details = join(def.d);
      const solidMask = details || knock
        ? `<defs>${maskDef('k', `<g stroke="#000" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" fill="none">${details.replace(/currentColor/g, '#000')}</g>${knockG}`)}</defs>`
        : '';
      out = `${solidMask}<g${solidMask ? ' mask="url(#__ID__k)"' : ''} fill="currentColor" ${strokeAttrs}>${join(def.b)}</g>`;
      out += openG(def.o);
    }
    if (def.t) out = `<g transform="${def.t}">${out}</g>`;
    if (f !== 1) out = `<g transform="matrix(${f} 0 0 ${f} ${+(12 - 12 * f).toFixed(4)} ${+(12 - 12 * f).toFixed(4)})">${out}</g>`;
    return out;
  }

  /* Optical fit: size each extended icon to the Signature tiers. Bare glyphs stay ~12px;
     objects/containers grow toward 19–20px and never leave the 2px safe area.
     Uses the precomputed table (icons-fit.js) when present, otherwise measures lazily in the browser. */
  let probe = null;
  function measureFit(def) {
    if (typeof document === 'undefined' || !document.body) return 1;
    if (!probe) {
      probe = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      probe.setAttribute('width', '24'); probe.setAttribute('height', '24');
      probe.setAttribute('aria-hidden', 'true');
      probe.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden';
      document.body.appendChild(probe);
    }
    probe.innerHTML = extBody(Object.assign({}, def, { fit: 1 }), 'outline', BASE_STROKE).replace(/__ID__/g, 'fit-');
    const b = probe.getBBox();
    const size = Math.max(b.width, b.height);
    const edge = Math.max(12 - b.x, 12 - b.y, b.x + b.width - 12, b.y + b.height - 12, 0.01);
    return size >= 14 ? +Math.min(1.09, 20 / size, 10 / edge).toFixed(3) : 1;
  }
  function ensureFit(def) {
    if (def.fit != null) return;
    const table = (typeof window !== 'undefined' && window.ICONLI_FIT) || {};
    def.fit = table[def.cat + '/' + def.name] != null ? table[def.cat + '/' + def.name] : measureFit(def);
  }

  /* Original icons ship with explicit stroke widths; scale them proportionally. */
  function scaleStroke(body, sw) {
    if (sw === BASE_STROKE) return body;
    const k = sw / BASE_STROKE;
    return body.replace(/stroke-width="([\d.]+)"/g, (_, v) => `stroke-width="${+(parseFloat(v) * k).toFixed(3)}"`);
  }

  const icons = [];
  const byKey = new Map();
  function push(icon) {
    icon.slug = slug(icon.name) + (icon.style === 'outline' ? '' : '-' + icon.style);
    icon.uid = icons.length;
    icons.push(icon);
    byKey.set(icon.name + '|' + icon.style, icon);
  }

  const allowStyle = (style, rec) => SETTINGS.styles[style] !== false && (!rec || !rec.styles || rec.styles.includes(style));
  // Signature (Figma) set: families keyed by name; a CMS record can hide, retag or redraw them.
  const ORIG = window.ICONLI_ORIG || [];
  const origFam = new Map();
  ORIG.forEach((row) => { if (!origFam.has(row[1])) origFam.set(row[1], []); origFam.get(row[1]).push(row); });
  const extraDefs = [];
  origFam.forEach((rows, name) => {
    const rec = RECS['o:' + name];
    if (hidden(rec) || hiddenCats.has(rows[0][2])) return;
    const use = live(rec) ? rec : null;
    if (use && use.kind === 'layers') { extraDefs.push(Object.assign(layersToDef(use), { sig: true, srcKey: 'o:' + name })); return; }
    const nm = use ? use.name || name : name, cat = use ? use.cat || rows[0][2] : rows[0][2], tags = use ? use.tags || '' : '';
    rows.forEach(([id, , , style, body]) => {
      if (!allowStyle(style, use)) return;
      const b = use && use.bodies && use.bodies[style] != null ? use.bodies[style] : body;
      push({ id, name: nm, cat, style, sig: true, tags, body: b, kind: 'orig', srcKey: 'o:' + name });
    });
    const solid = byKey.get(nm + '|solid'), outline = byKey.get(nm + '|outline');
    if (solid && outline && !byKey.has(nm + '|duotone') && allowStyle('duotone', use)) push({ id: rows[0][0] + 'd', name: nm, cat, style: 'duotone', sig: true, tags, kind: 'origDuo', solid, outline, srcKey: 'o:' + name });
  });
  // Extended set (+ CMS redraws) and brand-new CMS icons
  const compDefs = [];
  const pushDef = (def, i, srcKey, rec) => {
    if (def.comp) { compDefs.push([def, i, srcKey, rec]); return; }
    if (hiddenCats.has(def.cat)) return;
    const styles = def.b && def.b.length ? ['outline', 'solid', 'duotone'] : ['outline'];
    styles.filter((st) => allowStyle(st, rec)).forEach((style) => push({ id: 'x' + i + style[0], name: def.name, cat: def.cat, style, sig: !!def.sig, tags: def.tags || '', def, kind: 'ext', srcKey }));
  };
  (window.ICONLI_EXT || []).forEach((def, i) => {
    const key = 'x:' + def.cat + '/' + def.name;
    const rec = RECS[key];
    if (hidden(rec)) return;
    if (live(rec) && rec.kind === 'layers') pushDef(layersToDef(rec), i, key, rec);
    else if (live(rec)) pushDef(Object.assign({}, def, { name: rec.name || def.name, cat: rec.cat || def.cat, tags: rec.tags != null ? rec.tags : def.tags }), i, key, rec);
    else pushDef(def, i, key);
  });
  extraDefs.forEach((def, i) => pushDef(def, 'o' + i, def.srcKey, RECS[def.srcKey]));
  Object.keys(RECS).filter((k) => k.startsWith('n:') && live(RECS[k])).forEach((k, i) => pushDef(layersToDef(RECS[k]), 'n' + i, k, RECS[k]));
  // Modifier families (e.g. "Folder Lock"): a base icon + a small badge with a clean gap (icons-cat-variants.js)
  const MODS = (typeof window !== 'undefined' && window.ICONLI_MODS) || {};
  compDefs.forEach(([def, i, srcKey, rec]) => {
    if (!MODS[def.comp.mod] || byKey.has(def.name + '|outline')) return;
    const b0 = byKey.get(def.comp.base + '|outline');
    if (!b0 || hiddenCats.has(def.cat || b0.cat)) return;
    ['outline', 'solid', 'duotone'].forEach((style) => {
      const base = byKey.get(def.comp.base + '|' + style);
      if (!base || !allowStyle(style, rec)) return;
      push({ id: 'c' + i + style[0], name: def.name, cat: def.cat || base.cat, style, sig: false, tags: def.tags || '', def, kind: 'comp', base, mod: def.comp.mod, srcKey });
    });
  });

  let uidSeq = 0;
  let animCssDone = false;
  function ensureAnimCss() {
    if (animCssDone || typeof document === 'undefined' || !document.head) return;
    animCssDone = true;
    const st = document.createElement('style');
    st.id = 'iconli-anim-css';
    st.textContent = window.IconLiAnim.css();
    document.head.appendChild(st);
  }
  function body(icon, sw) {
    if (icon.kind === 'comp') {
      const m = window.ICONLI_MODS[icon.mod];
      const knock = `<g fill="#000" stroke="#000" stroke-width="${sw + 2.5}" stroke-linecap="round" stroke-linejoin="round">${m.k}</g>`;
      return `<defs><mask id="__ID__c" maskUnits="userSpaceOnUse" x="-2" y="-2" width="28" height="28"><rect x="-2" y="-2" width="28" height="28" fill="#fff"/>${knock}</mask></defs><g mask="url(#__ID__c)">${body(icon.base, sw)}</g><g stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" fill="none">${m.g}</g>`;
    }
    if (icon.kind === 'ext') { ensureFit(icon.def); return extBody(icon.def, icon.style, sw); }
    if (icon.kind === 'origDuo') return `<g opacity="${SETTINGS.duotone}">${scaleStroke(icon.solid.body, sw)}</g>${scaleStroke(icon.outline.body, sw)}`;
    return scaleStroke(icon.body, sw);
  }

  /**
   * render(icon, { size, stroke, color, gradient:[c1,c2], bg, radius, padding, forExport })
   */
  function render(icon, o = {}) {
    if (!icon) return '';
    const size = o.size || 24;
    const sw = o.stroke == null ? SETTINGS.stroke : o.stroke;
    const id = 'il' + (++uidSeq).toString(36);
    let inner = body(icon, sw).replace(/__ID__/g, id + '-');
    let defs = '';
    let paint = o.color || 'currentColor';
    if (o.gradient) {
      defs += `<linearGradient id="${id}g" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse"><stop stop-color="${o.gradient[0]}"/><stop offset="1" stop-color="${o.gradient[1]}"/></linearGradient>`;
      paint = `url(#${id}g)`;
    }
    if (paint !== 'currentColor') inner = inner.replace(/currentColor/g, paint);
    const pad = o.padding || 0;
    const vb = `${-pad} ${-pad} ${24 + pad * 2} ${24 + pad * 2}`;
    let bg = '';
    if (o.bg) bg = `<rect x="${-pad}" y="${-pad}" width="${24 + pad * 2}" height="${24 + pad * 2}" rx="${((o.radius || 0) / 100) * (12 + pad)}" fill="${o.bg}"/>`;
    // Hover animations: parts tagged class="ia ia-<motion>" (see icons-cat-animated.js)
    let anim = '', style = '';
    if (inner.indexOf('class="ia ') !== -1 && window.IconLiAnim) {
      const kinds = [...new Set([...inner.matchAll(/ia-([a-z0-9-]+)/g)].map((m) => m[1]))].filter((k) => window.IconLiAnim.MOTIONS[k]);
      anim = ` class="iconli-anim"${o.loop ? ' data-loop=""' : ''}`;
      if (o.forExport) style = `<style>${window.IconLiAnim.css(kinds)}</style>`;
      else ensureAnimCss();
    }
    const head = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${vb}" fill="none"${anim}`;
    return `${head}${o.forExport ? '' : ' aria-hidden="true"'}>${style}${defs ? `<defs>${defs}</defs>` : ''}${bg}${inner}</svg>`;
  }

  /* Tokens: "heart", "heart-solid", "heart-duotone" (the icon's slug). */
  const bySlug = new Map(icons.map((i) => [i.slug, i]));
  const get = (token) => bySlug.get(String(token || '').trim().toLowerCase()) || null;
  const svg = (token, o) => render(get(token), o);
  const fitTable = () => {
    const t = {};
    (window.ICONLI_EXT || []).forEach((d) => { if (d.comp) return; ensureFit(d); t[d.cat + '/' + d.name] = d.fit; });
    return t;
  };

  // Editor helpers: render a drawing def or a raw SVG body without adding it to the catalogue
  const renderDef = (def, style, o) => render({ kind: 'ext', def: Object.assign({ fit: 1 }, def), style }, o);
  const renderBody = (b, o) => render({ kind: 'orig', body: b }, o);

  window.IconLi = Object.assign(window.IconLi || {}, {
    icons, categories: CATEGORIES, render, slug, get, svg, tokens: () => [...bySlug.keys()], fitTable, BASE_STROKE, version: '1.0.0',
    settings: SETTINGS, cms: CMS, renderDef, renderBody, layersToDef, smoothDef,
    source: { orig: ORIG, ext: window.ICONLI_EXT || [] },
  });
})();
