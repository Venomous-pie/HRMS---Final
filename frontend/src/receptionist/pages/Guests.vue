<template>
  <div class="px-4">
    <div class="mb-4">
      <h2 class="font-bold text-gray-700">Guest Management</h2>

    </div>

    <div class="overflow-x-auto rounded shadow border border-gray-200 mt-4">
      <table class="min-w-full bg-white border border-separate border-spacing-0">
      <thead class="bg-gray-100">
        <tr>
          <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Name</th>
          <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Email</th>
          <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Phone</th>
          <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Address</th>
          <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">ID Document</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td colspan="5" class="py-4 px-4 text-center text-xs text-gray-400">Loading guests...</td>
        </tr>
        <tr v-else-if="error">
          <td colspan="5" class="py-4 px-4 text-center text-xs text-red-500">{{ error }}</td>
        </tr>
        <tr v-else-if="guests.length === 0">
          <td colspan="5" class="py-4 px-4 text-center text-xs text-gray-400">No guests found.</td>
        </tr>
        <tr v-for="guest in guests" :key="guest.id">
          <td class="py-2 px-4 text-xs text-gray-700 outline outline-1 outline-gray-50">
            {{ guest.firstName }}
            <span v-if="guest.middleName">{{ guest.middleName }}</span>
            {{ guest.lastName }}
          </td>
          <td class="py-2 px-4 text-xs text-gray-700 outline outline-1 outline-gray-50">{{ guest.email }}</td>
          <td class="py-2 px-4 text-xs text-gray-700 outline outline-1 outline-gray-50">{{ guest.phone }}</td>
          <td class="py-2 px-4 text-xs text-gray-700 outline outline-1 outline-gray-50">{{ guest.address }}</td>
          <td class="py-2 px-4 text-xs text-gray-700 outline outline-1 outline-gray-50">{{ guest.idDocument }}</td>
        </tr>
      </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useGuestStore } from '@/stores/guest'

const guestStore = useGuestStore()
const { guests, loading, error } = storeToRefs(guestStore)

onMounted(() => {
  guestStore.fetchGuests()
})
</script>
