import { computed, reactive } from 'vue'
import type { Card, CardCategory } from '@/api/types'
import { isOverdue } from '@/utils/dates'

export type CardSort = 'position' | 'dueDate' | 'title'

export function useCardFilters() {
  const filters = reactive({
    search: '',
    category: null as CardCategory | null,
    overdueOnly: false,
    sort: 'position' as CardSort,
  })

  const isActive = computed(
    () => filters.search !== '' || filters.category !== null || filters.overdueOnly,
  )

  function apply(cards: Card[]): Card[] {
    const search = filters.search.trim().toLowerCase()
    const result = cards.filter(
      (card) =>
        (!search ||
          card.title.toLowerCase().includes(search) ||
          card.description.toLowerCase().includes(search)) &&
        (!filters.category || card.category === filters.category) &&
        (!filters.overdueOnly || isOverdue(card.dueDate)),
    )
    if (filters.sort === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title, 'fr'))
    } else if (filters.sort === 'dueDate') {
      // Les cartes sans échéance passent en dernier
      result.sort((a, b) => (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999'))
    }
    return result
  }

  function reset() {
    Object.assign(filters, { search: '', category: null, overdueOnly: false, sort: 'position' })
  }

  return { filters, isActive, apply, reset }
}
