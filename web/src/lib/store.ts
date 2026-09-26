type Listener<T> = (value: T) => void

export interface Store<T> {
  get: () => T
  set: (value: T) => void
  subscribe: (listener: Listener<T>) => () => void
}

export function createStore<T>(initial: T): Store<T> {
  let value = initial
  const listeners = new Set<Listener<T>>()
  return {
    get: () => value,
    set(next) {
      if (Object.is(next, value)) return
      value = next
      listeners.forEach((listener) => listener(value))
    },
    subscribe(listener) {
      listeners.add(listener)
      listener(value)
      return () => listeners.delete(listener)
    },
  }
}
