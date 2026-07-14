import { setupWorker } from 'msw/browser'
import { createHandlers } from './handlers'
import { createBrowserMockSessionStore } from './sessionStore'

const worker = setupWorker(...createHandlers(createBrowserMockSessionStore()))

export async function startMocking(): Promise<void> {
  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
  })
}
