<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Financial Reports</h3>

    <div v-if="loading" class="text-center py-8 text-gray-500">
      Loading report data...
    </div>

    <div v-else class="space-y-6">
      <!-- Report Type Selection -->
      <div class="flex items-center gap-2 mb-4">
        <select
          v-model="selectedReport"
          class="text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="daily">Daily Revenue Report</option>
          <option value="monthly">Monthly P&L Statement</option>
          <option value="payment-summary">Payment Method Summary</option>
          <option value="booking-source">Booking Source Analysis</option>
        </select>
        <button
          @click="generateReport"
          class="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
        >
          Generate Report
        </button>
      </div>

      <!-- Daily Revenue Report -->
      <div v-if="selectedReport === 'daily' && dailyReport" class="border-t border-gray-200 pt-4">
        <h4 class="text-sm font-semibold text-gray-700 mb-3">Daily Revenue Report</h4>
        <div class="space-y-3">
          <div class="grid grid-cols-3 gap-3">
            <div class="bg-green-50 rounded p-3 border border-green-200">
              <p class="text-xs text-gray-600 mb-1">Today's Revenue</p>
              <p class="text-lg font-bold text-gray-900">₱{{ dailyReport.revenue.toLocaleString() }}</p>
            </div>
            <div class="bg-blue-50 rounded p-3 border border-blue-200">
              <p class="text-xs text-gray-600 mb-1">Reservations</p>
              <p class="text-lg font-bold text-gray-900">{{ dailyReport.reservations }}</p>
            </div>
            <div class="bg-purple-50 rounded p-3 border border-purple-200">
              <p class="text-xs text-gray-600 mb-1">Average Booking</p>
              <p class="text-lg font-bold text-gray-900">₱{{ dailyReport.averageBooking.toLocaleString() }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Monthly P&L Statement -->
      <div v-if="selectedReport === 'monthly' && monthlyReport" class="border-t border-gray-200 pt-4">
        <h4 class="text-sm font-semibold text-gray-700 mb-3">Monthly Profit & Loss Statement</h4>
        <div class="space-y-3">
          <div class="bg-green-50 rounded p-4 border border-green-200">
            <p class="text-sm font-semibold text-gray-700 mb-2">Revenue</p>
            <p class="text-2xl font-bold text-gray-900">₱{{ monthlyReport.revenue.toLocaleString() }}</p>
          </div>
          <div class="bg-red-50 rounded p-4 border border-red-200">
            <p class="text-sm font-semibold text-gray-700 mb-2">Expenses</p>
            <p class="text-2xl font-bold text-gray-900">₱{{ monthlyReport.expenses.toLocaleString() }}</p>
            <p class="text-xs text-gray-500 mt-1">N/A - Expense tracking not implemented</p>
          </div>
          <div class="bg-blue-50 rounded p-4 border border-blue-200">
            <p class="text-sm font-semibold text-gray-700 mb-2">Net Profit</p>
            <p class="text-2xl font-bold text-gray-900">₱{{ monthlyReport.netProfit.toLocaleString() }}</p>
          </div>
        </div>
      </div>

      <!-- Payment Method Summary -->
      <div v-if="selectedReport === 'payment-summary' && paymentSummary" class="border-t border-gray-200 pt-4">
        <h4 class="text-sm font-semibold text-gray-700 mb-3">Payment Method Summary</h4>
        <div class="space-y-2">
          <div
            v-for="method in paymentSummary.methods"
            :key="method.method"
            class="flex items-center justify-between p-3 bg-gray-50 rounded"
          >
            <span class="text-sm font-medium text-gray-900 capitalize">{{ formatPaymentMethod(method.method) }}</span>
            <div class="text-right">
              <p class="text-sm font-bold text-gray-900">₱{{ method.amount.toLocaleString() }}</p>
              <p class="text-xs text-gray-500">{{ method.count }} payments</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Booking Source Analysis -->
      <div v-if="selectedReport === 'booking-source' && bookingSourceReport" class="border-t border-gray-200 pt-4">
        <h4 class="text-sm font-semibold text-gray-700 mb-3">Booking Source Analysis</h4>
        <div class="space-y-2">
          <div
            v-for="source in bookingSourceReport.sources"
            :key="source.source"
            class="flex items-center justify-between p-3 bg-gray-50 rounded"
          >
            <div class="flex-1">
              <span class="text-sm font-medium text-gray-900">{{ source.source }}</span>
              <span class="text-xs text-gray-500 ml-2">({{ source.count }} bookings)</span>
            </div>
            <div class="text-right">
              <p class="text-sm font-bold text-gray-900">₱{{ source.revenue.toLocaleString() }}</p>
              <p class="text-xs text-gray-500">{{ source.percentage }}%</p>
            </div>
          </div>
        </div>
      </div>

      <!-- No Report Generated -->
      <div v-if="!currentReport" class="text-center py-8 text-gray-500">
        <p>Select a report type and click "Generate Report" to view</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Payment, Reservation, BookingSourceStats } from '@/services/accounting'

