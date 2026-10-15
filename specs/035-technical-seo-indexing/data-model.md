# Data model: Technical SEO (feature 35)

Static content only — no runtime data, no storage.

## 1. Page SEO copy (locale files)

Lives in `i18n/locales/es.json` and `en.json`, same keys in both (Constitution Art. VI; `tests/i18n-parity.test.ts`).

| Key | es (DRAFT, see spec) | en (DRAFT) |
|---|---|---|
| `pages.home.title` | `Hablamos negocio y código · muush` | `We speak business and code · muush` |
| `pages.home.description` | spec DRAFT table | spec DRAFT table |
| `pages.about.title` | `Nosotros · muush` (exists) | `About us · muush` (exists) |
| `pages.about.description` | spec DRAFT table | spec DRAFT table |

Removed: `site.title` (and the then-empty `site` object) — its only consumer, `app/pages/index.vue`, switches to `pages.home.title`.

Validation:
- Every title ends with ` · muush`; the four titles are pairwise distinct.
- Descriptions are non-empty, pairwise distinct, ~140–160 characters.
- No `@` in any value (vue-i18n linked-message trap, `rules.md` § R26).
- Copy is the gate-approved text, verbatim.

## 2. Site identity (`app/features/shell/data/siteIdentity.ts`)

| Field | Value | Source of truth |
|---|---|---|
| name | `muush` | `nuxt.config.ts` → `site.name`, read via `useSiteConfig()` |
| url | `https://muush.dev` | `nuxt.config.ts` → `SITE_URL` (also `i18n.baseUrl`), read via `useSiteConfig()` |
| `SITE_ALTERNATE_NAME` | `muush.dev` | this file |
| `SITE_LOGO_URL` | `https://assets.muush.dev/brand/logo/ink500.png` | this file (1710×1020 PNG, verified 200 by the leader) |
| `SHARE_IMAGE` | `{ url: null, width: 1200, height: 630 }` — **TODO (D6)** | this file; adding the image = replacing `null` with the URL |
| sameAs | the 3 `href`s of `SOCIAL_PROFILES` | `app/features/shell/data/socialProfiles.ts` (unchanged, single source) |

Type sketch:

```ts
export interface ShareImage {
  /** TODO(D6): Roberto uploads a 1200×630 image; set its absolute URL here. */
  url: string | null
  width: number
  height: number
}
```

## 3. Derived values (pure, unit-tested, in `app/features/shell/logic/`)

- **Social preview meta** — `resolveShareMeta(image: ShareImage)`:
  - `url === null` → `{ twitterCard: 'summary' }` (no image keys at all)
  - `url` set → `{ twitterCard: 'summary_large_image', ogImage: { url, width, height }, twitterImage: url }`
- **sameAs** — `profileUrls(profiles: SocialProfile[]): string[]` → the `href`s in record order. (May be a one-line `map`; it exists to give the test a seam that proves derivation, not retyping.)

## 4. Robots / sitemap (configuration, not data)

Declared in `nuxt.config.ts`; see `contracts/build-output.md` for the files they must produce.
