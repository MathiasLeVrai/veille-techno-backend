<script setup lang="ts">
import Card from 'primevue/card'

defineProps<{ title: string; subtitle: string }>()
</script>

<template>
  <div class="auth-page">
    <Card class="auth-card">
      <template #title>{{ title }}</template>
      <template #subtitle>{{ subtitle }}</template>
      <template #content>
        <slot />
      </template>
      <template #footer>
        <slot name="footer" />
      </template>
    </Card>
  </div>
</template>

<style scoped>
.auth-page {
  flex: 1;
  display: grid;
  place-items: center;
  padding: 1.5rem;
}

.auth-card {
  width: 100%;
  max-width: 420px;
}

.auth-card :deep(form) {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
