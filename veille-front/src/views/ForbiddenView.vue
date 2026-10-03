<script setup lang="ts">
import { Lock } from '@primeicons/vue'
import Button from 'primevue/button'
</script>

<template>
  <div class="status-page">
    <Lock :size="48" class="icon" />
    <h1>Accès refusé</h1>
    <p class="muted">Votre rôle ne permet pas d'ouvrir cette page.</p>
    <Button @click="$router.push('/board')">Retour au tableau</Button>
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
