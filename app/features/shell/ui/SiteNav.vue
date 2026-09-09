<script setup lang="ts">
import { onMounted, ref, useTemplateRef, watch } from 'vue'
import type {
  ResolvedShellItem,
  ResolvedSocial,
  ShellLocale,
} from '@/features/shell/data/types'
import { useMobileMenu } from '@/features/shell/logic/useMobileMenu'
import { useNavScrollReveal } from '@/features/shell/logic/useNavScrollReveal'
import BotonPrimario from '@/shared/ui/BotonPrimario.vue'
import Lockup from '@/shared/ui/Lockup.vue'
import LanguageToggle from './LanguageToggle.vue'
import MobileMenu from './MobileMenu.vue'

/**
 * The nav of `design-extract.md` § 9.bis. One responsive component: § 9.bis
 * verified the nav is byte-identical between the Landing and About frames in
 * both viewports, so there is no per-page variant and no `variant` prop.
 *
 * It also owns the mobile menu, because the hamburger, the close control and
 * the panel are one interactive unit — splitting them would put the open
 * state above the component that owns it and force it back down as props.
 *
 * Every `lg:` here changes **layout**: which controls exist, never their size
 * (spec FR-047).
 *
 * ## The nav is pinned, and only its button animates (feature 009)
 *
 * `ui-map.md` § 2, decided by Roberto on 2026-09-07, replacing
 * `decisions-open.md` #5: the nav stays at the top while the page scrolls, at
 * **the same height and the same background**, and the compressed state is
 * dropped. No height, no background and no opacity change at any scroll
 * position. Two things now change on scroll: whether the `Cuéntanos tu
 * proyecto` button is showing (below, unchanged since feature 009) and,
 * since feature 26, whether the whole nav itself is showing — see that
 * section further down. The two are independent: the button's fade is a
 * route/Hero concern, the nav's own hide/reveal is a scroll-direction concern.
 *
 * `position: sticky`, not `fixed`: it keeps the nav in normal flow, so
 * `<main>` needs no compensating top padding and every section's top padding
 * stays `design y − nav height` (`rules.md` § R49). Either would need an
 * explicit level, because the Hero section is `position: relative` later in
 * the document — hence `--layer-nav`.
 *
 * ## ✅ D-07 resolved by feature 21 (2026-09-08)
 *
 * The paragraph below described the nav's *pre-redesign* state and is kept
 * for history. Clau's floating-pill redesign gives the desktop row its own
 * dark-glass surface (`bg-glass-dark` + `border-glass-line` + `rounded-full`,
 * inset from the viewport by `--spacing-page`/`--spacing-nav-pill-y`), so
 * scrolled content no longer shows through the lockup and the links at any
 * scroll position. Nothing about *when* the pill is there changes — it is
 * present at every scroll position, exactly like the old backgroundless bar
 * was — only its own surface changed (spec FR-001–FR-004).
 *
 * Two divergences from the redesigned frame ship with it, both human
 * decisions recorded where the data lives
 * (`app/features/shell/data/navigation.ts`): `Proyectos` is deliberately
 * dropped from this two-link row despite the frame drawing it (feature 15 is
 * `blocked`), and `Servicios` is added despite `content.md` saying it is
 * excluded (the frame postdates that document and wins,
 * `docs/business/rules.md` § R32). Do not "fix" either by comparing this
 * component against the `.pen` — read the comment on `NAV_ITEMS` first.
 *
 * ⚠️ **Historical, pre-redesign note (feature 9).** The nav had **no
 * background of its own** — the ink base belonged to the layout root — so
 * once the page scrolled, content passed *underneath* the lockup and the
 * links. `ui-map.md` § 2 said the nav kept "el mismo fondo", and its
 * background then was none; the compressed state that would have introduced
 * `#1c1416a6` is what that same decision dropped. Reported as spec D-07 —
 * **owner: Clau / Roberto** — and resolved above, not by inventing a
 * background ahead of the design file arriving.
 *
 * ## The nav hides on scroll (feature 26, 2026-09-09)
 *
 * Behaviour given verbatim by Roberto — no `.pen` frame exists for this, it
 * is an interaction, not a static composition. See
 * `logic/useNavScrollReveal.ts` for the full rule set (the 80px always-visible
 * zone, the 10px continuous-downward threshold that survives mobile scroll
 * bounce, the immediate reveal on any upward movement, and the mobile-menu
 * override). This does **not** touch `position: sticky` — the nav stays in
 * normal flow exactly as feature 009 established; hiding is a `transform:
 * translateY(-100%)` on top of that, which is why it needs `--layer-nav`
 * (already declared) and nothing else.
 *
 * **Why the nav must never hide while the mobile menu is open, and why this
 * is not arbitrary:** `MobileMenu.vue`'s panel is `position: fixed`. An
 * ancestor with an active `transform` creates a new containing block for a
 * `position: fixed` descendant, which would mis-contain the panel if both
 * were active at once. `useNavScrollReveal` takes the menu's own `isOpen` and
 * forces the nav visible whenever it is true, so the two states can never
 * overlap — this is what makes the `transform` safe to use here at all, not a
 * separate fix layered on top of a problem that would otherwise exist.
 */
