import type { TrustedOriginPolicy } from '@/core/config/trustedOrigins'

export const projectTrustedOrigins: TrustedOriginPolicy[] = [
  {
    origin: 'https://api.sample.invalid',
    usages: ['api'],
    allowCredentialedCookies: true,
  },
]
