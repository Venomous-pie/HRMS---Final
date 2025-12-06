export interface Room {
  id: string
  number: string
  roomNumber?: string
  type: string
  roomType?: string
  status: 'available' | 'occupied' | 'maintenance' | 'out-of-order'
  statusColor: string
  pricePerNight: number
  floorNumber: number
  maxCapacity: number
  amenities: string[]
  notes?: string
  RoomType?: RoomType
}

export interface RoomType {
  id: number
  typeName: string
  description: string
  maxCapacity: number
  basePrice: number
}

export interface Guest {
  id?: number
  firstName: string
  middleName?: string
  lastName: string
  email: string
  phone: string
  address: string
  idDocument: string
  nationality?: string
  totalStays?: number
  lastVisited?: string | Date
  totalSpent?: number
  notes?: string
  orderCount?: number
}

export interface Reservation {
  guestObj?: Guest
  id?: string
  room: string
  guest: string
  checkIn: string | Date
  checkOut: string | Date
  checkInDate?: string | Date
  checkOutDate?: string | Date
  guestName?: string
  bookingNumber?: string
  status:
    | 'confirmed'
    | 'pending'
    | 'checkedIn'
    | 'cancelled'
    | 'checkedOut'
    | 'new'
    | 'booked'
    | 'dueOut'
    | 'outOfOrder'
  type?: 'standard' | 'vip' | 'family' | 'group'
  amount: number
  balance?: number
  source?: 'direct' | 'booking.com' | 'expedia' | 'airbnb' | 'kayak'
  orders?: number
  bookingDate?: string | Date
  notes?: string
  numGuest: number
  specialRequest?: string
  totalPrice: number
  roomNumber: string
  RoomId?: number
  GuestId?: number
  Guest?: Guest
}

export interface ReservationFormData {
  firstName: string
  middleName?: string
  lastName: string
  email: string
  phone: string
  countryCode: string
  address: string
  idDocument: string
  nationality?: string

  numGuest: number
  checkIn: string
  checkOut: string
  specialRequest?: string
  status: 'confirmed' | 'pending' | 'checkedIn'
  roomNumber: string
  roomId?: string
}

export interface ValidationErrors {
  firstName?: string
  middleName?: string
  lastName?: string
  email?: string
  phone?: string
  address?: string
  idDocument?: string
  nationality?: string
  numGuest?: string
  checkIn?: string
  checkOut?: string
  roomNumber?: string
  general?: string
}

export interface ApiError {
  error: string
  conflictingReservation?: {
    checkIn: string
    checkOut: string
  }
}

export interface ModalState {
  isOpen: boolean
  isLoading: boolean
  error: string | null
  success: boolean
}

export interface RoomAvailability {
  roomNumber: string
  isAvailable: boolean
  conflictingReservations?: Reservation[]
}

export interface DateRange {
  start: Date
  end: Date
}

export interface ReservationFilters {
  status?: string
  roomType?: string
  bookingSource?: string
  dateRange?: DateRange
  searchQuery?: string
}

export interface PrefilledReservationData {
  // Presence of reservationId indicates edit mode
  reservationId?: string

  // Guest fields
  firstName?: string
  middleName?: string
  lastName?: string
  email?: string
  phone?: string
  countryCode?: string
  address?: string
  idDocument?: string

  // Reservation fields
  numGuest?: number
  checkInDate?: string
  checkOutDate?: string
  specialRequest?: string
  status?: 'confirmed' | 'pending' | 'checkedIn'
  roomNumber?: string
}

// Housekeeping and service types
export interface HousekeepingStatus {
  roomNumber: string
  status: 'clean' | 'dirty' | 'in_progress' | 'maintenance' | 'out_of_order'
  lastCleaned?: string
  assignedTo?: string
  notes?: string
}

export interface ServiceCharge {
  id: string
  reservationId: string
  description: string
  amount: number
  category: 'minibar' | 'room_service' | 'laundry' | 'phone' | 'damage' | 'late_checkout' | 'other'
  chargedAt: string
  status: 'pending' | 'confirmed' | 'disputed' | 'refunded'
}

export interface PaymentRecord {
  id: string
  reservationId: string
  amount: number
  method: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'check'
  reference?: string
  processedAt: string
  status: 'completed' | 'pending' | 'failed' | 'refunded'
}

export interface CancellationPolicy {
  hoursBeforeCheckIn: number
  cancellationFeePercentage: number
  refundPercentage: number
  description: string
}
