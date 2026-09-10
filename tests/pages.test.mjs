import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import test from 'node:test';
const root = fileURLToPath(new URL('../out/', import.meta.url));
function walk(dir) { return readdirSync(dir).flatMap(name => { const f=path.join(dir,name); return statSync(f).isDirectory()?walk(f):[f]; }); }
const htmlFiles = walk(root).filter(f=>f.endsWith('.html') && !f.endsWith('404.html') && !f.includes('_not-found') && !f.includes(`${path.sep}404${path.sep}`));
test('all eight public routes export headings, main content and indexable metadata', () => {
  assert.equal(htmlFiles.length, 8);
  for (const file of htmlFiles) {
    const html=readFileSync(file,'utf8');
    assert.equal((html.match(/<h1[\s>]/g)||[]).length, 1, file);
    assert.match(html, /id="content"/);
    assert.match(html, /name="robots" content="index, follow"/);
    assert.doesNotMatch(html, /從一粒米出發/);
  }
});
test('internal links and images resolve inside the GitHub Pages base path', () => {
  for (const file of htmlFiles) {
    const html=readFileSync(file,'utf8');
    for (const match of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
      const url = match[1];
      assert.ok(url.startsWith('/rinan-commons/'), `${file}: missing basePath: ${url}`);
      const relative = decodeURIComponent(url.slice('/rinan-commons/'.length));
      const target=path.join(root,relative);
      assert.ok(existsSync(target) || existsSync(path.join(target,'index.html')), `${file}: missing asset or route: ${url}`);
    }
    for (const match of html.matchAll(/href="#([^"]+)"/g)) assert.ok(html.includes(`id="${match[1]}"`), `${file}: broken anchor: ${match[1]}`);
  }
});
test('draft performer and vendor names do not leak through static HTML or browser bundles', () => {
  for (const file of walk(root).filter(f=>/\.(html|js|txt|json)$/.test(f))) {
    const text=readFileSync(file,'utf8');
    assert.doesNotMatch(text, /拍謝少年|拾光伍參柒|東明國小家長會長推薦攤位/, file);
  }
});
