/** `Date` → `YYYY-MM-DD` en heure locale (toISOString décalerait d'un jour selon le fuseau). */
export function toISODate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function fromISODate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year!, month! - 1, day)
}

export function isOverdue(dueDate: string | null, today = toISODate(new Date())): boolean {
  return dueDate !== null && dueDate < today
}

export function formatDate(value: string): string {
  return fromISODate(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
