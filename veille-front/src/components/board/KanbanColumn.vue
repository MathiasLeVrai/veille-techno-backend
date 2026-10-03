<script setup lang="ts">
import { Check, PenToSquare, Plus, Times, Trash } from '@primeicons/vue'
import Badge from 'primevue/badge'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import { nextTick, ref, useTemplateRef } from 'vue'
import type { Card, List } from '@/api/types'
import TaskCard from './TaskCard.vue'

const props = defineProps<{
  list: List
  cards: Card[]
  canManage: boolean
  canCreate: boolean
  canMove: boolean
}>()

const emit = defineEmits<{
  rename: [title: string]
  remove: []
  addCard: [title: string]
  openCard: [card: Card]
  moveCard: [cardId: string, beforeCardId: string | null]
}>()

const editing = ref(false)
const draftTitle = ref('')
const titleInput = useTemplateRef<{ $el: HTMLInputElement }>('titleInput')

async function startEditing() {
  draftTitle.value = props.list.title
  editing.value = true
  await nextTick()
  titleInput.value?.$el.focus()
}

function saveTitle() {
  const title = draftTitle.value.trim()
  if (title && title !== props.list.title) emit('rename', title)
  editing.value = false
}

const newCardTitle = ref('')

function addCard() {
  const title = newCardTitle.value.trim()
  if (!title) return
  emit('addCard', title)
  newCardTitle.value = ''
}

const isDragOver = ref(false)

function onDropAtEnd(event: DragEvent) {
  isDragOver.value = false
  const cardId = event.dataTransfer?.getData('text/plain')
  if (cardId) emit('moveCard', cardId, null)
}
</script>

<template>
  <section
    class="column"
    :class="{ 'drag-over': isDragOver }"
    @dragover.prevent="isDragOver = canMove"
    @dragleave.self="isDragOver = false"
    @drop.prevent="onDropAtEnd"
  >
    <header class="column-header">
      <form v-if="editing" class="title-form" @submit.prevent="saveTitle">
        <InputText
          ref="titleInput"
          v-model="draftTitle"
          size="small"
          fluid
          @keydown.esc="editing = false"
        />
        <Button type="submit" size="small" variant="text" aria-label="Valider"
          ><Check :size="14"
        /></Button>
        <Button
          size="small"
          variant="text"
          severity="secondary"
          aria-label="Annuler"
          @click="editing = false"
        >
          <Times :size="14" />
        </Button>
      </form>
      <template v-else>
        <h2 class="column-title">{{ list.title }}</h2>
        <Badge :value="cards.length" severity="secondary" />
        <div v-if="canManage" class="column-actions">
          <Button
            size="small"
            variant="text"
            severity="secondary"
            aria-label="Renommer"
            @click="startEditing"
          >
            <PenToSquare :size="14" />
          </Button>
          <Button
            size="small"
            variant="text"
            severity="danger"
            aria-label="Supprimer la colonne"
            @click="emit('remove')"
          >
            <Trash :size="14" />
          </Button>
        </div>
      </template>
    </header>

    <div class="cards">
      <TaskCard
        v-for="card in cards"
        :key="card.id"
        :card="card"
        :draggable="canMove"
        @open="emit('openCard', $event)"
        @drop-before="(draggedId, beforeId) => emit('moveCard', draggedId, beforeId)"
      />
      <p v-if="cards.length === 0" class="empty muted">Aucune tâche</p>
    </div>

    <form v-if="canCreate" class="add-card" @submit.prevent="addCard">
      <InputText v-model="newCardTitle" placeholder="Nouvelle tâche…" size="small" fluid />
      <Button
        type="submit"
        size="small"
        :disabled="!newCardTitle.trim()"
        aria-label="Ajouter la tâche"
      >
        <Plus :size="14" />
      </Button>
    </form>
  </section>
</template>

<style scoped>
.column {
  flex: 0 0 300px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 100%;
  padding: 0.75rem;
  border-radius: 0.85rem;
  background: var(--p-surface-100);
  border: 2px solid transparent;
  transition: border-color 0.15s;
}

@media (prefers-color-scheme: dark) {
  .column {
    background: var(--p-surface-900);
  }
}

.column.drag-over {
  border-color: var(--p-primary-color);
}

.column-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.25rem;
}

.column-title {
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.column-actions {
  margin-left: auto;
  display: flex;
}

.title-form {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  width: 100%;
}

.cards {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  overflow-y: auto;
  min-height: 3rem;
}

.empty {
  text-align: center;
  font-size: 0.85rem;
  padding: 1rem 0;
  margin: 0;
}

.add-card {
  display: flex;
  gap: 0.4rem;
}
</style>
