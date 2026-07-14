import { z } from 'zod'
import type { HttpClient } from '@/core/http/client'
import type {
  EntityStatus,
  MenuInput,
  MenuItem,
  MenuServiceContract,
} from '@/core/services/contracts'
import { menuSchema } from './schemas'

export class RestMenuAdapter implements MenuServiceContract {
  constructor(private readonly client: HttpClient) {}

  async list(): Promise<MenuItem[]> {
    return z.array(menuSchema).parse(await this.client.request('/menus'))
  }

  async create(input: MenuInput): Promise<MenuItem> {
    return menuSchema.parse(await this.client.request('/menus', { method: 'POST', body: input }))
  }

  async update(id: string, input: MenuInput): Promise<MenuItem> {
    const menuId = encodeURIComponent(id)
    return menuSchema.parse(
      await this.client.request('/menus/' + menuId, { method: 'PATCH', body: input }),
    )
  }

  async remove(id: string): Promise<void> {
    await this.client.request('/menus/' + encodeURIComponent(id), { method: 'DELETE' })
  }

  async setStatus(id: string, status: EntityStatus): Promise<MenuItem> {
    const menuId = encodeURIComponent(id)
    return menuSchema.parse(
      await this.client.request('/menus/' + menuId + '/status', {
        method: 'PATCH',
        body: { status },
      }),
    )
  }

  async move(id: string, direction: 'up' | 'down'): Promise<MenuItem[]> {
    const menuId = encodeURIComponent(id)
    return z.array(menuSchema).parse(
      await this.client.request('/menus/' + menuId + '/move', {
        method: 'POST',
        body: { direction },
      }),
    )
  }
}
