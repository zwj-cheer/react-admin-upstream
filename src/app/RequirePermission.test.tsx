import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { useAuthStore } from '@/core/auth/authStore'
import { RequirePermission } from './RequirePermission'

describe('RequirePermission', () => {
  beforeEach(() => {
    useAuthStore.getState().setSession({
      user: { id: '1', name: 'Admin', email: 'admin@example.com' },
      source: 'local',
      expiresAt: new Date(Date.now() + 10000).toISOString(),
      capabilities: [],
    })
  })

  it('redirects unknown capabilities to the dedicated forbidden route', () => {
    renderApp(
      <Routes>
        <Route
          path="/protected"
          element={
            <RequirePermission capability="users:read">
              <div>protected</div>
            </RequirePermission>
          }
        />
        <Route path="/forbidden" element={<div>forbidden</div>} />
      </Routes>,
      ['/protected'],
    )
    expect(screen.getByText('forbidden')).toBeInTheDocument()
  })
})
