# React

::: tip Live demo
▶️ [Open the React demo](https://anil-labs-lightbox-gallery.vercel.app/react/) — click a thumbnail to try zoom, swipe, slideshow, share and more.
:::

```bash
pnpm add @anil-labs/lightbox-gallery-react @anil-labs/lightbox-gallery-core
```

Requires React 17+. Import the stylesheet once (from the core package).

## `useLightbox` hook (recommended)

The hook manages open/index state and hands you props to spread onto `<Lightbox>`.

```tsx
import { Lightbox, useLightbox } from '@anil-labs/lightbox-gallery-react'
import '@anil-labs/lightbox-gallery-core/styles.css'

const items = [
  { src: '/photos/1.jpg', thumb: '/photos/1-t.jpg', caption: 'Sunrise' },
  { src: '/photos/2.jpg', thumb: '/photos/2-t.jpg', caption: 'Dunes' },
]

export function Gallery() {
  const { open, lightboxProps } = useLightbox(items, { loop: true, share: true })

  return (
    <>
      <div className="grid">
        {items.map((item, i) => (
          <button key={item.src} onClick={() => open(i)}>
            <img src={item.thumb} alt={item.caption} />
          </button>
        ))}
      </div>
      <Lightbox {...lightboxProps} />
    </>
  )
}
```

`useLightbox(items, options)` returns `{ isOpen, index, open, close, setIndex, lightboxProps }`.

## Controlled component

Drive it entirely from your own state:

```tsx
import { useState } from 'react'
import { Lightbox } from '@anil-labs/lightbox-gallery-react'

function Gallery() {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  return (
    <Lightbox
      items={items}
      open={open}
      index={index}
      loop
      onClose={() => setOpen(false)}
      onIndexChange={setIndex}
      onZoom={(scale) => console.log(scale)}
    />
  )
}
```

`<Lightbox>` renders nothing in place — the gallery portals itself to `document.body` via the core engine. All [options](/reference/options) are accepted as props.

## FLIP thumbnail animation

```tsx
useLightbox(items, {
  animateFrom: (i) => document.querySelectorAll<HTMLElement>('.grid img')[i] ?? null,
})
```

## Props

| Prop | Type | Notes |
| --- | --- | --- |
| `items` | `LightboxItem[]` | required |
| `open` | `boolean` | controlled visibility |
| `index` | `number` | controlled slide |
| `onClose` | `() => void` | Escape / backdrop / swipe / ✕ |
| `onIndexChange` | `(index) => void` | slide changed |
| `onZoom` | `(scale) => void` | zoom changed |
| …all [options](/reference/options) | | `loop`, `share`, `rotate`, … |
