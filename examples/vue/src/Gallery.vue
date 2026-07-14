<script setup lang="ts">
import { computed, ref } from 'vue'
import { Lightbox, useLightbox } from '@anil-labs/lightbox-gallery-vue'
import type { LightboxItem, LightboxOptions } from '@anil-labs/lightbox-gallery-vue'

const props = defineProps<{ items: LightboxItem[]; options?: Omit<LightboxOptions, 'items'> }>()

const gridRef = ref<HTMLElement | null>(null)
const { isOpen, index, open } = useLightbox()

const opts = computed(() => ({
  ...props.options,
  animateFrom: (i: number) => gridRef.value?.querySelectorAll('img')[i] ?? null,
}))
</script>

<template>
  <div class="thumbs" ref="gridRef">
    <button v-for="(item, i) in items" :key="i" class="thumb" @click="open(i)">
      <img :src="item.thumb ?? item.poster ?? item.src" :alt="item.caption ?? ''" loading="lazy" />
      <span v-if="item.type === 'video' || item.src.includes('youtube')" class="play">▶</span>
      <span v-else-if="item.type === 'html'" class="tag-badge">HTML</span>
    </button>
  </div>
  <Lightbox :items="items" v-model:open="isOpen" v-model:index="index" :options="opts" />
</template>
