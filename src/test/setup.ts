import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'

function createMemoryStorage(): Storage {
  const values = new Map<string, string>()

  return {
    get length() {
      return values.size
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => {
      values.delete(key)
    },
    setItem: (key, value) => {
      values.set(key, String(value))
    },
  }
}

Object.defineProperty(window, 'localStorage', {
  configurable: true,
  value: createMemoryStorage(),
})
Object.defineProperty(window, 'sessionStorage', {
  configurable: true,
  value: createMemoryStorage(),
})
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: window.localStorage,
})
Object.defineProperty(globalThis, 'sessionStorage', {
  configurable: true,
  value: window.sessionStorage,
})

afterEach(() => {
  window.localStorage.clear()
  window.sessionStorage.clear()
  document.documentElement.classList.remove('dark')
  document.documentElement.removeAttribute('lang')
})