interface Props {
  /** Proyectos and Nosotros. */
  items: ResolvedShellItem[]
  cta: ResolvedShellItem
  /**
   * Whether the call to action is showing. Resolved by `logic/`, like every
   * other value here: the component never asks which route it is on.
   *
   * Hidden means `visibility: hidden` as well as `opacity: 0` — opacity alone
   * would leave an invisible button focusable and clickable (spec FR-048).
   */
  showCta: boolean
  /** Resolved href for the lockup. */
  home: string
  locale: ShellLocale
  /** The equivalent route in the other locale, without a fragment. */
  localeSwitchHref: string
  /**
   * Accessible name of the language toggle, naming the *destination* locale
   * ("Switch to English") rather than echoing the two letters a sighted
   * visitor reads (spec FR-018).
   *
   * Not in `contracts/components.md`'s `SiteNav.vue` table — added
   * deliberately, the same way `MobileMenu.vue`'s own `label`/`closeLabel`
   * already diverge from that file for the identical reason: the string is
   * translated copy (Constitution Article VI forbids writing it inside a
   * component), and resolving it with `useI18n()` from inside
   * `LanguageToggle.vue` would make it the first `ui/` component in this
   * repository to call a Nuxt composable — the exact thing
   * `docs/business/rules.md` § R23's corollary and this feature's own
   * `plan.md` rule out, and Storybook has no i18n plugin to catch it
   * quietly if it slipped through. One resolved-string prop is the only way
   * to satisfy FR-018 without either violation.
   */
  localeSwitchLabel: string
  /** The four destinations the mobile menu carries. */
  menuItems: ResolvedShellItem[]
  socials: ResolvedSocial[]
  /** Accessible names. Resolved by `logic/`, like every other string here. */
  navLabel: string
  menuLabel: string
  menuOpenLabel: string
  menuCloseLabel: string
}

const {
  items,
  cta,
  showCta,
  home,
  locale,
  localeSwitchHref,
  localeSwitchLabel,
  menuItems,
  socials,
  navLabel,
  menuLabel,
  menuOpenLabel,
  menuCloseLabel,
} = defineProps<Props>()

/**
 * The no-scripting override for the call to action, as a string.
 *
 * **It is a string because Vue's client template compiler refuses a literal
 * `<style>` inside a template** — *"Tags with side effect (`<script>` and
 * `<style>`) are ignored in client component templates"*, which is a hard
 * error, not a warning. The SSR compiler accepts it, so the mistake builds and
 * generates correctly and only fails when the component is compiled for the
 * client. `v-html` with a build-time constant is the way past it, and it is
 * the same mechanism `Lockup.vue` and `SocialIcon.vue` already use to inline
 * their SVGs.
 *
 * The class is **doubled** rather than marked `!important`: it has to beat
 * `.invisible` and `.opacity-0`, which are single-class utilities, and
 * repeating the class raises this to two-class specificity — the ordinary
 * cascade rather than an override of it. (Tailwind emits its utilities inside
 * `@layer utilities`, so an unlayered rule would win regardless; the doubled
 * class means this does not depend on that.)
 */
