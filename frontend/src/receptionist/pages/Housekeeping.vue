<template>
  <div class="px-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Housekeeping</h1>
    </div>

    <div class="mb-4">
      <div class="flex items-center justify-between">
        <Searchbar 
          placeholder="Search by room number, type, or guest..." 
          icon="pi pi-search" 
          @search="handleSearch"
          width="20rem" 
          :outline="true"
        />
        <div class="flex items-center gap-4">
          <button 
            @click="clearAllFilters"
            class="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 bg-gray-50 outline outline-1 outline-gray-200 rounded-full transition-colors hover:bg-gray-100 hover:text-gray-800"
            :class="{ 'opacity-50 cursor-not-allowed': !hasActiveFilters }" 
            :disabled="!hasActiveFilters"
          >
            <i class="pi pi-filter-slash w-3 h-3"></i>
            Clear Filters
          </button>

          <!-- Room Filter -->
          <div class="relative">
            <div 
              @click="toggleDropdown('room')"
              class="flex items-center bg-gray-50 outline outline-1 outline-gray-200 rounded-full px-3 py-2 pr-8 text-xs text-gray-700 transition-colors cursor-pointer hover:bg-gray-100"
            >
              {{ roomFilterLabel }}
              <i class="pi pi-chevron-down absolute pt-[0.2rem] right-2 text-gray-300 w-4 h-4"></i>
            </div>
            <div 
              v-if="activeDropdown === 'room'"
              class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-full max-h-60 overflow-y-auto"
            >
              <div 
                @click="selectRoom('')"
                class="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer first:rounded-t-lg"
                :class="{ 'bg-green-50 text-green-700': filters.room === '' }"
              >
                All Rooms
              </div>
              <div 
                v-for="room in uniqueRooms" 
                :key="room"
                @click="selectRoom(room)"
                class="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"
                :class="{ 'bg-green-50 text-green-700': filters.room === room }"
              >
                {{ room }}
              </div>
            </div>
          </div>

          <!-- Room Type Filter -->
          <div class="relative">
            <div 
              @click="toggleDropdown('roomType')"
              class="flex items-center bg-gray-50 outline outline-1 outline-gray-200 rounded-full px-3 py-2 pr-8 text-xs text-gray-700 transition-colors cursor-pointer hover:bg-gray-100"
            >
              {{ roomTypeFilterLabel }}
              <i class="pi pi-chevron-down absolute pt-[0.2rem] right-2 text-gray-300 w-4 h-4"></i>
            </div>
            <div 
              v-if="activeDropdown === 'roomType'"
              class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-full max-h-60 overflow-y-auto"
            >
              <div 
                @click="selectRoomType('')"
                class="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer first:rounded-t-lg"
                :class="{ 'bg-green-50 text-green-700': filters.roomType === '' }"
              >
                All Types
              </div>
              <div 
                v-for="type in uniqueRoomTypes" 
                :key="type"
                @click="selectRoomType(type)"
                class="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                :class="{ 'bg-green-50 text-green-700': filters.roomType === type }"
              >
                {{ type }}
              </div>
            </div>
          </div>

          <!-- Housekeeping Status Filter -->
          <div class="relative">
            <div 
              @click="toggleDropdown('housekeepingStatus')"
              class="flex items-center bg-gray-50 outline outline-1 outline-gray-200 rounded-full px-3 py-2 pr-8 text-xs text-gray-700 transition-colors cursor-pointer hover:bg-gray-100"
            >
              {{ housekeepingStatusFilterLabel }}
              <i class="pi pi-chevron-down absolute pt-[0.2rem] right-2 text-gray-300 w-4 h-4"></i>
            </div>
            <div 
              v-if="activeDropdown === 'housekeepingStatus'"
              class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-full"
            >
              <div 
                @click="selectHousekeepingStatus('')"
                class="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer first:rounded-t-lg"
                :class="{ 'bg-green-50 text-green-700': filters.housekeepingStatus === '' }"
              >
                All Statuses
              </div>
              <div 
                v-for="status in housekeepingStatusOptions" 
                :key="status.value"
                @click="selectHousekeepingStatus(status.value)"
                class="px-3 py-2 text-xs font-medium cursor-pointer transition-colors"
                :class="[getHousekeepingStatusColor(status.value), { 'ring-2 ring-green-400': filters.housekeepingStatus === status.value }]"
              >
                {{ status.label }}
              </div>
            </div>
          </div>

          <!-- Priority Filter -->
          <div class="relative">
            <div 
              @click="toggleDropdown('priority')"
              class="flex items-center bg-gray-50 outline outline-1 outline-gray-200 rounded-full px-3 py-2 pr-8 text-xs text-gray-700 transition-colors cursor-pointer hover:bg-gray-100"
            >
              {{ priorityFilterLabel }}
              <i class="pi pi-chevron-down absolute pt-[0.2rem] right-2 text-gray-300 w-4 h-4"></i>
            </div>
            <div 
              v-if="activeDropdown === 'priority'"
              class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-full"
            >
              <div 
                @click="selectPriority('')"
                class="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer first:rounded-t-lg"
                :class="{ 'bg-green-50 text-green-700': filters.priority === '' }"
              >
                All Priorities
              </div>
              <div 
                v-for="priority in priorityOptions" 
                :key="priority.value"
                @click="selectPriority(priority.value)"
                class="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                :class="{ 'bg-green-50 text-green-700': filters.priority === priority.value }"
              >
                <span class="w-2 h-2 rounded-full" :class="getPriorityColor(priority.value)"></span>
                {{ priority.label }}
              </div>
            </div>
          </div>

          <!-- Floor Filter -->
          <div class="relative">
            <div 
              @click="toggleDropdown('floor')"
              class="flex items-center bg-gray-50 outline outline-1 outline-gray-200 rounded-full px-3 py-2 pr-8 text-xs text-gray-700 transition-colors cursor-pointer hover:bg-gray-100"
            >
              {{ floorFilterLabel }}
              <i class="pi pi-chevron-down absolute pt-[0.2rem] right-2 text-gray-300 w-4 h-4"></i>
            </div>
            <div 
              v-if="activeDropdown === 'floor'"
              class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-full max-h-60 overflow-y-auto"
            >
              <div 
                @click="selectFloor('')"
                class="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer first:rounded-t-lg"
                :class="{ 'bg-green-50 text-green-700': filters.floor === '' }"
              >
                All Floors
              </div>
              <div 
                v-for="floor in uniqueFloors" 
                :key="floor"
                @click="selectFloor(floor.toString())"
                class="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"
                :class="{ 'bg-green-50 text-green-700': filters.floor === floor.toString() }"
              >
                Floor {{ floor }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto rounded shadow border border-gray-200 mb-4">
      <table class="min-w-full bg-white border border-separate border-spacing-0">
        <thead class="bg-gray-100">
          <tr>
            <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Room</th>
            <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Room Type</th>
            <th class="py-2 px-4 text-xs font-semibold text-center text-gray-600">Housekeeping Status</th>
            <th class="py-2 px-4 text-xs font-semibold text-center text-gray-600">Priority</th>
            <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Floor</th>
            <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Reservation Status</th>
            <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Comments/Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="roomData in filteredRooms" :key="roomData.roomNumber">
            <td class="py-2 px-4 text-xs text-gray-700 outline outline-1 outline-gray-50">
              {{ roomData.roomNumber }}
            </td>
            <td class="py-2 px-4 text-xs text-gray-700 outline outline-1 outline-gray-50">
              {{ roomData.roomType }}
            </td>
            <td class="py-2 px-4 text-xs outline outline-1 outline-gray-50">
              <div class="flex justify-center">
                <div class="relative">
                  <div 
                    @click="toggleHousekeepingStatusDropdown(roomData.roomNumber)"
                    class="px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer inline-flex items-center justify-between gap-2 transition-all hover:shadow-sm min-w-[120px]"
                    :class="getHousekeepingStatusColor(roomData.housekeepingStatus)"
                  >
                    <span>{{ formatHousekeepingStatus(roomData.housekeepingStatus) }}</span>
                    <i class="pi pi-chevron-down text-xs"></i>
                  </div>
                  <div 
                    v-if="editingHousekeepingStatus === roomData.roomNumber"
                    class="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-full whitespace-nowrap"
                  >
                    <div 
                      v-for="status in housekeepingStatusOptions" 
                      :key="status.value"
                      @click.stop="updateHousekeepingStatus(roomData.roomNumber, status.value)"
                      class="px-3 py-2 text-xs font-medium cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                      :class="getHousekeepingStatusColor(status.value)"
                    >
                      {{ status.label }}
                    </div>
                  </div>
                </div>
              </div>
            </td>
            <td class="flex justify-center py-2 px-4 text-xs outline outline-1 outline-gray-50">
              <div class="relative">
                <div 
                  @click="togglePriorityDropdown(roomData.roomNumber)"
                  class="px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer inline-flex items-center justify-between gap-2 transition-all hover:shadow-sm min-w-[120px] bg-white"
                >
                  <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full border-2 flex items-center justify-center" :class="getPriorityRadioColor(roomData.priority)">
                      <span v-if="roomData.priority" class="w-1.5 h-1.5 rounded-full" :class="getPriorityRadioFill(roomData.priority)"></span>
                    </span>
                    <span class="text-gray-800">{{ formatPriority(roomData.priority) }}</span>
                  </div>
                  <i class="pi pi-chevron-down text-xs text-gray-500"></i>
                </div>
                <div 
                  v-if="editingPriority === roomData.roomNumber"
                  class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-full overflow-hidden"
                >
                  <div 
                    v-for="(priority, index) in priorityOptions" 
                    :key="priority.value"
                    @click.stop="updatePriority(roomData.roomNumber, priority.value)"
                    class="px-3 py-2 text-xs font-medium cursor-pointer flex items-center justify-between border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                    :class="{ 'bg-gray-50': roomData.priority === priority.value }"
                  >
                    <div class="flex items-center gap-2">
                      <span class="w-3 h-3 rounded-full border-2 flex items-center justify-center" :class="getPriorityRadioColor(priority.value)">
                        <span class="w-1.5 h-1.5 rounded-full" :class="getPriorityRadioFill(priority.value)"></span>
                      </span>
                      <span class="text-gray-800">{{ priority.label }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </td>
            <td class="py-2 px-4 text-xs text-gray-700 outline outline-1 outline-gray-50">
              {{ roomData.floor }}
            </td>
            <td class="py-2 px-4 text-xs outline outline-1 outline-gray-50">
              <span 
                class="px-2 py-1 rounded-full border text-xs capitalize"
                :class="getReservationStatusColor(roomData.reservationStatus)"
              >
                {{ formatReservationStatus(roomData.reservationStatus) }}
              </span>
            </td>
            <td class="py-2 px-4 text-xs text-gray-700 outline outline-1 outline-gray-50">
              <div class="w-full px-2 py-1 text-xs text-gray-600 min-h-[2rem]">
                {{ roomData.commentsNotes || '—' }}
              </div>
            </td>
          </tr>
          <tr v-if="filteredRooms.length === 0">
            <td class="py-4 px-4 text-center text-xs text-gray-400" colspan="7">No rooms found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import Searchbar from '@/components/Searchbar.vue'
import { useHotelDataStore } from '@/stores/hotelData'
import { useEntitySearch, getRoomSearchText } from '@/composables/useUnifiedSearch'
import type { Room, Reservation } from '@/types/hotel'

// Store setup
const hotelDataStore = useHotelDataStore()
const { rooms, reservations } = storeToRefs(hotelDataStore)

// Search
const { filteredItems: searchedRooms, search: handleSearch } = useEntitySearch<Room>(
  rooms,
  (room) => getRoomSearchText(room),
  { debounceMs: 300, minQueryLength: 1 }
)

// Filters
const activeDropdown = ref<string | null>(null)
const editingHousekeepingStatus = ref<string | null>(null)
const editingPriority = ref<string | null>(null)

const filters = ref({
  room: '',
  roomType: '',
  housekeepingStatus: '',
  priority: '',
  floor: ''
})

// Housekeeping status options
const housekeepingStatusOptions = [
  { label: 'Clean', value: 'clean' },
  { label: 'Dirty', value: 'dirty' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Out of Order', value: 'out_of_order' }
]

// Priority options
const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' }
]

// Room data with housekeeping info
const roomHousekeepingData = ref<Record<string, {
  housekeepingStatus: string
  priority: string
}>>({})

// Initialize room housekeeping data
const initializeRoomData = () => {
  rooms.value.forEach(room => {
    const roomNum = room.number || room.roomNumber || room.id
    if (!roomHousekeepingData.value[roomNum]) {
      roomHousekeepingData.value[roomNum] = {
        housekeepingStatus: 'clean',
        priority: 'medium'
      }
    }
  })
}

// Get comments/notes from reservation
const getCommentsNotesForRoom = (roomNumber: string): string => {
  const roomReservations = reservations.value.filter(res => {
    const resRoom = (res.roomNumber || res.room || '').toString()
    return resRoom === roomNumber.toString()
  })
  
  if (roomReservations.length === 0) {
    return ''
  }
  
  // Get current or upcoming reservation
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]
  
  // Find current reservation
  const currentReservation = roomReservations.find(res => {
    const checkIn = res.checkIn || res.checkInDate
    const checkOut = res.checkOut || res.checkOutDate
    const checkInStr = typeof checkIn === 'string' ? checkIn.split('T')[0] : checkIn?.toISOString().split('T')[0] || ''
    const checkOutStr = typeof checkOut === 'string' ? checkOut.split('T')[0] : checkOut?.toISOString().split('T')[0] || ''
    
    return checkInStr <= todayStr && checkOutStr >= todayStr
  })
  
  // Find upcoming reservation (check-in today or in the future)
  const upcomingReservation = roomReservations.find(res => {
    const checkIn = res.checkIn || res.checkInDate
    const checkInStr = typeof checkIn === 'string' ? checkIn.split('T')[0] : checkIn?.toISOString().split('T')[0] || ''
    return checkInStr >= todayStr
  })
  
  const reservation = currentReservation || upcomingReservation || roomReservations[0]
  
  // Get notes from guest object or special request
  const guestNotes = (reservation as any).guestObj?.notes || ''
  const specialRequest = reservation.specialRequest || ''
  const reservationNotes = reservation.notes || ''
  
  // Combine all notes, prioritizing guest notes
  const allNotes = [guestNotes, specialRequest, reservationNotes]
    .filter(note => note && note.trim())
    .join(' • ')
  
  return allNotes
}

// Get reservation status for a room
const getReservationStatusForRoom = (roomNumber: string): string => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]
  
  const roomReservations = reservations.value.filter(res => {
    const resRoom = (res.roomNumber || res.room || '').toString()
    return resRoom === roomNumber.toString()
  })
  
  if (roomReservations.length === 0) {
    return 'vacant'
  }
  
  // Check for current reservation
  const currentReservation = roomReservations.find(res => {
    const checkIn = res.checkIn || res.checkInDate
    const checkOut = res.checkOut || res.checkOutDate
    const checkInStr = typeof checkIn === 'string' ? checkIn.split('T')[0] : checkIn?.toISOString().split('T')[0] || ''
    const checkOutStr = typeof checkOut === 'string' ? checkOut.split('T')[0] : checkOut?.toISOString().split('T')[0] || ''
    
    return checkInStr <= todayStr && checkOutStr > todayStr && 
           (res.status === 'confirmed' || res.status === 'checkedIn')
  })
  
  if (currentReservation) {
    const checkOut = currentReservation.checkOut || currentReservation.checkOutDate
    const checkOutStr = typeof checkOut === 'string' ? checkOut.split('T')[0] : checkOut?.toISOString().split('T')[0] || ''
    
    if (checkOutStr === todayStr) {
      return 'due_out'
    }
    return 'confirmed'
  }
  
  // Check for upcoming reservation
  const upcomingReservation = roomReservations.find(res => {
    const checkIn = res.checkIn || res.checkInDate
    const checkInStr = typeof checkIn === 'string' ? checkIn.split('T')[0] : checkIn?.toISOString().split('T')[0] || ''
    
    return checkInStr === todayStr && res.status === 'confirmed'
  })
  
  if (upcomingReservation) {
    return 'due_in'
  }
  
  return 'vacant'
}

