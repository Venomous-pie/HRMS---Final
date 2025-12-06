<template>
  <div class="flex items-center justify-between mb-4 px-2">
    <div class="flex items-center text-sm text-gray-600 font-medium select-none">
      <span
        @click="$emit('navigateDates', -1)"
        title="Previous 5 days"
        class="flex items-center justify-center w-8 h-8 cursor-pointer hover:bg-gray-100 rounded"
      >
        <i class="pi pi-chevron-left text-gray-600 w-3 h-3"></i>
      </span>
      <div class="text-center px-4 w-52">
        <div class="text-sm font-medium">
          {{ dateRange[0]?.dayName }} {{ dateRange[0]?.dayNumber }} - {{ dateRange[15]?.dayName }}
          {{ dateRange[15]?.dayNumber }}
        </div>
      </div>
      <span
        @click="$emit('navigateDates', 1)"
        title="Next 5 days"
        class="flex items-center justify-center w-8 h-8 cursor-pointer hover:bg-gray-100 rounded"
      >
        <i class="pi pi-chevron-right text-gray-600 w-3 h-3"></i>
      </span>

      <button
        @click="$emit('jumpToToday')"
        title="Jump to today"
        class="ml-3 px-3 py-1 text-xs bg-gray-50 text-gray-600 border border-gray-200 rounded-full hover:bg-gray-100 hover:border-gray-300 transition-colors cursor-pointer"
      >
        <i class="pi pi-calendar text-gray-600 w-3 h-3"></i>
        Today
      </button>
    </div>

    <div class="flex items-center gap-4 text-xs">
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded bg-yellow-300 border border-yellow-400"></div>
        <span class="text-gray-600">New</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded bg-blue-100 border border-blue-300"></div>
        <span class="text-gray-600">Confirmed</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded bg-green-100 border border-green-300"></div>
        <span class="text-gray-600">Booked</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded bg-green-600 border border-green-700"></div>
        <span class="text-gray-600">Checked In</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded bg-red-600 border border-red-700"></div>
        <span class="text-gray-600">Due Out</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded bg-orange-400 border border-orange-500"></div>
        <span class="text-gray-600">Checked Out</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded bg-amber-700 border border-amber-800"></div>
        <span class="text-gray-600">Out of Order</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  dateRange: Array<{
    date: string
    dayName: string
    dayNumber: string
  }>
}

interface Emits {
  (e: 'navigateDates', direction: number): void
  (e: 'jumpToToday'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>
