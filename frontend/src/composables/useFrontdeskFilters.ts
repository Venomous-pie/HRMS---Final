// BACKWARDS COMPATIBILITY WRAPPER
// This file now wraps the Pinia store to maintain existing API compatibility
// Components can gradually migrate to direct store usage

import { computed } from 'vue'
import { useFrontdeskFiltersStore } from '@/stores/frontdeskFilters'

export const useFrontdeskFilters = () => {
  const store = useFrontdeskFiltersStore()

  // Maintain the same reactive interface as before
  const searchQuery = computed({
    get: () => store.searchQuery,
    set: (value: string) => store.setSearchQuery(value)
  })
  
  const selectedReservationFilter = computed({
    get: () => store.selectedReservationFilter,
    set: (value: string) => store.setReservationFilter(value)
  })
  
  const selectedRoomTypeFilter = computed({
    get: () => store.selectedRoomTypeFilter,
    set: (value: string) => store.setRoomTypeFilter(value)
  })
  
  const selectedBookingFilter = computed({
    get: () => store.selectedBookingFilter,
    set: (value: string) => store.setBookingFilter(value)
  })
  
  const showReservationDropdown = computed(() => store.showReservationDropdown)
  const showRoomTypeDropdown = computed(() => store.showRoomTypeDropdown)
  const showBookingDropdown = computed(() => store.showBookingDropdown)
  const hasActiveFilters = computed(() => store.hasActiveFilters)

  // Maintain the same function signatures as before
  const clearAllFilters = () => {
    store.clearAllFilters()
  }

  const toggleReservationDropdown = () => {
    store.toggleReservationDropdown()
  }

  const toggleRoomTypeDropdown = () => {
    store.toggleRoomTypeDropdown()
  }

  const toggleBookingDropdown = () => {
    store.toggleBookingDropdown()
  }

  const closeDropdowns = () => {
    store.closeAllDropdowns()
  }

  return {
    // state
    searchQuery,
    selectedReservationFilter,
    selectedRoomTypeFilter,
    selectedBookingFilter,
    showReservationDropdown,
    showRoomTypeDropdown,
    showBookingDropdown,
    hasActiveFilters,
    // actions
    clearAllFilters,
    toggleReservationDropdown,
    toggleRoomTypeDropdown,
    toggleBookingDropdown,
    closeDropdowns,
  }
}

// Export store for direct usage in new components
export { useFrontdeskFiltersStore }
