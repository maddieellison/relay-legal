import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(await readFile(path.join(root,'site.config.json'),'utf8'));
if (config.origin !== 'https://callwithrelay.com') throw new Error('Unexpected production origin');
if (!/^[A-Za-z0-9-]{8,128}$/.test(config.indexNowKey)) throw new Error('Invalid IndexNow key');
const sitemap = await readFile(path.join(root,'dist/sitemap.xml'),'utf8');
const urlList = [...sitemap.matchAll(/<loc>(https:\/\/[^<]+)<\/loc>/g)].map(match=>match[1]);
urlList.push(`${config.origin}/llms.txt`);
if (!urlList.length || urlList.some(value=>new URL(value).origin !== config.origin)) throw new Error('Invalid IndexNow URL list');
const payload = {
  host:new URL(config.origin).host,
  key:config.indexNowKey,
  keyLocation:`${config.origin}/${config.indexNowKey}.txt`,
  urlList:[...new Set(urlList)],
};
if (process.argv.includes('--dry-run')) {
  console.log(JSON.stringify(payload,null,2));
  process.exit(0);
}
const keyResponse = await fetch(payload.keyLocation,{signal:AbortSignal.timeout(15000)});
if (!keyResponse.ok || (await keyResponse.text()).trim() !== config.indexNowKey) throw new Error(`IndexNow key is not live at ${payload.keyLocation}`);
const response = await fetch('https://api.indexnow.org/indexnow',{
  method:'POST',
  headers:{'content-type':'application/json; charset=utf-8'},
  body:JSON.stringify(payload),
  signal:AbortSignal.timeout(30000),
});
if (!response.ok) throw new Error(`IndexNow submission failed: HTTP ${response.status} ${(await response.text()).slice(0,500)}`);
console.log(`Submitted ${payload.urlList.length} public URLs to IndexNow: HTTP ${response.status}`);