const NOSCRIPT_CTA_OVERRIDE =
  '<style>.site-nav__cta.site-nav__cta{opacity:1;visibility:visible}</style>'

const { isOpen, open, close } = useMobileMenu()
const { isNavVisible } = useNavScrollReveal(isOpen)

const menuTrigger = useTemplateRef<HTMLButtonElement>('menuTrigger')

/*
 * The hamburger appears only once scripting has run. Without it the menu
 * cannot open, and a control that looks operable and is not reads as a broken
 * site; every destination the menu offers also lives in the footer, which is
 * on every page and needs no scripting (spec FR-032).
 */
const isScriptingAvailable = ref(false)
onMounted(() => {
  isScriptingAvailable.value = true
})

/* Focus returns to the control that opened the menu. */
watch(isOpen, opened => {
  if (!opened) menuTrigger.value?.focus()
})
</script>

<template>
  <nav
    :aria-label="navLabel"
    class="site-nav sticky top-0 lg:top-nav-pill-y"
    :class="{ 'site-nav--hidden': !isNavVisible }"
  >
    <!--
      Inert while the panel is up: the row underneath is covered visually, and
      without this it would still take focus and still be announced.

      The `lg:` classes below are the floating pill (feature 21): a
      dark-glass surface, inset from the viewport rather than full-bleed.
      `max-w-nav-pill-w` (1280px) replaces `max-w-shell-max` (1440px) only at
      `lg` and up, which is what narrows the row from the old full-bleed bar
      to the pill's own width — the same "max-width + full-bleed padding"
      technique `<main>`'s own `max-w-shell-max` already uses (plan.md § 1),
      just capped one step earlier. `px-page` and the flex layout are
      unchanged, so mobile (below `lg`) is byte-identical (spec FR-020).

      `lg:py-nav-pill-py` overrides `py-nav-y` only at `lg`: the pill's own
      72px target height (measured live via CDP after rejection round 1,
      `docs/harness/findings.md` § R64) needs less vertical padding than the
      old full-bleed bar's, since the CTA (48px, the tallest row content at
      `lg`) already fills most of it. Mobile keeps `py-nav-y` unmodified.
    -->
    <div
      :inert="isOpen"
      class="nav-row mx-auto flex max-w-shell-max items-center justify-between gap-nav-gap px-page py-nav-y lg:max-w-nav-pill-w lg:rounded-full lg:border lg:border-glass-line lg:bg-glass-dark lg:px-nav-pill-x lg:py-nav-pill-py"
    >
      <NuxtLink :to="home" class="text-bone-100 focus-visible:outline-red-400">
        <!--
          `hide-wordmark-below-lg` (feature 26, 2026-09-09): mobile shows the
          isotipo only, a recorded human divergence from the `.pen` — see
          Lockup.vue's own doc comment. Desktop and the footer are unaffected.
        -->
        <Lockup hide-wordmark-below-lg />
      </NuxtLink>

      <!--
        Its own grid column at `lg` (see `<style scoped>` below), centred on
        the WHOLE pill rather than on the leftover space between the logo and
        the CTA+toggle group — item 2 of feature 23. Below `lg` it stays
        `hidden`, so the mobile row is byte-identical to before: only two
        children (the logo and `.nav-row__end`) are ever visible there.
      -->
      <ul class="nav-row__links hidden items-center gap-nav-gap lg:flex">
        <li v-for="item in items" :key="item.label">
          <NuxtLink
            :to="item.href"
            :aria-current="item.current ? 'page' : undefined"
            class="font-instrument text-nav-link text-bone-300 focus-visible:outline-red-400"
          >
            {{ item.label }}
          </NuxtLink>
        </li>
      </ul>

      <div class="nav-row__end flex items-center gap-nav-gap">
        <!--
          Feature 025: the language toggle sits BEFORE the CTA, left to right —
          verified against the `.pen` (frames `WGhSI` Landing ES, `UfsGV`
          Landing EN, both real, 1280×72): Idioma x985/CTA x1043 in ES, Idioma
          x970/CTA x1028 in EN — the toggle is always immediately before the
          CTA in both locales. Previously the CTA div came first; swapped to
          match.
        -->
        <LanguageToggle
          :locale="locale"
          :href="localeSwitchHref"
          :switch-label="localeSwitchLabel"
        />

        <!--
          No CTA below `lg`. It does not collapse into the menu either: on
          mobile the only call to action is the social row inside the open
          menu (`decisions-open.md`, 2026-09-06). This is a recorded decision,
          not an omission — please do not "fix" it. It is also why the reveal
          below is desktop-only: there is nothing to reveal at 390px.

          `visible`/`invisible` alongside the opacity: an invisible button that
          is still focusable and still clickable is not hidden (FR-048).
        -->
        <div
          class="site-nav__cta hidden lg:block"
          :class="showCta ? 'visible opacity-100' : 'invisible opacity-0'"
        >
          <!--
            Text-then-arrow, `gap: 9` (item 1 of feature 23 — `.pen` frames
            `Rm6Wu`/`WGhSI` draw the CTA as `Texto → Flecha`, not the other
            way around). Same `aria-hidden` span and hover-shift transition
            as before, just moved after the label with a margin that reads
            as the token gap rather than the collapsed template whitespace
            the old order relied on.
          -->
          <BotonPrimario variant="nav" :href="cta.href">
            {{ cta.label }}
            <span
              aria-hidden="true"
              class="ml-nav-cta-arrow-gap inline-block transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
              >→</span
            >
          </BotonPrimario>
        </div>

        <!--
          Without scripting the observer never runs, so the flag never changes
          and the landing's button would stay hidden forever. This is the whole
          no-JS path, and it is CSS rather than script on purpose: the button
          ships **hidden** in the landing's HTML so it cannot flash before the
          observer has an answer (FR-045), and a browser with scripting off
          overrides that instead (FR-046). Shipping it visible and hiding it on
          mount is exactly the flash FR-045 forbids.
        -->
        <noscript v-html="NOSCRIPT_CTA_OVERRIDE" />

        <!--
          `cursor-pointer` is declared because nothing else does: a native
          `<button>` gets `cursor: default` from the user agent and Tailwind's
          preflight sets no cursor at all (`docs/harness/findings.md` § R56).
          This one is unconditionally clickable — it only renders once scripting
          is available, and it opens the menu.
        -->
        <button
          v-if="isScriptingAvailable"
          ref="menuTrigger"
          type="button"
          :aria-label="menuOpenLabel"
          :aria-expanded="isOpen"
          class="inline-flex cursor-pointer flex-col items-center gap-burger-gap rounded-icon border border-glass-line bg-glass-dark px-burger-x py-burger-y focus-visible:outline-red-400 lg:hidden"
          @click="open"
        >
          <span
            class="h-burger-bar-h w-burger-bar-w rounded-burger-bar bg-bone-100"
          />
          <span
            class="h-burger-bar-h w-burger-bar-w rounded-burger-bar bg-bone-100"
          />
        </button>
      </div>
    </div>

    <!--
      `itemChosen` closes before the browser follows the link, so the scroll
      to the anchor happens with the panel already dismissed (spec FR-030).
    -->
    <MobileMenu
      :open="isOpen"
      :items="menuItems"
      :socials="socials"
      :home="home"
      :locale="locale"
      :locale-switch-href="localeSwitchHref"
      :locale-switch-label="localeSwitchLabel"
      :label="menuLabel"
      :close-label="menuCloseLabel"
      @closed="close"
      @item-chosen="close"
    />
  </nav>
