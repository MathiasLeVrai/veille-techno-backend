/**
 * Recrée kanban.sqlite avec le schéma TypeORM et les données de démo.
 * Usage : npm run db:rebuild (depuis veille-back)
 */
import 'reflect-metadata'
import { existsSync, unlinkSync } from 'node:fs'
import { resolve } from 'node:path'
import bcrypt from 'bcrypt'
import { DataSource } from 'typeorm'
import { Role } from '../auth/roles.js'
import { User } from '../auth/user.entity.js'
import { Card } from '../cards/card.entity.js'
import { List } from '../lists/list.entity.js'

export const DEMO_PASSWORD = 'password123'

const dbPath = resolve(process.cwd(), 'kanban.sqlite')

const DEMO_USERS: { email: string; name: string; role: Role }[] = [
  { email: 'admin@kanban.dev', name: 'Alice Admin', role: Role.ADMIN },
  { email: 'po@kanban.dev', name: 'Paul PO', role: Role.PO },
  { email: 'dev@kanban.dev', name: 'Diane Dev', role: Role.DEV },
  { email: 'moa@kanban.dev', name: 'Marc MOA', role: Role.MOA },
  { email: 'moe@kanban.dev', name: 'Emma MOE', role: Role.MOE },
]

const DEMO_BOARD: { title: string; cards: Partial<Card>[] }[] = [
  {
    title: 'Backlog',
    cards: [
      { title: 'Export CSV des tâches', category: 'feature' },
      {
        title: 'Mode sombre',
        category: 'design',
        description: 'Suivre le thème du système',
      },
    ],
  },
  {
    title: 'À faire',
    cards: [
      { title: 'Page de connexion', category: 'feature', dueDate: '2026-10-10' },
      { title: 'Rédiger le README', category: 'doc', dueDate: '2026-10-15' },
    ],
  },
  {
    title: 'En cours',
    cards: [
      {
        title: 'Glisser-déposer des cartes',
        category: 'feature',
        description: 'Déplacer une carte entre colonnes',
        dueDate: '2026-10-05',
      },
    ],
  },
  {
    title: 'Terminé',
    cards: [{ title: 'Initialiser le projet Vue', category: 'tech' }],
  },
]

async function main() {
  if (existsSync(dbPath)) {
    unlinkSync(dbPath)
  }

  const ds = new DataSource({
    type: 'sqlite',
    database: dbPath,
    entities: [User, List, Card],
    synchronize: true,
  })
  await ds.initialize()

  const password = await bcrypt.hash(DEMO_PASSWORD, 10)
  const userRepo = ds.getRepository(User)
  const listRepo = ds.getRepository(List)
  const cardRepo = ds.getRepository(Card)

  const users = await userRepo.save(
    DEMO_USERS.map((u) => userRepo.create({ ...u, password })),
  )
  const po = users.find((u) => u.role === Role.PO)!

  for (const [position, column] of DEMO_BOARD.entries()) {
    const list = await listRepo.save(
      listRepo.create({ title: column.title, position, ownerId: po.id }),
    )
    await cardRepo.save(
      column.cards.map((card, i) =>
        cardRepo.create({
          title: card.title!,
          description: card.description ?? '',
          category: card.category ?? null,
          dueDate: card.dueDate ?? null,
          position: i,
          listId: list.id,
          createdById: po.id,
        }),
      ),
    )
  }

  await ds.destroy()
  console.log(`kanban.sqlite créé (${DEMO_USERS.length} utilisateurs, mot de passe : ${DEMO_PASSWORD})`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
