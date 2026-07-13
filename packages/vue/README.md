# @anil-labs/lightbox-gallery-vue

Vue 3 bindings for [`@anil-labs/lightbox-gallery-core`](https://www.npmjs.com/package/@anil-labs/lightbox-gallery-core) — a modern lightbox gallery with zoom, swipe, thumbnails, slideshow, fullscreen and video support.

```bash
pnpm add @anil-labs/lightbox-gallery-vue @anil-labs/lightbox-gallery-core
```

```vue
<script setup>
import { Lightbox, useLightbox } from '@anil-labs/lightbox-gallery-vue'
import '@anil-labs/lightbox-gallery-core/styles.css'

const items = [{ src: '/photos/1.jpg', caption: 'Sunrise' }]
const { isOpen, index, open } = useLightbox()
</script>

<template>
  <button @click="open(0)">Open gallery</button>
  <Lightbox :items="items" v-model:open="isOpen" v-model:index="index" :options="{ loop: true }" />
</template>
```

A global component is also available via the plugin: `app.use(LightboxPlugin)` → `<LightboxGallery>`.

Full documentation: see the repository README.

MIT
