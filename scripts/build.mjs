// Builds the distributable IconLi library:
//   dist/iconli.js     one script: icon data + renderer + <iconli-icon> element + data-iconli hydration
//   dist/tokens.json   every token name, grouped by category and style
// Usage: node scripts/build.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = (f) => readFileSync(join(root, 'assets/js', f), 'utf8');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

import { readdirSync } from 'node:fs';
const cats = readdirSync(join(root, 'assets/js')).filter((f) => /^icons-cat-.+\.js$/.test(f)).sort();
const parts = ['icons-original.js', 'icons-extended.js', ...cats, 'icons-fit.js', 'icons-cms.js', 'iconli-core.js', 'iconli-element.js']
  .filter((f) => existsSync(join(root, 'assets/js', f)));

const banner = `/*! IconLi v${pkg.version} | ${pkg.license} | Icons by IconLi (Mutaher) | credit required: "Icons by IconLi (Mutaher) — CC BY 4.0" */\n`;
const body = parts.map((f) => `/* ---- ${f} ---- */\n${src(f)}`).join('\n');
mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist/iconli.js'), banner + body);

// Token manifest (evaluated headlessly; fitting is skipped without a DOM, which doesn't affect names)
const ctx = { window: {}, console };
ctx.window.window = ctx.window;
vm.createContext(ctx);
for (const f of parts.filter((f) => f !== 'iconli-element.js')) vm.runInContext(src(f).replace(/\bwindow\b/g, 'window'), ctx);
const L = ctx.window.IconLi;
const manifest = { version: pkg.version, count: L.icons.length, categories: {} };
for (const ic of L.icons) {
  const c = (manifest.categories[ic.cat] ||= { label: L.categories.find(([k]) => k === ic.cat)[1], tokens: [] });
  c.tokens.push(ic.slug);
}
writeFileSync(join(root, 'dist/tokens.json'), JSON.stringify(manifest, null, 1));
const kb = (f) => (readFileSync(join(root, f)).length / 1024).toFixed(0) + ' KB';
console.log(`dist/iconli.js ${kb('dist/iconli.js')} · ${manifest.count} icons · tokens.json ${kb('dist/tokens.json')}`);
