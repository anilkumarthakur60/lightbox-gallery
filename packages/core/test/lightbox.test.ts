import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Lightbox, detectType, toEmbedUrl, registerEmbedProvider } from '../src'

const items = [
  { src: 'https://example.com/a.jpg', caption: 'First' },
  { src: 'https://example.com/b.jpg', caption: 'Second' },
  { src: 'https://example.com/c.jpg' },
]

describe('Lightbox', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
    vi.useRealTimers()
  })

  it('does not touch the DOM until opened', () => {
    new Lightbox({ items })
    expect(document.querySelector('.lbg-root')).toBeNull()
  })

  it('opens, renders a dialog and emits open', () => {
    const lb = new Lightbox({ items })
    const onOpen = vi.fn()
    lb.on('open', onOpen)
    lb.open(1)
    const root = document.querySelector('.lbg-root')
    expect(root).not.toBeNull()
    expect(root?.getAttribute('role')).toBe('dialog')
    expect(root?.getAttribute('aria-modal')).toBe('true')
    expect(lb.isOpen).toBe(true)
    expect(lb.index).toBe(1)
    expect(onOpen).toHaveBeenCalledWith(1)
    expect(document.body.style.overflow).toBe('hidden')
    lb.destroy()
  })

  it('shows counter and caption for the current item', () => {
    const lb = new Lightbox({ items })
    lb.open(0)
    expect(document.querySelector('.lbg-counter')?.textContent).toBe('1 / 3')
    expect(document.querySelector('.lbg-caption')?.textContent).toBe('First')
    lb.destroy()
  })

  it('navigates with next/prev and emits change', () => {
    const lb = new Lightbox({ items, loop: false })
    const onChange = vi.fn()
    lb.on('change', onChange)
    lb.open(0)
    lb.next()
    vi.advanceTimersByTime(400)
    expect(lb.index).toBe(1)
    expect(onChange).toHaveBeenCalledWith(1, items[1])
    lb.prev()
    vi.advanceTimersByTime(400)
    expect(lb.index).toBe(0)
    lb.destroy()
  })

  it('respects loop: false at the boundaries', () => {
    const lb = new Lightbox({ items, loop: false })
    lb.open(0)
    lb.prev()
    vi.advanceTimersByTime(400)
    expect(lb.index).toBe(0)
    lb.destroy()
  })

  it('wraps around when loop is enabled', () => {
    const lb = new Lightbox({ items, loop: true })
    lb.open(2)
    lb.next()
    vi.advanceTimersByTime(400)
    expect(lb.index).toBe(0)
    lb.destroy()
  })

  it('closes on Escape and emits close', () => {
    const lb = new Lightbox({ items })
    const onClose = vi.fn()
    lb.on('close', onClose)
    lb.open(0)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(onClose).toHaveBeenCalled()
    expect(lb.isOpen).toBe(false)
    vi.advanceTimersByTime(400)
    expect(document.querySelector('.lbg-root')).toBeNull()
    expect(document.body.style.overflow).toBe('')
    lb.destroy()
  })

  it('setItems updates the gallery while open', () => {
    const lb = new Lightbox({ items })
    lb.open(2)
    lb.setItems(items.slice(0, 1))
    expect(lb.index).toBe(0)
    expect(document.querySelector('.lbg-counter')?.textContent).toBe('1 / 1')
    lb.destroy()
  })

  it('renders thumbnails and navigates on click', () => {
    const lb = new Lightbox({ items })
    lb.open(0)
    const thumbs = document.querySelectorAll<HTMLButtonElement>('.lbg-thumb')
    expect(thumbs.length).toBe(3)
    thumbs[2].click()
    vi.advanceTimersByTime(400)
    expect(lb.index).toBe(2)
    lb.destroy()
  })

  it('destroy removes everything immediately', () => {
    const lb = new Lightbox({ items })
    lb.open(0)
    lb.destroy()
    expect(document.querySelector('.lbg-root')).toBeNull()
    expect(document.body.style.overflow).toBe('')
  })

  it('survives a listener that destroys the instance during close (re-entrancy)', () => {
    // reproduces the Solid crash: a controlled wrapper unmounts synchronously
    // on the close event, calling destroy() mid-close()
    const lb = new Lightbox({ items })
    lb.open(0)
    lb.on('close', () => lb.destroy())
    expect(() => lb.close()).not.toThrow()
    expect(lb.isOpen).toBe(false)
    expect(document.querySelector('.lbg-root')).toBeNull()
  })

  it('does not open with an empty item list', () => {
    const lb = new Lightbox({ items: [] })
    lb.open()
    expect(lb.isOpen).toBe(false)
    expect(document.querySelector('.lbg-root')).toBeNull()
  })
})

