/**
 * Room categorization and management composable
 * Encapsulates room grouping, filtering, and category expansion logic
 */

import { computed, ref, type Ref } from 'vue'
import type { Room } from '@/types/hotel'

export const useRoomCategories = (
  rooms: Ref<Room[]>,
  searchQuery: Ref<string>,
  roomTypeFilter: Ref<string>,
) => {
  /**
   * Track which room type categories are expanded/collapsed
   */
  const expandedCategories = ref<Record<string, boolean>>({})

  /**
   * Toggle category expansion state
   * @param categoryType - The room type to expand/collapse
   */
  const toggleCategory = (categoryType: string): void => {
    expandedCategories.value[categoryType] = !expandedCategories.value[categoryType]
  }

  /**
   * Filter rooms based on search query and room type filter
   */
  const filteredRooms = computed(() => {
    let filtered = rooms.value

    // Filter by search query (room number or guest name)
    if (searchQuery.value && searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim()
      filtered = filtered.filter((room) => {
        const roomNumber = (room.roomNumber || room.number || room.id || '')
          .toString()
          .toLowerCase()
        return roomNumber.includes(query)
      })
    }

    // Filter by room type
    if (roomTypeFilter.value !== 'All Room Types') {
      filtered = filtered.filter((room) => {
        const typeName = room.RoomType?.typeName || room.roomType || room.type || 'Standard'

        // Handle partial matches for broader categories
        if (roomTypeFilter.value === 'Standard') {
          return typeName.toLowerCase().includes('standard')
        }
        if (roomTypeFilter.value === 'Deluxe') {
          return typeName.toLowerCase().includes('deluxe')
        }
        if (roomTypeFilter.value === 'Suite') {
          return typeName.toLowerCase().includes('suite')
        }

        // Exact match for specific types
        return typeName === roomTypeFilter.value
      })
    }

    return filtered
  })

  /**
   * Group filtered rooms by category with hierarchical structure
   */
  const roomCategories = computed(() => {
    if (!filteredRooms.value.length) {
      return []
    }

    // Group rooms by their room type
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
          originalRoom: room, // Keep reference to original room data
        })

        return acc
      },
      {} as Record<string, any>,
    )

    // Convert to array and sort rooms within categories
    const categories = Object.values(grouped).map((category: any) => ({
      ...category,
      rooms: category.rooms.sort((a: any, b: any) => {
        // Sort by room number (natural sort for numbers)
        const aNum = parseInt(a.number) || 0
        const bNum = parseInt(b.number) || 0
        return aNum - bNum
      }),
    }))

    // Sort categories by type name
    categories.sort((a, b) => a.type.localeCompare(b.type))

    // Initialize expansion state for new categories
    categories.forEach((category) => {
      if (expandedCategories.value[category.type] === undefined) {
        expandedCategories.value[category.type] = true // Default to expanded
      }
    })

    return categories
  })

  /**
   * Get all room types from the rooms data
   */
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

  /**
   * Get room count by type
   */
  const getRoomCountByType = (roomType: string): number => {
    return rooms.value.filter((room) => {
      const typeName = room.RoomType?.typeName || room.roomType || room.type || 'Standard'
      return typeName === roomType
    }).length
  }

  /**
   * Check if a category has any rooms
   */
  const categoryHasRooms = (categoryType: string): boolean => {
    return roomCategories.value.some(
      (category) => category.type === categoryType && category.rooms.length > 0,
    )
  }

  /**
   * Expand all categories
   */
  const expandAllCategories = (): void => {
    roomCategories.value.forEach((category) => {
      expandedCategories.value[category.type] = true
    })
  }

  /**
   * Collapse all categories
   */
  const collapseAllCategories = (): void => {
    roomCategories.value.forEach((category) => {
      expandedCategories.value[category.type] = false
    })
  }

  return {
    expandedCategories,
    toggleCategory,
    filteredRooms,
    roomCategories,
    roomTypes,
    getRoomCountByType,
    categoryHasRooms,
    expandAllCategories,
    collapseAllCategories,
  }
}
