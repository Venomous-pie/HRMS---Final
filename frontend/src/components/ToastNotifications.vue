<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
      <TransitionGroup
        enter-active-class="transform transition duration-300 ease-out"
        enter-from-class="translate-x-full opacity-0"
        enter-to-class="translate-x-0 opacity-100"
        leave-active-class="transform transition duration-200 ease-in"
        leave-from-class="translate-x-0 opacity-100"
        leave-to-class="translate-x-full opacity-0"
      >
        <div
          v-for="notification in notifications.allNotifications"
          :key="notification.id"
          class="rounded-lg shadow-lg border-l-4 p-4 backdrop-blur-sm"
          :class="getNotificationClasses(notification.type)"
        >
          <div class="flex items-start gap-3">
            <!-- Icon -->
            <div class="flex-shrink-0 mt-0.5">
              <i 
                :class="getNotificationIcon(notification.type)"
                class="text-lg"
              ></i>
            </div>
            
            <!-- Content -->
            <div class="flex-1 min-w-0">
              <h4 class="font-medium text-sm" :class="getTitleClasses(notification.type)">
                {{ notification.title }}
              </h4>
              <p 
                v-if="notification.message" 
                class="mt-1 text-xs"
                :class="getMessageClasses(notification.type)"
              >
                {{ notification.message }}
              </p>
              
              <!-- Actions -->
              <div v-if="notification.actions && notification.actions.length > 0" class="mt-3 flex gap-2">
                <button
                  v-for="action in notification.actions"
                  :key="action.label"
                  @click="handleAction(action, notification.id)"
                  class="text-xs px-3 py-1 rounded-md font-medium transition-colors"
                  :class="getActionClasses(action.style || 'secondary', notification.type)"
                >
                  {{ action.label }}
                </button>
              </div>
            </div>
            
            <!-- Close button -->
            <button
              v-if="!notification.persistent"
              @click="notifications.removeNotification(notification.id)"
              class="flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors"
              :class="getCloseButtonClasses(notification.type)"
            >
              <i class="pi pi-times text-xs"></i>
            </button>
          </div>
          
          <!-- Progress bar for temporary notifications -->
          <div
            v-if="!notification.persistent && notification.duration"
            class="mt-3 h-1 bg-black/20 rounded-full overflow-hidden"
          >
            <div
              class="h-full rounded-full transition-all ease-linear"
              :class="getProgressClasses(notification.type)"
              :style="{
                width: '100%',
                animationDuration: `${notification.duration}ms`,
                animationName: 'shrink-width',
                animationFillMode: 'forwards'
              }"
            ></div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useNotificationsStore } from '@/stores/notifications'
import type { Notification } from '@/stores/notifications'

const notifications = useNotificationsStore()

const getNotificationClasses = (type: Notification['type']) => {
  const baseClasses = 'bg-white/95'
  
  switch (type) {
    case 'success':
      return `${baseClasses} border-l-green-500 text-green-900`
    case 'error':
      return `${baseClasses} border-l-red-500 text-red-900`
    case 'warning':
      return `${baseClasses} border-l-yellow-500 text-yellow-900`
    case 'info':
      return `${baseClasses} border-l-blue-500 text-blue-900`
    default:
      return `${baseClasses} border-l-gray-500 text-gray-900`
  }
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return 'pi pi-check-circle text-green-600'
    case 'error':
      return 'pi pi-exclamation-triangle text-red-600'
    case 'warning':
      return 'pi pi-exclamation-triangle text-yellow-600'
    case 'info':
      return 'pi pi-info-circle text-blue-600'
    default:
      return 'pi pi-info-circle text-gray-600'
  }
}

const getTitleClasses = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return 'text-green-900'
    case 'error':
      return 'text-red-900'
    case 'warning':
      return 'text-yellow-900'
    case 'info':
      return 'text-blue-900'
    default:
      return 'text-gray-900'
  }
}

const getMessageClasses = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return 'text-green-700'
    case 'error':
      return 'text-red-700'
    case 'warning':
      return 'text-yellow-700'
    case 'info':
      return 'text-blue-700'
    default:
      return 'text-gray-700'
  }
}

const getActionClasses = (actionStyle: string, type: Notification['type']) => {
  if (actionStyle === 'primary') {
    switch (type) {
      case 'success':
        return 'bg-green-600 text-white hover:bg-green-700'
      case 'error':
        return 'bg-red-600 text-white hover:bg-red-700'
      case 'warning':
        return 'bg-yellow-600 text-white hover:bg-yellow-700'
      case 'info':
        return 'bg-blue-600 text-white hover:bg-blue-700'
      default:
        return 'bg-gray-600 text-white hover:bg-gray-700'
    }
  } else if (actionStyle === 'danger') {
    return 'bg-red-100 text-red-800 hover:bg-red-200'
  } else {
    return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
  }
}

const getCloseButtonClasses = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return 'text-green-600 hover:text-green-800'
    case 'error':
      return 'text-red-600 hover:text-red-800'
    case 'warning':
      return 'text-yellow-600 hover:text-yellow-800'
    case 'info':
      return 'text-blue-600 hover:text-blue-800'
    default:
      return 'text-gray-600 hover:text-gray-800'
  }
}

const getProgressClasses = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return 'bg-green-600'
    case 'error':
      return 'bg-red-600'
    case 'warning':
      return 'bg-yellow-600'
    case 'info':
      return 'bg-blue-600'
    default:
      return 'bg-gray-600'
  }
}

const handleAction = (action: any, notificationId: string) => {
  action.action()
  notifications.removeNotification(notificationId)
}
</script>

<style scoped>
@keyframes shrink-width {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
</style>