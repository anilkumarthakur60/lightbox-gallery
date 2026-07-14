import { Lightbox } from './lightbox'
import type { LightboxItem, LightboxOptions } from './types'

export { Lightbox, DEFAULT_LABELS } from './lightbox'
export { detectType, toEmbedUrl, findEmbedUrl, registerEmbedProvider } from './utils'
export type { EmbedProvider } from './utils'
export type {
  LightboxAnimation,
  LightboxEvent,
  LightboxEventMap,
  LightboxItem,
  LightboxItemType,
  LightboxLabels,
  LightboxOptions,
  LightboxTheme,
  LightboxToolbarButton,
} from './types'

export interface BoundGallery {
  /** The underlying lightbox instance (recreated on refresh). */
  lightbox: Lightbox
  /** Open the gallery at the given element index. */
  open(index?: number): void
  /** Re-scan the DOM for gallery elements (call after adding/removing links). */
  refresh(): void
  /** Remove all click listeners and destroy the lightbox. */
  destroy(): void
}

function itemFromElement(elm: HTMLElement): LightboxItem {
  const anchor = elm instanceof HTMLAnchorElement ? elm : null
  const img = elm.querySelector('img')
  const src = elm.dataset.src ?? anchor?.href ?? img?.currentSrc ?? img?.src ?? ''
  return {
    src,
    type: elm.dataset.type as LightboxItem['type'] | undefined,
    thumb: elm.dataset.thumb ?? img?.currentSrc ?? img?.src,
    caption: elm.dataset.caption ?? elm.title ?? img?.alt ?? undefined,
    alt: img?.alt,
    srcset: elm.dataset.srcset,
    poster: elm.dataset.poster,
    downloadUrl: elm.dataset.downloadUrl,
    shareUrl: elm.dataset.shareUrl,
  }
}

/**
 * Progressive-enhancement helper for vanilla usage: turn a set of links
 * (e.g. `<a href="large.jpg"><img src="thumb.jpg"></a>`) into a gallery.
 *
 * Automatically wires the FLIP open/close animation to the clicked
 * thumbnail, and deep-links from the URL hash when the `hash` option is on.
 *
 * ```ts
 * bindGallery('a[data-gallery]', { loop: true, hash: true })
 * ```
 */
export function bindGallery(
  target: string | HTMLElement[] | NodeListOf<HTMLElement>,
  options: Omit<LightboxOptions, 'items'> = {},
): BoundGallery {
  if (typeof document === 'undefined') {
    throw new Error('[lightbox-gallery] bindGallery can only run in the browser')
  }

  let elements: HTMLElement[] = []
  let lightbox = new Lightbox({ items: [], ...options })
  const listeners = new Map<HTMLElement, (e: Event) => void>()

  const animateFrom =
    options.animateFrom ??
    ((index: number): HTMLElement | null => {
      const elm = elements[index]
      return elm ? (elm.querySelector('img') ?? elm) : null
    })

  const refresh = (): void => {
    listeners.forEach((fn, elm) => elm.removeEventListener('click', fn))
    listeners.clear()
    elements =
      typeof target === 'string'
        ? Array.from(document.querySelectorAll<HTMLElement>(target))
        : Array.from(target)
    lightbox.destroy()
    lightbox = new Lightbox({ items: elements.map(itemFromElement), ...options, animateFrom })
    api.lightbox = lightbox
    elements.forEach((elm, index) => {
      const onClick = (e: Event): void => {
        e.preventDefault()
        lightbox.open(index)
      }
      elm.addEventListener('click', onClick)
      listeners.set(elm, onClick)
    })
  }

  const api: BoundGallery = {
    lightbox,
    open: (index = 0) => lightbox.open(index),
    refresh,
    destroy: () => {
      listeners.forEach((fn, elm) => elm.removeEventListener('click', fn))
      listeners.clear()
      lightbox.destroy()
    },
  }

  refresh()

  // deep-link: open the slide encoded in the URL hash
  if (options.hash) {
    const key = typeof options.hash === 'string' ? options.hash : 'gallery'
    const index = Lightbox.parseHash(key)
    if (index !== null && index < elements.length) {
      // the pushState in open() replaces the deep-link entry semantics; drop
      // the current hash first so back() from the lightbox leaves the page clean
      history.replaceState(null, '', location.pathname + location.search)
      api.open(index)
    }
  }

  return api
}

export default Lightbox
