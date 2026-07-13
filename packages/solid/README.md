# @anil-labs/lightbox-gallery-solid

SolidJS bindings for [`@anil-labs/lightbox-gallery-core`](https://www.npmjs.com/package/@anil-labs/lightbox-gallery-core) — a modern lightbox gallery with zoom, swipe, thumbnails, slideshow, fullscreen and video support.

```bash
pnpm add @anil-labs/lightbox-gallery-solid @anil-labs/lightbox-gallery-core
```

```tsx
import { Lightbox, useLightbox } from '@anil-labs/lightbox-gallery-solid'
import '@anil-labs/lightbox-gallery-core/styles.css'

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
