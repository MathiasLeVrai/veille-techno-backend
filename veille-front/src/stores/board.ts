import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { cardsApi, listsApi } from '@/api'
import type { Card, CardInput, List } from '@/api/types'

export const useBoardStore = defineStore('board', () => {
  const lists = ref<List[]>([])
  const cards = ref<Card[]>([])
  const loading = ref(false)

  const sortedLists = computed(() => [...lists.value].sort((a, b) => a.position - b.position))

  function cardsOf(listId: string) {
    return cards.value.filter((c) => c.listId === listId).sort((a, b) => a.position - b.position)
  }

  async function load() {
    loading.value = true
    try {
      ;[lists.value, cards.value] = await Promise.all([listsApi.list(), cardsApi.list()])
    } finally {
      loading.value = false
    }
  }

  async function addList(title: string) {
    lists.value.push(await listsApi.create(title))
  }

  async function renameList(id: string, title: string) {
    const updated = await listsApi.rename(id, title)
    lists.value = lists.value.map((l) => (l.id === id ? updated : l))
  }

  async function removeList(id: string) {
    await listsApi.remove(id)
    lists.value = lists.value.filter((l) => l.id !== id)
    cards.value = cards.value.filter((c) => c.listId !== id)
  }

  async function addCard(listId: string, input: CardInput) {
    cards.value.push(await cardsApi.create(listId, input))
  }

  async function updateCard(id: string, input: CardInput) {
    const updated = await cardsApi.update(id, input)
    cards.value = cards.value.map((c) => (c.id === id ? updated : c))
  }

  /** Mise à jour optimiste : la carte disparaît tout de suite, et revient si l'API refuse. */
  async function removeCard(id: string) {
    const snapshot = cards.value
    cards.value = cards.value.filter((c) => c.id !== id)
    try {
      await cardsApi.remove(id)
    } catch (error) {
      cards.value = snapshot
      throw error
    }
  }

  /**
   * Déplace une carte dans `listId`, juste avant `beforeCardId` (ou en bas si absent).
   * L'interface est mise à jour avant la réponse du serveur, puis restaurée en cas d'erreur.
   */
  async function moveCard(id: string, listId: string, beforeCardId: string | null = null) {
    const card = cards.value.find((c) => c.id === id)
    if (!card || id === beforeCardId) return

    const snapshot = cards.value.map((c) => ({ ...c }))
    const sourceListId = card.listId
    const target = cardsOf(listId).filter((c) => c.id !== id)
    const found = beforeCardId ? target.findIndex((c) => c.id === beforeCardId) : -1
    const position = found === -1 ? target.length : found

    card.listId = listId
    target.splice(position, 0, card)
    target.forEach((c, i) => (c.position = i))
    if (sourceListId !== listId) {
      cardsOf(sourceListId).forEach((c, i) => (c.position = i))
    }

    try {
      await cardsApi.move(id, listId, position)
    } catch (error) {
      cards.value = snapshot
      throw error
    }
  }

  return {
    lists,
    cards,
    loading,
    sortedLists,
    cardsOf,
    load,
    addList,
    renameList,
    removeList,
    addCard,
    updateCard,
    removeCard,
    moveCard,
  }
})
