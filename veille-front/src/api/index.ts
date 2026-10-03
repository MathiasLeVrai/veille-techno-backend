import { http } from './http'
import type { Card, CardInput, List, Role, User } from './types'

export const authApi = {
  login: (email: string, password: string) =>
    http<{ accessToken: string }>('POST', '/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    http<User>('POST', '/auth/register', { name, email, password }),
  me: () => http<User>('GET', '/users/me'),
}

export const usersApi = {
  list: () => http<User[]>('GET', '/users'),
  updateRole: (id: string, role: Role) => http<User>('PATCH', `/users/${id}`, { role }),
}

export const listsApi = {
  list: () => http<List[]>('GET', '/lists'),
  create: (title: string) => http<List>('POST', '/lists', { title }),
  rename: (id: string, title: string) => http<List>('PATCH', `/lists/${id}`, { title }),
  remove: (id: string) => http<void>('DELETE', `/lists/${id}`),
}

export const cardsApi = {
  list: () => http<Card[]>('GET', '/cards'),
  create: (listId: string, input: CardInput) => http<Card>('POST', `/lists/${listId}/cards`, input),
  update: (id: string, input: CardInput) => http<Card>('PATCH', `/cards/${id}`, input),
  move: (id: string, listId: string, position: number) =>
    http<Card>('PATCH', `/cards/${id}`, { listId, position }),
  remove: (id: string) => http<void>('DELETE', `/cards/${id}`),
}
