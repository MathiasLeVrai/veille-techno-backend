<script setup lang="ts">
import { Save, Trash } from '@primeicons/vue'
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import { computed, reactive, watch } from 'vue'
import type { Card, CardCategory, CardInput } from '@/api/types'
import { CATEGORY_OPTIONS } from '@/constants'
import { fromISODate, toISODate } from '@/utils/dates'

const props = defineProps<{
  card: Card | null
  canEdit: boolean
  canDelete: boolean
}>()

const visible = defineModel<boolean>('visible', { required: true })

const emit = defineEmits<{
  save: [input: CardInput]
  remove: []
}>()

// Copie locale : on ne modifie la carte du store qu'au clic sur « Enregistrer »
const form = reactive({
  title: '',
  description: '',
  category: null as CardCategory | null,
  dueDate: null as Date | null,
})

watch(
  () => props.card,
  (card) => {
    if (!card) return
    form.title = card.title
    form.description = card.description
    form.category = card.category
    form.dueDate = card.dueDate ? fromISODate(card.dueDate) : null
  },
  { immediate: true },
)

const titleInvalid = computed(() => form.title.trim() === '')

function save() {
  if (titleInvalid.value) return
  emit('save', {
    title: form.title.trim(),
    description: form.description,
    category: form.category,
    dueDate: form.dueDate ? toISODate(form.dueDate) : null,
  })
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="canEdit ? 'Modifier la tâche' : 'Détail de la tâche'"
    :style="{ width: '32rem' }"
    :breakpoints="{ '640px': '95vw' }"
  >
    <form id="task-form" class="form" @submit.prevent="save">
      <Message v-if="!canEdit" severity="info" size="small">
        Votre rôle permet de consulter cette tâche, pas de la modifier.
      </Message>
      <div class="field">
        <label for="task-title">Titre</label>
        <InputText
          id="task-title"
          v-model="form.title"
          :disabled="!canEdit"
          :invalid="titleInvalid"
          fluid
        />
      </div>
      <div class="field">
        <label for="task-description">Description</label>
        <Textarea
          id="task-description"
          v-model="form.description"
          :disabled="!canEdit"
          rows="5"
          auto-resize
          placeholder="Aucune description"
          fluid
        />
      </div>
      <div class="row">
        <div class="field">
          <label for="task-category">Catégorie</label>
          <Select
            input-id="task-category"
            v-model="form.category"
            :options="CATEGORY_OPTIONS"
            option-label="label"
            option-value="value"
            placeholder="Aucune"
            show-clear
            :disabled="!canEdit"
            fluid
          />
        </div>
        <div class="field">
          <label for="task-due">Échéance</label>
          <DatePicker
            input-id="task-due"
            v-model="form.dueDate"
            date-format="dd/mm/yy"
            show-icon
            show-button-bar
            :disabled="!canEdit"
            fluid
          />
        </div>
      </div>
    </form>

    <template #footer>
      <Button
        v-if="canDelete"
        severity="danger"
        variant="text"
        class="delete"
        @click="emit('remove')"
      >
        <Trash :size="16" />
        Supprimer
      </Button>
      <Button severity="secondary" variant="text" @click="visible = false">Fermer</Button>
      <Button v-if="canEdit" type="submit" form="task-form" :disabled="titleInvalid">
        <Save :size="16" />
        Enregistrer
      </Button>
    </template>
  </Dialog>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.delete {
  margin-right: auto;
}

@media (max-width: 640px) {
  .row {
    grid-template-columns: 1fr;
  }
}
</style>
