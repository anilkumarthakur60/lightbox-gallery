import type { Lightbox } from './lightbox'

export type LightboxItemType = 'image' | 'video' | 'iframe' | 'html'

export interface LightboxItem {
  /** Full-size media URL (image, video file, or page URL for iframe embeds). */
  src: string
  /** Explicit media type. Auto-detected from `src` when omitted (YouTube/Vimeo/Wistia URLs become iframe embeds). */
  type?: LightboxItemType
  /** Thumbnail URL used in the thumbnail strip. Falls back to `src`. */
  thumb?: string
  /** Caption shown under the media. */
  caption?: string
  /** Alt text for images. */
  alt?: string
  /** `srcset` for responsive images. */
  srcset?: string
  /** `sizes` for responsive images. */
  sizes?: string
  /** Poster image for videos. */
  poster?: string
  /** Raw HTML content when `type` is `'html'`. */
  html?: string
  /** URL used by the download button. Falls back to `src`. */
  downloadUrl?: string
  /** Filename hint for the download button. */
  downloadFilename?: string
  /** URL used by the share button. Falls back to `src` (or the page URL when hash routing is active). */
  shareUrl?: string
}

export type LightboxAnimation = 'zoom' | 'fade' | 'none'

/**
 * Colour scheme of the UI.
 * - `'dark'` — the default dark overlay.
 * - `'light'` — a light UI.
 * - `'auto'` — follow the OS via `prefers-color-scheme` (dark by default,
 *   switching to light when the system prefers light).
 */
export type LightboxTheme = 'dark' | 'light' | 'auto'

/** All user-visible strings — override via the `labels` option for i18n. */
export interface LightboxLabels {
  dialog: string
  close: string
  previous: string
  next: string
  zoomIn: string
  zoomOut: string
  fullscreen: string
  slideshowStart: string
  slideshowPause: string
  download: string
  share: string
  rotateLeft: string
  rotateRight: string
  flipHorizontal: string
  flipVertical: string
  thumbnails: string
  slide: string
  error: string
  linkCopied: string
}

export interface LightboxToolbarButton {
  /** Unique id — added to the button class as `lbg-btn-<id>`. */
  id: string
  /** Accessible label / tooltip. */
  label: string
  /** Inner HTML of the button, typically an inline SVG icon. */
  icon: string
  onClick: (lightbox: Lightbox) => void
}

export interface LightboxOptions {
  /** Gallery items. */
  items: LightboxItem[]
  /** Index opened by default. @default 0 */
  startIndex?: number
  /** Wrap around at the ends. @default true */
  loop?: boolean
  /** Enable zooming of images (buttons, wheel, pinch, double-tap). @default true */
  zoom?: boolean
  /** Maximum zoom scale. @default 4 */
  maxZoom?: number
  /** Scale used by double-tap / double-click zoom. @default 2.5 */
  doubleTapZoom?: number
  /** Zoom with the mouse wheel / trackpad. @default true */
  wheelZoom?: boolean
  /** Navigate with horizontal swipe / drag. @default true */
  swipe?: boolean
  /** Swipe down (or up) to close — touch/pen input only. @default true */
  swipeToClose?: boolean
  /** Pinch inward below 1x to close (touch). @default true */
  pinchToClose?: boolean
  /** Inertia when releasing a pan on a zoomed image. @default true */
  momentum?: boolean
  /** Keyboard navigation (arrows, Escape, +/-, 0, f). @default true */
  keyboard?: boolean
  /** Show the "3 / 12" counter. @default true */
  counter?: boolean
  /** Show captions. @default true */
  captions?: boolean
  /** Render captions as HTML instead of plain text. Only enable for trusted content. @default false */
  captionHTML?: boolean
  /** Show the thumbnail strip. @default true */
  thumbnails?: boolean
  /** Show the fullscreen button. @default true */
  fullscreen?: boolean
  /** Show the slideshow (autoplay) button. @default true */
  slideshow?: boolean
  /** Milliseconds between slideshow advances. @default 4000 */
  slideshowDelay?: number
  /** Show a progress bar while the slideshow runs. @default true */
  slideshowProgress?: boolean
  /** Pause the slideshow while the mouse hovers the stage. @default true */
  slideshowPauseOnHover?: boolean
  /** Show a download button. @default false */
  download?: boolean
  /** Show a share button (Web Share API with copy-link fallback). @default false */
  share?: boolean
  /** Show rotate / flip buttons for images. @default false */
  rotate?: boolean
  /**
   * Sync the open slide to the URL hash (`#gallery=3`) so slides are shareable
   * and the browser back button closes the lightbox. Pass a string to use a
   * custom hash key. @default false
   */
  hash?: boolean | string
  /**
   * Render inside `container` as an inline gallery / carousel instead of a
   * fullscreen overlay. Disables scroll locking, swipe/pinch-to-close,
   * backdrop close, hash routing and the close button. @default false
   */
  inline?: boolean
  /** Close when the backdrop is clicked. @default true */
  closeOnBackdrop?: boolean
  /** How many neighbouring images to preload on each side. @default 2 */
  preload?: number
  /** Opening animation. @default 'zoom' */
  animation?: LightboxAnimation
  /**
   * Return the gallery element (usually the clicked thumbnail) for a given
   * index. When provided, opening and closing animate the image from/to that
   * element (FLIP transition). `bindGallery` wires this automatically.
   */
  animateFrom?: (index: number) => HTMLElement | null | undefined
  /**
   * Colour scheme: `'dark'` (default), `'light'`, or `'auto'` to follow the
   * OS `prefers-color-scheme`. Applied as a `lbg-theme-*` class, so it composes
   * with `className` and CSS-custom-property overrides. @default 'dark'
   */
  theme?: LightboxTheme
  /** Right-to-left mode: swaps arrow-key direction and nav button sides. Defaults to `document.dir === 'rtl'`. */
  rtl?: boolean
  /** Override any user-visible string (i18n). */
  labels?: Partial<LightboxLabels>
  /** Extra toolbar buttons, inserted before the close button. */
  toolbarButtons?: LightboxToolbarButton[]
  /** Extra class added to the root element (e.g. `lbg-theme-light`, `lbg-theme-glass`, `lbg-theme-minimal`). */
  className?: string
  /** Element the lightbox is appended to. @default document.body */
  container?: HTMLElement
}

export type LightboxEventMap = {
  open: [index: number]
  close: []
  change: [index: number, item: LightboxItem]
  zoom: [scale: number]
  rotate: [degrees: number]
  flip: [horizontal: boolean, vertical: boolean]
  share: [item: LightboxItem, index: number]
  /** Fired when navigation gets within one slide of the end — use with `appendItems` for infinite galleries. */
  'end-reached': []
  'slideshow:start': []
  'slideshow:stop': []
  'fullscreen:enter': []
  'fullscreen:exit': []
  error: [item: LightboxItem, index: number]
}

export type LightboxEvent = keyof LightboxEventMap
