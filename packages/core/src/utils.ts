import type { LightboxItem, LightboxItemType } from './types'

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

const IMAGE_RE = /\.(avif|bmp|gif|jpe?g|png|svg|webp)(\?.*)?$/i
const VIDEO_RE = /\.(mp4|m4v|mov|ogv|webm)(\?.*)?$/i

export interface EmbedProvider {
  name: string
  match: RegExp
  embed: (match: RegExpMatchArray, src: string) => string
}

const embedProviders: EmbedProvider[] = [
  {
    name: 'youtube',
    match: /(?:youtube\.com\/(?:watch\?.*v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/,
    embed: (m) => `https://www.youtube-nocookie.com/embed/${m[1]}`,
  },
  {
    name: 'vimeo',
    match: /vimeo\.com\/(?:video\/)?(\d+)/,
    embed: (m) => `https://player.vimeo.com/video/${m[1]}`,
  },
  {
    name: 'wistia',
    match: /(?:wistia\.(?:com|net)|wi\.st)\/(?:medias|embed\/iframe)\/([\w-]+)/,
    embed: (m) => `https://fast.wistia.net/embed/iframe/${m[1]}`,
  },
]

/**
 * Register a custom embed provider (checked before the built-in
 * YouTube / Vimeo / Wistia providers).
 *
 * ```ts
 * registerEmbedProvider({
 *   name: 'loom',
 *   match: /loom\.com\/share\/(\w+)/,
 *   embed: (m) => `https://www.loom.com/embed/${m[1]}`,
 * })
 * ```
 */
export function registerEmbedProvider(provider: EmbedProvider): void {
  embedProviders.unshift(provider)
}

/** Returns the embeddable player URL for a known provider URL, or null. */
export function findEmbedUrl(src: string): string | null {
  for (const provider of embedProviders) {
    const match = src.match(provider.match)
    if (match) return provider.embed(match, src)
  }
  return null
}

/** Convert well-known video page URLs into their embeddable player URL. */
export function toEmbedUrl(src: string): string {
  return findEmbedUrl(src) ?? src
}

export function detectType(item: LightboxItem): LightboxItemType {
  if (item.type) return item.type
  if (item.html) return 'html'
  if (VIDEO_RE.test(item.src)) return 'video'
  if (findEmbedUrl(item.src)) return 'iframe'
  if (IMAGE_RE.test(item.src)) return 'image'
  return 'image'
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), video[controls], audio[controls], iframe, [tabindex]:not([tabindex="-1"])'

export function getFocusable(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  )
}
