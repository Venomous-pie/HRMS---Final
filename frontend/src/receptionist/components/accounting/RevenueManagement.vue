<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Revenue Management</h3>

    <div v-if="loading" class="text-center py-8 text-gray-500">
      Loading revenue data...
    </div>

    <div v-else-if="!reservations || reservations.length === 0" class="text-center py-8">
      <p class="text-gray-500 mb-2">N/A - No reservation data available</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Revenue Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Room Revenue</p>
              <p class="text-2xl font-bold text-gray-900">
                ₱{{ roomRevenue.toLocaleString() }}
              </p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <i class="pi pi-home text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div class="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Average Daily Rate (ADR)</p>
              <p class="text-2xl font-bold text-gray-900">
                ₱{{ adr.toLocaleString() }}
              </p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <i class="pi pi-chart-bar text-purple-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div class="bg-green-50 rounded-lg p-4 border border-green-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Service Revenue</p>
              <p class="text-2xl font-bold text-gray-900">
                ₱{{ serviceRevenue.toLocaleString() }}
              </p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <i class="pi pi-shopping-cart text-green-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Revenue by Booking Source -->
      <div v-if="revenueBySource.length > 0" class="border-t border-gray-200 pt-4">
        <h4 class="text-sm font-semibold text-gray-700 mb-3">Revenue by Booking Source</h4>
        <div class="space-y-2">
          <div
            v-for="item in revenueBySource"
            :key="item.source"
            class="flex items-center justify-between p-3 bg-gray-50 rounded"
          >
            <div class="flex-1">
              <span class="text-sm font-medium text-gray-900">{{ item.source }}</span>
              <span class="text-xs text-gray-500 ml-2">({{ item.count }} reservations)</span>
            </div>
            <div class="text-right">
              <p class="text-sm font-bold text-gray-900">₱{{ item.revenue.toLocaleString() }}</p>
              <p class="text-xs text-gray-500">{{ item.percentage }}%</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Revenue by Room Type (if available) -->
      <div class="border-t border-gray-200 pt-4">
        <h4 class="text-sm font-semibold text-gray-700 mb-3">Revenue Metrics</h4>
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-gray-50 rounded p-3">
            <p class="text-xs text-gray-600 mb-1">Total Room Nights</p>
            <p class="text-lg font-bold text-gray-900">{{ totalRoomNights }}</p>
          </div>
          <div class="bg-gray-50 rounded p-3">
            <p class="text-xs text-gray-600 mb-1">Average Booking Value</p>
            <p class="text-lg font-bold text-gray-900">₱{{ averageBookingValue.toLocaleString() }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Reservation } from '@/services/accounting'

interface Props {
  loading: boolean
  reservations: Reservation[]
}

const props = defineProps<Props>()

const roomRevenue = computed(() => {
  return props.reservations
    .filter(r => ['confirmed', 'checkedIn', 'checkedOut'].includes(r.status))
    .reduce((sum, r) => sum + (r.amount || 0), 0)
})

const serviceRevenue = computed(() => {
  // Service revenue would come from orders/room service
  // For now, showing N/A or 0 since we don't have this data
  return 0
})

const totalRoomNights = computed(() => {
  return props.reservations
    .filter(r => ['confirmed', 'checkedIn', 'checkedOut'].includes(r.status))
    .reduce((sum, r) => {
      try {
        const checkIn = new Date(r.checkIn)
        const checkOut = new Date(r.checkOut)
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
        return sum + (nights > 0 ? nights : 1)
      } catch {
        return sum + 1
      }
    }, 0)
})

const adr = computed(() => {
  const nights = totalRoomNights.value
  if (nights === 0) return 0
  return Math.round(roomRevenue.value / nights)
})

const averageBookingValue = computed(() => {
  const validReservations = props.reservations.filter(r => 
    ['confirmed', 'checkedIn', 'checkedOut'].includes(r.status) && r.amount > 0
  )
  if (validReservations.length === 0) return 0
  const total = validReservations.reduce((sum, r) => sum + r.amount, 0)
  return Math.round(total / validReservations.length)
})

const revenueBySource = computed(() => {
  const sourceMap: Record<string, { count: number; revenue: number }> = {}
  
  props.reservations
    .filter(r => ['confirmed', 'checkedIn', 'checkedOut'].includes(r.status))
    .forEach(reservation => {
      const source = reservation.source || 'Direct'
      if (!sourceMap[source]) {
        sourceMap[source] = { count: 0, revenue: 0 }
      }
      sourceMap[source].count++
      sourceMap[source].revenue += reservation.amount || 0
    })

  const totalRevenue = Object.values(sourceMap).reduce((sum, item) => sum + item.revenue, 0)
  
  return Object.entries(sourceMap)
    .map(([source, data]) => ({
      source,
      count: data.count,
      revenue: Math.round(data.revenue),
      percentage: totalRevenue > 0 ? Math.round((data.revenue / totalRevenue) * 100) : 0
    }))
    .sort((a, b) => b.revenue - a.revenue)
})
</script>

