import { For } from 'solid-js'
import { Lightbox, useLightbox, type LightboxItem } from '@anil-labs/lightbox-gallery-solid'

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
  const lb = useLightbox()

  return (
    <>
      <h1>lightbox-gallery — Solid</h1>
      <p>Click any image. Try wheel zoom, swipe, double-click, arrow keys, f, Escape.</p>
      <div class="grid">
        <For each={items}>
          {(item, i) => (
            <button onClick={() => lb.open(i())}>
              <img src={item.thumb} alt={item.caption} loading="lazy" />
            </button>
          )}
        </For>
      </div>
      <Lightbox
        items={items}
        open={lb.isOpen()}
        index={lb.index()}
        onClose={lb.close}
        onIndexChange={lb.setIndex}
        loop
        download
        share
        rotate
      />
    </>
  )
}
