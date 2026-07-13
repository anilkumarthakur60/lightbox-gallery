import { Emitter } from './events'
import { el, button } from './dom'
import { icons } from './icons'
import { clamp, detectType, getFocusable, toEmbedUrl } from './utils'
import type {
  LightboxEventMap,
  LightboxItem,
  LightboxLabels,
  LightboxOptions,
  LightboxToolbarButton,
} from './types'

type ResolvedOptions = Required<
  Omit<
    LightboxOptions,
    'container' | 'className' | 'animateFrom' | 'labels' | 'toolbarButtons' | 'rtl'
  >
> & {
  container?: HTMLElement
  className: string
  animateFrom?: (index: number) => HTMLElement | null | undefined
  labels?: Partial<LightboxLabels>
  toolbarButtons?: LightboxToolbarButton[]
  rtl?: boolean
}

export const DEFAULT_LABELS: LightboxLabels = {
  dialog: 'Media gallery',
  close: 'Close gallery',
  previous: 'Previous slide',
  next: 'Next slide',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  fullscreen: 'Toggle fullscreen',
  slideshowStart: 'Start slideshow',
  slideshowPause: 'Pause slideshow',
  download: 'Download',
  share: 'Share',
  rotateLeft: 'Rotate left',
  rotateRight: 'Rotate right',
  flipHorizontal: 'Flip horizontal',
  flipVertical: 'Flip vertical',
  thumbnails: 'Thumbnails',
  slide: 'Slide',
  error: 'Could not load this media',
  linkCopied: 'Link copied',
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
  pinchToClose: true,
  momentum: true,
  keyboard: true,
  counter: true,
  captions: true,
  captionHTML: false,
  thumbnails: true,
  fullscreen: true,
  slideshow: true,
  slideshowDelay: 4000,
  slideshowProgress: true,
  slideshowPauseOnHover: true,
  download: false,
  share: false,
  rotate: false,
  hash: false as boolean | string,
  inline: false,
  closeOnBackdrop: true,
  preload: 2,
  animation: 'zoom' as const,
  className: '',
}

const SWIPE_START_PX = 8
const NAV_MS = 320
const CLOSE_MS = 280
const FLIP_MS = 320
const DOUBLE_TAP_MS = 320
const DOUBLE_TAP_PX = 40
const PINCH_MIN_SCALE = 0.4
const PINCH_CLOSE_SCALE = 0.75

// 'none' = movement consumed but intentionally ignored (e.g. a sloppy mouse
// click that drifted past the tap threshold) — must not become a tap on release
type Gesture = 'idle' | 'pending' | 'swipe' | 'pan' | 'vclose' | 'pinch' | 'none'

interface TracePoint {
  x: number
  y: number
  t: number
}

export class Lightbox extends Emitter<LightboxEventMap> {
  static readonly version = '0.1.0'

  /** Parse a slide index from the current URL hash (`#gallery=3` → 2). */
  static parseHash(key = 'gallery'): number | null {
    if (typeof location === 'undefined') return null
    const match = location.hash.match(new RegExp(`[#&]${key}=(\\d+)`))
    return match ? Math.max(0, parseInt(match[1], 10) - 1) : null
  }

  private options: ResolvedOptions
  private labels: LightboxLabels
  private items: LightboxItem[]

  private _index = 0
  private _isOpen = false
  private navigating = false
  private uiHidden = false
  private rtlActive = false

  // zoom / pan / rotate state of the current slide (images only)
  private scaleValue = 1
  private tx = 0
  private ty = 0
  private rotation = 0
  private flippedX = false
  private flippedY = false
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
  private progressFill: HTMLElement | null = null
  private toastEl: HTMLElement | null = null
  private prevBtn!: HTMLButtonElement
  private nextBtn!: HTMLButtonElement
  private closeBtn!: HTMLButtonElement
  private zoomInBtn!: HTMLButtonElement
  private zoomOutBtn!: HTMLButtonElement
  private rotateLeftBtn!: HTMLButtonElement
  private rotateRightBtn!: HTMLButtonElement
  private flipHBtn!: HTMLButtonElement
  private flipVBtn!: HTMLButtonElement
  private shareBtn!: HTMLButtonElement
  private slideshowBtn!: HTMLButtonElement
  private fullscreenBtn!: HTMLButtonElement
  private downloadLink!: HTMLAnchorElement

