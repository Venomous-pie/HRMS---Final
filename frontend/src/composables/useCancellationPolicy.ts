import { ref, computed } from 'vue'
import type { Reservation } from '@/types/hotel'
import { cancelReservation } from '@/services/reservations'
import { useHotelDataStore } from '@/stores/hotelData'

export interface CancellationPolicy {
  id: string
  name: string
  description: string
  roomTypes: string[] // ['standard', 'deluxe', 'suite'] or ['all']
  bookingSources: string[] // ['direct', 'booking.com'] or ['all']
  rules: CancellationRule[]
}

export interface CancellationRule {
  hoursBeforeCheckIn: number
  cancellationFeePercentage: number // 0-100
  refundPercentage: number // 0-100
  description: string
}

export interface CancellationCalculation {
  canCancel: boolean
  hoursUntilCheckIn: number
  applicableRule: CancellationRule | null
  originalAmount: number
  cancellationFee: number
  refundAmount: number
  reason?: string
}

export const useCancellationPolicy = () => {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const hotelStore = useHotelDataStore()

  // Default cancellation policies - pwede i-customize based sa hotel needs
  const defaultPolicies: CancellationPolicy[] = [
    {
      id: 'standard_policy',
      name: 'Standard Cancellation Policy',
      description: 'Default policy for most reservations',
      roomTypes: ['all'],
      bookingSources: ['direct'],
      rules: [
        {
          hoursBeforeCheckIn: 24,
          cancellationFeePercentage: 0,
          refundPercentage: 100,
          description: 'Free cancellation 24+ hours before check-in'
        },
        {
          hoursBeforeCheckIn: 12,
          cancellationFeePercentage: 25,
          refundPercentage: 75,
          description: '25% fee for cancellation 12-24 hours before'
        },
        {
          hoursBeforeCheckIn: 0,
          cancellationFeePercentage: 50,
          refundPercentage: 50,
          description: '50% fee for same-day cancellation'
        }
      ]
    },
    {
      id: 'booking_com_policy',
      name: 'Booking.com Policy',
      description: 'Policy for third-party bookings',
      roomTypes: ['all'],
      bookingSources: ['booking.com', 'expedia', 'airbnb'],
      rules: [
        {
          hoursBeforeCheckIn: 48,
          cancellationFeePercentage: 0,
          refundPercentage: 100,
          description: 'Free cancellation 48+ hours before check-in'
        },
        {
          hoursBeforeCheckIn: 24,
          cancellationFeePercentage: 30,
          refundPercentage: 70,
          description: '30% fee for cancellation 24-48 hours before'
        },
        {
          hoursBeforeCheckIn: 0,
          cancellationFeePercentage: 100,
          refundPercentage: 0,
          description: 'No refund for cancellation within 24 hours'
        }
      ]
    },
    {
      id: 'vip_policy',
      name: 'VIP Guest Policy',
      description: 'Flexible policy for VIP guests',
      roomTypes: ['suite', 'presidential'],
      bookingSources: ['all'],
      rules: [
        {
          hoursBeforeCheckIn: 12,
          cancellationFeePercentage: 0,
          refundPercentage: 100,
          description: 'Free cancellation 12+ hours before check-in'
        },
        {
          hoursBeforeCheckIn: 0,
          cancellationFeePercentage: 25,
          refundPercentage: 75,
          description: '25% fee for same-day cancellation'
        }
      ]
    }
  ]

  const policies = ref<CancellationPolicy[]>(defaultPolicies)

  // Find applicable policy for a reservation - smart matching bestie
  const findApplicablePolicy = (reservation: Reservation): CancellationPolicy => {
    const roomType = reservation.type || 'standard'
    const bookingSource = reservation.source || 'direct'

    // Find most specific policy first
    let applicablePolicy = policies.value.find(policy => {
      const roomTypeMatch = policy.roomTypes.includes('all') || policy.roomTypes.includes(roomType)
      const sourceMatch = policy.bookingSources.includes('all') || policy.bookingSources.includes(bookingSource)
      return roomTypeMatch && sourceMatch && !policy.roomTypes.includes('all')
    })

    // Fallback to general policy
    if (!applicablePolicy) {
      applicablePolicy = policies.value.find(policy => 
        policy.roomTypes.includes('all') && 
        (policy.bookingSources.includes('all') || policy.bookingSources.includes(bookingSource))
      )
    }

    // Ultimate fallback to standard policy
    return applicablePolicy || policies.value[0]
  }

  // Calculate cancellation details - the math part na medyo nakakastress
  const calculateCancellation = (reservation: Reservation): CancellationCalculation => {
    try {
      const now = new Date()
      const checkInDate = new Date(reservation.checkIn)
      const hoursUntilCheckIn = Math.max(0, (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60))
      
      // Check if already checked in or past check-in
      if (reservation.status === 'checkedIn') {
        return {
          canCancel: false,
          hoursUntilCheckIn,
          applicableRule: null,
          originalAmount: reservation.totalPrice,
          cancellationFee: 0,
          refundAmount: 0,
          reason: 'Cannot cancel after check-in. Gago ka ba?'
        }
      }

      if (hoursUntilCheckIn < 0) {
        return {
          canCancel: false,
          hoursUntilCheckIn: 0,
          applicableRule: null,
          originalAmount: reservation.totalPrice,
          cancellationFee: 0,
          refundAmount: 0,
          reason: 'Cannot cancel past check-in time'
        }
      }

      const policy = findApplicablePolicy(reservation)
      
      // Find applicable rule based on timing
      let applicableRule = policy.rules[policy.rules.length - 1] // Default to most restrictive
      
      for (const rule of policy.rules) {
        if (hoursUntilCheckIn >= rule.hoursBeforeCheckIn) {
          applicableRule = rule
          break
        }
      }

      const originalAmount = reservation.totalPrice
      const cancellationFee = (originalAmount * applicableRule.cancellationFeePercentage) / 100
      const refundAmount = (originalAmount * applicableRule.refundPercentage) / 100

      return {
        canCancel: true,
        hoursUntilCheckIn,
        applicableRule,
        originalAmount,
        cancellationFee,
        refundAmount
      }

    } catch (err) {
      console.error('Cancellation calculation error:', err)
      return {
        canCancel: false,
        hoursUntilCheckIn: 0,
        applicableRule: null,
        originalAmount: reservation.totalPrice,
        cancellationFee: 0,
        refundAmount: 0,
        reason: 'Error calculating cancellation. Sira ang system!'
      }
    }
  }

  // Process cancellation - the point of no return
  const processCancellation = async (
    reservation: Reservation, 
    reason: string = ''
  ): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const calculation = calculateCancellation(reservation)
      
      if (!calculation.canCancel) {
        error.value = calculation.reason || 'Cancellation not allowed'
        return false
      }

      // Call backend cancellation API using existing service
      const result = await cancelReservation(reservation.id!, {
        reason,
        cancellationFee: calculation.cancellationFee,
        refundAmount: calculation.refundAmount
      })
      
      // Show success message with guest removal info if applicable
      console.log('Reservation cancelled successfully! Guest removed kung walang ibang booking na.', result)
      
      // Refresh reservations data to show updated state
      await hotelStore.fetchReservations()
      
      return true

    } catch (err) {
      error.value = 'Cancellation failed. Putangina naman!'
      console.error('Cancellation processing error:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Get policy summary for display
  const getPolicySummary = (reservation: Reservation): string => {
    const policy = findApplicablePolicy(reservation)
    const rules = policy.rules.map(rule => 
      `${rule.hoursBeforeCheckIn}h+: ${rule.refundPercentage}% refund`
    ).join(', ')
    
    return `${policy.name}: ${rules}`
  }

  // Check if cancellation is free
  const isFreeCancellation = (reservation: Reservation): boolean => {
    const calculation = calculateCancellation(reservation)
    return calculation.canCancel && calculation.cancellationFee === 0
  }

  return {
    // State
    policies,
    isLoading,
    error,
    
    // Methods
    findApplicablePolicy,
    calculateCancellation,
    processCancellation,
    getPolicySummary,
    isFreeCancellation,
  }
}
