import { bindGallery } from '@anil-labs/lightbox-gallery-core'
import '@anil-labs/lightbox-gallery-core/styles.css'

const photos = Array.from({ length: 9 }, (_, i) => ({
  full: `https://picsum.photos/id/${i * 12 + 10}/1600/1067`,
  thumb: `https://picsum.photos/id/${i * 12 + 10}/400/300`,
  caption: `Sample photo #${i + 1} from picsum.photos`,
}))

const grid = document.getElementById('gallery')!
grid.innerHTML = photos
  .map(
    (p) => `
      <a href="${p.full}" data-gallery data-caption="${p.caption}">
        <img src="${p.thumb}" alt="${p.caption}" loading="lazy" />
      </a>`,
  )
  .join('')

bindGallery('a[data-gallery]', {
  loop: true,
  download: true,
  share: true,
  rotate: true,
  hash: true,
  slideshowDelay: 3000,
})
