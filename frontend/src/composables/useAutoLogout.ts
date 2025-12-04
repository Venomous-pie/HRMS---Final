import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from './useAuth'
import { setUnauthorizedHandler, clearUnauthorizedHandler } from '../services/apiClient'
import { useNotificationsStore } from '../stores/notifications'

interface AutoLogoutOptions {
  // Check token validity every X minutes (default: 5)
  checkIntervalMinutes?: number
  // Show warning before auto logout (default: true)
  showWarning?: boolean
  // Warning duration in seconds (default: 30)
  warningDurationSeconds?: number
}

export function useAutoLogout(options: AutoLogoutOptions = {}) {
  const router = useRouter()
  const { logout, checkAuthStatus, isAuthenticated } = useAuth()
  const notifications = useNotificationsStore()
  
  const {
    checkIntervalMinutes = 5,
    showWarning = true,
    warningDurationSeconds = 30
  } = options

  const isCheckingAuth = ref(false)
  const showLogoutWarning = ref(false)
  const warningCountdown = ref(0)
  
  let checkInterval: NodeJS.Timeout | null = null
  let warningTimeout: NodeJS.Timeout | null = null
  let countdownInterval: NodeJS.Timeout | null = null
  let logoutInProgress = false // Prevent multiple logout attempts

  // Handle unauthorized responses from API calls
  const handleUnauthorized = async (reason: string = 'Session expired') => {
    // Prevent duplicate logout attempts
    if (logoutInProgress) {
      return
    }
    
    // Check if this is due to account deactivation or permission changes
    const isAccountIssue = reason.includes('User not found') || 
                          reason.includes('inactive') || 
                          reason.includes('deactivated') ||
                          reason.includes('permissions') ||
                          reason.includes('Access denied') ||
                          reason.includes('Insufficient') ||
                          reason.includes('not found or inactive')
    
    if (isAccountIssue) {
      // Set flag to prevent duplicate logout attempts
      logoutInProgress = true
      
      // Show notification about account issue (only once)
      notifications.error(
        'Account Access Removed',
        'Your account has been deactivated or your permissions have been changed. You have been logged out.',
        { 
          duration: 3000, // 3 seconds - short but readable
          persistent: false, // Override the default persistent behavior for errors
          actions: [
            {
              label: 'Contact Admin',
              action: () => {
                // Could open a contact form or redirect to help
                console.log('Contact admin requested')
              },
              style: 'secondary'
            }
          ]
        }
      )
      await performLogout(reason)
      return
    }
    
    if (showWarning && isAuthenticated.value) {
      // Show session expiry warning notification
      notifications.warning(
        'Session Expiring Soon',
        `Your session will expire in ${warningDurationSeconds} seconds due to inactivity.`,
        {
          duration: warningDurationSeconds * 1000, // Auto-dismiss when session expires
          actions: [
            {
              label: 'Stay Logged In',
              action: () => {
                cancelLogout()
                notifications.success('Session Extended', 'Your session has been extended.', {
                  duration: 3000 // Success message disappears after 3 seconds
                })
              },
              style: 'primary'
            },
            {
              label: 'Logout Now',
              action: () => {
                performLogout()
              },
              style: 'secondary'
            }
          ]
        }
      )
      
      showLogoutWarning.value = true
      warningCountdown.value = warningDurationSeconds
      
      // Start countdown
      countdownInterval = setInterval(() => {
        warningCountdown.value--
        if (warningCountdown.value <= 0) {
          performLogout()
        }
      }, 1000)
      
      // Set timeout to logout
      warningTimeout = setTimeout(() => {
        performLogout()
      }, warningDurationSeconds * 1000)
    } else {
      // Show immediate logout notification for session expiry
      notifications.info(
        'Session Expired',
        'Your session has expired. Please log in again to continue.',
        {
          duration: 5000, // 5 seconds before auto-dismiss
          actions: [
            {
              label: 'Login',
              action: () => {
                // Will be handled by the logout redirect
              },
              style: 'primary'
            }
          ]
        }
      )
      
      // Immediate logout if no warning or already logged out
      await performLogout()
    }
  }

  const performLogout = async (reason?: string) => {
    clearTimeouts()
    showLogoutWarning.value = false
    
    try {
      await logout()
    } catch (error) {
      console.error('Error during auto logout:', error)
      // Force logout even if API call fails
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      
      // Clear any other session data
      sessionStorage.clear()
      
      // Navigate to appropriate login page based on user role
      const currentPath = router.currentRoute.value.path
      if (currentPath.startsWith('/admin')) {
        router.push('/admin')
      } else {
        router.push('/login')
      }
      
      // Force page refresh to clear any cached state
      setTimeout(() => {
        window.location.reload()
      }, 100)
    } finally {
      // Reset flag after logout is complete
      logoutInProgress = false
    }
  }

  const cancelLogout = () => {
    clearTimeouts()
    showLogoutWarning.value = false
    warningCountdown.value = 0
  }

  const clearTimeouts = () => {
    if (warningTimeout) {
      clearTimeout(warningTimeout)
      warningTimeout = null
    }
    if (countdownInterval) {
      clearInterval(countdownInterval)
      countdownInterval = null
    }
  }

  // Periodic token validation - check if staff still authorized
  const startPeriodicCheck = () => {
    if (checkInterval) return
    
    checkInterval = setInterval(async () => {
      if (!isAuthenticated.value) return
      
      isCheckingAuth.value = true
      try {
        await checkAuthStatus()
        // If checkAuthStatus doesn't throw, token is still valid
      } catch (error) {
        console.warn('Periodic auth check failed:', error)
        await handleUnauthorized('Token validation failed')
      } finally {
        isCheckingAuth.value = false
      }
    }, checkIntervalMinutes * 60 * 1000)
  }

  const stopPeriodicCheck = () => {
    if (checkInterval) {
      clearInterval(checkInterval)
      checkInterval = null
    }
  }

  // Setup API client unauthorized handler
  const setupApiHandler = () => {
    setUnauthorizedHandler(handleUnauthorized)
  }

  const cleanupApiHandler = () => {
    clearUnauthorizedHandler()
  }

  onMounted(() => {
    if (isAuthenticated.value) {
      startPeriodicCheck()
      setupApiHandler()
    }
  })

  onUnmounted(() => {
    stopPeriodicCheck()
    clearTimeouts()
    cleanupApiHandler()
  })

  return {
    isCheckingAuth,
    showLogoutWarning,
    warningCountdown,
    handleUnauthorized,
    cancelLogout,
    startPeriodicCheck,
    stopPeriodicCheck
  }
}
