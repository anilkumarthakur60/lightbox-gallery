import { Lightbox, useLightbox, type LightboxItem } from '@anil-labs/lightbox-gallery-react'

const items: LightboxItem[] = [
  ...Array.from({ length: 8 }, (_, i) => ({
    src: `https://picsum.photos/id/${i * 15 + 20}/1600/1067`,
    thumb: `https://picsum.photos/id/${i * 15 + 20}/400/300`,
    caption: `Sample photo #${i + 1} from picsum.photos`,
  })),
  {
    src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    caption: 'A YouTube embed inside the gallery',
    thumb: 'https://picsum.photos/id/180/400/300',
  },
]

export default function App() {
  const { open, lightboxProps } = useLightbox(items, {
    loop: true,
    download: true,
    share: true,
    rotate: true,
    animateFrom: (i) => document.querySelectorAll<HTMLElement>('.grid img')[i] ?? null,
  })

  return (
    <>
      <h1>lightbox-gallery — React</h1>
      <p>Click any image. Try wheel/pinch zoom, swipe, double-click, arrow keys, f, Escape.</p>
      <div className="grid">
        {items.map((item, i) => (
          <button key={item.src} onClick={() => open(i)}>
            <img src={item.thumb} alt={item.caption} loading="lazy" />
          </button>
        ))}
      </div>
      <Lightbox {...lightboxProps} />
    </>
  )
}
