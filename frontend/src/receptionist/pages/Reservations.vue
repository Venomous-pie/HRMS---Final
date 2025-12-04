<template>
  <div class="px-6">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="font-bold text-gray-700"> Reservations</h2>
      <div class="flex items-center gap-2">
        <Custombutton label="Add Reservation" :hover="true" @click="handleAddReservation" />
      </div>
    </div>

    <div class="flex items-center justify-between mb-4">
      <Searchbar placeholder="Search reservations..." icon="pi pi-search" :outline="false"
        @search="handleReservationSearch" width="20rem" />
    </div>

    <div class="overflow-x-auto rounded shadow border border-gray-200">
      <table class="min-w-full bg-white">
        <thead class="bg-gray-100">
          <tr>
            <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Booking</th>
            <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Room</th>
            <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Guest</th>
            <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Check-in</th>
            <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Check-out</th>
            <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Orders</th>
            <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Amount</th>
            <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Balance</th>
            <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Source</th>
            <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="reservation in filteredReservations" :key="reservation.bookingNumber || reservation.id">
            <td class="py-2 px-4 text-xs text-gray-700">{{ reservation.bookingNumber || reservation.id }}</td>
            <td class="py-2 px-4 text-xs text-gray-700">{{ reservation.roomNumber || reservation.room }}</td>
            <td class="py-2 px-4 text-xs text-gray-700">{{ reservation.guestName || reservation.guest }}</td>
            <td class="py-2 px-4 text-xs text-gray-700">{{ reservation.checkIn || reservation.checkInDate }}</td>
            <td class="py-2 px-4 text-xs text-gray-700">{{ reservation.checkOut || reservation.checkOutDate }}</td>
            <td class="py-2 px-4 text-xs text-gray-700">
              <div class="px-2 py-1 text-xs text-gray-600">0</div>
            </td>
            <td class="py-2 px-4 text-xs text-gray-700">₱{{ reservation.amount }}</td>
            <td class="py-2 px-4 text-xs text-gray-700">₱{{ reservation.balance }}</td>
            <td class="py-2 px-4 text-xs text-gray-700">{{ reservation.source }}</td>
            <td class="py-2 px-4 text-xs">
              <span
                :class="getReservationStatusColor(reservation) + ' px-2 py-1 rounded-full border text-xs capitalize'">
                {{ reservation.status }}
              </span>
            </td>
          </tr>
          <tr v-if="!reservations || reservations.length === 0">
            <td class="py-4 px-4 text-center text-xs text-gray-400" colspan="10">No reservations found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
    <AddReservationModal
      :is-open="showAddReservationModal"
      :prefilled-data="prefilledReservationData"
      :mode="currentMode"
      @close="handleModalClose"
      @success="handleReservationSuccess"
      @backToDetails="handleBackToDetailsFromEdit"
    />
</template>

<script setup lang="ts">

import AddReservationModal from '@/receptionist/components/frontdesk/AddReservationModal.vue'

import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useHotelDataStore } from '@/stores/hotelData'
import Searchbar from '@/components/Searchbar.vue'
import Custombutton from '@/components/Custombutton.vue'

const hotelDataStore = useHotelDataStore()
import { ref, computed } from 'vue'
const { reservations, loading, error } = storeToRefs(hotelDataStore)

const searchQuery = ref('')

function handleReservationSearch(query: string) {
  searchQuery.value = query
}

const filteredReservations = computed(() => {
  if (!searchQuery.value) return reservations.value
  const q = searchQuery.value.toLowerCase()
  return reservations.value.filter(r =>
    (r.bookingNumber && r.bookingNumber.toLowerCase().includes(q)) ||
    (r.id && String(r.id).toLowerCase().includes(q)) ||
    (r.roomNumber && r.roomNumber.toLowerCase().includes(q)) ||
    (r.room && r.room.toLowerCase().includes(q)) ||
    (r.guestName && r.guestName.toLowerCase().includes(q)) ||
    (r.guest && r.guest.toLowerCase().includes(q))
  )
})

import { getReservationStatusColor } from '@/utils/colors'


onMounted(async () => {
  if (!reservations.value.length) {
    await hotelDataStore.fetchReservations()
  }
})

// Modal state for Add Reservation
const showAddReservationModal = ref(false)
const currentMode = ref<'new' | 'edit'>('new')
const prefilledReservationData = ref<any>(null)

function handleAddReservation() {
  prefilledReservationData.value = null
  currentMode.value = 'new'
  showAddReservationModal.value = true
}

function handleModalClose() {
  showAddReservationModal.value = false
  prefilledReservationData.value = null
}

function handleReservationSuccess(payload: { reservation: any; roomNumber: string }) {
  // Optionally, refresh reservations or show a notification
  showAddReservationModal.value = false
}

function handleBackToDetailsFromEdit(reservation: any) {
  showAddReservationModal.value = false
  // Optionally, reopen details modal if you have one
}

function handleOrder(reservation: any) {
  // Placeholder for future ordering system
}
</script>

