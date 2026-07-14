import { describe, expect, it } from 'vitest'
import type { Session } from '@/core/services/contracts'
import { findRouteByPath, resolvePostLoginPath, type RegisteredRoute } from './registry'

function route(key: string, path: string, capability: string): RegisteredRoute {
  return {
    key,
    path,
    titleKey: key + '.title',
    subtitleKey: key + '.subtitle',
    icon: 'menu',
    capability,
    component: () => null,
  }
}

const routes: RegisteredRoute[] = [
  route('users', '/users', 'users:read'),
  route('userDetail', '/users/:id', 'users:read'),
  route('roles', '/roles', 'roles:read'),
]

const session: Session = {
  user: { id: '1', name: 'Admin', email: 'admin@example.com' },
  source: 'local',
  expiresAt: new Date(Date.now() + 60_000).toISOString(),
  capabilities: ['users:read'],
}

describe('findRouteByPath', () => {
  it('matches static paths exactly', () => {
    expect(findRouteByPath(routes, '/users')?.key).toBe('users')
  })

  it('matches dynamic segments', () => {
    expect(findRouteByPath(routes, '/users/42')?.key).toBe('userDetail')
  })

  it('returns undefined for unregistered paths', () => {
    expect(findRouteByPath(routes, '/nope')).toBeUndefined()
  })
})

describe('resolvePostLoginPath', () => {
  it('falls back to the first authorized route when returnTo is absent', () => {
    expect(resolvePostLoginPath(routes, session)).toBe('/users')
  })

  it('honors an authorized same-origin returnTo, including dynamic routes', () => {
    expect(resolvePostLoginPath(routes, session, '/users/42')).toBe('/users/42')
  })

  it('ignores returnTo pointing at an unauthorized route', () => {
    expect(resolvePostLoginPath(routes, session, '/roles')).toBe('/users')
  })

  it('ignores cross-origin returnTo to prevent open redirects', () => {
    expect(resolvePostLoginPath(routes, session, 'https://evil.example.com/users')).toBe('/users')
  })

  it('returns /forbidden when the session has no authorized routes', () => {
    expect(resolvePostLoginPath(routes, { ...session, capabilities: [] })).toBe('/forbidden')
  })
})
