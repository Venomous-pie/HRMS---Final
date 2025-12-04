<template>
  <AdminLayout page-title="Room Management">
    <!-- Page Controls -->
    <div class="px-6 py-2">
      <div class="flex items-center justify-between">
        <Searchbar
          placeholder="Search rooms..."
          icon="pi pi-search"
          :outline="false"
          @search="handleRoomSearch"
          width="20rem"
        />
        <div class="flex items-center gap-4">
          <!-- Room Type Filter -->
          <div class="relative room-type-dropdown">
            <div
              @click="showRoomTypeDropdown = !showRoomTypeDropdown"
              class="flex items-center bg-gray-50 outline outline-1 outline-gray-200 rounded-full px-3 py-2 pr-8 text-xs text-gray-700 transition-colors cursor-pointer hover:bg-gray-100"
            >
              {{ selectedRoomType || 'All Room Types' }}
              <i class="pi pi-chevron-down absolute right-2 text-gray-300 w-4 h-4"></i>
            </div>
            <div
              v-if="showRoomTypeDropdown"
              class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-full"
            >
              <div
                v-for="type in roomTypes"
                :key="type"
                @click="selectedRoomType = type; showRoomTypeDropdown = false; filterRooms();"
                class="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer first:rounded-t-lg last:rounded-b-lg whitespace-nowrap"
                :class="{ 'bg-green-50 text-green-700': selectedRoomType === type }"
              >
                {{ type }}
              </div>
            </div>
          </div>
          <Custombutton 
            label="Add Room" 
            bg-color="bg-green-600"
            hover-bg-color="hover:bg-green-700"
            text-color="text-white"
            :hover="true"
            @click="showAddRoomModal = true"
          />
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="px-6 py-2 overflow-y-auto h-full">
      <!-- Room Statistics -->
      <div class="mb-8">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Room Overview</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div class="text-center">
            <div class="flex items-center justify-center gap-2 mb-2">
              <i class="pi pi-home text-blue-600 text-lg"></i>
              <span class="text-sm text-gray-600">Total Rooms</span>
            </div>
            <div class="text-2xl font-bold text-gray-900">{{ totalRooms }}</div>
          </div>
          <div class="text-center">
            <div class="flex items-center justify-center gap-2 mb-2">
              <i class="pi pi-check-circle text-green-600 text-lg"></i>
              <span class="text-sm text-gray-600">Available</span>
            </div>
            <div class="text-2xl font-bold text-green-600">{{ availableRooms }}</div>
          </div>
          <div class="text-center">
            <div class="flex items-center justify-center gap-2 mb-2">
              <i class="pi pi-users text-orange-600 text-lg"></i>
              <span class="text-sm text-gray-600">Occupied</span>
            </div>
            <div class="text-2xl font-bold text-orange-600">{{ occupiedRooms }}</div>
          </div>
          <div class="text-center">
            <div class="flex items-center justify-center gap-2 mb-2">
              <i class="pi pi-wrench text-red-600 text-lg"></i>
              <span class="text-sm text-gray-600">Maintenance</span>
            </div>
            <div class="text-2xl font-bold text-red-600">{{ maintenanceRooms }}</div>
          </div>
        </div>
      </div>

      <!-- Room Grid -->
      <div class="border-t border-gray-200 pt-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Room Inventory</h3>
            <p class="text-sm text-gray-600">Manage individual rooms and their status</p>
          </div>
          <div class="flex items-center gap-2">
            <button class="px-3 py-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 transition-colors">
              <i class="pi pi-refresh mr-1"></i>
              Refresh
            </button>
          </div>
        </div>
        
        <!-- Loading State -->
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div v-for="n in 8" :key="n" class="border border-gray-200 p-4 animate-pulse">
            <div class="h-4 bg-gray-200 rounded mb-2"></div>
            <div class="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
          <div class="flex items-center gap-3">
            <i class="pi pi-exclamation-triangle text-red-600 text-xl"></i>
            <div>
              <h3 class="text-red-800 font-semibold">Failed to load rooms</h3>
              <p class="text-red-600 text-sm">{{ error }}</p>
              <button 
                @click="fetchRooms" 
                class="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
        
        <!-- Rooms Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div 
            v-for="room in filteredRooms" 
            :key="room.id"
            class="border border-gray-200 p-4 hover:border-gray-400 transition-colors cursor-pointer"
            :class="getRoomStatusClass(room.status)"
            @click="selectRoom(room)"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="font-semibold text-gray-900">Room {{ room.number }}</div>
              <div class="flex items-center gap-1">
                <div 
                  class="w-3 h-3 rounded-full"
                  :class="getStatusDotClass(room.status)"
                ></div>
                <span class="text-xs text-gray-600 capitalize">{{ room.status }}</span>
              </div>
            </div>
            <div class="space-y-2">
              <div class="text-sm text-gray-600">
                <i class="pi pi-tag mr-1"></i>
                {{ room.type }}
              </div>
              <div class="text-sm text-gray-600">
                <i class="pi pi-users mr-1"></i>
                {{ room.capacity }} guests
              </div>
              <div class="text-sm font-medium text-gray-900">
                ₱{{ room.rate.toLocaleString() }}/night
              </div>
            </div>
            <div class="mt-3 pt-3 border-t border-gray-100">
              <div class="flex items-center justify-between">
                <button 
                  class="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  @click.stop="editRoom(room)"
                >
                  Edit
                </button>
                <button 
                  class="text-xs text-purple-600 hover:text-purple-800 font-medium"
                  @click.stop="changeRoomStatus(room)"
                >
                  Change Status
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AdminLayout from './AdminLayout.vue'
import Searchbar from '@/components/Searchbar.vue'
import Custombutton from '@/components/Custombutton.vue'

