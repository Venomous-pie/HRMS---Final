export const GANTT_LAYOUT = {
  ROOM_COLUMN_WIDTH: 270,
  CELL_WIDTH: 61.5,
  TOTAL_DATE_COLUMNS: 16,
  RESERVATION_HEIGHT: 24,
} as const

// Runtime-measured cell width (falls back to GANTT_LAYOUT.CELL_WIDTH)
let measuredCellWidth: number | null = null

export function setMeasuredCellWidth(width: number) {
  if (Number.isFinite(width) && width > 0) {
    measuredCellWidth = width
  }
}

export function getCellWidth(): number {
  return measuredCellWidth ?? GANTT_LAYOUT.CELL_WIDTH
}

export const calculateReservationSpanStyle = (
  startIndex: number,
  endIndex: number,
  rowTop: number,
): { left: string; width: string; top: string; height: string } => {
  const { ROOM_COLUMN_WIDTH } = GANTT_LAYOUT
  const CELL_WIDTH = getCellWidth()

  const widthCells = endIndex - startIndex + 1

  const CELL_PADDING = 2
  const SPAN_INSET = 1

  const START_END_MARGIN = (CELL_WIDTH * 0.75) / 4
  const CHECKIN_GAP = CELL_WIDTH * 0.1 // Small gap to prevent reservations from touching
  const left =
    ROOM_COLUMN_WIDTH + startIndex * CELL_WIDTH + CELL_PADDING + SPAN_INSET + START_END_MARGIN + CHECKIN_GAP

  // Reduce width by half a cell to not fully cover checkout date
  // This creates visual separation for consecutive reservations
  const CHECKOUT_OVERLAP = CELL_WIDTH * 0.5
  const width =
    widthCells * CELL_WIDTH -
    2 * CELL_PADDING -
    2 * SPAN_INSET -
    2 * START_END_MARGIN -
    CHECKOUT_OVERLAP -
    CHECKIN_GAP

  return {
    left: `${left}px`,
    width: `${width}px`,
    top: `${rowTop}px`,
    height: `${GANTT_LAYOUT.RESERVATION_HEIGHT}px`,
  }
}

export const findDateRangeIndices = (
  dateRange: Array<{ date: string }>,
  checkInStr: string,
  checkOutStr: string,
): { startIndex: number; endIndex: number } | null => {
  // First check if check-in date is visible in the current date range
  const firstVisible = dateRange[0]?.date.split('T')[0]
  const lastVisible = dateRange[dateRange.length - 1]?.date.split('T')[0]
  
  // Hide reservations if check-in date is not within visible range
  if (checkInStr < firstVisible || checkInStr > lastVisible) {
    return null
  }

  let startIndex = -1
  let endIndex = -1

  dateRange.forEach((d, idx) => {
    const dayStr = d.date.split('T')[0]
    if (dayStr >= checkInStr && dayStr <= checkOutStr) {
      if (startIndex === -1) startIndex = idx
      endIndex = idx
    }
  })

  const result = startIndex !== -1 && endIndex !== -1 ? { startIndex, endIndex } : null

  return result
}

export const validateGanttLayout = () => {
  const { ROOM_COLUMN_WIDTH, CELL_WIDTH, TOTAL_DATE_COLUMNS } = GANTT_LAYOUT
  const EXPECTED_MIN_WIDTH = ROOM_COLUMN_WIDTH + TOTAL_DATE_COLUMNS * CELL_WIDTH

  return {
    roomColumnWidth: ROOM_COLUMN_WIDTH,
    cellWidth: CELL_WIDTH,
    totalDateColumns: TOTAL_DATE_COLUMNS,
    expectedMinWidth: EXPECTED_MIN_WIDTH,
  }
}


export const normalizeDateString = (dateInput: string | Date): string => {
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput

    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')

    return `${year}-${month}-${day}`
  } catch (error) {
    return ''
  }
}

export const validateReservationVisibility = (
  checkInStr: string,
  checkOutStr: string,
  dateRange: Array<{ date: string }>,
) => {
  const firstVisible = dateRange[0]?.date.split('T')[0]
  const lastVisible = dateRange[dateRange.length - 1]?.date.split('T')[0]

  const overlaps = checkInStr < lastVisible && checkOutStr > firstVisible

  return {
    checkIn: checkInStr,
    checkOut: checkOutStr,
    visibleRange: { first: firstVisible, last: lastVisible },
    overlaps,
    reason: overlaps
      ? 'visible'
      : checkOutStr <= firstVisible
        ? 'before visible range'
        : checkInStr >= lastVisible
          ? 'after visible range'
          : 'unknown',
  }
}

export const generateDateRange = (
  startDate: Date,
  numberOfDays: number = GANTT_LAYOUT.TOTAL_DATE_COLUMNS,
): Array<{ date: string; dayName: string; dayNumber: string }> => {
  const days = []
  const baseDate = new Date(startDate)

  for (let i = 0; i < numberOfDays; i++) {
    const date = new Date(baseDate)
    date.setDate(baseDate.getDate() + i)

    days.push({
      date: `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: date.getDate().toString().padStart(2, '0'),
    })
  }

  return days
}
