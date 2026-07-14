import type { MenuItem, Role, User } from '@/core/services/contracts'

export const allCapabilities = [
  'users:read',
  'users:create',
  'users:update',
  'users:toggle',
  'users:assign-role',
  'roles:read',
  'roles:create',
  'roles:update',
  'roles:delete',
  'roles:toggle',
  'roles:permissions',
  'menus:read',
  'menus:create',
  'menus:update',
  'menus:delete',
  'menus:toggle',
  'menus:order',
]

const initialUsers: User[] = [
  {
    id: 'user-admin',
    name: '张明',
    email: 'admin@example.com',
    status: 'active',
    roleIds: ['role-admin'],
    createdAt: '2026-01-06T08:00:00.000Z',
  },
  {
    id: 'user-ops',
    name: '林晓',
    email: 'ops@example.com',
    status: 'active',
    roleIds: ['role-operator'],
    createdAt: '2026-02-18T09:30:00.000Z',
  },
  {
    id: 'user-audit',
    name: '周宁',
    email: 'audit@example.com',
    status: 'disabled',
    roleIds: ['role-viewer'],
    createdAt: '2026-03-02T03:20:00.000Z',
  },
]

const initialRoles: Role[] = [
  {
    id: 'role-admin',
    name: '超级管理员',
    code: 'admin',
    description: '拥有模板内全部管理权限',
    status: 'active',
    capabilities: allCapabilities,
    userCount: 1,
  },
  {
    id: 'role-operator',
    name: '运营管理员',
    code: 'operator',
    description: '维护用户和菜单，不可删除角色',
    status: 'active',
    capabilities: allCapabilities.filter((capability) => capability !== 'roles:delete'),
    userCount: 1,
  },
  {
    id: 'role-viewer',
    name: '只读审计',
    code: 'viewer',
    description: '只查看用户、角色和菜单',
    status: 'active',
    capabilities: ['users:read', 'roles:read', 'menus:read'],
    userCount: 1,
  },
]

const initialMenus: MenuItem[] = [
  {
    id: 'menu-users',
    parentId: null,
    name: '用户管理',
    routeKey: 'users',
    icon: 'users',
    status: 'active',
    order: 1,
  },
  {
    id: 'menu-roles',
    parentId: null,
    name: '角色管理',
    routeKey: 'roles',
    icon: 'shield-check',
    status: 'active',
    order: 2,
  },
  {
    id: 'menu-menus',
    parentId: null,
    name: '菜单管理',
    routeKey: 'menus',
    icon: 'menu',
    status: 'active',
    order: 3,
  },
]

export const mockDatabase = {
  users: structuredClone(initialUsers),
  roles: structuredClone(initialRoles),
  menus: structuredClone(initialMenus),
}

export function resetMockDatabase(): void {
  mockDatabase.users = structuredClone(initialUsers)
  mockDatabase.roles = structuredClone(initialRoles)
  mockDatabase.menus = structuredClone(initialMenus)
}
