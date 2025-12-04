<template>
  <div>
    <div class="flex items-center justify-between px-6 pt-2 pb-1 bg-white border-b border-gray-200">
      <Searchbar
        placeholder="Search..."
        icon="pi pi-search"
        :outline="false"
        width="25rem"
        @search="handleHeaderSearch"
      />
      <div class="flex items-center gap-4">
        <button
          @click="handleRefresh"
          :disabled="isRefreshing"
          class="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          :class="{ 'animate-spin': isRefreshing }"
          title="Refresh data"
        >
          <i class="pi pi-refresh text-gray-600 w-5 h-5 inline-block"></i>
        </button>

        <button
          @click="handleNotifications"
          class="relative p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          title="Notifications"
        >
          <i class="pi pi-bell text-gray-600 w-5 h-5 inline-block"></i>
          <span
            v-if="notificationCount > 0"
            class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
          >
            {{ notificationCount > 9 ? '9+' : notificationCount }}
          </span>
        </button>

        <div class="relative user-dropdown-container rounded-full bg-gray-50">
          <button
            @click="showUserDropdown = !showUserDropdown"
            class="flex items-center gap-2 hover:bg-gray-100 rounded-full px-3 py-2 transition-colors cursor-pointer"
            :class="{ 'bg-gray-50': showUserDropdown }"
          >
            <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <i class="pi pi-user text-white text-xs"></i>
            </div>
            <span class="text-xs font-medium text-gray-700" v-if="currentUser">
              {{ currentUser.firstName }} {{ currentUser.lastName }}
            </span>
            <span class="text-xs font-medium text-gray-700" v-else>
              Loading...
            </span>
            <i
              class="pi pi-chevron-down text-gray-500 text-center transition-transform"
              :class="{ 'rotate-180': showUserDropdown }"
            ></i>
          </button>

          <div
            v-if="showUserDropdown"
            class="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
          >
            <!-- User Info Header -->
            <div class="px-4 py-3 border-b border-gray-200" v-if="currentUser">
              <p class="text-sm font-medium text-gray-900">
                {{ currentUser.firstName }} {{ currentUser.lastName }}
              </p>
              <p class="text-xs text-gray-500 capitalize">
                {{ currentUser.role }}
                <span v-if="currentUser.department"> • {{ currentUser.department }}</span>
              </p>
            </div>
            
            <div class="py-1">
              <button
                v-for="option in userMenuOptions"
                :key="option.action"
                @click="handleUserMenuAction(option.action)"
                class="w-full flex items-center gap-3 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                :class="{ 'text-red-600 hover:bg-red-50': option.action === 'signout' }"
              >
                <i :class="option.icon" class="w-4 h-4"></i>
                {{ option.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="pt-4">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import Searchbar from '@/components/Searchbar.vue'

// Authentication
const { currentUser, logout } = useAuth()
const router = useRouter()

// State management
const showUserDropdown = ref(false)
const notificationCount = ref(3) // Example notification count
const isRefreshing = ref(false)

// User dropdown options - dynamic based on role bestie 💅
const userMenuOptions = computed(() => {
  const baseOptions = [
    { label: 'Profile', icon: 'pi pi-user', action: 'profile' },
    { label: 'Settings', icon: 'pi pi-cog', action: 'settings' },
    { label: 'Help', icon: 'pi pi-question-circle', action: 'help' },
  ]
  
  // Add admin dashboard for admins/managers - no cap fr fr 🔥
  if (currentUser.value?.role === 'admin' || currentUser.value?.role === 'manager') {
    baseOptions.splice(1, 0, { label: 'Dashboard', icon: 'pi pi-chart-bar', action: 'dashboard' })
  }
  
  baseOptions.push({ label: 'Sign Out', icon: 'pi pi-sign-out', action: 'signout' })
  return baseOptions
})

// Handle search from header
const handleHeaderSearch = (query: string) => {}

// Handle refresh
const handleRefresh = async () => {
  if (isRefreshing.value) return

  isRefreshing.value = true

  try {
    // Simulate refresh delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Here you would typically refresh the current page data
    // For now, we'll just reload the current route
    window.location.reload()
  } catch (error) {
  } finally {
    isRefreshing.value = false
  }
}

// Handle notifications
const handleNotifications = () => {
  alert(`You have ${notificationCount.value} new notifications`)
}

// Handle user menu actions
const handleUserMenuAction = async (action: string) => {
  showUserDropdown.value = false

  switch (action) {
    case 'profile':
      // Navigate to profile page or show profile modal
      alert('Profile functionality coming soon!')
      break
    case 'dashboard':
      // Navigate to admin dashboard - slay bestie 💯
      router.push('/admin/dashboard')
      break
    case 'settings':
      // Navigate to settings page
      window.location.href = '/settings'
      break
    case 'help':
      // Open help documentation or support
      alert('Help: Contact your system administrator for assistance')
      break
    case 'signout':
      if (confirm('Are you sure you want to sign out?')) {
        try {
          await logout()
        } catch (error) {
          console.error('Logout failed:', error)
          alert('Logout failed. Please try again.')
        }
      }
      break
    default:
      console.warn('Unknown user menu action:', action)
  }
}

// Close dropdowns when clicking outside
const closeDropdowns = () => {
  showUserDropdown.value = false
}

// Setup click outside listener
onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.user-dropdown-container')) {
      closeDropdowns()
    }
  })
})
</script>
