import { delay, http, HttpResponse } from 'msw'
import type { Capability, Session } from '@/core/services/contracts'
import { mockDatabase } from '@/mocks/data/fixtures'
import type { MockSessionRecord, MockSessionStore } from '@/mocks/sessionStore'

const CSRF_TOKEN = 'mock-csrf-token'

function capabilitiesFor(record: MockSessionRecord): string[] {
  const user = mockDatabase.users.find((item) => item.id === record.userId)
  if (!user) return []
  return [
    ...new Set(
      mockDatabase.roles
        .filter((role) => role.status === 'active' && user.roleIds.includes(role.id))
        .flatMap((role) => role.capabilities),
    ),
  ]
}

function synchronizeRoleUserCounts(): void {
  for (const role of mockDatabase.roles) {
    role.userCount = mockDatabase.users.filter((user) => user.roleIds.includes(role.id)).length
  }
}

function createSession(record: MockSessionRecord): Session {
  const user = mockDatabase.users.find((item) => item.id === record.userId) ?? mockDatabase.users[0]
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    source: record.source,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    capabilities: capabilitiesFor(record),
  }
}

function requireCsrf(request: Request) {
  if (request.headers.get('x-csrf-token') !== CSRF_TOKEN) {
    return HttpResponse.json({ message: 'csrf_invalid' }, { status: 403 })
  }
  return undefined
}

function requireSession(store: MockSessionStore) {
  if (!store.read()) {
    return HttpResponse.json({ message: 'unauthorized' }, { status: 401 })
  }
  return undefined
}

function requireCapability(store: MockSessionStore, capability: Capability) {
  const sessionError = requireSession(store)
  if (sessionError) return sessionError
  const record = store.read()
  return record && capabilitiesFor(record).includes(capability)
    ? undefined
    : HttpResponse.json({ message: 'forbidden' }, { status: 403 })
}

function page<T>(items: T[], request: Request) {
  const url = new URL(request.url)
  const pageNumber = Math.max(1, Number(url.searchParams.get('page') ?? 1))
  const pageSize = Math.max(1, Number(url.searchParams.get('pageSize') ?? 10))
  const query = (url.searchParams.get('query') ?? '').trim().toLowerCase()
  const filtered = query
    ? items.filter((item) => JSON.stringify(item).toLowerCase().includes(query))
    : items
  const start = (pageNumber - 1) * pageSize
  return {
    items: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page: pageNumber,
    pageSize,
  }
}

