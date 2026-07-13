# Getting Started

::: tip See it live
▶️ [Live demos](https://lightbox-gallery-three.vercel.app) for React, Vue, Svelte, Solid and the Web Component.
:::

## Installation

Install the core package (plus your framework binding, if any). The core ships the stylesheet you import once.

::: code-group

```bash [pnpm]
pnpm add @anil-labs/lightbox-gallery-core
```

```bash [npm]
npm install @anil-labs/lightbox-gallery-core
```

```bash [yarn]
yarn add @anil-labs/lightbox-gallery-core
```

:::

Framework users add both the binding and the core (the core provides the stylesheet):

```bash
pnpm add @anil-labs/lightbox-gallery-react @anil-labs/lightbox-gallery-core
```

## Your first gallery

```ts
import { Lightbox } from '@anil-labs/lightbox-gallery-core'
import '@anil-labs/lightbox-gallery-core/styles.css'

const lightbox = new Lightbox({
  items: [
    { src: '/photos/1.jpg', caption: 'Sunrise over the dunes' },
    { src: '/photos/2.jpg', caption: 'City lights' },
    { src: '/photos/3.jpg' },
  ],
  loop: true,
})

document.querySelector('#open')!.addEventListener('click', () => lightbox.open(0))
```

That's it — you get zoom, swipe, thumbnails, keyboard navigation and a slideshow out of the box.

## Progressive enhancement

If your page already renders thumbnail links, `bindGallery` turns them into a gallery — and automatically wires the FLIP open/close animation to the clicked thumbnail.

```html
<a href="large-1.jpg" data-gallery data-caption="Sunrise"><img src="thumb-1.jpg" alt="Sunrise" /></a>
<a href="large-2.jpg" data-gallery data-caption="City lights"><img src="thumb-2.jpg" alt="City" /></a>
```

```ts
import { bindGallery } from '@anil-labs/lightbox-gallery-core'
import '@anil-labs/lightbox-gallery-core/styles.css'

bindGallery('a[data-gallery]', { loop: true, hash: true, share: true })
```

`bindGallery` reads each link's `href` (full image), nested `<img>` (thumbnail + alt), and `data-*` attributes (`data-caption`, `data-type`, `data-thumb`, `data-poster`, `data-download-url`, `data-share-url`).

## No build step (CDN)

```html
<link rel="stylesheet" href="https://unpkg.com/@anil-labs/lightbox-gallery-core/dist/styles.css" />
<script src="https://unpkg.com/@anil-labs/lightbox-gallery-core"></script>
<script>
  const lb = new LightboxGallery.Lightbox({
    items: [{ src: '/photos/1.jpg', caption: 'Sunrise' }],
  })
  lb.open()
</script>
```

The global is `LightboxGallery` and exposes everything the module does (`Lightbox`, `bindGallery`, `registerEmbedProvider`, …).

## TypeScript

Every package ships types. Import them directly:

```ts
import type { LightboxItem, LightboxOptions } from '@anil-labs/lightbox-gallery-core'
```

## Next steps

- [Items](./items) — how each slide is described
- [Options](/reference/options) — configure behaviour
- Your framework: [React](/frameworks/react) · [Vue](/frameworks/vue) · [Svelte](/frameworks/svelte) · [Solid](/frameworks/solid) · [Web Component](/frameworks/web-component)
