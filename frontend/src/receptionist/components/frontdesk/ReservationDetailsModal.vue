<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50"
    data-modal="reservation-details"
    @click="handleBackdropClick"
  >
    <div
      class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-200"
      @click.stop
    >
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <div class="flex items-center gap-3">
          <div :class="statusColor" class="w-3 h-3 rounded-full"></div>
          <h2 class="text-lg font-medium text-gray-900">Reservation Details</h2>
          <span class="px-2 py-1 text-xs font-medium rounded-full" :class="statusBadgeColor">
            {{ reservation?.status?.toUpperCase() }}
          </span>
        </div>
        <button 
          @click.stop="closeModal" 
          class="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
          type="button"
        >
          <i class="pi pi-times w-5 h-5"></i>
        </button>
      </div>

      <div class="p-6 space-y-6">
        <div>
          <h3 class="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
            <i class="pi pi-user text-blue-500"></i>
            Guest Information
          </h3>
          <div class="bg-gray-50 rounded-lg p-4 space-y-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                <p class="text-xs font-medium text-gray-900">{{ guestFullName }}</p>
              </div>
              <div v-if="reservation?.Guest?.email">
                <label class="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <p class="text-xs font-medium text-gray-900">{{ reservation.Guest.email }}</p>
              </div>
              <div v-if="reservation?.Guest?.phone">
                <label class="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                <p class="text-xs font-medium text-gray-900">{{ reservation.Guest.phone }}</p>
              </div>
              <div v-if="reservation?.Guest?.address">
                <label class="block text-xs font-medium text-gray-600 mb-1">Address</label>
                <p class="text-xs font-medium text-gray-900">{{ reservation.Guest.address }}</p>
              </div>
              <div v-if="reservation?.Guest?.idDocument">
                <label class="block text-xs font-medium text-gray-600 mb-1">ID Document</label>
                <p class="text-xs font-medium text-gray-900">{{ reservation.Guest.idDocument }}</p>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Number of Guests</label>
                <p class="text-xs font-medium text-gray-900">{{ reservation?.numGuest || 1 }}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 class="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
            <i class="pi pi-calendar text-green-500"></i>
            Reservation Details
          </h3>
          <div class="bg-gray-50 rounded-lg p-4 space-y-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Check-in Date</label>
                <p class="text-xs font-medium text-gray-900">
                  {{ formatDate(reservation?.checkIn || reservation?.checkInDate) }}
                </p>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Check-out Date</label>
                <p class="text-xs font-medium text-gray-900">
                  {{ formatDate(reservation?.checkOut || reservation?.checkOutDate) }}
                </p>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Duration</label>
                <p class="text-xs font-medium text-gray-900">
                  {{ nightsCount }} {{ nightsCount === 1 ? 'night' : 'nights' }}
                </p>
              </div>
              <div v-if="reservation?.bookingNumber">
                <label class="block text-xs font-medium text-gray-600 mb-1">Booking Number</label>
                <p class="text-xs font-medium text-gray-900">{{ reservation.bookingNumber }}</p>
              </div>
              <div v-if="reservation?.source">
                <label class="block text-xs font-medium text-gray-600 mb-1">Booking Source</label>
                <p class="text-xs font-medium text-gray-900 capitalize">{{ reservation.source }}</p>
              </div>
              <div v-if="reservation?.bookingDate">
                <label class="block text-xs font-medium text-gray-600 mb-1">Booking Date</label>
                <p class="text-xs font-medium text-gray-900">
                  {{ formatDate(reservation.bookingDate) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 class="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
            <i class="pi pi-home text-purple-500"></i>
            Room Information
          </h3>
          <div class="bg-gray-50 rounded-lg p-4 space-y-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Room Number</label>
                <p class="text-xs font-medium text-gray-900">
                  {{ reservation?.roomNumber || reservation?.room }}
                </p>
              </div>
              <div v-if="roomDetails?.type || roomDetails?.roomType">
                <label class="block text-xs font-medium text-gray-600 mb-1">Room Type</label>
                <p class="text-xs font-medium text-gray-900">
                  {{ roomDetails?.type || roomDetails?.roomType }}
                </p>
              </div>
              <div v-if="roomDetails?.maxCapacity">
                <label class="block text-xs font-medium text-gray-600 mb-1">Max Capacity</label>
                <p class="text-xs font-medium text-gray-900">
                  {{ roomDetails.maxCapacity }} guests
                </p>
              </div>
              <div v-if="roomDetails?.pricePerNight">
                <label class="block text-xs font-medium text-gray-600 mb-1">Price per Night</label>
                <p class="text-xs font-medium text-gray-900">
                  ₱{{ roomDetails.pricePerNight.toLocaleString() }}
                </p>
              </div>
            </div>

            <div v-if="roomDetails?.amenities?.length" class="mt-4">
              <label class="block text-xs font-medium text-gray-600 mb-2">Room Amenities</label>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="amenity in roomDetails.amenities"
                  :key="amenity"
                  class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                >
                  {{ amenity }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 class="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
            <i class="pi pi-dollar text-yellow-500"></i>
            Financial Information
          </h3>
          <div class="bg-gray-50 rounded-lg p-4 space-y-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Total Amount</label>
                <p class="text-xs font-medium text-gray-900">
                  ₱{{ (reservation?.totalPrice || reservation?.amount || 0).toLocaleString() }}
                </p>
              </div>
              <div v-if="reservation?.balance !== undefined">
                <label class="block text-xs font-medium text-gray-600 mb-1">Balance</label>
                <p
                  class="text-xs font-medium text-gray-900"
                  :class="reservation.balance > 0 ? 'text-red-600' : 'text-green-600'"
                >
                  ₱{{ reservation.balance.toLocaleString() }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="reservation?.specialRequest || reservation?.notes">
          <h3 class="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
            <i class="pi pi-comment text-orange-500"></i>
            Special Requests & Notes
          </h3>
          <div class="bg-gray-50 rounded-lg p-4 space-y-3">
            <div v-if="reservation?.specialRequest">
              <label class="block text-xs font-medium text-gray-600 mb-1">Special Requests</label>
              <p class="text-xs font-medium text-gray-900">{{ reservation.specialRequest }}</p>
            </div>
            <div v-if="reservation?.notes">
              <label class="block text-xs font-medium text-gray-600 mb-1">Notes</label>
              <p class="text-xs font-medium text-gray-900">{{ reservation.notes }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
        <Custombutton
          label="Close"
          bg-color="bg-gray-100"
          hover-bg-color="hover:bg-gray-200"
          text-color="text-gray-700"
          :hover="true"
          @click="closeModal"
        />
        
        <!-- Cancellation Button -->
        <Custombutton
          v-if="canCancel"
          label="Cancel Reservation"
          bg-color="bg-red-600"
          hover-bg-color="hover:bg-red-700"
          text-color="white"
          :hover="true"
          @click="handleCancellation"
        />
        
        <!-- Checkout Button -->
        <Custombutton
          v-if="canCheckout"
          label="Check Out"
          bg-color="bg-green-600"
          hover-bg-color="hover:bg-green-700"
          text-color="white"
          :hover="true"
          @click="handleCheckout"
        />
        
        <Custombutton
          v-if="canUpdate"
          label="Update Reservation"
          bg-color="bg-blue-600"
          hover-bg-color="hover:bg-blue-700"
          text-color="white"
          :hover="true"
          @click="handleUpdateReservation"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps, onMounted, onUnmounted } from 'vue'
import type { Reservation, Room } from '@/types/hotel'
import Custombutton from '@/components/Custombutton.vue'
import { getReservationStatusColor } from '@/utils/colors'
import { formatReservationDateRange } from '@/utils/reservations'
import { useCheckoutStore } from '@/stores/checkout'
import { useCancellationPolicy } from '@/composables/useCancellationPolicy'

interface Props {
  isOpen: boolean
  reservation: Reservation | null
  roomDetails?: Room | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  edit: [reservation: Reservation]
  checkout: [reservation: Reservation]
  cancel: [reservation: Reservation]
}>()

// Pinia store for checkout modal
const checkoutStore = useCheckoutStore()
const openCheckoutModal = checkoutStore.openCheckoutModal
const { calculateCancellation } = useCancellationPolicy()

// Computed properties for display
const guestFullName = computed(() => {
  if (props.reservation?.Guest) {
    const { firstName, middleName, lastName } = props.reservation.Guest
    return [firstName, middleName, lastName].filter(Boolean).join(' ')
  }
  return props.reservation?.guest || props.reservation?.guestName || 'Unknown Guest'
})

const statusColor = computed(() => {
  if (!props.reservation) return 'bg-gray-400'
  return getReservationStatusColor(props.reservation).replace('bg-', 'bg-')
})

const statusBadgeColor = computed(() => {
  if (!props.reservation) return 'bg-gray-100 text-gray-600'

  const status = props.reservation.status
  switch (status) {
    case 'confirmed':
      return 'bg-blue-100 text-blue-700'
    case 'checkedIn':
      return 'bg-green-100 text-green-700'
    case 'checkedOut':
      return 'bg-gray-100 text-gray-700'
    case 'cancelled':
      return 'bg-red-100 text-red-700'
    case 'pending':
      return 'bg-yellow-100 text-yellow-700'
    default:
      return 'bg-gray-100 text-gray-600'
  }
})

const nightsCount = computed(() => {
  if (!props.reservation) return 0

  const checkIn = new Date(props.reservation.checkIn || props.reservation.checkInDate || '')
  const checkOut = new Date(props.reservation.checkOut || props.reservation.checkOutDate || '')

  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) return 0

  const diffTime = checkOut.getTime() - checkIn.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// Button visibility logic
const canCheckout = computed(() => {
  return props.reservation?.status === 'checkedIn'
})

const canCancel = computed(() => {
  const status = props.reservation?.status
  return status === 'confirmed' || status === 'pending'
})

const canUpdate = computed(() => {
  const status = props.reservation?.status
  return status !== 'checkedOut' && status !== 'cancelled'
})

// Helper functions
const formatDate = (date: string | Date | undefined) => {
  if (!date) return 'N/A'

  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return 'Invalid Date'

    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return 'Invalid Date'
  }
}

const closeModal = () => {
  console.log('🔄 ReservationDetailsModal: Close button clicked') // Debug log
  
  // Force close with multiple approaches
  try {
    emit('close')
  } catch (error) {
    console.error('❌ Error closing modal:', error)
  }
}

const handleUpdateReservation = () => {
  if (props.reservation) {
    // Emit edit event to open AddReservationModal with prefilled data
    emit('edit', props.reservation)
  }
}

const handleCheckout = async () => {
  if (!props.reservation || !props.reservation.id) {
    console.error('Invalid reservation for checkout')
    return
  }

  try {
    // Open checkout modal first and wait for it to be ready
    const success = await openCheckoutModal(props.reservation)
    
    // Only emit checkout if modal was opened successfully
    if (success) {
      console.log('✅ Checkout modal opened, emitting checkout event')
      emit('checkout', props.reservation)
    } else {
      console.error('❌ Failed to open checkout modal')
    }
  } catch (err) {
    console.error('❌ Error during checkout:', err)
  }
}

const handleCancellation = () => {
  if (props.reservation) {
    emit('cancel', props.reservation)
  }
}

const handleBackdropClick = (event: MouseEvent) => {
  console.log('🔄 Backdrop clicked', event.target === event.currentTarget) // Debug log
  if (event.target === event.currentTarget) {
    closeModal()
  }
}

// ESC key handler
const handleEscKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen) {
    console.log('🔄 ESC key pressed - closing modal')
    closeModal()
  }
}

// Add/remove ESC key listener
onMounted(() => {
  document.addEventListener('keydown', handleEscKey)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscKey)
})
</script>