</template>

<style scoped>
/*
 * The pinned nav. `--layer-nav` is a positive level and it is not optional:
 * `sticky` makes this a positioned element, and the Hero section is
 * `position: relative` **later in the document**, so without a level the Hero
 * would paint over the nav.
 *
 * The three negative levels the background depends on are untouched, and the
 * nav is neither a section nor an ancestor of one, so nothing `rules.md`
 * §§ R28/R37 ask of a section changes (spec A-13).
 *
 * ⚠️ No height, no background and no opacity are declared here or anywhere
 * else on the nav, at any scroll position. That is the requirement, not an
 * omission (FR-042).
 *
 * `translateY(-100%)` (feature 26) does not conflict with `sticky`: it is a
 * paint-time transform layered on top of the position `sticky` already
 * resolved, never a change to `position` itself. `transition-property` is
 * scoped to `transform` alone, same reasoning `.site-nav__cta` below already
 * documents for its own fade — a scoped rule outranks a same-specificity
 * utility, so writing the reduced-motion override here in the same place
 * keeps one specificity level in charge of it instead of two.
 */
.site-nav {
  z-index: var(--layer-nav);
  transition-property: transform;
  transition-duration: var(--duration-nav-reveal);
  transition-timing-function: ease-out;
}

/* The hidden state itself: translated fully off-screen, never `display` or
   `visibility` — those would drop the nav from the accessibility tree and
   from tab order mid-scroll, which nothing in feature 26 asks for. */
