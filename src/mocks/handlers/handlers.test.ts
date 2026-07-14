import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { createRestServices } from '@/adapters/rest'
import { HttpClient } from '@/core/http/client'
import { mockDatabase, resetMockDatabase } from '@/mocks/data/fixtures'
import { createMockServer } from '@/mocks/server'

const server = createMockServer()
const services = createRestServices(
  new HttpClient({
    baseUrl: 'http://localhost/api',
    timeoutMs: 1000,
    csrfHeaderName: 'x-csrf-token',
    csrfTokenProvider: async () => 'mock-csrf-token',
  }),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  resetMockDatabase()
})
afterAll(() => server.close())

describe('MSW handlers', () => {
  it('keeps the real HTTP contract across login and user listing', async () => {
    await services.auth.loginLocal('admin@example.com', 'Admin123!')
    const users = await services.users.list()
    expect(users.total).toBeGreaterThan(0)
  })

  it('rejects state changes without the CSRF contract', async () => {
    const unsafeServices = createRestServices(
      new HttpClient({
        baseUrl: 'http://localhost/api',
        timeoutMs: 1000,
        csrfHeaderName: 'x-csrf-token',
      }),
    )
    await unsafeServices.auth.loginLocal('admin@example.com', 'Admin123!')
    await expect(
      unsafeServices.users.create({
        name: 'New User',
        email: 'new@example.com',
        roleIds: [],
      }),
    ).rejects.toEqual(expect.objectContaining({ kind: 'forbidden' }))
  })

  it('keeps role user counts and delete constraints in sync with assignments', async () => {
    await services.auth.loginLocal('admin@example.com', 'Admin123!')
    const role = await services.roles.create({
      name: 'Test Role',
      code: 'test-role',
      description: 'Role count regression coverage',
    })
    await services.users.create({
      name: 'Assigned User',
      email: 'assigned@example.com',
      roleIds: [role.id],
    })

    const roles = await services.roles.list({ page: 1, pageSize: 100 })
    expect(roles.items.find((item) => item.id === role.id)?.userCount).toBe(1)
    await expect(services.roles.remove(role.id)).rejects.toEqual(
      expect.objectContaining({ kind: 'conflict' }),
    )
  })

  it('moves menus only among siblings and normalizes their order', async () => {
    await services.auth.loginLocal('admin@example.com', 'Admin123!')
    mockDatabase.menus.push(
      {
        id: 'menu-users-child-first',
        parentId: 'menu-users',
        name: 'Child first',
        routeKey: 'roles',
        icon: 'menu',
        status: 'active',
        order: 10,
      },
      {
        id: 'menu-users-child-later',
        parentId: 'menu-users',
        name: 'Child later',
        routeKey: 'menus',
        icon: 'menu',
        status: 'active',
        order: 20,
      },
    )

    const result = await services.menus.move('menu-users-child-later', 'up')
    const children = result
      .filter((menu) => menu.parentId === 'menu-users')
      .sort((left, right) => left.order - right.order)
    const roots = result
      .filter((menu) => menu.parentId === null)
      .sort((left, right) => left.order - right.order)

    expect(children.map((menu) => [menu.id, menu.order])).toEqual([
      ['menu-users-child-later', 1],
      ['menu-users-child-first', 2],
    ])
    expect(roots.map((menu) => menu.id)).toEqual(['menu-users', 'menu-roles', 'menu-menus'])
  })
})
