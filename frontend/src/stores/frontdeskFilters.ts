import { defineStore } from 'pinia'

export interface FrontdeskFiltersState {
  searchQuery: string
  selectedReservationFilter: string
  selectedRoomTypeFilter: string
  selectedBookingFilter: string
  showReservationDropdown: boolean
  showRoomTypeDropdown: boolean
  showBookingDropdown: boolean
}

export const useFrontdeskFiltersStore = defineStore('frontdeskFilters', {
  state: (): FrontdeskFiltersState => ({
    searchQuery: '',
    selectedReservationFilter: 'All Reservations',
    selectedRoomTypeFilter: 'All Room Types',
    selectedBookingFilter: 'All Booking',
    showReservationDropdown: false,
    showRoomTypeDropdown: false,
    showBookingDropdown: false,
  }),

  getters: {
    // Check if any filters are active
    hasActiveFilters: (state) => {
      return (
        state.searchQuery !== '' ||
        state.selectedReservationFilter !== 'All Reservations' ||
        state.selectedRoomTypeFilter !== 'All Room Types' ||
        state.selectedBookingFilter !== 'All Booking'
      )
    },

    // Get current active filters as an object
    activeFilters: (state) => ({
      search: state.searchQuery,
      reservation: state.selectedReservationFilter,
      roomType: state.selectedRoomTypeFilter,
      booking: state.selectedBookingFilter,
    }),

    // Check if any dropdown is open
    hasOpenDropdown: (state) => {
      return (
        state.showReservationDropdown ||
        state.showRoomTypeDropdown ||
        state.showBookingDropdown
      )
    },

    // Get filter counts
    activeFilterCount: (state) => {
      let count = 0
      if (state.searchQuery !== '') count++
      if (state.selectedReservationFilter !== 'All Reservations') count++
      if (state.selectedRoomTypeFilter !== 'All Room Types') count++
      if (state.selectedBookingFilter !== 'All Booking') count++
      return count
    },
  },

  actions: {
    // Search actions
    setSearchQuery(query: string) {
      this.searchQuery = query
    },

    clearSearchQuery() {
      this.searchQuery = ''
    },

    // Filter actions
    setReservationFilter(filter: string) {
      this.selectedReservationFilter = filter
      this.showReservationDropdown = false
    },

    setRoomTypeFilter(filter: string) {
      this.selectedRoomTypeFilter = filter
      this.showRoomTypeDropdown = false
    },

    setBookingFilter(filter: string) {
      this.selectedBookingFilter = filter
      this.showBookingDropdown = false
    },

    // Dropdown actions
    toggleReservationDropdown() {
      this.showReservationDropdown = !this.showReservationDropdown
      // Close other dropdowns
      this.showRoomTypeDropdown = false
      this.showBookingDropdown = false
    },

    toggleRoomTypeDropdown() {
      this.showRoomTypeDropdown = !this.showRoomTypeDropdown
      // Close other dropdowns
      this.showReservationDropdown = false
      this.showBookingDropdown = false
    },

    toggleBookingDropdown() {
      this.showBookingDropdown = !this.showBookingDropdown
      // Close other dropdowns
      this.showReservationDropdown = false
      this.showRoomTypeDropdown = false
    },

    closeAllDropdowns() {
      this.showReservationDropdown = false
      this.showRoomTypeDropdown = false
      this.showBookingDropdown = false
    },

    // Clear all filters
    clearAllFilters() {
      this.searchQuery = ''
      this.selectedReservationFilter = 'All Reservations'
      this.selectedRoomTypeFilter = 'All Room Types'
      this.selectedBookingFilter = 'All Booking'
      this.closeAllDropdowns()
    },

    // Reset to default state
    resetFilters() {
      this.searchQuery = ''
      this.selectedReservationFilter = 'All Reservations'
      this.selectedRoomTypeFilter = 'All Room Types'
      this.selectedBookingFilter = 'All Booking'
      this.showReservationDropdown = false
      this.showRoomTypeDropdown = false
      this.showBookingDropdown = false
    },

    // Apply multiple filters at once
    applyFilters(filters: {
      search?: string
      reservation?: string
      roomType?: string
      booking?: string
    }) {
      if (filters.search !== undefined) this.searchQuery = filters.search
      if (filters.reservation !== undefined) this.selectedReservationFilter = filters.reservation
      if (filters.roomType !== undefined) this.selectedRoomTypeFilter = filters.roomType
      if (filters.booking !== undefined) this.selectedBookingFilter = filters.booking
      this.closeAllDropdowns()
    },

    // Save current filters (for later restoration)
    saveCurrentFilters() {
      return {
        search: this.searchQuery,
        reservation: this.selectedReservationFilter,
        roomType: this.selectedRoomTypeFilter,
        booking: this.selectedBookingFilter,
      }
    },

    // Restore saved filters
    restoreFilters(savedFilters: {
      search: string
      reservation: string
      roomType: string
      booking: string
    }) {
      this.searchQuery = savedFilters.search
      this.selectedReservationFilter = savedFilters.reservation
      this.selectedRoomTypeFilter = savedFilters.roomType
      this.selectedBookingFilter = savedFilters.booking
      this.closeAllDropdowns()
    },
  },

  // Persist filters in localStorage
  persist: {
    key: 'frontdesk-filters',
    storage: localStorage,
    pick: [
      'searchQuery',
      'selectedReservationFilter',
      'selectedRoomTypeFilter', 
      'selectedBookingFilter'
    ], // Don't persist dropdown states
  },
})