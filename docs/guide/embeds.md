# Video & Embeds

The gallery renders four kinds of media: images, HTML5 video, iframe embeds (YouTube/Vimeo/Wistia and your own providers), and arbitrary HTML.

## HTML5 video

```ts
{
  src: '/clips/demo.mp4',
  type: 'video',      // optional — inferred from the extension
  poster: '/clips/demo.jpg',
  caption: 'A local video',
}
```

Videos get native controls, `playsInline`, and `preload="metadata"`. In a slideshow they play through and advance on `ended`.

## YouTube / Vimeo / Wistia

Just pass the page URL — it's converted to a privacy-friendly embed automatically:

```ts
{ src: 'https://youtu.be/dQw4w9WgXcQ' }            // → youtube-nocookie embed
{ src: 'https://www.youtube.com/watch?v=VIDEO_ID' }
{ src: 'https://vimeo.com/123456' }                // → player.vimeo.com
{ src: 'https://home.wistia.com/medias/abc123' }   // → fast.wistia.net embed
```

## Custom embed providers

Register your own URL → embed rule. Custom providers are checked before the built-ins.

```ts
import { registerEmbedProvider } from '@anil-labs/lightbox-gallery-core'

registerEmbedProvider({
  name: 'loom',
  match: /loom\.com\/share\/(\w+)/,
  embed: (m) => `https://www.loom.com/embed/${m[1]}`,
})

// now this works:
new Lightbox({ items: [{ src: 'https://www.loom.com/share/abc123' }] })
```

Helpers you can call directly:

```ts
import { detectType, toEmbedUrl, findEmbedUrl } from '@anil-labs/lightbox-gallery-core'

detectType({ src: 'https://youtu.be/x' }) // 'iframe'
toEmbedUrl('https://youtu.be/x')          // 'https://www.youtube-nocookie.com/embed/x'
findEmbedUrl('/photos/1.jpg')             // null (not an embed)
```

## Arbitrary HTML slides

```ts
{
  type: 'html',
  src: '',
  html: '<div class="promo"><h2>Anything</h2><p>Rendered as a slide.</p></div>',
}
```

HTML slides are not zoom/pan targets, so interactive content inside them works normally.
