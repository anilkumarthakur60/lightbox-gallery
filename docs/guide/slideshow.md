# Slideshow

A built-in autoplay slideshow with a progress bar, hover-pause, and video awareness.

```ts
new Lightbox({
  items,
  slideshow: true,            // show the play/pause button
  slideshowDelay: 4000,       // ms per slide
  slideshowProgress: true,    // progress bar while playing
  slideshowPauseOnHover: true, // pause while the mouse is over the stage
})
```

## Behaviour

- Press the play button (or call `startSlideshow()`) to begin. A progress bar across the top fills over `slideshowDelay`, then the gallery advances.
- **Video slides play through.** When the current slide is a video, the timer is skipped — the video plays and the slideshow advances when it ends.
- **Hover pauses.** With `slideshowPauseOnHover`, moving the mouse over the media freezes the progress bar; leaving resumes it.
- At the end (with `loop: false`) the slideshow stops automatically.
- Any manual navigation (arrow, swipe, thumbnail click) stops the slideshow.

## Control & events

```ts
lightbox.startSlideshow()
lightbox.stopSlideshow()
lightbox.toggleSlideshow()
lightbox.isSlideshowRunning // boolean

lightbox.on('slideshow:start', () => {})
lightbox.on('slideshow:stop', () => {})
```
