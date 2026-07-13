import type { LightboxItem, LightboxItemType } from './types'

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

const IMAGE_RE = /\.(avif|bmp|gif|jpe?g|png|svg|webp)(\?.*)?$/i
const VIDEO_RE = /\.(mp4|m4v|mov|ogv|webm)(\?.*)?$/i
const YOUTUBE_RE = /(?:youtube\.com\/(?:watch\?.*v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/
const VIMEO_RE = /vimeo\.com\/(?:video\/)?(\d+)/

export function detectType(item: LightboxItem): LightboxItemType {
  if (item.type) return item.type
  if (item.html) return 'html'
  if (VIDEO_RE.test(item.src)) return 'video'
  if (YOUTUBE_RE.test(item.src) || VIMEO_RE.test(item.src)) return 'iframe'
  if (IMAGE_RE.test(item.src)) return 'image'
  return 'image'
}

/** Convert well-known video page URLs into their embeddable player URL. */
export function toEmbedUrl(src: string): string {
  const yt = src.match(YOUTUBE_RE)
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`
  const vimeo = src.match(VIMEO_RE)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  return src
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), video[controls], audio[controls], iframe, [tabindex]:not([tabindex="-1"])'

export function getFocusable(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  )
}
