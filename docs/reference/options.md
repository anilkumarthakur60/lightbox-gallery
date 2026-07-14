# Options

Passed to `new Lightbox({ items, ...options })`, to `bindGallery(target, options)`, or via each framework binding. Only `items` is required.

## General

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `LightboxItem[]` | — | The slides (**required**). |
| `startIndex` | `number` | `0` | Slide opened by default. |
| `loop` | `boolean` | `true` | Wrap around at the ends. |
| `preload` | `number` | `2` | Neighbouring images preloaded on each side. |
| `animation` | `'zoom' \| 'fade' \| 'none'` | `'zoom'` | Opening animation. |
| `animateFrom` | `(index) => HTMLElement \| null` | — | Origin element for the [FLIP animation](/guide/flip-animation). |
| `theme` | `'dark' \| 'light' \| 'auto'` | `'dark'` | Colour scheme; `'auto'` follows `prefers-color-scheme`. See [theming](/guide/theming#dark-light-mode). |
| `className` | `string` | — | Extra class on the root (for [theming](/guide/theming)). |
| `container` | `HTMLElement` | `document.body` | Mount element. |

## Zoom

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `zoom` | `boolean` | `true` | Master switch for image zoom. |
| `maxZoom` | `number` | `4` | Maximum zoom scale. |
| `doubleTapZoom` | `number` | `2.5` | Scale used by double-tap / double-click. |
| `wheelZoom` | `boolean` | `true` | Zoom with wheel / trackpad. |
| `momentum` | `boolean` | `true` | Inertia after releasing a pan. |

## Gestures

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `swipe` | `boolean` | `true` | Swipe / drag to navigate. |
| `swipeToClose` | `boolean` | `true` | Vertical swipe closes (touch/pen only). |
| `pinchToClose` | `boolean` | `true` | Pinch inward below 1× closes (touch). |
| `keyboard` | `boolean` | `true` | Keyboard navigation. |
| `closeOnBackdrop` | `boolean` | `true` | Click outside the media closes. |

## UI & toolbar

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `counter` | `boolean` | `true` | "3 / 12" counter. |
| `captions` | `boolean` | `true` | Show captions. |
| `captionHTML` | `boolean` | `false` | Render captions as HTML (**trusted content only**). |
| `thumbnails` | `boolean` | `true` | Thumbnail strip. |
| `fullscreen` | `boolean` | `true` | Fullscreen button. |
| `download` | `boolean` | `false` | Download button. |
| `share` | `boolean` | `false` | Share button (Web Share API / copy link). |
| `rotate` | `boolean` | `false` | Rotate + flip buttons for images. |
| `toolbarButtons` | `LightboxToolbarButton[]` | — | Custom toolbar buttons. |

## Slideshow

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `slideshow` | `boolean` | `true` | Slideshow button. |
| `slideshowDelay` | `number` | `4000` | Autoplay delay (ms). |
| `slideshowProgress` | `boolean` | `true` | Progress bar while playing. |
| `slideshowPauseOnHover` | `boolean` | `true` | Pause autoplay while hovering. |

## Routing & layout

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `hash` | `boolean \| string` | `false` | [URL-hash routing](/guide/hash-routing); pass a string for a custom key. |
| `inline` | `boolean` | `false` | [Inline carousel mode](/guide/inline-mode) (requires `container`). |

## Localisation

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `rtl` | `boolean` | auto | Right-to-left (defaults to `document.dir`). |
| `labels` | `Partial<LightboxLabels>` | — | Override any UI string. See [i18n](/guide/i18n). |

## Types

```ts
interface LightboxToolbarButton {
  id: string
  label: string
  icon: string // inner HTML (usually an inline SVG)
  onClick: (lightbox: Lightbox) => void
}
```
