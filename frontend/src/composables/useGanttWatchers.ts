import { watch, nextTick, type Ref } from 'vue'

export const useGanttWatchers = (
  props: any,
  navigation: any,
  isInternalNavigation: Ref<boolean>,
  initializeViewDate: () => void,
  highlightedReservation: Ref<string | null>,
  containerEl: Ref<HTMLElement | null>,
  setContainerRef: (el: HTMLElement | null) => void,
  recomputePositions: () => void,
  roomCategories: Ref<any[]>,
  expandedCategories: Ref<Record<string, boolean>>,
  dateRange: Ref<any[]>,
) => {
  const setupDateChangeWatcher = () => {
    watch([() => props.selectedYear, () => props.selectedMonth], (newValues, oldValues) => {
      const [newYear, newMonth] = newValues
      const [oldYear, oldMonth] = oldValues || [newYear, newMonth]

      if (oldYear !== undefined && oldMonth !== undefined) {
        if (!isInternalNavigation.value) {
          const firstOfMonth = new Date(newYear, newMonth, 1)
          firstOfMonth.setHours(0, 0, 0, 0)
          if (navigation?.viewStartDate) {
            navigation.viewStartDate.value = firstOfMonth
          } else {
            initializeViewDate()
          }
        }
      }
    })
  }

  const setupSearchWatcher = () => {
    watch(
      () => props.searchQuery,
      (newQuery) => {
        if (newQuery && newQuery.trim()) {
          const query = newQuery.toLowerCase().trim()
          navigation.findAndNavigateToReservation(query)
        } else {
          highlightedReservation.value = null
        }
      },
    )
  }

  const setupContainerWatcher = () => {
    watch(
      containerEl,
      (newContainer) => {
        if (newContainer) {
          setContainerRef(newContainer)
          nextTick(() => {
            recomputePositions()
          })
        }
      },
      { immediate: true },
    )
  }

  const setupLayoutWatcher = () => {
    watch([roomCategories, () => ({ ...expandedCategories.value }), dateRange], async () => {
      await nextTick()
      await nextTick()
      recomputePositions()

      setTimeout(() => {
        recomputePositions()
      }, 50)
    })
  }

  const setupAllWatchers = () => {
    setupDateChangeWatcher()
    setupSearchWatcher()
    setupContainerWatcher()
    setupLayoutWatcher()
  }

  return {
    setupAllWatchers,
    setupDateChangeWatcher,
    setupSearchWatcher,
    setupContainerWatcher,
    setupLayoutWatcher,
  }
}
