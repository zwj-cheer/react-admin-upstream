import { lazy } from 'react'

export const RoleListPage = lazy(() =>
  import('./RoleListPage').then((module) => ({ default: module.RoleListPage })),
)
