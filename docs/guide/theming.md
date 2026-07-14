# Theming

The UI is styled entirely with CSS custom properties on the `.lbg-root` element, so you can theme it globally or per-instance without fighting specificity.

## Dark & light mode

The lightbox is **dark by default**. Use the `theme` option to switch:

```ts
new Lightbox({ items })                  // dark (default)
new Lightbox({ items, theme: 'light' })  // light UI
new Lightbox({ items, theme: 'auto' })   // follow the OS (prefers-color-scheme)
```

- **`'auto'`** stays dark and switches to light only when the operating system
  reports a light colour scheme — no JavaScript or listeners needed.
- If your app has its own light/dark toggle, drive it directly:

  ```ts
  new Lightbox({ items, theme: siteIsDark ? 'dark' : 'light' })
  ```

The option is applied as a `lbg-theme-*` class, so it composes with both
`className` and the CSS-custom-property overrides below.

The same option works through every framework binding — for example
`<Lightbox items={items} theme="auto" />` (React/Solid),
`:options="{ theme: 'auto' }"` (Vue), `createLightbox(items, { theme: 'auto' })`
(Svelte), or `el.options = { theme: 'auto' }` (Web Component).

## More built-in presets

Layer these on via `className` (they stack with `theme`):

```ts
new Lightbox({ items, className: 'lbg-theme-glass' })   // frosted blur backdrop
new Lightbox({ items, className: 'lbg-theme-minimal' }) // transparent toolbar
```

## Custom properties

Override any of these — globally on `.lbg-root`, or scoped to your own class:

| Variable | Default | Purpose |
| --- | --- | --- |
| `--lbg-bg` | `rgba(10,10,14,.94)` | Backdrop |
| `--lbg-fg` | `#fff` | Foreground / icons |
| `--lbg-muted` | `rgba(255,255,255,.66)` | Counter, secondary text |
| `--lbg-accent` | `#7dabff` | Focus rings, active thumbnail, progress |
| `--lbg-btn-bg` | `rgba(255,255,255,.08)` | Button background |
| `--lbg-btn-bg-hover` | `rgba(255,255,255,.18)` | Button hover |
| `--lbg-thumb-size` | `56px` | Thumbnail size |
| `--lbg-radius` | `10px` | Corner radius |
| `--lbg-z` | `99999` | Root z-index |

```css
.brand-theme {
  --lbg-bg: rgba(255, 255, 255, 0.96);
  --lbg-fg: #111;
  --lbg-muted: rgba(0, 0, 0, 0.55);
  --lbg-accent: #e91e63;
  --lbg-btn-bg: rgba(0, 0, 0, 0.06);
  --lbg-btn-bg-hover: rgba(0, 0, 0, 0.14);
  --lbg-thumb-size: 72px;
}
```

```ts
new Lightbox({ items, className: 'brand-theme' })
```

## Custom toolbar buttons

Add your own actions to the toolbar (inserted before the close button):

```ts
new Lightbox({
  items,
  toolbarButtons: [
    {
      id: 'favorite',
      label: 'Add to favourites',
      icon: '<svg viewBox="0 0 24 24" width="22" height="22">…</svg>',
      onClick: (lb) => favourite(lb.currentItem),
    },
  ],
})
```

Each button gets the class `lbg-btn lbg-btn-<id>` for styling.

## Reduced motion

All transitions and the enter/FLIP animations are automatically disabled under `@media (prefers-reduced-motion: reduce)`.
