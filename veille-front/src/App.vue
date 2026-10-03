<script setup lang="ts">
import ConfirmDialog from 'primevue/confirmdialog'
import Toast from 'primevue/toast'
import AppHeader from '@/components/AppHeader.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <Toast position="bottom-right" />
  <ConfirmDialog />
  <AppHeader v-if="auth.isAuthenticated" />
  <main class="app-main">
    <RouterView />
  </main>
</template>

<style scoped>
.app-main {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>