// Combined room data
const roomDataList = computed(() => {
  return searchedRooms.value.map(room => {
    const roomNum = room.number || room.roomNumber || room.id
    const housekeepingData = roomHousekeepingData.value[roomNum] || {
      housekeepingStatus: 'clean',
      priority: 'medium'
    }
    
    return {
      roomNumber: roomNum,
      roomType: room.type || room.roomType || 'Standard',
      floor: room.floorNumber || 0,
      reservationStatus: getReservationStatusForRoom(roomNum),
      housekeepingStatus: housekeepingData.housekeepingStatus,
      priority: housekeepingData.priority,
      commentsNotes: getCommentsNotesForRoom(roomNum)
    }
  })
})

// Filter options
const uniqueRooms = computed(() => {
  const roomNumbers = new Set(roomDataList.value.map(r => r.roomNumber))
  return Array.from(roomNumbers).sort((a, b) => {
    const aNum = parseInt(a) || 0
    const bNum = parseInt(b) || 0
    return aNum - bNum
  })
})

const uniqueRoomTypes = computed(() => {
  const types = new Set(roomDataList.value.map(r => r.roomType))
  return Array.from(types).sort()
})

const uniqueFloors = computed(() => {
  const floors = new Set(roomDataList.value.map(r => r.floor))
  return Array.from(floors).sort((a, b) => a - b)
})

