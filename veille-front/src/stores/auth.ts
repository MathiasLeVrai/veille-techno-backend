import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authApi } from '@/api'
import { getToken, setToken } from '@/api/http'
import type { Permission, User } from '@/api/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  /** Passe à `true` une fois la session restaurée depuis le localStorage (ou abandonnée). */
  const ready = ref(false)

  const isAuthenticated = computed(() => user.value !== null)

  function can(permission: Permission) {
    return user.value?.permissions.includes(permission) ?? false
  }

  async function login(email: string, password: string) {
    const { accessToken } = await authApi.login(email, password)
    setToken(accessToken)
    user.value = await authApi.me()
  }

  async function register(name: string, email: string, password: string) {
    await authApi.register(name, email, password)
    await login(email, password)
  }

  async function restore() {
    if (getToken()) {
      try {
        user.value = await authApi.me()
      } catch {
        logout()
      }
    }
    ready.value = true
  }

  function logout() {
    setToken(null)
    user.value = null
  }

  return { user, ready, isAuthenticated, can, login, register, restore, logout }
})
