<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900">Invoice Management</h3>
      <button
        @click="refreshInvoices"
        class="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1"
      >
        <i class="pi pi-refresh text-xs"></i>
        Refresh
      </button>
    </div>

    <div v-if="loading" class="text-center py-8 text-gray-500">
      Loading invoices...
    </div>

    <div v-else-if="invoices.length === 0" class="text-center py-8">
      <p class="text-gray-500 mb-2">N/A - No invoice data available</p>
      <p class="text-xs text-gray-400">Invoices will appear here once created</p>
    </div>

    <div v-else class="space-y-3">
      <!-- Invoice Summary -->
      <div class="grid grid-cols-2 gap-3 mb-4">
        <div class="bg-purple-50 rounded p-3 border border-purple-200">
          <p class="text-xs text-gray-600 mb-1">Total Invoices</p>
          <p class="text-lg font-bold text-gray-900">{{ invoices.length }}</p>
        </div>
        <div class="bg-orange-50 rounded p-3 border border-orange-200">
          <p class="text-xs text-gray-600 mb-1">Outstanding</p>
          <p class="text-lg font-bold text-gray-900">
            ₱{{ totalOutstanding.toLocaleString() }}
          </p>
        </div>
      </div>

      <!-- Invoice Status Breakdown -->
      <div class="mb-4">
        <h4 class="text-sm font-semibold text-gray-700 mb-2">By Status</h4>
        <div class="space-y-1">
          <div
            v-for="(count, status) in invoiceStatusBreakdown"
            :key="status"
            class="flex items-center justify-between text-sm"
          >
            <span class="text-gray-600 capitalize">{{ status }}</span>
            <span class="font-medium text-gray-900">{{ count }}</span>
          </div>
        </div>
      </div>

      <!-- Recent Invoices -->
      <div>
        <h4 class="text-sm font-semibold text-gray-700 mb-2">Recent Invoices</h4>
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div
            v-for="invoice in recentInvoices"
            :key="invoice.id"
            class="p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-medium text-gray-900">
                {{ invoice.invoiceNumber }}
              </span>
              <span
                class="text-xs px-2 py-0.5 rounded-full"
                :class="getStatusClass(invoice.status)"
              >
                {{ invoice.status }}
              </span>
            </div>
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs text-gray-600">
                Total: ₱{{ parseFloat(invoice.totalAmount.toString()).toLocaleString() }}
              </span>
              <span
                v-if="invoice.balanceAmount > 0"
                class="text-xs font-semibold text-orange-600"
              >
                Balance: ₱{{ parseFloat(invoice.balanceAmount.toString()).toLocaleString() }}
              </span>
              <span v-else class="text-xs font-semibold text-green-600">
                Paid
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500">
                Due: {{ formatDate(invoice.dueDate) }}
              </span>
              <span class="text-xs text-gray-500">
                {{ formatDate(invoice.issueDate) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Invoice } from '@/services/accounting'

interface Props {
  loading: boolean
  invoices: Invoice[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  refresh: []
}>()

const totalOutstanding = computed(() => {
  return props.invoices
    .filter(inv => inv.paymentStatus !== 'paid' && inv.status !== 'cancelled')
    .reduce((sum, inv) => {
      const balance = parseFloat(inv.balanceAmount?.toString() || '0')
      return sum + balance
    }, 0)
})

const invoiceStatusBreakdown = computed(() => {
  const breakdown: Record<string, number> = {}
  props.invoices.forEach(invoice => {
    const status = invoice.status
    breakdown[status] = (breakdown[status] || 0) + 1
  })
  return breakdown
})

const recentInvoices = computed(() => {
  return [...props.invoices]
    .sort((a, b) => {
      const dateA = new Date(a.issueDate).getTime()
      const dateB = new Date(b.issueDate).getTime()
      return dateB - dateA
    })
    .slice(0, 5)
})

const getStatusClass = (status: string): string => {
  const statusMap: Record<string, string> = {
    'paid': 'bg-green-100 text-green-800',
    'sent': 'bg-blue-100 text-blue-800',
    'overdue': 'bg-red-100 text-red-800',
    'draft': 'bg-gray-100 text-gray-800',
    'cancelled': 'bg-gray-100 text-gray-800',
    'refunded': 'bg-purple-100 text-purple-800'
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

const refreshInvoices = () => {
  emit('refresh')
}
</script>

