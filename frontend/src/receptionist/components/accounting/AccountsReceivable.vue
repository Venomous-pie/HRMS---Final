<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Accounts Receivable</h3>

    <div v-if="loading" class="text-center py-8 text-gray-500">
      Loading accounts receivable data...
    </div>

    <div v-else-if="!invoices || invoices.length === 0" class="text-center py-8">
      <p class="text-gray-500 mb-2">N/A - No invoice data available</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Total Outstanding</p>
              <p class="text-2xl font-bold text-gray-900">
                ₱{{ totalOutstanding.toLocaleString() }}
              </p>
            </div>
            <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <i class="pi pi-exclamation-triangle text-orange-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div class="bg-red-50 rounded-lg p-4 border border-red-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Overdue Invoices</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ overdueCount }}
              </p>
            </div>
            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <i class="pi pi-clock text-red-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div class="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Partial Payments</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ partialPaymentCount }}
              </p>
            </div>
            <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <i class="pi pi-wallet text-yellow-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Aging Analysis -->
      <div class="border-t border-gray-200 pt-4">
        <h4 class="text-sm font-semibold text-gray-700 mb-3">Aging Analysis</h4>
        <div class="space-y-2">
          <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span class="text-sm text-gray-600">0-30 days</span>
            <span class="text-sm font-medium text-gray-900">₱{{ agingAnalysis['0-30'].toLocaleString() }}</span>
          </div>
          <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span class="text-sm text-gray-600">31-60 days</span>
            <span class="text-sm font-medium text-gray-900">₱{{ agingAnalysis['31-60'].toLocaleString() }}</span>
          </div>
          <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span class="text-sm text-gray-600">61-90 days</span>
            <span class="text-sm font-medium text-gray-900">₱{{ agingAnalysis['61-90'].toLocaleString() }}</span>
          </div>
          <div class="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200">
            <span class="text-sm text-gray-600">Over 90 days</span>
            <span class="text-sm font-medium text-red-700">₱{{ agingAnalysis['90+'].toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <!-- Outstanding Invoices -->
      <div class="border-t border-gray-200 pt-4">
        <h4 class="text-sm font-semibold text-gray-700 mb-3">Outstanding Invoices</h4>
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div
            v-for="invoice in outstandingInvoices"
            :key="invoice.id"
            class="p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-medium text-gray-900">
                {{ invoice.invoiceNumber }}
              </span>
              <span
                class="text-xs px-2 py-0.5 rounded-full"
                :class="getAgingClass(invoice.dueDate)"
              >
                {{ getAgingLabel(invoice.dueDate) }}
              </span>
            </div>
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs text-gray-600">
                Guest: {{ invoice.Guest ? `${invoice.Guest.firstName} ${invoice.Guest.lastName}` : 'N/A' }}
              </span>
              <span class="text-sm font-semibold text-orange-600">
                ₱{{ parseFloat(invoice.balanceAmount?.toString() || '0').toLocaleString() }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500">
                Due: {{ formatDate(invoice.dueDate) }}
              </span>
              <span class="text-xs text-gray-500">
                Total: ₱{{ parseFloat(invoice.totalAmount.toString()).toLocaleString() }}
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

const totalOutstanding = computed(() => {
  return props.invoices
    .filter(inv => inv.paymentStatus !== 'paid' && inv.status !== 'cancelled')
    .reduce((sum, inv) => {
      const balance = parseFloat(inv.balanceAmount?.toString() || '0')
      return sum + balance
    }, 0)
})

const overdueCount = computed(() => {
  const today = new Date()
  return props.invoices.filter(inv => {
    if (inv.paymentStatus === 'paid' || inv.status === 'cancelled') return false
    const dueDate = new Date(inv.dueDate)
    return dueDate < today
  }).length
})

const partialPaymentCount = computed(() => {
  return props.invoices.filter(inv => inv.paymentStatus === 'partial').length
})

const outstandingInvoices = computed(() => {
  return props.invoices
    .filter(inv => inv.paymentStatus !== 'paid' && inv.status !== 'cancelled')
    .sort((a, b) => {
      const dateA = new Date(a.dueDate).getTime()
      const dateB = new Date(b.dueDate).getTime()
      return dateA - dateB
    })
    .slice(0, 10)
})

const agingAnalysis = computed(() => {
  const today = new Date()
  const aging: Record<string, number> = {
    '0-30': 0,
    '31-60': 0,
    '61-90': 0,
    '90+': 0
  }

  props.invoices
    .filter(inv => inv.paymentStatus !== 'paid' && inv.status !== 'cancelled')
    .forEach(inv => {
      const dueDate = new Date(inv.dueDate)
      const daysPastDue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
      const balance = parseFloat(inv.balanceAmount?.toString() || '0')

      if (daysPastDue <= 30) {
        aging['0-30'] += balance
      } else if (daysPastDue <= 60) {
        aging['31-60'] += balance
      } else if (daysPastDue <= 90) {
        aging['61-90'] += balance
      } else {
        aging['90+'] += balance
      }
    })

  return aging
})

const getAgingLabel = (dueDate: string): string => {
  const today = new Date()
  const due = new Date(dueDate)
  const daysPastDue = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysPastDue < 0) return 'Not Due'
  if (daysPastDue <= 30) return '0-30 days'
  if (daysPastDue <= 60) return '31-60 days'
  if (daysPastDue <= 90) return '61-90 days'
  return 'Over 90 days'
}

const getAgingClass = (dueDate: string): string => {
  const today = new Date()
  const due = new Date(dueDate)
  const daysPastDue = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysPastDue < 0) return 'bg-green-100 text-green-800'
  if (daysPastDue <= 30) return 'bg-yellow-100 text-yellow-800'
  if (daysPastDue <= 60) return 'bg-orange-100 text-orange-800'
  return 'bg-red-100 text-red-800'
}

const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}
</script>

