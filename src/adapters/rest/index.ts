import type { HttpClient } from '@/core/http/client'
import type { Services } from '@/core/services/contracts'
import { RestAuthAdapter } from './authAdapter'
import { RestMenuAdapter } from './menuAdapter'
import { RestRoleAdapter } from './roleAdapter'
import { RestUserAdapter } from './userAdapter'

export function createRestServices(client: HttpClient): Services {
  return {
    auth: new RestAuthAdapter(client),
    users: new RestUserAdapter(client),
    roles: new RestRoleAdapter(client),
    menus: new RestMenuAdapter(client),
  }
}
