import type { AuthSource } from '@/core/services/contracts'

export interface MockSessionRecord {
  source: AuthSource
  userId: string
}

export interface MockSessionStore {
  read(): MockSessionRecord | null
  write(record: MockSessionRecord): void
  clear(): void
}

const STORAGE_KEY = 'react-admin-template.mock-session'

export function createBrowserMockSessionStore(): MockSessionStore {
  return {
    read() {
      try {
        const value = sessionStorage.getItem(STORAGE_KEY)
        return value ? (JSON.parse(value) as MockSessionRecord) : null
      } catch {
        return null
      }
    },
    write(record) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(record))
    },
    clear() {
      sessionStorage.removeItem(STORAGE_KEY)
    },
  }
}

export function createMemoryMockSessionStore(): MockSessionStore {
  let current: MockSessionRecord | null = null
  return {
    read: () => current,
    write: (record) => {
      current = record
    },
    clear: () => {
      current = null
    },
  }
}
