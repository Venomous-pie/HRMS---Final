<template>
  <div class="px-6">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="font-bold text-gray-700">Cashbooks</h2>
        <p class="text-gray-600 text-sm mt-1">Manage cash flow and daily transactions</p>
      </div>
      <div class="flex items-center gap-2">
        <Custombutton label="Cash In" :hover="true" @click="handleCashIn" />
        <Custombutton label="Cash Out" :hover="true" @click="handleCashOut" />
      </div>
    </div>

    <!-- Daily Cash Register Summary -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Daily Cash Register</h3>
        <div class="flex items-center gap-2">
          <input
            v-model="selectedDate"
            type="date"
            @change="fetchDailyCashRegister"
            class="text-xs px-3 py-1.5 bg-gray-50 outline outline-1 outline-gray-200 rounded-full"
          />
          <button
            @click="fetchDailyCashRegister"
            class="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1 px-3 py-1.5 bg-gray-50 outline outline-1 outline-gray-200 rounded-full hover:bg-gray-100"
          >
            <i class="pi pi-refresh text-xs"></i>
            Refresh
          </button>
        </div>
      </div>

      <div v-if="cashRegisterLoading" class="text-center py-8 text-gray-500">
        Loading cash register data...
      </div>

      <div v-else-if="!dailyCashRegister" class="text-center py-8">
        <p class="text-gray-500 mb-2">No cash register data for selected date</p>
        <p class="text-xs text-gray-400">Try selecting a different date or check if there are any cash payments recorded</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-green-50 rounded-lg p-4 border border-green-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-gray-600 mb-1">Opening Balance</p>
              <p class="text-2xl font-bold text-gray-900">
                ₱{{ (dailyCashRegister?.openingBalance || 0).toLocaleString() }}
              </p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <i class="pi pi-wallet text-green-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-gray-600 mb-1">Cash In</p>
              <p class="text-2xl font-bold text-gray-900">
                ₱{{ (dailyCashRegister?.cashIn || 0).toLocaleString() }}
              </p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <i class="pi pi-arrow-down text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div class="bg-red-50 rounded-lg p-4 border border-red-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-gray-600 mb-1">Cash Out</p>
              <p class="text-2xl font-bold text-gray-900">
                ₱{{ (dailyCashRegister?.cashOut || 0).toLocaleString() }}
              </p>
            </div>
            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <i class="pi pi-arrow-up text-red-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div class="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-gray-600 mb-1">Closing Balance</p>
              <p class="text-2xl font-bold text-gray-900">
                ₱{{ (dailyCashRegister?.closingBalance || 0).toLocaleString() }}
              </p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <i class="pi pi-calculator text-purple-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Cash In Transactions -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Cash In Transactions</h3>
          <button
            @click="fetchCashTransactions"
            class="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1"
          >
            <i class="pi pi-refresh text-xs"></i>
            Refresh
          </button>
        </div>

        <div v-if="cashTransactionsLoading" class="text-center py-8 text-gray-500">
          Loading transactions...
        </div>

        <div v-else-if="cashInTransactions.length === 0" class="text-center py-8">
          <p class="text-gray-500 mb-2">No cash in transactions for selected date</p>
          <p class="text-xs text-gray-400">Cash payments made on this date will appear here. Try selecting a different date.</p>
        </div>

        <div v-else class="space-y-2 max-h-96 overflow-y-auto">
          <div
            v-for="(transaction, index) in cashInTransactions"
            :key="transaction.id || index"
            class="p-3 bg-green-50 rounded border border-green-200 hover:bg-green-100 transition-colors"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium text-gray-900">{{ transaction.description || 'Cash In' }}</span>
              <span class="text-sm font-bold text-green-700">
                +₱{{ parseFloat(transaction.amount.toString()).toLocaleString() }}
              </span>
            </div>
            <div class="flex items-center justify-between text-xs text-gray-600">
              <span>{{ formatDate(transaction.transactionDate || transaction.createdAt) }}</span>
              <span class="capitalize">{{ transaction.category || 'Payment' }}</span>
            </div>
            <div v-if="transaction.notes" class="text-xs text-gray-500 mt-1">
              {{ transaction.notes }}
            </div>
          </div>
        </div>
      </div>

      <!-- Cash Out Transactions -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Cash Out Transactions</h3>
          <button
            @click="fetchCashTransactions"
            class="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1"
          >
            <i class="pi pi-refresh text-xs"></i>
            Refresh
          </button>
        </div>

        <div v-if="cashTransactionsLoading" class="text-center py-8 text-gray-500">
          Loading transactions...
        </div>

        <div v-else-if="cashOutTransactions.length === 0" class="text-center py-8">
          <p class="text-gray-500 mb-2">No cash out transactions for selected date</p>
          <p class="text-xs text-gray-400">Cash refunds made on this date will appear here. Try selecting a different date.</p>
        </div>

        <div v-else class="space-y-2 max-h-96 overflow-y-auto">
          <div
            v-for="(transaction, index) in cashOutTransactions"
            :key="transaction.id || index"
            class="p-3 bg-red-50 rounded border border-red-200 hover:bg-red-100 transition-colors"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium text-gray-900">{{ transaction.description || 'Cash Out' }}</span>
              <span class="text-sm font-bold text-red-700">
                -₱{{ parseFloat(transaction.amount.toString()).toLocaleString() }}
              </span>
            </div>
            <div class="flex items-center justify-between text-xs text-gray-600">
              <span>{{ formatDate(transaction.transactionDate || transaction.createdAt) }}</span>
              <span class="capitalize">{{ transaction.category || 'Expense' }}</span>
            </div>
            <div v-if="transaction.notes" class="text-xs text-gray-500 mt-1">
              {{ transaction.notes }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Petty Cash Management -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Petty Cash</h3>
          <button
            @click="handlePettyCash"
            class="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1 px-3 py-1.5 bg-gray-50 outline outline-1 outline-gray-200 rounded-full hover:bg-gray-100"
          >
            <i class="pi pi-plus text-xs"></i>
            Manage
          </button>
        </div>

        <div v-if="pettyCashLoading" class="text-center py-8 text-gray-500">
          Loading petty cash data...
        </div>

        <div v-else-if="!pettyCashData" class="text-center py-8">
          <p class="text-gray-500 mb-2">N/A - Petty cash data not available</p>
          <p class="text-xs text-gray-400">Petty cash management will be available soon</p>
        </div>

        <div v-else class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-amber-50 rounded p-3 border border-amber-200">
              <p class="text-xs text-gray-600 mb-1">Allocated</p>
              <p class="text-lg font-bold text-gray-900">
                ₱{{ pettyCashData.allocated?.toLocaleString() || '0' }}
              </p>
            </div>
            <div class="bg-orange-50 rounded p-3 border border-orange-200">
              <p class="text-xs text-gray-600 mb-1">Used</p>
              <p class="text-lg font-bold text-gray-900">
                ₱{{ pettyCashData.used?.toLocaleString() || '0' }}
              </p>
            </div>
          </div>
          <div class="bg-blue-50 rounded p-3 border border-blue-200">
            <p class="text-xs text-gray-600 mb-1">Available Balance</p>
            <p class="text-xl font-bold text-gray-900">
              ₱{{ pettyCashData.available?.toLocaleString() || '0' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Shift Handover -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Shift Handover</h3>
          <button
            @click="handleShiftHandover"
            class="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1 px-3 py-1.5 bg-gray-50 outline outline-1 outline-gray-200 rounded-full hover:bg-gray-100"
          >
            <i class="pi pi-exchange text-xs"></i>
            Handover
          </button>
        </div>

        <div v-if="shiftHandoverLoading" class="text-center py-8 text-gray-500">
          Loading shift handover data...
        </div>

        <div v-else-if="shiftHandovers.length === 0" class="text-center py-8">
          <p class="text-gray-500 mb-2">No shift handover records</p>
          <p class="text-xs text-gray-400">Shift handover records will appear here</p>
        </div>

        <div v-else class="space-y-2 max-h-96 overflow-y-auto">
          <div
            v-for="(handover, index) in shiftHandovers"
            :key="handover.id || index"
            class="p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium text-gray-900">
                {{ handover.shiftFrom }} → {{ handover.shiftTo }}
              </span>
              <span
                class="text-xs px-2 py-0.5 rounded-full"
                :class="getHandoverStatusClass(handover.status)"
              >
                {{ handover.status }}
              </span>
            </div>
            <div class="text-xs text-gray-600 mb-1">
              Cash Handed Over: ₱{{ parseFloat(handover.cashAmount?.toString() || '0').toLocaleString() }}
            </div>
            <div class="text-xs text-gray-500">
              {{ formatDate(handover.handoverDate || handover.createdAt) }}
            </div>
            <div v-if="handover.notes" class="text-xs text-gray-500 mt-1">
              {{ handover.notes }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cash Reconciliation -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Cash Reconciliation</h3>
        <button
          @click="handleReconciliation"
          class="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1 px-3 py-1.5 bg-gray-50 outline outline-1 outline-gray-200 rounded-full hover:bg-gray-100"
        >
          <i class="pi pi-check-circle text-xs"></i>
          Reconcile
        </button>
      </div>

      <div v-if="reconciliationLoading" class="text-center py-8 text-gray-500">
        Loading reconciliation data...
      </div>

      <div v-else-if="!reconciliationData" class="text-center py-8">
        <p class="text-gray-500 mb-2">N/A - Reconciliation data not available</p>
        <p class="text-xs text-gray-400">Cash reconciliation will be available soon</p>
      </div>

      <div v-else class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-green-50 rounded p-4 border border-green-200">
            <p class="text-xs text-gray-600 mb-1">Expected Cash</p>
            <p class="text-xl font-bold text-gray-900">
              ₱{{ reconciliationData.expectedCash?.toLocaleString() || '0' }}
            </p>
          </div>
          <div class="bg-blue-50 rounded p-4 border border-blue-200">
            <p class="text-xs text-gray-600 mb-1">Actual Cash</p>
            <p class="text-xl font-bold text-gray-900">
              ₱{{ reconciliationData.actualCash?.toLocaleString() || '0' }}
            </p>
          </div>
          <div
            class="rounded p-4 border"
            :class="
              reconciliationData.variance >= 0
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            "
          >
            <p class="text-xs text-gray-600 mb-1">Variance</p>
            <p
              class="text-xl font-bold"
              :class="reconciliationData.variance >= 0 ? 'text-green-700' : 'text-red-700'"
            >
              {{ reconciliationData.variance >= 0 ? '+' : '' }}₱{{
                Math.abs(reconciliationData.variance || 0).toLocaleString()
              }}
            </p>
          </div>
        </div>

        <div v-if="reconciliationData.discrepancies && reconciliationData.discrepancies.length > 0" class="mt-4">
          <h4 class="text-sm font-semibold text-gray-700 mb-2">Discrepancies</h4>
          <div class="space-y-2">
            <div
              v-for="(discrepancy, index) in reconciliationData.discrepancies"
              :key="index"
              class="p-2 bg-yellow-50 rounded border border-yellow-200 text-sm text-gray-700"
            >
              {{ discrepancy }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Custombutton from '@/components/Custombutton.vue'
import { cashbookService } from '@/services/cashbook'
import type { CashTransaction, DailyCashRegister, PettyCash, ShiftHandover, Reconciliation } from '@/services/cashbook'

const selectedDate = ref(new Date().toISOString().split('T')[0])

const cashRegisterLoading = ref(false)
const cashTransactionsLoading = ref(false)
const pettyCashLoading = ref(false)
const shiftHandoverLoading = ref(false)
const reconciliationLoading = ref(false)

const dailyCashRegister = ref<DailyCashRegister | null>(null)
const cashTransactions = ref<CashTransaction[]>([])
const pettyCashData = ref<PettyCash | null>(null)
const shiftHandovers = ref<ShiftHandover[]>([])
const reconciliationData = ref<Reconciliation | null>(null)

const cashInTransactions = computed(() => {
  return cashTransactions.value.filter((t: CashTransaction) => t.type === 'in')
})

const cashOutTransactions = computed(() => {
  return cashTransactions.value.filter((t: CashTransaction) => t.type === 'out')
})

const fetchDailyCashRegister = async () => {
  cashRegisterLoading.value = true
  try {
    const data = await cashbookService.getDailyCashRegister(selectedDate.value)
    dailyCashRegister.value = data
  } catch (error) {
    console.error('Error fetching daily cash register:', error)
    // Service returns default object on error, so we should still have data
    // But set to null if we want to show error state
    dailyCashRegister.value = null
  } finally {
    cashRegisterLoading.value = false
  }
}

const fetchCashTransactions = async () => {
  cashTransactionsLoading.value = true
  try {
    const data = await cashbookService.getCashTransactions(selectedDate.value)
    cashTransactions.value = data
  } catch (error) {
    console.error('Error fetching cash transactions:', error)
    cashTransactions.value = []
  } finally {
    cashTransactionsLoading.value = false
  }
}

const fetchPettyCash = async () => {
  pettyCashLoading.value = true
  try {
    const data = await cashbookService.getPettyCash()
    pettyCashData.value = data
  } catch (error) {
    console.error('Error fetching petty cash:', error)
    pettyCashData.value = null
  } finally {
    pettyCashLoading.value = false
  }
}

const fetchShiftHandovers = async () => {
  shiftHandoverLoading.value = true
  try {
    const data = await cashbookService.getShiftHandovers()
    shiftHandovers.value = data
  } catch (error) {
    console.error('Error fetching shift handovers:', error)
    shiftHandovers.value = []
  } finally {
    shiftHandoverLoading.value = false
  }
}

const fetchReconciliation = async () => {
  reconciliationLoading.value = true
  try {
    const data = await cashbookService.getReconciliation(selectedDate.value)
    reconciliationData.value = data
  } catch (error) {
    console.error('Error fetching reconciliation:', error)
    reconciliationData.value = null
  } finally {
    reconciliationLoading.value = false
  }
}

const handleCashIn = () => {
  console.log('Cash In clicked')
  // TODO: Implement cash in modal
}

const handleCashOut = () => {
  console.log('Cash Out clicked')
  // TODO: Implement cash out modal
}

const handlePettyCash = () => {
  console.log('Petty Cash clicked')
  // TODO: Implement petty cash modal
}

const handleShiftHandover = () => {
  console.log('Shift Handover clicked')
  // TODO: Implement shift handover modal
}

const handleReconciliation = () => {
  console.log('Reconciliation clicked')
  // TODO: Implement reconciliation modal
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return 'N/A'
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return dateStr
  }
}

const getHandoverStatusClass = (status: string): string => {
  const statusMap: Record<string, string> = {
    'completed': 'bg-green-100 text-green-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'disputed': 'bg-red-100 text-red-800'
  }
  return statusMap[status] || 'bg-gray-100 text-gray-800'
}

onMounted(async () => {
  await Promise.all([
    fetchDailyCashRegister(),
    fetchCashTransactions(),
    fetchPettyCash(),
    fetchShiftHandovers(),
    fetchReconciliation()
  ])
})
</script>
