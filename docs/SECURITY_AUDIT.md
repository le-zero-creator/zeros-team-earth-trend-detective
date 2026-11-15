# Security audit — static site, before GitHub Pages

Date: 2026-11-15. Scope: the Vite app on branch `feat/home-grand-public`. No database, no accounts, no payments.

## 1. Secrets

No API key, password, or private token is shipped to the browser or committed. `npm audit` reports 0 high or critical issues. A search of the tree (excluding `package-lock.json`) finds the word “token” only in documentation, in the GitHub Actions permission `id-token: write` (that is GitHub’s own deploy identity, not a secret in the repo), and in `.env.example`, which contains an empty `EARTHDATA_TOKEN=` and is not used by the website. `.gitignore` ignores `.env`. NASA POWER is a public API and is not called by the site.

## 2. Row-level security

Not applicable. There is no database and no per-user row.

## 3. Insecure direct object reference

Not applicable in the account sense. The only parameters are `zone`, `var`, `period`, and the screen step. Unknown values are replaced by the defaults in `src/lib/params.ts` (`safeParams`, `safeStep`). A test checks that `<script>` and `../etc` do not pass.

## 4. Admin routes

There is no admin path, no hidden editor, and no role that can change data. The site only reads files under `public/data/`.

## 5. Forms

The place search does not submit to a server. It filters the 11 real places and a fixed list of “coming soon” regions in the browser. Variable and period controls are choices from the published lists. The content-security policy sets `form-action 'none'`.

## 6. Webhooks

Not applicable. Nothing receives a webhook.

## 7. Transport, dependencies, errors

- `npm audit`: 0 info, 0 low, 0 moderate, 0 high, 0 critical (run on 2026-11-15).
- GitHub Pages serves the site over HTTPS.
- The built `index.html` includes a content-security policy: `default-src 'self'`; scripts and fonts from `'self'`; images from `'self'`, `data:`, and `https://tile.openstreetmap.org`; `connect-src 'self'`; `object-src 'none'`.
- External links use `rel="noopener noreferrer"`.
- A bad `results.json` shows “The data could not be loaded” and does not print a stack trace.
- Screenshot runs contacted only the site itself and `tile.openstreetmap.org`.

Pending sources (MODIS, GPM) are labelled Pending. They are never labelled Available.
