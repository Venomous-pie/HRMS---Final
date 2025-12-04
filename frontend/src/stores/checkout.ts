import { defineStore } from 'pinia'
import type { Reservation } from '@/types/hotel'
import type { CheckoutBill, ExtraCharge, CheckoutFormData } from '@/composables/useCheckout'
// import type { GuestCheckout } from '@/types/checkout'
// import type { GuestCheckout } from '@/types/hotel' // Update this path if GuestCheckout is defined elsewhere
import type { GuestCheckout } from '@/types/checkout' // Update this path if GuestCheckout is defined elsewhere
export const useCheckoutStore = defineStore('checkout', {
  state: () => ({
    isCheckoutModalOpen: false,
    selectedReservation: null as Reservation | null,
    checkoutBill: null as CheckoutBill | null,
    checkoutForm: {
      paymentMethod: 'cash',
      paymentAmount: 0,
      extraCharges: [],
      notes: '',
      damageAssessment: false,
    } as CheckoutFormData,
    isProcessing: false,
    error: null as string | null,
  }),
  actions: {
    async openCheckoutModal(reservation: Reservation) {
      if (!reservation || !reservation.id) {
        this.error = 'Invalid reservation'
        return false
      }
      this.selectedReservation = reservation
      this.isCheckoutModalOpen = true
      this.error = null
      this.checkoutForm = {
        paymentMethod: 'cash',
        paymentAmount: 0,
        extraCharges: [],
        notes: '',
        damageAssessment: false,
      }

      // --- Bill generation logic ---
      const checkInStr = reservation.checkIn?.toString() || reservation.checkInDate?.toString() || ''
      const checkOutStr = reservation.checkOut?.toString() || reservation.checkOutDate?.toString() || ''
      let nights = 1
      if (checkInStr && checkOutStr) {
        const start = new Date(checkInStr)
        const end = new Date(checkOutStr)
        const diffTime = Math.abs(end.getTime() - start.getTime())
        nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      }
      const totalPrice = reservation.totalPrice || reservation.amount || 0
      const roomRate = nights > 0 ? totalPrice / nights : totalPrice
      const subtotal = totalPrice
      const extraChargesTotal = this.checkoutForm.extraCharges.reduce(
        (sum, charge) => sum + charge.amount,
        0
      )
      const taxRate = 0.12
      const taxes = (subtotal + extraChargesTotal) * taxRate
      const totalAmount = subtotal + extraChargesTotal + taxes
      const paidAmount = 0
      const balanceAmount = totalAmount - paidAmount

      this.checkoutBill = {
        reservationId: reservation.id.toString(),
        guestName: reservation.guestName || reservation.guest || 'Unknown Guest',
        roomNumber: reservation.roomNumber || reservation.room || '',
        checkInDate: checkInStr,
        checkOutDate: checkOutStr,
        nights,
        roomRate,
        subtotal,
        extraCharges: this.checkoutForm.extraCharges,
        taxes,
        totalAmount,
        paidAmount,
        balanceAmount,
      }
      this.checkoutForm.paymentAmount = balanceAmount
      return true
    },
    closeCheckoutModal() {
      this.isCheckoutModalOpen = false
      this.selectedReservation = null
      this.checkoutBill = null
      this.error = null
    },
    async processCheckout(): Promise<boolean> {
      if (!this.selectedReservation || !this.checkoutBill) {
        this.error = 'No reservation selected for checkout'
        return false
      }

      this.isProcessing = true
      this.error = null

      try {
        const checkoutData: GuestCheckout = {
          reservationId: this.selectedReservation.id?.toString() || '',
          checkoutDate: new Date().toISOString(),
          paymentAmount: this.checkoutForm.paymentAmount,
          paymentMethod: this.checkoutForm.paymentMethod,
          extraCharges: this.checkoutForm.extraCharges,
          notes: this.checkoutForm.notes,
          damageAssessment: this.checkoutForm.damageAssessment,
          damageDescription: this.checkoutForm.damageDescription,
          damageAmount: this.checkoutForm.damageAmount,
          totalAmount: this.checkoutBill.totalAmount,
          balance: this.checkoutBill.balanceAmount
        }

        // Call checkout API endpoint
        const response = await fetch(`http://localhost:3000/api/reservations/${this.selectedReservation.id}/checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify(checkoutData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Checkout failed')
        }

        const result = await response.json()
        console.log('✅ Checkout completed successfully:', result)

        // Success! Time to celebrate 🎉
        this.closeCheckoutModal()
        // Refresh reservations and rooms for instant UI update
        try {
          const hotelDataStore = (await import('@/stores/hotelData')).useHotelDataStore()
          await hotelDataStore.fetchReservations?.()
          await hotelDataStore.fetchRooms?.()
        } catch (e) {
          console.warn('Could not refresh hotel data after checkout:', e)
        }
        return true

      } catch (err: any) {
        this.error = err.message || 'Checkout failed. Please try again.'
        console.error('Checkout processing error:', err)
        return false
      } finally {
        this.isProcessing = false
      }
    },
    addExtraCharge(charge: Omit<ExtraCharge, 'id'>) {
      const newCharge: ExtraCharge = {
        ...charge,
        id: `charge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      }
      this.checkoutForm.extraCharges.push(newCharge)
      
      // Recalculate bill
      if (this.selectedReservation && this.checkoutBill) {
        const extraChargesTotal = this.checkoutForm.extraCharges.reduce(
          (sum, c) => sum + c.amount,
          0
        )
        const taxRate = 0.12
        const taxes = (this.checkoutBill.subtotal + extraChargesTotal) * taxRate
        const totalAmount = this.checkoutBill.subtotal + extraChargesTotal + taxes
        const balanceAmount = totalAmount - this.checkoutBill.paidAmount

        this.checkoutBill = {
          ...this.checkoutBill,
          extraCharges: this.checkoutForm.extraCharges,
          taxes,
          totalAmount,
          balanceAmount,
        }
        this.checkoutForm.paymentAmount = balanceAmount
      }
    },
    removeExtraCharge(chargeId: string) {
      this.checkoutForm.extraCharges = this.checkoutForm.extraCharges.filter(
        charge => charge.id !== chargeId
      )
      
      // Recalculate bill
      if (this.selectedReservation && this.checkoutBill) {
        const extraChargesTotal = this.checkoutForm.extraCharges.reduce(
          (sum, c) => sum + c.amount,
          0
        )
        const taxRate = 0.12
        const taxes = (this.checkoutBill.subtotal + extraChargesTotal) * taxRate
        const totalAmount = this.checkoutBill.subtotal + extraChargesTotal + taxes
        const balanceAmount = totalAmount - this.checkoutBill.paidAmount

        this.checkoutBill = {
          ...this.checkoutBill,
          extraCharges: this.checkoutForm.extraCharges,
          taxes,
          totalAmount,
          balanceAmount,
        }
        this.checkoutForm.paymentAmount = balanceAmount
      }
    }
  },
})
