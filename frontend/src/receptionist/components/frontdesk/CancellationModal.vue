<template>
  <div
    v-if="isCancellationModalOpen"
    class="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50"
    @click="handleBackdropClick"
  >
    <div
      class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-200"
      @click.stop
    >
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <div class="flex items-center gap-3">
          <Custombutton
            label="← Back"
            bg-color="bg-gray-50"
            hover-bg-color="hover:bg-gray-100"
            text-color="text-gray-600"
            :hover="true"
            @click="goBackToDetails"
          />
          <h2 class="text-lg font-medium text-gray-900">Cancel Reservation</h2>
          <span v-if="selectedReservation" class="text-xs text-gray-600">
            {{ selectedReservation.guestName || selectedReservation.guest }} - Room {{ selectedReservation.roomNumber }}
          </span>
        </div>
        <button 
          @click="closeCancellationModal" 
          class="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
          type="button"
        >
          <i class="pi pi-times w-5 h-5"></i>
        </button>
      </div>

      <div v-if="error" class="p-6 pb-0">
        <div class="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>
      </div>

      <!-- Cancellation Details -->
      <div v-if="cancellationCalculation && selectedReservation" class="p-6">
        <!-- Reservation Summary -->
        <div class="mb-6">
          <h3 class="text-sm font-medium text-gray-900 mb-4">Reservation Details</h3>
          <div class="bg-gray-50 rounded-lg p-4 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Check-in:</span>
              <span class="text-gray-900">{{ formatDate(selectedReservation.checkIn) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Check-out:</span>
              <span class="text-gray-900">{{ formatDate(selectedReservation.checkOut) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Room:</span>
              <span class="text-gray-900">{{ selectedReservation.roomNumber }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Guests:</span>
              <span class="text-gray-900">{{ selectedReservation.numGuest }}</span>
            </div>
            <div class="flex justify-between text-sm font-medium">
              <span class="text-gray-600">Total Amount:</span>
              <span class="text-gray-900">{{ formatCurrency(selectedReservation.totalPrice) }}</span>
            </div>
          </div>
        </div>

        <!-- Cancellation Policy Info -->
        <div v-if="cancellationCalculation.canCancel" class="mb-6">
          <h3 class="text-sm font-medium text-gray-900 mb-4">Cancellation Policy</h3>
          
          <!-- Policy Summary -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div class="flex items-start">
              <svg class="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <div>
                <p class="text-blue-800 text-sm">
                  {{ getPolicySummary(selectedReservation) }}
                </p>
                <p v-if="cancellationCalculation.applicableRule" class="text-blue-700 text-sm mt-1">
                  Current rule: {{ cancellationCalculation.applicableRule.description }}
                </p>
              </div>
            </div>
          </div>

          <!-- Time Remaining -->
          <div class="bg-gray-50 rounded-lg p-4 mb-4">
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-600">Time until check-in:</span>
              <span class="font-medium text-gray-900">{{ formatTimeRemaining(cancellationCalculation.hoursUntilCheckIn) }}</span>
            </div>
          </div>

          <!-- Financial Breakdown -->
          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 class="text-sm font-medium text-gray-900 mb-3">Financial Impact</h4>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Original Amount:</span>
                <span class="text-gray-900">{{ formatCurrency(cancellationCalculation.originalAmount) }}</span>
              </div>
              <div class="flex justify-between text-sm" :class="cancellationCalculation.cancellationFee > 0 ? 'text-red-600' : 'text-green-600'">
                <span>Cancellation Fee:</span>
                <span>{{ formatCurrency(cancellationCalculation.cancellationFee) }}</span>
              </div>
              <div class="flex justify-between text-sm font-bold" :class="cancellationCalculation.refundAmount > 0 ? 'text-green-600' : 'text-red-600'">
                <span>Refund Amount:</span>
                <span>{{ formatCurrency(cancellationCalculation.refundAmount) }}</span>
              </div>
            </div>
          </div>

          <!-- Free Cancellation Badge -->
          <div v-if="isFreeCancellation(selectedReservation)" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span class="text-green-800 font-medium">Free Cancellation Available</span>
            </div>
          </div>
        </div>

        <!-- Cannot Cancel Warning -->
        <div v-else class="mb-6">
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex">
              <svg class="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <div>
                <h4 class="text-red-800 font-medium text-sm">Cancellation Not Allowed</h4>
                <p class="text-red-700 text-sm mt-1">
                  {{ cancellationCalculation.reason }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Cancellation Reason -->
        <div v-if="cancellationCalculation.canCancel" class="mb-6">
          <label class="block text-xs font-medium text-gray-700 mb-1">
            Reason for Cancellation <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="cancellationReason"
            rows="3"
            class="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
            placeholder="Please provide a reason for cancellation..."
            required
          ></textarea>
        </div>

        <!-- Confirmation Checkbox -->
        <div v-if="cancellationCalculation.canCancel" class="mb-6">
          <label class="flex items-start">
            <input
              v-model="confirmCancellation"
              type="checkbox"
              class="rounded border-gray-300 text-red-600 focus:ring-red-500 mt-1"
            />
            <span class="ml-2 text-xs text-gray-700">
              I understand that this action cannot be undone and agree to the cancellation terms above.
              <span v-if="cancellationCalculation.cancellationFee > 0" class="text-red-600 font-medium">
                A cancellation fee of {{ formatCurrency(cancellationCalculation.cancellationFee) }} will be charged.
              </span>
            </span>
          </label>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
        <Custombutton
          label="Keep Reservation"
          bg-color="bg-gray-100"
          hover-bg-color="hover:bg-gray-200"
          text-color="text-gray-700"
          :hover="true"
          @click="closeCancellationModal"
        />
        <Custombutton
          v-if="cancellationCalculation?.canCancel"
          :label="isLoading ? 'Processing...' : 'Cancel Reservation'"
          bg-color="bg-red-600"
          hover-bg-color="hover:bg-red-700"
          text-color="white"
          :hover="true"
          :disabled="!canProcessCancellation || isLoading"
          @click="processCancellation"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCancellationPolicy } from '@/composables/useCancellationPolicy'
import Custombutton from '@/components/Custombutton.vue'
import type { Reservation } from '@/types/hotel'

// Define emits
const emit = defineEmits<{
  backToDetails: [reservation: any]
}>()

// Props
interface Props {
  reservation?: Reservation | null
}

const props = defineProps<Props>()

// Composables
const {
  calculateCancellation,
  processCancellation: processCancellationAction,
  getPolicySummary,
  isFreeCancellation,
  isLoading,
  error,
} = useCancellationPolicy()

// Local state
const isCancellationModalOpen = ref(false)
const selectedReservation = ref<Reservation | null>(null)
const cancellationReason = ref('')
const confirmCancellation = ref(false)

// Computed
const cancellationCalculation = computed(() => {
  if (!selectedReservation.value) return null
  return calculateCancellation(selectedReservation.value)
})

const canProcessCancellation = computed(() => {
  return (
    cancellationCalculation.value?.canCancel &&
    cancellationReason.value.trim().length > 0 &&
    confirmCancellation.value
  )
})

// Methods
const openCancellationModal = (reservation: Reservation) => {
  selectedReservation.value = reservation
  cancellationReason.value = ''
  confirmCancellation.value = false
  isCancellationModalOpen.value = true
}

const closeCancellationModal = () => {
  isCancellationModalOpen.value = false
  selectedReservation.value = null
  cancellationReason.value = ''
  confirmCancellation.value = false
}

const processCancellation = async () => {
  if (!selectedReservation.value || !canProcessCancellation.value) return
  
  const success = await processCancellationAction(
    selectedReservation.value,
    cancellationReason.value
  )
  
  if (success) {
    closeCancellationModal()
    // Show success message with guest removal info
    console.log('Reservation cancelled successfully! Guest record will be removed if no other active bookings. Sayang naman pero okay lang!')
  }
}

// Utility functions
const formatDate = (dateString: string | Date) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  })
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount)
}

const formatTimeRemaining = (hours: number) => {
  if (hours < 1) {
    return `${Math.round(hours * 60)} minutes`
  } else if (hours < 24) {
    return `${Math.round(hours)} hours`
  } else {
    const days = Math.floor(hours / 24)
    const remainingHours = Math.round(hours % 24)
    return `${days} day${days > 1 ? 's' : ''} ${remainingHours > 0 ? `${remainingHours} hours` : ''}`
  }
}

const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    closeCancellationModal()
  }
}

const goBackToDetails = () => {
  const reservation = selectedReservation.value
  closeCancellationModal()
  
  emit('backToDetails', reservation)
}

// Expose methods for parent component
defineExpose({
  openCancellationModal,
  closeCancellationModal,
})
</script>
