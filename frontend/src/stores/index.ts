// Core Data Stores
export { useHotelDataStore } from './hotelData'
export { useFrontdeskFiltersStore } from './frontdeskFilters'
export { useDateNavigationStore } from './dateNavigation'

// Utility Stores
export { useFilterOptionsStore } from './filterOptions'

// Global State Stores
export { useAuthStore } from './auth'
export { useNotificationsStore } from './notifications'
export { useUIStore } from './ui'

// REMOVED: useReservationManagementStore (over-engineered)
// Use existing composables: useReservationManagement, useReservationSearch

// Store Types
export type { HotelDataState } from './hotelData'
export type { FrontdeskFiltersState } from './frontdeskFilters'
export type { DateNavigationState } from './dateNavigation'
export type { Notification } from './notifications'

// Re-export store interfaces if needed

