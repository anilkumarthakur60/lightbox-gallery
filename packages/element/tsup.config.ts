import { defineConfig } from 'tsup'

export default defineConfig([
  // library build — core stays external, CSS is inlined as text.
  // NOTE: the external is a regex anchored to the bare package so it does not
  // also swallow the `@anil-labs/lightbox-gallery-core/styles.css` subpath, which must be
  // resolved and inlined by the `.css` text loader below.
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    target: 'es2020',
    // core is auto-externalized (it is a dependency), but the stylesheet subpath
    // must be force-bundled and inlined as text so consumers get styles injected.
    external: ['@anil-labs/lightbox-gallery-core'],
    noExternal: [/@anil-labs\/lightbox-gallery-core\/styles\.css$/],
    loader: { '.css': 'text' },
  },
  // standalone CDN build — everything bundled
  {
    entry: ['src/index.ts'],
    format: ['iife'],
    globalName: 'LightboxGalleryElement',
    sourcemap: true,
    minify: true,
    target: 'es2020',
    loader: { '.css': 'text' },
  },
])
