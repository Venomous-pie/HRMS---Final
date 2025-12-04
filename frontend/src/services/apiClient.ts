export class ApiClientError<T = any> extends Error {
  status: number
  data?: T

  constructor(message: string, status: number, data?: T) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.data = data
  }
}

const API_BASE: string = (import.meta as any)?.env?.VITE_API_BASE_URL || 'http://localhost:3000/api'

function buildUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE}${normalizedPath}`
}

// Global auto logout handler - set by useAutoLogout composable
let globalUnauthorizedHandler: (reason: string) => Promise<void> = async () => {}
let lastUnauthorizedCall = 0
const UNAUTHORIZED_DEBOUNCE_MS = 1000 // Prevent duplicate calls within 1 second

export function setUnauthorizedHandler(handler: (reason: string) => Promise<void>) {
  globalUnauthorizedHandler = async (reason) => {
    const now = Date.now()
    if (now - lastUnauthorizedCall < UNAUTHORIZED_DEBOUNCE_MS) {
      return // Skip duplicate calls
    }
    lastUnauthorizedCall = now
    await handler(reason)
  }
}

export function clearUnauthorizedHandler() {
  globalUnauthorizedHandler = async () => {}
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {},
  retries = 2,
): Promise<T> {
  const method = (options.method || 'GET').toString().toUpperCase()

  const doFetch = async (attempt: number): Promise<T> => {
    const headers = new Headers(options.headers || {})
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
    
    // Add authentication token if available
    const authToken = localStorage.getItem('auth_token')
    if (authToken) {
      headers.set('Authorization', `Bearer ${authToken}`)
    }

    const response = await fetch(buildUrl(path), { ...options, headers })

    let payload: any = null
    const contentType = response.headers.get('Content-Type') || ''
    if (contentType.includes('application/json')) {
      try {
        payload = await response.json()
      } catch (_) {
        payload = null
      }
    } else {
      try {
        payload = await response.text()
      } catch (_) {
        payload = null
      }
    }

    if (!response.ok) {
      const message: string =
        (payload && (payload.error?.message || payload.error || payload.message)) || `API request failed (${response.status})`

      // Handle unauthorized responses - trigger auto logout if handler is set
      if ((response.status === 401 || response.status === 403) && globalUnauthorizedHandler) {
        // Use the actual error message from the server to help identify the issue
        const serverMessage = payload?.error?.message || payload?.error || payload?.message || ''
        let reason = response.status === 401 ? 'Session expired' : 'Access denied'
        
        // More specific reasons based on server response
        if (serverMessage.includes('User not found') || serverMessage.includes('inactive')) {
          reason = 'Account deactivated or inactive'
        } else if (serverMessage.includes('permission') || serverMessage.includes('Insufficient')) {
          reason = 'Access denied - insufficient permissions'
        } else if (serverMessage.includes('Token expired')) {
          reason = 'Session expired'
        } else if (serverMessage.includes('Invalid token')) {
          reason = 'Invalid session'
        }
        
        // Don't await to avoid blocking the error throw
        globalUnauthorizedHandler(`${reason}: ${serverMessage}`).catch(console.error)
      }

      const isTransientSqlite = /SQLITE_BUSY|database is locked/i.test(message)
      if (method === 'GET' && isTransientSqlite && attempt < retries) {
        const delayMs = 200 * (attempt + 1)
        await new Promise((res) => setTimeout(res, delayMs))
        return doFetch(attempt + 1)
      }

      throw new ApiClientError(message, response.status, payload)
    }

    return payload as T
  }

  return doFetch(0)
}
