/* IconLi Studio — CMS app: icon library, editor screen, categories, defaults, GitHub publishing. */
(function () {
  const L = window.IconLi, M = window.IconModel;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const LS_WORK = 'iconli-cms-work', LS_GH = 'iconli-cms-gh';
  const findIcon = (n, st = 'outline') => L.icons.find((i) => i.name === n && i.style === st) || L.icons.find((i) => i.name === n);
  const ic = (n, size = 18) => L.render(findIcon(n), { size });
  $$('[data-ic]').forEach((e) => { e.classList.add('ui-ic'); e.innerHTML = ic(e.dataset.ic); });
  $('[data-mark]').innerHTML = L.render(findIcon('Sparkles', 'solid'), { size: 18 });

  /* ---------- Toast ---------- */
  let tt;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2400); }

  /* ---------- Data: published (from the site file) + working copy (this browser) ---------- */
  const EMPTY = { version: 1, updated: null, settings: {}, categories: [], icons: {} };
  let PUB = clone(Object.assign({}, EMPTY, window.ICONLI_CMS || {}));
  let WORK;
  try { WORK = JSON.parse(localStorage.getItem(LS_WORK)); } catch (e) {}
  if (!WORK) WORK = clone(PUB);
  WORK = Object.assign(clone(EMPTY), WORK);
  const saveWork = () => { try { localStorage.setItem(LS_WORK, JSON.stringify(WORK)); } catch (e) { toast('Browser storage is full, so export a backup.'); } updatePending(); };
  const applySettings = () => Object.assign(L.settings, { stroke: 1.5, color: '#212226', duotone: 0.22 }, WORK.settings || {}, { styles: Object.assign({ outline: true, solid: true, duotone: true }, (WORK.settings || {}).styles || {}) });
  applySettings();

  /* ---------- Catalogue of editable items ---------- */
  const catList = () => {
    const seen = new Map();
    (WORK.categories.length ? WORK.categories : L.categories).forEach(([k, label, h]) => seen.set(k, [k, label, !!h]));
    L.categories.forEach(([k, label]) => !seen.has(k) && seen.set(k, [k, label, false]));
    (PUB.categories || []).forEach(([k, label, h]) => !seen.has(k) && seen.set(k, [k, label, !!h]));
    return [...seen.values()];
  };
  function baseItems() {
    const items = new Map();
    const fam = new Map();
    L.source.orig.forEach((row) => { if (!fam.has(row[1])) fam.set(row[1], []); fam.get(row[1]).push(row); });
    fam.forEach((rows, name) => items.set('o:' + name, { key: 'o:' + name, name, cat: rows[0][2], tags: '', sig: true, base: { type: 'orig', rows } }));
    // Modifier families ("Folder Lock") have no category of their own: they inherit the base icon's
    const liveCat = new Map();
    L.icons.forEach((i) => { if (!liveCat.has(i.name)) liveCat.set(i.name, i.cat); });
    L.source.ext.forEach((def) => {
      const key = 'x:' + def.cat + '/' + def.name;
      if (def.comp) { if (liveCat.has(def.name)) items.set(key, { key, name: def.name, cat: liveCat.get(def.name), tags: def.tags || '', sig: false, base: { type: 'comp', def } }); return; }
      items.set(key, { key, name: def.name, cat: def.cat, tags: def.tags || '', sig: false, base: { type: 'ext', def } });
    });
    return items;
  }
  const BASE = baseItems();
  function items() {
    const out = [];
    BASE.forEach((it) => out.push(Object.assign({}, it, overlay(it.key))));
    Object.keys(WORK.icons).filter((k) => k.startsWith('n:')).forEach((k) => out.push(Object.assign({ key: k, base: null, sig: false }, overlay(k))));
    return out;
  }
  function overlay(key) {
    const r = WORK.icons[key];
    if (!r) return {};
    const o = { rec: r, status: r.status || 'published' };
    if (r.name) o.name = r.name; if (r.cat) o.cat = r.cat; if (r.tags != null) o.tags = r.tags;
    return o;
  }
  const changed = (key) => JSON.stringify(WORK.icons[key] || null) !== JSON.stringify(PUB.icons[key] || null);
  function thumb(it, size = 30) {
    const r = it.rec;
    try {
      if (r && r.kind === 'layers') return L.renderDef(L.layersToDef(r), 'outline', { size });
      if (r && r.kind === 'raw') return L.renderBody(r.bodies.outline || Object.values(r.bodies)[0], { size });
      if (it.base && it.base.type === 'ext') return L.renderDef(it.base.def, 'outline', { size });
      if (it.base && it.base.type === 'comp') { const ic = L.icons.find((i) => i.name === it.base.def.name && i.style === 'outline'); return ic ? L.render(ic, { size }) : ''; }
      if (it.base && it.base.type === 'orig') { const row = it.base.rows.find((x) => x[3] === 'outline') || it.base.rows[0]; return L.renderBody(row[4], { size }); }
    } catch (e) { /* broken drawing */ }
    return '';
  }

  /* ---------- Navigation ---------- */
  let view = 'icons';
  function go(v) {
    if (view === 'editor' && v !== 'editor' && dirty && !confirm('You have unsaved changes in the editor. Leave without saving?')) return;
    if (view === 'editor' && v !== 'editor') dirty = false;
    view = v;
    $$('.view').forEach((s) => (s.hidden = s.dataset.v !== v));
    $$('[data-view]').forEach((b) => (b.dataset.view === v ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current')));
    if (v === 'icons') renderIcons();
    if (v === 'categories') renderCats();
    if (v === 'defaults') renderDefaults();
    if (v === 'publish') renderPublish();
    if (v === 'editor' && !current) openEditor(null);
  }
  $$('[data-view]').forEach((b) => (b.onclick = () => go(b.dataset.view)));
  $('[data-theme-toggle]').onclick = () => {
    const t = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = t; try { localStorage.setItem('iconli-theme', t); } catch (e) {}
  };

  /* ---------- Icons view ---------- */
  let shown = 240;
  function fillCatSelect(sel, withAll) {
    sel.innerHTML = (withAll ? '<option value="">All categories</option>' : '') + catList().map(([k, label, h]) => `<option value="${k}">${esc(label)}${h ? ' (hidden)' : ''}</option>`).join('');
  }
  fillCatSelect($('[data-fcat]'), true);
  function filteredItems() {
    const q = $('[data-q]').value.trim().toLowerCase(), cat = $('[data-fcat]').value, st = $('[data-fstatus]').value;
    return items().filter((it) => {
      if (cat && it.cat !== cat) return false;
      if (q && !(it.name + ' ' + it.tags + ' ' + it.key).toLowerCase().includes(q)) return false;
      if (st === 'changed' && !changed(it.key)) return false;
      if (st === 'edited' && !(it.rec && it.base)) return false;
      if (st === 'new' && it.base) return false;
      if (st === 'draft' && it.status !== 'draft') return false;
      if (st === 'hidden' && it.status !== 'hidden') return false;
      if (st === 'sig' && !it.sig) return false;
      return true;
    }).sort((a, b) => a.cat.localeCompare(b.cat) || a.name.localeCompare(b.name));
  }
  function renderIcons(reset = true) {
    if (reset) shown = 240;
    const list = filteredItems();
    $('[data-icons-count]').textContent = `${list.length.toLocaleString()} of ${items().length.toLocaleString()} icon families`;
    $('[data-grid]').innerHTML = list.slice(0, shown).map((it) => {
      const chips = [it.sig ? '<i class="c sig">Signature</i>' : '', !it.base ? '<i class="c new">New</i>' : it.rec ? '<i class="c ed">Edited</i>' : '', it.status === 'draft' ? '<i class="c dr">Draft</i>' : '', it.status === 'hidden' ? '<i class="c hd">Hidden</i>' : '', changed(it.key) ? '<i class="c ch">Unpublished</i>' : ''].join('');
      return `<button type="button" class="st-card ${it.status === 'hidden' ? 'is-hidden' : ''}" data-open="${esc(it.key)}"><span class="th">${thumb(it)}</span><span class="nm">${esc(it.name)}</span><span class="ct">${esc((catList().find((c) => c[0] === it.cat) || [, it.cat])[1])}</span><span class="chips">${chips}</span></button>`;
    }).join('') || '<p class="hint">No icons match.</p>';
    $('[data-more]').hidden = shown >= list.length;
  }
  $('[data-grid]').addEventListener('click', (e) => { const b = e.target.closest('[data-open]'); if (b) openEditor(b.dataset.open); });
  $('[data-more]').onclick = () => { shown += 240; renderIcons(false); };
  let qt; $('[data-q]').oninput = () => { clearTimeout(qt); qt = setTimeout(renderIcons, 120); };
  $('[data-fcat]').onchange = () => renderIcons(); $('[data-fstatus]').onchange = () => renderIcons();
  $('[data-new-icon]').onclick = () => openEditor(null);

  /* ---------- Editor view ---------- */
  let current = null, dirty = false;
  const editor = new window.IconEditor($('[data-editor]'), { onChange: () => setDirty(true) });
  function setDirty(v) { dirty = v; $('[data-dirty]').hidden = !v; }
  ['name', 'cat', 'tags', 'status'].forEach((k) => $(`[data-m="${k}"]`).addEventListener('input', () => setDirty(true)));
  $$('[data-m-styles] input').forEach((c) => (c.onchange = () => setDirty(true)));
  // Detach a modifier family into plain layers: the base drawing + the badge (open strokes) + its gap (knockout)
  function compLayers(def) {
    const m = (window.ICONLI_MODS || {})[def.comp.mod];
    const b = BASE.get([...BASE.keys()].find((k) => BASE.get(k).name === def.comp.base && BASE.get(k).base && BASE.get(k).base.type !== 'comp'));
    let layers = [];
    if (b && b.base.type === 'ext') layers = M.defToLayers(b.base.def);
    else if (b && b.base.type === 'orig') { const row = b.base.rows.find((x) => x[3] === 'outline') || b.base.rows[0]; layers = M.rawToRoles(row[4]); }
    if (m) { M.parseMarkup(m.g, { layered: true, role: 'o' }).layers.forEach((l) => layers.push(l)); M.parseMarkup(m.k, { layered: true, role: 'k' }).layers.forEach((l) => layers.push(l)); }
    return layers;
  }
  function editorDataFor(it) {
    const r = it.rec;
    if (r && r.kind === 'layers') return { mode: 'layered', layers: M.recordToLayers(r) };
    if (r && r.kind === 'raw') { const bodies = {}; let unsup = []; Object.keys(r.bodies).forEach((s) => { const x = M.rawToLayers(r.bodies[s]); bodies[s] = x.layers; unsup = unsup.concat(x.unsupported); }); return { mode: 'raw', bodies, unsupported: [...new Set(unsup)] }; }
    if (it.base && it.base.type === 'ext') return { mode: 'layered', layers: M.defToLayers(it.base.def) };
    if (it.base && it.base.type === 'comp') return { mode: 'layered', layers: compLayers(it.base.def) };
    if (it.base && it.base.type === 'orig') {
      const bodies = {}; let unsup = [];
      it.base.rows.forEach(([, , , style, body]) => { const x = M.rawToLayers(body); bodies[style] = x.layers; unsup = unsup.concat(x.unsupported); });
      return { mode: 'raw', bodies, unsupported: [...new Set(unsup)] };
    }
    return { mode: 'layered', layers: [] };
  }
  function openEditor(key) {
    if (view === 'editor' && dirty && !confirm('Discard unsaved changes?')) return;
    let it = key ? items().find((x) => x.key === key) : null;
    if (!it) { key = 'n:' + Date.now().toString(36); it = { key, name: 'Untitled icon', cat: catList()[0][0], tags: '', base: null, status: 'draft' }; }
    current = it;
    fillCatSelect($('[data-m="cat"]'));
    $('[data-m="name"]').value = it.name; $('[data-m="cat"]').value = it.cat; $('[data-m="tags"]').value = it.tags || '';
    $('[data-m="status"]').value = it.status || 'published';
    const styles = (it.rec && it.rec.styles) || ['outline', 'solid', 'duotone'];
    $$('[data-m-styles] input').forEach((c) => (c.checked = styles.includes(c.value)));
    $('[data-delete]').hidden = !!it.base;
    $('[data-restore]').hidden = !it.base;
    try { editor.load(editorDataFor(it)); } catch (e) { console.error(e); toast('This icon could not be opened in the canvas. Use the Code tab.'); editor.load({ mode: 'layered', layers: [] }); }
    $('[data-m-styles]').hidden = editor.mode === 'raw';
    setDirty(false);
    view = 'editor';
    $$('.view').forEach((s) => (s.hidden = s.dataset.v !== 'editor'));
    $$('[data-view]').forEach((b) => (b.dataset.view === 'editor' ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current')));
    requestAnimationFrame(() => editor.refresh());
  }
  function saveCurrent() {
    if (!current) return;
    const res = editor.result();
    const name = $('[data-m="name"]').value.trim() || 'Untitled icon';
    const dup = items().find((x) => x.key !== current.key && x.name.toLowerCase() === name.toLowerCase() && x.cat === $('[data-m="cat"]').value);
    if (dup && !confirm(`"${name}" already exists in this category. Save anyway?`)) return;
    const rec = {
      kind: res.mode === 'raw' ? 'raw' : 'layers', name, cat: $('[data-m="cat"]').value, tags: $('[data-m="tags"]').value.trim(), status: $('[data-m="status"]').value,
      updated: new Date().toISOString(),
    };
    if (res.mode === 'raw') rec.bodies = res.bodies; else {
      rec.layers = res.layers;
      const st = $$('[data-m-styles] input').filter((c) => c.checked).map((c) => c.value);
      if (st.length < 3) rec.styles = st.length ? st : ['outline'];
      if (!rec.layers.length) { toast('Draw at least one shape before saving.'); return; }
    }
    WORK.icons[current.key] = rec;
    saveWork();
    current = items().find((x) => x.key === current.key);
    $('[data-delete]').hidden = !!current.base;
    setDirty(false);
    toast(`Saved “${name}”. Publish to send it live.`);
  }
  $('[data-save]').onclick = saveCurrent;
  document.addEventListener('keydown', (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's' && view === 'editor') { e.preventDefault(); saveCurrent(); } });
  $('[data-back]').onclick = () => go('icons');
  $('[data-discard]').onclick = () => {
    if (!current || !confirm('Discard all changes since the last publish for this icon?')) return;
    if (PUB.icons[current.key]) WORK.icons[current.key] = clone(PUB.icons[current.key]); else delete WORK.icons[current.key];
    saveWork(); dirty = false;
    const k = current.key; current = null;
    if (k.startsWith('n:') && !WORK.icons[k]) return go('icons');
    openEditor(k);
  };
  $('[data-restore]').onclick = () => {
    if (!current || !current.base || !confirm('Restore the original built-in drawing? Your edits to this icon will be removed when you publish.')) return;
    delete WORK.icons[current.key]; saveWork(); dirty = false; const k = current.key; current = null; openEditor(k);
  };
  $('[data-delete]').onclick = () => {
    if (!current || current.base || !confirm('Delete this icon? It disappears from the live site when you publish.')) return;
    delete WORK.icons[current.key]; saveWork(); dirty = false; current = null; go('icons');
  };
  addEventListener('beforeunload', (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------- Categories ---------- */
  let cats = [];
  function renderCats() {
    cats = catList();
    const counts = {};
    items().forEach((it) => (counts[it.cat] = (counts[it.cat] || 0) + 1));
    $('[data-cats]').innerHTML = cats.map(([k, label, h], i) => `<tr>
      <td><button type="button" class="btn btn-sm" data-cu="${i}" aria-label="Move up">↑</button> <button type="button" class="btn btn-sm" data-cd="${i}" aria-label="Move down">↓</button></td>
      <td><code>${esc(k)}</code></td>
      <td><input class="select" data-cl="${i}" value="${esc(label)}" aria-label="Label for ${esc(k)}" /></td>
      <td>${counts[k] || 0}</td>
      <td><input type="checkbox" data-ch="${i}" ${h ? 'checked' : ''} aria-label="Hide ${esc(label)}" /></td></tr>`).join('');
    $$('[data-cu]').forEach((b) => (b.onclick = () => mv(+b.dataset.cu, -1)));
    $$('[data-cd]').forEach((b) => (b.onclick = () => mv(+b.dataset.cd, 1)));
    $$('[data-cl]').forEach((inp) => (inp.oninput = () => (cats[+inp.dataset.cl][1] = inp.value)));
    $$('[data-ch]').forEach((c) => (c.onchange = () => (cats[+c.dataset.ch][2] = c.checked)));
  }
  function mv(i, d) { const j = i + d; if (j < 0 || j >= cats.length) return; [cats[i], cats[j]] = [cats[j], cats[i]]; WORK.categories = cats.map((c) => c.slice()); renderCatsKeep(); }
  function renderCatsKeep() { const keep = cats; renderCats(); cats = keep; }
  $('[data-add-cat]').onsubmit = (e) => {
    e.preventDefault();
    const f = e.target, key = f.key.value.trim().toLowerCase(), label = f.label.value.trim();
    if (catList().some((c) => c[0] === key)) return toast('That key already exists.');
    WORK.categories = catList().concat([[key, label, false]]); saveWork(); f.reset(); renderCats(); fillCatSelect($('[data-fcat]'), true); toast('Category added. Save, then publish.');
  };
  $('[data-save-cats]').onclick = () => { WORK.categories = cats.map(([k, l, h]) => (h ? [k, l, true] : [k, l])); saveWork(); fillCatSelect($('[data-fcat]'), true); toast('Categories saved. Publish to send them live.'); };

  /* ---------- Defaults ---------- */
  function renderDefaults() {
    const s = Object.assign({ stroke: 1.5, color: '#212226', duotone: 0.22 }, WORK.settings);
    const st = Object.assign({ outline: true, solid: true, duotone: true }, s.styles || {});
    $('[data-d=stroke]').value = s.stroke; $('[data-d=color]').value = s.color; $('[data-d=colorHex]').value = s.color; $('[data-d=duotone]').value = s.duotone;
    $$('[data-st]').forEach((c) => (c.checked = st[c.dataset.st] !== false));
    paintDefaults();
  }
  function readDefaults() {
    const styles = {}; $$('[data-st]').forEach((c) => (styles[c.dataset.st] = c.checked));
    return { stroke: +$('[data-d=stroke]').value, color: $('[data-d=color]').value, duotone: +$('[data-d=duotone]').value, styles };
  }
  function paintDefaults() {
    const s = readDefaults();
    $('[data-o=stroke]').textContent = s.stroke; $('[data-o=duotone]').textContent = Math.round(s.duotone * 100) + '%';
    const keep = Object.assign({}, L.settings); L.settings.duotone = s.duotone;
    const names = ['Heart', 'Rocket', 'Wallet', 'Bell', 'Camera', 'Planet', 'Chat', 'Crown', 'Coffee', 'Home', 'Folder', 'Handshake'];
    $('[data-dpreview]').innerHTML = ['outline', 'solid', 'duotone'].map((style) => `<div class="pv-row ${s.styles[style] ? '' : 'off'}"><b>${style}</b>${names.map((n) => { const i = findIcon(n, style); return i ? `<span>${L.render(i, { size: 30, stroke: s.stroke, color: s.color })}</span>` : ''; }).join('')}</div>`).join('');
    Object.assign(L.settings, keep);
  }
  ['stroke', 'duotone', 'color'].forEach((k) => ($(`[data-d=${k}]`).oninput = () => { if (k === 'color') $('[data-d=colorHex]').value = $('[data-d=color]').value; paintDefaults(); }));
  $('[data-d=colorHex]').oninput = (e) => { if (/^#[\da-f]{6}$/i.test(e.target.value)) { $('[data-d=color]').value = e.target.value; paintDefaults(); } };
  $$('[data-st]').forEach((c) => (c.onchange = paintDefaults));
  $('[data-save-defaults]').onclick = () => {
    const s = readDefaults();
    if (!Object.values(s.styles).some(Boolean)) return toast('Keep at least one style switched on.');
    WORK.settings = s; saveWork(); applySettings(); toast('Defaults saved. Publish to apply them live.');
  };

  /* ---------- Publish (GitHub) ---------- */
  const gh = () => { try { return JSON.parse(localStorage.getItem(LS_GH)) || {}; } catch (e) { return {}; } };
  function diff() {
    const out = [];
    const keys = new Set([...Object.keys(WORK.icons), ...Object.keys(PUB.icons)]);
    keys.forEach((k) => {
      if (!changed(k)) return;
      const w = WORK.icons[k], p = PUB.icons[k];
      const name = (w && w.name) || (p && p.name) || k.replace(/^[a-z]:/, '').split('/').pop();
      out.push({ k, name, type: !w ? (k.startsWith('n:') ? 'deleted' : 'restored to original') : !p ? (k.startsWith('n:') ? 'new' : 'edited') : w.status === 'hidden' ? 'hidden' : 'updated' });
    });
    if (JSON.stringify(WORK.settings) !== JSON.stringify(PUB.settings)) out.push({ k: '#settings', name: 'Defaults', type: 'updated' });
    if (JSON.stringify(WORK.categories) !== JSON.stringify(PUB.categories)) out.push({ k: '#categories', name: 'Categories', type: 'updated' });
    return out;
  }
  function updatePending() { const n = diff().length; const b = $('[data-pending]'); b.hidden = !n; b.textContent = n; }
  function renderPublish() {
    const d = diff();
    $('[data-changes]').innerHTML = d.length ? d.map((c) => `<li><b>${esc(c.name)}</b> <span class="c ${c.type.split(' ')[0]}">${c.type}</span> ${c.k.startsWith('#') ? '' : `<button type="button" class="linkbtn" data-undo="${esc(c.k)}">undo</button>`}</li>`).join('') : '<li class="hint">Everything is published. 🎉</li>';
    $$('[data-undo]').forEach((b) => (b.onclick = () => { const k = b.dataset.undo; if (PUB.icons[k]) WORK.icons[k] = clone(PUB.icons[k]); else delete WORK.icons[k]; saveWork(); renderPublish(); }));
    $('[data-msg]').value = `IconLi CMS: ${d.length} change${d.length === 1 ? '' : 's'}`;
    const g = gh(); const f = $('[data-gh]');
    ['owner', 'repo', 'branch', 'path'].forEach((k) => g[k] && (f[k].value = g[k]));
    f.token.value = g.token ? '••••••••' : '';
    $('[data-ghstate]').textContent = g.token && g.owner ? `· ${g.owner}/${g.repo}@${g.branch}` : '· not connected';
  }
  $('[data-gh]').onsubmit = (e) => {
    e.preventDefault();
    const f = e.target, old = gh();
    const g = { owner: f.owner.value.trim(), repo: f.repo.value.trim(), branch: f.branch.value.trim() || 'main', path: f.path.value.trim() || 'assets/js/icons-cms.js', token: f.token.value === '••••••••' ? old.token : f.token.value.trim() };
    localStorage.setItem(LS_GH, JSON.stringify(g)); renderPublish(); toast('Connection saved in this browser.');
  };
  $('[data-forget]').onclick = () => { const g = gh(); delete g.token; localStorage.setItem(LS_GH, JSON.stringify(g)); renderPublish(); toast('Token removed from this browser.'); };
  async function api(path, opts = {}) {
    const g = gh();
    if (!g.token) throw new Error('Connect GitHub first (owner, repo and token).');
    const res = await fetch('https://api.github.com' + path, Object.assign({}, opts, { headers: { Authorization: 'Bearer ' + g.token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' } }));
    if (res.status === 404) return null;
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.message ? `GitHub: ${body.message}` : `GitHub error ${res.status}`);
    return body;
  }
  const b64 = (s) => { const bytes = new TextEncoder().encode(s); let bin = ''; bytes.forEach((b) => (bin += String.fromCharCode(b))); return btoa(bin); };
  const unb64 = (s) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\n/g, '')), (c) => c.charCodeAt(0)));
  const fileText = (data) => `/* IconLi CMS data. Written by IconLi Studio (admin/index.html) — safe to edit by hand.\n   settings: global defaults · categories: order/labels/hidden · icons: overrides and new icons. */\nwindow.ICONLI_CMS = ${JSON.stringify(data)};\n`;
  const parseFile = (txt) => JSON.parse(txt.slice(txt.indexOf('=') + 1).trim().replace(/;\s*$/, ''));
  $('[data-test]').onclick = async () => {
    const g = gh();
    try { const r = await api(`/repos/${g.owner}/${g.repo}`); if (!r) throw new Error('Repository not found, or the token cannot see it.'); toast(`Connected to ${r.full_name}${r.permissions && r.permissions.push ? ' with write access' : ', but this token is read-only'}.`); }
    catch (e) { toast(e.message); }
  };
  $('[data-publish]').onclick = async () => {
    const g = gh(), msgEl = $('[data-pmsg]'), btn = $('[data-publish]');
    if (!diff().length) return toast('Nothing to publish.');
    if (dirty && !confirm('The editor has unsaved changes that will not be published. Continue?')) return;
    btn.disabled = true; msgEl.textContent = 'Publishing…';
    try {
      const url = `/repos/${g.owner}/${g.repo}/contents/${g.path.split('/').map(encodeURIComponent).join('/')}`;
      const existing = await api(`${url}?ref=${encodeURIComponent(g.branch)}`);
      const data = clone(WORK); data.updated = new Date().toISOString();
      const res = await api(url, { method: 'PUT', body: JSON.stringify({ message: $('[data-msg]').value || 'IconLi CMS update', content: b64(fileText(data)), branch: g.branch, sha: existing ? existing.sha : undefined }) });
      WORK = data; PUB = clone(data); saveWork();
      msgEl.innerHTML = `Published ✓ <a href="${res.commit.html_url}" target="_blank" rel="noopener">View commit</a>. The site redeploys in about a minute (<a href="https://github.com/${g.owner}/${g.repo}/actions" target="_blank" rel="noopener">deploy status</a>).`;
      renderPublish(); toast('Published to GitHub.');
    } catch (e) { msgEl.textContent = e.message; toast(e.message); }
    btn.disabled = false;
  };
  $('[data-pull]').onclick = async () => {
    const g = gh();
    try {
      const f = await api(`/repos/${g.owner}/${g.repo}/contents/${g.path}?ref=${encodeURIComponent(g.branch)}`);
      if (!f) throw new Error('No CMS file in the repository yet. Publish once to create it.');
      const data = Object.assign(clone(EMPTY), parseFile(unb64(f.content)));
      if (diff().length && !confirm('Replace your unpublished changes with the latest published version?')) return;
      PUB = clone(data); WORK = clone(data); saveWork(); applySettings(); renderPublish(); toast('Pulled the latest published data.');
    } catch (e) { toast(e.message); }
  };
  const save = (blob, name) => { const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: name }); a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 3000); };
  $('[data-export]').onclick = () => save(new Blob([JSON.stringify(WORK, null, 1)], { type: 'application/json' }), `iconli-cms-${new Date().toISOString().slice(0, 10)}.json`);
  $('[data-download]').onclick = () => save(new Blob([fileText(WORK)], { type: 'text/javascript' }), 'icons-cms.js');
  $('[data-import]').onchange = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try { const data = JSON.parse(await f.text()); if (!data.icons) throw new Error('Not an IconLi CMS backup.'); WORK = Object.assign(clone(EMPTY), data); saveWork(); applySettings(); renderPublish(); toast('Backup imported. Review it, then publish.'); }
    catch (err) { toast(err.message); }
  };

  updatePending();
  renderIcons();
  window.IconLiStudio = { get work() { return WORK; }, get pub() { return PUB; }, editor, openEditor, saveCurrent, diff, fileText };
})();
