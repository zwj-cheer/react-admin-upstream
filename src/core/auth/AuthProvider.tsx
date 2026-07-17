import { createContext, use, type PropsWithChildren } from 'react'
import type { AuthService } from './authService'

const AuthServiceContext = createContext<AuthService | null>(null)

export function AuthProvider({ service, children }: PropsWithChildren<{ service: AuthService }>) {
  return <AuthServiceContext value={service}>{children}</AuthServiceContext>
}

export function useAuthService(): AuthService {
  const service = use(AuthServiceContext)
  if (!service) {
    throw new Error('AuthProvider is missing')
  }
  return service
}
