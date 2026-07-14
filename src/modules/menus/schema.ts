import { z } from 'zod'

export const menuFormSchema = z.object({
  parentId: z.string().nullable(),
  name: z.string().trim().min(2).max(50),
  routeKey: z.string().trim().min(1),
  icon: z.string().trim().min(1).max(40),
})

export type MenuFormValues = z.infer<typeof menuFormSchema>
