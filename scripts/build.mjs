import { readFile, writeFile, mkdir, cp, stat, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFile(path.join(root, p), 'utf8');
const config = JSON.parse(await read('site.config.json'));
const production = process.argv.includes('--production');
const base = config.basePath.replace(/\/$/, '');
if (base && !/^\/[a-z0-9/-]+$/i.test(base)) throw new Error('Invalid basePath');
if (config.origin !== 'https://callwithrelay.com') throw new Error('Unexpected production origin');
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const missing = [];
if (!config.appStoreUrl || !config.appStoreVerifiedOn) missing.push('verified live App Store link');
if (config.appStoreUrl && !/^https:\/\/apps\.apple\.com\/(?:[a-z]{2}\/)?app\/(?:[^/]+\/)?id6804118976(?:\?.*)?$/.test(config.appStoreUrl)) throw new Error('App Store URL must match Relay’s app ID 6804118976');
const slots = {
  request: {number:'01', title:'Your request', alt:'Relay request screen'},
  call: {number:'02', title:'The conversation', alt:'Relay call transcript screen'},
  outcome: {number:'03', title:'The outcome', alt:'Relay call outcome screen'},
};
for (const key of Object.keys(slots)) {
  const media = config.screenshots[key];
  if (!media) { missing.push(`${key} screenshot`); continue; }
  if (!/^assets\/screenshots\/[a-zA-Z0-9_-]+\.(png|webp|jpe?g)$/.test(media.path) || !media.alt || !Number.isInteger(media.width) || !Number.isInteger(media.height) || media.width < 1 || media.height < media.width || !media.approved) throw new Error(`Invalid or unapproved ${key} screenshot`);
  await stat(path.join(root, media.path));
}
// Fail BEFORE replacing the last usable preview.
if (production && missing.length) throw new Error(`Launch blocked: supply ${missing.join(', ')}. Preview remains available with npm run build.`);
if (production) {
  const verifiedAge = Date.now() - Date.parse(config.appStoreVerifiedOn);
  if (!Number.isFinite(verifiedAge) || verifiedAge < 0 || verifiedAge > 7*86400000) throw new Error('Reverify the App Store listing within 7 days of release');
  const response = await fetch(config.appStoreUrl, {signal: AbortSignal.timeout(15000)});
  if (!response.ok) throw new Error(`App Store listing is not live: HTTP ${response.status}`);
}
const out = path.join(root, 'dist');
await rm(out, {recursive:true, force:true}); // Only disposable generated output.
await mkdir(out, {recursive:true});
await cp(path.join(root, 'assets'), path.join(out, 'assets'), {recursive:true});
await cp(path.join(root, 'style.css'), path.join(out, 'style.css'));
const url = p => `${base}${p}`;
const brand = `<a class="brand" href="${url('/')}" aria-label="Relay home"><img src="${url('/assets/app-icon.png')}" width="38" height="38" alt=""><span class="wordmark">Relay</span></a>`;
const footer = `<footer class="site-footer wrap"><div class="footer-top">${brand}<nav aria-label="Footer"><a href="${url('/privacy/')}">Privacy Policy</a><a href="${url('/terms/')}">Terms of Service</a><a href="${url('/support/')}">Support</a></nav></div><div class="footer-bottom"><span>© 2026 MES Genesis Co Ltd. All rights reserved.</span><span>Your AI calling assistant for iPhone.</span></div></footer>`;
const download = config.appStoreUrl && config.appStoreVerifiedOn ? `<a class="button" href="${esc(config.appStoreUrl)}">Download on the App Store <span aria-hidden="true">↗</span></a>` : '<span class="availability">Coming to iPhone</span>';
function document(title, description, route, body) {
  const canonical = `${config.origin}${route === '/' ? '/' : route.replace(/\/$/, '')}`;
  return `<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="theme-color" content="#f3efe6">${production ? '' : '<meta name="robots" content="noindex, nofollow">'}<link rel="canonical" href="${canonical}"><meta property="og:type" content="website"><meta property="og:site_name" content="Relay"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${config.origin}${url('/assets/social-preview.png')}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Relay. Your plans. Your time. Relay’s call."><meta name="twitter:card" content="summary_large_image"><link rel="icon" type="image/png" href="${url('/assets/favicon.png')}"><link rel="apple-touch-icon" href="${url('/assets/apple-touch-icon.png')}"><link rel="preload" href="${url('/assets/fonts/newsreader-medium.ttf')}" as="font" type="font/ttf" crossorigin><link rel="stylesheet" href="${url('/style.css')}"></head>
<body><a class="skip" href="#main">Skip to content</a>${!production ? '<div class="preview-notice">Design preview · Final app screenshots and App Store availability pending</div>' : ''}<header class="site-header wrap">${brand}<nav aria-label="Main"><a class="desktop-nav" href="${url('/#how-it-works')}">How it works</a><a href="${url('/support/')}">Support</a><a class="nav-link" href="${url('/privacy/')}">Privacy</a></nav></header>${body}${footer}${route === "/" ? `<script src="${url("/assets/journey.js")}" defer></script>` : ""}</body></html>\n`;
}
let home = await read('src/home.html');
home = home.replaceAll('{{BASE}}', base).replaceAll('{{DOWNLOAD}}', download);
for (const [key, slot] of Object.entries(slots)) {
  const media = config.screenshots[key];
  const markup = media ? `<img src="${url('/' + media.path)}" alt="${esc(media.alt)}" width="${media.width}" height="${media.height}" ${key === 'call' ? 'loading="lazy"' : 'fetchpriority="high"'}>` : `<div class="media-slot" data-media-slot="${key}"><span class="slot-index">${slot.number}</span><span class="slot-rule" aria-hidden="true"></span><span class="slot-title">${slot.title}</span><span class="slot-status">App screenshot<br>awaiting final capture</span></div>`;
  home = home.replaceAll(`{{MEDIA:${key}}}`, markup);
}
await writeFile(path.join(out,'index.html'), document('Relay — Phone calls, handled for you', 'Relay is your AI calling assistant for iPhone. Tell it who to call and what you need, then review the outcome in the app.', '/', home));
for (const key of ['privacy','terms','support']) {
  const source = await read(`src/legal/${key}.html`);
  let content = source.match(/<main[^>]*>([\s\S]*?)<\/main>/)[1];
  const title = {privacy:'Privacy Policy', terms:'Terms of Service', support:'Support'}[key];
  const toc = [];
  let tableIndex = 0;
  content = content.replace(/<h2>([\s\S]*?)<\/h2>/g, (_, heading) => {
    const id = `section-${toc.length+1}`;
    toc.push(`<a href="#${id}">${heading}</a>`);
    return `<h2 id="${id}">${heading}</h2>`;
  }).replace(/href="(privacy|terms|support|index)\.html"/g, (_, p) => `href="${url(p === 'index' ? '/' : `/${p}/`)}"`)
    .replace(/<table>/g, () => `<div class="table-scroll" role="region" aria-label="${tableIndex++ === 0 ? 'Personal data and purposes' : 'Service providers'}" tabindex="0"><table>`)
    .replace(/<\/table>/g, '</table></div>');
  const nav = ['privacy','terms','support'].map(p => `<a href="${url(`/${p}/`)}"${p===key ? ' aria-current="page"' : ''}>${{privacy:'Privacy Policy',terms:'Terms of Service',support:'Support'}[p]}</a>`).join('');
  const body = `<main id="main" tabindex="-1" class="legal-layout wrap"><aside class="legal-aside"><p class="eyebrow">Relay · Help &amp; legal</p><nav aria-label="Legal and support">${nav}</nav>${toc.length > 1 ? `<nav class="contents" aria-label="On this page">${toc.join('')}</nav>` : ''}</aside><article class="legal-body">${content}</article></main>`;
  const html = document(`${title} — Relay`, `${title} for Relay, the AI calling assistant for iPhone.`, `/${key}/`, body);
  await mkdir(path.join(out,key),{recursive:true});
  await writeFile(path.join(out,key,'index.html'),html);
  await writeFile(path.join(out,`${key}.html`),html); // Preserve all existing in-app URLs.
}
await writeFile(path.join(out,'404.html'),document('Page not found — Relay','Return to Relay or get support.','/404',`<main id="main" tabindex="-1" class="not-found wrap"><p class="eyebrow">404 · A wrong number</p><h1>This page isn’t here.</h1><p>Head back to Relay, or get in touch if you need a hand.</p><a class="button" href="${url('/')}">Back to Relay</a></main>`));
await writeFile(path.join(out,'robots.txt'), production ? `User-agent: *\nAllow: /\nSitemap: ${config.origin}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n');
await writeFile(path.join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/','/privacy','/terms','/support'].map(p=>`<url><loc>${config.origin}${p}</loc></url>`).join('')}</urlset>`);
await writeFile(path.join(out,'.nojekyll'),'');
if (production) await writeFile(path.join(out,'CNAME'),'callwithrelay.com\n');
console.log(`Built ${production ? 'production' : 'preview'} site in dist/. ${production ? '' : `Launch pending: ${missing.join(', ')}.`}`);
