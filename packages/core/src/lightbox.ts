import { Emitter } from './events'
import { el, button } from './dom'
import { icons } from './icons'
import { clamp, detectType, getFocusable, toEmbedUrl } from './utils'
import type { LightboxEventMap, LightboxItem, LightboxOptions } from './types'

type ResolvedOptions = Required<Omit<LightboxOptions, 'container' | 'className'>> & {
  container?: HTMLElement
  className: string
}

const DEFAULTS = {
  startIndex: 0,
  loop: true,
  zoom: true,
  maxZoom: 4,
  doubleTapZoom: 2.5,
  wheelZoom: true,
  swipe: true,
  swipeToClose: true,
  keyboard: true,
  counter: true,
  captions: true,
  captionHTML: false,
  thumbnails: true,
  fullscreen: true,
  slideshow: true,
  slideshowDelay: 4000,
  download: false,
  closeOnBackdrop: true,
  preload: 2,
  animation: 'zoom' as const,
  className: '',
}

const SWIPE_START_PX = 8
const NAV_MS = 320
const CLOSE_MS = 280
const DOUBLE_TAP_MS = 320
const DOUBLE_TAP_PX = 40

type Gesture = 'idle' | 'pending' | 'swipe' | 'pan' | 'vclose' | 'pinch'

interface TracePoint {
  x: number
  y: number
  t: number
}

export class Lightbox extends Emitter<LightboxEventMap> {
  static readonly version = '0.1.0'

  private options: ResolvedOptions
  private items: LightboxItem[]

  private _index = 0
  private _isOpen = false
  private navigating = false
  private uiHidden = false

  // zoom / pan state of the current slide (images only)
  private scaleValue = 1
  private tx = 0
  private ty = 0
  private baseW = 0
  private baseH = 0

  // DOM
  private root: HTMLElement | null = null
  private stage!: HTMLElement
  private track!: HTMLElement
  private slides: HTMLElement[] = []
  private contentEl: HTMLElement | null = null
  private counterEl!: HTMLElement
  private captionEl!: HTMLElement
  private thumbsEl!: HTMLElement
  private prevBtn!: HTMLButtonElement
  private nextBtn!: HTMLButtonElement
  private closeBtn!: HTMLButtonElement
  private zoomInBtn!: HTMLButtonElement
  private zoomOutBtn!: HTMLButtonElement
  private slideshowBtn!: HTMLButtonElement
  private fullscreenBtn!: HTMLButtonElement
  private downloadLink!: HTMLAnchorElement

  // gestures
  private pointers = new Map<number, { x: number; y: number }>()
  private gesture: Gesture = 'idle'
  private start = { x: 0, y: 0, tx: 0, ty: 0, scale: 1, dist: 0, midX: 0, midY: 0 }
  private trace: TracePoint[] = []
  private lastTap = { t: 0, x: 0, y: 0 }
  private tapTimer: ReturnType<typeof setTimeout> | null = null

  private slideshowTimer: ReturnType<typeof setInterval> | null = null
  private closeTimer: ReturnType<typeof setTimeout> | null = null
  private navTimer: ReturnType<typeof setTimeout> | null = null

  private previousFocus: HTMLElement | null = null
  private bodyOverflow = ''
  private bodyPaddingRight = ''

  private onKeyDown = (e: KeyboardEvent): void => this.handleKey(e)
  private onResize = (): void => this.handleResize()
  private onFullscreenChange = (): void => this.handleFullscreenChange()

  constructor(options: LightboxOptions) {
    super()
    const { items, ...rest } = options
    this.items = items.slice()
    this.options = { ...DEFAULTS, items: this.items, ...rest } as ResolvedOptions
  }

  // ---------------------------------------------------------------- getters

  get isOpen(): boolean {
    return this._isOpen
  }

  get index(): number {
    return this._index
  }

  get length(): number {
    return this.items.length
  }

  get scale(): number {
    return this.scaleValue
  }

  get currentItem(): LightboxItem | undefined {
    return this.items[this._index]
  }

  get isSlideshowRunning(): boolean {
    return this.slideshowTimer !== null
  }

  // ------------------------------------------------------------- public API