// Filtered rooms
const filteredRooms = computed(() => {
  let result = roomDataList.value
  
  if (filters.value.room) {
    result = result.filter(r => r.roomNumber === filters.value.room)
  }
  
  if (filters.value.roomType) {
    result = result.filter(r => r.roomType === filters.value.roomType)
  }
  
  if (filters.value.housekeepingStatus) {
    result = result.filter(r => r.housekeepingStatus === filters.value.housekeepingStatus)
  }
  
  if (filters.value.priority) {
    result = result.filter(r => r.priority === filters.value.priority)
  }
  
  if (filters.value.floor) {
    result = result.filter(r => r.floor.toString() === filters.value.floor)
  }
  
  return result
})

// Filter labels
const roomFilterLabel = computed(() => {
  return filters.value.room || 'Room'
})

const roomTypeFilterLabel = computed(() => {
  return filters.value.roomType || 'Room Type'
})

const housekeepingStatusFilterLabel = computed(() => {
  const option = housekeepingStatusOptions.find(o => o.value === filters.value.housekeepingStatus)
  return option ? option.label : 'Housekeeping Status'
})

const priorityFilterLabel = computed(() => {
  const option = priorityOptions.find(o => o.value === filters.value.priority)
  return option ? option.label : 'Priority'
})

const floorFilterLabel = computed(() => {
  return filters.value.floor ? `Floor ${filters.value.floor}` : 'Floor'
})

