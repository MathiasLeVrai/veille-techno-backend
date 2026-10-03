import { test, expect } from '@playwright/test'

// Nécessite le back démarré (comptes de démo dans veille-back/kanban.sqlite).
test('redirige vers la connexion puis affiche le tableau du PO', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/login/)

  await page.getByRole('button', { name: 'Product Owner' }).click()

  await expect(page).toHaveURL(/\/board/)
  await expect(page.getByRole('heading', { name: 'Backlog' })).toBeVisible()
  await expect(page.getByPlaceholder('Nouvelle colonne')).toBeVisible()
})

test('la MOA ne peut pas ouvrir la gestion des utilisateurs', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'MOA' }).click()
  await expect(page).toHaveURL(/\/board/)

  await page.goto('/admin/users')
  await expect(page.getByRole('heading', { name: 'Accès refusé' })).toBeVisible()
})
