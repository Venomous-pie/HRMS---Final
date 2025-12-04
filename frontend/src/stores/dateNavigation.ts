import { defineStore } from 'pinia'
import { getTodayAtMidnight } from '@/utils/date'
import { generateYearRange } from '@/utils/frontdesk'

export interface DateNavigationState {
  selectedYear: number
  selectedMonth: number
  targetDate: Date | null
}

// Explicit getters/actions typings to satisfy Pinia v3 type inference
export type DateNavigationGetters = {
  availableYears: () => number[]
  monthNames: () => string[]
  currentDate: (state: DateNavigationState) => Date
  isCurrentMonth: (state: DateNavigationState) => boolean
  currentSelection: (
    state: DateNavigationState,
    getters: DateNavigationGetters,
  ) => { year: number; month: number; monthName: string; date: Date }
  canNavigateBack: (state: DateNavigationState, getters: DateNavigationGetters) => boolean
  canNavigateForward: (state: DateNavigationState, getters: DateNavigationGetters) => boolean
  previousMonth: (state: DateNavigationState) => { year: number; month: number }
  nextMonth: (state: DateNavigationState) => { year: number; month: number }
}

export type DateNavigationActions = {
  setYear: (year: number) => void
  setMonth: (month: number) => void
  setYearMonth: (year: number, month: number) => void
  navigateYear: (direction: number) => void
  navigateMonth: (direction: number) => void
  jumpToToday: () => void
  jumpToDate: (date: Date | string) => void
  setTargetDate: (date: Date | null) => void
  handleDateUpdate: (args: { year: number; month: number }) => void
  emitDateChange: () => void
  resetToToday: () => void
  getCurrentMonthRange: () => {
    start: Date
    end: Date
    year: number
    month: number
    monthName: string
    daysInMonth: number
  }
}

export const useDateNavigationStore = defineStore<'dateNavigation', DateNavigationState, any, DateNavigationActions>('dateNavigation', {
  state: (): DateNavigationState => {
    const currentDate = getTodayAtMidnight()
    return {
      selectedYear: currentDate.getFullYear(),
      selectedMonth: currentDate.getMonth(),
      targetDate: null,
    }
  },

  getters: {
    // Get available years range
    availableYears: (): number[] => {
      return generateYearRange(getTodayAtMidnight().getFullYear())
    },

    // Get month names
    monthNames: (): string[] => [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ],

    // Get current date as Date object
    currentDate: (state: DateNavigationState): Date => {
      return new Date(state.selectedYear, state.selectedMonth, 1)
    },

    // Check if current selection is today's month/year
    isCurrentMonth: (state: DateNavigationState): boolean => {
      const today = getTodayAtMidnight()
      return (
        state.selectedYear === today.getFullYear() &&
        state.selectedMonth === today.getMonth()
      )
    },

    // Get formatted current selection
currentSelection: (state: DateNavigationState, getters: any) => ({
      year: state.selectedYear,
      month: state.selectedMonth,
      monthName: getters.monthNames[state.selectedMonth],
      date: getters.currentDate,
    }),

    // Get navigation bounds
canNavigateBack: (state: DateNavigationState, getters: any): boolean => {
      const years = getters.availableYears
      const firstYear = years[0]
      return !(state.selectedYear === firstYear && state.selectedMonth === 0)
    },

canNavigateForward: (state: DateNavigationState, getters: any): boolean => {
      const years = getters.availableYears
      const lastYear = years[years.length - 1]
      return !(state.selectedYear === lastYear && state.selectedMonth === 11)
    },

    // Get previous/next month info
    previousMonth: (state: DateNavigationState) => {
      let prevMonth = state.selectedMonth - 1
      let prevYear = state.selectedYear
      
      if (prevMonth < 0) {
        prevMonth = 11
        prevYear -= 1
      }
      
      return { year: prevYear, month: prevMonth }
    },

    nextMonth: (state: DateNavigationState) => {
      let nextMonth = state.selectedMonth + 1
      let nextYear = state.selectedYear
      
      if (nextMonth > 11) {
        nextMonth = 0
        nextYear += 1
      }
      
      return { year: nextYear, month: nextMonth }
    },
  },

  actions: {
    // Set specific year
    setYear(year: number) {
      if (this.availableYears.includes(year)) {
        this.selectedYear = year
        this.emitDateChange()
      }
    },

    // Set specific month
    setMonth(month: number) {
      if (month >= 0 && month <= 11) {
        this.selectedMonth = month
        this.emitDateChange()
      }
    },

    // Set both year and month
    setYearMonth(year: number, month: number) {
      if (this.availableYears.includes(year) && month >= 0 && month <= 11) {
        this.selectedYear = year
        this.selectedMonth = month
        this.emitDateChange()
      }
    },

    // Navigate year by direction (-1 for previous, 1 for next)
    navigateYear(direction: number) {
      const currentIndex = this.availableYears.indexOf(this.selectedYear)
      const newIndex = currentIndex + direction
      
      if (newIndex >= 0 && newIndex < this.availableYears.length) {
        this.selectedYear = this.availableYears[newIndex]
        this.emitDateChange()
      }
    },

    // Navigate month by direction (-1 for previous, 1 for next)
    navigateMonth(direction: number) {
      const { nextMonth, previousMonth } = this
      const target = direction > 0 ? nextMonth : previousMonth
      
      if (this.availableYears.includes(target.year)) {
        this.selectedYear = target.year
        this.selectedMonth = target.month
        this.emitDateChange()
      }
    },

    // Jump to today
    jumpToToday() {
      const today = getTodayAtMidnight()
      this.selectedYear = today.getFullYear()
      this.selectedMonth = today.getMonth()
      this.emitDateChange()
    },

    // Jump to specific date
    jumpToDate(date: Date | string) {
      const targetDate = typeof date === 'string' ? new Date(date) : date
      const year = targetDate.getFullYear()
      const month = targetDate.getMonth()
      
      if (this.availableYears.includes(year)) {
        this.selectedYear = year
        this.selectedMonth = month
        this.emitDateChange()
      }
    },

    // Set target date (for external synchronization)
    setTargetDate(date: Date | null) {
      this.targetDate = date
      
      if (date) {
        const year = date.getFullYear()
        const month = date.getMonth()
        
        if (this.availableYears.includes(year)) {
          this.selectedYear = year
          this.selectedMonth = month
        }
      }
    },

    // Update from external date change
    handleDateUpdate({ year, month }: { year: number; month: number }) {
      if (this.availableYears.includes(year) && month >= 0 && month <= 11) {
        this.selectedYear = year
        this.selectedMonth = month
        this.emitDateChange()
      }
    },

    // Private method to emit date change
    emitDateChange() {
      this.targetDate = new Date(this.selectedYear, this.selectedMonth, 1)
    },

    // Reset to current month/year
    resetToToday() {
      const today = getTodayAtMidnight()
      this.selectedYear = today.getFullYear()
      this.selectedMonth = today.getMonth()
      this.targetDate = null
    },

    // Get date range for current selection
    getCurrentMonthRange() {
      const startDate = new Date(this.selectedYear, this.selectedMonth, 1)
      const endDate = new Date(this.selectedYear, this.selectedMonth + 1, 0) // Last day of month
      
      return {
        start: startDate,
        end: endDate,
        year: this.selectedYear,
        month: this.selectedMonth,
        monthName: this.monthNames[this.selectedMonth],
        daysInMonth: endDate.getDate(),
      }
    },
  },

  // Persist date selection
  persist: {
    key: 'date-navigation',
    storage: localStorage,
    pick: ['selectedYear', 'selectedMonth'], // Don't persist targetDate
  },
})