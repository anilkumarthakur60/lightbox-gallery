# What is lightbox-gallery?

**lightbox-gallery** is a modern, dependency-free lightbox/gallery for the web. A single vanilla-TypeScript engine (`@anil-labs/lightbox-gallery-core`) does all the work, and thin bindings expose it idiomatically to React, Vue, Svelte, Solid, and as a native Web Component.

## Why another lightbox?

- **One engine, every framework.** The same features, the same options, the same behaviour — whether you use React or a `<script>` tag. Learn it once.
- **Feature-loaded, but zero-dependency.** Zoom, pinch, swipe, momentum pan, thumbnails, slideshow, fullscreen, video, embeds, rotate, share, hash routing, inline mode, i18n, RTL — with no runtime dependencies and a ~10 kB min+gzip core.
- **Touch-first.** Designed for phones as much as desktops: pinch-zoom, swipe-to-close, momentum panning and velocity-based navigation.
- **Accessible & SSR-safe.** A proper focus-trapped dialog, ARIA labels, `prefers-reduced-motion` support, and no DOM access until you actually open the gallery.

## Package overview

| Package | For |
| --- | --- |
| `@anil-labs/lightbox-gallery-core` | Vanilla JS/TS, or any framework not listed below |
| `@anil-labs/lightbox-gallery-react` | React 17+ |
| `@anil-labs/lightbox-gallery-vue` | Vue 3.3+ |
| `@anil-labs/lightbox-gallery-svelte` | Svelte 4 & 5 |
| `@anil-labs/lightbox-gallery-solid` | Solid 1.8+ |
| `@anil-labs/lightbox-gallery-element` | `<lightbox-gallery>` custom element — any framework or plain HTML |

Every framework binding depends on the core package and re-uses its engine, so bug fixes and new features land everywhere at once.

## Next steps

- [Getting Started](./getting-started) — install and open your first gallery
- [Frameworks](/frameworks/react) — idiomatic usage for your stack
- [Options](/reference/options) — the full configuration surface
