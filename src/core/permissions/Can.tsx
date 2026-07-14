import type { ReactNode } from 'react'
import { useAuthStore } from '@/core/auth/authStore'
import { authorize } from './authorize'

export function Can({
  capability,
  children,
  fallback = null,
}: {
  capability: string
  children: ReactNode
  fallback?: ReactNode
}) {
  const session = useAuthStore((state) => state.session)
  return authorize(session?.capabilities, capability) ? children : fallback
}
