<script setup lang="ts">
import { ChartBar, ObjectsColumn, SignOut, Users } from '@primeicons/vue'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Toolbar from 'primevue/toolbar'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Permission } from '@/api/types'
import { ROLES } from '@/constants'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const links: { to: string; label: string; icon: typeof ChartBar; permission: Permission }[] = [
  { to: '/board', label: 'Tableau', icon: ObjectsColumn, permission: 'board:read' },
  { to: '/dashboard', label: 'Tableau de bord', icon: ChartBar, permission: 'dashboard:view' },
  { to: '/admin/users', label: 'Utilisateurs', icon: Users, permission: 'users:manage' },
]

// Chaque rôle ne voit que les liens vers les pages qu'il a le droit d'ouvrir
const visibleLinks = computed(() => links.filter((link) => auth.can(link.permission)))

const initials = computed(
  () =>
    auth.user?.name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ?? '',
)

function logout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <Toolbar class="app-header">
    <template #start>
      <RouterLink to="/board" class="brand">Kanban<span>Veille</span></RouterLink>
      <nav class="nav">
        <RouterLink v-for="link in visibleLinks" :key="link.to" :to="link.to" class="nav-link">
          <component :is="link.icon" :size="16" />
          {{ link.label }}
        </RouterLink>
      </nav>
    </template>
    <template #end>
      <div v-if="auth.user" class="user">
        <Tag :severity="ROLES[auth.user.role].severity" :value="ROLES[auth.user.role].label" />
        <span class="user-name">{{ auth.user.name }}</span>
        <Avatar :label="initials" shape="circle" />
        <Button severity="secondary" variant="text" aria-label="Se déconnecter" @click="logout">
          <SignOut :size="18" />
        </Button>
      </div>
    </template>
  </Toolbar>
</template>

<style scoped>
.app-header {
  border-radius: 0;
  border-width: 0 0 1px;
  padding: 0.5rem 1.5rem;
}

.brand {
  font-weight: 700;
  font-size: 1.15rem;
  color: var(--p-text-color);
  text-decoration: none;
  margin-right: 2rem;
}

.brand span {
  color: var(--p-primary-color);
}

.nav {
  display: flex;
  gap: 0.25rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.85rem;
  border-radius: 0.5rem;
  color: var(--p-text-muted-color);
  text-decoration: none;
  font-weight: 500;
}

.nav-link:hover {
  background: var(--p-content-hover-background);
  color: var(--p-text-color);
}

.nav-link.router-link-active {
  background: var(--p-highlight-background);
  color: var(--p-highlight-color);
}

.user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-name {
  font-weight: 500;
}

@media (max-width: 720px) {
  .user-name,
  .nav-link {
    font-size: 0;
    gap: 0;
  }
}
</style>
