# @anil-labs/lightbox-gallery-core

Framework-agnostic, dependency-free lightbox gallery: zoom & pinch, swipe navigation, swipe-to-close, thumbnails, slideshow, fullscreen, captions, HTML5 video + YouTube/Vimeo embeds, keyboard navigation and full a11y.

```bash
pnpm add @anil-labs/lightbox-gallery-core
```

```ts
import { Lightbox } from '@anil-labs/lightbox-gallery-core'
import '@anil-labs/lightbox-gallery-core/styles.css'

new Lightbox({
  items: [{ src: '/photos/1.jpg', caption: 'Sunrise' }],
}).open()
```

Framework bindings: [`@anil-labs/lightbox-gallery-react`](https://www.npmjs.com/package/@anil-labs/lightbox-gallery-react) · [`@anil-labs/lightbox-gallery-vue`](https://www.npmjs.com/package/@anil-labs/lightbox-gallery-vue)

Full documentation: see the repository README.

MIT
