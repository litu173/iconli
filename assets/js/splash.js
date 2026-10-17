/* IconLi — splash intro (first load of the site on the home page only, once per browser session)
 * Endless rows of 3D icon boxes slide in alternating directions and speed up as you scroll. A few scroll steps
 * (or a short pause) fade the field out, the IconLi mark and motto appear, the loader fills and the page content
 * rises in from the bottom. Every other page load skips the splash and just plays the content entrance.
 * Add ?intro to the URL to replay it. Reduced-motion users never get the splash.
 */
(function () {
  const S = window.Site;
  const root = document.documentElement;
  const sp = document.getElementById('splash');
  window.IconLiSplash = true;
  if (!sp || !S) { root.classList.remove('is-loading'); return; }

  const { icons, render, find, GRAD, reduced } = S;
  const page = document.body.dataset.page;
  const params = new URLSearchParams(location.search);
  let seen = false;
  try { seen = sessionStorage.getItem('iconli-intro') === '1'; } catch (e) {}
  const full = root.classList.contains('show-intro'); // decided in <head> before first paint
  try { sessionStorage.setItem('iconli-intro', '1'); } catch (e) {} // any page counts as having entered the site
  const IDLE = 4200;
  const LOAD = 2600;

  const bar = sp.querySelector('.sp-bar'), fill = bar.querySelector('i'), pct = sp.querySelector('.sp-pct');
  const setVar = (k, v) => sp.style.setProperty(k, v);
  const ease = (t) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3);

  /* ---------- Field of 3D icon boxes ---------- */
  const rows = [];
  let running = false;
  function buildField() {
    if (reduced) return;
    const plane = sp.querySelector('.sp-plane');
    const names = [...new Set(icons.filter((i) => !/^(Arrow|Chevron|Caret)/.test(i.name)).map((i) => i.name))];
    const box = innerWidth < 768 ? 92 + 22 : 124 + 30;
    const perRow = Math.ceil((innerWidth * 2.2) / box) + 2;
    const rowCount = innerWidth < 768 ? 9 : 7;
    const styles = ['duotone', 'solid', 'outline'];
    let k = 0;
    for (let r = 0; r < rowCount; r++) {
      const row = document.createElement('div');
      row.className = 'sp-row';
      let html = '';
      for (let i = 0; i < perRow; i++) {
        const nm = names[(k++ * 37 + r * 11) % names.length];
        const ic = find(nm, styles[(i + r) % 3]) || find(nm);
        const tone = (i * 7 + r * 3) % 13 === 0 ? ' accent' : (i * 5 + r) % 17 === 0 ? ' gold' : '';
        html += `<span class="sp-box${tone}">${render(ic, { size: innerWidth < 768 ? 40 : 54, gradient: !tone && (i + r) % 9 === 0 ? GRAD : undefined })}</span>`;
      }
      row.innerHTML = html + html; // doubled for a seamless loop
      plane.appendChild(row);
      rows.push({ el: row, dir: r % 2 ? -1 : 1, speed: 26 + ((r * 13) % 5) * 7, x: Math.random() * 400, w: 0 });
    }
    requestAnimationFrame(() => rows.forEach((r) => (r.w = r.el.scrollWidth / 2)));
  }

  let boost = 0, last = performance.now();
  function tick(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    boost *= Math.pow(0.04, dt); // momentum from scrolling decays smoothly
    for (const r of rows) {
      if (!r.w) continue;
      r.x += (r.speed + boost) * r.dir * dt;
      const x = (((r.x % r.w) + r.w) % r.w) - r.w; // keep within one loop width
      r.el.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Stages ---------- */
  let stage = 'gate', p = 0, idleT;
  function lock() {
    S.lenis && S.lenis.stop();
    addEventListener('wheel', onWheel, { passive: false });
    addEventListener('touchstart', onTouchStart, { passive: true });
    addEventListener('touchmove', onTouchMove, { passive: false });
    addEventListener('keydown', onKey);
  }
  function unlock() {
    removeEventListener('wheel', onWheel);
    removeEventListener('touchstart', onTouchStart);
    removeEventListener('touchmove', onTouchMove);
    removeEventListener('keydown', onKey);
  }
  function advance(delta) {
    boost = Math.min(boost + Math.abs(delta) * 2.2, 900);
    if (stage !== 'gate') return;
    p = Math.min(1, p + Math.abs(delta) / 520);
    paintGate();
    clearTimeout(idleT);
    if (p >= 1) startLoading(LOAD); else idleT = setTimeout(autoAdvance, IDLE);
  }
  function paintGate() {
    const e = ease(p);
    setVar('--field', (1 - e).toFixed(3));
    setVar('--center', ease((p - 0.35) / 0.65).toFixed(3));
    setVar('--hint', Math.max(0, 1 - p * 3).toFixed(3));
  }
  function autoAdvance() { // nobody scrolled: glide through the reveal on our own
    if (stage !== 'gate') return;
    const from = p, t0 = performance.now();
    const step = (t) => {
      if (stage !== 'gate') return;
      p = from + (1 - from) * ease((t - t0) / 1400);
      boost = 220; paintGate();
      if (p >= 0.999) startLoading(LOAD); else requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function onWheel(e) { e.preventDefault(); advance(e.deltaY || e.deltaX); }
  let ty = 0;
  function onTouchStart(e) { ty = e.touches[0].clientY; }
  function onTouchMove(e) { e.preventDefault(); const y = e.touches[0].clientY; advance((ty - y) * 1.6); ty = y; }
  function onKey(e) {
    if (['ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key) && e.target === document.body) { e.preventDefault(); advance(180); }
    if (e.key === 'Escape') skip();
  }

  function setProgress(v) {
    const n = Math.round(v * 100);
    fill.style.width = n + '%';
    pct.textContent = n + '%';
    bar.setAttribute('aria-valuenow', String(n));
  }
  function startLoading(duration = 2600, from = 0) {
    if (stage === 'loading' || stage === 'done') return;
    stage = 'loading';
    clearTimeout(idleT);
    setVar('--field', '0');
    setVar('--center', '1'); setVar('--hint', '0'); setVar('--bar', '1');
    const t0 = performance.now();
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    let ready = false;
    Promise.all([fontsReady, new Promise((r) => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true })))]).then(() => (ready = true));
    const step = (t) => {
      const k = Math.min(1, (t - t0) / duration);
      const v = from + (1 - from) * ease(k);
      setProgress(ready ? v : Math.min(0.9, v));
      if (k >= 1 && ready) { setProgress(1); setTimeout(exit, 180); }
      else requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function skip() { if (stage === 'gate') { p = 1; paintGate(); startLoading(700); } }
  window.IconLiSplash = { skip };

  /* ---------- Entrance: content rises from bottom to top ---------- */
  function enter() {
    const sel = ['#nav', 'main .reveal', '.marquee', '.lib-head', '.sidebar', '.toolbar', '.result-head', '.tile', '.docs .toc', '.doc > *', '.site-footer'];
    const vh = innerHeight;
    const els = [];
    sel.forEach((s) => document.querySelectorAll(s).forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0 && !els.includes(el)) els.push(el);
    }));
    // order by vertical position so the wave travels upward from the bottom of the screen
    els.sort((a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top);
    els.forEach((el, i) => {
      if (el.classList.contains('reveal')) el.classList.add('in');
      el.classList.add('enter');
      el.style.setProperty('--ed', (el.id === 'nav' ? els.length * 18 + 120 : Math.min(i * (el.classList.contains('tile') ? 10 : 70), 900)) + 'ms');
    });
    root.classList.add('is-entering');
    root.classList.remove('is-loading');
    setTimeout(() => {
      root.classList.remove('is-entering');
      els.forEach((el) => { el.classList.remove('enter'); el.style.removeProperty('--ed'); });
    }, 2200);
  }

  function exit() {
    if (stage === 'done') return;
    stage = 'done';
    unlock();
    try { sessionStorage.setItem('iconli-intro', '1'); } catch (e) {}
    sp.classList.add('out');
    sp.setAttribute('aria-hidden', 'true');
    enter();
    if (S.lenis && !document.body.classList.contains('drawer-open')) S.lenis.start(); // keep the page locked under an open drawer
    setTimeout(() => { running = false; sp.classList.add('gone'); sp.classList.remove('out'); }, 950);
  }

  // Back/forward cache: never show a stale loader
  addEventListener('pageshow', (e) => { if (e.persisted) { sp.classList.add('gone'); root.classList.remove('is-loading'); S.lenis && S.lenis.start(); } });

  /* ---------- Start ---------- */
  sp.querySelector('.sp-skip').onclick = skip;
  if (matchMedia('(pointer: coarse)').matches) sp.querySelector('.sp-hint').lastChild.textContent = 'Swipe up to enter';
  if (full) {
    buildField();
    running = true;
    requestAnimationFrame((t) => { last = t; tick(t); });
    setVar('--field', '1'); setVar('--center', '0'); setVar('--bar', '0');
    requestAnimationFrame(() => setVar('--hint', '1'));
    lock();
    idleT = setTimeout(autoAdvance, IDLE);
    sp.querySelector('.sp-skip').focus({ preventScroll: true });
  } else {
    // No splash: reveal the page with the bottom-to-top entrance only.
    stage = 'done';
    sp.classList.add('gone');
    sp.setAttribute('aria-hidden', 'true');
    requestAnimationFrame(enter);
  }
})();
