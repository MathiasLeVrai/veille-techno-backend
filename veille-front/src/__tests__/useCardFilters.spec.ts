import { describe, expect, it } from 'vitest'
import { useCardFilters } from '@/composables/useCardFilters'
import { makeCard } from './fixtures'

const cards = [
  makeCard({ id: '1', title: 'Corriger le login', category: 'bug', dueDate: '2020-01-01' }),
  makeCard({
    id: '2',
    title: 'Ajouter le drag & drop',
    category: 'feature',
    dueDate: '2099-01-01',
  }),
  makeCard({ id: '3', title: 'Doc API', description: 'Swagger du login', category: 'doc' }),
]

describe('useCardFilters', () => {
  it('cherche dans le titre et la description, sans tenir compte de la casse', () => {
    const { filters, apply } = useCardFilters()
    filters.search = 'LOGIN'
    expect(apply(cards).map((c) => c.id)).toEqual(['1', '3'])
  })

  it('filtre par catégorie et par retard', () => {
    const { filters, apply, isActive } = useCardFilters()
    filters.category = 'feature'
    expect(apply(cards).map((c) => c.id)).toEqual(['2'])

    filters.category = null
    filters.overdueOnly = true
    expect(apply(cards).map((c) => c.id)).toEqual(['1'])
    expect(isActive.value).toBe(true)
  })

  it('trie par échéance en mettant les cartes sans date à la fin', () => {
    const { filters, apply, reset, isActive } = useCardFilters()
    filters.sort = 'dueDate'
    expect(apply([cards[2]!, cards[1]!, cards[0]!]).map((c) => c.id)).toEqual(['1', '2', '3'])

    reset()
    expect(filters.sort).toBe('position')
    expect(isActive.value).toBe(false)
  })
})
