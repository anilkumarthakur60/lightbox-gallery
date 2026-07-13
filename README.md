# lightbox-gallery

A modern, dependency-free lightbox gallery for the web — with first-class **React** and **Vue 3** bindings.

| Package | Description |
| --- | --- |
| [`@lightbox-gallery/core`](packages/core) | Framework-agnostic engine (vanilla TS). Everything lives here. |
| [`@lightbox-gallery/react`](packages/react) | `<Lightbox>` component + `useLightbox` hook. |
| [`@lightbox-gallery/vue`](packages/vue) | `<Lightbox>` component (`v-model`), `useLightbox` composable, plugin. |

## Features

- 🔍 **Zoom** — mouse wheel / trackpad, pinch, double-tap / double-click, toolbar buttons; anchored zoom with pan clamping
- 👆 **Gestures** — swipe to navigate with velocity snapping, drag to pan when zoomed, swipe up/down to close
- 🖼 **Thumbnail strip** with active tracking and auto-scroll
- ▶️ **Slideshow** (autoplay) with configurable delay
- ⛶ **Fullscreen** support
- 🎬 **Video & embeds** — HTML5 video, YouTube / Vimeo URLs auto-converted to embeds, arbitrary HTML slides
- 📝 **Captions** (plain text by default, opt-in HTML)
- ⌨️ **Keyboard** — arrows, `Escape`, `+` / `-` / `0` zoom, `f` fullscreen
- ♿ **Accessible** — `role="dialog"`, focus trap, focus restore, ARIA labels, `prefers-reduced-motion`
- 📱 **Responsive** and touch-first; `srcset` / `sizes` support; neighbour preloading
- 🎨 **Themeable** via CSS custom properties; zero dependencies; SSR-safe (no DOM access until opened)
- 📦 ESM + CJS builds with full TypeScript types

## Quick start

### Vanilla

```bash
pnpm add @lightbox-gallery/core
```

```ts
import { Lightbox, bindGallery } from '@lightbox-gallery/core'
import '@lightbox-gallery/core/styles.css'

// Option A — programmatic
const lightbox = new Lightbox({
  items: [
    { src: '/photos/1.jpg', caption: 'Sunrise' },
    { src: '/photos/2.jpg', caption: 'Dunes' },
    { src: 'https://youtu.be/dQw4w9WgXcQ', caption: 'A video' },
  ],
  loop: true,
})
lightbox.open(0)

// Option B — progressive enhancement from links
// <a href="large.jpg" data-gallery data-caption="Sunrise"><img src="thumb.jpg"></a>
bindGallery('a[data-gallery]', { loop: true })
```

### React

```bash
pnpm add @lightbox-gallery/react
```

```tsx
import { Lightbox, useLightbox } from '@lightbox-gallery/react'
import '@lightbox-gallery/core/styles.css'

function Gallery({ items }) {
  const { open, lightboxProps } = useLightbox(items, { loop: true })
  return (
    <>
      {items.map((item, i) => (
        <button key={item.src} onClick={() => open(i)}>
          <img src={item.thumb} alt={item.caption} />
        </button>
      ))}
      <Lightbox {...lightboxProps} />
    </>
  )
}
```

Or fully controlled: `<Lightbox items={items} open={open} index={index} onClose={...} onIndexChange={...} />`.

### Vue 3

```bash
pnpm add @lightbox-gallery/vue
```

```vue
<script setup>
import { Lightbox, useLightbox } from '@lightbox-gallery/vue'
import '@lightbox-gallery/core/styles.css'

const items = [{ src: '/photos/1.jpg', caption: 'Sunrise' }]
const { isOpen, index, open } = useLightbox()
</script>

<template>
  <button @click="open(0)">Open gallery</button>
  <Lightbox :items="items" v-model:open="isOpen" v-model:index="index" :options="{ loop: true }" />
</template>
```

## Items

```ts
interface LightboxItem {
  src: string          // image / video URL, or YouTube/Vimeo page URL
  type?: 'image' | 'video' | 'iframe' | 'html'  // auto-detected when omitted
  thumb?: string       // thumbnail strip image
  caption?: string
  alt?: string
  srcset?: string
  sizes?: string
  poster?: string      // video poster
  html?: string        // content for type: 'html'
  downloadUrl?: string
  downloadFilename?: string
}
```

## Options

| Option | Default | Description |
| --- | --- | --- |
| `startIndex` | `0` | Slide opened by default |
| `loop` | `true` | Wrap around at the ends |
| `zoom` | `true` | Enable image zooming |
| `maxZoom` | `4` | Maximum zoom scale |
| `doubleTapZoom` | `2.5` | Scale used by double-tap / double-click |
| `wheelZoom` | `true` | Zoom with wheel / trackpad |
| `swipe` | `true` | Swipe / drag navigation |
| `swipeToClose` | `true` | Vertical swipe closes the gallery |
| `keyboard` | `true` | Keyboard navigation |
| `counter` | `true` | "3 / 12" counter |
| `captions` | `true` | Show captions |
| `captionHTML` | `false` | Render captions as HTML (trusted content only) |
| `thumbnails` | `true` | Thumbnail strip |
| `fullscreen` | `true` | Fullscreen button |
| `slideshow` | `true` | Slideshow button |
| `slideshowDelay` | `4000` | Autoplay delay (ms) |
| `download` | `false` | Download button |
| `closeOnBackdrop` | `true` | Click outside the media closes |
| `preload` | `2` | Neighbouring images preloaded per side |
| `animation` | `'zoom'` | Open animation: `'zoom' \| 'fade' \| 'none'` |
| `className` | — | Extra class on the root (theming) |
| `container` | `document.body` | Mount element |

## API (core instance)

```ts
lightbox.open(index?)      lightbox.close()          lightbox.destroy()
lightbox.next()            lightbox.prev()           lightbox.goTo(index)
lightbox.zoomIn()          lightbox.zoomOut()        lightbox.resetZoom()
lightbox.startSlideshow()  lightbox.stopSlideshow()  lightbox.toggleFullscreen()
lightbox.setItems(items)
lightbox.index  lightbox.isOpen  lightbox.scale  lightbox.length  lightbox.currentItem
```

### Events

```ts
const off = lightbox.on('change', (index, item) => { ... })
```

`open(index)` · `close` · `change(index, item)` · `zoom(scale)` · `slideshow:start` · `slideshow:stop` · `fullscreen:enter` · `fullscreen:exit` · `error(item, index)`

## Theming

Override the CSS custom properties on `.lbg-root` (globally or via the `className` option):

```css
.my-theme {
  --lbg-bg: rgba(255, 255, 255, 0.96);
  --lbg-fg: #111;
  --lbg-accent: #e91e63;
  --lbg-thumb-size: 72px;
  --lbg-z: 5000;
}
```

## Development

```bash
pnpm install
pnpm build            # build all packages
pnpm test             # run tests
pnpm example:vanilla  # or example:react / example:vue
```

## Publishing

The packages use the `workspace:` protocol; pnpm rewrites versions on publish.

```bash
pnpm build
pnpm -r --filter "./packages/*" publish --access public
```

> **Note:** the `@lightbox-gallery` npm scope must be available to (or owned by) your npm account — rename the packages in the three `package.json` files if you prefer a different scope.

## License

MIT
