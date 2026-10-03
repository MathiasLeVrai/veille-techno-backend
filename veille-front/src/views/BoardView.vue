<script setup lang="ts">
import { FilterSlash, Plus, Search } from '@primeicons/vue'
import Button from 'primevue/button'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import Select from 'primevue/select'
import ToggleSwitch from 'primevue/toggleswitch'
import { useConfirm } from 'primevue/useconfirm'
import { computed, onMounted, ref } from 'vue'
import type { Card, CardInput, List } from '@/api/types'
import KanbanColumn from '@/components/board/KanbanColumn.vue'
import TaskDialog from '@/components/board/TaskDialog.vue'
import { useCardFilters, type CardSort } from '@/composables/useCardFilters'
import { useNotify } from '@/composables/useNotify'
import { CATEGORY_OPTIONS, ROLES } from '@/constants'
import { useAuthStore } from '@/stores/auth'
import { useBoardStore } from '@/stores/board'

const auth = useAuthStore()
const board = useBoardStore()
const confirm = useConfirm()
const { attempt } = useNotify()
const { filters, isActive, apply, reset } = useCardFilters()

const can = computed(() => ({
  manageLists: auth.can('list:manage'),
  createCard: auth.can('card:create'),
  updateCard: auth.can('card:update'),
  deleteCard: auth.can('card:delete'),
}))

const sortOptions: { label: string; value: CardSort }[] = [
  { label: 'Ordre du tableau', value: 'position' },
  { label: 'Échéance', value: 'dueDate' },
  { label: 'Titre (A→Z)', value: 'title' },
]

onMounted(() => attempt(board.load))

// --- Colonnes ---------------------------------------------------------------
const newListTitle = ref('')

async function addList() {
  const title = newListTitle.value.trim()
  if (!title) return
  if (await attempt(() => board.addList(title), 'Colonne ajoutée')) newListTitle.value = ''
}

function removeList(list: List) {
  const count = board.cardsOf(list.id).length
  confirm.require({
    header: `Supprimer « ${list.title} » ?`,
    message: count ? `Ses ${count} tâche(s) seront aussi supprimées.` : 'La colonne est vide.',
    acceptLabel: 'Supprimer',
    rejectLabel: 'Annuler',
    acceptProps: { severity: 'danger' },
    rejectProps: { severity: 'secondary', variant: 'text' },
    accept: () => attempt(() => board.removeList(list.id), 'Colonne supprimée'),
  })
}

// --- Tâches -----------------------------------------------------------------
const selectedCard = ref<Card | null>(null)
const dialogVisible = ref(false)

function openCard(card: Card) {
  selectedCard.value = card
  dialogVisible.value = true
}

async function saveCard(input: CardInput) {
  const card = selectedCard.value
  if (card && (await attempt(() => board.updateCard(card.id, input), 'Tâche enregistrée'))) {
    dialogVisible.value = false
  }
}

function removeCard() {
  const card = selectedCard.value
  if (!card) return
  confirm.require({
    header: 'Supprimer la tâche ?',
    message: `« ${card.title} » sera définitivement supprimée.`,
    acceptLabel: 'Supprimer',
    rejectLabel: 'Annuler',
    acceptProps: { severity: 'danger' },
    rejectProps: { severity: 'secondary', variant: 'text' },
    accept: async () => {
      dialogVisible.value = false
      await attempt(() => board.removeCard(card.id), 'Tâche supprimée')
    },
  })
}
</script>

<template>
  <div class="board-page">
    <div class="board-toolbar">
      <IconField>
        <InputIcon><Search :size="14" /></InputIcon>
        <InputText v-model="filters.search" placeholder="Rechercher une tâche" size="small" />
      </IconField>
      <Select
        v-model="filters.category"
        :options="CATEGORY_OPTIONS"
        option-label="label"
        option-value="value"
        placeholder="Toutes catégories"
        show-clear
        size="small"
      />
      <Select
        v-model="filters.sort"
        :options="sortOptions"
        option-label="label"
        option-value="value"
        size="small"
      />
      <label class="toggle">
        <ToggleSwitch v-model="filters.overdueOnly" />
        En retard
      </label>
      <Button v-if="isActive" size="small" severity="secondary" variant="text" @click="reset">
        <FilterSlash :size="14" />
        Réinitialiser
      </Button>

      <form v-if="can.manageLists" class="add-list" @submit.prevent="addList">
        <InputText v-model="newListTitle" placeholder="Nouvelle colonne" size="small" />
        <Button type="submit" size="small" :disabled="!newListTitle.trim()">
          <Plus :size="14" />
          Colonne
        </Button>
      </form>
    </div>

    <Message v-if="auth.user && !can.updateCard" severity="info" size="small" class="role-hint">
      Rôle {{ ROLES[auth.user.role].label }} :
      {{ ROLES[auth.user.role].description.toLowerCase() }}. Les tâches sont en lecture seule.
    </Message>

    <div v-if="board.loading && board.lists.length === 0" class="center">
      <ProgressSpinner />
    </div>
    <div v-else-if="board.lists.length === 0" class="center muted">
      Aucune colonne pour l'instant.
      <span v-if="can.manageLists">Ajoutez-en une avec le champ « Nouvelle colonne ».</span>
      <span v-else>Un Product Owner doit d'abord créer les colonnes.</span>
    </div>
    <div v-else class="columns">
      <KanbanColumn
        v-for="list in board.sortedLists"
        :key="list.id"
        :list="list"
        :cards="apply(board.cardsOf(list.id))"
        :can-manage="can.manageLists"
        :can-create="can.createCard"
        :can-move="can.updateCard"
        @rename="(title) => attempt(() => board.renameList(list.id, title))"
        @remove="removeList(list)"
        @add-card="(title) => attempt(() => board.addCard(list.id, { title }))"
        @open-card="openCard"
        @move-card="(cardId, beforeId) => attempt(() => board.moveCard(cardId, list.id, beforeId))"
      />
    </div>

    <TaskDialog
      v-model:visible="dialogVisible"
      :card="selectedCard"
      :can-edit="can.updateCard"
      :can-delete="can.deleteCard"
      @save="saveCard"
      @remove="removeCard"
    />
  </div>
</template>

<style scoped>
.board-page {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 1.5rem;
}

.board-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.add-list {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}

.role-hint {
  align-self: flex-start;
}

.columns {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.center {
  flex: 1;
  display: grid;
  place-items: center;
  text-align: center;
}
</style>
