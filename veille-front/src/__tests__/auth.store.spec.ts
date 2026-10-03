import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authApi } from '@/api'
import { getToken } from '@/api/http'
import { useAuthStore } from '@/stores/auth'

vi.mock('@/api', () => ({
  authApi: { login: vi.fn(), me: vi.fn(), register: vi.fn() },
}))

const dev = {
  id: '1',
  email: 'dev@kanban.dev',
  name: 'Diane Dev',
  role: 'DEV' as const,
  permissions: ['board:read' as const, 'card:create' as const, 'card:update' as const],
  createdAt: '',
}

describe('auth store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.mocked(authApi.login).mockResolvedValue({ accessToken: 'jwt' })
    vi.mocked(authApi.me).mockResolvedValue(dev)
  })

  it('stocke le token et charge le profil à la connexion', async () => {
    const auth = useAuthStore()
    await auth.login('dev@kanban.dev', 'password123')

    expect(getToken()).toBe('jwt')
    expect(auth.isAuthenticated).toBe(true)
    expect(auth.user?.role).toBe('DEV')
  })

  it('can() se base sur les permissions renvoyées par le back', async () => {
    const auth = useAuthStore()
    expect(auth.can('board:read')).toBe(false)

    await auth.login('dev@kanban.dev', 'password123')
    expect(auth.can('card:update')).toBe(true)
    expect(auth.can('list:manage')).toBe(false)
  })

  it('se déconnecte si le token stocké n’est plus valide', async () => {
    localStorage.setItem('kanban.token', 'expiré')
    vi.mocked(authApi.me).mockRejectedValue(new Error('401'))
    const auth = useAuthStore()

    await auth.restore()

    expect(auth.ready).toBe(true)
    expect(auth.isAuthenticated).toBe(false)
    expect(getToken()).toBeNull()
  })
})
