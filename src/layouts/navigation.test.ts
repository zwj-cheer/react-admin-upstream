import { describe, expect, it } from 'vitest'
import type { MenuItem, Session } from '@/core/services/contracts'
import type { RegisteredRoute } from '@/core/routing'
import { getMenuNavigation } from './navigation'

function route(key: string, capability: string): RegisteredRoute {
  return {
    key,
    path: '/' + key,
    titleKey: key + '.title',
    subtitleKey: key + '.subtitle',
    icon: 'menu',
    capability,
    component: () => null,
  }
}

const routes: RegisteredRoute[] = [
  route('users', 'users:read'),
  route('roles', 'roles:read'),
  route('menus', 'menus:read'),
]

const session: Session = {
  user: { id: '1', name: 'Admin', email: 'admin@example.com' },
  source: 'local',
  expiresAt: new Date(Date.now() + 60_000).toISOString(),
  capabilities: ['users:read', 'roles:read'],
}

function menu(
  overrides: Partial<MenuItem> & Pick<MenuItem, 'id' | 'routeKey' | 'order'>,
): MenuItem {
  return {
    parentId: null,
    name: overrides.id,
    icon: 'menu',
    status: 'active',
    ...overrides,
  }
}

describe('getMenuNavigation', () => {
  it('uses active backend menus for route visibility and order without expanding permissions', () => {
    const menus = [
      menu({ id: 'roles', routeKey: 'roles', order: 1 }),
      menu({ id: 'unknown', routeKey: 'server-only', order: 2 }),
      menu({ id: 'menus', routeKey: 'menus', order: 3 }),
      menu({ id: 'users', routeKey: 'users', order: 4 }),
      menu({ id: 'disabled-users', routeKey: 'users', order: 5, status: 'disabled' }),
    ]

    expect(getMenuNavigation(routes, session, menus).map((item) => item.route.key)).toEqual([
      'roles',
      'users',
    ])
  })
})
