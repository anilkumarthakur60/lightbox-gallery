# lightbox-gallery

<p>
  <a href="https://www.npmjs.com/package/@anil-labs/lightbox-gallery-core"><img src="https://img.shields.io/npm/v/@anil-labs/lightbox-gallery-core.svg?color=cb3837&label=npm" alt="npm version" /></a>
  <a href="https://bundlephobia.com/package/@anil-labs/lightbox-gallery-core"><img src="https://img.shields.io/bundlephobia/minzip/@anil-labs/lightbox-gallery-core?label=min%2Bgzip" alt="bundle size" /></a>
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen.svg" alt="zero dependencies" />
  <img src="https://img.shields.io/badge/TypeScript-ready-3178c6.svg" alt="TypeScript" />
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT" /></a>
</p>

A modern, **dependency-free** lightbox gallery for the web — zoom, pinch, swipe, thumbnails, slideshow, video and full accessibility — with first-class bindings for **React**, **Vue 3**, **Svelte**, **Solid** and a framework-agnostic **Web Component**.

- 🪶 **Zero dependencies**, ~10 kB min+gzip core
- 🧩 One engine, six packages — pick your framework, share one API
- 📱 Touch-first: pinch-zoom, momentum pan, swipe-to-close
- ♿ Accessible and SSR-safe by default

