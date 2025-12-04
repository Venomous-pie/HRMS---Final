import type { Ref } from 'vue'
import type { PrefilledReservationData, ReservationFormData, Room } from '@/types/hotel'

export const usePrefilledReservation = (
  prefilledData: Ref<PrefilledReservationData | null | undefined>,
  rooms: Ref<Room[]>,
  formData: Ref<ReservationFormData>,
  validateDates: () => void,
  validateRoomSelection: () => boolean,
  isRoomAvailable: (room: Room) => boolean,
  filterAvailableRooms: () => void,
) => {
  const applyPrefilledData = () => {
    if (!prefilledData.value) return

    if (prefilledData.value.firstName) formData.value.firstName = prefilledData.value.firstName
    if (prefilledData.value.middleName) formData.value.middleName = prefilledData.value.middleName
    if (prefilledData.value.lastName) formData.value.lastName = prefilledData.value.lastName
    if (prefilledData.value.email) formData.value.email = prefilledData.value.email
    if (prefilledData.value.phone) formData.value.phone = prefilledData.value.phone
    if (prefilledData.value.countryCode)
      formData.value.countryCode = prefilledData.value.countryCode
    if (prefilledData.value.address) formData.value.address = prefilledData.value.address
    if (prefilledData.value.idDocument) formData.value.idDocument = prefilledData.value.idDocument

    if (typeof prefilledData.value.numGuest === 'number') {
      formData.value.numGuest = prefilledData.value.numGuest
    } else {
      formData.value.numGuest = formData.value.numGuest || 1
    }

    if (prefilledData.value.checkInDate) formData.value.checkIn = prefilledData.value.checkInDate
    if (prefilledData.value.checkOutDate) formData.value.checkOut = prefilledData.value.checkOutDate
    if (prefilledData.value.specialRequest)
      formData.value.specialRequest = prefilledData.value.specialRequest
    if (prefilledData.value.status) formData.value.status = prefilledData.value.status

    validateDates()
    filterAvailableRooms()

    if (prefilledData.value.roomNumber) {
      const selectedRoom = rooms.value.find(
        (room) => room.number === prefilledData.value?.roomNumber,
      )
      if (selectedRoom && isRoomAvailable(selectedRoom)) {
        formData.value.roomNumber = prefilledData.value.roomNumber
        validateRoomSelection()
      } else {
        formData.value.roomNumber = ''
      }
    }
  }

  return { applyPrefilledData }
}
