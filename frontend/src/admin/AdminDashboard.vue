<template>
  <AdminLayout page-title="Admin Dashboard">
    <!-- Page Content -->
    <div class="h-full bg-white">
      <!-- Page Controls -->
      <div class="px-6 py-2">
        <Searchbar
          placeholder="Search dashboard data..."
          icon="pi pi-search"
          :outline="false"
          @search="handleDashboardSearch"
          width="20rem"
        />
        <div class="flex items-center gap-4 mt-2">
          <!-- Quick Actions -->
          <Custombutton 
            label="Add User" 
            bg-color="bg-green-700"
            hover-bg-color="hover:bg-green-700"
            :hover="true"
            @click="handleAddUser"
          />
          
          <!-- Development Tools -->
          <div class="flex items-center gap-2">
            <button
              @click="seedReservations"
              :disabled="seederLoading"
              class="flex items-center gap-2 px-3 py-2 text-xs text-blue-700 bg-blue-50 outline outline-1 outline-blue-200 rounded-full transition-colors hover:bg-blue-100"
            >
              <i v-if="seederLoading" class="pi pi-spin pi-spinner w-3 h-3"></i>
              <i v-else class="pi pi-plus w-3 h-3"></i>
              Seed Data
            </button>
            <button
              @click="clearReservations"
              :disabled="seederLoading"
              class="flex items-center gap-2 px-3 py-2 text-xs text-red-700 bg-red-50 outline outline-1 outline-red-200 rounded-full transition-colors hover:bg-red-100"
            >
              <i v-if="seederLoading" class="pi pi-spin pi-spinner w-3 h-3"></i>
              <i v-else class="pi pi-trash w-3 h-3"></i>
              Clear Data
            </button>
            <button
              @click="debugData"
              class="flex items-center gap-2 px-3 py-2 text-xs text-purple-700 bg-purple-50 outline outline-1 outline-purple-200 rounded-full transition-colors hover:bg-purple-100"
            >
              <i class="pi pi-search w-3 h-3"></i>
              Debug
            </button>
          </div>

          <!-- Date Range Filter -->
          <div class="relative date-range-dropdown">
            <div
              @click="showDateRangeDropdown = !showDateRangeDropdown"
              class="flex items-center bg-gray-50 outline outline-1 outline-gray-200 rounded-full px-3 py-2 pr-8 text-xs text-gray-700 transition-colors cursor-pointer hover:bg-gray-100"
            >
              {{ selectedDateRange === 'today' ? 'Today' : selectedDateRange === 'this_week' ? 'This Week' : 'This Month' }}
              <i class="pi pi-chevron-down absolute right-2 text-gray-300 w-4 h-4"></i>
            </div>
            <div
              v-if="showDateRangeDropdown"
              class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-full"
            >
              <div
                v-for="option in dateRangeOptions"
                :key="option.value"
                @click="
                  selectedDateRange = option.value;
                  showDateRangeDropdown = false;
                  handleDateRangeChange();
                "
                class="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer first:rounded-t-lg last:rounded-b-lg whitespace-nowrap"
                :class="{ 'bg-green-50 text-green-700': selectedDateRange === option.value }"
              >
                {{ option.label }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="px-6 py-2 overflow-y-auto h-full">
        <!-- System Status -->
        <div class="mb-6">
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-semibold text-gray-900">System Status</h2>
                <p class="text-sm text-gray-600">Hotel management system overview</p>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                <span class="text-sm text-gray-600">All systems operational</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State (skeletons) -->
        <div v-if="loading" class="space-y-6">
          <!-- Skeleton stats -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div v-for="n in 4" :key="n" class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-pulse">
              <div class="flex items-center">
                <div class="w-12 h-12 bg-gray-100 rounded-xl"></div>
                <div class="ml-4 w-full">
                  <div class="h-4 bg-gray-100 rounded w-24 mb-2"></div>
                  <div class="h-6 bg-gray-100 rounded w-32"></div>
                </div>
              </div>
            </div>
          </div>
          <!-- Skeleton charts/cards -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="h-80 bg-white rounded-2xl shadow-lg border border-gray-100 animate-pulse"></div>
            <div class="h-80 bg-white rounded-2xl shadow-lg border border-gray-100 animate-pulse"></div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <div class="flex items-center gap-3">
            <i class="pi pi-exclamation-triangle text-red-600 text-xl"></i>
            <div>
              <h3 class="text-red-800 font-semibold">Failed to load dashboard data</h3>
              <p class="text-red-600 text-sm">{{ error }}</p>
              <button 
                @click="fetchStats" 
                class="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>

        <!-- Stats Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Reservations" :value="stats.totalReservations" icon="pi pi-calendar-plus text-blue-600" iconBg="bg-blue-100" />
          <StatCard title="Available Rooms" :value="stats.availableRooms" icon="pi pi-home text-green-600" iconBg="bg-green-100" />
          <StatCard title="Current Guests" :value="stats.totalGuests" icon="pi pi-users text-orange-600" iconBg="bg-orange-100" />
          <StatCard title="Monthly Revenue" :value="stats.revenue.toLocaleString()" icon="pi pi-dollar text-purple-600" iconBg="bg-purple-100">
            <template #value>
              ₱{{ stats.revenue.toLocaleString() }}
            </template>
          </StatCard>
        </div>

        <!-- Analytics Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- Occupancy Rate Chart -->
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Occupancy Rate</h3>
                <p class="text-sm text-gray-600">Last 30 days performance</p>
              </div>
              <div class="p-2 bg-blue-100 rounded-lg">
                <i class="pi pi-chart-line text-blue-600 text-xl"></i>
              </div>
            </div>
            <apexchart
              type="area"
              height="300"
              :options="occupancyChartOptions"
              :series="occupancyChartSeries"
            />
          </div>

          <!-- Revenue Chart -->
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Revenue Analytics</h3>
                <p class="text-sm text-gray-600">Monthly revenue breakdown</p>
              </div>
              <div class="p-2 bg-green-100 rounded-lg">
                <i class="pi pi-dollar text-green-600 text-xl"></i>
              </div>
            </div>
            <apexchart
              type="bar"
              height="300"
              :options="revenueChartOptions"
              :series="revenueChartSeries"
            />
          </div>
        </div>

        <!-- Room Distribution & Booking Sources -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- Room Type Distribution -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Room Type Bookings</h3>
                <p class="text-sm text-gray-600">Booking distribution across {{ totalRoomsCount }} rooms</p>
              </div>
              <div class="flex items-center gap-2">
                <button 
                  @click="refreshRoomChart"
                  class="px-2 py-1 text-xs text-purple-700 bg-purple-50 border border-purple-200 rounded hover:bg-purple-100 transition-colors"
                >
                  <i class="pi pi-refresh mr-1"></i>
                  Refresh
                </button>
                <div class="p-2 bg-purple-100 rounded-lg">
                  <i class="pi pi-home text-purple-600 text-xl"></i>
                </div>
              </div>
            </div>
            <apexchart
              type="donut"
              height="300"
              :options="roomTypeChartOptions"
              :series="roomTypeChartSeries"
            />
          </div>

          <!-- Booking Sources -->
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">

            <div class="flex items-center justify-between mb-6">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Booking Sources</h3>
                <p class="text-sm text-gray-600">Where guests book from</p>
              </div>
              <div class="flex items-center gap-2">
                <button 
                  @click="refreshBookingSourceChart"
                  class="px-2 py-1 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded hover:bg-orange-100 transition-colors"
                >
                  <i class="pi pi-refresh mr-1"></i>
                  Refresh
                </button>
                <div class="p-2 bg-orange-100 rounded-lg">
                  <i class="pi pi-globe text-orange-600 text-xl"></i>
                </div>
              </div>
            </div>
            <apexchart
              type="pie"
              height="300"
              :options="bookingSourceChartOptions"
              :series="bookingSourceChartSeries"
            />
          </div>
        </div>

        <!-- Core Admin Functions -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- User Management -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">User Management</h3>
                <p class="text-sm text-gray-600">Manage staff accounts and permissions</p>
              </div>
              <div class="p-2 bg-blue-100 rounded-lg">
                <i class="pi pi-users text-blue-600 text-xl"></i>
              </div>
            </div>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm font-medium text-gray-700">Active Staff</span>
                <span class="text-sm font-semibold text-gray-900">{{ activeStaffCount }}</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm font-medium text-gray-700">Admin Users</span>
                <span class="text-sm font-semibold text-gray-900">{{ adminUserCount }}</span>
              </div>
              <Custombutton 
                label="Manage Users" 
                bg-color="bg-blue-600"
                hover-bg-color="hover:bg-blue-700"
                
                width="100%"
                :hover="true"
                @click="navigateToUsers"
              />
            </div>
          </div>

          <!-- System Maintenance -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">System Maintenance</h3>
                <p class="text-sm text-gray-600">Database and system operations</p>
              </div>
              <div class="p-2 bg-purple-100 rounded-lg">
                <i class="pi pi-cog text-purple-600 text-xl"></i>
              </div>
            </div>
            <div class="space-y-3">
              <button
                @click="seedReservations"
                :disabled="seederLoading"
                class="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <i v-if="seederLoading" class="pi pi-spin pi-spinner"></i>
                <i v-else class="pi pi-plus"></i>
                {{ seederLoading ? 'Seeding...' : 'Populate Sample Data' }}
              </button>
              <button
                @click="clearReservations"
                :disabled="seederLoading"
                class="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                <i v-if="seederLoading" class="pi pi-spin pi-spinner"></i>
                <i v-else class="pi pi-trash"></i>
                Clear All Data
              </button>
              <button
                @click="debugChartData"
                class="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <i class="pi pi-bug"></i>
                Debug Charts
              </button>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-green-100 rounded-lg">
                <i class="pi pi-bolt text-green-600 text-xl"></i>
              </div>
              <div>
                <h2 class="text-lg font-semibold text-gray-900">Quick Actions</h2>
                <p class="text-sm text-gray-600">Frequently used admin functions</p>
              </div>
            </div>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <router-link to="/admin/users" class="group p-6 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200 text-left block">
                <div class="flex flex-col items-center text-center">
                  <div class="p-3 bg-blue-100 group-hover:bg-blue-200 rounded-lg mb-4 transition-colors">
                    <i class="pi pi-users text-xl text-blue-600"></i>
                  </div>
                  <p class="font-semibold text-gray-900 mb-2">Manage Users</p>
                  <p class="text-sm text-gray-600 leading-relaxed">Staff accounts, roles & permissions</p>
                </div>
              </router-link>
              
              <button @click="navigateToRooms" class="group p-6 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200 text-left">
                <div class="flex flex-col items-center text-center">
                  <div class="p-3 bg-green-100 group-hover:bg-green-200 rounded-lg mb-4 transition-colors">
                    <i class="pi pi-plus text-xl text-green-600"></i>
                  </div>
                  <p class="font-semibold text-gray-900 mb-2">Add Room</p>
                  <p class="text-sm text-gray-600 leading-relaxed">Create new room inventory</p>
                </div>
              </button>

              <button @click="navigateToReports" class="group p-6 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200 text-left">
                <div class="flex flex-col items-center text-center">
                  <div class="p-3 bg-orange-100 group-hover:bg-orange-200 rounded-lg mb-4 transition-colors">
                    <i class="pi pi-chart-bar text-xl text-orange-600"></i>
                  </div>
                  <p class="font-semibold text-gray-900 mb-2">View Reports</p>
                  <p class="text-sm text-gray-600 leading-relaxed">Analytics & business insights</p>
                </div>
              </button>

              <button @click="navigateToSettings" class="group p-6 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200 text-left">
                <div class="flex flex-col items-center text-center">
                  <div class="p-3 bg-purple-100 group-hover:bg-purple-200 rounded-lg mb-4 transition-colors">
                    <i class="pi pi-cog text-xl text-purple-600"></i>
                  </div>
                  <p class="font-semibold text-gray-900 mb-2">Settings</p>
                  <p class="text-sm text-gray-600 leading-relaxed">System configuration & preferences</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- System Information -->
        <div class="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100">
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-gray-100 rounded-lg">
                <i class="pi pi-info-circle text-gray-600 text-xl"></i>
              </div>
              <div>
                <h2 class="text-lg font-semibold text-gray-900">System Information</h2>
                <p class="text-sm text-gray-600">Hotel management system details</p>
              </div>
            </div>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-700">System Version</span>
                  <span class="text-sm text-gray-900">v2.1.0</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-700">Database Status</span>
                  <span class="text-sm text-green-600 font-medium">Connected</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-700">Last Backup</span>
                  <span class="text-sm text-gray-900">{{ lastBackupDate }}</span>
                </div>
              </div>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-700">Total Rooms</span>
                  <span class="text-sm text-gray-900">{{ totalRoomsCount }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-700">Active Reservations</span>
                  <span class="text-sm text-gray-900">{{ stats.totalReservations }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-700">System Uptime</span>
                  <span class="text-sm text-green-600 font-medium">99.9%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <ToastNotifications />
    
    <!-- Loading Overlay -->
    <LoadingOverlay v-if="loading" />
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useDashboardStats } from '../composables/useDashboardStats'
import { useSuccessNotification } from '../composables/useSuccessNotification'
import { useClickOutside } from '../composables/useClickOutside'
import AdminLayout from './AdminLayout.vue'
import Searchbar from '@/components/Searchbar.vue'
import Custombutton from '@/components/Custombutton.vue'
import ToastNotifications from '@/components/ToastNotifications.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import StatCard from '@/components/StatCard.vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const { currentUser } = useAuth()
const { 
  loading, 
  error, 
  occupancyStats, 
  bookingStats, 
  revenueStats, 
  cancellationStats,
  occupancyTrend,
  revenueTrend,
  bookingSources,
  roomPopularity,
  summaryCards,
  fetchStats: fetchDashboardStats,
  calculateRealRoomPopularity,
  calculateRealBookingSources
} = useDashboardStats()

// Selected date range filter
const selectedDateRange = ref('this_month')
const dateRangeOptions = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'this_week' },
  { label: 'This Month', value: 'this_month' }
]