interface Room {
  id: number
  number: string
  type: string
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning'
  capacity: number
  rate: number
  floor: number
  amenities: string[]
  notes?: string
}

const showRoomTypeDropdown = ref(false)
const selectedRoomType = ref('')
const showAddRoomModal = ref(false)
const searchQuery = ref('')

const roomTypes = ['All Room Types', 'Standard Single', 'Standard Double', 'Deluxe Double', 'Executive Suite', 'Family Suite', 'Presidential Suite']

const rooms = ref<Room[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const totalRooms = computed(() => rooms.value.length)
const availableRooms = computed(() => rooms.value.filter(r => r.status === 'available').length)
const occupiedRooms = computed(() => rooms.value.filter(r => r.status === 'occupied').length)
const maintenanceRooms = computed(() => rooms.value.filter(r => r.status === 'maintenance').length)

const filteredRooms = computed(() => {
  let filtered = rooms.value
  
  if (selectedRoomType.value && selectedRoomType.value !== 'All Room Types') {
    filtered = filtered.filter(room => room.type === selectedRoomType.value)
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(room => 
      room.number.toLowerCase().includes(query) ||
      room.type.toLowerCase().includes(query)
    )
  }
  
  return filtered
})

const handleRoomSearch = (query: string) => {
  searchQuery.value = query
}

const filterRooms = () => {
  // Filtering is handled by computed property
}

const getRoomStatusClass = (status: string) => {
  const classes = {
    available: 'border-green-200 bg-green-50',
    occupied: 'border-orange-200 bg-orange-50',
    maintenance: 'border-red-200 bg-red-50',
    cleaning: 'border-blue-200 bg-blue-50'
  }
  return classes[status as keyof typeof classes] || 'border-gray-200 bg-gray-50'
}

const getStatusDotClass = (status: string) => {
  const classes = {
    available: 'bg-green-500',
    occupied: 'bg-orange-500',
    maintenance: 'bg-red-500',
    cleaning: 'bg-blue-500'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-500'
}

const selectRoom = (room: Room) => {
  console.log('Selected room:', room)
}

const editRoom = (room: Room) => {
  console.log('Edit room:', room)
}

const changeRoomStatus = (room: Room) => {
  console.log('Change status for room:', room)
}

// Fetch rooms from API
const fetchRooms = async () => {
  loading.value = true
  error.value = null
  
  try {
    const token = localStorage.getItem('auth_token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    
    const response = await fetch('http://localhost:3000/api/admin/rooms/data', {
      cache: 'no-cache',
      headers
    })
    
    if (response.ok) {
      const roomsData = await response.json()
      rooms.value = roomsData
      console.log('✅ Rooms data loaded:', roomsData)
    } else {
      throw new Error(`Failed to fetch rooms: ${response.statusText}`)
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load rooms data'
    console.error('Error fetching rooms:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchRooms()
})
</script>
