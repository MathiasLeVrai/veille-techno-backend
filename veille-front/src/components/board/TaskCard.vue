<script setup lang="ts">
import { Calendar } from '@primeicons/vue'
import Tag from 'primevue/tag'
import { computed, ref } from 'vue'
import type { Card } from '@/api/types'
import { CATEGORIES } from '@/constants'
import { formatDate, isOverdue } from '@/utils/dates'

const props = defineProps<{ card: Card; draggable: boolean }>()

const emit = defineEmits<{
  open: [card: Card]
  /** Une autre carte a été lâchée sur celle-ci : elle doit se placer juste avant. */
  dropBefore: [draggedId: string, beforeId: string]
}>()

const category = computed(() => (props.card.category ? CATEGORIES[props.card.category] : null))
const overdue = computed(() => isOverdue(props.card.dueDate))
const isDropTarget = ref(false)

function onDragStart(event: DragEvent) {
  event.dataTransfer?.setData('text/plain', props.card.id)
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

function onDrop(event: DragEvent) {
  isDropTarget.value = false
  const draggedId = event.dataTransfer?.getData('text/plain')
  if (draggedId) emit('dropBefore', draggedId, props.card.id)
}
</script>

<template>
  <article
    class="task"
    :class="{ 'drop-target': isDropTarget }"
    :draggable="draggable"
    tabindex="0"
    @click="emit('open', card)"
    @keydown.enter="emit('open', card)"
    @dragstart="onDragStart"
    @dragover.prevent="isDropTarget = draggable"
    @dragleave="isDropTarget = false"
    @drop.prevent.stop="onDrop"
  >
    <Tag
      v-if="category"
      :value="category.label"
      class="category"
      :style="{ background: category.color }"
    />
    <h3 class="title">{{ card.title }}</h3>
    <p v-if="card.description" class="description">{{ card.description }}</p>
    <div v-if="card.dueDate" class="due" :class="{ overdue }">
      <Calendar :size="13" />
      {{ formatDate(card.dueDate) }}
      <span v-if="overdue">· en retard</span>
    </div>
  </article>
</template>

<style scoped>
.task {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.75rem;
  border-radius: 0.6rem;
  background: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
  cursor: pointer;
  transition:
    box-shadow 0.15s,
    transform 0.15s;
}

.task[draggable='true'] {
  cursor: grab;
}

.task:hover,
.task:focus-visible {
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.08);
  outline: none;
}

.task.drop-target {
  box-shadow: 0 -3px 0 var(--p-primary-color);
}

.category {
  align-self: flex-start;
  color: #fff;
  font-size: 0.7rem;
}

.title {
  font-size: 0.95rem;
  font-weight: 600;
  word-break: break-word;
}

.description {
  margin: 0;
  font-size: 0.85rem;
  color: var(--p-text-muted-color);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.due {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
}

.due.overdue {
  color: var(--p-red-500);
  font-weight: 600;
}
</style>