// Seeder functionality
const seederLoading = ref(false)
const showDateRangeDropdown = ref(false)

// Toast notifications
const { showWithTimeout } = useSuccessNotification()

// Click outside for date dropdown
useClickOutside(
  (target: HTMLElement) => target.closest('.date-range-dropdown') !== null,
  () => {
    showDateRangeDropdown.value = false
  }
)

// Admin dashboard functions
const handleDashboardSearch = (query: string) => {
  console.log('Dashboard search:', query)
  showWithTimeout(`Searching for: ${query}`, 2000)
  // Implement dashboard search functionality
}

const handleAddUser = () => {
  console.log('Add user clicked')
  showWithTimeout('Navigating to user management...', 2000)
  // Navigate to add user page or open modal
}

// User statistics data
const userStats = ref(null)

// Core admin data - NOW WITH REAL API CALLS!
const activeStaffCount = computed(() => {
  return userStats.value?.activeUsers || 0
})

const adminUserCount = computed(() => {
  return userStats.value?.adminUsers || 0
})

const totalRoomsCount = computed(() => {
  return occupancyStats.value?.totalRooms || 27
})
const lastBackupDate = computed(() => {
  const date = new Date()
  date.setHours(date.getHours() - 6)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
})

const navigateToUsers = () => {
  // Navigate to user management page
  console.log('Navigating to user management...')
  window.location.href = '/admin/users'
}

