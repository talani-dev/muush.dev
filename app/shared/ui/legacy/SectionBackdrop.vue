<script setup lang="ts">
/**
 * SectionBackdrop — the container a section puts its own glows in. It fills
 * its section, sits on the glow layer (below the page-wide dot sheet, above
 * the ink base) and is inert.
 *
 * It exists so the paint-order contract is written down in one place instead
 * of being rediscovered by every section author. It has no props and wraps no
 * abstraction: it is a named position in the stack (Constitution Article VIII).
 *
 * ---
 *
 * ## The section contract — read this before placing a glow
 *
 * `docs/business/rules.md` § R28 and
 * `specs/006-site-background-and-brand-chrome/contracts/components.md`
 * § *Section contract* are the same rules; this is the copy that lives where a
 * section author will actually read it.
 *
 * A section that contributes glows:
 *
 * - **MUST** be the positioning reference for them — `position: relative` on
 *   the section element, so `inset-0` here resolves against the section box.
 * - **MUST** render its `<SectionGlow>` instances inside this component,
 *   positioned with utility classes on each glow. Positioning is the caller's:
 *   the 21 glows all sit somewhere different.
 * - **MUST** convert the design's page-absolute offsets into section-relative
 *   ones (`rules.md` § R29). The design places every glow inside a 1440×5060
 *   page frame; a real section's height depends on its copy and its locale, so
 *   a page-absolute offset drifts the first time a sentence grows.
 * - **MUST NOT** create a stacking context on the section, or on any wrapper
 *   between it and the layout root: no `transform`, `translate`, `scale`,
 *   `rotate`, `filter`, `backdrop-filter`, `opacity` below 1, `isolation`,
 *   `will-change`, `contain: paint`, `position: fixed`, or `position: sticky`
 *   with a `z-index`. Any of them traps this whole subtree — glows included —
 *   above the page-wide dot sheet.
 * - **MUST NOT** paint an opaque background on the section: a section
 *   background is painted after the negative levels and would hide the
 *   section's own glows. The only opaque block in the design is the footer,
 *   which contributes no glows (spec A-12).
 * - **MAY** contribute nothing at all. The ink base and the dots belong to the
 *   layout; a section is never responsible for the page-wide layers.
 *
 * **The failure mode is silent.** Nothing errors and no test fails — the glows
 * simply move above the dots and the page stops matching the design. That is
 * why the rule is repeated here, in the feature's `quickstart.md` and in
 * `rules.md`.
 *
 * **Escape hatch**, so the constraint never blocks anyone: a section that
 * genuinely needs a transform moves its glows up to the page level instead.
 * That is a change to that one section, not to this layer.
 *
 * A transform on an individual `<SectionGlow>` is fine — it creates a stacking
 * context only for its own, empty, subtree.
 */
</script>

<template>
  <div
    aria-hidden="true"
    class="section-backdrop pointer-events-none absolute inset-0"
  >
    <slot />
  </div>
</template>

<style scoped>
/*
 * One level below the dot sheet (`--layer-dots`), so a glow authored *inside*
 * a section still paints *beneath* a sheet declared once in the layout. The
 * two levels must differ: at the same level the tie-break is document order,
 * and the sections come after the sheet (docs/business/rules.md § R28).
 */
.section-backdrop {
  z-index: var(--layer-glow);
}
</style>
