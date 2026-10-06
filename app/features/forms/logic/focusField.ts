import { nextTick } from 'vue'

/**
 * Moves focus to a field's control on the next tick, once its error markup
 * (and, for WhatsApp, the field itself) has rendered (`ui-map.md` § 7: "foco
 * al primer error"). Shared by both forms since feature 029; each composable
 * used to carry its own copy.
 */
export async function focusField(fieldId: string | undefined): Promise<void> {
  if (!fieldId) return
  await nextTick()
  document.getElementById(fieldId)?.focus()
}
