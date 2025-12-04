import type { Room } from '@/types/hotel'

export function buildReservationSuccessMessage(args: {
  reservation: any
  rooms: Room[]
  emittedRoomNumber?: string
}): string {
  const { reservation, rooms, emittedRoomNumber } = args

  const guestFirst =
    reservation?.Guest?.firstName || reservation?.guest || reservation?.guestName || 'guest'

  let roomNo: string | undefined = emittedRoomNumber || reservation?.roomNumber || reservation?.room
  let roomObj: Room | undefined

  if (Array.isArray(rooms)) {
    if (emittedRoomNumber) {
      roomObj = rooms.find(
        (r) => r.number === emittedRoomNumber || r.roomNumber === emittedRoomNumber,
      )
    }
    if (!roomObj && reservation?.RoomId != null) {
      const targetId = String(reservation.RoomId)
      roomObj = rooms.find((r) => String((r as any).id) === targetId)
    }
    if (!roomObj && roomNo) {
      roomObj = rooms.find((r) => r.number === roomNo || r.roomNumber === roomNo)
    }
  }

  if (!roomNo && roomObj) {
    roomNo = roomObj.number || roomObj.roomNumber
  }

  const category: string | undefined =
    (roomObj as any)?.type || (roomObj as any)?.roomType || (roomObj as any)?.RoomType?.typeName

  roomNo = roomNo || '[unknown]'
  return `Reservation created successfully for ${guestFirst} in room ${roomNo}${category ? ` (${category})` : ''}`
}
