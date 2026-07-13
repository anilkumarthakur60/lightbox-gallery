# Solid

::: tip Live demo
▶️ [Open the Solid demo](https://lightbox-gallery-three.vercel.app/solid/) — click a thumbnail to try zoom, swipe, slideshow, share and more.
:::

```bash
pnpm add @anil-labs/lightbox-gallery-solid @anil-labs/lightbox-gallery-core
```

Requires Solid 1.8+. Import the stylesheet once (from the core package).

## `useLightbox` signals + component

```tsx
import { For } from 'solid-js'
import { Lightbox, useLightbox } from '@anil-labs/lightbox-gallery-solid'
import '@anil-labs/lightbox-gallery-core/styles.css'

const items = [
  { src: '/photos/1.jpg', thumb: '/photos/1-t.jpg', caption: 'Sunrise' },
  { src: '/photos/2.jpg', thumb: '/photos/2-t.jpg', caption: 'Dunes' },
]

export function Gallery() {
  const lb = useLightbox()

  return (
    <>
      <div class="grid">
        <For each={items}>
          {(item, i) => (
            <button onClick={() => lb.open(i())}>
              <img src={item.thumb} alt={item.caption} />
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
        share
      />
    </>
  )
}
```

`useLightbox()` returns `{ isOpen, index, open, close, setIndex }` (accessors + setters).

## Props

`<Lightbox>` is controlled and accepts:

| Prop | Type |
| --- | --- |
| `items` | `LightboxItem[]` (required) |
| `open` | `boolean` |
| `index` | `number` |
| `onClose` | `() => void` |
| `onIndexChange` | `(index) => void` |
| `onZoom` | `(scale) => void` |
| …all [options](/reference/options) | `loop`, `share`, `rotate`, … |

It renders nothing in place — the gallery portals itself to `document.body`.