const navigateToRooms = () => {
  // Navigate to room management page
  console.log('Navigating to room management...')
  window.location.href = '/admin/rooms'
}

const navigateToReports = () => {
  // Navigate to reports page
  console.log('Navigating to reports...')
  window.location.href = '/admin/reports'
}

const navigateToSettings = () => {
  // Navigate to settings page
  console.log('Navigating to settings...')
  window.location.href = '/admin/settings'
}

// Force refresh room chart data using real calculations
const refreshRoomChart = async () => {
  try {
    console.log('🔄 Force refreshing room chart with REAL data...')
    await calculateRealRoomPopularity()
    showWithTimeout('Room chart data refreshed with real data!', 2000)
  } catch (error) {
    console.error('Failed to refresh room chart:', error)
    showWithTimeout('Failed to refresh room chart', 2000)
  }
}

// Force refresh booking sources chart data using real calculations
const refreshBookingSourceChart = async () => {
  try {
    console.log('🔄 Force refreshing booking sources chart with REAL data...')
    await calculateRealBookingSources()
    showWithTimeout('Booking sources chart refreshed with real data!', 2000)
  } catch (error) {
    console.error('Failed to refresh booking sources chart:', error)
    showWithTimeout('Failed to refresh booking sources chart', 2000)
  }
}


