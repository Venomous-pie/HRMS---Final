import type { ExtraCharge } from '@/composables/useCheckout'

export interface GuestCheckout {
  reservationId: string
  checkoutDate: string
  paymentAmount: number
  paymentMethod: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer'
  extraCharges: ExtraCharge[]
  notes: string
  damageAssessment: boolean
  damageDescription?: string
  damageAmount?: number
  totalAmount: number
  balance: number
}