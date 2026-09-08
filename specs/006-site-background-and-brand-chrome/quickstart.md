# Quickstart: Site background and brand chrome

**Feature**: `specs/006-site-background-and-brand-chrome` | **Date**: 2026-09-07

How to verify this feature is real, in the order that fails fastest. Nothing
here is optional: three of the four parts cannot be seen by any test in the
suite (`research.md` § R7), so the human checks *are* the verification.

---

## 1 · The five gates

```sh
pnpm check          # Biome, --error-on-warnings
pnpm typecheck
pnpm test           # rebuilds the site in globalSetup, then asserts the artefact
pnpm generate
pnpm storybook:build
```

All five must pass. `pnpm test` runs `pnpm generate` itself via
`tests/global-setup.ts`, so the static-output assertions can never read a
stale `.output/`.

---

## 2 · The artifact (what the deploy actually contains)

After `pnpm generate`:

```sh
ls .output/public/_fonts/                                  # binaries are here
grep -rl "@font-face" .output/public/_nuxt/*.css           # faces are emitted
grep -r "fonts.gstatic.com\|fonts.googleapis.com" .output/public   # must be empty
grep -r "/fonts/Poppins-Regular.woff2" .output/public              # must be empty
grep -o 'rel="icon"[^>]*' .output/public/es/index.html             # icon declared
```

| Check | Expected |
|---|---|
| `.output/public/_fonts/` | contains the downloaded `.woff2` files |
| emitted CSS | `@font-face` for Poppins 600 and Instrument Sans 400/500/600, `src` pointing at `/_fonts/…` |
| third-party font hosts | **zero** occurrences anywhere in the artifact (FR-015) |
| the four deleted font paths | **zero** occurrences (FR-013) |
| every `index.html`, both locales | declares the SVG icon (FR-025) |
| `.output/public/favicon.ico` | does not exist (FR-024) |

> `rules.md` §§ R18 and R25: verify here, not against the dev server and not
> against the catalogue. The catalogue's Tailwind scan reaches `docs/` and
> `specs/`, so it emits variables the site never will.

---

## 3 · The layer order — the one thing only eyes can check

`pnpm dev`, then look at `/es/` and `/en/` at 390px and 1440px:

| Check | Expected | Why it matters |
|---|---|---|
| Dots | cover the **whole** scroll height, including behind the nav and down to the footer | a layer sized to the viewport leaves the bottom of a 5000px page bare |
| Dot density | unchanged while scrolling and while resizing; 24px step | the sheet is one repeat, not tiles |
| Glows (in the story, or once a section lands) | bloom **under** the dots and **under** the text | this is FR-005, the whole point |
| Footer | opaque ink; no dots visible inside it | that is the design (spec A-12), not a bug |
| Horizontal scrollbar | never appears, at any width from 320 to 2560 | FR-007; the design's glows sit at negative x |
| Text selection / clicks over empty background | behave exactly as before | FR-003 |
| Mobile menu (390px) | opens above everything; its glass now blurs dots and glows rather than flat ink | FR-008 |
| Console | no `[VUE_ROUTER_R0004]` warning naming a font path | FR-016 |

---

## 4 · The type

With the site running, in devtools:

1. Network → filter `font`: every request is same-origin (`/_fonts/…`). Zero
   requests to `fonts.gstatic.com`.
2. Inspect the wordmark → computed `font-family` is Poppins, weight 600, and
   the rendered face is **not** a fallback (Chrome devtools shows the rendered
   family under *Computed → Rendered Fonts*).
3. Inspect a nav link, a footer column title and the mobile menu items → all
   Instrument Sans, at 500 / 600 / 600, none synthesised.
4. In the catalogue, open `Wordmark` and any shell story: same two families
   (this comes from the `.storybook` head snippet, spec A-05 — the catalogue
   needs network on first load, the site never does).

---

## 5 · The mark

1. Set the OS to light appearance, reload: the tab shows the isotipo with a
   dark stroke and a red dot.
2. Switch to dark appearance: the stroke turns bone, the dot stays red.
3. The mark is **centred and round-ended**, not stretched — a 70.5×39.5
   artboard squashed into a square is the failure this checks for.
4. `pnpm storybook:build && npx serve storybook-static` (or the dev
   catalogue): its tab shows the same mark, not the Storybook or Nuxt default.
5. `ls public/` shows no Nuxt asset and no `fonts/` directory.

> Safari does not use SVG favicons at all, and support for
> `prefers-color-scheme` inside one varies (spec A-08). The light-scheme
> colours are the file's *default*, so a browser that ignores the query still
> shows a correct mark. Check at least one Chromium or Firefox tab.

---

## 6 · The mechanism, for whoever builds the first section

Read `contracts/components.md` § *Section contract* before placing a glow.
The three rules that matter:

1. The section is `position: relative`; its glows go inside
   `<SectionBackdrop>`; positions are utilities on the `SectionGlow`s.
2. The section — and everything between it and the layout root — must not
   create a stacking context (`transform`, `filter`, `opacity < 1`,
   `isolation`, `contain: paint`, sticky/fixed with `z-index`). **The failure
   is silent**: the glows simply move above the dots.
3. Design offsets are page-absolute in a 1440×5060 frame; convert them to
   offsets relative to your own section (spec A-13).

The catalogue story *Composed background* shows the correct arrangement with
the real Hero triplet (`Hero · foco` red-400 65% 1500-700, `Hero · wine`
wine-300 40% 1100-520, `Hero · cierre` wine-400 30% 900-520 —
`design-extract.md` § 10). Copy that arrangement, not this prose.

And note **D-01**: the Landing has **eleven** glows in the design file. § 10
lists a twelfth, `Glow origen` — that entry is stale documentation, not a node
you are missing. Where the `.pen` and a `docs/business/` file disagree, the
design file wins and the document gets fixed (Roberto, 2026-09-07;
`rules.md` § R32). You cannot open the `.pen` yourself — ask the leader for
the values rather than falling back to the document.
