# Contract — build output (`.output/public` after `pnpm generate`)

Asserted by `tests/seo-output.test.ts` (robots, llms, sitemap, sourcemaps) and
the new `tests/tracking-output.test.ts` (HTML, config hygiene).

## 1 · HTML (every `*.html`, both 404s included)

- No `<script` whose `src` contains `googletagmanager`, `fbevents` or
  `connect.facebook.net`; no inline `fbq(` / `gtag(` bootstrap; no `<noscript>`
  containing `facebook.com/tr`.
- The two IDs may appear only inside the serialized public runtime config
  (`window.__NUXT__` / payload), never in an attribute or another script.

## 2 · Source hygiene (files under `app/`)

- Neither `G-RHZC650SQS` nor `1488638740001981` appears in any file under
  `app/` (they live in `nuxt.config.ts` only). Literals assembled from fragments
  in the test, as `tests/forms-config.test.ts` does.

## 3 · robots.txt (exact shape; order of the two AI groups fixed)

```
# START nuxt-robots (indexable)
User-agent: *
Disallow: 

# AI search and answer agents: allowed
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: Claude-SearchBot
User-agent: Claude-User
User-agent: PerplexityBot
User-agent: Perplexity-User
Disallow: 

# AI training crawlers: allowed
User-agent: GPTBot
User-agent: ClaudeBot
User-agent: Google-Extended
User-agent: Applebot-Extended
User-agent: CCBot
Disallow: 

Sitemap: https://muush.dev/sitemap.xml
# END nuxt-robots
```

Assertions: starts with `# START nuxt-robots (indexable)`; contains
`User-agent: *`; each of the 11 agents appears exactly once as `User-agent:`;
every group's only rule is an empty `Disallow:`; `Disallow: /` appears 0 times;
exactly one `Sitemap:` line equal to `Sitemap: https://muush.dev/sitemap.xml`;
no `public/robots.txt` or `public/_robots.txt`. The exact blank-line layout is
whatever 6.2.4 prints (the block above is the expected rendering, R6); the test
asserts groups, not whitespace.

## 4 · llms.txt

- `.output/public/llms.txt` exists and is byte-identical to `public/llms.txt`.
- First line `# muush`; a line starting with `> ` follows before the first `##`.
- Every H2 section body is a list of `- [text](https://muush.dev/…)` items
  (optionally followed by `: notes`).
- The set of linked URLs equals the set of `<loc>` values in `sitemap.xml`
  (10 URLs, absolute, `https://muush.dev`).
- Its content equals the fenced block of `copy-drafts.md` § C as approved
  (the test reads that block).
- Contains no `@` (no email address) and no `wa.me` / phone number.

## 5 · Unchanged

- `sitemap.xml` lists exactly the 10 URLs (existing test).
- No file ending `.map` anywhere in `.output/public`; no `sourceMappingURL`
  in any `.js` or `.css` under `.output/public` (new assertion).