const hasActiveFilters = computed(() => {
  return !!(filters.value.room || filters.value.roomType || filters.value.housekeepingStatus || 
            filters.value.priority || filters.value.floor)
})

// Dropdown handlers
function toggleDropdown(name: string) {
  activeDropdown.value = activeDropdown.value === name ? null : name
}

function selectRoom(value: string) {
  filters.value.room = value
  activeDropdown.value = null
}

function selectRoomType(value: string) {
  filters.value.roomType = value
  activeDropdown.value = null
}

function selectHousekeepingStatus(value: string) {
  filters.value.housekeepingStatus = value
  activeDropdown.value = null
}

function selectPriority(value: string) {
  filters.value.priority = value
  activeDropdown.value = null
}

function selectFloor(value: string) {
  filters.value.floor = value
  activeDropdown.value = null
}

function clearAllFilters() {
  filters.value = {
    room: '',
    roomType: '',
    housekeepingStatus: '',
    priority: '',
    floor: ''
  }
}

// Housekeeping status dropdown
function toggleHousekeepingStatusDropdown(roomNumber: string) {
  editingHousekeepingStatus.value = editingHousekeepingStatus.value === roomNumber ? null : roomNumber
  editingPriority.value = null
}

function updateHousekeepingStatus(roomNumber: string, status: string) {
  if (!roomHousekeepingData.value[roomNumber]) {
    roomHousekeepingData.value[roomNumber] = {
      housekeepingStatus: status,
      priority: 'medium'
    }
  } else {
    roomHousekeepingData.value[roomNumber].housekeepingStatus = status
  }
  editingHousekeepingStatus.value = null
  // TODO: Save to backend
}

