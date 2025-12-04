import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  persistent?: boolean
  actions?: Array<{
    label: string
    action: () => void
    style?: 'primary' | 'secondary' | 'danger'
  }>
  metadata?: Record<string, any>
  createdAt: Date
}

export const useNotificationsStore = defineStore('notifications', () => {
  // State
  const notifications = ref<Notification[]>([])
  const maxNotifications = ref(5)
  const defaultDuration = ref(5000) // 5 seconds

  // Getters
  const allNotifications = computed(() => notifications.value)
  const persistentNotifications = computed(() => 
    notifications.value.filter(n => n.persistent)
  )
  const temporaryNotifications = computed(() => 
    notifications.value.filter(n => !n.persistent)
  )
  const unreadCount = computed(() => notifications.value.length)
  
  const notificationsByType = computed(() => {
    const grouped: Record<string, Notification[]> = {}
    notifications.value.forEach(notification => {
      if (!grouped[notification.type]) {
        grouped[notification.type] = []
      }
      grouped[notification.type].push(notification)
    })
    return grouped
  })

  // Actions
  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>): string => {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const newNotification: Notification = {
      ...notification,
      id,
      createdAt: new Date(),
      duration: notification.duration ?? defaultDuration.value
    }

    notifications.value.unshift(newNotification)

    // Limit max notifications (remove oldest)
    if (notifications.value.length > maxNotifications.value) {
      const removedNotifications = notifications.value.splice(maxNotifications.value)
      // Clear any pending timeouts for removed notifications
      removedNotifications.forEach(n => {
        if (!n.persistent) {
          clearNotificationTimeout(n.id)
        }
      })
    }

    // Auto remove temporary notifications
    if (!newNotification.persistent && newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }

    return id
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearAll = () => {
    notifications.value = []
  }

  const clearByType = (type: Notification['type']) => {
    notifications.value = notifications.value.filter(n => n.type !== type)
  }

  const updateNotification = (id: string, updates: Partial<Notification>) => {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      Object.assign(notification, updates)
    }
  }

  // Keep track of timeouts to clear them if needed
  const notificationTimeouts = new Map<string, NodeJS.Timeout>()

  const clearNotificationTimeout = (id: string) => {
    const timeout = notificationTimeouts.get(id)
    if (timeout) {
      clearTimeout(timeout)
      notificationTimeouts.delete(id)
    }
  }

  // Helper methods for common notification types
  const success = (title: string, message?: string, options?: Partial<Notification>): string => {
    return addNotification({
      type: 'success',
      title,
      message,
      ...options
    })
  }

  const error = (title: string, message?: string, options?: Partial<Notification>): string => {
    return addNotification({
      type: 'error',
      title,
      message,
      duration: 0, // Errors are persistent by default
      persistent: true,
      ...options
    })
  }

  const warning = (title: string, message?: string, options?: Partial<Notification>): string => {
    return addNotification({
      type: 'warning',
      title,
      message,
      duration: 7000, // Warnings last longer
      ...options
    })
  }

  const info = (title: string, message?: string, options?: Partial<Notification>): string => {
    return addNotification({
      type: 'info',
      title,
      message,
      ...options
    })
  }

  // API Error handler
  const handleApiError = (error: any, context?: string): string => {
    const title = context ? `${context} Failed` : 'Operation Failed'
    let message = 'An unexpected error occurred'

    if (error?.message) {
      message = error.message
    } else if (error?.response?.data?.message) {
      message = error.response.data.message
    } else if (error?.status) {
      message = `Request failed with status ${error.status}`
    }

    return error({
      title,
      message,
      metadata: {
        error,
        context,
        timestamp: new Date().toISOString()
      }
    })
  }

  // Batch operations
  const batchAdd = (notifications: Array<Omit<Notification, 'id' | 'createdAt'>>) => {
    const ids: string[] = []
    notifications.forEach(notification => {
      ids.push(addNotification(notification))
    })
    return ids
  }

  const batchRemove = (ids: string[]) => {
    ids.forEach(id => removeNotification(id))
  }

  // Settings
  const updateSettings = (settings: {
    maxNotifications?: number
    defaultDuration?: number
  }) => {
    if (settings.maxNotifications !== undefined) {
      maxNotifications.value = settings.maxNotifications
    }
    if (settings.defaultDuration !== undefined) {
      defaultDuration.value = settings.defaultDuration
    }
  }

  return {
    // State
    notifications,
    maxNotifications,
    defaultDuration,
    
    // Getters
    allNotifications,
    persistentNotifications,
    temporaryNotifications,
    unreadCount,
    notificationsByType,
    
    // Actions
    addNotification,
    removeNotification,
    clearAll,
    clearByType,
    updateNotification,
    
    // Helper methods
    success,
    error,
    warning,
    info,
    handleApiError,
    
    // Batch operations
    batchAdd,
    batchRemove,
    
    // Settings
    updateSettings
  }
})