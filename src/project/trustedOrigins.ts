import type { TrustedOriginPolicy } from '@/core/config/trustedOrigins'

/**
 * Add project-approved external HTTPS origins here.
 * Runtime JSON can select an origin, but it cannot expand this compiled trust boundary.
 */
export const projectTrustedOrigins: TrustedOriginPolicy[] = []
