type UnauthorizedListener = () => void

const listeners = new Set<UnauthorizedListener>()
let scheduled = false

export function subscribeUnauthorized(listener: UnauthorizedListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function emitUnauthorized(): void {
  if (scheduled) {
    return
  }

  scheduled = true
  queueMicrotask(() => {
    scheduled = false
    listeners.forEach((listener) => listener())
  })
}
