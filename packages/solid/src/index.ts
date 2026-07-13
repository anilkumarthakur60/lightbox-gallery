import { createEffect, createSignal, onCleanup, untrack, type Accessor } from 'solid-js'
import { Lightbox as CoreLightbox } from '@anil-labs/lightbox-gallery-core'
import type { LightboxItem, LightboxOptions } from '@anil-labs/lightbox-gallery-core'

export type { LightboxItem, LightboxOptions } from '@anil-labs/lightbox-gallery-core'
export { Lightbox as CoreLightbox } from '@anil-labs/lightbox-gallery-core'

export interface LightboxProps extends Omit<LightboxOptions, 'startIndex'> {
  /** Whether the lightbox is shown (controlled). */
  open: boolean
  /** Current slide index (controlled). */
  index?: number
  /** Called when the lightbox wants to close (Escape, backdrop click, swipe down, close button). */
  onClose?: () => void
  /** Called when the visible slide changes. */
  onIndexChange?: (index: number) => void
  /** Called when the current zoom scale changes. */
  onZoom?: (scale: number) => void
}

/**
 * Controlled Solid lightbox. Renders nothing in place — the gallery portals
 * itself to `document.body` via the core library.
 *
 * ```tsx
 * const lb = useLightbox()
 * <button onClick={() => lb.open(2)}>Open</button>
 * <Lightbox items={items} open={lb.isOpen()} index={lb.index()}
 *           onClose={lb.close} onIndexChange={lb.setIndex} />
 * ```
 */
export function Lightbox(props: LightboxProps): null {
  let core: CoreLightbox | null = null

  createEffect(() => {
    if (!props.open) return
    const config = untrack(() => {
      const { open: _o, index: _i, onClose: _c, onIndexChange: _oi, onZoom: _z, ...options } = props
      return options
    })
    const lb = new CoreLightbox(config as LightboxOptions)
    core = lb
    lb.on('close', () => props.onClose?.())
    lb.on('change', (i) => props.onIndexChange?.(i))
    lb.on('zoom', (scale) => props.onZoom?.(scale))
    lb.open(untrack(() => props.index) ?? 0)
    onCleanup(() => {
      lb.destroy()
      core = null
    })
  })

  createEffect(() => {
    const i = props.index
    if (core?.isOpen && i !== undefined && core.index !== i) core.goTo(i)
  })

  createEffect(() => {
    const items = props.items
    if (core?.isOpen) core.setItems(items)
  })

  return null
}

export interface UseLightboxResult {
  isOpen: Accessor<boolean>
  index: Accessor<number>
  open: (index?: number) => void
  close: () => void
  setIndex: (index: number) => void
}

/** Signal-based open/index state for the controlled `<Lightbox>` component. */
export function useLightbox(): UseLightboxResult {
  const [isOpen, setIsOpen] = createSignal(false)
  const [index, setIndex] = createSignal(0)

  return {
    isOpen,
    index,
    open: (i = 0) => {
      setIndex(i)
      setIsOpen(true)
    },
    close: () => setIsOpen(false),
    setIndex: (i: number) => setIndex(i),
  }
}

export type { LightboxItem as SolidLightboxItem }
