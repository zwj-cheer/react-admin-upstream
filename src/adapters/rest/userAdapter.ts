import type { HttpClient } from '@/core/http/client'
import type {
  EntityStatus,
  ListParams,
  PageResult,
  User,
  UserInput,
  UserServiceContract,
} from '@/core/services/contracts'
import { pageSchema, userSchema } from './schemas'

export class RestUserAdapter implements UserServiceContract {
  constructor(private readonly client: HttpClient) {}

  async list(params: ListParams = {}): Promise<PageResult<User>> {
    const query = new URLSearchParams()
    if (params.query) query.set('query', params.query)
    query.set('page', String(params.page ?? 1))
    query.set('pageSize', String(params.pageSize ?? 10))
    return pageSchema(userSchema).parse(await this.client.request('/users?' + query))
  }

  async create(input: UserInput): Promise<User> {
    return userSchema.parse(await this.client.request('/users', { method: 'POST', body: input }))
  }

  async update(id: string, input: UserInput): Promise<User> {
    const userId = encodeURIComponent(id)
    return userSchema.parse(
      await this.client.request('/users/' + userId, { method: 'PATCH', body: input }),
    )
  }

  async setStatus(id: string, status: EntityStatus): Promise<User> {
    const userId = encodeURIComponent(id)
    return userSchema.parse(
      await this.client.request('/users/' + userId + '/status', {
        method: 'PATCH',
        body: { status },
      }),
    )
  }

  async assignRoles(id: string, roleIds: string[]): Promise<User> {
    const userId = encodeURIComponent(id)
    return userSchema.parse(
      await this.client.request('/users/' + userId + '/roles', {
        method: 'PATCH',
        body: { roleIds },
      }),
    )
  }
}
