import { useContext } from 'react'
import { ServicesContext } from './ServicesProvider'

export function useServices() {
  const services = useContext(ServicesContext)
  if (!services) {
    throw new Error('ServicesProvider is missing')
  }
  return services
}
