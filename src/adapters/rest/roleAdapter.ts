import { z } from 'zod'
import type { HttpClient } from '@/core/http/client'
import type {
  Capability,
  EntityStatus,
  ListParams,
  PageResult,
  Role,
  RoleInput,
  RoleServiceContract,
} from '@/core/services/contracts'
import { capabilitySchema, pageSchema } from './schemas'

export const roleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string(),
  status: z.enum(['active', 'disabled']),
  capabilities: z.array(capabilitySchema),
  userCount: z.number().int().nonnegative(),
})

export type RoleResponse = z.infer<typeof roleSchema>

export class RestRoleAdapter implements RoleServiceContract {
  constructor(private readonly client: HttpClient) {}

  async list(params: ListParams = {}, signal?: AbortSignal): Promise<PageResult<Role>> {
    const query = new URLSearchParams()
    if (params.query) query.set('query', params.query)
    query.set('page', String(params.page ?? 1))
    query.set('pageSize', String(params.pageSize ?? 10))
    return pageSchema(roleSchema).parse(await this.client.request('/roles?' + query, { signal }))
  }

  async create(input: RoleInput): Promise<Role> {
    return roleSchema.parse(await this.client.request('/roles', { method: 'POST', body: input }))
  }

  async update(id: string, input: RoleInput): Promise<Role> {
    const roleId = encodeURIComponent(id)
    return roleSchema.parse(
      await this.client.request('/roles/' + roleId, { method: 'PATCH', body: input }),
    )
  }

  async remove(id: string): Promise<void> {
    await this.client.request('/roles/' + encodeURIComponent(id), { method: 'DELETE' })
  }

  async setStatus(id: string, status: EntityStatus): Promise<Role> {
    const roleId = encodeURIComponent(id)
    return roleSchema.parse(
      await this.client.request('/roles/' + roleId + '/status', {
        method: 'PATCH',
        body: { status },
      }),
    )
  }

  async setCapabilities(id: string, capabilities: Capability[]): Promise<Role> {
    const roleId = encodeURIComponent(id)
    return roleSchema.parse(
      await this.client.request('/roles/' + roleId + '/capabilities', {
        method: 'PATCH',
        body: { capabilities },
      }),
    )
  }
}
