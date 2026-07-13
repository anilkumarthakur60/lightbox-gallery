# Inline Mode

Render the gallery **inside a container** as an embedded carousel instead of a fullscreen overlay — perfect for product pages and hero galleries.

```ts
new Lightbox({
  items,
  inline: true,
  container: document.getElementById('carousel')!,
}).open()
```

```html
<div id="carousel" style="height: 480px; border-radius: 12px;"></div>
```

## What changes in inline mode

- Positions **absolutely inside `container`** (which is given `position: relative; overflow: hidden`) rather than fixed over the page.
- **No page-scroll lock**, no backdrop-click-to-close, no close button.
- **Swipe/pinch-to-close and hash routing are disabled** (there's nothing to dismiss).
- Everything else — zoom, swipe navigation, thumbnails, slideshow, captions, keyboard (when the container is focused) — works as usual.

Give the container a height (or aspect ratio); the gallery fills it.

## Uncontrolled overlay vs inline

| | Overlay (default) | Inline |
| --- | --- | --- |
| Mount | `document.body`, fixed | your `container`, absolute |
| Scroll lock | yes | no |
| Close affordances | backdrop, ✕, Esc, swipe/pinch | navigation only |
| Hash routing | supported | disabled |
