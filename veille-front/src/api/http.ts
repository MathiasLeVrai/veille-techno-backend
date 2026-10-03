const TOKEN_KEY = 'kanban.token'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

let onUnauthorized: () => void = () => {}

/** Appelé quand le token est expiré/invalide (le store auth s'y abonne pour déconnecter). */
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE'

export async function http<T>(method: Method, path: string, body?: unknown): Promise<T> {
  const token = getToken()
  const response = await fetch(`/api${path}`, {
    method,
    headers: {
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401 && token) {
    onUnauthorized()
  }
  if (!response.ok) {
    const data = await response.json().catch(() => null)
    const message = Array.isArray(data?.message) ? data.message.join(', ') : data?.message
    throw new ApiError(response.status, message ?? response.statusText)
  }
  return response.status === 204 ? (undefined as T) : response.json()
}
