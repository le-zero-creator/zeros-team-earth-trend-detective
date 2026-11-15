# Security audit — static site, before GitHub Pages

Date: 2026-11-15. Scope: the Vite app plus two Vercel functions (`api/ask`, `api/power`). No database, no accounts, no payments.

## 1. Secrets

No API key, password, or private token is shipped to the browser or committed. Ask Terra calls the Vercel AI Gateway with the project’s OIDC token, which Vercel injects into the function, unless `GOOGLE_GENERATIVE_AI_API_KEY` is set on the server. That optional key is read only inside `api/ask.ts`. It is not in the client bundle, and `.env.example` leaves it empty. `AI_GATEWAY_API_KEY` is not set. `npm audit` reports 0 vulnerabilities. `.gitignore` ignores `.env`. The browser never calls NASA or the model host. Only `api/power.ts` calls `https://power.larc.nasa.gov`, and only with a latitude, a longitude, and two years that passed the whitelist.

## 2. Row-level security

Not applicable. There is no database and no per-user row.

## 3. Insecure direct object reference

Not applicable in the account sense. The only parameters are `zone`, `var`, `period`, and the screen step. Unknown values are replaced by the defaults in `src/lib/params.ts` (`safeParams`, `safeStep`). A test checks that `<script>` and `../etc` do not pass.

## 4. Admin routes

There is no admin path, no hidden editor, and no role that can change data. The site only reads files under `public/data/`.

## 5. Forms

The place search does not submit to a server. Ask Terra posts JSON to `/api/ask` with `fetch` (the form has no `action`). The question is trimmed, control characters are removed, and it must be 2 to 400 characters. The role and the place must be in the published lists; anything else becomes the default or is dropped. `/api/power` accepts only a latitude, a longitude (at most four decimals), and years from 1981 to 2026. Both functions rate-limit by IP in the Vercel Runtime Cache (8 questions or 30 NASA reads per 10 minutes). Errors are `{ "error": "down" }` or `{ "error": "rate" }`, with no stack trace. The content-security policy sets `form-action 'none'`.

## 6. Webhooks

Not applicable. Nothing receives a webhook.

## 7. Transport, dependencies, errors

- `npm audit`: 0 info, 0 low, 0 moderate, 0 high, 0 critical (run again on 2026-11-15 after adding the AI SDK).
- GitHub Pages serves the site over HTTPS.
- The built `index.html` includes a content-security policy: `default-src 'self'`; scripts and fonts from `'self'`; images from `'self'`, `data:`, `blob:`, `https://tile.openstreetmap.org` and `https://server.arcgisonline.com`; `connect-src 'self'` and the same Esri host; `worker-src 'self' blob:`; `object-src 'none'`.
- External links use `rel="noopener noreferrer"`.
- A bad `results.json` shows “The data could not be loaded” and does not print a stack trace.
- Screenshot runs contacted only the site itself and `tile.openstreetmap.org`.

Pending sources (MODIS, GPM) are labelled Pending. They are never labelled Available.

## 8. Ask Terra and live NASA data

- If `GOOGLE_GENERATIVE_AI_API_KEY` is set on the server, Ask Terra uses `@ai-sdk/google` and `gemini-2.5-flash` directly. Otherwise the model is `google/gemini-2.5-flash` through the Vercel AI Gateway. The prompt, the rate limit, and the “do not invent a number” rules are the same either way. The prompt is built on the server from `results.json` and, for one known place, from cached NASA POWER months.
- NASA months are stored in the Runtime Cache for six hours. The reply says they are live data, not a trend test.
- Vercel Web Analytics was not added. It is cookieless, but this demo does not record visits.
- The three approved pictures stay as WebP with a long cache header. They are not rewritten through an image optimizer, so a failed optimizer cannot hide them.
