import { z } from 'zod'

export const roleFormSchema = z.object({
  name: z.string().trim().min(2).max(50),
  code: z
    .string()
    .trim()
    .min(2)
    .max(40)
    .regex(/^[a-z][a-z0-9_-]*$/),
  description: z.string().trim().max(200),
})

export type RoleFormValues = z.infer<typeof roleFormSchema>
