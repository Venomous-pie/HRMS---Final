import { computed, ref, watch, type Ref } from 'vue'
import { getTodayAtMidnight } from '@/utils/date'
import { generateDateRange, validateGanttLayout } from '@/utils/gantt'
import type { Reservation } from '@/types/hotel'

export const useGanttNavigation = (
  selectedYear: Ref<number>,
  selectedMonth: Ref<number>,
  searchQuery: Ref<string>,
  reservations: Ref<Reservation[]>,
  targetDate?: Ref<Date | null>,
) => {
  const viewStartDate = ref<Date>(new Date())

  const isInternalNavigation = ref(false)
  const highlightedReservation = ref<string | null>(null)

  const dateRange = computed(() => {
    return generateDateRange(viewStartDate.value)
  })

  const initializeViewDate = () => {
    const today = getTodayAtMidnight()
    viewStartDate.value = today
  }

  const navigateDates = (direction: number) => {
    const newStartDate = new Date(viewStartDate.value)
    newStartDate.setDate(newStartDate.getDate() + direction * 5)

    viewStartDate.value = newStartDate

    const newYear = newStartDate.getFullYear()
    const newMonth = newStartDate.getMonth()

    if (newYear !== selectedYear.value || newMonth !== selectedMonth.value) {
      isInternalNavigation.value = true

      return { year: newYear, month: newMonth }
    }

    return null
  }

  const jumpToToday = () => {
    const today = getTodayAtMidnight()
    isInternalNavigation.value = true

    viewStartDate.value = today

    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth()

    return { year: currentYear, month: currentMonth }
  }

  const navigateToDate = (targetDateStr: string) => {
    const target = new Date(targetDateStr)

    const newViewStart = new Date(target)
    newViewStart.setDate(target.getDate() - 2)

    viewStartDate.value = newViewStart

    const newYear = target.getFullYear()
    const newMonth = target.getMonth()

    if (newYear !== selectedYear.value || newMonth !== selectedMonth.value) {
      isInternalNavigation.value = true
      return { year: newYear, month: newMonth }
    }

    return null
  }

  const findAndNavigateToReservation = (query: string): Reservation | null => {
    if (!query || !query.trim()) {
      highlightedReservation.value = null
      return null
    }

    const normalizedQuery = query.toLowerCase().trim()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Find matching reservations
    const matchingReservations = reservations.value.filter((reservation) => {
      const guestName = (reservation.guest || reservation.guestName || '').toLowerCase()
      const bookingId = (reservation.id || reservation.bookingNumber || '').toString().toLowerCase()
      const roomNumber = (reservation.room || reservation.roomNumber || '').toString().toLowerCase()

      return (
        guestName.includes(normalizedQuery) ||
        bookingId.includes(normalizedQuery) ||
        roomNumber.includes(normalizedQuery)
      )
    })

    if (matchingReservations.length === 0) {
      return null
    }

    // Sort by preference: current reservations first, then upcoming, then past
    const sortedReservations = matchingReservations.sort((a, b) => {
      const aCheckIn = new Date(a.checkIn || a.checkInDate || '')
      const aCheckOut = new Date(a.checkOut || a.checkOutDate || '')
      const bCheckIn = new Date(b.checkIn || b.checkInDate || '')
      const bCheckOut = new Date(b.checkOut || b.checkOutDate || '')

      aCheckIn.setHours(0, 0, 0, 0)
      aCheckOut.setHours(0, 0, 0, 0)
      bCheckIn.setHours(0, 0, 0, 0)
      bCheckOut.setHours(0, 0, 0, 0)

      // Current reservations (today is between check-in and check-out)
      const aIsCurrent = today >= aCheckIn && today < aCheckOut
      const bIsCurrent = today >= bCheckIn && today < bCheckOut

      if (aIsCurrent && !bIsCurrent) return -1
      if (!aIsCurrent && bIsCurrent) return 1

      // If both or neither are current, prefer upcoming reservations
      const aIsUpcoming = aCheckIn >= today
      const bIsUpcoming = bCheckIn >= today

      if (aIsUpcoming && !bIsUpcoming) return -1
      if (!aIsUpcoming && bIsUpcoming) return 1

      // If same category, sort by check-in date (closest first)
      return (
        Math.abs(aCheckIn.getTime() - today.getTime()) -
        Math.abs(bCheckIn.getTime() - today.getTime())
      )
    })

    const bestMatch = sortedReservations[0]

    // Set highlighted reservation
    highlightedReservation.value = bestMatch.id || bestMatch.bookingNumber || null

    // Navigate to the reservation's check-in date
    const checkInDate = bestMatch.checkIn || bestMatch.checkInDate
    if (checkInDate) {
      const dateStr =
        typeof checkInDate === 'string' ? checkInDate : checkInDate.toISOString().split('T')[0]
      navigateToDate(dateStr)
    }

    return bestMatch
  }

  if (targetDate) {
    watch(targetDate, (newTargetDate) => {
      if (newTargetDate && !isInternalNavigation.value) {
        const targetStart = new Date(newTargetDate)
        targetStart.setHours(0, 0, 0, 0)

        viewStartDate.value = targetStart
      }
    })
  }

  watch([selectedYear, selectedMonth], (newValues, oldValues) => {
    const [newYear, newMonth] = newValues
    const [oldYear, oldMonth] = oldValues || [newYear, newMonth]

    if (oldYear !== undefined && oldMonth !== undefined) {
      if (!isInternalNavigation.value) {
        const firstDay = new Date(newYear, newMonth, 1)
        firstDay.setHours(0, 0, 0, 0)
        viewStartDate.value = firstDay
      } else {
      }
    }
  })

  watch(searchQuery, (newQuery) => {
    if (newQuery && newQuery.trim()) {
      const matchingReservation = findAndNavigateToReservation(newQuery)

      if (matchingReservation) {
        setTimeout(() => {
          highlightedReservation.value = null
        }, 3000)
      }
    } else {
      highlightedReservation.value = null
    }
  })

  const validateLayout = () => {
    const layoutInfo = validateGanttLayout()
  }

  const resetInternalNavigation = (delay: number = 100) => {
    setTimeout(() => {
      isInternalNavigation.value = false
    }, delay)
  }

  initializeViewDate()

  return {
    // State
    viewStartDate,
    isInternalNavigation,
    highlightedReservation,

    // Computed
    dateRange,

    // Navigation functions
    navigateDates,
    jumpToToday,
    navigateToDate,
    initializeViewDate,

    // Search navigation
    findAndNavigateToReservation,

    // Utilities
    validateLayout,
    resetInternalNavigation,
  }
}
