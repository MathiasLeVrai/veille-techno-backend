import type { CardCategory, Role } from './api/types'

type Severity = 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast'

export const ROLES: Record<Role, { label: string; description: string; severity: Severity }> = {
  ADMIN: { label: 'Admin', description: 'Gère les comptes et les rôles', severity: 'contrast' },
  PO: {
    label: 'Product Owner',
    description: 'Organise les colonnes et priorise',
    severity: 'success',
  },
  DEV: {
    label: 'Développeur',
    description: 'Crée, modifie et déplace les tâches',
    severity: 'info',
  },
  MOA: { label: 'MOA', description: 'Exprime les besoins (crée des tâches)', severity: 'warn' },
  MOE: { label: 'MOE', description: 'Pilote la réalisation technique', severity: 'secondary' },
}

export const CATEGORIES: Record<CardCategory, { label: string; color: string }> = {
  feature: { label: 'Fonctionnalité', color: '#10b981' },
  bug: { label: 'Bug', color: '#ef4444' },
  tech: { label: 'Technique', color: '#6366f1' },
  doc: { label: 'Documentation', color: '#f59e0b' },
  design: { label: 'Design', color: '#ec4899' },
}

export const CATEGORY_OPTIONS = Object.entries(CATEGORIES).map(([value, { label }]) => ({
  value: value as CardCategory,
  label,
}))
