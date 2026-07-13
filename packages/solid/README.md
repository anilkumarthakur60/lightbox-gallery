# @lightbox-gallery/solid

SolidJS bindings for [`@lightbox-gallery/core`](https://www.npmjs.com/package/@lightbox-gallery/core) — a modern lightbox gallery with zoom, swipe, thumbnails, slideshow, fullscreen and video support.

```bash
pnpm add @lightbox-gallery/solid @lightbox-gallery/core
```

```tsx
import { Lightbox, useLightbox } from '@lightbox-gallery/solid'
import '@lightbox-gallery/core/styles.css'

function Gallery() {
  const lb = useLightbox()
  return (
    <>
      <button onClick={() => lb.open(0)}>Open gallery</button>
      <Lightbox
        items={items}
        open={lb.isOpen()}
        index={lb.index()}
        onClose={lb.close}
        onIndexChange={lb.setIndex}
      />
    </>
  )
}
```

Full documentation: see the repository README.

MIT
