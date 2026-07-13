// Importing the package registers the <lightbox-gallery> custom element and
// auto-injects the stylesheet — no separate CSS import needed.
import '@anil-labs/lightbox-gallery-element'

const photos = Array.from({ length: 9 }, (_, i) => ({
  full: `https://picsum.photos/id/${i * 12 + 10}/1600/1067`,
  thumb: `https://picsum.photos/id/${i * 12 + 10}/400/300`,
  caption: `Sample photo #${i + 1} from picsum.photos`,
}))

const gallery = document.getElementById('gallery')!
gallery.innerHTML = photos
  .map(
    (p) => `
      <a href="${p.full}" data-caption="${p.caption}" data-download-url="${p.full}">
        <img src="${p.thumb}" alt="${p.caption}" loading="lazy" />
      </a>`,
  )
  .join('')

// The element scans its `bind="a"` links on its first animation frame after
// connecting; the links above are in place synchronously, so they are picked up.
