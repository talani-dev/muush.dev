import { onMounted, onScopeDispose, type Ref } from 'vue'

/**
 * Keeps Tab and Shift+Tab inside `container` while `active()` (feature 43,
 * spec FR-020, contract § 8). Lifted from the shell into `shared/` by
 * feature 48, whose cookie preferences dialog needs the same trap: a modal
 * `<dialog>` makes the page inert, but Tab from its last control still
 * leaves for the browser chrome (measured in Chrome, 2026-11-05).
 *
 * The layout already makes everything outside the open menu `inert`, which
 * removes it from the tab order and the accessibility tree. That alone is
 * not a trap: from the menu's last control, Tab leaves the document for the
 * browser chrome. This wraps the cycle instead, last → first and
 * first → last, and pulls focus back in if it is anywhere else.
 *
 * One listener on the document, added after mount (never during prerender)
 * and removed with the scope. No dependency (research R6).
 */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function focusableIn(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(FOCUSABLE)]
}

export function useFocusTrap(
  container: Readonly<Ref<HTMLElement | null>>,
  active: () => boolean
): void {
  function onKeydown(event: KeyboardEvent) {
    if (event.key !== 'Tab' || !active() || !container.value) return

    const focusables = focusableIn(container.value)
    const first = focusables.at(0)
    const last = focusables.at(-1)
    if (!first || !last) return

    /* The control Tab would leave the container from, and where it wraps. */
    const edge = event.shiftKey ? first : last
    const wrapTo = event.shiftKey ? last : first
    const current = document.activeElement
    const inside = current !== null && container.value.contains(current)
    if (inside && current !== edge) return

    event.preventDefault()
    wrapTo.focus()
  }

  onMounted(() => document.addEventListener('keydown', onKeydown))
  onScopeDispose(() => document.removeEventListener('keydown', onKeydown))
}
