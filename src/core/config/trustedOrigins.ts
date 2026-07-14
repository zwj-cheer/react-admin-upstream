export type TrustedOriginUsage = 'api' | 'oidc'

export interface TrustedOriginPolicy {
  origin: string
  usages: TrustedOriginUsage[]
  allowCredentialedCookies?: boolean
}

export function findTrustedOrigin(
  policies: TrustedOriginPolicy[],
  origin: string,
  usage: TrustedOriginUsage,
): TrustedOriginPolicy | undefined {
  return policies.find((policy) => policy.origin === origin && policy.usages.includes(usage))
}
