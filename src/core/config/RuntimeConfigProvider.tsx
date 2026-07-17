import { createContext, use, type PropsWithChildren } from 'react'
import type { RuntimeConfig } from './runtimeConfig.schema'

const RuntimeConfigContext = createContext<RuntimeConfig | null>(null)

export function RuntimeConfigProvider({
  config,
  children,
}: PropsWithChildren<{ config: RuntimeConfig }>) {
  return <RuntimeConfigContext value={config}>{children}</RuntimeConfigContext>
}

export function useRuntimeConfig(): RuntimeConfig {
  const config = use(RuntimeConfigContext)
  if (!config) {
    throw new Error('RuntimeConfigProvider is missing')
  }
  return config
}
