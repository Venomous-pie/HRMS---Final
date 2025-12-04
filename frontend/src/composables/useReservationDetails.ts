import { ref, computed } from 'vue'
import type { Reservation, Room } from '@/types/hotel'
import { useHotelData } from './useHotelData'
import { getReservationById } from '@/services/reservations'

export const useReservationDetails = () => {
  const { rooms } = useHotelData()

  const isModalOpen = ref(false)
  const selectedReservation = ref<Reservation | null>(null)

  const selectedRoomDetails = computed(() => {
    if (!selectedReservation.value) return null

    const roomNumber = selectedReservation.value.roomNumber || selectedReservation.value.room
    return (
      rooms.value.find((room) => room.number === roomNumber || room.roomNumber === roomNumber) ||
      null
    )
  })

  const openModal = async (reservation: Reservation) => {
    // Always fetch the latest data when opening the modal
    if (reservation.id) {
      try {
        const freshReservation = await getReservationById(reservation.id.toString())
        selectedReservation.value = freshReservation
      } catch (error) {
        console.error('Failed to fetch fresh reservation data:', error)
        // Fallback to the passed reservation data
        selectedReservation.value = reservation
      }
    } else {
      // No ID available, use the passed data
      selectedReservation.value = reservation
    }
    isModalOpen.value = true
  }

  const closeModal = () => {
    console.log('🔄 Closing reservation modal...') // Debug log
    isModalOpen.value = false
    setTimeout(() => {
      selectedReservation.value = null
      console.log('✅ Modal closed and reservation cleared') // Debug log
    }, 300)
  }

  // Function to refresh the selected reservation with latest data
  const refreshSelectedReservation = async () => {
    if (!selectedReservation.value?.id) return
    
    try {
      const updatedReservation = await getReservationById(selectedReservation.value.id.toString())
      selectedReservation.value = updatedReservation
    } catch (error) {
      console.error('Failed to refresh reservation data:', error)
    }
  }

  return {
    isModalOpen,
    selectedReservation,
    selectedRoomDetails,
    openModal,
    closeModal,
    refreshSelectedReservation,
  }
}
