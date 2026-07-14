import { setupServer } from 'msw/node'
import { createHandlers } from './handlers'
import { createMemoryMockSessionStore } from './sessionStore'

export function createMockServer() {
  return setupServer(...createHandlers(createMemoryMockSessionStore()))
}
