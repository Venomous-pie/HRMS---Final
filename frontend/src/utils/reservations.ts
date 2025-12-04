/**
 * Reservation utility functions
 * Pure functions for reservation-related business logic
 */

import type { Reservation } from '@/types/hotel'

/**
 * Find reservation for specific room and date
 * @param reservations - Array of reservations to search
 * @param roomNumber - Room number to check
 * @param date - Date to check (ISO string format)
 * @returns Reservation object if found, undefined otherwise
 */
export const findReservationForRoomAndDate = (
  reservations: Reservation[],
  roomNumber: string,
  date: string,
): Reservation | undefined => {
  return reservations.find((reservation) => {
    // Use string-based date comparison to avoid timezone issues
    const checkInStr = (reservation.checkIn || reservation.checkInDate || '')
      .toString()
      .split('T')[0]
    const checkOutStr = (reservation.checkOut || reservation.checkOutDate || '')
      .toString()
      .split('T')[0]
    const targetDateStr = date.split('T')[0]

    const resRoomNumber = (reservation.room || reservation.roomNumber || '').toString()
    return (
      resRoomNumber === roomNumber.toString() &&
      targetDateStr >= checkInStr &&
      targetDateStr < checkOutStr
    ) // Exclusive checkout (guest shown until day before checkout)
  })
}

/**
 * Check if room is available on a specific date
 * @param reservations - Array of reservations to check against
 * @param roomNumber - Room number to check
 * @param date - Date to check availability for
 * @returns True if room is available, false if occupied
 */
export const isRoomAvailableOnDate = (
  reservations: Reservation[],
  roomNumber: string,
  date: string,
): boolean => {
  // Normalize target date to YYYY-MM-DD to avoid timezone issues
  const targetDateStr = date.split('T')[0]

  // Room is unavailable if any active reservation either:
  // - Covers the target date (inclusive of checkout day), or
  // - Has a checkout where the day AFTER checkout is the target date (buffer/turnover day)
  const hasBlockingReservation = reservations.some((reservation) => {
    const status = reservation.status
    // Ignore cancelled or already checked-out reservations
    if (status === 'cancelled' || status === 'checkedOut') return false

    const resRoomNumber = (reservation.room || reservation.roomNumber || '').toString()
    if (resRoomNumber !== roomNumber.toString()) return false

    const checkInStr = (reservation.checkIn || reservation.checkInDate || '')
      .toString()
      .split('T')[0]
    const checkOutStr = (reservation.checkOut || reservation.checkOutDate || '')
      .toString()
      .split('T')[0]
    if (!checkInStr || !checkOutStr) return false

    // Exclusive checkout: guest occupies from check-in up to (but not including) checkout day
    const occupiesTarget = targetDateStr >= checkInStr && targetDateStr < checkOutStr

    return occupiesTarget
  })

  return !hasBlockingReservation
}

/**
 * Get available room count for a category on a specific date
 * @param rooms - Array of rooms in the category
 * @param reservations - Array of reservations to check against
 * @param date - Date to check availability for
 * @returns Number of available rooms in the category
 */
export const getAvailableRoomCount = (
  rooms: any[],
  reservations: Reservation[],
  date: string,
): number => {
  return rooms.filter((room: any) => {
    // Check room status first
    if (room.status === 'out-of-order' || room.status === 'maintenance') {
      return false
    }

    // Check if room is available on this specific date
    return isRoomAvailableOnDate(reservations, room.number, date)
  }).length
}

/**
 * Format date range for display (e.g., "Jan 15 - Jan 18")
 * @param reservation - Reservation object with check-in/check-out dates
 * @returns Formatted date range string
 */
export const formatReservationDateRange = (reservation: any): string => {
  const checkIn = reservation.checkIn || reservation.checkInDate
  const checkOut = reservation.checkOut || reservation.checkOutDate

  if (!checkIn || !checkOut) return 'Invalid dates'

  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })

  return `${formatDate(checkInDate)} - ${formatDate(checkOutDate)}`
}

/**
 * Normalize a date-like value to YYYY-MM-DD (date-only) string.
 */
const normalizeDate = (d: string | Date): string => {
  const s = typeof d === 'string' ? d : d.toISOString()
  return s.split('T')[0]
}

/**
 * Exclusive overlap check for reservation ranges.
 * Returns true when [aStart, aEnd) overlaps with [bStart, bEnd).
 * Uses date-only string comparison to avoid timezone issues.
 */
export const overlapsExclusive = (
  aStart: string | Date,
  aEnd: string | Date,
  bStart: string | Date,
  bEnd: string | Date,
): boolean => {
  const as = normalizeDate(aStart)
  const ae = normalizeDate(aEnd)
  const bs = normalizeDate(bStart)
  const be = normalizeDate(bEnd)
  return as < be && ae > bs
}

/**
 * Check if a room has any conflicting reservations over a date range.
 * Checkout is exclusive; cancelled reservations ignored.
 */
export const roomHasConflict = (
  reservations: Reservation[],
  roomNumber: string,
  start: string | Date,
  end: string | Date,
): boolean => {
  return reservations.some((res) => {
    const resRoomNumber = (res.room || res.roomNumber || '').toString()
    if (resRoomNumber !== roomNumber.toString()) return false
    if (res.status === 'cancelled') return false

    const checkInStr = (res.checkIn || res.checkInDate || '').toString()
    const checkOutStr = (res.checkOut || res.checkOutDate || '').toString()
    if (!checkInStr || !checkOutStr) return false
    return overlapsExclusive(start, end, checkInStr, checkOutStr)
  })
}

/**
 * Determine if a room is available for a date range.
 */
export const isRoomAvailableForRange = (
  reservations: Reservation[],
  roomNumber: string,
  start: string | Date,
  end: string | Date,
): boolean => {
  return !roomHasConflict(reservations, roomNumber, start, end)
}
