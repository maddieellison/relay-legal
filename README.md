# Relay launch website

Dependency-free static website for `callwithrelay.com` in the existing
`maddieellison/relay-legal` repository. It is in **launch mode**: public metadata,
indexing and App Store CTAs are enabled for today's App Review submission. Production
publishing and DNS changes still require founder approval.

## Local preview

Node 20+. No package installation required.

```sh
npm run build
npm run lint
npm test
npm run dev
```

Open http://127.0.0.1:4387 (this computer only). Deploy only `dist/`, never the
source directory.

## Source

- `src/home.html`: centred hero, scripted-demo video and three-chapter scrolling
  phone story.
- `assets/journey.js`: 2.8 KB native-scroll enhancement; no dependencies.
- `scripts/journey-test.mjs`: scroll, keyboard and reduced-motion behaviour tests.
- `src/legal/{privacy,terms,support}.html`: byte-for-byte published source documents.
- `style.css`: responsive design, local fonts, focus and reduced-motion styles.
- `site.config.json`: verified demo/screenshot assets, App Store link and canonical
  domain.
- `assets/`: real Relay icon (resized only), derived icons, social preview,
  Newsreader/Hanken Grotesk fonts and licenses.
- `scripts/build.mjs`: generates home, clean legal/support paths, legacy `.html`
  paths, 404, metadata, sitemap and robots file.
- `scripts/check.mjs`: checks content parity, routes, links and basic semantics.
- `scripts/serve.mjs`: local server.
- `src/llms.txt`: optional machine-readable directory of authoritative public pages.
- `scripts/submit-indexnow.mjs`: dependency-free notification after an approved Pages deployment.
- `.github/workflows/website.yml`: PR/manual checks and preview artifact.
- `.github/workflows/publish.yml`: manual-only deployment to existing GitHub Pages.
- `review/`: audit and deferred app patch; screenshot evidence is local and ignored.

## Demo media

The homepage uses only supplied, verified local-demo assets. The 18.07-second,
silent H.264 reel appears immediately after the hero with native controls,
`preload="metadata"`, a poster and a visible simulation disclosure. It never
autoplays. `site.config.json` records the approved asset paths and descriptions.

| Website asset | Source asset | Placement |
| --- | --- | --- |
| `assets/media/relay-scripted-demo-18s.mp4` | `relay-launch-assets/exports/website-screenshot-reel-18s.mp4` | Primary walkthrough |
| `assets/media/relay-scripted-demo-poster.png` | `originals/screenshots/03-plan-portuguese.png` | Video poster |
| `assets/screenshots/request.png` | `originals/screenshots/02-entered-request.png` | Request chapter |
| `assets/screenshots/call.png` | `originals/screenshots/05-live-transcript.png` | Call chapter |
| `assets/screenshots/outcome.png` | `originals/screenshots/06-completed-summary.png` | Outcome chapter |

The supplied package has no separate formal asset-manifest file or London-plumber
recording. Its `README.md` and `scenario.json` provide the verified provenance:
the fictional Casa Maré result is a local scripted simulation, and no real call
or reservation occurred. Do not replace these files with unverified media.

To change an approved screen, retain its source pixels and populate its entry in
`site.config.json` in this form:

```json
{
  "path": "assets/screenshots/request.png",
  "alt": "Describe the actual supplied Relay screen",
  "width": 1170,
  "height": 2532,
  "approved": true
}
```

Use actual dimensions and descriptive alt text. Screens retain their aspect ratio;
no content overlays are added. Recheck composition with the supplied assets.

`site.config.json` intentionally separates the site state from Apple’s publication
state. `siteMode: "launch"` removes all preview language and permits indexing;
`appStoreStatus: "submission"` enables the known App Store route for App Review
without claiming it already resolves. After Apple publishes the listing, set
`appStoreStatus` to `"live"`, set `appStoreVerifiedOn` to the verification time,
and run `npm run build:production`. The production build then fetches the App Store
URL and requires it to respond successfully within seven days.

