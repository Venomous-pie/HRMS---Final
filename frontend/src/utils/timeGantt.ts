export const TIME_GANTT_LAYOUT = {
  DEPARTMENT_COLUMN_WIDTH: 270,
  TIME_CELL_WIDTH: 61.5,
  TOTAL_TIME_COLUMNS: 16,
  TASK_HEIGHT: 24,
} as const

export interface TimeSlot {
  time: string // Format: "HH:mm"
  displayTime: string // Format: "06:00" or "07:59"
}

export const generateTimeRange = (
  startHour: number = 6,
  intervalMinutes: number = 120, // 2 hours default
  numberOfSlots: number = TIME_GANTT_LAYOUT.TOTAL_TIME_COLUMNS
): TimeSlot[] => {
  const slots: TimeSlot[] = []
  const baseDate = new Date()
  baseDate.setHours(startHour, 0, 0, 0)

  for (let i = 0; i < numberOfSlots; i++) {
    const time = new Date(baseDate)
    time.setMinutes(baseDate.getMinutes() + i * intervalMinutes)

    const hours = time.getHours().toString().padStart(2, '0')
    const minutes = time.getMinutes().toString().padStart(2, '0')
    const displayTime = `${hours}:${minutes}`

    slots.push({
      time: displayTime,
      displayTime: displayTime,
    })
  }

  return slots
}

export const findTimeRangeIndices = (
  timeSlots: TimeSlot[],
  startTime: string,
  endTime: string
): { startIndex: number; endIndex: number } | null => {
  let startIndex = -1
  let endIndex = -1

  timeSlots.forEach((slot, idx) => {
    if (slot.time >= startTime && startIndex === -1) {
      startIndex = idx
    }
    if (slot.time <= endTime) {
      endIndex = idx
    }
  })

  return startIndex !== -1 && endIndex !== -1 ? { startIndex, endIndex } : null
}

export const calculateTaskSpanStyle = (
  startIndex: number,
  endIndex: number,
  rowTop: number
): { left: string; width: string; top: string; height: string } => {
  const { DEPARTMENT_COLUMN_WIDTH } = TIME_GANTT_LAYOUT
  const CELL_WIDTH = TIME_GANTT_LAYOUT.TIME_CELL_WIDTH
  const ROW_HEIGHT = 48 // Height of each row cell (h-48px)
  const TASK_HEIGHT = TIME_GANTT_LAYOUT.TASK_HEIGHT

  const widthCells = endIndex - startIndex + 1

  const CELL_PADDING = 2
  const SPAN_INSET = 1
  const START_END_MARGIN = (CELL_WIDTH * 0.75) / 4
  const CHECKIN_GAP = CELL_WIDTH * 0.1
  const left =
    DEPARTMENT_COLUMN_WIDTH + startIndex * CELL_WIDTH + CELL_PADDING + SPAN_INSET + START_END_MARGIN + CHECKIN_GAP

  const CHECKOUT_OVERLAP = CELL_WIDTH * 0.5
  const width =
    widthCells * CELL_WIDTH -
    2 * CELL_PADDING -
    2 * SPAN_INSET -
    2 * START_END_MARGIN -
    CHECKOUT_OVERLAP -
    CHECKIN_GAP

  // Center the span vertically in the row
  // Row height is 48px, task height is 24px, so center offset is (48 - 24) / 2 = 12px
  const verticalCenterOffset = (ROW_HEIGHT - TASK_HEIGHT) / 2
  const centeredTop = rowTop + verticalCenterOffset

  return {
    left: `${left}px`,
    width: `${width}px`,
    top: `${centeredTop}px`,
    height: `${TASK_HEIGHT}px`,
  }
}

