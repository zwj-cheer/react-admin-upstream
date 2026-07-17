import { describe, expect, it } from 'vitest'
import type { MenuItem, Session } from '@/core/services/contracts'
import type { RegisteredRoute } from '@/core/routing'
import { getMenuNavigation } from './navigation'

const routes: RegisteredRoute[] = [
  {
    key: 'users',
    path: '/users',
    titleKey: 'users.title',
    subtitleKey: 'users.subtitle',
    icon: 'users',
    capability: 'users:read',
    lazy: async () => ({ Component: () => null }),
  },
  {
    key: 'roles',
    path: '/roles',
    titleKey: 'roles.title',
    subtitleKey: 'roles.subtitle',
    icon: 'shield-check',
    capability: 'roles:read',
    lazy: async () => ({ Component: () => null }),
  },
]

const session: Session = {
  user: { id: '1', name: 'Admin', email: 'admin@example.com' },
  source: 'local',
  expiresAt: new Date(Date.now() + 60_000).toISOString(),
  capabilities: ['users:read'],
}

function menu(overrides: Partial<MenuItem> = {}): MenuItem {
  return {
    id: 'menu-users',
    parentId: null,
    name: 'Users',
    routeKey: 'users',
    icon: 'users',
    status: 'active',
    order: 1,
    ...overrides,
  }
}

describe('getMenuNavigation', () => {
  it('keeps menu order while filtering disabled, unknown and unauthorized routes', () => {
    const navigation = getMenuNavigation(routes, session, [
      menu(),
      menu({ id: 'menu-duplicate', order: 2 }),
      menu({ id: 'menu-roles', routeKey: 'roles', order: 3 }),
      menu({ id: 'menu-unknown', routeKey: 'missing', order: 4 }),
      menu({ id: 'menu-disabled', status: 'disabled', order: 5 }),
    ])

    expect(navigation.map((item) => item.menuId)).toEqual(['menu-users'])
  })

  it('preserves tree depth for the presentational sidebar', () => {
    const navigation = getMenuNavigation(routes, session, [
      menu({ id: 'parent', routeKey: 'missing' }),
      menu({ id: 'child', parentId: 'parent', order: 1 }),
    ])

    expect(navigation).toMatchObject([{ menuId: 'child', depth: 1 }])
  })
})
