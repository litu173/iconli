/* IconLi — developers page */
(function () {
  const S = window.Site;
  const { $, $$, icons, render, escapeHtml, copyText } = S;

  $$('[data-copy-code]').forEach((b) => (b.onclick = () => copyText($('#' + b.dataset.copyCode).textContent.trim(), 'Code copied')));

  const q = $('#tokQ'), res = $('#tokRes'), info = $('#tokInfo');
  const all = icons.map((i) => ({ ic: i, hay: (i.slug + ' ' + i.name + ' ' + i.tags).toLowerCase() }));
  function paint() {
    const terms = q.value.toLowerCase().split(/\s+/).filter(Boolean);
    const hits = all.filter((x) => terms.every((t) => x.hay.includes(t)));
    const show = hits.slice(0, 48);
    res.innerHTML = show.map(({ ic }) => `<li><button type="button" data-tok="${ic.slug}" aria-label="Copy ${escapeHtml(ic.slug)} tag">${render(ic, { size: 22 })}<span>${escapeHtml(ic.slug)}</span></button></li>`).join('');
    info.textContent = hits.length > show.length ? `Showing ${show.length} of ${hits.length} tokens, so refine your search to see more.` : `${hits.length} token${hits.length === 1 ? '' : 's'}`;
  }
  res.addEventListener('click', (e) => {
    const b = e.target.closest('[data-tok]');
    if (b) copyText(`<iconli-icon name="${b.dataset.tok}"></iconli-icon>`, `${b.dataset.tok} tag copied`);
  });
  q.addEventListener('input', paint);
  q.value = 'heart';
  paint();

  S.boot();
})();
