import type { RegisteredRoute } from '@/core/routing'
import { capabilities } from '@/core/permissions/capabilities'
import { UserListPage } from '@/modules/users/routes'
import { RoleListPage } from '@/modules/roles/routes'
import { MenuTreePage } from '@/modules/menus/routes'
import { projectRoutes } from '@/project/routes'

export type { RegisteredRoute } from '@/core/routing'

export const templateRoutes: RegisteredRoute[] = [
  {
    key: 'users',
    path: '/users',
    titleKey: 'users.title',
    subtitleKey: 'users.subtitle',
    icon: 'users',
    capability: capabilities.users.read,
    component: UserListPage,
  },
  {
    key: 'roles',
    path: '/roles',
    titleKey: 'roles.title',
    subtitleKey: 'roles.subtitle',
    icon: 'shield-check',
    capability: capabilities.roles.read,
    component: RoleListPage,
  },
  {
    key: 'menus',
    path: '/menus',
    titleKey: 'menus.title',
    subtitleKey: 'menus.subtitle',
    icon: 'menu',
    capability: capabilities.menus.read,
    component: MenuTreePage,
  },
]

export function createRouteRegistry(extensions: readonly RegisteredRoute[]): RegisteredRoute[] {
  return [...templateRoutes, ...extensions]
}

export const registeredRoutes = createRouteRegistry(projectRoutes)
