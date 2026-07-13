# Infinite Galleries

Load more slides as the user approaches the end — for API-backed albums or endless feeds.

```ts
const lightbox = new Lightbox({ items: firstPage, loop: false })

let page = 1
let loading = false

lightbox.on('end-reached', async () => {
  if (loading) return
  loading = true
  const more = await fetchPage(++page)
  lightbox.appendItems(more)
  loading = false
})

lightbox.open(0)
```

## How it works

- `end-reached` fires when the current slide is within one of the last slide. It fires **once per item-count** — appending more items re-arms it, so you won't get duplicate fetches for the same set.
- `appendItems(items)` adds to the end without disturbing the current slide or its zoom state. If the user was already sitting on the (previous) last slide, the newly-appended neighbour is rendered so navigation is seamless.
- Use `loop: false` for infinite galleries — looping and infinite loading don't mix.

## Related methods

```ts
lightbox.appendItems(items) // add to the end
lightbox.setItems(items)    // replace everything (resets to a valid index)
lightbox.length             // current item count
```
