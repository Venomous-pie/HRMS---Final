import { ref, computed } from 'vue'
import type { Reservation, Guest } from '@/types/hotel'

export interface CheckoutBill {
  reservationId: string
  guestName: string
  roomNumber: string
  checkInDate: string
  checkOutDate: string
  nights: number
  roomRate: number
  subtotal: number
  extraCharges: ExtraCharge[]
  taxes: number
  totalAmount: number
  paidAmount: number
  balanceAmount: number
}

export interface ExtraCharge {
  id: string
  description: string
  amount: number
  date: string
  category: 'minibar' | 'room_service' | 'laundry' | 'phone' | 'damage' | 'late_checkout' | 'other'
}

export interface CheckoutFormData {
  paymentMethod: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer'
  paymentAmount: number
  extraCharges: ExtraCharge[]
  notes: string
  damageAssessment: boolean
  damageDescription?: string
  damageAmount?: number
}

export const useCheckout = () => {
  const isCheckoutModalOpen = ref(false)
  const selectedReservation = ref<Reservation | null>(null)
  const checkoutBill = ref<CheckoutBill | null>(null)
  const isProcessing = ref(false)
  const error = ref<string | null>(null)
  
  // Form data for checkout process
  const checkoutForm = ref<CheckoutFormData>({
    paymentMethod: 'cash',
    paymentAmount: 0,
    extraCharges: [],
    notes: '',
    damageAssessment: false,
  })

  // Calculate nights between dates - no cap, fr fr
  const calculateNights = (checkIn: string, checkOut: string): number => {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Generate bill for the reservation - this is where the magic happens bestie
  const generateBill = async (reservation: Reservation): Promise<CheckoutBill> => {
    try {
      console.log('🔍 Generating bill for reservation:', reservation)
      
      // Safely get dates
      const checkInStr = reservation.checkIn?.toString() || reservation.checkInDate?.toString() || ''
      const checkOutStr = reservation.checkOut?.toString() || reservation.checkOutDate?.toString() || ''
      
      if (!checkInStr || !checkOutStr) {
        throw new Error('Missing check-in or check-out dates')
      }
      
      const nights = calculateNights(checkInStr, checkOutStr)
      console.log('📅 Calculated nights:', nights)
      
      // Base room charges - handle missing totalPrice
      const totalPrice = reservation.totalPrice || reservation.amount || 0
      const roomRate = nights > 0 ? totalPrice / nights : totalPrice
      const subtotal = totalPrice
      
      // Calculate extra charges total
      const extraChargesTotal = checkoutForm.value.extraCharges.reduce(
        (sum, charge) => sum + charge.amount,
        0
      )
      
      // Tax calculation (assuming 12% tax rate - adjust as needed)
      const taxRate = 0.12
      const taxes = (subtotal + extraChargesTotal) * taxRate
      
      const totalAmount = subtotal + extraChargesTotal + taxes
      const paidAmount = 0 // Will be updated from payment records
      const balanceAmount = totalAmount - paidAmount

      const bill = {
        reservationId: reservation.id?.toString() || '',
        guestName: reservation.guestName || reservation.guest || 'Unknown Guest',
        roomNumber: reservation.roomNumber || reservation.room || '',
        checkInDate: checkInStr,
        checkOutDate: checkOutStr,
        nights,
        roomRate,
        subtotal,
        extraCharges: checkoutForm.value.extraCharges,
        taxes,
        totalAmount,
        paidAmount,
        balanceAmount,
      }
      
      console.log('💰 Generated bill:', bill)
      return bill
    } catch (error) {
      console.error('❌ Error generating bill:', error)
      throw error
    }
  }

  // Add extra charge - for those unexpected expenses lol
  const addExtraCharge = (charge: Omit<ExtraCharge, 'id'>) => {
    const newCharge: ExtraCharge = {
      ...charge,
      id: `charge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }
    checkoutForm.value.extraCharges.push(newCharge)
    
    // Recalculate bill if we have a reservation
    if (selectedReservation.value) {
      generateBill(selectedReservation.value).then(bill => {
        checkoutBill.value = bill
        checkoutForm.value.paymentAmount = bill.balanceAmount
      })
    }
  }

  // Remove extra charge
  const removeExtraCharge = (chargeId: string) => {
    checkoutForm.value.extraCharges = checkoutForm.value.extraCharges.filter(
      charge => charge.id !== chargeId
    )
    
    // Recalculate bill
    if (selectedReservation.value) {
      generateBill(selectedReservation.value).then(bill => {
        checkoutBill.value = bill
        checkoutForm.value.paymentAmount = bill.balanceAmount
      })
    }
  }

  // Open checkout modal - time to settle the bill bestie
  const openCheckoutModal = async (reservation: Reservation) => {
    try {
      if (!reservation || !reservation.id) {
        throw new Error('Invalid reservation')
      }
      
      console.log('🔄 Opening checkout modal for reservation:', reservation.id)
      
      // Set state first
      isCheckoutModalOpen.value = true
      selectedReservation.value = reservation
      error.value = null
      
      // Reset form
      checkoutForm.value = {
        paymentMethod: 'cash',
        paymentAmount: 0,
        extraCharges: [],
        notes: '',
        damageAssessment: false,
      }
      
      // Generate initial bill
      console.log('💰 Generating bill...')
      const bill = await generateBill(reservation)
      console.log('✅ Bill generated:', bill)
      checkoutBill.value = bill
      checkoutForm.value.paymentAmount = bill.balanceAmount
      
      console.log('✅ Checkout modal opened successfully')
      
      // Return true to indicate success
      return true
    } catch (err) {
      error.value = 'Failed to generate checkout bill. Pakyu naman!'
      console.error('❌ Checkout error:', err)
      isCheckoutModalOpen.value = false
      return false
    }
  }

  // Close checkout modal
  const closeCheckoutModal = () => {
    isCheckoutModalOpen.value = false
    selectedReservation.value = null
    checkoutBill.value = null
    error.value = null
  }

  // Process checkout - the final boss battle
  const processCheckout = async (): Promise<boolean> => {
    if (!selectedReservation.value || !checkoutBill.value) {
      error.value = 'No reservation selected for checkout'
      return false
    }

    isProcessing.value = true
    error.value = null

    try {
      // Prepare checkout data for API
      const checkoutData = {
        paymentAmount: checkoutForm.value.paymentAmount,
        paymentMethod: checkoutForm.value.paymentMethod,
        extraCharges: checkoutForm.value.extraCharges,
        notes: checkoutForm.value.notes,
        damageAssessment: checkoutForm.value.damageAssessment,
        damageDescription: checkoutForm.value.damageDescription,
        damageAmount: checkoutForm.value.damageAmount,
      }

      // Call checkout API endpoint
      const response = await fetch(`http://localhost:3000/api/reservations/${selectedReservation.value.id}/checkout`, {
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
      closeCheckoutModal()
      return true

    } catch (err: any) {
      error.value = err.message || 'Checkout failed. Gago naman ang system!'
      console.error('Checkout processing error:', err)
      return false
    } finally {
      isProcessing.value = false
    }
  }

  // Computed properties for validation
  const canProcessCheckout = computed(() => {
    return (
      selectedReservation.value &&
      checkoutBill.value &&
      checkoutForm.value.paymentAmount >= 0 &&
      (!checkoutForm.value.damageAssessment || 
       (checkoutForm.value.damageDescription && checkoutForm.value.damageAmount))
    )
  })

  const isLateCheckout = computed(() => {
    if (!selectedReservation.value) return false
    
    const checkoutTime = new Date()
    const scheduledCheckout = new Date(selectedReservation.value.checkOut)
    scheduledCheckout.setHours(11, 0, 0, 0) // Default checkout time 11:00 AM
    
    return checkoutTime > scheduledCheckout
  })

  return {
    // State
    isCheckoutModalOpen,
    selectedReservation,
    checkoutBill,
    checkoutForm,
    isProcessing,
    error,
    
    // Computed
    canProcessCheckout,
    isLateCheckout,
    
    // Methods
    openCheckoutModal,
    closeCheckoutModal,
    processCheckout,
    addExtraCharge,
    removeExtraCharge,
    generateBill,
  }
}
