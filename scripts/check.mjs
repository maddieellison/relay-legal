import assert from 'node:assert/strict';
import {readFile,stat,readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFile(path.join(root,p),'utf8');
const text=s=>s.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
const productRoutes=['ai-phone-call-assistant','call-restaurants-abroad','restaurant-booking-japan','make-phone-calls-in-another-language','ai-appointment-calling','how-relay-works','supported-countries-languages','relay-facts'];
const files=['index.html',...productRoutes.map(route=>`${route}/index.html`),'privacy/index.html','terms/index.html','support/index.html','privacy.html','terms.html','support.html','404.html'];
let links=0;
for (const file of files){
  const html=await read(`dist/${file}`);
  assert.equal((html.match(/<h1\b/g)||[]).length,1,`${file}: one h1`);
  assert.match(html,/<html lang="en-GB">/);
  assert.match(html,/<main id="main"/);
  assert.match(html,/name="description"/);
  assert.match(html,/rel="canonical"/);
  assert.doesNotMatch(html,/Design preview|availability pending|Coming to iPhone/);
  assert.doesNotMatch(html,/noindex/);
  assert.doesNotMatch(html,/<iframe\b|{{|javascript:|href="#"/);
  if(file==='index.html') {
    assert.match(html, /<script src="\/assets\/journey.js" defer><\/script>/);
    assert.match(html, /<video controls playsinline preload="metadata" poster="\/assets\/media\/relay-tokyo-taxi-poster\.png" aria-label="Relay walkthrough showing a Tokyo taxi request, Japanese conversation and returned journey details">/);
    assert.match(html, /<source src="\/assets\/media\/relay-tokyo-taxi\.mp4" type="video\/mp4">/);
    assert.doesNotMatch(html, /<figcaption|demo-disclosure|A Tokyo taxi request from Shibuya Station to Haneda Airport Terminal 3/);
    for(const asset of ["brightwell-dental-input.png","brightwell-dental-call.png","brightwell-dental-result.png"]) assert.match(html,new RegExp(`/assets/screenshots/${asset}`));
    assert.match(html, /Thursday at 10:30/);
    assert.match(html, /Add to calendar/);
    assert.doesNotMatch(html, /<video[^>]+autoplay/);
    assert.match(html, /href="https:\/\/apps\.apple\.com\/app\/relay-call-assistant\/id6804118976"/);
    assert.match(html, /Relay is an AI phone call assistant for iPhone that calls real businesses on your behalf/);
    assert.match(html, /"@type":"SoftwareApplication"/);
    assert.match(html, /"operatingSystem":"iOS"/);
  }
  else assert.doesNotMatch(html, /<script\b/);
  for(const img of html.matchAll(/<img\b[^>]+>/g)) assert.match(img[0],/alt="[^"]*"/);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(ids.length,new Set(ids).size,`${file}: unique IDs`);
  for (const [,ref] of html.matchAll(/(?:href|src|poster)="([^"]+)"/g)){
    if(ref.startsWith('#')) {assert.ok(ids.includes(ref.slice(1)),`${file}: ${ref}`);continue;}
    if(!ref.startsWith('/')) continue;
    const [p,fragment]=ref.split('#');
    const target=path.join(root,'dist',p,p.endsWith('/')?'index.html':'');
    await stat(target);
    if(fragment) assert.ok((await readFile(target,'utf8')).includes(`id="${fragment}"`));
    links++;
  }
}
for (const route of productRoutes) {
  const html=await read(`dist/${route}/index.html`);
  assert.match(html,new RegExp(`<link rel="canonical" href="https://callwithrelay\\.com/${route}">`));
  assert.match(html,/Download on the App Store/);
  assert.match(html,/related-links/);
}
const howRelayWorks=await read('dist/how-relay-works/index.html');
for(const phrase of ['Tell Relay what you need','Relay makes the call','Relay handles the conversation','You receive the available outcome']) assert.match(howRelayWorks,new RegExp(phrase));
const coverage=await read('dist/supported-countries-languages/index.html');
for(const phrase of ['18 destinations','English','Japanese','Spanish','French','German','Italian','European Portuguese']) assert.match(coverage,new RegExp(phrase));
const robots=await read('dist/robots.txt');
assert.match(robots,/User-agent: OAI-SearchBot\nAllow: \//);
assert.match(robots,/User-agent: \*\nAllow: \//);
const sitemap=await read('dist/sitemap.xml');
for(const route of ['/',...productRoutes.map(route=>`/${route}`),'/privacy','/terms','/support']) assert.match(sitemap,new RegExp(`<loc>https://callwithrelay\\.com${route === '/' ? '/' : route}<\\/loc>`));
const facts=await read('dist/relay-facts/index.html');
for(const phrase of ['Last updated: 6 November 2026','What is Relay?','Does Relay identify itself as AI?','Does the business need Relay installed?','Is an outcome guaranteed?','https://apps.apple.com/app/relay-call-assistant/id6804118976']) assert.ok(facts.includes(phrase),`relay-facts: ${phrase}`);
const llms=await read('dist/llms.txt');
for(const route of ['/relay-facts','/how-relay-works','/supported-countries-languages','/ai-phone-call-assistant','/call-restaurants-abroad','/restaurant-booking-japan','/make-phone-calls-in-another-language','/ai-appointment-calling','/privacy','/terms','/support']) assert.ok(llms.includes(`https://callwithrelay.com${route}`),`llms.txt: ${route}`);
assert.doesNotMatch(llms,/secret|private endpoint|prompt instruction/i);
const config=JSON.parse(await read('site.config.json'));
assert.equal(await read(`dist/${config.indexNowKey}.txt`),`${config.indexNowKey}\n`);
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
