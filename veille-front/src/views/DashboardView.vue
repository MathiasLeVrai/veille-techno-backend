<script setup lang="ts">
import Card from 'primevue/card'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import MeterGroup from 'primevue/metergroup'
import ProgressBar from 'primevue/progressbar'
import Tag from 'primevue/tag'
import { computed, onMounted } from 'vue'
import { useNotify } from '@/composables/useNotify'
import { CATEGORIES } from '@/constants'
import { useBoardStore } from '@/stores/board'
import { formatDate, isOverdue } from '@/utils/dates'

const board = useBoardStore()
const { attempt } = useNotify()

onMounted(() => attempt(board.load))

const COLUMN_COLORS = ['#94a3b8', '#60a5fa', '#f59e0b', '#a78bfa', '#10b981', '#f472b6']

const total = computed(() => board.cards.length)
const overdueCount = computed(() => board.cards.filter((c) => isOverdue(c.dueDate)).length)

/** Par convention, la dernière colonne du tableau contient les tâches terminées. */
const doneList = computed(() => board.sortedLists.at(-1))
const doneCount = computed(() => (doneList.value ? board.cardsOf(doneList.value.id).length : 0))
const progress = computed(() =>
  total.value ? Math.round((doneCount.value / total.value) * 100) : 0,
)

const byColumn = computed(() =>
  board.sortedLists.map((list, i) => ({
    label: list.title,
    value: total.value ? Math.round((board.cardsOf(list.id).length / total.value) * 100) : 0,
    color: COLUMN_COLORS[i % COLUMN_COLORS.length],
  })),
)

const byCategory = computed(() =>
  Object.entries(CATEGORIES)
    .map(([key, { label, color }]) => ({
      label,
      color,
      count: board.cards.filter((c) => c.category === key).length,
    }))
    .filter((c) => c.count > 0),
)

const upcoming = computed(() =>
  board.cards
    .filter((c) => c.dueDate && c.listId !== doneList.value?.id)
    .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!))
    .slice(0, 8)
    .map((c) => ({
      ...c,
      column: board.lists.find((l) => l.id === c.listId)?.title ?? '',
      overdue: isOverdue(c.dueDate),
    })),
)
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1>Tableau de bord</h1>
        <p class="muted">Vue de synthèse pour le pilotage du projet</p>
      </div>
    </div>

    <div class="kpis">
      <Card>
        <template #subtitle>Tâches</template>
        <template #content
          ><span class="kpi">{{ total }}</span></template
        >
      </Card>
      <Card>
        <template #subtitle>En retard</template>
        <template #content>
          <span class="kpi" :class="{ danger: overdueCount > 0 }">{{ overdueCount }}</span>
        </template>
      </Card>
      <Card>
        <template #subtitle>Avancement ({{ doneList?.title ?? '—' }})</template>
        <template #content>
          <span class="kpi">{{ progress }} %</span>
          <ProgressBar :value="progress" :show-value="false" class="progress" />
        </template>
      </Card>
    </div>

    <Card class="section">
      <template #title>Répartition par colonne</template>
      <template #content>
        <MeterGroup v-if="total" :value="byColumn" />
        <p v-else class="muted">Aucune tâche.</p>
      </template>
    </Card>

    <div class="grid">
      <Card>
        <template #title>Par catégorie</template>
        <template #content>
          <ul v-if="byCategory.length" class="categories">
            <li v-for="cat in byCategory" :key="cat.label">
              <Tag :value="cat.label" :style="{ background: cat.color, color: '#fff' }" />
              <strong>{{ cat.count }}</strong>
            </li>
          </ul>
          <p v-else class="muted">Aucune tâche catégorisée.</p>
        </template>
      </Card>

      <Card>
        <template #title>Prochaines échéances</template>
        <template #content>
          <DataTable :value="upcoming" size="small" data-key="id">
            <template #empty><span class="muted">Aucune échéance à venir.</span></template>
            <Column field="title" header="Tâche" />
            <Column field="column" header="Colonne" />
            <Column header="Échéance">
              <template #body="{ data }">
                <Tag
                  :severity="data.overdue ? 'danger' : 'secondary'"
                  :value="formatDate(data.dueDate)"
                />
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.kpi {
  font-size: 2rem;
  font-weight: 700;
}

.kpi.danger {
  color: var(--p-red-500);
}

.progress {
  height: 0.5rem;
  margin-top: 0.5rem;
}

.section {
  margin-bottom: 1rem;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem;
}

.categories {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.categories li {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 800px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
