# Instance API

Methods and properties on a `Lightbox` instance. Framework bindings wrap most of these, but you can always reach the underlying instance (`lightboxProps` state, the Svelte controller's `.lightbox`, the element's internal core, etc.).

## Lifecycle

```ts
lightbox.open(index?)   // open (defaults to startIndex)
lightbox.close()        // close with the exit animation
lightbox.destroy()      // close immediately + remove all listeners
```

## Navigation

```ts
lightbox.next()         // → next slide (respects loop)
lightbox.prev()         // → previous slide
lightbox.goTo(index)    // jump to an index (animates if adjacent)
```

## Zoom, rotate & flip

```ts
lightbox.zoomIn()
lightbox.zoomOut()
lightbox.resetZoom()
lightbox.rotateLeft()
lightbox.rotateRight()
lightbox.flipHorizontal()
lightbox.flipVertical()
```

## Slideshow & fullscreen

```ts
lightbox.startSlideshow()
lightbox.stopSlideshow()
lightbox.toggleSlideshow()
lightbox.toggleFullscreen()
```

## Sharing

```ts
await lightbox.share() // Web Share API, or copies the link + shows a toast
```

## Items

```ts
lightbox.setItems(items)     // replace all slides
lightbox.appendItems(items)  // append (see Infinite Galleries)
```

## Getters

```ts
lightbox.isOpen             // boolean
lightbox.index              // current index
lightbox.length             // item count
lightbox.scale              // current zoom scale
lightbox.rotationDegrees    // current rotation
lightbox.currentItem        // LightboxItem | undefined
lightbox.isSlideshowRunning // boolean
```

## Static

```ts
Lightbox.version            // e.g. '0.1.0'
Lightbox.parseHash(key?)    // slide index from location.hash, or null
```

## Events

Subscribe with `.on()`, which returns an unsubscribe function:

```ts
const off = lightbox.on('change', (index, item) => {})
off()
```

See the full list on the [Events](./events) page.
