/* IconLi — Letters & Numbers, Currency, Math & Symbols, Shapes & Geometry.
 * Glyphs are drawn once in a 7×10 box (x 8.5–15.5, y 7–17) and shipped three ways:
 * plain (scaled up, stroke kept true), inside a circle and inside a rounded square (outline / solid / duotone).
 */
(function () {
  const { add, p, c, e, rot } = window.IconLiDSL;
  const CIRC = c(12, 12, 9.25);
  const SQR = `<rect x="2.75" y="2.75" width="18.5" height="18.5" rx="5"/>`;
  function family(cat, name, glyph, tags, opts = {}) {
    const g = Array.isArray(glyph) ? glyph : [glyph];
    add(cat, name, tags, { o: g, fit: opts.plainFit || 1.4 });
    add(cat, name + ' Circle', tags + ' circle round badge', { b: [CIRC], d: g, fit: 1});
    add(cat, name + ' Square', tags + ' square box badge', { b: [SQR], d: g, fit: 1 });
  }
  // flipping a glyph inside a container must not flip the container, so bake "t" into the glyph group instead
  const tg = (t, g) => (t ? [`<g transform="${t}">${(Array.isArray(g) ? g : [g]).join('')}</g>`] : g);

  /* ---------- Letters ---------- */
  const LETTERS = {
    A: p('M8.5 17 12 7l3.5 10M9.75 13.5h4.5'),
    B: p('M9 17V7h3.25a2.5 2.5 0 0 1 0 5H9h3.75a2.5 2.5 0 0 1 0 5Z'),
    C: p('M15.5 8.6a5 5 0 1 0 0 6.8'),
    D: p('M9 7h2.25a5 5 0 0 1 0 10H9Z'),
    E: p('M15 7H9v10h6M9 12h5'),
    F: p('M15 7H9v10M9 12h5'),
    G: p('M15.5 8.6A5 5 0 1 0 17 12h-4.25'),
    H: p('M9 7v10M15 7v10M9 12h6'),
    I: p('M12 7v10M10 7h4M10 17h4'),
    J: p('M14.5 7v7a2.75 2.75 0 0 1-5.5 0'),
    K: p('M9 7v10M15 7l-6 6M11.25 10.75 15 17'),
    L: p('M9 7v10h6'),
    M: p('M8 17V7l4 6 4-6v10'),
    N: p('M9 17V7l6 10V7'),
    O: c(12, 12, 5),
    P: p('M9 17V7h3.25a2.75 2.75 0 0 1 0 5.5H9'),
    Q: [c(12, 12, 5), p('M13.5 13.5 16.5 16.5')],
    R: p('M9 17V7h3.25a2.75 2.75 0 0 1 0 5.5H9M12 12.5l3 4.5'),
    S: p('M15 8.5c-.6-1-1.7-1.5-3-1.5-1.8 0-3 1-3 2.5 0 3.3 6 1.9 6 5 0 1.5-1.3 2.5-3 2.5-1.4 0-2.6-.6-3.2-1.7'),
    T: p('M8.5 7h7M12 7v10'),
    U: p('M9 7v6.5a3 3 0 0 0 6 0V7'),
    V: p('M8.5 7 12 17l3.5-10'),
    W: p('M7.5 7l2 10L12 10l2.5 7 2-10'),
    X: p('M9 7l6 10M15 7l-6 10'),
    Y: p('M8.5 7 12 12l3.5-5M12 12v5'),
    Z: p('M9 7h6l-6 10h6'),
  };
  const NUMS = {
    0: e(12, 12, 3.5, 5),
    1: p('M10 9l2.5-2v10M10 17h5'),
    2: p('M9.2 9.5a3 3 0 0 1 5.8 1c0 2.5-6 4.5-6 6.5h6'),
    3: p('M9 8.5c.5-1 1.6-1.5 2.9-1.5 1.7 0 3 1 3 2.5S13.6 12 12 12c1.8 0 3.2 1 3.2 2.5S13.8 17 12 17c-1.4 0-2.5-.5-3-1.5'),
    4: p('M14 17V7l-5.5 7h7'),
    5: p('M15 7H9.5L9 11.5c.7-.6 1.7-.9 2.7-.9 1.9 0 3.3 1.3 3.3 3.2S13.6 17 11.7 17c-1.2 0-2.2-.5-2.8-1.3'),
    6: p('M14.5 7.8A4.7 4.7 0 0 0 12.3 7C10.1 7 9 9 9 12.3 9 15.2 10.3 17 12.2 17c1.7 0 3-1.3 3-3.1s-1.3-3.1-3-3.1c-1.5 0-2.7 1-3.2 2.3'),
    7: p('M9 7h6l-4 10'),
    8: p('M12 12c-1.7 0-3-1-3-2.5S10.3 7 12 7s3 1 3 2.5S13.7 12 12 12c-1.9 0-3.2 1.1-3.2 2.5S10.1 17 12 17s3.2-1.1 3.2-2.5S13.9 12 12 12Z'),
  };
  NUMS[9] = tg(rot(180), NUMS[6]);
  Object.keys(LETTERS).forEach((k) => family('letters', 'Letter ' + k, LETTERS[k], `letter ${k.toLowerCase()} alphabet character initial type`));
  Object.keys(NUMS).forEach((k) => family('letters', 'Number ' + k, NUMS[k], `number ${k} digit numeral count`));

  /* ---------- Currency ---------- */
  const CUR = {
    Dollar: ['M14.5 9c-.4-.9-1.3-1.5-2.5-1.5-1.5 0-2.5.8-2.5 1.9 0 2.6 5.2 1.4 5.2 4.3 0 1.1-1.1 2-2.7 2-1.3 0-2.3-.6-2.7-1.6M12 6v1.5M12 16.7V18', 'usd usa money'],
    Euro: ['M15.5 8.6A5 5 0 1 0 15.5 15.4M8 10.75h5M8 13.25h5', 'eur europe money'],
    Pound: ['M15 16.5H9c1-1 1.5-2.2 1.5-3.5V10a2.75 2.75 0 0 1 5-1.5M8.5 12.5h5', 'gbp sterling uk money'],
    Yen: ['M8.5 7 12 12l3.5-5M12 12v5M9.5 12.5h5M9.5 15h5', 'jpy yuan cny japan china money'],
    Rupee: ['M9 7.5h6M9 10.5h6M12.5 7.5a2.75 2.75 0 0 1 0 5.5H9.5l5 4.5', 'inr india money'],
    Taka: ['M8.75 8.5a1.5 1.5 0 0 1 2.5 1.1v4.9a2.5 2.5 0 0 0 5 0 2.25 2.25 0 0 0-2-2.25M8.75 11h5', 'bdt bangladesh money'],
    Bitcoin: ['M9 8.5h4.25a1.75 1.75 0 0 1 0 3.5H10M10 12h3.75a2 2 0 0 1 0 4H9M10 8.5V16M11 7v1.5M13 7v1.5M11 16v1.5M13 16v1.5', 'btc crypto blockchain'],
    Ruble: ['M10 17V7.5h3a2.5 2.5 0 0 1 0 5H8.5M8.5 15h5', 'rub russia money'],
    Won: ['M7.5 7.5l2 9 2.5-7 2.5 7 2-9M7 11.5h10', 'krw korea money'],
    Lira: ['M10.5 7v10h1a4.5 4.5 0 0 0 4.5-4.5M8.5 11.25l5-2M8.5 14.25l5-2', 'try turkey money'],
    Peso: ['M10 17V7.5h2.75a2.75 2.75 0 0 1 0 5.5H10M8.5 9.5h7M8.5 11h7', 'php mxn money'],
    Naira: ['M9.5 17V7l5 10V7M8 10.5h8M8 13h8', 'ngn nigeria money'],
    Shekel: ['M8.5 16.5V8h3.5a2 2 0 0 1 2 2v3M15.5 7.5V16h-3.5a2 2 0 0 1-2-2v-3', 'ils israel money'],
    Baht: ['M10 8h3a2 2 0 0 1 0 4h-3 3.5a2 2 0 0 1 0 4H10ZM10 8v8M12 6.5V8M12 16v1.5', 'thb thailand money'],
    Cent: ['M14.75 9.5a3.5 3.5 0 1 0 0 5M12.5 6.5v11', 'cents coin change money'],
    Franc: ['M15 7.5H10V17M10 12h4M8.5 14.5h4', 'chf swiss money'],
  };
  Object.keys(CUR).forEach((k) => family('currency', k + ' Sign', p(CUR[k][0]), `${k.toLowerCase()} currency ${CUR[k][1]} finance price`));

  /* ---------- Math & symbols ---------- */
  const MATH = {
    'Plus Minus': 'M12 7v7M8.5 10.5h7M8.5 17h7',
    Multiply: 'M9 9l6 6M15 9l-6 6',
    Divide: 'M8 12h8',
    Equals: 'M8.5 10h7M8.5 14h7',
    'Not Equal': 'M8.5 10h7M8.5 14h7M14 7.5 10 16.5',
    'Greater Than': 'M9.5 8l5 4-5 4',
    'Less Than': 'M14.5 8l-5 4 5 4',
    Approximately: 'M8 10.25c1-1 2-1 3 0s2 1 3 0 2-1 2 0M8 14.25c1-1 2-1 3 0s2 1 3 0 2-1 2 0',
    Sigma: 'M15 7.5H9l3.5 4.5L9 16.5h6',
    Pi: 'M8 8.5h8M10 8.5V16.5M14 8.5v6.25a1.75 1.75 0 0 0 1.75 1.75',
    'Square Root': 'M7 12.5h1.5l2 4 3-10H17',
    Function: 'M14.5 7.5a2 2 0 0 0-3.25 1.5L10 16a2 2 0 0 1-3.25 1.5M8.5 11h5',
    Degree: 'M12 9.5a2 2 0 1 0 0-.01',
    Brackets: 'M10 6.5c-1.5 1.5-2.25 3.5-2.25 5.5s.75 4 2.25 5.5M14 6.5c1.5 1.5 2.25 3.5 2.25 5.5s-.75 4-2.25 5.5',
    'Square Brackets': 'M10.25 7H8.5v10h1.75M13.75 7h1.75v10h-1.75',
    Ampersand: 'M15.5 17 9.75 10.6c-.7-.8-.9-1.4-.9-2 0-1 .8-1.6 1.85-1.6s1.8.6 1.8 1.6c0 1.3-1.3 2-3 3.3-1 .8-1.5 1.6-1.5 2.5 0 1.45 1.2 2.6 2.9 2.6 1.6 0 3-1 4.1-3',
  };
  Object.keys(MATH).forEach((k) => {
    const g = k === 'Divide' ? [p(MATH[k]), c(12, 8.5, 0.5, 1), c(12, 15.5, 0.5, 1)] : p(MATH[k]);
    family('math', k, g, `${k.toLowerCase()} math symbol operator formula calculate`);
  });

  /* ---------- Shapes & geometry ---------- */
  const poly = (n, r = 9, cx = 12, cy = 12, startDeg = -90) => {
    let d = '';
    for (let i = 0; i < n; i++) { const a = ((startDeg + (360 / n) * i) * Math.PI) / 180; d += (i ? 'L' : 'M') + (cx + r * Math.cos(a)).toFixed(2) + ' ' + (cy + r * Math.sin(a)).toFixed(2); }
    return p(d + 'Z');
  };
  const starN = (n, R = 9.25, r0 = 4.2) => { let d = ''; for (let i = 0; i < n * 2; i++) { const a = (Math.PI / n) * i - Math.PI / 2, rr = i % 2 ? r0 : R; d += (i ? 'L' : 'M') + (12 + rr * Math.cos(a)).toFixed(2) + ' ' + (12.4 + rr * Math.sin(a)).toFixed(2); } return p(d + 'Z'); };
  const SHAPES = {
    Triangle: poly(3, 9.5, 12, 13.3), Square: `<rect x="3.5" y="3.5" width="17" height="17" rx="2"/>`, Pentagon: poly(5, 9.25, 12, 12.4), Hexagon: poly(6, 9.25), Heptagon: poly(7, 9.25, 12, 12.2), Octagon: poly(8, 9.25, 12, 12, -67.5),
    Circle: c(12, 12, 9), Oval: e(12, 12, 9, 6.5), Rhombus: poly(4, 9.5), Parallelogram: p('M7 5.5h14l-4 13H3Z'), Trapezoid: p('M7.5 5.5h9l4 13h-17Z'), Semicircle: p('M3 16a9 9 0 0 1 18 0Z'),
    'Star Four Point': starN(4, 9.5, 3.6), 'Star Five Point': starN(5), 'Star Six Point': starN(6, 9.25, 5), 'Star Eight Point': starN(8, 9.25, 5.8), Cross: p('M9.25 3.5h5.5v5.75h5.75v5.5h-5.75v5.75h-5.5v-5.75H3.5v-5.5h5.75Z'), Ring: c(12, 12, 9),
    Pill: `<rect x="2.75" y="7.5" width="18.5" height="9" rx="4.5"/>`, Arch: p('M4.5 20.5V11a7.5 7.5 0 0 1 15 0v9.5Z'), Drop: p('M12 3c3.5 4 6.5 7.3 6.5 11a6.5 6.5 0 0 1-13 0c0-3.7 3-7 6.5-11Z'), Shield: p('M12 3 19.5 5.75v5.6c0 4.4-3.1 8.2-7.5 9.65-4.4-1.45-7.5-5.25-7.5-9.65v-5.6Z'),
    Blob: p('M12.5 3.5c3.6 0 7.5 2.4 7.5 7.1 0 3.2-1.4 4.4-1.4 6.3 0 2.4-2.6 3.6-5.6 3.6C7.6 20.5 4 17.6 4 13.1 4 7.3 8 3.5 12.5 3.5Z'), Cylinder: [e(12, 6, 7, 2.5), p('M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6')],
  };
  Object.keys(SHAPES).forEach((k) => {
    const s = SHAPES[k];
    const def = k === 'Ring' ? { b: [s], d: [c(12, 12, 4.5)] } : k === 'Cylinder' ? { b: [p('M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6Z'), s[0]], d: [p('M5.25 6.5c.8 1.2 3.6 2 6.75 2s5.95-.8 6.75-2')] } : { b: Array.isArray(s) ? s : [s] };
    add('shapes', 'Shape ' + k, `${k.toLowerCase()} shape geometry form polygon`, Object.assign(def, { fit: 1 }));
  });
})();
