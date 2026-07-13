# Events

Subscribe with `.on(event, handler)`. It returns an unsubscribe function; `.off(event, handler)` also works.

```ts
const off = lightbox.on('change', (index, item) => {
  console.log('now showing', index, item.caption)
})

// later
off()
```

## Event list

| Event | Payload | Fires when |
| --- | --- | --- |
| `open` | `(index: number)` | The gallery opens. |
| `close` | — | The gallery starts closing. |
| `change` | `(index: number, item: LightboxItem)` | The visible slide changes. |
| `zoom` | `(scale: number)` | The zoom scale changes. |
| `rotate` | `(degrees: number)` | The image is rotated. |
| `flip` | `(horizontal: boolean, vertical: boolean)` | The image is flipped. |
| `share` | `(item: LightboxItem, index: number)` | The share action runs. |
| `end-reached` | — | Navigation reaches within one slide of the end (see [Infinite Galleries](/guide/infinite)). |
| `slideshow:start` | — | The slideshow starts. |
| `slideshow:stop` | — | The slideshow stops. |
| `fullscreen:enter` | — | Fullscreen is entered. |
| `fullscreen:exit` | — | Fullscreen is exited. |
| `error` | `(item: LightboxItem, index: number)` | An image fails to load. |

## Framework equivalents

Bindings surface the most common events as props/emits:

- **React / Solid** — `onClose`, `onIndexChange`, `onZoom` props.
- **Vue** — `@close`, `@change`, `@zoom`, plus `update:open` / `update:index`.
- **Svelte** — the controller's `isOpen` / `index` stores update automatically; reach `gallery.lightbox.on(...)` for the rest.
- **Web Component** — `lbg-open`, `lbg-close`, `lbg-change` DOM events.

For any event not surfaced as a prop, reach the underlying instance and call `.on()` directly.
