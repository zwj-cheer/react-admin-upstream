import { z } from 'zod'

export const menuFormSchema = z.object({
  parentId: z.string().nullable(),
  name: z
    .string()
    .trim()
    .min(2, { error: 'validation.nameMin' })
    .max(50, { error: 'validation.nameMax' }),
  routeKey: z.string().trim().min(1, { error: 'validation.routeRequired' }),
  icon: z
    .string()
    .trim()
    .min(1, { error: 'validation.iconRequired' })
    .max(40, { error: 'validation.iconMax' }),
})

export type MenuFormValues = z.infer<typeof menuFormSchema>
