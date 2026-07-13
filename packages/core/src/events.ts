type AnyFn = (...args: any[]) => void

export class Emitter<Events extends Record<string, unknown[]>> {
  private listeners = new Map<keyof Events, Set<AnyFn>>()

  on<E extends keyof Events>(event: E, fn: (...args: Events[E]) => void): () => void {
    let set = this.listeners.get(event)
    if (!set) {
      set = new Set()
      this.listeners.set(event, set)
    }
    set.add(fn as AnyFn)
    return () => this.off(event, fn)
  }

  off<E extends keyof Events>(event: E, fn: (...args: Events[E]) => void): void {
    this.listeners.get(event)?.delete(fn as AnyFn)
  }

  protected emit<E extends keyof Events>(event: E, ...args: Events[E]): void {
    this.listeners.get(event)?.forEach((fn) => fn(...args))
  }

  protected removeAllListeners(): void {
    this.listeners.clear()
  }
}
