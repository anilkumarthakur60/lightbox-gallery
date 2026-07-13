export type LightboxItemType = 'image' | 'video' | 'iframe' | 'html'

export interface LightboxItem {
  /** Full-size media URL (image, video file, or page URL for iframe embeds). */
  src: string
  /** Explicit media type. Auto-detected from `src` when omitted (YouTube/Vimeo URLs become iframe embeds). */
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
}

export type LightboxAnimation = 'zoom' | 'fade' | 'none'

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
  /** Swipe down (or up) to close. @default true */
  swipeToClose?: boolean
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
  /** Show a download button. @default false */
  download?: boolean
  /** Close when the backdrop is clicked. @default true */
  closeOnBackdrop?: boolean
  /** How many neighbouring images to preload on each side. @default 2 */
  preload?: number
  /** Opening animation. @default 'zoom' */
  animation?: LightboxAnimation
  /** Extra class added to the root element (for theming). */
  className?: string
  /** Element the lightbox is appended to. @default document.body */
  container?: HTMLElement
}

export interface LightboxEventMap {
  open: [index: number]
  close: []
  change: [index: number, item: LightboxItem]
  zoom: [scale: number]
  'slideshow:start': []
  'slideshow:stop': []
  'fullscreen:enter': []
  'fullscreen:exit': []
  error: [item: LightboxItem, index: number]
}

export type LightboxEvent = keyof LightboxEventMap