  open(index?: number): void {
    if (this._isOpen || typeof document === 'undefined') return
    if (this.items.length === 0) return
    if (this.closeTimer) {
      clearTimeout(this.closeTimer)
      this.closeTimer = null
      this.teardown()
    }
    this._index = clamp(index ?? this.options.startIndex, 0, this.items.length - 1)
    this._isOpen = true
    this.previousFocus = (document.activeElement as HTMLElement) ?? null
    this.lockScroll()
    this.buildDOM()
    this.renderSlides(true)
    this.renderThumbnails()
    this.updateUI()
    document.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('resize', this.onResize)
    document.addEventListener('fullscreenchange', this.onFullscreenChange)
    requestAnimationFrame(() => this.root?.classList.add('lbg-open'))
    this.closeBtn.focus({ preventScroll: true })
    this.emit('open', this._index)
    this.preloadNeighbours()
  }

  close(): void {
    if (!this._isOpen || !this.root) return
    this._isOpen = false
    this.stopSlideshow()
    if (document.fullscreenElement === this.root) {
      document.exitFullscreen?.().catch(() => {})
    }
    this.emit('close')
    this.root.classList.add('lbg-closing')
    this.closeTimer = setTimeout(() => {
      this.closeTimer = null
      this.teardown()
    }, CLOSE_MS)
  }

