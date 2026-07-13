import { Lightbox, bindGallery } from '@anil-labs/lightbox-gallery-core'
import type { BoundGallery, LightboxItem, LightboxOptions } from '@anil-labs/lightbox-gallery-core'
import styles from '@anil-labs/lightbox-gallery-core/styles.css'

export type { LightboxItem, LightboxOptions } from '@anil-labs/lightbox-gallery-core'
export { Lightbox } from '@anil-labs/lightbox-gallery-core'

const STYLE_ID = 'lightbox-gallery-styles'

function injectStyles(): void {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = styles
  document.head.appendChild(style)
}

/**
 * `<lightbox-gallery>` custom element.
 *
 * Progressive enhancement — wrap your links and set `bind`:
 * ```html
 * <lightbox-gallery bind="a">
 *   <a href="large-1.jpg"><img src="thumb-1.jpg" alt="" /></a>
 *   <a href="large-2.jpg"><img src="thumb-2.jpg" alt="" /></a>
 * </lightbox-gallery>
 * ```
 *
 * Or programmatic — assign `items` (and optionally `options`), then call
 * `open(index)` / set the `open` attribute:
 * ```js
 * const el = document.querySelector('lightbox-gallery')
 * el.items = [{ src: '/photos/1.jpg', caption: 'Sunrise' }]
 * el.open(0)
 * ```
 *
 * Events: `lbg-open`, `lbg-close`, `lbg-change` (detail: `{ index, item }`).
 */
export class LightboxGalleryElement extends HTMLElement {
  static observedAttributes = ['open', 'index']

  private core: Lightbox | null = null
  private bound: BoundGallery | null = null
  private itemsValue: LightboxItem[] = []
  private optionsValue: Omit<LightboxOptions, 'items'> = {}

  get items(): LightboxItem[] {
    return this.itemsValue
  }

  set items(value: LightboxItem[]) {
    this.itemsValue = value ?? []
    if (this.core) this.core.setItems(this.itemsValue)
  }

  get options(): Omit<LightboxOptions, 'items'> {
    return this.optionsValue
  }

  set options(value: Omit<LightboxOptions, 'items'>) {
    this.optionsValue = value ?? {}
    // options apply to the next created instance
    if (this.core && !this.core.isOpen) {
      this.core.destroy()
      this.core = null
    }
  }

  get index(): number {
    return this.core?.index ?? 0
  }

  connectedCallback(): void {
    injectStyles()
    this.upgradeProperty('items')
    this.upgradeProperty('options')
    const setup = (): void => this.setupBinding()
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setup, { once: true })
    } else {
      requestAnimationFrame(setup)
    }
  }

  disconnectedCallback(): void {
    this.bound?.destroy()
    this.bound = null
    this.core?.destroy()
    this.core = null
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    if (name === 'open') {
      if (value !== null) this.open(Number(this.getAttribute('index') ?? 0))
      else this.close()
    } else if (name === 'index' && this.core?.isOpen) {
      this.core.goTo(Number(value ?? 0))
    }
  }

  open(index = 0): void {
    this.ensureCore()?.open(index)
  }

  close(): void {
    this.core?.close()
  }

  /** Re-scan bound links (after adding/removing children). */
  refresh(): void {
    this.bound?.refresh()
  }

  private setupBinding(): void {
    const selector = this.getAttribute('bind')
    if (!selector || this.bound) return
    injectStyles()
    this.bound = bindGallery(
      Array.from(this.querySelectorAll<HTMLElement>(selector)),
      this.optionsValue,
    )
    this.wireEvents(this.bound.lightbox)
  }

  private ensureCore(): Lightbox | null {
    if (this.bound) return this.bound.lightbox
    if (!this.core) {
      if (this.itemsValue.length === 0) return null
      this.core = new Lightbox({ ...this.optionsValue, items: this.itemsValue })
      this.wireEvents(this.core)
    }
    return this.core
  }

  private wireEvents(lightbox: Lightbox): void {
    lightbox.on('open', (index) => {
      this.dispatchEvent(new CustomEvent('lbg-open', { detail: { index } }))
    })
    lightbox.on('close', () => {
      this.removeAttribute('open')
      this.dispatchEvent(new CustomEvent('lbg-close'))
    })
    lightbox.on('change', (index, item) => {
      this.setAttribute('index', String(index))
      this.dispatchEvent(new CustomEvent('lbg-change', { detail: { index, item } }))
    })
  }

  /** Handle properties assigned before the element was upgraded. */
  private upgradeProperty(prop: 'items' | 'options'): void {
    if (Object.prototype.hasOwnProperty.call(this, prop)) {
      const value = (this as Record<string, unknown>)[prop]
      delete (this as Record<string, unknown>)[prop]
      ;(this as Record<string, unknown>)[prop] = value
    }
  }
}

/** Register the custom element (no-op if already registered). */
export function register(tag = 'lightbox-gallery'): void {
  if (typeof customElements !== 'undefined' && !customElements.get(tag)) {
    customElements.define(tag, LightboxGalleryElement)
  }
}

register()
