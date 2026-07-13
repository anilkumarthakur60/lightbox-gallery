# Zoom & Gestures

Images are zoomable and the whole surface is gesture-driven. All of it is on by default and configurable.

## Zooming

| Input | Action |
| --- | --- |
| Mouse wheel / trackpad | Zoom toward the cursor (`wheelZoom`) |
| Pinch | Zoom toward the pinch midpoint |
| Double-click / double-tap | Toggle zoom at that point (`doubleTapZoom`, default `2.5×`) |
| Single click (mouse, on image) | Zoom in; click again to reset |
| Toolbar `+` / `−` buttons | Step zoom |
| Keyboard `+` `-` `0` | Zoom in / out / reset |

```ts
new Lightbox({
  items,
  zoom: true,        // master switch
  maxZoom: 4,        // ceiling
  doubleTapZoom: 2.5,
  wheelZoom: true,
})
```

When zoomed in, drag to pan. Releasing a drag applies **momentum** (inertia), clamped at the image edges — disable with `momentum: false`.

Programmatic control:

```ts
lightbox.zoomIn()
lightbox.zoomOut()
lightbox.resetZoom()
lightbox.on('zoom', (scale) => console.log('now at', scale))
```

## Navigation gestures

- **Swipe / drag horizontally** to move between slides. A short flick with enough velocity snaps to the next slide; otherwise it springs back. Disable with `swipe: false`.
- At the ends (with `loop: false`) the track rubber-bands instead of moving.

## Closing gestures

- **Swipe up/down** (touch/pen) to dismiss — the slide follows your finger and the backdrop fades (`swipeToClose`).
- **Pinch inward** below 1× to close (`pinchToClose`).

::: tip Mouse vs touch
Drag-to-close and swipe-to-close are **touch/pen only**. A mouse drag never closes the gallery — mouse users close with the backdrop, the ✕ button, or `Escape` — so an imperfect click can't dismiss it by accident.
:::

## Rotate & flip

Enable the rotate/flip toolbar for images:

```ts
new Lightbox({ items, rotate: true })
```

```ts
lightbox.rotateLeft()
lightbox.rotateRight()
lightbox.flipHorizontal()
lightbox.flipVertical()
lightbox.on('rotate', (deg) => {})
lightbox.on('flip', (h, v) => {})
```

Pan clamping stays correct at 90°/270° rotations.

## Keyboard

| Key | Action |
| --- | --- |
| `←` / `→` | Previous / next (reversed in RTL) |
| `Esc` | Reset zoom if zoomed, otherwise close |
| `+` / `-` / `0` | Zoom in / out / reset |
| `f` | Toggle fullscreen |
| `Tab` | Cycles focus within the dialog (focus-trapped) |

Disable all keyboard handling with `keyboard: false` (Escape-to-close still works).

## Hiding the chrome

A single tap on the image (touch) toggles the toolbar and thumbnails, so nothing covers the media while you look at it.
