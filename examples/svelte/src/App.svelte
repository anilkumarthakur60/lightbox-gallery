<script>
  import { createLightbox } from '@anil-labs/lightbox-gallery-svelte'

  const items = [
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

  const gallery = createLightbox(items, { loop: true, download: true, share: true, rotate: true })
  const { isOpen, index } = gallery
</script>

<h1>lightbox-gallery — Svelte</h1>
<p>Click any image. Try wheel zoom, swipe, double-click, arrow keys, f, Escape.</p>

<div class="grid">
  {#each items as item, i}
    <button onclick={() => gallery.open(i)}>
      <img src={item.thumb} alt={item.caption} loading="lazy" />
    </button>
  {/each}
</div>

<p class="status">Gallery open: {$isOpen} · slide {$index + 1} / {items.length}</p>
