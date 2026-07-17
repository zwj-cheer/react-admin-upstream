import type { PropsWithChildren } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import type { RuntimeConfig } from '@/core/config/runtimeConfig.schema'
import { RuntimeConfigProvider } from '@/core/config/RuntimeConfigProvider'
import { AuthProvider } from '@/core/auth/AuthProvider'
import { ServicesProvider } from '@/core/services/ServicesProvider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/toast'
import type { AppRuntime } from './runtime'

export function AppProviders({
  config,
  runtime,
  children,
}: PropsWithChildren<{ config: RuntimeConfig; runtime: AppRuntime }>) {
  return (
    <QueryClientProvider client={runtime.queryClient}>
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
