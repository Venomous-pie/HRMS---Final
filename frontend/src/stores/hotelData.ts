import { defineStore } from 'pinia'
import type { Room, Reservation } from '@/types/hotel'
import { getRooms } from '@/services/rooms'
import { getReservations as fetchReservationsService } from '@/services/reservations'

export interface HotelDataState {
  rooms: Room[]
  reservations: Reservation[]
  loading: boolean
  error: string | null
  lastFetchTime: number | null
}

export const useHotelDataStore = defineStore('hotelData', {
  state: (): HotelDataState => ({
    rooms: [],
    reservations: [],
    loading: false,
    error: null,
    lastFetchTime: null,
  }),

  getters: {
    // Get rooms by type
    roomsByType: (state) => {
      const grouped: Record<string, Room[]> = {}
      state.rooms.forEach((room) => {
        if (!grouped[room.type]) grouped[room.type] = []
        grouped[room.type].push(room)
      })
      return grouped
    },

    // Get available rooms count
    totalRoomsCount: (state) => state.rooms.length,

    // Get reservations by status
    reservationsByStatus: (state) => {
      const grouped: Record<string, Reservation[]> = {}
      state.reservations.forEach((reservation) => {
        if (!grouped[reservation.status]) grouped[reservation.status] = []
        grouped[reservation.status].push(reservation)
      })
      return grouped
    },

    // Get total reservations count
    totalReservationsCount: (state) => state.reservations.length,

    // Check if data is stale (older than 5 minutes)
    isDataStale: (state) => {
      if (!state.lastFetchTime) return true
      return Date.now() - state.lastFetchTime > 5 * 60 * 1000 // 5 minutes
    },

    // Get room by number
    getRoomByNumber: (state) => (roomNumber: string) => {
      return state.rooms.find((room) => room.number === roomNumber || room.id === roomNumber)
    },

    // Get reservation by ID
    getReservationById: (state) => (id: string) => {
      return state.reservations.find((reservation) => 
        reservation.id === id || (reservation as any).bookingNumber === id
      )
    },

    // Get reservations for a specific room
    getReservationsForRoom: (state) => (roomNumber: string) => {
      return state.reservations.filter((reservation) => {
        const resRoomNumber = (reservation as any).room || (reservation as any).roomNumber || ''
        return resRoomNumber.toString() === roomNumber.toString()
      })
    },
  },

  actions: {
    async fetchRooms() {
      try {
        this.loading = true
        this.error = null
        
        // Check if we have an auth token
        const authToken = localStorage.getItem('auth_token')
        if (!authToken) {
          throw new Error('No authentication token found. Please log in again.')
        }
        
        this.rooms = await getRooms()
      } catch (error: any) {
        this.error = 'Error fetching rooms: ' + (error?.message || 'Unknown error')
        console.error('Error fetching rooms:', error)
        
        // If it's an authentication error, don't throw - just log it
        if (error?.message?.includes('Access token required') || error?.status === 401) {
          console.warn('Authentication required for rooms API')
          return
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchReservations() {
      try {
        this.loading = true
        this.error = null
        
        // Check if we have an auth token
        const authToken = localStorage.getItem('auth_token')
        if (!authToken) {
          throw new Error('No authentication token found. Please log in again.')
        }
        
        this.reservations = await fetchReservationsService()
      } catch (error: any) {
        this.error = 'Error fetching reservations: ' + (error?.message || 'Unknown error')
        console.error('Error fetching reservations:', error)
        
        // If it's an authentication error, don't throw - just log it
        if (error?.message?.includes('Access token required') || error?.status === 401) {
          console.warn('Authentication required for reservations API')
          return
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    async refreshAll() {
      this.loading = true
      this.error = null
      
      try {
        await Promise.all([this.fetchRooms(), this.fetchReservations()])
        this.lastFetchTime = Date.now()
      } catch (error: any) {
        this.error = 'Failed to load hotel data: ' + (error?.message || 'Unknown error')
        console.error('Error refreshing hotel data:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Refresh only if data is stale
    async refreshIfStale() {
      if (this.isDataStale) {
        await this.refreshAll()
      }
    },

    // Clear all data
    clearData() {
      this.rooms = []
      this.reservations = []
      this.error = null
      this.lastFetchTime = null
    },

    // Clear only error
    clearError() {
      this.error = null
    },
  },
})