.site-nav--hidden {
  transform: translateY(-100%);
}

/* Instant, per `ui-map.md` § *Movimiento reducido*'s own pattern: hiding
   still carries information (there is more page below), the slide is
   decoration. */
@media (prefers-reduced-motion: reduce) {
  .site-nav {
    transition-property: none;
  }
}

/*
 * Item 2 of feature 23 — three independent zones instead of "logo vs.
 * everything else". Below `lg` this stays the plain flex row it always was
 * (`justify-between` between the logo and `.nav-row__end`, since
 * `.nav-row__links` is `hidden` there and drops out of flow entirely — the
 * mobile row is byte-identical to before this change).
 *
 * At `lg` the row becomes a three-column grid, `1fr auto 1fr`: the outer
 * columns are equal and absorb whatever space the logo/end groups do not
 * use, so the middle column's own centre is the ROW's centre — not the
 * centre of the gap left over between the logo and the end group, which is
 * what `justify-between` alone produces. `gap-nav-gap` (unchanged) still
 * applies as the grid's column gap and is symmetric on both sides of the
 * middle column, so it cannot shift that centre.
 *
 * Hand-written rather than a Tailwind arbitrary value: `grid-cols-[1fr_auto_1fr]`
 * would be a bracketed literal, and `ContactSection.vue`'s own
 * `grid-template-areas` already set the precedent of writing this kind of
 * structural CSS by hand when Tailwind has no utility for it.
 */
@media (width >= 64rem) {
  .nav-row {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
  }

  .nav-row__links {
    grid-column: 2;
    justify-self: center;
  }

  .nav-row__end {
    grid-column: 3;
    justify-self: end;
  }
}

/*
 * The fade, and the only animation this whole change introduces.
 *
 * It is written here rather than with `transition-opacity` +
 * `motion-reduce:transition-none` because a scoped rule carries the
 * component's data attribute and therefore **outranks** a utility of the same
 * class specificity: mixing the two would let this rule silently win over the
 * reduced-motion utility and keep animating for a visitor who asked not to be
 * animated. One place, one specificity. Same shape as
 * `CursorSpotlight.vue`'s own fade, which reads its own duration token.
 *
 * `visibility` is in the transition list on purpose: it interpolates
 * discretely and in the direction that matters — the button stays visible for
 * the whole fade out and becomes visible at the start of the fade in.
 */
.site-nav__cta {
  transition-property: opacity, visibility;
  transition-duration: var(--duration-nav-cta-fade);
  transition-timing-function: ease-out;
}

/*
 * Reduced motion drops the fade and keeps the appearing and disappearing:
 * hiding the button carries information — *the Hero already offers this* — and
 * the fade is decoration (FR-047).
 */
@media (prefers-reduced-motion: reduce) {
  .site-nav__cta {
    transition-property: none;
  }
}
</style>
