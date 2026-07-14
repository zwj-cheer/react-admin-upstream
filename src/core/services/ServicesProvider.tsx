import { createContext, type PropsWithChildren } from 'react'
import type { Services } from './contracts'

export const ServicesContext = createContext<Services | null>(null)

export function ServicesProvider({
  services,
  children,
}: PropsWithChildren<{ services: Services }>) {
  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>
}
