import { computed, type Ref, ref } from 'vue'
import { dotProgress, litUpTo } from '@/features/landing/logic/timelineProgress'
import { useDesktopLayout } from '@/shared/logic/useDesktopLayout'

/**
 * The desktop "Cómo trabajamos" preview (feature 44, FR-042…FR-045; Roberto
 * review 2026-11-02). Pointing at a step's column, or focusing it from the
 * keyboard, makes that step the active one: the line is red up to its dot,
 * the steps up to and including it are lit and the later ones unlit. With
 * no active step (`null` everywhere) the desktop columns rest unlit and the
 * line grey: desktop has no scroll fill (Roberto, clarification 2026-11-02,
 * FR-044).
 *
 * The pointer wins over focus while both are present. Below `lg` there is no
 * active step at all (the rail has no hover), and `focusable` is false so
 * the steps are not tab stops there.
 *
 * `list` is the `<ol>`; each step holds its desktop dot as `[data-punto-paso]`
 * and is positioned, so `offsetLeft` chains step → list. Offsets ignore the
 * active step's scale, so the split stays on the drawn dot.
 */
export function useTimelineHover(
  list: Ref<HTMLElement | null>,
  stepCount: number
) {
  const isDesktop = useDesktopLayout()
  const pointed = ref<number | null>(null)
  const focused = ref<number | null>(null)

  const active = computed(() =>
    isDesktop.value ? (pointed.value ?? focused.value) : null
  )

  function dotShare(index: number): number {
    const element = list.value
    const step = element?.children[index] as HTMLElement | undefined
    const dot = step?.querySelector<HTMLElement>('[data-punto-paso]')
    if (!element || !step || !dot) return 1
    const centre = step.offsetLeft + dot.offsetLeft + dot.offsetWidth / 2
    return dotProgress(centre, element.clientWidth)
  }

  /* Read when the active step changes, not on resize; the layout does not
     move under a resting pointer, and a resize re-enters through the
     pointer anyway. Known edge (review-44 reopen, advisory 5): if the
     window is resized while a step keeps keyboard focus, the red end stays
     at the old dot offset until focus or the pointer moves to another step.
     Accepted: the columns are fluid but the dot sits at the column start,
     so the drift is the column's horizontal shift, and the next move
     re-reads it. */
  const progress = computed(() =>
    active.value === null ? null : dotShare(active.value)
  )
  const lit = computed(() =>
    active.value === null ? null : litUpTo(active.value, stepCount)
  )

  function pointIn(index: number) {
    pointed.value = index
  }

  function pointOut(index: number) {
    if (pointed.value === index) pointed.value = null
  }

  /* `:focus-visible`, not any focus: a click also focuses the step (it is a
     tab stop), and that focus must not pin the preview once the pointer
     leaves. */
  function focusIn(index: number, event: FocusEvent) {
    const target = event.target as Element | null
    if (!target?.matches(':focus-visible')) return
    focused.value = index
  }

  function focusOut(index: number, event: FocusEvent) {
    const step = event.currentTarget as Node | null
    const next = event.relatedTarget as Node | null
    if (step && next && step.contains(next)) return
    if (focused.value === index) focused.value = null
  }

  return {
    active,
    /* Feature 45, reopen 1: the run (`useTimelineRun`) reads every dot. */
    dotShare,
    progress,
    lit,
    focusable: isDesktop,
    pointIn,
    pointOut,
    focusIn,
    focusOut,
  }
}
