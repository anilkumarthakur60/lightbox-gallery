# @lightbox-gallery/svelte

Svelte bindings for [`@lightbox-gallery/core`](https://www.npmjs.com/package/@lightbox-gallery/core) — a modern lightbox gallery with zoom, swipe, thumbnails, slideshow, fullscreen and video support. Works with Svelte 4 and 5.

```bash
pnpm add @lightbox-gallery/svelte @lightbox-gallery/core
```

```svelte
<script>
  import { createLightbox } from '@lightbox-gallery/svelte'
  import '@lightbox-gallery/core/styles.css'

  const items = [{ src: '/photos/1.jpg', caption: 'Sunrise' }]
  const gallery = createLightbox(items, { loop: true })
  const { isOpen, index } = gallery
</script>

{#each items as item, i}
  <button on:click={() => gallery.open(i)}><img src={item.thumb} alt="" /></button>
{/each}
```

Also ships a `use:lightbox` action for progressive enhancement of plain links.

Full documentation: see the repository README.

MIT
