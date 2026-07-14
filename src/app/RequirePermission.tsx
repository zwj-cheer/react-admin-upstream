import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { useAuthStore } from '@/core/auth/authStore'
import { authorize } from '@/core/permissions/authorize'

export function RequirePermission({
  capability,
  children,
}: {
  capability: string
  children: ReactNode
}) {
  const session = useAuthStore((state) => state.session)
  return authorize(session?.capabilities, capability) ? (
    children
  ) : (
    <Navigate replace to="/forbidden" />
  )
}
