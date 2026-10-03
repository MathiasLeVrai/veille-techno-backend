<script setup lang="ts">
import Card from 'primevue/card'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import { onMounted, ref } from 'vue'
import { usersApi } from '@/api'
import type { Role, User } from '@/api/types'
import { useNotify } from '@/composables/useNotify'
import { ROLES } from '@/constants'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const { attempt } = useNotify()

const users = ref<User[]>([])
const loading = ref(true)

const roleOptions = Object.entries(ROLES).map(([value, { label }]) => ({
  value: value as Role,
  label,
}))

onMounted(async () => {
  await attempt(async () => {
    users.value = await usersApi.list()
  })
  loading.value = false
})

async function changeRole(user: User, role: Role) {
  await attempt(async () => {
    const updated = await usersApi.updateRole(user.id, role)
    users.value = users.value.map((u) => (u.id === user.id ? updated : u))
  }, `${user.name} est maintenant ${ROLES[role].label}`)
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1>Utilisateurs</h1>
        <p class="muted">Attribuez un rôle à chaque membre de l'équipe</p>
      </div>
    </div>

    <Card>
      <template #content>
        <DataTable :value="users" :loading="loading" data-key="id" striped-rows>
          <Column field="name" header="Nom" sortable />
          <Column field="email" header="Email" sortable />
          <Column header="Rôle" style="width: 14rem">
            <template #body="{ data }">
              <Select
                :model-value="data.role"
                :options="roleOptions"
                option-label="label"
                option-value="value"
                size="small"
                fluid
                @update:model-value="(role: Role) => changeRole(data, role)"
              />
            </template>
          </Column>
          <Column header="Droits">
            <template #body="{ data }">
              <span class="muted">{{ ROLES[data.role as Role]?.description }}</span>
              <Tag v-if="data.id === auth.user?.id" value="Vous" severity="info" class="me" />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.me {
  margin-left: 0.5rem;
}
</style>
