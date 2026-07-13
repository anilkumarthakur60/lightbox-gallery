import { writable, type Readable } from 'svelte/store'
import { Lightbox as CoreLightbox, bindGallery } from '@anil-labs/lightbox-gallery-core'
import type { LightboxItem, LightboxOptions } from '@anil-labs/lightbox-gallery-core'

export type { LightboxItem, LightboxOptions } from '@anil-labs/lightbox-gallery-core'
export { Lightbox as CoreLightbox, bindGallery } from '@anil-labs/lightbox-gallery-core'

export interface LightboxController {
  /** Reactive open state — `$lightbox.isOpen` friendly. */
  isOpen: Readable<boolean>
  /** Reactive current slide index. */
  index: Readable<number>
  /** Open the lightbox, optionally at a given index. */
  open(index?: number): void
  /** Close the lightbox. */
  close(): void
  /** Jump to a slide while open. */
  goTo(index: number): void
  /** Replace the gallery items. */
  setItems(items: LightboxItem[]): void
  /** The underlying core instance (null until first opened). */
  readonly lightbox: CoreLightbox | null
  /** Destroy the underlying instance and release listeners. */
  destroy(): void
}

/**
 * Store-based Svelte controller (works with Svelte 4 and 5):
 *
 * ```svelte
 * <script>
 *   import { createLightbox } from '@anil-labs/lightbox-gallery-svelte'
 *   import '@anil-labs/lightbox-gallery-core/styles.css'
 *
 *   const gallery = createLightbox(items, { loop: true })
 *   const { isOpen, index } = gallery
 * </script>
 *
 * {#each items as item, i}
 *   <button on:click={() => gallery.open(i)}><img src={item.thumb} alt="" /></button>
 * {/each}
 * <p>Open: {$isOpen}, slide: {$index + 1}</p>
 * ```
 */
export function createLightbox(
  items: LightboxItem[],
  options: Omit<LightboxOptions, 'items'> = {},
): LightboxController {
  const isOpen = writable(false)
  const index = writable(0)
  let core: CoreLightbox | null = null
  let currentItems = items

  const ensure = (): CoreLightbox => {
    if (!core) {
      core = new CoreLightbox({ ...options, items: currentItems })
      core.on('open', (i) => {
        isOpen.set(true)
        index.set(i)
      })
      core.on('close', () => isOpen.set(false))
      core.on('change', (i) => index.set(i))
    }
    return core
  }

  return {
    isOpen: { subscribe: isOpen.subscribe },
    index: { subscribe: index.subscribe },
    open: (i = 0) => ensure().open(i),
    close: () => core?.close(),
    goTo: (i: number) => core?.goTo(i),
    setItems: (next: LightboxItem[]) => {
      currentItems = next
      core?.setItems(next)
    },
    get lightbox() {
      return core
    },
    destroy: () => {
      core?.destroy()
      core = null
    },
  }
}

/**
 * Svelte action for progressive enhancement — bind every matching link
 * inside the node into a gallery:
 *
 * ```svelte
 * <div use:lightbox={{ selector: 'a[data-gallery]', loop: true }}>
 *   <a href="large.jpg" data-gallery><img src="thumb.jpg" alt="" /></a>
 * </div>
 * ```
 */
export function lightbox(
  node: HTMLElement,
  params: Omit<LightboxOptions, 'items'> & { selector?: string } = {},
): { update(next: typeof params): void; destroy(): void } {
  let bound = bind(params)

  function bind(p: typeof params): ReturnType<typeof bindGallery> {
    const { selector = 'a', ...options } = p
    return bindGallery(Array.from(node.querySelectorAll<HTMLElement>(selector)), options)
  }

  return {
    update(next: typeof params) {
      bound.destroy()
      bound = bind(next)
    },
    destroy() {
      bound.destroy()
    },
  }
}
