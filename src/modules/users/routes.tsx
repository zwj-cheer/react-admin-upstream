import { lazy } from 'react'

export const UserListPage = lazy(() =>
  import('./UserListPage').then((module) => ({ default: module.UserListPage })),
)