> **[🚀 Live demos](https://lightbox-gallery-three.vercel.app)** &nbsp;·&nbsp; **[📖 Documentation](https://github.com/anilkumarthakur60/lightbox-gallery)**

---

## Contents

- [Packages](#packages)
- [Features](#features)
- [Quick start](#quick-start)
  - [Vanilla](#vanilla) · [CDN](#cdn--no-build-step) · [React](#react) · [Vue 3](#vue-3) · [Svelte](#svelte) · [Solid](#solid) · [Web Component](#web-component)
- [Items](#items)
- [Options](#options)
- [Instance API](#instance-api)
- [Events](#events)
- [Recipes](#recipes)
- [Theming](#theming)
- [Browser support](#browser-support)
- [Development](#development)
- [Releasing](#releasing)
- [License](#license)

## Packages

| Package | Description | Size |
| --- | --- | --- |
| [`@anil-labs/lightbox-gallery-core`](packages/core) | Framework-agnostic engine (vanilla TS). Everything lives here. | core |
| [`@anil-labs/lightbox-gallery-react`](packages/react) | `<Lightbox>` component + `useLightbox` hook. | tiny wrapper |
| [`@anil-labs/lightbox-gallery-vue`](packages/vue) | `<Lightbox>` component (`v-model`), `useLightbox` composable, plugin. | tiny wrapper |
| [`@anil-labs/lightbox-gallery-svelte`](packages/svelte) | `createLightbox` store controller + `use:lightbox` action. | tiny wrapper |
| [`@anil-labs/lightbox-gallery-solid`](packages/solid) | `<Lightbox>` component + `useLightbox` signals. | tiny wrapper |
| [`@anil-labs/lightbox-gallery-element`](packages/element) | `<lightbox-gallery>` custom element — any framework, or a plain `<script>` tag. | self-contained |

## Features

- 🔍 **Zoom** — mouse wheel / trackpad, pinch, double-tap / double-click, toolbar buttons; anchored zoom with pan clamping and **momentum panning**
- 👆 **Gestures** — swipe to navigate with velocity snapping, drag to pan, swipe up/down to close, **pinch-to-close**
- ✨ **FLIP animation** — the image expands from the clicked thumbnail on open and returns to it on close (`animateFrom`; automatic with `bindGallery`)
- 🔗 **Hash routing** — shareable per-slide URLs (`#gallery=3`), browser back button closes the lightbox, deep-linking on load
- 🖼 **Thumbnail strip** with active tracking and auto-scroll
- ▶️ **Slideshow** — configurable delay, progress bar, pause-on-hover, waits for videos to finish before advancing
- 🔄 **Rotate & flip** — rotate left/right, flip horizontal/vertical
- 📤 **Share** — Web Share API with copy-link fallback
- ⛶ **Fullscreen**, 🎬 **video & embeds** (HTML5, YouTube / Vimeo / Wistia auto-embed + custom provider registry), 📝 **captions**, arbitrary HTML slides
- ♾️ **Infinite galleries** — `end-reached` event + `appendItems()` for dynamic loading
- 🧩 **Inline mode** — render as an embedded carousel inside any container instead of a fullscreen overlay
- ⌨️ **Keyboard** — arrows, `Escape`, `+` / `-` / `0` zoom, `f` fullscreen
- ♿ **Accessible** — `role="dialog"`, focus trap, focus restore, ARIA labels, `prefers-reduced-motion`; **i18n** via the `labels` option; **RTL** support
- 🎨 **Themeable** — CSS custom properties + built-in presets (`lbg-theme-light`, `lbg-theme-glass`, `lbg-theme-minimal`); custom toolbar buttons
- 📱 Responsive and touch-first; `srcset` / `sizes`; neighbour preloading; SSR-safe (no DOM access until opened)
- 📦 ESM + CJS + IIFE (CDN) builds with full TypeScript types; zero dependencies

## Quick start

### Vanilla

```bash
pnpm add @anil-labs/lightbox-gallery-core
```

```ts
import { Lightbox, bindGallery } from '@anil-labs/lightbox-gallery-core'
import '@anil-labs/lightbox-gallery-core/styles.css'

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
// (automatic FLIP thumbnail animation + hash deep-linking)
// <a href="large.jpg" data-gallery data-caption="Sunrise"><img src="thumb.jpg"></a>
bindGallery('a[data-gallery]', { loop: true, hash: true, share: true })
```

### CDN / no build step

```html
<link rel="stylesheet" href="https://unpkg.com/@anil-labs/lightbox-gallery-core/dist/styles.css" />
<script src="https://unpkg.com/@anil-labs/lightbox-gallery-core"></script>
<script>
  LightboxGallery.bindGallery('a[data-gallery]', { hash: true })
</script>
```

Or the self-contained Web Component (styles included):

```html
<script src="https://unpkg.com/@anil-labs/lightbox-gallery-element"></script>
<lightbox-gallery bind="a">
  <a href="large-1.jpg"><img src="thumb-1.jpg" alt="" /></a>
  <a href="large-2.jpg"><img src="thumb-2.jpg" alt="" /></a>
</lightbox-gallery>
```

### React

```bash
pnpm add @anil-labs/lightbox-gallery-react @anil-labs/lightbox-gallery-core
```

```tsx
import { Lightbox, useLightbox } from '@anil-labs/lightbox-gallery-react'
import '@anil-labs/lightbox-gallery-core/styles.css'

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

### Vue 3

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

### Svelte

```bash
pnpm add @anil-labs/lightbox-gallery-svelte @anil-labs/lightbox-gallery-core
```

```svelte
<script>
  import { createLightbox } from '@anil-labs/lightbox-gallery-svelte'
  import '@anil-labs/lightbox-gallery-core/styles.css'

  const gallery = createLightbox(items, { loop: true })
</script>

{#each items as item, i}
  <button on:click={() => gallery.open(i)}><img src={item.thumb} alt="" /></button>
{/each}
```

### Solid

```bash
pnpm add @anil-labs/lightbox-gallery-solid @anil-labs/lightbox-gallery-core
```

```tsx
import { Lightbox, useLightbox } from '@anil-labs/lightbox-gallery-solid'
import '@anil-labs/lightbox-gallery-core/styles.css'

function Gallery() {
  const lb = useLightbox()
  return (
    <>
      <button onClick={() => lb.open(0)}>Open</button>
      <Lightbox items={items} open={lb.isOpen()} index={lb.index()}
                onClose={lb.close} onIndexChange={lb.setIndex} />
    </>
  )
}
```

### Web Component

```bash
pnpm add @anil-labs/lightbox-gallery-element
```

```js
import '@anil-labs/lightbox-gallery-element' // registers <lightbox-gallery>, injects styles

const el = document.querySelector('lightbox-gallery')
el.items = [{ src: '/photos/1.jpg', caption: 'Sunrise' }]
el.options = { loop: true, share: true }
el.open(0)
```

## Items

```ts
interface LightboxItem {
  src: string          // image / video URL, or YouTube/Vimeo/Wistia page URL
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
  shareUrl?: string    // share button target (falls back to src)
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
| `swipeToClose` | `true` | Vertical swipe closes (touch/pen only) |
| `pinchToClose` | `true` | Pinch inward below 1× closes (touch) |
| `momentum` | `true` | Inertia after releasing a pan |
| `keyboard` | `true` | Keyboard navigation |
| `counter` | `true` | "3 / 12" counter |
| `captions` | `true` | Show captions |
| `captionHTML` | `false` | Render captions as HTML (trusted content only) |
| `thumbnails` | `true` | Thumbnail strip |
| `fullscreen` | `true` | Fullscreen button |
| `slideshow` | `true` | Slideshow button |
| `slideshowDelay` | `4000` | Autoplay delay (ms) |
| `slideshowProgress` | `true` | Progress bar while playing |
| `slideshowPauseOnHover` | `true` | Pause autoplay while hovering |
| `download` | `false` | Download button |
| `share` | `false` | Share button (Web Share API / copy link) |
| `rotate` | `false` | Rotate + flip buttons for images |
| `hash` | `false` | URL-hash routing; pass a string for a custom key |
| `inline` | `false` | Inline carousel mode (requires `container`) |
| `closeOnBackdrop` | `true` | Click outside the media closes |
| `preload` | `2` | Neighbouring images preloaded per side |
| `animation` | `'zoom'` | Open animation: `'zoom' \| 'fade' \| 'none'` |
| `animateFrom` | — | `(index) => HTMLElement` for the FLIP thumbnail transition |
| `rtl` | auto | Right-to-left mode (defaults to `document.dir`) |
| `labels` | — | Override any UI string (i18n) |
| `toolbarButtons` | — | Custom toolbar buttons `{ id, label, icon, onClick }` |
| `className` | — | Extra class on the root (theming) |
| `container` | `document.body` | Mount element |

## Instance API

```ts
lightbox.open(index?)      lightbox.close()          lightbox.destroy()
lightbox.next()            lightbox.prev()           lightbox.goTo(index)
lightbox.zoomIn()          lightbox.zoomOut()        lightbox.resetZoom()
lightbox.rotateLeft()      lightbox.rotateRight()    lightbox.flipHorizontal() / flipVertical()
lightbox.startSlideshow()  lightbox.stopSlideshow()  lightbox.toggleFullscreen()
lightbox.share()           lightbox.setItems(items)  lightbox.appendItems(items)

// getters
lightbox.index  lightbox.isOpen  lightbox.scale  lightbox.rotationDegrees
lightbox.length  lightbox.currentItem  lightbox.isSlideshowRunning

// static
Lightbox.version            Lightbox.parseHash(key?)   // deep-link helper
```

## Events

```ts
const off = lightbox.on('change', (index, item) => { /* ... */ })
off() // unsubscribe
```

| Event | Payload |
| --- | --- |
| `open` | `(index)` |
| `close` | — |
| `change` | `(index, item)` |
| `zoom` | `(scale)` |
| `rotate` | `(degrees)` |
| `flip` | `(horizontal, vertical)` |
| `share` | `(item, index)` |
| `end-reached` | — (within one slide of the end) |
| `slideshow:start` / `slideshow:stop` | — |
| `fullscreen:enter` / `fullscreen:exit` | — |
| `error` | `(item, index)` |

## Recipes

### Infinite / dynamically-loaded galleries

```ts
lightbox.on('end-reached', async () => {
  const more = await fetchNextPage()
  lightbox.appendItems(more)
})
```

### Custom embed providers

```ts
import { registerEmbedProvider } from '@anil-labs/lightbox-gallery-core'

registerEmbedProvider({
  name: 'loom',
  match: /loom\.com\/share\/(\w+)/,
  embed: (m) => `https://www.loom.com/embed/${m[1]}`,
})
```

### Internationalisation

```ts
new Lightbox({
  items,
  labels: {
    close: 'Fermer',
    next: 'Suivant',
    previous: 'Précédent',
    download: 'Télécharger',
  },
})
```

### Inline carousel

```ts
new Lightbox({
  items,
  inline: true,
  container: document.getElementById('carousel')!,
}).open()
```

## Theming

Built-in presets via `className`: `lbg-theme-light`, `lbg-theme-glass`, `lbg-theme-minimal` — or override the CSS custom properties:

```css
.my-theme {
  --lbg-bg: rgba(255, 255, 255, 0.96);
  --lbg-fg: #111;
  --lbg-muted: rgba(0, 0, 0, 0.55);
  --lbg-accent: #e91e63;
  --lbg-btn-bg: rgba(0, 0, 0, 0.06);
  --lbg-btn-bg-hover: rgba(0, 0, 0, 0.14);
  --lbg-thumb-size: 72px;
  --lbg-radius: 10px;
  --lbg-z: 5000;
}
```

```ts
new Lightbox({ items, className: 'my-theme' })
```

## Browser support

Evergreen browsers (Chrome, Edge, Firefox, Safari) on desktop and mobile. Uses Pointer Events, `IntersectionObserver`-free lazy patterns, and the Fullscreen / Web Share APIs where available (both degrade gracefully). No IE support.

## Development

```bash
pnpm install
pnpm build            # build all packages
pnpm test             # run tests
pnpm typecheck        # type-check all packages
pnpm docs:dev         # run the VitePress docs site
pnpm example:react    # or example:vue / svelte / solid / element / vanilla
pnpm build:demos      # assemble all example apps into dist-demos/
```

Repository layout:

```
packages/     core + 5 framework bindings (published to npm)
examples/     one runnable Vite app per framework
docs/         VitePress documentation site
scripts/      build-demos.mjs (assembles the deployable demo site)
```

## Releasing

Versioning and publishing use [changesets](https://github.com/changesets/changesets):

```bash
pnpm changeset          # describe your change
pnpm version-packages   # bump versions + changelogs
pnpm release            # build + publish all public packages
```

Each package also has a `prepack` build hook, so a stale `dist` can never be published.

## License

[MIT](./LICENSE) © Er. Anil Kumar Thakur
