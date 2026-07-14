import { z } from 'zod'

export const capabilitySchema = z.string().min(1)

export const sessionSchema = z.object({
  user: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    email: z.string().email(),
    avatarUrl: z.string().url().optional(),
  }),
  source: z.enum(['local', 'oidc']),
  expiresAt: z.string().datetime(),
  capabilities: z.array(capabilitySchema),
})

export const userSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  status: z.enum(['active', 'disabled']),
  roleIds: z.array(z.string()),
  createdAt: z.string().datetime(),
})

export const roleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string(),
  status: z.enum(['active', 'disabled']),
  capabilities: z.array(capabilitySchema),
  userCount: z.number().int().nonnegative(),
})

export const menuSchema = z.object({
  id: z.string().min(1),
  parentId: z.string().nullable(),
  name: z.string().min(1),
  routeKey: z.string().min(1),
  icon: z.string().min(1),
  status: z.enum(['active', 'disabled']),
  order: z.number().int(),
})

export function pageSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
  })
}
