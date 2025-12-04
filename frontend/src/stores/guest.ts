import { defineStore } from 'pinia'
import type { Guest } from '@/types/hotel'
import { api } from '@/utils/api'

interface GuestState {
  guests: Guest[]
  loading: boolean
  error: string | null
}

export const useGuestStore = defineStore('guest', {
  state: (): GuestState => ({
    guests: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchGuests() {
      this.loading = true
      this.error = null
      try {
        const response = await api.guests.getAll()
        if (Array.isArray(response)) {
          this.guests = response
        } else if (Array.isArray(response.data)) {
          this.guests = response.data
        } else {
          this.guests = []
          this.error = (response && response.error) || 'Failed to fetch guests'
        }
      } catch (error: any) {
        this.error = error?.message || 'Failed to fetch guests'
      } finally {
        this.loading = false
      }
    },

    async addGuest(guest: Guest) {
      this.loading = true
      this.error = null
      try {
        const response = await api.guests.create(guest)
        if (response.success && response.data) {
          this.guests.push(response.data)
        } else {
          this.error = response.error || 'Failed to add guest'
        }
      } catch (error: any) {
        this.error = error?.message || 'Failed to add guest'
      } finally {
        this.loading = false
      }
    },

    // Optionally: implement updateGuest, deleteGuest
  },
})
