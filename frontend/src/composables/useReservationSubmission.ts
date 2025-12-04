import { ref } from 'vue'
import type { Ref } from 'vue'
import type { ReservationFormData, ModalState } from '@/types/hotel'
import { createReservation } from '@/services/reservations'
import { ApiClientError } from '@/services/apiClient'

export const useReservationSubmission = (
  formData: Ref<ReservationFormData>,
  validateForm: () => boolean,
  clearFormDraft: () => void,
  onSuccess?: (reservation: any) => void,
  onAfterSuccess?: () => void,
) => {
  const modalState = ref<ModalState>({
    isOpen: false,
    isLoading: false,
    error: null,
    success: false,
  })

  const submitReservation = async () => {
    if (!validateForm()) return

    modalState.value.isLoading = true
    modalState.value.error = null

    try {
      const data = await createReservation(formData.value)
      modalState.value.success = true
      clearFormDraft()
      onSuccess?.(data.reservation)
      setTimeout(() => {
        onAfterSuccess?.()
      }, 1500)
      return data.reservation
    } catch (error: any) {
      if (error instanceof ApiClientError) {
        if (error.status === 409) {
          modalState.value.error = `Room conflict: ${error.data?.error || 'Room is not available for the chosen dates'}`
        } else {
          modalState.value.error =
            (error.data?.error as string) || error.message || 'Failed to create reservation'
        }
      } else {
        modalState.value.error = 'Network error. Please try again.'
      }
    } finally {
      modalState.value.isLoading = false
    }
  }

  return {
    modalState,
    submitReservation,
  }
}
