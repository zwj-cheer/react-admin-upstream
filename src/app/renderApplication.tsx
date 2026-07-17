import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import type { RuntimeConfig } from '@/core/config/runtimeConfig.schema'
import type { AppRuntime } from './runtime'
import { AppProviders } from './providers'
import App from './App'
import { createAppRouter } from './router'
import '@/styles/globals.css'
import '@/project/styles.css'

export function renderApplication(
  config: RuntimeConfig,
  runtime: AppRuntime,
  authReady: Promise<void>,
): void {
  const root = document.getElementById('root')
  if (!root) {
    throw new Error('root_missing')
  }

  const router = createAppRouter({ runtime, authReady })

  createRoot(root).render(
    <StrictMode>
      <AppProviders config={config} runtime={runtime}>
        <App router={router} />
      </AppProviders>
    </StrictMode>,
  )
}