interface Props {
  loading: boolean
  payments: Payment[]
  reservations: Reservation[]
  bookingSources: BookingSourceStats[]
  revenueStats: { totalRevenue: number; totalReservations: number; averageBookingValue: number } | null
}

const props = defineProps<Props>()

const selectedReport = ref('daily')
const currentReport = ref<any>(null)

const dailyReport = computed(() => {
  if (selectedReport.value !== 'daily' || !props.revenueStats) return null
  
  // For now, using overall stats as daily (would need date filtering in real implementation)
  return {
    revenue: props.revenueStats.totalRevenue,
    reservations: props.revenueStats.totalReservations,
    averageBooking: props.revenueStats.averageBookingValue
  }
})

const monthlyReport = computed(() => {
  if (selectedReport.value !== 'monthly' || !props.revenueStats) return null
  
  return {
    revenue: props.revenueStats.totalRevenue,
    expenses: 0, // N/A - not implemented
    netProfit: props.revenueStats.totalRevenue
  }
})

const paymentSummary = computed(() => {
  if (selectedReport.value !== 'payment-summary' || props.payments.length === 0) return null
  
  const methodMap: Record<string, { count: number; amount: number }> = {}
  
  props.payments
    .filter(p => p.status === 'completed')
    .forEach(payment => {
      const method = payment.paymentMethod
      if (!methodMap[method]) {
        methodMap[method] = { count: 0, amount: 0 }
      }
      methodMap[method].count++
      methodMap[method].amount += parseFloat(payment.amount.toString())
    })

  return {
    methods: Object.entries(methodMap).map(([method, data]) => ({
      method,
      count: data.count,
      amount: Math.round(data.amount)
    })).sort((a, b) => b.amount - a.amount)
  }
})

const bookingSourceReport = computed(() => {
  if (selectedReport.value !== 'booking-source' || props.bookingSources.length === 0) return null
  
  const totalRevenue = props.revenueStats?.totalRevenue || 0
  const totalReservations = props.revenueStats?.totalReservations || 0
  const avgRevenue = totalReservations > 0 ? totalRevenue / totalReservations : 0

  return {
    sources: props.bookingSources.map(source => ({
      source: source.source,
      count: source.count,
      revenue: Math.round(avgRevenue * source.count),
      percentage: source.percentage
    })).sort((a, b) => b.revenue - a.revenue)
  }
})

const generateReport = () => {
  currentReport.value = {
    daily: dailyReport.value,
    monthly: monthlyReport.value,
    'payment-summary': paymentSummary.value,
    'booking-source': bookingSourceReport.value
  }[selectedReport.value]
}

const formatPaymentMethod = (method: string): string => {
  const methodMap: Record<string, string> = {
    'cash': 'Cash',
    'credit_card': 'Credit Card',
    'debit_card': 'Debit Card',
    'bank_transfer': 'Bank Transfer',
    'check': 'Check',
    'digital_wallet': 'Digital Wallet',
    'other': 'Other'
  }
  return methodMap[method] || method
}
</script>

