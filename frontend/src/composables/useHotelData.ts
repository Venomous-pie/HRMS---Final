// BACKWARDS COMPATIBILITY WRAPPER
// This file now wraps the Pinia store to maintain existing API compatibility
// Components can gradually migrate to direct store usage

import { computed } from 'vue'
import { useHotelDataStore } from '@/stores/hotelData'

export const useHotelData = () => {
  const store = useHotelDataStore()

  // Maintain the same reactive interface as before
  const rooms = computed(() => store.rooms)
  const reservations = computed(() => store.reservations)
  const loading = computed(() => store.loading)
  const error = computed(() => store.error)

  // Maintain the same function signatures as before
  const refreshAll = async () => {
    await store.refreshAll()
  }

  const fetchRooms = async () => {
    await store.fetchRooms()
  }

  const fetchReservations = async () => {
    await store.fetchReservations()
  }

  return {
    rooms,
    reservations,
    loading,
    error,
    refreshAll,
    fetchRooms,
    fetchReservations,
  }
}

// Export store for direct usage in new components
export { useHotelDataStore }
