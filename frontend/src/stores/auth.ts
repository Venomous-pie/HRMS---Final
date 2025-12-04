import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/composables/useAuth'

interface LoginCredentials {
  username: string
  password: string
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!(token.value && user.value))
  const isAdmin = computed(() => user.value?.role === 'admin' || user.value?.role === 'manager')
  const userRole = computed(() => user.value?.role || null)
  const userName = computed(() => user.value ? `${user.value.firstName} ${user.value.lastName}`.trim() : '')

  // Check token expiration
  const isTokenExpired = computed(() => {
    if (!token.value) return true
    
    try {
      const payload = JSON.parse(atob(token.value.split('.')[1]))
      const currentTime = Math.floor(Date.now() / 1000)
      return payload.exp < currentTime
    } catch {
      return true
    }
  })

  const tokenExpirationTime = computed(() => {
    if (!token.value) return null
    
    try {
      const payload = JSON.parse(atob(token.value.split('.')[1]))
      return new Date(payload.exp * 1000)
    } catch {
      return null
    }
  })

  // Actions
  const login = async (credentials: LoginCredentials) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      if (data.success && data.data) {
        const { token: authToken, user: userData } = data.data
        
        // Update state
        token.value = authToken
        user.value = userData
        
        // Persist to localStorage
        localStorage.setItem('auth_token', authToken)
        localStorage.setItem('user_data', JSON.stringify(userData))
        
        return userData
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      isLoading.value = false
    }
  }

  const logout = async (redirect = true) => {
    try {
      // Call logout endpoint if token exists
      if (token.value) {
        await fetch('http://localhost:3000/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token.value}`,
            'Content-Type': 'application/json',
          },
        })
      }
    } catch (error) {
      console.warn('Logout API call failed:', error)
    } finally {
      // Clear state regardless of API call success
      token.value = null
      user.value = null
      error.value = null
      
      // Clear localStorage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      
      if (redirect) {
        // Use router push instead of window.location for SPA navigation
        const router = await import('vue-router')
        const currentRouter = router.getRouter?.() || (window as any).__VUE_ROUTER__
        if (currentRouter) {
          const currentUserRole = user.value?.role
          if (currentUserRole === 'admin' || currentUserRole === 'manager') {
            currentRouter.push('/admin')
          } else {
            currentRouter.push('/login')
          }
        }
      }
    }
  }

  const checkAuthStatus = async () => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUserData = localStorage.getItem('user_data')
    
    if (!storedToken || !storedUserData) {
      return false
    }

    try {
      // Parse stored user data
      const userData = JSON.parse(storedUserData)
      
      // Check if token is expired
      const payload = JSON.parse(atob(storedToken.split('.')[1]))
      const currentTime = Math.floor(Date.now() / 1000)
      
      if (payload.exp < currentTime) {
        throw new Error('Token expired')
      }

      // Validate with backend
      const response = await fetch('http://localhost:3000/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data?.user) {
          // Update state
          token.value = storedToken
          user.value = data.data.user
          
          // Update stored user data with latest from server
          localStorage.setItem('user_data', JSON.stringify(data.data.user))
          
          return true
        }
      }
      
      throw new Error('Token validation failed')
    } catch (error) {
      console.warn('Auth validation failed:', error)
      
      // Clear invalid data
      token.value = null
      user.value = null
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      
      return false
    }
  }

  const updateUser = (userData: Partial<User>) => {
    if (user.value) {
      user.value = { ...user.value, ...userData }
      localStorage.setItem('user_data', JSON.stringify(user.value))
    }
  }

  const clearError = () => {
    error.value = null
  }

  const hasPermission = (permission: string): boolean => {
    // This would integrate with your permission system
    // For now, return basic role-based permissions
    if (!user.value) return false
    
    const userRole = user.value.role
    
    // Admin has all permissions
    if (userRole === 'admin') return true
    
    // Manager has most permissions
    if (userRole === 'manager') {
      return !permission.includes('ADMIN_ONLY')
    }
    
    // Basic permissions for other roles
    return !permission.includes('ADMIN') && !permission.includes('MANAGER')
  }

  // Initialize store with existing token if available
  const initializeAuth = () => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUserData = localStorage.getItem('user_data')
    
    if (storedToken && storedUserData) {
      try {
        token.value = storedToken
        user.value = JSON.parse(storedUserData)
      } catch (error) {
        console.warn('Failed to parse stored auth data:', error)
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
      }
    }
  }

  return {
    // State
    user,
    token,
    isLoading,
    error,
    
    // Getters
    isAuthenticated,
    isAdmin,
    userRole,
    userName,
    isTokenExpired,
    tokenExpirationTime,
    
    // Actions
    login,
    logout,
    checkAuthStatus,
    updateUser,
    clearError,
    hasPermission,
    initializeAuth
  }
}, {
  persist: {
    key: 'auth-store',
    storage: localStorage,
    paths: ['token', 'user']
  }
})