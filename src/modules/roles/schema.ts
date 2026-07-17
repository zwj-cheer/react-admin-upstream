import { z } from 'zod'

export const roleFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: 'validation.nameMin' })
    .max(50, { error: 'validation.nameMax' }),
  code: z
    .string()
    .trim()
    .min(2, { error: 'validation.codeMin' })
    .max(40, { error: 'validation.codeMax' })
    .regex(/^[a-z][a-z0-9_-]*$/, { error: 'validation.codePattern' }),
  description: z.string().trim().max(200, { error: 'validation.descriptionMax' }),
})

export type RoleFormValues = z.infer<typeof roleFormSchema>