describe('new features', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
    vi.useRealTimers()
  })

  it('shows rotate buttons and rotates the image', () => {
    const lb = new Lightbox({ items, rotate: true, loop: false })
    const onRotate = vi.fn()
    lb.on('rotate', onRotate)
    lb.open(0)
    const btn = document.querySelector<HTMLButtonElement>('.lbg-rotate-right')
    expect(btn?.classList.contains('lbg-hidden')).toBe(false)
    btn!.click()
    expect(onRotate).toHaveBeenCalledWith(90)
    const img = document.querySelector<HTMLImageElement>('img.lbg-image')
    expect(img?.style.transform).toContain('rotate(90deg)')
    lb.flipHorizontal()
    expect(img?.style.transform).toContain('scale(-1, 1)')
    lb.destroy()
  })

  it('share falls back to clipboard and emits share', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    const lb = new Lightbox({ items, share: true })
    const onShare = vi.fn()
    lb.on('share', onShare)
    lb.open(0)
    await lb.share()
    expect(onShare).toHaveBeenCalledWith(items[0], 0)
    expect(writeText).toHaveBeenCalledWith('https://example.com/a.jpg')
    expect(document.querySelector('.lbg-toast')?.textContent).toBe('Link copied')
    lb.destroy()
  })

  it('hash routing writes and updates the URL hash', () => {
    const lb = new Lightbox({ items, hash: true })
    lb.open(0)
    expect(location.hash).toBe('#gallery=1')
    lb.next()
    vi.advanceTimersByTime(400)
    expect(location.hash).toBe('#gallery=2')
    expect(Lightbox.parseHash()).toBe(1)
    lb.destroy()
    history.replaceState(null, '', '#')
  })

  it('inline mode renders into the container without locking scroll', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const lb = new Lightbox({ items, inline: true, container })
    lb.open(0)
    expect(container.querySelector('.lbg-root.lbg-inline')).not.toBeNull()
    expect(document.body.style.overflow).toBe('')
    expect(container.querySelector('.lbg-close')?.classList.contains('lbg-hidden')).toBe(true)
    lb.destroy()
  })

  it('emits end-reached near the end and supports appendItems', () => {
    const lb = new Lightbox({ items, loop: false, startIndex: 0 })
    const onEnd = vi.fn()
    lb.on('end-reached', onEnd)
    lb.open(0)
    expect(onEnd).not.toHaveBeenCalled()
    lb.next()
    vi.advanceTimersByTime(400)
    expect(onEnd).toHaveBeenCalledTimes(1)
    lb.appendItems([{ src: 'https://example.com/d.jpg' }])
    expect(document.querySelector('.lbg-counter')?.textContent).toBe('2 / 4')
    lb.next()
    vi.advanceTimersByTime(400)
    expect(onEnd).toHaveBeenCalledTimes(2)
    lb.destroy()
  })

  it('uses custom labels', () => {
    const lb = new Lightbox({ items, labels: { close: 'Schließen' } })
    lb.open(0)
    expect(document.querySelector('.lbg-close')?.getAttribute('aria-label')).toBe('Schließen')
    lb.destroy()
  })

  it('renders custom toolbar buttons', () => {
    const onClick = vi.fn()
    const lb = new Lightbox({
      items,
      toolbarButtons: [{ id: 'like', label: 'Like', icon: '<svg></svg>', onClick }],
    })
    lb.open(0)
    const btn = document.querySelector<HTMLButtonElement>('.lbg-btn-like')
    expect(btn).not.toBeNull()
    btn!.click()
    expect(onClick).toHaveBeenCalledWith(lb)
    lb.destroy()
  })
})

