import { computed, type Ref } from 'vue'
import type { Reservation } from '@/types/hotel'

export const useReservationSearch = (
  reservations: Ref<Reservation[]>,
  searchQuery: Ref<string>,
) => {
  const searchReservations = (query: string): Reservation[] => {
    if (!query || !query.trim()) {
      return reservations.value
    }

    const normalizedQuery = query.toLowerCase().trim()

    return reservations.value.filter((reservation) => {
      const guestName = (reservation.guest || reservation.guestName || '').toLowerCase()
      const bookingId = (reservation.id || reservation.bookingNumber || '').toString().toLowerCase()
      const roomNumber = (reservation.room || reservation.roomNumber || '').toString().toLowerCase()

      return (
        guestName.includes(normalizedQuery) ||
        bookingId.includes(normalizedQuery) ||
        roomNumber.includes(normalizedQuery)
      )
    })
  }

  const sortReservationsByPriority = (reservationList: Reservation[]): Reservation[] => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return reservationList.sort((a, b) => {
      const aCheckIn = new Date(a.checkIn || a.checkInDate || '')
      const aCheckOut = new Date(a.checkOut || a.checkOutDate || '')
      const bCheckIn = new Date(b.checkIn || b.checkInDate || '')
      const bCheckOut = new Date(b.checkOut || b.checkOutDate || '')

      aCheckIn.setHours(0, 0, 0, 0)
      aCheckOut.setHours(0, 0, 0, 0)
      bCheckIn.setHours(0, 0, 0, 0)
      bCheckOut.setHours(0, 0, 0, 0)

      const aIsCurrent = today >= aCheckIn && today < aCheckOut
      const bIsCurrent = today >= bCheckIn && today < bCheckOut

      if (aIsCurrent && !bIsCurrent) return -1
      if (!aIsCurrent && bIsCurrent) return 1

      const aIsUpcoming = aCheckIn >= today
      const bIsUpcoming = bCheckIn >= today

      if (aIsUpcoming && !bIsUpcoming) return -1
      if (!aIsUpcoming && bIsUpcoming) return 1

      return (
        Math.abs(aCheckIn.getTime() - today.getTime()) -
        Math.abs(bCheckIn.getTime() - today.getTime())
      )
    })
  }

  const findBestMatchingReservation = (query: string): Reservation | undefined => {
    const matchingReservations = searchReservations(query)

    if (matchingReservations.length === 0) {
      return undefined
    }

    const sortedReservations = sortReservationsByPriority(matchingReservations)
    return sortedReservations[0]
  }

  const filterReservationsByStatus = (
    reservationList: Reservation[],
    statusFilter: string,
  ): Reservation[] => {
    if (statusFilter === 'All Reservations') {
      return reservationList
    }

    const statusMap: Record<string, string> = {
      Confirmed: 'confirmed',
      Pending: 'pending',
      'Checked In': 'checkedIn',
      Cancelled: 'cancelled',
    }

    const targetStatus = statusMap[statusFilter]
    if (!targetStatus) {
      return reservationList
    }

    return reservationList.filter((res) => res.status === targetStatus)
  }

  const filterReservationsBySource = (
    reservationList: Reservation[],
    sourceFilter: string,
  ): Reservation[] => {
    if (sourceFilter === 'All Booking') {
      return reservationList
    }

    const sourceMap: Record<string, string> = {
      Direct: 'direct',
      'Booking.com': 'booking.com',
      Expedia: 'expedia',
      Airbnb: 'airbnb',
    }

    const targetSource = sourceMap[sourceFilter] || sourceFilter.toLowerCase()

    return reservationList.filter((res) => (res.source || '').toLowerCase().includes(targetSource))
  }

  const searchResults = computed(() => {
    return searchReservations(searchQuery.value)
  })

  return {
    searchReservations,
    sortReservationsByPriority,
    findBestMatchingReservation,
    filterReservationsByStatus,
    filterReservationsBySource,
    searchResults,
  }
}
