import { afterEach, describe, expect, it } from 'vitest'
import { effectScope } from 'vue'
import { useMobileMenu } from './useMobileMenu'

const SCROLL_OFFSET = 240
const MOBILE_FRAME = 390
const DESKTOP_FRAME = 1440

function scrollTo(offset: number) {
  window.scrollTo(0, offset)
}

/** happy-dom drives `matchMedia` from its viewport; this is how a real
 *  breakpoint crossing is reproduced rather than simulated. */
function setViewportWidth(width: number) {
  const environment = window as unknown as {
    happyDOM: { setViewport: (viewport: { width: number }) => void }
  }
  environment.happyDOM.setViewport({ width })
}

describe('useMobileMenu', () => {
  afterEach(() => {
    useMobileMenu().close()
    scrollTo(0)
    setViewportWidth(MOBILE_FRAME)
  })

  it('should start closed when first used', () => {
    expect(useMobileMenu().isOpen.value).toBe(false)
  })

  it('should open when the trigger is activated', () => {
    const { isOpen, open } = useMobileMenu()

    open()

    expect(isOpen.value).toBe(true)
  })

  it('should close when the close control is activated', () => {
    const { isOpen, open, close } = useMobileMenu()

    open()
    close()

    expect(isOpen.value).toBe(false)
  })

  it('should close when an item is chosen and closes it', () => {
    /* An item does not navigate on its own: the menu closes first, so the
       scroll to the anchor happens with the panel already dismissed. */
    const { isOpen, open, close } = useMobileMenu()

    open()
    close()

    expect(isOpen.value).toBe(false)
  })

  it('should close when Escape is pressed', () => {
    const { isOpen, open } = useMobileMenu()
    open()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(isOpen.value).toBe(false)
  })

  it('should stay open when another key is pressed', () => {
    const { isOpen, open } = useMobileMenu()
    open()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))

    expect(isOpen.value).toBe(true)
  })

  it('should close when the browser navigates through history', () => {
    const { isOpen, open } = useMobileMenu()
    open()

    window.dispatchEvent(new PopStateEvent('popstate'))

    expect(isOpen.value).toBe(false)
  })

  it('should stop listening for Escape once it is closed', () => {
    const { isOpen, open, close } = useMobileMenu()
    open()
    close()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(isOpen.value).toBe(false)
  })

  it('should close when the viewport crosses into the desktop arrangement', () => {
    /* A full-screen panel must not survive over a desktop layout, and the
       scroll lock must not outlive it. */
    const { isOpen, open } = useMobileMenu()
    setViewportWidth(MOBILE_FRAME)
    open()

    setViewportWidth(DESKTOP_FRAME)

    expect(isOpen.value).toBe(false)
    expect(document.body.style.position).toBe('')
  })

  it('should lock the page behind it when open', () => {
    const { open } = useMobileMenu()
    scrollTo(SCROLL_OFFSET)

    open()

    expect(document.body.style.position).toBe('fixed')
    expect(document.body.style.top).toBe(`-${SCROLL_OFFSET}px`)
  })

  it('should restore the exact scroll offset when closed', () => {
    const { open, close } = useMobileMenu()
    scrollTo(SCROLL_OFFSET)

    open()
    close()

    expect(document.body.style.position).toBe('')
    expect(window.scrollY).toBe(SCROLL_OFFSET)
  })

  it('should release the lock when the scope is disposed while open', () => {
    /* The failure this composable exists to prevent: a lock outliving its
       panel freezes the whole site with nothing visible to blame. */
    const scope = effectScope()
    scope.run(() => {
      useMobileMenu().open()
    })

    scope.stop()

    expect(document.body.style.position).toBe('')
    expect(useMobileMenu().isOpen.value).toBe(false)
  })
})
