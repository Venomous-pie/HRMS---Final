<template>
  <div class="px-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Housekeeping</h1>
    </div>

    <div class="px-6 py-4">
      <div class="flex items-center justify-between">
        <Searchbar placeholder="Search by booking number or guest" icon="pi pi-search" @search="handleSearch"
          width="20rem" />
        <div class="flex items-center gap-4">
          <button @click="clearAllFilters"
            class="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 bg-gray-50 outline outline-1 outline-gray-200 rounded-full transition-colors hover:bg-gray-100 hover:text-gray-800"
            :class="{ 'opacity-50 cursor-not-allowed': !hasActiveFilters }" :disabled="!hasActiveFilters">
            <i class="pi pi-filter-slash w-3 h-3"></i>
            Clear Filters
          </button>

          <div class="relative">
            <div @click="toggleReservationDropdown"
              class="flex items-center bg-gray-50 outline outline-1 outline-gray-200 rounded-full px-3 py-2 pr-8 text-xs text-gray-700 transition-colors cursor-pointer hover:bg-gray-100">
              {{ selectedReservationFilter }}
              <i class="pi pi-chevron-down absolute pt-[0.2rem] right-2 text-gray-300 w-4 h-4"></i>
            </div>
            <div v-if="showReservationDropdown"
              class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-full">
              <div v-for="option in reservationStatusOptions" :key="option" @click="
                selectedReservationFilter = option;
              showReservationDropdown = false
                "
                class="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer first:rounded-t-lg last:rounded-b-lg"
                :class="{ 'bg-green-50 text-green-700': selectedReservationFilter === option }">
                {{ option }}
              </div>
            </div>
          </div>

          <div class="relative">
            <div @click="toggleRoomTypeDropdown"
              class="flex items-center bg-gray-50 outline outline-1 outline-gray-200 rounded-full px-3 py-2 pr-8 text-xs text-gray-700 transition-colors cursor-pointer hover:bg-gray-100">
              {{ selectedRoomTypeFilter }}
              <i class="pi pi-chevron-down absolute pt-[0.2rem] right-2 text-gray-300 w-4 h-4"></i>
            </div>
            <div v-if="showRoomTypeDropdown"
              class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-full">
              <div v-for="option in roomTypeOptions" :key="option" @click="
                selectedRoomTypeFilter = option;
              showRoomTypeDropdown = false
                "
                class="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer first:rounded-t-lg last:rounded-b-lg whitespace-nowrap"
                :class="{ 'bg-green-50 text-green-700': selectedRoomTypeFilter === option }">
                {{ option }}
              </div>
            </div>
          </div>

          <div class="relative">
            <div @click="toggleBookingDropdown"
              class="flex items-center bg-gray-50 outline outline-1 outline-gray-200 rounded-full px-3 py-2 pr-8 text-xs text-gray-700 transition-colors cursor-pointer hover:bg-gray-100">
              {{ selectedBookingFilter }}
              <i class="pi pi-chevron-down absolute pt-[0.2rem] right-2 text-gray-300 w-4 h-4"></i>
            </div>
            <div v-if="showBookingDropdown"
              class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-full">
              <div v-for="option in bookingSourceOptions" :key="option" @click="
                selectedBookingFilter = option;
              showBookingDropdown = false
                "
                class="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer first:rounded-t-lg last:rounded-b-lg whitespace-nowrap"
                :class="{ 'bg-green-50 text-green-700': selectedBookingFilter === option }">
                {{ option }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Searchbar from '@/components/Searchbar.vue'
</script>
