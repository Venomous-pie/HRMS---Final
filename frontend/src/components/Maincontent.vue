<template>
  <div>
    <div class="flex items-center justify-between px-6 pt-2 pb-1 bg-white border-b border-gray-200">
      <div class="relative w-full max-w-[25rem] global-search-container">
        <Searchbar
          placeholder="Search reservations, guests, rooms..."
          icon="pi pi-search"
          :outline="false"
          width="100%"
          @search="handleHeaderSearch"
        />
        <!-- Search Results Dropdown -->
        <div
          v-if="showSearchResults && searchResults.length > 0"
          class="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
        >
          <div class="p-2">
            <!-- Reservations Results -->
            <div v-if="reservationResults.length > 0" class="mb-2">
              <div class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Reservations</div>
              <div
                v-for="result in reservationResults.slice(0, 5)"
                :key="`reservation-${(result as any).id || (result as any).bookingNumber}`"
                @click="navigateToReservation(result)"
                class="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer rounded"
              >
                <div class="font-medium">
                  {{ (result as any).bookingNumber || (result as any).id }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ (result as any).guest || (result as any).guestName }} • Room {{ (result as any).roomNumber || (result as any).room }}
                </div>
              </div>
            </div>
            
            <!-- Guests Results -->
            <div v-if="guestResults.length > 0" class="mb-2">
              <div class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Guests</div>
              <div
                v-for="result in guestResults.slice(0, 5)"
                :key="`guest-${result.id}`"
                @click="navigateToGuest(result)"
                class="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer rounded"
              >
                <div class="font-medium">
                  {{ result.firstName }} {{ result.middleName || '' }} {{ result.lastName }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ result.email }} • {{ result.phone }}
                </div>
              </div>
            </div>
            
            <!-- Rooms Results -->
            <div v-if="roomResults.length > 0">
              <div class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Rooms</div>
              <div
                v-for="result in roomResults.slice(0, 5)"
                :key="`room-${result.id || result.number}`"
                @click="navigateToRoom(result)"
                class="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer rounded"
              >
                <div class="font-medium">
                  Room {{ result.number || result.roomNumber }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ result.type || result.roomType }} • {{ result.status }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- No Results Message -->
        <div
          v-if="showSearchResults && searchQuery && searchResults.length === 0 && !isSearching"
          class="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 text-sm text-gray-500 text-center"
        >
          No results found
        </div>
      </div>
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
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import Searchbar from '@/components/Searchbar.vue'
import { useUnifiedSearch } from '@/composables/useUnifiedSearch'
import { useHotelDataStore } from '@/stores/hotelData'
import { useGuestStore } from '@/stores/guest'
import { storeToRefs } from 'pinia'
import type { Reservation, Guest, Room } from '@/types/hotel'

// Authentication
const { currentUser, logout } = useAuth()
const router = useRouter()

// State management
const showUserDropdown = ref(false)
const notificationCount = ref(3) // Example notification count
const isRefreshing = ref(false)
const showSearchResults = ref(false)

// Get data from stores
const hotelDataStore = useHotelDataStore()
const guestStore = useGuestStore()
const { reservations, rooms } = storeToRefs(hotelDataStore)
const { guests } = storeToRefs(guestStore)

// Initialize unified search
const {
  searchQuery,
  searchResults,
  reservationResults,
  guestResults,
  roomResults,
  isSearching,
  search,
  clearSearch
} = useUnifiedSearch(
  reservations,
  guests,
  rooms,
  { debounceMs: 300, minQueryLength: 2, maxResults: 15 }
)

// Show/hide search results dropdown
watch(searchQuery, (newQuery) => {
  showSearchResults.value = !!newQuery && newQuery.length >= 2
  if (!newQuery) {
    showSearchResults.value = false
  }
})

// Handle search from header
const handleHeaderSearch = (query: string) => {
  search(query)
  showSearchResults.value = !!query && query.length >= 2
}

// Navigation handlers
const navigateToReservation = (reservation: Reservation) => {
  clearSearch()
  showSearchResults.value = false
  router.push('/reservations')
  // Optionally scroll to or highlight the reservation
  setTimeout(() => {
    // Could emit an event or use a store to highlight the reservation
  }, 100)
}

const navigateToGuest = (guest: Guest) => {
  clearSearch()
  showSearchResults.value = false
  router.push('/guests')
  // Optionally scroll to or highlight the guest
  setTimeout(() => {
    // Could emit an event or use a store to highlight the guest
  }, 100)
}

const navigateToRoom = (room: Room) => {
  clearSearch()
  showSearchResults.value = false
  router.push('/frontdesk')
  // Optionally show room details or highlight on frontdesk
  setTimeout(() => {
    // Could emit an event or use a store to highlight the room
  }, 100)
}

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
  // Ensure data is loaded
  if (!reservations.value.length) {
    hotelDataStore.fetchReservations()
  }
  if (!guests.value.length) {
    guestStore.fetchGuests()
  }
  if (!rooms.value.length) {
    hotelDataStore.fetchRooms()
  }
  
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.user-dropdown-container')) {
      closeDropdowns()
    }
    // Close search results when clicking outside
    if (!target.closest('.global-search-container')) {
      showSearchResults.value = false
    }
  })
})
</script>
