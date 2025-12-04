<template>
  <div class="flex w-full h-screen gap-1">
    <!-- Admin Sidebar -->
    <div class="flex flex-col w-[15%] bg-gray-50 h-screen overflow-auto overflow-x-hidden">
      <div class="flex items-center w-full h-16 p-2 gap-2">
        <img src="/logo.png" class="h-16 object-contain" alt="Logo" />
        <p class="text-2xl font-bold text-gray-700 font-cursive">Grand Resort</p>
      </div>

      <!-- User Information Section - just like frontdesk vibes fr fr -->
      <div class="flex w-full items-center p-2 rounded-lg pl-5 mr-5 mt-4">
        <div class="h-10 w-10 bg-green-600 rounded-full flex items-center justify-center">
          <i class="pi pi-shield text-white text-sm"></i>
        </div>

        <div class="ml-3 leading-tight flex-1">
          <p class="text-sm font-semibold text-black" v-if="currentUser">
            {{ currentUser.firstName }} {{ currentUser.lastName }}
          </p>
          <p class="text-xs text-gray-500 capitalize" v-if="currentUser">
            {{ currentUser.role }}
            <span v-if="currentUser.department"> • {{ currentUser.department }}</span>
          </p>
        </div>
      </div>

      <!-- Navigation -->
      <div class="w-full p-3 space-y-2 bg-gray-50 mt-4">
        <p class="text-xs pl-4 font-bold text-gray-700">Administration</p>
        <nav class="flex flex-col space-y-1 mr-7">
          <RouterLink to="/admin/dashboard" custom v-slot="{ href, navigate, isActive }">
            <a
              :href="href"
              @click="navigate"
              :class="[
                'flex items-center gap-2 px-4 py-1.5 rounded-full hover:bg-gray-200 text-xs transition-colors no-underline',
                isActive ? 'bg-gray-100 text-green-900' : 'text-black hover:text-gray-900',
              ]"
            >
              <i class="pi pi-chart-line text-sm"></i>
              Dashboard
            </a>
          </RouterLink>
          
          <RouterLink to="/frontdesk" custom v-slot="{ href, navigate, isActive }">
            <a
              :href="href"
              @click="navigate"
              :class="[
                'flex items-center gap-2 px-4 py-1.5 rounded-full hover:bg-gray-200 text-xs transition-colors no-underline',
                isActive ? 'bg-gray-100 text-green-900' : 'text-black hover:text-gray-900',
              ]"
            >
              <i class="pi pi-user text-sm"></i>
              Front Desk
            </a>
          </RouterLink>
          
          <RouterLink to="/admin/users" custom v-slot="{ href, navigate, isActive }">
            <a
              :href="href"
              @click="navigate"
              :class="[
                'flex items-center gap-2 px-4 py-1.5 rounded-full hover:bg-gray-200 text-xs transition-colors no-underline',
                isActive ? 'bg-gray-100 text-green-900' : 'text-black hover:text-gray-900',
              ]"
            >
              <i class="pi pi-users text-sm"></i>
              User Management
            </a>
          </RouterLink>
          
          <RouterLink to="/admin/rooms" custom v-slot="{ href, navigate, isActive }">
            <a
              :href="href"
              @click="navigate"
              :class="[
                'flex items-center gap-2 px-4 py-1.5 rounded-full hover:bg-gray-200 text-xs transition-colors no-underline',
                isActive ? 'bg-gray-100 text-green-900' : 'text-black hover:text-gray-900',
              ]"
            >
              <i class="pi pi-home text-sm"></i>
              Room Management
            </a>
          </RouterLink>
          
          <RouterLink to="/admin/reports" custom v-slot="{ href, navigate, isActive }">
            <a
              :href="href"
              @click="navigate"
              :class="[
                'flex items-center gap-2 px-4 py-1.5 rounded-full hover:bg-gray-200 text-xs transition-colors no-underline',
                isActive ? 'bg-gray-100 text-green-900' : 'text-black hover:text-gray-900',
              ]"
            >
              <i class="pi pi-chart-bar text-sm"></i>
              Reports
            </a>
          </RouterLink>
        </nav>

        <p class="text-xs pl-4 font-bold text-gray-700 pt-4">System</p>
        <nav class="flex flex-col space-y-1 mr-7">
          <RouterLink to="/admin/settings" custom v-slot="{ href, navigate, isActive }">
            <a
              :href="href"
              @click="navigate"
              :class="[
                'flex items-center gap-2 px-4 py-1.5 rounded-full hover:bg-gray-200 text-xs transition-colors no-underline',
                isActive ? 'bg-gray-100 text-green-900' : 'text-black hover:text-gray-900',
              ]"
            >
              <i class="pi pi-cog text-sm"></i>
              Settings
            </a>
          </RouterLink>
          
          <RouterLink to="/admin/logs" custom v-slot="{ href, navigate, isActive }">
            <a
              :href="href"
              @click="navigate"
              :class="[
                'flex items-center gap-2 px-4 py-1.5 rounded-full hover:bg-gray-200 text-xs transition-colors no-underline',
                isActive ? 'bg-gray-100 text-green-900' : 'text-black hover:text-gray-900',
              ]"
            >
              <i class="pi pi-file-edit text-sm"></i>
              System Logs
            </a>
          </RouterLink>
        </nav>
      </div>

      <!-- Logout Button -->
      <div class="mt-auto p-3 mr-7">
        <button
          @click="handleLogout"
          class="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 rounded-full transition-colors"
        >
          <i class="pi pi-sign-out text-sm"></i>
          Logout
        </button>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex flex-col w-[85%] p-0 m-0 overflow-auto">
      <!-- Header Bar -->
      <div class="flex items-center justify-between px-6 pt-2 pb-1 bg-white border-b border-gray-200">
        <Searchbar
          placeholder="Search admin panel..."
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
              <div class="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                <i class="pi pi-shield text-white text-xs"></i>
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

      <!-- Page Content -->
      <div class="pt-4">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useClickOutside } from '../composables/useClickOutside'
