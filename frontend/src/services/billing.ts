import type { Reservation } from '@/types/hotel'
import type { ServiceCharge } from '@/composables/useExtraServices'

export interface BillingSummary {
  reservationId: string
  guestName: string
  roomNumber: string
  checkInDate: string
  checkOutDate: string
  nights: number
  
  // Room charges
  roomRate: number
  roomSubtotal: number
  
  // Extra services
  serviceCharges: ServiceCharge[]
  servicesSubtotal: number
  
  // Taxes and fees
  taxRate: number
  taxAmount: number
  serviceFee: number
  
  // Totals
  subtotal: number
  totalAmount: number
  paidAmount: number
  balanceAmount: number
  
  // Payment history
  payments: PaymentRecord[]
}

export interface PaymentRecord {
  id: string
  amount: number
  method: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'check'
  reference?: string
  processedAt: string
  processedBy?: string
  status: 'completed' | 'pending' | 'failed' | 'refunded'
}

export interface PaymentRequest {
  reservationId: string
  amount: number
  method: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'check'
  reference?: string
  notes?: string
}

export interface RefundRequest {
  paymentId: string
  amount: number
  reason: string
  processedBy?: string
}

class BillingService {
  private baseUrl = '/api'

  // Generate comprehensive bill for reservation
  async generateBill(reservationId: string): Promise<BillingSummary> {
    try {
      const response = await fetch(`${this.baseUrl}/billing/generate/${reservationId}`)
      
      if (!response.ok) {
        throw new Error(`Failed to generate bill: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error generating bill:', error)
      throw new Error('Failed to generate bill. Sira ang billing system!')
    }
  }

  // Process payment for reservation
  async processPayment(paymentRequest: PaymentRequest): Promise<PaymentRecord> {
    try {
      const response = await fetch(`${this.baseUrl}/billing/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentRequest),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Payment processing failed')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error processing payment:', error)
      throw new Error('Payment failed. Gago naman ang payment gateway!')
    }
  }

  // Process refund
  async processRefund(refundRequest: RefundRequest): Promise<PaymentRecord> {
    try {
      const response = await fetch(`${this.baseUrl}/billing/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(refundRequest),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Refund processing failed')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error processing refund:', error)
      throw new Error('Refund failed. Putangina naman!')
    }
  }

  // Get payment history for reservation
  async getPaymentHistory(reservationId: string): Promise<PaymentRecord[]> {
    try {
      const response = await fetch(`${this.baseUrl}/billing/payments/${reservationId}`)
      
      if (!response.ok) {
        throw new Error(`Failed to get payment history: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error getting payment history:', error)
      throw new Error('Failed to get payment history')
    }
  }

  // Create invoice
  async createInvoice(reservationId: string): Promise<{ invoiceId: string; invoiceNumber: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/billing/invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reservationId }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Invoice creation failed')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error creating invoice:', error)
      throw new Error('Failed to create invoice')
    }
  }

  // Generate receipt PDF
  async generateReceipt(reservationId: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/billing/receipt/${reservationId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to generate receipt: ${response.statusText}`)
      }
      
      return await response.blob()
    } catch (error) {
      console.error('Error generating receipt:', error)
      throw new Error('Failed to generate receipt')
    }
  }

  // Email receipt to guest
  async emailReceipt(reservationId: string, email: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/billing/email-receipt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reservationId, email }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to email receipt')
      }
    } catch (error) {
      console.error('Error emailing receipt:', error)
      throw new Error('Failed to email receipt')
    }
  }

  // Validate payment method
  validatePaymentMethod(method: string, amount: number): { isValid: boolean; message?: string } {
    if (amount <= 0) {
      return { isValid: false, message: 'Payment amount must be greater than zero' }
    }

    switch (method) {
      case 'cash':
        if (amount > 50000) {
          return { isValid: false, message: 'Cash payments over ₱50,000 require manager approval' }
        }
        break
      
      case 'credit_card':
      case 'debit_card':
        if (amount < 100) {
          return { isValid: false, message: 'Card payments must be at least ₱100' }
        }
        break
      
      case 'bank_transfer':
        if (amount < 1000) {
          return { isValid: false, message: 'Bank transfers must be at least ₱1,000' }
        }
        break
      
      case 'check':
        if (amount < 500) {
          return { isValid: false, message: 'Check payments must be at least ₱500' }
        }
        break
      
      default:
        return { isValid: false, message: 'Invalid payment method' }
    }

    return { isValid: true }
  }

  // Calculate payment breakdown
  calculatePaymentBreakdown(totalAmount: number, paidAmount: number = 0) {
    const balance = Math.max(0, totalAmount - paidAmount)
    const isFullyPaid = balance === 0
    const isPartiallyPaid = paidAmount > 0 && balance > 0
    const isOverpaid = paidAmount > totalAmount
    
    return {
      totalAmount,
      paidAmount,
      balance,
      isFullyPaid,
      isPartiallyPaid,
      isOverpaid,
      overpayment: isOverpaid ? paidAmount - totalAmount : 0,
    }
  }
}

// Export singleton instance
export const billingService = new BillingService()

// Utility functions for formatting
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount)
}

export const formatPaymentMethod = (method: string): string => {
  const methods = {
    cash: 'Cash',
    credit_card: 'Credit Card',
    debit_card: 'Debit Card',
    bank_transfer: 'Bank Transfer',
    check: 'Check',
  }
  return methods[method as keyof typeof methods] || method
}