// Legacy stats for backward compatibility
const stats = computed(() => ({
  totalReservations: bookingStats.value?.totalBookings || 0,
  availableRooms: occupancyStats.value?.availableRooms || 0,
  totalGuests: occupancyStats.value?.occupiedRooms || 0,
  revenue: revenueStats.value?.totalRevenue || 0
}))

// Fetch user statistics
const fetchUserStats = async () => {
  try {
    const token = localStorage.getItem('auth_token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    
    const response = await fetch(`${API_BASE_URL}/stats/users`, { 
      cache: 'no-cache', 
      headers 
    })
    
    if (response.ok) {
      userStats.value = await response.json()
      console.log('✅ User stats loaded:', userStats.value)
    } else {
      console.warn('Failed to fetch user stats')
    }
  } catch (error) {
    console.error('Error fetching user stats:', error)
  }
}

// Fetch dashboard stats with real API data
const fetchStats = async () => {
  await fetchDashboardStats(selectedDateRange.value)
  
  // Fetch user statistics
  await fetchUserStats()
  
  // Calculate real chart data from actual reservations
  console.log('📊 Fetching real chart data...')
  await Promise.all([
    calculateRealRoomPopularity(),
    calculateRealBookingSources()
  ])
  console.log('✅ Real chart data updated')
}

// Handle date range change
const handleDateRangeChange = async () => {
  await fetchStats()
}

// Seeder functions - for development only, real fire 🔥
const seedReservations = async () => {
  console.log('🌱 Seed button clicked!')
  seederLoading.value = true
  
  try {
    console.log('📡 Calling seeder API...')
    const response = await fetch('http://localhost:3000/api/admin/seed-reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    console.log('📡 Seeder API response status:', response.status)
    
    const result = await response.json()
    console.log('📡 Seeder API result:', result)
    console.log('📊 Seeder data details:', result.data)
    
    if (result.success) {
      // Success toast
      const guestsCreated = result.data?.guestsCreated || 0
      const reservationsCreated = result.data?.reservationsCreated || 0
      const occ = result.data?.occupancyRate || 0
      showWithTimeout(`Seeding successful: ${guestsCreated} guests, ${reservationsCreated} reservations • Occupancy ${occ}%`, 3000)
      
      // Refresh dashboard data
      await fetchStats()
      
      // Also call debug to verify data was created
      console.log('🔍 Verifying seeded data...')
      setTimeout(async () => {
        await debugChartData()
      }, 1000)
    } else {
      showWithTimeout(`Seeding failed: ${result.error}`, 3000)
    }
  } catch (error) {
    console.error('Seeder error:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    showWithTimeout(`Seeding failed: ${msg}`, 3000)
  } finally {
    seederLoading.value = false
  }
}

const clearReservations = async () => {
  if (!confirm('⚠️ Are you sure you want to clear ALL reservations and guests? This cannot be undone!')) {
    return
  }
  
  seederLoading.value = true
  try {
    const response = await fetch('http://localhost:3000/api/admin/clear-reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const result = await response.json()
    
    if (result.success) {
      showWithTimeout('All reservations and guests cleared successfully', 2500)
      
      // Refresh dashboard data
      await fetchStats()
    } else {
      showWithTimeout(`Clear failed: ${result.error}` , 3000)
    }
  } catch (error) {
    console.error('Clear error:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    showWithTimeout(`Clear failed: ${msg}`, 3000)
  } finally {
    seederLoading.value = false
  }
}

// Comprehensive debug function for charts
const debugChartData = async () => {
  try {
    console.log('🔍 === COMPREHENSIVE CHART DEBUG ===')

    const token = localStorage.getItem('auth_token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    
    // 1. Check basic reservation counts
    const debugResponse = await fetch(`${API_BASE_URL}/debug/reservations`, { headers })
    const debugResult = await debugResponse.json()
    console.log('📊 Basic counts:', debugResult.counts)
    
    // 2. Check room popularity API directly
    console.log('🔍 Checking room popularity API...')
    const roomPopResponse = await fetch(`${API_BASE_URL}/stats/rooms/popularity?_t=${Date.now()}`, { cache: 'no-cache', headers })
    const roomPopData = await roomPopResponse.json()
    console.log('📊 Room popularity API response:', roomPopData)
    
    // 3. Check booking sources API directly  
    console.log('🔍 Checking booking sources API...')
    const bookingSourceResponse = await fetch(`${API_BASE_URL}/stats/bookings/source?_t=${Date.now()}`, { cache: 'no-cache', headers })
    const bookingSourceData = await bookingSourceResponse.json()
    console.log('📊 Booking sources API response:', bookingSourceData)
    
    // 4. Check current reactive data
    console.log('🔍 Current reactive data:')
    console.log('roomPopularity.value:', roomPopularity.value)
    console.log('bookingSources.value:', bookingSources.value)
    
    // 5. Calculate totals
    const roomChartTotal = roomPopularity.value.reduce((sum, item) => sum + (item.nights_booked || 0), 0)
    const sourceChartTotal = bookingSources.value.reduce((sum, item) => sum + (item.count || 0), 0)
    
    // 6. Log comprehensive debug info
    const debugInfo = `
=== CHART DEBUG ANALYSIS ===

BASIC COUNTS:
• Total Reservations: ${debugResult.counts.totalReservations}
• Total Guests: ${debugResult.counts.totalGuests}
• Total Rooms: ${debugResult.counts.totalRooms}

ROOM POPULARITY API:
${roomPopData.length > 0 ? roomPopData.map(item => `• ${item.room_type}: ${item.nights_booked} nights`).join('\n') : '• NO DATA RETURNED'}

BOOKING SOURCES API:
${bookingSourceData.length > 0 ? bookingSourceData.map(item => `• ${item.source}: ${item.count} (${item.percentage}%)`).join('\n') : '• NO DATA RETURNED'}

CURRENT CHART DATA:
Room Chart Total: ${roomChartTotal} nights
Source Chart Total: ${sourceChartTotal} bookings

REACTIVE DATA STATUS:
• roomPopularity.value length: ${roomPopularity.value.length}
• bookingSources.value length: ${bookingSources.value.length}

DATA CONSISTENCY:
• API vs Chart (Room): ${JSON.stringify(roomPopData) === JSON.stringify(roomPopularity.value) ? 'MATCH' : 'MISMATCH'}
• API vs Chart (Sources): ${JSON.stringify(bookingSourceData) === JSON.stringify(bookingSources.value) ? 'MATCH' : 'MISMATCH'}

SAMPLE RESERVATIONS:
${debugResult.sampleReservations.map((r: any) => `• ${r.guest}: ${r.status} (₱${r.totalPrice})`).join('\n')}
    `.trim()

    console.log(debugInfo)
    showWithTimeout('Chart debug summary printed to console', 2500)
    
  } catch (error) {
    console.error('Debug error:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    showWithTimeout(`Debug failed: ${msg}`, 3000)
  }
}

// Chart configurations - reactive with real data 🔥
const occupancyChartOptions = computed(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
    sparkline: { enabled: false }
  },
  colors: ['#3B82F6'],
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.3,
      stops: [0, 90, 100]
    }
  },
  stroke: {
    curve: 'smooth',
    width: 3
  },
  xaxis: {
    categories: occupancyTrend.value.map(item => {
      const date = new Date(item.date)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }),
    labels: { style: { colors: '#6B7280' } }
  },
  yaxis: {
    labels: { 
      style: { colors: '#6B7280' },
      formatter: (val: number) => `${val}%`
    }
  },
  grid: {
    borderColor: '#F3F4F6',
    strokeDashArray: 3
  },
  tooltip: {
    y: { formatter: (val: number) => `${val}%` }
  }
}))

const occupancyChartSeries = computed(() => [{
  name: 'Occupancy Rate',
  data: occupancyTrend.value.map(item => item.occupancy_percentage || 0)
}])

const revenueChartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false }
  },
  colors: ['#10B981'],
  plotOptions: {
    bar: {
      borderRadius: 8,
      columnWidth: '60%'
    }
  },
  xaxis: {
    categories: revenueTrend.value.map(item => item.date),
    labels: { style: { colors: '#6B7280' } }
  },
  yaxis: {
    labels: { 
      style: { colors: '#6B7280' },
      formatter: (val: number) => `₱${val}k`
    }
  },
  grid: {
    borderColor: '#F3F4F6',
    strokeDashArray: 3
  },
  tooltip: {
    y: { formatter: (val: number) => `₱${val}k` }
  }
}))

