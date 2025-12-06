import { apiFetch } from './apiClient'

export interface RevenueStats {
  totalRevenue: number
  averageBookingValue: number
  totalReservations: number
}

export interface RevenueTrend {
  date: string
  revenue: number
}

export interface BookingSourceStats {
  source: string
  count: number
  percentage: number
}

export interface Reservation {
  id: string
  room: string
  guest: string
  checkIn: string
  checkOut: string
  status: string
  amount: number
  balance: number
  source: string
  bookingDate: string
}

export interface Payment {
  id: number
  paymentNumber: string
  reservationId: number
  guestId: number
  invoiceId: number
  amount: number
  currency: string
  paymentMethod: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'check' | 'digital_wallet' | 'other'
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'
  paymentDate: string
  createdAt: string
  updatedAt: string
  Guest?: {
    firstName: string
    lastName: string
  }
  Reservation?: {
    room: string
    checkIn: string
    checkOut: string
  }
}

export interface Invoice {
  id: number
  invoiceNumber: string
  reservationId: number
  guestId: number
  issueDate: string
  dueDate: string
  subtotal: number
  taxAmount: number
  taxRate: number
  discountAmount: number
  totalAmount: number
  paidAmount: number
  balanceAmount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'refunded'
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'refunded'
  currency: string
  createdAt: string
  updatedAt: string
  Guest?: {
    firstName: string
    lastName: string
  }
  Reservation?: {
    room: string
  }
}

class AccountingService {
  // Get revenue statistics
  async getRevenueStats(dateRange?: string): Promise<RevenueStats | null> {
    try {
      const url = dateRange ? `/stats/revenue?dateRange=${dateRange}` : '/stats/revenue'
      return await apiFetch<RevenueStats>(url)
    } catch (error) {
      console.error('Error fetching revenue stats:', error)
      return null
    }
  }

  // Get revenue trend
  async getRevenueTrend(dateRange?: string): Promise<RevenueTrend[]> {
    try {
      const url = dateRange ? `/stats/revenue/trend?dateRange=${dateRange}` : '/stats/revenue/trend'
      return await apiFetch<RevenueTrend[]>(url)
    } catch (error) {
      console.error('Error fetching revenue trend:', error)
      return []
    }
  }

  // Get all payments
  async getPayments(): Promise<Payment[]> {
    try {
      return await apiFetch<Payment[]>('/payments')
    } catch (error) {
      console.error('Error fetching payments:', error)
      return []
    }
  }

  // Get all invoices
  async getInvoices(): Promise<Invoice[]> {
    try {
      return await apiFetch<Invoice[]>('/invoices')
    } catch (error) {
      console.error('Error fetching invoices:', error)
      return []
    }
  }

  // Get payments by date range
  async getPaymentsByDateRange(startDate: string, endDate: string): Promise<Payment[]> {
    try {
      return await apiFetch<Payment[]>(`/payments?startDate=${startDate}&endDate=${endDate}`)
    } catch (error) {
      console.error('Error fetching payments by date range:', error)
      return []
    }
  }

  // Get invoices by date range
  async getInvoicesByDateRange(startDate: string, endDate: string): Promise<Invoice[]> {
    try {
      return await apiFetch<Invoice[]>(`/invoices?startDate=${startDate}&endDate=${endDate}`)
    } catch (error) {
      console.error('Error fetching invoices by date range:', error)
      return []
    }
  }

  // Get booking source statistics
  async getBookingSourceStats(): Promise<BookingSourceStats[]> {
    try {
      return await apiFetch<BookingSourceStats[]>('/stats/bookings/source')
    } catch (error) {
      console.error('Error fetching booking source stats:', error)
      return []
    }
  }

  // Get all reservations (for revenue analysis)
  async getReservations(): Promise<Reservation[]> {
    try {
      return await apiFetch<Reservation[]>('/reservations')
    } catch (error) {
      console.error('Error fetching reservations:', error)
      return []
    }
  }
}

export const accountingService = new AccountingService()

