import { useMemo, type PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { RuntimeConfig } from '@/core/config/runtimeConfig.schema'
import { RuntimeConfigProvider } from '@/core/config/RuntimeConfigProvider'
import { AuthProvider } from '@/core/auth/AuthProvider'
import { AuthService } from '@/core/auth/authService'
import { configureOidc, getOidcAccessToken } from '@/core/auth/oidcAuth'
import { ServicesProvider } from '@/core/services/ServicesProvider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/toast'
import { createProjectServices } from '@/project/services'

export function AppProviders({
  config,
  queryClient,
  children,
}: PropsWithChildren<{ config: RuntimeConfig; queryClient: QueryClient }>) {
  const runtime = useMemo(() => {
    configureOidc(config)
    const services = createProjectServices(config, getOidcAccessToken)
    return {
      services,
      authService: new AuthService(config, services, queryClient),
    }
  }, [config, queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <RuntimeConfigProvider config={config}>
        <ServicesProvider services={runtime.services}>
          <AuthProvider service={runtime.authService}>
            <TooltipProvider delayDuration={180}>
              {children}
              <Toaster />
            </TooltipProvider>
          </AuthProvider>
        </ServicesProvider>
      </RuntimeConfigProvider>
    </QueryClientProvider>
  )
}