// Priority dropdown
function togglePriorityDropdown(roomNumber: string) {
  editingPriority.value = editingPriority.value === roomNumber ? null : roomNumber
  editingHousekeepingStatus.value = null
}

function updatePriority(roomNumber: string, priority: string) {
  if (!roomHousekeepingData.value[roomNumber]) {
    roomHousekeepingData.value[roomNumber] = {
      housekeepingStatus: 'clean',
      priority: priority
    }
  } else {
    roomHousekeepingData.value[roomNumber].priority = priority
  }
  editingPriority.value = null
  // TODO: Save to backend
}

// Color helpers - matching the image styling with light blue for "Cleaning"
function getHousekeepingStatusColor(status: string): string {
  const colors: Record<string, string> = {
    clean: 'bg-green-100 border-green-300 text-green-800',
    dirty: 'bg-red-100 border-red-300 text-red-800',
    in_progress: 'bg-blue-100 border-blue-300 text-blue-800', // Light blue for "Cleaning"
    maintenance: 'bg-orange-100 border-orange-300 text-orange-800',
    out_of_order: 'bg-gray-100 border-gray-300 text-gray-800'
  }
  return colors[status] || 'bg-gray-100 border-gray-300 text-gray-800'
}

function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: 'bg-blue-500',
    medium: 'bg-yellow-500',
    high: 'bg-teal-500',
    urgent: 'bg-red-500'
  }
  return colors[priority] || 'bg-gray-500'
}

