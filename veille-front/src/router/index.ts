import { createRouter, createWebHistory } from 'vue-router'
import type { Permission } from '@/api/types'
import { useAuthStore } from '@/stores/auth'

declare module 'vue-router' {
  interface RouteMeta {
    /** Page réservée aux visiteurs non connectés (login, inscription). */
    guestOnly?: boolean
    /** Permission requise ; implique d'être connecté. */
    permission?: Permission
  }
}

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: { name: 'board' } },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/board',
      name: 'board',
      component: () => import('@/views/BoardView.vue'),
      meta: { permission: 'board:read' },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { permission: 'dashboard:view' },
    },
    {
      path: '/admin/users',
      name: 'users',
      component: () => import('@/views/UsersView.vue'),
      meta: { permission: 'users:manage' },
    },
    {
      path: '/forbidden',
      name: 'forbidden',
      component: () => import('@/views/ForbiddenView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (!auth.ready) {
    await auth.restore()
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'board' }
  }
  if (to.meta.permission) {
    if (!auth.isAuthenticated) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }
    if (!auth.can(to.meta.permission)) {
      return { name: 'forbidden' }
    }
  }
})
