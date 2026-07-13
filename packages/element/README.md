# @lightbox-gallery/element

`<lightbox-gallery>` Web Component for [`@lightbox-gallery/core`](https://www.npmjs.com/package/@lightbox-gallery/core) — use the lightbox in any framework or plain HTML. Styles are injected automatically.

## Script tag (no build step)

```html
<script src="https://unpkg.com/@lightbox-gallery/element"></script>

<lightbox-gallery bind="a">
  <a href="large-1.jpg" data-caption="Sunrise"><img src="thumb-1.jpg" alt="" /></a>
  <a href="large-2.jpg" data-caption="Dunes"><img src="thumb-2.jpg" alt="" /></a>
</lightbox-gallery>
```

## Bundler

```bash
pnpm add @lightbox-gallery/element
```

```js
import '@lightbox-gallery/element' // registers <lightbox-gallery>

const el = document.querySelector('lightbox-gallery')
el.items = [{ src: '/photos/1.jpg', caption: 'Sunrise' }]
el.options = { loop: true, share: true }
el.open(0)
```

Events: `lbg-open`, `lbg-close`, `lbg-change` (`detail: { index, item }`).

Full documentation: see the repository README.

MIT
