# Web Component

::: tip Live demo
▶️ [Open the Web Component demo](https://anil-labs-lightbox-gallery.vercel.app/element/) — click a thumbnail to try zoom, swipe, slideshow, share and more.
:::

`<lightbox-gallery>` is a custom element that works in any framework — or plain HTML with a `<script>` tag. Styles are injected automatically, so there's no separate CSS import.

```bash
pnpm add @anil-labs/lightbox-gallery-element
```

## Script tag (no build step)

```html
<script src="https://unpkg.com/@anil-labs/lightbox-gallery-element"></script>

<lightbox-gallery bind="a">
  <a href="1-large.jpg" data-caption="Sunrise"><img src="1-thumb.jpg" alt="Sunrise" /></a>
  <a href="2-large.jpg" data-caption="Dunes"><img src="2-thumb.jpg" alt="Dunes" /></a>
</lightbox-gallery>
```

The `bind` attribute is a CSS selector; matching descendant links become the gallery.

## Bundler

```js
import '@anil-labs/lightbox-gallery-element' // registers the element + injects styles
```

### Programmatic

```js
const el = document.querySelector('lightbox-gallery')
el.items = [
  { src: '/photos/1.jpg', caption: 'Sunrise' },
  { src: '/photos/2.jpg', caption: 'Dunes' },
]
el.options = { loop: true, share: true }
el.open(0)
```

## Attributes, properties & methods

| | |
| --- | --- |
| Attribute `bind` | CSS selector for progressive enhancement |
| Attribute `open` | present ⇒ open; removed ⇒ close |
| Attribute `index` | current slide (reflected) |
| Property `.items` | `LightboxItem[]` |
| Property `.options` | all [options](/reference/options) except `items` |
| Method `.open(index?)` / `.close()` / `.refresh()` | |

## Events

The element dispatches `CustomEvent`s:

```js
el.addEventListener('lbg-open', (e) => console.log(e.detail.index))
el.addEventListener('lbg-change', (e) => console.log(e.detail.index, e.detail.item))
el.addEventListener('lbg-close', () => {})
```

## Using in frameworks

Because it's a standard custom element, it works in Angular, Astro, Qwik, Lit, plain HTML — anywhere. In JSX you may need to type it as an intrinsic element; in Vue templates it "just works" (custom elements pass through).

## Custom tag name

The element auto-registers as `<lightbox-gallery>`. To use a different tag, import the class and register it yourself:

```js
import { LightboxGalleryElement, register } from '@anil-labs/lightbox-gallery-element'
register('my-gallery') // or customElements.define('my-gallery', LightboxGalleryElement)
```
