import { createContext, useContext, type PropsWithChildren } from 'react'
import type { RuntimeConfig } from './runtimeConfig.schema'

const RuntimeConfigContext = createContext<RuntimeConfig | null>(null)

export function RuntimeConfigProvider({
  config,
  children,
}: PropsWithChildren<{ config: RuntimeConfig }>) {
  return <RuntimeConfigContext.Provider value={config}>{children}</RuntimeConfigContext.Provider>
}

export function useRuntimeConfig(): RuntimeConfig {
  const config = useContext(RuntimeConfigContext)
  if (!config) {
    throw new Error('RuntimeConfigProvider is missing')
  }
  return config
}
