<template>
  <div class="px-6">
    <div class="mb-6 flex items-center justify-between">
      <h2 class="font-bold text-gray-700">Accounting</h2>
      <Custombutton label="Add Transaction" :hover="true" @click="handleAddTransaction" />
    </div>

    <!-- Financial Dashboard -->
    <FinancialDashboard
      :loading="loading"
      :revenue-stats="revenueStats"
      :revenue-trend="revenueTrend"
      :booking-sources="bookingSources"
      :outstanding-balance="totalOutstanding"
      @period-change="handlePeriodChange"
    />

    <!-- Revenue Management -->
    <RevenueManagement :loading="reservationsLoading" :reservations="reservations" class="mt-6" />

    <!-- Payment Tracking & Invoice Management -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <PaymentTracking :loading="paymentsLoading" :payments="payments" @refresh="fetchPayments" />
      <InvoiceManagement :loading="invoicesLoading" :invoices="invoices" @refresh="fetchInvoices" />
    </div>

    <!-- Accounts Receivable -->
    <AccountsReceivable :loading="invoicesLoading" :invoices="invoices" class="mt-6" />

    <!-- Financial Reports -->
    <FinancialReports
      :loading="loading"
      :payments="payments"
      :reservations="reservations"
      :booking-sources="bookingSources"
      :revenue-stats="revenueStats"
      class="mt-6 mb-4"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Custombutton from '@/components/Custombutton.vue'
import FinancialDashboard from '@/receptionist/components/accounting/FinancialDashboard.vue'
import PaymentTracking from '@/receptionist/components/accounting/PaymentTracking.vue'
import InvoiceManagement from '@/receptionist/components/accounting/InvoiceManagement.vue'
import RevenueManagement from '@/receptionist/components/accounting/RevenueManagement.vue'
import AccountsReceivable from '@/receptionist/components/accounting/AccountsReceivable.vue'
import FinancialReports from '@/receptionist/components/accounting/FinancialReports.vue'
import {
  accountingService,
  type RevenueStats,
  type RevenueTrend,
  type Payment,
  type Invoice,
  type BookingSourceStats,
  type Reservation
} from '@/services/accounting'

const loading = ref(false)
const paymentsLoading = ref(false)
const invoicesLoading = ref(false)
const reservationsLoading = ref(false)

const revenueStats = ref<RevenueStats | null>(null)
const revenueTrend = ref<RevenueTrend[]>([])
const payments = ref<Payment[]>([])
const invoices = ref<Invoice[]>([])
const reservations = ref<Reservation[]>([])
const bookingSources = ref<BookingSourceStats[]>([])

const totalOutstanding = computed(() => {
  return invoices.value
    .filter(inv => inv.paymentStatus !== 'paid' && inv.status !== 'cancelled')
    .reduce((sum, inv) => {
      const balance = parseFloat(inv.balanceAmount?.toString() || '0')
      return sum + balance
    }, 0)
})

const fetchRevenueData = async () => {
  loading.value = true
  try {
    const [stats, trend] = await Promise.all([
      accountingService.getRevenueStats(),
      accountingService.getRevenueTrend()
    ])
    revenueStats.value = stats
    revenueTrend.value = trend
  } catch (error) {
    console.error('Error fetching revenue data:', error)
  } finally {
    loading.value = false
  }
}

const fetchPayments = async () => {
  paymentsLoading.value = true
  try {
    const data = await accountingService.getPayments()
    payments.value = data
  } catch (error) {
    console.error('Error fetching payments:', error)
  } finally {
    paymentsLoading.value = false
  }
}

const fetchInvoices = async () => {
  invoicesLoading.value = true
  try {
    const data = await accountingService.getInvoices()
    invoices.value = data
  } catch (error) {
    console.error('Error fetching invoices:', error)
  } finally {
    invoicesLoading.value = false
  }
}

const fetchReservations = async () => {
  reservationsLoading.value = true
  try {
    const data = await accountingService.getReservations()
    reservations.value = data
  } catch (error) {
    console.error('Error fetching reservations:', error)
  } finally {
    reservationsLoading.value = false
  }
}

const fetchBookingSources = async () => {
  try {
    const data = await accountingService.getBookingSourceStats()
    bookingSources.value = data
  } catch (error) {
    console.error('Error fetching booking sources:', error)
  }
}

const handlePeriodChange = (period: string) => {
  console.log('Period changed to:', period)
  // TODO: Implement period-based filtering
  fetchRevenueData()
}

const handleAddTransaction = () => {
  console.log('Add Transaction button clicked')
  // TODO: Implement transaction creation modal
}

onMounted(async () => {
  await Promise.all([
    fetchRevenueData(),
    fetchPayments(),
    fetchInvoices(),
    fetchReservations(),
    fetchBookingSources()
  ])
})
</script>
