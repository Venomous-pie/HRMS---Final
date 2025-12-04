// BACKWARDS COMPATIBILITY WRAPPER
// This file now wraps the Pinia store to maintain existing API compatibility
// Components can gradually migrate to direct store usage

import { computed } from 'vue'
import { useDateNavigationStore } from '@/stores/dateNavigation'

export const useFrontdeskDateNavigation = () => {
  const store = useDateNavigationStore()

  // Maintain the same reactive interface as before
  const selectedYear = computed({
    get: () => store.selectedYear,
    set: (value: number) => store.setYear(value)
  })
  
  const selectedMonth = computed({
    get: () => store.selectedMonth,
    set: (value: number) => store.setMonth(value)
  })
  
  const targetDate = computed(() => store.targetDate)
  const years = computed(() => store.availableYears)
  const months = computed(() => store.monthNames)

  // Maintain the same function signatures as before
  const emitDateChangeToChart = () => {
    store.emitDateChange()
  }

  const navigateYear = (direction: number) => {
    store.navigateYear(direction)
  }

  const navigateMonth = (direction: number) => {
    store.navigateMonth(direction)
  }

  const selectYear = (year: number) => {
    store.setYear(year)
  }

  const selectMonth = (monthIndex: number) => {
    store.setMonth(monthIndex)
  }

  const handleDateUpdate = ({ year, month }: { year: number; month: number }) => {
    store.handleDateUpdate({ year, month })
  }

  return {
    selectedYear,
    selectedMonth,
    targetDate,
    years,
    months,
    emitDateChangeToChart,
    navigateYear,
    navigateMonth,
    selectYear,
    selectMonth,
    handleDateUpdate,
  }
}

// Export store for direct usage in new components
export { useDateNavigationStore }
