import { use } from 'react'
import { ServicesContext } from './ServicesProvider'

export function useServices() {
  const services = use(ServicesContext)
  if (!services) {
    throw new Error('ServicesProvider is missing')
  }
  return services
}
