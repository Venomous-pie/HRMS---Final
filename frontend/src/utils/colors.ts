export const getReservationStatusColor = (reservation: any): string => {
  if (!reservation) return ''
  const raw = (reservation.status || '').toString()
  const norm = raw.toLowerCase().replace(/[\s_-]+/g, '')

  switch (norm) {
    case 'new':
      return 'bg-yellow-200 border-yellow-400 text-yellow-800'
    case 'confirmed':
      return 'bg-blue-200 border-blue-300 text-blue-800'
    case 'booked':
      return 'bg-green-200 border-green-300 text-green-800'
    case 'checkedin':
      return 'bg-green-200 border-green-300 text-green-800'
    case 'dueout':
      return 'bg-red-200 border-red-300 text-red-800'
    case 'checkedout':
      return 'bg-orange-200 border-orange-300 text-orange-800'
    case 'outoforder':
      return 'bg-amber-200 border-amber-300 text-amber-800'
    case 'cancelled':
      return 'bg-red-200 border-red-300 text-red-800'
    case 'pending':
      return 'bg-yellow-200 border-yellow-400 text-yellow-800'
    default:
      return 'bg-gray-200 border-gray-300 text-gray-800'
  }
}

export const getReservationAccentColor = (reservation: any): string => {
  if (!reservation) return 'bg-gray-600'
  const raw = (reservation.status || '').toString()
  const norm = raw.toLowerCase().replace(/[\s_-]+/g, '')

  switch (norm) {
    case 'new':
      return 'bg-yellow-500'
    case 'confirmed':
      return 'bg-blue-500'
    case 'booked':
    case 'checkedin':
      return 'bg-green-500'
    case 'dueout':
      return 'bg-red-500'
    case 'checkedout':
      return 'bg-orange-500'
    case 'outoforder':
      return 'bg-amber-500'
    case 'cancelled':
    case 'pending':
      return 'bg-yellow-500'
    default:
      return 'bg-gray-500'
  }
}

export const getRoomStatusColor = (status: string): string => {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'occupied':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'maintenance':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'out-of-order':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}
