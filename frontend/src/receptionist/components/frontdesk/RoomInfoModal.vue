<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50"
    @click="handleBackdropClick"
  >
    <div
      class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-200"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <i class="pi pi-home text-blue-600 text-lg"></i>
          </div>
          <div>
            <h2 class="text-md font-semibold text-gray-900">Room {{ room?.number }}</h2>
            <p class="text-xs text-gray-500">{{ room?.type || room?.roomType }}</p>
          </div>
        </div>
        <button
          @click="closeModal"
          class="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
        >
          <i class="pi pi-times text-lg"></i>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-6">
        <!-- Room Details -->
        <div>
          <h3 class="text-xs font-medium text-gray-900 mb-4 flex items-center gap-2">
            <i class="pi pi-info-circle text-blue-600"></i>
            Room Details
          </h3>
          <div class="bg-gray-50 rounded-lg p-4 space-y-3">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Room Number</label>
                <p class="text-xs font-medium text-gray-900">{{ room?.number }}</p>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Room Type</label>
                <p class="text-xs font-medium text-gray-900">{{ room?.type || room?.roomType }}</p>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Floor</label>
                <p class="text-xs font-medium text-gray-900">{{ room?.floorNumber || room?.floor }}</p>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <span
                  class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                  :class="getStatusBadgeClass(room?.status)"
                >
                  {{ formatStatus(room?.status) }}
                </span>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Max Capacity</label>
                <p class="text-xs font-medium text-gray-900">{{ room?.maxCapacity }} guests</p>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Price per Night</label>
                <p class="text-xs font-medium text-gray-900">₱{{ room?.pricePerNight?.toLocaleString() }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Amenities -->
        <div v-if="room?.amenities?.length">
          <h3 class="text-xs font-medium text-gray-900 mb-4 flex items-center gap-2">
            <i class="pi pi-star text-yellow-500"></i>
            Amenities
          </h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="amenity in room.amenities"
              :key="amenity"
              class="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium"
            >
              {{ amenity }}
            </span>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="room?.notes">
          <h3 class="text-xs font-medium text-gray-900 mb-4 flex items-center gap-2">
            <i class="pi pi-file-edit text-gray-600"></i>
            Notes
          </h3>
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p class="text-xs text-gray-700">{{ room.notes }}</p>
          </div>
        </div>

        <!-- Current Status -->
        <div>
          <h3 class="text-xs font-medium text-gray-900 mb-4 flex items-center gap-2">
            <i class="pi pi-calendar text-green-600"></i>
            Current Status
          </h3>
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-600">Availability Today</span>
              <span
                class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                :class="isAvailableToday ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
              >
                {{ isAvailableToday ? 'Available' : 'Occupied' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
        <Custombutton
          label="Close"
          bg-color="bg-gray-100"
          hover-bg-color="hover:bg-gray-200"
          text-color="text-gray-700"
          :hover="true"
          @click="closeModal"
        />
        <Custombutton
          v-if="isAvailableToday"
          label="Create Reservation"
          :hover="true"
          @click="handleCreateReservation"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getTodayAsString } from '@/utils/date'
import Custombutton from '@/components/Custombutton.vue'

interface Props {
  isOpen: boolean
  room: any | null
  isRoomAvailable?: (roomNumber: string, date: string) => boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'createReservation', data: { roomNumber: string; checkInDate: string }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isAvailableToday = computed(() => {
  if (!props.room || !props.isRoomAvailable) return false
  return props.isRoomAvailable(props.room.number, getTodayAsString())
})

const getStatusBadgeClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'available':
      return 'bg-green-100 text-green-700'
    case 'occupied':
      return 'bg-red-100 text-red-700'
    case 'maintenance':
      return 'bg-yellow-100 text-yellow-700'
    case 'out-of-order':
      return 'bg-gray-100 text-gray-700'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

const formatStatus = (status: string) => {
  if (!status) return 'Unknown'
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/([A-Z])/g, ' $1')
}

const closeModal = () => {
  emit('close')
}

const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    closeModal()
  }
}

const handleCreateReservation = () => {
  if (props.room) {
    emit('createReservation', {
      roomNumber: props.room.number,
      checkInDate: getTodayAsString()
    })
    closeModal()
  }
}
</script>
