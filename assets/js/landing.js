/* IconLi — landing page */
(function () {
  const S = window.Site;
  const { CONFIG, CREDIT, $, $$, icons, render, find, usedCats, escapeHtml, GRAD, toast, copyText, saveBlob, svgToPngBlob, setRangeFill } = S;

  /* Orbit */
  function initOrbit() {
    const rings = $$('#orbit .ring');
    const sets = [
      ['Heart', 'Rocket', 'Camera', 'Crown', 'Wallet', 'Music', 'Globe', 'Bell', 'Leaf'],
      ['Sparkles', 'Chat', 'Shield Check', 'Planet', 'Coffee', 'Code'],
      ['Star', 'Home', 'Lightning', 'Diamond'],
    ];
    const styles = ['duotone', 'solid', 'outline'];
    rings.forEach((ring, ri) => sets[ri].forEach((nm, i, set) => {
      const ic = find(nm, styles[(i + ri) % 3]) || find(nm);
      if (!ic) return;
      const a = (i / set.length) * Math.PI * 2 + ri * 0.6;
      const el = document.createElement('div');
      el.className = 'sat';
      el.style.left = 50 + 50 * Math.cos(a) + '%'; el.style.top = 50 + 50 * Math.sin(a) + '%';
      el.innerHTML = render(ic, { size: 26, gradient: ri === 0 && i % 3 === 0 ? GRAD : undefined });
      ring.appendChild(el);
    }));
  }

  /* Marquee of icons */
  function initMarquee() {
    const names = [...new Set(icons.map((i) => i.name))];
    const pick = (n, off) => Array.from({ length: n }, (_, i) => names[(i * 7 + off) % names.length]);
    $$('.marquee-track').forEach((track, row) => {
      const style = ['outline', 'duotone', 'solid'][row % 3];
      const html = pick(28, row * 13).map((n) => `<span class="mq">${render(find(n, style) || find(n), { size: 26 })}</span>`).join('');
      track.innerHTML = html + html; // duplicated for a seamless loop
    });
  }

  /* Style playground */
  function initPlayground() {
    const names = ['Heart', 'Rocket', 'Wallet', 'Bell', 'Camera', 'Planet', 'Chat', 'Crown', 'Coffee', 'Shield Check', 'Folder', 'User Star'];
    const st = { style: 'outline', stroke: 1.5, color: null, grad: false };
    const out = $('#pgGrid');
    const paint = () => {
      out.innerHTML = names.map((n) => {
        const ic = find(n, st.style) || find(n);
        return `<div class="pg-cell" role="listitem"><span>${render(ic, { size: 40, stroke: st.stroke, color: st.color || undefined, gradient: st.grad ? GRAD : undefined })}</span><small>${escapeHtml(n)}</small></div>`;
      }).join('');
    };
    const group = (sel, fn) => $$(sel + ' button').forEach((b) => (b.onclick = () => {
      $$(sel + ' button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      fn(b); paint();
    }));
    group('#pgStyle', (b) => (st.style = b.dataset.style));
    group('#pgColor', (b) => { st.grad = b.dataset.c === 'grad'; st.color = b.dataset.c === 'auto' || st.grad ? null : b.dataset.c; });
    const r = $('#pgStroke');
    r.oninput = () => { st.stroke = +r.value; $('#pgStrokeOut').textContent = r.value; setRangeFill(r); paint(); };
    setRangeFill(r);
    paint();
  }

  /* Category cards */
  function initCategories() {
    $('#showcase').innerHTML = usedCats.map(([k, n]) => {
      const pool = icons.filter((i) => i.cat === k);
      const names = [...new Set(pool.map((i) => i.name))];
      const sample = names.slice(0, 4).map((nm) => render(find(nm, 'duotone') || find(nm), { size: 24 })).join('');
      return `<a class="sc" href="icons.html?cat=${k}"><span class="sci" aria-hidden="true">${sample}</span><span class="sct"><b>${n}</b><span>${pool.length} icons</span></span></a>`;
    }).join('');
  }

  /* Code tabs */
  function initCode() {
    const tabs = $$('#codeTabs [role=tab]');
    tabs.forEach((t) => (t.onclick = () => {
      tabs.forEach((x) => { const on = x === t; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; $('#' + x.getAttribute('aria-controls')).hidden = !on; });
    }));
    $('#codeTabs').addEventListener('keydown', (e) => {
      const i = tabs.indexOf(document.activeElement); if (i < 0) return;
      const n = e.key === 'ArrowRight' ? (i + 1) % tabs.length : e.key === 'ArrowLeft' ? (i - 1 + tabs.length) % tabs.length : -1;
      if (n >= 0) { e.preventDefault(); tabs[n].focus(); tabs[n].click(); }
    });
    $$('[data-copy-code]').forEach((b) => (b.onclick = () => copyText($('#' + b.dataset.copyCode).textContent.trim(), 'Code copied')));
  }

  /* Full library ZIP (SVGs + optional PNGs + the CDN library itself) */
  async function downloadAll() {
    if (!window.JSZip) { toast('Still loading, try again in a second'); return; }
    const styles = $$('#dlOpts input[type=checkbox][value]').filter((c) => c.checked).map((c) => c.value);
    const png = $('#dlPng').checked, px = +$('#dlPngSize').value;
    if (!styles.length) { toast('Pick at least one style'); return; }
    const pick = icons.filter((i) => styles.includes(i.style));
    const zip = new JSZip();
    const root = zip.folder('iconli');
    const bar = $('#dlProg'), fill = $('i', bar), btn = $('#dlAll');
    bar.classList.add('on'); btn.disabled = true; bar.setAttribute('aria-valuenow', '0');
    const setP = (p) => { fill.style.width = p + '%'; bar.setAttribute('aria-valuenow', String(Math.round(p))); };
    for (let i = 0; i < pick.length; i++) {
      const ic = pick[i];
      const base = `${ic.style}/${ic.cat}/${ic.slug}`;
      root.file(`svg/${base}.svg`, render(ic, { size: 24, forExport: true }));
      if (png) root.file(`png-${px}/${base}.png`, await svgToPngBlob(render(ic, { size: px, color: CONFIG.defaultExportColor, forExport: true }), px));
      if (i % 25 === 0) { setP((i / pick.length) * (png ? 85 : 55)); await new Promise((r) => setTimeout(r)); }
    }
    try {
      const [lib, tokens] = await Promise.all([fetch('dist/iconli.js').then((r) => r.text()), fetch('dist/tokens.json').then((r) => r.text())]);
      root.file('dist/iconli.js', lib); root.file('dist/tokens.json', tokens);
    } catch (e) { /* offline file:// preview: the ZIP still has every SVG */ }
    root.file('LICENSE.txt', licenseText());
    root.file('README.md', readmeText(pick.length));
    const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' }, (m) => setP((png ? 85 : 55) + m.percent * (png ? 0.15 : 0.45)));
    saveBlob(blob, 'iconli.zip');
    setP(100);
    setTimeout(() => { bar.classList.remove('on'); setP(0); btn.disabled = false; }, 900);
    toast(`${pick.length.toLocaleString()} icons downloaded`);
  }
  const licenseText = () => `IconLi icon library
Copyright (c) ${new Date().getFullYear()} ${CONFIG.author}

Licensed under the Creative Commons Attribution 4.0 International License (CC BY 4.0).
${CONFIG.licenseUrl}

You may use, share and adapt the icons for any purpose, including commercial work,
as long as you give credit, e.g. "${CREDIT}", in your product's credits, about page,
footer, documentation or README. Please don't resell the icons as a competing icon set.
`;
  const readmeText = (n) => `# IconLi

${n} icons on a 24 × 24 grid with a 1.5px stroke, in outline, solid and duotone.

## Files
- \`svg/<style>/<category>/<token>.svg\`: colours use \`currentColor\`, so they inherit CSS \`color\`.
- \`dist/iconli.js\`: drop-in library. Add it with a script tag and use
  \`<iconli-icon name="heart"></iconli-icon>\` or \`<i data-iconli="heart-solid"></i>\`.
- \`dist/tokens.json\`: every token name, by category.

## Credit (required)
${CREDIT}
`;

  function initDownload() {
    $('#dlAll').onclick = downloadAll;
    const upd = () => {
      const styles = $$('#dlOpts input[type=checkbox][value]').filter((c) => c.checked).map((c) => c.value);
      $('#dlInfo').textContent = `${icons.filter((i) => styles.includes(i.style)).length.toLocaleString()} icons selected`;
    };
    $$('#dlOpts input').forEach((c) => (c.onchange = upd)); upd();
  }

  S.boot();
  initOrbit(); initMarquee(); initPlayground(); initCategories(); initCode(); initDownload();
})();
