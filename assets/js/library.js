/* IconLi — icons page (full-width library) */
(function () {
  const S = window.Site;
  const { CONFIG, $, $$, icons, render, find, catLabel, usedCats, escapeHtml, GRAD, toast, copyText, saveBlob, exportSvg, toJsx, svgToPngBlob, setRangeFill } = S;

  const params = new URLSearchParams(location.search);
  const validStyle = (s) => (['all', 'outline', 'solid', 'duotone'].includes(s) ? s : 'all');
  const state = {
    q: params.get('q') || '',
    style: validStyle(params.get('style')),
    cat: usedCats.some(([k]) => k === params.get('cat')) ? params.get('cat') : 'all',
    size: 28, stroke: 1.5, color: null, grad: null, shown: CONFIG.pageSize,
  };

  /* ---------- Swatches ---------- */
  const SWATCHES = [
    { k: 'auto', label: 'Theme colour' }, { k: '#212226', label: 'Graphite' }, { k: '#ffffff', label: 'White' },
    { k: '#f2d6a2', label: 'Champagne gold' }, { k: '#8f7bff', label: 'Nebula violet' }, { k: '#4be1c8', label: 'Aurora teal' }, { k: '#ff6b8a', label: 'Rose' },
  ];
  function buildSwatches(el, onPick, getCurrent) {
    el.innerHTML = '';
    el.setAttribute('role', 'group');
    SWATCHES.forEach((s) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'sw'; b.title = s.label; b.setAttribute('aria-label', s.label); b.dataset.k = s.k;
      b.style.background = s.k === 'auto' ? 'linear-gradient(135deg, var(--icon) 50%, var(--bg) 50%)' : s.k;
      b.onclick = () => onPick(s.k);
      el.appendChild(b);
    });
    const g = document.createElement('button');
    g.type = 'button'; g.className = 'sw grad'; g.title = 'Gold to violet gradient'; g.setAttribute('aria-label', 'Gold to violet gradient'); g.dataset.k = 'grad';
    g.onclick = () => onPick('grad');
    el.appendChild(g);
    const c = document.createElement('label');
    c.className = 'sw custom'; c.title = 'Custom colour'; c.dataset.k = 'custom';
    c.innerHTML = '<input type="color" value="#8f7bff"><span class="sr-only">Custom colour</span>';
    c.querySelector('input').oninput = (e) => onPick(e.target.value);
    el.appendChild(c);
    const sync = () => {
      const cur = getCurrent();
      $$('.sw', el).forEach((b) => {
        const on = b.dataset.k === cur || (b.dataset.k === 'custom' && cur && cur !== 'grad' && !SWATCHES.some((s) => s.k === cur));
        if (b.tagName === 'BUTTON') b.setAttribute('aria-pressed', String(on)); else b.classList.toggle('on', on);
      });
    };
    sync();
    return sync;
  }

  /* ---------- Filtering ---------- */
  function matches(ic, terms) {
    if (!terms.length) return true;
    const hay = (ic.name + ' ' + ic.slug + ' ' + ic.tags + ' ' + catLabel[ic.cat] + ' ' + ic.style).toLowerCase();
    return terms.every((t) => hay.includes(t));
  }
  function filtered(ignoreCat) {
    const terms = state.q.toLowerCase().split(/\s+/).filter(Boolean);
    return icons.filter((ic) => (state.style === 'all' || ic.style === state.style) && (ignoreCat || state.cat === 'all' || ic.cat === state.cat) && matches(ic, terms));
  }
  const gridOpts = () => ({ size: state.size, stroke: state.stroke, color: state.color || undefined, gradient: state.grad || undefined });
  const exportOpts = () => ({ size: 24, stroke: state.stroke, color: state.color || CONFIG.defaultExportColor, gradient: state.grad || undefined });

  function syncUrl() {
    const p = new URLSearchParams();
    if (state.cat !== 'all') p.set('cat', state.cat);
    if (state.q) p.set('q', state.q);
    if (state.style !== 'all') p.set('style', state.style);
    const qs = p.toString();
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
  }

  /* ---------- Grid ---------- */
  const grid = $('#grid');
  const QC = render(find('Copy'), { size: 14 });
  let list = [];
  const tileHtml = (ic, o) => `<div class="tile" role="listitem">
      <button type="button" class="tile-main" data-uid="${ic.uid}" aria-label="${escapeHtml(ic.name)}, ${ic.style}${ic.sig ? ', signature' : ''}. Open details">
        <span class="ic">${render(ic, o)}</span><span class="nm">${escapeHtml(ic.name)}</span>
      </button>
      ${ic.sig ? '<span class="sig" aria-hidden="true"></span>' : ''}
      <button type="button" class="qc" data-copy="${ic.uid}" aria-label="Copy ${escapeHtml(ic.name)} ${ic.style} SVG" title="Copy SVG">${QC}</button>
    </div>`;
  let rendered = 0;
  // reset: new filter → rebuild. repaint: same list, new size/stroke/colour → rebuild what's shown. more: append only.
  function renderGrid(reset = true, mode = 'repaint') {
    if (reset) { state.shown = CONFIG.pageSize; mode = 'repaint'; }
    list = filtered();
    $('#resTitle').textContent = state.cat === 'all' ? (state.q ? 'Search results' : 'All icons') : catLabel[state.cat];
    $('#resCount').textContent = `${list.length.toLocaleString()} icon${list.length === 1 ? '' : 's'}`;
    grid.style.setProperty('--cell', Math.max(state.size * 2.6 + 30, innerWidth < 768 ? 92 : 108) + 'px');
    const o = gridOpts();
    const slice = list.slice(0, state.shown);
    if (!slice.length) {
      grid.innerHTML = `<div class="empty" role="listitem">No icons match “${escapeHtml(state.q)}”.<br>Try another word, switch the style to All, or pick All icons.</div>`;
      rendered = 0;
    } else if (mode === 'more' && rendered) {
      // append only; nothing new means nothing to do (never rebuild tiles under the user's pointer)
      if (rendered < slice.length) grid.insertAdjacentHTML('beforeend', slice.slice(rendered).map((ic) => tileHtml(ic, o)).join(''));
      rendered = Math.max(rendered, slice.length);
    } else {
      grid.innerHTML = slice.map((ic) => tileHtml(ic, o)).join('');
      rendered = slice.length;
    }
    $('#moreBtn').hidden = state.shown >= list.length;
    if (mode !== 'more') $('#liveRegion').textContent = `${list.length} icons`;
    if (mode !== 'more') updateCatCounts();
  }
  const loadMore = () => { if (state.shown >= list.length) return; state.shown += CONFIG.pageSize; renderGrid(false, 'more'); };

  grid.addEventListener('click', (e) => {
    const qc = e.target.closest('[data-copy]');
    if (qc) { const ic = icons[+qc.dataset.copy]; copyText(render(ic, Object.assign(exportOpts(), { forExport: true })), `${ic.name} SVG copied`); return; }
    const t = e.target.closest('.tile-main');
    if (t) openDrawer(icons[+t.dataset.uid], t);
  });
  grid.addEventListener('pointermove', (e) => {
    const t = e.target.closest('.tile'); if (!t) return;
    const r = t.getBoundingClientRect();
    t.style.setProperty('--mx', e.clientX - r.left + 'px'); t.style.setProperty('--my', e.clientY - r.top + 'px');
  });
  $('#moreBtn').onclick = loadMore;
  new IntersectionObserver((ents) => {
    if (ents[0].isIntersecting && !$('#moreBtn').hidden) loadMore();
  }, { rootMargin: '800px' }).observe($('.more-row'));
  let raf;
  const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => renderGrid(false)); };

  /* ---------- Categories (sidebar + mobile chips) ---------- */
  const catIcon = { all: 'Grid', animated: 'Magic Sparkles', interface: 'Settings', arrows: 'Arrow Up Right', communication: 'Chat', media: 'Play', files: 'Folder', devices: 'Smartphone', connectivity: 'WiFi', commerce: 'Wallet', office: 'Handshake', people: 'User', social: 'Heart', security: 'Shield Check', nature: 'Leaf', space: 'Planet', travel: 'Compass', health: 'Heart Pulse', food: 'Coffee', education: 'Graduation Cap', design: 'Palette', text: 'Type', dev: 'Code', charts: 'Chart Pie', time: 'Clock', lifestyle: 'Sofa', games: 'Gamepad' };
  function buildCats() {
    const all = [['all', 'All icons'], ...usedCats];
    $('#cats').innerHTML = all.map(([k, n]) => `<li><button type="button" class="cat" data-cat="${k}" aria-pressed="${k === state.cat}"><span class="ci" aria-hidden="true">${render(find(catIcon[k] || 'Grid'), { size: 16 })}</span><span class="cn">${n}</span><span class="cnt" data-cnt="${k}"></span></button></li>`).join('');
    $('#chips').innerHTML = all.map(([k, n]) => `<button type="button" class="chip" data-cat="${k}" aria-pressed="${k === state.cat}">${n}</button>`).join('');
    $$('[data-cat]').forEach((b) => (b.onclick = () => setCat(b.dataset.cat)));
  }
  function setCat(k) {
    state.cat = k;
    $$('[data-cat]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cat === k)));
    const chip = $(`.chip[data-cat="${k}"]`); if (chip) chip.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    renderGrid(); syncUrl();
    const top = $('#libTop').getBoundingClientRect().top + scrollY - ($('#nav').offsetHeight + 4);
    if (scrollY > top) S.lenis ? S.lenis.scrollTo(top, { immediate: true }) : scrollTo({ top });
  }
  function updateCatCounts() {
    const base = filtered(true);
    const counts = { all: base.length };
    base.forEach((i) => (counts[i.cat] = (counts[i.cat] || 0) + 1));
    $$('[data-cnt]').forEach((s) => (s.textContent = counts[s.dataset.cnt] || 0));
  }

  /* ---------- Toolbar ---------- */
  function movePill(seg) {
    const on = $('[aria-pressed="true"]', seg), pill = $('.pill', seg);
    if (on && pill) { pill.style.left = on.offsetLeft + 'px'; pill.style.width = on.offsetWidth + 'px'; }
  }
  function initToolbar() {
    const q = $('#q');
    q.value = state.q;
    let qt;
    q.addEventListener('input', () => { clearTimeout(qt); qt = setTimeout(() => { state.q = q.value.trim(); renderGrid(); syncUrl(); }, 120); });
    const seg = $('#styleSeg');
    $$('button', seg).forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.style === state.style));
      b.onclick = () => {
        $$('button', seg).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        state.style = b.dataset.style; movePill(seg); renderGrid(); syncUrl();
      };
    });
    const measure = () => {
      movePill(seg);
      document.documentElement.style.setProperty('--nav-h', $('#nav').offsetHeight + 'px');
      document.documentElement.style.setProperty('--tb-h', $('#toolbar').offsetHeight + 'px');
    };
    requestAnimationFrame(measure);
    addEventListener('resize', measure);
    if (document.fonts) document.fonts.ready.then(measure);

    const gs = $('#gSize'), gst = $('#gStroke');
    gs.oninput = () => { state.size = +gs.value; $('#gSizeOut').textContent = gs.value; setRangeFill(gs); schedule(); };
    gst.oninput = () => { state.stroke = +gst.value; $('#gStrokeOut').textContent = gst.value; setRangeFill(gst); schedule(); };
    setRangeFill(gs); setRangeFill(gst);
    const sync = buildSwatches($('#gSwatches'), (k) => {
      state.grad = k === 'grad' ? GRAD : null;
      state.color = k === 'auto' || k === 'grad' ? null : k;
      sync(); schedule();
    }, () => (state.grad ? 'grad' : state.color || 'auto'));

    // Mobile: customise controls collapse behind a toggle
    const tg = $('#tuneBtn'), panel = $('#tunePanel');
    tg.onclick = () => {
      const open = tg.getAttribute('aria-expanded') !== 'true';
      tg.setAttribute('aria-expanded', String(open));
      panel.classList.toggle('open', open);
      requestAnimationFrame(measure);
    };

    addEventListener('keydown', (e) => {
      const tag = document.activeElement.tagName;
      if (e.key === '/' && !/input|textarea|select/i.test(tag) && !$('#drawer').classList.contains('open')) { e.preventDefault(); q.focus(); }
    });
  }

  /* ---------- Drawer ---------- */
  const d = { icon: null, size: 64, stroke: 1.5, color: CONFIG.defaultExportColor, grad: false, g1: GRAD[0], g2: GRAD[1], bg: false, bgColor: '#f2d6a2', radius: 30, pad: 6 };
  let dSync = () => {};
  let returnFocus = null;
  let drawerBar = { update() {} };
  const dOpts = (forExport) => ({ size: d.size, stroke: d.stroke, color: d.color, gradient: d.grad ? [d.g1, d.g2] : undefined, bg: d.bg ? d.bgColor : undefined, radius: d.radius, padding: d.bg ? d.pad : 0, forExport });
  function lum(hex) {
    const m = /^#?([\da-f]{6})$/i.exec(hex || ''); if (!m) return 0.5;
    const n = parseInt(m[1], 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  }
  function meta(ic) {
    return `${ic.cat === 'animated' ? '<span class="tag gold">Animates on hover</span>' : ''}<span class="tag">${catLabel[ic.cat]}</span><span class="tag">${ic.style[0].toUpperCase() + ic.style.slice(1)}</span>${ic.sig ? '<span class="tag gold">Signature</span>' : ''}<span class="tag">24 × 24</span>`;
  }
  function paintDrawer() {
    const ic = d.icon; if (!ic) return;
    $('#dPreview').innerHTML = render(ic, Object.assign(dOpts(false), { size: Math.min(d.size, 200) }));
    const dark = document.documentElement.dataset.theme !== 'light';
    const iconL = d.grad ? 0.6 : lum(d.color);
    $('#dStage').classList.toggle('stage-light', !d.bg && dark && iconL < 0.3);
    $('#dStage').classList.toggle('stage-dark', !d.bg && !dark && iconL > 0.85);
    $('#dDims').textContent = `${d.size} × ${d.size}px · stroke ${d.stroke}`;
    $('#dToken').textContent = ic.slug;
    $('#dCode').textContent = exportSvg(ic, dOpts(true));
    $('#dSizeOut').textContent = d.size + 'px';
    $('#dStrokeOut').textContent = d.stroke;
  }
  function setIcon(ic) {
    d.icon = ic;
    $('#dTitle').textContent = ic.name;
    $('#dMeta').innerHTML = meta(ic);
    history.replaceState(null, '', location.pathname + location.search + '#icon/' + ic.slug);
    paintDrawer();
  }
  function openDrawer(ic, from) {
    returnFocus = from || document.activeElement;
    d.stroke = state.stroke;
    if (state.grad) d.grad = true; else if (state.color) { d.color = state.color; d.grad = false; }
    syncDrawerInputs();
    buildVariants(ic);
    setIcon(ic);
    const dr = $('#drawer');
    dr.hidden = false;
    void dr.offsetWidth; // commit the hidden→visible change so the slide-in transition runs
    dr.classList.add('open'); $('#scrim').classList.add('open');
    $('#libShell').setAttribute('inert', '');
    S.lenis && S.lenis.stop();
    document.body.classList.add('drawer-open');
    $('.drawer-scroll').scrollTop = 0;
    setTimeout(() => drawerBar.update(true), 650);
    setTimeout(() => $('#dClose').focus({ preventScroll: true }), 60);
  }
  function closeDrawer() {
    const dr = $('#drawer');
    if (!dr.classList.contains('open')) return;
    dr.classList.remove('open'); $('#scrim').classList.remove('open');
    $('#libShell').removeAttribute('inert');
    S.lenis && S.lenis.start();
    document.body.classList.remove('drawer-open');
    drawerBar.update(false);
    setTimeout(() => { if (!dr.classList.contains('open')) dr.hidden = true; }, 600);
    if (location.hash.startsWith('#icon/')) history.replaceState(null, '', location.pathname + location.search);
    if (returnFocus && document.contains(returnFocus)) returnFocus.focus({ preventScroll: true });
  }
  function buildVariants(ic) {
    const first = ic.name.split(' ')[0];
    const same = icons.filter((i) => i.name === ic.name);
    const related = icons.filter((i) => i.name !== ic.name && i.cat === ic.cat && i.name.split(' ')[0] === first && i.style === ic.style).slice(0, 10);
    const all = [...same, ...related];
    $('#dVariants').innerHTML = all.map((v) => `<button type="button" class="variant" data-v="${v.uid}" aria-pressed="${v === ic}" aria-label="${escapeHtml(v.name)}, ${v.style}" title="${escapeHtml(v.name)} · ${v.style}">${render(v, { size: 24 })}</button>`).join('');
    $$('[data-v]').forEach((b) => (b.onclick = () => {
      $$('[data-v]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      setIcon(icons[+b.dataset.v]);
    }));
  }
  function syncDrawerInputs() {
    $('#dSize').value = d.size; $('#dStroke').value = d.stroke;
    $('#dColor').value = d.color; $('#dColorHex').value = d.color;
    $('#dGrad').setAttribute('aria-checked', String(d.grad)); $('#dGradRow').hidden = !d.grad;
    $('#dBg').setAttribute('aria-checked', String(d.bg)); $('#dBgRow').hidden = !d.bg;
    $$('#drawer input[type=range]').forEach(setRangeFill);
    dSync();
  }
  function bindColor(picker, hex, set) {
    const apply = (v) => { if (/^#[\da-f]{6}$/i.test(v)) { picker.value = v; hex.value = v; set(v.toLowerCase()); paintDrawer(); dSync(); } };
    picker.oninput = () => apply(picker.value);
    hex.oninput = () => apply(hex.value.startsWith('#') ? hex.value : '#' + hex.value);
  }
  function trapFocus(e) {
    if (e.key !== 'Tab' || !$('#drawer').classList.contains('open')) return;
    const f = $$('#drawer button, #drawer input, #drawer [tabindex="0"]').filter((el) => !el.disabled && el.offsetParent !== null);
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function initDrawer() {
    $('#scrim').onclick = closeDrawer; $('#dClose').onclick = closeDrawer;
    addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); trapFocus(e); });
    const sz = $('#dSize'), st = $('#dStroke');
    sz.oninput = () => { d.size = +sz.value; setRangeFill(sz); paintDrawer(); };
    st.oninput = () => { d.stroke = +st.value; setRangeFill(st); paintDrawer(); };
    bindColor($('#dColor'), $('#dColorHex'), (v) => { d.color = v; d.grad = false; $('#dGrad').setAttribute('aria-checked', 'false'); $('#dGradRow').hidden = true; });
    bindColor($('#dG1'), $('#dG1Hex'), (v) => (d.g1 = v));
    bindColor($('#dG2'), $('#dG2Hex'), (v) => (d.g2 = v));
    bindColor($('#dBgColor'), $('#dBgHex'), (v) => (d.bgColor = v));
    $('#dGrad').onclick = () => { d.grad = !d.grad; syncDrawerInputs(); paintDrawer(); };
    $('#dBg').onclick = () => { d.bg = !d.bg; syncDrawerInputs(); paintDrawer(); };
    const rr = $('#dRadius'), pp = $('#dPad');
    rr.oninput = () => { d.radius = +rr.value; $('#dRadiusOut').textContent = rr.value + '%'; setRangeFill(rr); paintDrawer(); };
    pp.oninput = () => { d.pad = +pp.value; $('#dPadOut').textContent = pp.value; setRangeFill(pp); paintDrawer(); };
    dSync = buildSwatches($('#dSwatches'), (k) => {
      if (k === 'grad') d.grad = true;
      else { d.grad = false; d.color = k === 'auto' ? CONFIG.defaultExportColor : k; }
      syncDrawerInputs(); paintDrawer();
    }, () => (d.grad ? 'grad' : d.color));

    $('#dCopyToken').onclick = () => copyText(`<iconli-icon name="${d.icon.slug}"></iconli-icon>`, 'Token snippet copied');
    $('#aCopySvg').onclick = () => copyText(render(d.icon, dOpts(true)), 'SVG copied');
    $('#aCopyJsx').onclick = () => copyText(toJsx(render(d.icon, dOpts(true))), 'JSX copied');
    $('#aDlSvg').onclick = () => { saveBlob(new Blob([exportSvg(d.icon, dOpts(true))], { type: 'image/svg+xml' }), d.icon.slug + '.svg'); toast('SVG downloaded'); };
    $('#aDlPng').onclick = async () => { saveBlob(await svgToPngBlob(render(d.icon, dOpts(true)), d.size), `${d.icon.slug}-${d.size}px.png`); toast('PNG downloaded'); };
    $('#aCopyPng').onclick = async () => {
      try {
        const blob = await svgToPngBlob(render(d.icon, dOpts(true)), Math.max(d.size, 64));
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        toast('PNG copied');
      } catch (e) { toast('Your browser blocked image copy. Use Download PNG instead.'); }
    };
    S.onTheme(() => d.icon && paintDrawer());
  }

  function fromHash() {
    const m = /^#icon\/(.+)$/.exec(location.hash);
    if (m) { const ic = icons.find((i) => i.slug === decodeURIComponent(m[1])); if (ic) openDrawer(ic); }
  }

  S.boot();
  buildCats(); initToolbar(); initDrawer(); renderGrid();
  S.overlayScroll($('.sidebar'));
  drawerBar = S.overlayScroll($('.drawer-scroll'), { cls: 'in-drawer' });
  $('#drawer').addEventListener('transitionend', () => drawerBar.update(true));
  fromHash(); addEventListener('hashchange', fromHash);
  window.IconLiPage = { state, openDrawer, closeDrawer, setCat };
})();
