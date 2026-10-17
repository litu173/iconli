/* IconLi drop-in usage for any website.
 *
 *   <iconli-icon name="heart"></iconli-icon>
 *   <iconli-icon name="heart" variant="solid" size="32" stroke="2" color="#8f7bff" label="Favourite"></iconli-icon>
 *   <i data-iconli="rocket-duotone"></i>
 *   IconLi.svg('rocket-duotone', { size: 48 })  → SVG string
 *
 * Tokens are icon slugs: "<name>", "<name>-solid", "<name>-duotone".
 */
(function () {
  const L = window.IconLi;
  if (!L || typeof document === 'undefined') return;

  function tokenOf(name, variant) {
    let t = String(name || '').trim().toLowerCase();
    if (variant && variant !== 'outline' && !t.endsWith('-' + variant)) t += '-' + variant;
    return t;
  }
  function sizeOf(v) {
    if (v == null || v === '') return '1.5em';
    return /^\d+(\.\d+)?$/.test(v) ? +v : v;
  }
  function paint(el, token, opts, label) {
    const ic = L.get(token);
    if (!ic) {
      el.innerHTML = '';
      if (!paint.warned[token]) { paint.warned[token] = 1; console.warn(`[iconli] Unknown icon "${token}". Browse names at the IconLi icons page.`); }
      return;
    }
    let svg = L.render(ic, opts);
    if (label) svg = svg.replace(' aria-hidden="true"', ` role="img" aria-label="${String(label).replace(/"/g, '&quot;')}"`);
    else if (!/aria-hidden/.test(svg)) svg = svg.replace('<svg ', '<svg aria-hidden="true" ');
    el.innerHTML = svg;
  }
  paint.warned = {};

  class IconLiIcon extends HTMLElement {
    static get observedAttributes() { return ['name', 'variant', 'size', 'stroke', 'color', 'label', 'animate']; }
    connectedCallback() {
      if (!this.style.display) this.style.display = 'inline-flex';
      this.style.lineHeight = '0';
      this.style.verticalAlign = this.style.verticalAlign || 'middle';
      this.render();
    }
    attributeChangedCallback() { if (this.isConnected) this.render(); }
    render() {
      const stroke = this.getAttribute('stroke');
      paint(this, tokenOf(this.getAttribute('name'), this.getAttribute('variant')), {
        size: sizeOf(this.getAttribute('size')),
        stroke: stroke ? parseFloat(stroke) : undefined,
        color: this.getAttribute('color') || undefined,
        loop: this.getAttribute('animate') === 'loop',
      }, this.getAttribute('label'));
    }
  }
  if (!customElements.get('iconli-icon')) customElements.define('iconli-icon', IconLiIcon);

  /* data-attribute API: <i data-iconli="token" data-size="24" data-stroke="1.5" data-color="#000" data-label="..."> */
  function hydrate(root) {
    (root || document).querySelectorAll('[data-iconli]').forEach((el) => {
      const key = [el.dataset.iconli, el.dataset.size, el.dataset.stroke, el.dataset.color, el.dataset.label, el.dataset.animate].join('|');
      if (el.__iconli === key) return;
      el.__iconli = key;
      if (!el.style.display) el.style.display = 'inline-flex';
      paint(el, tokenOf(el.dataset.iconli), {
        size: sizeOf(el.dataset.size),
        stroke: el.dataset.stroke ? parseFloat(el.dataset.stroke) : undefined,
        color: el.dataset.color || undefined,
        loop: el.dataset.animate === 'loop',
      }, el.dataset.label);
    });
  }
  const start = () => {
    hydrate();
    new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.type === 'attributes') hydrate(m.target.parentNode || document);
        else m.addedNodes.forEach((n) => n.nodeType === 1 && (n.matches('[data-iconli]') ? hydrate(n.parentNode) : hydrate(n)));
      }
    }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-iconli', 'data-size', 'data-stroke', 'data-color'] });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  L.hydrate = hydrate;
})();
