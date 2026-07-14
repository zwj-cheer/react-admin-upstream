import type { Capability } from '@/core/services/contracts'

export function authorize(
  grantedCapabilities: readonly Capability[] | undefined,
  requiredCapability: Capability,
): boolean {
  return Boolean(grantedCapabilities?.includes(requiredCapability))
}
