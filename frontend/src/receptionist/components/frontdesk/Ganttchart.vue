<template>
  <div class="h-full bg-white">
    <GanttHeader
      :date-range="dateRange"
      @navigate-dates="navigateDates"
      @jump-to-today="jumpToToday"
    />

    <GanttTable
      ref="ganttTableRef"
      :date-range="dateRange"
      :room-categories="roomCategories"
      :expanded-categories="expandedCategories"
      :hovered-column="hoveredColumn"
      :highlighted-reservation="highlightedReservation"
      :loading="props.loading"
      :error="props.error"
      :is-room-available="isRoomAvailable"
      :get-available-room-count-for-date="getAvailableRoomCountForDate"
      :get-reservation-spans="getReservationSpans"
      :set-row-ref="setRowRef"
      @column-hover="hoveredColumn = $event"
      @column-leave="hoveredColumn = null"
      @toggle-category="toggleCategory"
      @cell-click="handleCellClick"
      @reservation-click="handleReservationClick"
      @room-info-click="handleRoomInfoClick"
    />

    <ReservationDetailsModal
      :is-open="isModalOpen"
      :reservation="selectedReservation"
      :room-details="selectedRoomDetails"
      @close="closeModal"
      @edit="handleReservationEdit"
      @checkout="handleReservationCheckout"
      @cancel="handleReservationCancel"
    />

    <!-- Checkout Modal -->
    <CheckoutModal @backToDetails="handleBackToDetails" />

    <!-- Cancellation Modal -->
    <CancellationModal ref="cancellationModalRef" @backToDetails="handleBackToDetails" />

    <RoomInfoModal
      :is-open="isRoomInfoModalOpen"
      :room="selectedRoom"
      :is-room-available="isRoomAvailable"
      @close="closeRoomInfoModal"
      @create-reservation="handleCreateReservationFromRoom"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useGanttOrchestrator } from '@/composables/useGanttOrchestrator'
import { useReservationDetails } from '@/composables/useReservationDetails'
import GanttHeader from './GanttHeader.vue'
import GanttTable from './GanttTable.vue'
import ReservationDetailsModal from './ReservationDetailsModal.vue'
import RoomInfoModal from './RoomInfoModal.vue'
import CheckoutModal from './CheckoutModal.vue'
import { useCheckoutStore } from '@/stores/checkout'
import CancellationModal from './CancellationModal.vue'

const props = defineProps<{
  selectedYear: number
  selectedMonth: number
  searchQuery: string
  reservationFilter: string
  roomTypeFilter: string
  bookingFilter: string
  rooms: any[]
  reservations: any[]
  loading: boolean
  error: string | null
  targetDate?: Date | null
}>()

const emit = defineEmits<{
  updateDate: [{ year: number; month: number }]
  openReservationModal: [{ roomNumber: string; checkInDate: string; isAvailable: boolean }]
  openReservationEditor: [prefilled: any]
}>()

const {
  hoveredColumn,
  ganttTableRef,
  dateRange,
  roomCategories,
  expandedCategories,
  highlightedReservation,
  navigateDates,
  jumpToToday,
  handleCellClick,
  toggleCategory,
  isRoomAvailable,
  getAvailableRoomCountForDate,
  getReservationSpans,
  setRowRef,
} = useGanttOrchestrator(props, emit)

// Reservation details modal functionality
const { isModalOpen, selectedReservation, selectedRoomDetails, openModal, closeModal, refreshSelectedReservation } =
  useReservationDetails()

// Room info modal functionality
const isRoomInfoModalOpen = ref(false)
const selectedRoom = ref<any>(null)

// Handle reservation span clicks
const handleReservationClick = (reservation: any) => {
  openModal(reservation)
}

// Handle room info clicks
const handleRoomInfoClick = (room: any) => {
  selectedRoom.value = room
  isRoomInfoModalOpen.value = true
}

const closeRoomInfoModal = () => {
  isRoomInfoModalOpen.value = false
  selectedRoom.value = null
}

const handleCreateReservationFromRoom = (data: { roomNumber: string; checkInDate: string }) => {
  emit('openReservationModal', {
    roomNumber: data.roomNumber,
    checkInDate: data.checkInDate,
    isAvailable: true
  })
}

import { getReservationById } from '@/services/reservations'
import { formatDateForInput } from '@/utils'
const toDateOnly = (value: any): string => {
  if (!value) return ''
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
    const tIndex = value.indexOf('T')
    if (tIndex > 0) return value.slice(0, 10)
    // Fallback for non-ISO strings
    const d = new Date(value)
    return formatDateForInput(d)
  }
  if (value instanceof Date) return formatDateForInput(value)
  try {
    return formatDateForInput(new Date(value))
  } catch {
    return ''
  }
}
const handleReservationEdit = async (reservation: any) => {
  try {
    const full = await getReservationById((reservation.id || '').toString())
    const prefilled = {
      reservationId: (full.id || reservation.id || '').toString(),
      firstName: full.Guest?.firstName || '',
      middleName: full.Guest?.middleName || '',
      lastName: full.Guest?.lastName || '',
      email: full.Guest?.email || '',
      phone: full.Guest?.phone || '',
      address: full.Guest?.address || '',
      idDocument: full.Guest?.idDocument || '',
      numGuest: full.numGuest || reservation.numGuest,
      checkInDate: toDateOnly(full.checkIn || reservation.checkIn || ''),
      checkOutDate: toDateOnly(full.checkOut || reservation.checkOut || ''),
      specialRequest: full.specialRequest || reservation.notes || '',
      status: full.status || reservation.status,
      roomNumber: full.roomNumber || reservation.room || reservation.roomNumber,
    }
    closeModal()
    emit('openReservationEditor', prefilled)
  } catch (e) {}
}

// Checkout handler - opens checkout modal using Pinia store
const checkoutStore = useCheckoutStore()
const handleReservationCheckout = async (reservation: any) => {
  if (!reservation || !reservation.id) {
    console.error('Invalid reservation for checkout')
    return
  }
  // Open checkout modal via store
  const success = await checkoutStore.openCheckoutModal(reservation)
  if (success) {
    console.log('Processing checkout for reservation:', reservation.id)
    closeModal()
  } else {
    console.error('Failed to open checkout modal')
  }
}

// Cancellation handler - opens cancellation modal
const cancellationModalRef = ref()
const handleReservationCancel = (reservation: any) => {
  closeModal()
  // Open cancellation modal
  if (cancellationModalRef.value) {
    cancellationModalRef.value.openCancellationModal(reservation)
  }
}

// Handle back to details from modals
const handleBackToDetails = (reservation: any) => {
  // Set the reservation and reopen the modal
  if (reservation) {
    selectedReservation.value = reservation
    isModalOpen.value = true
  }
}

// Watch for changes in reservations data and refresh selected reservation if modal is open
watch(
  () => props.reservations,
  async () => {
    // If the modal is open and we have a selected reservation, refresh it
    if (isModalOpen.value && selectedReservation.value) {
      await refreshSelectedReservation()
    }
  },
  { deep: true }
)

// Expose methods for parent component
defineExpose({
  handleBackToDetails
})
</script>
