<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900">Financial Dashboard</h3>
      <div class="flex items-center gap-2">
        <div class="relative bg-gray-50 outline outline-1 outline-gray-200 rounded-full text-xs text-gray-700 w-full">
          <select
            v-model="selectedPeriod"
            @change="handlePeriodChange"
            class="w-full bg-transparent border-none outline-none text-xs px-3 py-2 pr-8 appearance-none cursor-pointer"
          >
            <option value="all">All Time</option>
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="daily">Daily</option>
          </select>
          <i class="pi pi-chevron-down absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none"></i>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-8 text-gray-500">
      Loading financial data...
    </div>

    <div v-else-if="!revenueStats" class="text-center py-8 text-gray-500">
      <p>N/A - Revenue data not available</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Revenue Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-green-50 rounded-lg p-4 border border-green-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p class="text-2xl font-bold text-gray-900">
                ₱{{ revenueStats.totalRevenue?.toLocaleString() || '0' }}
              </p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <i class="pi pi-dollar text-green-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Average Booking Value</p>
              <p class="text-2xl font-bold text-gray-900">
                ₱{{ revenueStats.averageBookingValue?.toLocaleString() || '0' }}
              </p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <i class="pi pi-chart-line text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div class="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Total Reservations</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ revenueStats.totalReservations || '0' }}
              </p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <i class="pi pi-calendar text-purple-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Revenue Trend -->
      <div class="border-t border-gray-200 pt-4">
        <h4 class="text-sm font-semibold text-gray-700 mb-3">Revenue Trend</h4>
        <div v-if="revenueTrend.length === 0" class="text-center py-4 text-gray-500 text-sm">
          N/A - Trend data not available
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="(item, index) in revenueTrend.slice(0, 6)"
            :key="index"
            class="flex items-center justify-between p-2 bg-gray-50 rounded"
          >
            <span class="text-sm text-gray-600">{{ formatDate(item.date) }}</span>
            <span class="text-sm font-medium text-gray-900">₱{{ (item.revenue * 1000).toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <!-- Booking Source Breakdown -->
      <div v-if="bookingSources.length > 0" class="border-t border-gray-200 pt-4">
        <h4 class="text-sm font-semibold text-gray-700 mb-3">Revenue by Booking Source</h4>
        <div class="space-y-2">
          <div
            v-for="source in bookingSources"
            :key="source.source"
            class="flex items-center justify-between p-2 bg-gray-50 rounded"
          >
            <div class="flex-1">
              <span class="text-sm font-medium text-gray-900">{{ source.source }}</span>
              <span class="text-xs text-gray-500 ml-2">({{ source.count }} bookings, {{ source.percentage }}%)</span>
            </div>
            <span class="text-sm font-medium text-gray-900">
              ₱{{ calculateSourceRevenue(source).toLocaleString() }}
            </span>
          </div>
        </div>
      </div>

      <!-- Cash Flow Metrics -->
      <div class="border-t border-gray-200 pt-4">
        <h4 class="text-sm font-semibold text-gray-700 mb-3">Cash Flow Metrics</h4>
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-green-50 rounded p-3 border border-green-200">
            <p class="text-xs text-gray-600 mb-1">Total Revenue</p>
            <p class="text-lg font-bold text-gray-900">
              ₱{{ revenueStats.totalRevenue?.toLocaleString() || '0' }}
            </p>
          </div>
          <div class="bg-orange-50 rounded p-3 border border-orange-200">
            <p class="text-xs text-gray-600 mb-1">Outstanding Balance</p>
            <p class="text-lg font-bold text-gray-900">
              ₱{{ outstandingBalance.toLocaleString() }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { RevenueStats, RevenueTrend, BookingSourceStats } from '@/services/accounting'

interface Props {
  loading: boolean
  revenueStats: RevenueStats | null
  revenueTrend: RevenueTrend[]
  bookingSources?: BookingSourceStats[]
  outstandingBalance?: number
}

const props = withDefaults(defineProps<Props>(), {
  bookingSources: () => [],
  outstandingBalance: 0
})

const emit = defineEmits<{
  periodChange: [period: string]
}>()

const selectedPeriod = ref('all')

const handlePeriodChange = () => {
  emit('periodChange', selectedPeriod.value)
}

const calculateSourceRevenue = (source: BookingSourceStats): number => {
  if (!props.revenueStats || props.revenueStats.totalReservations === 0) return 0
  const avgRevenue = props.revenueStats.totalRevenue / props.revenueStats.totalReservations
  return Math.round(avgRevenue * source.count)
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return 'N/A'
  
  // Check if it's already a month abbreviation (3-letter month names)
  const monthAbbreviations = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  if (monthAbbreviations.includes(dateStr)) {
    // If it's just a month abbreviation, return it with current year
    return `${dateStr} ${new Date().getFullYear()}`
  }
  
  try {
    const date = new Date(dateStr)
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return dateStr // Return original string if invalid
    }
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}
</script>

