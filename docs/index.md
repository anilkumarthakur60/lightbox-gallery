---
layout: home

hero:
  name: lightbox-gallery
  text: A modern lightbox for every framework
  tagline: Zero-dependency, feature-loaded, and touch-first — with React, Vue, Svelte, Solid and Web Component bindings sharing one engine.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: Live Demos
      link: https://lightbox-gallery-three.vercel.app
    - theme: alt
      text: View on GitHub
      link: https://github.com/anilkumarthakur60/lightbox-gallery

features:
  - icon: 🔍
    title: Zoom & pinch
    details: Wheel, trackpad, pinch, double-tap and buttons. Anchored zoom with pan clamping and momentum panning.
  - icon: 👆
    title: Touch-first gestures
    details: Swipe to navigate with velocity snapping, drag to pan, swipe or pinch to close.
  - icon: ✨
    title: FLIP thumbnail animation
    details: The image expands from the clicked thumbnail on open and returns to it on close.
  - icon: 🎬
    title: Video & embeds
    details: HTML5 video plus YouTube, Vimeo and Wistia auto-embeds — and a registry for your own providers.
  - icon: ♾️
    title: Infinite galleries
    details: An end-reached event and appendItems() make dynamically-loaded, endless galleries trivial.
  - icon: ♿
    title: Accessible & i18n
    details: Focus trap, ARIA, reduced-motion, RTL, and every UI string overridable for translation.
  - icon: 🎨
    title: Themeable
    details: CSS custom properties, three built-in themes, and custom toolbar buttons.
  - icon: 🪶
    title: Zero dependencies
    details: ~10 kB min+gzip core, ESM + CJS + CDN builds, full TypeScript types, SSR-safe.
---

## One engine, six packages

```bash
# pick your framework
pnpm add @anil-labs/lightbox-gallery-core     # vanilla / any framework
pnpm add @anil-labs/lightbox-gallery-react    # React
pnpm add @anil-labs/lightbox-gallery-vue      # Vue 3
pnpm add @anil-labs/lightbox-gallery-svelte   # Svelte
pnpm add @anil-labs/lightbox-gallery-solid    # Solid
pnpm add @anil-labs/lightbox-gallery-element  # <lightbox-gallery> web component
```

```ts
import { Lightbox } from '@anil-labs/lightbox-gallery-core'
import '@anil-labs/lightbox-gallery-core/styles.css'

new Lightbox({
  items: [
    { src: '/photos/1.jpg', caption: 'Sunrise' },
    { src: 'https://youtu.be/dQw4w9WgXcQ', caption: 'A video' },
  ],
  loop: true,
  share: true,
}).open()
```
