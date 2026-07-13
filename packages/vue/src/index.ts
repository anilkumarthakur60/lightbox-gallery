import {
  defineComponent,
  onBeforeUnmount,
  ref,
  watch,
  type App,
  type PropType,
  type Ref,
} from 'vue'
import { Lightbox as CoreLightbox } from '@anil-labs/lightbox-gallery-core'
import type { LightboxItem, LightboxOptions } from '@anil-labs/lightbox-gallery-core'

export type { LightboxItem, LightboxOptions } from '@anil-labs/lightbox-gallery-core'
export { Lightbox as CoreLightbox } from '@anil-labs/lightbox-gallery-core'

export type LightboxComponentOptions = Omit<LightboxOptions, 'items' | 'startIndex'>

/**
 * Controlled Vue 3 lightbox. Renders nothing in place — the gallery portals
 * itself to `document.body` via the core library.
 *
 * ```vue
 * <Lightbox :items="items" v-model:open="open" v-model:index="index" :options="{ loop: true }" />
 * ```
 */
export const Lightbox = defineComponent({
  name: 'LightboxGallery',
  props: {
    items: {
      type: Array as PropType<LightboxItem[]>,
      required: true,
    },
    open: {
      type: Boolean,
      default: false,
    },
    index: {
      type: Number,
      default: 0,
    },
    options: {
      type: Object as PropType<LightboxComponentOptions>,
      default: () => ({}),
    },
  },
  emits: {
    'update:open': (_open: boolean) => true,
    'update:index': (_index: number) => true,
    change: (_index: number, _item: LightboxItem) => true,
    close: () => true,
    zoom: (_scale: number) => true,
  },
  setup(props, { emit }) {
    let core: CoreLightbox | null = null

    const destroyCore = (): void => {
      core?.destroy()
      core = null
    }

    const openCore = (): void => {
      destroyCore()
      core = new CoreLightbox({ ...props.options, items: props.items })
      core.on('close', () => {
        emit('close')
        emit('update:open', false)
      })
      core.on('change', (i, item) => {
        emit('update:index', i)
        emit('change', i, item)
      })
      core.on('zoom', (scale) => emit('zoom', scale))
      core.open(props.index)
    }

    watch(
      () => props.open,
      (isOpen) => {
        if (isOpen) openCore()
        else destroyCore()
      },
      { immediate: true },
    )

    watch(
      () => props.index,
      (index) => {
        if (core?.isOpen && core.index !== index) core.goTo(index)
      },
    )

    watch(
      () => props.items,
      (items) => {
        if (core?.isOpen) core.setItems(items)
      },
    )

    onBeforeUnmount(destroyCore)

    return () => null
  },
})

export interface UseLightboxResult {
  /** Whether the lightbox is currently open. */
  isOpen: Ref<boolean>
  /** Current slide index. */
  index: Ref<number>
  /** Open the lightbox, optionally at a given index. */
  open: (index?: number) => void
  /** Close the lightbox. */
  close: () => void
}

/**
 * Convenience composable:
 *
 * ```vue
 * <script setup>
 * const { isOpen, index, open } = useLightbox()
 * </script>
 * <template>
 *   <button @click="open(3)">Show photo 4</button>
 *   <Lightbox :items="items" v-model:open="isOpen" v-model:index="index" />
 * </template>
 * ```
 */
export function useLightbox(): UseLightboxResult {
  const isOpen = ref(false)
  const index = ref(0)

  const open = (i = 0): void => {
    index.value = i
    isOpen.value = true
  }

  const close = (): void => {
    isOpen.value = false
  }

  return { isOpen, index, open, close }
}

/** `app.use(LightboxPlugin)` registers the global `<LightboxGallery>` component. */
export const LightboxPlugin = {
  install(app: App): void {
    app.component('LightboxGallery', Lightbox)
  },
}

export default Lightbox
