export const TIME_GANTT_LAYOUT = {
  DEPARTMENT_COLUMN_WIDTH: 270,
  TIME_CELL_WIDTH: 61.5,
  TOTAL_TIME_COLUMNS: 16,
  TASK_HEIGHT: 24,
} as const

export interface TimeSlot {
  time: string // Format: "HH:mm" (24-hour for internal comparison)
  displayTime: string // Format: "6:00 AM" or "7:59 AM" (12-hour for display)
}

/**
 * Converts 12-hour format to 24-hour format for comparison
 * Input: "2:00 PM" -> Output: "14:00"
 * Input: "9:30 AM" -> Output: "09:30"
 * Input: "12:00 AM" -> Output: "00:00"
 * Input: "12:00 PM" -> Output: "12:00"
 */
export const convert12HourTo24Hour = (time12: string): string => {
  // Check if already in 24-hour format (contains ":" and no "AM"/"PM")
  if (time12.includes(':') && !time12.includes('AM') && !time12.includes('PM')) {
    return time12
  }

  const match = time12.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!match) {
    // If format is unexpected, try to parse as 24-hour
    return time12
  }

  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const ampm = match[3].toUpperCase()

  if (ampm === 'PM' && hours !== 12) {
    hours += 12
  } else if (ampm === 'AM' && hours === 12) {
    hours = 0
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

/**
 * Converts 24-hour format to 12-hour format for display
 * Input: "14:00" -> Output: "2:00 PM"
 * Input: "09:30" -> Output: "9:30 AM"
 * Input: "00:00" -> Output: "12:00 AM"
 * Input: "12:00" -> Output: "12:00 PM"
 */
const convert24HourTo12Hour = (time24: string): string => {
  const [hours, minutes] = time24.split(':').map(Number)
  let hour12 = hours % 12
  if (hour12 === 0) hour12 = 12
  const ampm = hours < 12 ? 'AM' : 'PM'
  return `${hour12}:${String(minutes).padStart(2, '0')} ${ampm}`
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
    const time24 = `${hours}:${minutes}`
    const displayTime = convert24HourTo12Hour(time24)

    slots.push({
      time: time24, // Keep 24-hour for internal comparison
      displayTime: displayTime, // Use 12-hour for display
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

  // Convert task times to 24-hour format for comparison
  const startTime24 = convert12HourTo24Hour(startTime)
  const endTime24 = convert12HourTo24Hour(endTime)

  // Convert to numeric format (HHmm) for proper comparison
  const startTimeNum = parseInt(startTime24.replace(':', ''))
  const endTimeNum = parseInt(endTime24.replace(':', ''))

  // Check if task spans midnight (e.g., 11:00 PM to 2:00 AM)
  const spansMidnight = startTimeNum > endTimeNum

  timeSlots.forEach((slot, idx) => {
    const slotTimeNum = parseInt(slot.time.replace(':', ''))
    
    // Find start index
    if (startIndex === -1) {
      if (spansMidnight) {
        // For tasks spanning midnight, start from the slot >= startTime
        if (slotTimeNum >= startTimeNum || slotTimeNum < endTimeNum) {
          startIndex = idx
        }
      } else {
        // For normal tasks, start from the slot >= startTime
        if (slotTimeNum >= startTimeNum) {
          startIndex = idx
        }
      }
    }

    // Find end index
    if (spansMidnight) {
      // For tasks spanning midnight, end at the slot <= endTime (which will be in next day)
      if (slotTimeNum <= endTimeNum) {
        endIndex = idx
      }
    } else {
      // For normal tasks, only update endIndex if slot is <= endTime AND >= startTime
      // This prevents including AM slots when task is purely PM
      if (slotTimeNum <= endTimeNum && slotTimeNum >= startTimeNum) {
        endIndex = idx
      }
    }
  })

  return startIndex !== -1 && endIndex !== -1 ? { startIndex, endIndex } : null
}

/**
 * Checks if two time ranges overlap
 */
export const doTimeRangesOverlap = (
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean => {
  // Convert time strings to minutes for comparison
  // Handle both 12-hour and 24-hour formats
  const timeToMinutes = (time: string): number => {
    const time24 = convert12HourTo24Hour(time)
    const [hours, minutes] = time24.split(':').map(Number)
    return hours * 60 + minutes
  }

  const start1Min = timeToMinutes(start1)
  const end1Min = timeToMinutes(end1)
  const start2Min = timeToMinutes(start2)
  const end2Min = timeToMinutes(end2)

  // Handle case where time range might span midnight (e.g., 11:00 PM-2:00 AM)
  // For simplicity, we'll assume tasks don't span midnight in this context
  // If they do, we'd need to handle that case separately

  // Two ranges overlap if: start1 < end2 && start2 < end1
  return start1Min < end2Min && start2Min < end1Min
}

/**
 * Assigns vertical layers to tasks to prevent overlap
 * Returns a map of task ID to layer number (0 = bottom layer)
 */
export const assignTaskLayers = <T extends { id: string; startTime: string; endTime: string }>(
  tasks: T[]
): Map<string, number> => {
  const layerMap = new Map<string, number>()

  if (tasks.length === 0) return layerMap

  // Sort tasks by start time, then by end time
  // Convert to 24-hour format for proper sorting
  const sortedTasks = [...tasks].sort((a, b) => {
    const aStart24 = convert12HourTo24Hour(a.startTime)
    const bStart24 = convert12HourTo24Hour(b.startTime)
    if (aStart24 < bStart24) return -1
    if (aStart24 > bStart24) return 1

    const aEnd24 = convert12HourTo24Hour(a.endTime)
    const bEnd24 = convert12HourTo24Hour(b.endTime)
    if (aEnd24 < bEnd24) return -1
    if (aEnd24 > bEnd24) return 1
    return 0
  })

  // Track which layers are occupied at each point in time
  // We'll use a greedy algorithm: assign each task to the lowest available layer
  const layers: Array<Array<{ start: string; end: string }>> = []

  for (const task of sortedTasks) {
    let assignedLayer = -1

    // Find the first layer where this task doesn't overlap with existing tasks
    for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
      const layer = layers[layerIndex]
      const hasOverlap = layer.some(existingTask =>
        doTimeRangesOverlap(
          existingTask.start,
          existingTask.end,
          task.startTime,
          task.endTime
        )
      )

      if (!hasOverlap) {
        assignedLayer = layerIndex
        break
      }
    }

    // If no available layer found, create a new one
    if (assignedLayer === -1) {
      assignedLayer = layers.length
      layers.push([])
    }

    // Assign task to layer and track it
    layerMap.set(task.id, assignedLayer)
    layers[assignedLayer].push({
      start: task.startTime,
      end: task.endTime,
    })
  }

  return layerMap
}

export const calculateTaskSpanStyle = (
  startIndex: number,
  endIndex: number,
  rowTop: number,
  layer: number = 0
): { left: string; width: string; top: string; height: string } => {
  const { DEPARTMENT_COLUMN_WIDTH } = TIME_GANTT_LAYOUT
  const CELL_WIDTH = TIME_GANTT_LAYOUT.TIME_CELL_WIDTH
  const ROW_HEIGHT = 48 // Height of each row cell (h-48px)
  const TASK_HEIGHT = TIME_GANTT_LAYOUT.TASK_HEIGHT
  const TASK_VERTICAL_SPACING = 2 // Space between stacked tasks

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
  // Add layer offset to stack overlapping tasks vertically
  const verticalCenterOffset = (ROW_HEIGHT - TASK_HEIGHT) / 2
  const layerOffset = layer * (TASK_HEIGHT + TASK_VERTICAL_SPACING)
  const centeredTop = rowTop + verticalCenterOffset + layerOffset

  return {
    left: `${left}px`,
    width: `${width}px`,
    top: `${centeredTop}px`,
    height: `${TASK_HEIGHT}px`,
  }
}

