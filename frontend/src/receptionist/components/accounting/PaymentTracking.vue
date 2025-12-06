<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900">Payment Tracking</h3>
      <button
        @click="refreshPayments"
        class="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1"
      >
        <i class="pi pi-refresh text-xs"></i>
        Refresh
      </button>
    </div>

    <div v-if="loading" class="text-center py-8 text-gray-500">
      Loading payments...
    </div>

    <div v-else-if="payments.length === 0" class="text-center py-8">
      <p class="text-gray-500 mb-2">N/A - No payment data available</p>
      <p class="text-xs text-gray-400">Payments will appear here once recorded</p>
    </div>

    <div v-else class="space-y-3">
      <!-- Payment Summary -->
      <div class="grid grid-cols-2 gap-3 mb-4">
        <div class="bg-green-50 rounded p-3 border border-green-200">
          <p class="text-xs text-gray-600 mb-1">Total Payments</p>
          <p class="text-lg font-bold text-gray-900">{{ payments.length }}</p>
        </div>
        <div class="bg-blue-50 rounded p-3 border border-blue-200">
          <p class="text-xs text-gray-600 mb-1">Total Amount</p>
          <p class="text-lg font-bold text-gray-900">
            ₱{{ totalPaymentAmount.toLocaleString() }}
          </p>
        </div>
      </div>

      <!-- Payment Method Breakdown -->
      <div class="mb-4">
        <h4 class="text-sm font-semibold text-gray-700 mb-2">By Payment Method</h4>
        <div class="space-y-1">
          <div
            v-for="(count, method) in paymentMethodBreakdown"
            :key="method"
            class="flex items-center justify-between text-sm"
          >
            <span class="text-gray-600 capitalize">{{ formatPaymentMethod(method) }}</span>
            <span class="font-medium text-gray-900">{{ count }}</span>
          </div>
        </div>
      </div>

      <!-- Recent Payments -->
      <div>
        <h4 class="text-sm font-semibold text-gray-700 mb-2">Recent Payments</h4>
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div
            v-for="payment in recentPayments"
            :key="payment.id"
            class="p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-medium text-gray-900">
                {{ payment.paymentNumber }}
              </span>
              <span
                class="text-xs px-2 py-0.5 rounded-full"
                :class="getStatusClass(payment.status)"
              >
                {{ payment.status }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-600">
                {{ formatPaymentMethod(payment.paymentMethod) }}
              </span>
              <span class="text-sm font-semibold text-gray-900">
                ₱{{ parseFloat(payment.amount.toString()).toLocaleString() }}
              </span>
            </div>
            <div class="text-xs text-gray-500 mt-1">
              {{ formatDate(payment.paymentDate || payment.createdAt) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Payment } from '@/services/accounting'

interface Props {
  loading: boolean
  payments: Payment[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  refresh: []
}>()

const totalPaymentAmount = computed(() => {
  return props.payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0)
})

const paymentMethodBreakdown = computed(() => {
  const breakdown: Record<string, number> = {}
  props.payments.forEach(payment => {
    const method = payment.paymentMethod
    breakdown[method] = (breakdown[method] || 0) + 1
  })
  return breakdown
})

const recentPayments = computed(() => {
  return [...props.payments]
    .sort((a, b) => {
      const dateA = new Date(a.paymentDate || a.createdAt).getTime()
      const dateB = new Date(b.paymentDate || b.createdAt).getTime()
      return dateB - dateA
    })
    .slice(0, 5)
})

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

const getStatusClass = (status: string): string => {
  const statusMap: Record<string, string> = {
    'completed': 'bg-green-100 text-green-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'failed': 'bg-red-100 text-red-800',
    'refunded': 'bg-blue-100 text-blue-800',
    'cancelled': 'bg-gray-100 text-gray-800'
  }
  return statusMap[status] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}

const refreshPayments = () => {
  emit('refresh')
}
</script>

