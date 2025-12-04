<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Reservations</h1>
      <p class="text-gray-600 mt-2">Manage hotel reservations and bookings</p>
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
          <tr v-for="reservation in reservations" :key="reservation.bookingNumber || reservation.id">
            <td class="py-2 px-4 text-xs text-gray-700">{{ reservation.bookingNumber || reservation.id }}</td>
            <td class="py-2 px-4 text-xs text-gray-700">{{ reservation.roomNumber || reservation.room }}</td>
            <td class="py-2 px-4 text-xs text-gray-700">{{ reservation.guestName || reservation.guest }}</td>
            <td class="py-2 px-4 text-xs text-gray-700">{{ reservation.checkIn || reservation.checkInDate }}</td>
            <td class="py-2 px-4 text-xs text-gray-700">{{ reservation.checkOut || reservation.checkOutDate }}</td>
            <td class="py-2 px-4 text-xs text-gray-700">
              <button class="px-2 py-1 text-xs text-green-600 border border-green-200 rounded hover:bg-green-50"
                @click="handleOrder(reservation)">Orders</button>
            </td>
            <td class="py-2 px-4 text-xs text-gray-700">₱{{ reservation.amount }}</td>
            <td class="py-2 px-4 text-xs text-gray-700">₱{{ reservation.balance }}</td>
            <td class="py-2 px-4 text-xs text-gray-700">{{ reservation.source }}</td>
            <td class="py-2 px-4 text-xs text-gray-700">{{ reservation.status }}</td>
          </tr>
          <tr v-if="!reservations || reservations.length === 0">
            <td class="py-4 px-4 text-center text-xs text-gray-400" colspan="10">No reservations found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useHotelDataStore } from '@/stores/hotelData'

const hotelDataStore = useHotelDataStore()
const { reservations, loading, error } = storeToRefs(hotelDataStore)

onMounted(async () => {
  if (!reservations.value.length) {
    await hotelDataStore.fetchReservations()
  }
})

function handleOrder(reservation: any) {
  // Placeholder for future ordering system
}
</script>
