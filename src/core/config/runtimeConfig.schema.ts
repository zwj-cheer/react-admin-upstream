import { z } from 'zod'

export const themePreferenceSchema = z.enum(['light', 'dark', 'system'])
export const localeSchema = z.enum(['zh-CN', 'en-US'])
export const authModeSchema = z.enum(['local', 'oidc', 'hybrid'])

export type Locale = z.infer<typeof localeSchema>

export const approvedOidcRedirectPaths = ['/auth/callback'] as const
export const approvedPostLogoutRedirectPaths = ['/login'] as const

const oidcSchema = z
  .object({
    authority: z.string().url(),
    clientId: z.string().min(1),
    redirectPath: z.enum(approvedOidcRedirectPaths),
    postLogoutRedirectPath: z.enum(approvedPostLogoutRedirectPaths),
    scope: z.string().min(1),
  })
  .strict()

export const runtimeConfigSchema = z
  .object({
    schemaVersion: z.literal(1),
    app: z
      .object({
        name: z.string().min(1).max(80),
      })
      .strict(),
    api: z
      .object({
        baseUrl: z.string().min(1),
        timeoutMs: z.number().int().min(1000).max(120000).default(10000),
      })
      .strict(),
    auth: z
      .object({
        mode: authModeSchema,
        local: z
          .object({
            csrfHeaderName: z.string().min(1).default('x-csrf-token'),
          })
          .strict()
          .default({ csrfHeaderName: 'x-csrf-token' }),
        oidc: oidcSchema.optional(),
      })
      .strict(),
    defaults: z
      .object({
        theme: themePreferenceSchema.default('system'),
        locale: localeSchema.optional(),
      })
      .strict(),
    ui: z
      .object({
        accountMenu: z
          .object({
            sidebar: z.boolean().default(true),
            header: z.boolean().default(false),
          })
          .strict()
          .default({ sidebar: true, header: false }),
      })
      .strict()
      .default({ accountMenu: { sidebar: true, header: false } }),
    mock: z
      .object({
        enabled: z.boolean().default(false),
      })
      .strict()
      .default({ enabled: false }),
  })
  .strict()
  .superRefine((config, context) => {
    if ((config.auth.mode === 'oidc' || config.auth.mode === 'hybrid') && !config.auth.oidc) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['auth', 'oidc'],
        message: 'OIDC settings are required for oidc and hybrid modes',
      })
    }
  })

export type RuntimeConfigInput = z.input<typeof runtimeConfigSchema>
export type RuntimeConfig = z.output<typeof runtimeConfigSchema>
