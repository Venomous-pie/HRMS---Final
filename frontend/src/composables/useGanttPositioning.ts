import { ref, nextTick, type Ref, type ComponentPublicInstance } from 'vue'
import { setMeasuredCellWidth } from '@/utils/gantt'

export const useGanttPositioning = (
  roomCategories: Ref<any[]>,
  expandedCategories: Ref<Record<string, boolean>>,
) => {
  const containerEl = ref<HTMLElement | null>(null)
  const rowRefs = ref<Record<string, HTMLElement | null>>({})
  const rowTops = ref<Record<string, number>>({})

  const setRowRef = (roomNumber: string, el: Element | ComponentPublicInstance | null): void => {
    const domEl = el && (el as any).$el ? ((el as any).$el as Element) : (el as Element | null)
    rowRefs.value[roomNumber] = (domEl as HTMLElement) || null
  }

  const clearRowRefs = (): void => {
    rowRefs.value = {}
    rowTops.value = {}
  }

  const getRowRef = (roomNumber: string): HTMLElement | null => {
    return rowRefs.value[roomNumber] || null
  }

  const computeRowTops = (): void => {
    const container = containerEl.value
    if (!container) {
      return
    }

    const containerRect = container.getBoundingClientRect()
    const tops: Record<string, number> = {}
    let computedCount = 0

    for (const category of roomCategories.value) {
      if (!expandedCategories.value[category.type]) continue

      for (const room of category.rooms) {
        const tr = rowRefs.value[room.number]
        if (tr) {
          const r = tr.getBoundingClientRect()
          const offset = Math.max(0, (r.height - 24) / 2)
          tops[room.number] = r.top - containerRect.top + offset
          computedCount++
        }
      }
    }

    rowTops.value = tops
  }

  const measureCellWidth = (): void => {
    const container = containerEl.value
    if (!container) return

    // Prefer header date cell; fallback to any body date cell
    const headerCell = container.querySelector('thead th[data-gantt-date-cell]') as HTMLElement | null
    const bodyCell = !headerCell
      ? (container.querySelector('tbody td[data-gantt-date-cell]') as HTMLElement | null)
      : null

    const el = headerCell || bodyCell
    if (el) {
      const rect = el.getBoundingClientRect()
      if (rect.width && isFinite(rect.width)) {
        setMeasuredCellWidth(rect.width)
      }
    }
  }

  const getFallbackPosition = (roomNumber: string): number => {
    let fallbackTop = 0

    for (const category of roomCategories.value) {
      if (!expandedCategories.value[category.type]) {
        continue
      }

      fallbackTop += 48

      for (const room of category.rooms) {
        if (room.number === roomNumber) {
          const roomCenterTop = fallbackTop + 12
          return roomCenterTop
        }
        fallbackTop += 48
      }

      const roomFound = category.rooms.some((room: any) => room.number === roomNumber)
      if (roomFound) break
    }

    return fallbackTop + 12
  }

  const getRoomTopPosition = (roomNumber: string): number => {
    if (rowTops.value[roomNumber] !== undefined) {
      const cachedPosition = rowTops.value[roomNumber]
      return cachedPosition
    }

    const fallbackTop = getFallbackPosition(roomNumber)
    rowTops.value[roomNumber] = fallbackTop
    return fallbackTop
  }

  const setContainerRef = (el: HTMLElement | null): void => {
    containerEl.value = el
    if (el) {
      nextTick(() => {
        computeRowTops()
        measureCellWidth()
      })
    }
  }

  const getContainerDimensions = () => {
    if (!containerEl.value) return null

    const rect = containerEl.value.getBoundingClientRect()
    return {
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left,
      bottom: rect.bottom,
      right: rect.right,
    }
  }

  const hasContainer = (): boolean => {
    return containerEl.value !== null
  }

  const recomputePositions = async (): Promise<void> => {
    await nextTick()
    rowTops.value = {}
    computeRowTops()
    measureCellWidth()
  }

  const updateRoomPositions = async (roomNumbers: string[]): Promise<void> => {
    await nextTick()

    const container = containerEl.value
    if (!container) return

    const containerRect = container.getBoundingClientRect()

    for (const roomNumber of roomNumbers) {
      const tr = rowRefs.value[roomNumber]
      if (tr) {
        const r = tr.getBoundingClientRect()
        const offset = Math.max(0, (r.height - 24) / 2)
        rowTops.value[roomNumber] = r.top - containerRect.top + offset
      }
    }
  }

  const getAllPositions = (): Record<string, number> => {
    return { ...rowTops.value }
  }

  const arePositionsComputed = (): boolean => {
    for (const category of roomCategories.value) {
      if (!expandedCategories.value[category.type]) continue

      for (const room of category.rooms) {
        if (rowTops.value[room.number] === undefined) {
          return false
        }
      }
    }
    return true
  }

  const scrollToRoom = (roomNumber: string): void => {
    const roomEl = rowRefs.value[roomNumber]
    if (roomEl && containerEl.value) {
      roomEl.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      })
    }
  }

  const isRoomVisible = (roomNumber: string): boolean => {
    const roomEl = rowRefs.value[roomNumber]
    const container = containerEl.value

    if (!roomEl || !container) return false

    const roomRect = roomEl.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()

    return (
      roomRect.top >= containerRect.top &&
      roomRect.bottom <= containerRect.bottom &&
      roomRect.left >= containerRect.left &&
      roomRect.right <= containerRect.right
    )
  }

  const getVisibleRooms = (): string[] => {
    const visibleRooms: string[] = []

    for (const category of roomCategories.value) {
      if (!expandedCategories.value[category.type]) continue

      for (const room of category.rooms) {
        if (isRoomVisible(room.number)) {
          visibleRooms.push(room.number)
        }
      }
    }

    return visibleRooms
  }

  let recomputeTimeout: ReturnType<typeof setTimeout> | null = null

  const debouncedRecompute = (delay: number = 100): void => {
    if (recomputeTimeout) {
      clearTimeout(recomputeTimeout)
    }

    recomputeTimeout = setTimeout(() => {
      recomputePositions()
      recomputeTimeout = null
    }, delay)
  }

  const validatePositioning = (): void => {
    if (!import.meta.env.DEV) return

    const missingPositions: string[] = []
    for (const category of roomCategories.value) {
      if (!expandedCategories.value[category.type]) continue

      for (const room of category.rooms) {
        if (!rowTops.value[room.number] && !rowRefs.value[room.number]) {
          missingPositions.push(room.number)
        }
      }
    }
  }

  const cleanup = (): void => {
    if (recomputeTimeout) {
      clearTimeout(recomputeTimeout)
      recomputeTimeout = null
    }
    clearRowRefs()
    containerEl.value = null
  }

  return {
    containerEl,
    rowRefs,
    rowTops,
    setRowRef,
    clearRowRefs,
    getRowRef,
    setContainerRef,
    getContainerDimensions,
    hasContainer,
    computeRowTops,
    getFallbackPosition,
    getRoomTopPosition,
    recomputePositions,
    updateRoomPositions,
    getAllPositions,
    arePositionsComputed,
    scrollToRoom,
    isRoomVisible,
    getVisibleRooms,
    debouncedRecompute,
    cleanup,
    validatePositioning,
  }
}