import { useAutoLogout } from '../composables/useAutoLogout'
import Searchbar from '@/components/Searchbar.vue'

// Props
interface Props {
  pageTitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  pageTitle: 'Admin Panel'
})

const { currentUser, logout } = useAuth()
const router = useRouter()

// Auto-logout functionality for admin
useAutoLogout()

// Local state
const showUserDropdown = ref(false)
const isRefreshing = ref(false)
const notificationCount = ref(5) // Admin notifications

// Click outside to close dropdowns
useClickOutside(
  (target: HTMLElement) => target.closest('.user-dropdown-container') !== null,
  () => {
    showUserDropdown.value = false
  }
)

// ESC key handling
const handleEscKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    showUserDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscKey)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscKey)
})

// User dropdown options - admin specific
const userMenuOptions = computed(() => {
  const baseOptions = [
    { label: 'Profile', icon: 'pi pi-user', action: 'profile' },
    { label: 'Settings', icon: 'pi pi-cog', action: 'settings' },
    { label: 'System Logs', icon: 'pi pi-file-edit', action: 'logs' },
    { label: 'Help', icon: 'pi pi-question-circle', action: 'help' },
  ]
  
  baseOptions.push({ label: 'Sign Out', icon: 'pi pi-sign-out', action: 'signout' })
  return baseOptions
})

// Handle search from header
const handleHeaderSearch = (query: string) => {
  console.log('Admin search:', query)
  // Implement admin search functionality
}

// Handle refresh
const handleRefresh = async () => {
  if (isRefreshing.value) return

  isRefreshing.value = true

  try {
    // Simulate refresh delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    // Refresh current page data
    window.location.reload()
  } catch (error) {
    console.error('Refresh error:', error)
  } finally {
    isRefreshing.value = false
  }
}

// Handle notifications
const handleNotifications = () => {
  alert(`You have ${notificationCount.value} admin notifications`)
}

// Handle user menu actions
const handleUserMenuAction = async (action: string) => {
  showUserDropdown.value = false

  switch (action) {
    case 'profile':
      // Navigate to admin profile
      break
    case 'settings':
      router.push('/admin/settings')
      break
    case 'logs':
      router.push('/admin/logs')
      break
    case 'help':
      // Open help documentation
      break
    case 'signout':
      handleLogout()
      break
  }
}

const handleLogout = () => {
  showUserDropdown.value = false
  logout()
}
</script>
