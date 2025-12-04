import { computed, ref, type Ref } from 'vue'
import type { Room } from '@/types/hotel'

export const useRoomCategorization = (
  rooms: Ref<Room[]>,
  searchQuery: Ref<string>,
  roomTypeFilter: Ref<string>,
  matchingRoomsFromReservations?: Ref<Set<string>>,
) => {
  const expandedCategories = ref<Record<string, boolean>>({})

  const filteredRooms = computed(() => {
    let filtered = rooms.value

    if (searchQuery.value && searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim()
      const matchSet = matchingRoomsFromReservations?.value
      filtered = filtered.filter((room) => {
        const roomNumberRaw = (room.roomNumber || room.number || room.id || '').toString()
        const roomNumber = roomNumberRaw.toLowerCase()
        const numberMatch = roomNumber.includes(query)
        const reservationMatch = matchSet ? matchSet.has(roomNumberRaw) : false
        return numberMatch || reservationMatch
      })
    }

    if (roomTypeFilter.value !== 'All Room Types') {
      filtered = filtered.filter((room) => {
        const typeName = room.RoomType?.typeName || room.roomType || room.type || 'Standard'

        if (roomTypeFilter.value === 'Standard') {
          return typeName.toLowerCase().includes('standard')
        }
        if (roomTypeFilter.value === 'Deluxe') {
          return typeName.toLowerCase().includes('deluxe')
        }
        if (roomTypeFilter.value === 'Suite') {
          return typeName.toLowerCase().includes('suite')
        }

        return typeName === roomTypeFilter.value
      })
    }

    return filtered
  })

  const roomCategories = computed(() => {
    if (!filteredRooms.value.length) {
      return []
    }

    const grouped = filteredRooms.value.reduce(
      (acc, room) => {
        const typeName = room.RoomType?.typeName || room.roomType || room.type || 'Standard'
        const categoryName = `${typeName} Rooms`

        if (!acc[typeName]) {
          acc[typeName] = {
            name: categoryName,
            type: typeName,
            rooms: [],
          }
        }

        acc[typeName].rooms.push({
          number: room.roomNumber || room.number || room.id,
          type: typeName,
          floor: `Floor ${room.floorNumber || Math.floor(parseInt((room.roomNumber || room.number || room.id || '0').toString()) / 100)}`,
          status: room.status || 'available',
          pricePerNight: room.pricePerNight || 0,
          maxCapacity: room.maxCapacity || 2,
          amenities: room.amenities || [],
          originalRoom: room,
        })

        return acc
      },
      {} as Record<string, any>,
    )

    const categories = Object.values(grouped).map((category: any) => ({
      ...category,
      rooms: category.rooms.sort((a: any, b: any) => {
        const aNum = parseInt(a.number) || 0
        const bNum = parseInt(b.number) || 0
        return aNum - bNum
      }),
    }))

    categories.sort((a, b) => a.type.localeCompare(b.type))

    categories.forEach((category) => {
      if (expandedCategories.value[category.type] === undefined) {
        expandedCategories.value[category.type] = true
      }
    })

    return categories
  })

  const toggleCategory = (categoryType: string): void => {
    expandedCategories.value[categoryType] = !expandedCategories.value[categoryType]
  }

  const expandAllCategories = (): void => {
    roomCategories.value.forEach((category) => {
      expandedCategories.value[category.type] = true
    })
  }

  const collapseAllCategories = (): void => {
    roomCategories.value.forEach((category) => {
      expandedCategories.value[category.type] = false
    })
  }

  const categoryHasRooms = (categoryType: string): boolean => {
    return roomCategories.value.some(
      (category) => category.type === categoryType && category.rooms.length > 0,
    )
  }

  const roomTypes = computed(() => {
    const types = new Set(
      rooms.value.map(
        (room) => room.RoomType?.typeName || room.roomType || room.type || 'Standard',
      ),
    )
    return Array.from(types)
      .filter((type) => type)
      .sort()
  })

  const getRoomCountByType = (roomType: string): number => {
    return rooms.value.filter((room) => {
      const typeName = room.RoomType?.typeName || room.roomType || room.type || 'Standard'
      return typeName === roomType
    }).length
  }

  const categoryStats = computed(() => {
    return roomCategories.value.map((category) => ({
      type: category.type,
      name: category.name,
      totalRooms: category.rooms.length,
      availableRooms: category.rooms.filter((room: any) => room.status === 'available').length,
      occupiedRooms: category.rooms.filter((room: any) => room.status === 'occupied').length,
      maintenanceRooms: category.rooms.filter((room: any) => room.status === 'maintenance').length,
      outOfOrderRooms: category.rooms.filter((room: any) => room.status === 'out-of-order').length,
      averagePrice:
        category.rooms.reduce((sum: number, room: any) => sum + room.pricePerNight, 0) /
        category.rooms.length,
      maxCapacity: Math.max(...category.rooms.map((room: any) => room.maxCapacity || 2)),
    }))
  })

  const findRoomsByNumber = (searchTerm: string): any[] => {
    const query = searchTerm.toLowerCase().trim()
    return roomCategories.value.flatMap((category) =>
      category.rooms.filter((room: any) => room.number.toLowerCase().includes(query)),
    )
  }

  const findRoomsByType = (roomType: string): any[] => {
    return roomCategories.value
      .filter((category) => category.type.toLowerCase().includes(roomType.toLowerCase()))
      .flatMap((category) => category.rooms)
  }

  const findRoomsByStatus = (status: string): any[] => {
    return roomCategories.value.flatMap((category) =>
      category.rooms.filter((room: any) => room.status === status),
    )
  }

  const getRoomsByFloor = (floorNumber: number): any[] => {
    return roomCategories.value.flatMap((category) =>
      category.rooms.filter((room: any) => {
        const roomFloor = Math.floor(parseInt(room.number) / 100)
        return roomFloor === floorNumber
      }),
    )
  }

  const getRoomNumbersInCategory = (categoryType: string): string[] => {
    const category = roomCategories.value.find((cat) => cat.type === categoryType)
    return category ? category.rooms.map((room: any) => room.number) : []
  }

  const hasMatchingRooms = computed(() => {
    return filteredRooms.value.length > 0
  })

  const totalRoomCount = computed(() => {
    return roomCategories.value.reduce((total, category) => total + category.rooms.length, 0)
  })

  return {
    expandedCategories,
    filteredRooms,
    roomCategories,
    roomTypes,
    toggleCategory,
    expandAllCategories,
    collapseAllCategories,
    categoryHasRooms,
    getRoomCountByType,
    categoryStats,
    findRoomsByNumber,
    findRoomsByType,
    findRoomsByStatus,
    getRoomsByFloor,
    getRoomNumbersInCategory,
    hasMatchingRooms,
    totalRoomCount,
  }
}
