# IconLi — luxury icon library

A free icon library with outline, solid and duotone styles on a 24 × 24 grid with a 1.5px stroke.
It combines the **Signature set** drawn in Figma (Icon_Li) with an **extended set** built to the same rules.

## Pages

| Page | What it is |
| --- | --- |
| `index.html` | Landing page (contained width): story, features, playground, categories, developer teaser, ZIP download, license, FAQ |
| `icons.html` | The library (full width): sticky filter bar, fixed category sidebar, icon grid and detail drawer. Supports `?cat=`, `?q=`, `?style=` and `#icon/<token>` links |
| `developers.html` | Docs for the drop-in library. Runs on `dist/iconli.js` itself |

## Run locally

It's a static site with no build step needed to view it:

```bash
python3 -m http.server 5174
```

## The drop-in library (CDN)

`dist/iconli.js` bundles every icon, the renderer and the `<iconli-icon>` web component:

```html
<script src="https://cdn.jsdelivr.net/npm/iconli@1/dist/iconli.js"></script>

<iconli-icon name="heart"></iconli-icon>
<iconli-icon name="rocket" variant="duotone" size="32"></iconli-icon>
<i data-iconli="crown-solid" data-color="#f2d6a2"></i>
<script>document.body.insertAdjacentHTML('beforeend', IconLi.svg('bell-solid', { size: 24 }));</script>
```

Tokens are the icon slug with a style suffix: `heart`, `heart-solid`, `heart-duotone`. The full list is in `dist/tokens.json`.

Rebuild after changing icons:

```bash
node scripts/build.mjs
```

### Publishing (makes the CDN URL live)

The jsDelivr URL works automatically once the package is on npm. The name `iconli` was free on npm at the time of writing.

```bash
npm login
npm publish --access public
```

You can also host `dist/iconli.js` on your own domain and point the script tag at it.

## IconLi Studio (CMS + icon editor)

Open **`/admin/`** (not linked from the site, and set to noindex). From there you can:
- **Icons:** browse every icon, filter by Edited, Draft, Hidden or New status, and open any icon in the editor.
- **Editor:** a simple, Figma-like canvas.
  - **Draw** with the pen, rectangle, ellipse and line tools. The tool switches back to Select when you finish, so you can resize straight away.
  - **Transform** with 8 resize handles and a rotate handle. Hold Shift to keep proportions, hold Alt to resize from the centre, and Alt-drag to duplicate. Rectangles keep their corner radius when resized.
  - **Snapping:** points snap to other points and to the keylines, with live guides, or to a ½px grid. Zoom with the wheel or +/−, and pan with Space-drag.
  - **Edit nodes:** double-click a shape to edit its nodes and Bézier handles. Double-click a segment to add a point, and Alt-click a point to remove it.
  - **Design panel:** exact X, Y, W, H and rotation fields. Turn the stroke and fill on or off, and set the stroke width, caps, joins and opacity.
  - **Arrange:** align, flip, rotate 90°, bring to front, send to back and snap to grid.
  - **Undo and redo,** with a live preview at 16–48px. Every shape has a role:
  - **Body** is stroked in outline, filled in solid and tinted in duotone.
  - **Detail** is knocked out of the solid style.
  - **Open stroke** stays a stroke in every style.
  - **Knockout** clears a gap, for example around a badge.

  Shapes can also carry a hover motion. A **Code** tab lets you edit the shapes as SVG, and **Import** turns any SVG (from Figma or elsewhere) into layers on the grid. Signature icons stay hand-drawn per style, or you can convert them to auto styles.
- **Categories:** rename, reorder, hide or add categories.
- **Defaults:** set the global stroke, export colour, duotone tint strength and which styles are generated.
- **Publish:** commits `assets/js/icons-cms.js` to GitHub. The live site reads it, and GitHub Actions rebuilds `dist/iconli.js` and redeploys.

Edits stay in your browser (drafts) until you publish. Drafts never appear on the live site.

### One-time setup
1. Push this folder to a GitHub repository (branch `main`).
2. In **Settings → Pages**, set the source to **GitHub Actions**. `.github/workflows/deploy.yml` builds and deploys on every push. On Netlify or Vercel, `netlify.toml` or `vercel.json` already sets the build command.
3. Create a **fine-grained personal access token** limited to that repository with **Contents: Read and write**.
4. Open `/admin/` → **Publish** → enter owner, repo, branch and token → **Test** → **Publish**.

## Source structure

| Path | What it is |
| --- | --- |
| `assets/css/style.css` | Design tokens (dark/light, WCAG AA contrast), the 24-column grid (`.g24`, `.s-*`, `.md-s-*`, `.lg-s-*`, `.xl-s-*`), components |
| `assets/js/icons-original.js` | Signature set exported from Figma (generated, so don't edit by hand) |
| `assets/js/icons-extended.js` | Extended set, written as a small DSL (see below) |
| `assets/js/icons-fit.js` | Precomputed optical-fit table (regenerate with `IconLi.fitTable()` in the browser console) |
| `assets/js/iconli-core.js` | Catalogue, renderer and token API (`get`, `svg`, `tokens`) |
| `assets/js/iconli-element.js` | `<iconli-icon>` and `data-iconli` support |
| `assets/js/site.js` | Shared site behaviour: theme, nav, smooth scroll, starfield, helpers |
| `assets/js/landing.js`, `library.js`, `docs.js` | Page scripts |
| `scripts/build.mjs` | Builds `dist/iconli.js` and `dist/tokens.json` |
| `assets/js/icons-cms.js` | CMS data published from IconLi Studio (overrides, new icons, categories, defaults) |
| `assets/js/icons-cat-*.js` | Per-category icon files (Animated, Office & Business, Letters/Currency/Math/Shapes in `glyphs`, …). The build picks up new files automatically |
| `assets/js/icons-cat-variants.js` | Modifier families: `window.ICONLI_MODS` (22 badges) and which bases get which badges. Adding a base name there adds up to 22 icons |
| `admin/` | IconLi Studio: `index.html`, `admin.css`, `js/path.js` (path engine), `js/model.js` (layers), `js/editor.js` (canvas), `js/cms.js` (app) |

## Adding an icon

In `assets/js/icons-extended.js`:

```js
add('category', 'Name', 'search tags', {
  b: [/* body shapes: stroked in outline, filled in solid, tinted in duotone */],
  d: [/* inner details: stroked in outline, knocked out of solid */],
  o: [/* open strokes that stay strokes in every style */],
  k: [/* optional knockout zones, e.g. around a badge */],
  t: 'optional transform, e.g. matrix(-1 0 0 1 24 0)',
});
```

Grid rules (measured from the Signature set): 24px canvas, 2px safe area, 1.5px stroke, round caps and joins.
Bare glyphs sit at ~12px. Objects and containers sit at ~19–20px (circles r≈10, squares 2→22 with ~5 corners).
Filled dots are solid and unstroked (r ≥ 0.75). User badges sit top-right in the 16–21.5 box, like *User Plus*.
New icons are measured and optically fitted automatically; regenerate `icons-fit.js` when convenient.

## Credit

Free for personal and commercial use under CC BY 4.0. Please credit: **Icons by IconLi (Mutaher) — CC BY 4.0**
