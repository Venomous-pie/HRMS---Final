import { computed, ref } from 'vue'
import { useGanttNavigation } from './useGanttNavigation'
import { useReservationManagement } from './useReservationManagement'
import { useRoomCategorization } from './useRoomCategorization'
import { useGanttPositioning } from './useGanttPositioning'
import { useGanttEventHandlers } from './useGanttEventHandlers'
import { useGanttLifecycle } from './useGanttLifecycle'
import { useGanttWatchers } from './useGanttWatchers'
import { calculateReservationSpanStyle, findDateRangeIndices } from '@/utils/gantt'

export const useGanttOrchestrator = (props: any, emit: any) => {
  const hoveredColumn = ref<string | null>(null)

  const roomsRef = computed(() => props.rooms)
  const reservationsRef = computed(() => props.reservations)
  const searchQueryRef = computed(() => props.searchQuery)
  const roomTypeFilterRef = computed(() => props.roomTypeFilter)
  const reservationFilterRef = computed(() => props.reservationFilter)
  const bookingFilterRef = computed(() => props.bookingFilter)
  const selectedYearRef = computed(() => props.selectedYear)
  const selectedMonthRef = computed(() => props.selectedMonth)
  const targetDateRef = computed(() => props.targetDate || null)
  const navigation = useGanttNavigation(
    selectedYearRef,
    selectedMonthRef,
    searchQueryRef,
    reservationsRef,
    targetDateRef,
  )

  const reservationMgmt = useReservationManagement(
    reservationsRef,
    searchQueryRef,
    reservationFilterRef,
    bookingFilterRef,
  )

  const matchingRoomsFromReservations = computed(() => {
    const set = new Set<string>()
    reservationMgmt.filteredReservations.value.forEach((res: any) => {
      const rn = (res.room || res.roomNumber || '').toString()
      if (rn) set.add(rn)
    })
    return set
  })

  const roomCategorization = useRoomCategorization(
    roomsRef,
    searchQueryRef,
    roomTypeFilterRef,
    matchingRoomsFromReservations,
  )

  const positioning = useGanttPositioning(
    roomCategorization.roomCategories,
    roomCategorization.expandedCategories,
  )

  const {
    dateRange,
    highlightedReservation,
    navigateDates: navDates,
    jumpToToday: navJumpToToday,
    initializeViewDate,
    isInternalNavigation,
  } = navigation

  const {
    isRoomAvailable,
    getAvailableRoomCountForDate,
    getReservationSpans: getSpans,
  } = reservationMgmt

  const { roomCategories, expandedCategories, toggleCategory } = roomCategorization

  const {
    setRowRef,
    getRoomTopPosition,
    recomputePositions,
    setContainerRef,
    validatePositioning,
  } = positioning
  const eventHandlers = useGanttEventHandlers(isRoomAvailable, emit)
  const { handleCellClick, createNavigationHandler, createTodayHandler } = eventHandlers

  const navigateDates = createNavigationHandler(navDates, navigation, emit)
  const jumpToToday = createTodayHandler(navJumpToToday, navigation, emit)

  const ganttTableRef = ref<any>(null)
  const containerEl = computed(() => ganttTableRef.value?.containerEl || null)
  useGanttLifecycle(initializeViewDate, navigation, recomputePositions, validatePositioning)

  const watchers = useGanttWatchers(
    props,
    navigation,
    isInternalNavigation,
    initializeViewDate,
    highlightedReservation,
    containerEl,
    setContainerRef,
    recomputePositions,
    roomCategories,
    expandedCategories,
    dateRange,
  )
  watchers.setupAllWatchers()

  const getReservationSpans = (roomNumber: string) => {
    return getSpans(
      roomNumber,
      dateRange.value,
      getRoomTopPosition,
      findDateRangeIndices,
      calculateReservationSpanStyle,
    )
  }

  return {
    hoveredColumn,
    ganttTableRef,
    dateRange,
    roomCategories,
    expandedCategories,
    highlightedReservation,
    navigateDates,
    jumpToToday,
    handleCellClick,
    toggleCategory,
    isRoomAvailable,
    getAvailableRoomCountForDate,
    getReservationSpans,
    setRowRef,
  }
}
