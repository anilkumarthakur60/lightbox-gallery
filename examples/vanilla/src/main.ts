import { Lightbox, bindGallery } from '@anil-labs/lightbox-gallery-core'
import type { LightboxItem, LightboxOptions } from '@anil-labs/lightbox-gallery-core'
import '@anil-labs/lightbox-gallery-core/styles.css'
import './style.css'

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T
const full = (id: number): string => `https://picsum.photos/id/${id}/1600/1067`
const thumb = (id: number): string => `https://picsum.photos/id/${id}/400/300`

const CAPTIONS = [
  'Coastline at dawn',
  'Alpine ridge',
  'City in the rain',
  'Desert dunes',
  'Quiet harbour',
  'Forest light',
  'Rolling hills',
  'Northern sky',
]
const IDS = [1015, 1016, 1018, 1024, 1039, 1043, 1051, 1074]
const PHOTOS: LightboxItem[] = IDS.map((id, i) => ({
  src: full(id),
  thumb: thumb(id),
  caption: CAPTIONS[i],
}))

const MEDIA: LightboxItem[] = [
  { src: full(1025), thumb: thumb(1025), caption: 'A plain image slide' },
  {
    type: 'video',
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster: full(1035),
    thumb: thumb(1035),
    caption: 'An MP4 video (native <video> controls)',
  },
  {
    src: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    thumb: thumb(1041),
    caption: 'A YouTube embed (auto-detected as an iframe)',
  },
  {
    type: 'html',
    src: '',
    html: '<div style="display:grid;place-items:center;height:100%;padding:40px;text-align:center;font:600 26px/1.4 system-ui;color:#fff;background:linear-gradient(135deg,#5b6cff,#b06cff);border-radius:12px">Any HTML you like<br/><span style="font-weight:400;font-size:16px;opacity:.85">rendered as a slide</span></div>',
    thumb: thumb(1047),
    caption: 'A raw HTML slide',
  },
]

const badgeFor = (it: LightboxItem): string => {
  if (it.type === 'video' || it.src.includes('youtube')) return '<span class="play">▶</span>'
  if (it.type === 'html') return '<span class="tag-badge">HTML</span>'
  return ''
}

const renderThumbs = (grid: HTMLElement, items: LightboxItem[]): void => {
  grid.innerHTML = items
    .map(
      (it, i) =>
        `<button class="thumb" data-index="${i}"><img src="${it.thumb ?? it.poster ?? it.src}" alt="${it.caption ?? ''}" loading="lazy" />${badgeFor(it)}</button>`,
    )
    .join('')
}

/** Render a thumbnail grid and wire clicks to a single shared Lightbox. */
const gallery = (
  grid: HTMLElement,
  items: LightboxItem[],
  options: Omit<LightboxOptions, 'items'> = {},
): Lightbox => {
  renderThumbs(grid, items)
  const lb = new Lightbox({
    items,
    animateFrom: (i) => grid.querySelectorAll('img')[i] ?? null,
    ...options,
  })
  grid.querySelectorAll<HTMLElement>('.thumb').forEach((b) => {
    b.addEventListener('click', () => lb.open(Number(b.dataset.index)))
  })
  return lb
}

// 1 · Basic — progressive enhancement from <a> links via bindGallery
const basicGrid = $('g-basic')
basicGrid.innerHTML = PHOTOS.map(
  (p) =>
    `<a class="thumb" href="${p.src}" data-caption="${p.caption}"><img src="${p.thumb}" alt="${p.caption}" loading="lazy" /></a>`,
).join('')
bindGallery(Array.from(basicGrid.querySelectorAll<HTMLElement>('a')), { loop: true })

// 2 · Mixed media
gallery($('g-media'), MEDIA, { loop: true })

// 3 · Slideshow
const slideshow = gallery($('g-slideshow'), PHOTOS, {
  slideshow: true,
  slideshowDelay: 2500,
  slideshowProgress: true,
})
$('play-slideshow').addEventListener('click', () => {
  slideshow.open(0)
  slideshow.toggleSlideshow()
})

// 4 · Toolbar & actions
gallery($('g-toolbar'), PHOTOS, {
  fullscreen: true,
  download: true,
  share: true,
  rotate: true,
  toolbarButtons: [
    {
      id: 'info',
      label: 'Photo info',
      icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/></svg>',
      onClick: (lb) => alert(lb.currentItem?.caption ?? 'No caption'),
    },
  ],
})

// 5 · Themes
const openThemed = (opts: Pick<LightboxOptions, 'theme' | 'className'>): void => {
  const lb = new Lightbox({ items: PHOTOS, ...opts })
  lb.on('close', () => lb.destroy())
  lb.open(0)
}
document.querySelectorAll<HTMLElement>('.swatch').forEach((sw) => {
  sw.addEventListener('click', () =>
    openThemed({
      theme: (sw.dataset.theme as LightboxOptions['theme']) ?? undefined,
      className: sw.dataset.class,
    }),
  )
})

// 6 · Inline carousel
new Lightbox({ items: PHOTOS, inline: true, container: $('inline-stage'), thumbnails: true }).open(
  0,
)

// 7 · Deep-linking
gallery($('g-hash'), PHOTOS, { hash: true, loop: true })

// 8 · Programmatic API & live events
const log = $('api-log')
const logLine = (kind: string, detail = ''): void => {
  log.querySelector('.empty')?.remove()
  const row = document.createElement('div')
  row.className = 'row'
  row.innerHTML = `<span class="k">${kind}</span> ${detail}`
  log.prepend(row)
  while (log.childElementCount > 40) log.lastElementChild?.remove()
}
log.innerHTML = '<div class="empty">Open the gallery or press a button — events appear here…</div>'

const api = gallery($('g-api'), PHOTOS, { slideshow: true, fullscreen: true })
api.on('open', (i) => logLine('open', `#${i}`))
api.on('close', () => logLine('close'))
api.on('change', (i, item) => logLine('change', `#${i} — ${item.caption ?? ''}`))
api.on('zoom', (scale) => logLine('zoom', `${scale.toFixed(2)}×`))
api.on('slideshow:start', () => logLine('slideshow:start'))
api.on('slideshow:stop', () => logLine('slideshow:stop'))
api.on('fullscreen:enter', () => logLine('fullscreen:enter'))
api.on('fullscreen:exit', () => logLine('fullscreen:exit'))

$('api-open').addEventListener('click', () => api.open(0))
$('api-prev').addEventListener('click', () => api.prev())
$('api-next').addEventListener('click', () => api.next())
$('api-slideshow').addEventListener('click', () => {
  if (!api.isOpen) api.open(0)
  api.toggleSlideshow()
})
$('api-fullscreen').addEventListener('click', () => {
  if (!api.isOpen) api.open(0)
  api.toggleFullscreen()
})
