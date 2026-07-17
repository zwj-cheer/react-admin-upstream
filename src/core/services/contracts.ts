export type AuthSource = 'local' | 'oidc'
export type EntityStatus = 'active' | 'disabled'
export type Capability = string

export interface SessionUser {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

export interface Session {
  user: SessionUser
  source: AuthSource
  expiresAt: string
  capabilities: Capability[]
}

export interface User {
  id: string
  name: string
  email: string
  status: EntityStatus
  roleIds: string[]
  createdAt: string
}

export interface Role {
  id: string
  name: string
  code: string
  description: string
  status: EntityStatus
  capabilities: Capability[]
  userCount: number
}

export interface MenuItem {
  id: string
  parentId: string | null
  name: string
  routeKey: string
  icon: string
  status: EntityStatus
  order: number
}

export interface PageResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface ListParams {
  query?: string
  page?: number
  pageSize?: number
}

export interface UserInput {
  name: string
  email: string
  roleIds: string[]
}

export interface RoleInput {
  name: string
  code: string
  description: string
}

export interface MenuInput {
  parentId: string | null
  name: string
  routeKey: string
  icon: string
}

export interface AuthServiceContract {
  loginLocal(email: string, password: string): Promise<Session>
  getSession(source: AuthSource, signal?: AbortSignal): Promise<Session>
  logout(source: AuthSource): Promise<void>
}

export interface UserServiceContract {
  list(params?: ListParams, signal?: AbortSignal): Promise<PageResult<User>>
  create(input: UserInput): Promise<User>
  update(id: string, input: UserInput): Promise<User>
  setStatus(id: string, status: EntityStatus): Promise<User>
  assignRoles(id: string, roleIds: string[]): Promise<User>
}

export interface RoleServiceContract {
  list(params?: ListParams, signal?: AbortSignal): Promise<PageResult<Role>>
  create(input: RoleInput): Promise<Role>
  update(id: string, input: RoleInput): Promise<Role>
  remove(id: string): Promise<void>
  setStatus(id: string, status: EntityStatus): Promise<Role>
  setCapabilities(id: string, capabilities: Capability[]): Promise<Role>
}

export interface MenuServiceContract {
  list(signal?: AbortSignal): Promise<MenuItem[]>
  create(input: MenuInput): Promise<MenuItem>
  update(id: string, input: MenuInput): Promise<MenuItem>
  remove(id: string): Promise<void>
  setStatus(id: string, status: EntityStatus): Promise<MenuItem>
  move(id: string, direction: 'up' | 'down'): Promise<MenuItem[]>
}

export interface Services {
  auth: AuthServiceContract
  users: UserServiceContract
  roles: RoleServiceContract
  menus: MenuServiceContract
}
