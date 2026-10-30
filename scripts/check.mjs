import assert from 'node:assert/strict';
import {readFile,stat,readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFile(path.join(root,p),'utf8');
const text=s=>s.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
const files=['index.html','privacy/index.html','terms/index.html','support/index.html','privacy.html','terms.html','support.html','404.html'];
let links=0;
for (const file of files){
  const html=await read(`dist/${file}`);
  assert.equal((html.match(/<h1\b/g)||[]).length,1,`${file}: one h1`);
  assert.match(html,/<html lang="en-GB">/);
  assert.match(html,/<main id="main"/);
  assert.match(html,/name="description"/);
  assert.match(html,/rel="canonical"/);
  assert.doesNotMatch(html,/<iframe\b|{{|javascript:|href="#"/);
  if(file==='index.html') assert.match(html, /<script src="\/assets\/journey.js" defer><\/script>/);
  else assert.doesNotMatch(html, /<script\b/);
  for(const img of html.matchAll(/<img\b[^>]+>/g)) assert.match(img[0],/alt="[^"]*"/);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(ids.length,new Set(ids).size,`${file}: unique IDs`);
  for (const [,ref] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
    if(ref.startsWith('#')) {assert.ok(ids.includes(ref.slice(1)),`${file}: ${ref}`);continue;}
    if(!ref.startsWith('/')) continue;
    const [p,fragment]=ref.split('#');
    const target=path.join(root,'dist',p,p.endsWith('/')?'index.html':'');
    await stat(target);
    if(fragment) assert.ok((await readFile(target,'utf8')).includes(`id="${fragment}"`));
    links++;
  }
}
for(const key of ['privacy','terms','support']){
  const original=(await read(`src/legal/${key}.html`)).match(/<main[^>]*>([\s\S]*?)<\/main>/)[1];
  const rendered=(await read(`dist/${key}/index.html`)).match(/<article class="legal-body">([\s\S]*?)<\/article>/)[1];
  assert.equal(text(rendered),text(original),`${key}: approved content must not change`);
  assert.equal(await read(`dist/${key}.html`),await read(`dist/${key}/index.html`));
}
const css=await read('style.css');
assert.match(css,/prefers-reduced-motion/);assert.match(css,/:focus-visible/);
for(const [,asset] of css.matchAll(/url\('\.\/([^']+)'\)/g)) await stat(path.join(root,'dist',asset));
async function total(dir){let bytes=0;for(const entry of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);bytes+=entry.isDirectory()?await total(p):(await stat(p)).size;}return bytes;}
console.log(`PASS: ${files.length} pages, ${links} internal link/asset references, exact legal/support text parity, legacy routes, metadata, font files, reduced motion, focus styles. Single local progressive-enhancement script; no third-party scripts.`);
console.log(`Total static output: ${((await total(path.join(root,'dist')))/1024).toFixed(0)} KB (before transport compression).`);
