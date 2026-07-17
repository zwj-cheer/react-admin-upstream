import { z } from 'zod'

export const userFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: 'validation.nameMin' })
    .max(50, { error: 'validation.nameMax' }),
  email: z.string().trim().email({ error: 'validation.email' }),
})

export type UserFormValues = z.infer<typeof userFormSchema>
