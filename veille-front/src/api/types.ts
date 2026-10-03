export type Role = 'ADMIN' | 'PO' | 'DEV' | 'MOA' | 'MOE'

export type Permission =
  | 'board:read'
  | 'list:manage'
  | 'card:create'
  | 'card:update'
  | 'card:delete'
  | 'dashboard:view'
  | 'users:manage'

export interface User {
  id: string
  email: string
  name: string
  role: Role
  permissions: Permission[]
  createdAt: string
}

export interface List {
  id: string
  title: string
  position: number
  ownerId: string
  createdAt: string
}

export type CardCategory = 'feature' | 'bug' | 'tech' | 'doc' | 'design'

export interface Card {
  id: string
  title: string
  description: string
  position: number
  listId: string
  /** Format `YYYY-MM-DD`. */
  dueDate: string | null
  category: CardCategory | null
  createdById: string | null
  createdAt: string
  updatedAt: string
}

export type CardInput = Partial<Pick<Card, 'title' | 'description' | 'dueDate' | 'category'>>
