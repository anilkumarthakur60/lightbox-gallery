import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
 * Controlled React lightbox. Renders nothing in place — the gallery portals
 * itself to `document.body` via the core library.
 *
 * ```tsx
 * const [open, setOpen] = useState(false)
 * const [index, setIndex] = useState(0)
 * <Lightbox items={items} open={open} index={index}
 *           onClose={() => setOpen(false)} onIndexChange={setIndex} />
 * ```
 */
export function Lightbox(props: LightboxProps): null {
  const { open, index = 0, onClose, onIndexChange, onZoom, items, ...options } = props
  const coreRef = useRef<CoreLightbox | null>(null)
  const callbacks = useRef({ onClose, onIndexChange, onZoom })
  callbacks.current = { onClose, onIndexChange, onZoom }

  // Latest items/options without retriggering the open effect.
  const config = useRef({ items, options })
  config.current = { items, options }

  useEffect(() => {
    if (!open) return
    const lb = new CoreLightbox({ ...config.current.options, items: config.current.items })
    coreRef.current = lb
    lb.on('close', () => callbacks.current.onClose?.())
    lb.on('change', (i) => callbacks.current.onIndexChange?.(i))
    lb.on('zoom', (scale) => callbacks.current.onZoom?.(scale))
    lb.open(index)
    return () => {
      lb.destroy()
      coreRef.current = null
    }
    // `index` is intentionally not a dependency: it is synced separately below
    // so index changes navigate instead of remounting the gallery.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    const lb = coreRef.current
    if (lb?.isOpen && lb.index !== index) lb.goTo(index)
  }, [index])

  useEffect(() => {
    const lb = coreRef.current
    if (lb?.isOpen) lb.setItems(items)
  }, [items])

  return null
}

export interface UseLightboxResult {
  /** Whether the lightbox is currently open. */
  isOpen: boolean
  /** Current slide index. */
  index: number
  /** Open the lightbox, optionally at a given index. */
  open: (index?: number) => void
  /** Close the lightbox. */
  close: () => void
  /** Jump to a slide while open. */
  setIndex: (index: number) => void
  /** Spread onto `<Lightbox {...lightboxProps} />`. */
  lightboxProps: LightboxProps
}

/**
 * Convenience state hook:
 *
 * ```tsx
 * const { open, lightboxProps } = useLightbox(items, { loop: true })
 * return <>
 *   <button onClick={() => open(3)}>Show photo 4</button>
 *   <Lightbox {...lightboxProps} />
 * </>
 * ```
 */
export function useLightbox(
  items: LightboxItem[],
  options: Omit<LightboxOptions, 'items' | 'startIndex'> = {},
): UseLightboxResult {
  const [isOpen, setIsOpen] = useState(false)
  const [index, setIndex] = useState(0)

  const open = useCallback((i = 0) => {
    setIndex(i)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => setIsOpen(false), [])

  const lightboxProps = useMemo<LightboxProps>(
    () => ({
      ...options,
      items,
      open: isOpen,
      index,
      onClose: close,
      onIndexChange: setIndex,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, isOpen, index, close],
  )

  return { isOpen, index, open, close, setIndex, lightboxProps }
}
