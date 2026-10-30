# Relay website audit — 30 October 2026

## Status

Built a deployable local preview on isolated branch `design/relay-launch-website`
in the existing legal-site repository. Final screenshots, public download URL and
founder production approval remain outstanding. No live publishing/DNS changes,
app modifications, or phone calls were made.

## Existing setup

| Item | Observed evidence |
| --- | --- |
| Repository | `https://github.com/maddieellison/relay-legal` |
| Live site | `https://maddieellison.github.io/relay-legal/` |
| Pages | Public, HTTPS enforced, `main` root, legacy build, no custom domain |
| Published revision | `e7feea6c8d522c054c1daa248e09aea2dc836365`; successful build 25 October |
| Legal PR #1 | Merged 25 October; published wording retained verbatim |
| Apex domain | A `217.160.0.45`; HTTP 200 serves IONOS-generated German page, not Relay; HTTPS fails TLS handshake |
| www | No answer in DNS check |
| Email | MX `0 callwithrelay-com.mail.protection.outlook.com.` |
| Support | `support@callwithrelay.com` matches published documents and app source; delivery/monitoring untested |
| App Store | App config ID `6804118976`; `https://apps.apple.com/gb/app/id6804118976` returned 404 |
| Vercel | Workspace project is `biz-os`; deliberately not reused |

## Design and claims evidence

Active app inspected at
`/Users/maddieellison/Documents/Work/AI/Claude/Projects/relay-final-2610-30`,
observed head `4cd96e8`. Older `worktrees/relay-build17` was inspected first;
its design tokens match. Font files came from installed Expo font packages.

- `mobile/src/theme/tokens.ts`: paper `#f3efe6`, surface `#fffdf8`, ink `#1a1c19`,
  forest green `#1f5d4c`, tint `#e7efe9`, deep green `#1a3a30`.
- `mobile/src/theme/typography.ts`: Newsreader medium/italic headings, Hanken
  Grotesk body and labels, numbered indices.
- `mobile/assets/images/icon.png`: real cream waveform/dot on green; resized,
  not redrawn. The secondary `•))` text mark also exists in the app.
- Editorial hierarchy, fine dividers, 16px controls, generous spacing and a dark
  green transcript section extend the app's design. Secondary web text is darker
  (`#62675c`) to maintain contrast.
- `home.tsx`, `setup.tsx`, `review.tsx`, `call/[id].tsx`, `summary/[id].tsx` verify
  request/quote examples, plan review, live transcript and outcome/transcript.
- Published policies verify AI/recording disclosure, limits and support details.
- No approved screenshots were supplied or found. Three explicit slots await
  them. No fictional interface, reviews, statistics or guaranteed outcomes.

## Exact source paths changed

Relative to `worktrees/relay-website-preview/`:

- Replaced `README.md`, `style.css`.
- Replaced root `index.html` with `src/home.html` and generated `dist/index.html`.
- Moved `privacy.html`, `terms.html`, `support.html` unchanged into `src/legal/`;
  build generates branded clean and legacy routes.
- Added `package.json`, `site.config.json`, `.gitignore`.
- Added `scripts/build.mjs`, `scripts/check.mjs`, `scripts/serve.mjs`.
- Added `.github/workflows/website.yml`, `.github/workflows/publish.yml`.
- Added `assets/app-icon.png`, `assets/apple-touch-icon.png`, `assets/favicon.png`,
  `assets/social-preview.png`.
- Added `assets/fonts/newsreader-medium.ttf`, `assets/fonts/newsreader-italic.ttf`,
  `assets/fonts/hanken-regular.ttf`, `assets/fonts/hanken-semibold.ttf`,
  `assets/fonts/Newsreader-LICENSE.txt`, `assets/fonts/HankenGrotesk-LICENSE.txt`.
- Added `review/AUDIT.md`, `review/app-legal-url.patch`.
- Generated ignored `dist/`, `review/*.png`, `review/responsive.json`.

Untouched: all active and older app files, specifically `mobile/src/lib/legal.ts`,
app `docs/`, navigation, calling/Vapi/Twilio, `supabase/`, authentication,
payment/RevenueCat/StoreKit, `company-os/`, workspace `.vercel/`, live Pages and DNS.

## Checks

- Build, lint and tests pass. Lint checks Node syntax; the original static legal
  repository had no framework, lint suite or dependencies.
- Eight pages, 137 internal link/asset references, local fonts, icons, metadata,
  canonical URLs, old routes and 404 verified.
- All three source document SHA-256 hashes match published Git revision.
  Complete rendered text matches source snapshots; only presentation/links change.
- HTTP `/privacy` redirects to `/privacy/`; `/support/` and `/terms.html` return
  200. All three legal/support pages visited independently in the browser.
- Homepage reviewed at 320, 390, 768, 1024, 1440px: no horizontal overflow;
  complete screenshot slots stay inside the hero panel. Initial cropping fixed.
- Privacy checked at 320, 390, 768, 1440px: tables scroll inside labelled,
  keyboard-accessible regions. Support fits 320, 390, 768, 1440px.
- One h1 per page; landmarks; language; image alt attributes; labelled navigation;
  heading anchors; visible focus; skip link verified to focus the main landmark; reduced-motion styles; no animation.
- Text contrast: ink/paper 14.95:1, muted/paper 5.06:1, green/paper 6.71:1,
  green/tint 6.57:1, light/deep 8.99:1, caption/deep 8.18:1.
- No browser errors or warnings; no broken loaded images. Below-fold imagery
  lazy loads; explicit dimensions prevent image-induced layout shifts.
- Complete preview approximately 553 KB before compression/final screenshots.
  Zero client JS, third-party fonts, analytics or cookies.
- Production build correctly refuses missing launch inputs before changing the
  existing preview. Workflow is manual-only and cannot publish this incomplete state.

Limitations: Chromium at iPhone-sized viewports, not physical iPhone/Safari;
no full screen-reader/axe audit or Lighthouse score; no production performance
measurement. Final asset composition/loading must be rechecked. App Store Connect
saved fields and support mailbox delivery were not inspected.

## Founder actions remaining

1. Supply and approve current request/plan, conversation and outcome screenshots.
2. Confirm a publicly accessible App Store link when available.
3. Confirm the published support mailbox receives mail and is monitored.
4. Review with final assets and authorise production/DNS cutover; exact existing
   GitHub Pages deployment steps are in `README.md`.
5. After HTTPS verification, approve the prepared app patch and update App Store
   Connect to `https://callwithrelay.com/privacy`,
   `https://callwithrelay.com/support` and Marketing URL `https://callwithrelay.com`.
   Terms will be at `https://callwithrelay.com/terms`.

The deferred app patch passes `git apply --check` against the inspected active checkout; it was not applied.
