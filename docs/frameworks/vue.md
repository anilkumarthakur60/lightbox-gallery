# Vue 3

::: tip Live demo
▶️ [Open the Vue demo](https://anil-labs-lightbox-gallery.vercel.app/vue/) — click a thumbnail to try zoom, swipe, slideshow, share and more.
:::

```bash
pnpm add @anil-labs/lightbox-gallery-vue @anil-labs/lightbox-gallery-core
```

Requires Vue 3.3+. Import the stylesheet once (from the core package).

## `v-model` component (recommended)

The component supports `v-model:open` and `v-model:index`. The `useLightbox` composable gives you the reactive state.

```vue
<script setup>
import { Lightbox, useLightbox } from '@anil-labs/lightbox-gallery-vue'
import '@anil-labs/lightbox-gallery-core/styles.css'

const items = [
  { src: '/photos/1.jpg', thumb: '/photos/1-t.jpg', caption: 'Sunrise' },
  { src: '/photos/2.jpg', thumb: '/photos/2-t.jpg', caption: 'Dunes' },
]

const { isOpen, index, open } = useLightbox()
</script>

<template>
  <div class="grid">
    <button v-for="(item, i) in items" :key="item.src" @click="open(i)">
      <img :src="item.thumb" :alt="item.caption" />
    </button>
  </div>

  <Lightbox
    :items="items"
    v-model:open="isOpen"
    v-model:index="index"
    :options="{ loop: true, share: true }"
    @change="(i, item) => {}"
    @zoom="(scale) => {}"
  />
</template>
```

## Props & events

| Prop | Type |
| --- | --- |
| `items` | `LightboxItem[]` (required) |
| `open` | `boolean` (`v-model:open`) |
| `index` | `number` (`v-model:index`) |
| `options` | all [options](/reference/options) except `items` |

Emitted events: `update:open`, `update:index`, `change (index, item)`, `close`, `zoom (scale)`.

## Global plugin

Register `<LightboxGallery>` app-wide:

```ts
import { createApp } from 'vue'
import { LightboxPlugin } from '@anil-labs/lightbox-gallery-vue'
import '@anil-labs/lightbox-gallery-core/styles.css'

createApp(App).use(LightboxPlugin).mount('#app')
```

```vue
<LightboxGallery :items="items" v-model:open="isOpen" v-model:index="index" />
```

The component renders nothing in place — it portals to `document.body` via the core engine.
