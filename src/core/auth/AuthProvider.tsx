import { createContext, useContext, useEffect, type PropsWithChildren } from 'react'
import type { AuthService } from './authService'

const AuthServiceContext = createContext<AuthService | null>(null)

export function AuthProvider({ service, children }: PropsWithChildren<{ service: AuthService }>) {
  useEffect(() => {
    service.start()
    void service.restore()
    return () => service.stop()
  }, [service])

  return <AuthServiceContext.Provider value={service}>{children}</AuthServiceContext.Provider>
}

export function useAuthService(): AuthService {
  const service = useContext(AuthServiceContext)
  if (!service) {
    throw new Error('AuthProvider is missing')
  }
  return service
}
