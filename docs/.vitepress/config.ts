import { defineConfig } from 'vitepress'

const REPO = 'https://github.com/anilkumarthakur60/lightbox-gallery'
const DEMOS = 'https://anil-labs-lightbox-gallery.vercel.app'

export default defineConfig({
  title: 'lightbox-gallery',
  description:
    'A modern, dependency-free lightbox gallery with zoom, swipe, thumbnails, slideshow, video and full a11y — for React, Vue, Svelte, Solid and Web Components.',
  lang: 'en-US',
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['meta', { name: 'theme-color', content: '#7dabff' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'lightbox-gallery' }],
    [
      'meta',
      {
        property: 'og:description',
        content:
          'A modern, dependency-free lightbox with React, Vue, Svelte, Solid and Web Component bindings.',
      },
    ],
  ],
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Frameworks', link: '/frameworks/react' },
      { text: 'Reference', link: '/reference/options' },
      { text: 'Demos', link: DEMOS },
      {
        text: '0.1.0',
        items: [
          { text: 'Changelog', link: `${REPO}/releases` },
          { text: 'npm', link: 'https://www.npmjs.com/package/@anil-labs/lightbox-gallery-core' },
        ],
      },
    ],
    sidebar: {
      '/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is it?', link: '/guide/introduction' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Items', link: '/guide/items' },
          ],
        },
        {
          text: 'Features',
          items: [
            { text: 'Zoom & Gestures', link: '/guide/zoom-and-gestures' },
            { text: 'Slideshow', link: '/guide/slideshow' },
            { text: 'Video & Embeds', link: '/guide/embeds' },
            { text: 'Thumbnail Animation', link: '/guide/flip-animation' },
            { text: 'Hash Routing', link: '/guide/hash-routing' },
            { text: 'Inline Mode', link: '/guide/inline-mode' },
            { text: 'Infinite Galleries', link: '/guide/infinite' },
            { text: 'Theming', link: '/guide/theming' },
            { text: 'i18n & RTL', link: '/guide/i18n' },
          ],
        },
        {
          text: 'Frameworks',
          items: [
            { text: 'Vanilla / CDN', link: '/frameworks/vanilla' },
            { text: 'React', link: '/frameworks/react' },
            { text: 'Vue 3', link: '/frameworks/vue' },
            { text: 'Svelte', link: '/frameworks/svelte' },
            { text: 'Solid', link: '/frameworks/solid' },
            { text: 'Web Component', link: '/frameworks/web-component' },
          ],
        },
        {
          text: 'Reference',
          items: [
            { text: 'Options', link: '/reference/options' },
            { text: 'Instance API', link: '/reference/api' },
            { text: 'Events', link: '/reference/events' },
          ],
        },
      ],
    },
    socialLinks: [{ icon: 'github', link: REPO }],
    editLink: {
      pattern: `${REPO}/edit/main/docs/:path`,
      text: 'Edit this page on GitHub',
    },
    search: { provider: 'local' },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 Er. Anil Kumar Thakur',
    },
  },
})