function firePointer(target: Element, type: string, opts: Record<string, unknown>): void {
  const event = new Event(type, { bubbles: true, cancelable: true }) as Event &
    Record<string, unknown>
  Object.assign(event, { pointerId: 1, button: 0, ...opts })
  target.dispatchEvent(event)
}

function tap(target: Element, pointerType: string, x = 50, y = 50): void {
  firePointer(target, 'pointerdown', { pointerType, clientX: x, clientY: y })
  firePointer(target, 'pointerup', { pointerType, clientX: x, clientY: y })
}

describe('tap handling', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
    vi.useRealTimers()
  })

  it('touch tap on the image toggles the UI instead of closing', () => {
    const lb = new Lightbox({ items, loop: false })
    lb.open(0)
    const img = document.querySelector('img.lbg-image')!
    tap(img, 'touch')
    vi.advanceTimersByTime(400)
    expect(lb.isOpen).toBe(true)
    expect(document.querySelector('.lbg-root')?.classList.contains('lbg-ui-hidden')).toBe(true)
    tap(img, 'touch')
    vi.advanceTimersByTime(400)
    expect(document.querySelector('.lbg-root')?.classList.contains('lbg-ui-hidden')).toBe(false)
    lb.destroy()
  })

  it('mouse click on the image zooms in, second click zooms back out', () => {
    const lb = new Lightbox({ items, loop: false })
    lb.open(0)
    const img = document.querySelector<HTMLImageElement>('img.lbg-image')!
    tap(img, 'mouse')
    vi.advanceTimersByTime(400)
    expect(lb.isOpen).toBe(true)
    expect(lb.scale).toBe(2.5)
    expect(img.style.transform).toContain('scale(2.5)')
    // wait out the double-tap window, then click again to reset
    vi.advanceTimersByTime(400)
    tap(img, 'mouse')
    vi.advanceTimersByTime(400)
    expect(lb.scale).toBe(1)
    lb.destroy()
  })

  it('tap on the backdrop closes the gallery', () => {
    const lb = new Lightbox({ items, loop: false })
    lb.open(0)
    const inner = document.querySelectorAll('.lbg-slide-inner')[0]
    tap(inner, 'touch')
    vi.advanceTimersByTime(400)
    expect(lb.isOpen).toBe(false)
    lb.destroy()
  })
})

describe('helpers', () => {
  it('detects media types from URLs', () => {
    expect(detectType({ src: 'photo.jpeg' })).toBe('image')
    expect(detectType({ src: 'clip.mp4' })).toBe('video')
    expect(detectType({ src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })).toBe('iframe')
    expect(detectType({ src: 'https://vimeo.com/123456' })).toBe('iframe')
    expect(detectType({ src: 'https://home.wistia.com/medias/e4a27b971d' })).toBe('iframe')
    expect(detectType({ src: 'unknown', type: 'html', html: '<p>hi</p>' })).toBe('html')
  })

  it('supports custom embed providers', () => {
    registerEmbedProvider({
      name: 'loom',
      match: /loom\.com\/share\/(\w+)/,
      embed: (m) => `https://www.loom.com/embed/${m[1]}`,
    })
    expect(detectType({ src: 'https://www.loom.com/share/abc123' })).toBe('iframe')
    expect(toEmbedUrl('https://www.loom.com/share/abc123')).toBe(
      'https://www.loom.com/embed/abc123',
    )
  })

  it('converts YouTube and Vimeo URLs to embeds', () => {
    expect(toEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    )
    expect(toEmbedUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    )
    expect(toEmbedUrl('https://vimeo.com/123456')).toBe('https://player.vimeo.com/video/123456')
  })
})
