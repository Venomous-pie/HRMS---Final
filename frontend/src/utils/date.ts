export const getTodayAtMidnight = (): Date => {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset time to midnight for consistent date handling
  return today
}

export const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const getTodayAsString = (): string => {
  return formatDateForInput(getTodayAtMidnight())
}

export const createDateFromString = (dateString: string): Date => {
  const date = new Date(dateString)
  date.setHours(0, 0, 0, 0)
  return date
}

export const compareDateStrings = (date1: string, date2: string): number => {
  if (date1 < date2) return -1
  if (date1 > date2) return 1
  return 0
}

export const isDateInPast = (dateString: string): boolean => {
  const todayString = getTodayAsString()
  return compareDateStrings(dateString, todayString) < 0
}

export const isDateToday = (dateString: string): boolean => {
  const todayString = getTodayAsString()
  return compareDateStrings(dateString, todayString) === 0
}

export const isDateInFuture = (dateString: string): boolean => {
  const todayString = getTodayAsString()
  return compareDateStrings(dateString, todayString) > 0
}

export const addDaysToDateString = (dateString: string, days: number): string => {
  const date = createDateFromString(dateString)
  date.setDate(date.getDate() + days)
  return formatDateForInput(date)
}

export const daysBetweenDates = (startDate: string, endDate: string): number => {
  const start = createDateFromString(startDate)
  const end = createDateFromString(endDate)
  const diffTime = end.getTime() - start.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
