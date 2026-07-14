<script lang="ts">
  import { createLightbox } from '@anil-labs/lightbox-gallery-svelte'
  import type { LightboxItem, LightboxOptions } from '@anil-labs/lightbox-gallery-svelte'

  let { items, options = {} }: { items: LightboxItem[]; options?: Omit<LightboxOptions, 'items'> } =
    $props()

  let grid = $state<HTMLElement>()
  const gallery = createLightbox(items, {
    ...options,
    animateFrom: (i) => grid?.querySelectorAll('img')[i] ?? null,
  })
</script>

<div class="thumbs" bind:this={grid}>
  {#each items as item, i (i)}
    <button class="thumb" onclick={() => gallery.open(i)}>
      <img src={item.thumb ?? item.poster ?? item.src} alt={item.caption ?? ''} loading="lazy" />
      {#if item.type === 'video' || item.src.includes('youtube')}
        <span class="play">▶</span>
      {:else if item.type === 'html'}
        <span class="tag-badge">HTML</span>
      {/if}
    </button>
  {/each}
</div>
