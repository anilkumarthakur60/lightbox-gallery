# Vanilla / CDN

::: tip Live demos
▶️ [Browse all live demos](https://anil-labs-lightbox-gallery.vercel.app) — React, Vue, Svelte, Solid and the Web Component, all running the same core engine.
:::

The core package works anywhere — no framework required.

```bash
pnpm add @anil-labs/lightbox-gallery-core
```

## Programmatic

```ts
import { Lightbox } from '@anil-labs/lightbox-gallery-core'
import '@anil-labs/lightbox-gallery-core/styles.css'

const lightbox = new Lightbox({
  items: [
    { src: '/photos/1.jpg', caption: 'Sunrise' },
    { src: '/photos/2.jpg', caption: 'Dunes' },
  ],
  loop: true,
  share: true,
})

button.addEventListener('click', () => lightbox.open(0))
```

## Progressive enhancement

`bindGallery` turns existing thumbnail links into a gallery and wires the FLIP thumbnail animation automatically.

```html
<a href="1-large.jpg" data-gallery data-caption="Sunrise"><img src="1-thumb.jpg" alt="Sunrise" /></a>
<a href="2-large.jpg" data-gallery data-caption="Dunes"><img src="2-thumb.jpg" alt="Dunes" /></a>
```

```ts
import { bindGallery } from '@anil-labs/lightbox-gallery-core'
import '@anil-labs/lightbox-gallery-core/styles.css'

const gallery = bindGallery('a[data-gallery]', { loop: true, hash: true })

gallery.refresh()          // re-scan after adding/removing links
gallery.open(0)            // open programmatically
gallery.lightbox.on('change', (i) => {})
gallery.destroy()
```

Recognised attributes on each element: `href` (full image), nested `<img>` (thumb + alt), `data-caption`, `data-type`, `data-thumb`, `data-poster`, `data-srcset`, `data-download-url`, `data-share-url`.

## CDN (`<script>` tag)

```html
<link rel="stylesheet" href="https://unpkg.com/@anil-labs/lightbox-gallery-core/dist/styles.css" />
<script src="https://unpkg.com/@anil-labs/lightbox-gallery-core"></script>
<script>
  LightboxGallery.bindGallery('a[data-gallery]', { hash: true, share: true })
</script>
```

The global `LightboxGallery` exposes `Lightbox`, `bindGallery`, `registerEmbedProvider`, `detectType`, `toEmbedUrl` and `DEFAULT_LABELS`.

See the [Options](/reference/options), [Instance API](/reference/api) and [Events](/reference/events) reference for everything you can do.
