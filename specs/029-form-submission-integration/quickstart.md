# Quickstart: Form submission integration

## Configure

```bash
cp .env.example .env    # only if you need to override defaults
```

| Variable | Default (in `nuxt.config.ts`) | Real value goes |
|---|---|---|
| `NUXT_PUBLIC_FORMS_API_BASE_URL` | the contract's current API base URL | `.env` / deploy build env when it changes (e.g. `api.muush.dev`) |
| `NUXT_PUBLIC_TURNSTILE_SITE_KEY` | `1x00000000000000000000BB` (Cloudflare always-pass test key) | `.env` and the **production build** env. Must be an *Invisible* sitekey |

Both are public identifiers, not secrets, but the real sitekey still stays out
of git (decision § 9). Values are baked in at `pnpm generate` time.

## Verify (no real API needed; it returns 404 until infra completes)

```bash
pnpm test        # payloads, retry, error mapping, CV flow, spam guard, components
pnpm check && pnpm typecheck
pnpm generate    # then: no challenges.cloudflare.com script in .output/public/**/*.html
pnpm storybook:build
```

## Manual smoke (dev)

1. `pnpm dev`, open `/es/#contacto`. DevTools → Network.
2. Before touching the form: no request to `challenges.cloudflare.com`.
3. Focus a field: `api.js?render=explicit` loads once.
4. Submit valid data: one `POST …/contact`. Against the real API from
   `localhost` it fails CORS (only `https://muush.dev` is allowed) → the
   generic error appears and every value stays. That is the expected dev
   result, not a bug.
5. Submitting within 3 s of load, or with the hidden field filled from
   DevTools, sends nothing.

## Release checklist (owner: Roberto)

- [ ] API routes deployed (contract § 0).
- [ ] Real Invisible sitekey provided to the production `pnpm generate`.
- [ ] Spec "Open for approval" items OA-1..OA-6 decided.
