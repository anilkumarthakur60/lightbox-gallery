import { defineConfig } from 'tsup'

export default defineConfig([
  // library build — core stays external, CSS is inlined as text
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    target: 'es2020',
    external: ['@lightbox-gallery/core'],
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