## Approved legal copy

Snapshots match the published site and Git commit
`e7feea6c8d522c054c1daa248e09aea2dc836365` byte-for-byte. The build changes only the
shell, internal link destinations, heading anchors and table wrappers. Tests compare
the complete rendered policy, terms and support text against the source snapshots.
Do not overwrite these with differing app-repository policy copies or edit legal
wording without approval.

## Publish after explicit authorisation

Existing hosting is GitHub Pages, `main` branch root, legacy build. This branch
builds `dist/`. **Do not merge while Pages is still configured to deploy the
repository root:** source pages have moved, so that would publish the wrong files.

1. Review desktop/mobile and run `npm run build:production`, `npm run lint`,
   `npm test`.
2. Obtain explicit founder authorisation for production and DNS changes.
3. In `relay-legal` Settings → Pages, change Source to **GitHub Actions** before
   merging this branch. This reuses existing hosting.
4. Merge the reviewed branch. Verify domain ownership in GitHub and set the Pages
   custom domain to `callwithrelay.com` before changing website DNS.
5. Replace the apex website A record (`217.160.0.45`) with GitHub Pages addresses:
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
   If using `www`, point its CNAME to `maddieellison.github.io`. Preserve email
   MX/TXT and other unrelated DNS records.
6. Manually run **Publish Relay website (manual)** on `main`. Enable Enforce HTTPS
   once the certificate is available.
7. Verify HTTPS at `/`, `/privacy`, `/support`, `/terms`, slash variants and legacy
   `.html` paths. Check old GitHub URL redirects, assets, social preview and download.
8. Once the App Store route resolves publicly, change `appStoreStatus` to `live`
   and add a fresh `appStoreVerifiedOn` timestamp. Then re-run the production build.
9. Only after successful public verification and approval, apply
   `review/app-legal-url.patch` in the active app checkout and release the app via
   its normal process. Update the App Store Connect fields below.

GitHub guidance checked 30 October 2026:
[custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site),
[Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
The generated `CNAME` is for portability; Actions hosting uses the custom domain
configured in GitHub Pages settings.

| Setting | Replacement after public verification |
| --- | --- |
| App / App Store Connect Privacy Policy URL | `https://callwithrelay.com/privacy` |
| App / App Store Connect Support URL | `https://callwithrelay.com/support` |
| App Terms URL | `https://callwithrelay.com/terms` |
| App Store Connect Marketing URL | `https://callwithrelay.com` |

Clean paths redirect to trailing-slash directories; both work. Legacy `.html`
pages remain available. App Store Connect's saved fields were not inspected or
changed. No app or backend code, live hosting, DNS, payments or Biz OS infrastructure
was modified. There are no analytics, cookies, forms, web purchases or new services.

## IndexNow

The build publishes the public verification key from `site.config.json` at
`/<key>.txt`. After the existing manually authorised GitHub Pages workflow has
successfully deployed `dist/`, `scripts/submit-indexnow.mjs` verifies that key at
`callwithrelay.com` and posts the canonical URLs from the generated sitemap, plus
`/llms.txt`, to the global IndexNow endpoint. It uses Node's built-in `fetch`; no
package, paid service or private secret is involved. Run `npm run build:production`
followed by `node scripts/submit-indexnow.mjs --dry-run` to inspect the exact payload
without making a submission. A normal local build never contacts IndexNow.

## Scroll design direction

The founder supplied [Flighty](https://flighty.com/) as an interaction reference.
Relay keeps its own icon, palette, fonts and copy. One central phone stays pinned
as its screenshot, editorial copy and background change through request → call →
outcome. The chapter links work with keyboard and native scrolling is never
intercepted. The homepage loads a single 2.8 KB script; legal pages load no scripts.
Without JavaScript, with reduced motion, or on viewports shorter than 620px,
all three stages appear in a normal static sequence. Changes to the motion
preference are handled without reloading. No Flighty assets or code were copied.
