import type { Room } from '@/types/hotel'
import { apiFetch } from './apiClient'

export async function getRooms(): Promise<Room[]> {
  return apiFetch<Room[]>('/rooms')
}
