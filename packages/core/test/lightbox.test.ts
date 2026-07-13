import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Lightbox, detectType, toEmbedUrl } from '../src'

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

  it('does not open with an empty item list', () => {
    const lb = new Lightbox({ items: [] })
    lb.open()
    expect(lb.isOpen).toBe(false)
    expect(document.querySelector('.lbg-root')).toBeNull()
  })
})

describe('helpers', () => {
  it('detects media types from URLs', () => {
    expect(detectType({ src: 'photo.jpeg' })).toBe('image')
    expect(detectType({ src: 'clip.mp4' })).toBe('video')
    expect(detectType({ src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })).toBe('iframe')
    expect(detectType({ src: 'https://vimeo.com/123456' })).toBe('iframe')
    expect(detectType({ src: 'unknown', type: 'html', html: '<p>hi</p>' })).toBe('html')
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
