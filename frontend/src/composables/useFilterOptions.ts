// BACKWARDS COMPATIBILITY WRAPPER
// This file now wraps the Pinia store to maintain existing API compatibility
// Components can gradually migrate to direct store usage

import { computed, type Ref } from 'vue'
import type { Room, Reservation } from '@/types/hotel'
import { useFilterOptionsStore } from '@/stores/filterOptions'

// Legacy interface - accepts rooms/reservations refs but ignores them
// The store now gets data directly from hotel data store
export const useFilterOptions = (rooms?: Ref<Room[]>, reservations?: Ref<Reservation[]>) => {
  const store = useFilterOptionsStore()

  // Maintain the same reactive interface as before
  const roomTypeOptions = computed(() => store.roomTypeOptions)
  const reservationStatusOptions = computed(() => store.reservationStatusOptions)
  const bookingSourceOptions = computed(() => store.bookingSourceOptions)

  return {
    roomTypeOptions,
    reservationStatusOptions,
    bookingSourceOptions,
  }
}

// Export store for direct usage in new components
export { useFilterOptionsStore }
