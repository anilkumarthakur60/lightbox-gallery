# Items

Each slide is a `LightboxItem`. Only `src` is required — everything else is optional and the media type is auto-detected.

```ts
interface LightboxItem {
  src: string          // image / video URL, or YouTube/Vimeo/Wistia page URL
  type?: 'image' | 'video' | 'iframe' | 'html'  // auto-detected when omitted
  thumb?: string       // thumbnail strip image (falls back to src / poster)
  caption?: string     // shown under the media
  alt?: string         // image alt text (falls back to caption)
  srcset?: string      // responsive images
  sizes?: string       // responsive images
  poster?: string      // video poster frame
  html?: string        // markup for type: 'html'
  downloadUrl?: string // download-button target (falls back to src)
  downloadFilename?: string
  shareUrl?: string    // share-button target (falls back to src)
}
```

## Media types

The `type` is inferred from `src` when you don't set it:

| Detected type | Matches |
| --- | --- |
| `image` | `.jpg .jpeg .png .gif .webp .avif .bmp .svg` (and the fallback) |
| `video` | `.mp4 .m4v .mov .webm .ogv` |
| `iframe` | YouTube, Vimeo, Wistia URLs (converted to embed URLs) |
| `html` | when `html` is provided |

```ts
const items = [
  { src: '/photos/1.jpg', caption: 'An image' },
  { src: '/clips/demo.mp4', poster: '/clips/demo.jpg', caption: 'An HTML5 video' },
  { src: 'https://youtu.be/dQw4w9WgXcQ', caption: 'A YouTube embed' },
  { src: 'https://vimeo.com/123456', caption: 'A Vimeo embed' },
  { type: 'html', html: '<div class="card">Any markup here</div>', src: '' },
]
```

See [Video & Embeds](./embeds) for adding your own providers.

## Responsive images

Provide `srcset`/`sizes` and the browser picks the best source; the neighbour-preloader respects `srcset` too.

```ts
{
  src: '/photos/1-1600.jpg',
  srcset: '/photos/1-800.jpg 800w, /photos/1-1600.jpg 1600w, /photos/1-2400.jpg 2400w',
  sizes: '100vw',
  caption: 'Crisp on every screen',
}
```

## Thumbnails

`thumb` sets the thumbnail-strip image. For images it falls back to `src`; for videos, to `poster`. Provide small, optimized thumbnails for the best strip performance.

## Updating items at runtime

```ts
lightbox.setItems(newItems)     // replace the whole set (re-renders)
lightbox.appendItems(moreItems) // add to the end (for infinite galleries)
```
