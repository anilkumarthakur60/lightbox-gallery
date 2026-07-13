const svg = (path: string, extra = ''): string =>
  `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra}>${path}</svg>`

export const icons = {
  close: svg('<path d="M18 6 6 18M6 6l12 12"/>'),
  prev: svg('<path d="M15 18l-6-6 6-6"/>'),
  next: svg('<path d="M9 18l6-6-6-6"/>'),
  zoomIn: svg(
    '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35M11 8v6M8 11h6"/>',
  ),
  zoomOut: svg('<circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35M8 11h6"/>'),
  expand: svg(
    '<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>',
  ),
  compress: svg(
    '<path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>',
  ),
  play: svg('<path d="m7 4 13 8-13 8Z"/>'),
  pause: svg('<path d="M7 4h3v16H7zM14 4h3v16h-3z"/>'),
  download: svg('<path d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16"/>'),
  error: svg('<circle cx="12" cy="12" r="9"/><path d="M12 8v4m0 4h.01"/>'),
}
