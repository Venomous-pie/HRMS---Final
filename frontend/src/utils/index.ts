export {
  getTodayAtMidnight,
  formatDateForInput,
  getTodayAsString,
  createDateFromString,
  compareDateStrings,
  isDateInPast,
  isDateToday,
  isDateInFuture,
  addDaysToDateString,
  daysBetweenDates,
} from '@/utils/date'

// Reservation utilities
export {
  findReservationForRoomAndDate,
  isRoomAvailableOnDate,
  getAvailableRoomCount,
  formatReservationDateRange,
  overlapsExclusive,
  roomHasConflict,
  isRoomAvailableForRange,
} from '@/utils/reservations'

// Color and status utilities
export {
  getReservationStatusColor,
  getReservationAccentColor,
  getRoomStatusColor,
} from '@/utils/colors'

// Gantt chart utilities
export {
  calculateReservationSpanStyle,
  findDateRangeIndices,
  generateDateRange,
  validateGanttLayout,
  normalizeDateString,
  validateReservationVisibility,
  GANTT_LAYOUT,
} from '@/utils/gantt'