  destroy(): void {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer)
      this.closeTimer = null
    }
    if (this._isOpen) {
      this._isOpen = false
      this.stopSlideshow()
    }
    this.teardown()
    this.removeAllListeners()
  }

  next(): void {
    this.userNavigate(1)
  }

  prev(): void {
    this.userNavigate(-1)
  }

  goTo(index: number): void {
    const target = clamp(index, 0, this.items.length - 1)
    if (target === this._index) return
    const diff = target - this._index
    if (this._isOpen && Math.abs(diff) === 1) {
      this.navigate(diff as 1 | -1)
      return
    }
    this._index = target
    if (this._isOpen) {
      this.resetZoomState()
      this.renderSlides(false)
      this.updateUI()
      this.preloadNeighbours()
    }
    this.emit('change', this._index, this.items[this._index])
  }

  setItems(items: LightboxItem[]): void {
    this.items = items.slice()
    this.options.items = this.items
    if (!this._isOpen) return
    if (this.items.length === 0) {
      this.close()
      return
    }
    this._index = clamp(this._index, 0, this.items.length - 1)
    this.resetZoomState()
    this.renderSlides(false)
    this.renderThumbnails()
    this.updateUI()
  }

  zoomIn(): void {
    this.zoomAtPoint(this.scaleValue * 1.5, null, true)
  }

  zoomOut(): void {
    this.zoomAtPoint(this.scaleValue / 1.5, null, true)
  }

  resetZoom(): void {
    this.zoomAtPoint(1, null, true)
  }

  toggleSlideshow(): void {
    if (this.slideshowTimer) this.stopSlideshow()
    else this.startSlideshow()
  }

  startSlideshow(): void {
    if (!this._isOpen || this.slideshowTimer || this.items.length < 2) return
    this.slideshowTimer = setInterval(() => {
      if (this.canGo(1)) this.navigate(1)
      else this.stopSlideshow()
    }, this.options.slideshowDelay)
    this.root?.classList.add('lbg-playing')
    this.updateSlideshowButton()
    this.emit('slideshow:start')
  }

  stopSlideshow(): void {
    if (!this.slideshowTimer) return
    clearInterval(this.slideshowTimer)
    this.slideshowTimer = null
    this.root?.classList.remove('lbg-playing')
    this.updateSlideshowButton()
    this.emit('slideshow:stop')
  }

  toggleFullscreen(): void {
    if (!this.root) return
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {})
    } else {
      this.root.requestFullscreen?.().catch(() => {})
    }
  }

  // ------------------------------------------------------------ DOM build

  private buildDOM(): void {
    const root = el('div', 'lbg-root')
    if (this.options.className) root.classList.add(...this.options.className.split(/\s+/))
    if (this.options.animation !== 'none') root.classList.add(`lbg-anim-${this.options.animation}`)
    root.setAttribute('role', 'dialog')
    root.setAttribute('aria-modal', 'true')
    root.setAttribute('aria-label', 'Media gallery')
    root.tabIndex = -1
    this.root = root

    el('div', 'lbg-backdrop', root)

    // stage + slide track
    this.stage = el('div', 'lbg-stage', root)
    this.track = el('div', 'lbg-track', this.stage)
    this.slides = [0, 1, 2].map((i) => {
      const slide = el('div', 'lbg-slide', this.track)
      slide.style.left = `${i * 100}%`
      return slide
    })

    // UI chrome
    const ui = el('div', 'lbg-ui', root)
    const toolbar = el('div', 'lbg-toolbar', ui)
    this.counterEl = el('div', 'lbg-counter', toolbar)
    this.counterEl.setAttribute('aria-live', 'polite')
    const buttons = el('div', 'lbg-toolbar-group', toolbar)

    this.slideshowBtn = button('lbg-slideshow', 'Start slideshow', icons.play, buttons)
    this.slideshowBtn.addEventListener('click', () => this.toggleSlideshow())

    this.zoomOutBtn = button('lbg-zoom-out', 'Zoom out', icons.zoomOut, buttons)
    this.zoomOutBtn.addEventListener('click', () => this.zoomOut())
    this.zoomInBtn = button('lbg-zoom-in', 'Zoom in', icons.zoomIn, buttons)
    this.zoomInBtn.addEventListener('click', () => this.zoomIn())

    this.downloadLink = el('a', 'lbg-btn lbg-download', buttons)
    this.downloadLink.setAttribute('aria-label', 'Download')
    this.downloadLink.title = 'Download'
    this.downloadLink.innerHTML = icons.download
    this.downloadLink.setAttribute('download', '')
    this.downloadLink.target = '_blank'
    this.downloadLink.rel = 'noopener'

    this.fullscreenBtn = button('lbg-fullscreen', 'Toggle fullscreen', icons.expand, buttons)
    this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen())

    this.closeBtn = button('lbg-close', 'Close gallery', icons.close, buttons)
    this.closeBtn.addEventListener('click', () => this.close())

    this.prevBtn = button('lbg-nav lbg-nav-prev', 'Previous slide', icons.prev, ui)
    this.prevBtn.addEventListener('click', () => this.prev())
    this.nextBtn = button('lbg-nav lbg-nav-next', 'Next slide', icons.next, ui)
    this.nextBtn.addEventListener('click', () => this.next())

    this.captionEl = el('div', 'lbg-caption', ui)
    this.thumbsEl = el('div', 'lbg-thumbs', ui)
    this.thumbsEl.setAttribute('role', 'tablist')
    this.thumbsEl.setAttribute('aria-label', 'Thumbnails')

    // feature toggles
    if (!this.options.counter) this.counterEl.classList.add('lbg-hidden')
    if (!this.options.slideshow || this.items.length < 2)
      this.slideshowBtn.classList.add('lbg-hidden')
    if (!this.options.download) this.downloadLink.classList.add('lbg-hidden')
    if (!this.options.fullscreen || typeof root.requestFullscreen !== 'function')
      this.fullscreenBtn.classList.add('lbg-hidden')
    if (!this.options.thumbnails || this.items.length < 2) this.thumbsEl.classList.add('lbg-hidden')

    // gestures
    this.stage.addEventListener('pointerdown', this.onPointerDown)
    this.stage.addEventListener('pointermove', this.onPointerMove)
    this.stage.addEventListener('pointerup', this.onPointerUp)
    this.stage.addEventListener('pointercancel', this.onPointerUp)
    this.stage.addEventListener('wheel', this.onWheel, { passive: false })
    ;(this.options.container ?? document.body).appendChild(root)
  }

  private teardown(): void {
    if (!this.root) return
    this.pauseVideos()
    document.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('resize', this.onResize)
    document.removeEventListener('fullscreenchange', this.onFullscreenChange)
    if (this.navTimer) {
      clearTimeout(this.navTimer)
      this.navTimer = null
    }
    if (this.tapTimer) {
      clearTimeout(this.tapTimer)
      this.tapTimer = null
    }
    this.root.remove()
    this.root = null
    this.contentEl = null
    this.slides = []
    this.pointers.clear()
    this.gesture = 'idle'
    this.navigating = false
    this.uiHidden = false
    this.resetZoomState()
    this.unlockScroll()
    this.previousFocus?.focus?.({ preventScroll: true })
    this.previousFocus = null
  }

  private lockScroll(): void {
    const body = document.body
    this.bodyOverflow = body.style.overflow
    this.bodyPaddingRight = body.style.paddingRight
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    if (scrollbar > 0) {
      const current = parseFloat(getComputedStyle(body).paddingRight) || 0
      body.style.paddingRight = `${current + scrollbar}px`
    }
    body.style.overflow = 'hidden'
  }

  private unlockScroll(): void {
    document.body.style.overflow = this.bodyOverflow
    document.body.style.paddingRight = this.bodyPaddingRight
  }

  // -------------------------------------------------------------- slides

  private wrapIndex(index: number): number | null {
    const len = this.items.length
    if (index >= 0 && index < len) return index
    if (!this.options.loop || len < 2) return null
    return ((index % len) + len) % len
  }

  private canGo(dir: 1 | -1): boolean {
    return this.wrapIndex(this._index + dir) !== null
  }

  private pauseVideos(): void {
    this.root?.querySelectorAll('video').forEach((v) => v.pause())
  }

  private renderSlides(animateIn: boolean): void {
    this.pauseVideos()
    this.contentEl = null
    for (let slot = -1; slot <= 1; slot++) {
      const slide = this.slides[slot + 1]
      slide.innerHTML = ''
      slide.style.transform = ''
      const idx = this.wrapIndex(this._index + slot)
      if (idx === null) continue
      this.buildSlideContent(slide, idx, slot === 0, animateIn && slot === 0)
    }
    this.setTrackOffset(0, false)
  }

  private buildSlideContent(
    slide: HTMLElement,
    index: number,
    isCurrent: boolean,
    animateIn: boolean,
  ): void {
    const item = this.items[index]
    const type = detectType(item)
    const inner = el('div', 'lbg-slide-inner', slide)
    if (animateIn) {
      inner.classList.add('lbg-enter')
      inner.addEventListener('animationend', () => inner.classList.remove('lbg-enter'), {
        once: true,
      })
    }

    if (type === 'image') {
      const spinner = el('div', 'lbg-spinner', inner)
      const img = el('img', 'lbg-content lbg-image', inner)
      img.draggable = false
      img.decoding = 'async'
      if (item.alt) img.alt = item.alt
      else if (item.caption) img.alt = item.caption
      else img.alt = ''
      if (item.srcset) img.srcset = item.srcset
      if (item.sizes) img.sizes = item.sizes
      img.addEventListener('load', () => {
        spinner.remove()
        img.classList.add('lbg-loaded')
        if (this.contentEl === img) this.measureBase()
      })
      img.addEventListener('error', () => {
        spinner.remove()
        img.remove()
        const errBox = el('div', 'lbg-error', inner)
        errBox.innerHTML = `${icons.error}<span>Could not load this media</span>`
        this.emit('error', item, index)
      })
      img.src = item.src
      if (isCurrent) this.contentEl = img
      if (img.complete && img.naturalWidth > 0) {
        spinner.remove()
        img.classList.add('lbg-loaded')
        if (isCurrent) this.measureBase()
      }
    } else if (type === 'video') {
      const wrap = el('div', 'lbg-content lbg-media lbg-video-wrap', inner)
      const video = el('video', 'lbg-video', wrap)
      video.controls = true
      video.playsInline = true
      video.preload = 'metadata'
      if (item.poster) video.poster = item.poster
      video.src = item.src
    } else if (type === 'iframe') {
      const wrap = el('div', 'lbg-content lbg-media lbg-iframe-wrap', inner)
      const iframe = el('iframe', 'lbg-iframe', wrap)
      iframe.src = toEmbedUrl(item.src)
      iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media'
      iframe.setAttribute('allowfullscreen', '')
      iframe.setAttribute('frameborder', '0')
      iframe.title = item.caption ?? 'Embedded media'
    } else {
      const wrap = el('div', 'lbg-content lbg-media lbg-html', inner)
      wrap.innerHTML = item.html ?? ''
    }
  }

  private measureBase(): void {
    if (!this.contentEl) return
    this.baseW = this.contentEl.offsetWidth
    this.baseH = this.contentEl.offsetHeight
  }

  private preloadNeighbours(): void {
    for (let d = 1; d <= this.options.preload; d++) {
      for (const dir of [1, -1] as const) {
        const idx = this.wrapIndex(this._index + dir * d)
        if (idx === null) continue
        const item = this.items[idx]
        if (detectType(item) === 'image') {
          const img = new Image()
          if (item.srcset) img.srcset = item.srcset
          img.src = item.src
        }
      }
    }
  }

  // ----------------------------------------------------------- navigation

  private userNavigate(dir: 1 | -1): void {
    this.stopSlideshow()
    this.navigate(dir)
  }

  private navigate(dir: 1 | -1): void {
    if (!this._isOpen || this.navigating || !this.canGo(dir)) return
    this.navigating = true
    this.setTrackOffset(0, false)
    // force reflow so the transition below always starts from the resting position
    void this.track.offsetWidth
    this.track.classList.add('lbg-track-anim')
    this.track.style.transform = `translate3d(${-100 - dir * 100}%, 0, 0)`
    const finish = (): void => {
      if (this.navTimer) {
        clearTimeout(this.navTimer)
        this.navTimer = null
      }
      this.track.classList.remove('lbg-track-anim')
      this._index = this.wrapIndex(this._index + dir) as number
      this.resetZoomState()
      this.renderSlides(false)
      this.updateUI()
      this.navigating = false
      this.emit('change', this._index, this.items[this._index])
      this.preloadNeighbours()
    }
    this.navTimer = setTimeout(finish, NAV_MS)
  }

  private setTrackOffset(px: number, animate: boolean): void {
    this.track.classList.toggle('lbg-track-anim', animate)
    this.track.style.transform = px === 0 && !animate
      ? 'translate3d(-100%, 0, 0)'
      : `translate3d(calc(-100% + ${px}px), 0, 0)`
  }

  // ------------------------------------------------------------------- UI

  private updateUI(): void {
    if (!this.root) return
    const item = this.items[this._index]
    const type = detectType(item)

    this.counterEl.textContent = `${this._index + 1} / ${this.items.length}`

    if (this.options.captions && item.caption) {
      if (this.options.captionHTML) this.captionEl.innerHTML = item.caption
      else this.captionEl.textContent = item.caption
      this.captionEl.classList.remove('lbg-hidden')
    } else {
      this.captionEl.classList.add('lbg-hidden')
      this.captionEl.textContent = ''
    }

    const zoomable = this.options.zoom && type === 'image'
    this.zoomInBtn.classList.toggle('lbg-hidden', !zoomable)
    this.zoomOutBtn.classList.toggle('lbg-hidden', !zoomable)
    this.zoomInBtn.disabled = this.scaleValue >= this.options.maxZoom
    this.zoomOutBtn.disabled = this.scaleValue <= 1

    if (this.options.download) {
      this.downloadLink.href = item.downloadUrl ?? item.src
      if (item.downloadFilename) this.downloadLink.setAttribute('download', item.downloadFilename)
      else this.downloadLink.setAttribute('download', '')
    }

    const showNav = this.items.length > 1
    this.prevBtn.classList.toggle('lbg-hidden', !showNav)
    this.nextBtn.classList.toggle('lbg-hidden', !showNav)
    this.prevBtn.disabled = !this.canGo(-1)
    this.nextBtn.disabled = !this.canGo(1)

    this.thumbsEl.querySelectorAll('.lbg-thumb').forEach((thumbEl, i) => {
      const active = i === this._index
      thumbEl.classList.toggle('lbg-thumb-active', active)
      thumbEl.setAttribute('aria-selected', String(active))
      if (active) {
        ;(thumbEl as HTMLElement).scrollIntoView?.({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        })
      }
    })
  }

  private renderThumbnails(): void {
    this.thumbsEl.innerHTML = ''
    if (!this.options.thumbnails || this.items.length < 2) return
    this.items.forEach((item, i) => {
      const thumb = el('button', 'lbg-thumb', this.thumbsEl)
      thumb.type = 'button'
      thumb.setAttribute('role', 'tab')
      thumb.setAttribute('aria-label', item.caption ?? `Slide ${i + 1}`)
      const type = detectType(item)
      const src = item.thumb ?? (type === 'image' ? item.src : item.poster)
      if (src) {
        const img = el('img', 'lbg-thumb-img', thumb)
        img.loading = 'lazy'
        img.alt = ''
        img.draggable = false
        img.src = src
      } else {
        thumb.classList.add('lbg-thumb-placeholder')
        thumb.innerHTML = icons.play
      }
      thumb.addEventListener('click', () => {
        this.stopSlideshow()
        this.goTo(i)
      })
    })
  }

  private updateSlideshowButton(): void {
    if (!this.root) return
    const running = this.slideshowTimer !== null
    this.slideshowBtn.innerHTML = running ? icons.pause : icons.play
    const label = running ? 'Pause slideshow' : 'Start slideshow'
    this.slideshowBtn.setAttribute('aria-label', label)
    this.slideshowBtn.title = label
  }

  private toggleUIVisibility(): void {
    this.uiHidden = !this.uiHidden
    this.root?.classList.toggle('lbg-ui-hidden', this.uiHidden)
  }

  private handleFullscreenChange(): void {
    const active = document.fullscreenElement === this.root
    this.fullscreenBtn.innerHTML = active ? icons.compress : icons.expand
    this.emit(active ? 'fullscreen:enter' : 'fullscreen:exit')
  }

  private handleResize(): void {
    if (!this._isOpen) return
    this.measureBase()
    if (this.scaleValue !== 1) this.zoomAtPoint(this.scaleValue, null, false)
  }

  // ------------------------------------------------------------- keyboard

  private handleKey(e: KeyboardEvent): void {
    if (!this._isOpen || !this.root) return
    switch (e.key) {
      case 'Escape':
        if (this.scaleValue > 1) this.resetZoom()
        else this.close()
        break
      case 'ArrowLeft':
        if (this.options.keyboard) this.prev()
        break
      case 'ArrowRight':
        if (this.options.keyboard) this.next()
        break
      case '+':
      case '=':
        if (this.options.keyboard && this.options.zoom) this.zoomIn()
        break
      case '-':
        if (this.options.keyboard && this.options.zoom) this.zoomOut()
        break
      case '0':
        if (this.options.keyboard && this.options.zoom) this.resetZoom()
        break
      case 'f':
      case 'F':
        if (this.options.keyboard && this.options.fullscreen) this.toggleFullscreen()
        break
      case 'Tab': {
        const focusable = getFocusable(this.root)
        if (focusable.length === 0) {
          e.preventDefault()
          break
        }
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        const active = document.activeElement
        if (e.shiftKey && (active === first || !this.root.contains(active))) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && (active === last || !this.root.contains(active))) {
          e.preventDefault()
          first.focus()
        }
        break
      }
    }
  }

  // ---------------------------------------------------------------- zoom

  private get currentIsImage(): boolean {
    const item = this.items[this._index]
    return !!item && detectType(item) === 'image'
  }

  private resetZoomState(): void {
    this.scaleValue = 1
    this.tx = 0
    this.ty = 0
    if (this.contentEl) {
      this.contentEl.style.transition = ''
      this.contentEl.style.transform = ''
    }
  }

  private clampPan(tx: number, ty: number, scale: number): [number, number] {
    const rect = this.stage.getBoundingClientRect()
    const maxX = Math.max(0, (this.baseW * scale - rect.width) / 2)
    const maxY = Math.max(0, (this.baseH * scale - rect.height) / 2)
    return [clamp(tx, -maxX, maxX), clamp(ty, -maxY, maxY)]
  }

  /**
   * Zoom to `scale`, keeping the point at client coordinates anchored.
   * `point` null means anchor to the stage centre.
   */
  private zoomAtPoint(
    scale: number,
    point: { x: number; y: number } | null,
    animate: boolean,
  ): void {
    if (!this._isOpen || !this.contentEl || !this.currentIsImage || !this.options.zoom) return
    if (this.baseW === 0) this.measureBase()
    const next = clamp(scale, 1, this.options.maxZoom)
    const rect = this.stage.getBoundingClientRect()
    const px = point ? point.x - rect.left - rect.width / 2 : 0
    const py = point ? point.y - rect.top - rect.height / 2 : 0
    const factor = next / this.scaleValue
    let tx = px - (px - this.tx) * factor
    let ty = py - (py - this.ty) * factor
    if (next === 1) {
      tx = 0
      ty = 0
    }
    ;[tx, ty] = this.clampPan(tx, ty, next)
    this.applyTransform(next, tx, ty, animate)
  }

  private applyTransform(scale: number, tx: number, ty: number, animate: boolean): void {
    if (!this.contentEl) return
    const changed = scale !== this.scaleValue
    this.scaleValue = scale
    this.tx = tx
    this.ty = ty
    this.contentEl.style.transition = animate ? 'transform 0.25s ease' : 'none'
    this.contentEl.style.transform =
      scale === 1 && tx === 0 && ty === 0
        ? ''
        : `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`
    this.contentEl.classList.toggle('lbg-zoomed', scale > 1)
    this.zoomInBtn.disabled = scale >= this.options.maxZoom
    this.zoomOutBtn.disabled = scale <= 1
    if (changed) this.emit('zoom', scale)
  }

  // ------------------------------------------------------------- gestures

  private onPointerDown = (e: PointerEvent): void => {
    const target = e.target as HTMLElement
    if (target.closest('video, iframe, .lbg-html, .lbg-error')) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    this.stage.setPointerCapture?.(e.pointerId)
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (this.pointers.size === 1) {
      this.gesture = 'pending'
      this.start = {
        x: e.clientX,
        y: e.clientY,
        tx: this.tx,
        ty: this.ty,
        scale: this.scaleValue,
        dist: 0,
        midX: 0,
        midY: 0,
      }
      this.trace = [{ x: e.clientX, y: e.clientY, t: Date.now() }]
    } else if (this.pointers.size === 2 && this.options.zoom && this.currentIsImage) {
      const [a, b] = [...this.pointers.values()]
      this.setTrackOffset(0, false)
      this.gesture = 'pinch'
      this.start = {
        x: 0,
        y: 0,
        tx: this.tx,
        ty: this.ty,
        scale: this.scaleValue,
        dist: Math.hypot(a.x - b.x, a.y - b.y),
        midX: (a.x + b.x) / 2,
        midY: (a.y + b.y) / 2,
      }
      if (this.baseW === 0) this.measureBase()
    }
    if (e.pointerType !== 'mouse') e.preventDefault()
  }

  private onPointerMove = (e: PointerEvent): void => {
    if (!this.pointers.has(e.pointerId)) return
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (this.gesture === 'pinch') {
      this.handlePinch()
      return
    }

    const dx = e.clientX - this.start.x
    const dy = e.clientY - this.start.y
    this.trace.push({ x: e.clientX, y: e.clientY, t: Date.now() })
    if (this.trace.length > 6) this.trace.shift()

    if (this.gesture === 'pending') {
      if (Math.hypot(dx, dy) < SWIPE_START_PX) return
      if (this.scaleValue > 1) {
        this.gesture = 'pan'
      } else if (Math.abs(dx) >= Math.abs(dy) && this.options.swipe) {
        this.gesture = 'swipe'
        this.stopSlideshow()
      } else if (this.options.swipeToClose) {
        this.gesture = 'vclose'
      } else if (this.options.swipe) {
        this.gesture = 'swipe'
        this.stopSlideshow()
      } else {
        return
      }
    }

    if (this.gesture === 'pan') {
      const [tx, ty] = this.clampPan(this.start.tx + dx, this.start.ty + dy, this.scaleValue)
      this.applyTransform(this.scaleValue, tx, ty, false)
    } else if (this.gesture === 'swipe') {
      let offset = dx
      const dir: 1 | -1 = dx < 0 ? 1 : -1
      if (!this.canGo(dir)) offset = dx * 0.3
      this.setTrackOffset(offset, false)
    } else if (this.gesture === 'vclose') {
      const slide = this.slides[1]
      const progress = Math.min(Math.abs(dy) / 240, 0.85)
      slide.style.transform = `translate3d(0, ${dy}px, 0) scale(${1 - progress * 0.15})`
      if (this.root) this.root.style.opacity = String(1 - progress)
    }
  }

  private onPointerUp = (e: PointerEvent): void => {
    if (!this.pointers.has(e.pointerId)) return
    this.pointers.delete(e.pointerId)

    if (this.gesture === 'pinch') {
      if (this.pointers.size < 2) {
        if (this.scaleValue <= 1.04) this.zoomAtPoint(1, null, true)
        this.gesture = 'idle'
        this.pointers.clear()
      }
      return
    }

    const gesture = this.gesture
    this.gesture = 'idle'
    if (gesture === 'idle') return

    const dx = e.clientX - this.start.x
    const dy = e.clientY - this.start.y
    const [vx, vy] = this.velocity()

    if (gesture === 'swipe') {
      const rect = this.stage.getBoundingClientRect()
      const threshold = Math.min(rect.width * 0.22, 140)
      const dir: 1 | -1 = dx < 0 ? 1 : -1
      if ((Math.abs(dx) > threshold || Math.abs(vx) > 0.45) && this.canGo(dir)) {
        this.navigate(dir)
      } else {
        this.setTrackOffset(0, true)
        if (this.navTimer) clearTimeout(this.navTimer)
        this.navTimer = setTimeout(() => this.setTrackOffset(0, false), NAV_MS)
      }
    } else if (gesture === 'vclose') {
      if (Math.abs(dy) > 110 || Math.abs(vy) > 0.5) {
        this.close()
      } else {
        const slide = this.slides[1]
        slide.style.transition = `transform ${NAV_MS}ms ease`
        slide.style.transform = ''
        setTimeout(() => {
          slide.style.transition = ''
        }, NAV_MS)
        if (this.root) this.root.style.opacity = ''
      }
    } else if (gesture === 'pending' && e.pointerType !== undefined) {
      this.handleTap(e)
    }
  }

  private velocity(): [number, number] {
    if (this.trace.length < 2) return [0, 0]
    const first = this.trace[0]
    const last = this.trace[this.trace.length - 1]
    const dt = Math.max(last.t - first.t, 1)
    return [(last.x - first.x) / dt, (last.y - first.y) / dt]
  }

  private handlePinch(): void {
    const [a, b] = [...this.pointers.values()]
    if (!a || !b) return
    const dist = Math.hypot(a.x - b.x, a.y - b.y)
    const midX = (a.x + b.x) / 2
    const midY = (a.y + b.y) / 2
    const next = clamp(
      this.start.scale * (dist / Math.max(this.start.dist, 1)),
      1,
      this.options.maxZoom,
    )
    const rect = this.stage.getBoundingClientRect()
    const px = this.start.midX - rect.left - rect.width / 2
    const py = this.start.midY - rect.top - rect.height / 2
    const factor = next / this.start.scale
    let tx = px - (px - this.start.tx) * factor + (midX - this.start.midX)
    let ty = py - (py - this.start.ty) * factor + (midY - this.start.midY)
    ;[tx, ty] = this.clampPan(tx, ty, next)
    this.applyTransform(next, tx, ty, false)
  }

  private handleTap(e: PointerEvent): void {
    const now = Date.now()
    const isDouble =
      now - this.lastTap.t < DOUBLE_TAP_MS &&
      Math.hypot(e.clientX - this.lastTap.x, e.clientY - this.lastTap.y) < DOUBLE_TAP_PX

    if (isDouble) {
      this.lastTap = { t: 0, x: 0, y: 0 }
      if (this.tapTimer) {
        clearTimeout(this.tapTimer)
        this.tapTimer = null
      }
      if (this.options.zoom && this.currentIsImage) {
        if (this.scaleValue > 1) this.zoomAtPoint(1, null, true)
        else this.zoomAtPoint(this.options.doubleTapZoom, { x: e.clientX, y: e.clientY }, true)
      }
      return
    }

    this.lastTap = { t: now, x: e.clientX, y: e.clientY }
    const target = e.target as HTMLElement
    const onContent = !!target.closest('.lbg-content')
    const zoomable = this.options.zoom && this.currentIsImage
    this.tapTimer = setTimeout(
      () => {
        this.tapTimer = null
        if (onContent) this.toggleUIVisibility()
        else if (this.options.closeOnBackdrop) this.close()
      },
      zoomable ? DOUBLE_TAP_MS : 0,
    )
  }

  private onWheel = (e: WheelEvent): void => {
    if (!this.options.zoom || !this.options.wheelZoom || !this.currentIsImage) return
    e.preventDefault()
    const factor = Math.exp(-e.deltaY * 0.002)
    this.zoomAtPoint(this.scaleValue * factor, { x: e.clientX, y: e.clientY }, false)
  }
}
