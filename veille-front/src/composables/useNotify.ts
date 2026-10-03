import { useToast } from 'primevue/usetoast'

/** Exécute une action et affiche un toast de succès ou d'erreur. Renvoie `true` si tout s'est bien passé. */
export function useNotify() {
  const toast = useToast()

  async function attempt(action: () => Promise<unknown>, success?: string): Promise<boolean> {
    try {
      await action()
      if (success) toast.add({ severity: 'success', summary: success, life: 2500 })
      return true
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Action impossible',
        detail: error instanceof Error ? error.message : String(error),
        life: 4000,
      })
      return false
    }
  }

  return { attempt }
}
