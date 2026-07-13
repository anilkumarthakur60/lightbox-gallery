# Thumbnail (FLIP) Animation

The signature open/close effect: the full image visibly grows out of the thumbnail you clicked, and shrinks back into it on close — a FLIP (First-Last-Invert-Play) transition.

## Automatic with `bindGallery`

When you use progressive enhancement, it's wired for you — the clicked link/image is the origin:

```ts
bindGallery('a[data-gallery]', { animation: 'zoom' })
```

## Manual with `animateFrom`

For programmatic galleries, tell the lightbox which element a given index animates from:

```ts
const thumbs = Array.from(document.querySelectorAll<HTMLElement>('.grid img'))

new Lightbox({
  items,
  animateFrom: (index) => thumbs[index] ?? null,
})
```

In frameworks, return the DOM node for the current index:

```tsx
// React
useLightbox(items, {
  animateFrom: (i) => document.querySelectorAll<HTMLElement>('.grid img')[i] ?? null,
})
```

## Notes

- Applies to **image** slides only, and only when `animation` is `'zoom'` or `'fade'` (not `'none'`).
- If the image is zoomed, rotated or flipped when you close, the FLIP is skipped and it fades out instead.
- Respects `prefers-reduced-motion` — animations collapse to instant.