  // gestures
  private pointers = new Map<number, { x: number; y: number }>()
  private gesture: Gesture = 'idle'
  private start = { x: 0, y: 0, tx: 0, ty: 0, scale: 1, dist: 0, midX: 0, midY: 0 }
  private trace: TracePoint[] = []
  // original pointerdown target — pointerup retargets to the stage once
  // setPointerCapture is active, so it cannot be used for hit-testing
  private downTarget: HTMLElement | null = null
  private lastTap = { t: 0, x: 0, y: 0 }
  private tapTimer: ReturnType<typeof setTimeout> | null = null
  private momentumRaf: number | null = null

  // slideshow
  private playing = false
  private suspended = false
  private advanceTimer: ReturnType<typeof setTimeout> | null = null
  private videoEndedCleanup: (() => void) | null = null

  // hash routing
  private pushedHash = false
  private ignoreNextPop = false

  private closeTimer: ReturnType<typeof setTimeout> | null = null
  private navTimer: ReturnType<typeof setTimeout> | null = null
  private toastTimer: ReturnType<typeof setTimeout> | null = null

  private endNotifiedLength = -1

  private previousFocus: HTMLElement | null = null
  private bodyOverflow = ''
  private bodyPaddingRight = ''
  private keyTarget: HTMLElement | Document | null = null

  private onKeyDown = (e: Event): void => this.handleKey(e as KeyboardEvent)
  private onResize = (): void => this.handleResize()
  private onFullscreenChange = (): void => this.handleFullscreenChange()
  private onPopState = (): void => {
    if (this.ignoreNextPop) {
      this.ignoreNextPop = false
      return
    }
    if (this._isOpen) {
      this.pushedHash = false
      this.close()
    }
  }