const revenueChartSeries = computed(() => [{
  name: 'Revenue',
  data: revenueTrend.value.map(item => item.revenue || 0)
}])

const roomTypeChartOptions = computed(() => ({
  chart: {
    type: 'donut'
  },
  colors: ['#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'],
  labels: roomPopularity.value.map(item => item.room_type),
  legend: {
    position: 'bottom',
    labels: { colors: '#6B7280' }
  },
  plotOptions: {
    pie: {
      donut: {
        size: '70%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total Rooms',
            color: '#374151',
            formatter: () => String(occupancyStats.value?.totalRooms || 27)
          }
        }
      }
    }
  },
  tooltip: {
    y: { formatter: (val: number) => `${val} reservations` }
  }
}))

const roomTypeChartSeries = computed(() => 
  roomPopularity.value.map(item => item.bookings_count || 0)
)

const bookingSourceChartOptions = computed(() => ({
  chart: {
    type: 'pie'
  },
  colors: ['#F97316', '#3B82F6', '#10B981', '#8B5CF6'],
  labels: bookingSources.value.map(item => item.source),
  legend: {
    position: 'bottom',
    labels: { colors: '#6B7280' }
  },
  tooltip: {
    y: { formatter: (val: number) => `${val}%` }
  }
}))

const bookingSourceChartSeries = computed(() => 
  bookingSources.value.map(item => item.percentage || 0)
)

onMounted(() => {
  fetchStats()
})
</script>
