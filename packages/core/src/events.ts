/**
 * A listener stored in type-erased form. `unknown[]` (never `any`) keeps the
 * store honest: `emit` supplies the correctly typed arguments from the `Events`
 * map, and calling an `(...args: unknown[]) => void` with a typed tuple is safe.
 */
type Listener = (...args: unknown[]) => void

export class Emitter<Events extends Record<string, unknown[]>> {
  private listeners = new Map<keyof Events, Set<Listener>>()

  on<E extends keyof Events>(event: E, fn: (...args: Events[E]) => void): () => void {
    let set = this.listeners.get(event)
    if (!set) {
      set = new Set()
      this.listeners.set(event, set)
    }
    set.add(fn as Listener)
    return () => this.off(event, fn)
  }

  off<E extends keyof Events>(event: E, fn: (...args: Events[E]) => void): void {
    this.listeners.get(event)?.delete(fn as Listener)
  }

  protected emit<E extends keyof Events>(event: E, ...args: Events[E]): void {
    this.listeners.get(event)?.forEach((fn) => fn(...args))
  }

  protected removeAllListeners(): void {
    this.listeners.clear()
  }
}
