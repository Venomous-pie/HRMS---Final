import type { Reservation, ReservationFormData } from '@/types/hotel'
import { apiFetch } from './apiClient'

export async function getReservations(): Promise<Reservation[]> {
  return apiFetch<Reservation[]>('/reservations')
}

export async function createReservation(payload: ReservationFormData): Promise<any> {
  return apiFetch<any>('/reserve-room', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateReservation(
  id: string,
  payload: Partial<ReservationFormData> & {
    totalPrice?: number
    status?: string
    numGuest?: number
    specialRequest?: string
  },
): Promise<any> {
  return apiFetch<any>(`/reservations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function getReservationById(id: string): Promise<any> {
  return apiFetch<any>(`/reservations/${id}`)
}

export async function cancelReservation(
  id: string,
  payload: {
    reason: string
    cancellationFee: number
    refundAmount: number
  }
): Promise<any> {
  return apiFetch<any>(`/reservations/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
