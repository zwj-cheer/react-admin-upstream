import { lazy } from 'react'

export const MenuTreePage = lazy(() =>
  import('./MenuTreePage').then((module) => ({ default: module.MenuTreePage })),
)
