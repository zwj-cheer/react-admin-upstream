import type { QueryClient } from '@tanstack/react-query'
import type { RuntimeConfig } from '@/core/config/runtimeConfig.schema'
import { setTransportAuthSource } from '@/core/http/authTransport'
import { HttpError } from '@/core/http/errors'
import { subscribeUnauthorized } from '@/core/http/unauthorized'
import type { AuthSource, Services, Session } from '@/core/services/contracts'
import { useAuthStore } from './authStore'
import {
  beginOidcLogin,
  clearOidcUser,
  completeOidcLogin,
  hasRestorableOidcUser,
  signoutOidc,
} from './oidcAuth'

const SOURCE_KEY = 'react-admin-template.auth-source:v1'
const MAX_TIMER_DELAY_MS = 2_147_483_647

function readSource(): AuthSource | undefined {
  try {
    const value = sessionStorage.getItem(SOURCE_KEY)
    return value === 'local' || value === 'oidc' ? value : undefined
  } catch {
    return undefined
  }
}

function writeSource(source: AuthSource | undefined): void {
  try {
    if (source) {
      sessionStorage.setItem(SOURCE_KEY, source)
    } else {
      sessionStorage.removeItem(SOURCE_KEY)
    }
  } catch {
    // Local authentication must remain usable when session storage is unavailable.
  }
}

export class AuthService {
  private restorePromise?: Promise<void>
  private callbackPromise?: Promise<string | undefined>
  private clearPromise?: Promise<void>
  private unsubscribeUnauthorized?: () => void
  private expiryTimer?: ReturnType<typeof setTimeout>

  constructor(
    private readonly config: RuntimeConfig,
    private readonly services: Services,
    private readonly queryClient: QueryClient,
  ) {}

  start(): void {
    this.unsubscribeUnauthorized ??= subscribeUnauthorized(() => {
      void this.clearSession()
    })
  }

  stop(): void {
    this.unsubscribeUnauthorized?.()
    this.unsubscribeUnauthorized = undefined
    this.cancelExpiryTimer()
  }

  restore(): Promise<void> {
    this.restorePromise ??= this.restoreInternal().finally(() => {
      this.restorePromise = undefined
    })
    return this.restorePromise
  }

  private async restoreInternal(): Promise<void> {
    useAuthStore.getState().setRestoring()
    let source: AuthSource | undefined

    if (this.config.auth.mode === 'local') {
      source = 'local'
    } else if (this.config.auth.mode === 'oidc') {
      source = 'oidc'
    } else {
      source = readSource()
    }

    if (!source) {
      useAuthStore.getState().setUnauthenticated()
      return
    }

    try {
      if (source === 'oidc' && !(await hasRestorableOidcUser())) {
        throw new HttpError('unauthorized', 401)
      }
      setTransportAuthSource(source)
      const session = await this.services.auth.getSession(source)
      this.acceptSession(session)
    } catch {
      await this.clearSession()
    }
  }

  async loginLocal(email: string, password: string): Promise<Session> {
    useAuthStore.getState().setRestoring()
    try {
      setTransportAuthSource('local')
      const session = await this.services.auth.loginLocal(email, password)
      this.acceptSession(session)
      return session
    } catch {
      await this.clearSession()
      useAuthStore.getState().setError('local_login_failed')
      throw new Error('local_login_failed')
    }
  }

  async loginOidc(returnTo?: string): Promise<void> {
    await beginOidcLogin(returnTo)
  }

  completeOidcCallback(): Promise<string | undefined> {
    this.callbackPromise ??= this.completeOidcCallbackInternal().finally(() => {
      this.callbackPromise = undefined
    })
    return this.callbackPromise
  }

  private async completeOidcCallbackInternal(): Promise<string | undefined> {
    useAuthStore.getState().setRestoring()
    try {
      const { returnTo } = await completeOidcLogin()
      setTransportAuthSource('oidc')
      const session = await this.services.auth.getSession('oidc')
      this.acceptSession(session)
      return returnTo
    } catch {
      await this.clearSession()
      useAuthStore.getState().setError('oidc_callback_failed')
      throw new Error('oidc_callback_failed')
    }
  }

  async logout(): Promise<void> {
    const source = useAuthStore.getState().session?.source ?? readSource()

    try {
      if (source) {
        await this.services.auth.logout(source)
      }
    } catch {
      // IdP logout and local cleanup must still run when the application session is unavailable.
    }

    if (source === 'oidc') {
      try {
        await signoutOidc()
      } catch {
        // Local cleanup below keeps the login screen retryable when the IdP is unavailable.
      }
    }

    await this.clearSession()
  }

  async clearSession(): Promise<void> {
    this.clearPromise ??= this.clearSessionInternal().finally(() => {
      this.clearPromise = undefined
    })
    return this.clearPromise
  }

  private async clearSessionInternal(): Promise<void> {
    this.cancelExpiryTimer()
    writeSource(undefined)
    setTransportAuthSource(undefined)
    this.queryClient.clear()
    try {
      await clearOidcUser()
    } catch {
      // Storage cleanup failure must not leave the application authenticated.
    }
    useAuthStore.getState().setUnauthenticated()
  }

  private acceptSession(session: Session): void {
    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      throw new HttpError('unauthorized', 401)
    }

    writeSource(session.source)
    useAuthStore.getState().setSession(session)
    this.scheduleExpiry(session)
  }

  private scheduleExpiry(session: Session): void {
    this.cancelExpiryTimer()

    const armTimer = () => {
      const remainingMs = new Date(session.expiresAt).getTime() - Date.now()
      if (remainingMs <= 0) {
        void this.clearSession()
        return
      }

      this.expiryTimer = setTimeout(
        () => {
          this.expiryTimer = undefined
          const currentSession = useAuthStore.getState().session
          if (
            currentSession?.source === session.source &&
            currentSession.expiresAt === session.expiresAt
          ) {
            armTimer()
          }
        },
        Math.min(remainingMs, MAX_TIMER_DELAY_MS),
      )
    }

    armTimer()
  }

  private cancelExpiryTimer(): void {
    if (this.expiryTimer !== undefined) {
      clearTimeout(this.expiryTimer)
      this.expiryTimer = undefined
    }
  }
}