function getPriorityRadioColor(priority: string): string {
  const colors: Record<string, string> = {
    low: 'border-gray-400',
    medium: 'border-yellow-400',
    high: 'border-teal-500',
    urgent: 'border-red-500'
  }
  return colors[priority] || 'border-gray-400'
}

function getPriorityRadioFill(priority: string): string {
  const colors: Record<string, string> = {
    low: 'bg-gray-500',
    medium: 'bg-yellow-500',
    high: 'bg-teal-500',
    urgent: 'bg-red-500'
  }
  return colors[priority] || 'bg-gray-500'
}

function getReservationStatusColor(status: string): string {
  const colors: Record<string, string> = {
    vacant: 'bg-gray-100 border-gray-300 text-gray-700',
    confirmed: 'bg-blue-100 border-blue-300 text-blue-700',
    due_in: 'bg-yellow-100 border-yellow-300 text-yellow-700',
    due_out: 'bg-red-100 border-red-300 text-red-700'
  }
  return colors[status] || 'bg-gray-100 border-gray-300 text-gray-700'
}

// Format helpers
function formatHousekeepingStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function formatPriority(priority: string): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}

function formatReservationStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// Click outside handler
onMounted(() => {
  if (!rooms.value.length) {
    hotelDataStore.fetchRooms()
  }
  if (!reservations.value.length) {
    hotelDataStore.fetchReservations()
  }
  
  initializeRoomData()
  
  window.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.relative')) {
      activeDropdown.value = null
      editingHousekeepingStatus.value = null
      editingPriority.value = null
    }
  })
})
</script>
