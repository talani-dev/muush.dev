/**
 * 1024 px — Tailwind v4's stock `lg`, so script and `lg:` utilities cross at
 * the same width. Below it the design's mobile arrangements apply (header
 * bar and menu, map tabs, services carousel, process rail); from it, the
 * desktop ones.
 *
 * Settled: the `.pen` draws exactly two frames, 390 and 1440, and the swap at
 * 1024 px is recorded in features 43 and 44 (pen extract-43 § 6, pen
 * extract-44 § 2.1, § 3.3). Moved here from the shell's `useMobileMenu` in
 * feature 44, when the home became its second reader (Article VIII).
 */
export const DESKTOP_MEDIA_QUERY = '(min-width: 64rem)'
