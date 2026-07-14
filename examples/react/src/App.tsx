import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  Lightbox,
  useLightbox,
  CoreLightbox,
  type LightboxItem,
  type LightboxOptions,
} from '@anil-labs/lightbox-gallery-react'

const full = (id: number): string => `https://picsum.photos/id/${id}/1600/1067`
const thumbUrl = (id: number): string => `https://picsum.photos/id/${id}/400/300`
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
  thumb: thumbUrl(id),
  caption: CAPTIONS[i],
}))

const MEDIA: LightboxItem[] = [
  { src: full(1025), thumb: thumbUrl(1025), caption: 'A plain image slide' },
  {
    type: 'video',
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster: full(1035),
    thumb: thumbUrl(1035),
    caption: 'An MP4 video (native controls)',
  },
  {
    src: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    thumb: thumbUrl(1041),
    caption: 'A YouTube embed (auto-detected)',
  },
  {
    type: 'html',
    src: '',
    html: '<div style="display:grid;place-items:center;height:100%;padding:40px;text-align:center;font:600 26px/1.4 system-ui;color:#fff;background:linear-gradient(135deg,#5b6cff,#b06cff);border-radius:12px">Any HTML you like<br/><span style="font-weight:400;font-size:16px;opacity:.85">rendered as a slide</span></div>',
    thumb: thumbUrl(1047),
    caption: 'A raw HTML slide',
  },
]

const SECTIONS = [
  ['basic', 'Basic'],
  ['media', 'Mixed media'],
  ['slideshow', 'Slideshow'],
  ['toolbar', 'Toolbar'],
  ['themes', 'Themes'],
  ['inline', 'Inline'],
  ['hash', 'Deep-linking'],
  ['api', 'API & events'],
] as const

function Section({
  n,
  id,
  title,
  desc,
  use,
  children,
}: {
  n: string
  id: string
  title: string
  desc: ReactNode
  use: ReactNode
  children: ReactNode
}) {
  return (
    <section className="section" id={id}>
      <div className="section-head">
        <h2>
          <span className="n">{n}</span> {title}
        </h2>
        <p className="desc">{desc}</p>
        <p className="use">{use}</p>
      </div>
      <div className="card-wrap">{children}</div>
    </section>
  )
}

function Thumb({ item, onClick }: { item: LightboxItem; onClick: () => void }) {
  const isVideo = item.type === 'video' || item.src.includes('youtube')
  return (
    <button className="thumb" onClick={onClick}>
      <img src={item.thumb ?? item.poster ?? item.src} alt={item.caption ?? ''} loading="lazy" />
      {isVideo && <span className="play">▶</span>}
      {item.type === 'html' && <span className="tag-badge">HTML</span>}
    </button>
  )
}

/** Controlled gallery via useLightbox + <Lightbox>. */
function Gallery({
  items,
  options = {},
}: {
  items: LightboxItem[]
  options?: Omit<LightboxOptions, 'items'>
}) {
  const gridRef = useRef<HTMLDivElement>(null)
  const { open, lightboxProps } = useLightbox(items, {
    ...options,
    animateFrom: (i) => gridRef.current?.querySelectorAll('img')[i] ?? null,
  })
  return (
    <>
      <div className="thumbs" ref={gridRef}>
        {items.map((item, i) => (
          <Thumb key={i} item={item} onClick={() => open(i)} />
        ))}
      </div>
      <Lightbox {...lightboxProps} />
    </>
  )
}

function SlideshowDemo() {
  const gridRef = useRef<HTMLDivElement>(null)
  const core = useRef<CoreLightbox | null>(null)
  useEffect(() => {
    const lb = new CoreLightbox({
      items: PHOTOS,
      slideshow: true,
      slideshowDelay: 2500,
      slideshowProgress: true,
      animateFrom: (i) => gridRef.current?.querySelectorAll('img')[i] ?? null,
    })
    core.current = lb
    return () => lb.destroy()
  }, [])
  return (
    <>
      <div className="toolbar">
        <button
          className="btn primary"
          onClick={() => {
            core.current?.open(0)
            core.current?.toggleSlideshow()
          }}
        >
          ▶ Play slideshow
        </button>
      </div>
      <div className="thumbs" ref={gridRef}>
        {PHOTOS.map((item, i) => (
          <Thumb key={i} item={item} onClick={() => core.current?.open(i)} />
        ))}
      </div>
    </>
  )
}

