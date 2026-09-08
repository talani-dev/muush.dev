# Quickstart: verifying the floating nav redesign

For whoever implements or reviews this feature. Assumes `pnpm generate` has
been run and `.output/public` exists (Constitution's Development Workflow —
what the site actually ships is what gets measured, never the Storybook
catalogue alone, per `rules.md` § R18's warning about the two builds
resolving CSS variables differently).

## 1 · The pill

Open `/es/` at 1440×900. The nav must read as an inset, rounded, glass
surface — not a full-bleed bar. Scroll the page: confirm the pill's surface,
not bare scrolled content, sits behind the lockup and the links at every
scroll position (this is the D-07 fix; there is nothing to measure
numerically here beyond "text is legible against the pill, not against
whatever scrolled past").

## 2 · The link row

Grep the generated `/es/index.html` (and the other three documents) for the
`<nav ...>...</nav>` substring; confirm it contains `Servicios` and
`Nosotros` and does **not** contain `Proyectos`. Separately confirm the
mobile menu panel's markup (rendered once scripting opens it, or check its
prerendered-but-hidden markup) and the footer's Navegación column **still**
contain `Proyectos` — this feature does not touch either.

## 3 · The CTA

Measure the CTA's bounding box at 1440px (same CDP device-metrics-override
method `rules.md` § R44 and feature 22's report used, not a headless window
resize per § R60's warning). Expect 221×48, `border-radius: 999px` (already
true since feature 22), `background-color` resolving to `#1c1416a6`. Confirm
the arrow renders as a separate DOM node with `aria-hidden="true"`, and that
neither locale's `shell.nav.cta` string contains `→` (`grep -r
'shell.nav.cta' i18n/locales/`).

Re-run feature 9's own nav-CTA-reveal scenarios (hidden at landing scroll 0,
fades in past the Hero, fades out scrolling back, visible from first paint
on Nosotros, visible with `Emulation.setScriptExecutionDisabled`, unaffected
by `prefers-reduced-motion: reduce`) — all must still pass unchanged. If the
CTA is unreachable via normal scroll because the landing is still shorter
than the viewport plus the reveal threshold, use the same CDP no-scripting
lever feature 22's report documented, not a synthetic scroll injection.

## 4 · The language toggle

At any of the four documents, confirm exactly one circular control renders
per page (desktop and, separately, mobile), showing only the current
locale's two-letter code. Activate it (or read its resolved `href`) and
confirm it matches what `resolveLocaleDestination.ts` already resolves
today — same destination, same anchor-preservation behaviour with scripting,
same anchorless fallback without it. Inspect its accessible name via the
accessibility tree, not just the visible text, and confirm it names the
*destination* locale.

## 5 · Mobile parity

Compare `SiteNav.vue`'s mobile-row markup (`lg:hidden` branch) against what
was built before this feature (`git show HEAD:app/features/shell/ui/
SiteNav.vue` or the merged `master` version). Confirm the only difference is
whatever `LanguageToggle.vue`'s rewrite requires. Measure the mobile nav's
height at 390px and confirm it has not moved from the ~78px `findings.md`
§ R55 already recorded (a small, previously-explained gap from the 76px
frame value, not something this feature should close or worsen).

## 6 · The untouched files

`git diff --stat` against `app/features/shell/logic/useShellNavigation.ts`,
`app/features/shell/logic/useMobileMenu.ts`,
`app/features/shell/logic/resolveLocaleDestination.ts`,
`app/shared/logic/useNavCtaReveal.ts`,
`app/features/shell/ui/MobileMenu.vue`,
`app/features/shell/data/footerColumns.ts` and
`app/features/shell/data/types.ts` — every one of these must show **zero**
lines changed. Any diff here is a scope leak to report, not to fold in
silently.

## 7 · Gates

`pnpm check && pnpm typecheck && pnpm test && pnpm generate && pnpm
storybook:build` — all five must exit 0, with the pre-existing suite green
except for the specific, named updates to `SiteNav.test.ts`,
`LanguageToggle.test.ts` and `tests/static-output.test.ts` (spec FR-024).
