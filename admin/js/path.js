/* IconLi admin — path engine.
 * Paths are edited as subpaths of nodes: { x, y, ix, iy, ox, oy } where (ix,iy) is the incoming Bézier handle and
 * (ox,oy) the outgoing one. A segment whose handles sit on its anchors is a straight line.
 */
(function () {
  const EPS = 1e-6;
  const num = (v) => {
    const r = Math.round(v * 1000) / 1000;
    return (Object.is(r, -0) ? 0 : r).toString();
  };

  /* ---------- Parsing ---------- */
  function tokenize(d) {
    const out = [];
    const re = /([MmLlHhVvCcSsQqTtAaZz])|(-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?)/g;
    let m;
    while ((m = re.exec(d))) out.push(m[1] || parseFloat(m[2]));
    return out;
  }
  // SVG arc → cubic Béziers (SVG spec F.6.5)
  function arcToCubic(x1, y1, rx, ry, phiDeg, fa, fs, x2, y2) {
    if (!rx || !ry) return [[x1, y1, x2, y2, x2, y2]];
    const phi = (phiDeg * Math.PI) / 180, cos = Math.cos(phi), sin = Math.sin(phi);
    const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2;
    const x1p = cos * dx + sin * dy, y1p = -sin * dx + cos * dy;
    rx = Math.abs(rx); ry = Math.abs(ry);
    const lam = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
    if (lam > 1) { rx *= Math.sqrt(lam); ry *= Math.sqrt(lam); }
    const sign = fa === fs ? -1 : 1;
    const sq = Math.max(0, (rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p) / (rx * rx * y1p * y1p + ry * ry * x1p * x1p));
    const coef = sign * Math.sqrt(sq);
    const cxp = (coef * rx * y1p) / ry, cyp = (-coef * ry * x1p) / rx;
    const cx = cos * cxp - sin * cyp + (x1 + x2) / 2, cy = sin * cxp + cos * cyp + (y1 + y2) / 2;
    const ang = (ux, uy, vx, vy) => {
      const a = Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
      return a;
    };
    let t1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
    let dt = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
    if (!fs && dt > 0) dt -= 2 * Math.PI;
    if (fs && dt < 0) dt += 2 * Math.PI;
    const segs = Math.ceil(Math.abs(dt) / (Math.PI / 2) - EPS);
    const out = [];
    const step = dt / segs;
    const k = (4 / 3) * Math.tan(step / 4);
    for (let i = 0; i < segs; i++) {
      const a1 = t1 + i * step, a2 = a1 + step;
      const p = (a) => [Math.cos(a), Math.sin(a)];
      const [c1, s1] = p(a1), [c2, s2] = p(a2);
      const pts = [[c1 - k * s1, s1 + k * c1], [c2 + k * s2, s2 - k * c2], [c2, s2]];
      const m = pts.map(([u, v]) => [cx + rx * u * cos - ry * v * sin, cy + rx * u * sin + ry * v * cos]);
      out.push([m[0][0], m[0][1], m[1][0], m[1][1], m[2][0], m[2][1]]);
    }
    return out;
  }
  function parse(d) {
    const t = tokenize(String(d || ''));
    const subs = [];
    let i = 0, cmd = null, cx = 0, cy = 0, sx = 0, sy = 0, cur = null, lastC = null, lastQ = null;
    const nextNum = () => t[i++];
    const start = (x, y) => { cur = { closed: false, nodes: [{ x, y, ix: x, iy: y, ox: x, oy: y }] }; subs.push(cur); sx = x; sy = y; };
    const lineTo = (x, y) => { if (!cur) start(cx, cy); cur.nodes.push({ x, y, ix: x, iy: y, ox: x, oy: y }); };
    const curveTo = (x1, y1, x2, y2, x, y) => {
      if (!cur) start(cx, cy);
      const prev = cur.nodes[cur.nodes.length - 1];
      prev.ox = x1; prev.oy = y1;
      cur.nodes.push({ x, y, ix: x2, iy: y2, ox: x, oy: y });
    };
    while (i < t.length) {
      if (typeof t[i] === 'string') cmd = t[i++];
      else if (cmd === null) { i++; continue; }
      const rel = cmd === cmd.toLowerCase() && cmd !== 'z' ? 1 : 0;
      const C = cmd.toUpperCase();
      if (C === 'Z') {
        if (cur) {
          cur.closed = true;
          const f = cur.nodes[0], l = cur.nodes[cur.nodes.length - 1];
          if (cur.nodes.length > 1 && Math.abs(f.x - l.x) < 1e-4 && Math.abs(f.y - l.y) < 1e-4) { f.ix = l.ix; f.iy = l.iy; cur.nodes.pop(); }
        }
        cx = sx; cy = sy; cur = null; lastC = lastQ = null;
        continue;
      }
      if (C === 'M') { const x = nextNum() + (rel ? cx : 0), y = nextNum() + (rel ? cy : 0); start(x, y); cx = x; cy = y; cmd = rel ? 'l' : 'L'; lastC = lastQ = null; continue; }
      if (C === 'L') { const x = nextNum() + (rel ? cx : 0), y = nextNum() + (rel ? cy : 0); lineTo(x, y); cx = x; cy = y; lastC = lastQ = null; continue; }
      if (C === 'H') { const x = nextNum() + (rel ? cx : 0); lineTo(x, cy); cx = x; lastC = lastQ = null; continue; }
      if (C === 'V') { const y = nextNum() + (rel ? cy : 0); lineTo(cx, y); cy = y; lastC = lastQ = null; continue; }
      if (C === 'C') {
        const a = [nextNum(), nextNum(), nextNum(), nextNum(), nextNum(), nextNum()];
        if (rel) for (let k = 0; k < 6; k += 2) { a[k] += cx; a[k + 1] += cy; }
        curveTo(...a); lastC = [a[2], a[3]]; lastQ = null; cx = a[4]; cy = a[5]; continue;
      }
      if (C === 'S') {
        const a = [nextNum(), nextNum(), nextNum(), nextNum()];
        if (rel) for (let k = 0; k < 4; k += 2) { a[k] += cx; a[k + 1] += cy; }
        const x1 = lastC ? 2 * cx - lastC[0] : cx, y1 = lastC ? 2 * cy - lastC[1] : cy;
        curveTo(x1, y1, a[0], a[1], a[2], a[3]); lastC = [a[0], a[1]]; lastQ = null; cx = a[2]; cy = a[3]; continue;
      }
      if (C === 'Q' || C === 'T') {
        let qx, qy, x, y;
        if (C === 'Q') { qx = nextNum() + (rel ? cx : 0); qy = nextNum() + (rel ? cy : 0); }
        else { qx = lastQ ? 2 * cx - lastQ[0] : cx; qy = lastQ ? 2 * cy - lastQ[1] : cy; }
        x = nextNum() + (rel ? cx : 0); y = nextNum() + (rel ? cy : 0);
        curveTo(cx + (2 / 3) * (qx - cx), cy + (2 / 3) * (qy - cy), x + (2 / 3) * (qx - x), y + (2 / 3) * (qy - y), x, y);
        lastQ = [qx, qy]; lastC = null; cx = x; cy = y; continue;
      }
      if (C === 'A') {
        const rx = nextNum(), ry = nextNum(), rot = nextNum(), fa = nextNum(), fs = nextNum();
        const x = nextNum() + (rel ? cx : 0), y = nextNum() + (rel ? cy : 0);
        arcToCubic(cx, cy, rx, ry, rot, fa ? 1 : 0, fs ? 1 : 0, x, y).forEach((c) => curveTo(...c));
        cx = x; cy = y; lastC = lastQ = null; continue;
      }
      i++; // unknown token
    }
    return subs.filter((s) => s.nodes.length);
  }

  /* ---------- Serializing ---------- */
  const isLine = (a, b) => Math.abs(a.ox - a.x) < EPS && Math.abs(a.oy - a.y) < EPS && Math.abs(b.ix - b.x) < EPS && Math.abs(b.iy - b.y) < EPS;
  function serialize(subs) {
    let d = '';
    for (const s of subs) {
      const n = s.nodes;
      if (!n.length) continue;
      d += `M${num(n[0].x)} ${num(n[0].y)}`;
      const seg = (a, b) => (isLine(a, b) ? `L${num(b.x)} ${num(b.y)}` : `C${num(a.ox)} ${num(a.oy)} ${num(b.ix)} ${num(b.iy)} ${num(b.x)} ${num(b.y)}`);
      for (let k = 1; k < n.length; k++) d += seg(n[k - 1], n[k]);
      if (s.closed) {
        if (n.length > 1 && !isLine(n[n.length - 1], n[0])) d += seg(n[n.length - 1], n[0]);
        d += 'Z';
      }
    }
    return d;
  }

  /* ---------- Shapes → paths ---------- */
  const A = (el, k, dflt = 0) => { const v = parseFloat(el[k]); return Number.isFinite(v) ? v : dflt; };
  function fromShape(tag, at) {
    if (tag === 'path') return parse(at.d);
    if (tag === 'line') return parse(`M${A(at, 'x1')} ${A(at, 'y1')}L${A(at, 'x2')} ${A(at, 'y2')}`);
    if (tag === 'polyline' || tag === 'polygon') {
      const v = String(at.points || '').trim().split(/[\s,]+/).map(parseFloat);
      let d = '';
      for (let k = 0; k + 1 < v.length; k += 2) d += (k ? 'L' : 'M') + v[k] + ' ' + v[k + 1];
      return parse(d + (tag === 'polygon' ? 'Z' : ''));
    }
    if (tag === 'circle' || tag === 'ellipse') {
      const cx = A(at, 'cx'), cy = A(at, 'cy'), rx = tag === 'circle' ? A(at, 'r') : A(at, 'rx'), ry = tag === 'circle' ? A(at, 'r') : A(at, 'ry');
      return parse(`M${cx - rx} ${cy}A${rx} ${ry} 0 1 0 ${cx + rx} ${cy}A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}Z`);
    }
    if (tag === 'rect') {
      const x = A(at, 'x'), y = A(at, 'y'), w = A(at, 'width'), h = A(at, 'height');
      let rx = at.rx != null ? A(at, 'rx') : A(at, 'ry'), ry = at.ry != null ? A(at, 'ry') : rx;
      rx = Math.min(rx, w / 2); ry = Math.min(ry, h / 2);
      if (!rx || !ry) return parse(`M${x} ${y}H${x + w}V${y + h}H${x}Z`);
      return parse(`M${x + rx} ${y}H${x + w - rx}A${rx} ${ry} 0 0 1 ${x + w} ${y + ry}V${y + h - ry}A${rx} ${ry} 0 0 1 ${x + w - rx} ${y + h}H${x + rx}A${rx} ${ry} 0 0 1 ${x} ${y + h - ry}V${y + ry}A${rx} ${ry} 0 0 1 ${x + rx} ${y}Z`);
    }
    return [];
  }

  /* ---------- Transforms ---------- */
  const I = [1, 0, 0, 1, 0, 0];
  const mul = (m, n) => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3], m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];
  function parseTransform(str) {
    let m = I.slice();
    const re = /(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^)]*)\)/g;
    let t;
    while ((t = re.exec(String(str || '')))) {
      const v = t[2].trim().split(/[\s,]+/).map(parseFloat);
      let n = I;
      if (t[1] === 'matrix') n = v;
      if (t[1] === 'translate') n = [1, 0, 0, 1, v[0] || 0, v[1] || 0];
      if (t[1] === 'scale') n = [v[0], 0, 0, v[1] == null ? v[0] : v[1], 0, 0];
      if (t[1] === 'rotate') {
        const a = (v[0] * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
        n = [c, s, -s, c, 0, 0];
        if (v.length > 2) n = mul(mul([1, 0, 0, 1, v[1], v[2]], n), [1, 0, 0, 1, -v[1], -v[2]]);
      }
      if (t[1] === 'skewX') n = [1, 0, Math.tan((v[0] * Math.PI) / 180), 1, 0, 0];
      if (t[1] === 'skewY') n = [1, Math.tan((v[0] * Math.PI) / 180), 0, 1, 0, 0];
      m = mul(m, n);
    }
    return m;
  }
  const ap = (m, x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
  function transform(subs, m) {
    return subs.map((s) => ({
      closed: s.closed,
      nodes: s.nodes.map((n) => {
        const [x, y] = ap(m, n.x, n.y), [ix, iy] = ap(m, n.ix, n.iy), [ox, oy] = ap(m, n.ox, n.oy);
        return { x, y, ix, iy, ox, oy };
      }),
    }));
  }
  const translate = (subs, dx, dy) => transform(subs, [1, 0, 0, 1, dx, dy]);
  const clone = (subs) => subs.map((s) => ({ closed: s.closed, nodes: s.nodes.map((n) => Object.assign({}, n)) }));

  /* ---------- Geometry helpers ---------- */
  const bez = (p0, p1, p2, p3, t) => {
    const u = 1 - t;
    return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
  };
  function segments(sub) {
    const out = [];
    const n = sub.nodes;
    for (let k = 1; k < n.length; k++) out.push([k - 1, k]);
    if (sub.closed && n.length > 1) out.push([n.length - 1, 0]);
    return out;
  }
  function nearest(subs, x, y) {
    let best = { dist: Infinity };
    subs.forEach((s, si) => segments(s).forEach(([a, b], gi) => {
      const A = s.nodes[a], B = s.nodes[b];
      for (let k = 0; k <= 48; k++) {
        const t = k / 48;
        const px = bez(A.x, A.ox, B.ix, B.x, t), py = bez(A.y, A.oy, B.iy, B.y, t);
        const dd = Math.hypot(px - x, py - y);
        if (dd < best.dist) best = { dist: dd, si, seg: gi, a, b, t, x: px, y: py };
      }
    }));
    return best;
  }
  // Insert a node into segment (a→b) at parameter t (de Casteljau keeps the curve shape identical)
  function insertNode(sub, a, b, t) {
    const A = sub.nodes[a], B = sub.nodes[b];
    const lerp = (p, q) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
    const p0 = [A.x, A.y], p1 = [A.ox, A.oy], p2 = [B.ix, B.iy], p3 = [B.x, B.y];
    const q0 = lerp(p0, p1), q1 = lerp(p1, p2), q2 = lerp(p2, p3), r0 = lerp(q0, q1), r1 = lerp(q1, q2), s0 = lerp(r0, r1);
    const line = isLine(A, B);
    A.ox = line ? A.x : q0[0]; A.oy = line ? A.y : q0[1];
    B.ix = line ? B.x : q2[0]; B.iy = line ? B.y : q2[1];
    const node = line ? { x: s0[0], y: s0[1], ix: s0[0], iy: s0[1], ox: s0[0], oy: s0[1] } : { x: s0[0], y: s0[1], ix: r0[0], iy: r0[1], ox: r1[0], oy: r1[1] };
    sub.nodes.splice(b === 0 ? sub.nodes.length : b, 0, node);
    return b === 0 ? sub.nodes.length - 1 : b;
  }
  function bbox(subs) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    subs.forEach((s) => segments(s).concat(s.nodes.length === 1 ? [[0, 0]] : []).forEach(([a, b]) => {
      const A = s.nodes[a], B = s.nodes[b];
      for (let k = 0; k <= 16; k++) {
        const t = k / 16, x = bez(A.x, A.ox, B.ix, B.x, t), y = bez(A.y, A.oy, B.iy, B.y, t);
        x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
      }
    }));
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }
  const snap = (v, step) => (step ? Math.round(v / step) * step : v);

  /* ---------- Corners (Figma-style corner radius for paths) ---------- */
  const isCorner = (n) => Math.hypot(n.ix - n.x, n.iy - n.y) < EPS && Math.hypot(n.ox - n.x, n.oy - n.y) < EPS;
  const unit = (ax, ay, bx, by) => { const l = Math.hypot(bx - ax, by - ay) || 1; return [(bx - ax) / l, (by - ay) / l, l]; };
  // Round every sharp corner between two straight segments with a circular fillet of radius r (clamped to the edges)
  function roundCorners(subs, r) {
    return subs.map((s) => {
      const n = s.nodes, N = n.length, out = [];
      if (N < 3 && !s.closed) return { closed: s.closed, nodes: n.map((x) => Object.assign({}, x)) };
      for (let i = 0; i < N; i++) {
        const nd = n[i], hasP = s.closed || i > 0, hasN = s.closed || i < N - 1;
        const p = n[(i - 1 + N) % N], q = n[(i + 1) % N];
        if (!hasP || !hasN || !isCorner(nd) || !isLine(p, nd) || !isLine(nd, q)) { out.push(Object.assign({}, nd)); continue; }
        const [ux, uy, la] = unit(p.x, p.y, nd.x, nd.y), [vx, vy, lb] = unit(nd.x, nd.y, q.x, q.y);
        const phi = Math.acos(Math.max(-1, Math.min(1, ux * vx + uy * vy)));
        if (phi < 0.05 || phi > 3.1) { out.push(Object.assign({}, nd)); continue; }
        const t = Math.min(r * Math.tan(phi / 2), la * 0.5, lb * 0.5);
        const rr = t / Math.tan(phi / 2), h = (4 / 3) * Math.tan(phi / 4) * rr;
        const A = [nd.x - ux * t, nd.y - uy * t], B = [nd.x + vx * t, nd.y + vy * t];
        out.push({ x: A[0], y: A[1], ix: A[0], iy: A[1], ox: A[0] + ux * h, oy: A[1] + uy * h });
        out.push({ x: B[0], y: B[1], ix: B[0] - vx * h, iy: B[1] - vy * h, ox: B[0], oy: B[1] });
      }
      return { closed: s.closed, nodes: out };
    });
  }
  // Find rounded corners: a short curve between two straight segments whose extensions meet near it
  function findFillets(s) {
    const n = s.nodes, N = n.length, out = [];
    const segs = N < 2 ? 0 : s.closed ? N : N - 1;
    for (let i = 0; i < segs; i++) {
      const a = n[i], b = n[(i + 1) % N];
      if (isLine(a, b)) continue;
      const hasP = s.closed || i > 0, hasN = s.closed || i + 2 < N;
      if (!hasP || !hasN) continue;
      const p = n[(i - 1 + N) % N], q = n[(i + 2) % N];
      if (!isLine(p, a) || !isLine(b, q) || Math.hypot(b.x - a.x, b.y - a.y) > 10) continue;
      const [ux, uy] = unit(p.x, p.y, a.x, a.y), [vx, vy] = unit(b.x, b.y, q.x, q.y);
      const den = ux * vy - uy * vx;
      if (Math.abs(den) < 1e-4) continue; // parallel: a real arc, not a corner
      const tA = ((b.x - a.x) * vy - (b.y - a.y) * vx) / den;
      const I = [a.x + ux * tA, a.y + uy * tA];
      const tB = (I[0] - b.x) * -vx + (I[1] - b.y) * -vy;
      if (tA <= 0 || tB <= 0 || tA > 8 || tB > 8) continue;
      const phi = Math.acos(Math.max(-1, Math.min(1, ux * vx + uy * vy)));
      out.push({ i, I, r: ((tA + tB) / 2) / Math.tan(phi / 2) });
    }
    return out;
  }
  // Undo rounding: collapse each fillet back into one sharp corner
  function sharpenCorners(subs) {
    return subs.map((s) => {
      const f = findFillets(s);
      if (!f.length) return { closed: s.closed, nodes: s.nodes.map((x) => Object.assign({}, x)) };
      const N = s.nodes.length, drop = new Set(), put = {};
      f.forEach(({ i, I }) => { const j = (i + 1) % N; if (drop.has(i) || put[i]) return; put[i] = I; drop.add(j); });
      const nodes = [];
      s.nodes.forEach((nd, k) => { if (drop.has(k) && !put[k]) return; if (put[k]) { const [x, y] = put[k]; nodes.push({ x, y, ix: x, iy: y, ox: x, oy: y }); } else nodes.push(Object.assign({}, nd)); });
      return { closed: s.closed, nodes };
    });
  }
  // Current corner radius of a path: the typical fillet radius, 0 when it only has sharp corners, null when it has no corners
  function cornerRadius(subs) {
    const rs = []; let sharp = 0;
    subs.forEach((s) => {
      findFillets(s).forEach((f) => rs.push(f.r));
      const N = s.nodes.length;
      s.nodes.forEach((nd, i) => { if ((s.closed || (i > 0 && i < N - 1)) && isCorner(nd) && isLine(s.nodes[(i - 1 + N) % N], nd) && isLine(nd, s.nodes[(i + 1) % N])) sharp++; });
    });
    if (rs.length) { rs.sort((a, b) => a - b); return rs[Math.floor(rs.length / 2)]; }
    return sharp ? 0 : null;
  }
  const setCorners = (subs, r) => { const sh = sharpenCorners(subs); return r > 0 ? roundCorners(sh, r) : sh; };

  window.IconPath = { roundCorners, sharpenCorners, cornerRadius, setCorners, parse, serialize, fromShape, parseTransform, transform, translate, mul, ap, clone, nearest, insertNode, segments, bbox, isLine, snap, num, I };
})();
