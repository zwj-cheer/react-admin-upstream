import { describe, expect, it } from 'vitest'
import type { RegisteredRoute } from './routeRegistry'
import { createRouteRegistry } from './routeRegistry'

function ProjectPage() {
  return null
}

describe('createRouteRegistry', () => {
  it('appends typed downstream routes to the template registry', () => {
    const projectRoute: RegisteredRoute = {
      key: 'reports',
      path: '/reports',
      titleKey: 'reports.title',
      subtitleKey: 'reports.subtitle',
      icon: 'chart',
      capability: 'reports:read',
      component: ProjectPage,
    }

    const routes = createRouteRegistry([projectRoute])

    expect(routes.map((route) => route.key)).toEqual(['users', 'roles', 'menus', 'reports'])
    expect(routes.at(-1)).toBe(projectRoute)
  })
})
