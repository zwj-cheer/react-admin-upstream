import { create } from 'zustand'
import type { Session } from '@/core/services/contracts'

export type AuthStatus = 'idle' | 'restoring' | 'authenticated' | 'unauthenticated' | 'error'

interface AuthState {
  status: AuthStatus
  session?: Session
  errorCategory?: string
  setRestoring: () => void
  setSession: (session: Session) => void
  setUnauthenticated: () => void
  setError: (category: string) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'idle',
  setRestoring: () => set({ status: 'restoring', errorCategory: undefined }),
  setSession: (session) => set({ status: 'authenticated', session, errorCategory: undefined }),
  setUnauthenticated: () =>
    set({ status: 'unauthenticated', session: undefined, errorCategory: undefined }),
  setError: (errorCategory) => set({ status: 'error', session: undefined, errorCategory }),
}))
