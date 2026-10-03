<script setup lang="ts">
import { Compass } from '@primeicons/vue'
import Button from 'primevue/button'
</script>

<template>
  <div class="status-page">
    <Compass :size="48" class="icon" />
    <h1>Page introuvable</h1>
    <p class="muted">Cette adresse ne correspond à aucune page.</p>
    <Button @click="$router.push('/')">Retour à l'accueil</Button>
  </div>
</template>

<style scoped>
.status-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  text-align: center;
}

.icon {
  color: var(--p-text-muted-color);
}
</style>
