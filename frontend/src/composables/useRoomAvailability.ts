import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import type { Room, Reservation, ReservationFormData } from '@/types/hotel'
import { getTodayAsString, addDaysToDateString, daysBetweenDates } from '@/utils'
import { isRoomAvailableForRange } from '@/utils/reservations'

export const useRoomAvailability = (
  rooms: Ref<Room[]>,
  reservations: Ref<Reservation[]>,
  formData: Ref<ReservationFormData>,
  excludeReservationId?: Ref<string | null | undefined>,
) => {
  const isCheckingAvailability = ref(false)

  const minDate = computed(() => getTodayAsString())

  const minCheckOutDate = computed(() => {
    return formData.value.checkIn ? addDaysToDateString(formData.value.checkIn, 1) : minDate.value
  })

  const nights = computed(() => {
    if (!formData.value.checkIn || !formData.value.checkOut) return 0
    return daysBetweenDates(formData.value.checkIn, formData.value.checkOut)
  })

  const roomsByCategory = computed(() => {
    const categories: Record<string, Room[]> = {}
    rooms.value.forEach((room) => {
      if (!categories[room.type]) categories[room.type] = []
      categories[room.type].push(room)
    })
    return Object.entries(categories).map(([type, rs]) => ({
      type,
      rooms: rs.sort((a, b) => a.number.localeCompare(b.number)),
    }))
  })

  const selectedRoom = computed(() =>
    rooms.value.find((r) => r.number === formData.value.roomNumber),
  )
  const selectedRoomPrice = computed(() => selectedRoom.value?.pricePerNight || 0)
  const calculatedPrice = computed(() =>
    nights.value > 0 && selectedRoomPrice.value > 0
      ? (nights.value * selectedRoomPrice.value).toFixed(2)
      : '0.00',
  )

  const isRoomAvailable = (room: Room): boolean => {
    if (!formData.value.checkIn || !formData.value.checkOut) return true
    if (formData.value.numGuest > room.maxCapacity) return false

    const resList = excludeReservationId?.value
      ? reservations.value.filter(
          (r) => (r.id || '').toString() !== (excludeReservationId!.value || '').toString(),
        )
      : reservations.value

    return isRoomAvailableForRange(
      resList,
      room.number,
      formData.value.checkIn,
      formData.value.checkOut,
    )
  }

  const filterAvailableRooms = () => {
    if (formData.value.checkIn && formData.value.checkOut && formData.value.numGuest) {
      isCheckingAvailability.value = true
      setTimeout(() => {
        isCheckingAvailability.value = false
      }, 500)
    }
  }

  return {
    isCheckingAvailability,
    minDate,
    minCheckOutDate,
    nights,
    roomsByCategory,
    selectedRoom,
    selectedRoomPrice,
    calculatedPrice,
    isRoomAvailable,
    filterAvailableRooms,
  }
}
