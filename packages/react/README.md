# @anil-labs/lightbox-gallery-react

React bindings for [`@anil-labs/lightbox-gallery-core`](https://www.npmjs.com/package/@anil-labs/lightbox-gallery-core) — a modern lightbox gallery with zoom, swipe, thumbnails, slideshow, fullscreen and video support.

```bash
pnpm add @anil-labs/lightbox-gallery-react @anil-labs/lightbox-gallery-core
```

```tsx
import { Lightbox, useLightbox } from '@anil-labs/lightbox-gallery-react'
import '@anil-labs/lightbox-gallery-core/styles.css'

function Gallery({ items }) {
  const { open, lightboxProps } = useLightbox(items, { loop: true })
  return (
    <>
      {items.map((item, i) => (
        <button key={item.src} onClick={() => open(i)}>
          <img src={item.thumb} alt={item.caption} />
        </button>
      ))}
      <Lightbox {...lightboxProps} />
    </>
  )
}
```

Also works fully controlled via `open` / `index` / `onClose` / `onIndexChange` props.

Full documentation: see the repository README.

MIT
