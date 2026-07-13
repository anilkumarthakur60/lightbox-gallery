# Hash Routing

Sync the open slide to the URL hash so galleries are deep-linkable and the browser back button closes the lightbox — the behaviour users expect on mobile.

```ts
new Lightbox({ items, hash: true })       // uses #gallery=<n>
new Lightbox({ items, hash: 'photo' })    // custom key → #photo=<n>
```

## What it does

- On open, pushes `#gallery=3` (1-based) to the history.
- Navigating updates the hash in place (no new history entries).
- Pressing **Back** closes the lightbox instead of leaving the page.
- Closing the lightbox cleans the hash back off the URL.

## Deep-linking on load

`bindGallery` reads the hash on load and opens the matching slide automatically:

```ts
bindGallery('a[data-gallery]', { hash: true })
// visiting /page#gallery=3 opens the 3rd image straight away
```

Do it yourself with the static helper:

```ts
import { Lightbox } from '@anil-labs/lightbox-gallery-core'

const start = Lightbox.parseHash('gallery') // → 2 for #gallery=3, or null
if (start !== null) lightbox.open(start)
```

::: warning
Hash routing is disabled in [inline mode](./inline-mode) (there's no overlay to route to).
:::