function ThemesDemo() {
  const openThemed = (opts: Pick<LightboxOptions, 'theme' | 'className'>) => {
    const lb = new CoreLightbox({ items: PHOTOS, ...opts })
    lb.on('close', () => lb.destroy())
    lb.open(0)
  }
  return (
    <div className="swatches">
      <button className="swatch sw-dark" onClick={() => openThemed({ theme: 'dark' })}>
        Dark<small>the default</small>
      </button>
      <button className="swatch sw-light" onClick={() => openThemed({ theme: 'light' })}>
        Light<small>theme: 'light'</small>
      </button>
      <button className="swatch sw-auto" onClick={() => openThemed({ theme: 'auto' })}>
        Auto<small>follows the OS</small>
      </button>
      <button
        className="swatch sw-glass"
        onClick={() => openThemed({ className: 'lbg-theme-glass' })}
      >
        Glass<small>frosted blur</small>
      </button>
      <button
        className="swatch sw-minimal"
        onClick={() => openThemed({ className: 'lbg-theme-minimal' })}
      >
        Minimal<small>bare UI</small>
      </button>
    </div>
  )
}

function InlineDemo() {
  const stage = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!stage.current) return
    const lb = new CoreLightbox({
      items: PHOTOS,
      inline: true,
      container: stage.current,
      thumbnails: true,
    })
    lb.open(0)
    return () => lb.destroy()
  }, [])
  return <div className="inline-stage" ref={stage} />
}

function ApiDemo() {
  const gridRef = useRef<HTMLDivElement>(null)
  const core = useRef<CoreLightbox | null>(null)
  const [log, setLog] = useState<{ k: string; d: string }[]>([])
  const push = (k: string, d = '') => setLog((l) => [{ k, d }, ...l].slice(0, 40))
  useEffect(() => {
    const lb = new CoreLightbox({
      items: PHOTOS,
      slideshow: true,
      fullscreen: true,
      animateFrom: (i) => gridRef.current?.querySelectorAll('img')[i] ?? null,
    })
    core.current = lb
    lb.on('open', (i) => push('open', `#${i}`))
    lb.on('close', () => push('close'))
    lb.on('change', (i, item) => push('change', `#${i} — ${item.caption ?? ''}`))
    lb.on('zoom', (s) => push('zoom', `${s.toFixed(2)}×`))
    lb.on('slideshow:start', () => push('slideshow:start'))
    lb.on('slideshow:stop', () => push('slideshow:stop'))
    return () => lb.destroy()
  }, [])
  const ensure = () => {
    if (!core.current?.isOpen) core.current?.open(0)
  }
  return (
    <>
      <div className="toolbar">
        <button className="btn" onClick={() => core.current?.open(0)}>
          Open
        </button>
        <button className="btn" onClick={() => core.current?.prev()}>
          ‹ Prev
        </button>
        <button className="btn" onClick={() => core.current?.next()}>
          Next ›
        </button>
        <button
          className="btn"
          onClick={() => {
            ensure()
            core.current?.toggleSlideshow()
          }}
        >
          Slideshow
        </button>
        <button
          className="btn"
          onClick={() => {
            ensure()
            core.current?.toggleFullscreen()
          }}
        >
          Fullscreen
        </button>
      </div>
      <div className="thumbs" ref={gridRef}>
        {PHOTOS.map((item, i) => (
          <Thumb key={i} item={item} onClick={() => core.current?.open(i)} />
        ))}
      </div>
      <div className="log">
        {log.length === 0 ? (
          <div className="empty">Open the gallery or press a button — events appear here…</div>
        ) : (
          log.map((e, i) => (
            <div className="row" key={i}>
              <span className="k">{e.k}</span> {e.d}
            </div>
          ))
        )}
      </div>
    </>
  )
}

