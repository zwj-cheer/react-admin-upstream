import {
  UserManager,
  WebStorageStateStore,
  type SigninRedirectArgs,
  type User,
} from 'oidc-client-ts'
import type { RuntimeConfig } from '@/core/config/runtimeConfig.schema'

let manager: UserManager | undefined
let configuredAuthority: string | undefined

function oidcSettings(config: RuntimeConfig) {
  if (!config.auth.oidc) {
    throw new Error('oidc_not_configured')
  }
  return config.auth.oidc
}

export function configureOidc(config: RuntimeConfig): void {
  if (!config.auth.oidc) {
    manager = undefined
    configuredAuthority = undefined
    return
  }

  if (manager && configuredAuthority === config.auth.oidc.authority) {
    return
  }

  const settings = oidcSettings(config)
  configuredAuthority = settings.authority
  manager = new UserManager({
    authority: settings.authority,
    client_id: settings.clientId,
    redirect_uri: window.location.origin + settings.redirectPath,
    post_logout_redirect_uri: window.location.origin + settings.postLogoutRedirectPath,
    response_type: 'code',
    scope: settings.scope,
    monitorSession: false,
    automaticSilentRenew: false,
    userStore: new WebStorageStateStore({ store: window.sessionStorage }),
  })
}

function getManager(): UserManager {
  if (!manager) {
    throw new Error('oidc_not_configured')
  }
  return manager
}

export async function hasRestorableOidcUser(): Promise<boolean> {
  const user = await getManager().getUser()
  return Boolean(user && !user.expired)
}

export async function beginOidcLogin(returnTo?: string): Promise<void> {
  const args: SigninRedirectArgs = returnTo ? { state: { returnTo } } : {}
  await getManager().signinRedirect(args)
}

export async function completeOidcLogin(): Promise<{ user: User; returnTo?: string }> {
  const user = await getManager().signinRedirectCallback()
  const state =
    typeof user.state === 'object' && user.state !== null
      ? (user.state as { returnTo?: unknown })
      : undefined
  const returnTo = typeof state?.returnTo === 'string' ? state.returnTo : undefined
  window.history.replaceState({}, document.title, window.location.pathname)
  return { user, returnTo }
}

export async function getOidcAccessToken(): Promise<string | undefined> {
  const user = await manager?.getUser()
  return user && !user.expired ? user.access_token : undefined
}

export async function clearOidcUser(): Promise<void> {
  await manager?.removeUser()
}

export async function signoutOidc(): Promise<void> {
  await manager?.signoutRedirect()
}
