<template>
  <AdminLayout page-title="Reports">
    <!-- Page Controls -->
    <div class="px-6 py-2">
      <div class="flex items-center justify-between">
        <Searchbar
          placeholder="Search reports..."
          icon="pi pi-search"
          :outline="false"
          @search="handleReportSearch"
          width="20rem"
        />
        <div class="flex items-center gap-4">
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
                @click="selectedDateRange = option.value; showDateRangeDropdown = false; handleDateRangeChange();"
                class="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer first:rounded-t-lg last:rounded-b-lg whitespace-nowrap"
                :class="{ 'bg-green-50 text-green-700': selectedDateRange === option.value }"
              >
                {{ option.label }}
              </div>
            </div>
          </div>
          <Custombutton 
            label="Export Report" 
            bg-color="bg-blue-600"
            hover-bg-color="hover:bg-blue-700"
            :hover="true"
            @click="exportReport"
          />
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="px-6 py-2 overflow-y-auto h-full">
      <!-- Report Categories -->
      <div class="mb-8">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Available Reports</h2>
        
        <!-- Financial Reports -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-4">
            <i class="pi pi-dollar text-green-600 text-lg"></i>
            <h3 class="text-lg font-semibold text-gray-900">Financial Reports</h3>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button class="text-left p-4 border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors">
              <div class="font-medium text-gray-900">Daily Revenue Report</div>
              <div class="text-sm text-gray-600">Daily income breakdown</div>
            </button>
            <button class="text-left p-4 border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors">
              <div class="font-medium text-gray-900">Monthly P&L Statement</div>
              <div class="text-sm text-gray-600">Profit and loss analysis</div>
            </button>
            <button class="text-left p-4 border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors">
              <div class="font-medium text-gray-900">Tax Summary</div>
              <div class="text-sm text-gray-600">Tax calculations & reports</div>
            </button>
          </div>
        </div>

        <!-- Occupancy Reports -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-4">
            <i class="pi pi-home text-blue-600 text-lg"></i>
            <h3 class="text-lg font-semibold text-gray-900">Occupancy Reports</h3>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button class="text-left p-4 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <div class="font-medium text-gray-900">Occupancy Rate Trends</div>
              <div class="text-sm text-gray-600">Historical occupancy data</div>
            </button>
            <button class="text-left p-4 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <div class="font-medium text-gray-900">Room Type Performance</div>
              <div class="text-sm text-gray-600">Performance by room category</div>
            </button>
            <button class="text-left p-4 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <div class="font-medium text-gray-900">Seasonal Analysis</div>
              <div class="text-sm text-gray-600">Peak and off-season trends</div>
            </button>
          </div>
        </div>

        <!-- Guest Reports -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-4">
            <i class="pi pi-users text-purple-600 text-lg"></i>
            <h3 class="text-lg font-semibold text-gray-900">Guest Reports</h3>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button class="text-left p-4 border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors">
              <div class="font-medium text-gray-900">Guest Demographics</div>
              <div class="text-sm text-gray-600">Age, location, preferences</div>
            </button>
            <button class="text-left p-4 border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors">
              <div class="font-medium text-gray-900">Booking Sources</div>
              <div class="text-sm text-gray-600">Channel performance analysis</div>
            </button>
            <button class="text-left p-4 border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors">
              <div class="font-medium text-gray-900">Guest Satisfaction</div>
              <div class="text-sm text-gray-600">Reviews and feedback analysis</div>
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Stats Overview -->
      <div class="border-t border-gray-200 pt-6 mb-8">
        <div class="flex items-center gap-3 mb-6">
          <i class="pi pi-chart-bar text-orange-600 text-lg"></i>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Quick Statistics</h3>
            <p class="text-sm text-gray-600">Key metrics for {{ selectedDateRange === 'today' ? 'today' : selectedDateRange === 'this_week' ? 'this week' : 'this month' }}</p>
          </div>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">₱{{ totalRevenue.toLocaleString() }}</div>
            <div class="text-sm text-gray-600">Total Revenue</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">{{ occupancyRate }}%</div>
            <div class="text-sm text-gray-600">Occupancy Rate</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">{{ totalBookings }}</div>
            <div class="text-sm text-gray-600">Total Bookings</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">{{ avgDailyRate }}</div>
            <div class="text-sm text-gray-600">Avg Daily Rate</div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AdminLayout from './AdminLayout.vue'
import Searchbar from '@/components/Searchbar.vue'
import Custombutton from '@/components/Custombutton.vue'
import { useDashboardStats } from '@/composables/useDashboardStats'

const { bookingStats, revenueStats, occupancyStats, fetchStats } = useDashboardStats()

const showDateRangeDropdown = ref(false)
const selectedDateRange = ref('this_month')

const dateRangeOptions = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'this_week' },
  { label: 'This Month', value: 'this_month' }
]

// Use computed values from real API data
const totalRevenue = computed(() => {
  return revenueStats.value?.totalRevenue || 0
})

const occupancyRate = computed(() => {
  return occupancyStats.value?.occupancyRate || 0
})

const totalBookings = computed(() => {
  return bookingStats.value?.totalBookings || 0
})

const avgDailyRate = computed(() => {
  const revenue = revenueStats.value?.totalRevenue || 0
  const bookings = bookingStats.value?.totalBookings || 0
  return bookings > 0 ? Math.round(revenue / bookings) : 0
})

const handleReportSearch = (query: string) => {
  console.log('Searching reports:', query)
}

const handleDateRangeChange = () => {
  fetchStats(selectedDateRange.value)
}

const exportReport = () => {
  console.log('Exporting report for:', selectedDateRange.value)
}

onMounted(() => {
  fetchStats(selectedDateRange.value)
})
</script>
