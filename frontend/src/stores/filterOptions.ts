import { defineStore } from 'pinia'
import { useHotelDataStore } from './hotelData'
import {
  getUniqueRoomTypes,
  getUniqueStatuses,  
  getUniqueSources,
  formatStatusLabel,
  formatSourceLabel,
} from '@/utils/frontdesk'

export const useFilterOptionsStore = defineStore('filterOptions', {
  getters: {
    // Get unique room types with 'All' option
    roomTypeOptions: () => {
      const hotelDataStore = useHotelDataStore()
      const types = getUniqueRoomTypes(hotelDataStore.rooms)
      return ['All Room Types', ...types.sort()]
    },

    // Get unique reservation statuses with 'All' option
    reservationStatusOptions: () => {
      const hotelDataStore = useHotelDataStore()
      const statuses = getUniqueStatuses(hotelDataStore.reservations)
      const labeled = statuses.map(formatStatusLabel).filter(Boolean).sort()
      return ['All Reservations', ...labeled]
    },

    // Get unique booking sources with 'All' option
    bookingSourceOptions: () => {
      const hotelDataStore = useHotelDataStore()
      const sources = getUniqueSources(hotelDataStore.reservations)
      const labeled = sources.map(formatSourceLabel).filter(Boolean).sort()
      return ['All Booking', ...labeled]
    },
  },
})

// SIMPLIFIED VERSION - Removed over-engineering:
// ❌ Unnecessary counts and statistics  
// ❌ Complex validation functions (should be in utils)
// ❌ Premature optimization features
// ❌ Duplicate logic
// ❌ Complex actions for simple data
// 
// ✅ KEPT: Core functionality (filter options)
// ✅ KEPT: Clean, simple interface
// ✅ KEPT: Reactive data from hotel store