export default function App() {
  return (
    <main>
      <div className="hero">
        <span className="badge">React · useLightbox + &lt;Lightbox&gt;</span>
        <h1>lightbox-gallery</h1>
        <p className="tag">
          Every feature, one page. Each card is a self-contained example — find the one that matches
          your use case.
        </p>
        <nav className="toc">
          {SECTIONS.map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </nav>
      </div>

      <Section
        n="01"
        id="basic"
        title="Basic gallery"
        desc="Click a thumbnail and it opens with a FLIP zoom. Wheel/pinch zoom, swipe, arrows, f and Esc all work."
        use={
          <>
            <b>Use it for</b> portfolios, product shots, any grid of photos.
          </>
        }
      >
        <Gallery items={PHOTOS} options={{ loop: true }} />
      </Section>
      <Section
        n="02"
        id="media"
        title="Mixed media"
        desc={
          <>
            One gallery, many types — images, an MP4 video, a YouTube embed and a raw HTML slide
            (via <code>type</code>).
          </>
        }
        use={
          <>
            <b>Use it for</b> mixed image + video galleries, case studies, press kits.
          </>
        }
      >
        <Gallery items={MEDIA} options={{ loop: true }} />
      </Section>
      <Section
        n="03"
        id="slideshow"
        title="Slideshow"
        desc={
          <>
            Autoplay with a progress bar (<code>slideshow</code>, <code>slideshowDelay</code>,{' '}
            <code>slideshowProgress</code>); hovering pauses it.
          </>
        }
        use={
          <>
            <b>Use it for</b> kiosks, hero showcases, hands-off presentations.
          </>
        }
      >
        <SlideshowDemo />
      </Section>
      <Section
        n="04"
        id="toolbar"
        title="Toolbar & actions"
        desc={
          <>
            Opt into <code>fullscreen</code>, <code>download</code>, <code>share</code> and{' '}
            <code>rotate</code> — plus your own via <code>toolbarButtons</code>.
          </>
        }
        use={
          <>
            <b>Use it for</b> asset libraries, downloadable galleries, admin tools.
          </>
        }
      >
        <Gallery
          items={PHOTOS}
          options={{
            loop: true,
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
          }}
        />
      </Section>
      <Section
        n="05"
        id="themes"
        title="Themes"
        desc={
          <>
            <code>theme: 'dark' | 'light' | 'auto'</code> plus the <code>lbg-theme-glass</code> /{' '}
            <code>lbg-theme-minimal</code> presets.
          </>
        }
        use={
          <>
            <b>Use it for</b> matching your site's look, light pages, OS-aware UIs.
          </>
        }
      >
        <ThemesDemo />
      </Section>
      <Section
        n="06"
        id="inline"
        title="Inline carousel"
        desc={
          <>
            <code>inline: true</code> with a <code>container</code> renders a zoomable, swipeable
            carousel on the page.
          </>
        }
        use={
          <>
            <b>Use it for</b> product pages, embedded galleries, dashboards.
          </>
        }
      >
        <InlineDemo />
      </Section>
      <Section
        n="07"
        id="hash"
        title="Deep-linking (URL hash)"
        desc={
          <>
            <code>hash: true</code> writes the open slide to the URL, so links are shareable and the
            back button closes the viewer.
          </>
        }
        use={
          <>
            <b>Use it for</b> shareable photos, SEO-friendly galleries, back-button UX.
          </>
        }
      >
        <Gallery items={PHOTOS} options={{ loop: true, hash: true }} />
      </Section>
      <Section
        n="08"
        id="api"
        title="Programmatic API & live events"
        desc={
          <>
            Drive the instance — <code>open</code>, <code>next</code>, <code>prev</code>,{' '}
            <code>toggleSlideshow</code>, <code>toggleFullscreen</code> — and watch events fire.
          </>
        }
        use={
          <>
            <b>Use it for</b> custom controls, analytics, syncing state.
          </>
        }
      >
        <ApiDemo />
      </Section>

      <footer>
        Every card runs the same zero-dependency <code>@anil-labs/lightbox-gallery-core</code>{' '}
        engine.{' '}
        <a href="https://github.com/anilkumarthakur60/lightbox-gallery">View source on GitHub</a>
      </footer>
    </main>
  )
}
