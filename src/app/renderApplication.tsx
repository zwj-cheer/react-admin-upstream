import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient } from '@tanstack/react-query'
import type { RuntimeConfig } from '@/core/config/runtimeConfig.schema'
import { AppProviders } from './providers'
import App from './App'
import '@/styles/globals.css'
import '@/project/styles.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 15_000,
    },
    mutations: {
      retry: false,
    },
  },
})

export function renderApplication(config: RuntimeConfig): void {
  const root = document.getElementById('root')
  if (!root) {
    throw new Error('root_missing')
  }

  createRoot(root).render(
    <StrictMode>
      <AppProviders config={config} queryClient={queryClient}>
        <App />
      </AppProviders>
    </StrictMode>,
  )
}
