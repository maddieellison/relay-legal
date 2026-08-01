# relay-legal

The public legal and support pages for the **Relay** iOS app. Apple requires a
publicly reachable Privacy Policy URL and a Support URL, and this repo is what
serves them, via GitHub Pages.

| Page | URL |
|---|---|
| Home | https://maddieellison.github.io/relay-legal/ |
| Privacy Policy | https://maddieellison.github.io/relay-legal/privacy.html |
| Terms of Service | https://maddieellison.github.io/relay-legal/terms.html |
| Support | https://maddieellison.github.io/relay-legal/support.html |

These same URLs are set in the app at `mobile/src/lib/legal.ts`, and go into the
App Store Connect "Privacy Policy URL" and "Support URL" fields.

## Still to fill in

Values highlighted in **yellow** on the pages are placeholders. Replace them in
all four HTML files before submitting to the App Store:

- `[Your Company] Ltd` — the registered company name
- `[company number]` — Companies House number
- `[registered office address]` — the registered office
- `support@yourdomain.com` — a real, monitored support inbox

Editing any file and pushing to `main` republishes within about a minute.

> The source of truth for these files lives in the main app repo under `docs/`.
> Change them there too, so the two copies don't drift.
