# @anil-labs/lightbox-gallery-core

## 0.2.0

### Minor Changes

- 200226e: Add a `theme` option (`'dark' | 'light' | 'auto'`). The lightbox stays dark by
  default; `'light'` renders a light UI and `'auto'` follows the operating
  system's `prefers-color-scheme` with no extra wiring. It's applied as a
  `lbg-theme-*` class, so it composes with `className` and CSS-custom-property
  overrides, and flows through every framework binding via `LightboxOptions`.
