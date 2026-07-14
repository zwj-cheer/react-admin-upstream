import type { AuthSource } from '@/core/services/contracts'

let currentSource: AuthSource | undefined

export function setTransportAuthSource(source: AuthSource | undefined): void {
  currentSource = source
}

export function getTransportAuthSource(): AuthSource | undefined {
  return currentSource
}
