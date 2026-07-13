# Svelte

::: tip Live demo
▶️ [Open the Svelte demo](https://lightbox-gallery-three.vercel.app/svelte/) — click a thumbnail to try zoom, swipe, slideshow, share and more.
:::

```bash
pnpm add @anil-labs/lightbox-gallery-svelte @anil-labs/lightbox-gallery-core
```

Works with Svelte 4 and 5. Import the stylesheet once (from the core package).

## `createLightbox` controller (recommended)

`createLightbox` returns a controller whose `isOpen` and `index` are Svelte stores.

```svelte
<script>
  import { createLightbox } from '@anil-labs/lightbox-gallery-svelte'
  import '@anil-labs/lightbox-gallery-core/styles.css'

  const items = [
    { src: '/photos/1.jpg', thumb: '/photos/1-t.jpg', caption: 'Sunrise' },
    { src: '/photos/2.jpg', thumb: '/photos/2-t.jpg', caption: 'Dunes' },
  ]

  const gallery = createLightbox(items, { loop: true, share: true })
  const { isOpen, index } = gallery
</script>

<div class="grid">
  {#each items as item, i}
    <button on:click={() => gallery.open(i)}>
      <img src={item.thumb} alt={item.caption} />
    </button>
  {/each}
</div>

<p>Open: {$isOpen} · slide {$index + 1} / {items.length}</p>
```

Controller API:

```ts
gallery.open(index?)
gallery.close()
gallery.goTo(index)
gallery.setItems(items)
gallery.isOpen   // Readable<boolean>
gallery.index    // Readable<number>
gallery.lightbox // the core instance (or null before first open)
gallery.destroy()
```

## `use:lightbox` action

Progressive enhancement for existing links:

```svelte
<script>
  import { lightbox } from '@anil-labs/lightbox-gallery-svelte'
  import '@anil-labs/lightbox-gallery-core/styles.css'
</script>

<div use:lightbox={{ selector: 'a', loop: true }}>
  <a href="1-large.jpg"><img src="1-thumb.jpg" alt="" /></a>
  <a href="2-large.jpg"><img src="2-thumb.jpg" alt="" /></a>
</div>
```
