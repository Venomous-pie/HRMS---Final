const API_BASE_URL = 'http://localhost:3000'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

class ApiError extends Error {
  status: number
  data: any

  constructor(message: string, status: number, data: any) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

// Helper to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token')
}

// Helper to create headers with auth
const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
}

// Generic API request function
const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(
        data.error || `HTTP ${response.status}`,
        response.status,
        data
      )
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0,
      null
    )
  }
}

// API methods
export const api = {
  // Auth methods
  auth: {
    login: (credentials: { username: string; password: string }) =>
      apiRequest<{ token: string; user: any }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),

    logout: () =>
      apiRequest('/api/auth/logout', {
        method: 'POST',
      }),

    getMe: () =>
      apiRequest<{ user: any }>('/api/auth/me'),

    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      apiRequest('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // User management methods
  users: {
    getAll: () =>
      apiRequest<any[]>('/api/admin/users'),

    getById: (id: string) =>
      apiRequest<any>(`/api/admin/users/${id}`),

    create: (userData: any) =>
      apiRequest<any>('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),

    update: (id: string, userData: any) =>
      apiRequest<any>(`/api/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      }),

    delete: (id: string, permanent = false) =>
      apiRequest(`/api/admin/users/${id}?permanent=${permanent}`, {
        method: 'DELETE',
      }),

    resetPassword: (id: string, newPassword: string) =>
      apiRequest(`/api/admin/users/${id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ newPassword }),
      }),
  },

  // Reservation methods
  reservations: {
    getAll: () =>
      apiRequest<any[]>('/api/reservations'),

    getById: (id: string) =>
      apiRequest<any>(`/api/reservations/${id}`),

    create: (reservationData: any) =>
      apiRequest<any>('/api/reserve-room', {
        method: 'POST',
        body: JSON.stringify(reservationData),
      }),

    update: (id: string, reservationData: any) =>
      apiRequest<any>(`/api/reservations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(reservationData),
      }),

    delete: (id: string, soft = true) =>
      apiRequest(`/api/reservations/${id}?soft=${soft}`, {
        method: 'DELETE',
      }),
  },

  // Room methods
  rooms: {
    getAll: () =>
      apiRequest<any[]>('/api/rooms'),

    create: (roomData: any) =>
      apiRequest<any>('/api/admin/rooms', {
        method: 'POST',
        body: JSON.stringify(roomData),
      }),

    update: (id: string, roomData: any) =>
      apiRequest<any>(`/api/admin/rooms/${id}`, {
        method: 'PUT',
        body: JSON.stringify(roomData),
      }),

    delete: (id: string, permanent = false) =>
      apiRequest(`/api/admin/rooms/${id}?permanent=${permanent}`, {
        method: 'DELETE',
      }),
  },

  // Room type methods
  roomTypes: {
    getAll: () =>
      apiRequest<any[]>('/api/room-types'),
  },

  // Guest methods
  guests: {
    getAll: () =>
      apiRequest<any[]>('/api/guests'),

    create: (guestData: any) =>
      apiRequest<any>('/api/guests', {
        method: 'POST',
        body: JSON.stringify(guestData),
      }),
  },

  // Utility methods
  seed: () =>
    apiRequest('/api/seed', {
      method: 'POST',
    }),
}

export { ApiError }
export type { ApiResponse }