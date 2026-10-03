import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cardsApi } from '@/api'
import { useBoardStore } from '@/stores/board'
import { makeCard } from './fixtures'

vi.mock('@/api', () => ({
  cardsApi: { move: vi.fn(), remove: vi.fn() },
  listsApi: {},
}))

function idsOf(store: ReturnType<typeof useBoardStore>, listId: string) {
  return store.cardsOf(listId).map((c) => c.id)
}

describe('board store', () => {
  let store: ReturnType<typeof useBoardStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(cardsApi.move).mockReset().mockResolvedValue(makeCard())
    vi.mocked(cardsApi.remove).mockReset().mockResolvedValue(undefined)
    store = useBoardStore()
    store.cards = [
      makeCard({ id: 'a', listId: 'todo', position: 0 }),
      makeCard({ id: 'b', listId: 'todo', position: 1 }),
      makeCard({ id: 'c', listId: 'todo', position: 2 }),
      makeCard({ id: 'd', listId: 'doing', position: 0 }),
    ]
  })

  it('déplace une carte en bas d’une autre colonne et renumérote les deux colonnes', async () => {
    await store.moveCard('a', 'doing')

    expect(idsOf(store, 'doing')).toEqual(['d', 'a'])
    expect(idsOf(store, 'todo')).toEqual(['b', 'c'])
    expect(store.cardsOf('todo').map((c) => c.position)).toEqual([0, 1])
    expect(cardsApi.move).toHaveBeenCalledWith('a', 'doing', 1)
  })

  it('réordonne dans la même colonne en se plaçant avant la carte cible', async () => {
    await store.moveCard('c', 'todo', 'a')

    expect(idsOf(store, 'todo')).toEqual(['c', 'a', 'b'])
    expect(cardsApi.move).toHaveBeenCalledWith('c', 'todo', 0)
  })

  it('annule le déplacement si l’API refuse (mise à jour optimiste)', async () => {
    vi.mocked(cardsApi.move).mockRejectedValue(new Error('403'))

    await expect(store.moveCard('a', 'doing')).rejects.toThrow('403')

    expect(idsOf(store, 'todo')).toEqual(['a', 'b', 'c'])
    expect(idsOf(store, 'doing')).toEqual(['d'])
  })

  it('remet la carte supprimée si l’API échoue', async () => {
    vi.mocked(cardsApi.remove).mockRejectedValue(new Error('500'))

    await expect(store.removeCard('b')).rejects.toThrow()

    expect(idsOf(store, 'todo')).toEqual(['a', 'b', 'c'])
  })
})
