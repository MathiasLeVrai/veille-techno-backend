import { mount } from '@vue/test-utils'
import PrimeVue from 'primevue/config'
import { describe, expect, it } from 'vitest'
import TaskCard from '@/components/board/TaskCard.vue'
import { makeCard } from './fixtures'

function mountCard(overrides = {}) {
  return mount(TaskCard, {
    props: { card: makeCard(overrides), draggable: true },
    global: { plugins: [PrimeVue] },
  })
}

describe('TaskCard', () => {
  it('affiche le titre, la catégorie et la description', () => {
    const wrapper = mountCard({
      title: 'Écrire les tests',
      category: 'tech',
      description: 'Avec Vitest',
    })
    expect(wrapper.text()).toContain('Écrire les tests')
    expect(wrapper.text()).toContain('Technique')
    expect(wrapper.text()).toContain('Avec Vitest')
  })

  it('signale une échéance dépassée', () => {
    const wrapper = mountCard({ dueDate: '2020-01-01' })
    expect(wrapper.find('.due').classes()).toContain('overdue')
    expect(wrapper.text()).toContain('en retard')
  })

  it('émet "open" au clic', async () => {
    const wrapper = mountCard({ id: 'x' })
    await wrapper.trigger('click')
    expect(wrapper.emitted('open')?.[0]?.[0]).toMatchObject({ id: 'x' })
  })
})
