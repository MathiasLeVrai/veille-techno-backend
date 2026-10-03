import type { Card } from '@/api/types'

export function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    id: 'card',
    title: 'Tâche',
    description: '',
    position: 0,
    listId: 'todo',
    dueDate: null,
    category: null,
    createdById: null,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    ...overrides,
  }
}
