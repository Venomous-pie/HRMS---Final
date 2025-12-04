import type { Room, Reservation } from '@/types/hotel'

export function generateYearRange(currentYear: number, before = 7, after = 8): number[] {
  const years: number[] = []
  for (let i = -before; i <= after; i++) {
    years.push(currentYear + i)
  }
  return years
}

export function formatStatusLabel(status: string): string {
  const s = (status || '').toString().toLowerCase()
  switch (s) {
    case 'confirmed':
      return 'Confirmed'
    case 'pending':
      return 'Pending'
    case 'checkedin':
    case 'checked_in':
    case 'checked-in':
    case 'checked in':
      return 'Checked In'
    case 'cancelled':
      return 'Cancelled'
    default:
      if (!s) return ''
      return s.charAt(0).toUpperCase() + s.slice(1)
  }
}

export function formatSourceLabel(source: string): string {
  const s = (source || '').toString().toLowerCase()
  switch (s) {
    case 'direct':
      return 'Direct'
    case 'booking.com':
      return 'Booking.com'
    case 'expedia':
      return 'Expedia'
    case 'airbnb':
      return 'Airbnb'
    case 'kayak':
      return 'Kayak'
    default:
      if (!s) return ''
      return s.charAt(0).toUpperCase() + s.slice(1)
  }
}

export function getUniqueRoomTypes(rooms: Room[]): string[] {
  const types = new Set<string>()
  rooms.forEach((room) => {
    const t = (room.type || room.RoomType?.typeName || 'Standard')?.toString().trim()
    if (t) types.add(t)
  })
  return Array.from(types)
}

export function getUniqueStatuses(reservations: Reservation[]): string[] {
  const statuses = new Set<string>()
  reservations.forEach((r) => {
    const s = (r.status || '').toString().trim()
    if (s) statuses.add(s)
  })
  return Array.from(statuses)
}

export function getUniqueSources(reservations: Reservation[]): string[] {
  const sources = new Set<string>()
  reservations.forEach((r) => {
    const s = (r.source || '').toString().trim()
    if (s) sources.add(s)
  })
  return Array.from(sources)
}
