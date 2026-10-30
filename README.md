# Relay launch website

Dependency-free static website for `callwithrelay.com` in the existing
`maddieellison/relay-legal` repository. **Preview only until final screenshots,
the public App Store URL, and founder production approval are supplied.**

## Local preview

Node 20+. No package installation required.

```sh
npm run build
npm run lint
npm test
npm run dev
```

Open http://127.0.0.1:4387 (this computer only). Preview includes a review notice
and `noindex`. Deploy only `dist/`, never the source directory.

## Source

- `src/home.html`: centred hero and three-chapter scrolling phone story.
- `assets/journey.js`: 2.8 KB native-scroll enhancement; no dependencies.
- `scripts/journey-test.mjs`: scroll, keyboard and reduced-motion behaviour tests.
- `src/legal/{privacy,terms,support}.html`: byte-for-byte published source documents.
- `style.css`: responsive design, local fonts, focus and reduced-motion styles.
- `site.config.json`: screenshot assets, App Store link and canonical domain.
- `assets/`: real Relay icon (resized only), derived icons, social preview,
  Newsreader/Hanken Grotesk fonts and licenses.
- `scripts/build.mjs`: generates home, clean legal/support paths, legacy `.html`
  paths, 404, metadata, sitemap and robots file.
- `scripts/check.mjs`: checks content parity, routes, links and basic semantics.
- `scripts/serve.mjs`: local server.
- `.github/workflows/website.yml`: PR/manual checks and preview artifact.
- `.github/workflows/publish.yml`: manual-only deployment to existing GitHub Pages.
- `review/`: audit and deferred app patch; screenshot evidence is local and ignored.

## Supply launch assets

Three genuine, approved screenshots are required: request/plan, live conversation,
and outcome. Use a controlled example without personal information. Store supplied
files unchanged in `assets/screenshots/`; do not recreate their UI. Populate
`request`, `call` and `outcome` in `site.config.json`, each in this form:

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

Set `appStoreUrl` when Relay app ID `6804118976` is publicly available; set
`appStoreVerifiedOn` to the ISO timestamp of verification. Until then there is an
availability message, not a dead download link. Production requires verification
within seven days and fetches the App Store URL again to confirm a successful response.

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

1. Integrate final screenshots and live download URL, review desktop/mobile and run
   `npm run build:production`, `npm run lint`, `npm test`.
2. Obtain explicit founder authorisation for production and DNS changes.
3. In `relay-legal` Settings → Pages, change Source to **GitHub Actions** before
   merging this branch. This reuses existing hosting.
4. Merge the reviewed branch. Verify domain ownership in GitHub and set the Pages
   custom domain to `callwithrelay.com` before changing website DNS.
5. Replace the apex website A record (`217.160.0.45`) with GitHub Pages addresses:
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
   If using `www`, point its CNAME to `maddieellison.github.io`. Preserve email
   MX/TXT and other unrelated DNS records.
6. Manually run **Publish Relay website (manual)** on `main`. Incomplete assets
   block the build. Enable Enforce HTTPS once the certificate is available.
7. Verify HTTPS at `/`, `/privacy`, `/support`, `/terms`, slash variants and legacy
   `.html` paths. Check old GitHub URL redirects, assets, social preview and download.
8. Only after successful public verification and approval, apply
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

## Scroll design direction

The founder supplied [Flighty](https://flighty.com/) as an interaction reference.
Relay keeps its own icon, palette, fonts and copy. One central phone stays pinned
as its screenshot, editorial copy and background change through request → call →
outcome. The chapter links work with keyboard and native scrolling is never
intercepted. The homepage loads a single 2.8 KB script; legal pages load no scripts.
Without JavaScript, with reduced motion, or on viewports shorter than 620px,
all three stages appear in a normal static sequence. Changes to the motion
preference are handled without reloading. No Flighty assets or code were copied.