export function createHandlers(store: MockSessionStore) {
  return [
    http.post('/api/auth/login', async ({ request }) => {
      await delay(120)
      const body = (await request.json()) as { email?: string; password?: string }
      if (body.email !== 'admin@example.com' || body.password !== 'Admin123!') {
        return HttpResponse.json({ message: 'invalid_credentials' }, { status: 401 })
      }
      store.write({ source: 'local', userId: 'user-admin' })
      return HttpResponse.json(createSession({ source: 'local', userId: 'user-admin' }))
    }),
    http.get('/api/session', async () => {
      await delay(80)
      const record = store.read()
      if (!record) {
        return HttpResponse.json({ message: 'unauthorized' }, { status: 401 })
      }
      return HttpResponse.json(createSession(record))
    }),
    http.post('/api/auth/logout', ({ request }) => {
      const error = requireCsrf(request)
      if (error) return error
      store.clear()
      return new HttpResponse(null, { status: 204 })
    }),
    http.get('/api/users', ({ request }) => {
      const error = requireCapability(store, 'users:read')
      return error ?? HttpResponse.json(page(mockDatabase.users, request))
    }),
    http.post('/api/users', async ({ request }) => {
      const error = requireCapability(store, 'users:create') ?? requireCsrf(request)
      if (error) return error
      const body = (await request.json()) as {
        name: string
        email: string
        roleIds: string[]
      }
      if (mockDatabase.users.some((user) => user.email === body.email)) {
        return HttpResponse.json({ message: 'email_exists' }, { status: 409 })
      }
      const user = {
        id: 'user-' + crypto.randomUUID(),
        name: body.name,
        email: body.email,
        roleIds: body.roleIds,
        status: 'active' as const,
        createdAt: new Date().toISOString(),
      }
      mockDatabase.users.unshift(user)
      return HttpResponse.json(user, { status: 201 })
    }),
    http.patch('/api/users/:id', async ({ params, request }) => {
      const error = requireCapability(store, 'users:update') ?? requireCsrf(request)
      if (error) return error
      const user = mockDatabase.users.find((item) => item.id === params.id)
      if (!user) return HttpResponse.json({ message: 'not_found' }, { status: 404 })
      Object.assign(user, (await request.json()) as object)
      return HttpResponse.json(user)
    }),
    http.patch('/api/users/:id/status', async ({ params, request }) => {
      const error = requireCapability(store, 'users:toggle') ?? requireCsrf(request)
      if (error) return error
      const user = mockDatabase.users.find((item) => item.id === params.id)
      if (!user) return HttpResponse.json({ message: 'not_found' }, { status: 404 })
      const body = (await request.json()) as { status: 'active' | 'disabled' }
      user.status = body.status
      return HttpResponse.json(user)
    }),
    http.patch('/api/users/:id/roles', async ({ params, request }) => {
      const error = requireCapability(store, 'users:assign-role') ?? requireCsrf(request)
      if (error) return error
      const user = mockDatabase.users.find((item) => item.id === params.id)
      if (!user) return HttpResponse.json({ message: 'not_found' }, { status: 404 })
      const body = (await request.json()) as { roleIds: string[] }
      user.roleIds = body.roleIds
      return HttpResponse.json(user)
    }),
    http.get('/api/roles', ({ request }) => {
      const error = requireCapability(store, 'roles:read')
      synchronizeRoleUserCounts()
      return error ?? HttpResponse.json(page(mockDatabase.roles, request))
    }),
    http.post('/api/roles', async ({ request }) => {
      const error = requireCapability(store, 'roles:create') ?? requireCsrf(request)
      if (error) return error
      const body = (await request.json()) as {
        name: string
        code: string
        description: string
      }
      if (mockDatabase.roles.some((role) => role.code === body.code)) {
        return HttpResponse.json({ message: 'role_code_exists' }, { status: 409 })
      }
      const role = {
        id: 'role-' + crypto.randomUUID(),
        ...body,
        status: 'active' as const,
        capabilities: [] as string[],
        userCount: 0,
      }
      mockDatabase.roles.push(role)
      return HttpResponse.json(role, { status: 201 })
    }),
    http.patch('/api/roles/:id', async ({ params, request }) => {
      const error = requireCapability(store, 'roles:update') ?? requireCsrf(request)
      if (error) return error
      const role = mockDatabase.roles.find((item) => item.id === params.id)
      if (!role) return HttpResponse.json({ message: 'not_found' }, { status: 404 })
      Object.assign(role, (await request.json()) as object)
      return HttpResponse.json(role)
    }),
    http.patch('/api/roles/:id/status', async ({ params, request }) => {
      const error = requireCapability(store, 'roles:toggle') ?? requireCsrf(request)
      if (error) return error
      const role = mockDatabase.roles.find((item) => item.id === params.id)
      if (!role) return HttpResponse.json({ message: 'not_found' }, { status: 404 })
      const body = (await request.json()) as { status: 'active' | 'disabled' }
      role.status = body.status
      return HttpResponse.json(role)
    }),
    http.patch('/api/roles/:id/capabilities', async ({ params, request }) => {
      const error = requireCapability(store, 'roles:permissions') ?? requireCsrf(request)
      if (error) return error
      const role = mockDatabase.roles.find((item) => item.id === params.id)
      if (!role) return HttpResponse.json({ message: 'not_found' }, { status: 404 })
      const body = (await request.json()) as { capabilities: string[] }
      role.capabilities = body.capabilities
      return HttpResponse.json(role)
    }),
    http.delete('/api/roles/:id', ({ params, request }) => {
      const error = requireCapability(store, 'roles:delete') ?? requireCsrf(request)
      if (error) return error
      const role = mockDatabase.roles.find((item) => item.id === params.id)
      if (!role) return HttpResponse.json({ message: 'not_found' }, { status: 404 })
      synchronizeRoleUserCounts()
      if (role.userCount > 0) {
        return HttpResponse.json({ message: 'role_in_use' }, { status: 409 })
      }
      mockDatabase.roles = mockDatabase.roles.filter((item) => item.id !== params.id)
      return new HttpResponse(null, { status: 204 })
    }),
    http.get('/api/menus', () => {
      const error = requireCapability(store, 'menus:read')
      return (
        error ??
        HttpResponse.json([...mockDatabase.menus].sort((left, right) => left.order - right.order))
      )
    }),
    http.post('/api/menus', async ({ request }) => {
      const error = requireCapability(store, 'menus:create') ?? requireCsrf(request)
      if (error) return error
      const body = (await request.json()) as {
        parentId: string | null
        name: string
        routeKey: string
        icon: string
      }
      const menu = {
        id: 'menu-' + crypto.randomUUID(),
        ...body,
        status: 'active' as const,
        order: mockDatabase.menus.length + 1,
      }
      mockDatabase.menus.push(menu)
      return HttpResponse.json(menu, { status: 201 })
    }),
    http.patch('/api/menus/:id', async ({ params, request }) => {
      const error = requireCapability(store, 'menus:update') ?? requireCsrf(request)
      if (error) return error
      const menu = mockDatabase.menus.find((item) => item.id === params.id)
      if (!menu) return HttpResponse.json({ message: 'not_found' }, { status: 404 })
      Object.assign(menu, (await request.json()) as object)
      return HttpResponse.json(menu)
    }),
    http.patch('/api/menus/:id/status', async ({ params, request }) => {
      const error = requireCapability(store, 'menus:toggle') ?? requireCsrf(request)
      if (error) return error
      const menu = mockDatabase.menus.find((item) => item.id === params.id)
      if (!menu) return HttpResponse.json({ message: 'not_found' }, { status: 404 })
      const body = (await request.json()) as { status: 'active' | 'disabled' }
      menu.status = body.status
      return HttpResponse.json(menu)
    }),
    http.post('/api/menus/:id/move', async ({ params, request }) => {
      const error = requireCapability(store, 'menus:order') ?? requireCsrf(request)
      if (error) return error
      const body = (await request.json()) as { direction: 'up' | 'down' }
      const menu = mockDatabase.menus.find((item) => item.id === params.id)
      if (!menu) return HttpResponse.json({ message: 'not_found' }, { status: 404 })
      const siblings = mockDatabase.menus
        .filter((item) => item.parentId === menu.parentId)
        .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id))
      const index = siblings.findIndex((item) => item.id === params.id)
      const target = body.direction === 'up' ? index - 1 : index + 1
      if (index >= 0 && target >= 0 && target < siblings.length) {
        const targetMenu = siblings[target]
        siblings[target] = siblings[index]
        siblings[index] = targetMenu
      }
      siblings.forEach((item, siblingIndex) => {
        item.order = siblingIndex + 1
      })
      return HttpResponse.json(
        [...mockDatabase.menus].sort(
          (left, right) => left.order - right.order || left.id.localeCompare(right.id),
        ),
      )
    }),
    http.delete('/api/menus/:id', ({ params, request }) => {
      const error = requireCapability(store, 'menus:delete') ?? requireCsrf(request)
      if (error) return error
      if (mockDatabase.menus.some((menu) => menu.parentId === params.id)) {
        return HttpResponse.json({ message: 'menu_has_children' }, { status: 409 })
      }
      mockDatabase.menus = mockDatabase.menus.filter((item) => item.id !== params.id)
      return new HttpResponse(null, { status: 204 })
    }),
  ]
}

export { CSRF_TOKEN }