  constructor(options: LightboxOptions) {
    super()
    const { items, ...rest } = options
    this.items = items.slice()
    this.options = { ...DEFAULTS, items: this.items, ...rest } as ResolvedOptions
    this.labels = { ...DEFAULT_LABELS, ...this.options.labels }
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

  get rotationDegrees(): number {
    return this.rotation
  }

  get currentItem(): LightboxItem | undefined {
    return this.items[this._index]
  }

  get isSlideshowRunning(): boolean {
    return this.playing
  }

  private get inline(): boolean {
    return !!(this.options.inline && this.options.container)
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
    this.rtlActive = this.options.rtl ?? document.documentElement.dir === 'rtl'
    if (!this.inline) {
      this.previousFocus = (document.activeElement as HTMLElement) ?? null
      this.lockScroll()
    }
    this.buildDOM()
    const flipSource = this.flipSourceFor(this._index)
    this.renderSlides(!flipSource)
    this.renderThumbnails()
    this.updateUI()
    this.keyTarget = this.inline ? this.root : document
    this.keyTarget?.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('resize', this.onResize)
    document.addEventListener('fullscreenchange', this.onFullscreenChange)
    this.setupHash()
    requestAnimationFrame(() => this.root?.classList.add('lbg-open'))
    if (flipSource) this.runOpenFlip(flipSource)
    if (!this.inline) this.closeBtn.focus({ preventScroll: true })
    this.emit('open', this._index)
    this.preloadNeighbours()
  }

  close(): void {
    if (!this._isOpen || !this.root) return
    this._isOpen = false
    this.stopSlideshow()
    this.stopMomentum()
    if (document.fullscreenElement === this.root) {
      document.exitFullscreen?.().catch(() => {})
    }
    if (this.pushedHash) {
      this.pushedHash = false
      this.ignoreNextPop = true
      history.back()
    }
    // Run the close animation and schedule teardown BEFORE emitting `close`.
    // A listener may synchronously destroy this instance (e.g. a controlled
    // component unmounting on close, as Solid does), which nulls `this.root`;
    // doing DOM work first keeps close() re-entrancy-safe.
    this.runCloseFlip()
    this.root.classList.add('lbg-closing')
    if (!this.closeTimer) {
      this.closeTimer = setTimeout(() => {
        this.closeTimer = null
        this.teardown()
      }, CLOSE_MS)
    }
    this.emit('close')
  }

  destroy(): void {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer)
      this.closeTimer = null
    }
    if (this._isOpen) {
      this._isOpen = false
      this.stopSlideshow()
      if (this.pushedHash) {
        this.pushedHash = false
        this.ignoreNextPop = true
        history.back()
      }
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
      this.resetTransformState()
      this.renderSlides(false)
      this.updateUI()
      this.updateHash()
      this.preloadNeighbours()
    }
    this.emit('change', this._index, this.items[this._index])
  }

  setItems(items: LightboxItem[]): void {
    this.items = items.slice()
    this.options.items = this.items
    this.endNotifiedLength = -1
    if (!this._isOpen) return
    if (this.items.length === 0) {
      this.close()
      return
    }
    this._index = clamp(this._index, 0, this.items.length - 1)
    this.resetTransformState()
    this.renderSlides(false)
    this.renderThumbnails()
    this.updateUI()
  }

  /** Append items without re-rendering the current slide — for infinite galleries (see the `end-reached` event). */
  appendItems(items: LightboxItem[]): void {
    if (items.length === 0) return
    const nextSlotWasEmpty = this._isOpen && this.slides[2]?.childElementCount === 0
    this.items.push(...items)
    this.options.items = this.items
    if (!this._isOpen) return
    if (nextSlotWasEmpty) this.renderSlides(false)
    this.renderThumbnails()
    this.updateUI()
    this.preloadNeighbours()
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

  rotateLeft(): void {
    this.applyRotate(-90)
  }

  rotateRight(): void {
    this.applyRotate(90)
  }

  flipHorizontal(): void {
    if (!this.currentIsImage || !this.contentEl) return
    this.flippedX = !this.flippedX
    this.applyTransform(this.scaleValue, this.tx, this.ty, true)
    this.emit('flip', this.flippedX, this.flippedY)
  }

  flipVertical(): void {
    if (!this.currentIsImage || !this.contentEl) return
    this.flippedY = !this.flippedY
    this.applyTransform(this.scaleValue, this.tx, this.ty, true)
    this.emit('flip', this.flippedX, this.flippedY)
  }

  toggleSlideshow(): void {
    if (this.playing) this.stopSlideshow()
    else this.startSlideshow()
  }

  startSlideshow(): void {
    if (!this._isOpen || this.playing || this.items.length < 2) return
    this.playing = true
    this.suspended = false
    this.root?.classList.add('lbg-playing')
    this.updateSlideshowButton()
    this.emit('slideshow:start')
    this.scheduleAdvance()
  }

  stopSlideshow(): void {
    if (!this.playing) return
    this.playing = false
    this.suspended = false
    this.clearAdvance()
    this.hideProgress()
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

  async share(): Promise<void> {
    const item = this.items[this._index]
    if (!item) return
    let url = item.shareUrl ?? item.src
    try {
      url = this.pushedHash ? location.href : new URL(url, location.href).href
    } catch {
      /* keep raw url */
    }
    this.emit('share', item, this._index)
    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> }
    if (typeof nav.share === 'function') {
      await nav.share({ title: item.caption, url }).catch(() => {})
    } else if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url).catch(() => {})
      this.showToast(this.labels.linkCopied)
    }
  }

  // ------------------------------------------------------------ DOM build

  private buildDOM(): void {
    const root = el('div', 'lbg-root')
    if (this.options.className) root.classList.add(...this.options.className.split(/\s+/))
    if (this.options.animation !== 'none') root.classList.add(`lbg-anim-${this.options.animation}`)
    if (this.inline) root.classList.add('lbg-inline')
    if (this.rtlActive) root.classList.add('lbg-rtl')
    root.setAttribute('role', 'dialog')
    root.setAttribute('aria-modal', String(!this.inline))
    root.setAttribute('aria-label', this.labels.dialog)
    root.tabIndex = this.inline ? 0 : -1
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

    // slideshow progress bar
    const progress = el('div', 'lbg-progress', root)
    this.progressFill = el('div', 'lbg-progress-fill', progress)

    // UI chrome
    const ui = el('div', 'lbg-ui', root)
    const toolbar = el('div', 'lbg-toolbar', ui)
    this.counterEl = el('div', 'lbg-counter', toolbar)
    this.counterEl.setAttribute('aria-live', 'polite')
    const buttons = el('div', 'lbg-toolbar-group', toolbar)

    this.slideshowBtn = button('lbg-slideshow', this.labels.slideshowStart, icons.play, buttons)
    this.slideshowBtn.addEventListener('click', () => this.toggleSlideshow())

    this.rotateLeftBtn = button('lbg-rotate-left', this.labels.rotateLeft, icons.rotateLeft, buttons)
    this.rotateLeftBtn.addEventListener('click', () => this.rotateLeft())
    this.rotateRightBtn = button(
      'lbg-rotate-right',
      this.labels.rotateRight,
      icons.rotateRight,
      buttons,
    )
    this.rotateRightBtn.addEventListener('click', () => this.rotateRight())
    this.flipHBtn = button('lbg-flip-h', this.labels.flipHorizontal, icons.flipH, buttons)
    this.flipHBtn.addEventListener('click', () => this.flipHorizontal())
    this.flipVBtn = button('lbg-flip-v', this.labels.flipVertical, icons.flipV, buttons)
    this.flipVBtn.addEventListener('click', () => this.flipVertical())

    this.zoomOutBtn = button('lbg-zoom-out', this.labels.zoomOut, icons.zoomOut, buttons)
    this.zoomOutBtn.addEventListener('click', () => this.zoomOut())
    this.zoomInBtn = button('lbg-zoom-in', this.labels.zoomIn, icons.zoomIn, buttons)
    this.zoomInBtn.addEventListener('click', () => this.zoomIn())

    this.downloadLink = el('a', 'lbg-btn lbg-download', buttons)
    this.downloadLink.setAttribute('aria-label', this.labels.download)
    this.downloadLink.title = this.labels.download
    this.downloadLink.innerHTML = icons.download
    this.downloadLink.setAttribute('download', '')
    this.downloadLink.target = '_blank'
    this.downloadLink.rel = 'noopener'

    this.shareBtn = button('lbg-share', this.labels.share, icons.share, buttons)
    this.shareBtn.addEventListener('click', () => void this.share())

    this.fullscreenBtn = button('lbg-fullscreen', this.labels.fullscreen, icons.expand, buttons)
    this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen())

    for (const custom of this.options.toolbarButtons ?? []) {
      const btn = button(`lbg-btn-${custom.id}`, custom.label, custom.icon, buttons)
      btn.addEventListener('click', () => custom.onClick(this))
    }

    this.closeBtn = button('lbg-close', this.labels.close, icons.close, buttons)
    this.closeBtn.addEventListener('click', () => this.close())

    this.prevBtn = button('lbg-nav lbg-nav-prev', this.labels.previous, icons.prev, ui)
    this.prevBtn.addEventListener('click', () => this.prev())
    this.nextBtn = button('lbg-nav lbg-nav-next', this.labels.next, icons.next, ui)
    this.nextBtn.addEventListener('click', () => this.next())

    this.captionEl = el('div', 'lbg-caption', ui)
    this.thumbsEl = el('div', 'lbg-thumbs', ui)
    this.thumbsEl.setAttribute('role', 'tablist')
    this.thumbsEl.setAttribute('aria-label', this.labels.thumbnails)

    // toast (share feedback etc.)
    this.toastEl = el('div', 'lbg-toast', root)

    // feature toggles
    if (!this.options.counter) this.counterEl.classList.add('lbg-hidden')
    if (!this.options.slideshow || this.items.length < 2)
      this.slideshowBtn.classList.add('lbg-hidden')
    if (!this.options.download) this.downloadLink.classList.add('lbg-hidden')
    if (!this.options.share) this.shareBtn.classList.add('lbg-hidden')
    if (!this.options.fullscreen || typeof root.requestFullscreen !== 'function')
      this.fullscreenBtn.classList.add('lbg-hidden')
    if (!this.options.thumbnails || this.items.length < 2) this.thumbsEl.classList.add('lbg-hidden')
    if (this.inline) this.closeBtn.classList.add('lbg-hidden')

    // gestures
    this.stage.addEventListener('pointerdown', this.onPointerDown)
    this.stage.addEventListener('pointermove', this.onPointerMove)
    this.stage.addEventListener('pointerup', this.onPointerUp)
    this.stage.addEventListener('pointercancel', this.onPointerUp)
    this.stage.addEventListener('wheel', this.onWheel, { passive: false })
    this.stage.addEventListener('pointerenter', this.onStageEnter)
    this.stage.addEventListener('pointerleave', this.onStageLeave)

    const host = this.options.container ?? document.body
    if (this.inline) host.classList.add('lbg-inline-host')
    host.appendChild(root)
  }

  private teardown(): void {
    if (!this.root) return
    this.pauseVideos()
    this.clearAdvance()
    this.stopMomentum()
    this.keyTarget?.removeEventListener('keydown', this.onKeyDown)
    this.keyTarget = null
    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('popstate', this.onPopState)
    document.removeEventListener('fullscreenchange', this.onFullscreenChange)
    if (this.navTimer) {
      clearTimeout(this.navTimer)
      this.navTimer = null
    }
    if (this.tapTimer) {
      clearTimeout(this.tapTimer)
      this.tapTimer = null
    }
    if (this.toastTimer) {
      clearTimeout(this.toastTimer)
      this.toastTimer = null
    }
    if (this.inline) this.options.container?.classList.remove('lbg-inline-host')
    this.root.remove()
    this.root = null
    this.contentEl = null
    this.progressFill = null
    this.toastEl = null
    this.slides = []
    this.pointers.clear()
    this.downTarget = null
    this.gesture = 'idle'
    this.navigating = false
    this.uiHidden = false
    this.resetTransformState()
    if (!this.inline) {
      this.unlockScroll()
      this.previousFocus?.focus?.({ preventScroll: true })
      this.previousFocus = null
    }
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

  // -------------------------------------------------------- hash routing

  private get hashKey(): string | null {
    if (!this.options.hash || this.inline) return null
    return typeof this.options.hash === 'string' ? this.options.hash : 'gallery'
  }

  private setupHash(): void {
    const key = this.hashKey
    if (!key || typeof history === 'undefined') return
    history.pushState({ lbg: key }, '', `#${key}=${this._index + 1}`)
    this.pushedHash = true
    window.addEventListener('popstate', this.onPopState)
  }

  private updateHash(): void {
    const key = this.hashKey
    if (!key || !this.pushedHash) return
    history.replaceState({ lbg: key }, '', `#${key}=${this._index + 1}`)
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
    this.root?.querySelectorAll('video').forEach((v) => {
      try {
        v.pause()
      } catch {
        /* jsdom */
      }
    })
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
        errBox.innerHTML = `${icons.error}<span></span>`
        errBox.querySelector('span')!.textContent = this.labels.error
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

  // -------------------------------------------------------- FLIP open/close

  private flipSourceFor(index: number): HTMLElement | null {
    if (this.options.animation === 'none' || this.inline) return null
    const item = this.items[index]
    if (!item || detectType(item) !== 'image') return null
    const src = this.options.animateFrom?.(index)
    if (!src) return null
    const rect = src.getBoundingClientRect()
    return rect.width > 0 && rect.height > 0 ? src : null
  }

  private runOpenFlip(source: HTMLElement): void {
    const img = this.contentEl as HTMLImageElement | null
    if (!img) return
    const srcRect = source.getBoundingClientRect()
    const run = (): void => {
      if (this.contentEl !== img || !this._isOpen) return
      const rect = img.getBoundingClientRect()
      if (rect.width === 0) return
      const dx = srcRect.left + srcRect.width / 2 - (rect.left + rect.width / 2)
      const dy = srcRect.top + srcRect.height / 2 - (rect.top + rect.height / 2)
      const s = srcRect.width / rect.width
      img.style.transition = 'none'
      img.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${s})`
      void img.offsetWidth
      img.style.transition = `transform ${FLIP_MS}ms cubic-bezier(0.22, 0.9, 0.3, 1)`
      img.style.transform = ''
      setTimeout(() => {
        if (this.contentEl === img) img.style.transition = ''
      }, FLIP_MS + 40)
    }
    if (img.complete && img.naturalWidth > 0) {
      requestAnimationFrame(run)
    } else {
      const timeout = setTimeout(() => img.removeEventListener('load', onLoad), 400)
      const onLoad = (): void => {
        clearTimeout(timeout)
        requestAnimationFrame(run)
      }
      img.addEventListener('load', onLoad, { once: true })
    }
  }

  private runCloseFlip(): void {
    const source = this.flipSourceFor(this._index)
    const img = this.contentEl
    if (!source || !img) return
    if (
      this.scaleValue !== 1 ||
      this.rotation % 360 !== 0 ||
      this.flippedX ||
      this.flippedY ||
      this.gesture !== 'idle'
    )
      return
    const rect = img.getBoundingClientRect()
    if (rect.width === 0) return
    const srcRect = source.getBoundingClientRect()
    const dx = srcRect.left + srcRect.width / 2 - (rect.left + rect.width / 2)
    const dy = srcRect.top + srcRect.height / 2 - (rect.top + rect.height / 2)
    const s = srcRect.width / rect.width
    img.style.transition = `transform ${CLOSE_MS}ms cubic-bezier(0.4, 0, 0.6, 1)`
    img.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${s})`
  }

  // ----------------------------------------------------------- navigation

  private userNavigate(dir: 1 | -1): void {
    this.stopSlideshow()
    this.navigate(dir)
  }

  private navigate(dir: 1 | -1): void {
    if (!this._isOpen || this.navigating || !this.canGo(dir)) return
    this.navigating = true
    this.stopMomentum()
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
      this.resetTransformState()
      this.renderSlides(false)
      this.updateUI()
      this.updateHash()
      this.navigating = false
      this.emit('change', this._index, this.items[this._index])
      if (this.playing) this.scheduleAdvance()
      this.preloadNeighbours()
    }
    this.navTimer = setTimeout(finish, NAV_MS)
  }

  private setTrackOffset(px: number, animate: boolean): void {
    this.track.classList.toggle('lbg-track-anim', animate)
    this.track.style.transform =
      px === 0 && !animate
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

    const isImage = type === 'image'
    const zoomable = this.options.zoom && isImage
    this.zoomInBtn.classList.toggle('lbg-hidden', !zoomable)
    this.zoomOutBtn.classList.toggle('lbg-hidden', !zoomable)
    this.zoomInBtn.disabled = this.scaleValue >= this.options.maxZoom
    this.zoomOutBtn.disabled = this.scaleValue <= 1

    const rotatable = this.options.rotate && isImage
    for (const btn of [this.rotateLeftBtn, this.rotateRightBtn, this.flipHBtn, this.flipVBtn]) {
      btn.classList.toggle('lbg-hidden', !rotatable)
    }

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

    if (
      this.items.length > 0 &&
      this._index >= this.items.length - 2 &&
      this.endNotifiedLength !== this.items.length
    ) {
      this.endNotifiedLength = this.items.length
      this.emit('end-reached')
    }
  }

  private renderThumbnails(): void {
    this.thumbsEl.innerHTML = ''
    if (!this.options.thumbnails || this.items.length < 2) {
      this.thumbsEl.classList.add('lbg-hidden')
      return
    }
    this.thumbsEl.classList.remove('lbg-hidden')
    this.items.forEach((item, i) => {
      const thumb = el('button', 'lbg-thumb', this.thumbsEl)
      thumb.type = 'button'
      thumb.setAttribute('role', 'tab')
      thumb.setAttribute('aria-label', item.caption ?? `${this.labels.slide} ${i + 1}`)
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
    this.slideshowBtn.innerHTML = this.playing ? icons.pause : icons.play
    const label = this.playing ? this.labels.slideshowPause : this.labels.slideshowStart
    this.slideshowBtn.setAttribute('aria-label', label)
    this.slideshowBtn.title = label
  }

  private toggleUIVisibility(): void {
    this.uiHidden = !this.uiHidden
    this.root?.classList.toggle('lbg-ui-hidden', this.uiHidden)
  }

  private showToast(text: string): void {
    if (!this.toastEl) return
    this.toastEl.textContent = text
    this.toastEl.classList.add('lbg-toast-show')
    if (this.toastTimer) clearTimeout(this.toastTimer)
    this.toastTimer = setTimeout(() => {
      this.toastEl?.classList.remove('lbg-toast-show')
      this.toastTimer = null
    }, 1600)
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

  // ------------------------------------------------------------ slideshow

  private clearAdvance(): void {
    if (this.advanceTimer) {
      clearTimeout(this.advanceTimer)
      this.advanceTimer = null
    }
    if (this.videoEndedCleanup) {
      this.videoEndedCleanup()
      this.videoEndedCleanup = null
    }
  }

  private scheduleAdvance(): void {
    this.clearAdvance()
    if (!this.playing || this.suspended) return
    const item = this.items[this._index]
    if (item && detectType(item) === 'video') {
      this.hideProgress()
      const video = this.slides[1]?.querySelector('video')
      if (video) {
        try {
          void video.play()?.catch?.(() => {})
        } catch {
          /* jsdom */
        }
        const onEnded = (): void => {
          if (!this.playing) return
          if (this.canGo(1)) this.navigate(1)
          else this.stopSlideshow()
        }
        video.addEventListener('ended', onEnded)
        this.videoEndedCleanup = () => video.removeEventListener('ended', onEnded)
        return
      }
    }
    this.startProgress()
    this.advanceTimer = setTimeout(() => {
      this.advanceTimer = null
      if (this.canGo(1)) this.navigate(1)
      else this.stopSlideshow()
    }, this.options.slideshowDelay)
  }

  private startProgress(): void {
    const fill = this.progressFill
    if (!fill || !this.options.slideshowProgress) return
    fill.style.transition = 'none'
    fill.style.width = '0%'
    void fill.offsetWidth
    fill.style.transition = `width ${this.options.slideshowDelay}ms linear`
    fill.style.width = '100%'
  }

  private hideProgress(): void {
    const fill = this.progressFill
    if (!fill) return
    fill.style.transition = 'none'
    fill.style.width = '0%'
  }

  private onStageEnter = (e: PointerEvent): void => {
    if (e.pointerType !== 'mouse') return
    if (this.playing && this.options.slideshowPauseOnHover && !this.suspended) {
      this.suspended = true
      this.clearAdvance()
      const fill = this.progressFill
      if (fill) {
        fill.style.width = getComputedStyle(fill).width
        fill.style.transition = 'none'
      }
    }
  }

  private onStageLeave = (e: PointerEvent): void => {
    if (e.pointerType !== 'mouse') return
    if (this.playing && this.suspended) {
      this.suspended = false
      this.scheduleAdvance()
    }
  }

  // ------------------------------------------------------------- keyboard

  private handleKey(e: KeyboardEvent): void {
    if (!this._isOpen || !this.root) return
    switch (e.key) {
      case 'Escape':
        if (this.isTransformed()) this.resetZoom()
        else if (!this.inline) this.close()
        break
      case 'ArrowLeft':
        if (this.options.keyboard) this.rtlActive ? this.next() : this.prev()
        break
      case 'ArrowRight':
        if (this.options.keyboard) this.rtlActive ? this.prev() : this.next()
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
        if (this.inline) break
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

  // ------------------------------------------------- zoom / rotate / flip

  private get currentIsImage(): boolean {
    const item = this.items[this._index]
    return !!item && detectType(item) === 'image'
  }

  private isTransformed(): boolean {
    return (
      this.scaleValue !== 1 ||
      this.rotation % 360 !== 0 ||
      this.flippedX ||
      this.flippedY ||
      this.tx !== 0 ||
      this.ty !== 0
    )
  }

  private resetTransformState(): void {
    this.stopMomentum()
    this.scaleValue = 1
    this.tx = 0
    this.ty = 0
    this.rotation = 0
    this.flippedX = false
    this.flippedY = false
    if (this.contentEl) {
      this.contentEl.style.transition = ''
      this.contentEl.style.transform = ''
    }
  }

  private applyRotate(delta: number): void {
    if (!this.currentIsImage || !this.contentEl) return
    this.rotation += delta
    this.applyTransform(this.scaleValue, 0, 0, true)
    this.emit('rotate', this.rotation)
  }

  /** Effective base dimensions, accounting for 90°/270° rotation. */
  private effectiveBase(): [number, number] {
    const rotated = Math.abs(this.rotation % 180) === 90
    return rotated ? [this.baseH, this.baseW] : [this.baseW, this.baseH]
  }

  private clampPan(tx: number, ty: number, scale: number): [number, number] {
    const rect = this.stage.getBoundingClientRect()
    const [bw, bh] = this.effectiveBase()
    const maxX = Math.max(0, (bw * scale - rect.width) / 2)
    const maxY = Math.max(0, (bh * scale - rect.height) / 2)
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
    this.stopMomentum()
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
    if (this.root) this.root.style.opacity = ''
    this.applyTransform(next, tx, ty, animate)
  }

  private transformString(scale: number, tx: number, ty: number): string {
    const fx = this.flippedX ? -1 : 1
    const fy = this.flippedY ? -1 : 1
    if (
      scale === 1 &&
      tx === 0 &&
      ty === 0 &&
      this.rotation % 360 === 0 &&
      fx === 1 &&
      fy === 1
    ) {
      return ''
    }
    return `translate3d(${tx}px, ${ty}px, 0) scale(${scale}) rotate(${this.rotation}deg) scale(${fx}, ${fy})`
  }

  private applyTransform(scale: number, tx: number, ty: number, animate: boolean): void {
    if (!this.contentEl) return
    const changed = scale !== this.scaleValue
    this.scaleValue = scale
    this.tx = tx
    this.ty = ty
    this.contentEl.style.transition = animate ? 'transform 0.25s ease' : 'none'
    this.contentEl.style.transform = this.transformString(scale, tx, ty)
    this.contentEl.classList.toggle('lbg-zoomed', scale > 1)
    this.zoomInBtn.disabled = scale >= this.options.maxZoom
    this.zoomOutBtn.disabled = scale <= 1
    if (changed) this.emit('zoom', scale)
  }

  // ------------------------------------------------------------- momentum

  private startMomentum(vx: number, vy: number): void {
    if (!this.options.momentum || !this.contentEl) return
    if (Math.hypot(vx, vy) < 0.15) return
    this.stopMomentum()
    let last = performance.now()
    const step = (now: number): void => {
      this.momentumRaf = null
      if (!this._isOpen || !this.contentEl || this.gesture !== 'idle') return
      const dt = Math.min(now - last, 64)
      last = now
      const decay = Math.pow(0.95, dt / 16.7)
      vx *= decay
      vy *= decay
      const nx = this.tx + vx * dt
      const ny = this.ty + vy * dt
      const [cx, cy] = this.clampPan(nx, ny, this.scaleValue)
      if (cx !== nx) vx = 0
      if (cy !== ny) vy = 0
      this.applyTransform(this.scaleValue, cx, cy, false)
      if (Math.hypot(vx, vy) > 0.03) {
        this.momentumRaf = requestAnimationFrame(step)
      }
    }
    this.momentumRaf = requestAnimationFrame(step)
  }

  private stopMomentum(): void {
    if (this.momentumRaf !== null) {
      cancelAnimationFrame(this.momentumRaf)
      this.momentumRaf = null
    }
  }

  // ------------------------------------------------------------- gestures

  private onPointerDown = (e: PointerEvent): void => {
    const target = e.target as HTMLElement
    if (target.closest('video, iframe, .lbg-html, .lbg-error')) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    this.stopMomentum()
    this.stage.setPointerCapture?.(e.pointerId)
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (this.pointers.size === 1) {
      this.gesture = 'pending'
      this.downTarget = target
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

    if (this.gesture === 'none') return

    if (this.gesture === 'pending') {
      if (Math.hypot(dx, dy) < SWIPE_START_PX) return
      const touchLike = e.pointerType !== 'mouse'
      if (this.scaleValue > 1) {
        this.gesture = 'pan'
      } else if (Math.abs(dx) >= Math.abs(dy) && this.options.swipe) {
        this.gesture = 'swipe'
        this.stopSlideshow()
      } else if (touchLike && this.options.swipeToClose && !this.inline) {
        // drag-to-close is touch/pen only: with a mouse, a slightly sloppy
        // click must never be interpreted as a close gesture
        this.gesture = 'vclose'
      } else if (touchLike && this.options.swipe) {
        this.gesture = 'swipe'
        this.stopSlideshow()
      } else {
        this.gesture = 'none'
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
        this.gesture = 'idle'
        this.pointers.clear()
        if (
          this.scaleValue < PINCH_CLOSE_SCALE &&
          this.options.pinchToClose &&
          !this.inline
        ) {
          this.close()
        } else if (this.scaleValue <= 1.04) {
          this.zoomAtPoint(1, null, true)
        }
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
      // a flick counts only with real displacement behind it — raw velocity
      // alone can spike on a few-pixel jitter
      const flick = Math.abs(vx) > 0.45 && Math.abs(dx) > 30
      if ((Math.abs(dx) > threshold || flick) && this.canGo(dir)) {
        this.navigate(dir)
      } else {
        this.setTrackOffset(0, true)
        if (this.navTimer) clearTimeout(this.navTimer)
        this.navTimer = setTimeout(() => this.setTrackOffset(0, false), NAV_MS)
      }
    } else if (gesture === 'pan') {
      this.startMomentum(vx, vy)
    } else if (gesture === 'vclose') {
      const flick = Math.abs(vy) > 0.5 && Math.abs(dy) > 40
      if (Math.abs(dy) > 110 || flick) {
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
    const allowBelow = this.options.pinchToClose && !this.inline
    const raw = this.start.scale * (dist / Math.max(this.start.dist, 1))
    let next: number
    if (raw >= 1) {
      next = clamp(raw, 1, this.options.maxZoom)
    } else if (allowBelow) {
      // rubber-band below 1x — releasing under PINCH_CLOSE_SCALE closes
      next = Math.max(PINCH_MIN_SCALE, 1 - (1 - raw) * 0.85)
    } else {
      next = 1
    }
    const rect = this.stage.getBoundingClientRect()
    const px = this.start.midX - rect.left - rect.width / 2
    const py = this.start.midY - rect.top - rect.height / 2
    const factor = next / this.start.scale
    let tx = px - (px - this.start.tx) * factor + (midX - this.start.midX)
    let ty = py - (py - this.start.ty) * factor + (midY - this.start.midY)
    if (next >= 1) {
      ;[tx, ty] = this.clampPan(tx, ty, next)
    }
    if (this.root && allowBelow) {
      this.root.style.opacity =
        next < 1 ? String(clamp((next - PINCH_MIN_SCALE) / (1 - PINCH_MIN_SCALE), 0.3, 1)) : ''
    }
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
    const onContent = !!this.downTarget?.closest('.lbg-content')
    const zoomable = this.options.zoom && this.currentIsImage
    const point = { x: e.clientX, y: e.clientY }
    const pointerType = e.pointerType
    this.tapTimer = setTimeout(
      () => {
        this.tapTimer = null
        if (onContent) {
          if (pointerType === 'mouse' && zoomable) {
            // match the zoom-in cursor: click zooms, click again zooms back out
            if (this.scaleValue > 1) this.zoomAtPoint(1, null, true)
            else this.zoomAtPoint(this.options.doubleTapZoom, point, true)
          } else {
            this.toggleUIVisibility()
          }
        } else if (this.options.closeOnBackdrop && !this.inline) {
          this.close()
        }
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
