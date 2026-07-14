import { z } from 'zod'

export const userFormSchema = z.object({
  name: z.string().trim().min(2).max(50),
  email: z.string().trim().email(),
})

export type UserFormValues = z.infer<typeof userFormSchema>
