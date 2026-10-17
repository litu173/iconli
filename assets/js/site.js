/* IconLi — shared site behaviour (every page): theme, nav, smooth scroll, starfield, reveal, helpers. */
(function () {
  const CONFIG = {
    brand: 'IconLi',
    author: 'Mutaher',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    defaultExportColor: (window.IconLi && window.IconLi.settings && window.IconLi.settings.color) || '#212226',
    // Served by jsDelivr once the package is published to npm (see README → Publishing).
    cdnUrl: 'https://cdn.jsdelivr.net/npm/iconli@1/dist/iconli.js',
    pageSize: 240,
  };
  const CREDIT = `Icons by ${CONFIG.brand} (${CONFIG.author}) — ${CONFIG.license}`;

  const L = window.IconLi;
  const { icons, categories, render } = L;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const catLabel = Object.fromEntries(categories);
  const catOrder = Object.fromEntries(categories.map(([k], i) => [k, i]));
  const styleOrder = { outline: 0, solid: 1, duotone: 2 };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Stable display order; uid must equal array position because tiles look icons up by uid.
  icons.sort((a, b) => catOrder[a.cat] - catOrder[b.cat] || (b.sig - a.sig) || a.name.localeCompare(b.name) || styleOrder[a.style] - styleOrder[b.style]);
  icons.forEach((ic, i) => (ic.uid = i));
  const usedCats = categories.filter(([k]) => icons.some((i) => i.cat === k));
  const find = (name, style = 'outline') => icons.find((i) => i.name === name && i.style === style) || icons.find((i) => i.name === name);
  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const GRAD = ['#f2d6a2', '#8f7bff'];

  /* Decorative UI icons: <i data-icon="Name" data-style="solid" data-size="18"></i> */
  function hydrate(root = document) {
    $$('[data-icon]', root).forEach((el) => {
      const ic = find(el.dataset.icon, el.dataset.style || 'outline');
      if (!ic) return;
      el.classList.add('ui-ic');
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML = render(ic, { size: +el.dataset.size || 20, color: el.dataset.color });
    });
  }

  /* Toast + clipboard + files */
  let toastT;
  function toast(msg) {
    const t = $('#toast'); if (!t) return;
    t.innerHTML = render(find('Check', 'solid'), { size: 18 }) + '<span></span>';
    t.lastChild.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('show'), 2000);
  }
  async function copyText(text, msg = 'Copied') {
    try { await navigator.clipboard.writeText(text); }
    catch (e) {
      const ta = Object.assign(document.createElement('textarea'), { value: text });
      ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (_) {}
      ta.remove();
    }
    toast(msg);
  }
  function saveBlob(blob, name) {
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: name });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  function exportSvg(ic, o) {
    const svg = render(ic, Object.assign({ forExport: true }, o));
    return svg.replace('>', `>\n<!-- ${ic.name} (${ic.style}) · ${CREDIT} -->\n`);
  }
  function toJsx(svg) {
    return svg
      .replace(/<!--.*?-->\n?/g, '')
      .replace(/\s([a-z]+(?:-[a-z]+)+)=/g, (m, a) => (a.startsWith('aria-') || a.startsWith('data-') ? m : ' ' + a.replace(/-([a-z])/g, (_, c) => c.toUpperCase()) + '='))
      .replace(/\sclass=/g, ' className=');
  }
  function svgToPngBlob(svg, px) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
      img.onload = () => {
        const cv = Object.assign(document.createElement('canvas'), { width: px, height: px });
        cv.getContext('2d').drawImage(img, 0, 0, px, px);
        URL.revokeObjectURL(url);
        cv.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG failed'))), 'image/png');
      };
      img.onerror = reject;
      img.src = url;
    });
  }
  function setRangeFill(r) { r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min)) * 100 + '%'); }

  /* Theme */
  const themeHooks = [];
  function setTheme(t) {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('iconli-theme', t); } catch (e) {}
    const btn = $('#themeBtn');
    if (btn) {
      btn.innerHTML = render(find(t === 'light' ? 'Moon' : 'Sun'), { size: 18 });
      btn.setAttribute('aria-label', t === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
    }
    const meta = $('meta[name=theme-color]'); if (meta) meta.setAttribute('content', t === 'light' ? '#f6f4fb' : '#06061a');
    themeHooks.forEach((f) => f(t));
  }

  /* Smooth scroll */
  let lenis = null;
  function initScroll() {
    if (window.Lenis && !reduced) {
      lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, wheelMultiplier: 0.9 });
      const loop = (t) => { lenis.raf(t); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    }
    $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#main') return; // skip link keeps native behaviour
      if (id.length < 2) { e.preventDefault(); scrollToEl(0); return; }
      const t = $(id); if (!t) return;
      e.preventDefault(); scrollToEl(id);
      t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true });
    }));
    const nav = $('#nav');
    const onScroll = () => nav && nav.classList.toggle('scrolled', scrollY > 20);
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }
  function scrollToEl(target) {
    const off = -((($('#nav') || {}).offsetHeight || 70) + 12);
    if (lenis) lenis.scrollTo(target === 0 ? 0 : target, { offset: off });
    else if (target === 0) scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    else { const el = typeof target === 'string' ? $(target) : target; scrollTo({ top: el.getBoundingClientRect().top + scrollY + off, behavior: reduced ? 'auto' : 'smooth' }); }
  }

  /* Mobile menu */
  function initMenu() {
    const btn = $('#menuBtn'), panel = $('#menuPanel');
    if (!btn || !panel) return;
    const set = (open) => {
      btn.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
      btn.innerHTML = render(find(open ? 'Close' : 'Menu'), { size: 20 });
      document.body.classList.toggle('menu-open', open);
    };
    btn.onclick = () => set(btn.getAttribute('aria-expanded') !== 'true');
    $$('a', panel).forEach((a) => a.addEventListener('click', () => set(false)));
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); } });
    addEventListener('resize', () => innerWidth >= 1100 && set(false));
    set(false);
  }

  /* Starfield */
  function initSpace() {
    const cv = $('#space'); if (!cv) return;
    const ctx = cv.getContext('2d');
    let w, h, dpr, stars = [], shooting = [], mx = 0, my = 0, tmx = 0, tmy = 0, last = 0;
    function resize() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = innerWidth; h = innerHeight;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(480, Math.round((w * h) / 2800));
      stars = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h * 3, z: Math.random() ** 2 * 0.9 + 0.1, r: Math.random() * 1.2 + 0.25, tw: Math.random() * Math.PI * 2, hue: Math.random() < 0.15 ? 40 : Math.random() < 0.3 ? 250 : 0 }));
      if (reduced) draw(0);
    }
    function draw(t) {
      const light = document.documentElement.dataset.theme === 'light';
      mx += (tmx - mx) * 0.04; my += (tmy - my) * 0.04;
      ctx.clearRect(0, 0, w, h);
      const sy = scrollY;
      for (const s of stars) {
        const y = (((s.y - sy * s.z * 0.35 + my * 30 * s.z) % (h * 3)) + h * 3) % (h * 3);
        if (y > h) continue;
        const x = (s.x + mx * 40 * s.z + w) % w;
        const a = (0.35 + 0.65 * Math.abs(Math.sin(t * 0.0012 * (0.5 + s.z) + s.tw))) * (0.35 + s.z * 0.75);
        ctx.beginPath(); ctx.arc(x, y, s.r * (0.6 + s.z), 0, Math.PI * 2);
        ctx.fillStyle = light ? `hsla(${s.hue || 250}, 50%, 45%, ${a * 0.35})` : s.hue ? `hsla(${s.hue}, 90%, 82%, ${a})` : `rgba(255,255,255,${a})`;
        ctx.fill();
      }
      if (!light && !reduced && t - last > 3800 && Math.random() < 0.02) {
        last = t; shooting.push({ x: Math.random() * w * 0.8 + w * 0.2, y: Math.random() * h * 0.4, vx: -(6 + Math.random() * 4), vy: 2.5 + Math.random() * 2, life: 1 });
      }
      shooting = shooting.filter((s) => s.life > 0);
      for (const s of shooting) {
        const g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 14, s.y - s.vy * 14);
        g.addColorStop(0, `rgba(255,240,215,${s.life})`); g.addColorStop(1, 'rgba(255,240,215,0)');
        ctx.strokeStyle = g; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * 14, s.y - s.vy * 14); ctx.stroke();
        s.x += s.vx; s.y += s.vy; s.life -= 0.012;
      }
    }
    addEventListener('resize', resize); resize();
    if (reduced) { themeHooks.push(() => draw(0)); return; }
    addEventListener('pointermove', (e) => { tmx = e.clientX / w - 0.5; tmy = e.clientY / h - 0.5; }, { passive: true });
    const loop = (t) => { if (!document.hidden) draw(t); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }

  /* Overlay scrollbars: native bars are hidden (no layout width, transparent rail);
     a thin floating thumb shows while scrolling or hovering and can be dragged. */
  function overlayScroll(target, opts = {}) {
    const isWin = target === window;
    const el = isWin ? document.documentElement : target;
    if (!el) return { update() {} };
    if (!isWin) el.classList.add('ov-scroll');
    const thumb = document.createElement('div');
    thumb.className = 'ov-thumb' + (opts.cls ? ' ' + opts.cls : '');
    thumb.setAttribute('aria-hidden', 'true');
    document.body.appendChild(thumb);
    const PAD = 6;
    let hideT, drag = null;
    const metrics = () => ({
      sh: el.scrollHeight,
      ch: isWin ? innerHeight : el.clientHeight,
      st: isWin ? scrollY : el.scrollTop,
      r: isWin ? { top: 0, right: innerWidth, height: innerHeight } : el.getBoundingClientRect(),
    });
    function update(show) {
      const { sh, ch, st, r } = metrics();
      const visible = isWin || (el.offsetParent !== null && r.height > 0 && !el.closest('[hidden], .drawer:not(.open)'));
      if (!visible || sh <= ch + 1) { thumb.style.display = 'none'; return; }
      thumb.style.display = '';
      const track = r.height - PAD * 2;
      const h = Math.max(36, (track * ch) / sh);
      const y = r.top + PAD + (track - h) * (st / (sh - ch));
      thumb.style.height = h + 'px';
      thumb.style.top = y + 'px';
      thumb.style.left = r.right - 10 + 'px';
      if (show) {
        thumb.classList.add('show');
        clearTimeout(hideT);
        hideT = setTimeout(() => !drag && thumb.classList.remove('show'), 1100);
      }
    }
    (isWin ? window : el).addEventListener('scroll', () => update(true), { passive: true });
    addEventListener('resize', () => update(false));
    if (!isWin) el.addEventListener('pointerenter', () => update(true));
    thumb.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      thumb.setPointerCapture(e.pointerId);
      const m = metrics();
      const track = m.r.height - PAD * 2 - parseFloat(thumb.style.height);
      drag = { y: e.clientY, st: m.st, ratio: (m.sh - m.ch) / Math.max(track, 1) };
      thumb.classList.add('drag', 'show');
    });
    thumb.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const to = drag.st + (e.clientY - drag.y) * drag.ratio;
      if (isWin) (lenis ? lenis.scrollTo(to, { immediate: true }) : scrollTo(0, to)); else el.scrollTop = to;
    });
    const end = () => { if (!drag) return; drag = null; thumb.classList.remove('drag'); update(true); };
    thumb.addEventListener('pointerup', end);
    thumb.addEventListener('pointercancel', end);
    if ('ResizeObserver' in window) new ResizeObserver(() => update(false)).observe(isWin ? document.body : el);
    update(false);
    return { update };
  }

  /* Reveal: every meaningful block animates on its own. On load, everything already on screen animates
     together; while scrolling, each block animates the moment it enters the viewport. */
  const RV_SEL = ['.hero .eyebrow', '.hero h1', '.hero .lead', '.hero .cta', '.stats .stat', '.orbit', '.marquee', '.sec-head > *', '.bento .card', '.pg-controls',
    '.pg-cell', '.sc', '.codebox', 'section .card:not(.bento .card)', '.faq details', '.lic-list li', '.site-footer .g24 > *', '.site-footer .fine',
    '.lib-head > *', '.sidebar', '.toolbar', '.result-head', '.tile', '.docs .toc', '.doc > *'].join(',');
  let rvIO = null, rvStarted = false;
  const rvDone = (el) => { el.classList.remove('rv', 'in'); el.dataset.rv = 'done'; };
  function prepReveal(root) {
    if (reduced || !('IntersectionObserver' in window)) return;
    const list = [];
    if (root.nodeType === 1 && root.matches && root.matches(RV_SEL)) list.push(root);
    if (root.querySelectorAll) list.push(...root.querySelectorAll(RV_SEL));
    list.forEach((el) => {
      if (el.dataset.rv || el.closest('.splash, .drawer, .menu-panel')) return;
      el.dataset.rv = '1';
      el.classList.add('rv');
      if (rvStarted) rvIO.observe(el);
    });
  }
  function startReveal() {
    if (rvStarted) return;
    rvStarted = true;
    if (reduced || !('IntersectionObserver' in window)) return;
    rvIO = new IntersectionObserver((ents) => ents.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      rvIO.unobserve(el);
      el.classList.add('in');
      const t = setTimeout(() => rvDone(el), 1100);
      el.addEventListener('transitionend', (ev) => { if (ev.target === el && ev.propertyName === 'opacity') { clearTimeout(t); rvDone(el); } });
    }), { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });
    $$('.rv').forEach((el) => rvIO.observe(el));
  }
  function initReveal() {
    $$('.reveal').forEach((el) => el.classList.remove('reveal')); // legacy wrappers: their children animate instead
    prepReveal(document.body);
    new MutationObserver((muts) => muts.forEach((m) => m.addedNodes.forEach((n) => n.nodeType === 1 && prepReveal(n)))).observe(document.body, { childList: true, subtree: true });
  }

  /* Boot shared bits */
  function boot() {
    hydrate();
    $$('[data-credit]').forEach((el) => (el.textContent = CREDIT));
    $$('[data-count="icons"]').forEach((el) => (el.textContent = icons.length.toLocaleString()));
    $$('[data-count="cats"]').forEach((el) => (el.textContent = usedCats.length));
    $$('[data-cdn]').forEach((el) => (el.textContent = CONFIG.cdnUrl));
    // scrollable code blocks and tables must be reachable by keyboard
    $$('.table-wrap').forEach((w) => { w.tabIndex = 0; w.setAttribute('role', 'region'); w.setAttribute('aria-label', (w.querySelector('caption') || {}).textContent || 'Table'); });
    $$('.code-pane pre, pre.code').forEach((p) => { p.tabIndex = 0; if (!p.getAttribute('aria-label') && !p.getAttribute('aria-labelledby')) p.setAttribute('aria-label', 'Code example'); });
    $$('[data-copy-credit]').forEach((b) => (b.onclick = () => copyText(CREDIT, 'Credit copied')));
    const page = document.body.dataset.page;
    $$('.nav-links a, #menuPanel a').forEach((a) => { if (a.dataset.page === page) a.setAttribute('aria-current', 'page'); });
    const tb = $('#themeBtn');
    if (tb) tb.onclick = () => setTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light');
    setTheme(document.documentElement.dataset.theme || 'dark');
    initMenu(); initScroll(); initSpace(); initReveal();
    overlayScroll(window);
  }

  window.Site = {
    CONFIG, CREDIT, $, $$, icons, render, find, catLabel, usedCats, escapeHtml, GRAD, reduced,
    hydrate, overlayScroll, startReveal, toast, copyText, saveBlob, exportSvg, toJsx, svgToPngBlob, setRangeFill, scrollToEl,
    onTheme: (f) => themeHooks.push(f), get lenis() { return lenis; }, boot,
  };
})();
