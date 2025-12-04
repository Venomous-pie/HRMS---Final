import { computed, type Ref } from 'vue'
import type { Reservation } from '@/types/hotel'
import {
  findReservationForRoomAndDate,
  isRoomAvailableOnDate,
  getAvailableRoomCount,
} from '@/utils/reservations'
import {
  normalizeDateString,
  validateReservationVisibility,
} from '@/utils/gantt'

export const useReservationManagement = (
  reservations: Ref<Reservation[]>,
  searchQuery: Ref<string>,
  reservationFilter: Ref<string>,
  bookingFilter: Ref<string>,
) => {
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

  const searchReservations = (reservationList: Reservation[], query: string): Reservation[] => {
    if (!query || !query.trim()) {
      return reservationList
    }

    const normalizedQuery = query.toLowerCase().trim()

    return reservationList.filter((reservation) => {
      const guestFirst = (reservation as any).Guest?.firstName || ''
      const guestLast = (reservation as any).Guest?.lastName || ''
      const guestFullFromObject = `${guestFirst} ${guestLast}`.trim()
      const guestName =
        (reservation as any).guest || (reservation as any).guestName || guestFullFromObject
      const guestNameLc = guestName ? guestName.toString().toLowerCase() : ''
      const guestEmailLc = ((reservation as any).Guest?.email || '').toString().toLowerCase()
      const guestPhoneLc = ((reservation as any).Guest?.phone || '').toString().toLowerCase()
      const bookingId = (reservation.id || (reservation as any).bookingNumber || '')
        .toString()
        .toLowerCase()
      const roomNumber =
        (reservation as any).room?.toString().toLowerCase() ||
        (reservation as any).roomNumber?.toString().toLowerCase() ||
        ''

      return (
        guestNameLc.includes(normalizedQuery) ||
        guestEmailLc.includes(normalizedQuery) ||
        guestPhoneLc.includes(normalizedQuery) ||
        bookingId.includes(normalizedQuery) ||
        roomNumber.includes(normalizedQuery) ||
        (reservation as any).Guest?.firstName?.toLowerCase().includes(normalizedQuery) ||
        (reservation as any).Guest?.lastName?.toLowerCase().includes(normalizedQuery)
      )
    })
  }

  const filteredReservations = computed(() => {
    let filtered = reservations.value

    if (reservationFilter.value !== 'All Reservations') {
      filtered = filterReservationsByStatus(filtered, reservationFilter.value)
    }

    if (bookingFilter.value !== 'All Booking') {
      filtered = filterReservationsBySource(filtered, bookingFilter.value)
    }

    if (searchQuery.value.trim()) {
      filtered = searchReservations(filtered, searchQuery.value)
    }

    return filtered
  })

  const getReservation = (roomNumber: string, date: string): Reservation | undefined => {
    return findReservationForRoomAndDate(filteredReservations.value, roomNumber, date)
  }

  const isRoomAvailable = (roomNumber: string, date: string): boolean => {
    return isRoomAvailableOnDate(filteredReservations.value, roomNumber, date)
  }

  const getAvailableRoomCountForDate = (category: any, date: string): number => {
    return getAvailableRoomCount(category.rooms, filteredReservations.value, date)
  }

  const getRoomReservations = (roomNumber: string): Reservation[] => {
    return filteredReservations.value.filter((res) => {
      const resRoomNumber = (res.room || res.roomNumber || '').toString()
      return resRoomNumber === roomNumber.toString()
    })
  }

  const reservationOverlapsDateRange = (
    reservation: Reservation,
    startDate: string,
    endDate: string,
  ): boolean => {
    const checkInRaw = reservation.checkIn || reservation.checkInDate || ''
    const checkOutRaw = reservation.checkOut || reservation.checkOutDate || ''
    const checkInStr = (
      typeof checkInRaw === 'string' ? checkInRaw : checkInRaw.toISOString()
    ).split('T')[0]
    const checkOutStr = (
      typeof checkOutRaw === 'string' ? checkOutRaw : checkOutRaw.toISOString()
    ).split('T')[0]

    return checkInStr <= endDate && checkOutStr >= startDate
  }

  const getReservationSpans = (
    roomNumber: string,
    dateRange: Array<{ date: string }>,
    getRoomTopPosition: (roomNumber: string) => number,
    findDateRangeIndices: (
      dateRange: any[],
      checkIn: string,
      checkOut: string,
    ) => { startIndex: number; endIndex: number } | null,
    calculateReservationSpanStyle: (startIndex: number, endIndex: number, top: number) => any,
  ) => {
    const spans: Array<{
      key: string | number
      reservation: Reservation
      isStart: boolean
      isEnd: boolean
      style: any
    }> = []

    const roomReservations = getRoomReservations(roomNumber)

    for (const reservation of roomReservations) {
      // Skip cancelled reservations - they should not appear in Gantt chart
      if (reservation.status === 'cancelled') {
        continue
      }

      const checkInRaw = reservation.checkIn || reservation.checkInDate || ''
      const checkOutRaw = reservation.checkOut || reservation.checkOutDate || ''

      const checkInStr = normalizeDateString(checkInRaw)
      const checkOutStr = normalizeDateString(checkOutRaw)

      if (!checkInStr || !checkOutStr) {
        continue
      }

      const dateIndices = findDateRangeIndices(dateRange, checkInStr, checkOutStr)

      if (dateIndices) {
        const { startIndex, endIndex } = dateIndices
        const firstVisible = dateRange[0].date.split('T')[0]
        const lastVisible = dateRange[dateRange.length - 1].date.split('T')[0]
        const top = getRoomTopPosition(roomNumber)

        const style = calculateReservationSpanStyle(startIndex, endIndex, top)

        spans.push({
          key: reservation.id || reservation.bookingNumber || `${roomNumber}-${startIndex}`,
          reservation,
          isStart: checkInStr >= firstVisible,
          isEnd: checkOutStr <= lastVisible,
          style,
        })
      }
    }

    return spans
  }

  const reservationStats = computed(() => {
    const total = filteredReservations.value.length
    const byStatus = filteredReservations.value.reduce(
      (acc, res) => {
        acc[res.status] = (acc[res.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      total,
      byStatus,
      confirmed: byStatus.confirmed || 0,
      pending: byStatus.pending || 0,
      checkedIn: byStatus.checkedIn || 0,
      cancelled: byStatus.cancelled || 0,
    }
  })

  const getReservationsInDateRange = (startDate: string, endDate: string): Reservation[] => {
    return filteredReservations.value.filter((reservation) =>
      reservationOverlapsDateRange(reservation, startDate, endDate),
    )
  }

  return {
    filteredReservations,
    filterReservationsByStatus,
    filterReservationsBySource,
    searchReservations,
    getReservation,
    isRoomAvailable,
    getAvailableRoomCountForDate,
    getRoomReservations,
    reservationOverlapsDateRange,
    getReservationSpans,
    reservationStats,
    getReservationsInDateRange,
  }
}
