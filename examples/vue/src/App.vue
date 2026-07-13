<script setup lang="ts">
import { Lightbox, useLightbox, type LightboxItem } from '@anil-labs/lightbox-gallery-vue'

const items: LightboxItem[] = [
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

const { isOpen, index, open } = useLightbox()
</script>

<template>
  <h1>lightbox-gallery — Vue</h1>
  <p>Click any image. Try wheel/pinch zoom, swipe, double-click, arrow keys, f, Escape.</p>
  <div class="grid">
    <button v-for="(item, i) in items" :key="item.src" @click="open(i)">
      <img :src="item.thumb" :alt="item.caption" loading="lazy" />
    </button>
  </div>
  <Lightbox
    :items="items"
    v-model:open="isOpen"
    v-model:index="index"
    :options="{ loop: true, download: true, share: true, rotate: true }"
  />
</template>
