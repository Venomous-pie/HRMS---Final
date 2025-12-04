/**
 * Reservation business logic composable
 * Encapsulates room availability and reservation lookup logic
 */

import { type Ref } from 'vue'
import type { Reservation } from '@/types/hotel'
import {
  findReservationForRoomAndDate,
  isRoomAvailableOnDate,
  getAvailableRoomCount,
} from '@/utils/reservations'

export const useReservationLogic = (reservations: Ref<Reservation[]>) => {
  /**
   * Get reservation for specific room and date
   * @param roomNumber - Room number to check
   * @param date - Date to check (ISO string format)
   * @returns Reservation object if found, undefined otherwise
   */
  const getReservation = (roomNumber: string, date: string): Reservation | undefined => {
    return findReservationForRoomAndDate(reservations.value, roomNumber, date)
  }

  /**
   * Check if room is available on a specific date
   * @param roomNumber - Room number to check
   * @param date - Date to check availability for
   * @returns True if room is available, false if occupied
   */
  const isRoomAvailable = (roomNumber: string, date: string): boolean => {
    return isRoomAvailableOnDate(reservations.value, roomNumber, date)
  }

  /**
   * Get available room count for a category on a specific date
   * @param category - Room category object with rooms array
   * @param date - Date to check availability for
   * @returns Number of available rooms in the category
   */
  const getAvailableRoomCountForDate = (category: any, date: string): number => {
    return getAvailableRoomCount(category.rooms, reservations.value, date)
  }

  /**
   * Get all reservations for a specific room
   * @param roomNumber - Room number to get reservations for
   * @returns Array of reservations for the room
   */
  const getRoomReservations = (roomNumber: string): Reservation[] => {
    return reservations.value.filter((res) => {
      const resRoomNumber = (res.room || res.roomNumber || '').toString()
      return resRoomNumber === roomNumber.toString()
    })
  }

  /**
   * Check if a reservation overlaps with a date range
   * @param reservation - Reservation to check
   * @param startDate - Start date (ISO string)
   * @param endDate - End date (ISO string)
   * @returns True if reservation overlaps with the date range
   */
  const reservationOverlapsDateRange = (
    reservation: Reservation,
    startDate: string,
    endDate: string,
  ): boolean => {
    const checkInStr = (reservation.checkIn || reservation.checkInDate || '')
      .toString()
      .split('T')[0]
    const checkOutStr = (reservation.checkOut || reservation.checkOutDate || '')
      .toString()
      .split('T')[0]

    // Check for overlap using string comparison
    return checkInStr <= endDate && checkOutStr >= startDate
  }

  return {
    getReservation,
    isRoomAvailable,
    getAvailableRoomCountForDate,
    getRoomReservations,
    reservationOverlapsDateRange,
  }
}
